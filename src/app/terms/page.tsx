import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS_DOC } from "@/lib/terms";
import { formatLegalDate } from "@/lib/legal";
import { site } from "@/lib/site";

/**
 * /terms — PharmaGuide Terms of Service.
 *
 * Server-rendered with full metadata + structured data (TermsOfService
 * + Breadcrumb schemas). Content lives in src/lib/terms.ts so it can
 * be reviewed / updated without touching layout code.
 */

export const revalidate = 432000; // 5 days

const description = `Terms of Service for PharmaGuide — eligibility, medical disclaimer, acceptable use, and the rules of the road. Last updated ${formatLegalDate(TERMS_DOC.lastUpdated)}.`;

export const metadata: Metadata = {
  title: "Terms of Service",
  description,
  alternates: {
    canonical: `${site.url}/terms`,
  },
  openGraph: {
    title: "Terms of Service",
    description,
    url: `${site.url}/terms`,
    siteName: site.name,
    locale: site.locale,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service",
    description,
  },
};

export default function TermsPage() {
  const termsJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}/terms#termsofservice`,
    name: "PharmaGuide Terms of Service",
    url: `${site.url}/terms`,
    description,
    inLanguage: site.lang,
    dateModified: TERMS_DOC.lastUpdated,
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/terms#breadcrumb`,
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
        name: "Terms",
        item: `${site.url}/terms`,
      },
    ],
  };

  return (
    <>
      <Header />
      <LegalPage doc={TERMS_DOC} />
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
