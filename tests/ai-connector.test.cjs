const test = require("node:test");
const assert = require("node:assert/strict");

const {
  CONNECTION_HOURS,
  CONNECTION_SCOPE,
  CONNECTIONS_COPY,
  connectionExpiry,
  consentCopy,
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
