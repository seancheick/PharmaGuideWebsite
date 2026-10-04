"use client";

import { AnimatePresence, m } from "framer-motion";
import { transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import type { HeroStory, StackItem } from "./stories";

/**
 * In-screen UI of the hero phone — purely presentational. PhoneMockup owns
 * the timeline and passes the current frame in.
 *
 * Motion rules (what makes it read as one continuous object, iOS-style):
 *   • The search result and the stack row it becomes share a `layoutId`,
 *     so the card physically glides into the stack instead of one thing
 *     disappearing and another appearing.
 *   • Rows are a fixed 30px with a 6px gap, so the connector bracket that
 *     links related rows can be drawn without measuring the DOM.
 *   • Only transform and opacity animate (plus SVG pathLength).
 */

export const CHECKS = ["Ingredients", "Medications", "Timing", "Daily dose"] as const;

const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

const ROW_H = 30;
const ROW_GAP = 6;
const rowCenter = (i: number) => i * (ROW_H + ROW_GAP) + ROW_H / 2;

export type ScreenFrame = {
  search: string;
  /** Caret holds solid while typing and blinks at rest, as on iOS. */
  typing: boolean;
  showResult: boolean;
  /** The result card is being tapped (press + touch ripple). */
  pressed: boolean;
  stack: StackItem[];
  /** -1 = checking row hidden; 0…CHECKS.length = ticks lit. */
  checks: number;
  showStatus: boolean;
  linked: boolean;
};

export function AppUILoop({ story, frame }: { story: HeroStory; frame: ScreenFrame }) {
  const sharedId = `hero-${story.id}-${story.added.id}`;
  const linkedIdx = frame.stack
    .map((item, i) => (story.linked.includes(item.id) ? i : -1))
    .filter((i) => i >= 0);
  const showBracket = frame.linked && linkedIdx.length >= 2;
  const scanning = frame.checks >= 0 && frame.checks < CHECKS.length && !frame.showStatus;
  const stackHeight = frame.stack.length * (ROW_H + ROW_GAP);
  const bracketTop = showBracket ? rowCenter(linkedIdx[0]!) : 0;
  const bracketHeight = showBracket ? rowCenter(linkedIdx[linkedIdx.length - 1]!) - bracketTop : 0;

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, rgb(var(--color-surface)) 0%, rgb(var(--color-background)) 55%, rgb(var(--color-surface-subtle)) 100%)",
      }}
    >
      <StatusBar />

      {/* App header */}
      <div className="flex items-start gap-3 px-5 pb-2 pt-3">
        <span className="mt-[3px] text-ink/70">
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
            <span className="block h-[5px] w-[5px] rounded-full bg-accent" />
            <span className="text-[11px] font-medium tracking-[-0.005em] text-ink">
              PharmaGuide
            </span>
          </span>
          <span className="mt-0.5 font-mono text-[8.5px] font-medium uppercase tracking-[0.1em] text-subtle">
            My stack
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 transition-[border-color,background-color,box-shadow] duration-fast ease-smooth",
            frame.search.length > 0
              ? "border-border-strong bg-surface shadow-xs"
              : "border-border bg-surface-subtle"
          )}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 14 14"
            fill="none"
            className="shrink-0 text-subtle"
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M9.5 9.5L12 12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="flex min-w-0 flex-1 items-center text-[12.5px]">
            {frame.search.length > 0 ? (
              <span className="truncate text-ink">{frame.search}</span>
            ) : (
              <span className="text-subtle">Search supplements or medications</span>
            )}
            {frame.search.length > 0 && (
              <span
                className={cn(
                  "ml-[1px] inline-block h-[12px] w-[1.5px] shrink-0 bg-ink",
                  !frame.typing && "animate-cursor-blink"
                )}
              />
            )}
          </span>
        </div>

        {/* Search result — shares its layoutId with the stack row it becomes */}
        {frame.showResult && (
          <m.div
            layoutId={sharedId}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: frame.pressed ? 0.965 : 1 }}
            transition={frame.pressed ? { duration: 0.12, ease: EASE } : transitions.tactile}
            className="relative mt-2 overflow-hidden rounded-xl border border-border bg-surface px-3 py-2.5 shadow-md"
          >
            {/* Touch ripple — where the finger lands */}
            {frame.pressed && (
              <m.span
                className="pointer-events-none absolute right-10 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-accent/15"
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              />
            )}
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[12.5px] font-medium text-ink">{story.added.name}</p>
              <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">
                {story.added.dose}
              </span>
            </div>
            {story.added.quality ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-[8.5px] font-medium uppercase tracking-[0.1em] text-subtle">
                  Quality
                </span>
                <span className="relative h-[4px] flex-1 overflow-hidden rounded-full bg-border">
                  <m.span
                    className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-accent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: story.added.quality.score / 100 }}
                    transition={{ ...transitions.reveal, delay: 0.15 }}
                  />
                </span>
                <span className="text-[11px] font-medium tabular-nums text-ink">
                  {story.added.quality.score}
                </span>
                <span className="text-[10px] text-muted">{story.added.quality.label}</span>
              </div>
            ) : null}
            {story.added.quality?.badge ? (
              <m.span
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.55 }}
                className="mt-1.5 inline-flex items-center gap-1 rounded-pill bg-severity-safe/10 px-1.5 py-0.5 font-mono text-[8px] font-medium uppercase tracking-[0.08em] text-severity-safe"
              >
                <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M1.5 4L3.3 5.8L6.5 2.2"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {story.added.quality.badge}
              </m.span>
            ) : story.added.quality ? null : (
              <p className="mt-0.5 text-[10.5px] text-muted">Found in catalog</p>
            )}
          </m.div>
        )}
      </div>

      {/* Stack */}
      <div className="px-4 pt-3">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-subtle">
          Your stack ·{" "}
          <span className="relative inline-flex h-[1.2em] w-[0.7em] overflow-hidden align-bottom tabular-nums">
            <AnimatePresence initial={false} mode="popLayout">
              <m.span
                key={frame.stack.length}
                className="inline-block"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                {frame.stack.length}
              </m.span>
            </AnimatePresence>
          </span>
        </p>
        <div className="relative mt-1.5 pl-3">
          {/* Connector bracket — draws between the rows a finding links */}
          {showBracket && (
            <svg
              key={`${story.id}-bracket`}
              className="absolute left-0 overflow-visible text-severity-caution"
              style={{ top: bracketTop, height: bracketHeight, width: 8 }}
              width="8"
              height={bracketHeight}
              viewBox={`0 0 8 ${bracketHeight}`}
              fill="none"
            >
              <m.path
                d={`M7 0 H2.5 Q1 0 1 1.5 V${bracketHeight - 1.5} Q1 ${bracketHeight} 2.5 ${bracketHeight} H7`}
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.55, ease: EASE }}
              />
            </svg>
          )}
          <div className="relative flex flex-col" style={{ gap: ROW_GAP }}>
            {/* Scan sweep — one soft band of light down the stack while it's checked */}
            {scanning && (
              <span className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-lg">
                <m.span
                  key={`${story.id}-sweep`}
                  className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-accent/[0.13] to-transparent"
                  initial={{ y: -48 }}
                  animate={{ y: stackHeight + 8 }}
                  transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
                />
              </span>
            )}
            {frame.stack.map((item) => {
              const isAdded = item.id === story.added.id;
              const isLinked = frame.linked && story.linked.includes(item.id);
              return (
                <m.div
                  key={`${story.id}-${item.id}`}
                  layoutId={isAdded ? sharedId : undefined}
                  layout
                  transition={transitions.tactile}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg border bg-surface px-2.5 shadow-sm transition-[border-color,background-color] duration-slow ease-smooth",
                    isLinked
                      ? "border-severity-caution/45 bg-severity-caution/[0.05]"
                      : "border-border"
                  )}
                  style={{ height: ROW_H }}
                >
                  {/* One pulse when the finding links this row */}
                  {isLinked && (
                    <m.span
                      className="pointer-events-none absolute -inset-px rounded-lg border border-severity-caution"
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.06 }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
                    />
                  )}
                  <span
                    className={cn(
                      "block h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-slow ease-smooth",
                      isLinked ? "bg-severity-caution" : "bg-accent"
                    )}
                  />
                  <span className="flex-1 truncate text-[11.5px] text-ink">{item.name}</span>
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-subtle">
                    {item.dose}
                  </span>
                </m.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Checking → stack status. One line, resolves in place. */}
      <div className="px-4 pt-3">
        <AnimatePresence mode="wait" initial={false}>
          {frame.showStatus ? (
            <m.div
              key="status"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="flex items-center justify-between rounded-lg border border-severity-caution/25 bg-severity-caution/[0.06] px-3 py-2"
            >
              <span className="text-[11px] font-medium text-ink">{story.status}</span>
              <span className="flex items-center gap-1">
                <span className="block h-1 w-1 rounded-full bg-severity-caution" />
                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.06em] text-severity-caution">
                  {story.finding.severity}
                </span>
              </span>
            </m.div>
          ) : frame.checks >= 0 ? (
            <m.div
              key="checking"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="rounded-lg border border-border bg-surface/70 px-3 py-2"
            >
              <p className="text-[10.5px] font-medium text-ink">
                Checking <span className="tabular-nums">{frame.stack.length}</span> items
              </p>
              <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
                {CHECKS.map((label, i) => {
                  const done = i < frame.checks;
                  return (
                    <span
                      key={label}
                      className={cn(
                        "flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.08em] transition-colors duration-fast",
                        done ? "text-accent" : "text-subtle/60"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-2.5 w-2.5 items-center justify-center rounded-full transition-[background-color,transform] duration-fast",
                          done ? "scale-100 bg-accent/15" : "scale-90 bg-border"
                        )}
                      >
                        {done && (
                          <svg width="6" height="6" viewBox="0 0 8 8" fill="none">
                            <path
                              d="M1.5 4L3.3 5.8L6.5 2.2"
                              stroke="currentColor"
                              strokeWidth="1.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {label}
                    </span>
                  );
                })}
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex-1" />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-end justify-between px-6 pb-1 pt-2 leading-none">
      <span className="font-sans text-[10px] font-semibold tabular-nums text-ink">9:41</span>
      <div className="flex items-end gap-[3px] text-ink">
        <span className="flex items-end gap-[1.5px]">
          {[3, 4.5, 6, 7.5].map((h) => (
            <span
              key={h}
              className="block w-[2px] rounded-[0.5px] bg-current"
              style={{ height: `${h}px` }}
            />
          ))}
        </span>
        <svg width="18" height="9" viewBox="0 0 18 9" className="ml-1">
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
  );
}
