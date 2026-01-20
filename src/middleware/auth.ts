// API Key Authentication Middleware
import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";

/**
 * Create API key authentication middleware.
 * Set API_KEYS env var to comma-separated list of valid API keys.
 * Example: API_KEYS=key1,key2,key3
 *
 * Clients must send: Authorization: Bearer <api_key>
 */
export function createAuthMiddleware() {
  const validApiKeys = new Set(
    process.env.API_KEYS?.split(",")
      .map((k) => k.trim())
      .filter(Boolean) || [],
  );

  const authEnabled = validApiKeys.size > 0;
  console.log(
    `🔐 Auth: ${authEnabled ? `enabled (${validApiKeys.size} key(s))` : "DISABLED (no API_KEYS set)"}`,
  );

  return new Elysia({ name: "auth" })
    .use(bearer())
    .onBeforeHandle(({ bearer, set, path }) => {
      // Skip auth for health endpoint (useful for load balancers)
      if (path === "/api/health") {
        return;
      }

      // Skip auth if no API keys configured (development mode)
      if (!authEnabled) {
        return;
      }

      // Check for valid API key
      if (!bearer || !validApiKeys.has(bearer)) {
        set.status = 401;
        set.headers["WWW-Authenticate"] = 'Bearer realm="llm-service"';
        return {
          success: false,
          error: "Unauthorized: Invalid or missing API key",
        };
      }
    });
}
