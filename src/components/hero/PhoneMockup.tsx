"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { transitions } from "@/lib/tokens";
import { AppUILoop, ITEMS, type StackItem, type ItemKey } from "./AppUILoop";

/**
 * PhoneMockup — modern iPhone-style device frame with floating signature card.
 *
 * Owns all the loop state. AppUILoop is now a pure presentational child that
 * receives `searchText`, `resultFor`, and `stack` as props. The interaction
 * card and personalization chip live OUTSIDE the screen container so the
 * interaction card can overhang the bezel — the signature "important info
 * emerging" moment.
 *
 * Composition (outermost → innermost):
 *   1. Glow wrapper (relative, holds radial accent glow + tilt wrapper)
 *   2. Tilt wrapper (md:rotate; doesn't fight motion's transform)
 *   3. Float wrapper (motion: gentle Y oscillation)
 *   4. Phone+cards container (relative; holds bezel + overhanging cards)
 *   5. Bezel + screen with AppUILoop (overflow-hidden — clips internal UI)
 *   6. Floating interaction card (absolute; overhangs right by 12px)
 *   7. Floating fit-tag chip (absolute; sits below interaction, no overhang)
 *
 * 7-second loop, all timings in tokens, prefers-reduced-motion respected.
 */
export function PhoneMockup() {
  const reducedMotion = useReducedMotion();
  const [searchText, setSearchText] = useState("");
  const [resultFor, setResultFor] = useState<ItemKey | null>(null);
  const [stack, setStack] = useState<StackItem[]>([]);
  const [showInteraction, setShowInteraction] = useState(false);
  const [showFitTag, setShowFitTag] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setSearchText("");
      setResultFor(null);
      setStack([ITEMS.magnesium, ITEMS.levothyroxine]);
      setShowInteraction(true);
      setShowFitTag(true);
      return;
    }

    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const typewriter = async (target: string, perCharMs: number) => {
      for (let i = 0; i <= target.length; i++) {
        if (cancelled) return;
        setSearchText(target.slice(0, i));
        if (i < target.length) await wait(perCharMs);
      }
    };

    async function runLoop() {
      while (!cancelled) {
        // Reset
        setSearchText("");
        setResultFor(null);
        setStack([]);
        setShowInteraction(false);
        setShowFitTag(false);
        await wait(400);
        if (cancelled) return;

        await typewriter("magnesium", 60);
        if (cancelled) return;
        await wait(120);
        setResultFor("magnesium");
        await wait(420);
        if (cancelled) return;

        setStack([ITEMS.magnesium]);
        setResultFor(null);
        setSearchText("");
        await wait(280);
        if (cancelled) return;

        await typewriter("levothyroxine", 50);
        if (cancelled) return;
        await wait(120);
        setResultFor("levothyroxine");
        await wait(420);
        if (cancelled) return;

        setStack([ITEMS.magnesium, ITEMS.levothyroxine]);
        setResultFor(null);
        setSearchText("");
        await wait(550);
        if (cancelled) return;

        setShowInteraction(true);
        await wait(1000);
        if (cancelled) return;

        setShowFitTag(true);
        await wait(2200);
      }
    }

    void runLoop();
    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  return (
    <div className="relative flex justify-center overflow-hidden md:justify-end">
      {/* Ambient radial glow — soft accent halo extending beyond the phone.
          Felt, not seen. Anchors the device into the page environment. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          inset: "-12% -10%",
          background:
            "radial-gradient(50% 55% at 55% 50%, rgb(var(--color-accent) / 0.09), transparent 70%)",
        }}
      />

      {/* Tilt wrapper — desktop only */}
      <div className="relative md:translate-y-[-8px] md:rotate-[2.5deg]">
        {/* Float wrapper — gentle continuous Y oscillation */}
        <motion.div
          initial={{ y: 0 }}
          animate={reducedMotion ? {} : { y: [-4, 4, -4] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
          className="relative w-[300px] sm:w-[320px] md:w-[340px] lg:w-[360px]"
        >
          {/* Phone+cards container — anchors the floating cards' positioning */}
          <div className="relative aspect-[9/18]">
            {/* Outer bezel */}
            <div className="relative h-full w-full rounded-[3rem] bg-ink p-[3px] shadow-2xl">
              {/* Bezel highlight — soft top-left → transparent */}
              <div className="pointer-events-none absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/10 via-white/0 to-white/0" />

              {/* Inner edge — subtle ring for depth */}
              <div className="pointer-events-none absolute inset-[3px] rounded-[2.85rem] ring-1 ring-inset ring-white/5" />

              {/* Screen — overflow-hidden, contains AppUILoop only */}
              <div className="relative h-full w-full overflow-hidden rounded-[2.85rem] bg-background">
                {/* Dynamic Island */}
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 top-2 z-20 h-[22px] w-[88px] -translate-x-1/2 rounded-pill bg-ink"
                />

                {/* In-screen UI flow (no interaction card here anymore) */}
                <AppUILoop searchText={searchText} resultFor={resultFor} stack={stack} />
              </div>
            </div>

            {/* Soft halo behind the floating interaction card — appears with it */}
            <AnimatePresence>
              {showInteraction && (
                <motion.div
                  key="halo"
                  aria-hidden="true"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transitions.ambient}
                  className="pointer-events-none absolute rounded-3xl bg-accent/15 blur-2xl"
                  style={{
                    bottom: "10%",
                    left: "0",
                    right: "-22px",
                    height: "44%",
                  }}
                />
              )}
            </AnimatePresence>

            {/* Floating interaction card — overhangs right bezel by 12px.
                The signature "important info emerging" moment. */}
            <AnimatePresence>
              {showInteraction && (
                <motion.div
                  key="interaction"
                  initial={{ y: 24, opacity: 0, scale: 0.96 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 16, opacity: 0 }}
                  transition={transitions.spring}
                  className="absolute z-10 rounded-2xl border border-border bg-surface p-3.5 shadow-xl"
                  role="presentation"
                  style={{ bottom: "16%", left: "8px", right: "-12px" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-subtle">
                        Interaction detected
                      </p>
                      <p className="mt-1 text-[13px] font-medium leading-tight text-ink">
                        Magnesium <span className="text-muted">+</span> Levothyroxine
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-severity-monitor/10 px-2 py-0.5">
                      <span className="block h-1 w-1 rounded-full bg-severity-monitor" />
                      <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.06em] text-severity-monitor">
                        Monitor
                      </span>
                    </span>
                  </div>

                  <p className="mt-2.5 text-[11.5px] leading-snug text-muted">
                    Magnesium may reduce levothyroxine absorption when taken too closely
                    together.
                  </p>

                  <div className="mt-3 border-t border-border-strong/60 pt-2">
                    <p className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-subtle">
                      Recommendation
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-snug text-ink">
                      Separate by at least 4 hours.
                    </p>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-subtle">
                      Evidence
                    </span>
                    <span className="text-[10.5px] font-medium text-muted">Moderate</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating fit-tag — slightly bigger, springs up like the
                interaction card so the two feel like one motion family */}
            <AnimatePresence>
              {showFitTag && (
                <motion.div
                  key="fit"
                  initial={{ y: 22, opacity: 0, scale: 0.96 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 18, opacity: 0 }}
                  transition={transitions.spring}
                  className="absolute z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/90 px-3.5 py-2 shadow-md backdrop-blur-sm"
                  style={{ bottom: "5%", left: "14px", right: "14px" }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-severity-safe/15"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1.5 4L3.3 5.8L6.5 2.2"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-severity-safe"
                        />
                      </svg>
                    </span>
                    <span className="text-[11.5px] font-medium leading-tight text-ink">
                      Good fit with timing adjustment
                    </span>
                  </span>
                  <span className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-subtle">
                    For You
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
