"use client";

import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";

/**
 * Problem — first big copy moment after the hero.
 *
 * Pure typography with one ambient interrupt: three faint capsule shapes
 * floating in the background, deeply blurred, providing texture without
 * decoration. Otherwise: typography and whitespace doing all the work.
 *
 * Structure:
 *   1. eyebrow ("The problem")
 *   2. headline — two lines, second muted (mirrors the hero rhythm)
 *   3. three short statements — two-tone (lead in ink, tail in muted),
 *      narrow blocks for editorial reading rhythm, staggered left-to-right
 *   4. closing italic-serif thesis — the conceptual hinge for the whole site
 */

// Each statement is split into a darker "lead" + a muted "tail" — gives each
// block its own internal hierarchy and prevents the section from going flat.
const STATEMENTS = [
  {
    lead: "Googling “X with Y”",
    tail: "usually gives you three different answers.",
  },
  {
    lead: "Most products are checked one at a time.",
    tail: "That’s not how people take them.",
  },
  {
    lead: "Sometimes it’s not the ingredient.",
    tail: "It’s the timing.",
  },
] as const;

// Slower stagger (120ms vs default 80ms) so each statement is read before
// the next arrives. Reading rhythm > animation efficiency.
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
      className="relative section-y overflow-hidden"
    >
      {/* Ambient depth — three faint capsule shapes drift behind the content.
          Heavy blur turns them into atmospheric warmth rather than decoration.
          pointer-events-none so they never interfere with selection / hover. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute h-[120px] w-[460px] rounded-pill bg-accent/[0.07] blur-3xl"
          style={{ top: "-32px", right: "-140px", transform: "rotate(-12deg)" }}
        />
        <div
          className="absolute h-[100px] w-[340px] rounded-pill bg-foreground/[0.04] blur-3xl"
          style={{ top: "42%", left: "-120px", transform: "rotate(18deg)" }}
        />
        <div
          className="absolute h-[110px] w-[400px] rounded-pill bg-accent/[0.05] blur-3xl"
          style={{ bottom: "8%", right: "8%", transform: "rotate(-6deg)" }}
        />
      </div>

      <div className="container relative mx-auto">
        {/* Block 1 — eyebrow + headline */}
        <motion.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="mx-auto flex max-w-4xl flex-col items-center gap-10 text-center md:gap-12"
        >
          <motion.p
            variants={fadeUpItem}
            className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
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

        {/* Block 2 — three statements with two-tone hierarchy.
            Wider container + per-statement max so statement 2 can fit on
            two visual lines on desktop (lead + tail). */}
        <motion.div
          variants={statementsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-12%" }}
          className="mx-auto mt-20 grid max-w-6xl gap-12 md:mt-24 md:grid-cols-3 md:gap-12 lg:gap-16"
        >
          {STATEMENTS.map((s, i) => (
            <motion.p
              key={i}
              variants={fadeUpItem}
              className="mx-auto max-w-[300px] text-balance text-h3 leading-snug md:mx-0 md:max-w-none"
            >
              <span className="text-ink">{s.lead}</span>{" "}
              <span className="text-muted">{s.tail}</span>
            </motion.p>
          ))}
        </motion.div>

        {/* Block 3 — closing thesis (smaller, tighter, subtler scale-up).
            Wider on desktop so the first half fits on one line; mobile lets
            it wrap naturally. The forced break sits between the two clauses
            on tablet/desktop where the line otherwise overflows the eye. */}
        <motion.p
          initial={{ opacity: 0, y: 12, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={transitions.reveal}
          className="mx-auto mt-24 max-w-2xl text-balance text-center font-serif text-display-sm italic leading-[1.12] text-ink md:mt-28 md:max-w-4xl"
        >
          Because interactions happen between products
          <br className="hidden md:inline" />{" "}
          — not in isolation.
        </motion.p>
      </div>
    </section>
  );
}
