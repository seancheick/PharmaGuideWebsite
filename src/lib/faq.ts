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

export interface FAQItem {
  q: string;
  /** Plain-text answer for JSON-LD (search engines parse this). */
  a: string;
  /** React-renderable answer with optional inline emphasis nodes. */
  body: string;
}

export const FAQ_ITEMS: readonly FAQItem[] = [
  {
    q: "What is PharmaGuide?",
    a: "PharmaGuide is a supplement and medication interaction checker. Scan any product to see how it interacts with your other supplements, your prescriptions, and your timing. Every interaction includes the mechanism, evidence level, and clinical reasoning behind the verdict — reviewed by a licensed pharmacist before it ships.",
    body: "PharmaGuide is a supplement and medication interaction checker. Scan any product to see how it interacts with your other supplements, your prescriptions, and your timing. Every interaction includes the mechanism, evidence level, and clinical reasoning behind the verdict — **reviewed by a licensed pharmacist before it ships**.",
  },
  {
    q: "Is my health data actually private?",
    a: "Yes. Your stack and health context are designed to stay on your device. We use AES-256 encryption locally and never upload your personal health data to our servers. The architecture is HIPAA-aligned. We do not sell health data.",
    body: "**Yes.** Your stack and health context are designed to stay on your device. We use AES-256 encryption locally and never upload your personal health data to our servers. The architecture is HIPAA-aligned. We do not sell health data.",
  },
  {
    q: "How accurate is the data?",
    a: "Every interaction is cross-referenced with FDA, NIH, PubMed, and DSLD sources, then reviewed by a licensed pharmacist. Each one carries an evidence level (Established / Probable / Moderate / Limited / Theoretical) so you know how strong the clinical literature is. When evidence is weak, conflicting, or incomplete, we say so directly.",
    body: "Every interaction is cross-referenced with **FDA, NIH, PubMed, and DSLD** sources, then reviewed by a licensed pharmacist. Each one carries an evidence level (Established / Probable / Moderate / Limited / Theoretical) so you know how strong the clinical literature is. When evidence is weak, conflicting, or incomplete, we say so directly.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. The full 180,000-product catalog is pre-loaded on your device. Scanning, search, interaction checks, and stack analysis all run locally — works in pharmacies, on flights, anywhere with one bar of signal. Only optional features that pull live citations need an internet connection.",
    body: "**Yes.** The full **180,000-product catalog** is pre-loaded on your device. Scanning, search, interaction checks, and stack analysis all run locally — works in pharmacies, on flights, anywhere with one bar of signal. Only optional features that pull live citations need an internet connection.",
  },
  {
    q: "Is it free?",
    a: "The core interaction checker is free during beta — scanning, search, your stack, and every interaction warning with full reasoning. No credit card required. Optional premium features (deep clinical research, advanced personalization) will be available later through a subscription.",
    body: "The core interaction checker is **free during beta** — scanning, search, your stack, and every interaction warning with full reasoning. No credit card required. Optional premium features (deep clinical research, advanced personalization) will be available later through a subscription.",
  },
  {
    q: "What makes PharmaGuide different?",
    a: "Most apps only check drug-to-drug interactions. PharmaGuide checks supplement-to-supplement, drug-to-supplement, timing conflicts, and ingredient quality — all personalized to your conditions, medications, and goals. Computed on your device. Reviewed by clinicians. Built for what you actually take.",
    body: "Most apps only check drug-to-drug interactions. PharmaGuide checks **supplement-to-supplement, drug-to-supplement, timing conflicts, and ingredient quality** — all personalized to your conditions, medications, and goals. Computed on your device. Reviewed by clinicians. Built for what you actually take.",
  },
  {
    q: "What if my supplement isn't in your database?",
    a: "The catalog covers 180,000+ products and grows weekly. If yours isn't there, snap a photo of the label and submit it — most submissions get added within a few days. Your contribution helps the next person looking up the same product.",
    body: "The catalog covers **180,000+ products** and grows weekly. If yours isn't there, snap a photo of the label and submit it — most submissions get added within a few days. Your contribution helps the next person looking up the same product.",
  },
  {
    q: "Can I share my stack with my doctor?",
    a: "Yes. PharmaGuide exports a clean PDF of your full supplement and medication stack with every flagged interaction and the evidence behind it. Bring it to your next appointment so you can have a real conversation about what you are actually taking.",
    body: "**Yes.** PharmaGuide exports a clean PDF of your full supplement and medication stack with every flagged interaction and the evidence behind it. Bring it to your next appointment so you can have a real conversation about what you are actually taking.",
  },
  {
    q: "Does it replace my doctor?",
    a: "No. PharmaGuide is an educational tool that surfaces research-backed interaction data and helps you prepare for conversations with your healthcare provider. It does not diagnose, does not tell you to stop medications, and does not replace clinical care. Always consult your doctor or pharmacist before making changes to your stack.",
    body: "**No.** PharmaGuide is an educational tool that surfaces research-backed interaction data and helps you prepare for conversations with your healthcare provider. It does not diagnose, does not tell you to stop medications, and does not replace clinical care. **Always consult your doctor or pharmacist** before making changes to your stack.",
  },
  {
    q: "When does it launch?",
    a: "Opening in waves through 2026. Join the beta to be among the first invited.",
    body: "Opening in waves through **2026**. [Join the beta](/#waitlist) to be among the first invited.",
  },
] as const;
