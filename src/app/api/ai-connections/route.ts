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
 * Signed-in account actions only: Supabase Auth verifies the human user.
 * WorkOS standalone login establishes identity before hosted OAuth consent.
 * Later, SQL previews a pending request registered by verified MCP credentials;
 * a separate live phone session approves it through the existing pairing owner.
 * Disconnect closes the local gate, revokes the provider application, then clears
 * the revocation barrier. Provider failure preserves the barrier for retry.
 * Legacy Supabase OAuth remains available only under its existing default-off gate.
 */

const MAX_BODY_BYTES = 1024;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,255}$/;
const takeWrite = createWriteLimiter(10, 60_000);
const ALREADY_CONNECTED =
  "This assistant already has an approval on record. To review or end it, open your connections page, disconnect it, and connect again.";

type Body = { action?: unknown; authorization_id?: unknown; client_id?: unknown; external_auth_id?: unknown };

/** Temporary private qualification uses the verified account and a fixed window. */
function pairingAllowed(userId: string, cancellation = false): boolean {
  if (process.env.AI_CONNECTOR_PAIRING_ENABLED === "true") return true;
  const testUser = process.env.AI_CONNECTOR_TEST_USER_ID;
  if (!testUser || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testUser) || testUser !== userId) return false;
  // Cleanup still needs the existing SQL owner/session checks, but never a live window.
  if (cancellation) return true;
  const start = Date.parse(process.env.AI_CONNECTOR_TEST_STARTED_AT ?? "");
  const end = Date.parse(process.env.AI_CONNECTOR_TEST_EXPIRES_AT ?? "");
  const now = Date.now();
  return Number.isFinite(start) && Number.isFinite(end) && end > start && end - start <= 8 * 60 * 60 * 1000 && now >= start && now < end;
}

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
async function verifiedUserId(token: string): Promise<{id: string; email?: string} | null> {
  const claims = claimsOf(token);
  // An assistant's own OAuth token must never approve or disconnect anything.
  if (!claims || claims.client_id !== undefined || claims.is_anonymous === true) return null;
  const response = await fetch(authUrl("user"), {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = (await response.json()) as { id?: unknown; email?: string; is_anonymous?: boolean };
  return typeof user.id === "string" && user.is_anonymous !== true ? {id: user.id, email: user.email} : null;
}

type Verified =
  | {
      ok: true;
      client: TrustedClient;
      redirectUri: string;
      host: string;
      displayHost: string;
      connectionId?: string;
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
  if (client.redirect_uri && details.redirect_uri !== client.redirect_uri) {
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

function workosIssuer(): string {
  const raw = process.env.WORKOS_ISSUER ?? "";
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.origin !== raw || url.username || url.password) throw new Error("Invalid issuer");
  return raw;
}

async function workos(path: string, init: RequestInit = {}, allowMissing = false) {
  if (!process.env.WORKOS_API_KEY) throw new Error("WorkOS unavailable");
  const response = await fetch(`https://api.workos.com${path}`, {...init, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(10_000),
    headers: {Authorization: `Bearer ${process.env.WORKOS_API_KEY}`, "content-type": "application/json"}});
  if (!response.ok && !(allowMissing && response.status === 404)) throw new Error("WorkOS unavailable");
  return response;
}

/** Account deletion reuses the revocation owner; this sentinel cannot be a client ID. */
async function accountDeletionPending(userId: string): Promise<boolean> {
  const rows = await (await rest(`ai_connection_pairing_limits?user_id=eq.${encodeURIComponent(userId)}&select=revoking_client_id`, {headers: serviceHeaders()})).json();
  if (!Array.isArray(rows) || rows.length > 1) throw new Error("Invalid deletion state");
  const value = rows[0]?.revoking_client_id ?? null;
  if (value === "!".repeat(256)) return true;
  if (value !== null && (typeof value !== "string" || !ID_PATTERN.test(value))) throw new Error("Invalid deletion state");
  return false;
}

async function accountStillExists(userId: string): Promise<boolean> {
  const response = await fetch(authUrl(`admin/users/${encodeURIComponent(userId)}`), {headers: serviceHeaders(), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10_000)});
  if (response.status === 404) return false;
  if (!response.ok) throw new Error("Account verification unavailable");
  const user = await response.json();
  if (user.id !== userId) throw new Error("Account identity mismatch");
  return true;
}

async function removeDeletedAccountIdentity(userId: string) {
  const lookup = await workos(`/user_management/users/external_id/${encodeURIComponent(userId)}`, {}, true);
  if (lookup.status === 404) return;
  const user = await lookup.json();
  if (user.external_id !== userId || typeof user.id !== "string" || !/^user_[A-Za-z0-9]+$/.test(user.id)) throw new Error("Wrong provider user");
  await workos(`/user_management/users/${encodeURIComponent(user.id)}`, {method: "DELETE"}, true);
}

async function workosAuthorization(userId: string, authorizationId: string): Promise<Verified> {
  const pending = await rpc("preview_workos_ai_pairing", {p_user_id: userId, p_authorization_id: authorizationId});
  const completed = typeof pending?.connection_id === "string" && /^[0-9a-f-]{36}$/i.test(pending.connection_id);
  if (!pending || pending.authorization_id !== authorizationId || pending.oauth_issuer !== workosIssuer() ||
      typeof pending.expires_at !== "string" || (!completed && Date.parse(pending.expires_at) <= Date.now()) || !Number.isFinite(Date.parse(pending.expires_at))) throw new Error("Invalid pending approval");
  const client = parseTrustedClients(process.env.AI_CONNECTOR_TRUSTED_CLIENTS).find(c => c.client_id === pending.client_id);
  if (!client || pending.client_name !== client.name || typeof pending.redirect_uri !== "string" ||
      (client.redirect_uri && client.redirect_uri !== pending.redirect_uri)) throw new Error("Untrusted pending approval");
  const callback = verifyCallback(pending.redirect_uri, client.kind);
  if (!callback.ok || callback.host !== pending.callback_host) throw new Error("Invalid destination");
  return {ok: true, client, redirectUri: pending.redirect_uri, host: callback.host, displayHost: callback.displayHost, ...(completed ? {connectionId: pending.connection_id} : {})};
}

async function revokeWorkos(userId: string, clientId: string) {
  const user = await (await workos(`/user_management/users/external_id/${encodeURIComponent(userId)}`)).json();
  if (typeof user.id !== "string" || !ID_PATTERN.test(user.id) || user.external_id !== userId) throw new Error("Wrong provider user");
  const base = `/user_management/users/${encodeURIComponent(user.id)}/authorized_applications`;
  const ids = new Set<string>();
  const cursors = new Set<string>();
  let after: string | null = null;
  do {
    const page = await (await workos(`${base}?limit=100${after ? `&after=${encodeURIComponent(after)}` : ""}`)).json();
    if (!Array.isArray(page.data) || !page.list_metadata) throw new Error("Invalid application list");
    for (const row of page.data) {
      if (row.application?.client_id === clientId) {
        if (typeof row.application.id !== "string" || !ID_PATTERN.test(row.application.id)) throw new Error("Invalid application");
        ids.add(row.application.id);
      }
    }
    after = page.list_metadata.after ?? null;
    if (after !== null && (typeof after !== "string" || cursors.has(after))) throw new Error("Invalid pagination");
    if (after) cursors.add(after);
  } while (after);
  for (const id of ids) await workos(`${base}/${encodeURIComponent(id)}`, {method: "DELETE"});
}

/** Begin/cancel RPCs establish the local barrier before this provider phase. */
async function finishWorkosRevocation(userId: string, clientId: string, generation: number) {
  if (!Number.isSafeInteger(generation)) throw new Error("Invalid revocation generation");
  try {
    await revokeWorkos(userId, clientId);
    const finished = await rpc("finish_ai_connection_revocation", {
      p_user_id: userId, p_client_id: clientId, p_expected_generation: generation,
    });
    if (finished?.finished !== true) throw new Error("Revocation not finished");
  } catch {
    return NextResponse.json({provider_handled: true, local_access_ended: true,
      error: "PharmaGuide access has ended. Provider disconnect is unfinished; open Your connections and retry Disconnect before connecting again."}, {status: 503});
  }
  return NextResponse.json({disconnected: true, cancelled: true, provider_handled: true});
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
    const user = await verifiedUserId(token);
    userId = user?.id ?? null;
    if (!userId || !user) return fail(401, "Sign in to continue.");
    if ((body.action === "approve" || body.action === "disconnect" || body.action === "workos_login") && !takeWrite(userId)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
    if (body.action === "workos_login") {
      if (!pairingAllowed(userId) || !process.env.WORKOS_ISSUER) return fail(503, "Connecting assistants is not available right now.");
      const issuer = workosIssuer();
      if (typeof body.external_auth_id !== "string" || !ID_PATTERN.test(body.external_auth_id)) return fail(400, "Invalid request.");
      if (!/^[0-9a-f-]{36}$/i.test(user.id) || !user.email) return fail(401, "Sign in again to continue.");
      if (await accountDeletionPending(user.id)) return fail(409, "Account deletion is in progress. Connecting is unavailable.");
      let result: {redirect_uri: string};
      try {
        result = await (await workos("/authkit/oauth2/complete", {method: "POST", body: JSON.stringify({external_auth_id: body.external_auth_id, user: {id: user.id, email: user.email}})})).json();
      } catch {
        log.error("ai_connection.identity_completion_unconfirmed", {});
        return fail(503, "Sign-in completion could not be confirmed. If you are deleting your account, contact support to confirm provider cleanup.");
      }
      // Recheck after provisioning: deletion can start while WorkOS is in flight.
      // An ambiguous provider timeout still requires operator reconciliation;
      // these checks never restore the local revoked access.
      const deleting = await accountDeletionPending(user.id);
      const exists = await accountStillExists(user.id);
      if (deleting || !exists) {
        try { await removeDeletedAccountIdentity(user.id); }
        catch {
          log.error("ai_connection.identity_cleanup_failed", {});
          return fail(503, "Account deletion is in progress, but provider cleanup could not be confirmed. Contact support before trying again.");
        }
        return fail(409, "This account is being deleted. Connecting is unavailable.");
      }
      if (!pairingAllowed(userId)) return fail(503, "This private connection window has ended. Contact the operator to continue.");
      const redirect = new URL(result.redirect_uri);
      if (redirect.origin !== issuer || !["/oauth/authorize/complete", "/application-authorization", "/oauth2/external/callback"].includes(redirect.pathname) || redirect.username || redirect.password || redirect.hash) throw new Error("Invalid hosted redirect");
      return NextResponse.json({redirect_uri: redirect.href});
    }
    if (["preview", "approve", "pair_start", "pair_status", "pair_cancel"].includes(String(body.action))) {
      if (!pairingAllowed(userId, body.action === "pair_cancel")) return fail(503, "Connecting assistants is not available right now.");
      const sessionId = claimsOf(token)?.session_id;
      if (typeof sessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(sessionId)) return fail(401, "Sign in again to continue.");
      if (typeof body.authorization_id !== "string" || !ID_PATTERN.test(body.authorization_id)) {
        return fail(400, "Invalid request.");
      }
      const binding = {p_user_id: userId, p_session_id: sessionId, p_authorization_id: body.authorization_id};
      if (body.action === "pair_cancel") {
        const cancelled = await rpc("cancel_ai_connection_pairing", binding);
        if (process.env.WORKOS_ISSUER && cancelled?.cancelled !== true) throw new Error("Invalid cancellation response");
        // SQL atomically distinguishes this setup's authority from an existing
        // connection reused by a repeat setup. Never revoke the latter here.
        if (process.env.WORKOS_ISSUER && cancelled?.revocation_generation !== undefined) {
          workosIssuer();
          if (typeof cancelled.client_id !== "string" || !ID_PATTERN.test(cancelled.client_id)) throw new Error("Invalid cancellation client");
          return finishWorkosRevocation(userId, cancelled.client_id, cancelled.revocation_generation);
        }
        return NextResponse.json({cancelled: true});
      }
      const verified = (process.env.WORKOS_ISSUER ? await workosAuthorization(userId, body.authorization_id) : await verifiedAuthorization(token, body.authorization_id));
      if (!verified.ok) return fail(verified.status, verified.error);
      const { client } = verified;
      if (body.action === "preview") {
        if (verified.connectionId) {
          const status = await rpc("ai_connection_pairing_status", binding);
          if (status?.approved !== true || status.connection_id !== verified.connectionId) throw new Error("Invalid completed request");
        }
        return NextResponse.json({
          connected: Boolean(verified.connectionId),
          oauth_issuer: process.env.WORKOS_ISSUER ? workosIssuer() : null,
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
        if (result.connection_id !== undefined && (typeof result.connection_id !== "string" || !/^[0-9a-f-]{36}$/i.test(result.connection_id) || result.approved !== true || (verified.connectionId && result.connection_id !== verified.connectionId))) throw new Error("Invalid completed pairing");
        return NextResponse.json({approved: result.approved, expires_at: result.expires_at, ...(result.connection_id ? {connection_id: result.connection_id} : {})});
      }
      completionBinding = binding;
      const row = await rpc("complete_ai_connection_pairing", {...binding, p_client_id: client.client_id, p_redirect_uri: verified.redirectUri});
      if (typeof row?.connection_id !== "string" || !/^[0-9a-f-]{36}$/i.test(row.connection_id) || (process.env.WORKOS_ISSUER ? row.expires_at !== null || row.oauth_issuer !== workosIssuer() : typeof row.expires_at !== "string")) throw new Error("Invalid connection response");
      if (process.env.WORKOS_ISSUER) return NextResponse.json({connection_id: row.connection_id, expires_at: null, oauth_issuer: row.oauth_issuer});
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

    if (body.action === "revocation_status") {
      if (!process.env.WORKOS_ISSUER) return NextResponse.json({client_id: null});
      workosIssuer();
      const rows = await (await rest(`ai_connection_pairing_limits?user_id=eq.${encodeURIComponent(userId)}&select=revoking_client_id`, {headers: serviceHeaders()})).json();
      if (!Array.isArray(rows) || rows.length > 1) throw new Error("Invalid revocation status");
      const clientId = rows[0]?.revoking_client_id ?? null;
      if (clientId !== null && (typeof clientId !== "string" || !ID_PATTERN.test(clientId))) throw new Error("Invalid revocation client");
      return NextResponse.json({client_id: clientId});
    }

    if (body.action === "disconnect") {
      if (typeof body.client_id !== "string" || !ID_PATTERN.test(body.client_id)) {
        return fail(400, "Invalid request.");
      }
      if (process.env.WORKOS_ISSUER) {
        workosIssuer();
        const args = {p_user_id: userId, p_client_id: body.client_id};
        const begun = await rpc("begin_ai_connection_revocation", args);
        return finishWorkosRevocation(userId, body.client_id, begun?.generation);
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
