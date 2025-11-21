export interface EnhancementResponse {
  enhancedPrompt: string;
  analysis: string;
  keyImprovements: string[];
  estimatedTokenCount: number;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export interface HistoryItem {
  id: string;
  original: string;
  enhanced: string;
  timestamp: number;
}

export type ToneType = 'Professional' | 'Casual' | 'Polite' | 'Emojify';
