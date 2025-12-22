import { Elysia } from 'elysia';
import { createControlRoutes } from './routes/controlRoutes';

const PORT = process.env.PORT ?? 3000;

const app = new Elysia()
  // Root endpoint
  .get('/', () => ({
    message: 'LLM Service for ISO 27001 Control Analysis',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      analyzeControl: 'POST /api/analyze-control',
    },
  }))
  // Mount the control analysis routes
  .use(createControlRoutes())
  .listen(PORT);

console.log(`🦊 LLM Service is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📋 POST /api/analyze-control - Analyze an ISO 27001 control`);
console.log(`❤️  GET /api/health - Health check`);

