// Rate Limiting Middleware
import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter.
 * Set RATE_LIMIT_RPM env var for requests per minute (default: 30).
 *
 * Tracks by IP address or API key if authenticated.
 */
export function createRateLimitMiddleware() {
  const requestsPerMinute = parseInt(process.env.RATE_LIMIT_RPM || "30", 10);
  const windowMs = 60 * 1000; // 1 minute window

  // In-memory store (for single instance; use Redis for multi-instance)
  const store = new Map<string, RateLimitEntry>();

  console.log(`⏱️  Rate limit: ${requestsPerMinute} requests/minute`);

  // Cleanup old entries every 5 minutes
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) {
          store.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  );

  return new Elysia({ name: "rateLimit" })
    .use(bearer())
    .onBeforeHandle(({ request, set, bearer }) => {
      // Use API key as identifier if available, otherwise use IP
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown";
      const identifier = bearer || ip;

      const now = Date.now();
      let entry = store.get(identifier);

      // Reset if window expired
      if (!entry || entry.resetAt < now) {
        entry = { count: 0, resetAt: now + windowMs };
        store.set(identifier, entry);
      }

      entry.count++;

      // Set rate limit headers
      const remaining = Math.max(0, requestsPerMinute - entry.count);
      set.headers["X-RateLimit-Limit"] = String(requestsPerMinute);
      set.headers["X-RateLimit-Remaining"] = String(remaining);
      set.headers["X-RateLimit-Reset"] = String(
        Math.ceil(entry.resetAt / 1000),
      );

      // Check if over limit
      if (entry.count > requestsPerMinute) {
        set.status = 429;
        set.headers["Retry-After"] = String(
          Math.ceil((entry.resetAt - now) / 1000),
        );
        return {
          success: false,
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        };
      }
    });
}
