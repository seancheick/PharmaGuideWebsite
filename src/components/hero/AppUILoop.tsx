"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * App UI loop — the centerpiece of the hero.
 *
 * 7-second narrative cycle (refined for "glance + half-watch + scroll"):
 *
 *   t=0.0   reset, empty search
 *   t=0.4   typewriter "magnesium" begins (60ms/char)
 *   t=1.0   magnesium result card slides in
 *   t=1.4   joins stack, search clears
 *   t=2.0   typewriter "levothyroxine" begins (50ms/char)
 *   t=2.7   levothyroxine result card slides in
 *   t=3.1   joins stack
 *   t=3.7   interaction card springs up from bottom
 *   t=4.7   "Good fit with timing adjustment" chip appears (personalization)
 *   t=7.0   loop restarts cleanly
 *
 * Respects `prefers-reduced-motion`: snapshot of the final state, no timers.
 *
 * Depth philosophy:
 *   - Screen background = warm-to-subtle gradient (top → bottom)
 *   - Each surface card has its own shadow ladder (xs → sm → md → lg)
 *   - Interaction card has a soft accent halo behind it
 *   - "Good fit" chip floats below the card with its own depth signature
 */

type StackItem = { id: string; name: string; dose: string };

const ITEMS = {
  magnesium: { id: "mag", name: "Magnesium Glycinate", dose: "200 mg" },
  levothyroxine: { id: "levo", name: "Levothyroxine", dose: "50 mcg" },
} as const;

export function AppUILoop() {
  const reducedMotion = useReducedMotion();
  const [searchText, setSearchText] = useState("");
  const [resultFor, setResultFor] = useState<keyof typeof ITEMS | null>(null);
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

        // Type "magnesium" — 9 chars × 60ms ≈ 540ms
        await typewriter("magnesium", 60);
        if (cancelled) return;
        await wait(120);
        setResultFor("magnesium");
        await wait(420);
        if (cancelled) return;

        // Add to stack, clear
        setStack([ITEMS.magnesium]);
        setResultFor(null);
        setSearchText("");
        await wait(280);
        if (cancelled) return;

        // Type "levothyroxine" — 13 chars × 50ms ≈ 650ms
        await typewriter("levothyroxine", 50);
        if (cancelled) return;
        await wait(120);
        setResultFor("levothyroxine");
        await wait(420);
        if (cancelled) return;

        // Add second
        setStack([ITEMS.magnesium, ITEMS.levothyroxine]);
        setResultFor(null);
        setSearchText("");
        await wait(550);
        if (cancelled) return;

        // Reveal interaction
        setShowInteraction(true);
        await wait(1000);
        if (cancelled) return;

        // Personalization moment — appears 1s after the card
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
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        // Subtle warm-to-cool gradient — gives the screen physical depth.
        // Pure white at top → background warm → subtle cool at bottom where
        // the interaction card sits, helping it pop.
        background:
          "linear-gradient(180deg, rgb(255 255 255) 0%, rgb(250 249 246) 55%, rgb(244 242 238) 100%)",
      }}
    >
      {/* Status bar — bottom-aligned signal bars + battery */}
      <div className="flex items-end justify-between px-6 pt-2 pb-1 leading-none">
        <span className="font-sans text-[10px] font-semibold tabular-nums text-ink">
          9:41
        </span>
        <div className="flex items-end gap-[3px] text-ink">
          {/* Signal — 4 rectangular bars, ascending, bottom-aligned */}
          <span className="flex items-end gap-[1.5px]">
            <span className="block w-[2px] rounded-[0.5px] bg-current" style={{ height: "3px" }} />
            <span className="block w-[2px] rounded-[0.5px] bg-current" style={{ height: "4.5px" }} />
            <span className="block w-[2px] rounded-[0.5px] bg-current" style={{ height: "6px" }} />
            <span className="block w-[2px] rounded-[0.5px] bg-current" style={{ height: "7.5px" }} />
          </span>
          {/* Battery */}
          <svg width="18" height="9" viewBox="0 0 18 9" aria-hidden="true" className="ml-1">
            <rect
              x="0.5"
              y="0.5"
              width="14"
              height="8"
              rx="1.8"
              stroke="currentColor"
              strokeWidth="0.8"
              fill="none"
            />
            <rect x="2" y="2" width="11" height="5" rx="0.5" fill="currentColor" />
            <rect x="15.2" y="3" width="1.5" height="3" rx="0.6" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Brand wordmark + screen title */}
      <div className="flex items-start gap-3 px-5 pb-2 pt-3">
        {/* Back chevron */}
        <span className="mt-[3px] text-ink/70" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 11L4.5 7L9 3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="flex flex-col leading-tight">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="block h-[5px] w-[5px] rounded-full bg-accent" />
            <span className="text-[11px] font-medium tracking-[-0.005em] text-ink">
              PharmaGuide
            </span>
          </span>
          <span className="mt-0.5 font-mono text-[8.5px] font-medium uppercase tracking-[0.1em] text-subtle">
            Add to stack
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 transition-[border-color,background-color,box-shadow] duration-fast ease-smooth",
            searchText.length > 0
              ? "border-border-strong bg-surface shadow-xs"
              : "border-border bg-surface-subtle/70"
          )}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" className="text-subtle" />
            <path
              d="M9.5 9.5L12 12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="text-subtle"
            />
          </svg>
          <span className="flex min-w-0 flex-1 items-center text-[12.5px]">
            {searchText.length > 0 ? (
              <span className="text-ink">{searchText}</span>
            ) : (
              <span className="text-subtle">Search supplements or medications</span>
            )}
            {searchText.length > 0 && (
              <span
                aria-hidden="true"
                className="ml-[1px] inline-block h-[12px] w-[1.5px] animate-cursor-blink bg-ink"
              />
            )}
          </span>
        </div>
      </div>

      {/* Search result card */}
      <div className="px-4">
        <AnimatePresence>
          {resultFor && (
            <motion.div
              key={resultFor}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ ...transitions.reveal, duration: 0.28 }}
              className="mt-2 rounded-lg border border-border bg-surface px-3 py-2 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[12.5px] font-medium text-ink">
                  {ITEMS[resultFor].name}
                </p>
                <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">
                  {ITEMS[resultFor].dose}
                </span>
              </div>
              <p className="mt-0.5 text-[10.5px] text-muted">Tap to add to your stack</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stack section */}
      <div className="px-4 pt-3">
        <AnimatePresence>
          {stack.length > 0 && (
            <motion.div
              key="stack"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitions.hover}
            >
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-subtle">
                Your stack · {stack.length}
              </p>
              <div className="mt-1.5 space-y-1.5">
                <AnimatePresence>
                  {stack.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={transitions.spring}
                      className="flex items-center gap-2 rounded-md border border-border/70 bg-surface px-2.5 py-1.5 shadow-xs"
                    >
                      <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="flex-1 truncate text-[11.5px] text-ink">
                        {item.name}
                      </span>
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-subtle">
                        {item.dose}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer pushes interaction card toward the bottom */}
      <div className="flex-1 min-h-[8px]" />

      {/* Interaction card — sits in a stacking context with its own halo */}
      <div className="relative px-3 pb-3">
        {/* Soft accent halo behind the interaction card — only visible while card is shown */}
        <AnimatePresence>
          {showInteraction && (
            <motion.div
              key="halo"
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transitions.ambient}
              className="pointer-events-none absolute inset-x-2 -top-3 bottom-0 rounded-3xl bg-accent/10 blur-2xl"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showInteraction && (
            <motion.div
              key="interaction"
              initial={{ y: "110%", opacity: 0.4, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "110%", opacity: 0 }}
              transition={transitions.spring}
              className="relative rounded-2xl border border-border bg-surface p-3.5 shadow-lg"
              role="presentation"
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
                Magnesium may reduce levothyroxine absorption when taken too closely together.
              </p>

              <div className="mt-3 border-t border-border pt-2">
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

        {/* Personalization chip — appears 1s after interaction card,
            visually distinct (smaller, more subtle, separate plane) */}
        <AnimatePresence>
          {showFitTag && (
            <motion.div
              key="fit"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ ...transitions.reveal, duration: 0.36 }}
              className="relative mt-2 flex items-center justify-between rounded-xl border border-border/70 bg-surface/80 px-3 py-1.5 shadow-xs backdrop-blur-sm"
            >
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="flex h-3 w-3 items-center justify-center rounded-full bg-severity-safe/15"
                >
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                    <path
                      d="M1 3L2.5 4.5L5 1.5"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-severity-safe"
                    />
                  </svg>
                </span>
                <span className="text-[10.5px] font-medium text-ink">
                  Good fit for you with timing adjustment
                </span>
              </span>
              <span className="font-mono text-[8.5px] font-medium uppercase tracking-[0.1em] text-subtle">
                For You
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
