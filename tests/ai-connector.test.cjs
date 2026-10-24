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
  instance.testTimers = {setTimeout, clearTimeout};
  instance.testProcess = { env: { AI_CONNECTOR_PAIRING_ENABLED: "true", AI_CONNECTOR_TRUSTED_CLIENTS: JSON.stringify(TRUSTED) } };
  instance.testWindow = { location: { assign: (url) => { instance.redirect = url; } } };
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  instance._compile("const fetch = module.testFetch; const process = module.testProcess; const window = module.testWindow; const setTimeout = (...args) => module.testTimers.setTimeout(...args); const clearTimeout = (...args) => module.testTimers.clearTimeout(...args);\n" + compiled, filename);
  return instance;
}
const sessionToken = `header.${Buffer.from(JSON.stringify({ sub: "user-1", session_id: "11111111-1111-4111-8111-111111111111" })).toString("base64url")}.signature`;
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
    if (url.endsWith('/rpc/start_ai_connection_pairing')) return response({expires_at: '2099-01-01T00:00:00Z'});
    if (url.endsWith('/rpc/complete_ai_connection_pairing')) return response({connection_id: '22222222-2222-4222-8222-222222222222', expires_at: '2099-01-01T00:00:00Z'});
    if (url.includes('/rpc/')) return response(null);
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
  Object.assign(route.testProcess.env, overrides.env);
  if (overrides.disabled) delete route.testProcess.env.AI_CONNECTOR_PAIRING_ENABLED;
  return { calls, post: (body) => route.exports.POST(new Request("https://site.test/api/ai-connections", {
    method: "POST", headers: { authorization: `Bearer ${overrides.token ?? sessionToken}` }, body: JSON.stringify(body),
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
    const compensation = h.calls.filter(c => c.url.endsWith("/rpc/cancel_ai_connection_pairing"));
    assert.equal(compensation.length, 1);
    assert.deepEqual(JSON.parse(compensation[0].body), {p_user_id: "user-1", p_session_id: "11111111-1111-4111-8111-111111111111", p_authorization_id: "authorization-1"});
    assert.ok(!h.calls.some(c => c.url.includes("/rest/v1/") && !c.url.includes("/rpc/")));
  }
  const h = routeHarness();
  const result = await h.post({ action: "approve", authorization_id: "authorization-1" });
  assert.equal(result.status, 200);
  assert.equal((await result.json()).redirect_url, "https://claude.ai/api/mcp/auth_callback?code=approved");
});

async function flush() { for (let i = 0; i < 8; i++) await new Promise(setImmediate); }
function clientHarness(relative, supabase, fetchFn = async () => response({}), props = {}) {
  const states = [];
  const effects = [];
  let cleanups = [];
  let childKey;
  let cursor = 0;
  let mounted = false;
  let authorizationId = "authorization-1";
  const refs = [];
  let refCursor = 0, effectCursor = 0;
  const effectDeps = [];
  const pendingEffects = new Set();
  const timers = new Map();
  let timerId = 0;
  const react = {
    useRef(value) { const i = refCursor++; return refs[i] ?? (refs[i] = {current: value}); },
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (next) => { states[index] = typeof next === "function" ? next(states[index]) : next; }];
    },
    useCallback(fn) { return fn; },
    useEffect(fn, deps) {
      const index = effectCursor++;
      if (!deps || !effectDeps[index] || deps.some((value, i) => !Object.is(value, effectDeps[index][i]))) {
        effects[index] = fn; effectDeps[index] = deps; pendingEffects.add(index);
      }
    },
  };
  const loaded = loadSource(relative, {
    react,
    "next/link": { __esModule: true, default: "a" },
    "next/navigation": { useSearchParams: () => new URLSearchParams(props.externalAuthId ? `external_auth_id=${props.externalAuthId}` : `authorization_id=${authorizationId}`) },
    "@/components/ai-connector/SignInPanel": { SignInPanel: "signin" },
    "@/lib/ai-connector": connector,
    "@/lib/supabase-browser": { browserSupabase: () => supabase },
  }, fetchFn);
  loaded.testTimers = {setTimeout(fn) { const id=++timerId;timers.set(id,fn);return id; }, clearTimeout(id) { timers.delete(id); }};
  function commit() { for (const index of pendingEffects) { cleanups[index]?.();cleanups[index]=effects[index](); } pendingEffects.clear(); }
  function render() {
    cursor = 0; refCursor = 0; effectCursor = 0;
    const root = loaded.exports.default(props);
    if (typeof root.type !== 'function') { if(mounted) commit(); return root; }
    if (childKey !== undefined && childKey !== root.key) {
      cleanups.forEach(fn => fn?.());
      states.length = 0; refs.length = 0; effects.length = 0; effectDeps.length = 0; pendingEffects.clear();
    }
    childKey = root.key;
    const result = root.type(root.props);
    if (mounted) commit();
    return result;
  }
  return { states, render, timerCount: () => timers.size, unmount() { cleanups.forEach(fn=>fn?.()); }, tick() { const tasks=[...timers.values()];timers.clear();tasks.forEach(fn=>fn()); }, navigate(id) { authorizationId = id; return render(); }, async start() { render(); mounted = true; commit(); await flush(); } };
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
  const insert = h.calls.findIndex((c) => c.url.includes("/rpc/complete_ai_connection_pairing") && c.method === "POST");
  const consent = h.calls.findIndex((c) => c.url.endsWith("/consent"));
  assert.ok(insert >= 0 && consent > insert, "authoritative session age must follow consent row creation");
});

test("lost completion response cancels the exact authorization without issuing consent", async () => {
  const h = routeHarness({fetch: async (url) => {
    if (url.endsWith('/user')) return response({id: 'user-1'});
    if (url.includes('/oauth/authorizations/')) return response({client: {id: 'c-claude'}, redirect_uri: 'https://claude.ai/api/mcp/auth_callback'});
    if (url.endsWith('/rpc/complete_ai_connection_pairing')) throw new Error('lost response');
    return response(null);
  }});
  assert.equal((await h.post({action: 'approve', authorization_id: 'authorization-1'})).status, 503);
  assert.ok(h.calls.some(c => c.url.endsWith('/rpc/cancel_ai_connection_pairing') && JSON.parse(c.body).p_authorization_id === 'authorization-1'));
  assert.ok(!h.calls.some(c => c.url.endsWith('/consent')));
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

test("pairing starts only through verified authorization and stores a hash", async () => {
  const h = routeHarness();
  const result = await h.post({ action: "pair_start", authorization_id: "authorization-1" });
  assert.equal(result.status, 200);
  const body = await result.json();
  assert.match(body.code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{12}$/);
  const start = h.calls.find(c => c.url.endsWith('/rpc/start_ai_connection_pairing'));
  assert.equal(JSON.parse(start.body).p_code_hash, require('node:crypto').createHash('sha256').update(body.code).digest('hex'));
  assert.ok(!start.body.includes(body.code));
});

 test("Codex MCP callbacks require loopback and a bounded callback ID", () => {
   assert.equal(verifyCallback('http://127.0.0.1:49831/callback/129AGzqE0Vj5', 'codex').ok, true);
   for (const uri of ['http://localhost:49831/callback/id', 'http://127.0.0.1/callback/id?x=y', 'http://127.0.0.1/callback/id#x', 'http://127.0.0.1/callback/a/../id', 'http://127.0.0.1/callback/', 'http://evil.test/callback/id']) assert.equal(verifyCallback(uri, 'codex').ok, false);
 });

 test("pairing rollout defaults off and rejects JSON RPC errors", async () => {
   for (const action of ['pair_start', 'pair_status', 'approve']) {
     const h = routeHarness({disabled: true});
     assert.equal((await h.post({action, authorization_id: 'authorization-1'})).status, 503);
     assert.ok(!h.calls.some(c => c.url.includes('/rpc/')));
   }
   const h = routeHarness({fetch: async url => {
     if (url.endsWith('/user')) return response({id: 'user-1'});
     if (url.includes('/oauth/authorizations/')) return response({client: {id: 'c-claude'}, redirect_uri: 'https://claude.ai/api/mcp/auth_callback'});
     return response({error: 'pairing_unavailable'});
   }});
   assert.equal((await h.post({action: 'approve', authorization_id: 'authorization-1'})).status, 503);
   assert.ok(!h.calls.some(c => c.url.endsWith('/consent')));
 });
 test("anonymous, OAuth and missing-session credentials cannot start pairing", async () => {
   for (const claims of [{is_anonymous: true}, {client_id: 'evil'}, {sub: 'user-1'}]) {
     const token = `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;
     const h = routeHarness({token});
     assert.equal((await h.post({action: 'pair_start', authorization_id: 'authorization-1'})).status, 401);
     assert.ok(!h.calls.some(c => c.url.includes('/rpc/')));
   }
 });
 test("Codex registration requires its exact valid callback", () => {
   const client = {client_id: 'codex', name: 'Codex', kind: 'codex'};
   assert.deepEqual(parseTrustedClients(JSON.stringify([client])), []);
   assert.deepEqual(parseTrustedClients(JSON.stringify([{...client, redirect_uri: 'https://evil.test/callback/id'}])), []);
   assert.equal(parseTrustedClients(JSON.stringify([{...client, redirect_uri: 'http://127.0.0.1:49831/callback/129AGzqE0Vj5'}])).length, 1);
 });

test("changed signed-in account cannot start phone approval", async () => {
  const sdk = fakeSupabase();
  const calls = [];
  const h = clientHarness('src/app/oauth/authorize/consent-client.tsx', sdk, async (_url, init) => {
    calls.push(JSON.parse(init.body));
    return response({client_name: 'Claude', callback_host: 'claude.ai', redirect_uri: 'https://claude.ai/api/mcp/auth_callback'});
  });
  await h.start();
  const token = `header.${Buffer.from(JSON.stringify({sub: 'other-user', session_id: 'other-session'})).toString('base64url')}.signature`;
  sdk.auth.getSession = async () => ({data: {session: {access_token: token}}});
  buttons(h.render())[0].props.onClick();
  await flush();
  assert.deepEqual(calls.map(c => c.action), ['preview']);
  assert.equal(h.states[0].approved, false);
});

 test("late pairing result cannot restore approval after authorization navigation", async () => {
   let resolvePair;
   const sdk = fakeSupabase();
   const h = clientHarness('src/app/oauth/authorize/consent-client.tsx', sdk, async (_url, init) => {
     const body = JSON.parse(init.body);
     if (body.action === 'preview') return response({client_name: 'Claude', callback_host: 'claude.ai', redirect_uri: 'https://claude.ai/api/mcp/auth_callback'});
     return new Promise(resolve => { resolvePair = resolve; });
   });
   await h.start();
   buttons(h.render())[0].props.onClick();
   await flush();
   assert.equal(typeof resolvePair, 'function');
   h.navigate('authorization-2');
   resolvePair(response({code: 'ABCDEFGHJKLM', expires_at: '2099-01-01T00:00:00Z'}));
   await flush();
   assert.equal(h.states[0].code, undefined);
   assert.notEqual(h.states[0].approved, true);
 });

 test("account switch during pending pairing discards its code", async () => {
   let resolvePair;
   const sdk = fakeSupabase();
   const h = clientHarness('src/app/oauth/authorize/consent-client.tsx', sdk, async (_url, init) => {
     if (JSON.parse(init.body).action === 'preview') return response({client_name: 'Claude', callback_host: 'claude.ai', redirect_uri: 'https://claude.ai/api/mcp/auth_callback'});
     return new Promise(resolve => { resolvePair = resolve; });
   });
   await h.start();
   buttons(h.render())[0].props.onClick();
   await flush();
   sdk.auth.getSession = async () => ({data: {session: null}});
   resolvePair(response({code: 'ABCDEFGHJKLM', expires_at: '2099-01-01T00:00:00Z'}));
   await flush();
   assert.equal(h.states[0].code, undefined);
   assert.equal(h.states[0].approved, false);
 });

test('void pairing RPCs accept 204 and disconnect has no unlocked follow-up writes', async () => {
  for (const action of ['pair_cancel', 'disconnect']) {
    const h = routeHarness({fetch: async url => url.endsWith('/user') ? response({id: 'user-1'}) : new Response(null, {status: 204})});
    const result = await h.post({action, authorization_id: 'authorization-1', client_id: 'c-claude'});
    assert.equal(result.status, 200);
    assert.deepEqual(h.calls.filter(c => c.url.includes('/rest/')).map(c => c.url.split('/').pop()), [action === 'disconnect' ? 'revoke_ai_connection_pairings' : 'cancel_ai_connection_pairing']);
  }
});
test('empty completion fails closed and compensates with successful void cancellation', async () => {
  const h = routeHarness({fetch: async url => {
    if (url.endsWith('/user')) return response({id: 'user-1'});
    if (url.includes('/oauth/authorizations/')) return response({client: {id: 'c-claude'}, redirect_uri: 'https://claude.ai/api/mcp/auth_callback'});
    return new Response(null, {status: 204});
  }});
  const result = await h.post({action: 'approve', authorization_id: 'authorization-1'});
  assert.equal(result.status, 503);
  assert.doesNotMatch((await result.json()).error, /disconnect before/);
  assert.ok(h.calls.some(c => c.url.endsWith('/cancel_ai_connection_pairing')));
  assert.ok(!h.calls.some(c => c.url.endsWith('/consent')));
});

const workosEnv = {WORKOS_ISSUER: 'https://auth.example.test', WORKOS_API_KEY: 'fixture-workos-key'};
const workosPending = {authorization_id:'authorization-1',client_id:'c-claude',client_name:'Claude',redirect_uri:'https://claude.ai/api/mcp/auth_callback',callback_host:'claude.ai',oauth_issuer:workosEnv.WORKOS_ISSUER,expires_at:'2099-01-01T00:00:00Z'};
test('WorkOS pairing uses trusted pending SQL and durable completion without Auth OAuth', async () => {
 const h=routeHarness({env:workosEnv,fetch:async url=>{
  if(url.endsWith('/auth/v1/user')) return response({id:'user-1'});
  if(url.endsWith('/preview_workos_ai_pairing')) return response(workosPending);
  if(url.endsWith('/complete_ai_connection_pairing')) return response({connection_id:'22222222-2222-4222-8222-222222222222',expires_at:null,oauth_issuer:workosEnv.WORKOS_ISSUER});
  throw Error('Unexpected '+url);
 }});
 const r=await h.post({action:'approve',authorization_id:'authorization-1'});
 assert.equal(r.status,200); assert.equal((await r.json()).expires_at,null);
 assert.ok(!h.calls.some(c=>c.url.includes('/oauth/authorizations/')));
});
test('WorkOS wrong-user pending and wrong issuer fail closed',async()=>{
 for(const pending of [{error:'not_found'}, {...workosPending,oauth_issuer:'https://evil.test'}]){
 const h=routeHarness({env:workosEnv,fetch:async url=>response(url.endsWith('/user')?{id:'user-1'}:pending)});
 assert.notEqual((await h.post({action:'preview',authorization_id:'authorization-1'})).status,200);
 assert.ok(!h.calls.some(c=>c.url.endsWith('/start_ai_connection_pairing')));
 }
});
test('WorkOS login uses verified account email and rejects unsafe hosted redirects',async()=>{
 for(const redirect of ['https://auth.example.test/oauth2/external/callback?state=x','https://auth.example.test/application-authorization?state=x','https://auth.example.test/oauth/authorize/complete?state=x','https://evil.test/oauth/authorize/complete','https://evil.test/oauth2/external/callback','https://auth.example.test/oauth2/external/callback#fragment','https://user@auth.example.test/oauth2/external/callback','https://auth.example.test/other']){
 const h=routeHarness({env:workosEnv,fetch:async url=>response(url.endsWith('/user')?{id:'11111111-1111-4111-8111-111111111111',email:'verified@example.test'}:{redirect_uri:redirect})});
 const r=await h.post({action:'workos_login',external_auth_id:'ext_auth_fixture',email:'forged@example.test'});
 assert.equal(r.status,['https://auth.example.test/oauth2/external/callback?state=x','https://auth.example.test/oauth/authorize/complete?state=x','https://auth.example.test/application-authorization?state=x'].includes(redirect)?200:503);
 const sent=JSON.parse(h.calls.find(c=>c.url.includes('api.workos.com')).body);
 assert.deepEqual(sent,{external_auth_id:'ext_auth_fixture',user:{id:'11111111-1111-4111-8111-111111111111',email:'verified@example.test'}});
 }
});
test('WorkOS disconnect blocks locally then deletes exact application across pagination before finish',async()=>{
 for(const providerFails of [false,true]){
 const h=routeHarness({env:workosEnv,fetch:async(url,init)=>{
 if(url.endsWith('/auth/v1/user'))return response({id:'user-1'});
 if(url.endsWith('/begin_ai_connection_revocation'))return response({generation:3});
 if(url.includes('/external_id/'))return response({id:'user_internal',external_id:'user-1'});
 if(init.method==='DELETE')return new Response(null,{status:providerFails?500:204});
 if(url.includes('after=cursor'))return response({data:[{application:{id:'conn_app_exact',client_id:'c-claude'}}],list_metadata:{after:null}});
 if(url.includes('/authorized_applications'))return response({data:[{application:{id:'conn_app_other',client_id:'other'}}],list_metadata:{after:'cursor'}});
 if(url.endsWith('/finish_ai_connection_revocation'))return response({finished:true});
 throw Error(url);
 }});
 const r=await h.post({action:'disconnect',client_id:'c-claude'});
 assert.equal(r.status,providerFails?503:200);
 const calls=h.calls.map(c=>c.url);
 assert.ok(calls.findIndex(u=>u.endsWith('/begin_ai_connection_revocation'))<calls.findIndex(u=>u.includes('/external_id/')));
 assert.equal(h.calls.filter(c=>c.method==='DELETE')[0].url,'https://api.workos.com/user_management/users/user_internal/authorized_applications/conn_app_exact');
 assert.equal(calls.some(u=>u.endsWith('/finish_ai_connection_revocation')), !providerFails);
 }
});

test('WorkOS UI finishes or cancels locally without a second OAuth callback',async()=>{
 for(const approve of [true,false]){
 const sdk=fakeSupabase();
 sdk.auth.oauth.denyAuthorization=async()=>{throw Error('Must not deny provider OAuth');};
 const actions=[];
 const h=clientHarness('src/app/oauth/authorize/consent-client.tsx',sdk,async(_url,init)=>{
 const action=JSON.parse(init.body).action; actions.push(action);
 return response(action==='preview'?workosPending:{connection_id:'22222222-2222-4222-8222-222222222222',expires_at:null,oauth_issuer:workosEnv.WORKOS_ISSUER});
 });
 await h.start(); h.states[0].approved=true;h.states[0].expiresAt='2099-01-01T00:00:00Z';
 buttons(h.render()).find(b=>b.props.children===(approve?'Finish connecting':'Deny')).props.onClick();
 await flush();assert.equal(h.states[0].kind,'message');
 assert.match(h.states[0].text,approve?/Connected.*Return/:/cancelled/);
 assert.deepEqual(actions,['preview',approve?'approve':'pair_cancel']);
 }
});
test('WorkOS connections never list or revoke Supabase OAuth grants and retain retry error',async()=>{
 const sdk=fakeSupabase({rows:[{client_id:'c-claude',client_name:'Claude',status:'revoked',expires_at:null,oauth_issuer:workosEnv.WORKOS_ISSUER}]});
 sdk.auth.oauth.listGrants=async()=>{throw Error('Must not list Supabase grants');};
 sdk.auth.oauth.revokeGrant=async()=>{throw Error('Must not revoke Supabase grants');};
 const h=clientHarness('src/app/account/connections/connections-client.tsx',sdk,async(_url,init)=>JSON.parse(init.body).action==='revocation_status'?response({client_id:'c-claude'}):response({provider_handled:true,local_access_ended:true,error:'Local access ended; retry Disconnect.'},503),{workosMode:true});
 await h.start();assert.equal(h.states[0].kind,'list');buttons(h.render())[0].props.onClick();await flush();
 assert.match(h.states[0].notice,/Local access ended; retry/);
});
test('WorkOS durable disclosure retains independent additional-information expiry',()=>{
 assert.match(consentCopy('Codex',true).duration,/Until you disconnect.*Access settings.*access end time/);
 assert.equal(consentCopy('Codex',true).destinationLabel,'Configured assistant destination');
});

test('Standalone login waits for explicit Continue and does not preview or phone-pair',async()=>{
 const actions=[];
 const h=clientHarness('src/app/oauth/authorize/consent-client.tsx',fakeSupabase(),async(_url,init)=>{
 actions.push(JSON.parse(init.body));return response({redirect_uri:'https://auth.example.test/application-authorization?state=x'});
 },{externalAuthId:'ext_auth_fixture'});
 await h.start();assert.equal(h.states[0].kind,'login');assert.equal(actions.length,0);
 buttons(h.render())[0].props.onClick();await flush();
 assert.deepEqual(actions,[{action:'workos_login',external_auth_id:'ext_auth_fixture'}]);
});
test('Standalone login default-off and malformed issuer cannot call WorkOS',async()=>{
 for(const options of [{disabled:true,env:workosEnv},{env:{...workosEnv,WORKOS_ISSUER:'http://auth.example.test'}}]){
 const h=routeHarness(options);const result=await h.post({action:'workos_login',external_auth_id:'ext_auth_fixture'});
 assert.equal(result.status,503);assert.ok(!h.calls.some(c=>c.url.includes('api.workos.com')));
 }
});
test('WorkOS cancellation finishes provider revocation only for authority owned by the cancelled setup',async()=>{
 for(const needsRevoke of [true,false]){
 const h=routeHarness({env:workosEnv,fetch:async(url,init)=>{
 if(url.endsWith('/auth/v1/user'))return response({id:'user-1'});
 if(url.endsWith('/cancel_ai_connection_pairing'))return response(needsRevoke?{cancelled:true,client_id:'c-claude',revocation_generation:4}:{cancelled:true});
 if(url.includes('/external_id/'))return response({id:'user_internal',external_id:'user-1'});
 if(url.includes('/authorized_applications'))return response({data:[],list_metadata:{after:null}});
 if(url.endsWith('/finish_ai_connection_revocation'))return response({finished:true});
 throw Error(url);
 }});
 const result=await h.post({action:'pair_cancel',authorization_id:'authorization-1'});
 assert.equal(result.status,200);assert.equal(h.calls.some(c=>c.url.includes('/external_id/')),needsRevoke);
 assert.equal(h.calls.some(c=>c.url.endsWith('/finish_ai_connection_revocation')),needsRevoke);
 }
});
test('pending-only provider failure exposes a durable retry from connections',async()=>{
 const h=routeHarness({env:workosEnv,fetch:async url=>{
 if(url.endsWith('/auth/v1/user'))return response({id:'user-1'});
 if(url.endsWith('/cancel_ai_connection_pairing'))return response({cancelled:true,client_id:'c-claude',revocation_generation:4});
 if(url.includes('/external_id/'))return response({},500);
 if(url.includes('/ai_connection_pairing_limits?'))return response([{revoking_client_id:'c-claude'}]);
 throw Error(url);
 }});
 assert.equal((await h.post({action:'pair_cancel',authorization_id:'authorization-1'})).status,503);
 const status=await h.post({action:'revocation_status'});assert.equal(status.status,200);
 assert.deepEqual(await status.json(),{client_id:'c-claude'});
 assert.match(h.calls.find(c=>c.url.includes('/ai_connection_pairing_limits?')).url,/user_id=eq.user-1/);
 assert.ok(!h.calls.some(c=>c.url.endsWith('/finish_ai_connection_revocation')));
 const ui=clientHarness('src/app/account/connections/connections-client.tsx',fakeSupabase(),async(_url,init)=>
 JSON.parse(init.body).action==='revocation_status'?response({client_id:'c-claude'}):response({provider_handled:true,error:'Local access ended; retry Disconnect.'},503),{workosMode:true});
 await ui.start();assert.equal(ui.states[0].grants[0].clientId,'c-claude');
 buttons(ui.render())[0].props.onClick();await flush();assert.match(ui.states[0].notice,/retry Disconnect/);
});

test('verified phone approval finishes WorkOS connection without another click', async()=>{
 const sdk=fakeSupabase(), actions=[];
 const h=clientHarness('src/app/oauth/authorize/consent-client.tsx',sdk,async(_url,init)=>{
  const action=JSON.parse(init.body).action;actions.push(action);
  return response(action==='preview'?workosPending:action==='pair_status'?{approved:true,expires_at:'2099-01-01T00:00:00Z'}:{connection_id:'22222222-2222-4222-8222-222222222222',expires_at:null,oauth_issuer:workosEnv.WORKOS_ISSUER});
 });
 await h.start();h.states[0].code='ABCDEFGHJKLM';h.states[0].expiresAt='2099-01-01T00:00:00Z';
 buttons(h.render()).find(b=>b.props.children==='Check phone approval').props.onClick();
 await flush();assert.equal(h.states[0].kind,'message');assert.match(h.states[0].text,/Connected/);
 assert.deepEqual(actions,['preview','pair_status','approve']);
});

function anchors(node) {
 if(!node || typeof node!=='object') return [];
 if(Array.isArray(node))return node.flatMap(anchors);
 return [...(node.type==='a'?[node]:[]),...anchors(node.props?.children)];
}
test('phone approval offers an explicit app link with manual desktop code fallback',async()=>{
 const actions=[];
 const h=clientHarness('src/app/oauth/authorize/consent-client.tsx',fakeSupabase(),async(_url,init)=>{
 const action=JSON.parse(init.body).action;actions.push(action);
 return response(action==='preview'?workosPending:{code:'ABCDEFGHJKLM',expires_at:'2099-01-01T00:00:00Z'});
 });
 await h.start();buttons(h.render()).find(b=>b.props.children==='Start phone approval').props.onClick();await flush();
 const ui=h.render();const link=anchors(ui).find(a=>a.props.children==='Open PharmaGuide');
 assert.equal(link?.props.href,'pharmaguide:///ai-connections?code=ABCDEFGHJKLM');
 assert.match(JSON.stringify(ui),/ABCD-EFGH-JKLM/);
 assert.deepEqual(actions,['preview','pair_start']);
});
test('connected page opens app connections without carrying the expired approval code',async()=>{
 const h=clientHarness('src/app/oauth/authorize/consent-client.tsx',fakeSupabase(),async(_url,init)=>response(JSON.parse(init.body).action==='preview'?workosPending:{connection_id:'22222222-2222-4222-8222-222222222222',expires_at:null,oauth_issuer:workosEnv.WORKOS_ISSUER}));
 await h.start();h.states[0].approved=true;h.states[0].expiresAt='2099-01-01T00:00:00Z';h.states[0].code='ABCDEFGHJKLM';
 buttons(h.render()).find(b=>b.props.children==='Finish connecting').props.onClick();await flush();
 const ui=h.render();assert.equal(anchors(ui).find(a=>a.props.children==='Open PharmaGuide')?.props.href,'pharmaguide:///ai-connections');
 assert.match(JSON.stringify(ui),/Return to your assistant/);assert.doesNotMatch(JSON.stringify(ui),/ABCDEFGHJKLM/);
});

test('completed phone approval is visible after the challenge expires and remains session-bound',async()=>{
 const cid='22222222-2222-4222-8222-222222222222';
 for(const mismatch of [false,true]){
 const h=routeHarness({env:workosEnv,fetch:async url=>{
 if(url.endsWith('/auth/v1/user'))return response({id:'user-1'});
 if(url.endsWith('/preview_workos_ai_pairing'))return response({...workosPending,connection_id:cid,expires_at:'2000-01-01T00:00:00Z'});
 if(url.endsWith('/ai_connection_pairing_status'))return response(mismatch?{error:'pairing_unavailable'}:{approved:true,connection_id:cid,expires_at:'2000-01-01T00:00:00Z'});
 throw Error(url);
 }});
 const r=await h.post({action:'preview',authorization_id:'authorization-1'});
 assert.equal(r.status,mismatch?503:200);if(!mismatch)assert.equal((await r.json()).connected,true);
 }
});
test('phone completion between preview and status is accepted through exact binding owner',async()=>{
 const cid='22222222-2222-4222-8222-222222222222';
 const h=routeHarness({env:workosEnv,fetch:async url=>{
 if(url.endsWith('/auth/v1/user'))return response({id:'user-1'});
 if(url.endsWith('/preview_workos_ai_pairing'))return response(workosPending);
 if(url.endsWith('/ai_connection_pairing_status'))return response({approved:true,connection_id:cid,expires_at:'2099-01-01T00:00:00Z'});
 throw Error(url);
 }});
 const r=await h.post({action:'pair_status',authorization_id:'authorization-1'});assert.equal(r.status,200);assert.equal((await r.json()).connection_id,cid);
});
test('polling sees automatic phone completion, stops and never issues a second approval',async()=>{
 const actions=[];
 const h=clientHarness('src/app/oauth/authorize/consent-client.tsx',fakeSupabase(),async(_url,init)=>{
 const action=JSON.parse(init.body).action;actions.push(action);
 return response(action==='preview'?workosPending:{approved:true,connection_id:'22222222-2222-4222-8222-222222222222',expires_at:'2000-01-01T00:00:00Z'});
 });
 await h.start();h.states[0].code='ABCDEFGHJKLM';h.states[0].expiresAt='2000-01-01T00:00:00Z';
 h.render();assert.equal(h.timerCount(),1);h.tick();await flush();h.render();
 assert.equal(h.states[0].connected,true);assert.equal(h.timerCount(),0);
 assert.deepEqual(actions,['preview','pair_status']);h.tick();assert.deepEqual(actions,['preview','pair_status']);
});
test('leaving approval clears polling and discards a late completion response',async()=>{
 let resolveStatus;
 const h=clientHarness('src/app/oauth/authorize/consent-client.tsx',fakeSupabase(),async(_url,init)=>{
 if(JSON.parse(init.body).action==='preview')return response(workosPending);
 return new Promise(resolve=>{resolveStatus=resolve;});
 });
 await h.start();h.states[0].code='ABCDEFGHJKLM';h.states[0].expiresAt='2099-01-01T00:00:00Z';
 h.render();assert.equal(h.timerCount(),1);h.tick();await flush();h.unmount();
 resolveStatus(response({approved:true,connection_id:'22222222-2222-4222-8222-222222222222',expires_at:'2099-01-01T00:00:00Z'}));await flush();
 assert.equal(h.timerCount(),0);assert.notEqual(h.states[0].connected,true);
});
test('reloading a phone-completed setup shows success without generating another code',async()=>{
 const actions=[];
 const h=clientHarness('src/app/oauth/authorize/consent-client.tsx',fakeSupabase(),async(_url,init)=>{
 actions.push(JSON.parse(init.body).action);return response({...workosPending,connected:true});
 });
 await h.start();assert.equal(h.states[0].connected,true);assert.deepEqual(actions,['preview']);
 assert.equal(anchors(h.render()).find(a=>a.props.children==='Open PharmaGuide')?.props.href,'pharmaguide:///ai-connections');
});

test('access settings copy describes Save and the uploaded copy without promising live health sync',()=>{
 assert.match(connector.CONNECTIONS_COPY.intro,/Access settings.*tap Save/);
 assert.match(connector.CONNECTIONS_COPY.intro,/Saving uploads a separate copy/);
 assert.match(connector.CONNECTIONS_COPY.intro,/Medications and profile details are included only when you select them/);
 assert.doesNotMatch(connector.CONNECTIONS_COPY.intro,/snapshot|automatically sync/);
});

test('successful disconnect offers explicit return to app without an approval code',async()=>{
 const sdk=fakeSupabase({rows:[{client_id:'c-claude',client_name:'Claude',status:'active',expires_at:null,oauth_issuer:workosEnv.WORKOS_ISSUER}]});
 const h=clientHarness('src/app/account/connections/connections-client.tsx',sdk,async(_url,init)=>response(JSON.parse(init.body).action==='revocation_status'?{client_id:null}:{disconnected:true,provider_handled:true}),{workosMode:true});
 await h.start();buttons(h.render())[0].props.onClick();await flush();
 assert.equal(anchors(h.render()).find(a=>a.props.children==='Return to PharmaGuide')?.props.href,'pharmaguide:///ai-connections');
});

test('completed WorkOS disconnect is read-only after reload and offers return to app',async()=>{
 const rows=[{client_id:'c-claude',client_name:'Claude',status:'revoked',expires_at:null,oauth_issuer:workosEnv.WORKOS_ISSUER}, {client_id:'c-claude',client_name:'Claude',status:'revoked',expires_at:null,oauth_issuer:workosEnv.WORKOS_ISSUER}];
 const h=clientHarness('src/app/account/connections/connections-client.tsx',fakeSupabase({rows}),async()=>response({client_id:null}),{workosMode:true});
 await h.start();assert.equal(h.states[0].grants.length,1,'history is grouped by provider client');
 assert.match(JSON.stringify(h.render()),/Disconnected/);assert.equal(buttons(h.render()).length,0);
 assert.equal(anchors(h.render()).find(a=>a.props.children==='Return to PharmaGuide')?.props.href,'pharmaguide:///ai-connections');
});
test('provider cleanup retry is named explicitly on a revoked WorkOS row',async()=>{
 const h=clientHarness('src/app/account/connections/connections-client.tsx',fakeSupabase({rows:[{client_id:'c-claude',client_name:'Claude',status:'revoked',expires_at:null,oauth_issuer:workosEnv.WORKOS_ISSUER}]}),async()=>response({client_id:'c-claude'}),{workosMode:true});
 await h.start();assert.equal(buttons(h.render())[0].props.children,'Retry disconnect');
 assert.match(JSON.stringify(h.render()),/provider access removal is unfinished/);
});
test('legacy OAuth grant still allows cleanup when its local row is revoked',async()=>{
 const h=clientHarness('src/app/account/connections/connections-client.tsx',fakeSupabase({rows:[{client_id:'c-claude',client_name:'Claude',status:'revoked',expires_at:null}],grants:[{client:{id:'c-claude',name:'Claude'},granted_at:'2026-10-23'}]}));
 await h.start();assert.equal(buttons(h.render())[0].props.children,'Disconnect');
});
test('phone setup leads with an enabled approval action and no premature finish button',async()=>{
 const h=clientHarness('src/app/oauth/authorize/consent-client.tsx',fakeSupabase(),async()=>response(workosPending));
 await h.start();const ui=h.render();const start=buttons(ui).find(b=>b.props.children==='Start phone approval');
 assert.ok(start);assert.equal(start.props.disabled,false);assert.match(start.props.className,/bg-neutral-900/);
 assert.ok(!buttons(ui).some(b=>b.props.children==='Finish connecting'));
 const children=ui.props.children;assert.equal(children[2].props['aria-label'],'Phone approval','next step precedes long detail copy');
});
test('disconnect has a clear destructive target and blocks duplicate taps while pending',async()=>{
 let finish, disconnects=0;
 const pending=new Promise(resolve=>{finish=resolve;});
 const rows=[{client_id:'c-claude',client_name:'Claude',status:'active',expires_at:null,oauth_issuer:workosEnv.WORKOS_ISSUER}];
 const h=clientHarness('src/app/account/connections/connections-client.tsx',fakeSupabase({rows}),async(_url,init)=>{
   if(JSON.parse(init.body).action==='revocation_status')return response({client_id:null});
   disconnects++;return pending;
 },{workosMode:true});
 await h.start();const button=buttons(h.render())[0];
 assert.match(button.props.className,/bg-red-700/);assert.match(button.props.className,/min-h-12/);
 button.props.onClick();button.props.onClick();
 const busy=buttons(h.render())[0];assert.equal(busy.props.children,'Disconnecting…');assert.equal(busy.props.disabled,true);assert.equal(busy.props['aria-busy'],true);
 assert.equal(disconnects,1);
 finish(response({error:'Retry required',provider_handled:true},503));await flush();
 assert.equal(buttons(h.render())[0].props.disabled,false);
 buttons(h.render())[0].props.onClick();await flush();assert.equal(disconnects,2,'failure unlocks explicit retry');
});
