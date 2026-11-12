/**
 * FAQ source-of-truth.
 *
 * Single array consumed by:
 *   • /faq page render (FAQClient accordion)
 *   • FAQPage JSON-LD (via faqPlainText — derived, never typed twice;
 *     a separate plain-text copy had already drifted from the page)
 *
 * Voice rules applied:
 *   • Second-person preferred
 *   • No "AI-powered" / "revolutionary" / "trusted" (when unproven)
 *   • Catalog count comes from the site-wide launch claim
 *   • Evidence-level system actually named (Established / Probable /
 *     Moderate / Limited / Theoretical) — matches the in-app schema
 *   • Restraint > emphasis (no bold-everywhere, no exclamation marks)
 *
 * Answer text uses plain prose. Inline emphasis happens via <strong>
 * tags inside markdown-ish strings — the FAQClient renders these
 * with React.createElement to preserve them safely.
 */

import { SOURCE_LABEL_COUNT } from "./site";

export type FAQGroup = "product" | "privacy" | "launch";

export interface FAQItem {
  q: string;
  /** The answer. Inline **bold** and [text](href) render on the page. */
  body: string;
  /** Section grouping — drives the on-page IA + per-group numbering. */
  group: FAQGroup;
}

/** Group metadata — order here = render order on the page. */
export const FAQ_GROUPS: ReadonlyArray<{
  id: FAQGroup;
  label: string;
  hint: string;
}> = [
  {
    id: "product",
    label: "Product",
    hint: "What it is and how it works",
  },
  {
    id: "privacy",
    label: "Privacy & using it with your care",
    hint: "Your data, your provider, your plan",
  },
  {
    id: "launch",
    label: "Launch & pricing",
    hint: "When it opens and what costs what",
  },
];

export const FAQ_ITEMS: readonly FAQItem[] = [
  {
    group: "product",
    q: "What is PharmaGuide?",
    body: "PharmaGuide helps you check supplement quality, ingredient overlap and documented interactions. Scan a supported product to see its label information and available assessment. Add what you take to check combinations, even if you take no medications.",
  },
  {
    group: "privacy",
    q: "Is my health data actually private?",
    body: "**Yes.** Your medications, conditions and health profile stay on your device by default, and interaction checks run there. If you create an account, we store a copy of your supplement product list in your account — never your medications or conditions. You can separately choose to share a brief or a temporary encrypted snapshot with an AI assistant; the app previews exactly what you selected. Disconnecting cannot erase the assistant’s existing chat history. See our [Privacy Policy](/privacy). We do not sell health data.",
  },
  {
    group: "product",
    q: "How accurate is the data?",
    body: "Interaction content is checked against applicable regulatory sources, published research and clinical references. NIH DSLD supplies label information; inclusion is not agency endorsement or proof of product quality. Interaction findings can include an evidence level (Established / Probable / Moderate / Limited / Theoretical) so you know how strong the clinical literature is. When evidence is weak, conflicting, or incomplete, we say so directly.",
  },
  {
    group: "product",
    q: "Does it work offline?",
    body: `**Yes.** The **product catalog** is pre-loaded on your device. Scanning, search, interaction checks, and stack analysis all run locally — works in pharmacies, on flights, anywhere with one bar of signal. Catalog updates and online features such as AI chat require an internet connection.`,
  },
  {
    group: "launch",
    q: "Is it free?",
    body: "**Basic use is free forever.** Beta includes all available features. After beta, Free includes barcode scans, available quality assessments, interaction and condition findings, recall alerts and details, and a limited stack and chat allowance. Optional Premium adds supplement search by name, larger stacks and more chat.",
  },
  {
    group: "product",
    q: "How is this different from the interaction checker on my pharmacy app?",
    body: "Most apps only check drug-to-drug interactions. PharmaGuide checks **supplement-to-supplement, drug-to-supplement, timing conflicts, and ingredient quality** — all personalized to your conditions, medications, and goals. Computed on your device. Reviewed by clinicians. Built for what you actually take.",
  },
  {
    group: "product",
    q: "Can I use PharmaGuide if I don't take medications?",
    body: "Yes. Scan supplements for available quality assessments and check products together for documented interactions and overlapping ingredients. You can also add health context such as pregnancy or breastfeeding to see relevant documented concerns.",
  },
  {
    group: "product",
    q: "How do recall alerts work?",
    body: "When updated catalog information identifies a recall affecting a supplement or medication you've saved, PharmaGuide updates its status and shows the recall date, reason and source. You'll receive an alert if notifications are enabled. Recall alerts and details are included in beta and stay free after beta.",
  },
  {
    group: "product",
    q: "What if my supplement isn't in your database?",
    body: `The catalog is sourced from **NIH's ${SOURCE_LABEL_COUNT} supplement labels** and grows weekly. If yours isn't there, snap a photo of the label and submit it — most submissions get added within a few days. Your contribution helps the next person looking up the same product.`,
  },
  {
    group: "privacy",
    q: "Can I share my stack with my doctor?",
    body: "**Yes.** PharmaGuide exports a clean PDF of your full supplement and medication stack with every flagged interaction and the evidence behind it. Bring it to your next appointment so you can have a real conversation about what you are actually taking.",
  },
  {
    group: "privacy",
    q: "Does it replace my doctor?",
    body: "**No.** PharmaGuide is an educational tool that surfaces research-backed interaction data and helps you prepare for conversations with your healthcare provider. It does not diagnose, does not tell you to stop medications, and does not replace clinical care. **Always consult your doctor or pharmacist** before making changes to your stack.",
  },
  {
    group: "privacy",
    q: "What about pregnancy, breastfeeding, or special populations?",
    body: "PharmaGuide flags ingredients that need extra context during **pregnancy, breastfeeding, and other special situations** — including high-dose vitamin A, certain herbal extracts, and stimulants. Set your conditions in your profile and the personal Fit recalculates accordingly. For high-stakes decisions, your OB-GYN or pharmacist remains the source of truth.",
  },
  {
    group: "launch",
    q: "When does it launch — and what changes when it does?",
    body: "Join the waitlist to request a beta invitation. Once invited, start by scanning two supplements you already take and checking them together. [Join the beta](/#waitlist).",
  },
] as const;

/** The answer as plain text — markup stripped — for JSON-LD and search. */
export function faqPlainText(item: Pick<FAQItem, "body">): string {
  return item.body
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[(.+?)\]\(([^)]+)\)/g, "$1");
}
