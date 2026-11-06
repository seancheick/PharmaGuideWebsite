"use client";

import { useEffect, useId } from "react";
import { animate, m, useMotionValue, useTransform } from "framer-motion";
import { nutrientFrame, type NutrientMeter } from "./nutrient-demo";
import { useVisibleIllustrationMotion } from "./use-visible-illustration-motion";
import styles from "./FeatureMotionDetails.module.css";

export function DepletionTrend() {
  const { ref, active, reduced } = useVisibleIllustrationMotion();
  const gradient = useId();
  const curve = "M18 21 C65 20 81 24 116 35 S181 44 219 56 S281 72 342 80";
  return (
    <div ref={ref} className={styles.trend} data-running={active} data-reduced={reduced}>
      <div className={styles.trendHeading}>
        <span>Possible B12 trend</span>
        <span>Over time</span>
      </div>
      <svg
        className={styles.trendGraph}
        viewBox="0 0 360 100"
        preserveAspectRatio="none"
        role="img"
        aria-label="Illustration of possible lower B12 levels with longer-term metformin use, not individual laboratory data"
      >
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5e8270" />
            <stop offset="100%" stopColor="#a18d54" />
          </linearGradient>
        </defs>
        <path className={styles.trendGuides} d="M18 22H342M18 51H342M18 80H342" />
        <path d={`${curve} L342 96H18Z`} fill={`url(#${gradient})`} opacity="0.055" />
        <path className={styles.trendTrace} d={curve} />
        <path className={styles.trendLine} d={curve} pathLength="1" stroke={`url(#${gradient})`} />
        <circle className={styles.trendStart} cx="18" cy="21" r="3" />
        <circle className={styles.trendEnd} cx="342" cy="80" r="3.5" />
      </svg>
      <p className={styles.trendCaption}>Illustrative pattern, not a measured result.</p>
    </div>
  );
}

export function AnimatedNutrientMeter({ meter, index }: { meter: NutrientMeter; index: number }) {
  const { ref, active, reduced } = useVisibleIllustrationMotion();
  const progress = useMotionValue(0);
  const amount = useTransform(progress, (value) =>
    nutrientFrame(meter, value).amount.toLocaleString("en-US")
  );
  const fill = useTransform(progress, (value) => nutrientFrame(meter, value).fill);
  const color = useTransform(progress, (value) =>
    nutrientFrame(meter, value).aboveLimit
      ? "rgb(var(--color-severity-avoid))"
      : "rgb(var(--color-severity-safe))"
  );
  const markerColor = useTransform(progress, (value) =>
    nutrientFrame(meter, value).aboveLimit
      ? "rgb(var(--color-severity-avoid))"
      : "rgb(var(--color-muted))"
  );
  const excess = useTransform(progress, (value) =>
    nutrientFrame(meter, value).aboveLimit ? 1 : 0
  );

  useEffect(() => {
    if (reduced) {
      progress.set(1);
      return;
    }
    if (!active || progress.get() >= 1) return;
    const controls = animate(progress, 1, {
      duration: (1 - progress.get()) * 2.8,
      delay: progress.get() === 0 ? index * 0.13 : 0,
      ease: "linear",
    });
    return () => controls.stop();
  }, [active, index, progress, reduced]);

  return (
    <li
      aria-label={`${meter.name}: illustrative total ${meter.val} ${meter.unit}; upper limit ${meter.ul} ${meter.unit}${meter.val > meter.ul ? ", above limit" : ""}`}
    >
      <div ref={ref} className={styles.meter}>
        <div className={styles.meterHeading} aria-hidden="true">
          <span className={styles.meterName}>{meter.name}</span>
          <m.span className={styles.meterValue} style={{ color }}>
            <m.span>{reduced ? meter.val.toLocaleString("en-US") : amount}</m.span>
            <span className={styles.valueSeparator}> / </span>
            <m.span style={{ color: markerColor }}>{meter.ul.toLocaleString("en-US")}</m.span>
            <span className={styles.meterUnit}> {meter.unit}</span>
          </m.span>
        </div>
        <div className={styles.meterTrack} aria-hidden="true">
          <m.span className={styles.meterFill} style={{ scaleX: fill, backgroundColor: color }} />
          <m.span className={styles.excessBand} style={{ opacity: excess }} />
          <m.span className={styles.limitMarker} style={{ backgroundColor: markerColor }}>
            <m.span style={{ color: markerColor }}>UL</m.span>
          </m.span>
        </div>
      </div>
    </li>
  );
}
