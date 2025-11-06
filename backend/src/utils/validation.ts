import { z } from 'zod';

export const generateRecipeSchema = z.object({
  ingredients: z.array(z.string()).min(1, 'At least one ingredient is required'),
  dietary_restrictions: z.array(z.string()).optional(),
  cuisine_type: z.string().optional(),
});

export const rateRecipeSchema = z.object({
  rating: z.number().min(1).max(5),
});

export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
});
