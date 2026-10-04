/**
 * Real-Life Moments — data.
 *
 * Card copy is written for IDENTITY RECOGNITION, not feature explanation.
 * Each card should make the reader think "that's me / I do that / I never
 * thought about that."
 *
 * Closed cards may show a short interaction preview (e.g. "Caution ·
 * Calcium + Levothyroxine"). Mechanism, dose thresholds, and clinical
 * rationale belong only in the expanded "PharmaGuide flag" panel.
 *
 * `image` is a local photo per moment (see `images.json` at the repo root
 * for the generation guide). Personas are labelled "Example scenario" and
 * shown as monograms — pre-launch there are no members to quote.
 *
 * Title is split into `lead` + `em` so we render Oura-style "punchy line
 * with italic emphasis" without HTML markup in strings.
 */

export type SeverityTier = "monitor" | "caution" | "avoid" | "safe" | "contraindicated";

export interface Moment {
  id: string;
  category: string;

  // Punchy short title (Oura-style). Rendered as: {lead} <em>{em}</em>
  // Keep total ≤ 7 words so the title fits the closed card cleanly.
  title: { lead: string; em: string };

  // Long-form description revealed only when the card is open.
  // Two short sentences read more reflectively than one long one.
  description: string;
  learnMore: string;

  // Short preview shown on the CLOSED card so users get value without opening.
  // Format: "Severity · Ingredient A + Ingredient B"
  preview: string;

  // Hero image (full-bleed background of compact card)
  image: string;
  imageAlt: string;

  // Example scenario (revealed on expand, md+ only). Pre-launch there are
  // no members, so these are labelled scenarios — never a photo of a real
  // person standing in for a patient.
  member: {
    name: string;
    role: string;
  };
  quote: string;

  // PharmaGuide flag (revealed on expand, md+ only).
  // This is where the clinical detail belongs — NOT in title/description.
  flag: {
    name: string;
    severity: SeverityTier;
    severityLabel: string;
    description: string;
    metaLeft: string;
    metaRight: string;
  };
}

export const MOMENTS: readonly Moment[] = [
  // ─── 1. MORNING ROUTINE ───
  {
    id: "morning",
    category: "Daily routine",
    title: { lead: "The prescription", em: "you've taken for years" },
    description:
      "Sometimes the problem isn't a new bottle. It's a medication you've taken so long you stopped thinking about it.",
    learnMore: "Learn about medication depletion",
    // Production record DEP_METFORMIN_VITAMINB12 (PharmaGuide_Pipeline
    // scripts/data/medication_depletions.json): severity "significant",
    // evidence "established", onset "years"; clinically signed off (B1).
    preview: "Significant · Metformin → Vitamin B12",
    image: "/images/moments/daily.jpg",
    imageAlt:
      "Close-up of a woman's hands pouring white supplement capsules from a labeled energy packet into her palm.",
    member: {
      name: "Hannah L.",
      role: "Example scenario",
    },
    quote: "Metformin every morning for eight years. B12 never came up.",
    flag: {
      name: "Metformin → Vitamin B12",
      // Color tone only; the label is the record's own severity word.
      severity: "caution",
      severityLabel: "Significant",
      description:
        "With long-term use, the chance of low B12 rises with higher doses and other B12 factors. Testing — not diet alone — helps determine whether treatment is needed.",
      metaLeft: "Onset",
      metaRight: "Over years of use",
    },
  },

  // ─── 2. PREGNANCY ───
  {
    id: "pregnancy",
    category: "Pregnancy",
    title: { lead: "Pregnancy changes", em: "more than your routine" },
    description: "Some ingredients become more important. Others suddenly matter a lot more.",
    learnMore: "Learn about pregnancy safety",
    preview: "Contraindicated · Vitamin A over 10,000 IU",
    image: "/images/moments/pregnancy.jpg",
    imageAlt:
      "Pregnant woman in a white linen blouse cradling her bump in soft natural window light.",
    member: {
      name: "Maya R.",
      role: "Example scenario",
    },
    quote: "I thought if it was sold over the counter, it had to be safe.",
    flag: {
      name: "Preformed vitamin A above 10,000 IU/day",
      severity: "contraindicated",
      severityLabel: "Contraindicated · pregnancy",
      description:
        "Excess preformed vitamin A (retinol and retinyl esters) in pregnancy is linked to birth-defect risk. Above 10,000 IU a day it's flagged as contraindicated; lower amounts get a caution. Beta-carotene isn't covered by this limit.",
      metaLeft: "Threshold",
      metaRight: "10,000 IU / day",
    },
  },

  // ─── 3. NEW PRESCRIPTION ───
  {
    id: "new-prescription",
    category: "Medication changes",
    title: { lead: "When your doctor", em: "adds something new" },
    description:
      "Most interaction problems don't start with a supplement. They start when something new enters the stack.",
    learnMore: "Learn about prescription transitions",
    preview: "Contraindicated · St. John's Wort + Sertraline",
    image: "/images/moments/medication.jpg",
    imageAlt:
      "Open palm holding a mix of different-colored pills and capsules against a dark background.",
    member: {
      name: "Jordan T.",
      role: "Example scenario",
    },
    quote:
      "My pharmacist caught it three days later. PharmaGuide caught it before I left the clinic.",
    flag: {
      name: "St. John's Wort + Sertraline",
      severity: "contraindicated",
      severityLabel: "Contraindicated",
      description:
        "St. John's wort raises serotonin activity. With an SSRI such as sertraline, the combination can cause serotonin syndrome, which can be life-threatening.",
      metaLeft: "Severity",
      metaRight: "Do not combine",
    },
  },

  // ─── 4. GYM STACK ───
  {
    id: "gym-stack",
    category: "Performance",
    title: { lead: "Your gym stack,", em: "all together" },
    description: "Pre-workout. Recovery. Pain relief. Individually they looked fine.",
    learnMore: "Learn about recovery stacks",
    preview: "Monitor · Turmeric + Ibuprofen",
    image: "/images/moments/performance.jpg",
    imageAlt:
      "Athletic man running on a treadmill in a bright gym, wearing a PharmaGuide wristband.",
    member: {
      name: "Devon P.",
      role: "Example scenario",
    },
    quote: "Turmeric for recovery, ibuprofen for my knees. I never thought about them together.",
    flag: {
      name: "Turmeric + Ibuprofen",
      severity: "monitor",
      severityLabel: "Monitor",
      description:
        "Curcumin acts on some of the same pathways as NSAIDs like ibuprofen, so together they may add to stomach irritation and bleeding risk. Watch for stomach pain or dark stools, and take the NSAID with food.",
      metaLeft: "Watch for",
      metaRight: "GI symptoms",
    },
  },

  // ─── 5. PARENTS / AGING ───
  {
    id: "parents",
    category: "Family",
    title: { lead: "The supplements", em: "your parents take now" },
    description: "As prescriptions increase, so does the chance something starts overlapping.",
    learnMore: "Learn about polypharmacy",
    preview: "Caution · Ginkgo + Aspirin",
    image: "/images/moments/parents.jpg",
    imageAlt:
      "Elderly couple walking together on a city sidewalk, seen from behind, arm in arm with a shopping trolley.",
    member: {
      name: "Sarah K.",
      role: "Example scenario",
    },
    quote:
      "My dad had four bottles lined up next to the coffee maker. Nobody had ever checked them together.",
    flag: {
      name: "Ginkgo + Aspirin",
      severity: "caution",
      severityLabel: "Caution",
      description:
        "Both inhibit platelet aggregation. Together they compound bleeding risk — a real concern for older adults already on aspirin for cardiac protection. Worth raising before any procedure.",
      metaLeft: "Bleeding risk",
      metaRight: "Discuss with MD",
    },
  },

  // ─── 6. HEALTHY OVERLOAD ───
  {
    id: "healthy-overload",
    category: "Wellness",
    title: { lead: "Healthy can still", em: "overlap badly" },
    description:
      "More supplements doesn't always mean more benefit. Sometimes it just means more interaction risk.",
    learnMore: "Learn about ingredient overlap",
    preview: "Monitor · Multiple magnesium sources",
    image: "/images/moments/wellness.jpg",
    imageAlt:
      "Two women meditating on yoga mats in a bright modern studio with large windows and plants.",
    member: {
      name: "Tasha K.",
      role: "Example scenario",
    },
    quote: "I wasn't taking anything dangerous. Just too many things that did the same thing.",
    flag: {
      name: "Multiple magnesium sources",
      severity: "monitor",
      severityLabel: "Monitor",
      description:
        "Magnesium glycinate, an oxide-blend multivitamin, and a 'sleep' blend. Combined supplemental intake ran past the 350 mg/day tolerable upper limit for several weeks — the likely cause of the loose stools.",
      metaLeft: "Daily total",
      metaRight: "Above upper limit",
    },
  },

  // ─── 7. RECALL ALERT ───
  // Image target: /public/images/moments/recall.jpg (generate before launch).
  {
    id: "recall",
    category: "Safety alert",
    title: { lead: "The recall", em: "you'd never have heard about" },
    description:
      "The FDA pulls supplements constantly — often for drug ingredients that were never printed on the label. The alert rarely reaches the person holding the bottle.",
    learnMore: "Learn about recall monitoring",
    preview: "Avoid · Undeclared sildenafil",
    image: "/images/moments/recall.jpg",
    imageAlt:
      "An unbranded supplement bottle on a kitchen counter in low evening light, capsules spilled beside it, an unsettling quiet to the scene.",
    member: {
      name: "Marcus D.",
      role: "Example scenario",
    },
    quote:
      "It was a 'natural' energy booster. Turns out it had a prescription drug in it the label never mentioned.",
    flag: {
      name: "Undeclared sildenafil",
      severity: "avoid",
      severityLabel: "Active recall",
      description:
        "FDA recalled this product for containing undeclared sildenafil — a prescription drug that can dangerously lower blood pressure when combined with nitrates. If it's in your stack, PharmaGuide flags the recall.",
      metaLeft: "FDA status",
      metaRight: "Active recall",
    },
  },

  // ─── 8. CONDITION-AWARE (drug ↔ condition) ───
  // Image target: /public/images/moments/condition.jpg (generate before launch).
  {
    id: "condition",
    category: "Your conditions",
    title: { lead: "Safe for most —", em: "not for your profile" },
    description:
      "The same capsule can be fine for one person and risky for another. Your conditions and medications change the math — quietly.",
    learnMore: "Learn about condition-aware checks",
    preview: "Avoid · Potassium + kidney disease",
    image: "/images/moments/condition.jpg",
    imageAlt:
      "A middle-aged person at a kitchen table holding a single supplement capsule, a row of prescription bottles and a glass of water nearby, considering it carefully in soft morning light.",
    member: {
      name: "Elena V.",
      role: "Example scenario",
    },
    quote:
      "Nobody flagged that a potassium supplement was a problem with my kidney condition and my blood-pressure medication.",
    flag: {
      name: "Potassium + ACE inhibitor",
      severity: "avoid",
      severityLabel: "Avoid · your profile",
      description:
        "Reduced kidney function clears potassium poorly, and an ACE inhibitor raises it further, so added potassium risks hyperkalemia — a dangerous rise in blood potassium. Surfaced because all three are in your profile.",
      metaLeft: "Risk",
      metaRight: "Hyperkalemia",
    },
  },
];
