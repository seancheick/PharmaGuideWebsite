/**
 * Real-Life Moments — data.
 *
 * Card copy is written for IDENTITY RECOGNITION, not feature explanation.
 * Each card should make the reader think "that's me / I do that / I never
 * thought about that." Clinical detail (mechanism, dosages, drug names)
 * lives ONLY in the expanded "PharmaGuide flag" panel — never in the
 * headline or surface description.
 *
 * `image` and `member.avatar` are Unsplash placeholders for V1. Swap them
 * with your Cloudinary URLs once the AI-generated photos are uploaded.
 * The shape stays the same — just replace the URL strings. See
 * `images.json` at the repo root for the full generation guide.
 *
 * Title is split into `lead` + `em` so we render Oura-style "punchy line
 * with italic emphasis" without HTML markup in strings.
 */

export type SeverityTier =
  | "monitor"
  | "caution"
  | "avoid"
  | "safe"
  | "contraindicated";

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

  // Hero image (full-bleed background of compact card)
  image: string;
  imageAlt: string;

  // Member spotlight (revealed on expand, md+ only)
  member: {
    name: string;
    role: string;
    avatar: string;
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
    title: { lead: "The vitamins", em: "you've taken for years" },
    description:
      "Sometimes the problem isn't what you take. It's what you started taking later.",
    learnMore: "Learn about long-term stacks",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1400&q=80&auto=format&fit=crop",
    imageAlt:
      "A small organized row of supplement bottles on a sunlit kitchen counter beside a coffee mug.",
    member: {
      name: "Hannah L.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "I'd been taking calcium with my thyroid medication every morning for almost a decade.",
    flag: {
      name: "Calcium ↔ Levothyroxine",
      severity: "caution",
      severityLabel: "Caution",
      description:
        "Calcium binds levothyroxine in the gut. Space by at least 4 hours; take levothyroxine on an empty stomach for best absorption.",
      metaLeft: "Spacing",
      metaRight: "≥ 4 hours apart",
    },
  },

  // ─── 2. PREGNANCY ───
  {
    id: "pregnancy",
    category: "Pregnancy",
    title: { lead: "Pregnancy changes", em: "more than your routine" },
    description:
      "Some ingredients become more important. Others suddenly matter a lot more.",
    learnMore: "Learn about pregnancy safety",
    image:
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1400&q=80&auto=format&fit=crop",
    imageAlt:
      "Soft natural-light photograph of a pregnant person at a kitchen table, hand resting near the bump.",
    member: {
      name: "Maya R.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "I thought if it was sold over the counter, it had to be safe.",
    flag: {
      name: "High-dose Vitamin A",
      severity: "caution",
      severityLabel: "Caution · 1st trimester",
      description:
        "Daily intake above 10,000 IU in the first trimester carries documented teratogenic risk. Many “prenatal” stacks still contain it.",
      metaLeft: "Trimester 1",
      metaRight: "Skip until cleared",
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
    image:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1400&q=80&auto=format&fit=crop",
    imageAlt:
      "Quiet medical setting — a clinician's hand passing a prescription slip to a patient, soft daylight.",
    member: {
      name: "Jordan T.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "My pharmacist caught it three days later. PharmaGuide caught it before I left the clinic.",
    flag: {
      name: "St. John's Wort + Sertraline",
      severity: "avoid",
      severityLabel: "Tier 2 — Avoid",
      description:
        "Co-administration has been associated with serotonin syndrome. Onset within 48 hours of starting both has been documented.",
      metaLeft: "Severity",
      metaRight: "Stop both — call MD",
    },
  },

  // ─── 4. GYM STACK ───
  {
    id: "gym-stack",
    category: "Performance",
    title: { lead: "Your gym stack,", em: "all together" },
    description:
      "Pre-workout. Hydration. Recovery. Sleep. Individually they looked fine.",
    learnMore: "Learn about stimulant stacking",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80&auto=format&fit=crop",
    imageAlt:
      "Athletic person at a home gym counter with a row of supplement tubs and a shaker bottle, soft daylight.",
    member: {
      name: "Devon P.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "Three supplements later, I was accidentally over 600 mg of caffeine a day.",
    flag: {
      name: "Combined caffeine load",
      severity: "caution",
      severityLabel: "Caution",
      description:
        "Three pre-workout-adjacent ingredients added up to roughly 600 mg caffeine-equivalent — above the 400 mg daily threshold for most adults.",
      metaLeft: "Caffeine-equiv.",
      metaRight: "≈ 600 mg / day",
    },
  },

  // ─── 5. PARENTS / AGING ───
  {
    id: "parents",
    category: "Family",
    title: { lead: "The supplements", em: "your parents take now" },
    description:
      "As prescriptions increase, so does the chance something starts overlapping.",
    learnMore: "Learn about polypharmacy",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=80&auto=format&fit=crop",
    imageAlt:
      "Older person's hands organizing four supplement bottles next to a coffee maker on a kitchen counter.",
    member: {
      name: "Sarah K.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "My dad had four bottles lined up next to the coffee maker. Nobody had ever checked them together.",
    flag: {
      name: "Ginkgo + Aspirin",
      severity: "caution",
      severityLabel: "Caution",
      description:
        "Both reduce platelet aggregation. The combination raises bleeding risk meaningfully — common in older adults taking aspirin for cardiac protection.",
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
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=1400&q=80&auto=format&fit=crop",
    imageAlt:
      "Editorial photo of an organized row of varied supplement bottles on a wooden shelf, soft daylight.",
    member: {
      name: "Tasha K.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "I wasn't taking anything dangerous. Just too many things that did the same thing.",
    flag: {
      name: "Multiple magnesium sources",
      severity: "monitor",
      severityLabel: "Monitor",
      description:
        "Magnesium glycinate, oxide-blend multivitamin, and a “sleep” blend. Combined daily intake exceeded the upper tolerable limit for several weeks.",
      metaLeft: "Daily total",
      metaRight: "Above upper limit",
    },
  },
];
