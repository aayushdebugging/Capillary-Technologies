import type { Recipe } from '../types';
import { ChatEditor } from './ChatEditor';

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (recipe: Recipe) => void;
  onUpdate?: (recipe: Recipe) => void;
}

export const RecipeModal = ({ recipe, isOpen, onClose, onSave, onUpdate }: RecipeModalProps) => {
  if (!isOpen || !recipe) return null;

  const handleSave = () => {
    if (onSave) {
      onSave(recipe);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{recipe.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {recipe.difficulty}
              </span>
              <span className="text-gray-600">
                <span className="font-semibold">Prep Time:</span> {recipe.prep_time}
              </span>
            </div>

            {recipe.cuisine_type && (
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Cuisine:</span> {recipe.cuisine_type}
              </p>
            )}

            {recipe.dietary_restrictions && recipe.dietary_restrictions.length > 0 && (
              <p className="text-gray-600">
                <span className="font-semibold">Dietary:</span> {recipe.dietary_restrictions.join(', ')}
              </p>
            )}
          </div>

          {/* Chat editor for live modification */}
          <div className="p-6 pt-0">
            <ChatEditor
              recipe={recipe}
              onUpdated={(updated) => {
                // Inform parent about the updated recipe
                if (onUpdate) onUpdate(updated);
              }}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Ingredients</h3>
            <ul className="list-disc list-inside space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Instructions</h3>
            <ol className="list-decimal list-inside space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-700 pl-2">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex space-x-4">
            {onSave && !recipe.id && (
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold"
              >
                Save Recipe
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
