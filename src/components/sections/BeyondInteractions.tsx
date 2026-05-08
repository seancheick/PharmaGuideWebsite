"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";

/**
 * Beyond Interactions — homepage broadening section.
 *
 * Sits between the Interaction Ladder (which shows ONE capability deep)
 * and Real-Life Moments (which brings the product to people). Its job:
 * widen perception in 6 cards before the page goes back to lifestyle.
 *
 * Each card teases one /features pillar with a small mono-numbered
 * badge + italic-serif title + 1-line muted descriptor + arrow link
 * to the deep-dive section anchor.
 *
 * No bullet stacks, no checklist vibe — same typography rhythm as the
 * rest of the site. Cards have a hairline border and a subtle hover
 * lift that telegraphs "click for more."
 */

const CAPABILITIES = [
  {
    num: "01",
    title: "Medication depletion",
    body: "Statins lower CoQ10. Metformin depletes B12. We catch these.",
    href: "/features#medication-depletion",
  },
  {
    num: "02",
    title: "Stack intelligence",
    body: "Multi-way analysis. Dose summation across products. One verdict.",
    href: "/features#stack-intelligence",
  },
  {
    num: "03",
    title: "Quality + transparency",
    body: "Active and inactive ingredients. Proprietary blends, decomposed.",
    href: "/features#ingredient-transparency",
  },
  {
    num: "04",
    title: "Personal fit",
    body: "Profile-gated. Conditions, age, drug class, pregnancy aware.",
    href: "/features#personal-fit",
  },
  {
    num: "05",
    title: "Nutrient accumulation",
    body: "RDA + UL tracking. Catches stack-level over-supplementation.",
    href: "/features#nutrient-accumulation",
  },
  {
    num: "06",
    title: "Recall + safety alerts",
    body: "Live FDA recalls. FAERS adverse-event signals. Lot-level checks.",
    href: "/features#recall-safety",
  },
] as const;

export function BeyondInteractions() {
  return (
    <section
      id="beyond-interactions"
      aria-labelledby="beyond-heading"
      className="relative section-y"
    >
      {/* Faint accent halos for ambient depth */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute h-[160px] w-[520px] rounded-pill bg-accent/[0.05] blur-3xl"
          style={{ top: "5%", right: "-180px", transform: "rotate(-8deg)" }}
        />
        <div
          className="absolute h-[120px] w-[380px] rounded-pill bg-accent/[0.04] blur-3xl"
          style={{ bottom: "8%", left: "-140px", transform: "rotate(12deg)" }}
        />
      </div>

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
            Beyond interactions
          </motion.p>

          <motion.h2
            id="beyond-heading"
            variants={fadeUpItem}
            className="text-balance text-display-lg leading-[1.06] text-ink"
          >
            Interactions are{" "}
            <span className="font-serif italic text-accent">just the start.</span>
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="max-w-prose text-body-lg leading-relaxed text-muted"
          >
            PharmaGuide reads your full stack — not just for conflicts, but
            for what your medications quietly take away, what's hidden in
            the proprietary blend, where your nutrients are accumulating,
            and what got recalled while you weren&apos;t looking.
          </motion.p>
        </motion.div>

        {/* Capability grid */}
        <motion.ul
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08, delayChildren: 0.15 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-3"
        >
          {CAPABILITIES.map((cap) => (
            <motion.li key={cap.num} variants={fadeUpItem} className="group">
              <Link
                href={cap.href}
                className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-fast ease-smooth hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent md:p-7"
              >
                <span className="font-mono text-[10.5px] font-medium tabular-nums uppercase tracking-[0.18em] text-accent">
                  {cap.num}
                </span>

                <h3 className="font-serif text-h3 italic leading-snug text-ink">
                  {cap.title}
                </h3>

                <p className="text-body-sm leading-relaxed text-muted">
                  {cap.body}
                </p>

                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">
                  See how
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>

        {/* Footer links — primary pill to /features (depth) +
            secondary link to /blog (long-form reading). Two separate
            paths for two different appetites: skim deep-dives vs.
            read evidence-graded guides. */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={transitions.ambient}
          className="mt-12 flex flex-col items-center gap-4 md:mt-14 md:flex-row md:justify-center md:gap-6"
        >
          <Link
            href="/features"
            className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-5 py-3 text-body-sm font-medium text-ink shadow-xs transition-[background-color,transform,box-shadow] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-surface-raised hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
          >
            See all six capabilities in depth
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
          >
            Or read our evidence-graded guides
            <span
              aria-hidden="true"
              className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
