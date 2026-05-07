"use client";

import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";

/**
 * Problem — first big copy moment after the hero.
 *
 * Pure typography. No cards, no icons, no decoration. The structure is:
 *   1. eyebrow ("The problem")
 *   2. headline — two lines, second line muted (matches the hero's rhythm)
 *   3. three short statements — text-only, three columns on desktop, stacked
 *      on mobile, staggered entrance left-to-right
 *   4. closing italic-serif thesis — the conceptual hinge for the whole site
 *
 * The section uses three independent scroll-triggered groups so each block
 * lands deliberately as the reader scrolls past it.
 */

const STATEMENTS = [
  "Googling “X with Y” gives you conflicting answers.",
  "Most apps check one product. You take a stack.",
  "Timing can change how something works.",
] as const;

// Slightly wider stagger between the three statements (vs default 80ms)
// so the eye reads each one before the next arrives.
const statementsContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
} as const;

export function Problem() {
  return (
    <section
      id="problem"
      aria-label="The problem"
      className="relative section-y"
    >
      <div className="container mx-auto">
        {/* Block 1 — eyebrow + headline */}
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="mx-auto flex max-w-4xl flex-col items-center gap-7 text-center md:gap-9"
        >
          <motion.p
            variants={fadeUpItem}
            className="font-mono text-eyebrow font-medium uppercase tracking-[var(--ls-eyebrow)] text-muted"
          >
            The problem
          </motion.p>

          <motion.h2 variants={fadeUpItem} className="text-display-lg text-ink">
            A label tells you what&apos;s in the bottle.
            <br />
            <span className="text-muted">
              Not what happens with your other bottles.
            </span>
          </motion.h2>
        </motion.div>

        {/* Block 2 — three statements */}
        <motion.div
          variants={statementsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-12%" }}
          className="mx-auto mt-16 grid max-w-5xl gap-10 md:mt-20 md:grid-cols-3 md:gap-10 lg:gap-14"
        >
          {STATEMENTS.map((statement, i) => (
            <motion.p
              key={i}
              variants={fadeUpItem}
              className="text-balance text-h3 leading-snug text-muted"
            >
              {statement}
            </motion.p>
          ))}
        </motion.div>

        {/* Block 3 — closing thesis */}
        <motion.p
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={transitions.reveal}
          className="mx-auto mt-20 max-w-3xl text-balance text-center font-serif text-display-md italic text-ink md:mt-24"
        >
          Because interactions happen between products
          <br className="hidden sm:inline" />{" "}
          — not in isolation.
        </motion.p>
      </div>
    </section>
  );
}
