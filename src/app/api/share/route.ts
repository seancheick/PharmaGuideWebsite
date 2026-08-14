import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { shareStorageConfigured } from "@/lib/env";
import { checkShareRateLimit } from "@/lib/rate-limit";
import { log } from "@/lib/logger";
import { validateShareRequest } from "@/lib/share-snapshot";
import { createShareSnapshot, resolveCanonicalShareSnapshot } from "@/lib/share-store";
import { site } from "@/lib/site";

/**
 * POST /api/share — mint a public link for a product the app is sharing.
 *
 * The app calls this when someone taps Share, then appends the returned URL to
 * the share text it already sends. A failure here is not fatal on the client:
 * the app falls back to the text-only share it has always done, so a person
 * mid-gesture never sees an error because our database was slow.
 *
 * That asymmetry drives the design — this route is written to be cheap to fail
 * and impossible to abuse:
 *
 *   1. Feature flag  — 503 when Supabase is unconfigured, so an unset key is a
 *                      disabled feature rather than a 500 in someone's face
 *   2. Size cap      — bodies are read with a hard ceiling before parsing
 *   3. Rate limit    — 20/IP/10min via the existing Upstash sliding window
 *   4. Identity only — the client may send only dsldId + catalogVersion
 *   5. Server truth  — every visible field resolves from that immutable
 *                      pipeline-published release artifact
 *
 * There is no GET here on purpose. Reading a snapshot happens through the
 * server component at /s/[code]; exposing a JSON read endpoint would invite
 * enumeration attempts against a table whose whole security model is that the
 * code is the capability.
 */

/** Two short catalog identifiers; excess bytes are never useful. */
const MAX_BODY_BYTES = 512;

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip") ?? "local-dev";
}

export async function POST(request: Request) {
  if (!shareStorageConfigured) {
    log.warn("share.disabled", { reason: "supabase_not_configured" });
    return NextResponse.json({ error: "Sharing is not available right now." }, { status: 503 });
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  const ip = await getClientIp();
  const limit = await checkShareRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many shares. Try again shortly." },
      {
        status: 429,
        headers: limit.reset
          ? {
              "Retry-After": String(Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))),
            }
          : undefined,
      }
    );
  }

  // Read as text first so an oversized body without a content-length header
  // still hits the ceiling before it becomes parsed objects in memory.
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large." }, { status: 413 });
    }
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = validateShareRequest(raw);
  if (!parsed.ok) {
    log.warn("share.rejected", { error: parsed.error });
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const canonical = await resolveCanonicalShareSnapshot(parsed.value);
  if (!canonical.ok) {
    return NextResponse.json(
      { error: "This catalog result is not available for sharing." },
      { status: 422 }
    );
  }

  const result = await createShareSnapshot(canonical.value);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  // site.url already resolves NEXT_PUBLIC_SITE_URL with a production fallback,
  // so the link the app receives matches every other canonical URL the site
  // emits.
  const url = `${site.url.replace(/\/$/, "")}/s/${result.code}`;

  // dsld_id, not the product name: enough to correlate a share with a catalog
  // row when debugging, without writing free text into the log stream.
  log.info("share.created", {
    code: result.code,
    dsld_id: parsed.value.dsldId,
    disposition: canonical.value.catalogDisposition,
    scored: canonical.value.qualityScore !== null,
    highlights: canonical.value.highlights.length,
  });

  return NextResponse.json({ code: result.code, url }, { status: 201 });
}

/**
 * Explicit 405s. Without these Next answers unmatched methods with its own
 * generic error, which is noisier to debug than a route that states its shape.
 */
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed." },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
