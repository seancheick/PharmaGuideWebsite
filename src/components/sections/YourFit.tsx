"use client";

import Link from "next/link";
import { m, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { DEMO_PRODUCTS } from "@/lib/demo-products";
import { qualityBand } from "@/lib/quality-score";
import { cn } from "@/lib/utils";

/**
 * Your Fit — the named-IP section.
 *
 * Was originally "FitScore" — renamed because the assessment is no longer
 * purely numerical. PharmaGuide does TWO reads on every product:
 *   1. Quality (numerical) — the product itself: six parts scored from the
 *      label, the evidence and verified certifications (not lab testing).
 *   2. Your Fit (qualitative) — how it lands for THIS person's stack:
 *      Excellent / Good / Limited / Needs review / Not recommended.
 *
 * The section teaches that duality in a single card with two stacked
 * sections. Animation choreography:
 *   T+0     card fades in
 *   T+200   quality bar fills + score counts 0→TARGET_SCORE
 *   T+1400  divider draws in
 *   T+1600  Your Fit badge slides up
 *   T+1900  supporting notes stagger in
 *
 * The closing italic line ("Quality is what's in the bottle. Fit is
 * everything around it.") is a deliberate callback to the Problem
 * section's thesis — closes the loop.
 */

// The card is a real catalog record (lib/demo-products.ts) — the same
// magnesium the hero phone adds, so the page shows one product with one
// score everywhere. The verdict word and colors derive from the score.
const PRODUCT = DEMO_PRODUCTS.magnesium;
const TARGET_SCORE = PRODUCT.score;
const BAND = qualityBand(TARGET_SCORE);
const SCORE_DURATION_MS = 1200;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function YourFit() {
  const cardRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-15%" });

  // The score ships as its real value in the server markup, so
  // crawlers, text-only readers, and no-JS visitors get the number that
  // actually matters — never a mid-animation 0. Once JS takes over we
  // zero the display so the count-up still reads as an animation. This
  // section sits far below the fold, so the reset happens long before
  // anyone can see it. Reduced-motion visitors keep the static number.
  useEffect(() => {
    if (prefersReducedMotion() || !scoreRef.current) return;
    scoreRef.current.textContent = "0";
  }, []);

  // Count-up via direct DOM mutation — zero re-renders during animation
  useEffect(() => {
    if (!inView || !scoreRef.current || prefersReducedMotion()) return;
    const el = scoreRef.current;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / SCORE_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(TARGET_SCORE * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <section id="your-fit" aria-labelledby="your-fit-heading" className="section-y relative">
      <div className="container relative mx-auto">
        <div className="grid items-center gap-14 md:grid-cols-[1.05fr_1fr] md:gap-16 lg:gap-20">
          {/* Left column — copy */}
          <m.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="flex flex-col gap-7 md:gap-9"
          >
            <m.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              Your Fit
            </m.p>

            <m.h2
              id="your-fit-heading"
              variants={fadeUpItem}
              className="text-balance text-display-lg text-ink"
            >
              High quality doesn&apos;t always mean
              <br />
              <span className="font-serif italic text-accent">right for you.</span>
            </m.h2>

            <m.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              PharmaGuide gives you two reads on every product — objective quality, and personal
              fit.
            </m.p>

            {/* Callback to the Problem section's thesis. The shape of the
                site closes here: label vs combination, quality vs fit. */}
            <m.p
              variants={fadeUpItem}
              className="max-w-prose font-serif text-h3 italic leading-snug text-ink"
            >
              Quality is what&apos;s in the bottle.
              <br />
              Fit is everything around it.
            </m.p>

            {/* Hand-off to the Features deep-dive — for visitors who
                want to know exactly how the score and fit are computed. */}
            <m.div variants={fadeUpItem}>
              <Link
                href="/features#ingredient-transparency"
                className="group inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-link underline decoration-link/60 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:text-link-strong hover:decoration-link"
              >
                How we score products
                <span
                  aria-hidden="true"
                  className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </m.div>
          </m.div>

          {/* Right column — dual-assessment card */}
          <div ref={cardRef} className="flex justify-center md:justify-end">
            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={transitions.reveal}
              className="relative w-full max-w-[420px]"
            >
              {/* Soft accent halo behind card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-6 -inset-y-4 rounded-[2rem] bg-severity-safe/[0.08] blur-2xl"
              />

              <div className="relative rounded-2xl border border-severity-safe/15 bg-severity-safe/[0.03] p-6 shadow-lg sm:p-7">
                {/* Tiny product label — gives context to what we're scoring.
                    Different product from the HowItWorks Step 3 mini-card
                    (which now shows Vitamin D3 Quality only) so the two
                    surfaces do different jobs rather than duplicating. */}
                <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle">
                  {PRODUCT.name} · {PRODUCT.dose}
                </p>

                {/* QUALITY — top section */}
                <div className="mt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-subtle">
                      Quality
                    </span>
                    {/* Number, bar, and verdict all take their color from the
                        same band, so the visual story can't contradict the
                        score. role="img" + aria-label pins the accessible
                        name to the final value, so screen readers announce
                        the real number whether they reach it before, during,
                        or after the count-up. */}
                    <span
                      ref={scoreRef}
                      role="img"
                      aria-label={`Quality score ${TARGET_SCORE} out of 100`}
                      /* Plain template string, NOT cn(): tailwind-merge reads
                         `text-display-md` and `text-severity-safe` as two
                         `text-*` utilities in conflict and silently drops the
                         font size, shrinking the score to body text. */
                      className={`font-serif text-display-md italic tabular-nums leading-none ${BAND.textClass}`}
                    >
                      {TARGET_SCORE}
                    </span>
                  </div>

                  {/* Progress bar — width and color both come from the score,
                      so a lower demo score would shift the bar to the
                      monitor/caution tone automatically. */}
                  <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-border">
                    <m.div
                      className={cn("h-full rounded-full", BAND.barClass)}
                      initial={{ width: "0%" }}
                      animate={inView ? { width: `${TARGET_SCORE}%` } : {}}
                      transition={{ duration: SCORE_DURATION_MS / 1000, ease: [0.32, 0.72, 0, 1] }}
                    />
                  </div>

                  <m.p
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 1.0, ease: [0.32, 0.72, 0, 1] }}
                    className="mt-3 text-body-sm leading-snug text-muted"
                  >
                    <span className="font-medium text-ink">{BAND.label} quality</span>
                    {PRODUCT.thirdPartyTested && " · 3rd-party tested"}
                    {PRODUCT.certification && ` · ${PRODUCT.certification}`}
                  </m.p>
                </div>

                {/* Divider — draws in horizontally */}
                <m.div
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.4, ease: [0.32, 0.72, 0, 1] }}
                  style={{ transformOrigin: "left" }}
                  className="my-6 h-px bg-border"
                />

                {/* YOUR FIT — bottom section */}
                <div>
                  <span className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-subtle">
                    Your Fit
                  </span>

                  <m.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 1.6, ease: [0.32, 0.72, 0, 1] }}
                    className="bg-severity-safe/18 mt-3 inline-flex items-center gap-2.5 rounded-pill px-4 py-2"
                  >
                    <span
                      aria-hidden="true"
                      className="block h-1.5 w-1.5 rounded-full bg-severity-safe"
                    />
                    <span className="font-serif text-h3 italic leading-none text-severity-safe">
                      Good fit
                    </span>
                    <span className="text-body-sm leading-none text-severity-safe/80">
                      with timing adjustment
                    </span>
                  </m.div>

                  {/* Notes — stagger in last */}
                  <m.ul
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={{
                      hidden: {},
                      visible: {
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 1.9,
                        },
                      },
                    }}
                    className="mt-4 space-y-2"
                  >
                    {/* Same finding as the hero phone: excellent product,
                        one timing change for this person. */}
                    <NoteItem dotClass="bg-severity-caution">
                      1 interaction needs a timing change · levothyroxine
                    </NoteItem>
                    <NoteItem dotClass="bg-severity-safe">No high-risk conflicts detected</NoteItem>
                  </m.ul>
                </div>

                {/* Footer — tiny attribution line that mirrors the in-app feel */}
                <m.p
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 2.5 }}
                  className="mt-6 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle"
                >
                  Personalized to your stack · updates when your stack changes
                </m.p>
              </div>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NoteItem({ children, dotClass }: { children: React.ReactNode; dotClass: string }) {
  return (
    <m.li
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="flex items-start gap-2.5 text-body-sm text-ink"
    >
      <span
        aria-hidden="true"
        className={cn("mt-[7px] block h-1 w-1 shrink-0 rounded-full", dotClass)}
      />
      <span>{children}</span>
    </m.li>
  );
}
