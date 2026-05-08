"use client";

import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem } from "@/lib/tokens";

/**
 * How It Works — three numbered beats, restrained.
 *
 * Sits between Problem and Interaction Ladder. The Problem section asks
 * "why does this matter"; this section answers "how PharmaGuide actually
 * does it" before the Ladder shows the verdicts.
 *
 * Compact by design: typography only, no cards, no icons. Three short
 * statements that read like a process — Scan → Cross-reference → Understand.
 */

const STEPS = [
  {
    num: "01",
    title: "Scan or search",
    body: "Add what you take by barcode, search, or voice.",
  },
  {
    num: "02",
    title: "We cross-reference",
    body: "Your stack, medications, and personal health context.",
  },
  {
    num: "03",
    title: "Understand",
    body: "Clear verdicts with reasoning — and what to discuss with your clinician.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="relative section-y-sm"
    >
      <div className="container relative mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
        >
          <motion.p
            variants={fadeUpItem}
            className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
          >
            How it works
          </motion.p>

          <motion.h2
            id="how-heading"
            variants={fadeUpItem}
            className="text-balance text-display-md text-ink"
          >
            Three beats.
            <br />
            <span className="font-serif italic">No guesswork.</span>
          </motion.h2>
        </motion.div>

        {/* Steps — typography only, no cards */}
        <motion.ol
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.15 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="mx-auto mt-12 grid max-w-5xl gap-10 md:mt-16 md:grid-cols-3 md:gap-10 lg:gap-14"
        >
          {STEPS.map((step) => (
            <motion.li
              key={step.num}
              variants={fadeUpItem}
              className="flex flex-col gap-3"
            >
              <span className="font-mono text-[12px] font-medium tabular-nums tracking-[0.12em] text-accent">
                {step.num}
              </span>
              <h3 className="font-serif text-h2 italic leading-tight text-ink">
                {step.title}
              </h3>
              <p className="text-body leading-relaxed text-muted">
                {step.body}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
