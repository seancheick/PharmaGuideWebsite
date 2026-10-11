const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function loadEmailFlow(create, get, send) {
  let sends = 0;
  const exports = {};
  const client = {
    contacts: { create: async () => create, get: async () => get },
    emails: {
      send: async () => {
        sends += 1;
        return send;
      },
    },
  };
  const source = ts.transpileModule(fs.readFileSync("src/lib/resend.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const stubs = {
    "server-only": {},
    resend: {
      Resend: function () {
        return client;
      },
    },
    "@react-email/render": { render: async () => "Email text" },
    "./env": { env: { RESEND_API_KEY: "test", RESEND_AUDIENCE_BETA_ID: "beta" } },
    "./validation": { isValidEmail: () => true },
    "./logger": { log: { info() {}, warn() {}, error() {} }, hashPii: () => "test-hash" },
    "@/emails/BetaWelcomeEmail": { BetaWelcomeEmail: () => null },
    "@/emails/NewsletterWelcomeEmail": { NewsletterWelcomeEmail: () => null },
    "@/emails/BriefDeliveryEmail": { BriefDeliveryEmail: () => null },
  };
  vm.runInNewContext(source, {
    exports,
    require: (name) => {
      assert.ok(name in stubs, `Unexpected dependency ${name}`);
      return stubs[name];
    },
  });
  return { ...exports, sends: () => sends };
}
const failure = { name: "validation_error", statusCode: 422, message: "invalid request" };
const success = { data: { id: "email-id" }, error: null };

test("a failed add is duplicate only with a successful contact lookup", async () => {
  const flow = loadEmailFlow(
    { data: null, error: failure },
    { data: { id: "contact-id" }, error: null },
    success
  );
  const result = await flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.equal(result.ok, true);
  assert.equal(flow.sends(), 0);
});
test("a validation failure without an existing contact fails", async () => {
  const flow = loadEmailFlow(
    { data: null, error: failure },
    { data: null, error: failure },
    success
  );
  assert.equal((await flow.subscribe({ email: "test@example.com", list: "beta" })).ok, false);
});
test("missing contact acknowledgement cannot report already subscribed", async () => {
  const flow = loadEmailFlow({ data: null, error: null }, { data: null, error: null }, success);
  assert.equal((await flow.subscribe({ email: "test@example.com", list: "beta" })).ok, false);
});
test("missing send acknowledgement cannot report delivery", async () => {
  const flow = loadEmailFlow(success, success, { data: null, error: null });
  assert.equal((await flow.sendSafetyBrief("test@example.com")).ok, false);
});
test("a brief re-request still sends, and a send error fails", async () => {
  const flow = loadEmailFlow({ data: null, error: failure }, success, {
    data: null,
    error: failure,
  });
  assert.equal((await flow.sendSafetyBrief("test@example.com")).ok, false);
  assert.equal(flow.sends(), 1);
});
test("a new signup with acknowledged email succeeds", async () => {
  const flow = loadEmailFlow(success, success, success);
  assert.equal((await flow.subscribe({ email: "test@example.com", list: "beta" })).ok, true);
  assert.equal(flow.sends(), 1);
});

test("a delivered brief discloses when beta enrollment failed", async () => {
  const flow = loadEmailFlow(
    { data: null, error: failure },
    { data: null, error: failure },
    success
  );
  const result = await flow.sendSafetyBrief("test@example.com");
  assert.equal(result.ok, true);
  assert.match(result.message, /could not confirm your beta signup/);
  assert.equal(flow.sends(), 1);
});
