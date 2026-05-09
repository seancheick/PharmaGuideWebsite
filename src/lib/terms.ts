import type { LegalDocument } from "./legal";

/**
 * Terms of Service — refreshed from the legacy WordPress version.
 * Voice rules applied throughout: second-person, plain English, no
 * banned words, restraint over jargon.
 *
 * Compliance baseline covered:
 *   eligibility, account ownership, acceptable use, IP ownership,
 *   medical disclaimer (critical for PharmaGuide), warranty
 *   disclaimer, liability limits, indemnification, termination,
 *   governing law, dispute resolution, changes to terms.
 *
 * The medical disclaimer is the most important section in this
 * document and must remain prominent.
 */

export const TERMS_DOC: LegalDocument = {
  eyebrow: "Terms of Service",
  titleLead: "The rules of the road,",
  titleEm: "in plain English.",
  subhead:
    "What you can expect from us, what we expect from you, and the boring legal disclaimers we have to put somewhere — without the wall of capital letters.",
  lastUpdated: "2026-05-08",
  summary: {
    title: "The short version",
    points: [
      "**You must be 18+** to use PharmaGuide. Minors 13–17 need a parent's permission.",
      "PharmaGuide is **educational, not medical advice**. Always consult your healthcare provider before changing what you take.",
      "**You own your data.** We just process it as described in the [Privacy Policy](/privacy).",
      "**Don't try to break the system** — no scraping, no reverse engineering, no abusing the API. Standard stuff.",
      "We can update these terms; we'll **notify you 30 days before** any material change takes effect.",
    ],
  },
  sections: [
    {
      id: "acceptance",
      num: "1",
      title: "Acceptance of these terms",
      body: `By creating an account, downloading the PharmaGuide apps, or using [pharmaguide.io](https://pharmaguide.io), you agree to these Terms of Service. These terms form a binding agreement between you and PharmaGuide Inc. (a Delaware corporation, headquartered in Boston, MA).

If you do not agree, please don't use the service. You can stop using PharmaGuide at any time.

These terms reference our [Privacy Policy](/privacy), which describes how we handle your data. The two documents work together.`,
    },
    {
      id: "eligibility",
      num: "2",
      title: "Who can use PharmaGuide",
      body: `**Adults (18+):** you can create an account and use all features.

**Minors (13–17):** you may use PharmaGuide only with your parent or legal guardian's permission, and we strongly recommend involving them in any decisions about supplements or medications.

**Children under 13:** PharmaGuide is not for you. Please don't create an account. If you do, we are required by law to delete it.

**Healthcare professionals:** the consumer-facing service is not designed for clinical practice. We're working on a separate professional offering (see [Healthcare Pros — 2026](/healthcare-pros) on the homepage). Until that ships, do not rely on the consumer app for clinical decision-making.`,
    },
    {
      id: "medical-disclaimer",
      num: "3",
      title: "Medical disclaimer (read this one)",
      body: `**PharmaGuide provides educational information. It is not medical advice, not a diagnostic tool, and not a substitute for professional clinical judgment.**

The interactions, evidence levels, and recommendations you see in PharmaGuide are summaries of published research and clinical references. They are intended to help you have better-informed conversations with your healthcare provider — not to replace those conversations.

**Always consult your doctor or pharmacist** before:
- starting, stopping, or changing the dose of any medication
- combining supplements with prescribed medications
- relying on PharmaGuide guidance for a medical condition
- making decisions during pregnancy, breastfeeding, or any other special situation

**In an emergency, call 911 (US) or your local emergency number.** PharmaGuide is not designed for emergencies and cannot help in time-critical situations.

By using PharmaGuide, you acknowledge that you understand this disclaimer and accept full responsibility for medical decisions you make based on the information we provide.`,
    },
    {
      id: "your-account",
      num: "4",
      title: "Your account",
      body: `**Creating an account:** you provide an email address, we send you a confirmation, you're in.

**Account security:** keep your login secure. Don't share it. Notify us at [security@pharmaguide.io](mailto:security@pharmaguide.io) if you suspect unauthorized access.

**One person, one account:** accounts are for individual humans. Don't share an account with another person; it muddies the personalization that makes PharmaGuide useful.

**Your data, your control:** you can export, modify, or delete your data anytime. See the [Privacy Policy](/privacy) for the details.`,
    },
    {
      id: "acceptable-use",
      num: "5",
      title: "Acceptable use",
      body: `When you use PharmaGuide, you agree NOT to:

- scrape, mirror, or otherwise extract our database (the catalog, interaction rules, and evidence references represent significant clinical work and are protected)

- reverse engineer or decompile the apps

- probe, test, or attempt to bypass authentication or rate limits

- misrepresent our information as your own clinical guidance

- use PharmaGuide for any commercial healthcare service without a separate agreement (the consumer app is for personal use)

- upload content that is illegal, harassing, fraudulent, or contains malware

- attempt to harm other users or the service.

Violations may result in account suspension or termination. Egregious violations may be reported to law enforcement.`,
    },
    {
      id: "intellectual-property",
      num: "6",
      title: "Intellectual property",
      body: `**Our IP:** the PharmaGuide name, brand, design, source code, the curated catalog, and the interaction database are owned by PharmaGuide Inc. or licensed to us. You may use the service as intended; you may not copy, redistribute, or build a competing product from our materials.

**Your data:** the information you put into PharmaGuide (your stack, conditions, profile) belongs to you. We process it according to the [Privacy Policy](/privacy) and never claim ownership.

**Feedback:** if you send us suggestions, bug reports, or feature ideas, you grant us a perpetual, royalty-free license to use them to improve the service. We're not promising to act on every idea, but if we use yours, we won't owe you a fee.

**Open source:** parts of PharmaGuide are built on open-source software whose licenses we honor. A list is available on request.`,
    },
    {
      id: "warranty-disclaimer",
      num: "7",
      title: "Warranty disclaimer",
      body: `PharmaGuide is provided "as is" and "as available." We do our best to make it accurate, fast, and reliable, but we cannot guarantee that the service will be uninterrupted, error-free, or that the information will be perfectly current at every moment.

We do not warrant:
that the catalog covers every product on the market
that every interaction is current with the latest published research the moment it is published
that the service will be available without interruption (we use industry-standard hosting; outages happen)
that the service will meet your specific medical or legal needs

To the maximum extent allowed by law, we disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.

This does not affect any warranty rights you have under your local law that cannot be disclaimed (some jurisdictions don't allow disclaimers of certain implied warranties).`,
    },
    {
      id: "liability",
      num: "8",
      title: "Limitation of liability",
      body: `To the maximum extent allowed by law, PharmaGuide Inc. and its officers, employees, and agents are not liable for indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising from your use of the service.

Our total liability for any direct damages will not exceed the amount you have paid us in the 12 months preceding the claim, or one hundred US dollars (USD $100), whichever is greater.

**Important medical context:** this limitation applies even if PharmaGuide information is incorrect or incomplete. That is precisely why the [Medical Disclaimer](#medical-disclaimer) above is so prominent — your healthcare provider remains the source of truth for clinical decisions.

Some jurisdictions do not allow these limitations; in those places, the limitations apply only to the extent allowed.`,
    },
    {
      id: "indemnification",
      num: "9",
      title: "Indemnification",
      body: `You agree to defend, indemnify, and hold harmless PharmaGuide Inc. from claims arising from:

your violation of these Terms

your violation of any law or third-party right (including IP rights)

content you submit to the service

actions you take that result in harm to yourself or others, where you should have consulted a healthcare provider before acting.

We will tell you about any claim we receive and let you participate in the defense.`,
    },
    {
      id: "third-party-services",
      num: "10",
      title: "Third-party services",
      body: `PharmaGuide may link to or integrate with third-party services (the App Store, Google Play, payment processors, identity providers). We don't control those services and aren't responsible for their content, terms, or privacy practices. Read their terms before using them.`,
    },
    {
      id: "termination",
      num: "11",
      title: "Termination",
      body: `**By you:** delete your account anytime in Settings → Privacy → Delete account. Takes effect within 30 days.

**By us:** we may suspend or terminate your account if you materially breach these Terms or pose a risk to the service or other users. We will give you notice and a chance to cure where the breach is curable.

**On termination:** your account record and email will be removed within 30 days. On-device data is yours and remains on your device until you uninstall.

Sections that should survive termination (medical disclaimer, IP, warranty disclaimer, liability, indemnification, governing law) survive.`,
    },
    {
      id: "governing-law",
      num: "12",
      title: "Governing law and disputes",
      body: `These Terms are governed by the laws of the Commonwealth of Massachusetts, USA, without regard to conflict-of-laws principles.

For disputes that aren't resolved by talking to us first (please try [info@pharmaguide.io](mailto:info@pharmaguide.io)), the exclusive venue is the state and federal courts located in Suffolk County, Massachusetts. Both parties consent to that jurisdiction.

If you are a consumer in the EU, UK, or another jurisdiction with mandatory consumer-protection rules, those rules apply too. Nothing in these Terms removes a right you have under your local consumer law.

**Class-action waiver:** you and PharmaGuide agree to bring claims only in individual capacity, not as part of a class action, except where prohibited by law.`,
    },
    {
      id: "changes",
      num: "13",
      title: "Changes to these terms",
      body: `We will revise these Terms occasionally. The "Last updated" date at the top reflects the latest revision.

For material changes (new restrictions on your use, changes to the medical disclaimer, modifications to dispute resolution), we will notify you by email at least 30 days before the change takes effect. You can delete your account before it does.

Continuing to use PharmaGuide after the effective date constitutes acceptance of the revised Terms.`,
    },
    {
      id: "contact",
      num: "14",
      title: "Contact us",
      body: `**General questions about these Terms:** [info@pharmaguide.io](mailto:info@pharmaguide.io)

**Legal notices:** [legal@pharmaguide.io](mailto:legal@pharmaguide.io)

**Mailing address:** PharmaGuide Inc., Boston, MA, United States.

We aim to respond to every legal email within 5 business days. A human reads every one.`,
    },
  ],
};
