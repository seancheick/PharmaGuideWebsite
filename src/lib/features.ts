/**
 * /features page — single source of truth for the 6-pillar capabilities
 * showcase. Data-driven so copy can be reviewed/refined without
 * touching the layout component.
 *
 * External-source links sprinkled throughout each pillar so the page
 * has real authority signals for crawlers (FDA, NIH ODS, DSLD, FAERS,
 * PubMed, Cochrane, NCCIH, DailyMed). Each external link uses the
 * inline-markdown link syntax `[text](url)` parsed by FeaturesClient.
 *
 * Visual treatment per pillar:
 *   • Medication Depletion gets a custom hero-grade illustration
 *     because it's the unique differentiator the user emphasized.
 *   • The other five get smaller diagrammatic visuals (custom SVG
 *     panels — not photos) that show the actual app output abstracted.
 */

export type IllustrationKey =
  | "depletion"
  | "stack"
  | "transparency"
  | "fit"
  | "accumulation"
  | "recalls";

export interface FeatureExample {
  /** A label-style left-side title (e.g. "If you take metformin") */
  trigger: string;
  /** What PharmaGuide flags / suggests (e.g. "We surface B12, folate") */
  result: string;
}

export interface FeaturePillar {
  num: string;
  /** kebab-case anchor id */
  id: string;
  /** Mono-caps eyebrow */
  eyebrow: string;
  /** Title in two parts: lead (ink) + em (italic-serif accent) */
  titleLead: string;
  titleEm: string;
  /** 1-2 sentence intro paragraph */
  intro: string;
  /** Which illustration to render */
  illustration: IllustrationKey;
  /** 3-4 short capability bullets */
  capabilities: readonly string[];
  /** Concrete examples (left/right pairs) */
  examples: readonly FeatureExample[];
  /** External authority sources (linked in section footer) */
  sources: ReadonlyArray<{ name: string; url: string }>;
  /**
   * Optional: deep-dive blog posts that belong to this pillar's
   * topic cluster. Render as a "From the blog" row when 1+ posts
   * exist. Add as more cluster posts ship — see
   * docs/10-blog-system-guide.md "Cross-link maintenance" for the
   * topic-cluster strategy mapping.
   */
  relatedPosts?: ReadonlyArray<{ title: string; slug: string }>;
}

// ─── External authority URL constants (used across pillars) ──────────
const FDA_RECALLS = "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts";
const FDA_SUPPLEMENTS = "https://www.fda.gov/food/dietary-supplements";
const FAERS = "https://www.fda.gov/drugs/questions-and-answers-fdas-adverse-event-reporting-system-faers";
const NIH_ODS = "https://ods.od.nih.gov";
const DSLD = "https://dsld.od.nih.gov";
const PUBMED = "https://pubmed.ncbi.nlm.nih.gov";
const COCHRANE = "https://www.cochranelibrary.com";
const NCCIH = "https://www.nccih.nih.gov";
const DAILYMED = "https://dailymed.nlm.nih.gov";

export const PILLARS: readonly FeaturePillar[] = [
  // ─── 1. MEDICATION DEPLETION ─────────────────────────────────────
  // The unique differentiator the user explicitly flagged. Gets the
  // most prominent illustration and the most concrete examples.
  {
    num: "01",
    id: "medication-depletion",
    eyebrow: "Medication Depletion",
    titleLead: "Your medication may be depleting nutrients.",
    titleEm: "We catch it.",
    intro:
      "Many common prescriptions quietly draw down specific vitamins and minerals over months and years. Statins lower CoQ10. Metformin depletes B12 and folate. PPIs reduce magnesium and B12 absorption. We map every medication you add to the nutrients it's known to deplete — and surface what to consider replenishing.",
    illustration: "depletion",
    capabilities: [
      "Add a medication → instantly see which nutrients are at risk",
      "Evidence-graded depletion mappings, never speculative",
      "Replenishment suggestions you can discuss with your clinician",
      "Updates as new pharmacology research is published",
    ],
    examples: [
      {
        trigger: "Statin (atorvastatin, simvastatin)",
        result: "**CoQ10** — supplementation discussed in cardiology guidelines",
      },
      {
        trigger: "Metformin",
        result: "**Vitamin B12** + **Folate** — depletion well-documented over long-term use",
      },
      {
        trigger: "PPI (omeprazole, pantoprazole)",
        result: "**Magnesium**, **Vitamin B12**, **Calcium** absorption reduced",
      },
      {
        trigger: "Loop diuretic (furosemide)",
        result: "**Potassium**, **Magnesium**, **Thiamine** lost in urine",
      },
      {
        trigger: "Combined oral contraceptive",
        result: "**B-complex** + **Folate** + **Magnesium** routinely depleted",
      },
    ],
    sources: [
      { name: "NIH Office of Dietary Supplements", url: NIH_ODS },
      { name: "DailyMed drug labeling", url: DAILYMED },
      { name: "PubMed clinical pharmacology", url: PUBMED },
    ],
    relatedPosts: [
      {
        title: "What your medication might be quietly depleting",
        slug: "medication-depletion-guide",
      },
      {
        title: "Statins and CoQ10: what the research actually shows",
        slug: "statins-and-coq10",
      },
    ],
  },

  // ─── 2. STACK INTELLIGENCE ───────────────────────────────────────
  {
    num: "02",
    id: "stack-intelligence",
    eyebrow: "Stack Intelligence",
    titleLead: "Every product. Every interaction.",
    titleEm: "All at once.",
    intro:
      "Most apps check one bottle at a time. PharmaGuide reads your full stack as a system — multi-way interactions, dose accumulation across products, and the timing conflicts that don't show up in any single label. The result is a single Stack Health verdict you can act on.",
    illustration: "stack",
    capabilities: [
      "Multi-way analysis — interactions between any pair AND beyond",
      "**Cross-product dose summation** — three caffeine products at 80mg each won't slip past 200mg/day",
      "Stack Health verdict: **Optimized · Solid · Decent · Concerning · Unsafe**",
      "Timing conflicts surfaced (e.g. calcium ↔ levothyroxine 4-hour separation)",
    ],
    examples: [
      {
        trigger: "Magnesium AM + Magnesium PM + Multi w/ magnesium",
        result: "**Triple-counted** — combined dose flagged against tolerable upper intake",
      },
      {
        trigger: "Pre-workout + green tea extract + dark chocolate squares",
        result: "**~340 mg caffeine** — 70% above 200 mg/day general guidance",
      },
      {
        trigger: "Iron supplement + calcium-rich multi + thyroid medication",
        result: "**3-way timing conflict** — separate iron and calcium from thyroid by 4 hours",
      },
    ],
    sources: [
      { name: "NIH ODS Health Professional fact sheets", url: NIH_ODS },
      { name: "Cochrane systematic reviews", url: COCHRANE },
    ],
  },

  // ─── 3. INGREDIENT & QUALITY TRANSPARENCY ────────────────────────
  {
    num: "03",
    id: "ingredient-transparency",
    eyebrow: "Ingredient & Quality",
    titleLead: "Every ingredient.",
    titleEm: "Including the fillers nobody else parses.",
    intro:
      "We parse the active ingredients AND the inactive ones — fillers, binders, allergens, and the proprietary blends most apps skip because the math is hard. Every product gets a 4-pillar PG Score so you can compare brands on substance, not packaging.",
    illustration: "transparency",
    capabilities: [
      "**Active and inactive ingredients** parsed — fillers, allergens, excipients",
      "**Proprietary-blend dose decomposition** — most apps can't read these; we can",
      "PG Score across 4 pillars: ingredient quality, safety & purity, evidence, brand trust",
      "Third-party testing flags (USP, NSF, Informed Sport) where verifiable",
    ],
    examples: [
      {
        trigger: '"Energy Blend 850mg" with no per-ingredient dose',
        result:
          "**Decomposed** — we estimate per-ingredient ranges and flag what's hidden",
      },
      {
        trigger: "Capsule with magnesium stearate + titanium dioxide",
        result: "**Inactive-ingredient flag** — relevant for some autoimmune conditions",
      },
      {
        trigger: "Two melatonin brands, same dose",
        result:
          "**PG Score divergence** — third-party tested vs. unverified, evidence weight differs",
      },
    ],
    sources: [
      { name: "NIH Dietary Supplement Label Database (DSLD)", url: DSLD },
      { name: "NIH NCCIH ingredient research", url: NCCIH },
    ],
  },

  // ─── 4. PERSONAL FIT ─────────────────────────────────────────────
  {
    num: "04",
    id: "personal-fit",
    eyebrow: "Personal Fit",
    titleLead: "What's safe for one person",
    titleEm: "may not be for another.",
    intro:
      "Your conditions, age, current medications, and goals reshape every recommendation. Pregnancy. Hypertension. Anticoagulant therapy. Each modifies the safety calculus. We profile-gate every interaction so you only see warnings that actually apply to you.",
    illustration: "fit",
    capabilities: [
      "Profile gating — irrelevant warnings stay hidden, relevant ones surface clearly",
      "Pregnancy + breastfeeding flags treated as separate, never combined",
      "Drug-class awareness: SSRIs, statins, anticoagulants, hypoglycemics, more",
      "Goal-driven stack recommendations (sleep, energy, recovery, longevity)",
    ],
    examples: [
      {
        trigger: "St. John's Wort + sertraline + 'mood support' goal",
        result: "**Contraindicated** — serotonin syndrome risk, full stop",
      },
      {
        trigger: "High-dose vitamin A + 'pregnancy' profile flag",
        result: "**Caution** — teratogenic risk above 10,000 IU daily",
      },
      {
        trigger: "Niacin + active statin therapy",
        result: "**Monitor** — interaction with certain hypoglycemic profiles",
      },
    ],
    sources: [
      { name: "NIH ODS health professional resources", url: NIH_ODS },
      { name: "PubMed clinical reviews", url: PUBMED },
    ],
  },

  // ─── 5. NUTRIENT ACCUMULATION ────────────────────────────────────
  {
    num: "05",
    id: "nutrient-accumulation",
    eyebrow: "Nutrient Accumulation",
    titleLead: "When 'more' becomes",
    titleEm: "too much.",
    intro:
      "Fat-soluble vitamins accumulate. Mineral overdoses are real. We track every nutrient across your full stack against the **Recommended Daily Allowance (RDA)** and the **Tolerable Upper Intake Level (UL)** — and flag the moment your intake crosses into the zone where supplementation harms more than it helps.",
    illustration: "accumulation",
    capabilities: [
      "RDA + UL tracking per nutrient across the entire stack",
      "Fat-soluble accumulation flags (vitamin A, D, E, K)",
      "Mineral excess detection (iron, zinc, selenium)",
      "Visualized as a per-nutrient meter so you see the headroom",
    ],
    examples: [
      {
        trigger: "Multi + dedicated vitamin D + cod liver oil",
        result: "**~6,000 IU vitamin D/day** — approaching adult UL of 4,000 IU",
      },
      {
        trigger: "Multi + zinc lozenges + zinc-forward immune blend",
        result: "**~70 mg zinc** — above 40 mg UL; chronic excess depletes copper",
      },
      {
        trigger: "Iron supplement + iron-fortified multi",
        result: "**~80 mg iron** — past UL of 45 mg; oxidative stress risk",
      },
    ],
    sources: [
      { name: "NIH ODS dietary reference intakes", url: NIH_ODS },
      { name: "FDA dietary supplement guidance", url: FDA_SUPPLEMENTS },
    ],
  },

  // ─── 6. RECALL & SAFETY AWARENESS ────────────────────────────────
  {
    num: "06",
    id: "recall-safety",
    eyebrow: "Recall & Safety",
    titleLead: "When the FDA pulls something,",
    titleEm: "you find out fast.",
    intro:
      "The FDA recalls dietary supplements regularly — adulterated formulations, undeclared pharmaceuticals, contamination, mislabeling. Most users never hear about it. PharmaGuide pulls active recalls and the FDA Adverse Event Reporting System (FAERS) so a product in your stack can't quietly become unsafe without you noticing.",
    illustration: "recalls",
    capabilities: [
      "Live FDA recall monitoring across dietary supplements + medications",
      "FAERS-linked safety signals — adverse event reports surface in-app",
      "Lot-level recall checking when manufacturers publish lot data",
      "FDA warning letter awareness for repeat-offender brands",
    ],
    examples: [
      {
        trigger: "Brand X recalled for undeclared sildenafil",
        result: "**Stack alert** — flagged immediately if you've scanned that product",
      },
      {
        trigger: "Manufacturing recall by lot number 2026-AC-0814",
        result: "**Lot match** — your bottle's lot triggers the warning, others don't",
      },
      {
        trigger: "FAERS adverse event cluster on a kratom product",
        result: "**Safety signal** — surfaced before the FDA formally pulls the product",
      },
    ],
    sources: [
      { name: "FDA Recalls, Market Withdrawals & Safety Alerts", url: FDA_RECALLS },
      { name: "FDA Adverse Event Reporting System (FAERS)", url: FAERS },
    ],
  },
];

// ─── Bonus: Clinician-Ready Reports + Built On strip ─────────────────

export const CLINICIAN_REPORT = {
  eyebrow: "Bonus capability",
  title: "A report your clinician can actually read.",
  body: "Export your full stack — every supplement, every medication, every flagged interaction with mechanism and evidence — as a clean PDF sized for the 7-minute primary care visit. Or copy-paste it straight into MyChart's secure messaging.",
  bullets: [
    "PDF export sized for clinical workflow",
    "Plain-text version for MyChart and patient portals",
    "Includes evidence levels and recommendation language",
  ],
};

export const BUILT_ON = [
  {
    label: "180,000-product catalog",
    detail: "Pre-loaded on your device. Sub-10ms lookup. Updates over the air.",
  },
  {
    label: "Offline-first",
    detail: "Scan and analyze with one bar of signal — pharmacy, flight, supplement aisle.",
  },
  {
    label: "Privacy by architecture",
    detail: "Your stack and conditions never leave your device. AES-256 locally. HIPAA-aligned.",
  },
  {
    label: "Clinician-reviewed",
    detail: "Every interaction passes through a licensed pharmacist before it ships.",
  },
];

export const BOUNDARIES = {
  title: "What we don't do",
  items: [
    "We don't diagnose conditions",
    "We don't replace your clinician",
    "We don't tell you to stop medications",
    "We don't sell your health data",
  ],
};
