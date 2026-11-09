import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { journey, renderJourney } from "./lib/email-journey-v2.mjs";
import { assertDraftRequest } from "./setup-email-review-v2.mjs";
const folder = ".tmp/email-review";
const state = JSON.parse(await fs.readFile(folder + "/journey-v2-state.json", "utf8"));
const names = {
  catchup: "01 · Existing subscribers · review",
  betaWelcome: "02 · Beta welcome · review",
  day5: "03 · Beta Day 5 · review",
  day14: "04 · Beta Day 14 · review",
  newsletterWelcome: "05 · Newsletter welcome · review",
  newsletter: "06 · Newsletter example · review",
  invitation: "07 · Beta invitation · review",
  feedback: "08 · Beta feedback · review",
  brief: "09 · Free brief delivery · review",
};
async function api(method, path, body) {
  assertDraftRequest(method, path, body);
  const r = await fetch("https://api.resend.com" + path, {
    method,
    headers: {
      Authorization: "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20000),
  });
  const d = await r.json();
  await new Promise((r) => setTimeout(r, 700));
  if (!r.ok) throw Error("Provider " + method + " " + r.status + " " + d.message);
  return d;
}
const replacements = [
  ["Here's to knowing better. And feeling better.", "Here's to taking good care of yourself."],
  ["But what do you really want to know?", "But does it tell you what you need to know?"],
  [
    "Working out what to make of them can take a little more digging.",
    "Knowing which ones to trust can be hard.",
  ],
  [" If there's nothing useful to share, we'll skip it.", ""],
];
function replaceApproved(value) {
  for (const [before, after] of replacements) {
    for (const apostrophe of ["'", "&#x27;", "&#39;", "&apos;"])
      value = value.replaceAll(
        before.replaceAll("'", apostrophe),
        after.replaceAll("'", apostrophe)
      );
  }
  return value;
}
const automation = await api("GET", "/automations/" + state.automationId);
if (automation.status !== "disabled") throw Error("Automation must stay disabled");
for (const [key, id] of Object.entries(state.templates)) {
  const current = await api("GET", "/templates/" + id);
  if (current.status !== "draft") throw Error("Do not change a published template");
  await fs.writeFile(folder + "/before-copy-" + key + ".json", JSON.stringify(current, null, 2), {
    mode: 0o600,
  });
  let html = replaceApproved(current.html),
    text = replaceApproved(current.text);
  const rendered = await renderJourney(key);
  if (key === "betaWelcome") {
    const list = rendered.html.match(/<ul\b[\s\S]*?<\/ul>/)?.[0];
    if (!list) throw Error("Expected welcome list");
    const paragraphs = [...html.matchAll(/<p\b[^>]*>(?:(?!<\/p>)[\s\S])*<\/p>/g)];
    const question = paragraphs.find(
      (m) =>
        m[0].includes("Does it do what it says?") && m[0].includes("What research backs it up?")
    );
    if (question) html = html.replace(question[0], list);
    else if (!html.includes("<ul")) throw Error("Could not find welcome questions");
    for (const question of [
      "Does it do what it says?",
      "What research backs it up?",
      "Does it fit with your medications?",
      "Are you already taking the same ingredient in another product?",
    ])
      text = text.replace(
        new RegExp("(?<!- )" + question.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
        "- " + question
      );
  }
  if (key === "catchup") {
    const button = rendered.html.match(
      /<table\b(?:(?!<\/table>)[\s\S])*See everything PharmaGuide can do(?:(?!<\/table>)[\s\S])*<\/table>/
    )?.[0];
    if (!button) throw Error("Expected secondary feature button");
    const paragraphs = [...html.matchAll(/<p\b[^>]*>(?:(?!<\/p>)[\s\S])*<\/p>/g)];
    const link = paragraphs.find((m) => m[0].includes("See everything PharmaGuide can do"));
    if (link) html = html.replace(link[0], button);
  }
  const body = {
    name: names[key],
    alias: journey[key].alias,
    subject: current.subject,
    html,
    text,
  };
  await api("PATCH", "/templates/" + id, body);
  const read = await api("GET", "/templates/" + id);
  if (
    read.status !== "draft" ||
    read.alias !== journey[key].alias ||
    read.html !== html ||
    read.text !== text
  )
    throw Error("Draft readback mismatch: " + key);
  state.hashes[key] = createHash("sha256")
    .update(JSON.stringify({ subject: read.subject, html: read.html, text: read.text }))
    .digest("hex");
  await fs.writeFile(folder + "/journey-v2-state.json", JSON.stringify(state, null, 2), {
    mode: 0o600,
  });
  console.log("Updated draft: " + names[key]);
}
for (const [key, id] of Object.entries(state.broadcasts)) {
  const current = await api("GET", "/broadcasts/" + id);
  if (
    current.status !== "draft" ||
    current.scheduled_at ||
    current.topic_id !== state.newsletterHoldTopicId
  )
    throw Error("Broadcast is not safely held");
  let html = replaceApproved(current.html),
    text = replaceApproved(current.text);
  if (key === "catchup") {
    const rendered = await renderJourney("catchup");
    const button = rendered.html.match(
      /<table\b(?:(?!<\/table>)[\s\S])*See everything PharmaGuide can do(?:(?!<\/table>)[\s\S])*<\/table>/
    )?.[0];
    const link = [...html.matchAll(/<p\b[^>]*>(?:(?!<\/p>)[\s\S])*<\/p>/g)].find((m) =>
      m[0].includes("See everything PharmaGuide can do")
    );
    if (link && button) html = html.replace(link[0], button);
  }
  await api("PATCH", "/broadcasts/" + id, { html, text });
  const read = await api("GET", "/broadcasts/" + id);
  if (
    read.status !== "draft" ||
    read.scheduled_at ||
    read.html !== html ||
    read.topic_id !== state.newsletterHoldTopicId
  )
    throw Error("Held broadcast changed unexpectedly");
}
console.log("Nine templates and two held broadcasts updated. No sends, publication or activation.");
