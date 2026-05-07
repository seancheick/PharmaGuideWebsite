"use client";

import { AnimatePresence, motion } from "framer-motion";
import { transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";

/**
 * App UI loop — purely presentational. State and timing live in PhoneMockup.
 *
 * Renders the in-screen UI flow:
 *   - Status bar (9:41 + signal + battery)
 *   - App header (back chevron + brand wordmark + screen title)
 *   - Search bar with typewritten text + blinking cursor
 *   - Search result card (slides in)
 *   - Stack section (items animate in via spring + layout)
 *
 * The interaction card and personalization chip live OUTSIDE the screen
 * (in PhoneMockup) so they can overhang the phone bezel.
 */

export type StackItem = { id: string; name: string; dose: string };
export type ItemKey = "magnesium" | "levothyroxine";

export const ITEMS: Record<ItemKey, StackItem> = {
  magnesium: { id: "mag", name: "Magnesium Glycinate", dose: "200 mg" },
  levothyroxine: { id: "levo", name: "Levothyroxine", dose: "50 mcg" },
};

type Props = {
  searchText: string;
  resultFor: ItemKey | null;
  stack: StackItem[];
};

export function AppUILoop({ searchText, resultFor, stack }: Props) {
  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, rgb(255 255 255) 0%, rgb(250 249 246) 55%, rgb(244 242 238) 100%)",
      }}
    >
      {/* Status bar */}
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
              : "border-border bg-surface-subtle"
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
                      className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 shadow-sm"
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

      {/* Spacer — fills the bottom area where the floating interaction card
          will visually sit, but lives outside this screen container */}
      <div className="flex-1" />
    </div>
  );
}
