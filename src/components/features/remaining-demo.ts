export const LABEL_EXAMPLE = {
  active: [
    { name: "Magnesium glycinate", amount: "200 mg" },
    { name: "L-theanine", amount: "100 mg" },
  ],
  blend: ["Ashwagandha root", "Rhodiola", "Holy basil"],
  blendAmount: "850 mg",
  inactive: "Magnesium stearate · vegetable cellulose · titanium dioxide",
} as const;

export const PROFILE_EXAMPLE = {
  tags: ["Pregnant · 22w", "Hypertension", "SSRI", "Goal · sleep"],
  findings: [
    { name: "Magnesium glycinate · evening", verdict: "Good fit", tone: "safe" },
    { name: "St. John's Wort", verdict: "Avoid · SSRI", tone: "avoid" },
    { name: "Vitamin A over 10,000 IU", verdict: "Contraindicated · pregnancy", tone: "avoid" },
    { name: "Iron + multi", verdict: "Caution · timing", tone: "caution" },
  ],
} as const;

export const ALERT_EXAMPLES = [
  {
    label: "FDA recall · class I",
    title: "NaturalBoost Energy — undeclared sildenafil",
    detail: "In your stack · scanned March 12 · all lots",
  },
  {
    label: "Banned ingredient · blocked",
    title: "Kratom leaf — not lawful as a supplement",
    detail: "No score shown · reason and FDA source listed",
  },
] as const;
