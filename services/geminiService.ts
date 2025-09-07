import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { ImageFile, EditImageResult } from '../types';

const MODEL_NAME = 'gemini-2.5-flash-image-preview';
const TEXT_MODEL_NAME = 'gemini-2.5-flash';

// Utility to extract base64 data from a data URL
const getBase64DataAndMime = (dataUrl: string): { data: string; mimeType: string } => {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    // Fallback for simple base64 strings
    return { data: dataUrl, mimeType: 'image/png' }; // Assume png if mime not present
  }
  const meta = parts[0].split(':')[1].split(';')[0];
  const data = parts[1];
  return { mimeType: meta || 'image/png', data: data };
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: `You are a creative assistant for a photo editor. Take the user's prompt and make it more vivid, descriptive, and artistic. Keep it concise. Return only the enhanced prompt, nothing else. User prompt: "${prompt}"`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw new Error("Failed to enhance prompt.");
  }
};


export const editImageWithNanoBanana = async (
  imageFile: ImageFile,
  prompt: string,
  maskData: string | null
): Promise<EditImageResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const { data: base64ImageData, mimeType } = getBase64DataAndMime(imageFile.base64);

    const imagePart = {
      inlineData: { data: base64ImageData, mimeType: mimeType },
    };

    let parts;
    if (maskData) {
      const { data: maskBase64 } = getBase64DataAndMime(maskData);
      const maskPart = {
        inlineData: { data: maskBase64, mimeType: 'image/png' },
      };
      const instructionText = `You are a photo editing assistant. You will receive three parts: 1. An original image. 2. A mask image, where a white area indicates the region to be edited. 3. A text prompt describing the edit. Your task is to apply the text prompt's instructions *only* to the area of the original image indicated by the mask. The edit should be blended seamlessly and realistically with the rest of the image. Do not change any part of the image outside the masked area. Generate the fully edited image as output. Text prompt: "${prompt}"`;
      parts = [imagePart, maskPart, { text: instructionText }];
    } else {
      parts = [imagePart, { text: prompt }];
    }


    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const result: EditImageResult = {
      editedImage: null,
      text: null,
    };

    if (response.candidates && response.candidates.length > 0) {
      const responseParts = response.candidates[0].content.parts;
      for (const part of responseParts) {
        if (part.inlineData) {
          const resMimeType = part.inlineData.mimeType || 'image/png';
          result.editedImage = `data:${resMimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          result.text = part.text;
        }
      }
    }

    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to edit image with AI. Please check the console for more details.");
  }
};

export const upscaleImage = async (imageDataUrl: string): Promise<EditImageResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const { data: base64ImageData, mimeType } = getBase64DataAndMime(imageDataUrl);

    const imagePart = {
      inlineData: { data: base64ImageData, mimeType },
    };
    
    const prompt = "Please upscale this image. Increase the resolution and enhance the details and clarity. Do not change the content or style of the image.";
    
    const parts = [imagePart, { text: prompt }];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const result: EditImageResult = {
      editedImage: null,
      text: null,
    };
    
    if (response.candidates && response.candidates.length > 0) {
      const responsePart = response.candidates[0].content.parts.find(p => p.inlineData);
      if (responsePart && responsePart.inlineData) {
        const resMimeType = responsePart.inlineData.mimeType || 'image/png';
        result.editedImage = `data:${resMimeType};base64,${responsePart.inlineData.data}`;
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error upscaling image:", error);
    throw new Error("Failed to upscale image with AI.");
  }
};