// LM Studio Provider - Uses OpenAI-compatible API format
import type { LLMProvider, LLMMessage, LLMGenerateOptions, LLMResult } from './llmProvider';

/**
 * LM Studio provider using OpenAI-compatible API.
 * LM Studio exposes /v1/chat/completions endpoint.
 */
export class LMStudioProvider implements LLMProvider {
  constructor(
    private readonly baseUrl: string,
    private readonly model: string
  ) {}

  async chat(messages: LLMMessage[], options?: LLMGenerateOptions): Promise<LLMResult> {
    const resp = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stream: false,
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`LM Studio error: ${resp.status} - ${errorText}`);
    }

    const data = await resp.json() as any;
    const text = data.choices?.[0]?.message?.content ?? '';

    return { text, raw: data };
  }
}
