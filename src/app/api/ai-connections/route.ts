import { randomInt, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import {
  type TrustedClient,
  createWriteLimiter,
  parseTrustedClients,
  redirectMatchesCallback,
  verifyCallback,
} from "@/lib/ai-connector";

/**
 * POST /api/ai-connections — the server half of the AI connector consent.
 *
 *   preview    → verified client name and callback host for the consent card
 *   pair_start/status/cancel → short-lived approval from a different app session
 *   approve    → atomically consumes phone approval and creates the connection,
 *                then approves with Auth; cancellation recovers lost replies
 *   disconnect → marks the user's connection to one assistant revoked and
 *                deletes its shared snapshots and access-log rows (S5); the
 *                page then revokes the grant
 *
 * A redirect-only returning authorization does not prove client identity.
 * It is refused; the user disconnects its grant and starts a fresh request.
 * Approval writes the connection before asking Auth for the authorization
 * code, and revokes that exact row if Auth fails or returns a wrong callback.
 *
 * approve and disconnect are limited to 10 per user per minute (per instance).
 *
 * The caller is the signed-in user (Authorization: Bearer <session token>).
 * user_id always comes from Supabase Auth, the client and callback always
 * come from Supabase's own authorization record, and an AI assistant's OAuth
 * token is refused outright. Writes use the service role, server-only.
 */

const MAX_BODY_BYTES = 1024;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,255}$/;
const takeWrite = createWriteLimiter(10, 60_000);
const ALREADY_CONNECTED =
  "This assistant already has an approval on record. To review or end it, open your connections page, disconnect it, and connect again.";

type Body = { action?: unknown; authorization_id?: unknown; client_id?: unknown };

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

function authUrl(path: string): string {
  return `${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/${path}`;
}

function restUrl(path: string): string {
  return `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`;
}

function serviceHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "content-type": "application/json",
    ...extra,
  };
}

function claimsOf(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1] ?? "";
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/** The signed-in user, verified by Supabase Auth; null for anything else. */
async function verifiedUserId(token: string): Promise<string | null> {
  const claims = claimsOf(token);
  // An assistant's own OAuth token must never approve or disconnect anything.
  if (!claims || claims.client_id !== undefined || claims.is_anonymous === true) return null;
  const response = await fetch(authUrl("user"), {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = (await response.json()) as { id?: unknown; is_anonymous?: boolean };
  return typeof user.id === "string" && user.is_anonymous !== true ? user.id : null;
}

type Verified =
  | {
      ok: true;
      client: TrustedClient;
      redirectUri: string;
      host: string;
      displayHost: string;
    }
  | { ok: false; status: number; error: string };

/** Reads the pending authorization from Supabase Auth and applies S3. */
async function verifiedAuthorization(token: string, authorizationId: string): Promise<Verified> {
  const response = await fetch(authUrl(`oauth/authorizations/${authorizationId}`), {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    return { ok: false, status: 404, error: "This connection request has ended. Start again from the assistant." };
  }
  const details = (await response.json()) as {
    redirect_uri?: unknown;
    redirect_url?: unknown;
    client?: { id?: unknown };
  };
  const trusted = parseTrustedClients(process.env.AI_CONNECTOR_TRUSTED_CLIENTS);
  if (typeof details.redirect_uri !== "string" || typeof details.client?.id !== "string") {
    // Several registrations can share one callback. Its host identifies a
    // destination, never the OAuth client that owns this authorization.
    return { ok: false, status: 409, error: ALREADY_CONNECTED };
  }
  const clientId = details.client.id;
  const client = trusted.find((c) => c.client_id === clientId);
  if (!client) {
    return { ok: false, status: 403, error: "PharmaGuide does not recognise this assistant." };
  }
  if (client.kind === "codex" && details.redirect_uri !== client.redirect_uri) {
    return {ok: false, status: 403, error: "This assistant callback is not registered."};
  }
  const callback = verifyCallback(details.redirect_uri, client.kind);
  if (!callback.ok) return { ok: false, status: 403, error: callback.reason };
  return {
    ok: true,
    client,
    redirectUri: details.redirect_uri,
    host: callback.host,
    displayHost: callback.displayHost,
  };
}

async function rest(path: string, init: RequestInit): Promise<Response> {
  const response = await fetch(restUrl(path), { ...init, cache: "no-store" });
  if (!response.ok) throw new Error(`ai_connections ${response.status}`);
  return response;
}

async function rpc(name: string, args: Record<string, unknown>) {
  const response = await rest(`rpc/${name}`, {method: "POST", headers: serviceHeaders(), body: JSON.stringify(args)});
  const body = await response.text();
  if (!body.trim() && (name === "cancel_ai_connection_pairing" || name === "revoke_ai_connection_pairings")) return null;
  const result = JSON.parse(body);
  if (result?.error) throw new Error("Pairing unavailable");
  return result;
}

export async function POST(request: Request) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return fail(503, "Connecting assistants is not available right now.");
  }
  const token = /^Bearer\s+(\S+)$/i.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) return fail(401, "Sign in to continue.");

  let body: Body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return fail(413, "Request too large.");
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fail(400, "Invalid request.");
    body = parsed as Body;
  } catch {
    return fail(400, "Invalid request.");
  }

  let completionBinding: Record<string, unknown> | null = null;
  let userId: string | null = null;
  try {
    userId = await verifiedUserId(token);
    if (!userId) return fail(401, "Sign in to continue.");
    if ((body.action === "approve" || body.action === "disconnect") && !takeWrite(userId)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    if (["preview", "approve", "pair_start", "pair_status", "pair_cancel"].includes(String(body.action))) {
      if (process.env.AI_CONNECTOR_PAIRING_ENABLED !== "true") return fail(503, "Connecting assistants is not available right now.");
      const sessionId = claimsOf(token)?.session_id;
      if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) return fail(401, "Sign in again to continue.");
      if (typeof body.authorization_id !== "string" || !ID_PATTERN.test(body.authorization_id)) {
        return fail(400, "Invalid request.");
      }
      const binding = {p_user_id: userId, p_session_id: sessionId, p_authorization_id: body.authorization_id};
      if (body.action === "pair_cancel") {
        await rpc("cancel_ai_connection_pairing", binding);
        return NextResponse.json({cancelled: true});
      }
      const verified = await verifiedAuthorization(token, body.authorization_id);
      if (!verified.ok) return fail(verified.status, verified.error);
      const { client } = verified;
      if (body.action === "preview") {
        return NextResponse.json({
          client_name: client.name,
          client_kind: client.kind,
          callback_host: verified.displayHost,
          redirect_uri: verified.redirectUri,
        });
      }
      if (body.action === "pair_start") {
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const code = Array.from({length: 12}, () => alphabet[randomInt(alphabet.length)]).join("");
        const result = await rpc("start_ai_connection_pairing", {...binding, p_client_id: client.client_id, p_client_name: client.name, p_redirect_uri: verified.redirectUri, p_code_hash: createHash("sha256").update(code).digest("hex")});
        if (typeof result?.expires_at !== "string") throw new Error("Invalid pairing response");
        return NextResponse.json({code, expires_at: result.expires_at});
      }
      if (body.action === "pair_status") {
        const result = await rpc("ai_connection_pairing_status", binding);
        if (typeof result?.approved !== "boolean" || typeof result?.expires_at !== "string") throw new Error("Invalid pairing response");
        return NextResponse.json({approved: result.approved, expires_at: result.expires_at});
      }
      completionBinding = binding;
      const row = await rpc("complete_ai_connection_pairing", {...binding, p_client_id: client.client_id, p_redirect_uri: verified.redirectUri});
      if (typeof row?.connection_id !== "string" || !/^[0-9a-f-]{36}$/i.test(row.connection_id) || typeof row.expires_at !== "string") throw new Error("Invalid connection response");
      const approved = await fetch(authUrl(`oauth/authorizations/${body.authorization_id}/consent`), {
        method: "POST",
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
        cache: "no-store",
      });
      if (!approved.ok) throw new Error(`OAuth approval ${approved.status}`);
      const result = await approved.json() as { redirect_url?: unknown };
      if (typeof result.redirect_url !== "string" || !redirectMatchesCallback(result.redirect_url, verified.redirectUri)) {
        throw new Error("OAuth callback mismatch");
      }
      log.info("ai_connection.approved", { client_kind: client.kind });
      return NextResponse.json({ ...row, redirect_url: result.redirect_url });
    }

    if (body.action === "disconnect") {
      if (typeof body.client_id !== "string" || !ID_PATTERN.test(body.client_id)) {
        return fail(400, "Invalid request.");
      }
      await rpc("revoke_ai_connection_pairings", {p_user_id: userId, p_client_id: body.client_id});
      log.info("ai_connection.disconnected", {});
      return NextResponse.json({ disconnected: true });
    }
  } catch {
    if (completionBinding) {
      try { await rpc("cancel_ai_connection_pairing", completionBinding); }
      catch { return fail(503, "The approval could not finish. Open your connections page and disconnect before trying again."); }
    }
    log.error("ai_connection.failed", {});
    return fail(503, "PharmaGuide could not update this connection. Try again shortly.");
  }
  return fail(400, "Invalid request.");
}
