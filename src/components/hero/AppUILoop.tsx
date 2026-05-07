"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * App UI loop — the centerpiece of the hero.
 *
 * Tells a 9-second story, then loops seamlessly:
 *
 *   t=0.0   reset state, empty search
 *   t=0.9   typewriter "magnesium"
 *   t=2.1   result card slides in
 *   t=2.8   item joins stack, search clears
 *   t=3.6   typewriter "levothyroxine"
 *   t=4.5   second result card slides in
 *   t=5.2   second item joins stack
 *   t=6.0   interaction card springs up from bottom
 *   t=9.0   loop restarts
 *
 * Respects `prefers-reduced-motion`: skips animation, shows the final state
 * with both stack items + interaction card.
 *
 * All timings, easing, and severity styling come from design tokens.
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

  useEffect(() => {
    // Reduced-motion: snapshot of the final state. No timers, no churn.
    if (reducedMotion) {
      setSearchText("");
      setResultFor(null);
      setStack([ITEMS.magnesium, ITEMS.levothyroxine]);
      setShowInteraction(true);
      return;
    }

    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        // we rely on `cancelled` flag rather than clearTimeout for simplicity;
        // unmounted setStates are safely no-ops in modern React strict mode.
        void t;
      });

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
        await wait(900);
        if (cancelled) return;

        // Type "magnesium"
        await typewriter("magnesium", 75);
        if (cancelled) return;
        await wait(220);
        setResultFor("magnesium");
        await wait(750);
        if (cancelled) return;

        // Add to stack, clear search
        setStack([ITEMS.magnesium]);
        setResultFor(null);
        setSearchText("");
        await wait(450);
        if (cancelled) return;

        // Type "levothyroxine"
        await typewriter("levothyroxine", 60);
        if (cancelled) return;
        await wait(220);
        setResultFor("levothyroxine");
        await wait(750);
        if (cancelled) return;

        // Add second
        setStack([ITEMS.magnesium, ITEMS.levothyroxine]);
        setResultFor(null);
        setSearchText("");
        await wait(700);
        if (cancelled) return;

        // Reveal interaction
        setShowInteraction(true);
        await wait(2800);
      }
    }

    void runLoop();
    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-2 pb-1">
        <span className="font-mono text-[10px] font-medium tabular-nums text-ink">9:41</span>
        <div className="flex items-center gap-1 text-ink">
          {/* signal dots */}
          <span className="flex gap-[2px]">
            <span className="block h-[3px] w-[3px] rounded-full bg-current" />
            <span className="block h-[4px] w-[3px] rounded-full bg-current" />
            <span className="block h-[5px] w-[3px] rounded-full bg-current" />
            <span className="block h-[6px] w-[3px] rounded-full bg-current" />
          </span>
          {/* battery */}
          <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true">
            <rect x="0.5" y="0.5" width="13" height="7" rx="1.5" stroke="currentColor" fill="none" />
            <rect x="2" y="2" width="9" height="4" fill="currentColor" />
            <rect x="14" y="3" width="1.5" height="2" rx="0.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* App header */}
      <div className="flex items-center gap-3 px-5 pb-3 pt-3">
        <span className="text-ink" aria-hidden="true">
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
        <span className="text-[13px] font-medium text-ink">Add to stack</span>
      </div>

      {/* Search bar */}
      <div className="px-4">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border border-border bg-surface-subtle px-3 py-2 transition-colors duration-fast ease-smooth",
            searchText.length > 0 && "border-border-strong bg-surface"
          )}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="shrink-0">
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
              transition={{ ...transitions.reveal, duration: 0.32 }}
              className="mt-2 rounded-lg border border-border bg-surface px-3 py-2 shadow-xs"
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
                      className="flex items-center gap-2 rounded-md border border-border/60 bg-surface px-2.5 py-1.5"
                    >
                      <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span className="flex-1 truncate text-[11.5px] text-ink">{item.name}</span>
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

      {/* Spacer pushes the interaction card to bottom */}
      <div className="flex-1 min-h-[8px]" />

      {/* Interaction card — slides up like a sheet */}
      <AnimatePresence>
        {showInteraction && (
          <motion.div
            key="interaction"
            initial={{ y: "110%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "110%", opacity: 0 }}
            transition={transitions.spring}
            className="mx-3 mb-3 rounded-2xl border border-border bg-surface p-3.5 shadow-lg"
            role="presentation"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-subtle">
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
              May reduce absorption when taken together.
            </p>

            <div className="mt-3 border-t border-border pt-2">
              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-subtle">
                Recommendation
              </p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink">
                Separate doses by at least 4 hours.
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
    </div>
  );
}
