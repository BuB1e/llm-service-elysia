import { Elysia } from "elysia";
import { createControlRoutes } from "./routes/controlRoutes";
import { createAuthMiddleware } from "./middleware/auth";
import { createRateLimitMiddleware } from "./middleware/rateLimit";

const PORT = process.env.PORT ?? 3000;

console.log("🚀 Starting LLM Service...");
console.log("----------------------------");

const app = new Elysia()
  // Middleware (order matters: Rate Limit -> Auth)
  .use(createRateLimitMiddleware())
  .use(createAuthMiddleware())
  // Root endpoint
  .get("/", () => ({
    message: "LLM Service for ISO 27001 Control Analysis",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      analyzeControl: "POST /api/analyze-control",
    },
  }))
  // Mount the control analysis routes
  .use(createControlRoutes())
  .listen(PORT);

console.log("----------------------------");
console.log(
  `🦊 LLM Service is running at ${app.server?.hostname}:${app.server?.port}`,
);
console.log(`📋 POST /api/analyze-control - Analyze an ISO 27001 control`);
console.log(`❤️  GET /api/health - Health check`);
