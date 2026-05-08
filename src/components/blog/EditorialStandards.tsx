/**
 * EditorialStandards — compact footer strip on /blog.
 *
 * Was previously a heavy 4-card grid + 2 reviewer cards section.
 * Per direction: should be at the bottom, compact, not over-decorated.
 *
 * Layout (single horizontal strip):
 *   Left:  short headline + 4 inline standards (one mono line)
 *   Right: 2 small reviewer chips (initials + name + title)
 *
 * Stacks vertically on mobile.
 */

const STANDARDS = [
  "Evidence-based",
  "Expert reviewed",
  "Regularly updated",
  "Editorially independent",
] as const;

const REVIEWERS = [
  { initials: "PL", name: "Dr. Pham L.", title: "PharmD" },
  { initials: "MD", name: "Miriam D.", title: "NP" },
] as const;

export function EditorialStandards() {
  return (
    <section
      aria-labelledby="editorial-strip-heading"
      className="relative border-y border-border bg-surface-raised/30 py-10 md:py-12"
    >
      <div className="container relative mx-auto">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
          {/* Left — headline + standards */}
          <div className="flex flex-col gap-3 md:flex-1">
            <p
              id="editorial-strip-heading"
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-foreground/80"
            >
              Editorial standards
            </p>
            <p className="text-body leading-snug text-ink">
              Every article reviewed by licensed clinicians, sourced from
              peer-reviewed literature, and updated when evidence changes.
            </p>
            <ul className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">
              {STANDARDS.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden="true" className="text-border-strong">·</span>}
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — reviewer chips */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
              Reviewed by
            </span>
            {REVIEWERS.map((r) => (
              <div
                key={r.name}
                className="inline-flex items-center gap-2.5 rounded-pill border border-border bg-surface px-3 py-1.5 shadow-xs"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-background"
                >
                  <span className="font-serif text-[12px] italic">{r.initials}</span>
                </span>
                <span className="text-body-sm leading-tight text-ink">
                  {r.name}
                  <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                    {r.title}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
