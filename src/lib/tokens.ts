/**
 * Design tokens — TypeScript mirror.
 *
 * The single source of truth lives in src/app/globals.css. This file mirrors
 * a subset of those tokens for places where CSS variables cannot be consumed
 * directly — primarily Framer Motion `transition` configs, JS-driven animations,
 * and inline style props.
 *
 * Rule: if you change a token here, change it in globals.css too. Both must agree.
 */

export const duration = {
  instant: 0.1,
  fast: 0.18,
  base: 0.28,
  slow: 0.42,
  slower: 0.64,
  slowest: 0.96,
} as const;

export const ease = {
  smooth: [0.65, 0, 0.35, 1] as [number, number, number, number],
  emphasized: [0.32, 0.72, 0, 1] as [number, number, number, number],
  decelerate: [0, 0, 0.2, 1] as [number, number, number, number],
  spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const;

export const stagger = {
  fast: 0.06,
  base: 0.08,
  slow: 0.12,
} as const;

/**
 * Reusable Framer Motion transition presets.
 * Use these instead of inlining `{ duration: 0.4, ease: [...] }` in every component.
 */
export const transitions = {
  // Default reveal — used for fade-up entrance on scroll
  reveal: {
    duration: duration.slower,
    ease: ease.emphasized,
  },
  // Snappier — for hover lifts and small UI changes
  hover: {
    duration: duration.fast,
    ease: ease.smooth,
  },
  // Gentle — for slow ambient changes (hero halo, FitScore counter)
  ambient: {
    duration: duration.slowest,
    ease: ease.decelerate,
  },
  // Spring physics — for shared layout transitions (Real-Life Moments expand)
  spring: {
    type: "spring" as const,
    stiffness: 220,
    damping: 28,
    mass: 0.9,
  },
  // Soft spring — for the FitScore ring fill
  softSpring: {
    type: "spring" as const,
    stiffness: 90,
    damping: 22,
    mass: 1,
  },
} as const;

/**
 * Reusable variants for staggered fade-up entrance.
 * Apply <motion.div variants={fadeUpContainer} initial="hidden" whileInView="visible" />
 * to a container, and <motion.div variants={fadeUpItem} /> to each child.
 */
export const fadeUpContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger.base,
      delayChildren: 0.05,
    },
  },
} as const;

export const fadeUpItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.reveal,
  },
} as const;

/**
 * Severity tier metadata — used by the Interaction Ladder and any verdict UI.
 * Color values reference Tailwind classes derived from CSS tokens, so they
 * stay in sync if tokens are updated.
 */
export const severityTiers = [
  {
    id: "contraindicated",
    label: "Contraindicated",
    description: "Do not combine.",
    chipBg: "bg-severity-contraindicated/10",
    chipText: "text-severity-contraindicated",
    dot: "bg-severity-contraindicated",
  },
  {
    id: "avoid",
    label: "Avoid",
    description: "Strong reason to separate.",
    chipBg: "bg-severity-avoid/10",
    chipText: "text-severity-avoid",
    dot: "bg-severity-avoid",
  },
  {
    id: "caution",
    label: "Caution",
    description: "Risk depends on context.",
    chipBg: "bg-severity-caution/10",
    chipText: "text-severity-caution",
    dot: "bg-severity-caution",
  },
  {
    id: "monitor",
    label: "Monitor",
    description: "Manage with timing or awareness.",
    chipBg: "bg-severity-monitor/10",
    chipText: "text-severity-monitor",
    dot: "bg-severity-monitor",
  },
  {
    id: "safe",
    label: "Informational",
    description: "FYI — no action needed.",
    chipBg: "bg-severity-safe/10",
    chipText: "text-severity-safe",
    dot: "bg-severity-safe",
  },
] as const;

export type SeverityTier = (typeof severityTiers)[number];
