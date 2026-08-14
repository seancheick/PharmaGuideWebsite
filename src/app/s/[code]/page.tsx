import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getShareSnapshot } from "@/lib/share-store";
import { shareDispositionCopy } from "@/lib/share-snapshot";
import { bandForTierId } from "@/lib/quality-score";
import { CATALOG_SIZE, site } from "@/lib/site";

/**
 * /s/[code] — the public page behind a shared product link.
 *
 * ─── WHAT THIS PAGE IS FOR ─────────────────────────────────────────────────
 * Someone in the app tapped Share; a friend is opening the result. That friend
 * has never heard of PharmaGuide. The page therefore has to do three jobs, in
 * this order:
 *
 *   1. Deliver the thing they were sent — the product and its quality score,
 *      immediately, with no interstitial
 *   2. Draw the quality-vs-fit line, out loud, before they generalise a
 *      product score into personal advice
 *   3. Offer the beta, once, at the bottom
 *
 * Anything that inverts that order turns a useful link into an ad, and the
 * sharer stops sending them.
 *
 * ─── WHY THERE IS NO PERSONAL VERDICT HERE ─────────────────────────────────
 * The sharer's fit result is not in the payload, is not in the database, and
 * has no column to live in. Their medications and conditions produced that
 * verdict; the reader has different ones. Publishing it would be both a
 * privacy leak and clinically wrong. The boundary line below is the visible
 * half of the same rule the app's ShareService enforces in code.
 *
 * ─── STALENESS ─────────────────────────────────────────────────────────────
 * The snapshot is immutable. Scores get recomputed as the catalog is rebuilt,
 * so a link shared today may not match today's app in six months. Rather than
 * hide that, the page dates the check. "Checked on 13 Aug 2026" is honest and
 * ages gracefully; a bare score silently rots.
 */

// Snapshots never change once written, so a shared link can be cached hard.
// Revalidation exists only to pick up a deletion, for which an hour is fine.
export const revalidate = 3600;

type PageProps = {
  params: Promise<{ code: string }>;
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function productTitle(name: string, brand: string | null): string {
  return brand ? `${name} — ${brand}` : name;
}

function catalogBuildDate(version: string): string {
  const match = /^(\d{4})\.(\d{2})\.(\d{2})\.\d{6}$/.exec(version);
  if (!match) return version;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return version;
  }
  return DATE_FORMAT.format(parsed);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const snapshot = await getShareSnapshot(code);
  if (!snapshot) {
    return { title: "Link not found", robots: { index: false, follow: false } };
  }

  const title = productTitle(snapshot.productName, snapshot.brandName);
  const band = snapshot.qualityTier ? bandForTierId(snapshot.qualityTier) : undefined;
  const dispositionCopy = shareDispositionCopy(snapshot.catalogDisposition);
  const description =
    band && snapshot.qualityScore !== null
      ? `PharmaGuide quality score: ${snapshot.qualityScore}/100 — ${band.label}. Quality reflects the product itself; personal fit depends on your medications and conditions.`
      : `${dispositionCopy.description} Personal fit depends on your medications and conditions.`;

  return {
    title,
    description,
    // Shared links are per-person ephemera, not site content. Indexing them
    // would fill search results with thousands of near-duplicate pages and
    // dilute the pages that are meant to rank.
    robots: { index: false, follow: false },
    alternates: { canonical: `${site.url}/s/${code}` },
    openGraph: {
      title,
      description,
      url: `${site.url}/s/${code}`,
      siteName: site.name,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { code } = await params;
  const snapshot = await getShareSnapshot(code);
  if (!snapshot) notFound();

  const band = snapshot.qualityTier ? bandForTierId(snapshot.qualityTier) : undefined;
  const hasScore = snapshot.qualityScore !== null && band !== undefined;
  const dispositionCopy = shareDispositionCopy(snapshot.catalogDisposition);
  const sharedOn = DATE_FORMAT.format(new Date(snapshot.createdAt));
  const evaluatedOn = catalogBuildDate(snapshot.catalogVersion);

  return (
    <main className="halo-hero relative min-h-screen overflow-x-clip pb-section-y pt-24 sm:pt-28">
      <div className="container mx-auto">
        <div className="mx-auto flex max-w-xl flex-col gap-10">
          {/* ─── Wordmark. Small: they came for the product, not for us. ─── */}
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-body-sm font-medium text-ink transition-opacity duration-fast ease-smooth hover:opacity-70"
          >
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
            PharmaGuide
          </Link>

          {/* ─── The card they were actually sent ─── */}
          <article className="rounded-3xl border border-border bg-surface p-7 shadow-sm sm:p-9">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-subtle">
              Supplement check
            </p>

            <h1 className="mt-4 text-balance text-display-sm leading-[1.12] text-ink">
              {snapshot.productName}
            </h1>
            {snapshot.brandName && (
              <p className="mt-1.5 text-body text-muted">{snapshot.brandName}</p>
            )}

            {hasScore ? (
              <div className="mt-7">
                <div className="flex items-baseline gap-2.5">
                  {/* Plain template string, not cn(). tailwind-merge treats
                      `text-display-lg` and `text-severity-safe` as conflicting
                      `text-*` utilities and drops the font size — the same bug
                      that silently shrank the YourFit card in August. */}
                  <span className={`text-display-lg leading-none ${band.textClass}`}>
                    {snapshot.qualityScore}
                  </span>
                  <span className="text-body-lg text-subtle">/100</span>
                  <span className={`ml-auto text-body-lg font-medium ${band.textClass}`}>
                    {band.label}
                  </span>
                </div>

                <div
                  role="img"
                  aria-label={`Quality score ${snapshot.qualityScore} out of 100 — ${band.label}`}
                  className="mt-4 h-1.5 w-full overflow-hidden rounded-pill bg-border/60"
                >
                  <div
                    className={`h-full rounded-pill ${band.barClass}`}
                    style={{ width: `${snapshot.qualityScore}%` }}
                  />
                </div>

                {snapshot.confidence && (
                  <p className="mt-3 text-body-sm text-muted">
                    Score confidence: {snapshot.confidence} — this product&apos;s label data is
                    incomplete, so the score carries more uncertainty than usual.
                  </p>
                )}
              </div>
            ) : (
              <div
                className={`mt-7 rounded-2xl border px-5 py-4 ${
                  snapshot.catalogDisposition === "blocked"
                    ? "border-severity-avoid/30 bg-severity-avoid/5"
                    : "border-border bg-surface-subtle"
                }`}
              >
                <p
                  className={`text-body-sm font-medium ${
                    snapshot.catalogDisposition === "blocked" ? "text-severity-avoid" : "text-ink"
                  }`}
                >
                  {dispositionCopy.title}
                </p>
                <p className="mt-1.5 text-body-sm leading-relaxed text-muted">
                  {dispositionCopy.body}
                </p>
              </div>
            )}

            {snapshot.highlights.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-2">
                {snapshot.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface-subtle px-3 py-1.5 text-body-sm text-ink"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                      className="text-severity-safe"
                    >
                      <path
                        d="M3 7l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {highlight}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-7 border-t border-border/70 pt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
              Shared {sharedOn} · Catalog evaluated {evaluatedOn}
            </p>
          </article>

          {/* ─── The boundary. Above the CTA on purpose: they should read
                 this whether or not they ever scroll to the signup. ─── */}
          <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] px-6 py-5">
            <p className="font-serif text-h3 italic leading-snug text-ink">
              This score is about the product, not about you.
            </p>
            <p className="mt-2 text-body-sm leading-relaxed text-muted">
              Quality measures what&apos;s in the bottle — the forms used, the dosing, third-party
              testing, label transparency. Whether it&apos;s right for <em>you</em> depends on your
              medications, conditions, and what else you already take. That part needs your own
              check.
            </p>
          </div>

          {/* ─── The ask, once, at the end ─── */}
          <div className="flex flex-col gap-4">
            <h2 className="text-balance text-display-sm leading-[1.12] text-ink">
              Run this against <span className="font-serif italic text-accent">your</span> stack.
            </h2>
            <p className="max-w-prose text-body leading-relaxed text-muted">
              {/* Explicit {" "} after the expression: the text node that
                  follows spans several lines, and JSX trims the leading
                  whitespace of a multi-line node — which silently rendered
                  "180,000+supplements". The Hero's trust row has the same
                  guard for the same reason. */}
              PharmaGuide checks {CATALOG_SIZE} supplements against your medications, conditions,
              and the rest of your stack — and tells you what interacts, what overlaps, and
              what&apos;s redundant.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/?utm_source=share-card&utm_medium=product-share&utm_campaign=app-share#waitlist"
                className="focus-visible:outline-offset-3 inline-flex items-center justify-center gap-1.5 rounded-pill border border-transparent bg-accent px-5 py-3 text-body-sm font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-smooth hover:bg-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-accent"
              >
                Check my stack
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/how-it-works?utm_source=share-card&utm_medium=product-share&utm_campaign=app-share"
                className="focus-visible:outline-offset-3 inline-flex items-center justify-center rounded-pill border border-border bg-surface px-5 py-3 text-body-sm font-medium text-ink shadow-xs transition-[transform,border-color,background-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-accent"
              >
                How it works
              </Link>
            </div>
            <p className="text-body-sm text-subtle">
              Free in beta · we&apos;re adding the first testers now
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
