/**
 * AI connector consent rules shared by the consent page, the connections page
 * and /api/ai-connections. Pure functions only, so the same rules run in the
 * browser, on the server and in tests (tests/ai-connector.test.cjs).
 *
 * S3: only pre-registered assistants are approved, and only with their exact
 * callback. S4: the consent card names the destination, what is shared, for
 * how long, the three places the data ends up, and how to disconnect.
 * Threat model: PharmaGuide app repo, docs/security/ai-connector-threat-model.md.
 */

export type AssistantKind = "claude" | "chatgpt" | "claude_code" | "codex";

export type TrustedClient = {
  /** Supabase OAuth client id, from the dashboard registration. */
  client_id: string;
  /** The name PharmaGuide shows, never the name the client registered itself. */
  name: string;
  kind: AssistantKind;
  redirect_uri?: string;
};

/** Default connection length. Expiry ends access; the user approves again. */
export const CONNECTION_HOURS = 24;
/** The only category this phase can grant. Medications are never included. */
export const CONNECTION_SCOPE = { categories: ["supplements"] } as const;
export const CONNECTIONS_PATH = "/account/connections";

const KINDS: readonly AssistantKind[] = ["claude", "chatgpt", "claude_code", "codex"];
const CHATGPT_CALLBACK_ID = /^\/connector\/oauth\/[A-Za-z0-9_-]{1,128}$/;

/**
 * Reads AI_CONNECTOR_TRUSTED_CLIENTS: a JSON array of
 * {"client_id", "name", "kind"}. Anything malformed is dropped, so a typo
 * approves nothing rather than everything.
 */
export function parseTrustedClients(raw: string | undefined): TrustedClient[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((entry): TrustedClient[] => {
    if (!entry || typeof entry !== "object") return [];
    const { client_id, name, kind, redirect_uri } = entry as Record<string, unknown>;
    if (typeof client_id !== "string" || client_id.trim() === "") return [];
    if (typeof name !== "string" || name.trim() === "") return [];
    if (typeof kind !== "string" || !KINDS.includes(kind as AssistantKind)) return [];
    if (kind === "codex" && typeof redirect_uri !== "string") return [];
    if (redirect_uri !== undefined && (typeof redirect_uri !== "string" || !verifyCallback(redirect_uri, kind as AssistantKind).ok)) return [];
    return [{ client_id, name: name.trim(), kind: kind as AssistantKind, ...(typeof redirect_uri === "string" ? {redirect_uri} : {}) }];
  });
}

export type CallbackCheck =
  | { ok: true; host: string; displayHost: string }
  | { ok: false; reason: string };

const REFUSED: CallbackCheck = {
  ok: false,
  reason: "PharmaGuide does not recognise where this assistant wants to send you.",
};

/**
 * S3 allowlist. Claude: https://claude.ai/api/mcp/auth_callback. ChatGPT:
 * https://chatgpt.com/connector_platform_oauth_redirect or
 * https://chatgpt.com/connector/oauth/{id}. Loopback (localhost, 127.0.0.1,
 * any port, path /callback) only for the Claude Code client.
 */
export function verifyCallback(redirectUri: string, kind: AssistantKind): CallbackCheck {
  let url: URL;
  try {
    url = new URL(redirectUri);
  } catch {
    return REFUSED;
  }
  if (url.username || url.password || url.hash || url.search) return REFUSED;
  if (kind === "codex") {
    // Codex MCP native callback (rmcp-client/oauth_callback.rs), not account login.
    if (url.protocol !== "http:" || url.hostname !== "127.0.0.1" || url.search ||
        !/^\/callback\/[A-Za-z0-9_-]{1,128}$/.test(url.pathname) || redirectUri.includes("..")) return REFUSED;
    return {ok: true, host: url.hostname, displayHost: `${url.hostname} (this computer)`};
  }
  if (kind === "claude_code") {
    const loopback = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "http:" || !loopback || url.pathname !== "/callback") return REFUSED;
    return { ok: true, host: url.hostname, displayHost: `${url.hostname} (this computer)` };
  }
  if (url.protocol !== "https:" || url.port !== "") return REFUSED;
  if (kind === "claude") {
    if (url.hostname !== "claude.ai" || url.pathname !== "/api/mcp/auth_callback") return REFUSED;
  } else {
    const path = url.pathname;
    if (url.hostname !== "chatgpt.com") return REFUSED;
    if (path !== "/connector_platform_oauth_redirect" && !CHATGPT_CALLBACK_ID.test(path)) {
      return REFUSED;
    }
  }
  return { ok: true, host: url.hostname, displayHost: url.hostname };
}

/**
 * The redirect Supabase returns after approval must go to the callback the
 * user saw: same origin and path, with only query parameters added.
 */
export function redirectMatchesCallback(redirectUrl: string, callback: string): boolean {
  try {
    const actual = new URL(redirectUrl);
    const expected = new URL(callback);
    return actual.origin === expected.origin && actual.pathname === expected.pathname && !actual.hash;
  } catch {
    return false;
  }
}

/**
 * In-memory sliding-window limit per key (per server instance). Returns a
 * take(key, now) that is false once `limit` writes fell inside `windowMs`.
 */
export function createWriteLimiter(limit = 10, windowMs = 60_000, maxKeys = 10_000) {
  const hits = new Map<string, number[]>();
  return function take(key: string, now: number = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
    hits.delete(key);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > maxKeys) hits.delete(hits.keys().next().value as string);
    return true;
  };
}

export function connectionExpiry(now: Date): Date {
  return new Date(now.getTime() + CONNECTION_HOURS * 60 * 60 * 1000);
}

/** S4 consent copy. Calm and specific; never a safety verdict. */
export function consentCopy(clientName: string, durable = false) {
  return {
    title: `Connect ${clientName} to PharmaGuide`,
    destinationLabel: durable ? "Configured assistant destination" : "Approving returns you to",
    categoriesHeading: "What it can see",
    categoriesIncluded: "Your supplement list and PharmaGuide product facts.",
    categoriesExcluded: "Medications and your health profile are not included.",
    durationHeading: "How long",
    duration: durable ? "Until you disconnect. Additional information you allow in Access settings has its own access end time." : `${CONNECTION_HOURS} hours. After that, ${clientName} needs your approval again.`,
    locationsHeading: "Where your supplement list goes",
    locations: [
      {
        label: "Stored by PharmaGuide",
        detail:
          "Your supplement list, as it already is while you are signed in, plus a record of this connection and when the assistant used it. No conversation contents.",
      },
      {
        label: `Sent to ${clientName}`,
        detail: `Your supplement list, each time ${clientName} asks for it while this connection lasts.`,
      },
      {
        label: `Kept in ${clientName}'s chat history`,
        detail: `What ${clientName} receives stays in that chat under ${clientName}'s own policies. Disconnecting ends future access but cannot erase what is already there.`,
      },
    ],
    revocation: "You can disconnect at any time from your PharmaGuide connections page.",
    approve: "Approve",
    deny: "Deny",
  };
}

export const CONNECTIONS_COPY = {
  title: "Connected AI assistants",
  intro:
    "These assistants can read your supplement list while their connection lasts. In the app, open an assistant’s Access settings, choose any additional information to allow, and tap Save. Saving uploads a separate copy of that selected information with its own access end time. Medications and profile details are included only when you select them.",
  empty: "No assistants are connected.",
  disconnect: "Disconnect",
  disconnected: "Disconnected. The assistant can no longer read your supplement list.",
  chatHistoryNote:
    "Disconnecting cannot erase what an assistant already received; that stays in its chat history under its own policies.",
} as const;
