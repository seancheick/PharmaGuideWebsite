import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY_DOC } from "@/lib/privacy";
import { formatLegalDate } from "@/lib/legal";
import { site } from "@/lib/site";

/**
 * /privacy — PharmaGuide Privacy Policy.
 *
 * Server-rendered with full metadata + structured data (PrivacyPolicy
 * + Breadcrumb + WebPage schemas). Content lives in src/lib/privacy.ts
 * so it can be reviewed / updated without touching layout code.
 *
 * ISR matches the homepage (5d) so a content edit propagates to
 * production within the rolling boundary without manual rebuild.
 */

export const revalidate = 432000; // 5 days

const description = `PharmaGuide privacy policy — what we collect, why, and how to control it. Your supplement stack and conditions stay on your device. Last updated ${formatLegalDate(PRIVACY_DOC.lastUpdated)}.`;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: {
    canonical: `${site.url}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy",
    description,
    url: `${site.url}/privacy`,
    siteName: site.name,
    locale: site.locale,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy",
    description,
  },
};

export default function PrivacyPage() {
  // PrivacyPolicy schema + Breadcrumb + WebPage — emitted as structured
  // data for Google + AI crawlers.
  const privacyJsonLd = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    "@id": `${site.url}/privacy#privacypolicy`,
    name: "PharmaGuide Privacy Policy",
    url: `${site.url}/privacy`,
    description,
    inLanguage: site.locale,
    dateModified: PRIVACY_DOC.lastUpdated,
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/privacy#breadcrumb`,
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
        name: "Privacy",
        item: `${site.url}/privacy`,
      },
    ],
  };

  return (
    <>
      <Header />
      <LegalPage doc={PRIVACY_DOC} />
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
