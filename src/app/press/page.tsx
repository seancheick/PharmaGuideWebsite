import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PressClient } from "@/components/press/PressClient";
import { site } from "@/lib/site";

/**
 * /press — Press & Media page.
 * Quick facts, three boilerplate lengths, leadership bios, brand
 * assets, brand-usage rules, press contact.
 */

export const revalidate = 432000; // 5 days

const description =
  "Press kit for PharmaGuide. Boilerplate descriptions, leadership bios, brand assets, and the press contact. We respond within one business day.";

export const metadata: Metadata = {
  title: "Press & Media",
  description,
  alternates: { canonical: `${site.url}/press` },
  openGraph: {
    title: "Press & Media",
    description,
    url: `${site.url}/press`,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Press & Media",
    description,
  },
};

export default function PressPage() {
  // Organization JSON-LD on this page is denser than the global one
  // because press crawlers and AI knowledge-graph services parse this
  // page specifically.
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}#organization`,
    name: site.name,
    legalName: "PharmaGuide Inc.",
    alternateName: "B&Br Technology",
    url: site.url,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/icon2.png`,
      width: 512,
      height: 512,
    },
    description: site.description,
    foundingDate: "2025",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Boston",
      addressRegion: "MA",
      addressCountry: "US",
    },
    founder: {
      "@type": "Person",
      name: "Sean Cheick Baradji",
      jobTitle: "Founder & CEO",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "press inquiries",
        email: "press@pharmaguide.io",
      },
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: site.email,
      },
    ],
    sameAs: [
      `https://twitter.com/${site.twitter.replace("@", "")}`,
      "https://linkedin.com/company/pharmaguide",
      "https://instagram.com/pharmaguide.io",
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/press#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Press & Media",
        item: `${site.url}/press`,
      },
    ],
  };

  return (
    <>
      <Header />
      <PressClient />
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
