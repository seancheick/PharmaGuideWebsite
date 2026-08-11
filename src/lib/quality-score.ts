/**
 * Quality score → verdict, in one place.
 *
 * WHY THIS EXISTS: an audit on 2026-08-11 found the marketing site rendering
 * the same 0–100 product-quality axis with two different vocabularies and no
 * defined bands — the YourFit card called 89 "Excellent quality" while the
 * HowItWorks card called 87 "Strong", with each card's number, bar width, and
 * verdict word hardcoded separately. Nothing said where one band ended and the
 * next began, so "why is 89 excellent but 87 only strong?" had no answer.
 *
 * Every surface that shows a quality score now derives the word and the tone
 * from this table, so the number and its verdict cannot drift apart.
 *
 * ─── SCOPE ─────────────────────────────────────────────────────────────────
 * These bands are the WEBSITE's source of truth for demo cards. They must be
 * reconciled against the app's real scoring service before launch; if the app
 * disagrees, the app wins and this table changes. Do not copy these thresholds
 * into product code as if they were the clinical spec.
 *
 * Vocabulary note: this axis is deliberately worded apart from the other two
 * verdicts the site publishes, so the three never get confused —
 *   • Quality (this file)  — the product itself:  Excellent / Strong / Fair / Weak
 *   • Your Fit             — the product for you: Excellent / Good / Limited /
 *                                                 Needs review / Not recommended
 *   • Stack Health         — the whole stack:     Optimized / Solid / Decent /
 *                                                 Needs review / Unsafe
 */

export type QualityBand = {
  /** Inclusive lower bound of the band. */
  min: number;
  /** The word we show next to the number. */
  label: string;
  /**
   * Full Tailwind class names, written out rather than interpolated —
   * `text-${tone}` would be invisible to Tailwind's scanner and get purged.
   * Number, bar, and verdict all read the same color by construction.
   */
  textClass: string;
  barClass: string;
};

/** Ordered high → low. `qualityBand` returns the first band the score clears. */
export const QUALITY_BANDS: readonly QualityBand[] = [
  {
    min: 90,
    label: "Excellent",
    textClass: "text-severity-safe",
    barClass: "bg-severity-safe",
  },
  {
    min: 75,
    label: "Strong",
    textClass: "text-severity-safe",
    barClass: "bg-severity-safe",
  },
  {
    min: 60,
    label: "Fair",
    textClass: "text-severity-monitor",
    barClass: "bg-severity-monitor",
  },
  {
    min: 0,
    label: "Weak",
    textClass: "text-severity-caution",
    barClass: "bg-severity-caution",
  },
] as const;

export function qualityBand(score: number): QualityBand {
  const band = QUALITY_BANDS.find((b) => score >= b.min);
  // The 0-floor band makes this unreachable for any score in range; the throw
  // is here so a negative or NaN score fails loudly instead of rendering
  // "undefined" into a card about product safety.
  if (!band) {
    throw new Error(`qualityBand: score out of range (${score})`);
  }
  return band;
}
