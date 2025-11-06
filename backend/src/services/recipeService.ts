import { supabase } from '../config/database';
import { Recipe, PaginationParams, RateRecipeRequest } from '../types';

export class RecipeService {
  async saveRecipe(recipe: Recipe): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .insert([
        {
          recipe_id: recipe.recipe_id,
          title: recipe.title,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time: recipe.prep_time,
          difficulty: recipe.difficulty,
          cuisine_type: recipe.cuisine_type,
          dietary_restrictions: recipe.dietary_restrictions,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving recipe:', error);
      throw new Error('Failed to save recipe');
    }

    return data as Recipe;
  }

  async getAllRecipes(params: PaginationParams): Promise<{ recipes: Recipe[]; total: number }> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    // Get total count
    let count: number | null = 0;
    try {
      const countResult = await supabase.from('recipes').select('*', { count: 'exact', head: true });
      count = (countResult as any).count ?? 0;
    } catch (err: any) {
      console.error('Error getting recipe count:');
      console.error('  message:', err?.message || err);
      if (err?.stack) console.error(err.stack);
      console.error('Diagnostic info:');
      console.error('  SUPABASE_URL present?', !!process.env.SUPABASE_URL);
      console.error('  NODE version:', process.version);
      console.error('  global fetch available?', typeof (globalThis as any).fetch === 'function');
      throw new Error('Failed to get recipes');
    }

    // Get paginated recipes
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error getting recipes:', error);
      throw new Error('Failed to get recipes');
    }

    return {
      recipes: data as Recipe[],
      total: count || 0,
    };
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error getting recipe:', error);
      throw new Error('Failed to get recipe');
    }

    return data as Recipe;
  }

  async deleteRecipe(id: string): Promise<boolean> {
    const { error } = await supabase.from('recipes').delete().eq('id', id);

    if (error) {
      console.error('Error deleting recipe:', error);
      throw new Error('Failed to delete recipe');
    }

    return true;
  }

  async rateRecipe(id: string, ratingData: RateRecipeRequest): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update({ rating: ratingData.rating })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error rating recipe:', error);
      throw new Error('Failed to rate recipe');
    }

    return data as Recipe;
  }

  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recipe:', error);
      throw new Error('Failed to update recipe');
    }

    return data as Recipe;
  }
}
