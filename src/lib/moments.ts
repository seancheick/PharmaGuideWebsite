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
 * `image` and `member.avatar` are Unsplash placeholders for V1. Swap them
 * with your Cloudinary URLs once the AI-generated photos are uploaded.
 * The shape stays the same — just replace the URL strings. See
 * `images.json` at the repo root for the full generation guide.
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
    description: "Sometimes the problem isn't what you take. It's what you started taking later.",
    learnMore: "Learn about long-term stacks",
    preview: "Caution · Calcium + Levothyroxine",
    image: "/images/moments/daily.jpg",
    imageAlt:
      "Close-up of a woman's hands pouring white supplement capsules from a labeled energy packet into her palm.",
    member: {
      name: "Hannah L.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=160&q=80&auto=format&fit=crop",
    },
    quote: "I'd been taking calcium with my thyroid medication every morning for almost a decade.",
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
    description: "Some ingredients become more important. Others suddenly matter a lot more.",
    learnMore: "Learn about pregnancy safety",
    preview: "Caution · High-dose Vitamin A",
    image: "/images/moments/pregnancy.jpg",
    imageAlt:
      "Pregnant woman in a white linen blouse cradling her bump in soft natural window light.",
    member: {
      name: "Maya R.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&q=80&auto=format&fit=crop",
    },
    quote: "I thought if it was sold over the counter, it had to be safe.",
    flag: {
      name: "High-dose Vitamin A",
      severity: "caution",
      severityLabel: "Caution · 1st trimester",
      description:
        "High-dose preformed vitamin A may not be appropriate during early pregnancy. Check the exact form and amount with your clinician before continuing.",
      metaLeft: "Trimester 1",
      metaRight: "Review before use",
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
    preview: "Avoid · St. John's Wort + Sertraline",
    image: "/images/moments/medication.jpg",
    imageAlt:
      "Open palm holding a mix of different-colored pills and capsules against a dark background.",
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
      severityLabel: "Avoid",
      description:
        "Co-administration has been associated with serotonin syndrome. Onset within 48 hours of starting both has been documented.",
      metaLeft: "Severity",
      metaRight: "Discuss with MD",
    },
  },

  // ─── 4. GYM STACK ───
  {
    id: "gym-stack",
    category: "Performance",
    title: { lead: "Your gym stack,", em: "all together" },
    description: "Pre-workout. Hydration. Recovery. Sleep. Individually they looked fine.",
    learnMore: "Learn about stimulant stacking",
    preview: "Caution · Combined caffeine load",
    image: "/images/moments/performance.jpg",
    imageAlt:
      "Athletic man running on a treadmill in a bright gym, wearing a PharmaGuide wristband.",
    member: {
      name: "Devon P.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=160&q=80&auto=format&fit=crop",
    },
    quote: "Three supplements later, I was accidentally over 600 mg of caffeine a day.",
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
    description: "As prescriptions increase, so does the chance something starts overlapping.",
    learnMore: "Learn about polypharmacy",
    preview: "Caution · Ginkgo + Aspirin",
    image: "/images/moments/parents.jpg",
    imageAlt:
      "Elderly couple walking together on a city sidewalk, seen from behind, arm in arm with a shopping trolley.",
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
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&q=80&auto=format&fit=crop",
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
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "It was a 'natural' energy booster. Turns out it had a prescription drug in it the label never mentioned.",
    flag: {
      name: "Undeclared sildenafil",
      severity: "avoid",
      severityLabel: "Active recall",
      description:
        "FDA recalled this product for containing undeclared sildenafil — a prescription drug that can dangerously lower blood pressure when combined with nitrates. If you'd scanned it, your stack flags the recall immediately.",
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
    preview: "Caution · Potassium + kidney profile",
    image: "/images/moments/condition.jpg",
    imageAlt:
      "A middle-aged person at a kitchen table holding a single supplement capsule, a row of prescription bottles and a glass of water nearby, considering it carefully in soft morning light.",
    member: {
      name: "Elena V.",
      role: "Member spotlight",
      avatar:
        "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=160&q=80&auto=format&fit=crop",
    },
    quote:
      "Nobody flagged that a potassium supplement was a problem with my kidney condition and my blood-pressure medication.",
    flag: {
      name: "Potassium + ACE inhibitor",
      severity: "caution",
      severityLabel: "Condition flag",
      description:
        "With reduced kidney function and an ACE inhibitor, added potassium raises the risk of hyperkalemia — a dangerous rise in blood potassium. Surfaced because all three are in your profile.",
      metaLeft: "Risk",
      metaRight: "Hyperkalemia",
    },
  },
];
