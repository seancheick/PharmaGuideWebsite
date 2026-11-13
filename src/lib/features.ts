import { SOURCE_LABEL_COUNT } from "./site";
import { QUALITY_PILLARS } from "./quality-score";

/**
 * /features page — single source of truth for the 6-pillar capabilities
 * showcase. Data-driven so copy can be reviewed/refined without
 * touching the layout component.
 *
 * External-source links sprinkled throughout each pillar so the page
 * has real authority signals for crawlers (FDA, NIH ODS, DSLD,
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
  /**
   * 12-15 word descriptor rendered on the pillar OVERVIEW grid at the
   * top of /features. Gives the page information scent before the user
   * has to scroll into the deep-dive section. Plain text, no markdown.
   */
  overview: string;
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
const NIH_ODS = "https://ods.od.nih.gov";
const DSLD = "https://dsld.od.nih.gov";
const PUBMED = "https://pubmed.ncbi.nlm.nih.gov";
const COCHRANE = "https://www.cochrane.org/evidence";
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
    overview:
      "Maps supported prescriptions to the vitamins and minerals they may draw down over time.",
    intro:
      "Some common prescriptions are associated with lower levels of specific vitamins and minerals over months and years — for example, long-term metformin and vitamin B12. We map supported medications to the nutrients they may affect, and surface what to consider discussing with your clinician. A lower level is not a diagnosis, and it does not by itself mean you need a supplement.",
    illustration: "depletion",
    capabilities: [
      "Add a medication → see which nutrients may be affected",
      "Evidence-graded mappings from published research; mappings still under review are not shown",
      "Questions you can bring to your clinician — never a prescription",
      "Updated as new pharmacology research is published",
    ],
    examples: [
      {
        trigger: "Metformin",
        result: "**Vitamin B12** — lower levels more likely with long-term, higher-dose use",
      },
      {
        trigger: "PPI (omeprazole, pantoprazole)",
        result: "**Iron** status and **calcium** carbonate absorption with long-term use",
      },
      {
        trigger: "Loop diuretic (furosemide)",
        result: "**Calcium** and **Thiamine** — more lost in urine with long-term use",
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
    titleLead: "Your full stack.",
    titleEm: "Checked as a system.",
    overview:
      "Multi-way interactions, cross-product dose summation, timing conflicts — your stack analyzed together.",
    intro:
      "Most apps check one bottle at a time. PharmaGuide reads your stack as a system — multi-way interactions, dose overlap across products, and the timing conflicts that don't show up in any single label. The result is a stack status you can act on.",
    illustration: "stack",
    capabilities: [
      "Multi-way analysis — interactions between any pair AND beyond",
      "Cross-product dose summation — zinc from three products is added up and checked against the 40 mg/day upper limit",
      "Stack status that leads with your most serious finding and counts what needs review",
      "Timing conflicts surfaced (e.g. calcium ↔ levothyroxine 4-hour separation)",
    ],
    examples: [
      {
        trigger: "Magnesium AM + Magnesium PM + Multi w/ magnesium",
        result: "**Triple-counted** — combined dose flagged against tolerable upper intake",
      },
      {
        trigger: "Fish oil + turmeric + warfarin",
        // Pipeline: fish oil × anticoagulants = monitor (established; trials
        // show no overall bleeding increase); turmeric/curcumin × anticoagulants
        // = caution (theoretical, lab data). Neither is "adds to warfarin".
        result: "**Two flags** — fish oil (Monitor) and turmeric (Caution, limited evidence); tell your prescriber about both and report unusual bruising or bleeding",
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
    titleLead: "Active and inactive ingredients.",
    titleEm: "Including the ones most apps skip.",
    overview:
      "Active and inactive ingredients parsed, proprietary blends read as disclosed, six-part PG Score per product.",
    intro:
      "We parse the active ingredients AND the inactive ones — fillers, binders, allergens, and the proprietary blends most apps skip. Products with completed assessments receive a PG Score out of 100 across six parts. This editorial assessment uses available label and research information; it is not a laboratory test, a measure of personal benefit, or a guarantee of safety.",
    illustration: "transparency",
    capabilities: [
      "Active and inactive ingredients parsed — fillers, allergens, excipients",
      "Proprietary blends read as printed — the total and the ingredients inside, with undisclosed amounts marked unknown, never guessed",
      "Probiotic strain + CFU and prebiotic fiber checks — strains named, live counts and fiber type verified, not just 'blend'",
      `PG Score across six parts: ${QUALITY_PILLARS.map((p) => `${p.name} ${p.max}`).join(", ")}`,
      "Third-party certifications (USP, NSF, Informed Sport) earn full credit only when confirmed in the certifier's registry; a label claim alone counts for less",
    ],
    examples: [
      {
        trigger: '"Energy Blend 850mg" with no per-ingredient dose',
        result:
          "**Amounts not disclosed** — ingredients inside still get checked for interactions; dose-based conclusions are marked limited",
      },
      {
        trigger: '"50 billion CFU probiotic" with strains unnamed',
        result:
          "**Strain-gap flag** — CFU counts mean little without the specific strains the evidence is built on",
      },
      {
        trigger: "Capsule with magnesium stearate + titanium dioxide",
        // Pipeline: titanium dioxide (E171) is on the watchlist — banned as a
        // food additive in the EU since 2022-02-07 (Reg. (EU) 2022/63), still
        // permitted in the US; magnesium stearate is low concern.
        result: "**Additive flag** — titanium dioxide is no longer allowed in EU foods or supplements; magnesium stearate is low concern",
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
    overview:
      "Profile-gated warnings tuned to your conditions, medications, and goals — irrelevant alerts stay hidden.",
    intro:
      "Your profile helps put documented concerns in context, including pregnancy, conditions and current medications. Checks use the information you provide and the available rules; missing information and limited coverage can affect what is found. Bring flagged concerns to your pharmacist or clinician before changing what you take.",
    illustration: "fit",
    capabilities: [
      "Profile gating — irrelevant warnings stay hidden, relevant ones surface clearly",
      "Medication ↔ condition flags — surfaces when something in your stack is risky given a diagnosis you've entered",
      "Pregnancy + breastfeeding flags treated as separate, never combined",
      "Drug-class awareness: SSRIs, statins, anticoagulants, hypoglycemics, more",
      "Goal context for reviewing supplement information (sleep, energy and recovery)",
    ],
    examples: [
      {
        trigger: "St. John's Wort + sertraline + 'mood support' goal",
        result: "**Avoid** — serotonin syndrome risk; avoid unless your prescriber directs and monitors it",
      },
      {
        trigger: "Potassium + ACE inhibitor + 'kidney disease' profile",
        result: "**Caution** — hyperkalemia risk with reduced kidney function; check with your kidney-care team first. Surfaced because all three are in your profile",
      },
      {
        trigger: "Vitamin A over 10,000 IU + 'pregnancy' profile flag",
        result: "**Contraindicated** above 10,000 IU/day of preformed vitamin A; caution below that",
      },
      {
        trigger: "High-dose niacin (1 g/day or more) + statin",
        result: "**Caution** — watch for muscle pain or weakness; tell your prescriber",
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
    overview:
      "Tracks nutrients across your full stack against the RDA and Tolerable Upper Intake Level where one is published.",
    intro:
      "Fat-soluble vitamins accumulate. Mineral overdoses are real. We track nutrients across your stack against the **Recommended Daily Allowance (RDA)** and the **Tolerable Upper Intake Level (UL)** where one is published — and flag when your intake crosses into the zone where supplementation may do more harm than good.",
    illustration: "accumulation",
    capabilities: [
      "RDA + UL tracking across the entire stack, where a reference is published",
      "Fat-soluble accumulation flags (vitamin A, D, E, K)",
      "Mineral excess detection (iron, zinc, selenium)",
      "Visualized as a per-nutrient meter so you see the headroom",
    ],
    examples: [
      {
        trigger: "Multi + dedicated vitamin D + cod liver oil",
        result: "**~6,000 IU vitamin D/day** — above the adult UL of 4,000 IU",
      },
      {
        trigger: "Multi + zinc lozenges + zinc-forward immune blend",
        result: "**~70 mg zinc** — above 40 mg UL; chronic excess depletes copper",
      },
      {
        trigger: "Iron supplement + iron-fortified multi",
        result: "**~80 mg iron** — past the 45 mg UL; stomach upset and constipation come first",
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
    titleLead: "Stay informed about",
    titleEm: "product recalls.",
    overview:
      "Recall monitoring for saved supplements and medications.",
    intro:
      "When updated catalog information identifies a recall affecting a saved supplement or medication, PharmaGuide updates its status with the recall date, reason and source. Enable notifications to receive an alert. Recall alerts and details are included in beta and stay free after beta.",
    illustration: "recalls",
    capabilities: [
      "Recall updates for affected saved supplements and medications",
      "Banned and adulterant ingredients flagged with the reason and the FDA source",
      "Recalled products stay findable — a scan shows the recall instead of \"not found\"",
      "FDA warning letter awareness for flagged brands",
    ],
    examples: [
      {
        trigger: "Brand X recalled for undeclared sildenafil",
        result: "**Stack alert** — flagged if that product is in your stack",
      },
      {
        trigger: "Product containing a banned ingredient",
        result: "**Blocked** — no score shown, just the reason and the source",
      },
    ],
    sources: [
      { name: "FDA Recalls, Market Withdrawals & Safety Alerts", url: FDA_RECALLS },
      { name: "FDA dietary supplements", url: FDA_SUPPLEMENTS },
    ],
  },
];

// ─── Bonus: Clinician-Ready Reports + Built On strip ─────────────────

/**
 * Share your stack — the app's three share options, in its order
 * (lib/features/stack/widgets/stack_share_sheet.dart), worded from:
 *   • clinician: services/sharing/clinician_pdf_builder.dart — findings with
 *     evidence, mechanism, management and source; limitations; questions. No
 *     plain-text portal export exists, so none is claimed.
 *   • assistant: lib/ai-connector.ts + the privacy page — a connection reads
 *     the synced supplement list only; medications and profile go only in a
 *     snapshot the user switches on, previews and saves (24 h by default).
 *   • friends: "Product names and brands only."
 */
export const SHARE_STACK = {
  eyebrow: "Share your stack",
  title: "Shared on your terms.",
  body: "You choose exactly what leaves your phone, and who gets it.",
  channels: [
    {
      who: "Your clinician",
      short: "A PDF for your clinician",
      title: "A report your clinician can actually read.",
      body: "A PDF of your supplements and medications, with each flagged finding's mechanism, evidence level and source, plus what could not be checked. Preview it before you share or print.",
    },
    {
      who: "Your AI assistant",
      short: "Claude or ChatGPT",
      title: "Ask Claude or ChatGPT about your own stack.",
      body: "Connect your assistant and it can read your supplement list. To share more, such as PharmaGuide's findings or your medications, switch each one on, preview the exact text and save it; it expires after 24 hours by default. Disconnect anytime.",
    },
    {
      who: "Friends and family",
      short: "Friends and family",
      title: "Show what you take.",
      body: "Send your supplement list as product names and brands only. Medications and your health profile are never included.",
    },
  ],
} as const;

export const BUILT_ON = [
  {
    label: `Sourced from ${SOURCE_LABEL_COUNT} NIH labels`,
    detail: "Catalog stored on your device, so lookups work offline. Updates over the air.",
  },
  {
    label: "Offline-first",
    detail: "Scan and analyze with one bar of signal — pharmacy, flight, supplement aisle.",
  },
  {
    label: "Private by design",
    detail: "Core stack checks run on-device with privacy-first storage and safeguards.",
  },
  {
    label: "Clinician-reviewed",
    detail: "Interaction guidance reviewed by licensed pharmacists.",
  },
];

/**
 * A product the catalog doesn't have yet. App flow:
 * features/scanner/scanner_not_found_sheet.dart → "Help add this product" →
 * missing_product_submission_sheet.dart (panel photos, blur check, panel
 * auto-labelling, human review of every entry, notification). The "few days"
 * timing is Sean's (2026-11-13); the app itself promises no date.
 */
export const ADD_PRODUCT = {
  label: "Not in the catalog? You can add it.",
  detail:
    "The catalog grows with the people who use it, in any market. A human reviewer checks every label before it goes live.",
  steps: [
    { title: "Scan", body: "The barcode isn't in the catalog yet. Tap Help add this product." },
    { title: "Photograph", body: "Front, Supplement Facts, ingredients, barcode. The app labels each panel and asks for a retake if one is blurry." },
    { title: "Get notified", body: "Approved products ship in the next catalog update, usually within a few days." },
  ],
} as const;

export const BOUNDARIES = {
  title: "What we don't do",
  items: [
    "We don't diagnose conditions",
    "We don't replace your clinician",
    "We don't tell you to stop medications",
    "We don't sell your health data",
  ],
};
