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
 * Every surface that shows a quality score derives its word and its tone from
 * this table, so the number and its verdict cannot drift apart.
 *
 * ─── SOURCE OF TRUTH ───────────────────────────────────────────────────────
 * These bands are now COPIED FROM THE APP, which owns scoring. The previous
 * version of this file carried a website-invented 4-band table (90/75/60/0 →
 * Excellent/Strong/Fair/Weak) and a note saying it had to be reconciled with
 * the app before launch, app wins. On 2026-08-13 that reconciliation happened,
 * because product share links started rendering app-supplied tiers on this
 * site and a second vocabulary would have put two different words on the same
 * score depending on which page you landed on.
 *
 * App source: `lib/core/scoring/score_tier.dart` → `legacyTierForScore()` and
 * `_catalogTierFromLabel()`. If those thresholds change, change these. Never
 * the reverse — the pipeline computes the score and ships `quality_tier`
 * alongside it, and the app prefers that shipped value over any local
 * recomputation. This table is the website's renderer for the same vocabulary,
 * not a second opinion about it.
 *
 * Vocabulary note: this axis is deliberately worded apart from the other two
 * verdicts the site publishes, so the three never get confused —
 *   • Quality (this file)  — the product itself:  Elite / Excellent / Strong /
 *                                                 Acceptable / Weak / Poor
 *   • Your Fit             — the product for you: Excellent / Good / Limited /
 *                                                 Needs review / Not recommended
 *   • Stack Health         — the whole stack:     Optimized / Solid / Decent /
 *                                                 Needs review / Unsafe
 */

/** The app's tier ids, lowercase, exactly as the pipeline ships them. */
export const QUALITY_TIER_IDS = [
  "elite",
  "excellent",
  "strong",
  "acceptable",
  "weak",
  "poor",
] as const;

export type QualityTierId = (typeof QUALITY_TIER_IDS)[number];

export type QualityBand = {
  /** Tier id as shipped by the pipeline in `quality_tier`. */
  id: QualityTierId;
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
    id: "elite",
    min: 95,
    label: "Elite",
    textClass: "text-severity-safe",
    barClass: "bg-severity-safe",
  },
  {
    id: "excellent",
    min: 90,
    label: "Excellent",
    textClass: "text-severity-safe",
    barClass: "bg-severity-safe",
  },
  {
    id: "strong",
    min: 80,
    label: "Strong",
    textClass: "text-severity-safe",
    barClass: "bg-severity-safe",
  },
  {
    id: "acceptable",
    min: 70,
    label: "Acceptable",
    textClass: "text-severity-monitor",
    barClass: "bg-severity-monitor",
  },
  {
    id: "weak",
    min: 55,
    label: "Weak",
    textClass: "text-severity-caution",
    barClass: "bg-severity-caution",
  },
  {
    id: "poor",
    min: 0,
    label: "Poor",
    textClass: "text-severity-avoid",
    barClass: "bg-severity-avoid",
  },
] as const;

/**
 * Band for a score. Use this for demo cards the site authors itself.
 *
 * For a score that arrived FROM the app (a share snapshot), prefer
 * `bandForTierId` with the shipped `quality_tier` — the pipeline's own tier
 * is authoritative and may legitimately differ from what these thresholds
 * would compute for an edge-case product.
 */
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

/**
 * Band for a pipeline-shipped tier id. Returns undefined for an unrecognised
 * value so callers can fail closed rather than guess — a tier this site has
 * never heard of means the app shipped a new vocabulary and the right move is
 * to show the number without a verdict, not to invent one.
 */
export function bandForTierId(tierId: string): QualityBand | undefined {
  const normalized = tierId.trim().toLowerCase();
  return QUALITY_BANDS.find((b) => b.id === normalized);
}
