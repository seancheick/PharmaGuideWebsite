import { qualityBand } from "./quality-score";

/**
 * Demo products — every product the marketing site shows with a quality
 * score, certification or ingredient claim. One record each, copied from
 * the shipped catalog; components read from here and never type a score.
 *
 * Source: PharmaGuide_Pipeline scripts/final_db_output/pharmaguide_core.db
 * (products_core), read 2026-10-04. Re-check when the catalog is rebuilt:
 *   sqlite3 pharmaguide_core.db "select dsld_id, quality_score_v4_100,
 *     quality_tier, cert_programs, has_third_party_testing,
 *     has_harmful_additives, top_warnings from products_core
 *     where dsld_id = 298074"
 *
 * Brands are recorded for traceability but not shown: the site presents a
 * score, not an endorsement. Only state what the record supports — e.g. the
 * magnesium carries a low-risk additive flag (monk fruit sweetener), so it
 * is never called a "clean ingredient list".
 */

export interface DemoProduct {
  dsldId: number;
  brand: string;
  name: string;
  dose: string;
  score: number;
  /** Verdict word, derived from the score with the app's bands. */
  tier: string;
  certification?: string;
}

function product(p: Omit<DemoProduct, "tier">): DemoProduct {
  return { ...p, tier: qualityBand(p.score).label };
}

export const DEMO_PRODUCTS = {
  /** Hero story 1 and How It Works step 3. Record tier: "Excellent". */
  magnesium: product({
    dsldId: 298074,
    brand: "Thorne",
    name: "Magnesium Bisglycinate",
    dose: "1 scoop",
    score: 92,
    certification: "NSF Certified for Sport",
  }),
} as const satisfies Record<string, DemoProduct>;
