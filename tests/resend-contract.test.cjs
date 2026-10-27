const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function loadFlow(options = {}) {
  const records = new Map();
  const sends = [];
  const updates = [];
  const topicUpdates = [];
  const removedSegments = [];
  const events = [];
  const creates = [];
  const segmentIds = new Set(
    options.otherBrand ? ["other-list"] : options.missingSegment ? [] : ["beta-audience"]
  );
  const topicStates = {
    "beta-topic": options.betaOptOut ? "opt_out" : "opt_in",
    "newsletter-topic": options.newsletterOptOut ? "opt_out" : "opt_in",
  };
  let contact = options.contact;
  let nextSend = options.send;
  let now = Date.now();
  const receiptStore = new Map();
  const expiry = new Map();
  class FakeRedis {
    async get(key) {
      if (expiry.has(key) && expiry.get(key) <= now) {
        receiptStore.delete(key);
        expiry.delete(key);
      }
      return receiptStore.get(key) ?? null;
    }
    async set(key, value, settings) {
      if (options.storageFailure) throw new Error("Storage unavailable");
      if (settings?.nx && (await this.get(key)) !== null) return null;
      receiptStore.set(key, value);
      if (settings?.ex) expiry.set(key, now + settings.ex * 1000);
      return "OK";
    }
    async eval(_script, keys, values) {
      if (_script.includes("incoming.at")) {
        const current = await this.get(keys[0]);
        const incoming = JSON.parse(values[0]);
        if (current && current.at > incoming.at) return 0;
        await this.set(keys[0], incoming, { ex: Number(values[1]) });
        return 1;
      }
      if ((await this.get(keys[0])) !== values[0]) return 0;
      if (keys.length === 2) {
        receiptStore.set(keys[1], JSON.parse(values[1]));
        return 1;
      }
      receiptStore.delete(keys[0]);
      return 1;
    }
  }
  const notFound = {
    data: null,
    error: { name: "not_found", statusCode: 404, message: "Not found" },
  };
  const success = { data: { id: "email-id" }, error: null };
  const client = {
    contacts: {
      get: async () =>
        options.lookupFailure ?? (contact ? { data: contact, error: null } : notFound),
      create: async (payload) => {
        creates.push(payload);
        if (options.createFailure) return options.createFailure;
        contact = { id: "contact-id", unsubscribed: false, properties: Object.fromEntries(Object.entries(payload.properties ?? {}).map(([key, value]) => [key, { type: 'string', value }])) };
        for (const segment of payload.segments ?? []) segmentIds.add(segment.id);
        return { data: { id: contact.id }, error: null };
      },
      update: async (payload) => {
        updates.push(payload);
        if (contact && !options.updateFailure) {
          if (payload.unsubscribed !== undefined) contact.unsubscribed = payload.unsubscribed;
          contact.properties ??= {};
          for (const [key, value] of Object.entries(payload.properties ?? {}))
            contact.properties[key] = { type: "string", value };
        }
        return options.updateFailure ?? { data: { id: payload.id }, error: null };
      },
      topics: {
        list: async () =>
          options.topicLookupFailure ?? {
            data: {
              data: Object.entries(topicStates).map(([id, subscription]) => ({ id, subscription })),
            },
            error: null,
          },
        update: async (payload) => {
          topicUpdates.push(payload);
          if (!options.updateFailure)
            for (const topic of payload.topics) topicStates[topic.id] = topic.subscription;
          return options.updateFailure ?? { data: { id: payload.id }, error: null };
        },
      },
      segments: {
        list: async () => ({ data: { data: [...segmentIds].map((id) => ({ id })) }, error: null }),
        add: async (payload) => {
          segmentIds.add(payload.segmentId);
          return { data: { id: "waiting-segment" }, error: null };
        },
        remove: async (payload) => {
          removedSegments.push(payload);
          segmentIds.delete(payload.segmentId);
          return { data: { id: payload.segmentId }, error: null };
        },
      },
    },
    events: {
      send: async (payload) => {
        events.push(payload);
        return { data: { event: payload.event }, error: null };
      },
    },
    webhooks: {
      verify: (payload) => new (require("resend").Resend)("test").webhooks.verify(payload),
    },
    emails: {
      send: async (payload, settings) => {
        sends.push({ payload, settings });
        if (options.beforeSend) await options.beforeSend();
        const result = nextSend ?? success;
        nextSend = undefined;
        return result;
      },
    },
  };
  const stubs = {
    "server-only": {},
    resend: {
      Resend: function () {
        return client;
      },
    },
    "@upstash/redis": { Redis: FakeRedis },
  };
  const env = {
    RESEND_API_KEY: "test-secret",
    RESEND_FROM_EMAIL: "Sean at PharmaGuide <hello@pharmaguide.io>",
    RESEND_REPLY_TO_EMAIL: "info@pharmaguide.io",
    EMAIL_UNSUBSCRIBE_SECRET: "stable-test-secret",
    RESEND_AUDIENCE_BETA_ID: "beta-audience",
    RESEND_AUDIENCE_NEWSLETTER_ID: "newsletter-audience",
    RESEND_BETA_TOPIC_ID: "beta-topic",
    RESEND_NEWSLETTER_TOPIC_ID: "newsletter-topic",
    RESEND_BETA_WAITING_SEGMENT_ID: options.tracking ? "waiting-segment" : "",
    RESEND_WAITING_SEQUENCE_ENABLED: !!options.enableSequence,
    RESEND_WAITING_SEQUENCE_STARTED_AT: options.sequenceStartAt ?? '2000-01-01T00:00:00.000Z',
    RESEND_WEBHOOK_SECRET: "whsec_" + Buffer.from("local-webhook-test-secret").toString("base64"),
    UPSTASH_REDIS_REST_URL: "https://redis.example",
    UPSTASH_REDIS_REST_TOKEN: "test",
  };
  function load(filename) {
    filename = path.resolve(filename);
    if (records.has(filename)) return records.get(filename);
    const exports = {};
    records.set(filename, exports);
    const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    vm.runInNewContext(
      source,
      {
        exports,
        Buffer,
        URL,
        URLSearchParams,
        Request,
        Response,
        Date: class extends Date {
          static now() {
            return now;
          }
        },
        process: { env: { NODE_ENV: "test" } },
        require: (name) => {
          if (name in stubs) return stubs[name];
          if (name === "@react-email/render" && options.beforeRender) {
            const renderer = require(name);
            return {
              render: async (...args) => {
                await options.beforeRender();
                return renderer.render(...args);
              },
            };
          }
          if (name === "./env" || name === "@/lib/env") return { env };
          if (name === "./logger" || name === "@/lib/logger")
            return { log: { info() {}, warn() {}, error() {} }, hashPii: () => "hash" };
          if (name.startsWith("@/")) {
            const base = `src/${name.slice(2)}`;
            return load(fs.existsSync(`${base}.tsx`) ? `${base}.tsx` : `${base}.ts`);
          }
          if (name.startsWith(".")) {
            const base = path.resolve(path.dirname(filename), name);
            if (base.endsWith(".cjs")) return require(base);
            return load(fs.existsSync(`${base}.tsx`) ? `${base}.tsx` : `${base}.ts`);
          }
          return require(name);
        },
      },
      { filename }
    );
    return exports;
  }
  return {
    flow: load("src/lib/resend.ts"),
    preferences: load("src/lib/email-preferences.ts"),
    route: load("src/app/email/unsubscribe/route.ts"),
    load,
    client,
    sends,
    updates,
    topicUpdates,
    topicStates,
    removedSegments,
    events,
    creates,
    getContact: () => contact,
    receiptStore,
    env,
    advance: (hours) => {
      now += hours * 60 * 60 * 1000;
    },
  };
}

const failure = {
  data: null,
  error: { name: "application_error", statusCode: 500, message: "Try later" },
};
const subscribed = { id: "contact-id", unsubscribed: false };

test("signup sends a real rendered welcome with a signed footer and one-click headers", async () => {
  const setup = loadFlow();
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, true);
  assert.equal(setup.sends.length, 1);
  const { payload, settings } = setup.sends[0];
  const html = payload.html;
  assert.match(html, /What would you most like/);
  assert.doesNotMatch(payload.text, /RESEND_UNSUBSCRIBE_URL|180,000|through 2026|—|--/);
  const url = payload.headers["List-Unsubscribe"].slice(1, -1);
  assert.ok(html.includes(url.replaceAll("&", "&amp;")));
  assert.ok(payload.text.includes(url));
  assert.equal(payload.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  assert.match(settings.idempotencyKey, /^welcome\/beta\/[a-f0-9]{64}$/);
});

test("a failed welcome can retry after the contact was saved", async () => {
  const setup = loadFlow({ send: failure });
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, false);
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, true);
  assert.equal(setup.sends.length, 2);
  assert.equal(setup.sends[0].settings.idempotencyKey, setup.sends[1].settings.idempotencyKey);
  assert.equal(setup.sends[0].payload.text, setup.sends[1].payload.text);
});

test("existing subscribers without new delivery receipts do not get another welcome", async () => {
  const setup = loadFlow({ contact: subscribed });
  const result = await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.equal(result.ok, true);
  assert.match(result.message, /already on the list/);
  assert.equal(setup.sends.length, 0);
});

test("a retry uses the stored message when sender configuration changes", async () => {
  const setup = loadFlow({ send: failure });
  await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  setup.env.RESEND_FROM_EMAIL = "A different sender <other@pharmaguide.io>";
  await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.equal(setup.sends.length, 2);
  assert.equal(JSON.stringify(setup.sends[0].payload), JSON.stringify(setup.sends[1].payload));
  assert.equal(setup.sends[1].payload.from, "Sean at PharmaGuide <hello@pharmaguide.io>");
  assert.equal(
    [...setup.receiptStore.values()].some((receipt) => receipt.message),
    false
  );
});

test("concurrent signups only run one send and give the competing request a pending response", async () => {
  let release;
  let entered;
  const paused = new Promise((resolve) => {
    release = resolve;
  });
  const sending = new Promise((resolve) => {
    entered = resolve;
  });
  const setup = loadFlow({
    beforeSend: async () => {
      entered();
      await paused;
    },
  });
  const first = setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  await sending;
  const second = await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.equal(second.ok, true);
  assert.match(second.message, /being processed/);
  release();
  assert.equal((await first).ok, true);
  assert.equal(setup.sends.length, 1);
});

test("accepted welcomes stay deduplicated beyond Resend's 24-hour window", async () => {
  const setup = loadFlow();
  await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  setup.advance(48);
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, true);
  assert.equal(setup.sends.length, 1);
});

test("an uncertain old send does not retry outside the provider deduplication window", async () => {
  const setup = loadFlow({ send: failure });
  await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  setup.advance(24);
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, false);
  assert.equal(setup.sends.length, 1);
});

test("a contact-creation failure does not expire a welcome that was never attempted", async () => {
  const options = { createFailure: failure };
  const setup = loadFlow(options);
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, false);
  options.createFailure = undefined;
  setup.advance(24);
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, true);
  assert.equal(setup.sends.length, 1);
});

test("an expired worker cannot replace a newer worker's accepted receipt or send", async () => {
  let release;
  let entered;
  let renders = 0;
  const paused = new Promise((resolve) => {
    release = resolve;
  });
  const preparing = new Promise((resolve) => {
    entered = resolve;
  });
  const setup = loadFlow({
    beforeRender: async () => {
      if (++renders === 1) {
        entered();
        await paused;
      }
    },
  });
  const first = setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  await preparing;
  setup.advance(61 / 3600);
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, true);
  release();
  await first;
  assert.equal(setup.sends.length, 1);
  const receipts = [...setup.receiptStore.values()];
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].accepted, true);
  assert.equal(receipts[0].message, undefined);
});

test("an unsubscribed contact is neither reactivated nor sent a welcome", async () => {
  const setup = loadFlow({ contact: { ...subscribed, unsubscribed: true } });
  const result = await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.equal(result.ok, true);
  assert.match(result.message, /preferences are unchanged/);
  assert.equal(setup.sends.length, 0);
  assert.equal(setup.updates.length, 0);
});

test("lookup and storage failures do not send welcomes", async () => {
  for (const options of [{ lookupFailure: failure }, { storageFailure: true }]) {
    const setup = loadFlow(options);
    assert.equal(
      (await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok,
      false
    );
    assert.equal(setup.sends.length, 0);
  }
});

test("missing send acknowledgement fails and remains retryable", async () => {
  const setup = loadFlow({ send: { data: null, error: null } });
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, false);
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, true);
});

test("brief delivery describes actual enrollment and honors an existing opt-out", async () => {
  for (const options of [
    { createFailure: failure },
    { contact: { ...subscribed, unsubscribed: true } },
  ]) {
    const setup = loadFlow(options);
    const result = await setup.flow.sendSafetyBrief("test@example.com");
    assert.equal(result.ok, true);
    assert.match(result.message, /could not confirm your beta signup/);
    assert.match(setup.sends[0].payload.text, /couldn't confirm an active beta subscription/);
    assert.doesNotMatch(setup.sends[0].payload.text, /on the beta list too/);
  }
});

test("a brief request also joins the newsletter, with an unsubscribe link for each list", async () => {
  const setup = loadFlow();
  const result = await setup.flow.sendSafetyBrief("test@example.com");
  assert.equal(result.ok, true);
  assert.match(result.message, /newsletter/);
  const segments = setup.creates.flatMap((c) => (c.segments ?? []).map((s) => s.id));
  const added = await setup.client.contacts.segments.list({ contactId: "contact-id" });
  assert.ok(
    segments.includes("newsletter-audience") ||
      added.data.data.some((s) => s.id === "newsletter-audience")
  );
  const text = setup.sends[0].payload.text;
  assert.match(text, /monthly notes/);
  assert.match(text, /Unsubscribe from monthly notes/);
  assert.match(text, /Unsubscribe from beta invitations and updates/);
  assert.match(text, /on the beta list too/);
  assert.match(text, /Get your brief https:\/\/pharmaguide\.io\/supplement-safety-brief\.pdf/);
  assert.match(setup.sends[0].payload.html ?? (await require("@react-email/render").render(setup.sends[0].payload.react)), /brief-cover-email\.jpg/);
  const header = setup.sends[0].payload.headers["List-Unsubscribe"];
  const token = new URL(header.slice(1, -1)).searchParams.get("token");
  assert.equal(setup.preferences.readEmailPreference(token).list, "newsletter");
});

test("a brief request keeps an earlier newsletter opt-out", async () => {
  const setup = loadFlow({ contact: { ...subscribed }, newsletterOptOut: true });
  const result = await setup.flow.sendSafetyBrief("test@example.com");
  assert.equal(result.ok, true);
  const added = await setup.client.contacts.segments.list({ contactId: "contact-id" });
  assert.ok(!added.data.data.some((s) => s.id === "newsletter-audience"));
  assert.doesNotMatch(setup.sends[0].payload.text, /Unsubscribe from monthly notes/);
  assert.doesNotMatch(setup.sends[0].payload.text, /You're also subscribed to the monthly notes/);
});

test("a requested brief can be resent and send errors are reported", async () => {
  const setup = loadFlow({ send: failure });
  assert.equal((await setup.flow.sendSafetyBrief("test@example.com")).ok, false);
  assert.equal((await setup.flow.sendSafetyBrief("test@example.com")).ok, true);
  assert.equal(setup.sends.length, 2);
});

test("unsubscribe GET is read-only; one-click POST updates the signed list", async () => {
  const setup = loadFlow();
  const url = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "newsletter" });
  assert.equal(new URL(url).origin, "https://pharmaguide.io");
  assert.equal((await setup.route.GET(new Request(url))).status, 200);
  assert.equal(setup.updates.length, 0);
  const response = await setup.route.POST(
    new Request(url, { method: "POST", body: "List-Unsubscribe=One-Click" })
  );
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
  assert.equal(setup.topicUpdates[0].topics[0].id, "newsletter-topic");
  assert.equal(setup.topicUpdates[0].topics[0].subscription, "opt_out");
  assert.equal(setup.updates.length, 0);
});

test("one-click POST also accepts a multipart/form-data body (RFC 8058)", async () => {
  const setup = loadFlow();
  const url = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "newsletter" });
  const form = new FormData();
  form.append("List-Unsubscribe", "One-Click");
  const response = await setup.route.POST(new Request(url, { method: "POST", body: form }));
  assert.equal(response.status, 200);
  assert.equal(setup.topicUpdates[0].topics[0].subscription, "opt_out");

  const withFile = new FormData();
  withFile.append("List-Unsubscribe", new Blob(["One-Click"]), "x.txt");
  const rejected = loadFlow();
  const bad = await rejected.route.POST(new Request(url, { method: "POST", body: withFile }));
  assert.equal(bad.status, 400);
  assert.equal(rejected.topicUpdates.length, 0);
});

test("branded preference page is private, script-free and offers read-only keep", async () => {
  const setup = loadFlow();
  const url = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "beta" });
  const response = await setup.route.GET(new Request(url));
  const html = await response.text();
  assert.match(html, /#FAF9F6/);
  assert.match(html, /#183B3F/);
  assert.match(html, /Georgia/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /max-width/);
  assert.doesNotMatch(html, /<select|<script|<iframe|https?:\/\//);
  assert.match(html, /<img src="\/brand\/logo-pulse\.png"/);
  assert.match(response.headers.get("Content-Security-Policy"), /img-src 'self'/);
  assert.match(html, /Keep current preferences/);
  const keep = await setup.route.GET(new Request(url + "&view=keep"));
  assert.match(await keep.text(), /preferences are unchanged/);
  assert.equal(setup.topicUpdates.length, 0);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  const style = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  const hash = require("node:crypto").createHash("sha256").update(style).digest("base64");
  assert.ok(response.headers.get("content-security-policy").includes(`style-src 'sha256-${hash}'`));
});

test("optional feedback follows success and never changes consent", async () => {
  const setup = loadFlow({ contact: { ...subscribed } });
  const url = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "beta" });
  const response = await setup.route.POST(new Request(url, { method: "POST", body: "action=unsubscribe" }));
  const html = await response.text();
  assert.match(html, /<label for="reason">/);
  assert.match(html, /<select id="reason" name="reason"/);
  assert.match(html, /optional/i);
  assert.match(html, /Resend/);
  assert.doesNotMatch(html, /<textarea|type="text"/);
  const count = setup.topicUpdates.length;
  for (const reason of ["too_many", "not_relevant", "not_using", "did_not_signup", "other"]) {
    const feedback = await setup.route.POST(new Request(url, { method: "POST", body: `action=feedback&reason=${reason}` }));
    assert.equal(feedback.status, 200);
    assert.match(await feedback.text(), /Feedback saved/);
    assert.equal(setup.getContact().properties.pg_unsubscribe_feedback.value, `beta:${reason}`);
  }
  assert.equal(setup.topicUpdates.length, count);
  assert.equal(setup.topicStates["newsletter-topic"], "opt_in");
  assert.equal(setup.getContact().unsubscribed, false);
  assert.deepEqual(Object.keys(setup.updates.at(-1).properties), ["pg_unsubscribe_feedback"]);
});

test("feedback fails closed for invalid forms, active or unverifiable topics", async () => {
  const setup = loadFlow({ contact: { ...subscribed } });
  const url = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "newsletter" });
  for (const body of ["action=feedback&reason=not_relevant", "action=feedback&reason=medical", "action=feedback", "action=feedback&reason=other&reason=too_many", "action=unsubscribe&reason=other", "List-Unsubscribe=One-Click&action=feedback", "action=unsubscribe&extra=x", "action=unsubscribe&action=unsubscribe", "x".repeat(2049)]) {
    const response = await setup.route.POST(new Request(url, { method: "POST", body }));
    assert.equal(response.status, 400);
  }
  assert.equal(setup.updates.length, 0);
  assert.equal(setup.topicUpdates.length, 0);
  for (const options of [{ topicLookupFailure: failure }, { lookupFailure: failure }]) {
    const failed = loadFlow({ contact: { ...subscribed }, betaOptOut: true, ...options });
    await assert.rejects(() => failed.flow.saveUnsubscribeFeedback({ contactId: "contact-id", list: "beta" }, "other"));
    assert.equal(failed.updates.length, 0);
  }
});

test("feedback save failure truthfully preserves verified unsubscribe success", async () => {
  const setup = loadFlow({ contact: { ...subscribed }, betaOptOut: true, updateFailure: failure });
  const url = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "beta" });
  const response = await setup.route.POST(new Request(url, { method: "POST", body: "action=feedback&reason=other" }));
  assert.equal(response.status, 503);
  const html = await response.text();
  assert.match(html, /still unsubscribed/);
  assert.match(html, /couldn't save your feedback/);
  assert.doesNotMatch(html, /Feedback saved/);
  assert.equal(setup.topicUpdates.length, 0);
});

test("newsletter feedback requires its own opt-out and invalid tokens cannot save", async () => {
  const setup = loadFlow({ contact: { ...subscribed }, betaOptOut: true });
  const url = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "newsletter" });
  const post = (target, body) => setup.route.POST(new Request(target, { method: "POST", body }));
  assert.equal((await post(url, "action=feedback&reason=other")).status, 400);
  assert.equal((await post(url, "action=unsubscribe")).status, 200);
  assert.equal((await post(url, "action=feedback&reason=other")).status, 200);
  assert.equal(setup.getContact().properties.pg_unsubscribe_feedback.value, "newsletter:other");
  const count = setup.updates.length;
  for (const target of [url + "x", url + "&token=bad"]) {
    assert.equal((await post(target, "action=feedback&reason=other")).status, 400);
  }
  for (const body of ["action=feedback&reason=%", "action=feedback&reason=%FF", "action=feedback&reason=other&notes=private"]) {
    assert.equal((await post(url, body)).status, 400);
  }
  await assert.rejects(() => setup.flow.saveUnsubscribeFeedback({ contactId: "contact-id", list: "newsletter" }, "medical"));
  assert.equal(setup.updates.length, count);
});

test("tampered, malformed, and oversized tokens cannot update a contact", async () => {
  const setup = loadFlow();
  const valid = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "beta" });
  for (const url of [
    valid + "x",
    "https://www.pharmaguide.io/email/unsubscribe?token=bad",
    "https://www.pharmaguide.io/email/unsubscribe?token=" + "x".repeat(1025),
  ]) {
    assert.equal(
      (
        await setup.route.POST(
          new Request(url, { method: "POST", body: "List-Unsubscribe=One-Click" })
        )
      ).status,
      400
    );
  }
  assert.equal(setup.updates.length, 0);
});

test("visible unsubscribe confirms success, while provider failures return 503", async () => {
  for (const updateFailure of [undefined, failure, { data: null, error: null }]) {
    const setup = loadFlow({ updateFailure });
    const url = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "beta" });
    const response = await setup.route.POST(
      new Request(url, { method: "POST", body: "action=unsubscribe" })
    );
    assert.equal(response.status, updateFailure ? 503 : 200);
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  }
});

test("beta unsubscribe preserves newsletter consent and stops waiting", async () => {
  const setup = loadFlow({ contact: { ...subscribed }, tracking: true });
  const url = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "beta" });
  const response = await setup.route.POST(
    new Request(url, { method: "POST", body: "action=unsubscribe" })
  );
  assert.equal(response.status, 200);
  assert.equal(setup.topicStates["beta-topic"], "opt_out");
  assert.equal(setup.topicStates["newsletter-topic"], "opt_in");
  assert.equal(setup.getContact().unsubscribed, false);
  assert.equal(setup.getContact().properties.pg_beta_status.value, "unsubscribed");
  assert.equal(setup.removedSegments.length, 1);
});

test("re-signup does not reactivate a beta topic opt-out", async () => {
  const setup = loadFlow({ contact: { ...subscribed }, betaOptOut: true });
  const result = await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.match(result.message, /preferences are unchanged/);
  assert.equal(setup.topicUpdates.length, 0);
  assert.equal(setup.sends.length, 0);
});

test("a global contact outside the segment keeps their topic opt-out", async () => {
  const setup = loadFlow({ contact: { ...subscribed }, betaOptOut: true, missingSegment: true });
  const result = await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.match(result.message, /preferences are unchanged/);
  assert.equal(setup.creates.length, 0);
  assert.equal(setup.topicUpdates.length, 0);
  assert.equal(setup.sends.length, 0);
});

test("an existing beta contact can join the newsletter without a duplicate contact or consent reset", async () => {
  const setup = loadFlow({ contact: { ...subscribed } });
  const result = await setup.flow.subscribe({ email: "test@example.com", list: "newsletter" });
  assert.equal(result.ok, true);
  assert.equal(setup.creates.length, 0);
  assert.equal(setup.topicUpdates.length, 0);
  assert.equal(setup.sends.length, 1);
  assert.match(setup.sends[0].payload.subject, /monthly notes/);
});

test("new contact creation includes consent atomically and preference lookup failures remain retryable", async () => {
  const options = { topicLookupFailure: failure };
  const setup = loadFlow(options);
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, false);
  assert.equal(setup.creates[0].topics[0].id, "beta-topic");
  assert.equal(setup.creates[0].topics[0].subscription, "opt_in");
  assert.equal(setup.topicUpdates.length, 0);
  options.topicLookupFailure = undefined;
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, true);
  assert.equal(setup.sends.length, 1);
});

test("invited testers leave waiting and never emit a sequence event", async () => {
  const setup = loadFlow({
    contact: {
      ...subscribed,
      properties: { pg_beta_status: { type: "string", value: "invited" } },
    },
    tracking: true,
    enableSequence: true,
  });
  await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.equal(setup.events.length, 0);
  assert.equal(setup.removedSegments.length, 1);
  assert.equal(setup.getContact().properties.pg_beta_status.value, "invited");
});

test("live sequence enrolls a new beta signup only once", async () => {
  const setup = loadFlow({ tracking: true, enableSequence: true });
  assert.equal((await setup.flow.subscribe({ email: 'new@example.com', list: 'beta' })).ok, true);
  assert.equal(setup.events.length, 1);
  assert.equal(setup.getContact().properties.pg_sequence_status.value, 'enrolled');
  await setup.flow.subscribe({ email: 'new@example.com', list: 'beta' });
  assert.equal(setup.events.length, 1);
});

test("activation never backfills existing beta members or pre-activation joins", async () => {
  for (const joinedAt of [undefined, '1999-01-01T00:00:00.000Z', 'not-a-date']) {
    const setup = loadFlow({ tracking: true, enableSequence: true, contact: {
      ...subscribed, properties: { pg_beta_status: { type: 'string', value: 'waiting' },
        ...(joinedAt ? { pg_beta_joined_at: { type: 'string', value: joinedAt } } : {}) },
    } });
    await setup.flow.subscribe({ email: 'existing@example.com', list: 'beta' });
    assert.equal(setup.events.length, 0);
    assert.equal(setup.getContact().properties.pg_beta_joined_at?.value, joinedAt);
  }
});

test("an existing newsletter contact can newly join beta without enrolling old beta members", async () => {
  const setup = loadFlow({ tracking: true, enableSequence: true, missingSegment: true, contact: { ...subscribed } });
  await setup.flow.subscribe({ email: 'newbeta@example.com', list: 'beta' });
  assert.equal(setup.events.length, 1);
  assert.ok(setup.getContact().properties.pg_beta_joined_at.value);
});

test("missing or invalid activation cutoff fails closed", async () => {
  for (const sequenceStartAt of ['', 'invalid', '2999-01-01T00:00:00.000Z']) {
    const setup = loadFlow({ tracking: true, enableSequence: true, sequenceStartAt });
    await setup.flow.subscribe({ email: 'new@example.com', list: 'beta' });
    assert.equal(setup.events.length, 0);
  }
});

test("review mode tracks a waiting signup without enrolling it in the sequence", async () => {
  const setup = loadFlow({ tracking: true });
  assert.equal((await setup.flow.subscribe({ email: "test@example.com", list: "beta" })).ok, true);
  assert.equal(setup.events.length, 0);
  assert.equal(setup.getContact().properties.pg_beta_status.value, "waiting");
});

function delivery(type, details = {}) {
  return {
    type,
    created_at: new Date().toISOString(),
    data: {
      email_id: "message-id",
      from: "Sean <hello@pharmaguide.io>",
      to: ["test@example.com"],
      ...details,
    },
  };
}

test("only permanent bounces and complaints suppress contacts", async () => {
  for (const [event, shouldSuppress] of [
    [delivery("email.failed", { failed: { reason: "Provider quota reached" } }), false],
    [
      delivery("email.bounced", {
        bounce: { type: "Transient", message: "Mailbox temporarily full" },
      }),
      false,
    ],
    [
      delivery("email.bounced", {
        bounce: { type: "Permanent", message: "Address does not exist" },
      }),
      true,
    ],
    [delivery("email.complained"), true],
  ]) {
    const setup = loadFlow({ contact: { ...subscribed }, tracking: true });
    await setup.load("src/lib/email-tracking.ts").recordEmailEvent(event, "event-id");
    assert.equal(setup.getContact().unsubscribed, shouldSuppress);
    assert.equal(setup.removedSegments.length, shouldSuppress ? 1 : 0);
    assert.equal(
      JSON.stringify([...setup.receiptStore.values()]).includes("test@example.com"),
      false
    );
  }
});

test("delivery tracking ignores another brand and duplicate events", async () => {
  const setup = loadFlow({ contact: { ...subscribed }, tracking: true });
  const tracking = setup.load("src/lib/email-tracking.ts");
  await tracking.recordEmailEvent(
    delivery("email.complained", { from: "Other <hello@other-brand.com>" }),
    "other"
  );
  assert.equal(setup.updates.length, 0);
  await tracking.recordEmailEvent(delivery("email.delivered"), "duplicate");
  const count = setup.updates.length;
  await tracking.recordEmailEvent(delivery("email.delivered"), "duplicate");
  assert.equal(setup.updates.length, count);
});

test("an older replay cannot replace a delivered message receipt", async () => {
  const setup = loadFlow({ contact: { ...subscribed }, tracking: true });
  const tracking = setup.load("src/lib/email-tracking.ts");
  await tracking.recordEmailEvent(
    { ...delivery("email.delivered"), created_at: "2026-10-23T23:00:48.724Z" },
    "delivered-event"
  );
  await tracking.recordEmailEvent(
    { ...delivery("email.sent"), created_at: "2026-10-23T23:00:47.768Z" },
    "earlier-sent-event"
  );
  assert.equal(
    setup.receiptStore.get("email:delivery:message-id:contact-id").type,
    "email.delivered"
  );
  assert.equal(setup.getContact().properties.pg_delivery_status.value, "delivered");
});

test("webhook signatures are verified before any contact update", async () => {
  const { createHmac } = require("node:crypto");
  const setup = loadFlow({ contact: { ...subscribed }, tracking: true });
  const route = setup.load("src/app/api/email-events/route.ts");
  const payload = JSON.stringify(delivery("email.complained"));
  const id = "msg_test";
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signed = createHmac(
    "sha256",
    Buffer.from(setup.env.RESEND_WEBHOOK_SECRET.slice(6), "base64")
  )
    .update(`${id}.${timestamp}.${payload}`)
    .digest("base64");
  const headers = { "svix-id": id, "svix-timestamp": timestamp, "svix-signature": `v1,${signed}` };
  assert.equal(
    (
      await route.POST(
        new Request("https://www.pharmaguide.io/api/email-events", {
          method: "POST",
          headers: { ...headers, "svix-signature": "v1,invalid" },
          body: payload,
        })
      )
    ).status,
    400
  );
  assert.equal(setup.updates.length, 0);
  assert.equal(
    (
      await route.POST(
        new Request("https://www.pharmaguide.io/api/email-events", {
          method: "POST",
          headers,
          body: payload,
        })
      )
    ).status,
    200
  );
  assert.equal(setup.getContact().unsubscribed, true);
});

test("poll GET is read-only and confirmation saves only a general interest", async () => {
  const setup = loadFlow({ contact: { ...subscribed } });
  const { pollUrl } = require('../src/lib/email-poll.cjs');
  const url = pollUrl('contact-id', setup.env.EMAIL_UNSUBSCRIBE_SECRET) + '&choice=interactions';
  const route = setup.load('src/app/email/beta-interest/route.ts');
  const page = await route.GET(new Request(url));
  assert.equal(page.status, 200);
  const pageHtml = await page.text();
  assert.match(pageHtml, /type="hidden" name="choice" value="interactions"/);
  assert.match(pageHtml, /You chose/);
  assert.ok(!pageHtml.includes('<select'));
  assert.match(await (await route.GET(new Request(url + '&change=1'))).text(), /<select/);
  assert.equal(setup.updates.length, 0);
  const confirm = (body) => route.POST(new Request(url, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body }));
  assert.equal((await confirm('choice=invalid')).status, 400);
  assert.equal((await confirm('choice=other&choice=interactions')).status, 400);
  assert.equal((await confirm('choice=interactions')).status, 200);
  assert.equal(setup.getContact().properties.pg_beta_interest.value, 'interactions');
  const count = setup.updates.length;
  assert.equal((await confirm('choice=interactions')).status, 200);
  assert.equal(setup.updates.length, count);
  for (const choice of ['whole_stack', 'evidence', 'condition_fit', 'overlap', 'other']) {
    assert.equal((await confirm(`choice=${choice}`)).status, 200);
    assert.equal(setup.getContact().properties.pg_beta_interest.value, choice);
  }
  assert.equal((await confirm('choice=condition_fit&condition=example')).status, 400);
  assert.equal(setup.topicUpdates.length, 0);
  assert.equal(setup.sends.length, 0);
  assert.equal((await route.GET(new Request(url + 'x'))).status, 200);
  assert.equal((await route.GET(new Request('https://pharmaguide.io/email/beta-interest?token=invalid'))).status, 400);
});

test("poll failures and non-beta contacts never report a saved answer", async () => {
  const { pollUrl } = require('../src/lib/email-poll.cjs');
  for (const options of [{ updateFailure: { error: { message: 'failed' }, data: null } }, { missingSegment: true }]) {
    const setup = loadFlow({ contact: { ...subscribed }, ...options });
    const route = setup.load('src/app/email/beta-interest/route.ts');
    const response = await route.POST(new Request(pollUrl('contact-id', setup.env.EMAIL_UNSUBSCRIBE_SECRET), { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'choice=other' }));
    assert.equal(response.status, 503);
    assert.equal(setup.topicUpdates.length, 0);
  }
});

test("review tooling cannot send broadcasts, emails, or real enrollment events", async () => {
  const { assertReviewOnlyRequest } = await import("../scripts/email-ops.mjs");
  for (const [resource, body] of [
    ["/emails", {}],
    ["/broadcasts/draft/send", {}],
    ["/broadcasts", { send: true }],
    ["/events/send", { event: "pg.beta.waitlist_joined.v1" }],
    ["/automations", { status: "enabled", steps: [{ type: "send_email" }] }],
  ]) {
    assert.throws(() => assertReviewOnlyRequest("POST", resource, body));
  }
  assert.doesNotThrow(() => assertReviewOnlyRequest("POST", "/broadcasts", { send: false }));
});
