import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, createHmac } from "node:crypto";
import { pollUrl } from "../src/lib/email-poll.cjs";
import { buildPollReport, reportCsv, reportHtml } from "./lib/email-poll-report.mjs";
import {
  campaigns,
  renderCampaign,
  contactProperties,
  waitingAutomation,
  WAITING_SEGMENT,
  WAITING_EVENT,
  AUTOMATION_NAME,
  isKnownTestAddress,
  escapeHtml,
} from "./lib/email-campaigns.mjs";

const folder = path.resolve(".tmp/email-review");
const stateFile = path.join(folder, "resend-state.json");
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export function assertReviewOnlyRequest(method, resource, body, probe = false) {
  if (method === "GET") return;
  if (
    /^\/(emails|batch)(\/|$)/.test(resource) ||
    /\/broadcasts\/[^/]+\/send/.test(resource) ||
    body?.send ||
    body?.scheduled_at
  )
    throw new Error("Sending and scheduling are disabled during review");
  if (method === "DELETE" && /^\/contacts\/[^/]+$/.test(resource))
    throw new Error("Keep opt-out records; do not delete contacts");
  if (resource === "/events/send" && (!probe || body?.event !== "pg.probe.status-refresh.v1"))
    throw new Error("Sequence enrollment is disabled during review");
  if (/^\/automations/.test(resource) && body?.status === "enabled") {
    if (
      !probe ||
      !body.steps?.length ||
      body.steps.some(
        (step) => !["trigger", "delay", "condition", "contact_update"].includes(step.type)
      )
    )
      throw new Error("Only the temporary no-send verification flow may run");
  }
}

export function createClient({ apiKey, probe = false, fetcher = fetch } = {}) {
  if (!apiKey) throw new Error("RESEND_API_KEY is missing");
  return async (method, resource, body, allowMissing = false) => {
    assertReviewOnlyRequest(method, resource, body, probe);
    const response = await fetcher(`https://api.resend.com${resource}`, {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    await pause(650);
    if (allowMissing && response.status === 404) return null;
    if (!response.ok) {
      await fs.writeFile(
        path.join(folder, "last-provider-error.json"),
        JSON.stringify({ method, resource, response: result }, null, 2),
        { mode: 0o600 }
      );
      throw new Error(
        `Resend ${method} ${resource.split("?")[0]}: ${response.status} ${result.name ?? "request_failed"}${resource.startsWith("/automations") ? ` ${result.message ?? ""}` : ""}`
      );
    }
    return result;
  };
}

async function readState() {
  try {
    return JSON.parse(await fs.readFile(stateFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

async function saveState(state) {
  await fs.mkdir(folder, { recursive: true, mode: 0o700 });
  await fs.writeFile(stateFile, JSON.stringify(state, null, 2), { mode: 0o600 });
}

async function listAll(api, resource) {
  const items = [];
  let after;
  do {
    const page = await api(
      "GET",
      `${resource}${resource.includes("?") ? "&" : "?"}limit=100${after ? `&after=${encodeURIComponent(after)}` : ""}`
    );
    items.push(...page.data);
    if (!page.has_more) return items;
    after = page.data.at(-1)?.id;
    if (!after) throw new Error("Provider returned an incomplete page");
  } while (items.length < 10000);
  throw new Error("Contact audit exceeded the expected size");
}

function value(contact, property) {
  const found = contact.properties?.[property];
  return found && typeof found === "object" && "value" in found ? found.value : found;
}

async function ensureProperties(api, keys = contactProperties) {
  const existing = await listAll(api, "/contact-properties");
  for (const key of keys)
    if (!existing.some((property) => property.key === key))
      await api("POST", "/contact-properties", { key, type: "string", fallback_value: null });
}

async function ensureEvent(api, name) {
  const events = await listAll(api, "/events");
  if (!events.some((event) => event.name === name)) await api("POST", "/events", { name });
}

async function changeStatus(api, contact, status, waitingId) {
  const current = value(contact, "pg_beta_status");
  if (status === "waiting" && current && !["waiting", "review"].includes(current))
    throw new Error("An invited, excluded, or active tester cannot silently return to waiting");
  await api("PATCH", `/contacts/${contact.id}`, {
    properties: { pg_beta_status: status, pg_status_updated_at: new Date().toISOString() },
  });
  const memberships = await listAll(api, `/contacts/${contact.id}/segments`);
  const belongs = memberships.some((segment) => segment.id === waitingId);
  if (status === "waiting" && !contact.unsubscribed && !belongs)
    await api("POST", `/contacts/${contact.id}/segments/${waitingId}`);
  if ((status !== "waiting" || contact.unsubscribed) && belongs)
    await api("DELETE", `/contacts/${contact.id}/segments/${waitingId}`);
}

async function prepareContacts(api, state) {
  const betaId = process.env.RESEND_AUDIENCE_BETA_ID;
  const newsletterId = process.env.RESEND_AUDIENCE_NEWSLETTER_ID;
  const segments = await listAll(api, "/segments");
  state.waitingSegmentId =
    segments.find((segment) => segment.name === WAITING_SEGMENT)?.id ??
    (await api("POST", "/segments", { name: WAITING_SEGMENT })).id;
  await saveState(state);
  const legacy = JSON.parse(await fs.readFile(path.join(folder, "mailerlite.json"), "utf8"));
  if (!legacy.consent?.includes("both"))
    throw new Error("Legacy list consent must be confirmed before importing");
  const suppressions = await listAll(api, "/suppressions");
  const suppressed = new Set(suppressions.map((item) => item.email.toLowerCase()));
  const report = {
    imported: 0,
    matched: 0,
    excluded: [],
    preservedOptOut: [],
    consent: legacy.consent,
  };
  for (const row of legacy.contacts) {
    const email = row.email.trim().toLowerCase();
    let contact = await api("GET", `/contacts/${encodeURIComponent(email)}`, undefined, true);
    if (contact?.unsubscribed || suppressed.has(email)) {
      report.preservedOptOut.push(email);
      continue;
    }
    if (!contact) {
      const created = await api("POST", "/contacts", {
        email,
        segments: [{ id: betaId }, { id: newsletterId }],
        properties: {
          pg_source: "mailerlite_user_confirmed",
          pg_legacy_joined_at: row.joined,
          pg_beta_status: "waiting",
        },
      });
      contact = await api("GET", `/contacts/${created.id}`);
      report.imported++;
    } else {
      report.matched++;
      const memberships = await listAll(api, `/contacts/${contact.id}/segments`);
      for (const id of [betaId, newsletterId])
        if (!memberships.some((segment) => segment.id === id))
          await api("POST", `/contacts/${contact.id}/segments/${id}`);
      await api("PATCH", `/contacts/${contact.id}`, {
        properties: { pg_source: "mailerlite_user_confirmed", pg_legacy_joined_at: row.joined },
      });
    }
  }
  const beta = await listAll(api, `/segments/${betaId}/contacts`);
  for (const entry of beta) {
    const contact = await api("GET", `/contacts/${entry.id}`);
    if (suppressed.has(contact.email.toLowerCase()) || isKnownTestAddress(contact.email)) {
      const reason = isKnownTestAddress(contact.email) ? "test" : "suppressed";
      await api("PATCH", `/contacts/${contact.id}`, { unsubscribed: true });
      await changeStatus(api, contact, reason, state.waitingSegmentId);
      report.excluded.push({ email: contact.email, reason });
    } else if (
      !contact.unsubscribed &&
      (!value(contact, "pg_beta_status") || value(contact, "pg_beta_status") === "waiting")
    ) {
      await changeStatus(api, contact, "waiting", state.waitingSegmentId);
    }
  }
  await fs.writeFile(path.join(folder, "contact-review.json"), JSON.stringify(report, null, 2), {
    mode: 0o600,
  });
  return report;
}

async function probeStart(api, state) {
  await ensureProperties(api, ["pg_beta_status", "pg_probe_result"]);
  await ensureEvent(api, "pg.probe.status-refresh.v1");
  const alias = (process.env.EMAIL_TEST_ADDRESSES ?? "").split(",")[0]?.trim();
  if (!alias) throw new Error("Set EMAIL_TEST_ADDRESSES to run the probe");
  const test = await api("GET", `/contacts/${encodeURIComponent(alias)}`);
  if (!isKnownTestAddress(test.email)) throw new Error("Probe requires the known test alias");
  state.probeContactId = test.id;
  await api("PATCH", `/contacts/${test.id}`, {
    properties: { pg_beta_status: "waiting", pg_probe_result: "pending" },
  });
  const probe = {
    name: "PharmaGuide temporary no-send status verification",
    status: "enabled",
    steps: [
      { key: "start", type: "trigger", config: { event_name: "pg.probe.status-refresh.v1" } },
      { key: "wait", type: "delay", config: { duration: "1m" } },
      {
        key: "nested",
        type: "condition",
        config: {
          type: "rule",
          field: "contact.properties.pg_beta_status",
          operator: "eq",
          value: "invited",
        },
      },
      {
        key: "flat",
        type: "condition",
        config: { type: "rule", field: "contact.pg_beta_status", operator: "eq", value: "invited" },
      },
      ...["nested", "flat", "neither"].map((result) => ({
        key: `result_${result}`,
        type: "contact_update",
        config: { properties: { pg_probe_result: result } },
      })),
    ],
    connections: [
      { from: "start", to: "wait" },
      { from: "wait", to: "nested" },
      { from: "nested", to: "result_nested", type: "condition_met" },
      { from: "nested", to: "flat", type: "condition_not_met" },
      { from: "flat", to: "result_flat", type: "condition_met" },
      { from: "flat", to: "result_neither", type: "condition_not_met" },
    ],
  };
  state.probeAutomationId = (await api("POST", "/automations", probe)).id;
  await saveState(state);
  await api("POST", "/events/send", { event: "pg.probe.status-refresh.v1", contact_id: test.id });
  await api("PATCH", `/contacts/${test.id}`, { properties: { pg_beta_status: "invited" } });
  console.log(
    JSON.stringify({ probe: "started", containsSendSteps: false, checkAfter: "about one minute" })
  );
}

async function probeCheck(api, state) {
  const contact = await api("GET", `/contacts/${state.probeContactId}`);
  const result = value(contact, "pg_probe_result");
  if (!["nested", "flat"].includes(result))
    throw new Error(`Contact-property refresh not yet qualified: ${result}`);
  state.conditionField =
    result === "nested" ? "contact.properties.pg_beta_status" : "contact.pg_beta_status";
  state.conditionVerifiedAt = new Date().toISOString();
  const runs = await listAll(api, `/automations/${state.probeAutomationId}/runs`);
  await fs.writeFile(
    path.join(folder, "no-send-verification.json"),
    JSON.stringify({ result, runs, verifiedAt: state.conditionVerifiedAt }, null, 2),
    { mode: 0o600 }
  );
  await api("POST", `/automations/${state.probeAutomationId}/stop`);
  await api("DELETE", `/automations/${state.probeAutomationId}`);
  await api("PATCH", `/contacts/${state.probeContactId}`, {
    properties: { pg_beta_status: "test", pg_probe_result: null },
  });
  delete state.probeAutomationId;
  await saveState(state);
  console.log(JSON.stringify({ conditionVerified: state.conditionField, noEmailSent: true }));
}

async function prepareDrafts(api, state) {
  if (!state.topics?.beta || !state.topics?.newsletter)
    throw new Error("Prepare separate topic preferences first");
  if (!state.conditionVerifiedAt) throw new Error("Verify the live contact-status condition first");
  const automations = await listAll(api, "/automations");
  const existingAutomation = automations.find((automation) => automation.name === AUTOMATION_NAME);
  if (existingAutomation?.status === "enabled")
    throw new Error("Do not edit an enabled sequence during review");
  const templates = await listAll(api, "/templates");
  state.templates ??= {};
  const from = "Sean at PharmaGuide <hello@pharmaguide.io>";
  const reply_to = [process.env.RESEND_REPLY_TO_EMAIL || "info@pharmaguide.io"];
  for (const key of ["day5", "day14"]) {
    const campaign = campaigns[key];
    const content = await renderCampaign(campaign);
    const existing = templates.find((template) => template.alias === `pg-beta-${key}-v1`);
    const body = {
      name: campaign.name,
      alias: `pg-beta-${key}-v1`,
      subject: campaign.subject,
      from,
      reply_to,
      variables: [{ key: "BETA_UNSUBSCRIBE_URL", type: "string" }, ...(key === "day14" ? [{ key: "BETA_POLL_URL", type: "string" }] : [])],
      ...content,
    };
    if (existing) await api("PATCH", `/templates/${existing.id}`, body);
    else state.templates[key] = (await api("POST", "/templates", body)).id;
    state.templates[key] ??= existing.id;
    await saveState(state);
    await api("POST", `/templates/${state.templates[key]}/publish`);
  }
  await ensureEvent(api, WAITING_EVENT);
  const existing = existingAutomation;
  if (existing?.status === "enabled")
    throw new Error("Do not edit an enabled sequence during review");
  const graph = waitingAutomation(state.templates, state.conditionField);
  if (existing) {
    await api("PATCH", `/automations/${existing.id}`, graph);
    state.automationId = existing.id;
  } else state.automationId = (await api("POST", "/automations", graph)).id;
  await saveState(state);
  const broadcasts = await listAll(api, "/broadcasts");
  state.broadcasts ??= {};
  for (const key of ["reconnect", "newsletter"]) {
    const campaign = campaigns[key];
    const body = {
      name: campaign.name,
      from,
      reply_to,
      subject: campaign.subject,
      segment_id:
        key === "reconnect" ? state.waitingSegmentId : process.env.RESEND_AUDIENCE_NEWSLETTER_ID,
      topic_id: state.topics[key === "reconnect" ? "beta" : "newsletter"],
      ...(await renderCampaign(campaign)),
    };
    const existing = broadcasts.find((broadcast) => broadcast.name === campaign.name);
    if (existing && existing.status !== "draft")
      throw new Error("Do not overwrite a scheduled or sent broadcast");
    if (existing) {
      await api("PATCH", `/broadcasts/${existing.id}`, body);
      state.broadcasts[key] = existing.id;
    } else state.broadcasts[key] = (await api("POST", "/broadcasts", { ...body, send: false })).id;
    await saveState(state);
  }
  console.log(
    JSON.stringify({
      automationId: state.automationId,
      status: "disabled",
      broadcastDrafts: state.broadcasts,
      noEmailSent: true,
    })
  );
}

async function signingKey() {
  const settingsFile = path.join(folder, "deployment.env");
  try {
    const existing = (await fs.readFile(settingsFile, "utf8")).match(
      /^EMAIL_UNSUBSCRIBE_SECRET=(.+)$/m
    )?.[1];
    if (existing) return existing;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const key = process.env.EMAIL_UNSUBSCRIBE_SECRET || randomBytes(32).toString("hex");
  await fs.writeFile(settingsFile, `EMAIL_UNSUBSCRIBE_SECRET=${key}\n`, { mode: 0o600 });
  return key;
}

async function prepareTopics(api, state) {
  await ensureProperties(api);
  const existing = await listAll(api, "/topics");
  state.topics ??= {};
  state.topicMigration ??= [];
  const key = await signingKey();
  for (const [list, name, segmentId] of [
    ["beta", "PharmaGuide beta invitations and updates", process.env.RESEND_AUDIENCE_BETA_ID],
    ["newsletter", "PharmaGuide monthly notes", process.env.RESEND_AUDIENCE_NEWSLETTER_ID],
  ]) {
    const named = existing.find((topic) => topic.name === name);
    const owned = state.topics[list];
    state.topics[list] ??=
      named?.id ?? (await api("POST", "/topics", { name, default_subscription: "opt_in" })).id;
    if (owned && named?.default_subscription === "opt_out" && !state.topicDefaultsQualified)
      throw new Error("Owned draft topics need the one-time default-preference upgrade");
    await saveState(state);
    const contacts = await listAll(api, `/segments/${segmentId}/contacts`);
    for (const contact of contacts) {
      if (contact.unsubscribed) continue;
      const preferences = await listAll(api, `/contacts/${contact.id}/topics`);
      if (
        preferences.find((topic) => topic.id === state.topics[list])?.subscription === "opt_out"
      ) {
        if (list === "beta")
          await changeStatus(api, contact, "unsubscribed", state.waitingSegmentId);
        continue;
      }
      if (list === "beta") {
        const payload = Buffer.from(
          JSON.stringify({ contactId: contact.id, list: "beta" })
        ).toString("base64url");
        const signature = createHmac("sha256", key)
          .update(`email-unsubscribe-v1:${payload}`)
          .digest("base64url");
        const url = `https://pharmaguide.io/email/unsubscribe?token=${payload}.${signature}`;
        await api("PATCH", `/contacts/${contact.id}`, {
          properties: { pg_beta_unsubscribe_url: url },
        });
      }
    }
  }
  state.topicDefaultsQualified = true;
  await saveState(state);
  console.log(JSON.stringify({ topicsPrepared: true, consentPreserved: true, noEmailSent: true }));
}

async function upgradeDraftTopics(api, state) {
  if (state.topicDefaultsQualified) return;
  const automation = await api("GET", `/automations/${state.automationId}`);
  if (automation.status !== "disabled")
    throw new Error("Preference upgrade requires the sequence to remain disabled");
  const broadcasts = await listAll(api, "/broadcasts");
  if (
    broadcasts.some(
      (broadcast) =>
        Object.values(state.broadcasts ?? {}).includes(broadcast.id) && broadcast.status !== "draft"
    )
  )
    throw new Error("Preference upgrade cannot change a sent or scheduled broadcast");
  state.archivedTopics ??= {};
  for (const [list, name, segmentId] of [
    ["beta", "PharmaGuide Beta", process.env.RESEND_AUDIENCE_BETA_ID],
    ["newsletter", "PharmaGuide Newsletter", process.env.RESEND_AUDIENCE_NEWSLETTER_ID],
  ]) {
    const oldId = state.topics[list];
    const topics = await listAll(api, "/topics");
    const found = topics.find((topic) => topic.name === name);
    const newId =
      found?.id ?? (await api("POST", "/topics", { name, default_subscription: "opt_in" })).id;
    if (oldId !== newId) {
      const contacts = await listAll(api, `/segments/${segmentId}/contacts`);
      for (const contact of contacts) {
        const preferences = await listAll(api, `/contacts/${contact.id}/topics`);
        if (preferences.find((topic) => topic.id === oldId)?.subscription === "opt_out")
          await api("PATCH", `/contacts/${contact.id}/topics`, [
            { id: newId, subscription: "opt_out" },
          ]);
      }
      await api("PATCH", `/topics/${oldId}`, {
        name: `Archived setup: ${list}`,
        visibility: "private",
      });
      state.archivedTopics[list] = oldId;
      state.topics[list] = newId;
      await saveState(state);
    }
  }
  state.topicDefaultsQualified = true;
  await saveState(state);
  console.log(
    JSON.stringify({
      topicDefaultsQualified: true,
      previousOptOutsPreserved: true,
      noEmailSent: true,
    })
  );
}

async function prepareWebhook(api, state) {
  const endpoint = "https://pharmaguide.io/api/email-events";
  const webhooks = await listAll(api, "/webhooks");
  const existing = webhooks.find(
    (webhook) => webhook.id === state.webhookId || webhook.endpoint === endpoint ||
      webhook.endpoint === "https://www.pharmaguide.io/api/email-events"
  );
  const events = [
    "email.sent",
    "email.delivered",
    "email.delivery_delayed",
    "email.failed",
    "email.bounced",
    "email.complained",
    "email.suppressed",
    "contact.updated",
  ];
  if (existing?.status === "enabled") throw new Error("Do not alter a live webhook during review");
  const created = existing ?? (await api("POST", "/webhooks", { endpoint, events }));
  await api("PATCH", `/webhooks/${created.id}`, { status: "disabled", events });
  const webhook = await api("GET", `/webhooks/${created.id}`);
  if (webhook.status !== "disabled" || !webhook.signing_secret)
    throw new Error("Tracking webhook was not confirmed disabled");
  state.webhookId = created.id;
  const settingsFile = path.join(folder, "deployment.env");
  const key = await signingKey();
  await fs.writeFile(
    settingsFile,
    `EMAIL_UNSUBSCRIBE_SECRET=${key}\nRESEND_WEBHOOK_SECRET=${webhook.signing_secret}\nRESEND_BETA_WAITING_SEGMENT_ID=${state.waitingSegmentId}\nRESEND_BETA_TOPIC_ID=${state.topics.beta}\nRESEND_NEWSLETTER_TOPIC_ID=${state.topics.newsletter}\nRESEND_WAITING_SEQUENCE_ENABLED=false\n`,
    { mode: 0o600 }
  );
  await saveState(state);
}

async function pollReport(api, state) {
  const contacts = await listAll(api, `/segments/${process.env.RESEND_AUDIENCE_BETA_ID}/contacts`);
  const rows = [];
  for (const entry of contacts) {
    const contact = await api("GET", `/contacts/${entry.id}`);
    const topics = await listAll(api, `/contacts/${entry.id}/topics`);
    rows.push({
      email: contact.email,
      betaStatus: value(contact, "pg_beta_status"),
      subscribed: !contact.unsubscribed && !isKnownTestAddress(contact.email) &&
        !["hard_bounced", "complained", "suppressed", "unsubscribed", "test", "excluded"].includes(value(contact, "pg_beta_status")) &&
        topics.some(topic => topic.id === state.topics?.beta && topic.subscription === "opt_in"),
      choice: value(contact, "pg_beta_interest"),
      answeredAt: value(contact, "pg_beta_interest_at"),
    });
  }
  const report = buildPollReport(rows);
  for (const [extension, content] of [
    ["json", JSON.stringify(report, null, 2)], ["csv", reportCsv(report)], ["html", reportHtml(report)],
  ]) await fs.writeFile(path.join(folder, `poll-report.${extension}`), content, { mode: 0o600 });
  console.log(JSON.stringify({ pollReport: report.summary, privateReport: path.join(folder, "poll-report.html"), noEmailSent: true }));
}

async function review(api, state) {
  const beta = await listAll(api, `/segments/${process.env.RESEND_AUDIENCE_BETA_ID}/contacts`);
  const newsletter = await listAll(
    api,
    `/segments/${process.env.RESEND_AUDIENCE_NEWSLETTER_ID}/contacts`
  );
  const waiting = state.waitingSegmentId
    ? await listAll(api, `/segments/${state.waitingSegmentId}/contacts`)
    : [];
  const newsletterIds = new Set(newsletter.map((contact) => contact.id));
  const betaIds = new Set(beta.map((contact) => contact.id));
  const waitingIds = new Set(waiting.map((contact) => contact.id));
  const allContacts = new Map([...beta, ...newsletter].map((contact) => [contact.id, contact]));
  const rows = [];
  for (const entry of allContacts.values()) {
    const contact = await api("GET", `/contacts/${entry.id}`);
    const topics = await listAll(api, `/contacts/${entry.id}/topics`);
    const hasTopic = (list) =>
      !contact.unsubscribed &&
      topics.some((topic) => topic.id === state.topics?.[list] && topic.subscription === "opt_in");
    const betaMember = betaIds.has(contact.id);
    const subscribed = betaMember && hasTopic("beta");
    rows.push({
      email: contact.email,
      betaStatus: betaMember ? value(contact, "pg_beta_status") || "review" : "not on beta list",
      betaMember,
      subscribed,
      waiting:
        subscribed && waitingIds.has(contact.id) && value(contact, "pg_beta_status") === "waiting",
      newsletter: newsletterIds.has(contact.id) && hasTopic("newsletter"),
      delivery: value(contact, "pg_delivery_status") || "unknown",
    });
  }
  const summary = {
    betaSubscribed: rows.filter((contact) => contact.subscribed).length,
    newsletterSubscribed: rows.filter((contact) => contact.newsletter).length,
    waiting: rows.filter((contact) => contact.waiting).length,
    excluded: rows.filter((contact) => contact.betaMember && !contact.subscribed).length,
    automationId: state.automationId,
    automationStatus: state.automationId
      ? (await api("GET", `/automations/${state.automationId}`)).status
      : "not_prepared",
    broadcasts: state.broadcasts,
  };
  await fs.writeFile(
    path.join(folder, "review.json"),
    JSON.stringify({ summary, contacts: rows }, null, 2),
    { mode: 0o600 }
  );
  const previews = Object.entries(campaigns)
    .map(
      ([key, campaign]) =>
        `<h2>${escapeHtml(campaign.subject)}</h2><p>${escapeHtml(campaign.name)}</p><iframe title="${escapeHtml(campaign.name)}" src="${key}.html" style="width:100%;height:620px;border:1px solid #ddd"></iframe>`
    )
    .join("");
  const previewFolder = path.join(folder, "preview");
  await fs.mkdir(previewFolder, { recursive: true, mode: 0o700 });
  for (const [key, campaign] of Object.entries(campaigns))
    await fs.writeFile(path.join(previewFolder, `${key}.html`), (await renderCampaign(campaign)).html);
  const table = rows
    .map(
      (row) =>
        `<tr><td>${escapeHtml(row.email)}</td><td>${escapeHtml(row.betaStatus)}</td><td>${row.subscribed ? "Yes" : "No"}</td><td>${row.newsletter ? "Yes" : "No"}</td><td>${escapeHtml(row.delivery)}</td></tr>`
    )
    .join("");
  await fs.writeFile(
    path.join(previewFolder, "review.html"),
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PharmaGuide email review</title><body style="font:16px/1.6 Arial;max-width:1000px;margin:40px auto;padding:20px;color:#183b3f"><h1>PharmaGuide email review</h1><p>Sequence status: ${escapeHtml(summary.automationStatus)}. Broadcasts require separate approval. This review sent no email. Footer links in these previews are placeholders.</p><p>${summary.betaSubscribed} active beta contacts · ${summary.newsletterSubscribed} newsletter contacts · ${summary.waiting} waiting · ${summary.excluded} excluded</p><h2>Recipients and status</h2><div style="overflow-x:auto"><table cellpadding="8"><thead><tr><th>Email</th><th>Beta status</th><th>Beta subscribed</th><th>Newsletter subscribed</th><th>Delivery</th></tr></thead><tbody>${table}</tbody></table></div>${previews}</body></html>`,
    { mode: 0o600 }
  );
  const copy = Object.values(campaigns)
    .map(
      (campaign) =>
        `## ${campaign.name}\n\nSubject: ${campaign.subject}\n\n${campaign.paragraphs.join("\n\n")}\n\n${campaign.link ? `[${campaign.link.label}](${campaign.link.href})\n\n` : ""}${campaign.closing ? campaign.closing + "\n\n" : ""}Sean\nFounder, PharmaGuide\n`
    )
    .join("\n\n");
  await fs.writeFile(
    path.join(previewFolder, "messages.md"),
    `# Email drafts for review\n\nThis review sent or scheduled no emails. Sequence status: ${summary.automationStatus}. Broadcasts require separate approval.\n\n${summary.betaSubscribed} active beta contacts; ${summary.newsletterSubscribed} newsletter contacts; ${summary.excluded} excluded.\n\n${copy}`,
    { mode: 0o600 }
  );
  console.log(JSON.stringify(summary));
}

async function refreshDelivery(api, state) {
  const contacts = await listAll(api, `/segments/${process.env.RESEND_AUDIENCE_BETA_ID}/contacts`);
  const byEmail = new Map(contacts.map((contact) => [contact.email.toLowerCase(), contact]));
  const suppressions = await listAll(api, "/suppressions");
  const recent = await listAll(api, "/emails");
  const updated = new Set();
  for (const suppression of suppressions) {
    const contact = byEmail.get(suppression.email.toLowerCase());
    if (!contact) continue;
    await api("PATCH", `/contacts/${contact.id}`, {
      unsubscribed: true,
      properties: {
        pg_delivery_status: suppression.origin === "bounce" ? "hard_bounced" : "suppressed",
        pg_delivery_updated_at: suppression.created_at,
      },
    });
    await changeStatus(api, contact, "suppressed", state.waitingSegmentId);
    updated.add(contact.id);
  }
  for (const contact of contacts.filter((contact) => isKnownTestAddress(contact.email))) {
    await api("PATCH", `/contacts/${contact.id}`, {
      unsubscribed: true,
      properties: { pg_delivery_status: "test_account" },
    });
    await changeStatus(api, contact, "test", state.waitingSegmentId);
    updated.add(contact.id);
  }
  for (const message of recent) {
    if (!message.from?.match(/@pharmaguide\.io>?$/i)) continue;
    for (const address of message.to ?? []) {
      const contact = byEmail.get(address.toLowerCase());
      if (!contact || updated.has(contact.id) || contact.unsubscribed) continue;
      const current = await api("GET", `/contacts/${contact.id}`);
      const previous = value(current, "pg_delivery_updated_at");
      if (!previous || new Date(previous) < new Date(message.created_at))
        await api("PATCH", `/contacts/${contact.id}`, {
          properties: {
            pg_delivery_status: message.last_event,
            pg_delivery_updated_at: message.created_at,
          },
        });
      updated.add(contact.id);
    }
  }
  console.log(JSON.stringify({ deliveryRecordsRefreshed: updated.size, noEmailSent: true }));
}

async function main() {
  await fs.mkdir(folder, { recursive: true, mode: 0o700 });
  const command = process.argv[2] ?? "review";
  const api = createClient({
    apiKey: process.env.RESEND_API_KEY,
    probe: command.startsWith("probe-"),
  });
  const state = await readState();
  if (command === "poll-report") return pollReport(api, state);
  if (command === "probe-start") return probeStart(api, state);
  if (command === "probe-check") return probeCheck(api, state);
  if (command === "topics") return prepareTopics(api, state);
  if (command === "topics-upgrade") return upgradeDraftTopics(api, state);
  if (command === "delivery") {
    await refreshDelivery(api, state);
    return review(api, state);
  }
  if (command === "drafts") {
    await prepareDrafts(api, state);
    await prepareWebhook(api, state);
    return review(api, state);
  }
  if (command === "refresh-drafts") {
    await ensureProperties(api);
    const key = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY;
    const contacts = await listAll(api, `/segments/${process.env.RESEND_AUDIENCE_BETA_ID}/contacts`);
    for (const contact of contacts) {
      const url = pollUrl(contact.id, key);
      const current = await api("GET", `/contacts/${contact.id}`);
      if (value(current, "pg_beta_poll_url") !== url)
        await api("PATCH", `/contacts/${contact.id}`, { properties: { pg_beta_poll_url: url } });
    }
    await prepareDrafts(api, state);
    return review(api, state);
  }
  if (command === "prepare") {
    const domains = await listAll(api, "/domains");
    const domain = domains.find((domain) => domain.name === "pharmaguide.io");
    if (domain?.status !== "verified" || domain.capabilities?.sending !== "enabled")
      throw new Error("PharmaGuide sending domain is not verified and enabled");
    await ensureProperties(api);
    console.log(
      JSON.stringify({
        domainVerified: true,
        stage: "Preparing contacts without sending or enrolling",
      })
    );
    const report = await prepareContacts(api, state);
    console.log(
      JSON.stringify({
        imported: report.imported,
        matched: report.matched,
        excluded: report.excluded.length,
        preservedOptOut: report.preservedOptOut.length,
      })
    );
    await prepareTopics(api, state);
    await prepareDrafts(api, state);
    await prepareWebhook(api, state);
    return review(api, state);
  }
  if (command === "status") {
    const email = process.argv[3];
    const status = process.argv[4];
    if (
      ![
        "invited",
        "access_confirmed",
        "first_check_confirmed",
        "feedback_received",
        "test",
      ].includes(status)
    )
      throw new Error(
        "Choose invited, access_confirmed, first_check_confirmed, feedback_received, or test"
      );
    const contact = await api("GET", `/contacts/${encodeURIComponent(email)}`);
    const memberships = await listAll(api, `/contacts/${contact.id}/segments`);
    if (!memberships.some((segment) => segment.id === process.env.RESEND_AUDIENCE_BETA_ID))
      throw new Error("Contact is not in the PharmaGuide beta list");
    await changeStatus(api, contact, status, state.waitingSegmentId);
    console.log(JSON.stringify({ status, waitingEmailsStopped: true, invitationSent: false }));
    return;
  }
  if (command === "review") return review(api, state);
  throw new Error(
    "Choose prepare, review, status, probe-start, or probe-check. Sending is intentionally unavailable."
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
