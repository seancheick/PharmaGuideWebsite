import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalPage } from "@/components/legal/LegalPage";
import { HIPAA_DOC } from "@/lib/hipaa";
import { formatLegalDate } from "@/lib/legal";
import { site } from "@/lib/site";

/**
 * /hipaa — HIPAA Statement page.
 *
 * Uses the shared LegalPage component (same shell as /privacy + /terms).
 * Honest framing: explains where HIPAA actually applies, why we use
 * its Security Rule as a design baseline, and previews the upcoming
 * Healthcare Pros tier where HIPAA fully applies.
 */

export const revalidate = 432000; // 5 days

const description = `PharmaGuide's HIPAA statement — what HIPAA actually covers, why we treat the Security Rule as a design baseline, and how on-device data architecture changes the equation. Last updated ${formatLegalDate(HIPAA_DOC.lastUpdated)}.`;

export const metadata: Metadata = {
  title: "HIPAA Statement",
  description,
  alternates: { canonical: `${site.url}/hipaa` },
  openGraph: {
    title: "HIPAA Statement",
    description,
    url: `${site.url}/hipaa`,
    siteName: site.name,
    locale: site.locale,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "HIPAA Statement",
    description,
  },
};

export default function HipaaPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${site.url}/hipaa#article`,
    headline: "PharmaGuide HIPAA Statement",
    description,
    dateModified: HIPAA_DOC.lastUpdated,
    inLanguage: site.lang,
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/hipaa#breadcrumb`,
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
        name: "HIPAA",
        item: `${site.url}/hipaa`,
      },
    ],
  };

  return (
    <>
      <Header />
      <LegalPage doc={HIPAA_DOC} />
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
