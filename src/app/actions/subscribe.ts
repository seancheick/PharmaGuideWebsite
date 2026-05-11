"use server";

import { headers } from "next/headers";
import {
  notifyProviderInterest,
  subscribe,
  type ProviderInquiry,
  type SubscribeResult,
} from "@/lib/resend";
import { checkSubscribeRateLimit } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/validation";
import { log } from "@/lib/logger";

/**
 * Server actions consumed by the form clients (FinalCTA + NewsletterCTA).
 *
 * Defense in depth — three layers between a form submit and the
 * Resend API call:
 *
 *   1. Honeypot field (`company`) — bots auto-fill, real users never
 *      see it. If filled, we silently return success without doing
 *      anything (so the bot can't tell it failed and adapt).
 *
 *   2. Email format validation — shared regex with the client form.
 *
 *   3. Per-IP rate limit — 5 attempts/hour via Upstash sliding window.
 *      Falls back to allow-with-warning in dev where Upstash isn't set.
 *
 * No API route needed — Next.js wires up the RPC call automatically.
 */

interface BetaArgs {
  email: string;
  /** Honeypot — must be empty. Filled = bot. */
  company?: string;
}

interface NewsletterArgs {
  email: string;
  /** Honeypot — must be empty. Filled = bot. */
  company?: string;
}

const SILENT_BOT_RESPONSE: SubscribeResult = {
  ok: true,
  message: "You're in.",
};

const RATE_LIMIT_RESPONSE: SubscribeResult = {
  ok: false,
  message: "Whoa — that's a lot of tries. Wait a few minutes and try again.",
  code: "rate_limited",
};

const INVALID_EMAIL_RESPONSE: SubscribeResult = {
  ok: false,
  message: "Please enter a valid email.",
  code: "invalid_email",
};

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    // x-forwarded-for can be a comma-separated chain (proxy hops).
    // The first entry is the original client.
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp;
  // Local dev — no proxy header. Use a constant so dev rate-limit
  // behaves consistently across requests.
  return "local-dev";
}

export async function joinBetaWaitlist(
  args: BetaArgs
): Promise<SubscribeResult> {
  if (args.company && args.company.length > 0) {
    log.warn("subscribe.honeypot_triggered", { list: "beta" });
    return SILENT_BOT_RESPONSE;
  }

  const cleanEmail = args.email.trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return INVALID_EMAIL_RESPONSE;
  }

  const ip = await getClientIp();
  const rl = await checkSubscribeRateLimit(ip);
  if (!rl.ok) return RATE_LIMIT_RESPONSE;

  return subscribe({ email: cleanEmail, list: "beta" });
}

/**
 * Healthcare Pros inquiry from the /hipaa page form.
 *
 * Sends a structured notification to providers@pharmaguide.io. Same
 * defense-in-depth as the subscribe actions: honeypot, format check,
 * per-IP rate limit. We do NOT add the provider to any Audience —
 * just notify the team so a human can start a thread.
 */
interface ProviderArgs {
  email: string;
  role: ProviderInquiry["role"];
  organization?: string;
  notes?: string;
  /** Honeypot — must be empty. Filled = bot. */
  company?: string;
}

export async function requestProvidersAccess(
  args: ProviderArgs
): Promise<SubscribeResult> {
  if (args.company && args.company.length > 0) {
    log.warn("subscribe.honeypot_triggered", { list: "providers" });
    return SILENT_BOT_RESPONSE;
  }

  const cleanEmail = args.email.trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return INVALID_EMAIL_RESPONSE;
  }

  const ip = await getClientIp();
  const rl = await checkSubscribeRateLimit(ip);
  if (!rl.ok) return RATE_LIMIT_RESPONSE;

  return notifyProviderInterest({
    email: cleanEmail,
    role: args.role,
    organization: args.organization?.trim() || undefined,
    notes: args.notes?.trim() || undefined,
  });
}

export async function subscribeToNewsletter(
  args: NewsletterArgs
): Promise<SubscribeResult> {
  if (args.company && args.company.length > 0) {
    log.warn("subscribe.honeypot_triggered", { list: "newsletter" });
    return SILENT_BOT_RESPONSE;
  }

  const cleanEmail = args.email.trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return INVALID_EMAIL_RESPONSE;
  }

  const ip = await getClientIp();
  const rl = await checkSubscribeRateLimit(ip);
  if (!rl.ok) return RATE_LIMIT_RESPONSE;

  return subscribe({ email: cleanEmail, list: "newsletter" });
}
