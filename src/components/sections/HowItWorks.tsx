"use client";

import Link from "next/link";
import { m, useInView, useReducedMotion } from "framer-motion";
import { LEAD_REVIEWER, displayName } from "@/lib/people";
import { useRef } from "react";
import { ease, fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { qualityBand } from "@/lib/quality-score";
import { SOURCE_LABEL_COUNT } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * How It Works — 3 premium step-cards with concrete in-app illustrations.
 *
 * Each card pairs the verbal claim with a working visual that proves it:
 *   01  Local catalog with sub-10ms lookup timings — proves "offline-first"
 *   02  Cross-reference rows with the 5-tier verdict labels — proves
 *       "every supplement checked against every other item, on-device"
 *   03  Two reads on one product — Quality (scored) above Your Fit
 *       (qualitative; no numerical FitScore). This card absorbed the
 *       standalone Your Fit section on 2026-10-04.
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
 * lead reviewer + Catalog updated weekly) was folded in from the
 * removed TrustBlock and ties off the trust angle.
 */

const STEPS = [
  {
    num: "01",
    title: "Scan or search.",
    body: "Find products instantly from a large on-device catalog, even offline or with weak signal.",
    visual: "catalog" as const,
  },
  {
    num: "02",
    title: "Check it against your stack.",
    body: "PharmaGuide compares supplements, medications, timing, and health context to surface risks people usually miss. Core interaction checks run entirely on your device.",
    visual: "crossref" as const,
  },
  {
    num: "03",
    title: "Get two reads, not one.",
    body: "Quality is what's in the bottle. Your fit is everything around it — your medications, conditions, and stack. Every flag shows its evidence and reasoning in plain language.",
    visual: "yourfit" as const,
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="section-y relative bg-surface-raised/50"
    >
      {/* Slight surface warmth + hairlines top/bottom: the section reads
          as its own zone, distinct from the warm cream above and the
          interaction ladder below. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />

      <div className="container relative mx-auto">
        {/* Header */}
        <m.div
          variants={fadeUpContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-15%" }}
          className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
        >
          <m.p
            variants={fadeUpItem}
            className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
          >
            How it works
          </m.p>

          <m.h2
            id="how-heading"
            variants={fadeUpItem}
            className="text-balance text-display-lg text-ink"
          >
            Three beats. <span className="font-serif italic text-accent">No guesswork.</span>
          </m.h2>

          <m.p
            variants={fadeUpItem}
            className="max-w-prose text-body-lg leading-relaxed text-muted"
          >
            From scan to verdict — find the product, check it against your stack, and understand
            what to do next.
          </m.p>
        </m.div>

        {/* Step cards — premium 3-card grid */}
        <m.ol
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
            <m.li
              key={step.num}
              variants={fadeUpItem}
              className="group flex min-h-[480px] flex-col rounded-2xl border border-border bg-surface p-7 shadow-md transition-[transform,box-shadow] duration-slow ease-emphasized hover:-translate-y-1 hover:shadow-xl md:p-8"
            >
              <span className="font-mono text-[11px] font-medium uppercase tabular-nums tracking-[0.22em] text-accent">
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
            </m.li>
          ))}
        </m.ol>

        {/* Credentials block — now a clickable hand-off to /methodology
            where the full sourcing + verification process lives. The
            block stays a quiet trust signal visually; the hover state
            cues that there's more depth one click away.              */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ ...transitions.reveal, delay: 0.2 }}
          className="mx-auto mt-14 max-w-3xl border-t border-border/70 pt-7 md:mt-16"
        >
          <Link
            href="/methodology"
            className="group flex flex-col items-center gap-2 text-center md:gap-2.5"
          >
            <p className="text-balance text-body leading-relaxed text-ink transition-colors duration-fast ease-smooth group-hover:text-accent">
              Cross-referenced with <span className="font-medium">FDA</span>
              <span aria-hidden="true" className="mx-1.5 text-border-strong">
                ·
              </span>
              <span className="font-medium">NIH</span>
              <span aria-hidden="true" className="mx-1.5 text-border-strong">
                ·
              </span>
              <span className="font-medium">PubMed</span>
              <span aria-hidden="true" className="mx-1.5 text-border-strong">
                ·
              </span>
              <span className="font-medium">DSLD</span>
            </p>
            <p className="text-body-sm leading-relaxed text-muted">
              Reviewed by <span className="text-ink">{displayName(LEAD_REVIEWER)}</span>
              <span aria-hidden="true" className="mx-2 text-border-strong">
                ·
              </span>
              Catalog updated weekly
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">
              Read the full methodology
              <span
                aria-hidden="true"
                className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
              >
                →
              </span>
            </p>
          </Link>
        </m.div>
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
      <div className="flex items-center justify-between gap-3 border-b border-border pb-2.5">
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
              <svg
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
        <span>From {SOURCE_LABEL_COUNT} NIH labels</span>
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
    // Production: berberine × hypoglycemics_lower_risk (metformin's class),
    // caution / established — "May boost your diabetes medication".
    name: "Berberine ↔ metformin",
    label: "Caution",
    severity: "caution" as const,
  },
  {
    name: "Garlic ↔ warfarin",
    label: "Monitor",
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
            <p className="truncate text-[12.5px] leading-tight text-ink">{r.name}</p>
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

// ─── Step 3 — Two reads: Quality, then Your Fit ──────────────────────
// This card used to show Quality alone (on a Vitamin D3), and a separate
// Your Fit section further down showed the dual read. Merged 2026-10-04:
// one card, one product, both reads — the page lost a full-height section
// and the visitor still meets the idea that matters most, that a high
// score and a good fit are different answers.
//
// The product is the hero phone's magnesium (lib/demo-products.ts), so
// the page shows one product with one score everywhere. The fit line is
// the hero's finding: excellent product, one timing change for someone
// on levothyroxine. Number, bar and verdict share the score's band.

const PRODUCT = DEMO_PRODUCTS.magnesium;
const BAND = qualityBand(PRODUCT.score);

function YourFitVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reducedMotion = useReducedMotion();
  // Reduced motion renders the finished card; otherwise each beat waits
  // for the card to scroll into view.
  const show = reducedMotion || inView;
  const reveal = (delay: number) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 4 },
    animate: show ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.45, delay, ease: ease.emphasized },
  });

  return (
    <div ref={ref} className="flex h-[280px] flex-col justify-center p-5">
      <p className="font-mono text-[9.5px] font-medium uppercase leading-snug tracking-[0.16em] text-subtle">
        {PRODUCT.name} · {PRODUCT.dose}
      </p>

      {/* Read 1 — Quality: the product itself */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">
            Quality
          </span>
          <m.span
            {...reveal(0.2)}
            role="img"
            aria-label={`Quality score ${PRODUCT.score} out of 100`}
            /* Template string, not cn() — tailwind-merge would treat
               `text-display-sm` and `text-severity-safe` as conflicting
               `text-*` utilities and drop the font size. */
            className={`font-serif text-display-sm italic tabular-nums leading-none ${BAND.textClass}`}
          >
            {PRODUCT.score}
          </m.span>
        </div>
        <div className="mt-2.5 h-[5px] overflow-hidden rounded-full bg-border">
          <m.div
            className={cn("h-full origin-left rounded-full", BAND.barClass)}
            style={{ width: `${PRODUCT.score}%` }}
            initial={reducedMotion ? false : { scaleX: 0 }}
            animate={show ? { scaleX: 1 } : {}}
            transition={{ duration: 1.1, delay: 0.3, ease: ease.emphasized }}
          />
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted">
          <span className="font-medium text-ink">{BAND.label}</span>
          {PRODUCT.certification && ` · ${PRODUCT.certification}`}
        </p>
      </div>

      <m.div
        aria-hidden="true"
        initial={reducedMotion ? false : { scaleX: 0 }}
        animate={show ? { scaleX: 1 } : {}}
        transition={{ duration: 0.5, delay: 1.0, ease: ease.emphasized }}
        className="my-4 h-px origin-left bg-border"
      />

      {/* Read 2 — Your Fit: the same product, for this person's stack */}
      <div>
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-subtle">
          Your fit
        </span>
        <m.p
          {...reveal(1.2)}
          className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-severity-safe"
        >
          <span
            aria-hidden="true"
            className="block h-1.5 w-1.5 shrink-0 -translate-y-0.5 rounded-full bg-severity-safe"
          />
          <span className="whitespace-nowrap font-serif text-[19px] italic leading-none">
            Good fit
          </span>
          <span className="text-[11px] leading-none text-severity-safe/80">
            with timing adjustment
          </span>
        </m.p>
        <m.p
          {...reveal(1.45)}
          className="mt-2.5 flex items-start gap-2 text-[11px] leading-snug text-muted"
        >
          <span
            aria-hidden="true"
            className="mt-[5px] block h-1 w-1 shrink-0 rounded-full bg-severity-caution"
          />
          <span>Separate from levothyroxine by 4+ hours</span>
        </m.p>
      </div>
    </div>
  );
}
