export const NUTRIENT_METERS = [
  { name: "Vitamin D", val: 6000, ul: 4000, unit: "IU" },
  { name: "Zinc", val: 70, ul: 40, unit: "mg" },
  { name: "Vitamin C", val: 800, ul: 2000, unit: "mg" },
  { name: "Magnesium", val: 350, ul: 350, unit: "mg" },
] as const;

export type NutrientMeter = (typeof NUTRIENT_METERS)[number];

export function nutrientFrame(meter: NutrientMeter, progress: number) {
  const fraction = Math.max(0, Math.min(1, progress));
  const amount = Math.round(meter.val * fraction);
  return {
    amount,
    fill: Math.min(1, (meter.val * fraction) / (2 * meter.ul)),
    aboveLimit: amount > meter.ul,
  };
}
