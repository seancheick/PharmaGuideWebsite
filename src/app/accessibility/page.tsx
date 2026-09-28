import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalPage } from "@/components/legal/LegalPage";
import { ACCESSIBILITY_DOC } from "@/lib/accessibility";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata, pageSchema } from "@/lib/pages";

/**
 * /accessibility — PharmaGuide Accessibility Statement.
 * Same shell as /privacy + /terms + /hipaa via LegalPage component.
 */

export const revalidate = 432000; // 5 days

export const metadata = pageMetadata("accessibility");

export default function AccessibilityPage() {
  const schema = pageSchema("accessibility");

  return (
    <>
      <Header />
      <LegalPage doc={ACCESSIBILITY_DOC} />
      <Footer />

      <JsonLd nodes={schema} />
    </>
  );
}
