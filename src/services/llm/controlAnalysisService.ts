import type { LLMProvider } from '../../interface/llm/llmProvider';
import type { ControlAnalysisInput, ControlAnalysisResult } from '../../types/llm.types';
import { buildControlPrompt, PromptType } from './prompt';

const SYSTEM_PROMPT = 'You are a helpful ISO 27001:2022 consultant.';
const TEST_PROMPT = 'Say "Hello! LLM connection is working." and nothing else.';

/**
 * Service for analyzing ISO 27001 controls using AI.
 * This is the use case layer - it orchestrates the AI analysis.
 * It depends only on the LLMProvider interface, not on specific implementations.
 */
export class IsoControlAnalysisService {
  constructor(private readonly llm: LLMProvider) {}

  /**
   * Test the LLM connection with a simple message.
   * Use this to verify the LLM is responding correctly.
   */
  async testConnection(): Promise<ControlAnalysisResult> {
    try {
      const result = await this.llm.chat([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: TEST_PROMPT },
      ]);

      return {
        aiSuggestion: result.text,
        testMode: true,
        connectionStatus: 'ok',
      };
    } catch (error) {
      console.error('LLM connection test failed:', error);
      throw new Error(
        `LLM connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Analyze an ISO 27001 control and generate AI-based suggestions.
   * @param input - The control details and current practice information
   * @returns AI-generated analysis and suggestions
   */
  async analyzeControl(input: ControlAnalysisInput): Promise<ControlAnalysisResult> {
    // RAG-ready: In the future, this will be populated by a retrieval system
    // For now, we pass empty context
    const retrievedContext = ''; // future: retrievedContext = await rag.retrieve(input)

    const inputWithContext: ControlAnalysisInput = {
      ...input,
      retrievedContext,
    };

    const prompt = buildControlPrompt(inputWithContext, PromptType.CONTROL);

    try {
      const result = await this.llm.chat([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ]);

      return { aiSuggestion: result.text };
    } catch (error) {
      // Log the error for debugging (in production, use a proper logger)
      console.error('Error during control analysis:', error);

      // Re-throw with a more descriptive message
      throw new Error(
        `Failed to analyze control ${input.controlCode}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}

