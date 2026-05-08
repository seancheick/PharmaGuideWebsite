import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FeaturesClient } from "@/components/features/FeaturesClient";
import { PILLARS } from "@/lib/features";
import { site } from "@/lib/site";

/**
 * /features — full capabilities showcase across 6 pillars.
 *
 * Server-rendered with ISR (5d) + SoftwareApplication JSON-LD so the
 * search engines and AI crawlers get a structured product entity that
 * names every capability the page documents.
 *
 * The page itself is a client component (FeaturesClient) because
 * every section uses Framer Motion staggered reveals. Page-level
 * metadata + structured data are emitted server-side.
 */

export const revalidate = 432000; // 5 days

const description =
  "Every PharmaGuide capability — medication depletion detection, full-stack interaction analysis, ingredient & quality transparency, personal fit, nutrient accumulation tracking, and live FDA recall monitoring. Built on a 180,000-product on-device catalog reviewed by clinicians.";

export const metadata: Metadata = {
  title: "Features — PharmaGuide",
  description,
  alternates: { canonical: `${site.url}/features` },
  openGraph: {
    title: "Features — PharmaGuide",
    description,
    url: `${site.url}/features`,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Features — PharmaGuide",
    description,
  },
};

export default function FeaturesPage() {
  // SoftwareApplication schema — the most authoritative structured
  // data type for a consumer health/wellness app. Lists every pillar
  // as a featureList entry so search engines + AI crawlers can answer
  // "what does PharmaGuide do?" directly.
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${site.url}/features#software`,
    name: site.name,
    applicationCategory: "HealthApplication",
    applicationSubCategory: "Medication & Supplement Safety",
    operatingSystem: "iOS, Android",
    description,
    url: `${site.url}/features`,
    featureList: PILLARS.map((p) => `${p.titleLead} ${p.titleEm}`).join(" · "),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free during beta",
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/icon2.png`,
      },
    },
  };

  // ItemList schema for the 6 pillars — additional structured data
  // signal that crawlers can use to understand each capability.
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${site.url}/features#capabilities`,
    name: "PharmaGuide capabilities",
    numberOfItems: PILLARS.length,
    itemListElement: PILLARS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Thing",
        "@id": `${site.url}/features#${p.id}`,
        name: `${p.titleLead} ${p.titleEm}`,
        description: p.intro,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/features#breadcrumb`,
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
        name: "Features",
        item: `${site.url}/features`,
      },
    ],
  };

  return (
    <>
      <Header />
      <FeaturesClient />
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
