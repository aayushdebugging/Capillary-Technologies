import { useState, useEffect } from 'react';
import { recipeApi } from '../api/recipeApi';
import type { Recipe } from '../types.ts';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeModal } from '../components/RecipeModal';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const MyRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await recipeApi.getAllRecipes(currentPage, 12);
      setRecipes(data.recipes);
      setFilteredRecipes(data.recipes);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [currentPage]);

  useEffect(() => {
    let filtered = [...recipes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Difficulty filter
    if (filterDifficulty) {
      filtered = filtered.filter(
        (recipe) => recipe.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
      );
    }

    // Cuisine filter
    if (filterCuisine) {
      filtered = filtered.filter((recipe) => recipe.cuisine_type === filterCuisine);
    }

    setFilteredRecipes(filtered);
  }, [searchTerm, filterDifficulty, filterCuisine, recipes]);

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      await recipeApi.deleteRecipe(id);
      setRecipes(recipes.filter((recipe) => recipe.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete recipe');
    }
  };

  const handleRateRecipe = async (id: string, rating: number) => {
    try {
      const updatedRecipe = await recipeApi.rateRecipe(id, rating);
      setRecipes(recipes.map((recipe) => (recipe.id === id ? updatedRecipe : recipe)));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to rate recipe');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterDifficulty('');
    setFilterCuisine('');
  };

  const cuisineTypes = [...new Set(recipes.map((r) => r.cuisine_type).filter(Boolean))] as string[];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">My Saved Recipes</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or ingredient..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cuisine</label>
              <select
                value={filterCuisine}
                onChange={(e) => setFilterCuisine(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Cuisines</option>
                {cuisineTypes.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchTerm || filterDifficulty || filterCuisine) && (
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your recipes..." />
        ) : filteredRecipes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              {recipes.length === 0
                ? 'No saved recipes yet. Start generating some delicious recipes!'
                : 'No recipes match your filters.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onView={handleViewRecipe}
                  onDelete={handleDeleteRecipe}
                  onRate={handleRateRecipe}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <RecipeModal
        recipe={selectedRecipe}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpdate={(updated) => {
          setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setSelectedRecipe(updated);
        }}
      />
    </div>
  );
};
