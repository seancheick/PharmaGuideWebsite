import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isKnownTestAddress } from "./lib/email-campaigns.mjs";
const folder = ".tmp/email-review";
export function classifySignups(contacts, messages, now = Date.now()) {
  const unique = new Map();
  for (const c of contacts) {
    const key = c.email.toLowerCase().trim();
    if (unique.has(key) && unique.get(key).id !== c.id)
      throw Error("Duplicate provider records need review");
    unique.set(key, c);
  }
  const rows = [...unique.values()].map((c) => {
    const history = messages.filter(
      (m) =>
        /@pharmaguide\.io>?$/i.test(m.from || "") &&
        (m.to || []).some((a) => a.toLowerCase() === c.email.toLowerCase())
    );
    const recent = history.some(
      (m) =>
        !Number.isFinite(Date.parse(m.created_at)) || now - Date.parse(m.created_at) < 7 * 86400000
    );
    let cohort = "excluded";
    if (
      !isKnownTestAddress(c.email) &&
      !["suppressed", "test"].includes(c.status) &&
      !["hard_bounced", "complained", "bounced", "suppressed"].includes(c.delivery)
    ) {
      if (c.beta && c.status !== "unsubscribed") {
        cohort = [
          "invited",
          "access_confirmed",
          "first_check_confirmed",
          "feedback_received",
        ].includes(c.status)
          ? "beta_access"
          : c.status && c.status !== "waiting"
            ? "needs_review"
            : recent
              ? "beta_recent_wait"
              : "beta_catchup_ready";
      } else if (c.newsletter) cohort = "newsletter_only";
    }
    return {
      ...c,
      cohort,
      historyCount: history.length,
      nextMarketingAfter:
        history
          .map((m) => Date.parse(m.created_at))
          .filter(Number.isFinite)
          .sort((a, b) => b - a)
          .slice(0, 1)
          .map((t) => new Date(t + 7 * 86400000).toISOString())[0] || null,
    };
  });
  return {
    rows,
    queueIds: rows.filter((r) => r.cohort === "beta_catchup_ready").map((r) => r.id),
    counts: rows.reduce((a, r) => ((a[r.cohort] = (a[r.cohort] || 0) + 1), a), {}),
  };
}
export function assertAudienceRequest(method, resource, body = {}) {
  if (method === "GET") return;
  if (
    method === "PATCH" &&
    /^\/segments\/[a-zA-Z0-9-]+$/.test(resource) &&
    Object.keys(body).every((k) => k === "name")
  )
    return;
  if (method === "POST" && resource === "/contact-properties" && body.key === "pg_review_cohort")
    return;
  if (
    method === "PATCH" &&
    /^\/contacts\/[a-zA-Z0-9-]+$/.test(resource) &&
    Object.keys(body).every((k) => k === "properties") &&
    Object.keys(body.properties || {}).every((k) => k === "pg_review_cohort")
  )
    return;
  if (
    ["POST", "DELETE"].includes(method) &&
    /^\/contacts\/[a-zA-Z0-9-]+\/segments\/[a-zA-Z0-9-]+$/.test(resource)
  )
    return;
  throw Error("Audience review cannot send, delete contacts, change preferences or activate");
}
async function main() {
  const mode = process.argv[2];
  if (!["audit", "apply"].includes(mode)) throw Error("Choose audit or apply");
  const original = JSON.parse(await fs.readFile(folder + "/resend-state.json", "utf8"));
  const state = JSON.parse(await fs.readFile(folder + "/journey-v2-state.json", "utf8"));
  async function api(method, resource, body) {
    assertAudienceRequest(method, resource, body);
    let r;
    for (let i = 0; i < 2; i++) {
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
      } catch (e) {
        if (method !== "GET" || i) throw e;
      }
    }
    const d = await r.json();
    await new Promise((r) => setTimeout(r, 700));
    if (!r.ok)
      throw Error(
        "Provider " + method + " " + resource.split("?")[0] + " " + r.status + " " + d.message
      );
    return d;
  }
  async function list(resource) {
    let rows = [],
      after;
    for (let i = 0; i < 100; i++) {
      const d = await api(
        "GET",
        resource + "?limit=100" + (after ? "&after=" + encodeURIComponent(after) : "")
      );
      rows.push(...d.data);
      if (!d.has_more) return rows;
      after = d.data.at(-1)?.id;
      if (!after) throw Error("Invalid pagination");
    }
    throw Error("Pagination bound");
  }
  const automation = await api("GET", "/automations/" + original.automationId);
  if (automation.status !== "disabled") throw Error("Automation must remain disabled");
  for (const id of Object.values(state.broadcasts)) {
    const b = await api("GET", "/broadcasts/" + id);
    if (b.status !== "draft" || b.scheduled_at || b.topic_id !== state.newsletterHoldTopicId)
      throw Error("Broadcast must be held unscheduled draft");
  }
  const segments = await list("/segments");
  if (segments.length !== 3) throw Error("Unexpected segment count; inspect before reorganizing");
  const beta = await list("/segments/" + process.env.RESEND_AUDIENCE_BETA_ID + "/contacts");
  const newsletter = await list(
    "/segments/" + process.env.RESEND_AUDIENCE_NEWSLETTER_ID + "/contacts"
  );
  const betaIds = new Set(beta.map((c) => c.id)),
    newsletterIds = new Set(newsletter.map((c) => c.id));
  const rows = [];
  for (const entry of new Map([...beta, ...newsletter].map((c) => [c.id, c])).values()) {
    const c = await api("GET", "/contacts/" + entry.id);
    const topics = await list("/contacts/" + entry.id + "/topics");
    const subscribed = (id) =>
      !c.unsubscribed && topics.some((t) => t.id === id && t.subscription === "opt_in");
    const v = (k) => c.properties?.[k]?.value ?? c.properties?.[k];
    rows.push({
      id: c.id,
      email: c.email,
      beta: betaIds.has(c.id) && subscribed(original.topics.beta),
      newsletter: newsletterIds.has(c.id) && subscribed(original.topics.newsletter),
      status: v("pg_beta_status") || "",
      delivery: v("pg_delivery_status") || "unknown",
      unsubscribed: c.unsubscribed,
      topics,
      properties: c.properties,
    });
    if (rows.length % 10 === 0) console.log("Audited " + rows.length + " signup records");
  }
  const messages = await list("/emails");
  const result = classifySignups(rows, messages);
  const queueId = original.waitingSegmentId;
  const queueBefore = await list("/segments/" + queueId + "/contacts");
  const receipt = {
    generatedAt: new Date().toISOString(),
    segmentsBefore: segments,
    queueBefore: queueBefore.map((c) => c.id),
    ...result,
  };
  await fs.writeFile(
    folder + "/audience-reorganization-audit.json",
    JSON.stringify(receipt, null, 2),
    { mode: 0o600 }
  );
  if (mode === "audit") {
    console.log(
      JSON.stringify({ counts: result.counts, queue: result.queueIds.length, unique: rows.length })
    );
    return;
  }
  const detached = JSON.parse(await fs.readFile(folder + "/audience-writer-detached.json", "utf8"));
  if (
    !detached.productionReady ||
    detached.waitingSegmentId !== "" ||
    detached.sequenceEnabled !== false ||
    detached.hostedEnabled !== false
  )
    throw Error("Old website writer must be detached first");
  const props = await list("/contact-properties");
  if (!props.some((p) => p.key === "pg_review_cohort"))
    await api("POST", "/contact-properties", {
      key: "pg_review_cohort",
      type: "string",
      fallback_value: "",
    });
  for (const row of result.rows) {
    const current = row.properties?.pg_review_cohort?.value ?? row.properties?.pg_review_cohort;
    if (current !== row.cohort)
      await api("PATCH", "/contacts/" + row.id, { properties: { pg_review_cohort: row.cohort } });
  }
  for (const [id, name] of [
    [process.env.RESEND_AUDIENCE_BETA_ID, "PharmaGuide · Beta signups"],
    [process.env.RESEND_AUDIENCE_NEWSLETTER_ID, "PharmaGuide · Monthly notes"],
    [queueId, "PharmaGuide · Current campaign"],
  ]) {
    if (!segments.some((s) => s.id === id)) throw Error("Wrong segment");
    await api("PATCH", "/segments/" + id, { name });
  }
  for (const id of queueBefore.map((c) => c.id).filter((id) => !result.queueIds.includes(id)))
    await api("DELETE", "/contacts/" + id + "/segments/" + queueId);
  for (const id of result.queueIds.filter((id) => !queueBefore.some((c) => c.id === id)))
    await api("POST", "/contacts/" + id + "/segments/" + queueId, {});
  const queueAfter = await list("/segments/" + queueId + "/contacts");
  if (
    queueAfter.length !== result.queueIds.length ||
    queueAfter.some((c) => !result.queueIds.includes(c.id))
  )
    throw Error("Queue mismatch");
  for (const row of result.rows) {
    const c = await api("GET", "/contacts/" + row.id);
    const topics = await list("/contacts/" + row.id + "/topics");
    if (
      c.unsubscribed !== row.unsubscribed ||
      JSON.stringify(topics.map((t) => [t.id, t.subscription]).sort()) !==
        JSON.stringify(row.topics.map((t) => [t.id, t.subscription]).sort())
    )
      throw Error("Consent changed unexpectedly");
  }
  const finalSegments = await list("/segments");
  if (finalSegments.length !== 3) throw Error("Segment count changed");
  receipt.appliedAt = new Date().toISOString();
  receipt.queueAfter = queueAfter.map((c) => c.id);
  receipt.productionDeployment = detached.deployment;
  receipt.noConsentChanged = true;
  receipt.noEmailSent = true;
  await fs.writeFile(
    folder + "/audience-reorganization-receipt.json",
    JSON.stringify(receipt, null, 2),
    { mode: 0o600 }
  );
  state.catchupSegmentId = queueId;
  state.catchupCount = result.queueIds.length;
  state.audienceReorganizedAt = receipt.appliedAt;
  state.audienceCounts = result.counts;
  await fs.writeFile(folder + "/journey-v2-state.json", JSON.stringify(state, null, 2), {
    mode: 0o600,
  });
  console.log(
    JSON.stringify({
      groups: finalSegments.map((s) => ({ id: s.id, name: s.name })),
      counts: result.counts,
      queue: result.queueIds.length,
      noConsentChanged: true,
      noEmailSent: true,
      automation: "disabled",
      broadcasts: "held_drafts",
    })
  );
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
