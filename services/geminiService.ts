
import { GoogleGenAI, Type } from "@google/genai";
import { GameIdea } from "../types";

export const generateGameIdea = async (): Promise<GameIdea> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Create a fun, quick recreation game idea for a group. Provide a title, short description, and 3 simple rules.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          rules: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "description", "rules"]
      }
    }
  });

  return JSON.parse(response.text);
};
