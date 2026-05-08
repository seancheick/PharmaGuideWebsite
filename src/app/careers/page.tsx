import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CareersClient } from "@/components/careers/CareersClient";
import { site } from "@/lib/site";

/**
 * /careers — recruiting page.
 * Honest framing: not always actively hiring; describes the kind of
 * roles we'd jump on if the right person reaches out. Reads better
 * to candidates than fake "6 open positions" pages.
 */

export const revalidate = 432000; // 5 days

const description =
  "Join the team building the world's first comprehensive drug-and-supplement interaction engine. Real clinical impact, ground-floor ownership, calm engineering culture.";

export const metadata: Metadata = {
  title: "Careers",
  description,
  alternates: { canonical: `${site.url}/careers` },
  openGraph: {
    title: "Careers",
    description,
    url: `${site.url}/careers`,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers",
    description,
  },
};

export default function CareersPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/careers#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Careers",
        item: `${site.url}/careers`,
      },
    ],
  };

  return (
    <>
      <Header />
      <CareersClient />
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
