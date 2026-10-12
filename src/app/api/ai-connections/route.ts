import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import {
  CONNECTION_SCOPE,
  type TrustedClient,
  connectionExpiry,
  parseTrustedClients,
  verifyCallback,
} from "@/lib/ai-connector";

/**
 * POST /api/ai-connections — the server half of the AI connector consent.
 *
 *   preview    → verified client name and callback host for the consent card
 *   approve    → writes the ai_connections row (S10), then the page approves
 *   disconnect → marks the user's connection to one assistant revoked and
 *                deletes its access-log rows (S5); the page then revokes the grant
 *
 * The caller is the signed-in user (Authorization: Bearer <session token>).
 * user_id always comes from Supabase Auth, the client and callback always
 * come from Supabase's own authorization record, and an AI assistant's OAuth
 * token is refused outright. Writes use the service role, server-only.
 */

const MAX_BODY_BYTES = 1024;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,255}$/;

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
  if (!claims || claims.client_id !== undefined) return null;
  const response = await fetch(authUrl("user"), {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = (await response.json()) as { id?: unknown };
  return typeof user.id === "string" ? user.id : null;
}

type Verified =
  | { ok: true; client: TrustedClient; redirectUri: string; displayHost: string }
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
  if (typeof details.redirect_uri !== "string" || typeof details.client?.id !== "string") {
    return { ok: false, status: 409, error: "This assistant already has an approval on record." };
  }
  const clientId = details.client.id;
  const client = parseTrustedClients(process.env.AI_CONNECTOR_TRUSTED_CLIENTS).find(
    (c) => c.client_id === clientId
  );
  if (!client) {
    return { ok: false, status: 403, error: "PharmaGuide does not recognise this assistant." };
  }
  const callback = verifyCallback(details.redirect_uri, client.kind);
  if (!callback.ok) return { ok: false, status: 403, error: callback.reason };
  return { ok: true, client, redirectUri: details.redirect_uri, displayHost: callback.displayHost };
}

async function rest(path: string, init: RequestInit): Promise<Response> {
  const response = await fetch(restUrl(path), { ...init, cache: "no-store" });
  if (!response.ok) throw new Error(`ai_connections ${response.status}`);
  return response;
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
    body = JSON.parse(text) as Body;
  } catch {
    return fail(400, "Invalid request.");
  }

  const userId = await verifiedUserId(token);
  if (!userId) return fail(401, "Sign in to continue.");

  try {
    if (body.action === "preview" || body.action === "approve") {
      if (typeof body.authorization_id !== "string" || !ID_PATTERN.test(body.authorization_id)) {
        return fail(400, "Invalid request.");
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
      const now = new Date();
      const owner = `user_id=eq.${userId}&client_id=eq.${encodeURIComponent(client.client_id)}`;
      // A new approval supersedes the previous live connection to this assistant.
      await rest(`ai_connections?${owner}&status=eq.active`, {
        method: "PATCH",
        headers: serviceHeaders({ Prefer: "return=minimal" }),
        body: JSON.stringify({ status: "revoked", revoked_at: now.toISOString() }),
      });
      const created = await rest("ai_connections?select=connection_id,expires_at", {
        method: "POST",
        headers: serviceHeaders({ Prefer: "return=representation" }),
        body: JSON.stringify({
          user_id: userId,
          client_id: client.client_id,
          scope: CONNECTION_SCOPE,
          status: "active",
          expires_at: connectionExpiry(now).toISOString(),
        }),
      });
      const [row] = (await created.json()) as Array<{ connection_id: string; expires_at: string }>;
      log.info("ai_connection.approved", { client_kind: client.kind });
      return NextResponse.json(row ?? {});
    }

    if (body.action === "disconnect") {
      if (typeof body.client_id !== "string" || !ID_PATTERN.test(body.client_id)) {
        return fail(400, "Invalid request.");
      }
      const owner = `user_id=eq.${userId}&client_id=eq.${encodeURIComponent(body.client_id)}`;
      const ended = await rest(`ai_connections?${owner}&status=eq.active&select=connection_id`, {
        method: "PATCH",
        headers: serviceHeaders({ Prefer: "return=representation" }),
        body: JSON.stringify({ status: "revoked", revoked_at: new Date().toISOString() }),
      });
      const all = await rest(`ai_connections?${owner}&select=connection_id`, {
        method: "GET",
        headers: serviceHeaders(),
      });
      const ids = ((await all.json()) as Array<{ connection_id: string }>).map((r) => r.connection_id);
      if (ids.length > 0) {
        await rest(`mcp_access_log?connection_id=in.(${ids.join(",")})`, {
          method: "DELETE",
          headers: serviceHeaders({ Prefer: "return=minimal" }),
        });
      }
      const endedCount = ((await ended.json()) as unknown[]).length;
      log.info("ai_connection.disconnected", { ended: endedCount });
      return NextResponse.json({ disconnected: true });
    }
  } catch (error) {
    log.error("ai_connection.failed", { message: error instanceof Error ? error.message : "unknown" });
    return fail(503, "PharmaGuide could not update this connection. Try again shortly.");
  }
  return fail(400, "Invalid request.");
}
