import { Router } from 'express';
import { RecipeController } from '../controllers/recipeController';
import { generateRecipeLimiter } from '../middleware/rateLimiter';

const router = Router();
const recipeController = new RecipeController();

router.post('/generate', generateRecipeLimiter, (req, res, next) =>
  recipeController.generateRecipe(req, res, next)
);
router.post('/generate/stream', generateRecipeLimiter, (req, res, next) =>
  recipeController.generateRecipeStream(req, res, next)
);

router.get('/', (req, res, next) => recipeController.getAllRecipes(req, res, next));

router.get('/:id', (req, res, next) => recipeController.getRecipeById(req, res, next));

router.post('/:id/save', (req, res, next) => recipeController.saveRecipe(req, res, next));

router.delete('/:id', (req, res, next) => recipeController.deleteRecipe(req, res, next));

router.post('/:id/rate', (req, res, next) => recipeController.rateRecipe(req, res, next));

router.post('/:id/chat', (req, res, next) => recipeController.chatModifyRecipe(req, res, next));
router.put('/:id', (req, res, next) => recipeController.updateRecipe(req, res, next));

export default router;
