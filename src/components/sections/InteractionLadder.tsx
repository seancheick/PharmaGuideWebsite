"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * Interaction Ladder — interactive tier selector + detail panel.
 *
 * Hover, focus, or tap any of the five tiers to update the detail panel
 * below with that tier's representative pair, mechanism, recommendation,
 * evidence grade, and study basis. The two halves form a single bordered
 * unit so the relationship is visible: "these tiers produce these verdicts."
 *
 * Each tier has a unique geometric shape (triangle / circle / diamond /
 * ring / square) — character without color. Headline punchline is set in
 * italic serif (Newsreader) to add typographic variety.
 *
 * Mobile: same model — tap to switch. No hover, but the panel updates
 * inline below as the user taps each tier.
 */

type TierId = "contraindicated" | "avoid" | "caution" | "monitor" | "safe";
type Shape = "triangle" | "circle" | "diamond" | "ring" | "square";
type Grade = "A" | "B" | "C" | "D";

interface TierData {
  id: TierId;
  label: string;
  brief: string;
  pair: string;
  headline: string;
  mechanism: string;
  recommendation: string;
  grade: Grade;
  studies: string;
  shape: Shape;
  textClass: string;
  barClass: string;
}

const TIERS: readonly TierData[] = [
  {
    id: "contraindicated",
    label: "Contraindicated",
    brief: "Do not combine.",
    pair: "St. John's Wort + Sertraline",
    headline: "Serotonin syndrome risk",
    mechanism:
      "St. John's Wort enhances serotonin reuptake, becoming dangerously additive to SSRI activity.",
    recommendation: "Avoid combining unless supervised by a clinician.",
    grade: "A",
    studies: "Meta-analysis · 17 RCTs",
    shape: "triangle",
    textClass: "text-severity-contraindicated",
    barClass: "bg-severity-contraindicated",
  },
  {
    id: "avoid",
    label: "Avoid",
    brief: "Strong reason to separate.",
    pair: "Ginkgo + Warfarin",
    headline: "Clinically significant bleeding risk",
    mechanism:
      "Ginkgo's antiplatelet activity is additive to warfarin's anticoagulation effect.",
    recommendation: "Avoid the combination, or monitor INR closely with clinician oversight.",
    grade: "B",
    studies: "6 cohort studies",
    shape: "circle",
    textClass: "text-severity-avoid",
    barClass: "bg-severity-avoid",
  },
  {
    id: "caution",
    label: "Caution",
    brief: "Risk depends on context.",
    pair: "Calcium + Levothyroxine",
    headline: "Reduced thyroid absorption",
    mechanism:
      "Calcium binds levothyroxine in the gut, decreasing bioavailability up to 30% within 4 hours.",
    recommendation: "Separate doses by at least 4 hours.",
    grade: "A",
    studies: "4 RCTs · 1 meta-analysis",
    shape: "diamond",
    textClass: "text-severity-caution",
    barClass: "bg-severity-caution",
  },
  {
    id: "monitor",
    label: "Monitor",
    brief: "Manage with timing.",
    pair: "Magnesium + Levothyroxine",
    headline: "Minor absorption shift",
    mechanism:
      "Magnesium may reduce levothyroxine absorption when taken too closely together.",
    recommendation: "Separate by at least 4 hours.",
    grade: "B",
    studies: "2 pharmacokinetic studies",
    shape: "ring",
    textClass: "text-severity-monitor",
    barClass: "bg-severity-monitor",
  },
  {
    id: "safe",
    label: "No known issue",
    brief: "Evidence shows no concern.",
    pair: "Vitamin D3 + Atorvastatin",
    headline: "No clinically relevant interaction",
    mechanism:
      "No shared metabolism pathway of concern. Statin efficacy may even be modestly improved.",
    recommendation: "Take as directed — no timing adjustment needed.",
    grade: "A",
    studies: "Meta-analysis · 12 RCTs",
    shape: "square",
    textClass: "text-severity-safe",
    barClass: "bg-severity-safe",
  },
];

function TierShape({ shape, className }: { shape: Shape; className: string }) {
  const common = "h-[14px] w-[14px] shrink-0";
  switch (shape) {
    case "triangle":
      return (
        <svg viewBox="0 0 14 14" className={cn(common, className)} aria-hidden="true">
          <path d="M7 1 L13 13 L1 13 Z" fill="currentColor" />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 14 14" className={cn(common, className)} aria-hidden="true">
          <circle cx="7" cy="7" r="6" fill="currentColor" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 14 14" className={cn(common, className)} aria-hidden="true">
          <path d="M7 1 L13 7 L7 13 L1 7 Z" fill="currentColor" />
        </svg>
      );
    case "ring":
      return (
        <svg viewBox="0 0 14 14" className={cn(common, className)} aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "square":
      return (
        <svg viewBox="0 0 14 14" className={cn(common, className)} aria-hidden="true">
          <rect x="1.5" y="1.5" width="11" height="11" fill="currentColor" />
        </svg>
      );
  }
}

export function InteractionLadder() {
  // Default to "monitor" — matches the hero loop, so the visual continues
  // "the same example you saw at hero scale."
  const [activeId, setActiveId] = useState<TierId>("monitor");
  const active = TIERS.find((t) => t.id === activeId) ?? TIERS[3]!;

  return (
    <section
      id="interaction-ladder"
      aria-labelledby="ladder-heading"
      className="relative section-y bg-surface-subtle/30"
    >
      <div className="container relative mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center md:gap-9"
        >
          <motion.p
            variants={fadeUpItem}
            className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
          >
            The ladder
          </motion.p>

          <motion.h2
            id="ladder-heading"
            variants={fadeUpItem}
            className="text-display-lg text-ink"
          >
            Not just warnings.
            <br />
            <span className="font-serif italic">Reasoning.</span>
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="max-w-prose text-body-xl text-muted"
          >
            Five severity tiers, each with the mechanism, evidence grade, and study
            basis behind the verdict.{" "}
            <span className="text-foreground/70">Hover or tap a tier.</span>
          </motion.p>
        </motion.div>

        {/* Connected tier ladder + detail panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={transitions.reveal}
          className="mx-auto mt-16 max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface shadow-sm md:mt-20"
        >
          {/* Tier row */}
          <div role="tablist" aria-label="Severity tiers" className="grid md:grid-cols-5">
            {TIERS.map((tier, i) => {
              const isActive = tier.id === activeId;
              return (
                <button
                  key={tier.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="tier-detail"
                  tabIndex={isActive ? 0 : -1}
                  onMouseEnter={() => setActiveId(tier.id)}
                  onFocus={() => setActiveId(tier.id)}
                  onClick={() => setActiveId(tier.id)}
                  className={cn(
                    "group relative flex flex-col gap-3 px-5 py-5 text-left transition-colors duration-fast ease-smooth md:px-6 md:py-7",
                    // Hairline dividers — bottom on mobile (last item no divider),
                    // right on desktop (last item no divider)
                    i < TIERS.length - 1 && "border-b border-border md:border-b-0 md:border-r",
                    // Active state: brighter bg + soft ring
                    isActive
                      ? "bg-surface-raised"
                      : "bg-surface hover:bg-surface-raised/60 focus-visible:bg-surface-raised/60"
                  )}
                >
                  {/* Active accent bar — runs along the bottom edge in the
                      tier's color when selected. Subtle visual link to the
                      detail panel below. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-[2px] transition-opacity duration-fast ease-smooth",
                      tier.barClass,
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  />

                  <div className="flex items-center gap-2.5">
                    <TierShape shape={tier.shape} className={tier.textClass} />
                    <span
                      className={cn(
                        "font-mono text-eyebrow font-medium uppercase tracking-[0.08em] transition-colors duration-fast ease-smooth",
                        isActive ? tier.textClass : "text-muted"
                      )}
                    >
                      {tier.label}
                    </span>
                  </div>
                  <p className="text-body-sm leading-snug text-muted">{tier.brief}</p>
                </button>
              );
            })}
          </div>

          {/* Detail panel — re-keys on tier change, cross-fades content */}
          <div
            id="tier-detail"
            aria-live="polite"
            className="border-t border-border bg-surface-raised p-6 sm:p-8 md:p-10"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
                className="grid gap-8 md:grid-cols-[200px_1fr_180px] md:gap-10"
              >
                {/* Left: tier label + pair */}
                <div>
                  <p
                    className={cn(
                      "font-mono text-eyebrow font-medium uppercase tracking-[0.12em]",
                      active.textClass
                    )}
                  >
                    {active.label}
                  </p>
                  <p className="mt-3 font-serif text-h2 italic leading-tight text-ink">
                    {active.pair}
                  </p>
                </div>

                {/* Middle: headline + mechanism + recommendation */}
                <div>
                  <p className="font-serif text-h3 italic leading-snug text-ink">
                    {active.headline}
                  </p>

                  <div className="mt-4">
                    <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.1em] text-subtle">
                      Mechanism
                    </p>
                    <p className="mt-1 text-body leading-relaxed text-muted">
                      {active.mechanism}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-border pt-4">
                    <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.1em] text-subtle">
                      Recommendation
                    </p>
                    <p className="mt-1 text-body text-ink">{active.recommendation}</p>
                  </div>
                </div>

                {/* Right: evidence column */}
                <div className="border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-subtle">
                    Evidence
                  </p>
                  <span className="mt-2 inline-flex items-center gap-2 rounded-pill bg-accent-soft px-3 py-1">
                    <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-accent-strong">
                      Grade
                    </span>
                    <span className="font-serif text-h3 italic leading-none text-accent-strong">
                      {active.grade}
                    </span>
                  </span>

                  <div className="mt-5">
                    <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-subtle">
                      Studies
                    </p>
                    <p className="mt-1 font-mono text-body-sm tabular-nums text-muted">
                      {active.studies}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Honesty note — quiet editorial caption */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={transitions.ambient}
          className="mt-8 text-center font-serif text-body italic text-muted"
        >
          When evidence is incomplete, we say so directly.
        </motion.p>
      </div>
    </section>
  );
}
