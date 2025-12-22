import { Elysia, t } from 'elysia';
import { IsoControlAnalysisService } from '../services/llm/controlAnalysisService';
import { createLLMProvider } from '../config/container';
import type { ControlAnalysisInput } from '../types/llm.types';

/**
 * Creates the control analysis routes.
 * The route layer only calls the service, never the LLM directly.
 */
export function createControlRoutes() {
  // Create the LLM provider using the factory (configuration-based)
  const llmProvider = createLLMProvider();

  // Create the service with the provider injected
  const analysisService = new IsoControlAnalysisService(llmProvider);

  return new Elysia({ prefix: '/api' })
    // Health check endpoint
    .get('/health', () => ({ status: 'ok', service: 'llm-service' }))

    // Main analysis endpoint
    .post(
      '/analyze-control',
      async ({ body }) => {
        const input: ControlAnalysisInput = {
          controlCode: body.controlCode,
          title: body.title,
          description: body.description,
          guidance: body.guidance,
          status: body.status,
          currentPractice: body.currentPractice,
          evidenceSummary: body.evidenceSummary,
          context: body.context,
          testmode: body.testmode,
        };

        const result = await analysisService.analyzeControl(input);

        return {
          success: true,
          data: result,
        };
      },
      {
        // Request body validation schema
        body: t.Object({
          controlCode: t.String(),
          title: t.String(),
          description: t.String(),
          guidance: t.String(),
          status: t.String(),
          currentPractice: t.String(),
          evidenceSummary: t.String(),
          context: t.String(),
          testmode: t.Optional(t.Boolean()),
        }),
        // Error handling
        error({ error }) {
          console.error('Route error:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        },
      }
    );
}
