import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { isKnownTestAddress, waitingAutomation } from "./lib/email-campaigns.mjs";
const folder = path.resolve(".tmp/email-review");
const statePath = path.join(folder, "journey-v2-state.json");
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function assertDraftRequest(method, resource, body = {}) {
  if (method === "GET") return;
  if (body.send || body.scheduled_at || body.status === "enabled")
    throw Error("Review only: no sending, scheduling or activation");
  const allowed =
    (method === "POST" && ["/templates", "/broadcasts", "/segments"].includes(resource)) ||
    (method === "POST" &&
      resource === "/topics" &&
      body.default_subscription === "opt_out" &&
      body.visibility === "private") ||
    (method === "PATCH" && /^\/(templates|broadcasts)\/[a-zA-Z0-9-]+$/.test(resource)) ||
    (method === "PATCH" &&
      /^\/automations\/[a-zA-Z0-9-]+$/.test(resource) &&
      body.status === "disabled") ||
    (method === "POST" && /^\/contacts\/[a-zA-Z0-9-]+\/segments\/[a-zA-Z0-9-]+$/.test(resource));
  if (!allowed) throw Error("Review-only operation rejected");
}
export function catchupEligible(contact, messages, now = Date.now()) {
  if (
    !contact.subscribed ||
    !contact.waiting ||
    contact.betaStatus !== "waiting" ||
    isKnownTestAddress(contact.email) ||
    ["hard_bounced", "complained", "bounced", "suppressed", "test"].includes(contact.delivery)
  )
    return false;
  return !messages.some(
    (m) =>
      /@pharmaguide\.io>?$/i.test(m.from || "") &&
      (m.to || []).some((a) => a.toLowerCase() === contact.email.toLowerCase()) &&
      (!Number.isFinite(Date.parse(m.created_at)) || now - Date.parse(m.created_at) < 7 * 86400000)
  );
}
export function newsletterEligible(contact, messages, catchupIds, now = Date.now()) {
  if (
    !contact.subscribed ||
    isKnownTestAddress(contact.email) ||
    catchupIds.has(contact.id) ||
    ["hard_bounced", "complained", "bounced", "suppressed", "test"].includes(contact.delivery)
  )
    return false;
  if (
    contact.betaStatus === "waiting" &&
    ["enrolled", "needs_review"].includes(contact.sequenceStatus)
  )
    return false;
  const history = messages.filter(
    (m) =>
      /@pharmaguide\.io>?$/i.test(m.from || "") &&
      (m.to || []).some((a) => a.toLowerCase() === contact.email.toLowerCase())
  );
  return !history.some(
    (m) =>
      !Number.isFinite(Date.parse(m.created_at)) ||
      now - Date.parse(m.created_at) < 7 * 86400000 ||
      (now - Date.parse(m.created_at) < 30 * 86400000 &&
        /medication.*nutrient|missing warning|what if a supplement|one bottle|basket gets recalled/i.test(
          m.subject || ""
        ))
  );
}
export function assertBroadcastTarget(actual, expected) {
  if (actual.segment_id !== expected.segment_id || actual.topic_id !== expected.topic_id)
    throw Error("Broadcast audience or topic readback mismatch");
}
async function main() {
  if (process.argv[2] !== "prepare")
    throw Error("Use prepare; this command cannot send or activate");
  const { journey, renderJourney } = await import("./lib/email-journey-v2.mjs");
  const original = JSON.parse(await fs.readFile(path.join(folder, "resend-state.json"), "utf8"));
  let state;
  try {
    state = JSON.parse(await fs.readFile(statePath, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    state = { templates: {}, hashes: {}, broadcasts: {} };
  }
  const save = () => fs.writeFile(statePath, JSON.stringify(state, null, 2), { mode: 0o600 });
  async function api(method, resource, body) {
    assertDraftRequest(method, resource, body);
    let r;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        r = await fetch("https://api.resend.com" + resource, {
          method,
          headers: {
            Authorization: "Bearer " + process.env.RESEND_API_KEY,
            "Content-Type": "application/json",
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
          signal: AbortSignal.timeout(20000),
        });
        break;
      } catch (error) {
        if (method !== "GET" || attempt)
          throw Error(`Provider timeout during ${method} ${resource.split("?")[0]}`, {
            cause: error,
          });
      }
    }
    const d = await r.json();
    await new Promise((r) => setTimeout(r, 700));
    if (!r.ok) {
      const error = Error(
        `Resend ${method} ${resource.split("?")[0]} ${r.status}: ${d.message || d.name}`
      );
      error.status = r.status;
      throw error;
    }
    return d;
  }
  async function list(resource) {
    let rows = [],
      after;
    for (let i = 0; i < 100; i++) {
      const d = await api(
        "GET",
        resource +
          (resource.includes("?") ? "&" : "?") +
          "limit=100" +
          (after ? "&after=" + encodeURIComponent(after) : "")
      );
      rows.push(...d.data);
      if (!d.has_more) return rows;
      after = d.data.at(-1)?.id;
      if (!after) throw Error("Incomplete provider pagination");
    }
    throw Error("Pagination bound exceeded");
  }
  const automation = await api("GET", "/automations/" + original.automationId);
  if (automation.status !== "disabled")
    throw Error("Automation must already be disabled before review setup");
  const broadcasts = {};
  for (const [key, id] of Object.entries(original.broadcasts)) {
    broadcasts[key] = await api("GET", "/broadcasts/" + id);
    if (broadcasts[key].status !== "draft" || broadcasts[key].scheduled_at)
      throw Error("Existing broadcast is not an unscheduled draft");
  }
  const snapshotFile = path.join(folder, "v2-before-mutations.json");
  try {
    await fs.writeFile(snapshotFile, JSON.stringify({ automation, broadcasts }, null, 2), {
      mode: 0o600,
      flag: "wx",
    });
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }
  const existing = await list("/templates");
  const preview = path.join(folder, "preview-v2");
  await fs.mkdir(preview, { recursive: true, mode: 0o700 });
  for (const [key, def] of Object.entries(journey)) {
    const content = await renderJourney(key);
    await fs.writeFile(path.join(preview, key + ".html"), content.html, { mode: 0o600 });
    const body = {
      name: "PharmaGuide · " + key + " · review v2",
      alias: def.alias,
      subject: def.subject,
      from: "Sean at PharmaGuide <hello@pharmaguide.io>",
      reply_to: ["info@pharmaguide.io"],
      variables: def.variables,
      ...content,
    };
    const found = existing.find((t) => t.alias === def.alias);
    if (found) {
      const current = await api("GET", "/templates/" + found.id);
      if (current.status !== "draft") throw Error("Do not overwrite a published v2 template");
      if (
        state.hashes[key] &&
        state.hashes[key] !==
          hash({ subject: current.subject, html: current.html, text: current.text })
      )
        throw Error("Dashboard copy changed; preserve edits and reconcile manually: " + key);
      if (
        current.html !== body.html ||
        current.text !== body.text ||
        current.subject !== body.subject
      )
        await api("PATCH", "/templates/" + found.id, body);
      state.templates[key] = found.id;
    } else state.templates[key] = (await api("POST", "/templates", body)).id;
    const read = await api("GET", "/templates/" + state.templates[key]);
    if (
      read.status !== "draft" ||
      read.subject !== body.subject ||
      read.html !== body.html ||
      read.text !== body.text
    )
      throw Error("Template readback mismatch: " + key);
    state.hashes[key] = hash({ subject: read.subject, html: read.html, text: read.text });
    await save();
  }
  const graph = waitingAutomation(
    { day5: state.templates.day5, day14: state.templates.day14 },
    original.conditionField
  );
  // The revised Day14 no longer has a poll variable.
  delete graph.steps.find((s) => s.key === "day14").config.template.variables.BETA_POLL_URL;
  await fs.writeFile(
    path.join(folder, "waiting-v2-proposed.json"),
    JSON.stringify(graph, null, 2),
    { mode: 0o600 }
  );
  try {
    await api("PATCH", "/automations/" + original.automationId, graph);
    state.automationGraph = "updated_disabled";
  } catch (e) {
    if (e.status !== 400 && e.status !== 422) throw e;
    state.automationGraph = "awaits_template_publication";
    state.automationGraphReason = e.message;
  }
  await save();
  const emails = await list("/emails");
  const beta = await list("/segments/" + process.env.RESEND_AUDIENCE_BETA_ID + "/contacts");
  console.log("Nine draft templates verified. Auditing current catch-up eligibility.");
  const contacts = [];
  for (const c of beta) {
    const current = await api("GET", "/contacts/" + c.id);
    const topics = await list("/contacts/" + c.id + "/topics");
    const value = (k) => current.properties?.[k]?.value ?? current.properties?.[k];
    const subscribed =
      !current.unsubscribed &&
      topics.some((t) => t.id === original.topics.beta && t.subscription === "opt_in");
    const row = {
      id: c.id,
      email: current.email,
      subscribed,
      waiting: value("pg_beta_status") === "waiting",
      betaStatus: value("pg_beta_status"),
      delivery: value("pg_delivery_status") || "unknown",
    };
    if (catchupEligible(row, emails)) contacts.push(row);
  }
  await list("/segments");
  // Review broadcasts are always held. Exact send targeting is a separate
  // approved step, never inferred from operational segment membership.
  state.catchupSegmentId = original.waitingSegmentId;
  state.catchupTargeting = "held_zero_recipients_pending_filtered_cohort";
  await fs.writeFile(
    path.join(folder, "catchup-v2-contacts.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), contacts }, null, 2),
    { mode: 0o600 }
  );
  console.log("Catch-up eligibility recorded. Checking newsletter exclusions.");
  const newsletterContacts = await list(
    "/segments/" + process.env.RESEND_AUDIENCE_NEWSLETTER_ID + "/contacts"
  );
  const newsletterCandidates = [];
  const catchupIds = new Set(contacts.map((c) => c.id));
  for (const c of newsletterContacts) {
    const current = await api("GET", "/contacts/" + c.id);
    const topics = await list("/contacts/" + c.id + "/topics");
    const value = (k) => current.properties?.[k]?.value ?? current.properties?.[k];
    const row = {
      id: c.id,
      email: current.email,
      subscribed:
        !current.unsubscribed &&
        topics.some((t) => t.id === original.topics.newsletter && t.subscription === "opt_in"),
      betaStatus: value("pg_beta_status"),
      sequenceStatus: value("pg_sequence_status"),
      delivery: value("pg_delivery_status") || "unknown",
    };
    if (newsletterEligible(row, emails, catchupIds)) newsletterCandidates.push(row);
  }
  // There is no spare segment for a filtered newsletter cohort. Hold its
  // broadcast on a private opt-out-default topic with no subscribers, instead
  // of targeting the full overlapping list. Never alter any consent to fill it.
  const topics = await list("/topics");
  const holdName = "PharmaGuide review hold (no sends)";
  state.newsletterHoldTopicId ??= topics.find((t) => t.name === holdName)?.id;
  if (!state.newsletterHoldTopicId) {
    state.newsletterHoldTopicId = (
      await api("POST", "/topics", {
        name: holdName,
        default_subscription: "opt_out",
        visibility: "private",
      })
    ).id;
    await save();
  }
  const hold = await api("GET", "/topics/" + state.newsletterHoldTopicId);
  if (hold.default_subscription !== "opt_out" || hold.visibility !== "private")
    throw Error("Review hold topic configuration changed");
  for (const c of [...new Map([...newsletterContacts, ...beta].map((c) => [c.id, c])).values()]) {
    const subscriptions = await list("/contacts/" + c.id + "/topics");
    if (
      subscriptions.some((t) => t.id === state.newsletterHoldTopicId && t.subscription === "opt_in")
    )
      throw Error("Review hold must have no subscribed recipients");
  }
  state.newsletterSegmentId = process.env.RESEND_AUDIENCE_NEWSLETTER_ID;
  state.newsletterCount = newsletterCandidates.length;
  state.newsletterTargeting = "held_zero_recipients_pending_final_cohort";
  await fs.writeFile(
    path.join(folder, "newsletter-v2-contacts.json"),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), contacts: newsletterCandidates },
      null,
      2
    ),
    { mode: 0o600 }
  );
  for (const [key, oldKey] of [
    ["catchup", "reconnect"],
    ["newsletter", "newsletter"],
  ]) {
    const def = journey[key];
    const body = {
      name: def.name,
      from: "Sean at PharmaGuide <hello@pharmaguide.io>",
      reply_to: ["info@pharmaguide.io"],
      subject: def.subject,
      segment_id: key === "catchup" ? state.catchupSegmentId : state.newsletterSegmentId,
      topic_id: state.newsletterHoldTopicId,
      ...(await renderJourney(key)),
    };
    const id = original.broadcasts[oldKey];
    await api("PATCH", "/broadcasts/" + id, body);
    const read = await api("GET", "/broadcasts/" + id);
    assertBroadcastTarget(read, body);
    if (
      read.status !== "draft" ||
      read.scheduled_at ||
      read.subject !== body.subject ||
      read.html !== body.html
    )
      throw Error("Broadcast readback mismatch");
    state.broadcasts[key] = id;
    await save();
  }
  const final = await api("GET", "/automations/" + original.automationId);
  if (final.status !== "disabled") throw Error("Automation is not disabled");
  state.automationId = original.automationId;
  state.status = "review_only";
  state.preparedAt = new Date().toISOString();
  state.catchupCount = contacts.length;
  await save();
  const links = Object.fromEntries(
    Object.entries(state.templates).map(([k, id]) => [k, "https://resend.com/templates/" + id])
  );
  const report = {
    preparedAt: state.preparedAt,
    templates: links,
    broadcasts: Object.fromEntries(
      Object.entries(state.broadcasts).map(([k, id]) => [k, "https://resend.com/broadcasts/" + id])
    ),
    automation: "https://resend.com/automations/" + state.automationId,
    automationStatus: final.status,
    automationGraph: state.automationGraph,
    automationGraphReason: state.automationGraphReason,
    catchupCount: contacts.length,
    catchupTargeting: state.catchupTargeting,
    newsletterCount: newsletterCandidates.length,
    newsletterTargeting: state.newsletterTargeting,
    catchupSegment: "https://resend.com/segments/" + state.catchupSegmentId,
    noEmailSent: true,
    noTemplatesPublished: true,
  };
  await fs.writeFile(path.join(folder, "v2-review-links.json"), JSON.stringify(report, null, 2), {
    mode: 0o600,
  });
  console.log(JSON.stringify(report));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
