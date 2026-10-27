const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createHash } = require("node:crypto");
const ts = require("typescript");
const React = require("react");
const { render } = require("@react-email/render");

function loadTemplate(name) {
  const filename = path.resolve("src/emails", name);
  if (filename.endsWith(".cjs")) return require(filename);
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require: (specifier) =>
      specifier.startsWith(".")
        ? loadTemplate(specifier.endsWith(".cjs") ? specifier : `${specifier}.tsx`)
        : require(specifier),
  });
  return exports;
}

test("all seven outgoing email types use the canonical welcome shell", async () => {
  const { campaigns, renderCampaign } = await import("../scripts/lib/email-campaigns.mjs");
  const messages = [];
  for (const name of ["BetaWelcomeEmail", "NewsletterWelcomeEmail", "BriefDeliveryEmail"]) {
    messages.push(
      await render(
        React.createElement(loadTemplate(`${name}.tsx`)[name], {
          email: "test@example.com",
          unsubscribeUrl: "https://pharmaguide.io/email/unsubscribe?token=test",
          betaEnrolled: true,
        })
      )
    );
  }
  for (const campaign of Object.values(campaigns))
    messages.push((await renderCampaign(campaign)).html);
  assert.equal(messages.length, 7);
  for (const html of messages) {
    assert.equal(
      (html.match(/src="https:\/\/pharmaguide.io\/brand\/logo-pulse.png"/g) || []).length,
      1
    );
    for (const fragment of [
      "background-color:#FAF9F6",
      "max-width:560px",
      "padding:32px 24px",
      "background-color:#FFFFFF",
      "font-family:Georgia, serif",
      "font-size:28px",
      "font-weight:400",
      "color:#183B3F",
      "font-size:24px",
      "letter-spacing:-0.3px",
      "Founder, PharmaGuide",
      "PharmaGuide provides information, not medical advice.",
      "PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02114",
    ])
      assert.ok(html.includes(fragment), fragment);
    assert.match(html, /PharmaGuide<\/p>/);
    const footer = html.slice(html.indexOf("You joined") > -1 ? html.indexOf("You joined") : html.indexOf("PharmaGuide provides information"));
    assert.ok((html.match(/text-align:center/g) || []).length >= 3);
    assert.ok(footer.includes("PharmaGuide Inc."));
  }
  assert.match(
    fs.readFileSync("src/emails/EmailLayout.tsx", "utf8"),
    /export\s*\{[^}]*EmailLayout[^}]*\}\s*from\s*["']\.\/email-layout.cjs["']/
  );
});

test("native rendering preserves copy, URLs and literal provider preference placeholders", async () => {
  const { campaigns, renderCampaign } = await import("../scripts/lib/email-campaigns.mjs");
  const hashes = {
    day5: "e49db18919ada1148678bf5dd48ce96db80525eaf058ad46c1995e273e15e66a",
    day14: "afdc2956245e2b357f4f7bf4535912ddb9b6cf1a3019b9204b698ec74ae9b508",
    reconnect: "75d37ca7ba25c54826071b7dc623bfe3320e7508e89cc8497f8266333aa8e6f4",
    newsletter: "2ba64bc7d315b48124a7602ca390d33822614c356361b451cb6462c4ec8330a9",
  };
  const escape = (value) =>
    value.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll('"', "&quot;");
  for (const [key, campaign] of Object.entries(campaigns)) {
    assert.equal(createHash("sha256").update(JSON.stringify(campaign)).digest("hex"), hashes[key]);
    const { html, text } = await renderCampaign(campaign);
    for (const paragraph of [
      ...campaign.paragraphs,
      ...(campaign.closing ? [campaign.closing] : []),
    ]) {
      assert.ok(html.includes(escape(paragraph)), paragraph);
      assert.ok(text.includes(paragraph), paragraph);
    }
    if (campaign.link) {
      assert.ok(html.includes(`href="${escape(campaign.link.href)}"`));
      assert.ok(text.includes(campaign.link.href));
    }
    assert.ok(html.includes('href="{{{RESEND_UNSUBSCRIBE_URL}}}"'));
    assert.ok(text.includes("{{{RESEND_UNSUBSCRIBE_URL}}}"));
    const waiting = key === "day5" || key === "day14";
    assert.equal(html.includes('href="{{{BETA_UNSUBSCRIBE_URL}}}"'), waiting);
    assert.equal(text.includes("{{{BETA_UNSUBSCRIBE_URL}}}"), waiting);
    assert.ok(
      html.includes(waiting ? "Unsubscribe from all marketing" : "Unsubscribe from this topic")
    );
    assert.doesNotMatch(html, /%7B|&#123;|&lbrace;/i);
  }
});

test("outreach offers a website visit without requiring another expression of interest", async () => {
  const { campaigns } = await import("../scripts/lib/email-campaigns.mjs");
  const copy = campaigns.reconnect.paragraphs.join(" ");
  assert.doesNotMatch(copy, /still interested|reply and tell|first of its kind|free forever|clinically validated|[—–]/i);
  assert.match(copy, /no need to sign up again/);
  assert.match(campaigns.reconnect.link.href, /^https:\/\/pharmaguide\.io\//);
  assert.match(campaigns.reconnect.closing, /unsubscribe below/);
  // Personal outreach drafts stay out of this public repo; check them locally.
  if (!fs.existsSync("docs/14-founder-outreach.md")) return;
  const personal = fs.readFileSync("docs/14-founder-outreach.md", "utf8").split("## Friends and family")[1].split("### Before")[0];
  assert.match(personal, /Hey guys,/);
  assert.match(personal, /including clinicians/);
  assert.doesNotMatch(personal, /first of its kind|clinically validated|free forever|[—–]/i);
});
