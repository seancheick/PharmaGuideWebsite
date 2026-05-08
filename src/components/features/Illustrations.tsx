"use client";

import { motion } from "framer-motion";
import type { IllustrationKey } from "@/lib/features";

/**
 * Custom SVG illustrations for the /features pillars.
 *
 * Design principles:
 *   • All illustrations live on a soft surface inside their pillar
 *     section so they read as "in-app screen" abstractions
 *   • Same restrained palette: ink, muted, accent teal, severity tones
 *   • Animated entrance (Framer Motion) so they feel alive
 *   • Custom-built — no stock icons, no clip art
 *
 * Medication Depletion is the hero illustration — it gets a richer
 * pill→arrow→nutrient→replenishment flow because it's the unique
 * differentiator. The other 5 are abstract diagrammatic panels.
 */

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

// ─── 1. Medication Depletion ─────────────────────────────────────────
// Hero illustration: medication card on the left with name + class,
// connector line with directional arrow, depleted nutrient list on
// the right, and a subtle "replenishment suggested" footer. Abstract
// in-app panel — feels like a real PharmaGuide screen.

function DepletionIllustration() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15%" }}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle p-5 sm:p-7"
    >
      {/* Soft accent halo behind the panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-accent/[0.04] blur-2xl"
      />

      <div className="relative flex h-full flex-col gap-4">
        {/* Top: medication card */}
        <motion.div variants={reveal}>
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-subtle">
            Medication added
          </p>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent" aria-hidden="true">
                <rect x="3" y="9" width="18" height="6" rx="3" />
                <line x1="12" y1="9" x2="12" y2="15" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[15px] italic leading-tight text-ink">
                Metformin
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                Hypoglycemic · long-term use
              </p>
            </div>
          </div>
        </motion.div>

        {/* Connector — depletion arrow */}
        <motion.div
          variants={reveal}
          className="flex items-center gap-2 pl-4"
        >
          <span aria-hidden="true" className="block h-6 w-px bg-border-strong" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-severity-monitor">
            depletes
          </span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-severity-monitor" aria-hidden="true">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>

        {/* Bottom: depleted nutrients + replenishment */}
        <motion.div variants={reveal} className="flex flex-1 flex-col gap-2">
          {[
            { name: "Vitamin B12", note: "absorption reduced" },
            { name: "Folate", note: "long-term draw-down" },
          ].map((n) => (
            <div
              key={n.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-severity-monitor/25 bg-severity-monitor/[0.06] px-4 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-severity-monitor" />
                <span className="font-serif text-[14px] italic text-ink">
                  {n.name}
                </span>
              </div>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-severity-monitor">
                {n.note}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Footer hint */}
        <motion.p
          variants={reveal}
          className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle"
        >
          ↘ replenishment suggested · discuss with clinician
        </motion.p>
      </div>
    </motion.div>
  );
}

// ─── 2. Stack Intelligence — multi-way network ───────────────────────
// SVG network with 5 product nodes connected by interaction edges.
// One edge animates a pulse to suggest "live cross-checking."

function StackIllustration() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle p-3">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-accent/[0.04] blur-2xl"
      />
      <svg
        viewBox="0 0 320 240"
        className="relative h-full w-full"
        aria-hidden="true"
      >
        {/* Edges — dashed accent */}
        <g stroke="currentColor" strokeDasharray="3 4" strokeLinecap="round" className="text-accent" fill="none" opacity="0.5">
          <path d="M60,60 Q160,30 260,60" strokeWidth="1.2">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="18s" repeatCount="indefinite" />
          </path>
          <path d="M60,60 Q120,150 160,200" strokeWidth="1.2">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="18s" repeatCount="indefinite" />
          </path>
          <path d="M260,60 Q200,150 160,200" strokeWidth="1.2">
            <animate attributeName="stroke-dashoffset" from="0" to="-100" dur="18s" repeatCount="indefinite" />
          </path>
          <path d="M60,60 Q200,90 260,60" strokeWidth="1" opacity="0.7" />
          <path d="M30,180 Q120,150 60,60" strokeWidth="1" opacity="0.7" />
        </g>
        {/* Warn edge with pulse */}
        <path
          d="M260,60 Q200,150 160,200"
          fill="none"
          className="text-severity-monitor"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle r="3.5" className="text-severity-monitor" fill="currentColor">
          <animateMotion dur="3.4s" repeatCount="indefinite" path="M260,60 Q200,150 160,200" />
          <animate attributeName="opacity" values="0;1;1;0" dur="3.4s" repeatCount="indefinite" />
        </circle>

        {/* Nodes */}
        {[
          { cx: 60, cy: 60, label: "Magnesium", glyph: "Mg" },
          { cx: 260, cy: 60, label: "Caffeine", glyph: "Ca" },
          { cx: 160, cy: 200, label: "Levothyroxine", glyph: "Rx" },
          { cx: 30, cy: 180, label: "Vitamin D", glyph: "D" },
          { cx: 290, cy: 180, label: "Iron", glyph: "Fe" },
        ].map((n) => (
          <g key={n.label}>
            <circle
              cx={n.cx}
              cy={n.cy}
              r="22"
              fill="rgb(var(--color-surface))"
              className="text-border-strong"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <text
              x={n.cx}
              y={n.cy + 4}
              fontFamily="var(--font-serif)"
              fontStyle="italic"
              fontSize="13"
              textAnchor="middle"
              className="text-ink"
              fill="currentColor"
            >
              {n.glyph}
            </text>
            <text
              x={n.cx}
              y={n.cy + 40}
              fontFamily="var(--font-mono)"
              fontSize="9"
              letterSpacing="0.1em"
              textAnchor="middle"
              className="text-muted"
              fill="currentColor"
              style={{ textTransform: "uppercase" }}
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── 3. Ingredient Transparency — label parse panel ──────────────────

function TransparencyIllustration() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-accent/[0.04] blur-2xl"
      />
      <div className="relative flex h-full flex-col gap-3">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-subtle">
          Supplement facts · parsed
        </p>

        {/* Active ingredients */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
          <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.16em] text-severity-safe">
            Active
          </p>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            <li className="flex items-baseline justify-between gap-3 text-ink">
              <span className="font-serif italic">Magnesium glycinate</span>
              <span className="font-mono text-[11px] text-muted">200 mg</span>
            </li>
            <li className="flex items-baseline justify-between gap-3 text-ink">
              <span className="font-serif italic">L-theanine</span>
              <span className="font-mono text-[11px] text-muted">100 mg</span>
            </li>
          </ul>
        </div>

        {/* Proprietary blend — decomposed */}
        <div className="rounded-xl border border-severity-caution/30 bg-severity-caution/[0.06] p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.16em] text-severity-caution">
              Proprietary blend · decomposed
            </p>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-severity-caution">
              850 mg
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-[12.5px] text-foreground/80">
            <li className="flex items-baseline justify-between">
              <span>Ashwagandha root</span>
              <span className="font-mono text-[10.5px] text-subtle">~ 400 mg est.</span>
            </li>
            <li className="flex items-baseline justify-between">
              <span>Rhodiola</span>
              <span className="font-mono text-[10.5px] text-subtle">~ 300 mg est.</span>
            </li>
            <li className="flex items-baseline justify-between">
              <span>Holy basil</span>
              <span className="font-mono text-[10.5px] text-subtle">~ 150 mg est.</span>
            </li>
          </ul>
        </div>

        {/* Inactive */}
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.16em] text-subtle">
            Inactive
          </p>
          <p className="mt-1 text-[12px] text-muted">
            Magnesium stearate · vegetable cellulose · titanium dioxide
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 4. Personal Fit — profile-gated card ────────────────────────────

function FitIllustration() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-accent/[0.04] blur-2xl"
      />
      <div className="relative flex h-full flex-col gap-3.5">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-subtle">
          Your profile
        </p>
        <div className="flex flex-wrap gap-1.5">
          {["Pregnant · 22w", "Hypertension", "SSRI", "Goal · sleep"].map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-pill border border-accent/30 bg-accent/[0.06] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-accent-strong"
            >
              <span aria-hidden="true" className="block h-1 w-1 rounded-full bg-accent" />
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-subtle">
          Adapted recommendations
        </p>
        <ul className="flex flex-col gap-2">
          {[
            { t: "Magnesium glycinate · evening", v: "Good fit", tone: "safe" as const },
            { t: "St. John's Wort", v: "Avoid · SSRI", tone: "avoid" as const },
            { t: "High-dose vitamin A", v: "Avoid · pregnancy", tone: "avoid" as const },
            { t: "Iron + multi", v: "Caution · timing", tone: "caution" as const },
          ].map((row) => {
            const dot =
              row.tone === "safe"
                ? "bg-severity-safe"
                : row.tone === "avoid"
                  ? "bg-severity-avoid"
                  : "bg-severity-caution";
            const txt =
              row.tone === "safe"
                ? "text-severity-safe"
                : row.tone === "avoid"
                  ? "text-severity-avoid"
                  : "text-severity-caution";
            return (
              <li
                key={row.t}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 shadow-xs"
              >
                <span className="font-serif text-[13px] italic text-ink">{row.t}</span>
                <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${txt}`}>
                  <span aria-hidden="true" className={`block h-1.5 w-1.5 rounded-full ${dot}`} />
                  {row.v}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ─── 5. Nutrient Accumulation — UL meter panel ───────────────────────

function AccumulationIllustration() {
  const meters = [
    { name: "Vitamin D", val: 6000, ul: 4000, unit: "IU", over: true },
    { name: "Zinc", val: 70, ul: 40, unit: "mg", over: true },
    { name: "Vitamin C", val: 800, ul: 2000, unit: "mg", over: false },
    { name: "Magnesium", val: 350, ul: 350, unit: "mg", over: false },
  ];
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-accent/[0.04] blur-2xl"
      />
      <div className="relative flex h-full flex-col gap-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-subtle">
            Daily intake · stack-wide
          </p>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-subtle">
            vs. UL
          </p>
        </div>
        <ul className="flex flex-1 flex-col justify-around gap-3">
          {meters.map((m) => {
            const pct = Math.min(150, (m.val / m.ul) * 100);
            const tone = m.over ? "bg-severity-avoid" : "bg-severity-safe";
            const txt = m.over ? "text-severity-avoid" : "text-severity-safe";
            return (
              <li key={m.name} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-[13px] italic text-ink">
                    {m.name}
                  </span>
                  <span className={`font-mono text-[11px] tabular-nums ${txt}`}>
                    {m.val}
                    <span className="text-subtle"> / {m.ul} {m.unit}</span>
                  </span>
                </div>
                <div className="relative h-[5px] overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-full ${tone}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                  {/* UL marker */}
                  <span
                    aria-hidden="true"
                    className="absolute right-0 top-0 h-full w-px bg-foreground/30"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ─── 6. Recall & Safety — alert card stack ───────────────────────────

function RecallsIllustration() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface-subtle p-5 sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-accent/[0.04] blur-2xl"
      />
      <div className="relative flex h-full flex-col gap-3">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-subtle">
          Active alerts · your stack
        </p>

        <div className="rounded-xl border border-severity-contraindicated/35 bg-severity-contraindicated/[0.06] p-4">
          <div className="flex items-start gap-2.5">
            <span aria-hidden="true" className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-severity-contraindicated" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-severity-contraindicated">
                FDA recall · class I
              </p>
              <p className="mt-1 font-serif text-[14px] italic leading-tight text-ink">
                NaturalBoost Energy — undeclared sildenafil
              </p>
              <p className="mt-1 text-[11.5px] text-muted">
                In your stack · scanned March 12 · all lots
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-severity-caution/30 bg-severity-caution/[0.06] p-4">
          <div className="flex items-start gap-2.5">
            <span aria-hidden="true" className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-severity-caution" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.14em] text-severity-caution">
                FAERS signal · monitoring
              </p>
              <p className="mt-1 font-serif text-[14px] italic leading-tight text-ink">
                Kratom — adverse-event cluster
              </p>
              <p className="mt-1 text-[11.5px] text-muted">
                Watching · FDA response pending
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            Last checked
          </span>
          <span className="font-mono text-[10.5px] tabular-nums text-foreground/80">
            8 minutes ago
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Dispatcher ──────────────────────────────────────────────────────

export function Illustration({ kind }: { kind: IllustrationKey }) {
  switch (kind) {
    case "depletion":
      return <DepletionIllustration />;
    case "stack":
      return <StackIllustration />;
    case "transparency":
      return <TransparencyIllustration />;
    case "fit":
      return <FitIllustration />;
    case "accumulation":
      return <AccumulationIllustration />;
    case "recalls":
      return <RecallsIllustration />;
  }
}
