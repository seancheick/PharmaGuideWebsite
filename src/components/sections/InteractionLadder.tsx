"use client";

import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, severityTiers, transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * Interaction Ladder — introduces the 5-tier severity system.
 *
 * Structure:
 *   1. Header: eyebrow + headline + subhead (line 2 muted, mirrors Problem)
 *   2. Five tier cards in a row (1 col mobile, 5 cols desktop)
 *      Each: severity-color dot + label + short description
 *      Hover: subtle lift + shadow upgrade
 *   3. Featured example card — full-fidelity Magnesium + Levothyroxine card,
 *      same content as the in-phone interaction card but at desktop scale.
 *      Acts as the "this is what it actually looks like" bridge.
 *
 * The section has a subtle bg-surface-subtle/30 band so it visually breathes
 * different from the Problem section above (default bg).
 */

const tiersContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
} as const;

export function InteractionLadder() {
  return (
    <section
      id="interaction-ladder"
      aria-label="Interaction ladder"
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
            Severity
          </motion.p>

          <motion.h2 variants={fadeUpItem} className="text-display-lg text-ink">
            Clear verdicts.
            <br />
            <span className="text-muted">Cited reasoning.</span>
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="max-w-prose text-body-xl text-muted"
          >
            We translate complex interaction data into simple safety levels — so you
            know what deserves attention, and why.
          </motion.p>
        </motion.div>

        {/* Tier cards — five severity levels */}
        <motion.div
          variants={tiersContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="mx-auto mt-16 grid max-w-6xl gap-3 md:mt-20 md:grid-cols-5 md:gap-4 lg:gap-5"
        >
          {severityTiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              variants={fadeUpItem}
              className="group relative rounded-xl border border-border bg-surface p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong/80 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn("block h-2 w-2 rounded-full", tier.dot)}
                  />
                  <span
                    className={cn(
                      "font-mono text-eyebrow font-medium uppercase tracking-[0.06em]",
                      tier.chipText
                    )}
                  >
                    {tier.label}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-medium tabular-nums text-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-2.5 text-body-sm leading-snug text-muted">
                {tier.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured example — full-fidelity interaction card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ ...transitions.reveal, duration: 0.7 }}
          className="mx-auto mt-20 max-w-2xl md:mt-24"
        >
          <p className="mb-5 text-center font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/60">
            Example interaction
          </p>

          <div className="relative">
            {/* Soft accent halo behind card — same depth language as the hero */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-6 -inset-y-2 rounded-[2rem] bg-accent/[0.06] blur-2xl"
            />

            <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8">
              {/* Header row: title + verdict pill */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.08em] text-subtle">
                    Interaction detected
                  </p>
                  <p className="mt-2 text-h2 font-medium leading-tight text-ink">
                    Magnesium <span className="text-muted">+</span> Levothyroxine
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-severity-monitor/10 px-3 py-1">
                  <span
                    aria-hidden="true"
                    className="block h-1.5 w-1.5 rounded-full bg-severity-monitor"
                  />
                  <span className="font-mono text-eyebrow font-medium uppercase tracking-[0.06em] text-severity-monitor">
                    Monitor
                  </span>
                </span>
              </div>

              {/* Body */}
              <p className="mt-5 text-body-lg leading-relaxed text-muted">
                Magnesium may reduce levothyroxine absorption when taken too closely
                together.
              </p>

              {/* Recommendation + Evidence row */}
              <div className="mt-7 grid gap-5 border-t border-border-strong/50 pt-5 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-8">
                <div>
                  <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.1em] text-subtle">
                    Recommendation
                  </p>
                  <p className="mt-1.5 text-body-lg text-ink">
                    Separate by at least 4 hours.
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <span className="font-mono text-eyebrow font-medium uppercase tracking-[0.1em] text-subtle">
                    Evidence
                  </span>
                  <span className="text-body-lg font-medium text-ink">Moderate</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
