import { GoogleGenAI, Chat, Part } from "@google/genai";
import { ANALYSIS_PROMPT, ANALYSIS_SCHEMA } from "../constants";
import type { Analysis, InputType } from "../types";

/**
 * Converts a File object to a GoogleGenAI.Part object.
 * @param file The file to convert.
 * @returns A promise that resolves to a Part object.
 */
async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // The result is a data URL: "data:<mime-type>;base64,<data>"
        // We only need the base64 data part.
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as data URL."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  const data = await base64EncodedDataPromise;
  
  return {
    inlineData: {
      data,
      mimeType: file.type,
    },
  };
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Starts an analysis session by sending the media and prompt to the Gemini API.
 * It returns the structured analysis and a new chat session for follow-ups.
 * @param inputType The type of input ('audio', 'video', or 'youtube').
 * @param inputData The file data or YouTube URL.
 * @param settings An object containing the language and fps for the analysis.
 * @param talkContext Optional string containing user-provided context about the talk.
 * @returns A promise that resolves to an object containing the analysis and chat session.
 */
export const startAnalysisSession = async (
  inputType: InputType,
  inputData: string | File,
  settings: { language: string, fps: number },
  talkContext: string,
): Promise<{ analysis: Analysis; chat: Chat }> => {
  let mediaPart: Part;
  let loggableMediaInfo: object;

  if (inputType === 'youtube') {
    if (typeof inputData !== 'string' || !inputData) {
      throw new Error('A valid YouTube URL must be provided.');
    }
    mediaPart = {
      fileData: {
        fileUri: inputData,
      },
      videoMetadata: {
        fps: settings.fps,
      },
    };
    loggableMediaInfo = {
      type: 'youtube',
      uri: inputData,
      fps: settings.fps,
    };
  } else {
    if (!(inputData instanceof File)) {
      throw new Error('A valid file must be provided for video/audio analysis.');
    }
    mediaPart = await fileToGenerativePart(inputData);
    if (inputType === 'video') {
      mediaPart.videoMetadata = {
        fps: settings.fps,
      };
    }
    loggableMediaInfo = {
        type: 'file',
        name: inputData.name,
        size: inputData.size,
        mimeType: inputData.type,
        ...(inputType === 'video' && { fps: settings.fps }),
    };
  }

  const contextPromptSection = talkContext.trim()
      ? `The speaker has provided the following context for their talk:
---
${talkContext.trim()}
---
Please tailor your feedback based on this context. For example, if the audience is beginners, judge the clarity and use of examples accordingly. If the goal is to inspire, evaluate the emotional impact.`
      : 'No specific context was provided by the speaker. Provide general public speaking feedback.';

  let dynamicPrompt = ANALYSIS_PROMPT.replace('{language}', settings.language);
  dynamicPrompt = dynamicPrompt.replace('{talkContext}', contextPromptSection);
  
  // Per documentation, the media part must come before the text prompt for optimal results.
  const orderedParts = [mediaPart, { text: dynamicPrompt }];

  const modelConfig = {
    responseMimeType: 'application/json',
    responseSchema: ANALYSIS_SCHEMA,
  };

  const modelName = 'gemini-2.5-pro';
  
  console.log("Sending request to Gemini model with the following parameters:", {
    model: modelName,
    media: loggableMediaInfo,
    promptLength: dynamicPrompt.length,
    config: modelConfig,
    language: settings.language,
  });

  const result = await ai.models.generateContent({
    model: modelName,
    contents: { parts: orderedParts },
    config: modelConfig,
  });

  let analysis: Analysis;
  try {
    const rawText = result.text;
    analysis = JSON.parse(rawText);
  } catch (e) {
    console.error("Failed to parse analysis JSON:", result.text);
    throw new Error("The model returned an invalid analysis format. Please try again.");
  }
  
  if (!result.candidates?.[0]?.content) {
      throw new Error("Invalid response from the model, no content found.");
  }
  const modelContent = result.candidates[0].content;

  // Create a new chat session, seeding it with the history of the initial analysis.
  // Add a system instruction to guide the model's behavior in the chat.
  const chat = ai.chats.create({
    model: modelName,
    history: [{ role: 'user', parts: orderedParts }, modelContent],
    config: {
        systemInstruction: `You have just provided a detailed analysis of a public speaking performance in JSON format. The user can see this analysis. Now, you must switch to a conversational coaching role. Answer the user's follow-up questions in a natural, helpful, and conversational manner, using the language: ${settings.language}. Do NOT output JSON again unless the user explicitly asks for it.`
    }
  });

  return { analysis, chat };
};