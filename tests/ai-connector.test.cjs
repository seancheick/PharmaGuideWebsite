const test = require("node:test");
const assert = require("node:assert/strict");

const {
  CONNECTION_HOURS,
  CONNECTION_SCOPE,
  CONNECTIONS_COPY,
  connectionExpiry,
  consentCopy,
  createWriteLimiter,
  parseTrustedClients,
  redirectMatchesCallback,
  verifyCallback,
} = require("../.tmp/ai-connector-test-build/src/lib/ai-connector.js");

// S3: callback-host allowlist ------------------------------------------------

test("Claude is accepted only at its exact callback", () => {
  assert.deepEqual(verifyCallback("https://claude.ai/api/mcp/auth_callback", "claude"), {
    ok: true,
    host: "claude.ai",
    displayHost: "claude.ai",
  });
  for (const uri of [
    "http://claude.ai/api/mcp/auth_callback",
    "https://claude.ai.evil.com/api/mcp/auth_callback",
    "https://evil.claude.ai/api/mcp/auth_callback",
    "https://claude.ai/api/mcp/other",
    "https://claude.ai:8443/api/mcp/auth_callback",
    "https://user@claude.ai/api/mcp/auth_callback",
    "https://claude.ai/api/mcp/auth_callback#frag",
    "https://chatgpt.com/connector_platform_oauth_redirect",
    "not a url",
  ]) {
    assert.equal(verifyCallback(uri, "claude").ok, false, uri);
  }
});

test("ChatGPT is accepted at either documented callback", () => {
  assert.equal(verifyCallback("https://chatgpt.com/connector_platform_oauth_redirect", "chatgpt").ok, true);
  assert.equal(verifyCallback("https://chatgpt.com/connector/oauth/abc_123-XYZ", "chatgpt").ok, true);
  for (const uri of [
    "https://chatgpt.com/connector/oauth/",
    "https://chatgpt.com/connector/oauth/a/b",
    "https://chat.openai.com/connector_platform_oauth_redirect",
    "https://chatgpt.com.evil.io/connector_platform_oauth_redirect",
  ]) {
    assert.equal(verifyCallback(uri, "chatgpt").ok, false, uri);
  }
});

test("loopback is accepted only for Claude Code, on any port", () => {
  assert.equal(verifyCallback("http://localhost:53682/callback", "claude_code").ok, true);
  assert.equal(verifyCallback("http://127.0.0.1/callback", "claude_code").ok, true);
  assert.equal(verifyCallback("http://localhost:53682/callback", "claude_code").displayHost, "localhost (this computer)");
  assert.equal(verifyCallback("http://localhost/callback", "claude").ok, false);
  assert.equal(verifyCallback("http://127.0.0.1/callback", "chatgpt").ok, false);
  assert.equal(verifyCallback("http://localhost.evil.com/callback", "claude_code").ok, false);
  assert.equal(verifyCallback("https://localhost/callback", "claude_code").ok, false);
  assert.equal(verifyCallback("http://localhost/other", "claude_code").ok, false);
  assert.equal(verifyCallback("https://claude.ai/api/mcp/auth_callback", "claude_code").ok, false);
});

test("only well-formed trusted clients are kept", () => {
  const clients = parseTrustedClients(
    JSON.stringify([
      { client_id: "c1", name: "Claude", kind: "claude" },
      { client_id: "c2", name: "ChatGPT", kind: "chatgpt" },
      { client_id: "", name: "Blank", kind: "claude" },
      { client_id: "c3", name: "Other", kind: "gemini" },
      "junk",
    ])
  );
  assert.deepEqual(
    clients.map((c) => c.client_id),
    ["c1", "c2"]
  );
  assert.deepEqual(parseTrustedClients("not json"), []);
  assert.deepEqual(parseTrustedClients(undefined), []);
  assert.deepEqual(parseTrustedClients('{"client_id":"c1"}'), []);
});

test("the post-approval redirect must return to the approved callback", () => {
  const callback = "https://claude.ai/api/mcp/auth_callback";
  assert.equal(redirectMatchesCallback(`${callback}?code=abc&state=xyz`, callback), true);
  assert.equal(redirectMatchesCallback("https://evil.example/api/mcp/auth_callback?code=abc", callback), false);
  assert.equal(redirectMatchesCallback("https://claude.ai/elsewhere?code=abc", callback), false);
  assert.equal(redirectMatchesCallback("javascript:alert(1)", callback), false);
});

test("connections last 24 hours and grant supplements only", () => {
  assert.equal(CONNECTION_HOURS, 24);
  const now = new Date("2026-10-12T12:00:00Z");
  assert.equal(connectionExpiry(now).toISOString(), "2026-10-13T12:00:00.000Z");
  assert.deepEqual(CONNECTION_SCOPE, { categories: ["supplements"] });
});

// S4: consent copy ------------------------------------------------------------

function allStrings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}

test("consent copy names categories, exclusions, duration, three locations and revocation", () => {
  const copy = consentCopy("Claude");
  assert.equal(copy.title, "Connect Claude to PharmaGuide");
  assert.match(copy.categoriesIncluded, /supplement list/);
  assert.match(copy.categoriesExcluded, /Medications and your health profile are not included/);
  assert.match(copy.duration, /24 hours/);
  assert.deepEqual(
    copy.locations.map((l) => l.label),
    ["Stored by PharmaGuide", "Sent to Claude", "Kept in Claude's chat history"]
  );
  assert.match(copy.locations[2].detail, /cannot erase/);
  assert.match(copy.revocation, /connections page/);
  assert.equal(copy.deny, "Deny");
});

test("copy is calm-advisory and never offers a safety verdict", () => {
  const strings = [...allStrings(consentCopy("ChatGPT")), ...allStrings(CONNECTIONS_COPY)];
  assert.ok(strings.length > 10);
  for (const text of strings) {
    assert.doesNotMatch(text, /\b(Stop|Avoid|Do not)\b/, text);
    assert.doesNotMatch(text, /\bsafe\b/i, text);
    assert.notEqual(text, text.toUpperCase(), `all caps: ${text}`);
  }
});

// Reconnect after a revoked or expired connection -----------------------------

const TRUSTED = [
  { client_id: "c-claude", name: "Claude", kind: "claude" },
  { client_id: "c-chatgpt", name: "ChatGPT", kind: "chatgpt" },
  { client_id: "c-code", name: "Claude Code", kind: "claude_code" },
];

// Rate limit on /api/ai-connections writes ------------------------------------

test("writes are limited per user within a sliding minute", () => {
  const take = createWriteLimiter(3, 60_000);
  const t0 = 1_000_000;
  assert.equal(take("u1", t0), true);
  assert.equal(take("u1", t0 + 1), true);
  assert.equal(take("u1", t0 + 2), true);
  assert.equal(take("u1", t0 + 3), false, "fourth write in the minute");
  assert.equal(take("u2", t0 + 3), true, "other users unaffected");
  assert.equal(take("u1", t0 + 60_001), true, "window slides");
});

test("the limiter forgets the oldest users past its key cap", () => {
  const take = createWriteLimiter(1, 60_000, 2);
  assert.equal(take("a", 0), true);
  assert.equal(take("b", 0), true);
  assert.equal(take("c", 0), true);
  assert.equal(take("a", 1), true, "a was evicted");
});

// Execute the real route and client components with isolated network/hooks.
// No production test exports; TypeScript imports are substituted at the boundary.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const connector = require("../.tmp/ai-connector-test-build/src/lib/ai-connector.js");
function loadSource(relative, mocks, fetchFn) {
  const filename = path.resolve(__dirname, "..", relative);
  const instance = new Module(filename, module);
  instance.filename = filename;
  instance.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = instance.require.bind(instance);
  instance.require = (name) => Object.hasOwn(mocks, name) ? mocks[name] : original(name);
  instance.testFetch = fetchFn;
  instance.testProcess = { env: { AI_CONNECTOR_TRUSTED_CLIENTS: JSON.stringify(TRUSTED) } };
  instance.testWindow = { location: { assign: (url) => { instance.redirect = url; } } };
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  instance._compile("const fetch = module.testFetch; const process = module.testProcess; const window = module.testWindow;\n" + compiled, filename);
  return instance;
}
const sessionToken = `header.${Buffer.from(JSON.stringify({ sub: "user-1" })).toString("base64url")}.signature`;
const response = (value, status = 200) => Response.json(value, { status });
function routeHarness(overrides = {}) {
  const calls = [];
  const fetchFn = async (url, init = {}) => {
    calls.push({ url, ...init });
    if (overrides.fetch) return overrides.fetch(url, init);
    if (url.endsWith("/auth/v1/user")) {
      if (overrides.authThrows) throw new Error("network unavailable");
      return response({ id: "user-1" });
    }
    if (url.includes("/oauth/authorizations/") && !url.endsWith("/consent")) {
      return response(overrides.details ?? { client: { id: "c-claude" }, redirect_uri: "https://claude.ai/api/mcp/auth_callback" });
    }
    if (url.endsWith("/consent")) return response(overrides.consent ?? { redirect_url: "https://claude.ai/api/mcp/auth_callback?code=approved" }, overrides.consentStatus ?? 200);
    if (init.method === "POST") return response([{ connection_id: JSON.parse(init.body).connection_id, expires_at: "2026-10-14T12:00:00Z" }]);
    return response([]);
  };
  const route = loadSource("src/app/api/ai-connections/route.ts", {
    "next/server": { NextResponse: { json: (value, options = {}) => response(value, options.status ?? 200) } },
    "@/lib/env": { env: { SUPABASE_URL: "https://project.test", SUPABASE_SERVICE_ROLE_KEY: "fixture-service-key" } },
    "@/lib/logger": { log: { info() {}, error() {} } },
    "@/lib/ai-connector": connector,
  }, fetchFn);
  // Match NextResponse.json's options form.
  route.testFetch = fetchFn;
  return { calls, post: (body) => route.exports.POST(new Request("https://site.test/api/ai-connections", {
    method: "POST", headers: { authorization: `Bearer ${sessionToken}` }, body: JSON.stringify(body),
  })) };
}

test("route refuses redirect-only authorization without attributing it to a callback-sharing client", async () => {
  const h = routeHarness({ details: { redirect_url: "https://claude.ai/api/mcp/auth_callback?code=untrusted" } });
  const result = await h.post({ action: "approve", authorization_id: "authorization-1" });
  assert.equal(result.status, 409);
  assert.equal(h.calls.some((c) => c.url.includes("/rest/v1/") && c.method === "POST"), false);
});

test("route rejects non-object JSON and handles auth network failures", async () => {
  for (const body of [null, [], "approve"]) {
    assert.equal((await routeHarness().post(body)).status, 400);
  }
  const result = await routeHarness({ authThrows: true }).post({ action: "preview", authorization_id: "authorization-1" });
  assert.equal(result.status, 503);
});

test("approval returns only a checked OAuth redirect and rolls its row back on consent failure", async () => {
  for (const options of [{ consentStatus: 500 }, { consent: { redirect_url: "https://evil.test/callback" } }]) {
    const h = routeHarness(options);
    const result = await h.post({ action: "approve", authorization_id: "authorization-1" });
    assert.equal(result.status, 503);
    assert.ok(h.calls.some((c) => c.url.includes("connection_id=eq.") && c.method === "PATCH" && JSON.parse(c.body).status === "revoked"));
  }
  const h = routeHarness();
  const result = await h.post({ action: "approve", authorization_id: "authorization-1" });
  assert.equal(result.status, 200);
  assert.equal((await result.json()).redirect_url, "https://claude.ai/api/mcp/auth_callback?code=approved");
});

async function flush() { for (let i = 0; i < 8; i++) await new Promise(setImmediate); }
function clientHarness(relative, supabase, fetchFn = async () => response({})) {
  const states = [];
  const effects = [];
  let cursor = 0;
  let mounted = false;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (next) => { states[index] = typeof next === "function" ? next(states[index]) : next; }];
    },
    useCallback(fn) { return fn; },
    useEffect(fn) { if (!mounted) effects.push(fn); },
  };
  const loaded = loadSource(relative, {
    react,
    "next/link": { __esModule: true, default: "a" },
    "next/navigation": { useSearchParams: () => new URLSearchParams("authorization_id=authorization-1") },
    "@/components/ai-connector/SignInPanel": { SignInPanel: "signin" },
    "@/lib/ai-connector": connector,
    "@/lib/supabase-browser": { browserSupabase: () => supabase },
  }, fetchFn);
  function render() { cursor = 0; return loaded.exports.default(); }
  return { states, render, async start() { render(); mounted = true; effects.forEach((fn) => fn()); await flush(); } };
}
function fakeSupabase(options = {}) {
  let grants = options.grants ?? [];
  return {
    auth: {
      getSession: async () => ({ data: { session: { access_token: sessionToken } } }),
      oauth: {
        listGrants: async () => ({ data: grants, error: null }),
        revokeGrant: async () => { grants = []; return { error: null }; },
        getAuthorizationDetails: async () => { throw new Error("browser must not read authorization a second time"); },
      },
    },
    from: () => ({ select: () => ({ order: async () => ({ data: options.rows ?? [], error: options.rowsError ?? null }) }) }),
  };
}
function buttons(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(buttons);
  return [...(node.type === "button" ? [node] : []), ...buttons(node.props?.children)];
}

test("connections retain stored grants after OAuth removal and expose database read failures", async () => {
  const rows = [{ client_id: "c-claude", client_name: "Claude", status: "active", expires_at: "2099-01-01T00:00:00Z" }];
  const h = clientHarness("src/app/account/connections/connections-client.tsx", fakeSupabase({ rows }));
  await h.start();
  assert.equal(h.states[0].kind, "list");
  assert.deepEqual(h.states[0].grants.map((g) => g.clientId), ["c-claude"]);
  const failed = clientHarness("src/app/account/connections/connections-client.tsx", fakeSupabase({ rowsError: { message: "db unavailable" } }));
  await failed.start();
  assert.equal(failed.states[0].kind, "message");
  assert.match(failed.states[0].text, /could not be loaded/);
});

test("consent uses server preview once and recovers a failed approval request", async () => {
  let calls = 0;
  const h = clientHarness("src/app/oauth/authorize/consent-client.tsx", fakeSupabase(), async () => {
    calls++;
    if (calls > 1) throw new Error("offline");
    return response({ client_name: "Claude", callback_host: "claude.ai", redirect_uri: "https://claude.ai/api/mcp/auth_callback" });
  });
  await h.start();
  assert.equal(h.states[0].kind, "consent");
  buttons(h.render())[0].props.onClick();
  await flush();
  assert.equal(h.states[0].busy, false);
  assert.match(h.states[0].error, /could not|unavailable|again/);
});

test("disconnect remains retryable when revoking the database grant fails", async () => {
  const rows = [{ client_id: "c-claude", client_name: "Claude", status: "active", expires_at: "2099-01-01T00:00:00Z" }];
  const supabase = fakeSupabase({ rows, grants: [{ client: { id: "c-claude", name: "Claude" }, granted_at: "2026-10-13" }] });
  const h = clientHarness("src/app/account/connections/connections-client.tsx", supabase, async () => { throw new Error("offline"); });
  await h.start();
  buttons(h.render())[0].props.onClick();
  await flush();
  assert.equal(h.states[0].kind, "list");
  assert.deepEqual(h.states[0].grants.map((g) => g.clientId), ["c-claude"]);
  assert.match(h.states[0].notice, /could not finish/);
});

test("approval creates the grant before Auth creates its OAuth session", async () => {
  const h = routeHarness();
  assert.equal((await h.post({ action: "approve", authorization_id: "authorization-1" })).status, 200);
  const insert = h.calls.findIndex((c) => c.url.includes("/rest/v1/ai_connections") && c.method === "POST");
  const consent = h.calls.findIndex((c) => c.url.endsWith("/consent"));
  assert.ok(insert >= 0 && consent > insert, "authoritative session age must follow consent row creation");
});

test("a lost insert response rolls back the known attempted id and rollback failure names recovery", async () => {
  for (const rollbackFails of [false, true]) {
    const calls = [];
    let attemptedId;
    const h = routeHarness({ fetch: async (url, init = {}) => {
      calls.push({ url, ...init });
      if (url.endsWith("/user")) return response({ id: "user-1" });
      if (url.includes("/oauth/authorizations/")) return response({ client: { id: "c-claude" }, redirect_uri: "https://claude.ai/api/mcp/auth_callback" });
      if (init.method === "POST") {
        attemptedId = JSON.parse(init.body).connection_id;
        throw new Error("insert response lost");
      }
      if (url.includes("connection_id=eq.") && rollbackFails) return response({}, 503);
      return response([]);
    } });
    const result = await h.post({ action: "approve", authorization_id: "authorization-1" });
    assert.equal(result.status, 503);
    assert.ok(attemptedId);
    assert.ok(calls.some((c) => c.url.includes(`connection_id=eq.${attemptedId}`) && c.url.includes("user_id=eq.user-1") && JSON.parse(c.body).status === "revoked"));
    if (rollbackFails) assert.match((await result.json()).error, /connections page and disconnect/);
  }
});

test("unknown clients and wrong callbacks never write a consent row", async () => {
  for (const details of [
    { client: { id: "unregistered" }, redirect_uri: "https://claude.ai/api/mcp/auth_callback" },
    { client: { id: "c-claude" }, redirect_uri: "https://evil.example/callback" },
  ]) {
    const h = routeHarness({ details });
    assert.equal((await h.post({ action: "approve", authorization_id: "authorization-1" })).status, 403);
    assert.equal(h.calls.some((c) => c.url.includes("/rest/v1/")), false);
  }
});

test("both pages stop loading and show recovery after session lookup rejects", async () => {
  for (const relative of ["src/app/oauth/authorize/consent-client.tsx", "src/app/account/connections/connections-client.tsx"]) {
    const supabase = fakeSupabase();
    supabase.auth.getSession = async () => { throw new Error("offline"); };
    const h = clientHarness(relative, supabase);
    await h.start();
    assert.equal(h.states[0].kind, "message");
    assert.match(h.states[0].text, /could not be loaded/);
  }
});
