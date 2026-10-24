import type { LegalDocument } from "./legal";

/** Consumer health-data disclosure. This is not a compliance certification.
 * The Privacy Policy owns the detailed data inventory and retention controls.
 */

export const HIPAA_DOC: LegalDocument = {
  eyebrow: "HIPAA Statement",
  titleLead: "Health data deserves care.",
  titleEm: "Clear about our scope.",
  subhead:
    "How HIPAA relates to our consumer service, what we protect, and where to find your privacy controls.",
  lastUpdated: "2026-10-23",
  summary: {
    title: "The short version",
    points: [
      "PharmaGuide is a **direct-to-consumer service for adults**. We do not currently operate on behalf of a healthcare organization or under business associate contracts.",
      "This statement is **not a HIPAA compliance certification**. HIPAA applicability depends on the data and the relationships involved, not just whether an app contains health information.",
      "Your **medications, conditions and health profile stay on your device by default**. An optional, explicitly shared AI snapshot is stored encrypted on our server and disclosed to your chosen assistant.",
      "Our [Privacy Policy](/privacy) explains account backups, assistant access, retention, deletion and incident notification.",
    ],
  },
  sections: [
    {
      id: "scope",
      num: "1",
      title: "Where HIPAA actually applies",
      body: `HIPAA applies to covered entities, including health plans and certain healthcare providers, and to business associates handling protected health information (PHI) on their behalf.

PharmaGuide currently provides a direct-to-consumer service for adults. We do not receive records supplied by healthcare organizations or provide the service under business associate contracts. This operating scope differs from an app handling patient information on behalf of a healthcare organization. [HHS health-app scenarios](https://www.hhs.gov/sites/default/files/ocr-health-app-developer-scenarios-2-2016.pdf) explain why the relationships and circumstances matter.

Consumer health information still deserves protection. Other privacy obligations, including the FTC Act and applicable Health Breach Notification Rule requirements, can apply outside HIPAA. We do not classify every possible user submission as outside HIPAA or promise HIPAA coverage for this service.`,
    },
    {
      id: "design-baseline",
      num: "2",
      title: "Current protection measures",
      body: `**Encryption:** your phone's built-in storage encryption protects local data. Server data travels over encrypted connections and is encrypted at rest. Optional AI snapshots are encrypted by our server, which can decrypt them to provide authorized access; they are not end-to-end encrypted.

**Access control:** server operations use scoped service access. Personal assistant access requires a verified account, explicit approval and an active connection. Extra health details require a separate selection and Save action in the app.

**Incident notification:** we investigate suspected unauthorized access or disclosure. When notice is required, we notify affected people and relevant authorities without unreasonable delay and within the applicable deadlines. See [our incident disclosure](/privacy#security-incidents).

These are descriptions of current controls, not a claim that we have completed a HIPAA Security Rule audit or certification.`,
    },
    {
      id: "on-device",
      num: "3",
      title: "Why on-device data changes the equation",
      body: `The most sensitive things you put into PharmaGuide — your medications, your conditions, your health profile, your scan history, your interaction history — live in a local database on your phone, protected by your phone's built-in storage encryption. Interaction checks run on the device.

Ordinary stack backup excludes these health details. If you explicitly share an AI snapshot, PharmaGuide stores the selected text encrypted for a limited time and can decrypt it for that assistant. It is not end-to-end encrypted.

An account also enables a backup of the supplement products in your stack, so you can restore it. It does not include your medications, conditions, doses or schedules. Read the [Privacy Policy](/privacy) for the exact data inventory.

AI sharing creates an additional disclosure of health information. The consent preview explains the categories, duration and destination. Disconnecting ends future access but cannot erase the assistant’s existing chat history; see the privacy policy for removal and offline limits.`,
    },
    {
      id: "what-we-do-hold",
      num: "4",
      title: "What we do hold (and how it's protected)",
      body: `On our servers we hold your **email address** (required for account auth), the **supplement backup** if you have an account, **product submissions** you choose to send, **anonymized usage logs** (server logs, crash reports, aggregated analytics), **opt-in newsletter subscription records**, **AI connection/access metadata**, and any **temporary AI-share snapshot** you explicitly send.

Server data is encrypted in transit and at rest. Optional snapshots can contain selected health information, and our server can read them for the authorized assistant. Connection lifetime, snapshot expiry and account deletion are distinct controls.

The [Privacy Policy](/privacy) explains the precise data inventory, infrastructure providers, retention and deletion limits. Assistant-held copies and infrastructure records can have separate retention. This statement does not guarantee that every record disappears when an account is deleted.`,
    },
    {
      id: "professional-tier",
      num: "5",
      title: "Healthcare professional use",
      body: `The current consumer service is not offered for handling patient records on behalf of healthcare organizations. We do not offer a BAA or claim HIPAA-covered service support for this consumer product.

Any future professional service would need its own defined scope, applicable agreements and verified safeguards before it could support that use. This page does not promise a launch date, BAA availability or completed compliance review.

For professional-use questions, contact [providers@pharmaguide.io](mailto:providers@pharmaguide.io).`,
    },
    {
      id: "your-rights",
      num: "6",
      title: "Your rights, regardless of HIPAA",
      body: `The [Privacy Policy](/privacy) explains available account controls and how to request access, correction, deletion or portability. Rights and notification duties depend on the applicable law and circumstances.

You can disconnect an assistant to stop future access through PharmaGuide. This does not erase information already received by the assistant. Contact [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io) for a privacy request; we may need to verify your identity.`,
    },
    {
      id: "questions",
      num: "7",
      title: "Questions about how your data is handled",
      body: `If you want to understand how a specific piece of data flows, we will answer in plain English:

- **General privacy and HIPAA questions:** [info@pharmaguide.io](mailto:info@pharmaguide.io)
- **Privacy rights requests** (access, deletion, portability): [privacy@pharmaguide.io](mailto:privacy@pharmaguide.io)
- **Security incidents and disclosure:** [security@pharmaguide.io](mailto:security@pharmaguide.io)

Please do not send passwords or unnecessary health details.`,
    },
  ],
};
