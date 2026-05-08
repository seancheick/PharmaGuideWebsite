"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";

/**
 * How It Works — 3 premium step-cards with concrete in-app illustrations.
 *
 * Each card pairs the verbal claim with a working visual that proves it:
 *   01  Local catalog with sub-10ms lookup timings — proves "offline-first"
 *   02  Cross-reference rows with the 5-tier verdict labels — proves
 *       "every supplement checked against every other item, on-device"
 *   03  Your Fit card — qualitative verdict + supporting notes; mirrors
 *       the YourFit section's pattern (no numerical FitScore — that
 *       framing was retired in favor of qualitative + dual-read).
 *
 * The visuals are NOT decoration — they're miniature versions of the actual
 * app output. Concrete > abstract. The reference for this rebuild was the
 * legacy pharmaguide.io how-it-works section (Apple Health / Oura
 * aesthetic), translated to our token system.
 *
 * Card pattern matches the rest of the site: rounded-2xl, soft border,
 * layered shadow, hover-lift. Visual sits in a framed sub-surface
 * (bg-surface-subtle) so it reads as a "screen inside the card."
 *
 * The credentials line at the bottom (FDA · NIH · PubMed · DSLD +
 * Dr. Pham L. + Catalog updated weekly) was folded in from the
 * removed TrustBlock and ties off the trust angle.
 */

const STEPS = [
  {
    num: "01",
    title: "Scan or search.",
    body: "180,000-product catalog, pre-loaded on your device. Works in pharmacies, on flights, or in the supplement aisle with one bar of signal. No cloud lookup required.",
    visual: "catalog" as const,
  },
  {
    num: "02",
    title: "We cross-reference your full stack.",
    body: "Every supplement is checked against your medications, timing, and personal health context. All computation happens on-device. Nothing about your body is ever sent anywhere.",
    visual: "crossref" as const,
  },
  {
    num: "03",
    title: "You get Your Fit — with every study behind it.",
    body: "Personalized compatibility, computed fresh each time. Tap any note to read the mechanism, evidence grade, and clinical trial.",
    visual: "yourfit" as const,
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="relative section-y bg-surface-raised/50"
    >
      {/* Slight surface warmth + hairlines top/bottom: the section reads
          as its own zone, distinct from the warm cream above and the
          interaction ladder below. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />

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
            02 · How it works
          </motion.p>

          <motion.h2
            id="how-heading"
            variants={fadeUpItem}
            className="text-balance text-display-lg text-ink"
          >
            Three beats.{" "}
            <span className="font-serif italic">No guesswork.</span>
          </motion.h2>

          <motion.p
            variants={fadeUpItem}
            className="max-w-prose text-body-lg leading-relaxed text-muted"
          >
            From scan to decision — PharmaGuide brings everything together so
            you can understand your stack in seconds.
          </motion.p>
        </motion.div>

        {/* Step cards — premium 3-card grid */}
        <motion.ol
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12, delayChildren: 0.15 },
            },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          className="mt-14 grid gap-8 md:mt-20 md:grid-cols-3 md:gap-6 lg:gap-8"
        >
          {STEPS.map((step) => (
            <motion.li
              key={step.num}
              variants={fadeUpItem}
              className="group flex min-h-[480px] flex-col rounded-2xl border border-border bg-surface p-7 shadow-md transition-[transform,box-shadow] duration-slow ease-emphasized hover:-translate-y-1 hover:shadow-xl md:p-8"
            >
              <span className="font-mono text-[11px] font-medium tabular-nums uppercase tracking-[0.22em] text-accent">
                {step.num}
              </span>
              {/* Title bumped down to text-h3 so the longer full-sentence
                  titles (e.g. "We cross-reference your stack, meds, and
                  conditions.") fit on 2 lines without going huge.        */}
              <h3 className="mt-3 max-w-[22ch] font-serif text-h3 italic leading-snug text-ink">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[34ch] text-body-sm leading-relaxed text-muted">
                {step.body}
              </p>

              {/* Visual frame — sits at bottom of card via mt-auto */}
              <div className="mt-7 overflow-hidden rounded-xl border border-border/80 bg-surface-subtle">
                {step.visual === "catalog" && <CatalogVisual />}
                {step.visual === "crossref" && <CrossRefVisual />}
                {step.visual === "yourfit" && <YourFitVisual />}
              </div>
            </motion.li>
          ))}
        </motion.ol>

        {/* Credentials line — kept from prior pass. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ ...transitions.reveal, delay: 0.2 }}
          className="mx-auto mt-14 flex max-w-3xl flex-col items-center gap-2 border-t border-border/70 pt-7 text-center md:mt-16 md:gap-2.5"
        >
          <p className="text-balance text-body leading-relaxed text-ink">
            Cross-referenced with{" "}
            <span className="font-medium">FDA</span>
            <span className="mx-1.5 text-border-strong">·</span>
            <span className="font-medium">NIH</span>
            <span className="mx-1.5 text-border-strong">·</span>
            <span className="font-medium">PubMed</span>
            <span className="mx-1.5 text-border-strong">·</span>
            <span className="font-medium">DSLD</span>
          </p>
          <p className="text-body-sm leading-relaxed text-muted">
            Reviewed by{" "}
            <span className="text-ink">Dr. Pham L., PharmD</span>
            <span className="mx-2 text-border-strong">·</span>
            Catalog updated weekly
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Step 1 — Local catalog with sub-10ms lookup timings ─────────────
// The hero claim of this card is "offline" + "fast." So the visual shows
// exactly that: a "Catalog · local" header with a green "● offline" pill
// (looks like the device-network indicator), then 3 query rows with
// chevrons + product names + millisecond timings. The timings sell it
// — 0.006s reads as "this is just memory access, no network call."

const CATALOG_QUERIES = [
  { name: "ashwagandha 600 mg", time: "0.008 s" },
  { name: "magnesium glycinate", time: "0.006 s" },
  { name: "rhodiola rosea", time: "0.011 s" },
];

function CatalogVisual() {
  return (
    <div className="flex h-[280px] flex-col gap-3 p-5">
      {/* Header row: catalog label + offline indicator */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-border">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-subtle">
          Catalog · local
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-severity-safe">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-severity-safe opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-severity-safe" />
          </span>
          offline
        </span>
      </div>

      {/* Query rows — chevron + name + timing */}
      <div className="flex flex-col gap-1">
        {CATALOG_QUERIES.map((q) => (
          <div
            key={q.name}
            className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-fast hover:bg-surface"
          >
            <span aria-hidden="true" className="text-subtle">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </span>
            <span className="flex-1 text-[13px] text-ink">{q.name}</span>
            <span className="font-mono text-[10px] tabular-nums tracking-[0.04em] text-severity-safe">
              {q.time}
            </span>
          </div>
        ))}
      </div>

      {/* Footer note — emphasizes scale */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
        <span>180,000 products</span>
        <span>on-device · no cloud</span>
      </div>
    </div>
  );
}

// ─── Step 2 — Cross-reference rows with the 5-tier verdict labels ────
// Each row shows: severity dot, interaction name, and the colored
// verdict label. We deliberately dropped the "Tier N · " prefix and
// the A/B/C evidence-grade pill — both add visual noise and the
// section's promise is clinical clarity, not gamified scoring. The
// evidence grade lives one tap away in the real app.

const CROSS_REFS = [
  {
    name: "St. John's Wort ↔ sertraline",
    label: "Contraindicated",
    severity: "contraindicated" as const,
  },
  {
    name: "Ginkgo ↔ warfarin",
    label: "Avoid",
    severity: "avoid" as const,
  },
  {
    name: "Magnesium ↔ metformin",
    label: "Monitor · space 2h",
    severity: "monitor" as const,
  },
];

const SEVERITY_TEXT_MAP: Record<
  "contraindicated" | "avoid" | "caution" | "monitor" | "safe",
  string
> = {
  contraindicated: "text-severity-contraindicated",
  avoid: "text-severity-avoid",
  caution: "text-severity-caution",
  monitor: "text-severity-monitor",
  safe: "text-severity-safe",
};

const SEVERITY_DOT_MAP: Record<
  "contraindicated" | "avoid" | "caution" | "monitor" | "safe",
  string
> = {
  contraindicated: "bg-severity-contraindicated",
  avoid: "bg-severity-avoid",
  caution: "bg-severity-caution",
  monitor: "bg-severity-monitor",
  safe: "bg-severity-safe",
};

function CrossRefVisual() {
  return (
    <div className="flex h-[280px] flex-col justify-center gap-2.5 p-4">
      {CROSS_REFS.map((r) => (
        <div
          key={r.name}
          className="flex items-start gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 shadow-xs"
        >
          {/* Severity dot — vertically aligned with the interaction name */}
          <span
            aria-hidden="true"
            className={`mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT_MAP[r.severity]}`}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] leading-tight text-ink">
              {r.name}
            </p>
            <p
              className={`mt-1 font-mono text-[10px] uppercase tracking-[0.14em] ${SEVERITY_TEXT_MAP[r.severity]}`}
            >
              {r.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Step 3 — Your Fit card ─────────────────────────────────────────
// Mirrors the YourFit section's qualitative output. NO numeric score,
// NO progress bar — those framings were retired in favor of a
// qualitative verdict (Excellent / Good / Limited / Concerning / Not
// recommended) backed by supporting notes + actionable detail.
//
// Layout:
//   • "Your Fit" eyebrow (mono uppercase)
//   • Severity-colored verdict pill ("● Good fit" in italic serif)
//   • Supporting notes line ("2 timing notes · 1 interaction to review")
//   • One concrete actionable detail row
//
// Verdict pill animates in from y=8 once the card is in view, mirroring
// the YourFit card so the two sections feel like the same system.

function YourFitVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <div ref={ref} className="flex h-[280px] flex-col justify-center gap-5 p-6">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-subtle">
        Your Fit
      </p>

      {/* Verdict pill — same shape + color as the YourFit section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="inline-flex w-fit items-center gap-2 rounded-pill bg-severity-safe/12 px-3.5 py-1.5"
      >
        <span
          aria-hidden="true"
          className="block h-1.5 w-1.5 rounded-full bg-severity-safe"
        />
        <span className="font-serif text-h3 italic leading-none text-severity-safe">
          Good fit
        </span>
      </motion.div>

      {/* Supporting notes — calm summary of what's beneath the verdict */}
      <p className="text-body-sm leading-relaxed text-muted">
        2 timing notes
        <span className="mx-1.5 text-border-strong">·</span>
        1 interaction to review
      </p>

      {/* Single concrete actionable detail */}
      <div className="rounded-md border border-border/80 bg-surface px-3 py-2 text-[12px] text-muted">
        <span aria-hidden="true" className="mr-1.5 text-severity-monitor">↘</span>
        magnesium + metformin{" "}
        <span className="text-subtle">(space 2h)</span>
      </div>
    </div>
  );
}
