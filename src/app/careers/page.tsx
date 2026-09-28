import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CareersClient } from "@/components/careers/CareersClient";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata, pageSchema } from "@/lib/pages";

/**
 * /careers — recruiting page.
 * Honest framing: not always actively hiring; describes the kind of
 * roles we'd jump on if the right person reaches out. Reads better
 * to candidates than fake "6 open positions" pages.
 */

export const revalidate = 432000; // 5 days

export const metadata = pageMetadata("careers");

export default function CareersPage() {
  const schema = pageSchema("careers");

  return (
    <>
      <Header />
      <CareersClient />
      <RelatedLinks
        eyebrow="Before you write"
        headline="Worth reading first."
        links={[
          {
            label: "About",
            title: "Why this exists",
            description:
              "Founder origin, the gap we're closing, what we believe. Skip this and your application reads generic.",
            href: "/about",
          },
          {
            label: "Methodology",
            title: "How we ship",
            description:
              "Engineering culture in practice — sources, verification process, AI/human boundary, what we don't do.",
            href: "/methodology",
          },
          {
            label: "Features",
            title: "What you'd be working on",
            description:
              "Six pillars across mobile, backend, content, and clinical. The actual surface area of the product.",
            href: "/features",
          },
        ]}
      />
      <Footer />
      <JsonLd nodes={schema} />
    </>
  );
}
