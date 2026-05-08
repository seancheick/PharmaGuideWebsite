import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalPage } from "@/components/legal/LegalPage";
import { ACCESSIBILITY_DOC } from "@/lib/accessibility";
import { formatLegalDate } from "@/lib/legal";
import { site } from "@/lib/site";

/**
 * /accessibility — PharmaGuide Accessibility Statement.
 * Same shell as /privacy + /terms + /hipaa via LegalPage component.
 */

export const revalidate = 432000; // 5 days

const description = `PharmaGuide accessibility statement — WCAG 2.2 AA target, what's already in place across the website and mobile apps, what's in progress, and how to report something that doesn't work for you. Last updated ${formatLegalDate(ACCESSIBILITY_DOC.lastUpdated)}.`;

export const metadata: Metadata = {
  title: "Accessibility — PharmaGuide",
  description,
  alternates: { canonical: `${site.url}/accessibility` },
  openGraph: {
    title: "Accessibility — PharmaGuide",
    description,
    url: `${site.url}/accessibility`,
    siteName: site.name,
    locale: site.locale,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility — PharmaGuide",
    description,
  },
};

export default function AccessibilityPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${site.url}/accessibility#article`,
    headline: "PharmaGuide Accessibility Statement",
    description,
    dateModified: ACCESSIBILITY_DOC.lastUpdated,
    inLanguage: site.locale,
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/accessibility#breadcrumb`,
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
        name: "Accessibility",
        item: `${site.url}/accessibility`,
      },
    ],
  };

  return (
    <>
      <Header />
      <LegalPage doc={ACCESSIBILITY_DOC} />
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
