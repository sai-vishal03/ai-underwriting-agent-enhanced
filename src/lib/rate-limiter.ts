/**
 * In-memory sliding window rate limiter.
 * Production upgrade path: Replace with Redis-backed limiter (e.g. @upstash/ratelimit).
 * 
 * Config: 100 requests per 60-second window per IP.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 100;

const ipStore = new Map<string, RateLimitEntry>();

// Periodic cleanup to prevent memory leaks (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipStore.entries()) {
    if (now > entry.resetTime) {
      ipStore.delete(ip);
    }
  }
}, 5 * 60_000);

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now > entry.resetTime) {
    // Start new window
    ipStore.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfterMs: 0 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, retryAfterMs: 0 };
}
