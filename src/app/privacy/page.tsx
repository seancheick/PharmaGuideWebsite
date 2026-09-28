import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY_DOC } from "@/lib/privacy";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata, pageSchema } from "@/lib/pages";

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

export const metadata = pageMetadata("privacy");

export default function PrivacyPage() {
  const schema = pageSchema("privacy");

  return (
    <>
      <Header />
      <LegalPage doc={PRIVACY_DOC} />
      <Footer />

      <JsonLd nodes={schema} />
    </>
  );
}
