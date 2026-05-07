"use client";

import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";

/**
 * Trust Block — the section that earns the right to be believed.
 *
 * Three positive trust claims (what we DO) followed by four restraint
 * claims (what we DON'T do). The negative section is structurally
 * important — confident companies admit limits, and the contrast against
 * the trust cards makes both sets feel more honest.
 *
 * Closing freshness signal — tiny pulsing dot — communicates "this is
 * a living system" without being noisy.
 *
 * No ambient decoration in this section. Trust is the message; visual
 * restraint is the proof.
 */

const TRUST_CARDS = [
  {
    title: "Evidence-graded.",
    body: "Each interaction includes the strength of supporting evidence — and we tell you when there isn't any.",
  },
  {
    title: "AI-assisted. Human-reviewed.",
    body: "Educational content and interaction logic are reviewed by clinicians for accuracy, clarity, and safety framing.",
  },
  {
    title: "Privacy is part of the architecture.",
    body: "Your stack and health context stay under your control. We never sell, license, or share it.",
  },
] as const;

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
      className="relative section-y"
    >
      <div className="container relative mx-auto">
        {/* Header — eyebrow + headline + subhead, all centered */}
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
            How we think
          </motion.p>

          <motion.h2
            id="trust-heading"
            variants={fadeUpItem}
            className="text-balance text-display-lg text-ink"
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

        {/* Three trust cards */}
        <motion.div
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.1 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="mx-auto mt-16 grid max-w-5xl gap-5 md:mt-20 md:grid-cols-3 md:gap-6"
        >
          {TRUST_CARDS.map((card, i) => (
            <motion.article
              key={i}
              variants={fadeUpItem}
              className="rounded-2xl border border-border bg-surface p-7 shadow-sm transition-shadow duration-fast ease-smooth hover:shadow-md sm:p-8"
            >
              <h3 className="font-serif text-h3 italic leading-tight text-ink">
                {card.title}
              </h3>
              <p className="mt-4 text-body-sm leading-relaxed text-muted">
                {card.body}
              </p>
            </motion.article>
          ))}
        </motion.div>

        {/* Restraint group — "What we don't do" */}
        <div className="mx-auto mt-20 max-w-5xl md:mt-24">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={transitions.reveal}
            className="text-center font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
          >
            What we don&apos;t do
          </motion.p>

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
            className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Things PharmaGuide does not do"
          >
            {RESTRAINT.map((text, i) => (
              <motion.li
                key={i}
                variants={fadeUpItem}
                className="flex items-start gap-3 rounded-xl border border-border/70 bg-surface/40 px-4 py-3.5 backdrop-blur-sm"
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
        </div>

        {/* Freshness signal — pulsing dot + tiny mono caption */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ ...transitions.ambient, delay: 0.4 }}
          className="mt-14 flex items-center justify-center md:mt-16"
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
