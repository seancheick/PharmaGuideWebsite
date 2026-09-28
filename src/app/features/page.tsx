import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FeaturesClient } from "@/components/features/FeaturesClient";
import { PILLARS } from "@/lib/features";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/shared/JsonLd";
import { PAGES, pageMetadata, pageSchema } from "@/lib/pages";
import { absoluteUrl, ref, schemaId } from "@/lib/schema";

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

export const metadata = pageMetadata("features");

const softwareId = `${absoluteUrl("/features")}#software`;

export default function FeaturesPage() {
  const schema = [
    ...pageSchema("features", { mainEntity: softwareId }),
    {
      "@type": "SoftwareApplication",
      "@id": softwareId,
      name: site.name,
      applicationCategory: "HealthApplication",
      applicationSubCategory: "Medication & Supplement Safety",
      operatingSystem: "iOS, Android",
      description: PAGES.features.description,
      url: absoluteUrl("/features"),
      featureList: PILLARS.map((p) => `${p.titleLead} ${p.titleEm}`),
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free during beta",
      },
      publisher: ref(schemaId.organization),
    },
    {
      "@type": "ItemList",
      "@id": `${absoluteUrl("/features")}#capabilities`,
      name: "PharmaGuide capabilities",
      numberOfItems: PILLARS.length,
      itemListElement: PILLARS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Thing",
          "@id": `${absoluteUrl("/features")}#${p.id}`,
          name: `${p.titleLead} ${p.titleEm}`,
          description: p.intro,
        },
      })),
    },
  ];

  return (
    <>
      <Header />
      <FeaturesClient />
      <Footer />

      <JsonLd nodes={schema} />
    </>
  );
}
