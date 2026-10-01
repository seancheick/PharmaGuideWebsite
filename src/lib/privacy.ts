import type { LegalDocument } from "./legal";

/**
 * Privacy Policy — refreshed from the legacy WordPress version.
 * Voice rules applied throughout:
 *   • Second-person, plain English
 *   • No banned words ("AI-powered" → drop)
 *   • Concrete, verifiable product claims
 *   • Restraint: no doom phrasing, no marketing inside legal copy
 *
 * Compliance baseline covered:
 *   GDPR, CCPA/CPRA, COPPA, HIPAA-aligned design,
 *   data subject rights, retention, third-parties, children,
 *   security measures, contact + complaint paths.
 *
 * IMPORTANT: this page reflects the data flow the app actually has
 * (verified against the app code 2026-10-01): the health profile,
 * conditions and medications stay on the phone; a signed-in user's
 * supplement list is backed up to their account; medication search
 * text goes to NIH RxNorm. Edits to the product's data flow MUST be
 * reflected here.
 */

export const PRIVACY_DOC: LegalDocument = {
  eyebrow: "Privacy Policy",
  titleLead: "Your health details stay on your phone.",
  titleEm: "By design.",
  subhead:
    "Your health profile, conditions and medications stay on your device. This page explains exactly what we do collect, why, and how to control it.",
  lastUpdated: "2026-10-01",
  summary: {
    title: "The short version",
    points: [
      "Your **health profile, conditions and medications** are stored only on your device, and interaction checks run there too.",
      "If you create an account, we keep your **email** and a **backup of the supplement products in your stack** so you can restore it. Without an account, your stack stays on your device.",
      "We **never sell** your data. We don't share it with advertisers, brokers, or insurance companies.",
      "You can **delete your account** and the data we hold at any time. A full in-app data export is on the way.",
      "Children under 13 may not use PharmaGuide. We comply with COPPA, CCPA/CPRA, and GDPR.",
    ],
  },
  sections: [
    {
      id: "introduction",
      num: "1",
      title: "Introduction",
      body: `PharmaGuide is built around a simple privacy principle: the most sensitive information about your health should stay on your device. We keep only what a feature needs, and we tell you exactly what that is.

This policy explains what we collect, what we don't, why, and the rights you have over the data we do hold. It covers the PharmaGuide mobile apps (iOS and Android), the website at [pharmaguide.io](https://pharmaguide.io), and any related services.

By using PharmaGuide, you agree to the practices described here. If you don't agree, don't use the service.`,
    },
    {
      id: "what-we-collect",
      num: "2",
      title: "What we collect",
      body: `**Information you provide directly:** your email address (required for account creation), and any feedback or support messages you send us.

**Information collected automatically:** standard server logs (IP address, device type, app version, crash reports). Used to keep the service running and diagnose bugs. We don't tie these logs to your identity longer than 30 days.

**If you create an account:** we back up the supplement products in your stack (the product name and catalog ID, the ingredient identifiers we use for checks, and when you added or removed it) so you can restore your stack. Doses, schedules, notes and medications are not included. Without an account, your stack is not sent to us.

**When you search for a medication:** the name you type is sent to the U.S. National Library of Medicine's RxNorm service (rxnav.nlm.nih.gov) to identify the medication. We do not attach your account to that request, and the medication you select is stored only on your device.

**When you choose to submit a product:** the photos and details you submit for a product we don't have yet are sent to us for review.

**What we do NOT collect from your device:** the medications you take, your conditions, your age, your goals, your allergies, your scan history, your interaction warnings, or any other health-related profile data. All of that is stored only on your phone.

**What we do NOT collect from you ever:** social security number, government ID, financial account numbers, biometric data, precise location.`,
    },
    {
      id: "how-we-use",
      num: "3",
      title: "How we use information",
      body: `**To run the service:** authenticate your account, deliver app updates, fix bugs, prevent abuse.

**To communicate with you:** send the welcome email when you join, send beta-wave invites when your wave opens, respond to support requests, and (if you opted in) the monthly newsletter.

**To improve the product:** anonymized, aggregated usage patterns (e.g. "X% of users scanned a barcode this week") help us prioritize what to build next. We do not link these aggregates back to individual users.

**What we do NOT do:** we do not use your data to train AI models. We do not sell or rent your data. We do not target ads at you. We do not allow third parties to track you across the web from PharmaGuide.`,
    },
    {
      id: "storage-security",
      num: "4",
      title: "Storage and security",
      body: `**Where data lives:**
On your device (protected by your phone's built-in storage encryption): your full supplement stack, medications, conditions, profile, scan history and interaction history.
On our servers (encrypted in transit and at rest): your email, account metadata, the supplement backup described above if you have an account, product submissions you send, and anonymized usage logs.

**Security measures:** encryption in transit and at rest on our servers, the platform's secure keystore for sign-in credentials on your device, scoped service-account access for our servers, regular security audits, and a coordinated disclosure policy at [security@pharmaguide.io](mailto:security@pharmaguide.io).

**Data retention:** server-side data is retained as long as your account is active. When you delete your account, we permanently remove your account record and email within 30 days. On-device data is wiped immediately when you uninstall the app or tap "delete all my data" in settings.`,
    },
    {
      id: "sharing",
      num: "5",
      title: "Who we share with",
      body: `**Service providers:** the small number of vendors we use (email delivery, app hosting, error monitoring) only see what they need to do their job. None of them receive your medications, conditions or health profile, because those never leave your device. All vendors are bound by data-processing agreements aligned with GDPR / CCPA standards.

**Legal requirements:** we will disclose information when legally required (court order, subpoena, lawful request from a regulator) and we will tell you about the request unless legally barred from doing so.

**Business transfers:** if PharmaGuide is acquired or merges with another company, your data may transfer to the new entity. They are required to honor this policy or notify you of any changes.

**With your explicit consent:** anything else requires you to actively opt in. We do not "imply" consent through obscure checkboxes.`,
    },
    {
      id: "your-rights",
      num: "6",
      title: "Your rights",
      body: `Regardless of where you live, you can:

**Access** — get a copy of everything we have on you. Settings → Privacy → Export my data.

**Correct** — fix anything that's wrong. Most fields you can edit directly.

**Delete** — wipe your account and any associated server data. Settings → Privacy → Delete account. Takes effect within 30 days.

**Port** — receive your data in a portable JSON format you can take elsewhere.

**Opt out of marketing** — unsubscribe from any email we send, instantly, no questions.

**Opt out of analytics** — Settings → Privacy → Disable usage analytics.

If you're in California, the EU, the UK, or another jurisdiction with additional rights, those rights apply too. See the [California Privacy Rights](#california-rights) and [European Privacy Rights](#european-rights) sections below.`,
    },
    {
      id: "third-parties",
      num: "7",
      title: "Third parties and tracking",
      body: `**Cookies on the website:** we use a minimal set of essential cookies (session, security). We use privacy-friendly analytics (Vercel Analytics, Microsoft Clarity for session replay). No cross-site advertising trackers. No Facebook pixel. No data brokers.

**Third-party links:** the site occasionally links to external sources (FDA, NIH, PubMed, DSLD). When you click those, you leave our site and their privacy policies apply.

**Do Not Track:** we honor browser-level DNT signals — when DNT is enabled, we do not load analytics.`,
    },
    {
      id: "children",
      num: "8",
      title: "Children's privacy",
      body: `PharmaGuide is not intended for children under 13. We do not knowingly collect personal information from anyone under 13. If you believe we have, contact us at [info@pharmaguide.io](mailto:info@pharmaguide.io) and we will delete the data immediately.

For users 13–17, a parent or legal guardian must approve account creation, and the user should consult their healthcare provider before relying on any PharmaGuide guidance.`,
    },
    {
      id: "california-rights",
      num: "9",
      title: "California privacy rights (CCPA/CPRA)",
      body: `California residents have additional rights under the CCPA and CPRA:

**Right to know** what personal information we collect, use, disclose, and sell.

**Right to delete** the personal information we hold about you (subject to certain exceptions).

**Right to correct** inaccurate personal information.

**Right to opt out of sale or sharing** — we do not sell or share personal information for cross-context behavioral advertising, full stop. There's nothing to opt out of, but the right exists.

**Right to limit use of sensitive personal information** — we treat health-related data as sensitive and never use it beyond providing the service.

**Right to non-discrimination** — exercising your rights does not affect your access to PharmaGuide.

To exercise any of these, email [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io) or use the in-app Settings → Privacy controls.`,
    },
    {
      id: "european-rights",
      num: "10",
      title: "European privacy rights (GDPR / UK GDPR)",
      body: `If you are in the European Economic Area, the United Kingdom, or Switzerland, the GDPR (and equivalents) apply.

**Lawful basis:** we process your minimal account data on the lawful basis of (a) contractual necessity (you can't have an account without an email), (b) legitimate interest (running the service securely), and (c) your consent for any optional processing such as the newsletter.

**International transfers:** our servers are located in the United States. Where we transfer EU/UK personal data to the US, we rely on Standard Contractual Clauses approved by the European Commission and the UK ICO.

**Data Protection Officer:** for GDPR-related queries, email [dpo@pharmaguide.io](mailto:dpo@pharmaguide.io).

**Right to lodge a complaint:** you can complain to your local data protection authority. For EU residents this is your country's DPA; for UK residents this is the ICO.`,
    },
    {
      id: "security-incidents",
      num: "11",
      title: "Security incidents",
      body: `If we ever discover a security incident affecting your information, we will notify you within 72 hours of discovery (or sooner where required by law), explain what happened, what data was affected, what we're doing about it, and what you can do.

We test our systems regularly and run a coordinated disclosure program. Researchers can report findings to [security@pharmaguide.io](mailto:security@pharmaguide.io).`,
    },
    {
      id: "changes",
      num: "12",
      title: "Changes to this policy",
      body: `We update this policy when our practices change or when laws change. The "Last updated" date at the top reflects the most recent revision.

For material changes (anything that meaningfully affects what we do with your data), we will email you at least 30 days before the change takes effect, and you will have the opportunity to delete your account before it does.

We will never quietly change this policy in a way that reduces your privacy and hope you don't notice.`,
    },
    {
      id: "contact",
      num: "13",
      title: "Contact us",
      body: `**General privacy questions:** [info@pharmaguide.io](mailto:info@pharmaguide.io)

**Privacy rights requests (access, deletion, portability):** [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io)

**Security incidents and responsible disclosure:** [security@pharmaguide.io](mailto:security@pharmaguide.io)

**EU/UK Data Protection Officer:** [dpo@pharmaguide.io](mailto:dpo@pharmaguide.io)

**Mailing address:** PharmaGuide Inc., Boston, MA, United States.

We respond to every privacy email within 5 business days. A human reads every one.`,
    },
  ],
};
