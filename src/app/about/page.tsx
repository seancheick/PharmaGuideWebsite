import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AboutClient } from "@/components/about/AboutClient";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata, pageSchema } from "@/lib/pages";
import { schemaId } from "@/lib/schema";

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

export const metadata = pageMetadata("about");

export default function AboutPage() {
  const schema = pageSchema("about", { mainEntity: schemaId.organization });

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

      <JsonLd nodes={schema} />
    </>
  );
}
