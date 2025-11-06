import { model } from '../config/ai';
import { GenerateRecipeRequest, RecipeResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AIService {
  async generateRecipe(request: GenerateRecipeRequest): Promise<RecipeResponse> {
    const { ingredients, dietary_restrictions, cuisine_type } = request;

    const prompt = this.buildPrompt(ingredients, dietary_restrictions, cuisine_type);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseRecipeResponse(text);
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw new Error('Failed to generate recipe');
    }
  }

  async modifyRecipe(existingRecipe: any, instruction: string): Promise<RecipeResponse> {
    // Build a prompt that includes the existing recipe JSON and the user's instruction
    const prompt = `You are a professional chef and recipe editor. Given the following recipe JSON:\n${JSON.stringify(
      existingRecipe,
      null,
      2
    )}\n\nModify the recipe according to the user's instruction: "${instruction}". Return ONLY valid JSON in the same format as this recipe (title, ingredients array, instructions array, prep_time, difficulty, optional cuisine_type and dietary_restrictions if applicable). Do not include any explanation or surrounding text.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseRecipeResponse(text);
    } catch (error) {
      console.error('Error modifying recipe:', error);
      throw new Error('Failed to modify recipe');
    }
  }

  async streamGenerateRecipe(
    request: GenerateRecipeRequest,
    onChunk: (chunk: string) => void
  ): Promise<RecipeResponse> {
    const { ingredients, dietary_restrictions, cuisine_type } = request;

    const prompt = this.buildPrompt(ingredients, dietary_restrictions, cuisine_type);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;

      // Try to stream the body if available
      const body: any = (response as any).body;
      let accumulated = '';

      if (body && typeof body.on === 'function') {
        // Node.js Readable stream
        body.on('data', (chunk: Buffer) => {
          const text = chunk.toString('utf-8');
          accumulated += text;
          onChunk(text);
        });

        await new Promise<void>((resolve, reject) => {
          body.on('end', () => resolve());
          body.on('error', (err: any) => reject(err));
        });
      } else if ((response as any).body && typeof (response as any).body.getReader === 'function') {
        // Web ReadableStream
        const reader = (response as any).body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          // eslint-disable-next-line no-await-in-loop
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          accumulated += text;
          onChunk(text);
        }
      } else {
        // Fallback to full text
        const text = await response.text();
        accumulated = text;
        onChunk(text);
      }

      // After streaming completes, parse the accumulated text
      return this.parseRecipeResponse(accumulated);
    } catch (error) {
      console.error('Error streaming recipe generation:', error);
      throw new Error('Failed to stream generate recipe');
    }
  }

  private buildPrompt(
    ingredients: string[],
    dietaryRestrictions?: string[],
    cuisineType?: string
  ): string {
    let prompt = `You are a professional chef. Generate a detailed recipe using the following ingredients: ${ingredients.join(', ')}.`;

    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      prompt += ` The recipe must be ${dietaryRestrictions.join(' and ')}.`;
    }

    if (cuisineType) {
      prompt += ` The recipe should be ${cuisineType} cuisine.`;
    }

    prompt += `\n\nPlease provide the recipe in the following JSON format (respond ONLY with valid JSON, no additional text):
{
  "title": "Recipe name",
  "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
  "instructions": ["step 1", "step 2", "step 3"],
  "prep_time": "time in minutes (e.g., '30 minutes')",
  "difficulty": "Easy, Medium, or Hard"
}`;

    return prompt;
  }

  private parseRecipeResponse(text: string): RecipeResponse {
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanedText);

      return {
        recipe_id: uuidv4(),
        title: parsed.title,
        ingredients: parsed.ingredients,
        instructions: parsed.instructions,
        prep_time: parsed.prep_time,
        difficulty: parsed.difficulty,
      };
    } catch (error) {
      console.error('Error parsing recipe response:', error);
      console.error('Raw response:', text);
      throw new Error('Failed to parse recipe response');
    }
  }
}
