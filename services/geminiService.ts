import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, PROMPT_TEMPLATE } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URI prefix (e.g. "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeImage = async (imageFile: File): Promise<AnalysisResult> => {
  try {
    const base64Data = await fileToBase64(imageFile);
    
    // Using gemini-2.5-flash for speed and multimodal capabilities including search
    const modelId = 'gemini-2.5-flash'; 

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Data,
            },
          },
          {
            text: PROMPT_TEMPLATE,
          },
        ],
      },
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType and responseSchema are NOT allowed with googleSearch
      },
    });

    const text = response.text || "No analysis could be generated.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[];

    return {
      text,
      groundingChunks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateImageModification = async (imageFile: File, updates: string): Promise<string> => {
  try {
    const base64Data = await fileToBase64(imageFile);
    // Use gemini-2.5-flash-image for image editing/generation tasks
    const modelId = 'gemini-2.5-flash-image';

    const prompt = `Generate a realistic photo of a person wearing the outfit in the provided image, but modified with these specific updates: ${updates}. Maintain the original pose, lighting, and background style as much as possible. High quality, photorealistic.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate to find image part
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image was generated.");

  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};
