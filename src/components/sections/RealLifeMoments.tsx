"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * Real-Life Moments — four scenarios where supplement decisions get harder.
 *
 * 2x2 grid on desktop, single column on mobile. Each card has a subtle
 * tinted gradient + ambient capsule decoration for character (no stock
 * photography in V1 — typography and gradient field do the work).
 *
 * Tap any card → it expands inline with a height accordion, revealing:
 *   • Body context
 *   • "What we check" — bulleted list of analyses
 *   • "Example flag" — chip showing the severity tier in PharmaGuide voice
 *
 * Severity colors land here through the example flags (different tier per
 * card), reinforcing the system established in the Ladder.
 *
 * Card order is intentional: chronic-conditions (highest LTV early adopter)
 * leads, then pregnancy, then SSRI, then stack optimizer.
 */

type SeverityTier = "monitor" | "caution" | "avoid" | "safe" | "contraindicated";

interface Moment {
  id: string;
  category: string;
  title: string;
  body: string;
  checks: readonly string[];
  flag: { text: string; tier: SeverityTier; detail?: string };
  bgGradient: string;
}

const MOMENTS: readonly Moment[] = [
  {
    id: "chronic",
    category: "Chronic / daily routine",
    title: "You manage medications and take supplements every day.",
    body: "If you take metformin, statins, thyroid medication, blood pressure medication, or blood thinners, your supplement routine may need extra context.",
    checks: [
      "Drug-supplement interactions",
      "Timing conflicts across the day",
      "Dosage concerns and overlap",
    ],
    flag: {
      text: "Magnesium ↔ Levothyroxine",
      tier: "monitor",
      detail: "Separate by 4 hours.",
    },
    bgGradient:
      "linear-gradient(135deg, rgb(248 246 240) 0%, rgb(230 234 234) 100%)",
  },
  {
    id: "pregnancy",
    category: "Pregnancy",
    title: "You're pregnant — and still taking your usual supplements.",
    body: "Some ingredients that are normally safe may need review during pregnancy, including high-dose vitamin A and certain herbal extracts.",
    checks: [
      "Pregnancy-related ingredient risks",
      "Dosage thresholds",
      "Trimester-specific guidance",
    ],
    flag: {
      text: "High-dose Vitamin A",
      tier: "caution",
      detail: "Above 10,000 IU may need review.",
    },
    bgGradient:
      "linear-gradient(135deg, rgb(250 246 240) 0%, rgb(240 232 224) 100%)",
  },
  {
    id: "ssri",
    category: "Mood / SSRI",
    title: "You take an SSRI and add something “natural” for mood.",
    body: "Some herbal supplements — like St. John's Wort — can interact with antidepressants and increase safety concerns.",
    checks: [
      "Drug-herb interactions",
      "Serotonin-related risks",
      "Mechanism context for each pair",
    ],
    flag: {
      text: "St. John's Wort + SSRI",
      tier: "avoid",
      detail: "Strong reason to separate.",
    },
    bgGradient:
      "linear-gradient(135deg, rgb(244 244 248) 0%, rgb(228 232 240) 100%)",
  },
  {
    id: "stack",
    category: "Stack optimizer",
    title: "You built the “perfect” supplement stack.",
    body: "More products can mean more overlap, timing conflicts, and diminishing returns. We help you see the stack as a system, not as a list.",
    checks: [
      "Ingredient overlap and redundancy",
      "Timing conflicts within the stack",
      "Stack-level FitScore insights",
    ],
    flag: {
      text: "Multiple magnesium sources detected",
      tier: "monitor",
      detail: "Redundancy review suggested.",
    },
    bgGradient:
      "linear-gradient(135deg, rgb(246 244 240) 0%, rgb(232 234 230) 100%)",
  },
];

const SEV_STYLES: Record<
  SeverityTier,
  { dot: string; text: string; chipBg: string; label: string }
> = {
  monitor: {
    dot: "bg-severity-monitor",
    text: "text-severity-monitor",
    chipBg: "bg-severity-monitor/10",
    label: "Monitor",
  },
  caution: {
    dot: "bg-severity-caution",
    text: "text-severity-caution",
    chipBg: "bg-severity-caution/10",
    label: "Caution",
  },
  avoid: {
    dot: "bg-severity-avoid",
    text: "text-severity-avoid",
    chipBg: "bg-severity-avoid/10",
    label: "Avoid",
  },
  safe: {
    dot: "bg-severity-safe",
    text: "text-severity-safe",
    chipBg: "bg-severity-safe/10",
    label: "Safe",
  },
  contraindicated: {
    dot: "bg-severity-contraindicated",
    text: "text-severity-contraindicated",
    chipBg: "bg-severity-contraindicated/10",
    label: "Contraindicated",
  },
};

export function RealLifeMoments() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section
      id="real-life-moments"
      aria-labelledby="moments-heading"
      className="relative section-y"
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
            Built for real life
          </motion.p>

          <motion.h2
            id="moments-heading"
            variants={fadeUpItem}
            className="text-display-lg text-ink"
          >
            The moments people don&apos;t realize
            <br />
            <span className="font-serif italic">they need this.</span>
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="max-w-prose text-body-xl text-muted"
          >
            Many risks come from combinations, timing, or situations people
            assume are harmless.{" "}
            <span className="text-foreground/70">
              Tap any moment to see what we check.
            </span>
          </motion.p>
        </motion.div>

        {/* Moments grid */}
        <div className="mx-auto mt-16 grid max-w-6xl items-start gap-5 md:mt-20 md:grid-cols-2 md:gap-6">
          {MOMENTS.map((moment, i) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              isActive={activeId === moment.id}
              index={i}
              onToggle={() =>
                setActiveId(activeId === moment.id ? null : moment.id)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MomentCard({
  moment,
  isActive,
  index,
  onToggle,
}: {
  moment: Moment;
  isActive: boolean;
  index: number;
  onToggle: () => void;
}) {
  const sev = SEV_STYLES[moment.flag.tier];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        ...transitions.reveal,
        delay: 0.05 + index * 0.08,
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-[border-color,box-shadow,transform] duration-fast ease-smooth",
        isActive
          ? "border-border-strong shadow-lg"
          : "border-border shadow-sm hover:-translate-y-0.5 hover:border-border-strong/70 hover:shadow-md"
      )}
      style={{ background: moment.bgGradient }}
    >
      {/* Ambient capsule decoration — character without stock photography */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: index % 2 === 0 ? "-30px" : "auto",
          bottom: index % 2 === 1 ? "-30px" : "auto",
          right: index < 2 ? "-100px" : "auto",
          left: index >= 2 ? "-80px" : "auto",
          width: "260px",
          height: "70px",
          borderRadius: "9999px",
          background: "rgb(24 59 63 / 0.05)",
          filter: "blur(40px)",
          transform: index % 2 === 0 ? "rotate(-10deg)" : "rotate(8deg)",
        }}
      />

      {/* Header — clickable to toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={`moment-detail-${moment.id}`}
        className="group relative block w-full p-7 text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-accent sm:p-8 md:p-10"
      >
        <p
          className={cn(
            "font-mono text-eyebrow font-medium uppercase tracking-[0.12em]",
            isActive ? "text-foreground/80" : "text-foreground/65"
          )}
        >
          {moment.category}
        </p>

        <h3 className="mt-3 text-h2 font-medium leading-tight text-ink">
          {moment.title}
        </h3>

        {/* Read-more hint when collapsed */}
        <AnimatePresence initial={false}>
          {!isActive && (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-5 flex items-center gap-1.5 text-body-sm text-muted"
            >
              <span>Read more</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
              >
                →
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Expanded content — height accordion */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="detail"
            id={`moment-detail-${moment.id}`}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            style={{ overflow: "hidden" }}
            className="relative"
          >
            <div className="space-y-5 px-7 pb-7 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
              <p className="text-body-lg leading-relaxed text-muted">
                {moment.body}
              </p>

              {/* What we check */}
              <div className="rounded-xl border border-border/70 bg-surface/70 p-4 backdrop-blur-sm sm:p-5">
                <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.1em] text-subtle">
                  What we check
                </p>
                <ul className="mt-3 space-y-2">
                  {moment.checks.map((check) => (
                    <li
                      key={check}
                      className="flex items-start gap-2.5 text-body-sm leading-snug text-ink"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[7px] block h-1 w-1 shrink-0 rounded-full bg-accent"
                      />
                      <span>{check}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example flag */}
              <div className="rounded-xl border border-border/70 bg-surface/70 p-4 backdrop-blur-sm sm:p-5">
                <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.1em] text-subtle">
                  Example flag
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="font-serif text-body-lg italic leading-tight text-ink">
                    {moment.flag.text}
                  </p>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-0.5",
                      sev.chipBg
                    )}
                  >
                    <span
                      className={cn(
                        "block h-1.5 w-1.5 rounded-full",
                        sev.dot
                      )}
                    />
                    <span
                      className={cn(
                        "font-mono text-eyebrow font-medium uppercase tracking-[0.06em]",
                        sev.text
                      )}
                    >
                      {sev.label}
                    </span>
                  </span>
                </div>
                {moment.flag.detail && (
                  <p className="mt-2 text-body-sm text-muted">
                    {moment.flag.detail}
                  </p>
                )}
              </div>

              {/* Close affordance */}
              <button
                type="button"
                onClick={onToggle}
                className="group inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              >
                <span>Close</span>
                <span
                  aria-hidden="true"
                  className="transition-transform duration-fast ease-smooth group-hover:-translate-y-0.5"
                >
                  ↑
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
