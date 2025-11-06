import { useEffect, useState, useRef } from 'react';
import { recipeApi } from '../api/recipeApi';
import type { Recipe } from '../types';
import { io, Socket } from 'socket.io-client';

interface ChatEditorProps {
  recipe: Recipe;
  onUpdated?: (recipe: Recipe) => void;
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export const ChatEditor = ({ recipe, onUpdated }: ChatEditorProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [modifiedRecipe, setModifiedRecipe] = useState<Recipe | null>(null);
  const [changeSummary, setChangeSummary] = useState<string | null>(null);
  const [changeDetails, setChangeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to socket server (strip /api if present)
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const socketUrl = base.replace(/\/api\/?$/, '');
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_recipe', recipe.id);
    });

    socket.on('recipe_updated', (updatedRecipe: Recipe) => {
      if (updatedRecipe.id === recipe.id) {
        if (onUpdated) onUpdated(updatedRecipe);
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: 'assistant', text: 'Recipe updated' },
        ]);
      }
    });

    return () => {
      socket.emit('leave_recipe', recipe.id);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe.id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: input.trim() };
    setMessages((m) => [...m, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const resp = await recipeApi.chatWithRecipe(recipe.id, userMessage.text);
      // resp is expected to be { modified, summary, details }
  const modified = resp.modified as Recipe;
  const summary = resp.summary as string;
  const details = resp.details;
  setModifiedRecipe(modified);
  setChangeSummary(summary || 'No changes detected.');
  setChangeDetails(details || null);

      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', text: summary || 'Updated recipe preview ready.' },
      ]);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', text: 'Failed to update recipe.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!modifiedRecipe) return;
    setLoading(true);
    try {
      const updated = await recipeApi.updateRecipe(recipe.id, modifiedRecipe as any);
      setModifiedRecipe(null);
      setChangeSummary(null);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', text: 'Changes saved.' },
      ]);
      if (onUpdated) onUpdated(updated);
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: 'assistant', text: 'Failed to save changes.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setModifiedRecipe(null);
    setChangeSummary(null);
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: 'assistant', text: 'Changes discarded.' },
    ]);
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="text-lg font-semibold mb-2">Chat to edit this recipe</h4>
      <div className="max-h-48 overflow-y-auto mb-3 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-50 self-end' : 'bg-gray-100'}`}
          >
            <p className="text-sm text-gray-800">{m.text}</p>
          </div>
        ))}
      </div>

      {/* Preview area & Save/Discard actions */}
      {modifiedRecipe && (
        <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
          <h5 className="font-semibold mb-2">Suggested changes</h5>
          {changeSummary && <p className="text-sm text-gray-700 mb-3">{changeSummary}</p>}

          <div className="mb-3">
            <h6 className="font-medium">Preview</h6>

            {/* If changeDetails available, render colored diff; otherwise show full preview */}
            {changeDetails ? (
              <div>
                {/* Title */}
                <div className="mt-2">
                  <h6 className="font-medium">Title</h6>
                  {changeDetails.title ? (
                    <p className="text-sm">
                      <span className="text-red-600 line-through mr-2">{changeDetails.title.from}</span>
                      <span className="text-green-600">{changeDetails.title.to}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-700">{modifiedRecipe.title}</p>
                  )}
                </div>

                {/* Prep / Difficulty / Cuisine */}
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h6 className="font-medium">Prep Time</h6>
                    {changeDetails.prep_time ? (
                      <p className="text-sm">
                        <span className="text-red-600 line-through mr-2">{changeDetails.prep_time.from}</span>
                        <span className="text-green-600">{changeDetails.prep_time.to}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-700">{modifiedRecipe.prep_time}</p>
                    )}
                  </div>

                  <div>
                    <h6 className="font-medium">Difficulty</h6>
                    {changeDetails.difficulty ? (
                      <p className="text-sm">
                        <span className="text-red-600 line-through mr-2">{changeDetails.difficulty.from}</span>
                        <span className="text-green-600">{changeDetails.difficulty.to}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-700">{modifiedRecipe.difficulty}</p>
                    )}
                  </div>

                  <div>
                    <h6 className="font-medium">Cuisine</h6>
                    {changeDetails.cuisine_type ? (
                      <p className="text-sm">
                        <span className="text-red-600 line-through mr-2">{changeDetails.cuisine_type.from || 'unspecified'}</span>
                        <span className="text-green-600">{changeDetails.cuisine_type.to || 'unspecified'}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-700">{modifiedRecipe.cuisine_type || '—'}</p>
                    )}
                  </div>
                </div>

                {/* Ingredients diff */}
                <div className="mt-3">
                  <h6 className="font-medium">Ingredients</h6>
                  <div className="flex gap-6">
                    <div>
                      {changeDetails.removedIngredients && changeDetails.removedIngredients.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600">Removed</p>
                          <ul className="list-disc list-inside text-sm text-red-600">
                            {changeDetails.removedIngredients.map((ing: string, idx: number) => (
                              <li key={idx}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      {changeDetails.addedIngredients && changeDetails.addedIngredients.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-600">Added</p>
                          <ul className="list-disc list-inside text-sm text-green-600">
                            {changeDetails.addedIngredients.map((ing: string, idx: number) => (
                              <li key={idx}>{ing}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instructions diff */}
                <div className="mt-3">
                  <h6 className="font-medium">Instructions</h6>
                  <div className="flex gap-6">
                    <div>
                      {changeDetails.removedInstructions && changeDetails.removedInstructions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600">Removed</p>
                          <ol className="list-decimal list-inside text-sm text-red-600">
                            {changeDetails.removedInstructions.map((inst: string, idx: number) => (
                              <li key={idx}>{inst}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>

                    <div>
                      {changeDetails.addedInstructions && changeDetails.addedInstructions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-green-600">Added</p>
                          <ol className="list-decimal list-inside text-sm text-green-600">
                            {changeDetails.addedInstructions.map((inst: string, idx: number) => (
                              <li key={idx}>{inst}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-700">Title: {modifiedRecipe.title}</p>
                <p className="text-sm text-gray-700">Prep Time: {modifiedRecipe.prep_time}</p>
                <p className="text-sm text-gray-700">Difficulty: {modifiedRecipe.difficulty}</p>
                {modifiedRecipe.cuisine_type && (
                  <p className="text-sm text-gray-700">Cuisine: {modifiedRecipe.cuisine_type}</p>
                )}
                <div className="mt-2">
                  <h6 className="font-medium">Ingredients</h6>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {modifiedRecipe.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-2">
                  <h6 className="font-medium">Instructions</h6>
                  <ol className="list-decimal list-inside text-sm text-gray-700">
                    {modifiedRecipe.instructions.map((inst, idx) => (
                      <li key={idx}>{inst}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save changes'}
            </button>
            <button
              onClick={handleDiscard}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-60"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me how to change the recipe (e.g., make it vegan, reduce salt, swap chicken to tofu)..."
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
        >
          {loading ? 'Updating...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatEditor;
