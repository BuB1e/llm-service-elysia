// infrastructures/llm/OpenAIProvider.ts
import type { LLMProvider, LLMMessage, LLMGenerateOptions, LLMResult } from './llmProvider';

export class OpenAIProvider implements LLMProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async chat(messages: LLMMessage[], options?: LLMGenerateOptions): Promise<LLMResult> {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.2,
      }),
    });

    if (!resp.ok) throw new Error(`OpenAI error: ${resp.status}`);

    const data = await resp.json() as any;
    const text = data.choices?.[0]?.message?.content ?? '';

    return { text, raw: data };
  }
}
