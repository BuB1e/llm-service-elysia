// GroqCloud Provider - Uses OpenAI-compatible API format
import type {
  LLMProvider,
  LLMMessage,
  LLMGenerateOptions,
  LLMResult,
} from "./llmProvider";

/**
 * GroqCloud provider using OpenAI-compatible API.
 * Groq exposes /openai/v1/chat/completions endpoint.
 * API Documentation: https://console.groq.com/docs/api-reference
 */
export class GroqProvider implements LLMProvider {
  private readonly baseUrl = "https://api.groq.com/openai/v1";

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async chat(
    messages: LLMMessage[],
    options?: LLMGenerateOptions,
  ): Promise<LLMResult> {
    const resp = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
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
      throw new Error(`Groq API error: ${resp.status} - ${errorText}`);
    }

    const data = (await resp.json()) as any;
    const text = data.choices?.[0]?.message?.content ?? "";

    return { text, raw: data };
  }
}
