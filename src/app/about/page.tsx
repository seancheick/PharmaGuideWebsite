import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AboutClient } from "@/components/about/AboutClient";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { site } from "@/lib/site";

/**
 * /about — refreshed from the legacy WordPress version.
 *
 * Voice rules applied: second-person, no banned words, italic-serif
 * punchline rhythm, restraint over decoration. The original "supplement
 * industry was built to sell, not to protect you" hook is kept because
 * it's strong and on-brand.
 *
 * AboutPage + Person (founder) + Organization JSON-LD for crawler clarity.
 */

export const revalidate = 432000; // 5 days

const description =
  "Why PharmaGuide exists, what we believe, and who builds it. The supplement industry was built to sell, not to protect you. We're closing that gap.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: `${site.url}/about` },
  openGraph: {
    title: "About",
    description,
    url: `${site.url}/about`,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About",
    description,
  },
};

export default function AboutPage() {
  // AboutPage + organization context
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${site.url}/about#aboutpage`,
    name: "About PharmaGuide",
    description,
    url: `${site.url}/about`,
    inLanguage: site.lang,
    mainEntity: {
      "@type": "Organization",
      "@id": `${site.url}#organization`,
      name: site.name,
      url: site.url,
      foundingDate: "2025",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Boston",
        addressRegion: "MA",
        addressCountry: site.country,
      },
      founder: {
        "@type": "Person",
        name: "Sean Cheick Baradji",
        jobTitle: "Founder & CEO",
      },
      employee: [
        {
          "@type": "Person",
          name: "Dr. Pham L., PharmD",
          jobTitle: "Clinical Pharmacist",
        },
        {
          "@type": "Person",
          name: "Miriam D., NP",
          jobTitle: "Nurse Practitioner",
        },
      ],
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${site.url}/about#breadcrumb`,
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
        name: "About",
        item: `${site.url}/about`,
      },
    ],
  };

  return (
    <>
      <Header />
      <main id="main">
      <AboutClient />
      <RelatedLinks
        eyebrow="Keep reading"
        headline="More on what we do"
        accent="and how."
        links={[
          {
            label: "Methodology",
            title: "How we verify every interaction",
            description:
              "Sources, the 5-step verification process, the clinical advisory team, AI transparency.",
            href: "/methodology",
          },
          {
            label: "Features",
            title: "What PharmaGuide actually does",
            description:
              "Six pillars: depletion detection, stack intelligence, ingredient transparency, fit, accumulation, recalls.",
            href: "/features",
          },
          {
            label: "Careers",
            title: "Want to help build it?",
            description:
              "Small team. Real clinical impact. The shapes of people we'd jump on hiring.",
            href: "/careers",
          },
        ]}
      />
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
