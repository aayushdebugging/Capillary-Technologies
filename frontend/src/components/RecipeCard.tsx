import type { Recipe } from '../types.ts';

interface RecipeCardProps {
  recipe: Recipe;
  onView?: (recipe: Recipe) => void;
  onDelete?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
}

export const RecipeCard = ({ recipe, onView, onDelete, onRate }: RecipeCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRating = (rating: number) => {
    if (onRate && recipe.id) {
      onRate(recipe.id, rating);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{recipe.title}</h3>

        <div className="flex items-center space-x-2 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
              recipe.difficulty
            )}`}
          >
            {recipe.difficulty}
          </span>
          <span className="text-sm text-gray-600">{recipe.prep_time}</span>
        </div>

        {recipe.cuisine_type && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">Cuisine:</span> {recipe.cuisine_type}
          </p>
        )}

        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">Ingredients:</p>
          <p className="text-sm text-gray-600">
            {recipe.ingredients.slice(0, 3).join(', ')}
            {recipe.ingredients.length > 3 && '...'}
          </p>
        </div>

        {recipe.rating && (
          <div className="flex items-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-5 h-5 ${
                  star <= recipe.rating! ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          {onView && (
            <button
              onClick={() => onView(recipe)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              View Recipe
            </button>
          )}

          {onDelete && recipe.id && (
            <button
              onClick={() => onDelete(recipe.id!)}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Delete
            </button>
          )}
        </div>

        {onRate && recipe.id && !recipe.rating && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Rate this recipe:</p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="focus:outline-none hover:scale-110 transition-transform"
                >
                  <svg className="w-6 h-6 text-gray-300 hover:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
