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
 *     where dsld_id in (298074, 313826)"
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
  thirdPartyTested: boolean;
  /** No harmful-additive flag on the record (has_harmful_additives = 0). */
  noHarmfulAdditives: boolean;
  /** No warnings on the record (top_warnings is empty). */
  noWarnings: boolean;
}

function product(p: Omit<DemoProduct, "tier">): DemoProduct {
  return { ...p, tier: qualityBand(p.score).label };
}

export const DEMO_PRODUCTS = {
  /** Hero story 1 and the Your Fit card. Record tier: "Excellent". */
  magnesium: product({
    dsldId: 298074,
    brand: "Thorne",
    name: "Magnesium Bisglycinate",
    dose: "1 scoop",
    score: 92,
    certification: "NSF Certified for Sport",
    thirdPartyTested: true,
    noHarmfulAdditives: false,
    noWarnings: false,
  }),
  /**
   * How It Works step 3. Record tier: "Exceptional". The 2,000 IU strength
   * is deliberate: the same brand at 5,000 IU scores 87 and carries an
   * upper-limit warning (125% of the UL), so it can't be shown as clean.
   */
  vitaminD: product({
    dsldId: 313826,
    brand: "Nature Made",
    name: "Vitamin D3",
    dose: "2,000 IU",
    score: 97,
    certification: "USP Verified",
    thirdPartyTested: true,
    noHarmfulAdditives: true,
    noWarnings: true,
  }),
} as const satisfies Record<string, DemoProduct>;
