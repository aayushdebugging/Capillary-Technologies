import axios from 'axios';
import type { Recipe, GenerateRecipeRequest } from '../types.ts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const recipeApi = {
  generateRecipe: async (data: GenerateRecipeRequest) => {
    const response = await api.post('/recipes/generate', data);
    return response.data.data;
  },

  generateRecipeStream: async (
    data: GenerateRecipeRequest,
    onChunk: (chunk: string) => void
  ): Promise<any> => {
    const url = `${API_BASE_URL}/recipes/generate/stream`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      throw new Error(text || 'Failed to start stream');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      accumulated += chunk;
      // If the chunk contains the final marker, split and handle
      const finalIndex = accumulated.indexOf('[FINAL_JSON]');
      if (finalIndex !== -1) {
        const before = accumulated.substring(0, finalIndex);
        if (before) onChunk(before);
        const jsonPart = accumulated.substring(finalIndex + '[FINAL_JSON]'.length);
        try {
          const parsed = JSON.parse(jsonPart);
          return parsed;
        } catch (e) {
          throw new Error('Failed to parse final JSON from stream');
        }
      } else {
        onChunk(chunk);
      }
    }

    // If stream ended without final JSON, return accumulated text
    return accumulated;
  },

  getAllRecipes: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/recipes?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  getRecipeById: async (id: string) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data.data;
  },

  saveRecipe: async (recipe: Recipe) => {
    const response = await api.post(`/recipes/${recipe.recipe_id}/save`, recipe);
    return response.data.data;
  },

  deleteRecipe: async (id: string) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },

  rateRecipe: async (id: string, rating: number) => {
    const response = await api.post(`/recipes/${id}/rate`, { rating });
    return response.data.data;
  },

  chatWithRecipe: async (id: string, message: string) => {
    const response = await api.post(`/recipes/${id}/chat`, { message });
    return response.data.data;
  },

  updateRecipe: async (id: string, updates: Partial<any>) => {
    const response = await api.put(`/recipes/${id}`, updates);
    return response.data.data;
  },
};
