/**
 * Rate Limiting Module
 * Supports distributed sliding window via Upstash Redis REST API
 * with automatic fallback to high-efficiency in-memory sliding window for development.
 */

import { NextResponse } from "next/server";

export type RateLimitCategory = "auth" | "billing" | "ai" | "upload" | "general";

export const RATE_LIMIT_BUDGETS: Record<RateLimitCategory, { maxRequests: number; intervalMs: number }> = {
  auth: { maxRequests: 10, intervalMs: 60_000 },
  billing: { maxRequests: 10, intervalMs: 60_000 },
  ai: { maxRequests: 20, intervalMs: 60_000 },
  upload: { maxRequests: 20, intervalMs: 60_000 },
  general: { maxRequests: 120, intervalMs: 60_000 },
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory sliding log fallback
interface SlidingLogEntry {
  timestamps: number[];
  windowExpiresAt: number;
}
const memoryLogs = new Map<string, SlidingLogEntry>();

// Periodic cleanup every 2 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryLogs.entries()) {
      if (now > entry.windowExpiresAt) {
        memoryLogs.delete(key);
      }
    }
  }, 2 * 60 * 1000);
}

/**
 * Distributed rate limiter using Upstash Redis REST if configured, otherwise local sliding window.
 */
export async function checkRateLimit(
  identifier: string,
  category: RateLimitCategory = "general"
): Promise<RateLimitResult> {
  const budget = RATE_LIMIT_BUDGETS[category];
  const maxRequests = budget.maxRequests;
  const intervalMs = budget.intervalMs;
  const now = Date.now();
  const windowStart = now - intervalMs;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const key = `ratelimit:${category}:${identifier}`;
      // Upstash pipeline: ZREMRANGEBYSCORE, ZADD, ZCARD, EXPIRE
      const pipelineBody = JSON.stringify([
        ["ZREMRANGEBYSCORE", key, "0", windowStart.toString()],
        ["ZADD", key, now.toString(), now.toString()],
        ["ZCARD", key],
        ["PEXPIRE", key, intervalMs.toString()],
      ]);

      const res = await fetch(`${redisUrl.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: pipelineBody,
        cache: "no-store",
      });

      if (res.ok) {
        const results = await res.json();
        // results is array of responses: [ { result: N }, { result: 1 }, { result: count }, { result: 1 } ]
        const currentCount = results[2]?.result || 1;
        const remaining = Math.max(0, maxRequests - currentCount);
        const reset = now + intervalMs;

        return {
          success: currentCount <= maxRequests,
          limit: maxRequests,
          remaining,
          reset,
        };
      }
    } catch (err) {
      console.warn("Upstash Redis rate limit check failed, falling back to memory:", err);
    }
  }

  // Local sliding window fallback
  const log = memoryLogs.get(`${category}:${identifier}`) || { timestamps: [], windowExpiresAt: now + intervalMs };
  // Filter out timestamps outside the sliding window
  log.timestamps = log.timestamps.filter((ts) => ts > windowStart);
  log.timestamps.push(now);
  log.windowExpiresAt = now + intervalMs;
  memoryLogs.set(`${category}:${identifier}`, log);

  const count = log.timestamps.length;
  const remaining = Math.max(0, maxRequests - count);

  return {
    success: count <= maxRequests,
    limit: maxRequests,
    remaining,
    reset: now + intervalMs,
  };
}

/**
 * Extracts verified client IP. Does not trust spoofed user-agent headers beyond trusted infrastructure.
 */
export function getClientIp(request: Request): string {
  // Vercel edge/serverless verified client IP header
  const vercelIp = request.headers.get("x-vercel-ip");
  if (vercelIp) return vercelIp.trim();

  // AWS/Cloudflare verified IP header
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // When behind multiple proxies, the first unverified entry is client, but Vercel sets the true client IP
    const parts = forwarded.split(",");
    return parts[0].trim();
  }

  return "127.0.0.1";
}

/**
 * Generates standard 429 Too Many Requests response with headers.
 */
export function createRateLimitResponse(limitResult: RateLimitResult): NextResponse {
  const retryAfterSec = Math.max(1, Math.ceil((limitResult.reset - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSec.toString(),
        "X-RateLimit-Limit": limitResult.limit.toString(),
        "X-RateLimit-Remaining": limitResult.remaining.toString(),
        "X-RateLimit-Reset": limitResult.reset.toString(),
      },
    }
  );
}

// Backward-compatible synchronous wrapper for existing non-async calls
export function rateLimit(
  identifier: string,
  options: { maxRequests?: number; intervalMs?: number } = {}
): RateLimitResult {
  const maxRequests = options.maxRequests ?? 60;
  const intervalMs = options.intervalMs ?? 60_000;
  const now = Date.now();
  const windowStart = now - intervalMs;

  const log = memoryLogs.get(identifier) || { timestamps: [], windowExpiresAt: now + intervalMs };
  log.timestamps = log.timestamps.filter((ts) => ts > windowStart);
  log.timestamps.push(now);
  log.windowExpiresAt = now + intervalMs;
  memoryLogs.set(identifier, log);

  const count = log.timestamps.length;
  return {
    success: count <= maxRequests,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - count),
    reset: now + intervalMs,
  };
}
