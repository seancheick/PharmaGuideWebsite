"use client";

import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";

/**
 * Trust Block — compressed.
 *
 * The original 3-trust-cards-then-4-restraint-cards version felt too long.
 * The 3 trust cards (Evidence-graded · AI-assisted · Privacy-first) were
 * restating the Infrastructure Strip at the top of the page — redundant.
 *
 * Compressed to: headline + subhead + the 4 restraint cards + freshness
 * signal. The restraint group is the section's reason for existing — no
 * other section says "we don't diagnose / replace your clinician / tell
 * you to stop meds / sell your data." That's the silent-objection-handler
 * that earns its place right before the conversion CTA.
 */

const RESTRAINT = [
  "We don't diagnose conditions.",
  "We don't replace your clinician.",
  "We don't tell you to stop medications.",
  "We don't sell your health data.",
] as const;

export function TrustBlock() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
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
            How we think
          </motion.p>

          {/* display-md (was display-lg) so "Built to explain uncertainty —"
              fits on one line at max-w-3xl */}
          <motion.h2
            id="trust-heading"
            variants={fadeUpItem}
            className="text-balance text-display-md text-ink"
          >
            Built to explain uncertainty —
            <br />
            <span className="font-serif italic">not hide it.</span>
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="max-w-prose text-body-lg leading-relaxed text-muted"
          >
            If evidence is weak, conflicting, or incomplete, we say so directly.
          </motion.p>
        </motion.div>

        {/* Restraint group — the section's reason for being */}
        <motion.ul
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08, delayChildren: 0.15 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-8%" }}
          className="mx-auto mt-12 grid max-w-5xl gap-3 sm:grid-cols-2 md:mt-14 lg:grid-cols-4"
          aria-label="Things PharmaGuide does not do"
        >
          {RESTRAINT.map((text, i) => (
            <motion.li
              key={i}
              variants={fadeUpItem}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface/50 px-4 py-3.5 backdrop-blur-sm"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="mt-[3px] shrink-0 text-muted"
              >
                <path
                  d="M3 3l8 8M11 3l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-body-sm leading-snug text-ink">{text}</p>
            </motion.li>
          ))}
        </motion.ul>

        {/* Freshness signal — pulsing dot + tiny mono caption */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ ...transitions.ambient, delay: 0.4 }}
          className="mt-10 flex items-center justify-center md:mt-12"
        >
          <span className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-subtle">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-severity-safe opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-severity-safe" />
            </span>
            Catalog updated weekly · Interaction reviews added regularly
          </span>
        </motion.div>
      </div>
    </section>
  );
}
