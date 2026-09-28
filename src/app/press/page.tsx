import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PressClient } from "@/components/press/PressClient";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata, pageSchema } from "@/lib/pages";
import { ref, schemaId } from "@/lib/schema";

/**
 * /press — Press & Media page.
 * Quick facts, three boilerplate lengths, leadership bios, brand
 * assets, brand-usage rules, press contact.
 */

export const revalidate = 432000; // 5 days

export const metadata = pageMetadata("press");

export default function PressPage() {
  const schema = pageSchema("press", { extra: { about: ref(schemaId.organization) } });

  return (
    <>
      <Header />
      <PressClient />
      <RelatedLinks
        eyebrow="For your story"
        headline="Background reading,"
        accent="primary sources."
        links={[
          {
            label: "About",
            title: "Why we built PharmaGuide",
            description:
              "Founder origin story, the supplement-industry critique, what we believe — written in plain English.",
            href: "/about",
          },
          {
            label: "Methodology",
            title: "How we verify every interaction",
            description:
              "Sources, the 5-step process, the medical advisory team, AI transparency. The proof behind every claim.",
            href: "/methodology",
          },
          {
            label: "Features",
            title: "What the product actually does",
            description:
              "Medication depletion, stack intelligence, ingredient transparency, recall monitoring — pillar by pillar.",
            href: "/features",
          },
        ]}
      />
      <Footer />
      <JsonLd nodes={schema} />
    </>
  );
}
