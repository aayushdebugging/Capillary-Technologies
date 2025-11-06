import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Use the correct model name — and the newer API automatically handles the v1 endpoint
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const AIService = {
  async generateRecipe(prompt: string) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating recipe:", error);
      throw new Error("Failed to generate recipe");
    }
  },
};
