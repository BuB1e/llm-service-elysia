// config/container.ts
import { OpenAIProvider } from "../interface/llm/openAIProvider";
import { OllamaProvider } from "../interface/llm/ollamaProvider";
import { LMStudioProvider } from "../interface/llm/LMStudioProvider";
import { GroqProvider } from "../interface/llm/GroqProvider";

export function createLLMProvider() {
  const provider = process.env.LLM_PROVIDER ?? "openai";

  if (provider === "lmstudio" || provider === "llama") {
    // LM Studio uses OpenAI-compatible API format
    return new LMStudioProvider(
      process.env.OLLAMA_URL ?? "http://localhost:1234",
      process.env.OLLAMA_MODEL ?? "meta-llama-3.1-8b-instruct",
    );
  }

  if (provider === "ollama") {
    // Real Ollama server uses /api/chat endpoint
    return new OllamaProvider(
      process.env.OLLAMA_URL ?? "http://localhost:11434",
      process.env.OLLAMA_MODEL ?? "llama3",
    );
  }

  if (provider === "groq") {
    // GroqCloud uses OpenAI-compatible API with fixed endpoint
    return new GroqProvider(
      process.env.GROQ_API_KEY!,
      process.env.GROQ_MODEL ?? "llama-3.1-8b-instant",
    );
  }

  return new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  );
}
