import type { Chat } from "@google/genai";

export type InputType = 'youtube' | 'video' | 'audio';

export interface Rating {
  score: number;
  justification: string;
}

export interface Analysis {
  overallSummary: string;
  pacing: Rating;
  clarity: Rating;
  engagement: Rating;
  useOfExamples: Rating;
  creativity: Rating;
  stagePresence: Rating;
  strengths: string[];
  areasForImprovement: string[];
  suggestedQuestions: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface Settings {
  language: string;
  customLanguage: string;
  fps: number;
}
