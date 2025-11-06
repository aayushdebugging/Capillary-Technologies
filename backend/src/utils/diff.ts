import { Recipe } from '../types';

export function diffRecipes(oldR: Recipe, newR: Recipe): { summary: string; details: any } {
  const changes: string[] = [];
  const details: any = {};

  if (oldR.title !== newR.title) {
    changes.push(`Title changed from "${oldR.title}" to "${newR.title}".`);
    details.title = { from: oldR.title, to: newR.title };
  }

  if (oldR.prep_time !== newR.prep_time) {
    changes.push(`Prep time changed from "${oldR.prep_time}" to "${newR.prep_time}".`);
    details.prep_time = { from: oldR.prep_time, to: newR.prep_time };
  }

  if (oldR.difficulty !== newR.difficulty) {
    changes.push(`Difficulty changed from "${oldR.difficulty}" to "${newR.difficulty}".`);
    details.difficulty = { from: oldR.difficulty, to: newR.difficulty };
  }

  if (oldR.cuisine_type !== newR.cuisine_type) {
    changes.push(`Cuisine changed from "${oldR.cuisine_type || 'unspecified'}" to "${newR.cuisine_type || 'unspecified'}".`);
    details.cuisine_type = { from: oldR.cuisine_type, to: newR.cuisine_type };
  }

  // Ingredients diff
  const oldIngredients = oldR.ingredients || [];
  const newIngredients = newR.ingredients || [];
  const addedIngredients = newIngredients.filter((i) => !oldIngredients.includes(i));
  const removedIngredients = oldIngredients.filter((i) => !newIngredients.includes(i));
  if (addedIngredients.length) {
    changes.push(`Added ingredients: ${addedIngredients.join(', ')}.`);
    details.addedIngredients = addedIngredients;
  }
  if (removedIngredients.length) {
    changes.push(`Removed ingredients: ${removedIngredients.join(', ')}.`);
    details.removedIngredients = removedIngredients;
  }

  // Instructions diff - simple heuristic: list items present in new but not in old and vice versa
  const oldInst = oldR.instructions || [];
  const newInst = newR.instructions || [];
  const addedInst = newInst.filter((s) => !oldInst.includes(s));
  const removedInst = oldInst.filter((s) => !newInst.includes(s));
  if (addedInst.length) {
    changes.push(`Added instructions: ${addedInst.join(' | ')}.`);
    details.addedInstructions = addedInst;
  }
  if (removedInst.length) {
    changes.push(`Removed instructions: ${removedInst.join(' | ')}.`);
    details.removedInstructions = removedInst;
  }

  // Dietary restrictions
  const oldDiet = oldR.dietary_restrictions || [];
  const newDiet = newR.dietary_restrictions || [];
  const addedDiet = newDiet.filter((d) => !oldDiet.includes(d));
  const removedDiet = oldDiet.filter((d) => !newDiet.includes(d));
  if (addedDiet.length) {
    changes.push(`Added dietary restrictions: ${addedDiet.join(', ')}.`);
    details.addedDietary = addedDiet;
  }
  if (removedDiet.length) {
    changes.push(`Removed dietary restrictions: ${removedDiet.join(', ')}.`);
    details.removedDietary = removedDiet;
  }

  const summary = changes.length ? changes.join(' ') : 'No significant changes detected.';

  return { summary, details };
}
