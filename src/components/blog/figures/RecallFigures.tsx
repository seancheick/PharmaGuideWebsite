import { FigureActions, FigureUpdated } from "./FigureActions";

/**
 * One recall in a weekly digest, written by scripts/lib/recalls.mjs.
 * Answers, in order: do I have this product, does the recall cover my
 * package, what should I do. Props are plain strings (MDX strips
 * {expressions}); the package table and details arrive as markdown
 * children. Save image / Print / Copy link come from FigureActions, so a
 * shared card keeps the product, scope, action, source and update date.
 *
 * Only figure components are exported (the registry exposes every export).
 */
export function RecallCard({
  id,
  product,
  scope,
  company,
  announced,
  action,
  reason,
  notice,
  noticeLabel = "Read the official FDA-posted notice",
  status = "Recall",
  page,
  children,
}: {
  id: string;
  product: string;
  scope?: string;
  company: string;
  announced: string;
  action: string;
  reason: string;
  notice?: string;
  noticeLabel?: string;
  status?: string;
  /** e.g. pharmaguide.io/blog/<slug>, printed so a saved card can be traced back. */
  page?: string;
  children?: React.ReactNode;
}) {
  const anchor = `recall-${id}`;
  return (
    <section
      id={anchor}
      aria-labelledby={`${anchor}-title`}
      className="my-8 scroll-mt-28 rounded-xl bg-surface p-5 shadow-sm ring-1 ring-border sm:p-7"
    >
      <p className="font-mono text-nano uppercase text-severity-avoid">
        {status} · {announced}
      </p>
      <h3 id={`${anchor}-title`} className="mt-2 text-balance font-serif text-h3 italic leading-snug text-ink">
        {product}
      </h3>
      {/* The company is who issued the recall: readable, not footnote-sized. */}
      <p className="mt-1.5 text-body-sm text-foreground/85">
        <span className="text-subtle">Recalled by </span>
        <span className="font-medium text-ink">{company}</span>
      </p>
      {scope && (
        <p className="mt-2 inline-flex rounded-pill border border-severity-avoid/30 bg-severity-avoid/[0.06] px-2.5 py-0.5 font-mono text-nano uppercase text-severity-avoid">
          {scope}
        </p>
      )}

      <div className="mt-5 rounded-lg border-l-4 border-severity-avoid bg-[rgb(var(--color-severity-avoid-bg))] px-4 py-3">
        <p className="font-mono text-nano uppercase text-severity-avoid">What to do</p>
        <p className="mt-1 text-body font-medium leading-snug text-ink">{action}</p>
      </div>

      <p className="mt-4 text-body-sm leading-relaxed text-foreground/85">
        <span className="font-medium text-ink">Why: </span>
        {reason}
      </p>

      {children && (
        // Identifier tables must fit a phone without scrolling: a saved card
        // that cuts off a UPC is worse than useless. Compact cells, numbers
        // in tabular mono so 12-digit UPCs stay readable.
        <div className="mt-4 text-body-sm leading-relaxed text-foreground/85 [&_p]:mt-3 [&_p]:text-body-sm [&_p]:leading-relaxed [&_ul]:mt-2 [&_ul]:text-body-sm [&_table]:text-[13px] [&_td]:px-2 [&_td]:py-1.5 [&_th]:px-2 [&_th]:py-1.5 [&_td+td]:whitespace-nowrap [&_td+td]:font-mono [&_td+td]:tabular-nums">
          {children}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-border pt-3 font-mono text-nano text-subtle">
        <span className="flex flex-wrap gap-x-3">
          <FigureUpdated />
          {page && <span>{page}</span>}
          {notice && (
            <a href={notice} className="text-link underline decoration-link/60 underline-offset-[3px] hover:text-link-strong">
              {noticeLabel}
            </a>
          )}
        </span>
      </div>
      <FigureActions id={anchor} title={status} printable />
    </section>
  );
}
