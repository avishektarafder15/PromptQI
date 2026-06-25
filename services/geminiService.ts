import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EnhancementResponse, ToneType } from "../types";

// Schema definition for structured JSON output
const enhancementSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    enhancedPrompt: {
      type: Type.STRING,
      description: "The rewritten, highly optimized version of the prompt. Use Markdown with **Bold Headers** (e.g., **Role:**) to define sections. Ensure sections are separated by newlines.",
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

**STRUCTURE & FORMATTING**:
1.  **Section Headers**: Use **Bold** syntax for key section headers (e.g., **Role:**, **Context:**, **Task:**).
2.  **Layout**: Ensure every header is on its own line, or followed immediately by its content on the same line.
3.  **Lists**: Use hyphens (-) for bullet points.
4.  **Tone**: Professional, precise, and directive.

**REQUIRED PROMPT SECTIONS (Adapt as needed)**:

**Role:** [The persona the AI should adopt]

**Context:** [Background information]

**Task:** [The specific instruction]

**Constraints:**
- [Constraint 1]
- [Constraint 2]

**Output Format:** [How the response should be presented]
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