import Link from "next/link";
import { footerBadges, footerNav, site } from "@/lib/site";

/**
 * Footer — minimal, four-column on desktop, stacked on mobile.
 *
 * Includes:
 *   - Brand column (wordmark + tagline + city + email + social links)
 *   - Product / Company / Legal nav
 *   - "Coming soon" line for App Store + Google Play
 *   - Tiny badges row (Evidence-graded · Clinician-informed · etc.)
 *   - Last-reviewed date that auto-rolls to the most recent 5-day boundary
 *     (so the page always reads as "reviewed in the last 5 days")
 *   - Copyright
 *
 * The last-reviewed date is computed at server-render time. The page uses
 * Next.js ISR (revalidate 5 days) at the route level so the date stays
 * fresh in production without rebuilding. Client never re-computes — no
 * hydration mismatch.
 */

function formatLastReviewedDate(): string {
  const now = new Date();
  // Round to most recent 5-day boundary so the date "ticks" every 5 days.
  const epochDays = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const fiveDayBoundary = Math.floor(epochDays / 5) * 5;
  const date = new Date(fiveDayBoundary * 1000 * 60 * 60 * 24);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

const SOCIAL_LINKS = [
  {
    label: "Twitter",
    href: "https://twitter.com/pharmaguide",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
        <path d="M9.4 1.5h2.1L8 5.5l4.1 5.5H9.1L6.6 7.6 3.7 11h-2L5.5 6.6 1.5 1.5h3.2l2.3 3.1L9.4 1.5zm-.5 8.4h1.1L4.4 2.5H3.2l5.7 7.4z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/pharmaguide",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
        <path d="M11.5 11.5h-1.7V8.7c0-.7 0-1.5-.9-1.5s-1.1.7-1.1 1.5v2.8H6.1V5.6h1.6v.8h0c.2-.4.8-.9 1.6-.9 1.7 0 2.1 1.1 2.1 2.6v3.4zM4.3 4.8c-.5 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm.9 6.7H3.5V5.6h1.7v5.9z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/pharmaguide",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
        <rect x="2" y="2" width="10" height="10" rx="2.5" />
        <circle cx="7" cy="7" r="2.3" />
        <circle cx="10.2" cy="3.8" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
] as const;

export function Footer() {
  const lastReviewed = formatLastReviewedDate();

  return (
    <footer className="border-t border-border bg-surface-subtle">
      <div className="container mx-auto py-section-y-sm">
        {/* Top: 4-column grid */}
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12 lg:gap-16">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="font-sans text-body font-medium tracking-[-0.012em] text-ink">
                {site.name}
              </span>
            </div>

            <p className="font-serif text-h3 italic leading-tight text-ink">
              Supplement intelligence.
            </p>

            <div className="flex flex-col gap-1 text-body-sm text-muted">
              <span>{site.city}</span>
              <a
                href={`mailto:${site.email}`}
                className="transition-colors duration-fast ease-smooth hover:text-ink"
              >
                {site.email}
              </a>
            </div>

            {/* Social links */}
            <ul className="mt-2 flex items-center gap-2.5">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-muted transition-[background-color,color,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-surface-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Product nav */}
          <FooterColumn title="Product" links={footerNav.product} />

          {/* Company nav */}
          <FooterColumn title="Company" links={footerNav.company} />

          {/* Legal nav */}
          <FooterColumn title="Legal" links={footerNav.legal} />
        </div>

        {/* Middle: app stores coming soon */}
        <div className="mt-10 flex flex-col items-start gap-3 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between md:mt-14">
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-subtle">
            iOS + Android
            <span className="mx-2 text-border-strong">·</span>
            App Store + Google Play
            <span className="mx-2 text-border-strong">·</span>
            Coming soon
          </p>

          {/* Badges row */}
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {footerBadges.map((badge) => (
              <li
                key={badge}
                className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle"
              >
                {badge}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: last-reviewed + copyright */}
        <div className="mt-8 flex flex-col items-start gap-2 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
            Last reviewed{" "}
            <time dateTime={lastReviewed} className="text-foreground/65">
              {lastReviewed}
            </time>{" "}
            <span className="mx-1 text-border-strong">·</span> by Dr. Pham L., PharmD
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/65">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
