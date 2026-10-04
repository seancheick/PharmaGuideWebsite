import { qualityBand } from "@/lib/quality-score";

/**
 * Hero phone stories — the two scenarios the homepage phone plays in turn.
 *
 * Every clinical statement here is copied from a production record, not
 * written for the page. When the pipeline record changes, change this file
 * (and say so in the commit):
 *
 *   • Story 1 — PharmaGuide_Pipeline scripts/data/ingredient_interaction_rules.json,
 *     magnesium × thyroid_medications: severity "caution", evidence "probable",
 *     action "Separate magnesium supplementation from levothyroxine by at
 *     least 4 hours." Quality 92 · Excellent and the NSF Certified for Sport
 *     badge are the real record for "Magnesium Bisglycinate" (Thorne, DSLD
 *     298074, pharmaguide_core.db: quality_score_v4_100 = 92, quality_tier
 *     "Excellent", verification 15/15, cert_programs ["NSF Sport"]). Brand
 *     not shown — a score, not an endorsement. Checked 2026-10-04.
 *   • Story 2 — the nutrient-accumulation example already published on
 *     /features (src/lib/features.ts): multi + vitamin D + cod liver oil ≈
 *     6,000 IU/day against the adult UL of 4,000 IU (NIH ODS).
 *
 * Why these two: one is the most relatable pair on the site (a top-selling
 * supplement with a top-filled prescription) and ends in something you can
 * act on; the other is a finding no single-bottle checker can make — each
 * product is fine, the stack is not. Together they prove the headline.
 */

export type StackItem = { id: string; name: string; dose: string };

export type Finding =
  | {
      kind: "timing";
      eyebrow: string;
      severity: string;
      title: string;
      body: string;
      action: string;
      /** Illustrates the record's minimum gap — not a dosing schedule. */
      timeline: {
        first: { time: string; name: string };
        gap: string;
        second: { time: string; name: string };
      };
      evidence: string;
    }
  | {
      kind: "total";
      eyebrow: string;
      severity: string;
      title: string;
      nutrient: string;
      total: number;
      limit: number;
      unit: string;
      limitSource: string;
      sources: { name: string; amount: number }[];
    };

export interface HeroStory {
  id: "timing" | "accumulation";
  stack: StackItem[];
  /** Typed into search; a space gets a natural hesitation. */
  search: string;
  added: StackItem & { quality?: { score: number; label: string; badge?: string } };
  /** Ids of the rows the finding connects. */
  linked: string[];
  /** Stack status line — leads with the most serious finding, then counts. */
  status: string;
  finding: Finding;
  chip: { text: string; tag: string; tone: "safe" | "caution" };
}

const MAGNESIUM_SCORE = 92;

export const HERO_STORIES: readonly HeroStory[] = [
  {
    id: "timing",
    stack: [
      { id: "levo", name: "Levothyroxine", dose: "50 mcg" },
      { id: "d3", name: "Vitamin D3", dose: "1,000 IU" },
      { id: "o3", name: "Omega-3", dose: "1,000 mg" },
    ],
    search: "magnesium glycinate",
    added: {
      id: "mag",
      name: "Magnesium Bisglycinate",
      dose: "1 scoop",
      quality: {
        score: MAGNESIUM_SCORE,
        label: qualityBand(MAGNESIUM_SCORE).label,
        badge: "NSF Certified for Sport",
      },
    },
    linked: ["levo", "mag"],
    status: "1 timing issue",
    finding: {
      kind: "timing",
      eyebrow: "Timing issue",
      severity: "Caution",
      title: "Magnesium + Levothyroxine",
      body: "Magnesium can reduce levothyroxine absorption.",
      action: "Separate by at least 4 hours",
      timeline: {
        first: { time: "7:00 AM", name: "Levothyroxine" },
        gap: "4+ hrs",
        second: { time: "11:00 AM+", name: "Magnesium" },
      },
      evidence: "Probable",
    },
    chip: { text: "Good fit with timing adjustment", tag: "For you", tone: "safe" },
  },
  {
    id: "accumulation",
    stack: [
      { id: "multi", name: "Daily Multivitamin", dose: "1 tablet" },
      { id: "d3", name: "Vitamin D3", dose: "4,000 IU" },
    ],
    search: "cod liver oil",
    added: { id: "clo", name: "Cod Liver Oil", dose: "1 tsp" },
    linked: ["multi", "d3", "clo"],
    status: "1 nutrient above limit",
    finding: {
      kind: "total",
      eyebrow: "Daily total",
      severity: "Above UL",
      title: "Vitamin D across your stack",
      nutrient: "Vitamin D",
      total: 6000,
      limit: 4000,
      unit: "IU",
      limitSource: "Adult upper limit",
      sources: [
        { name: "Multi", amount: 1000 },
        { name: "D3", amount: 4000 },
        { name: "Cod liver oil", amount: 1000 },
      ],
    },
    chip: { text: "Each bottle looks fine. Together, they don’t.", tag: "Stack", tone: "caution" },
  },
];

/** One-sentence description of both stories for screen readers. */
export const HERO_STORIES_SUMMARY =
  "Example: adding a magnesium bisglycinate rated 92 for quality to a stack with levothyroxine flags a timing issue — separate them by at least 4 hours. A multivitamin, vitamin D3 and cod liver oil together total about 6,000 IU of vitamin D a day, above the adult upper limit of 4,000 IU.";
