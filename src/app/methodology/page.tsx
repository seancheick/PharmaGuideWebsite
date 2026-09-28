import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MethodologyClient } from "@/components/methodology/MethodologyClient";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { ADVISORY_TEAM, DATA_SOURCES, METHODOLOGY_LAST_UPDATED } from "@/lib/methodology";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/shared/JsonLd";
import { PAGES, pageMetadata, pageSchema } from "@/lib/pages";
import { absoluteUrl, ref, schemaId } from "@/lib/schema";

/**
 * /methodology — premium content page documenting how interaction
 * data is sourced, verified, and shipped.
 *
 * Server-rendered. Metadata and the WebPage/breadcrumb nodes come from
 * the page registry (lib/pages.ts); this route adds an Article whose
 * authors are the clinicians' Person nodes (lib/people.ts). HowTo
 * markup was removed — Google retired HowTo rich results in 2023.
 *
 * The page itself is a client component because the entire body
 * uses Framer Motion staggered reveals.
 */

export const revalidate = 432000; // 5 days

export const metadata = pageMetadata("methodology");

export default function MethodologyPage() {
  const articleId = `${absoluteUrl("/methodology")}#article`;
  const schema = [
    ...pageSchema("methodology", { mainEntity: articleId }),
    {
      "@type": "Article",
      "@id": articleId,
      headline: PAGES.methodology.title,
      description: PAGES.methodology.description,
      datePublished: METHODOLOGY_LAST_UPDATED,
      dateModified: METHODOLOGY_LAST_UPDATED,
      author: ADVISORY_TEAM.map((p) => ref(schemaId.person(p))),
      publisher: ref(schemaId.organization),
      mainEntityOfPage: ref(schemaId.webpage("/methodology")),
      inLanguage: site.lang,
      citation: DATA_SOURCES.map((s) => ({ "@type": "CreativeWork", name: s.name })),
    },
  ];

  return (
    <>
      <Header />
      <main id="main">
      <MethodologyClient />
      <RelatedLinks
        eyebrow="Keep reading"
        headline="See it in practice"
        accent="and what we're writing about."
        links={[
          {
            label: "Features",
            title: "The 6 pillars in depth",
            description:
              "Medication depletion · Stack intelligence · Quality transparency · Personal fit · Nutrient accumulation · Recall awareness.",
            href: "/features",
          },
          {
            label: "Blog",
            title: "Evidence-graded writing",
            description:
              "Long-form guides on interactions, depletions, recalls — every claim cited, every post dated and signed.",
            href: "/blog",
          },
          {
            label: "FAQ",
            title: "The questions we hear most",
            description:
              "Privacy, accuracy, special populations, pricing, launch timing — answered honestly.",
            href: "/faq",
          },
        ]}
      />
      </main>
      <Footer />

      <JsonLd nodes={schema} />
    </>
  );
}
