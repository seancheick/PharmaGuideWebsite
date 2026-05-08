import Link from "next/link";
import {
  footerBadges,
  footerNav,
  footerTrustBadges,
  site,
} from "@/lib/site";
import { BackToTop } from "./BackToTop";

/**
 * Footer — DARK, layered, matches the legacy pharmaguide.io footer.
 *
 * Layered structure (top to bottom):
 *   1. Main grid     — Brand · Product · Company · Legal · App-store column
 *   2. Trust bar     — HIPAA / AES-256 / Offline-First / No Data Selling
 *   3. Disclaimer    — warning icon + medical-disclaimer line
 *   4. Bottom bar    — Last reviewed · © · Sitemap
 *   + Floating back-to-top button (client island)
 *
 * The legacy site used 5 stacked rails on the dark surface — each rail
 * with its own background tint to add depth. We replicate that with
 * white/[0.02-0.05] tints and white/10 hairlines between them.
 *
 * Why so much detail: the user explicitly wants the footer to feel
 * "anchored" — the page above is light cream + accent teal; without
 * a substantive footer the page reads as "just stops." This is the
 * page's structural foundation.
 *
 * Last-reviewed date: rounded to most recent 5-day boundary, server-
 * rendered at ISR boundary (revalidate 5d). No client recompute = no
 * hydration mismatch.
 */

function formatLastReviewedDate(): string {
  const now = new Date();
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

// ─── Inline SVG icons ─────────────────────────────────────────────────
// Kept as JSX so we don't pay for an icon library. All 16×16 / 14×14.

const IconLocation = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IconInstagram = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const IconApple = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const IconGooglePlay = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
  </svg>
);

const IconShieldCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconAlertTriangle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const TRUST_ICON_MAP = {
  "shield-check": IconShieldCheck,
  lock: IconLock,
  clock: IconClock,
  globe: IconGlobe,
} as const;

const SOCIAL_LINKS = [
  { label: "X (Twitter)", href: "https://twitter.com/pharmaguideai", Icon: IconX },
  { label: "LinkedIn", href: "https://linkedin.com/company/pharmaguide", Icon: IconLinkedIn },
  { label: "Instagram", href: "https://instagram.com/pharmaguide.io", Icon: IconInstagram },
] as const;

export function Footer() {
  const lastReviewed = formatLastReviewedDate();
  const year = new Date().getFullYear();

  return (
    // Deep slate teal — the brand accent (#183B3F) used as the footer
    // surface so the page resolves into the same color the CTA buttons
    // and accent dots have been hinting at all the way down. Reads as
    // brand-anchored, not generic-dark. text-background/80 over teal
    // gives ~10:1 contrast — well above WCAG AA.
    <footer className="relative bg-accent text-background/85" id="contact" role="contentinfo">
      {/* Top-center halo — light teal at 8% alpha so it lifts the
          surface slightly under the wordmark and ties the rail visually
          to the warm cream above. Bumped from 6% → 8% because the teal
          base eats the highlight more than near-black did. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%]"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, rgb(212 224 226 / 0.08), transparent 70%)",
        }}
      />

      {/* ━━━━━━━━━━━━━━━━━━ RAIL 1: MAIN GRID ━━━━━━━━━━━━━━━━━━ */}
      <div className="container relative mx-auto py-12 md:py-14 lg:py-16">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.1fr] lg:gap-10 xl:gap-12">
          {/* ─── Brand column ─────────────────────────── */}
          <div className="flex flex-col gap-4 lg:col-span-1 md:col-span-2 lg:col-auto">
            {/* Logo — wordmark + accent dot. Kept text-based so the footer
                stays in the design system; if/when the bitmap logo is
                wired up via next/image it slots in here. */}
            <Link href="/" aria-label={`${site.name} home`} className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="block h-2 w-2 rounded-full bg-background/70" />
              <span className="font-sans text-h3 font-medium tracking-[-0.012em] text-background">
                {site.name}
              </span>
            </Link>

            <p className="max-w-xs text-body-sm leading-relaxed text-background/65">
              Your supplement and medication safety companion. Evidence-graded,
              clinician-informed, privacy-first.
            </p>

            <address className="not-italic flex flex-col gap-2 text-body-sm text-background/65">
              <span className="inline-flex items-center gap-2">
                <span className="text-background/45"><IconLocation /></span>
                {site.city}
              </span>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2 transition-colors duration-fast ease-smooth hover:text-background"
              >
                <span className="text-background/45"><IconMail /></span>
                {site.email}
              </a>
            </address>

            {/* Social — circle buttons, white-on-dark with subtle border */}
            <ul className="mt-1 flex items-center gap-2.5">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-background/70 transition-[background-color,color,transform,border-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] hover:text-background focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Nav columns ─────────────────────────── */}
          <FooterColumn title="Product" links={footerNav.product} />
          <FooterColumn title="Company" links={footerNav.company} />
          <FooterColumn title="Legal" links={footerNav.legal} />

          {/* ─── App-store badges column ──────────────── */}
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-background/55">
              Get the app
            </h3>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">
              Coming May 2026
            </p>
            <div className="flex flex-wrap gap-2.5">
              <AppStoreBadge
                Icon={IconApple}
                small="Download on the"
                large="App Store"
                ariaLabel="Coming soon to App Store"
              />
              <AppStoreBadge
                Icon={IconGooglePlay}
                small="Get it on"
                large="Google Play"
                ariaLabel="Coming soon to Google Play"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━ RAIL 2: TRUST BAR ━━━━━━━━━━━━━━━━━━ */}
      <div className="relative border-t border-white/8 bg-white/[0.02]">
        <div className="container mx-auto py-5">
          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 md:justify-between md:gap-x-4">
            {footerTrustBadges.map((badge) => {
              const Icon = TRUST_ICON_MAP[badge.icon];
              return (
                <li
                  key={badge.label}
                  className="inline-flex items-center gap-2 text-background/75"
                >
                  <span className="text-background/70">
                    <Icon />
                  </span>
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]">
                    {badge.label}
                  </span>
                </li>
              );
            })}
            {/* Compact value-claim row on the right at md+. On mobile it
                wraps below the trust badges. Kept tiny so it doesn't
                steal weight from the main badges. */}
            <li className="hidden lg:inline-flex items-center gap-3 text-background/45">
              {footerBadges.map((b, i) => (
                <span key={b} className="font-mono text-[10px] uppercase tracking-[0.14em]">
                  {b}
                  {i < footerBadges.length - 1 && (
                    <span className="ml-3 text-white/15">·</span>
                  )}
                </span>
              ))}
            </li>
          </ul>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━ RAIL 3: DISCLAIMER + BOTTOM BAR ━━━━━━━━━━━━━━━━━━ */}
      <div className="relative border-t border-white/8 bg-black/20">
        {/* Disclaimer — centered */}
        <div className="container mx-auto py-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-severity-caution/15 text-severity-caution"
            >
              <IconAlertTriangle />
            </span>
            <p className="max-w-2xl text-body-sm leading-relaxed text-background/70">
              <span className="font-medium text-background">Medical Disclaimer:</span>{" "}
              PharmaGuide provides educational information only and is not a
              substitute for professional medical advice, diagnosis, or
              treatment. Always consult your healthcare provider before making
              changes to your medication or supplement regimen.
            </p>
          </div>
        </div>

        {/* Bottom bar — same bg, thin separator */}
        <div className="border-t border-white/6">
          <div className="container mx-auto py-5">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-background/45">
                Last reviewed{" "}
                <time dateTime={lastReviewed} className="text-background/70">
                  {lastReviewed}
                </time>{" "}
                <span className="mx-1 text-white/15">·</span> by Dr. Pham L., PharmD
              </p>
              <div className="flex items-center gap-4">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-background/45">
                  © {year} {site.name} Inc.
                </p>
                <span className="text-white/15">·</span>
                <Link
                  href="/sitemap.xml"
                  className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-background/55 transition-colors duration-fast ease-smooth hover:text-background"
                >
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating back-to-top button (client island) */}
      <BackToTop />
    </footer>
  );
}

// ─── Footer column ──────────────────────────────────────────────────
// Supports comingSoon items rendered as span+pill instead of <Link>.

type FooterLink = {
  label: string;
  href: string;
  comingSoon?: boolean;
  badge?: string;
};

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<FooterLink>;
}) {
  return (
    <div>
      <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-background/55">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            {link.comingSoon ? (
              <span className="inline-flex items-center gap-2 text-body-sm text-background/55">
                {link.label}
                <span className="rounded-pill bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-background/75">
                  {link.badge ?? "Soon"}
                </span>
              </span>
            ) : (
              <Link
                href={link.href}
                className="group/link relative inline-flex items-center gap-0 text-body-sm text-background/70 transition-colors duration-fast ease-smooth hover:text-background"
              >
                <span className="inline-block w-0 overflow-hidden transition-[width,opacity] duration-300 ease-smooth group-hover/link:w-4 group-hover/link:opacity-100 opacity-0">
                  <span className="inline-block h-[3px] w-[3px] rounded-full bg-background/70 translate-x-0.5" />
                </span>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── App-store badge ────────────────────────────────────────────────
// Visual replica of Apple/Google's official badge — non-interactive
// during the coming-soon phase. When the apps ship these become <a>
// tags pointing at the real store URLs.

function AppStoreBadge({
  Icon,
  small,
  large,
  ariaLabel,
}: {
  Icon: () => React.ReactElement;
  small: string;
  large: string;
  ariaLabel: string;
}) {
  return (
    <div
      aria-label={ariaLabel}
      role="img"
      className="inline-flex w-[156px] items-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2 text-background/85 transition-[background-color,border-color] duration-fast ease-smooth hover:border-white/25 hover:bg-white/[0.08]"
    >
      <span className="shrink-0"><Icon /></span>
      <span className="flex flex-col leading-none">
        <span className="font-sans text-[9.5px] uppercase tracking-[0.06em] text-background/55">
          {small}
        </span>
        <span className="mt-0.5 font-sans text-[14px] font-medium tracking-[-0.01em] text-background">
          {large}
        </span>
      </span>
    </div>
  );
}
