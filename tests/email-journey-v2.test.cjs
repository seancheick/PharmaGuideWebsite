const test = require("node:test");
const assert = require("node:assert/strict");
const load = () => import("../scripts/lib/email-journey-v2.mjs");
test("all nine revised emails share signature and animated logo", async () => {
  const { journey, renderJourney } = await load();
  assert.equal(Object.keys(journey).length, 9);
  for (const key of Object.keys(journey)) {
    const { html, text } = await renderJourney(key);
    assert.match(html, /https:\/\/pharmaguide.io\/brand\/logo-pulse.png/);
    assert.equal(text.split("Here's to taking good care of yourself.").length, 2);
    assert.doesNotMatch(html, /BETA_POLL_URL|choice=|utm_campaign=beta-poll/);
    if (!["feedback"].includes(key)) assert.doesNotMatch(text, /Hit reply|finish any one/);
  }
});
test("preferences have the correct scope and literal provider placeholders", async () => {
  const { renderJourney } = await load();
  for (const key of ["day5", "day14"]) {
    const { html, text } = await renderJourney(key);
    assert.match(html, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
    assert.match(text, /Unsubscribe from all marketing/);
    assert.match(text, /Stop beta updates only: \{\{\{BETA_UNSUBSCRIBE_URL\}\}\}/);
  }
  for (const key of ["betaWelcome", "newsletterWelcome"]) {
    const { html } = await renderJourney(key);
    assert.match(html, /\{\{\{UNSUBSCRIBE_URL\}\}\}/);
  }
});
test("catchup keeps brief main CTA and adds secondary features link", async () => {
  const { html, text } = await (await load()).renderJourney("catchup");
  assert.match(html, /Get your free brief/);
  assert.match(text, /Explore PharmaGuide features: https:\/\/pharmaguide.io\/features/);
  assert.doesNotMatch(text, /Congratulations|You've been selected/);
});
test("brief uses conditional trusted fragments and invitation requires real access variable", async () => {
  const { renderJourney } = await load();
  const brief = await renderJourney("brief");
  for (const v of [
    "NEWSLETTER_SUBSCRIPTION_COPY",
    "BETA_SUBSCRIPTION_COPY",
    "BETA_PREFERENCE_LINK",
    "NEWSLETTER_PREFERENCE_LINK",
  ])
    assert.ok(brief.html.includes(`{{{${v}}}}`));
  assert.doesNotMatch(brief.text, /You're on the beta list too|You're also signed up/);
  assert.match((await renderJourney("invitation")).html, /\{\{\{BETA_ACCESS_URL\}\}\}/);
  await assert.rejects(() => renderJourney("unknown"), /Unknown journey/);
});

test("provider variables are explicit and Day14 subject matches review", async () => {
  const { journey } = await load();
  assert.equal(journey.day14.subject, "What if a supplement you take gets recalled?");
  for (const def of Object.values(journey))
    assert.ok(!def.variables.some((v) => v.key === "RESEND_UNSUBSCRIBE_URL"));
  assert.deepEqual(
    journey.invitation.variables.map((v) => v.key),
    ["UNSUBSCRIBE_URL", "BETA_ACCESS_URL"]
  );
});

test("Day14 explains overlapping nutrients with a scoped sourced liver example", async () => {
  const { text, html } = await (await load()).renderJourney("day14");
  assert.match(text, /same nutrient can show up/);
  assert.match(text, /preformed vitamin A/);
  assert.match(html, /https:\/\/ods.od.nih.gov\/factsheets\/VitaminA-HealthProfessional\//);
  assert.doesNotMatch(text, /silently destroying|toxic stack|damage your organs without/i);
});

test("welcome questions render as four bold semantic bullets", async () => {
  const { html, text } = await (await load()).renderJourney("betaWelcome");
  const list = html.match(/<ul\b[^>]*>([\s\S]*?)<\/ul>/);
  assert.ok(list, "welcome needs an actual unordered list");
  assert.equal((list[1].match(/<li\b/g) || []).length, 4);
  assert.equal((list[1].match(/<strong>/g) || []).length, 4);
  assert.match(text, /- Does it do what it says\?/);
  assert.match(text, /Around here, we look beyond the label/);
});

test("catchup features action is an outlined secondary button", async () => {
  const { html } = await (await load()).renderJourney("catchup");
  const link = html.match(/<a\b[^>]*href="https:\/\/pharmaguide.io\/features"[^>]*>/);
  assert.ok(link);
  assert.match(link[0], /border:1px solid #183[Bb]3[Ff]/);
  assert.match(link[0], /background-color:#FFFFFF/i);
  assert.match(html, /background-color:#183B3F[\s\S]*?Get your free brief/i);
});

test("newsletter welcome uses simple trust copy and drops skip promise everywhere", async () => {
  const { journey, renderJourney } = await load();
  const { text } = await renderJourney("newsletterWelcome");
  assert.match(
    text,
    /The supplement aisle has plenty of promises\. Knowing which ones to trust can be hard\./
  );
  for (const key of Object.keys(journey)) {
    const email = await renderJourney(key);
    assert.doesNotMatch(email.text, /If there[’']s nothing useful to share, we[’']ll skip it\./);
    assert.doesNotMatch(email.html, /If there(?:[’']|&#x27;|&#39;)s nothing useful to share/);
  }
});

test("beta welcome can disclose monthly enrollment and its separate preference link", async () => {
  const { journey, renderJourney } = await load();
  const { html, text } = await renderJourney("betaWelcome");
  for (const name of ["NEWSLETTER_SUBSCRIPTION_COPY", "NEWSLETTER_PREFERENCE_LINK"]) {
    assert.ok(journey.betaWelcome.variables.some((v) => v.key === name));
    assert.ok(html.includes(`{{{${name}}}}`));
    assert.ok(text.includes(`{{{${name}}}}`));
  }
});

test("existing-beta warmup leads with a founder update and makes the brief optional", async () => {
  const { journey, renderJourney } = await load();
  const { text } = await renderJourney("catchup");
  assert.match(journey.catchup.blocks[0].text, /You joined the PharmaGuide beta a while back/);
  assert.match(text, /If you haven't seen it yet/);
});

test('all unsubscribe controls stay after the signature in every native email',async()=>{
 const {journey,renderJourney}=await load();
 for(const key of Object.keys(journey)){
  const {html}=await renderJourney(key);const signature=html.indexOf('Founder, PharmaGuide');assert.ok(signature>=0,key);
  for(const match of html.matchAll(/href="\{\{\{(?:UNSUBSCRIBE_URL|RESEND_UNSUBSCRIBE_URL|BETA_UNSUBSCRIBE_URL)\}\}\}"|\{\{\{(?:BETA_PREFERENCE_LINK|NEWSLETTER_PREFERENCE_LINK)\}\}\}/g))assert.ok(match.index>signature,`${key} preference control precedes signature`);
 }
});
