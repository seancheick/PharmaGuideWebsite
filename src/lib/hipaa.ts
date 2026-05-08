import type { LegalDocument } from "./legal";

/**
 * HIPAA Statement — refreshed from the legacy WordPress version.
 *
 * Important framing: PharmaGuide is consumer-facing and not directly
 * subject to HIPAA in most user contexts. We use HIPAA as a design
 * baseline (encryption, access control, retention discipline) rather
 * than as a compliance shield, and this page is honest about that
 * distinction. Most users assume HIPAA covers everything; it doesn't.
 *
 * If we later ship the Healthcare Pros tier (referenced as "2026" in
 * the footer), that surface will be a covered entity / business
 * associate scenario and warrants a fuller compliance posture.
 */

export const HIPAA_DOC: LegalDocument = {
  eyebrow: "HIPAA Statement",
  titleLead: "HIPAA-aligned by design.",
  titleEm: "Honest about the rest.",
  subhead:
    "How PharmaGuide thinks about health-data protection — what's HIPAA-aligned, what's beyond HIPAA, and where the line actually sits.",
  lastUpdated: "2026-05-08",
  summary: {
    title: "The short version",
    points: [
      "HIPAA primarily applies to **covered entities** (providers, payers, clearinghouses) and their business associates. PharmaGuide consumer apps are usually outside that scope — a fact most apps quietly bury.",
      "We design **as if** HIPAA's Security Rule applies — AES-256 encryption, access control, audit logging, breach response within 72 hours.",
      "Your health data **stays on your device**. We can't look at it, leak it, or be subpoenaed for it because we don't have it.",
      "If/when **PharmaGuide for Healthcare Pros** ships, that product will operate as a HIPAA business associate with full BAA support.",
    ],
  },
  sections: [
    {
      id: "scope",
      num: "1",
      title: "Where HIPAA actually applies",
      body: `The Health Insurance Portability and Accountability Act (HIPAA) governs Protected Health Information (PHI) held by **covered entities** (healthcare providers, health plans, clearinghouses) and their **business associates** (vendors that process PHI on a covered entity's behalf).

Most consumer health and wellness apps — including PharmaGuide's consumer tier — are **not** covered entities. The information you put into PharmaGuide is **consumer health data**, which is regulated by other frameworks (state consumer privacy laws like California's CCPA/CPRA, the FTC Act, and the FTC's Health Breach Notification Rule) — but not by HIPAA itself.

We are telling you this directly because the industry standard is to wave the HIPAA flag without explaining what's actually covered. We'd rather give you the truth and earn the trust.`,
    },
    {
      id: "design-baseline",
      num: "2",
      title: "Why we use HIPAA as a design baseline anyway",
      body: `Even though HIPAA's letter doesn't apply to most of what we do, its **Security Rule** is one of the most thoughtful frameworks ever written for protecting sensitive personal health information. We treat it as the floor, not the ceiling.

What that means in practice:

**Encryption** — AES-256 on-device for your stack and conditions, TLS 1.3 in transit for the minimal account data we hold.

**Access control** — scoped service accounts. Engineers cannot read individual user data. There is no admin "look up Sean's stack" panel.

**Audit logging** — every administrative action on our servers is logged. We can answer "who touched what, when?" — for our own accountability, not surveillance.

**Workforce training** — every team member completes security training on hire and annually.

**Breach response** — incident playbook tested quarterly. If there is ever an incident, you hear from us within 72 hours.`,
    },
    {
      id: "on-device",
      num: "3",
      title: "Why on-device data changes the equation",
      body: `The most sensitive things you put into PharmaGuide — your supplement stack, your medications, your conditions, your scan history, your interaction history — live in an encrypted local database on your phone.

We do not sync this to our servers. We do not have a copy. There is no warehouse where someone could go look up your data, no breach scope where it could be exfiltrated, no subpoena scenario where we could be compelled to produce it.

This is not a marketing claim. It's the architecture. Read the [Privacy Policy](/privacy) for the exact data inventory.

By extension, much of the surface that HIPAA worries about — disclosure of PHI to third parties, audit trails of PHI access, BAAs with downstream vendors — is moot for us because the data isn't ours to disclose, audit, or share.`,
    },
    {
      id: "what-we-do-hold",
      num: "4",
      title: "What we do hold (and how it's protected)",
      body: `On our servers we hold your **email address** (required for account auth), **anonymized usage logs** (server logs, crash reports, aggregated analytics), and **opt-in newsletter subscription records**.

For these:
- Encrypted at rest (AES-256) and in transit (TLS 1.3)
- Access logged at the database level
- Retained only as long as your account is active, deleted within 30 days of account deletion
- Vendors handling any of this (email delivery, hosting) sign data-processing agreements aligned with GDPR Article 28 and CCPA's service-provider standard

None of that data, individually or in combination, would qualify as PHI under HIPAA. But we treat it with the same security discipline.`,
    },
    {
      id: "professional-tier",
      num: "5",
      title: "PharmaGuide for Healthcare Pros (2026)",
      body: `We're working on a separate product for clinicians, pharmacists, and integrative health practitioners — referenced in the footer nav as **"Healthcare Pros · 2026"**.

That product **will** be designed for HIPAA-covered use. Specifically:

- Operating as a **business associate** for healthcare providers who use it on behalf of their patients
- Standard **Business Associate Agreement (BAA)** support
- A comprehensive Security Rule audit before launch
- Access control, audit logging, and breach response calibrated for PHI handling

If you are a clinician interested in early access, write to [info@pharmaguide.io](mailto:info@pharmaguide.io) with subject line "Pro tier."`,
    },
    {
      id: "your-rights",
      num: "6",
      title: "Your rights, regardless of HIPAA",
      body: `Whether or not HIPAA technically applies, you have the rights described in the [Privacy Policy](/privacy):

- **Access** — get a copy of everything we hold about you
- **Correct** — fix what's inaccurate
- **Delete** — wipe your account permanently
- **Port** — receive your data in a portable format
- **Opt out** — of marketing, analytics, anything optional
- **Be told** — within 72 hours if there is ever a security incident affecting you

These rights apply regardless of jurisdiction or which framework technically governs the underlying data.`,
    },
    {
      id: "questions",
      num: "7",
      title: "Questions about how your data is handled",
      body: `If you want to understand how a specific piece of data flows, we will answer in plain English:

- **General privacy and HIPAA questions:** [info@pharmaguide.io](mailto:info@pharmaguide.io)
- **Privacy rights requests** (access, deletion, portability): [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io)
- **Security incidents and disclosure:** [security@pharmaguide.io](mailto:security@pharmaguide.io)

We aim to respond within 5 business days. A human reads every email.`,
    },
  ],
};
