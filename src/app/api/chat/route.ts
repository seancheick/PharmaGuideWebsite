import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkChatRateLimit } from "@/lib/rate-limit";
import { log } from "@/lib/logger";

/**
 * /api/chat — server-side proxy for the PharmaGuide chatbot.
 *
 * The upstream API at pharmaguide-chatbot-api.vercel.app/api/chat only
 * allows CORS from the production origin. Routing the call through our
 * own server avoids that limitation in dev / preview, lets us add
 * per-IP rate limiting on top of whatever the upstream does, and keeps
 * the upstream URL out of the client bundle.
 *
 * Defense in depth:
 *   1. Shape validation — bad payloads short-circuit before upstream
 *   2. Per-IP rate limit (40/10min) via Upstash sliding window
 *   3. 15s upstream timeout — matches the old widget's behavior
 *   4. Passthrough of 429 with Retry-After so the client can back off
 */

const UPSTREAM = "https://pharmaguide-chatbot-api.vercel.app/api/chat";
const UPSTREAM_TIMEOUT_MS = 15_000;
const MAX_MESSAGE_LEN = 2_000;
const MAX_HISTORY = 10;

interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history?: HistoryItem[];
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? "local-dev";
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === "user" || v.role === "assistant") &&
    typeof v.content === "string"
  );
}

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  // ─── Validate shape ────────────────────────────────────────────
  if (typeof body.message !== "string" || body.message.trim().length === 0) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }
  if (body.message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json(
      { error: `Message too long (${MAX_MESSAGE_LEN} char max).` },
      { status: 400 }
    );
  }

  const history = Array.isArray(body.history)
    ? body.history.filter(isHistoryItem).slice(-MAX_HISTORY)
    : [];

  // ─── Rate limit per-IP ─────────────────────────────────────────
  const ip = await getClientIp();
  const rl = await checkChatRateLimit(ip);
  if (!rl.ok) {
    const retryAfter = rl.reset
      ? Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000))
      : 60;
    return NextResponse.json(
      {
        error: "You've hit the request limit. Try again in a few minutes.",
        retryAfter,
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  // ─── Forward upstream ──────────────────────────────────────────
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: body.message.trim(), history }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!upstream.ok) {
      const errorPayload = (await upstream
        .json()
        .catch(() => ({}))) as Record<string, unknown>;
      log.warn("chat.upstream_error", {
        status: upstream.status,
        ip_hash: ip,
      });
      return NextResponse.json(
        {
          error:
            typeof errorPayload.error === "string"
              ? errorPayload.error
              : "Upstream returned an error.",
          ...(typeof errorPayload.retryAfter === "number"
            ? { retryAfter: errorPayload.retryAfter }
            : {}),
        },
        { status: upstream.status }
      );
    }

    const data = (await upstream.json()) as Record<string, unknown>;

    // Strip implementation-detail fields before returning to the
    // browser. Keeps the "PharmaGuide AI" brand opaque about which
    // model is under the hood and avoids leaking internal state
    // (used for analytics on the upstream side, not for the client).
    delete data.model;
    delete data._state;

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    clearTimeout(timeout);
    const aborted = err instanceof Error && err.name === "AbortError";
    log.error("chat.upstream_failed", {
      reason: aborted ? "timeout" : "fetch_error",
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      {
        error: aborted
          ? "Response took too long. Try again."
          : "Something went wrong reaching the assistant.",
      },
      { status: 504 }
    );
  }
}

// Hint Next.js to use the Node runtime; we use server-only env.
export const runtime = "nodejs";
