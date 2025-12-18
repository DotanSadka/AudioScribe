import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Transcribes audio or video file using Gemini 2.5 Flash.
 * @param file The audio or video file to transcribe.
 * @returns The transcribed text.
 */
export const transcribeFile = async (file: File): Promise<string> => {
  try {
    // Convert file to Base64
    const base64Data = await fileToGenerativePart(file);

    // Using Gemini 2.5 Flash as it is excellent for multimodal tasks and faster/cheaper.
    const modelId = "gemini-2.5-flash";

    const prompt = `
      You are a professional transcriptionist. 
      Transcribe the audio from the provided file into clear, grammatically correct text.
      
      STRICT REQUIREMENTS:
      1. Punctuation: Ensure precise punctuation (commas, periods, question marks) to reflect the natural flow of speech.
      2. Spacing: Pay careful attention to spacing between words and sentences.
      3. Structure: Use paragraph breaks to separate distinct thoughts or changes in speakers.
      4. Accuracy: Transcribe exactly what is said, but remove filler words (um, ah, like) if they disrupt readability, unless they are essential for context.
      5. Output: Return ONLY the raw transcription text. Do not add any introductory or concluding remarks like "Here is the transcription".
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
    });

    if (!response.text) {
      throw new Error("No transcription text returned from the model.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Transcription error:", error);
    throw new Error(error.message || "Failed to transcribe the file.");
  }
};

/**
 * Refines or manipulates existing text based on user instructions.
 * @param text The original text to process.
 * @param instruction The user's instruction (e.g., "summarize", "fix spelling").
 * @returns The processed text.
 */
export const refineText = async (text: string, instruction: string): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash";
    const prompt = `
      You are a helpful text editor assistant.
      
      ORIGINAL TEXT:
      ${text}
      
      INSTRUCTION:
      ${instruction}
      
      Please strictly follow the instruction to modify, summarize, translate, or correct the original text.
      Return ONLY the resulting text. Do not include conversational filler like "Here is the summary".
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }],
      },
    });

    if (!response.text) {
      throw new Error("No text returned from the model.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Refine error:", error);
    throw new Error(error.message || "Failed to refine the text.");
  }
};

/**
 * Helper to convert a File object to a Base64 string compatible with Gemini.
 */
async function fileToGenerativePart(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:audio/mp3;base64,")
      const base64Content = base64String.split(",")[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
