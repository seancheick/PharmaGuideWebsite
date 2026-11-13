"use client";

import { m } from "framer-motion";
import { StackIntelligencePanel } from "./StackIntelligencePanel";
import { AnimatedNutrientMeter, DepletionTrend } from "./FeatureMotionDetails";
import { NUTRIENT_METERS } from "./nutrient-demo";
import { TransparencyIllustration, FitIllustration, RecallsIllustration } from "./RemainingIllustrations";
import type { IllustrationKey } from "@/lib/features";

/**
 * Custom SVG illustrations for the /features pillars.
 *
 * Design principles:
 *   • All illustrations live on a soft surface inside their pillar
 *     section so they read as "in-app screen" abstractions
 *   • Same restrained palette: ink, muted, accent teal, severity tones
 *   • Animated entrance (Framer Motion) so they feel alive
 *   • Custom-built — no stock icons, no clip art
 *
 * Medication Depletion is the hero illustration — it gets a richer
 * pill→arrow→nutrient→clinician-check flow because it's the unique
 * differentiator. The other 5 are abstract diagrammatic panels.
 */

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

// ─── 1. Medication Depletion ─────────────────────────────────────────
// Hero illustration: medication card on the left with name + class,
// connector line with directional arrow, depleted nutrient list on
// the right, and a subtle "ask your clinician" footer. Abstract
// in-app panel — feels like a real PharmaGuide screen.

function DepletionIllustration() {
  return (
    <m.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15%" }}
      className="relative aspect-[4/3] min-h-[390px] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle p-5 [contain:inline-size] sm:min-h-[420px] sm:p-7"
    >
      {/* Soft accent halo behind the panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-accent/[0.04] blur-2xl"
      />

      <div className="relative flex h-full flex-col gap-4">
        {/* Top: medication card */}
        <m.div variants={reveal}>
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-subtle">
            Medication added
          </p>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden="true">
                <rect x="3" y="9" width="18" height="6" rx="3" />
                <line x1="12" y1="9" x2="12" y2="15" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[15px] italic leading-tight text-ink">
                Metformin
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                Type 2 diabetes · long-term use
              </p>
            </div>
          </div>
        </m.div>

        {/* Connector — depletion arrow */}
        <m.div
          variants={reveal}
          className="flex items-center gap-2 pl-4"
        >
          <span aria-hidden="true" className="block h-6 w-px bg-border-strong" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-severity-monitor">
            can lower
          </span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-severity-monitor" aria-hidden="true">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </m.div>

        {/* Bottom: affected nutrient + clinician check */}
        <m.div variants={reveal} className="flex flex-1 flex-col gap-2">
          {[
            { name: "Vitamin B12", note: "lower with long-term use" },
          ].map((n) => (
            <div
              key={n.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-severity-monitor/25 bg-severity-monitor/[0.06] px-4 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-severity-monitor" />
                <span className="font-serif text-[14px] italic text-ink">
                  {n.name}
                </span>
              </div>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-severity-monitor">
                {n.note}
              </span>
            </div>
          ))}
          <DepletionTrend />
        </m.div>

        {/* Footer hint */}
        <m.p
          variants={reveal}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle"
        >
          ↘ ask your clinician about a B12 check
        </m.p>
      </div>
    </m.div>
  );
}

// ─── 2. Stack Intelligence — multi-way network ───────────────────────
// SVG network with 5 product nodes connected by interaction edges.
// One edge animates a pulse to suggest "live cross-checking."

function StackIllustration() {
  return <StackIntelligencePanel />;
}

// ─── 3. Ingredient Transparency — label parse panel ──────────────────


// ─── 5. Nutrient Accumulation — UL meter panel ───────────────────────

function AccumulationIllustration() {
  return (
    <div className="relative aspect-[4/3] min-h-[340px] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle p-5 [contain:inline-size] sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-accent/[0.04] blur-2xl"
      />
      <div className="relative flex h-full flex-col gap-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-subtle">
            Daily intake · stack-wide
          </p>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-subtle">
            vs. UL
          </p>
        </div>
        <ul className="flex flex-1 flex-col justify-around gap-3">
          {NUTRIENT_METERS.map((meter, index) => (
            <AnimatedNutrientMeter key={meter.name} meter={meter} index={index} />
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── 6. Recall & Safety — alert card stack ───────────────────────────


// ─── Dispatcher ──────────────────────────────────────────────────────

export function Illustration({ kind }: { kind: IllustrationKey }) {
  switch (kind) {
    case "depletion":
      return <DepletionIllustration />;
    case "stack":
      return <StackIllustration />;
    case "transparency":
      return <TransparencyIllustration />;
    case "fit":
      return <FitIllustration />;
    case "accumulation":
      return <AccumulationIllustration />;
    case "recalls":
      return <RecallsIllustration />;
  }
}
