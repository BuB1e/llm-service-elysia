// API Key Authentication Middleware
import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";

// Load valid API keys from environment
const validApiKeys = new Set(
  process.env.API_KEYS?.split(",")
    .map((k) => k.trim())
    .filter(Boolean) || [],
);

const authEnabled = validApiKeys.size > 0;
console.log(
  `🔐 Auth: ${authEnabled ? `enabled (${validApiKeys.size} key(s))` : "DISABLED (no API_KEYS set)"}`,
);

/**
 * Auth guard function - validates bearer token
 */
function validateAuth(
  bearer: string | undefined,
  path: string,
): { valid: boolean; error?: string } {
  // Skip auth for health endpoint (useful for load balancers)
  if (path === "/api/health") {
    return { valid: true };
  }

  // Skip auth if no API keys configured (development mode)
  if (!authEnabled) {
    return { valid: true };
  }

  // Check for valid API key
  if (!bearer || !validApiKeys.has(bearer)) {
    return { valid: false, error: "Unauthorized: Invalid or missing API key" };
  }

  return { valid: true };
}

/**
 * Create auth middleware that properly propagates to all routes
 */
export function createAuthMiddleware() {
  return new Elysia({ name: "auth" }).use(bearer());
}

/**
 * Auth guard to use in route handlers
 */
export function requireAuth(
  bearer: string | undefined,
  path: string,
  set: any,
) {
  const result = validateAuth(bearer, path);
  if (!result.valid) {
    set.status = 401;
    set.headers["WWW-Authenticate"] = 'Bearer realm="llm-service"';
    return {
      success: false,
      error: result.error,
    };
  }
  return null; // Auth passed
}

export { authEnabled };
