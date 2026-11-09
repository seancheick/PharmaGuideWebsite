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
  const addedSegments = [];
  const events = [];
  const creates = [];
  const segmentIds = new Set(
    options.otherBrand ? ["other-list"] : options.missingSegment ? [] : ["beta-audience"]
  );
  const topicStates = {
    "beta-topic": options.betaOptOut ? "opt_out" : "opt_in",
    "newsletter-topic": options.newsletterOptOut ? "opt_out" : "opt_in",
  };
  let contact = options.contact ? structuredClone(options.contact) : undefined;
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
  const templateReads = [];
  const client = {
    templates: {
      get: async (alias) => {
        templateReads.push(alias);
        return options.templateFailure ?? { data: options.template, error: null };
      },
    },
    contacts: {
      get: async () =>
        options.lookupFailure ?? (contact ? { data: contact, error: null } : notFound),
      create: async (payload) => {
        creates.push(payload);
        if (options.createFailure) return options.createFailure;
        contact = {
          id: "contact-id",
          unsubscribed: false,
          properties: Object.fromEntries(
            Object.entries(payload.properties ?? {}).map(([key, value]) => [
              key,
              { type: "string", value },
            ])
          ),
        };
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
          addedSegments.push(payload);
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
    "next/server": { after: (task) => void task() },
  };
  const env = {
    RESEND_HOSTED_TEMPLATES_ENABLED: !!options.hosted,
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
    RESEND_WAITING_SEQUENCE_STARTED_AT: options.sequenceStartAt ?? "2000-01-01T00:00:00.000Z",
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
    templateReads,
    sends,
    updates,
    topicUpdates,
    topicStates,
    removedSegments,
    addedSegments,
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
  assert.match(
    setup.sends[0].payload.html ??
      (await require("@react-email/render").render(setup.sends[0].payload.react)),
    /brief-cover-email\.jpg/
  );
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

test("a brief joiner gets one welcome when they later use a signup form", async () => {
  const setup = loadFlow({ missingSegment: true });
  await setup.flow.sendSafetyBrief("test@example.com");
  assert.equal(setup.sends.length, 1);
  assert.match(setup.sends[0].payload.subject, /Safety Brief/);

  const first = await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.match(first.message, /Check your inbox/);
  assert.equal(setup.sends.length, 2);
  assert.equal(setup.sends[1].payload.subject, "You're on the PharmaGuide beta list");

  const second = await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.match(second.message, /Check your inbox/);
  assert.equal(setup.sends.length, 2);
});

test("a brief request by someone already on the list does not unlock a welcome", async () => {
  const setup = loadFlow({ contact: { ...subscribed } });
  await setup.flow.sendSafetyBrief("test@example.com");
  const result = await setup.flow.subscribe({ email: "test@example.com", list: "beta" });
  assert.match(result.message, /already on the list/);
  assert.equal(setup.sends.length, 1);
});

test("a welcome storage failure does not cost a brief joiner their list place", async () => {
  const setup = loadFlow({ missingSegment: true, storageFailure: true });
  const result = await setup.flow.sendSafetyBrief("test@example.com");
  assert.equal(result.ok, true);
  assert.match(result.message, /newsletter and beta list/);
  assert.match(setup.sends[0].payload.text, /on the beta list too/);
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
  const response = await setup.route.POST(
    new Request(url, { method: "POST", body: "action=unsubscribe" })
  );
  const html = await response.text();
  assert.match(html, /<label for="reason">/);
  assert.match(html, /<select id="reason" name="reason"/);
  assert.match(html, /optional/i);
  assert.match(html, /Resend/);
  assert.doesNotMatch(html, /<textarea|type="text"/);
  const count = setup.topicUpdates.length;
  for (const reason of ["too_many", "not_relevant", "not_using", "did_not_signup", "other"]) {
    const feedback = await setup.route.POST(
      new Request(url, { method: "POST", body: `action=feedback&reason=${reason}` })
    );
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
  for (const body of [
    "action=feedback&reason=not_relevant",
    "action=feedback&reason=medical",
    "action=feedback",
    "action=feedback&reason=other&reason=too_many",
    "action=unsubscribe&reason=other",
    "List-Unsubscribe=One-Click&action=feedback",
    "action=unsubscribe&extra=x",
    "action=unsubscribe&action=unsubscribe",
    "x".repeat(2049),
  ]) {
    const response = await setup.route.POST(new Request(url, { method: "POST", body }));
    assert.equal(response.status, 400);
  }
  assert.equal(setup.updates.length, 0);
  assert.equal(setup.topicUpdates.length, 0);
  for (const options of [{ topicLookupFailure: failure }, { lookupFailure: failure }]) {
    const failed = loadFlow({ contact: { ...subscribed }, betaOptOut: true, ...options });
    await assert.rejects(() =>
      failed.flow.saveUnsubscribeFeedback({ contactId: "contact-id", list: "beta" }, "other")
    );
    assert.equal(failed.updates.length, 0);
  }
});

test("feedback save failure truthfully preserves verified unsubscribe success", async () => {
  const setup = loadFlow({ contact: { ...subscribed }, betaOptOut: true, updateFailure: failure });
  const url = setup.preferences.unsubscribeUrl({ contactId: "contact-id", list: "beta" });
  const response = await setup.route.POST(
    new Request(url, { method: "POST", body: "action=feedback&reason=other" })
  );
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
  for (const body of [
    "action=feedback&reason=%",
    "action=feedback&reason=%FF",
    "action=feedback&reason=other&notes=private",
  ]) {
    assert.equal((await post(url, body)).status, 400);
  }
  await assert.rejects(() =>
    setup.flow.saveUnsubscribeFeedback({ contactId: "contact-id", list: "newsletter" }, "medical")
  );
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
    const setup = loadFlow({ contact: subscribed, updateFailure });
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

test("beta signup without a waiting segment records lifecycle and preference links with sequence off", async () => {
  const setup = loadFlow();
  assert.equal((await setup.flow.subscribe({ email: "new@example.com", list: "beta" })).ok, true);
  assert.equal(setup.creates[0].properties.pg_beta_status, "waiting");
  assert.equal(setup.creates[0].properties.pg_source, "website");
  assert.ok(Number.isFinite(Date.parse(setup.creates[0].properties.pg_beta_joined_at)));
  const properties = setup.getContact().properties;
  assert.ok(properties.pg_beta_unsubscribe_url.value);
  assert.ok(properties.pg_beta_poll_url.value);
  assert.equal(setup.addedSegments.length, 0);
  assert.equal(setup.events.length, 0);
});

test("beta sync without a waiting segment stamps existing contacts and honors topic opt-out", async () => {
  for (const betaOptOut of [false, true]) {
    const setup = loadFlow({ contact: { ...subscribed }, betaOptOut, enableSequence: true });
    await setup.load("src/lib/email-tracking.ts").syncBetaContact("contact-id");
    assert.equal(
      setup.getContact().properties.pg_beta_status.value,
      betaOptOut ? "unsubscribed" : "waiting"
    );
    if (!betaOptOut) {
      assert.ok(setup.getContact().properties.pg_status_updated_at.value);
      assert.ok(setup.getContact().properties.pg_beta_unsubscribe_url.value);
    }
    assert.equal(setup.addedSegments.length, 0);
    assert.equal(setup.removedSegments.length, 0);
    assert.equal(setup.events.length, 0);
    assert.equal(setup.sends.length, 0);
  }
});

test("live sequence enrolls a new beta signup only once", async () => {
  const setup = loadFlow({ tracking: true, enableSequence: true });
  assert.equal((await setup.flow.subscribe({ email: "new@example.com", list: "beta" })).ok, true);
  assert.equal(setup.events.length, 1);
  assert.equal(setup.getContact().properties.pg_sequence_status.value, "enrolled");
  await setup.flow.subscribe({ email: "new@example.com", list: "beta" });
  assert.equal(setup.events.length, 1);
});

test("activation never backfills existing beta members or pre-activation joins", async () => {
  for (const joinedAt of [undefined, "1999-01-01T00:00:00.000Z", "not-a-date"]) {
    const setup = loadFlow({
      tracking: true,
      enableSequence: true,
      contact: {
        ...subscribed,
        properties: {
          pg_beta_status: { type: "string", value: "waiting" },
          ...(joinedAt ? { pg_beta_joined_at: { type: "string", value: joinedAt } } : {}),
        },
      },
    });
    await setup.flow.subscribe({ email: "existing@example.com", list: "beta" });
    assert.equal(setup.events.length, 0);
    assert.equal(setup.getContact().properties.pg_beta_joined_at?.value, joinedAt);
  }
});

test("an existing newsletter contact can newly join beta without enrolling old beta members", async () => {
  const setup = loadFlow({
    tracking: true,
    enableSequence: true,
    missingSegment: true,
    contact: { ...subscribed },
  });
  await setup.flow.subscribe({ email: "newbeta@example.com", list: "beta" });
  assert.equal(setup.events.length, 1);
  assert.ok(setup.getContact().properties.pg_beta_joined_at.value);
});

test("missing or invalid activation cutoff fails closed", async () => {
  for (const sequenceStartAt of ["", "invalid", "2999-01-01T00:00:00.000Z"]) {
    const setup = loadFlow({ tracking: true, enableSequence: true, sequenceStartAt });
    await setup.flow.subscribe({ email: "new@example.com", list: "beta" });
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
  const { pollUrl } = require("../src/lib/email-poll.cjs");
  const url = pollUrl("contact-id", setup.env.EMAIL_UNSUBSCRIBE_SECRET) + "&choice=interactions";
  const route = setup.load("src/app/email/beta-interest/route.ts");
  const page = await route.GET(new Request(url));
  assert.equal(page.status, 200);
  const pageHtml = await page.text();
  assert.match(pageHtml, /type="hidden" name="choice" value="interactions"/);
  assert.match(pageHtml, /You chose/);
  assert.ok(!pageHtml.includes("<select"));
  assert.match(await (await route.GET(new Request(url + "&change=1"))).text(), /<select/);
  assert.equal(setup.updates.length, 0);
  const confirm = (body) =>
    route.POST(
      new Request(url, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      })
    );
  assert.equal((await confirm("choice=invalid")).status, 400);
  assert.equal((await confirm("choice=other&choice=interactions")).status, 400);
  assert.equal((await confirm("choice=interactions")).status, 200);
  assert.equal(setup.getContact().properties.pg_beta_interest.value, "interactions");
  const count = setup.updates.length;
  assert.equal((await confirm("choice=interactions")).status, 200);
  assert.equal(setup.updates.length, count);
  for (const choice of ["whole_stack", "evidence", "condition_fit", "overlap", "other"]) {
    assert.equal((await confirm(`choice=${choice}`)).status, 200);
    assert.equal(setup.getContact().properties.pg_beta_interest.value, choice);
  }
  assert.equal((await confirm("choice=condition_fit&condition=example")).status, 400);
  assert.equal(setup.topicUpdates.length, 0);
  assert.equal(setup.sends.length, 0);
  assert.equal((await route.GET(new Request(url + "x"))).status, 200);
  assert.equal(
    (await route.GET(new Request("https://pharmaguide.io/email/beta-interest?token=invalid")))
      .status,
    400
  );
});

test("poll failures and non-beta contacts never report a saved answer", async () => {
  const { pollUrl } = require("../src/lib/email-poll.cjs");
  for (const options of [
    { updateFailure: { error: { message: "failed" }, data: null } },
    { missingSegment: true },
  ]) {
    const setup = loadFlow({ contact: { ...subscribed }, ...options });
    const route = setup.load("src/app/email/beta-interest/route.ts");
    const response = await route.POST(
      new Request(pollUrl("contact-id", setup.env.EMAIL_UNSUBSCRIBE_SECRET), {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "choice=other",
      })
    );
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

const hostedTemplate = () => ({
  id: "template-id",
  alias: "pg-beta-welcome-v2",
  status: "published",
  published_at: "2026-11-05",
  has_unpublished_versions: false,
  subject: "Dashboard subject",
  html: '<p>Published copy</p><a href="{{UNSUBSCRIBE_URL}}">Leave</a><p>{{NEWSLETTER_SUBSCRIPTION_COPY}}</p>{{{NEWSLETTER_PREFERENCE_LINK}}}',
  text: "Published copy {{UNSUBSCRIBE_URL}} {{NEWSLETTER_SUBSCRIPTION_COPY}} {{NEWSLETTER_PREFERENCE_LINK}}",
  variables: [{ key: "UNSUBSCRIBE_URL", type: "string" }],
});

test("hosted welcome snapshots published dashboard copy and signed preferences before an uncertain retry", async () => {
  const template = hostedTemplate();
  const h = loadFlow({ hosted: true, template, send: failure });
  assert.equal((await h.flow.subscribe({ email: "hosted@example.com", list: "beta" })).ok, false);
  template.html = "Changed dashboard body";
  assert.equal((await h.flow.subscribe({ email: "hosted@example.com", list: "beta" })).ok, true);
  assert.equal(h.templateReads.length, 1);
  assert.equal(h.templateReads[0], "pg-beta-welcome-v2");
  assert.equal(h.sends[0].payload.html, h.sends[1].payload.html);
  assert.equal(h.sends[0].payload.subject, "Dashboard subject");
  assert.match(h.sends[0].payload.html, /Published copy/);
  assert.match(h.sends[0].payload.headers["List-Unsubscribe"], /email\/unsubscribe/);
  assert.equal(h.sends[0].payload.template, undefined);
});

test("hosted mode fails closed for missing, unpublished, edited or unresolved templates", async () => {
  for (const template of [
    undefined,
    { ...hostedTemplate(), status: "draft" },
    { ...hostedTemplate(), has_unpublished_versions: true },
    { ...hostedTemplate(), html: "{{UNKNOWN}}" },
  ]) {
    const h = loadFlow({ hosted: true, template });
    assert.equal((await h.flow.subscribe({ email: "fail@example.com", list: "beta" })).ok, false);
    assert.equal(h.sends.length, 0);
  }
});

test("disabled hosted switch preserves legacy templates without fetching drafts", async () => {
  const h = loadFlow();
  assert.equal((await h.flow.subscribe({ email: "legacy@example.com", list: "beta" })).ok, true);
  assert.equal(h.templateReads.length, 0);
  assert.equal(h.sends[0].payload.subject, "You're on the PharmaGuide beta list");
});

test("hosted dashboard draft edits use the last verified published snapshot for new signups", async () => {
  const template = hostedTemplate();
  const h = loadFlow({ hosted: true, template });
  assert.equal((await h.flow.subscribe({ email: "first@example.com", list: "beta" })).ok, true);
  template.has_unpublished_versions = true;
  template.html = "UNAPPROVED DRAFT";
  const key = h.load("src/lib/email-delivery.ts").welcomeKey("second@example.com", "beta");
  await h.load("src/lib/email-delivery.ts").reserveWelcome(key);
  assert.equal((await h.flow.subscribe({ email: "second@example.com", list: "beta" })).ok, true);
  assert.equal(h.sends.length, 2);
  assert.match(h.sends[1].payload.html, /Published copy/);
  assert.doesNotMatch(h.sends[1].payload.html, /UNAPPROVED/);
});

test("hosted brief uses confirmed subscription copy and preserves available preference headers", async () => {
  const template = {
    ...hostedTemplate(),
    alias: "pg-brief-delivery-v2",
    html: "<p>{{{NEWSLETTER_SUBSCRIPTION_COPY}}}</p><p>{{{BETA_SUBSCRIPTION_COPY}}}</p>{{{BETA_PREFERENCE_LINK}}}{{{NEWSLETTER_PREFERENCE_LINK}}}",
    text: "{{NEWSLETTER_SUBSCRIPTION_COPY}} {{BETA_SUBSCRIPTION_COPY}} {{BETA_PREFERENCE_LINK}} {{NEWSLETTER_PREFERENCE_LINK}}",
  };
  const h = loadFlow({ hosted: true, template, betaOptOut: true });
  assert.equal((await h.flow.sendSafetyBrief("brief@example.com")).ok, true);
  assert.equal(h.templateReads[0], "pg-brief-delivery-v2");
  assert.match(h.sends[0].payload.html, /monthly notes/);
  assert.match(h.sends[0].payload.html, /couldn&#39;t confirm an active beta/);
  assert.doesNotMatch(h.sends[0].payload.html, /You&#39;re on the beta list too/);
  const header = h.sends[0].payload.headers["List-Unsubscribe"].slice(1, -1);
  assert.equal(
    h.preferences.readEmailPreference(new URL(header).searchParams.get("token")).list,
    "newsletter"
  );
  assert.equal(h.topicUpdates.length, 0);
});

test("hosted templates cannot drop required preference variables from either format", async () => {
  for (const missing of ["html", "text"]) {
    const template = { ...hostedTemplate(), [missing]: "No preferences here" };
    const h = loadFlow({ hosted: true, template });
    assert.equal(
      (await h.flow.subscribe({ email: "preferences@example.com", list: "beta" })).ok,
      false
    );
    assert.equal(h.sends.length, 0);
  }
});

test("real journey templates integrate with hosted delivery, preferences and dashboard HTML edits", async () => {
  const { journey, renderJourney } = await import("../scripts/lib/email-journey-v2.mjs");
  const published = async (key) => ({
    ...hostedTemplate(),
    ...(await renderJourney(key)),
    alias: journey[key].alias,
    subject: journey[key].subject,
  });
  for (const [key, list] of [
    ["betaWelcome", "beta"],
    ["newsletterWelcome", "newsletter"],
  ]) {
    const template = await published(key);
    const h = loadFlow({ hosted: true, template });
    assert.equal((await h.flow.subscribe({ email: `${list}@example.com`, list })).ok, true);
    const message = h.sends[0].payload;
    assert.equal(message.subject, journey[key].subject);
    assert.match(message.text, /Here's to taking good care of yourself\./);
    assert.doesNotMatch(message.html + message.text, /\{\{|\}\}/);
    const url = message.headers["List-Unsubscribe"].slice(1, -1);
    assert.equal(
      h.preferences.readEmailPreference(new URL(url).searchParams.get("token")).list,
      list
    );
    assert.ok(message.html.includes(`href="${url.replace(/&/g, "&amp;")}"`));
    assert.ok(message.text.includes(url));

    // Editing HTML in Resend's code editor can preserve the existing text and
    // variable contract. The next clean published version is authoritative.
    const originalText = message.text;
    template.html = template.html.replace(
      "</body>",
      "<p>Reviewed dashboard HTML update</p></body>"
    );
    const receipts = h.load("src/lib/email-delivery.ts");
    await receipts.reserveWelcome(receipts.welcomeKey(`next-${list}@example.com`, list));
    assert.equal((await h.flow.subscribe({ email: `next-${list}@example.com`, list })).ok, true);
    assert.match(h.sends[1].payload.html, /Reviewed dashboard HTML update/);
    assert.equal(h.sends[1].payload.text, originalText);

    // URL values are escaped once in actual renderer attribute placeholders.
    const helper = h.load("src/lib/email-hosted-templates.ts");
    const escaped = await helper.prepareHostedTemplate(h.client, journey[key].alias, {
      UNSUBSCRIBE_URL: helper.plainVariable(
        "https://pharmaguide.io/email/unsubscribe?token=example&source=inbox"
      ),
      ...(list === "beta"
        ? {
            NEWSLETTER_SUBSCRIPTION_COPY: helper.plainVariable(""),
            NEWSLETTER_PREFERENCE_LINK: helper.plainVariable(""),
          }
        : {}),
    });
    assert.match(escaped.html, /token=example&amp;source=inbox/);
    assert.doesNotMatch(escaped.html, /&amp;amp;/);
    assert.match(escaped.text, /token=example&source=inbox/);
  }
  for (const newsletterOptOut of [false, true]) {
    const h = loadFlow({
      hosted: true,
      template: await published("brief"),
      betaOptOut: true,
      newsletterOptOut,
    });
    assert.equal((await h.flow.sendSafetyBrief("requested@example.com")).ok, true);
    const message = h.sends[0].payload;
    assert.doesNotMatch(message.html + message.text, /\{\{|\}\}/);
    assert.match(message.text, /couldn't confirm an active beta subscription/);
    assert.doesNotMatch(message.text, /You're on the beta list too/);
    assert.equal(
      message.text.includes("You're also signed up for our monthly notes"),
      !newsletterOptOut
    );
    assert.equal(message.html.includes("Unsubscribe from monthly notes"), !newsletterOptOut);
    assert.equal(h.topicUpdates.length, 0);
  }
});

test("disclosed beta signup joins monthly notes once without a newsletter welcome receipt", async () => {
  const h = loadFlow();
  assert.equal(
    (await h.flow.subscribe({ email: "both@example.com", list: "beta", includeNewsletter: true }))
      .ok,
    true
  );
  assert.ok(h.addedSegments.some((s) => s.segmentId === "newsletter-audience"));
  assert.equal(h.sends.length, 1);
  assert.match(h.sends[0].payload.text, /also signed up for our monthly notes/);
  assert.match(h.sends[0].payload.text, /Unsubscribe from monthly notes/);
  assert.ok(![...h.receiptStore.keys()].some((k) => k.includes("newsletter/")));
  await h.flow.subscribe({ email: "both@example.com", list: "beta", includeNewsletter: true });
  assert.equal(h.sends.length, 1);
});

test("combined beta signup preserves monthly, beta and global opt-outs", async () => {
  for (const options of [
    { newsletterOptOut: true, missingSegment: true },
    { betaOptOut: true, missingSegment: true },
    { contact: { ...subscribed, unsubscribed: true }, missingSegment: true },
  ]) {
    const h = loadFlow({ contact: { ...subscribed }, ...options });
    assert.equal(
      (
        await h.flow.subscribe({
          email: "optout@example.com",
          list: "beta",
          includeNewsletter: true,
        })
      ).ok,
      true
    );
    assert.ok(!h.addedSegments.some((s) => s.segmentId === "newsletter-audience"));
    assert.equal(h.topicUpdates.length, 0);
    if (options.newsletterOptOut) {
      assert.equal(h.sends.length, 1);
      assert.doesNotMatch(
        h.sends[0].payload.text,
        /also signed up for our monthly notes|Unsubscribe from monthly notes/
      );
    } else assert.equal(h.sends.length, 0);
  }
});

test("beta-only programmatic signups and historical contacts are never backfilled into monthly notes", async () => {
  for (const options of [{}, { contact: { ...subscribed } }]) {
    const h = loadFlow(options);
    await h.flow.subscribe({ email: "old@example.com", list: "beta" });
    assert.ok(!h.addedSegments.some((s) => s.segmentId === "newsletter-audience"));
    assert.ok(!h.creates.some((c) => c.segments.some((s) => s.id === "newsletter-audience")));
    assert.ok(
      h.sends.every((s) => !s.payload.text.includes("also signed up for our monthly notes"))
    );
  }
});

test("monthly enrollment failure returns a truthful partial failure before sending a welcome", async () => {
  const h = loadFlow();
  const add = h.client.contacts.segments.add;
  h.client.contacts.segments.add = async (payload) =>
    payload.segmentId === "newsletter-audience" ? failure : add(payload);
  const result = await h.flow.subscribe({
    email: "partial@example.com",
    list: "beta",
    includeNewsletter: true,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "newsletter_enrollment_failed");
  assert.match(result.message, /beta list.*could not confirm.*monthly notes/);
  assert.equal(h.sends.length, 0);
});

test("monthly enrollment failure can retry the single combined welcome", async () => {
  const h = loadFlow();
  const add = h.client.contacts.segments.add;
  h.client.contacts.segments.add = async (payload) =>
    payload.segmentId === "newsletter-audience" ? failure : add(payload);
  assert.equal(
    (
      await h.flow.subscribe({
        email: "retry-both@example.com",
        list: "beta",
        includeNewsletter: true,
      })
    ).ok,
    false
  );
  h.client.contacts.segments.add = add;
  assert.equal(
    (
      await h.flow.subscribe({
        email: "retry-both@example.com",
        list: "beta",
        includeNewsletter: true,
      })
    ).ok,
    true
  );
  assert.equal(h.sends.length, 1);
  assert.match(h.sends[0].payload.text, /also signed up for our monthly notes/);
  await h.flow.subscribe({ email: "retry-both@example.com", list: "newsletter" });
  assert.equal(h.sends.length, 1);
});

test("explicit beta form resubmission can join monthly without welcoming historical beta members again", async () => {
  const h = loadFlow({ contact: { ...subscribed } });
  const result = await h.flow.subscribe({
    email: "historical@example.com",
    list: "beta",
    includeNewsletter: true,
  });
  assert.equal(result.ok, true);
  assert.match(result.message, /signed up for our monthly notes/);
  assert.ok(h.addedSegments.some((s) => s.segmentId === "newsletter-audience"));
  assert.equal(h.sends.length, 0);
  assert.equal(h.topicUpdates.length, 0);
});

test("only the disclosed beta form action requests monthly notes enrollment", () => {
  const source = fs.readFileSync("src/app/actions/subscribe.ts", "utf8");
  assert.match(
    source,
    /subscribe\(\{ email: cleanEmail, list: "beta", includeNewsletter: true \}\)/
  );
  assert.equal((source.match(/includeNewsletter: true/g) ?? []).length, 1);
});

test("hosted combined beta welcome includes monthly copy only after confirmed enrollment", async () => {
  const { journey, renderJourney } = await import("../scripts/lib/email-journey-v2.mjs");
  for (const newsletterOptOut of [false, true]) {
    const h = loadFlow({
      hosted: true,
      newsletterOptOut,
      template: {
        ...hostedTemplate(),
        ...(await renderJourney("betaWelcome")),
        alias: journey.betaWelcome.alias,
        subject: journey.betaWelcome.subject,
      },
    });
    assert.equal(
      (
        await h.flow.subscribe({
          email: "hosted-both@example.com",
          list: "beta",
          includeNewsletter: true,
        })
      ).ok,
      true
    );
    const message = h.sends[0].payload;
    assert.equal(
      message.text.includes("You're also signed up for our monthly notes"),
      !newsletterOptOut
    );
    assert.equal(message.html.includes("Unsubscribe from monthly notes"), !newsletterOptOut);
    assert.doesNotMatch(message.html + message.text, /\{\{|\}\}/);
    if (!newsletterOptOut) {
      const url = [...message.text.matchAll(/https:\/\/[^\s]+/g)]
        .map((m) => m[0])
        .find((url) => {
          try {
            return (
              h.preferences.readEmailPreference(new URL(url).searchParams.get("token"))?.list ===
              "newsletter"
            );
          } catch {
            return false;
          }
        });
      assert.ok(url);
    }
    assert.equal(h.sends.length, 1);
  }
});

test('Resend topic preference events stop the waiting journey after a beta opt-out', async()=>{
 const setup=loadFlow({contact:{...subscribed,properties:{pg_beta_status:{value:'waiting'}}},betaOptOut:true});
 await setup.load('src/lib/email-tracking.ts').recordEmailEvent({type:'contact.topics.updated',created_at:new Date().toISOString(),data:{email:subscribed.email,topics:[{id:'beta-topic',subscription:'opt_out'}]}},'topic-opt-out');
 assert.equal(setup.getContact().properties.pg_beta_status.value,'unsubscribed');
 assert.equal(setup.sends.length,0);
});
