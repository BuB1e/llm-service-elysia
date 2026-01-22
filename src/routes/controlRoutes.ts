import { Elysia, t } from "elysia";
import { IsoControlAnalysisService } from "../services/llm/controlAnalysisService";
import { createLLMProvider } from "../config/container";
import { createAuthMiddleware, requireAuth } from "../middleware/auth";
import type { ControlAnalysisInput } from "../types/llm.types";

/**
 * Creates the control analysis routes.
 * The route layer only calls the service, never the LLM directly.
 */
export function createControlRoutes() {
  // Create the LLM provider using the factory (configuration-based)
  const llmProvider = createLLMProvider();

  // Create the service with the provider injected
  const analysisService = new IsoControlAnalysisService(llmProvider);

  return (
    new Elysia({ prefix: "/api" })
      // Apply auth middleware to derive authBearer in this route's context
      .use(createAuthMiddleware())
      // Health check endpoint (no auth required)
      .get("/health", () => ({ status: "ok", service: "llm-service" }))

      // Main analysis endpoint (auth required)
      .post(
        "/analyze-control",
        async ({ body, bearer, path, set }) => {
          // Check authentication
          const authError = requireAuth(bearer, path, set);
          if (authError) return authError;

          const input: ControlAnalysisInput = {
            controlCode: body.controlCode,
            title: body.title,
            description: body.description,
            guidance: body.guidance,
            status: body.status,
            currentPractice: body.currentPractice,
            evidenceDescription: body.evidenceDescription,
            userContext: body.userContext,
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
            evidenceDescription: t.Optional(t.Union([t.String(), t.Null()])),
            userContext: t.Optional(t.Union([t.String(), t.Null()])),
          }),
          // Error handling
          error({ error }) {
            console.error("Route error:", error);
            return {
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            };
          },
        },
      )
  );
}
