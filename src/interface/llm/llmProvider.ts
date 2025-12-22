export type LLMMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export interface LLMGenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResult {
  text: string;
  raw?: unknown;
}

export interface LLMProvider {
  chat(messages: LLMMessage[], options?: LLMGenerateOptions): Promise<LLMResult>;
}
