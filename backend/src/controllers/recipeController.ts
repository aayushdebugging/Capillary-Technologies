import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService';
import { RecipeService } from '../services/recipeService';
import { getIO } from '../utils/socket';
import { diffRecipes } from '../utils/diff';
import {
  generateRecipeSchema,
  rateRecipeSchema,
  paginationSchema,
} from '../utils/validation';
import { AppError } from '../middleware/errorHandler';

const aiService = new AIService();
const recipeService = new RecipeService();

export class RecipeController {
  async generateRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = generateRecipeSchema.parse(req.body);

      const recipe = await aiService.generateRecipe(validatedData);

      res.status(200).json({
        status: 'success',
        data: recipe,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateRecipeStream(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = generateRecipeSchema.parse(req.body);

      // Set headers for chunked transfer
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('X-Accel-Buffering', 'no');
      // Ensure headers are sent
      res.flushHeaders?.();

      // Stream chunks as they come from the AI service
      const parsed = await aiService.streamGenerateRecipe(validatedData, (chunk: string) => {
        // Write chunk directly to the response so client can consume it
        try {
          res.write(chunk);
        } catch (e) {
          // Ignore write errors caused by client disconnect
        }
      });

  // Do NOT persist automatically. Return the parsed recipe JSON so the client
  // can show a preview and let the user decide when to save.
  const finalMarker = `\n[FINAL_JSON]${JSON.stringify(parsed)}`;
  res.write(finalMarker);
  res.end();
    } catch (error) {
      next(error);
    }
  }

  async getAllRecipes(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedParams = paginationSchema.parse(req.query);

      const { recipes, total } = await recipeService.getAllRecipes(validatedParams);

      const { page = 1, limit = 10 } = validatedParams;
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        status: 'success',
        data: {
          recipes,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecipeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const recipe = await recipeService.getRecipeById(id);

      if (!recipe) {
        throw new AppError('Recipe not found', 404);
      }

      res.status(200).json({
        status: 'success',
        data: recipe,
      });
    } catch (error) {
      next(error);
    }
  }

  async saveRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const recipeData = req.body;

      const savedRecipe = await recipeService.saveRecipe(recipeData);

      res.status(201).json({
        status: 'success',
        data: savedRecipe,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const recipe = await recipeService.getRecipeById(id);
      if (!recipe) {
        throw new AppError('Recipe not found', 404);
      }

      await recipeService.deleteRecipe(id);

      res.status(200).json({
        status: 'success',
        message: 'Recipe deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async rateRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = rateRecipeSchema.parse(req.body);

      const recipe = await recipeService.getRecipeById(id);
      if (!recipe) {
        throw new AppError('Recipe not found', 404);
      }

      const updatedRecipe = await recipeService.rateRecipe(id, validatedData);

      res.status(200).json({
        status: 'success',
        data: updatedRecipe,
      });
    } catch (error) {
      next(error);
    }
  }

  async chatModifyRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!message) {
        throw new AppError('Message is required', 400);
      }

      const recipe = await recipeService.getRecipeById(id);
      if (!recipe) {
        throw new AppError('Recipe not found', 404);
      }

      // Use AI to produce a modified recipe JSON based on the instruction
      const modified = await aiService.modifyRecipe(recipe, message);

      // Compute human-readable diff/summary between the original and modified
      const { summary, details } = diffRecipes(recipe as any, modified as any);

      // Do NOT persist here. Return the modified recipe and a summary so the client can preview
      // and ask the user to explicitly save.
      res.status(200).json({
        status: 'success',
        data: {
          modified,
          summary,
          details,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = await recipeService.getRecipeById(id);
      if (!existing) {
        throw new AppError('Recipe not found', 404);
      }

      const updated = await recipeService.updateRecipe(id, updates as any);

      // Emit real-time update via Socket.IO (room per recipe)
      const io = getIO();
      if (io) {
        io.to(`recipe_${id}`).emit('recipe_updated', updated);
      }

      res.status(200).json({ status: 'success', data: updated });
    } catch (error) {
      next(error);
    }
  }
}
