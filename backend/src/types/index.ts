export interface Recipe {
  id: string;
  recipe_id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  prep_time: string;
  difficulty: string;
  cuisine_type?: string;
  dietary_restrictions?: string[];
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GenerateRecipeRequest {
  ingredients: string[];
  dietary_restrictions?: string[];
  cuisine_type?: string;
}

export interface RateRecipeRequest {
  rating: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface RecipeResponse {
  recipe_id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  prep_time: string;
  difficulty: string;
}
