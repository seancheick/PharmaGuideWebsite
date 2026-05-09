import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MethodologyClient } from "@/components/methodology/MethodologyClient";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import {
  ADVISORY_TEAM,
  DATA_SOURCES,
  METHODOLOGY_LAST_UPDATED,
  PROCESS_STEPS,
} from "@/lib/methodology";
import { formatLegalDate } from "@/lib/legal";
import { site } from "@/lib/site";

/**
 * /methodology — premium content page documenting how interaction
 * data is sourced, verified, and shipped.
 *
 * Server-rendered with full metadata + structured data:
 *   • Article schema (this is editorial content, not a legal doc)
 *   • Breadcrumb schema (Home → Methodology)
 *   • Person schemas for each advisory member (helps Google's
 *     knowledge graph attribute clinical authorship)
 *   • HowTo schema for the 5-step process (rich-result eligibility)
 *
 * The page itself is a client component because the entire body
 * uses Framer Motion staggered reveals.
 */

export const revalidate = 432000; // 5 days

const description = `How PharmaGuide collects, verifies, and ships interaction data — the four primary sources, the five-step verification process, the medical advisory team, and exactly where human clinical judgment takes over. Last updated ${formatLegalDate(METHODOLOGY_LAST_UPDATED)}.`;

export const metadata: Metadata = {
  title: "Methodology",
  description,
  alternates: {
    canonical: `${site.url}/methodology`,
  },
  openGraph: {
    title: "Methodology",
    description,
    url: `${site.url}/methodology`,
    siteName: site.name,
    locale: site.locale,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Methodology",
    description,
  },
};

export default function MethodologyPage() {
  // Article schema — search engines treat this as authoritative content
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${site.url}/methodology#article`,
    headline: "PharmaGuide Methodology — How We Verify Interaction Data",
    description,
    datePublished: METHODOLOGY_LAST_UPDATED,
    dateModified: METHODOLOGY_LAST_UPDATED,
    author: ADVISORY_TEAM.map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.title,
    })),
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/icon2.png`,
      },
    },
    mainEntityOfPage: `${site.url}/methodology`,
    inLanguage: site.lang,
    citation: DATA_SOURCES.map((s) => ({
      "@type": "CreativeWork",
      name: s.name,
    })),
  };

  // HowTo schema — the 5-step verification process. Eligible for
  // Google's HowTo rich result with numbered step thumbnails.
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${site.url}/methodology#howto`,
    name: "How PharmaGuide verifies interaction data",
    description:
      "Five-step process from authoritative source identification through clinical advisory review to publication.",
    step: PROCESS_STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.body,
      ...(s.reviewer
        ? {
            performer: {
              "@type": "Person",
              name: s.reviewer,
            },
          }
        : {}),
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/methodology#breadcrumb`,
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
        name: "Methodology",
        item: `${site.url}/methodology`,
      },
    ],
  };

  return (
    <>
      <Header />
      <main id="main">
      <MethodologyClient />
      <RelatedLinks
        eyebrow="Keep reading"
        headline="See it in practice"
        accent="and what we're writing about."
        links={[
          {
            label: "Features",
            title: "The 6 pillars in depth",
            description:
              "Medication depletion · Stack intelligence · Quality transparency · Personal fit · Nutrient accumulation · Recall awareness.",
            href: "/features",
          },
          {
            label: "Blog",
            title: "Evidence-graded writing",
            description:
              "Long-form guides on interactions, depletions, recalls — every claim cited, every post reviewed.",
            href: "/blog",
          },
          {
            label: "FAQ",
            title: "The questions we hear most",
            description:
              "Privacy, accuracy, special populations, pricing, launch timing — answered honestly.",
            href: "/faq",
          },
        ]}
      />
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
