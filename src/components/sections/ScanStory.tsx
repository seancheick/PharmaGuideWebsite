"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HERO_STORIES } from "@/components/hero/stories";
import { useVisibleIllustrationMotion } from "@/components/features/use-visible-illustration-motion";
import { ADE_ER_VISITS } from "@/lib/claims";
import { DEMO_PRODUCTS, SAMPLE_PRODUCT_LABEL } from "@/lib/demo-products";
import { LEAD_REVIEWER, displayName } from "@/lib/people";
import { QUALITY_PILLARS, qualityBand } from "@/lib/quality-score";
import { cn } from "@/lib/utils";
import { BottleStage, type BottleHandle } from "./scan/BottleStage";

/**
 * Scan story — "One scan. Three answers."
 *
 * Replaced the Problem and How It Works sections on 2026-11-13. Those two
 * spent two screens explaining before anything was shown; this is one
 * compact stage: a bottle turns, its label is scanned, and three light
 * paths carry the result to the three questions the app answers —
 *   1  Quality     the bottle on its own
 *   2  Your stack  the bottle against everything else you take
 *   3  You         the same bottle for a particular person
 *
 * Nothing clinical is written here. The product is the sample in
 * lib/demo-products.ts; the stack, the finding and its wording are hero
 * story 1 (components/hero/stories.ts), which is the calcium + levothyroxine
 * card already published on the ladder. The Problem section's three lines
 * survive as captions, and its CDC figure as one sourced line.
 *
 * The server markup is the finished state. The timeline (GSAP, loaded only
 * when the section nears the viewport and motion is allowed) rewinds that
 * state and plays it forward once; reduced-motion, no-JS and crawler
 * visitors simply keep what was rendered.
 */

const PRODUCT = DEMO_PRODUCTS.calcium;
const BAND = qualityBand(PRODUCT.score);
const STORY = HERO_STORIES[0]!;
const FINDING = STORY.finding;
const MED = STORY.stack[0]!;

// The six parts of the quality score, named as the app names them.
const PILLARS = QUALITY_PILLARS.map((p) => p.name);

const ANSWERS = [
  { num: "01", tab: "Quality", question: "Is the product any good?" },
  { num: "02", tab: "Your stack", question: "What does it do with my other bottles?" },
  { num: "03", tab: "You", question: "Is it right for me?" },
] as const;

function Check() {
  return (
    <svg width="9" height="9" viewBox="0 0 8 8" fill="none" aria-hidden="true">
      <path d="M1.5 4L3.3 5.8L6.5 2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ScanStory() {
  const { ref: stageRef, active, reduced } = useVisibleIllustrationMotion();
  const bottleRef = useRef<BottleHandle>(null);
  const originRef = useRef<HTMLSpanElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const timeline = useRef<{ play: () => void; pause: () => void } | null>(null);
  // Once the story has played, the page is left alone until Replay.
  const finished = useRef(false);

  const [tab, setTab] = useState(0);
  const [withMed, setWithMed] = useState(true);
  const [paths, setPaths] = useState<string[]>([]);
  const [near, setNear] = useState(false);
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "done">("idle");
  const [run, setRun] = useState(0);
  const [built, setBuilt] = useState(0);

  // Light paths run from the bottle's label to each answer row. They are
  // measured, not hard-coded, so they stay attached at every desktop width.
  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => {
      const box = svg.getBoundingClientRect();
      const origin = originRef.current?.getBoundingClientRect();
      if (!box.width || !origin) return setPaths([]);
      const x0 = origin.left - box.left;
      const y0 = origin.top - box.top;
      setPaths(
        rowRefs.current.map((row) => {
          if (!row) return "";
          const r = row.getBoundingClientRect();
          const x1 = r.left - box.left;
          const y1 = r.top - box.top + r.height / 2;
          const bend = (x1 - x0) * 0.55;
          return `M${x0.toFixed(1)} ${y0.toFixed(1)}C${(x0 + bend).toFixed(1)} ${y0.toFixed(1)} ${(x1 - bend).toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
        })
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svg);
    rowRefs.current.forEach((row) => row && observer.observe(row));
    return () => observer.disconnect();
  }, []);

  // Arm one viewport early so the sprite sheet and GSAP are ready, and the
  // rewind to the opening state happens off-screen.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setNear(true), {
      rootMargin: "100% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [stageRef]);

  useEffect(() => {
    if (!near) return;
    bottleRef.current?.load().catch(() => {});
  }, [near]);

  const hasPaths = paths.length > 0;
  useEffect(() => {
    const scope = stageRef.current;
    const bottle = bottleRef.current;
    if (!near || reduced !== false || !scope || !bottle || finished.current) return;
    let cancelled = false;
    let revert = () => {};

    Promise.all([
      import("gsap"),
      import("gsap/DrawSVGPlugin"),
      import("gsap/MotionPathPlugin"),
      bottle.load().catch(() => {}),
    ]).then(([{ gsap }, { DrawSVGPlugin }, { MotionPathPlugin }]) => {
      if (cancelled) return;
      gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);
      // Below the desktop breakpoint there are no light paths to target.
      gsap.config({ nullTargetWarn: false });
      const ctx = gsap.context(() => {
        const q = gsap.utils.selector(scope);
        const counter = { v: 0 };
        const scoreEl = q("[data-s=score]")[0];
        const soft = "[data-s=finding],[data-s=verdict],[data-s=label]";
        const all = `[data-s=row],[data-s=bar],[data-s=pillar],[data-s=item],[data-s=beam],[data-s=dot],${soft}`;

        const rewind = () => {
          bottle.state.rot = 1;
          bottle.state.scan = -1;
          bottle.draw();
          counter.v = 0;
          if (scoreEl) scoreEl.textContent = "0";
          gsap.set(q("[data-s=row]"), { opacity: 0.42 });
          gsap.set(q("[data-s=bar]"), { scaleX: 0 });
          gsap.set(q("[data-s=pillar],[data-s=item]"), { opacity: 0.3 });
          gsap.set(q(soft), { autoAlpha: 0, y: 6 });
          gsap.set(q("[data-s=beam]"), { drawSVG: "0% 0%" });
          gsap.set(q("[data-s=dot]"), { autoAlpha: 0 });
        };

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "power2.out" },
          onComplete: () => {
            // Hand the finished state back to React and CSS.
            gsap.set(q(all), { clearProps: "all" });
            if (scoreEl) scoreEl.textContent = String(PRODUCT.score);
            finished.current = true;
            setStatus("done");
          },
        });

        const beam = (i: number, at: number) => {
          const path = q("[data-s=beam]")[i] as SVGPathElement | undefined;
          const dot = q("[data-s=dot]")[i];
          const row = q("[data-s=row]")[i];
          tl.call(() => setTab(i), [], at);
          if (row) tl.to(row, { opacity: 1, duration: 0.4 }, at + (path ? 0.3 : 0));
          if (!path || !dot) return;
          tl.to(path, { drawSVG: "0% 100%", duration: 0.55, ease: "power2.inOut" }, at);
          tl.set(dot, { autoAlpha: 1 }, at);
          tl.to(dot, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 0.55, ease: "power2.inOut" }, at);
          tl.to(dot, { autoAlpha: 0, duration: 0.25 }, at + 0.55);
        };

        // 1 — one turn, settling label-forward
        tl.to(bottle.state, { rot: 0, duration: 1.4, ease: "power3.out", onUpdate: bottle.draw }, 0);
        // 2 — scan the label
        tl.fromTo(bottle.state, { scan: 0 }, { scan: 1, duration: 0.75, ease: "power1.inOut", onUpdate: bottle.draw }, 1.25);
        tl.call(() => { bottle.state.scan = -1; bottle.draw(); }, [], 2.02);
        tl.to(q("[data-s=label]"), { autoAlpha: 1, y: 0, duration: 0.4 }, 1.9);
        // 3 — quality
        beam(0, 2.15);
        tl.to(counter, {
          v: PRODUCT.score,
          duration: 0.9,
          onUpdate: () => { if (scoreEl) scoreEl.textContent = String(Math.round(counter.v)); },
        }, 2.5);
        tl.to(q("[data-s=bar]"), { scaleX: 1, duration: 0.9 }, 2.5);
        tl.to(q("[data-s=pillar]"), { opacity: 1, duration: 0.3, stagger: 0.07 }, 2.6);
        // 4 — stack
        beam(1, 3.3);
        tl.to(q("[data-s=item]"), { opacity: 1, duration: 0.3, stagger: 0.16 }, 3.75);
        tl.to(q("[data-s=finding]"), { autoAlpha: 1, y: 0, duration: 0.45 }, 4.2);
        // 5 — you
        beam(2, 4.55);
        tl.to(q("[data-s=verdict]"), { autoAlpha: 1, y: 0, duration: 0.45 }, 5.0);

        rewind();
        timeline.current = {
          play: () => { if (tl.progress() < 1) { tl.play(); setStatus("playing"); } },
          pause: () => { tl.pause(); },
        };
      }, scope);
      revert = () => ctx.revert();
      setStatus("idle");
      setBuilt((n) => n + 1);
    });

    return () => {
      cancelled = true;
      timeline.current = null;
      revert();
    };
    // Rebuilt when the light paths appear or go (crossing the desktop
    // breakpoint) and on Replay, so it targets what is on the page now.
  }, [near, reduced, hasPaths, run, stageRef]);

  // Play once in view; hold while off-screen or in a background tab.
  useEffect(() => {
    if (!timeline.current) return;
    if (active && status === "idle") timeline.current.play();
    else if (!active && status === "playing") timeline.current.pause();
    else if (active && status === "playing") timeline.current.play();
  }, [active, status, built]);

  const stack = withMed ? STORY.stack : STORY.stack.slice(1);

  return (
    <section
      id="how-it-works"
      aria-labelledby="scan-heading"
      className="relative border-y border-border bg-surface-raised/50 py-10"
    >
      <noscript>
        <style>{`.scan-row{display:block!important}.scan-tabs{display:none!important}`}</style>
      </noscript>
      <div className="container mx-auto">
        <div
          ref={stageRef}
          className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-5 lg:grid-cols-[minmax(0,0.9fr)_220px_minmax(0,1.45fr)] lg:gap-x-12"
        >
          {/* Copy */}
          <div>
            <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
              How it works
            </p>
            <h2 id="scan-heading" className="mt-3 text-balance text-display-sm text-ink lg:mt-4">
              One scan. <span className="font-serif italic text-accent">Three answers.</span>
            </h2>
            <p className="mt-3 max-w-[34ch] text-body leading-relaxed text-muted lg:mt-4">
              A label tells you what&apos;s in the bottle. PharmaGuide checks what it can&apos;t.
            </p>
          </div>

          {/* Bottle */}
          <div className="relative">
            <BottleStage ref={bottleRef} label={`Sample supplement bottle: ${PRODUCT.name}`} />
            {/* Where the light paths start: the label's right edge. */}
            <span ref={originRef} aria-hidden="true" className="absolute left-[calc(50%+86px)] top-[56%] hidden lg:block" />
            <p
              data-s="label"
              className="mt-2 hidden text-center font-mono text-overline font-medium uppercase tracking-[0.12em] text-subtle lg:block"
            >
              Label read · 2 ingredients
            </p>
            {reduced === false && status !== "idle" && (
              <div className="mt-2 flex justify-center gap-3 font-mono text-overline font-medium uppercase tracking-[0.12em]">
                {status !== "done" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (status === "paused") { setStatus("playing"); }
                      else { timeline.current?.pause(); setStatus("paused"); }
                    }}
                    className="text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {status === "paused" ? "Play" : "Pause"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    finished.current = false;
                    setRun((n) => n + 1);
                  }}
                  className="text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Replay
                </button>
              </div>
            )}
          </div>

          {/* Light paths — desktop only, decorative */}
          <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block">
            {paths.map((d, i) => (
              <g key={i}>
                <path d={d} fill="none" className="stroke-border-strong" strokeWidth="1" strokeDasharray="2 4" />
                <path data-s="beam" d={d} fill="none" className="stroke-accent/70" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            ))}
            {paths.map((_, i) => (
              <circle key={i} data-s="dot" r="3.5" className="invisible fill-accent" />
            ))}
          </svg>

          {/* Answers */}
          <div className="col-span-2 lg:col-span-1">
            <div className="scan-tabs mb-3 flex gap-1.5 lg:hidden" role="group" aria-label="Answers">
              {ANSWERS.map((a, i) => (
                <button
                  key={a.num}
                  type="button"
                  aria-pressed={tab === i}
                  onClick={() => setTab(i)}
                  className={cn(
                    "rounded-pill border px-3.5 py-1.5 font-mono text-overline font-medium uppercase tracking-[0.1em] transition-colors duration-fast ease-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    tab === i ? "border-accent bg-accent text-white" : "border-border bg-surface text-muted"
                  )}
                >
                  {a.tab}
                </button>
              ))}
            </div>

            <ol className="flex flex-col gap-2.5">
              {ANSWERS.map((a, i) => (
                <li
                  key={a.num}
                  ref={(el) => { rowRefs.current[i] = el; }}
                  data-s="row"
                  className={cn(
                    "scan-row min-h-[168px] rounded-xl border border-border bg-surface px-5 py-3.5 shadow-xs lg:block lg:min-h-0",
                    tab === i ? "block" : "hidden"
                  )}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-mono text-overline font-medium uppercase tracking-[0.14em] text-accent">
                      {a.num} · {a.tab}
                    </p>
                    <p className="text-right font-serif text-[15px] italic leading-snug text-muted">{a.question}</p>
                  </div>

                  {i === 0 && (
                    <div className="mt-2.5">
                      <div className="flex items-center gap-4">
                        <p
                          role="img"
                          aria-label={`Illustrative quality score ${PRODUCT.score} out of 100, ${BAND.label}`}
                          className={`font-serif text-[40px] italic leading-none tabular-nums ${BAND.textClass}`}
                        >
                          <span data-s="score">{PRODUCT.score}</span>
                        </p>
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-ink">
                            <span className="font-medium">{BAND.label}</span>
                            <span className="text-subtle"> · {SAMPLE_PRODUCT_LABEL}, illustrative score</span>
                          </p>
                          <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-border">
                            {/* Width on the wrapper: the timeline clears every
                                inline style on [data-s] when it finishes. */}
                            <div className="h-full" style={{ width: `${PRODUCT.score}%` }}>
                              <div data-s="bar" className={cn("h-full origin-left rounded-full", BAND.barClass)} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-overline uppercase tracking-[0.08em] text-muted">
                        {PILLARS.map((p) => (
                          <li key={p} data-s="pillar" className="inline-flex items-center gap-1.5">
                            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {i === 1 && (
                    <div className="mt-2.5">
                      <ul className="flex flex-wrap gap-1.5">
                        {stack.map((item) => {
                          const hit = withMed && item.id === MED.id;
                          return (
                            <li
                              key={item.id}
                              data-s="item"
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[12px] leading-none",
                                hit
                                  ? "border-severity-caution/40 bg-severity-caution/10 text-severity-caution"
                                  : "border-border bg-surface-subtle/60 text-ink"
                              )}
                            >
                              {hit ? (
                                <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-severity-caution" />
                              ) : (
                                <span className="text-severity-safe"><Check /></span>
                              )}
                              {item.name}
                              {hit ? (
                                <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] opacity-80">
                                  {FINDING.eyebrow}
                                </span>
                              ) : (
                                <span className="sr-only">checked</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      {withMed && FINDING.kind === "timing" ? (
                        <p data-s="finding" className="mt-2.5 text-body-sm leading-snug text-ink">
                          <span className="font-medium">{FINDING.title}:</span> {FINDING.action.toLowerCase()}.{" "}
                          <span className="text-subtle">{FINDING.evidence} · FDA-labeled.</span>{" "}
                          <span className="text-muted">Sometimes it&apos;s not the ingredient. It&apos;s the timing.</span>
                        </p>
                      ) : (
                        <p data-s="finding" className="mt-2.5 text-body-sm leading-snug text-ink">
                          No known concerns between these {stack.length + 1} products.
                        </p>
                      )}
                      <p className="mt-2 text-[12px] leading-snug text-subtle">
                        Most products are checked one at a time. That&apos;s not how people take them.
                      </p>
                    </div>
                  )}

                  {i === 2 && (
                    <div className="mt-2.5">
                      <fieldset className="inline-flex rounded-pill border border-border bg-surface-subtle/60 p-0.5">
                        <legend className="sr-only">Sample profile</legend>
                        {[true, false].map((value) => (
                          <label
                            key={String(value)}
                            className={cn(
                              "cursor-pointer rounded-pill px-3 py-1.5 text-[12px] leading-none transition-colors duration-fast ease-smooth has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                              withMed === value ? "bg-accent text-white" : "text-muted hover:text-ink"
                            )}
                          >
                            <input
                              type="radio"
                              name="scan-profile"
                              className="sr-only"
                              checked={withMed === value}
                              onChange={() => setWithMed(value)}
                            />
                            {value ? `Takes ${MED.name.toLowerCase()}` : "No medications"}
                          </label>
                        ))}
                      </fieldset>
                      <p data-s="verdict" aria-live="polite" className="mt-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="font-serif text-[19px] italic leading-none text-severity-safe">
                          {withMed ? STORY.chip.text : "No known concerns for this profile"}
                        </span>
                        <span className="text-[12px] text-subtle">
                          {withMed
                            ? `Profile: ${MED.name.toLowerCase()}, no conditions entered.`
                            : "Profile: no medications or conditions entered."}{" "}
                          Same bottle, same score; a different person gets a different answer.
                        </span>
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Trust line + the Problem section's statistic, kept to one row */}
        <div className="mt-6 grid gap-3 border-t border-border/70 pt-4 text-[12.5px] leading-relaxed text-muted lg:grid-cols-2 lg:gap-12">
          <p>
            <span className="text-ink">Googling “X with Y” usually gives you three different answers.</span>{" "}
            Here, every finding shows its evidence and its source. Reviewed by {displayName(LEAD_REVIEWER)}.{" "}
            <Link
              href="/methodology"
              className="whitespace-nowrap font-medium text-link underline decoration-link/60 underline-offset-[3px] hover:text-link-strong"
            >
              Read the methodology →
            </Link>
          </p>
          <p>
            <span className="font-medium tabular-nums text-ink">{ADE_ER_VISITS.display}</span> ER visits a day
            from adverse drug events, most of them from prescription medicines; supplements are a smaller,
            separate estimate. Not all interactions require emergency care.{" "}
            <a
              href={ADE_ER_VISITS.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap font-medium text-link underline decoration-link/60 underline-offset-[3px] hover:text-link-strong"
            >
              Source: CDC ↗
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
