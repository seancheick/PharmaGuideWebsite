"use client";

import {
  AnimatePresence,
  animate,
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { transitions } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import { AppUILoop, CHECKS, type ScreenFrame } from "./AppUILoop";
import { HERO_STORIES, HERO_STORIES_SUMMARY, type Finding, type HeroStory } from "./stories";

/**
 * PhoneMockup — device frame, floating result sheet, and the timeline that
 * plays the hero stories (./stories.ts) in turn.
 *
 * Each story: start from an existing stack → type a search with a human
 * rhythm → the result (with its real quality score) glides into the stack →
 * "Checking N items" ticks through → the related rows light up and a
 * bracket connects them → the stack status resolves → the result sheet
 * rises with the action as its largest line → hold → soft exit → the next
 * story cross-fades in.
 *
 * The loop only runs while the phone is on screen and the tab is visible —
 * no timers burning CPU behind a scrolled-away hero or a background tab.
 * Reduced motion shows story 1's finished state, still.
 */

const EMPTY: ScreenFrame = {
  search: "",
  typing: false,
  showResult: false,
  pressed: false,
  stack: [],
  checks: -1,
  showStatus: false,
  linked: false,
};

function finalFrame(story: HeroStory): ScreenFrame {
  return {
    ...EMPTY,
    stack: [...story.stack, story.added],
    checks: CHECKS.length,
    showStatus: true,
    linked: true,
  };
}

// Small irregularities read as a person typing; a fixed interval reads as
// a ticker. Deterministic so every loop types the same way.
const TYPE_RHYTHM = [0, 24, -10, 38, 6, 58, -12, 18, 30, -6];
const typeDelay = (i: number, ch: string) =>
  ch === " " ? 230 : 52 + TYPE_RHYTHM[i % TYPE_RHYTHM.length]!;

export function PhoneMockup() {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });

  const [storyIdx, setStoryIdx] = useState(0);
  const [frame, setFrame] = useState<ScreenFrame>({ ...EMPTY, stack: HERO_STORIES[0]!.stack });
  const [showCard, setShowCard] = useState(false);
  const [showChip, setShowChip] = useState(false);
  // One screen layer: faded out, swapped to the next story while invisible,
  // faded back in. (An AnimatePresence cross-fade kept the outgoing screen
  // mounted because it holds shared-layout elements.)
  const [screenVisible, setScreenVisible] = useState(true);

  // Read by the loop between steps; a ref so pausing never restarts it.
  const activeRef = useRef(false);
  useEffect(() => {
    const update = () => {
      activeRef.current = inView && document.visibilityState === "visible";
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, [inView]);

  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    // Waits `ms`, then holds while the phone is off screen or the tab is hidden.
    const wait = async (ms: number) => {
      await sleep(ms);
      while (!activeRef.current && !cancelled) await sleep(300);
    };
    const patch = (p: Partial<ScreenFrame>) => setFrame((f) => ({ ...f, ...p }));

    async function play(story: HeroStory) {
      setShowCard(false);
      setShowChip(false);
      setFrame({ ...EMPTY, stack: story.stack });
      await wait(900);

      for (let i = 1; i <= story.search.length; i++) {
        if (cancelled) return;
        patch({ search: story.search.slice(0, i), typing: true });
        await wait(typeDelay(i, story.search[i - 1]!));
      }
      patch({ typing: false });
      await wait(200);
      patch({ showResult: true });
      await wait(1250);
      if (cancelled) return;

      // Tap, then the result glides into the stack (shared layoutId).
      patch({ pressed: true });
      await wait(170);
      patch({
        pressed: false,
        showResult: false,
        search: "",
        stack: [...story.stack, story.added],
      });
      await wait(720);

      patch({ checks: 0 });
      for (let i = 1; i <= CHECKS.length; i++) {
        await wait(170);
        if (cancelled) return;
        patch({ checks: i });
      }
      await wait(260);
      patch({ linked: true });
      await wait(420);
      patch({ showStatus: true });
      await wait(480);
      if (cancelled) return;

      setShowCard(true);
      await wait(1150);
      setShowChip(true);
      await wait(3000);
      if (cancelled) return;

      // Soft exit: chip, then sheet, then the screen fades before the next story.
      setShowChip(false);
      await wait(140);
      setShowCard(false);
      await wait(380);
      setScreenVisible(false);
      await wait(460);
    }

    async function run() {
      let i = 0;
      while (!cancelled) {
        setStoryIdx(i);
        setScreenVisible(true);
        await play(HERO_STORIES[i]!);
        i = (i + 1) % HERO_STORIES.length;
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [reducedMotion]);

  // Pointer tilt (desktop, fine pointers only) — a few degrees, sprung, so
  // the device feels like an object in the room rather than a picture.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 140, damping: 18, mass: 0.6 });
  const rotateY = useSpring(tiltY, { stiffness: 140, damping: 18, mass: 0.6 });
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltY.set(px * 10);
    tiltX.set(-py * 8);
  };
  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  // Reduced motion: story 1's finished state, derived — no timeline runs.
  const story = HERO_STORIES[reducedMotion ? 0 : storyIdx]!;
  const screen = reducedMotion ? finalFrame(story) : frame;
  const cardVisible = reducedMotion || showCard;
  const chipVisible = reducedMotion || showChip;
  const floating = !reducedMotion && inView;

  return (
    <div
      ref={rootRef}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      className="relative flex justify-center md:justify-end"
    >
      <p className="sr-only">{HERO_STORIES_SUMMARY}</p>

      {/* Ambient radial glow — anchors the device into the page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          inset: "-12% -10%",
          background:
            "radial-gradient(50% 55% at 55% 50%, rgb(var(--color-accent) / 0.09), transparent 70%)",
        }}
      />

      <div aria-hidden="true" className="relative md:translate-y-[-8px] md:rotate-[2.5deg]">
        {/* Gentle float — stops when the phone is off screen */}
        <m.div style={{ rotateX, rotateY, transformPerspective: 1100 }}>
          <m.div
            animate={floating ? { y: [-4, 4, -4] } : { y: 0 }}
            transition={
              floating
                ? { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
                : { duration: 0.4 }
            }
            className="relative w-[300px] sm:w-[320px] md:w-[340px] lg:w-[360px]"
          >
            <div className="relative aspect-[9/18]">
              <div className="relative h-full w-full rounded-[3rem] bg-ink p-[3px] shadow-2xl">
                <div className="pointer-events-none absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/10 via-white/0 to-white/0" />
                <div className="pointer-events-none absolute inset-[3px] rounded-[2.85rem] ring-1 ring-inset ring-white/5" />

                <div className="relative h-full w-full overflow-hidden rounded-[2.85rem] bg-background">
                  <div className="absolute left-1/2 top-2 z-20 h-[22px] w-[88px] -translate-x-1/2 rounded-pill bg-ink" />

                  {/* Screen fades between stories (swapped while invisible) */}
                  {/* Recedes slightly while the sheet is up, like an iOS sheet */}
                  <m.div
                    className="absolute inset-0 origin-top"
                    initial={false}
                    animate={{
                      opacity: reducedMotion || screenVisible ? 1 : 0,
                      scale: cardVisible ? 0.975 : 1,
                    }}
                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <AppUILoop story={story} frame={screen} />
                    <m.div
                      className="pointer-events-none absolute inset-0 bg-black"
                      initial={false}
                      animate={{ opacity: cardVisible ? 0.035 : 0 }}
                      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    />
                  </m.div>
                </div>
              </div>

              {/* Halo behind the result sheet */}
              <AnimatePresence>
                {cardVisible && (
                  <m.div
                    key={`halo-${story.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transitions.ambient}
                    className={cn(
                      "pointer-events-none absolute rounded-3xl blur-2xl",
                      story.chip.tone === "caution" ? "bg-severity-caution/15" : "bg-accent/15"
                    )}
                    style={{ bottom: "8%", left: 0, right: "-22px", height: "42%" }}
                  />
                )}
              </AnimatePresence>

              {/* Result sheet — overhangs the bezel; the action is its largest line */}
              <AnimatePresence>
                {cardVisible && (
                  <m.div
                    key={`card-${story.id}`}
                    initial={{ y: 28, opacity: 0, scale: 0.96 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{
                      y: 14,
                      opacity: 0,
                      scale: 0.98,
                      transition: { duration: 0.32, ease: [0.65, 0, 0.35, 1] },
                    }}
                    transition={transitions.tactile}
                    className="absolute z-10 rounded-2xl border border-border bg-surface p-3.5 shadow-xl"
                    style={{ bottom: "14%", left: "8px", right: "-12px" }}
                  >
                    <FindingSheet finding={story.finding} />
                  </m.div>
                )}
              </AnimatePresence>

              {/* Fit / stack chip */}
              <AnimatePresence>
                {chipVisible && (
                  <m.div
                    key={`chip-${story.id}`}
                    initial={{ y: 20, opacity: 0, scale: 0.96 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 10, opacity: 0, transition: { duration: 0.24 } }}
                    transition={transitions.tactile}
                    className="absolute z-10 flex items-center justify-between gap-3 rounded-xl border border-border bg-surface/90 px-3.5 py-2 shadow-md backdrop-blur-sm"
                    style={{ bottom: "4.5%", left: "14px", right: "14px" }}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          story.chip.tone === "safe"
                            ? "bg-severity-safe/15 text-severity-safe"
                            : "bg-severity-caution/15 text-severity-caution"
                        )}
                      >
                        {story.chip.tone === "safe" ? (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path
                              d="M1.5 4L3.3 5.8L6.5 2.2"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path
                              d="M4 1.6V4.6M4 6.2V6.4"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </span>
                      {/* Wraps instead of truncating: on a 375px phone the
                          story-2 line lost its punchline ("…they don't"). */}
                      <span className="text-pretty text-[11.5px] font-medium leading-tight text-ink">
                        {story.chip.text}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-subtle">
                      {story.chip.tag}
                    </span>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </m.div>
        </m.div>
      </div>
    </div>
  );
}

function SeverityPill({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-severity-caution/10 px-2 py-0.5">
      <span className="block h-1 w-1 rounded-full bg-severity-caution" />
      <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.06em] text-severity-caution">
        {label}
      </span>
    </span>
  );
}

const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.42,
    ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
    delay,
  },
});

function FindingSheet({ finding }: { finding: Finding }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-subtle">
            {finding.eyebrow}
          </p>
          <p className="mt-1 text-[13px] font-medium leading-tight text-ink">{finding.title}</p>
        </div>
        <SeverityPill label={finding.severity} />
      </div>
      {finding.kind === "timing" ? (
        <TimingBody finding={finding} />
      ) : (
        <TotalBody finding={finding} />
      )}
    </>
  );
}

function TimingBody({ finding }: { finding: Extract<Finding, { kind: "timing" }> }) {
  const { first, gap, second } = finding.timeline;
  return (
    <>
      <m.p {...reveal(0.1)} className="mt-1.5 text-[11px] leading-snug text-muted">
        {finding.body}
      </m.p>
      <m.p
        {...reveal(0.22)}
        className="mt-2.5 text-[15px] font-medium leading-tight tracking-[-0.01em] text-ink"
      >
        {finding.action}
      </m.p>

      {/* Illustrates the minimum gap from the record — not a dosing schedule */}
      <m.div {...reveal(0.36)} className="mt-2.5 flex items-center gap-2">
        <TimeStop time={first.time} name={first.name} />
        <span className="relative flex flex-1 items-center justify-center">
          <m.span
            className="absolute inset-x-0 top-1/2 h-px origin-left bg-accent/35"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.5 }}
          />
          <span className="relative rounded-pill border border-border bg-surface px-1.5 py-px font-mono text-[8.5px] font-medium uppercase tracking-[0.06em] text-accent">
            {gap}
          </span>
        </span>
        <TimeStop time={second.time} name={second.name} align="end" />
      </m.div>

      <m.div
        {...reveal(0.5)}
        className="mt-2.5 flex items-center justify-between border-t border-border pt-2"
      >
        <span className="font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-subtle">
          Evidence
        </span>
        <span className="text-[10.5px] font-medium text-muted">{finding.evidence}</span>
      </m.div>
    </>
  );
}

function TimeStop({
  time,
  name,
  align = "start",
}: {
  time: string;
  name: string;
  align?: "start" | "end";
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 flex-col leading-tight",
        align === "end" ? "items-end" : "items-start"
      )}
    >
      <span className="text-[11px] font-medium tabular-nums text-ink">{time}</span>
      <span className="text-[9.5px] text-muted">{name}</span>
    </span>
  );
}

function TotalBody({ finding }: { finding: Extract<Finding, { kind: "total" }> }) {
  const count = useMotionValue(0);
  const shown = useTransform(count, (v) => Math.round(v / 50) * 50);
  const text = useTransform(shown, (v) => v.toLocaleString("en-US"));
  useEffect(() => {
    const controls = animate(count, finding.total, {
      duration: 0.9,
      ease: [0.32, 0.72, 0, 1],
      delay: 0.15,
    });
    return () => controls.stop();
  }, [count, finding.total]);

  const limitPct = (finding.limit / finding.total) * 100;
  const overPct = Math.round((finding.total / finding.limit) * 100);

  return (
    <>
      <m.div {...reveal(0.08)} className="mt-2 flex items-baseline gap-1.5">
        <m.span className="text-[22px] font-medium tabular-nums leading-none tracking-[-0.02em] text-ink">
          {text}
        </m.span>
        <span className="text-[11px] text-muted">
          {finding.unit} / day · {overPct}% of limit
        </span>
      </m.div>

      {/* Meter — full width is the stack total; the tick is the upper limit */}
      <m.div {...reveal(0.18)} className="mt-2.5">
        <div className="relative h-[6px] overflow-hidden rounded-full bg-border">
          <m.span
            className="absolute inset-0 origin-left rounded-full"
            style={{
              background: `linear-gradient(90deg, rgb(var(--color-accent)) 0%, rgb(var(--color-accent)) ${limitPct}%, rgb(var(--color-severity-caution)) ${limitPct}%, rgb(var(--color-severity-caution)) 100%)`,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1], delay: 0.15 }}
          />
          <span
            className="absolute inset-y-[-2px] w-px bg-ink/70"
            style={{ left: `${limitPct}%` }}
          />
        </div>
        <div className="relative mt-1 h-3">
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.06em] text-subtle"
            style={{ left: `${limitPct}%` }}
          >
            {finding.limitSource} · {finding.limit.toLocaleString("en-US")} {finding.unit}
          </span>
        </div>
      </m.div>

      <m.div
        {...reveal(0.36)}
        className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1 border-t border-border pt-2"
      >
        {finding.sources.map((s) => (
          <span key={s.name} className="text-[10px] text-muted">
            {s.name}{" "}
            <span className="font-medium tabular-nums text-ink">
              {s.amount.toLocaleString("en-US")}
            </span>
          </span>
        ))}
      </m.div>
    </>
  );
}
