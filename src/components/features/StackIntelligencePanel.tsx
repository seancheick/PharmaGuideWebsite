"use client";

import Image from "next/image";
import { AnimatePresence, animate, m, useInView, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Finding } from "@/components/hero/stories";
import { ease } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import {
  DEMO_DURATION,
  DEMO_PHASE_STARTS,
  STACK_SCENARIOS,
  demoPhaseAt,
  scenarioItems,
  type DemoPhase,
} from "./stack-demo";
import styles from "./StackIntelligencePanel.module.css";

function subscribeVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
}

const pageIsVisible = () => document.visibilityState === "visible";
const serverIsVisible = () => false;
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(notify: () => void) {
  const preference = window.matchMedia(reducedMotionQuery);
  preference.addEventListener("change", notify);
  return () => preference.removeEventListener("change", notify);
}
const prefersReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;
const serverMotionPreference = () => null;
const PHASE_LABELS = ["Your stack", "Cross-check", "What matters"];

function PanelIcon({
  kind,
}: {
  kind: "pause" | "play" | "replay" | "link" | "lock" | "pill" | "check";
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "pause" && <path d="M9 5v14M15 5v14" />}
      {kind === "play" && <path d="m8 5 11 7-11 7Z" />}
      {kind === "replay" && (
        <>
          <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />
        </>
      )}
      {kind === "link" && (
        <>
          <path
            d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"
            transform="translate(1 0) scale(.9)"
          />
        </>
      )}
      {kind === "lock" && (
        <>
          <rect x="5" y="10" width="14" height="11" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </>
      )}
      {kind === "pill" && (
        <>
          <rect x="4" y="7" width="16" height="10" rx="5" transform="rotate(-40 12 12)" />
          <path d="m9 8 6 8" />
        </>
      )}
      {kind === "check" && <path d="m5 12 4 4 10-10" />}
    </svg>
  );
}

function FindingDetail({
  finding,
  reveal,
  reduced,
}: {
  finding: Finding;
  reveal: boolean;
  reduced: boolean;
}) {
  return (
    <m.div
      className={styles.findingBody}
      initial={false}
      animate={{ opacity: reveal ? 1 : 0, y: reveal || reduced ? 0 : 9 }}
      transition={{ duration: reduced ? 0 : 0.65, ease: ease.emphasized }}
    >
      <div className={styles.findingEyebrow}>
        <span className={styles.warningDot} />
        {finding.severity}
      </div>
      <h4 className={styles.findingTitle}>{finding.title}</h4>
      {finding.kind === "timing" ? (
        <>
          <p className={styles.explanation}>{finding.body}</p>
          <div className={styles.timingDiagram}>
            <div>
              <span className={styles.timeDot} />
              <strong>{finding.timeline.first.time}</strong>
              <small>{finding.timeline.first.name}</small>
            </div>
            <div className={styles.timeGap}>
              <span />
              <strong>{finding.timeline.gap}</strong>
              <span />
            </div>
            <div>
              <span className={styles.timeDot} />
              <strong>{finding.timeline.second.time}</strong>
              <small>{finding.timeline.second.name}</small>
            </div>
          </div>
          <p className={styles.action}>
            <PanelIcon kind="link" />
            {finding.action}
          </p>
          <div className={styles.evidence}>
            <span>Evidence</span>
            <strong>{finding.evidence}</strong>
          </div>
        </>
      ) : (
        <>
          <div className={styles.total}>
            <strong>{finding.total.toLocaleString("en-US")}</strong>
            <span>{finding.unit} / day</span>
          </div>
          <div className={styles.doseChart}>
            <m.div
              className={styles.doseFill}
              initial={false}
              animate={{ scaleX: reveal ? 1 : 0 }}
              transition={{
                duration: reduced ? 0 : 1.1,
                delay: reduced ? 0 : 0.25,
                ease: ease.emphasized,
              }}
            >
              {finding.sources.map((source, index) => (
                <span
                  key={source.name}
                  className={styles[`doseSegment${index}`]}
                  style={{ flexGrow: source.amount }}
                />
              ))}
            </m.div>
            <span
              className={styles.limitMarker}
              style={{ left: `${(finding.limit / finding.total) * 100}%` }}
            />
          </div>
          <div className={styles.chartCaption}>
            <span>0</span>
            <span>
              {finding.limit.toLocaleString("en-US")} {finding.unit} adult UL
            </span>
          </div>
          <div className={styles.doseSources}>
            {finding.sources.map((source, index) => (
              <div key={source.name}>
                <span className={cn(styles.sourceDot, styles[`doseSegment${index}`])} />
                <span>{source.name}</span>
                <strong>{source.amount.toLocaleString("en-US")}</strong>
              </div>
            ))}
          </div>
          <p className={styles.action}>One nutrient. Three sources.</p>
        </>
      )}
    </m.div>
  );
}

export function StackIntelligencePanel() {
  const root = useRef<HTMLElement>(null);
  const elapsed = useRef(0);
  const generation = useRef(0);
  const inView = useInView(root, { amount: 0.3 });
  const visible = useSyncExternalStore(subscribeVisibility, pageIsVisible, serverIsVisible);
  const reducedMotion = useSyncExternalStore<boolean | null>(
    subscribeReducedMotion,
    prefersReducedMotion,
    serverMotionPreference
  );
  const [paused, setPaused] = useState(false);
  const [playback, setPlayback] = useState<{ scene: number; phase: DemoPhase; generation: number }>(
    { scene: 0, phase: 0, generation: 0 }
  );
  const progress = useMotionValue(0);
  const playing = inView && visible && !paused && reducedMotion === false;
  const phase = reducedMotion ? 2 : playback.phase;
  const story = STACK_SCENARIOS[playback.scene] ?? STACK_SCENARIOS[0]!;
  const items = scenarioItems(story);

  useEffect(() => {
    if (!playing) return;
    const started = performance.now();
    const from = elapsed.current;
    const currentGeneration = generation.current;
    let completed = false;
    const animation = animate(progress, 1, {
      duration: (DEMO_DURATION - from) / 1000,
      ease: "linear",
    });
    const timers = DEMO_PHASE_STARTS.flatMap((boundary) =>
      boundary > from
        ? [
            window.setTimeout(
              () => setPlayback((current) => ({ ...current, phase: demoPhaseAt(boundary) })),
              boundary - from
            ),
          ]
        : []
    );
    timers.push(
      window.setTimeout(() => {
        completed = true;
        elapsed.current = 0;
        progress.set(0);
        generation.current += 1;
        setPlayback((current) => ({
          scene: (current.scene + 1) % STACK_SCENARIOS.length,
          phase: 0,
          generation: generation.current,
        }));
      }, DEMO_DURATION - from)
    );
    return () => {
      animation.stop();
      timers.forEach(window.clearTimeout);
      if (!completed && generation.current === currentGeneration)
        elapsed.current = Math.min(DEMO_DURATION, from + performance.now() - started);
    };
  }, [playing, playback.scene, playback.generation, progress]);

  function selectScene(scene: number) {
    generation.current += 1;
    elapsed.current = paused || reducedMotion ? DEMO_DURATION : 0;
    progress.set(paused || reducedMotion ? 1 : 0);
    setPlayback({ scene, phase: paused || reducedMotion ? 2 : 0, generation: generation.current });
  }

  function replay() {
    generation.current += 1;
    elapsed.current = 0;
    progress.set(0);
    setPlayback((current) => ({ ...current, phase: 0, generation: generation.current }));
    setPaused(false);
  }

  return (
    <figure
      ref={root}
      className={styles.panel}
      aria-label="Animated example of checking a supplement and medication stack"
    >
      <div className={styles.chrome}>
        <div className={styles.brand}>
          <Image src="/brand/logo-icon.png" alt="" width={24} height={24} />
          <span>PharmaGuide</span>
        </div>
        <span className={styles.previewLabel}>App preview</span>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.panelLabel}>
          <span className={styles.stackMark}>
            <i />
            <i />
            <i />
          </span>
          Stack intelligence
        </div>
        <span className={styles.localBadge}>
          <PanelIcon kind="lock" />
          On-device
        </span>
      </div>
      <div className={styles.phaseRail} aria-hidden="true">
        {PHASE_LABELS.map((label, index) => (
          <div key={label} className={cn(styles.phase, phase >= index && styles.phaseActive)}>
            <span>{phase > index ? <PanelIcon kind="check" /> : `0${index + 1}`}</span>
            {label}
          </div>
        ))}
      </div>
      <div className={styles.screen} aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={story.id}
            className={styles.workspace}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reducedMotion ? 0 : -4 }}
            transition={{ duration: reducedMotion ? 0 : 0.38, ease: ease.emphasized }}
          >
            <div className={styles.stackColumn}>
              <div className={styles.columnHeading}>
                <span>Your stack</span>
                <span>{items.length} items</span>
              </div>
              <div className={styles.itemList}>
                <m.span
                  className={styles.connectionRail}
                  initial={false}
                  animate={{ opacity: phase >= 1 ? 1 : 0, scaleY: phase >= 1 ? 1 : 0.6 }}
                  transition={{ duration: reducedMotion ? 0 : 0.85, ease: ease.emphasized }}
                />
                {phase === 1 && playing && (
                  <m.div
                    className={styles.scanLine}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: [0, 0.8, 0.8, 0] }}
                    transition={{ duration: 2.8, ease: "linear" }}
                  />
                )}
                {items.map((item, index) => {
                  const linked = story.linked.includes(item.id);
                  const highlighted = linked && phase >= 1;
                  return (
                    <m.div
                      key={item.id}
                      className={cn(styles.item, highlighted && styles.itemLinked)}
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.6,
                        delay: reducedMotion ? 0 : index * 0.09,
                      }}
                    >
                      <span
                        className={cn(styles.itemIcon, item.id === "levo" && styles.medicationIcon)}
                      >
                        {item.id === "levo" ? "Rx" : <PanelIcon kind="pill" />}
                      </span>
                      <div className={styles.itemText}>
                        <strong>{item.name}</strong>
                        <small>{item.dose}</small>
                      </div>
                      <m.span
                        className={styles.connectionDot}
                        animate={{ scale: highlighted ? 1 : 0.55, opacity: highlighted ? 1 : 0.18 }}
                        transition={{ duration: reducedMotion ? 0 : 0.5 }}
                      />
                      {linked && (
                        <m.span
                          className={styles.connectionArm}
                          initial={false}
                          animate={{ opacity: highlighted ? 1 : 0, scaleX: highlighted ? 1 : 0 }}
                          transition={{
                            duration: reducedMotion ? 0 : 0.65,
                            delay: reducedMotion ? 0 : index * 0.12,
                          }}
                        />
                      )}
                    </m.div>
                  );
                })}
              </div>
              <div className={styles.stackNote}>
                <PanelIcon kind="link" />
                <span>
                  {phase === 0
                    ? "Ready to connect the dots"
                    : phase === 1
                      ? "Checking across products"
                      : `${story.linked.length} connected items`}
                </span>
              </div>
            </div>
            <div className={styles.findingColumn}>
              <div className={styles.columnHeading}>
                <span>{phase === 2 ? "What matters" : "Stack analysis"}</span>
                <span className={styles.analysisIndicator} data-active={playing && phase === 1} />
              </div>
              <div className={styles.findingCard}>
                <AnimatePresence initial={false}>
                  {phase < 2 && (
                    <m.div
                      key="checking"
                      className={styles.checking}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.3 }}
                    >
                      <div className={styles.scanGlyph} data-running={playing}>
                        <span />
                        <span />
                        <span />
                      </div>
                      <p>
                        {phase === 0
                          ? "The full picture starts here."
                          : "Not one bottle at a time."}
                      </p>
                      <small>
                        {phase === 0
                          ? "Your entered products, together."
                          : "Linking the relevant ingredients."}
                      </small>
                    </m.div>
                  )}
                </AnimatePresence>
                <FindingDetail
                  finding={story.finding}
                  reveal={phase === 2}
                  reduced={!!reducedMotion}
                />
              </div>
            </div>
          </m.div>
        </AnimatePresence>
      </div>
      <div className={styles.resultStrip} aria-hidden="true">
        <span className={cn(styles.resultDot, phase === 2 && styles.resultReady)} />
        <span>
          {phase === 0
            ? "One view of everything you entered"
            : phase === 1
              ? "Making the connections"
              : story.status}
        </span>
        <span className={styles.resultTag}>{phase === 2 ? "With context" : "Example check"}</span>
      </div>
      <div className={styles.playbackBar}>
        <div className={styles.scenarioButtons} role="group" aria-label="Example scenario">
          {STACK_SCENARIOS.map((scenario, index) => (
            <button
              key={scenario.id}
              type="button"
              aria-pressed={playback.scene === index}
              onClick={() => selectScene(index)}
            >
              {index === 0 ? "Timing" : "Dose overlap"}
            </button>
          ))}
        </div>
        <div className={styles.controls}>
          {reducedMotion ? (
            <span className={styles.reducedLabel}>Reduced motion</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPaused((current) => !current)}
                aria-label={paused ? "Play stack animation" : "Pause stack animation"}
              >
                <PanelIcon kind={paused ? "play" : "pause"} />
              </button>
              <button type="button" onClick={replay} aria-label="Replay stack animation">
                <PanelIcon kind="replay" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className={styles.progressTrack} aria-hidden="true">
        <m.div style={{ scaleX: reducedMotion ? 1 : progress }} />
      </div>
      <figcaption className={styles.caption}>
        Illustrative example, not a personal check.
        <span className="sr-only">
          {" "}
          {story.finding.title}.{" "}
          {story.finding.kind === "timing"
            ? `${story.finding.body} ${story.finding.action}. Evidence: ${story.finding.evidence}.`
            : `${story.finding.total} ${story.finding.unit} per day in this example, compared with an adult upper limit of ${story.finding.limit} ${story.finding.unit}.`}
        </span>
      </figcaption>
    </figure>
  );
}
