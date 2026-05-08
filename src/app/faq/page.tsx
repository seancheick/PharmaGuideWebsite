import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FAQClient } from "@/components/faq/FAQClient";
import { NewsletterCTA } from "@/components/faq/NewsletterCTA";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
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
  title: "FAQ",
  description:
    "Frequently asked questions about PharmaGuide — what it is, how it works, privacy, evidence, and when it ships.",
  alternates: {
    canonical: `${site.url}/faq`,
  },
  openGraph: {
    title: "FAQ",
    description:
      "Frequently asked questions about PharmaGuide — what it is, how it works, privacy, evidence, and when it ships.",
    url: `${site.url}/faq`,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ",
    description:
      "Frequently asked questions about PharmaGuide — what it is, how it works, privacy, evidence, and when it ships.",
  },
};

export default function FAQPage() {
  // FAQPage JSON-LD — Google rich-result eligibility for expandable
  // Q&A snippets in search.
  const faqJsonLd = {
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

  // Breadcrumb JSON-LD — helps Google show breadcrumb trails in
  // search results AND signals page hierarchy to AI crawlers.
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "FAQ",
        item: `${site.url}/faq`,
      },
    ],
  };

  // WebPage schema — gives crawlers a clean structured anchor for
  // the page itself (separate from the embedded FAQPage entity).
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}/faq#webpage`,
    url: `${site.url}/faq`,
    name: "FAQ",
    description:
      "Frequently asked questions about PharmaGuide — what it is, how it works, privacy, evidence, and when it ships.",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${site.url}#website`,
      name: site.name,
      url: site.url,
    },
    inLanguage: site.locale,
    breadcrumb: { "@id": `${site.url}/faq#breadcrumb` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${site.url}/opengraph-image`,
    },
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

        {/* Cross-links — give visitors who got an answer here a
            natural next step into deeper content. */}
        <RelatedLinks
          eyebrow="Beyond the FAQ"
          headline="More to dig into"
          accent="if any of this stuck."
          links={[
            {
              label: "Features",
              title: "The 6 product pillars",
              description:
                "Including the unique ones: medication depletion, ingredient transparency, nutrient accumulation, recall monitoring.",
              href: "/features",
            },
            {
              label: "Methodology",
              title: "Where evidence comes from",
              description:
                "FDA, NIH, PubMed, Cochrane sources + the 5-step verification process behind every interaction.",
              href: "/methodology",
            },
            {
              label: "Blog",
              title: "Long-form guides",
              description:
                "Every claim cited. Every post reviewed by a clinical pharmacist before it ships.",
              href: "/blog",
            },
          ]}
        />

        {/* ━━━━━━━━━━━━━━━━━━ NEWSLETTER CTA ━━━━━━━━━━━━━━━━━━
            Replaced the old "Can't find your answer?" strip.
            Newsletter is a lower-commitment on-ramp than the
            homepage's beta CTA — captures readers who aren't ready
            to commit but want to stay informed. The inline email
            link inside NewsletterCTA preserves the "still have a
            specific question" escape hatch.                       */}
        <NewsletterCTA />
      </main>
      <Footer />

      {/* Structured data for Google + AI crawlers.
          - FAQPage: rich-result eligibility for expandable Q&A
          - BreadcrumbList: search-result breadcrumb trail
          - WebPage: clean page-level entity
          Emitted as separate <script> tags (Google's preference). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        id="breadcrumb-schema"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...breadcrumbJsonLd,
            "@id": `${site.url}/faq#breadcrumb`,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
    </>
  );
}
