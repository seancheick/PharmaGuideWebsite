import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "./env";
import { log, hashPii } from "./logger";

/**
 * Per-IP rate limiter for the email-signup endpoints.
 *
 * Backed by Upstash Redis (REST API, no connection pool, works on
 * Vercel serverless). Sliding-window: 5 attempts per IP per hour.
 *
 * Configuration:
 *   • Production: env.UPSTASH_REDIS_REST_URL + _TOKEN are required;
 *     env.ts throws at boot if missing.
 *   • Dev: vars are optional. If absent, the limiter falls back to
 *     allow-with-warning so local dev isn't blocked.
 *
 * Tradeoffs:
 *   • Sliding-window > fixed-window for burst protection at boundaries
 *   • Per-IP keying handles most casual abuse but is bypassable behind
 *     CGNAT or VPN. The honeypot field on the forms is the second layer.
 *   • analytics: true sends rate-limit metrics to Upstash dashboard
 *     (free tier supports this).
 */

const url = env.UPSTASH_REDIS_REST_URL;
const token = env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  url && token
    ? new Redis({ url, token })
    : null;

export const subscribeLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "rl:subscribe",
    })
  : null;

/**
 * Chat rate limiter — more permissive than subscribe because a real
 * conversation needs many turns. 40 messages per IP per 10 minutes
 * cuts off scrape/abuse without bothering legit users.
 */
export const chatLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(40, "10 m"),
      analytics: true,
      prefix: "rl:chat",
    })
  : null;

export async function checkChatRateLimit(
  ip: string
): Promise<RateLimitCheck> {
  if (!chatLimiter) {
    log.warn("rate_limit.skipped", {
      reason: "upstash_not_configured",
      ip_hash: hashPii(ip),
      scope: "chat",
    });
    return { ok: true };
  }

  const result = await chatLimiter.limit(ip);
  if (!result.success) {
    log.warn("rate_limit.exceeded", {
      ip_hash: hashPii(ip),
      remaining: result.remaining,
      reset: result.reset,
      scope: "chat",
    });
  }
  return {
    ok: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export interface RateLimitCheck {
  ok: boolean;
  remaining?: number;
  reset?: number;
}

/**
 * Check whether the given IP can perform a subscribe action.
 * Allow-with-warning when Upstash isn't configured (dev only —
 * env.ts throws on production boot if the vars are missing).
 */
export async function checkSubscribeRateLimit(
  ip: string
): Promise<RateLimitCheck> {
  if (!subscribeLimiter) {
    log.warn("rate_limit.skipped", {
      reason: "upstash_not_configured",
      ip_hash: hashPii(ip),
    });
    return { ok: true };
  }

  const result = await subscribeLimiter.limit(ip);
  if (!result.success) {
    log.warn("rate_limit.exceeded", {
      ip_hash: hashPii(ip),
      remaining: result.remaining,
      reset: result.reset,
    });
  }
  return {
    ok: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}
