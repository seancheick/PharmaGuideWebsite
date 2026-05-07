/**
 * Real-Life Moments — data.
 *
 * `image` and `member.avatar` are Unsplash placeholders for V1. Swap them
 * with your Cloudinary URLs once the AI-generated photos are uploaded.
 * The shape stays the same — just replace the URL strings.
 *
 * Title is split into `lead` + `em` so we can render the Oura-style
 * "punchy line with italic emphasis" without HTML markup in strings.
 *
 * Severity tokens reference the design system; chip styling is derived
 * in the carousel via SEV_STYLES.
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

  // PharmaGuide flag (revealed on expand, md+ only)
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
  {
    id: "chronic",
    category: "Daily routine",
    title: { lead: "Make sense of", em: "your morning stack" },
    description:
      "Stacks grow over years. We help you audit what's still pulling its weight — and what's silently arguing with your meds.",
    learnMore: "Learn about stack audits",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&q=80&auto=format&fit=crop",
    imageAlt:
      "Older person at a kitchen counter with a coffee mug and a small organizer of pills, soft morning light.",
    member: {
      name: "Hannah L.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "Calcium with my thyroid med, every breakfast for nine years. PharmaGuide flagged it in my first scan.",
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
  {
    id: "pregnancy",
    category: "Women's health",
    title: { lead: "Pregnancy and", em: "your usual supplements" },
    description:
      "Pregnancy changes which ingredients are safe and which aren't. PharmaGuide flags the ones that matter — with the trimester they matter in.",
    learnMore: "Learn about pregnancy safety",
    image:
      "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1400&q=80&auto=format&fit=crop",
    imageAlt:
      "Soft natural-light photograph of a pregnant person standing by a window, hand resting near the bump.",
    member: {
      name: "Maya R.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "I scanned my prenatal and three other things in my drawer. PharmaGuide caught a high-dose A I'd been taking for months.",
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
  {
    id: "ssri",
    category: "Medication safety",
    title: { lead: "SSRIs meet", em: "natural mood support" },
    description:
      "Some herbal supplements interact with antidepressants. We surface the conflict before the bottle joins the routine.",
    learnMore: "Learn about SSRI interactions",
    image:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1400&q=80&auto=format&fit=crop",
    imageAlt:
      "Soft evening kitchen scene — a glass of water and a single supplement bottle on a wooden counter.",
    member: {
      name: "Jordan T.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "I'd been taking St. John's Wort for years. The day my doctor prescribed sertraline, PharmaGuide flagged it before the pharmacist could.",
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
  {
    id: "stack",
    category: "Performance",
    title: { lead: "Build the", em: "right stack" },
    description:
      "More products can mean more overlap, timing conflicts, and diminishing returns. We help you see the stack as a system, not a list.",
    learnMore: "Learn about stack optimization",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80&auto=format&fit=crop",
    imageAlt:
      "Organized desk with a small row of supplement bottles, a notebook, and a glass of water — a thirty-something at home in soft daylight.",
    member: {
      name: "Devon P.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "Three labels said “safe.” The combined load was 600 mg of caffeine-equivalent. PharmaGuide showed me the math.",
    flag: {
      name: "Stimulant load",
      severity: "caution",
      severityLabel: "Caution",
      description:
        "Three pre-workout ingredients together approximated 600 mg caffeine-equivalent — above the 400 mg daily threshold for most adults.",
      metaLeft: "Caffeine-equiv.",
      metaRight: "≈ 600 mg / day",
    },
  },
];
