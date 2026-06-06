/**
 * Methodology data — single source of truth for /methodology page.
 *
 * Refreshed from the legacy WordPress version with voice rules
 * applied (drop "AI-powered", second-person, restraint, real numbers).
 *
 * Five content blocks render as distinct sections with custom visuals:
 *   1. Three trust pillars (traceability / accuracy / accountability)
 *   2. Four data-source categories (FDA / NIH / Clinical / Professional)
 *   3. Five-step verification process
 *   4. Two-person medical advisory team
 *   5. AI transparency split (does / does not)
 */

export interface TrustPillar {
  title: string;
  body: string;
}

export interface DataSource {
  badge: string;
  name: string;
  items: readonly string[];
  use: string;
}

export interface EngineStage {
  num: string;
  title: string;
  body: string;
  /** Concrete proof line rendered in mono caps under the body. */
  detail: string;
}

export interface ProcessStep {
  num: string;
  title: string;
  body: string;
  reviewer?: string;
  output?: string;
  schedule?: string;
}

export interface AdvisoryMember {
  name: string;
  title: string;
  credentials: string;
  focus: string;
  initials: string;
  /**
   * Path to the clinician's portrait under /public. Optional so future
   * members can ship without a photo and fall back to an initials disc.
   */
  photo?: string;
}

export const TRUST_PILLARS: readonly TrustPillar[] = [
  {
    title: "Traceability",
    body: "Interaction guidance is traceable to regulatory sources, peer-reviewed publications, or professional references. No anonymous claims.",
  },
  {
    title: "Accuracy",
    body: "Content is verified against primary sources and reviewed by licensed clinicians before it ships. Updates are dated and visible.",
  },
  {
    title: "Accountability",
    body: "We say what we do — and what we don't. The boundaries are explicit. No marketing-speak hiding the limits.",
  },
];

export const DATA_SOURCES: readonly DataSource[] = [
  {
    badge: "FDA",
    name: "FDA Resources",
    items: [
      "Dietary Supplement Label Database (DSLD)",
      "Adverse Event Reporting System (FAERS)",
      "Warning letters and safety alerts",
      "Current Good Manufacturing Practice (cGMP) records",
    ],
    use: "Product identification · safety alerts · manufacturing disclosures",
  },
  {
    badge: "NIH",
    name: "NIH Resources",
    items: [
      "Office of Dietary Supplements (ODS)",
      "National Center for Complementary and Integrative Health (NCCIH)",
      "DailyMed (drug labeling)",
      "Dietary Supplement Ingredient Database",
    ],
    use: "Ingredient information · efficacy research · safety profiles",
  },
  {
    badge: "PUB",
    name: "Clinical Literature",
    items: [
      "PubMed / MEDLINE",
      "Cochrane Library systematic reviews",
      "Journal of Dietary Supplements",
      "Drug-nutrient interaction studies",
    ],
    use: "Interaction mechanisms · clinical evidence · contraindications",
  },
  {
    badge: "PRO",
    name: "Professional Resources",
    items: [
      "Natural Medicines Database",
      "Clinical pharmacology references",
      "Drug interaction databases",
      "Professional society guidelines",
    ],
    use: "Cross-referencing interactions · clinical context",
  },
];

/**
 * ENGINE_STAGES — the runtime analysis pipeline. This is the technical
 * moat: what actually happens between scanning a product and seeing a
 * verdict. Every stage is grounded in a shipped capability documented
 * on /features (catalog, normalization, multi-way detection, profile
 * gating, UL tracking, recall sync). No stage claims more than the
 * product does; specific external API names are intentionally left to
 * the data-sources section, which is verified.
 */
export const ENGINE_STAGES: readonly EngineStage[] = [
  {
    num: "01",
    title: "Catalog match",
    body: "A scan or search resolves to a specific product in a 180,000+ item catalog that lives on your device — so identification happens in milliseconds, offline, without a round-trip to a server.",
    detail: "180,000+ products · on-device · sub-10ms lookup",
  },
  {
    num: "02",
    title: "Ingredient normalization",
    body: "Active and inactive ingredients are parsed and mapped to canonical identities — and proprietary blends are decomposed into estimated per-ingredient ranges, the step most apps skip because the label hides the math.",
    detail: "Actives + inactives · proprietary-blend decomposition",
  },
  {
    num: "03",
    title: "Interaction detection",
    body: "Your stack is analyzed as a system, not one bottle at a time: supplement–supplement, supplement–drug, and drug–drug interactions, cross-product dose summation, and timing conflicts are each checked against the rules library.",
    detail: "Multi-way · dose summation · timing conflicts",
  },
  {
    num: "04",
    title: "Personal gating",
    body: "Every result is filtered through your profile — conditions, medications, age, and goals. Irrelevant warnings stay hidden; a medication that's risky given one of your conditions is surfaced as a flag.",
    detail: "Condition · medication · drug↔condition flags",
  },
  {
    num: "05",
    title: "Accumulation tracking",
    body: "Each nutrient is summed across the entire stack and measured against its Recommended Daily Allowance and Tolerable Upper Intake Level — so three products quietly stacking the same mineral don't slip past the safe ceiling.",
    detail: "RDA + UL per nutrient · across the full stack",
  },
  {
    num: "06",
    title: "Recall & safety sync",
    body: "The products you've scanned are checked against active FDA recalls and adverse-event signals, so a bottle in your stack doesn't quietly become unsafe without you hearing about it.",
    detail: "FDA recalls · FAERS signals · lot-level when published",
  },
];

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    num: "01",
    title: "Source identification",
    body: "We start from authoritative sources only — peer-reviewed, government-published, or recognized by professional clinical societies. No blog posts, no influencer claims, no unverified registries.",
  },
  {
    num: "02",
    title: "Data extraction and analysis",
    body: "Information is structured into ingredient profiles with explicit citations. Each interaction is mapped to its mechanism, evidence level, and clinical context.",
    output: "Structured ingredient profiles with cited sources",
  },
  {
    num: "03",
    title: "Pharmacist verification",
    body: "A licensed clinical pharmacist reviews interaction guidance before it ships — checking the science, the framing, and the recommendation against current practice standards.",
    reviewer: "Laurie Pham, PharmD",
  },
  {
    num: "04",
    title: "Clinical advisory review",
    body: "A second reviewer reads from the patient-education angle: is the language clear, the framing accessible, the safety context unambiguous?",
    reviewer: "Miriam Farez, NP",
  },
  {
    num: "05",
    title: "Publication and ongoing monitoring",
    body: "Once published, content goes into an ongoing review cycle. FDA alerts, new research, or regulatory changes trigger immediate updates.",
    schedule: "Quarterly systematic reviews + priority alerts as needed",
  },
];

export const ADVISORY_TEAM: readonly AdvisoryMember[] = [
  {
    name: "Laurie Pham, PharmD",
    title: "Doctor of Pharmacy",
    credentials: "PharmD · 15+ years clinical pharmacy",
    focus: "Drug-supplement interactions · pharmacovigilance · clinical accuracy review",
    initials: "LP",
    photo: "/team/laurie-pham.webp",
  },
  {
    name: "Miriam Farez, NP",
    title: "Nurse Practitioner",
    credentials: "NP · integrative health practice",
    focus: "Patient education · integrative health · content accessibility",
    initials: "MF",
    photo: "/team/miriam-farez.webp",
  },
];

export const AI_DOES: readonly string[] = [
  "Process and structure data from multiple sources",
  "Identify potential interactions documented in the literature",
  "Generate initial drafts of educational content",
  "Power the AI Guidance Chat for in-app questions",
];

export const AI_DOES_NOT: readonly string[] = [
  "Generate original research or clinical recommendations",
  "Diagnose medical conditions or symptoms",
  "Recommend specific treatments or dosages",
  "Access personal health records or medical history",
  "Replace the judgment of a licensed healthcare professional",
];

export const SCOPE_IS: readonly string[] = [
  "An educational information platform",
  "A tool to support informed conversations with your healthcare provider",
  "A resource for understanding documented interactions",
  "Reviewed by licensed healthcare professionals",
];

export const SCOPE_IS_NOT: readonly string[] = [
  "A medical device or diagnostic tool",
  "A replacement for professional medical advice",
  "A source of treatment recommendations",
  "A guarantee of supplement safety or efficacy",
];

export const METHODOLOGY_LAST_UPDATED = "2026-05-08";
