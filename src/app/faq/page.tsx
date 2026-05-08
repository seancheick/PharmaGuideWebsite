import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FAQClient } from "@/components/faq/FAQClient";
import { FAQ_ITEMS } from "@/lib/faq";
import { site } from "@/lib/site";

/**
 * /faq — Frequently Asked Questions page.
 *
 * Server-rendered with full metadata + FAQPage JSON-LD for Google rich
 * results. The interactive accordion is the only client island.
 *
 * Layout:
 *   • Compact hero (mono eyebrow + italic-serif punchline + 1 subhead)
 *   • Single-column accordion (hairline divided)
 *   • Tight bottom CTA strip
 *
 * No two-column masonry — single column at max-w-3xl reads better and
 * doesn't shift content when accordions open. Apple, Stripe, Linear
 * all do single-column FAQ.
 *
 * ISR matches the homepage (5 days) so any FAQ content edits flow to
 * production without a rebuild.
 */

export const revalidate = 432000; // 5 days

export const metadata: Metadata = {
  title: "FAQ — PharmaGuide",
  description:
    "Frequently asked questions about PharmaGuide — what it is, how it works, privacy, evidence, and when it ships.",
  alternates: {
    canonical: `${site.url}/faq`,
  },
  openGraph: {
    title: "FAQ — PharmaGuide",
    description:
      "Frequently asked questions about PharmaGuide — what it is, how it works, privacy, evidence, and when it ships.",
    url: `${site.url}/faq`,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — PharmaGuide",
    description:
      "Frequently asked questions about PharmaGuide — what it is, how it works, privacy, evidence, and when it ships.",
  },
};

export default function FAQPage() {
  // FAQPage JSON-LD — gives Google the structured data it needs to
  // render the page as expandable rich results in search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <Header />
      <main id="main">
        {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
        <section
          aria-labelledby="faq-hero-heading"
          className="relative section-y-sm overflow-hidden"
        >
          {/* Same warm halo + capsule ambience as the homepage Problem
              section, dialed down — keeps the page feeling like the
              same site without competing for attention with the Q&A. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div
              className="absolute h-[140px] w-[480px] rounded-pill bg-accent/[0.06] blur-3xl"
              style={{ top: "-40px", right: "-160px", transform: "rotate(-10deg)" }}
            />
            <div
              className="absolute h-[100px] w-[340px] rounded-pill bg-foreground/[0.04] blur-3xl"
              style={{ top: "55%", left: "-120px", transform: "rotate(15deg)" }}
            />
          </div>

          <div className="container relative mx-auto">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center md:gap-9">
              <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
                FAQ
              </p>

              <h1
                id="faq-hero-heading"
                className="text-balance text-display-lg leading-[1.08] text-ink"
              >
                Everything you need to know{" "}
                <span className="font-serif italic text-accent">
                  about what we&apos;re building.
                </span>
              </h1>

              <p className="max-w-prose text-body-lg leading-relaxed text-muted">
                Privacy, evidence, accuracy, pricing — all the answers,
                without the marketing.
              </p>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━ ACCORDION ━━━━━━━━━━━━━━━━━━ */}
        <section
          aria-label="Frequently asked questions"
          className="relative pb-section-y"
        >
          <div className="container relative mx-auto">
            <FAQClient />
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━ BOTTOM CTA STRIP ━━━━━━━━━━━━━━━━━━ */}
        <section
          aria-label="Still have questions"
          className="relative section-y-sm border-t border-border bg-surface-subtle/40"
        >
          <div className="container relative mx-auto">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center md:gap-5">
              <p className="font-serif text-h2 italic leading-tight text-ink">
                Can&apos;t find your answer?
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 text-body-sm text-muted sm:gap-5">
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2 text-accent underline decoration-accent/40 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:decoration-accent"
                >
                  {site.email}
                </a>
                <span aria-hidden="true" className="text-border-strong">·</span>
                <Link
                  href="/#waitlist"
                  className="inline-flex items-center gap-1.5 text-accent underline decoration-accent/40 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:decoration-accent"
                >
                  Join the beta
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* FAQPage structured data — emitted as a script tag so Google
          can parse it for rich-result eligibility. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
