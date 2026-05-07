"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * Your Fit — the named-IP section.
 *
 * Was originally "FitScore" — renamed because the assessment is no longer
 * purely numerical. PharmaGuide does TWO reads on every product:
 *   1. Quality (numerical) — the product itself: evidence, purity, testing.
 *   2. Your Fit (qualitative) — how it lands for THIS person's stack:
 *      Excellent / Good / Limited / Concerning / Not recommended.
 *
 * The section teaches that duality in a single card with two stacked
 * sections. Animation choreography:
 *   T+0     card fades in
 *   T+200   quality bar fills + score counts 0→89
 *   T+1400  divider draws in
 *   T+1600  Your Fit badge slides up
 *   T+1900  supporting notes stagger in
 *
 * The closing italic line ("Quality is what's in the bottle. Fit is
 * everything around it.") is a deliberate callback to the Problem
 * section's thesis — closes the loop.
 */

const TARGET_SCORE = 89;
const SCORE_DURATION_MS = 1200;

export function YourFit() {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-15%" });
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / SCORE_DURATION_MS, 1);
      // easeOutCubic — fast start, slow finish, feels natural for counters
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(TARGET_SCORE * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <section
      id="your-fit"
      aria-labelledby="your-fit-heading"
      className="relative section-y"
    >
      <div className="container relative mx-auto">
        <div className="grid items-center gap-14 md:grid-cols-[1.05fr_1fr] md:gap-16 lg:gap-20">
          {/* Left column — copy */}
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="flex flex-col gap-7 md:gap-9"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              Your Fit
            </motion.p>

            <motion.h2
              id="your-fit-heading"
              variants={fadeUpItem}
              className="text-balance text-display-lg text-ink"
            >
              What&apos;s high quality for one person
              <br />
              <span className="font-serif italic">
                may deserve a second look for another.
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              PharmaGuide gives you two reads on every product — objective
              quality, and personal fit.
            </motion.p>

            {/* Callback to the Problem section's thesis. The shape of the
                site closes here: label vs combination, quality vs fit. */}
            <motion.p
              variants={fadeUpItem}
              className="max-w-prose font-serif text-h3 italic leading-snug text-ink"
            >
              Quality is what&apos;s in the bottle.
              <br />
              Fit is everything around it.
            </motion.p>
          </motion.div>

          {/* Right column — dual-assessment card */}
          <div ref={cardRef} className="flex justify-center md:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={transitions.reveal}
              className="relative w-full max-w-[420px]"
            >
              {/* Soft accent halo behind card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-4 -inset-y-2 rounded-[2rem] bg-accent/[0.05] blur-2xl"
              />

              <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-7">
                {/* Tiny product label — gives context to what we're scoring */}
                <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle">
                  Magnesium Glycinate · 200 mg
                </p>

                {/* QUALITY — top section */}
                <div className="mt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-subtle">
                      Quality
                    </span>
                    <span className="font-serif text-display-md italic leading-none tabular-nums text-ink">
                      {score}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-[5px] overflow-hidden rounded-full bg-border">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      initial={{ width: "0%" }}
                      animate={inView ? { width: `${TARGET_SCORE}%` } : {}}
                      transition={{ duration: SCORE_DURATION_MS / 1000, ease: [0.32, 0.72, 0, 1] }}
                    />
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 1.0, ease: [0.32, 0.72, 0, 1] }}
                    className="mt-3 text-body-sm leading-snug text-muted"
                  >
                    <span className="font-medium text-ink">Excellent quality</span>
                    {" · "}3rd-party tested · clean ingredient list
                  </motion.p>
                </div>

                {/* Divider — draws in horizontally */}
                <motion.div
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

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 1.6, ease: [0.32, 0.72, 0, 1] }}
                    className="mt-3 inline-flex items-center gap-2 rounded-pill bg-severity-safe/12 px-3.5 py-1.5"
                  >
                    <span
                      aria-hidden="true"
                      className="block h-1.5 w-1.5 rounded-full bg-severity-safe"
                    />
                    <span className="font-serif text-h3 italic leading-none text-severity-safe">
                      Good fit
                    </span>
                  </motion.div>

                  {/* Notes — stagger in last */}
                  <motion.ul
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
                    <NoteItem dotClass="bg-accent">2 timing notes</NoteItem>
                    <NoteItem dotClass="bg-severity-monitor">
                      1 interaction to review
                    </NoteItem>
                    <NoteItem dotClass="bg-severity-safe">
                      No major conflicts detected
                    </NoteItem>
                  </motion.ul>
                </div>

                {/* Footer — tiny attribution line that mirrors the in-app feel */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 2.5 }}
                  className="mt-6 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle"
                >
                  Personalised to your stack · updated continuously
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NoteItem({
  children,
  dotClass,
}: {
  children: React.ReactNode;
  dotClass: string;
}) {
  return (
    <motion.li
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
    </motion.li>
  );
}
