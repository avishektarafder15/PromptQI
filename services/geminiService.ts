import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EnhancementResponse, ToneType } from "../types";

// Schema definition for structured JSON output
const enhancementSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    enhancedPrompt: {
      type: Type.STRING,
      description: "The rewritten, highly optimized version of the prompt. formatted with Markdown headers and bullet points.",
    },
    analysis: {
      type: Type.STRING,
      description: "A brief explanation of the original prompt's weaknesses and the strategy used to fix them.",
    },
    keyImprovements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of specific techniques applied (e.g., 'Added persona', 'Clarified output format').",
    },
    estimatedTokenCount: {
      type: Type.INTEGER,
      description: "An estimation of the token count of the new prompt.",
    },
  },
  required: ["enhancedPrompt", "analysis", "keyImprovements"],
};

const SYSTEM_INSTRUCTION = `
You are a Master Prompt Engineer and AI interaction specialist. 
Your goal is to take user inputs (often vague, short, or unstructured) and transform them into "World-Class" prompts optimized for Large Language Models (LLMs).

**MANDATORY STRUCTURE & FORMATTING**:
1.  **Organize by Section**: The 'enhancedPrompt' MUST be broken down into distinct sections separated by double newlines.
2.  **Bold Headers**: Use Markdown bold syntax (e.g., **Context:**) for section headers.
3.  **Paragraphs**: Ensure clear paragraph separation.
4.  **Tone**: Professional, precise, and directive (for the prompt structure itself).

**Required Structure**:
**Role:** [The persona the AI should adopt]

**Context:** [Background information and situation]

**Task:** [The specific core instruction]

**Constraints:** [Limitations, style guidelines, exclusions]

**Output Format:** [How the response should be presented]

Your output must be a JSON object containing the enhanced prompt (as a single string with newline characters), an analysis of what you changed, and a list of specific improvements.
`;

export const enhancePrompt = async (originalPrompt: string, temperature: number = 0.7, tone: ToneType = 'Professional'): Promise<EnhancementResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `Enhance this prompt: "${originalPrompt}"\n\nCRITICAL INSTRUCTION: The enhanced prompt must explicitly instruct the target LLM to adopt a "${tone}" tone.` }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: enhancementSchema,
        temperature: temperature,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini.");
    }

    const result = JSON.parse(text) as EnhancementResponse;
    return result;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw error;
  }
};
