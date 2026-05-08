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
 * evidence level, and study basis. The two halves form a single bordered
 * unit so the relationship is visible: "these tiers produce these verdicts."
 *
 * Evidence levels match the in-app schema (Established / Probable /
 * Moderate / Limited / Theoretical) — NOT the A/B/C/D letter grades
 * that an earlier marketing pass invented but never shipped.
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

/**
 * Evidence levels — matches the in-app `ingredient_interaction_rules`
 * schema (5-level system, 592 rules). Source-of-truth labels:
 *
 *   established  Strong clinical evidence (RCTs, meta-analyses)
 *   probable     Good evidence, likely clinically relevant
 *   moderate     Mixed or moderate-quality evidence
 *   limited      Sparse or preliminary human data
 *   theoretical  Mechanistic plausibility, no/minimal human data
 *
 * The previous iteration used fictional A/B/C/D letter grades that
 * don't exist anywhere in the actual product — fixed.
 */
type EvidenceLevel =
  | "Established"
  | "Probable"
  | "Moderate"
  | "Limited"
  | "Theoretical";

interface TierData {
  id: TierId;
  label: string;
  brief: string;
  pair: string;
  headline: string;
  mechanism: string;
  recommendation: string;
  evidence: EvidenceLevel;
  studies: string;
  shape: Shape;
  textClass: string;
  barClass: string;
}

// Evidence-level assignments below match the cited `studies` for each
// pair (in-app source-of-truth):
//   • Meta-analysis + multiple RCTs  → Established
//   • Multiple cohort studies        → Probable
//   • PK studies / mixed quality     → Moderate or Limited
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
    evidence: "Established",
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
    evidence: "Probable",
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
    evidence: "Established",
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
    evidence: "Moderate",
    studies: "2 pharmacokinetic studies",
    shape: "ring",
    textClass: "text-severity-monitor",
    barClass: "bg-severity-monitor",
  },
  {
    id: "safe",
    label: "Informational",
    brief: "FYI — no action needed.",
    pair: "Vitamin D3 + Atorvastatin",
    headline: "No clinically relevant interaction",
    mechanism:
      "No shared metabolism pathway of concern. Statin efficacy may even be modestly improved.",
    recommendation: "Take as directed — no timing adjustment needed.",
    evidence: "Established",
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

  // WAI-ARIA Tabs: arrow keys move between tabs, wrapping at edges
  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      next = (idx + 1) % TIERS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      next = (idx - 1 + TIERS.length) % TIERS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      next = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      next = TIERS.length - 1;
    } else {
      return;
    }
    setActiveId(TIERS[next]!.id);
    // Focus the newly active tab
    const tabEl = document.getElementById(`tier-tab-${TIERS[next]!.id}`);
    tabEl?.focus();
  };

  return (
    <section
      id="interaction-ladder"
      aria-labelledby="ladder-heading"
      className="relative section-y bg-surface-subtle"
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
            Five severity tiers, each with the mechanism, evidence level, and study
            basis behind the verdict.{" "}
            <span className="text-foreground/70">
              <span className="hidden md:inline">Hover or tap a tier.</span>
              <span className="md:hidden">Swipe through the tiers →</span>
            </span>
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
          {/* Tier row — horizontal scroll pills on mobile, 5-col grid on desktop.
              Mobile pills show shape + label only (no brief) to stay compact.
              Desktop shows the full card with brief description.

              Mobile scroll affordance: a right-edge mask-image fade tells
              the eye "there's more here, scroll right." Without it, the
              5 tier pills look like they end at viewport edge. The mask
              is removed at md+ where the grid is fully visible.        */}
          <div
            role="tablist"
            aria-label="Severity tiers"
            className="flex gap-2 overflow-x-auto px-4 py-4 [mask-image:linear-gradient(to_right,black_82%,transparent_100%)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-5 md:gap-0 md:overflow-visible md:p-0 md:[mask-image:none]"
          >
            {TIERS.map((tier, i) => {
              const isActive = tier.id === activeId;
              return (
                <button
                  key={tier.id}
                  id={`tier-tab-${tier.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="tier-detail"
                  tabIndex={isActive ? 0 : -1}
                  onMouseEnter={() => setActiveId(tier.id)}
                  onFocus={() => setActiveId(tier.id)}
                  onClick={() => setActiveId(tier.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, i)}
                  className={cn(
                    "group relative transition-colors duration-fast ease-smooth",
                    // Mobile: compact pill with shape + label
                    "flex shrink-0 items-center gap-2 rounded-pill border px-3.5 py-2.5 text-left",
                    // Desktop: full card layout
                    "md:flex-col md:items-start md:gap-3 md:rounded-none md:border-0 md:px-6 md:py-7",
                    // Desktop hairline dividers (right, except last)
                    i < TIERS.length - 1 && "md:border-r md:border-border",
                    // Active state
                    isActive
                      ? "border-border-strong bg-surface-raised md:border-transparent md:bg-surface-raised"
                      : "border-border bg-surface hover:bg-surface-raised/60 focus-visible:bg-surface-raised/60 md:border-transparent"
                  )}
                >
                  {/* Active accent bar — desktop only, bottom edge */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-0 bottom-0 hidden h-[2px] transition-opacity duration-fast ease-smooth md:block",
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
                  {/* Brief — hidden on mobile pills, shown on desktop */}
                  <p className="hidden text-body-sm leading-snug text-muted md:block">{tier.brief}</p>
                </button>
              );
            })}
          </div>

          {/* Detail panel — re-keys on tier change, cross-fades content */}
          <div
            id="tier-detail"
            role="tabpanel"
            aria-labelledby={`tier-tab-${activeId}`}
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

                {/* Right: evidence column.
                    Pill renders the in-app evidence level (Established /
                    Probable / Moderate / Limited / Theoretical) — the
                    actual labels from `ingredient_interaction_rules`.
                    No more A/B/C/D letter grades (those were marketing
                    fiction; never existed in the product).             */}
                <div className="border-t border-border pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-subtle">
                    Evidence level
                  </p>
                  <span className="mt-2 inline-flex items-center gap-2 rounded-pill bg-accent-soft px-3.5 py-1.5">
                    <span
                      aria-hidden="true"
                      className="block h-1.5 w-1.5 rounded-full bg-accent-strong"
                    />
                    <span className="font-serif text-h3 italic leading-none text-accent-strong">
                      {active.evidence}
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
