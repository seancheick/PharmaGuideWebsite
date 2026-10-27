import { cn } from "@/lib/utils";
import { FigureActions, FigureUpdated } from "./FigureActions";

/**
 * Teaching figures for /blog/shilajit-heavy-metals-label-claims.
 *
 * Built as HTML rather than inline SVG so the text stays real text: it
 * reflows on phones, honours the site's type scale and dark mode, and is
 * read by screen readers without a separate description. Each figure
 * carries its own title, limits and source line so it still makes sense
 * when screenshotted away from the article. Wrap each in <Illustration>
 * for the caption.
 *
 * Every product, lot number, lab and result shown is fictional and is
 * labelled as such on the figure.
 *
 * Only figure components are exported: the registry (./index.ts) exposes
 * every export to MDX.
 */

const POST_URL = "pharmaguide.io/blog/shilajit-heavy-metals-label-claims";

// Grids use repeat(auto-fit, minmax()) so columns reflow by available
// width: the site's breakpoints all sit at 1200px, so `sm:` would keep
// tablets on the phone layout.

function Frame({
  eyebrow,
  title,
  children,
  note,
  source,
  printable,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  note?: React.ReactNode;
  source?: string;
  /** Offer Print / PDF: for long or practical figures people keep. */
  printable?: boolean;
}) {
  // "Figure 3 · …" → #figure-3, the target of Copy link and exports.
  const id = `figure-${/Figure (\d+)/.exec(eyebrow)?.[1] ?? "x"}`;
  return (
    <div
      id={id}
      className="scroll-mt-28 rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border sm:p-7"
    >
      <p className="font-mono text-nano uppercase text-accent">{eyebrow}</p>
      <p className="mt-2 text-balance font-serif text-h3 italic leading-snug text-ink">{title}</p>
      <div className="mt-5">{children}</div>
      {note && (
        <p className="mt-5 border-l-2 border-accent/40 pl-3 text-body-sm leading-relaxed text-foreground/80">
          {note}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-border pt-3 font-mono text-nano text-subtle">
        <span>{source ? `Source: ${source}` : "PharmaGuide"}</span>
        <span className="flex flex-wrap gap-x-3">
          <FigureUpdated />
          <span>{POST_URL}</span>
        </span>
      </div>
      <FigureActions id={id} title={title} printable={printable} />
    </div>
  );
}

function Pin({ n, tone = "accent" }: { n: number; tone?: "accent" | "ink" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-medium leading-none",
        tone === "accent" ? "bg-accent text-surface" : "bg-ink/80 text-surface"
      )}
    >
      {n}
    </span>
  );
}

function Fictional({ children = "Illustrative example — not an actual product or test" }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-severity-caution/40 bg-severity-caution/[0.08] px-2.5 py-0.5 font-mono text-nano uppercase text-severity-caution">
      {children}
    </span>
  );
}

// ─── 1. The front label, annotated ────────────────────────────────────
// The jar is a photograph with a blank label; the label text is live SVG
// text laid over it, so it stays crisp, translatable and correctable.
// Photo: public/images/blog/shilajit-jar.jpg, 939 × 1400. Its label spans
// x 162–776, y 572–1028; the jar spans y 140–1290. Placed at scale 0.53
// so the jar fills stage y 40–650, centred on x 500.
const JAR_PHOTO = "/images/blog/shilajit-jar.jpg";
const PHOTO_BG = "#f7eee5"; // the photo's own backdrop, so the stage has no seam

const labelClaims = [
  {
    claim: "4,000 mg per serving",
    leaves: "Extract in the capsule, or the raw material it started as?",
    check: "Supplement Facts panel",
  },
  {
    claim: "87% fulvic acid",
    leaves: "Measured by which assay, on which batch?",
    check: "Assay for this lot",
  },
  {
    claim: "Pure Himalayan",
    leaves: "Names a region, not a composition.",
    check: "Batch lab report",
  },
  {
    claim: "Third-party tested",
    leaves: "What was tested, by whom, with what results?",
    check: "Certificate of analysis",
  },
];

// Where each claim sits on the label, in stage units (1000 × 690).
const labelPoints: [number, number][] = [
  [396, 327],
  [414, 428],
  [588, 454],
  [588, 493],
];

function JarArt() {
  return (
    <g>
      {/* Photo edges are pre-feathered to PHOTO_BG, so no SVG mask is needed (masks are lost in PNG export). */}
      <image href={JAR_PHOTO} x="251" y="-34" width="498" height="742" />
      {/* Label: photo label runs x 337–662, y 269–511 */}
      <g textAnchor="middle" fill="#1d1a16">
        <text x="500" y="298" fontSize="11" letterSpacing="4" fill="#7a6f5e" className="font-mono">
          SUMMIT RESIN · FICTIONAL
        </text>
        <text x="500" y="333" fontSize="21" fontWeight="600" className="font-sans">
          4,000 mg per serving
        </text>
        <line
          x1="392"
          x2="608"
          y1="349"
          y2="349"
          stroke="#1d1a16"
          strokeOpacity="0.3"
          strokeDasharray="2 4"
        />
        <text
          x="500"
          y="404"
          fontSize="56"
          fontWeight="800"
          letterSpacing="-0.5"
          className="font-sans"
        >
          SHILAJIT
        </text>
        <text
          x="500"
          y="433"
          fontSize="18"
          fontWeight="600"
          letterSpacing="2"
          className="font-sans"
        >
          87% FULVIC ACID
        </text>
        <text x="500" y="459" fontSize="18" fontStyle="italic" className="font-serif">
          Pure Himalayan resin
        </text>
        <line
          x1="392"
          x2="608"
          y1="474"
          y2="474"
          stroke="#1d1a16"
          strokeOpacity="0.3"
          strokeDasharray="2 4"
        />
        <text
          x="500"
          y="498"
          fontSize="16"
          fontWeight="600"
          letterSpacing="1.5"
          className="font-sans"
        >
          THIRD-PARTY TESTED
        </text>
      </g>
    </g>
  );
}

function StagePin({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="17" className="fill-accent" stroke="#fff" strokeWidth="3" />
      <text
        x={x}
        y={y + 6}
        textAnchor="middle"
        fontSize="17"
        fontWeight="600"
        fill="#fff"
        className="font-mono"
      >
        {n}
      </text>
    </g>
  );
}

function ClaimCallout({ n, align = "left" }: { n: number; align?: "left" | "right" }) {
  const c = labelClaims[n - 1]!;
  return (
    <div className={cn(align === "right" && "text-right")}>
      <p
        className={cn(
          "flex items-center gap-2 text-body font-semibold leading-tight text-accent",
          align === "right" && "justify-end"
        )}
      >
        <Pin n={n} /> {c.claim}
      </p>
      <p className="mt-1 text-body-sm leading-snug text-foreground/80">{c.leaves}</p>
      <p className="mt-1.5 font-mono text-nano uppercase text-subtle">
        Check: <span className="text-ink">{c.check}</span>
      </p>
    </div>
  );
}

// Callout anchors in stage units: [left%, top%] of each HTML block,
// and the arrow from beside that block to the claim on the label.
const callouts = [
  { n: 1, box: "left-[3%] top-[10%] w-[27%]", from: [306, 96] as const },
  { n: 2, box: "left-[3%] top-[56%] w-[27%]", from: [306, 413] as const },
  { n: 3, box: "right-[3%] top-[10%] w-[27%]", from: [694, 96] as const, align: "right" as const },
  { n: 4, box: "right-[3%] top-[56%] w-[27%]", from: [694, 413] as const, align: "right" as const },
];

export function ShilajitLabelAnnotated() {
  return (
    <Frame
      eyebrow="Figure 1 · Reading the jar"
      title="What the label says, and what each claim leaves open"
    >
      <div className="fig-stage">
        {/* Wide: jar centre stage, callouts around it */}
        <div
          className="fig-wide relative overflow-hidden rounded-xl ring-1 ring-border"
          style={{ aspectRatio: "1000 / 690", background: PHOTO_BG }}
        >
          <svg viewBox="0 0 1000 690" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <marker
                id="fig1-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" className="fill-accent" />
              </marker>
            </defs>
            <JarArt />
            {callouts.map(({ n, from }) => {
              const [tx, ty] = labelPoints[n - 1]!;
              const [fx, fy] = from;
              const mx = (fx + tx) / 2;
              return (
                <path
                  key={n}
                  d={`M${fx} ${fy} C ${mx} ${fy}, ${mx} ${ty}, ${tx + (tx > 500 ? 14 : -14)} ${ty}`}
                  fill="none"
                  className="stroke-accent"
                  strokeWidth="2"
                  strokeDasharray="1 7"
                  strokeLinecap="round"
                  markerEnd="url(#fig1-arrow)"
                />
              );
            })}
          </svg>
          {callouts.map((c) => (
            <div key={c.n} className={cn("absolute", c.box)}>
              <ClaimCallout n={c.n} align={c.align} />
            </div>
          ))}
        </div>
        <p className="fig-wide mt-3 rounded-lg border border-dashed border-accent/40 px-4 py-3 text-body-sm leading-snug text-foreground/80">
          Front-label claims alone don&apos;t establish this lot&apos;s measured lead, arsenic,
          cadmium and mercury. That takes the lab report, Figure 5.
        </p>

        {/* Narrow: jar with pins, claims listed below */}
        <div className="fig-narrow">
          <div
            className="overflow-hidden rounded-xl ring-1 ring-border"
            style={{ background: PHOTO_BG }}
          >
            <svg
              viewBox="300 40 400 630"
              className="mx-auto block w-full max-w-[20rem]"
              aria-hidden="true"
            >
              <JarArt />
              {labelPoints.map(([x, y], i) => (
                <StagePin key={i} n={i + 1} x={x < 500 ? 372 : 628} y={y - 6} />
              ))}
            </svg>
          </div>
          <ol className="mt-4 flex flex-col divide-y divide-border">
            {labelClaims.map((_, i) => (
              <li key={i} className="py-3 first:pt-0">
                <ClaimCallout n={i + 1} />
              </li>
            ))}
          </ol>
          <p className="mt-2 rounded-lg border border-dashed border-accent/40 p-3 text-body-sm leading-snug text-foreground/80">
            Front-label claims alone don&apos;t establish this lot&apos;s measured metal levels.
            That takes the lab report, Figure 5.
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Fictional>Fictional label for teaching</Fictional>
      </div>
    </Frame>
  );
}

// ─── 2. Provenance ────────────────────────────────────────────────────
const strata = [
  "#9b8a70",
  "#6f5a46",
  "#b08f5c",
  "#5b6566",
  "#7c4b34",
  "#a39478",
  "#4c4038",
  "#8a6f4e",
  "#3f3a35",
];

function SmallJar({ x, uid }: { x: number; uid: string }) {
  return (
    <g transform={`translate(${x} 470) scale(1.4) translate(${-x} -470)`}>
      <ellipse cx={x} cy="508" rx="58" ry="7" fill="#000" fillOpacity="0.18" />
      <rect x={x - 34} y="430" width="68" height="20" rx="5" fill="#141414" />
      <rect x={x - 44} y="448" width="88" height="62" rx="12" fill={`url(#${uid}-glass)`} />
      <rect x={x - 44} y="462" width="88" height="32" fill="#f6f1e6" />
      <text
        x={x}
        y="476"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="700"
        letterSpacing="0.6"
        fill="#1d1a16"
        className="font-sans"
      >
        PURE HIMALAYAN
      </text>
      <text
        x={x}
        y="488"
        textAnchor="middle"
        fontSize="9"
        fontStyle="italic"
        fill="#1d1a16"
        className="font-serif"
      >
        Shilajit
      </text>
    </g>
  );
}

export function ShilajitProvenance() {
  const mountain =
    "M30 418 L170 250 L250 300 L360 170 L450 228 L540 92 L640 214 L720 168 L830 282 L970 418 Z";
  return (
    <Frame
      eyebrow="Figure 2 · Why batches differ"
      title="Same name on the jar, different rock behind it"
      source="Kamgar E, et al. Crit Rev Anal Chem 2025"
    >
      <div className="overflow-hidden rounded-xl bg-[linear-gradient(180deg,rgb(var(--color-surface))_0%,rgb(var(--color-surface-subtle))_100%)] ring-1 ring-border">
        <svg
          viewBox="0 70 1000 480"
          className="block w-full"
          role="img"
          aria-label="A mountain cut away to show rock layers. Resin seeps from two different layers, A and B, into two jars with the same label."
        >
          <defs>
            <clipPath id="fig2-mtn">
              <path d={mountain} />
            </clipPath>
            <filter id="fig2-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <linearGradient id="fig2-light" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id="fig2j-glass" x1="0" x2="1">
              <stop offset="0" stopColor="#1b0f08" />
              <stop offset="0.45" stopColor="#6e3c1c" />
              <stop offset="1" stopColor="#140a05" />
            </linearGradient>
          </defs>

          {/* Far ridge */}
          <path
            d="M0 418 L120 300 L210 340 L330 250 L470 300 L600 210 L760 300 L880 250 L1000 330 L1000 418 Z"
            fill="#cfc6b5"
            fillOpacity="0.55"
          />

          {/* Cut-away mountain: tilted strata, grain, light */}
          <g clipPath="url(#fig2-mtn)">
            <g transform="rotate(-7 500 260)">
              {strata.map((c, i) => {
                const y = 40 + i * 50;
                return (
                  <path
                    key={i}
                    d={`M-80 ${y} Q 120 ${y - 22}, 320 ${y} T 720 ${y} T 1120 ${y} L1120 ${y + 60} L-80 ${y + 60} Z`}
                    fill={c}
                  />
                );
              })}
            </g>
            <rect x="0" y="0" width="1000" height="530" filter="url(#fig2-grain)" opacity="0.35" />
            <rect x="0" y="0" width="1000" height="530" fill="url(#fig2-light)" />
            <path
              d="M490 150 L540 92 L590 150 L566 140 L540 156 L514 138 Z"
              fill="#fbf8f2"
              fillOpacity="0.85"
            />
            <path
              d="M330 205 L360 170 L392 196 L370 192 L355 206 Z"
              fill="#fbf8f2"
              fillOpacity="0.7"
            />
          </g>
          <path d={mountain} fill="none" stroke="#2c2621" strokeOpacity="0.35" strokeWidth="1.5" />
          <line x1="0" x2="1000" y1="418" y2="418" stroke="#2c2621" strokeOpacity="0.25" />

          {/* Seeps and their paths to the jars */}
          {[
            { id: "A", sx: 300, sy: 300, jx: 300 },
            { id: "B", sx: 700, sy: 262, jx: 700 },
          ].map((s) => (
            <g key={s.id}>
              <path
                d={`M${s.sx} ${s.sy + 26} C ${s.sx} ${s.sy + 80}, ${s.jx} ${s.sy + 90}, ${s.jx} 424`}
                fill="none"
                stroke="#fff"
                strokeWidth="5"
                strokeOpacity="0.7"
                strokeLinecap="round"
              />
              <path
                d={`M${s.sx} ${s.sy + 26} C ${s.sx} ${s.sy + 80}, ${s.jx} ${s.sy + 90}, ${s.jx} 424`}
                fill="none"
                className="stroke-accent"
                strokeWidth="2.5"
                strokeDasharray="1 7"
                strokeLinecap="round"
              />
              <path
                d={`M${s.sx} ${s.sy - 14} C ${s.sx + 14} ${s.sy + 4}, ${s.sx + 12} ${s.sy + 22}, ${s.sx} ${s.sy + 22} C ${s.sx - 12} ${s.sy + 22}, ${s.sx - 14} ${s.sy + 4}, ${s.sx} ${s.sy - 14} Z`}
                fill="#160c06"
              />
              <circle cx={s.sx - 4} cy={s.sy + 6} r="3" fill="#fff" fillOpacity="0.55" />
              <circle
                cx={s.sx + 40}
                cy={s.sy - 22}
                r="21"
                className="fill-accent"
                stroke="#fff"
                strokeWidth="3"
              />
              <text
                x={s.sx + 40}
                y={s.sy - 14}
                textAnchor="middle"
                fontSize="22"
                fontWeight="600"
                fill="#fff"
                className="font-serif"
                fontStyle="italic"
              >
                {s.id}
              </text>
            </g>
          ))}

          <SmallJar x={300} uid="fig2j" />
          <SmallJar x={700} uid="fig2j" />

          {/* Same label bracket */}
          <path
            d="M372 482 L402 482 M598 482 L628 482"
            className="stroke-accent"
            strokeWidth="2"
            strokeDasharray="1 6"
            strokeLinecap="round"
          />
          <rect x="410" y="462" width="180" height="40" rx="20" className="fill-accent" />
          <text
            x="500"
            y="488"
            textAnchor="middle"
            fontSize="16"
            fontWeight="600"
            fill="#fff"
            className="font-sans"
          >
            Same label
          </text>
        </svg>
      </div>

      <div className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(14rem,1fr))]">
        {[
          [
            "A",
            "Seeps from one set of rock layers",
            "Its own trace-metal profile, and its own levels of markers such as fulvic acid and urolithin A.",
          ],
          [
            "B",
            "Seeps from a different set",
            "A different profile again, sold under the same name.",
          ],
        ].map(([id, h, t]) => (
          <div key={id} className="flex gap-3">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-body italic text-surface"
            >
              {id}
            </span>
            <div>
              <p className="text-body-sm font-semibold text-ink">{h}</p>
              <p className="mt-0.5 text-body-sm leading-relaxed text-muted">{t}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 font-serif text-h4 italic text-ink">
        The region is on the label. The composition isn&apos;t.
      </p>
    </Frame>
  );
}

// ─── 3. ppm to micrograms per day ─────────────────────────────────────
const exposureExamples = [
  { id: "A", ppm: "0.4", grams: "0.5 g", note: "500 mg", ug: "0.2" },
  { id: "B", ppm: "0.1", grams: "3 g", note: "3,000 mg", ug: "0.3" },
];

export function ShilajitExposureMath() {
  return (
    <Frame
      eyebrow="Figure 3 · The one calculation"
      title="Concentration and daily amount both decide your exposure"
      note={
        <>
          <strong className="font-medium text-ink">
            This calculates exposure; it does not decide whether a product is safe for you.
          </strong>{" "}
          Use the daily amount of the same material the lab tested — a report on the resin
          doesn&apos;t describe a capsule blend.
        </>
      }
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] items-stretch gap-3">
        <div className="rounded-lg bg-surface-subtle/70 p-4">
          <p className="font-mono text-nano uppercase text-subtle">From the report</p>
          <p className="mt-1 text-body font-medium text-ink">Metal result, ppm</p>
          <p className="mt-1 text-body-sm text-muted">1 ppm = 1 µg per gram</p>
        </div>
        <div className="rounded-lg bg-surface-subtle/70 p-4">
          <p className="font-mono text-nano uppercase text-subtle">× From your routine</p>
          <p className="mt-1 text-body font-medium text-ink">Grams per day</p>
          <p className="mt-1 text-body-sm text-muted">500 mg = 0.5 g</p>
        </div>
        <div className="rounded-lg bg-accent p-4 text-surface">
          <p className="font-mono text-nano uppercase text-surface/70">= Your exposure</p>
          <p className="mt-1 text-body font-medium">Micrograms per day</p>
          <p className="mt-1 text-body-sm text-surface/80">of that metal</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg ring-1 ring-border">
        <div className="flex items-center justify-between gap-3 bg-surface-subtle/60 px-4 py-2">
          <p className="font-mono text-nano uppercase text-subtle">Two hypothetical products</p>
          <Fictional>Hypothetical values</Fictional>
        </div>
        <ul className="divide-y divide-border">
          {exposureExamples.map((e) => (
            <li
              key={e.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 font-mono text-body-sm text-foreground/85"
            >
              <span className="font-serif text-h4 italic text-ink">{e.id}</span>
              <span>
                {e.ppm} ppm × {e.grams} <span className="text-subtle">({e.note})</span>
              </span>
              <span className="ml-auto font-medium text-ink">= {e.ug} µg/day</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-body-sm leading-relaxed text-foreground/85">
        <span className="font-medium text-ink">B has a quarter of A&apos;s concentration</span>, and
        a higher daily exposure, because the daily amount is six times larger.
      </p>
    </Frame>
  );
}

// ─── 4. Extract ratio: front label vs Supplement Facts ────────────────
export function ShilajitExtractLabel() {
  return (
    <Frame
      eyebrow="Figure 4 · One product, two numbers"
      title="Where “4,000 mg equivalent” comes from"
      note={
        <>
          A 10:1 ratio describes how much starting material went into the extract. On its own it
          doesn&apos;t tell you the extract is ten times as effective. Keep the whole context
          together: amount, serving size, ratio and any standardisation stated.
        </>
      }
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] items-start gap-5">
        {/* Front panel */}
        <div className="rounded-xl bg-gradient-to-br from-accent to-accent-strong p-5 text-surface shadow-sm">
          <p className="font-mono text-nano uppercase tracking-[0.2em] text-surface/60">
            Front of bottle
          </p>
          <p className="mt-3 font-serif text-display-sm italic leading-none">Shilajit</p>
          <p className="mt-4 font-serif text-h1 leading-none">
            4,000 mg<span className="align-super text-body">*</span>
          </p>
          <p className="mt-1 text-body-sm text-surface/80">equivalent per serving</p>
          <p className="mt-6 text-nano leading-relaxed text-surface/60">
            *From 400 mg of 10:1 extract
          </p>
        </div>
        {/* Supplement Facts */}
        <div className="rounded-md border-2 border-ink bg-surface p-3 font-sans text-ink">
          <p className="text-h4 font-bold leading-none">Supplement Facts</p>
          <div className="mt-2 flex items-center gap-2 rounded bg-severity-caution/[0.1] px-1.5 py-1 text-body-sm">
            <Pin n={1} tone="ink" /> Serving size: 1 capsule
          </div>
          <div className="mt-2 h-2 bg-ink" />
          <div className="flex justify-between border-b border-ink/40 py-1 text-nano font-bold">
            <span>Amount per serving</span>
          </div>
          <div className="flex items-start justify-between gap-2 rounded bg-severity-caution/[0.1] px-1.5 py-1.5 text-body-sm">
            <span className="flex gap-2">
              <Pin n={2} tone="ink" />
              <span>
                Shilajit resin extract{" "}
                <span className="whitespace-nowrap">
                  (10:1) <Pin n={3} tone="ink" />
                </span>
              </span>
            </span>
            <span className="font-bold">400 mg</span>
          </div>
          <div className="mt-1 h-1 bg-ink" />
          <p className="mt-1.5 text-nano leading-relaxed text-muted">
            Equivalent to 4,000 mg of raw shilajit.
          </p>
        </div>
      </div>
      <ol className="mt-5 grid gap-2 text-body-sm leading-relaxed text-foreground/85">
        <li className="flex gap-2">
          <Pin n={1} tone="ink" />{" "}
          <span>
            <strong className="font-medium text-ink">Serving size</strong> — every amount below is
            per this serving, not per day.
          </span>
        </li>
        <li className="flex gap-2">
          <Pin n={2} tone="ink" />{" "}
          <span>
            <strong className="font-medium text-ink">Declared amount</strong> — 400 mg of extract is
            what each serving contains, and the number to quote to a clinician.
          </span>
        </li>
        <li className="flex gap-2">
          <Pin n={3} tone="ink" />{" "}
          <span>
            <strong className="font-medium text-ink">Ratio</strong> — 10 parts starting material to
            1 part extract: 400 mg × 10 = the 4,000 mg on the front.
          </span>
        </li>
      </ol>
      <div className="mt-4">
        <Fictional>Fictional label for teaching</Fictional>
      </div>
    </Frame>
  );
}

// ─── 5. Anatomy of a lab report ───────────────────────────────────────
const reportRows = [
  { metal: "Lead (Pb)", result: "0.42", limit: "0.01", spec: "≤ 1.0", verdict: "Pass" },
  { metal: "Arsenic (As), total", result: "0.18", limit: "0.01", spec: "≤ 1.0", verdict: "Pass" },
  { metal: "Cadmium (Cd)", result: "< 0.01", limit: "0.01", spec: "≤ 0.3", verdict: "Pass" },
  { metal: "Mercury (Hg)", result: "< 0.005", limit: "0.005", spec: "≤ 0.2", verdict: "Pass" },
];

const reportKey = [
  [
    "Product and form",
    "Confirms what material was tested — here the finished resin, not incoming raw material.",
  ],
  [
    "Lot or batch number",
    "Match it to the number printed on your jar. A different lot describes different material.",
  ],
  [
    "Laboratory and date",
    "Who did the testing, when, and whether the lab is accredited (ISO/IEC 17025) for the method.",
  ],
  [
    "Test and method",
    "What was actually measured. A metals panel says nothing about microbes, pesticides or the markers on the label.",
  ],
  [
    "Result and units",
    "A measured value you can use. In ppm it goes straight into the calculation in Figure 3.",
  ],
  [
    "Reporting limit",
    "Below this, the lab reports “<” rather than a number. The report should say whether it is a detection or a quantitation limit.",
  ],
  [
    "Specification and its source",
    "The benchmark used to judge the result. Ask whose it is: the manufacturer's own, a pharmacopoeia, or a regulator's.",
  ],
] as const;

export function ShilajitLabReport() {
  return (
    <Frame
      eyebrow="Figure 5 · How to read a lab report"
      printable
      title="A shilajit certificate of analysis: the seven details that matter"
    >
      {/* The document */}
      <div className="relative overflow-hidden rounded-lg bg-surface-raised font-mono text-[12.5px] leading-relaxed text-foreground/90 shadow-md ring-1 ring-border-strong">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-subtle/70 px-4 py-2.5">
          <span className="font-sans text-body-sm font-semibold text-ink">
            Certificate of Analysis
          </span>
          <Fictional />
        </div>
        <div className="grid gap-x-6 gap-y-2 px-4 py-3 [grid-template-columns:repeat(auto-fit,minmax(13rem,1fr))]">
          <p className="flex gap-2">
            <Pin n={1} />{" "}
            <span>
              <span className="text-subtle">Product:</span> Shilajit resin, finished product
            </span>
          </p>
          <p className="flex gap-2">
            <Pin n={2} />{" "}
            <span>
              <span className="text-subtle">Lot:</span> SR-24117
            </span>
          </p>
          <p className="flex gap-2">
            <Pin n={3} />{" "}
            <span>
              <span className="text-subtle">Lab:</span> Example Analytical (ISO/IEC 17025) ·
              2026-09-14
            </span>
          </p>
          <p className="flex gap-2">
            <Pin n={4} />{" "}
            <span>
              <span className="text-subtle">Test:</span> Heavy metals by ICP-MS
            </span>
          </p>
        </div>
        {/* Wide: the report's table. Narrow: one block per analyte, so no
            column (and no "Pass" without its spec) is ever cut off on a
            phone or in a phone-sized export. */}
        <div className="fig-stage border-t border-border">
          <div className="fig-narrow divide-y divide-border">
            {reportRows.map((r, i) => (
              <div key={r.metal} className="px-4 py-2.5">
                <p className="font-sans text-ink">{r.metal}</p>
                <dl className="mt-1 grid grid-cols-4 gap-2 text-[12px]">
                  {[
                    [5, "Result ppm", r.result, "font-medium text-ink"],
                    [6, "LOQ ppm", r.limit, "text-muted"],
                    [7, "Spec*", r.spec, "text-muted"],
                    [0, "Verdict", r.verdict, "text-severity-safe"],
                  ].map(([n, label, value, tone]) => (
                    <div key={label as string}>
                      <dt className="flex items-center gap-1 text-[10px] uppercase text-subtle">
                        {n && i === 0 ? <Pin n={n as number} /> : null}
                        {label}
                      </dt>
                      <dd className={cn("mt-0.5", tone as string)}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <div className="fig-wide">
            <table className="w-full text-left">
              <thead className="bg-surface-subtle/50 text-nano uppercase text-subtle">
                <tr>
                  <th className="px-4 py-2 font-medium">Analyte</th>
                  <th className="px-2 py-2 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Pin n={5} /> Result ppm
                    </span>
                  </th>
                  <th className="px-2 py-2 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Pin n={6} /> LOQ (ppm)
                    </span>
                  </th>
                  <th className="px-2 py-2 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Pin n={7} /> Spec*
                    </span>
                  </th>
                  <th className="px-4 py-2 font-medium">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportRows.map((r) => (
                  <tr key={r.metal}>
                    <td className="px-4 py-2 font-sans text-ink">{r.metal}</td>
                    <td className="px-2 py-2 font-medium text-ink">{r.result}</td>
                    <td className="px-2 py-2 text-muted">{r.limit}</td>
                    <td className="px-2 py-2 text-muted">{r.spec}</td>
                    <td className="px-4 py-2 text-severity-safe">{r.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="border-t border-border px-4 py-2 text-nano text-subtle">
          LOQ = limit of quantitation, the lowest level this method reports as a number. *Spec = the
          manufacturer&apos;s internal specification, fictional here.
        </p>
      </div>

      {/* Key */}
      <ol className="mt-6 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
        {reportKey.map(([label, text], i) => (
          <li key={label} className="flex gap-3">
            <Pin n={i + 1} />
            <div>
              <p className="text-body-sm font-medium text-ink">{label}</p>
              <p className="mt-0.5 text-body-sm leading-relaxed text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Number vs < vs Pass */}
      <p className="mt-7 font-mono text-nano uppercase text-subtle">Three kinds of result</p>
      <div className="mt-3 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))]">
        {[
          ["0.42", "A measured value", "Usable: put it through the daily calculation."],
          ["< 0.01", "Below the reporting limit", "Not zero. Check which limit the report uses."],
          [
            "Pass",
            "A verdict against a spec",
            "Only as meaningful as the spec. Ask for the number.",
          ],
        ].map(([v, h, t]) => (
          <div key={v} className="rounded-lg bg-surface-subtle/70 p-4">
            <p className="font-mono text-h4 font-medium text-ink">{v}</p>
            <p className="mt-1 text-body-sm font-medium text-ink">{h}</p>
            <p className="mt-0.5 text-body-sm leading-relaxed text-muted">{t}</p>
          </div>
        ))}
      </div>

      {/* Establishes vs doesn't */}
      <div className="mt-6 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
        <div className="rounded-lg border border-severity-safe/30 bg-severity-safe/[0.06] p-4">
          <p className="text-body-sm font-medium text-severity-safe">
            What this report can establish
          </p>
          <p className="mt-1 text-body-sm leading-relaxed text-foreground/85">
            The levels of the four metals tested, in the sample from this lot, by this method, on
            this date.
          </p>
        </div>
        <div className="rounded-lg border border-severity-caution/30 bg-severity-caution/[0.06] p-4">
          <p className="text-body-sm font-medium text-severity-caution">
            What it leaves unanswered
          </p>
          <p className="mt-1 text-body-sm leading-relaxed text-foreground/85">
            Whether the product works, whether anything else was checked, other lots, and whether it
            suits you — your health, medicines, pregnancy or age.
          </p>
        </div>
      </div>
    </Frame>
  );
}

// ─── 6. Checklist ─────────────────────────────────────────────────────
const askSeller = [
  "Can you send the certificate of analysis for lot ____ (the number on my jar)?",
  "Was the finished product tested, or only the incoming raw material?",
  "Which lab ran it, and is it ISO/IEC 17025 accredited for that method?",
  "Does it give numbers in ppm for lead, arsenic, cadmium and mercury, with reporting limits?",
  "Is arsenic reported as total or inorganic?",
  "What specification do you test against, and where does it come from?",
  "Does the mg on the front refer to the extract or a raw-material equivalent?",
];

const bringClinician = [
  "A photo of the whole label, Supplement Facts panel included",
  "The lot number and the matching report",
  "How much you plan to take each day, and for how long",
  "Your medicines, other supplements, and any pregnancy or kidney or liver condition",
];

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((t) => (
        <li key={t}>
          <label className="flex cursor-pointer gap-3 text-body-sm leading-relaxed text-foreground/85 has-[:checked]:text-muted has-[:checked]:line-through">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[rgb(var(--color-accent))]"
            />
            {t}
          </label>
        </li>
      ))}
    </ul>
  );
}

export function ShilajitChecklist() {
  return (
    <Frame
      eyebrow="Figure 6 · Before you buy"
      printable
      title="Questions for the seller, and what to bring your clinician"
      note="A complete answer to every question doesn't make a product right for you. It gives you and your clinician something real to assess."
    >
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))]">
        <div>
          <p className="font-mono text-nano uppercase text-accent">Ask the seller</p>
          <div className="mt-3">
            <Checklist items={askSeller} />
          </div>
        </div>
        <div>
          <p className="font-mono text-nano uppercase text-accent">Bring to your clinician</p>
          <div className="mt-3">
            <Checklist items={bringClinician} />
          </div>
        </div>
      </div>
    </Frame>
  );
}
