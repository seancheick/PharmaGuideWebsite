import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS_DOC } from "@/lib/terms";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata, pageSchema } from "@/lib/pages";

/**
 * /terms — PharmaGuide Terms of Service.
 *
 * Server-rendered with full metadata + structured data (TermsOfService
 * + Breadcrumb schemas). Content lives in src/lib/terms.ts so it can
 * be reviewed / updated without touching layout code.
 */

export const revalidate = 432000; // 5 days

export const metadata = pageMetadata("terms");

export default function TermsPage() {
  const schema = pageSchema("terms");

  return (
    <>
      <Header />
      <LegalPage doc={TERMS_DOC} />
      <Footer />

      <JsonLd nodes={schema} />
    </>
  );
}
