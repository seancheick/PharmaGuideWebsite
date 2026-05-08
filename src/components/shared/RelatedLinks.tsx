import Link from "next/link";

/**
 * RelatedLinks — reusable "keep reading" cross-link strip.
 *
 * Sits near the bottom of any content page, before the footer or
 * before a final CTA. Drops 2-3 contextual links to other deep pages
 * so visitors who got value from one page find their next move
 * without having to dig through the site.
 *
 * Pattern matches Stripe / Linear / Vercel docs — every page hands
 * off to other pages. Topic-cluster SEO loves this; visitors do too.
 *
 * Usage:
 *   <RelatedLinks
 *     eyebrow="Keep reading"
 *     headline="More from PharmaGuide."
 *     links={[
 *       {
 *         label: "Methodology",
 *         title: "Where the evidence comes from",
 *         description: "Sources, the 5-step verification process, the team.",
 *         href: "/methodology",
 *       },
 *       {
 *         label: "Features",
 *         title: "Six pillars of the product",
 *         description: "Medication depletion · Stack intelligence · Quality · Fit · Recalls.",
 *         href: "/features",
 *       },
 *       {
 *         label: "Blog",
 *         title: "What our clinicians are writing about",
 *         description: "Evidence-based guides on interactions, depletions, and recalls.",
 *         href: "/blog",
 *       },
 *     ]}
 *   />
 *
 * Layout: 3-col grid at md+, 1-col stacked on mobile. Each link is
 * a self-contained card with the same hover-lift treatment as blog
 * cards (matches the rest of the site).
 */

export interface RelatedLink {
  /** Mono-uppercase eyebrow shown above the title (e.g. "FEATURES") */
  label: string;
  /** Italic-serif title of the destination */
  title: string;
  /** One-line muted descriptor */
  description: string;
  /** Internal route or external URL */
  href: string;
}

interface RelatedLinksProps {
  /** Mono uppercase eyebrow (e.g. "Keep reading", "Want more depth?") */
  eyebrow?: string;
  /** Section headline. First clause renders ink, optional `accent`
      half renders italic-serif accent. */
  headline: string;
  /** Optional second-clause italic-serif accent text */
  accent?: string;
  /** 2-4 link cards */
  links: readonly RelatedLink[];
}

export function RelatedLinks({
  eyebrow = "Keep reading",
  headline,
  accent,
  links,
}: RelatedLinksProps) {
  return (
    <section
      aria-labelledby="related-links-heading"
      className="relative section-y-sm border-t border-border bg-surface-raised/40"
    >
      <div className="container relative mx-auto">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center md:gap-6">
          <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
            {eyebrow}
          </p>
          <h2
            id="related-links-heading"
            className="text-balance text-display-md leading-tight text-ink"
          >
            {headline}
            {accent && (
              <>
                {" "}
                <span className="font-serif italic text-accent">{accent}</span>
              </>
            )}
          </h2>
        </div>

        <ul className="mx-auto mt-12 grid max-w-5xl gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
          {links.map((link) => {
            const isExternal = /^https?:\/\//.test(link.href);
            const cardClass =
              "group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-fast ease-smooth hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent md:p-7";

            const inner = (
              <>
                <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-accent">
                  {link.label}
                </p>
                <h3 className="font-serif text-h3 italic leading-snug text-ink">
                  {link.title}
                </h3>
                <p className="text-body-sm leading-relaxed text-muted">
                  {link.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-accent">
                  Read
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </>
            );

            return (
              <li key={link.href} className="h-full">
                {isExternal ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link href={link.href} className={cardClass}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
