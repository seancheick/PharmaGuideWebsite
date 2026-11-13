import Link from "next/link";
import { NUTRIENT_METERS, nutrientFrame } from "@/components/features/nutrient-demo";
import { ALERT_EXAMPLES, LABEL_EXAMPLE } from "@/components/features/remaining-demo";
import { SHARE_STACK } from "@/lib/features";

/**
 * Beyond Interactions — the four checks the scan section did not show.
 *
 * Was six equal text cards (2026-11-13). Stack intelligence and Personal
 * fit are now demonstrated by the scan section directly above, so they left
 * this grid (both still have their /features sections). The four that
 * remain each carry a small proof instead of a paragraph, and every proof
 * reuses an example already published on /features — no new claim is made
 * here:
 *   depletion      src/lib/features.ts (metformin → vitamin B12)
 *   accumulation   features/nutrient-demo.ts (vitamin D vs. the adult UL)
 *   transparency   features/remaining-demo.ts LABEL_EXAMPLE
 *   recalls        features/remaining-demo.ts ALERT_EXAMPLES
 */

const VITAMIN_D = NUTRIENT_METERS[0];
const D_FRAME = nutrientFrame(VITAMIN_D, 1);
const RECALL = ALERT_EXAMPLES[0];

const row = "flex items-center justify-between gap-3 text-[11.5px] leading-none text-ink";
const mono = "font-mono text-[9.5px] font-medium uppercase tracking-[0.1em]";

const CAPABILITIES = [
  {
    title: "Medication depletion",
    body: "Flags common medication-linked nutrient depletion patterns.",
    href: "/features#medication-depletion",
    proof: (
      <div>
        <div className="flex items-center gap-2 text-[12px] text-ink">
          <span className="rounded-pill border border-border bg-surface px-2.5 py-1.5 leading-none">
            Metformin
          </span>
          <svg
            width="22"
            height="8"
            viewBox="0 0 22 8"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-subtle"
          >
            <path
              d="M0 4h20M17 1l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="rounded-pill border border-accent/25 bg-accent-soft px-2.5 py-1.5 leading-none text-accent-strong">
            Vitamin B12
          </span>
        </div>
        <p className={`${mono} mt-2.5 text-subtle`}>Lower levels more likely, long-term</p>
      </div>
    ),
  },
  {
    title: "Nutrient accumulation",
    body: "Catches when multiple products push the same nutrient too high.",
    href: "/features#nutrient-accumulation",
    proof: (
      <div>
        <div className={row}>
          <span>{VITAMIN_D.name} across 3 products</span>
          <span className="tabular-nums text-severity-caution">
            {VITAMIN_D.val.toLocaleString("en-US")} {VITAMIN_D.unit}
          </span>
        </div>
        {/* The limit sits at the bar's midpoint; the fill is the total against twice the limit. */}
        <div className="relative mt-2.5 h-[6px] rounded-full bg-border">
          <div
            className="h-full rounded-full bg-severity-caution"
            style={{ width: `${D_FRAME.fill * 100}%` }}
          />
          <span aria-hidden="true" className="absolute -top-1 left-1/2 h-[14px] w-px bg-ink" />
        </div>
        <p className={`${mono} mt-2 text-center text-subtle`}>
          Adult upper limit {VITAMIN_D.ul.toLocaleString("en-US")} {VITAMIN_D.unit}
        </p>
      </div>
    ),
  },
  {
    title: "Ingredient transparency",
    body: "Shows active ingredients, excipients, blends, and label gaps.",
    href: "/features#ingredient-transparency",
    proof: (
      <div className="flex flex-col gap-2">
        <div className={row}>
          <span>{LABEL_EXAMPLE.active[0].name}</span>
          <span className="tabular-nums text-muted">{LABEL_EXAMPLE.active[0].amount}</span>
        </div>
        <div className={row}>
          <span>Proprietary blend · {LABEL_EXAMPLE.blend.length} herbs</span>
          <span className="tabular-nums text-muted">{LABEL_EXAMPLE.blendAmount}</span>
        </div>
        <p className={`${mono} text-severity-caution`}>Amount of each herb not disclosed</p>
      </div>
    ),
  },
  {
    title: "Recall + safety alerts",
    body: "See recall status, date and reason for affected products. Enable notifications for alerts about saved items.",
    href: "/features#recall-safety",
    proof: (
      <div>
        <p className={`${mono} text-severity-avoid`}>{RECALL.label} · sample</p>
        <p className="mt-2 text-[12px] leading-snug text-ink">{RECALL.title}</p>
      </div>
    ),
  },
] as const;

export function BeyondInteractions() {
  return (
    <section
      id="beyond-interactions"
      aria-labelledby="beyond-heading"
      className="section-y-sm relative"
    >
      <div className="container mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
              Beyond interactions
            </p>
            <h2 id="beyond-heading" className="mt-3 text-balance text-display-sm text-ink">
              Interactions are{" "}
              <span className="font-serif italic text-accent">just the start.</span>
            </h2>
            <p className="mt-3 max-w-prose text-body leading-relaxed text-muted">
              Four more things PharmaGuide checks that no single label can show you.
            </p>
          </div>
          <Link
            href="/features"
            className="group inline-flex shrink-0 items-center gap-2 self-start rounded-pill border border-border bg-surface px-5 py-2.5 text-body-sm font-medium text-ink shadow-xs transition-[transform,border-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:self-auto"
          >
            See all six capabilities
            <span
              aria-hidden="true"
              className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap) => (
            <li key={cap.title}>
              <Link
                href={cap.href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-xs transition-[transform,box-shadow,border-color] duration-fast ease-smooth hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <div className="flex min-h-[92px] flex-col justify-center rounded-xl bg-surface-subtle/70 px-3.5 py-3">
                  {cap.proof}
                </div>
                <h3 className="mt-4 font-serif text-h3 italic leading-snug text-ink">
                  {cap.title}
                </h3>
                <p className="mt-1.5 hidden text-body-sm leading-relaxed text-muted sm:block">{cap.body}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">
                  See how
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* One slim row, not a fifth tile: sharing is what you do with the
            result, and the row costs far less height than a card. */}
        <Link
          href="/features#share"
          className="group mt-4 flex flex-col gap-x-6 gap-y-2 rounded-2xl border border-border bg-surface px-5 py-4 shadow-xs transition-[border-color,box-shadow] duration-fast ease-smooth hover:border-border-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:flex-row md:items-center"
        >
          <span className="font-serif text-h3 italic leading-snug text-ink">
            Then share it, on your terms.
          </span>
          <span className="flex flex-wrap gap-x-5 gap-y-1 text-body-sm text-muted md:flex-1">
            {SHARE_STACK.channels.map((c) => (
              <span key={c.who} className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
                {c.short}
              </span>
            ))}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">
            See how
            <span
              aria-hidden="true"
              className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
