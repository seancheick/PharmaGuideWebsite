/**
 * FAQ source-of-truth.
 *
 * Single array consumed by:
 *   • /faq page render (FAQClient accordion)
 *   • FAQPage JSON-LD schema (SEO — Google rich results)
 *
 * Voice rules applied:
 *   • Second-person preferred
 *   • No "AI-powered" / "revolutionary" / "trusted" (when unproven)
 *   • Numbers consistent: 180,000+ products (matches the rest of the site)
 *   • Evidence-level system actually named (Established / Probable /
 *     Moderate / Limited / Theoretical) — matches the in-app schema
 *   • Restraint > emphasis (no bold-everywhere, no exclamation marks)
 *
 * Answer text uses plain prose. Inline emphasis happens via <strong>
 * tags inside markdown-ish strings — the FAQClient renders these
 * with React.createElement to preserve them safely.
 */

export type FAQGroup = "product" | "privacy" | "launch";

export interface FAQItem {
  q: string;
  /** Plain-text answer for JSON-LD (search engines parse this). */
  a: string;
  /** React-renderable answer with optional inline emphasis nodes. */
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
    a: "PharmaGuide is a supplement and medication interaction checker. Scan any product to see how it interacts with your other supplements, your prescriptions, and your timing. Every interaction includes the mechanism, evidence level, and clinical reasoning behind the verdict — reviewed by a licensed pharmacist before it ships.",
    body: "PharmaGuide is a supplement and medication interaction checker. Scan any product to see how it interacts with your other supplements, your prescriptions, and your timing. Every interaction includes the mechanism, evidence level, and clinical reasoning behind the verdict — **reviewed by a licensed pharmacist before it ships**.",
  },
  {
    group: "privacy",
    q: "Is my health data actually private?",
    a: "Yes. Your stack and health context are designed to stay on your device. We use AES-256 encryption locally and never upload your personal health data to our servers. The architecture is HIPAA-aligned. We do not sell health data.",
    body: "**Yes.** Your stack and health context are designed to stay on your device. We use AES-256 encryption locally and never upload your personal health data to our servers. The architecture is HIPAA-aligned. We do not sell health data.",
  },
  {
    group: "product",
    q: "How accurate is the data?",
    a: "Every interaction is cross-referenced with FDA, NIH, PubMed, and DSLD sources, then reviewed by a licensed pharmacist. Each one carries an evidence level (Established / Probable / Moderate / Limited / Theoretical) so you know how strong the clinical literature is. When evidence is weak, conflicting, or incomplete, we say so directly.",
    body: "Every interaction is cross-referenced with **FDA, NIH, PubMed, and DSLD** sources, then reviewed by a licensed pharmacist. Each one carries an evidence level (Established / Probable / Moderate / Limited / Theoretical) so you know how strong the clinical literature is. When evidence is weak, conflicting, or incomplete, we say so directly.",
  },
  {
    group: "product",
    q: "Does it work offline?",
    a: "Yes. The full 180,000+ product catalog is pre-loaded on your device. Scanning, search, interaction checks, and stack analysis all run locally — works in pharmacies, on flights, anywhere with one bar of signal. Only optional features that pull live citations need an internet connection.",
    body: "**Yes.** The full **180,000+ product catalog** is pre-loaded on your device. Scanning, search, interaction checks, and stack analysis all run locally — works in pharmacies, on flights, anywhere with one bar of signal. Only optional features that pull live citations need an internet connection.",
  },
  {
    group: "launch",
    q: "Is it free?",
    a: "The core interaction checker is free during beta — scanning, search, your stack, and every interaction warning with full reasoning. No credit card required. Optional premium features (deep clinical research, advanced personalization, the AI pharmacist conversation layer) will be available later through a subscription.",
    body: "The core interaction checker is **free during beta** — scanning, search, your stack, and every interaction warning with full reasoning. No credit card required. Optional premium features (deep clinical research, advanced personalization, the AI pharmacist conversation layer) will be available later through a subscription.",
  },
  {
    group: "product",
    q: "How is this different from the interaction checker on my pharmacy app?",
    a: "Most apps only check drug-to-drug interactions. PharmaGuide checks supplement-to-supplement, drug-to-supplement, timing conflicts, and ingredient quality — all personalized to your conditions, medications, and goals. Computed on your device. Reviewed by clinicians. Built for what you actually take.",
    body: "Most apps only check drug-to-drug interactions. PharmaGuide checks **supplement-to-supplement, drug-to-supplement, timing conflicts, and ingredient quality** — all personalized to your conditions, medications, and goals. Computed on your device. Reviewed by clinicians. Built for what you actually take.",
  },
  {
    group: "product",
    q: "What if my supplement isn't in your database?",
    a: "The catalog covers 180,000+ products and grows weekly. If yours isn't there, snap a photo of the label and submit it — most submissions get added within a few days. Your contribution helps the next person looking up the same product.",
    body: "The catalog covers **180,000+ products** and grows weekly. If yours isn't there, snap a photo of the label and submit it — most submissions get added within a few days. Your contribution helps the next person looking up the same product.",
  },
  {
    group: "privacy",
    q: "Can I share my stack with my doctor?",
    a: "Yes. PharmaGuide exports a clean PDF of your full supplement and medication stack with every flagged interaction and the evidence behind it. Bring it to your next appointment so you can have a real conversation about what you are actually taking.",
    body: "**Yes.** PharmaGuide exports a clean PDF of your full supplement and medication stack with every flagged interaction and the evidence behind it. Bring it to your next appointment so you can have a real conversation about what you are actually taking.",
  },
  {
    group: "privacy",
    q: "Does it replace my doctor?",
    a: "No. PharmaGuide is an educational tool that surfaces research-backed interaction data and helps you prepare for conversations with your healthcare provider. It does not diagnose, does not tell you to stop medications, and does not replace clinical care. Always consult your doctor or pharmacist before making changes to your stack.",
    body: "**No.** PharmaGuide is an educational tool that surfaces research-backed interaction data and helps you prepare for conversations with your healthcare provider. It does not diagnose, does not tell you to stop medications, and does not replace clinical care. **Always consult your doctor or pharmacist** before making changes to your stack.",
  },
  {
    group: "privacy",
    q: "What about pregnancy, breastfeeding, or special populations?",
    a: "PharmaGuide flags ingredients that need extra context during pregnancy, breastfeeding, and other special situations — including high-dose vitamin A, certain herbal extracts, and stimulants. Set your conditions in your profile and the personal Fit recalculates accordingly. For high-stakes decisions, your OB-GYN or pharmacist remains the source of truth.",
    body: "PharmaGuide flags ingredients that need extra context during **pregnancy, breastfeeding, and other special situations** — including high-dose vitamin A, certain herbal extracts, and stimulants. Set your conditions in your profile and the personal Fit recalculates accordingly. For high-stakes decisions, your OB-GYN or pharmacist remains the source of truth.",
  },
  {
    group: "launch",
    q: "When does it launch — and what changes when it does?",
    a: "Opening in waves through 2026. The core interaction checker stays free at launch — scanning, search, your stack, and every interaction warning with full reasoning. Optional premium features (deep clinical research, advanced personalization, the AI pharmacist conversation layer) become available through a subscription. Founding beta members get extended free access.",
    body: "Opening in waves through **2026**. The core interaction checker stays **free at launch** — scanning, search, your stack, and every interaction warning with full reasoning. Optional premium features (deep clinical research, advanced personalization, the AI pharmacist conversation layer) become available through a subscription. **Founding beta members get extended free access.** [Join the beta](/#waitlist).",
  },
] as const;
