// infrastructures/llm/OllamaProvider.ts
import type { LLMProvider, LLMMessage, LLMGenerateOptions, LLMResult } from './llmProvider';

export class OllamaProvider implements LLMProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string
  ) {}

  async chat(messages: LLMMessage[], _options?: LLMGenerateOptions): Promise<LLMResult> {
    const resp = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages, stream: false }),
    });

    if (!resp.ok) throw new Error(`Ollama error: ${resp.status}`);

    const data = await resp.json() as any;
    const text = data.message?.content ?? '';

    return { text, raw: data };
  }
}
