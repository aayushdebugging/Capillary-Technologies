import { useState } from 'react';
import { recipeApi } from '../api/recipeApi';
import type { Recipe } from '../types';

import { LoadingSpinner } from '../components/LoadingSpinner';
import { RecipeModal } from '../components/RecipeModal';

const CUISINE_TYPES = [
  'Italian',
  'Chinese',
  'Mexican',
  'Indian',
  'Japanese',
  'Thai',
  'French',
  'Greek',
  'Mediterranean',
  'American',
];

const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
];

export const Home = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [cuisineType, setCuisineType] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    if (dietaryRestrictions.includes(restriction)) {
      setDietaryRestrictions(dietaryRestrictions.filter((r) => r !== restriction));
    } else {
      setDietaryRestrictions([...dietaryRestrictions, restriction]);
    }
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      setStreamedText('');

      const savedRecipe = await recipeApi.generateRecipeStream(
        {
          ingredients,
          dietary_restrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
          cuisine_type: cuisineType || undefined,
        },
        (chunk: string) => {
          // Append streamed chunk to UI
          setStreamedText((s) => s + chunk);
        }
      );

      // The streaming API returns the final saved recipe object when complete
      setGeneratedRecipe(savedRecipe);
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Failed to generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      await recipeApi.saveRecipe(recipe);
      setSuccessMessage('Recipe saved successfully!');
      setShowModal(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save recipe. Please try again.');
    }
  };

  const handleReset = () => {
    setIngredients([]);
    setDietaryRestrictions([]);
    setCuisineType('');
    setError(null);
    setSuccessMessage(null);
    setGeneratedRecipe(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Generate Your Perfect Recipe</h2>
          <p className="text-gray-600 mb-6">
            Tell us what ingredients you have, and our AI will create a delicious recipe for you!
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          <div className="space-y-6">
            {/* Ingredients Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ingredients *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., chicken, tomatoes, garlic"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddIngredient}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>

              {ingredients.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ingredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {ingredient}
                      <button
                        onClick={() => handleRemoveIngredient(ingredient)}
                        className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dietary Restrictions (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {DIETARY_RESTRICTIONS.map((restriction) => (
                  <button
                    key={restriction}
                    onClick={() => toggleDietaryRestriction(restriction)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      dietaryRestrictions.includes(restriction)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {restriction}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cuisine Type (Optional)
              </label>
              <select
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Cuisine</option>
                {CUISINE_TYPES.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleGenerateRecipe}
                disabled={loading || ingredients.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
              >
                {loading ? 'Generating...' : 'Generate Recipe'}
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          {loading && <LoadingSpinner message="Creating your perfect recipe..." />}
          {loading && streamedText && (
            <div className="mt-4 bg-white rounded-lg shadow-sm p-4 max-h-56 overflow-y-auto">
              <h4 className="font-semibold mb-2">Live preview</h4>
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{streamedText}</pre>
            </div>
          )}
        </div>
      </div>

      <RecipeModal
        recipe={generatedRecipe}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveRecipe}
      />
    </div>
  );
};
