export type SupportedAIProvider =
  | 'gemini'
  | 'groq'
  | 'sambanova'
  | 'nvidia'
  | 'cohere'
  | 'openrouter';

export type SupportedGameTemplate =
  | 'catching-game'
  | 'maze-game'
  | 'maze-adventure'
  | 'space-shooter'
  | 'custom';

export interface GenerateGameInput {
  prompt: string;
  template: SupportedGameTemplate;
  language: 'id' | 'en';
  schemaVersion: string;
  requestId?: string;
}

export interface ProviderRawResponse {
  rawContent: string;
  provider: SupportedAIProvider;
  modelUsed: string;
  durationMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AIProvider {
  readonly name: SupportedAIProvider;
  generateGame(input: GenerateGameInput): Promise<ProviderRawResponse>;
}
