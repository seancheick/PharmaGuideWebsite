import type { LegalDocument } from "./legal";

/**
 * Privacy Policy — refreshed from the legacy WordPress version.
 * Voice rules applied throughout:
 *   • Second-person, plain English
 *   • No banned words ("AI-powered" → drop)
 *   • Concrete, verifiable product claims
 *   • Restraint: no doom phrasing, no marketing inside legal copy
 *
 * Disclosures cover data flows, rights requests, retention, third parties,
 * children, security and contact paths; this is not a compliance certification.
 *
 * IMPORTANT: this page reflects the data flow the app actually has
 * (verified against ADR-009 and app code 2026-10-13): the health profile,
 * conditions and medications stay on the phone unless explicitly shared; a signed-in user's
 * supplement list is backed up to their account; medication search
 * text goes to NIH RxNorm. Edits to the product's data flow MUST be
 * reflected here.
 */

export const PRIVACY_DOC: LegalDocument = {
  eyebrow: "Privacy Policy",
  titleLead: "Your health details are yours to share.",
  titleEm: "By design.",
  subhead:
    "Your health details stay on your device unless you choose to share them. This page explains account backups, optional AI-assistant sharing, and your controls.",
  lastUpdated: "2026-10-24",
  summary: {
    title: "The short version",
    points: [
      "Your **health profile, conditions and medications** stay on your device by default, and interaction checks run there. You can explicitly share a scoped brief or a temporary snapshot with an AI assistant.",
      "If you create an account, we keep your **email** and a **backup of the supplement products in your stack** so you can restore it. Without an account, your stack stays on your device.",
      "We **never sell** your data. We don't share it with advertisers, brokers, or insurance companies.",
      "The **website chat** doesn't save your conversations: they stay in your browser until you close the page, and the text is processed by AI service providers to write each reply.",
      "You can **delete your account** and the data we hold at any time. A full in-app data export is on the way.",
      "PharmaGuide is for adults aged 18 and over. Privacy rights depend on your location; the request contacts below are available to you.",
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

**Information collected automatically:** standard server logs (IP address, device type, app version, crash reports). Used to keep the service running and diagnose bugs.

**If you create an account:** we back up the supplement products in your stack (the product name and catalog ID, the ingredient identifiers we use for checks, and when you added or removed it) so you can restore your stack. Doses, schedules, notes and medications are not included. Without an account, your stack is not sent to us.

**When you search for a medication:** the name you type is sent to the U.S. National Library of Medicine's RxNorm service (rxnav.nlm.nih.gov) to identify the medication. We do not attach your account to that request, and the medication you select is stored only on your device.

**When you choose to submit a product:** the photos and details you submit for a product we don't have yet are sent to us for review.

**When you use the chat on this website:** the messages you type, and the last few messages from the same visit, are sent to our server and on to an AI service provider so it can write a reply. There is no account for chat, and we don't save your messages in a database. The conversation stays in your browser's memory for the current visit only; closing or reloading the page clears it. To limit abuse we rate-limit requests using a one-way hash of your IP address, not the address itself. We keep anonymous, topic-level usage statistics, never the messages. The chat window is masked from our session recordings.

**Optional AI-assistant sharing:** connecting an assistant lets it read your synced supplement list until you disconnect for a durable connection, or until the expiry shown for a time-limited connection. Connecting alone does not share medications or your health profile. In the app, Access settings lets you separately choose categories, review the text, and tap Save to upload a temporary copy for one connected assistant. Medication and profile switches start off. The snapshot may contain the categories and derived findings you explicitly selected. Copying a brief into another app sends it through that app, without storing an AI-share snapshot on PharmaGuide.

**Automatic updates:** this separate option starts off. When enabled, local stack changes can refresh the snapshot using the last selected categories and duration, including new entries within those categories. Turning it off stops future automatic updates; use Disconnect to remove the existing server copy.

**Outside those choices:** medications, conditions, age, goals, allergies and other health-profile details are not part of ordinary account backup. Scan history stays on your device.

**What we do NOT collect from you ever:** social security number, government ID, financial account numbers, biometric data, precise location.`,
    },
    {
      id: "how-we-use",
      num: "3",
      title: "How we use information",
      body: `**To run the service:** authenticate your account, deliver app updates, fix bugs, prevent abuse.

**To communicate with you:** send the welcome email when you join, send beta-wave invites when your wave opens, respond to support requests, and (if you opted in) the monthly newsletter.

**To improve the product:** anonymized, aggregated usage patterns (e.g. "X% of users scanned a barcode this week") help us prioritize what to build next. We do not link these aggregates back to individual users.

**What we do NOT do:** PharmaGuide does not use your data to train AI models. An assistant provider you choose handles the information it receives under its own terms and training settings. We do not sell or rent your data. We do not target ads at you. We do not allow third parties to track you across the web from PharmaGuide.`,
    },
    {
      id: "storage-security",
      num: "4",
      title: "Storage and security",
      body: `**Where data lives:**
On your device (protected by your phone's built-in storage encryption): your full supplement stack, medications, conditions, profile, scan history and interaction history.
On our servers (encrypted in transit and at rest): your email, account metadata, the supplement backup described above if you have an account, product submissions you send, anonymized usage logs, assistant connection/access metadata, and any AI-share snapshot you explicitly send. Snapshot text travels over an encrypted connection and is encrypted with AES-GCM by our server before storage. PharmaGuide can decrypt it to provide the authorized assistant access; this is not end-to-end encryption.

**Security measures:** encryption in transit and at rest on our servers, the platform's secure keystore for sign-in credentials on your device, scoped service-account access for our servers, and a security reporting contact at [security@pharmaguide.io](mailto:security@pharmaguide.io).

**AI-share retention and removal:** snapshots default to 24 hours and support a maximum of 30 days; access also requires an active assistant connection; a durable connection does not extend a snapshot’s expiry. Expired snapshots are refused immediately and a scheduled job removes expired rows every 15 minutes. Disconnecting or removing a share deletes its server snapshot. App sign-out attempts to delete snapshots before signing out; if the device is offline or deletion fails, expiry still limits access, and you can disconnect from the website. Deleting your account removes its snapshots and connections. These controls cannot erase information the assistant already received or retained in chat history.

**Other data retention:** account data supports your account until you request deletion. Settings → Delete account starts deletion of your sign-in account and associated application records and attempts local cleanup; the app reports if it cannot confirm completion. Infrastructure logs and backups have separate retention, and assistant chat copies are controlled by the assistant provider. Contact [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io) for a deletion request covering remaining provider records or details of applicable retention. Uninstalling the app does not delete your account or server-side copies.`,
    },
    {
      id: "sharing",
      num: "5",
      title: "Who we share with",
      body: `**Service providers:** the small number of vendors we use (email delivery, app hosting, error monitoring) only see what they need to do their job. Optional AI sharing is an exception to device-only storage: our hosting provider stores the encrypted snapshot, and the assistant provider you choose receives the selected text. The assistant handles and retains that text under its own policies. Our infrastructure providers process data under their applicable service and data-processing terms. A connected assistant is an independent provider chosen by you, not a processor acting solely on our instructions.

**Assistant connection infrastructure:** Supabase provides account sign-in, the synced supplement backup, connection records and encrypted snapshot storage. WorkOS manages assistant authorization; we send it your verified account ID and email, and it processes authorization and connection metadata. We do not send your supplement list, medications or snapshot text to WorkOS as part of this authorization flow. Vercel hosts the website and connection-management endpoints. See [Supabase’s data-processing terms](https://supabase.com/legal/customer-resources/data-processing-addendum) and [WorkOS’s data-processing terms](https://workos.com/legal/data-processing-addendum).

**Legal requirements:** we will disclose information when legally required (court order, subpoena, lawful request from a regulator) and we will tell you about the request unless legally barred from doing so.

**Business transfers:** if PharmaGuide is acquired or merges with another company, your data may transfer to the new entity. They are required to honor this policy or notify you of any changes.

**With your explicit consent:** anything else requires you to actively opt in. We do not "imply" consent through obscure checkboxes.`,
    },
    {
      id: "your-rights",
      num: "6",
      title: "Your rights",
      body: `Regardless of where you live, you can:

**Access** — request a copy of personal information we hold by emailing [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io). A full in-app export is not yet available; the app currently offers a clinician PDF report.

**Correct** — fix anything that's wrong. Most fields you can edit directly.

**Delete** — use Settings → Delete account, or email [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io) to request deletion. See Storage and security above for the distinction between application data, infrastructure records and assistant-held copies.

**Portability** — contact [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io) to request a portable copy where applicable. A full self-service JSON export is not currently provided.

**Opt out of marketing** — unsubscribe from any email we send, instantly, no questions.

**Website analytics** — we honor your browser’s Do Not Track setting. Private connection pages exclude marketing analytics and session replay.

If you're in California, the EU, the UK, or another jurisdiction with additional rights, those rights apply too. See the [California Privacy Rights](#california-rights) and [European Privacy Rights](#european-rights) sections below.`,
    },
    {
      id: "third-parties",
      num: "7",
      title: "Third parties and tracking",
      body: `**Sign-in on the website:** consent and connections pages use browser storage for your Supabase session and the PKCE sign-in verifier. These private pages do not load our marketing analytics or session replay.

**Cookies on the website:** we use a minimal set of essential cookies (session, security). We use privacy-friendly analytics (Vercel Analytics, Microsoft Clarity for session replay). No cross-site advertising trackers. No Facebook pixel. No data brokers.

**Connected AI assistants:** each provider you approve receives your supplement list and any snapshot you separately share to that connection. PharmaGuide does not control the provider's chat retention or training settings. Review those settings before sharing health information. Disconnecting stops future access through PharmaGuide; ask the provider to delete information it already received.

**AI service providers (website chat):** to answer a chat question we send your message to Google (Gemini) and, as a backup, to Groq. They process that text to generate the reply, and each provider's own terms govern how it handles it. Don't type details you wouldn't want processed that way, such as your name or contact information.

**Third-party links:** the site occasionally links to external sources (FDA, NIH, PubMed, DSLD). When you click those, you leave our site and their privacy policies apply.

**Do Not Track:** we honor browser-level DNT signals — when DNT is enabled, we do not load analytics.`,
    },
    {
      id: "children",
      num: "8",
      title: "Children's privacy",
      body: `PharmaGuide is intended for adults aged 18 and over. People under 18 may not create an account or use the service. If you believe a person under 18 has provided personal information, contact [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io) so we can investigate and arrange deletion.`,
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

To exercise any of these, email [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io) or use the available account controls in Settings.`,
    },
    {
      id: "european-rights",
      num: "10",
      title: "European privacy rights (GDPR / UK GDPR)",
      body: `If you are in the European Economic Area, the United Kingdom, or Switzerland, the GDPR (and equivalents) apply.

**Lawful basis:** we process your minimal account data on the lawful basis of (a) contractual necessity (you can't have an account without an email), (b) legitimate interest (running the service securely), and (c) your consent for any optional processing such as the newsletter.

**International processing:** our infrastructure and assistant providers may process information outside your country, including in the United States. Their applicable terms describe processing locations and transfer safeguards. Contact [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io) for information about the providers and safeguards relevant to your data.

**European privacy contact:** for GDPR-related queries, email [dpo@pharmaguide.io](mailto:dpo@pharmaguide.io).

**Right to lodge a complaint:** you can complain to your local data protection authority. For EU residents this is your country's DPA; for UK residents this is the ICO.`,
    },
    {
      id: "security-incidents",
      num: "11",
      title: "Security incidents",
      body: `We investigate suspected unauthorized access or disclosure of personal information. When notification is required, we notify affected people and the relevant authorities without unreasonable delay and within the deadlines that apply to the incident. Notices explain what happened, the information involved, the steps we are taking and what affected people can do. Health-data notification duties can apply to unauthorized disclosures as well as security intrusions; report suspected incidents to the contact below.

Researchers can report suspected vulnerabilities to [security@pharmaguide.io](mailto:security@pharmaguide.io).`,
    },
    {
      id: "changes",
      num: "12",
      title: "Changes to this policy",
      body: `We update this policy when our practices change or when laws change. The "Last updated" date at the top reflects the most recent revision.

We post updated disclosures on this page and provide additional notice or request consent when required for a material change to how we process your information.

We will never quietly change this policy in a way that reduces your privacy and hope you don't notice.`,
    },
    {
      id: "contact",
      num: "13",
      title: "Contact us",
      body: `**General privacy questions:** [info@pharmaguide.io](mailto:info@pharmaguide.io)

**Privacy rights requests (access, deletion, portability):** [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io)

**Security incidents and responsible disclosure:** [security@pharmaguide.io](mailto:security@pharmaguide.io)

**EU/UK privacy questions:** [dpo@pharmaguide.io](mailto:dpo@pharmaguide.io)

**Mailing address:** PharmaGuide Inc., Boston, MA, United States.

Include enough information for us to identify your request, but do not send passwords or unnecessary health details. We may need to verify your identity before providing or deleting account information.`,
    },
  ],
};
