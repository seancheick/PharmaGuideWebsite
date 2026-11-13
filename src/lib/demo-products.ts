import { qualityBand } from "./quality-score";

/**
 * Demo products — every product the marketing site shows with a quality
 * score. One record each; components read from here and never type a score.
 *
 * These are SAMPLE products, not catalog records (decided 2026-11-13). The
 * site used to show a real product's score, and the catalog re-scored it
 * (92 → 87) while the page still said 92. A sample cannot go stale: its
 * score is illustrative and every surface that shows it says "Sample
 * product". No brand, no certification, no DSLD id — nothing here claims to
 * describe something on a shelf.
 *
 * What stays real is the clinical finding the sample is used to demonstrate
 * (see components/hero/stories.ts); that is copied from a published record.
 */

export interface DemoProduct {
  name: string;
  dose: string;
  /** Illustrative. Shown only next to `SAMPLE_PRODUCT_LABEL`. */
  score: number;
  /** Verdict word, derived from the score with the app's bands. */
  tier: string;
}

/** The words that accompany a sample score wherever it is shown. */
export const SAMPLE_PRODUCT_LABEL = "Sample product";

function product(p: Omit<DemoProduct, "tier">): DemoProduct {
  return { ...p, tier: qualityBand(p.score).label };
}

export const DEMO_PRODUCTS = {
  /** Hero story 1 and the homepage scan section. */
  calcium: product({
    name: "Calcium + Vitamin D3",
    dose: "1 tablet",
    score: 88,
  }),
} as const satisfies Record<string, DemoProduct>;
