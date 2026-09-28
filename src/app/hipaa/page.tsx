import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalPage } from "@/components/legal/LegalPage";
import { HipaaProvidersForm } from "@/components/legal/HipaaProvidersForm";
import { HIPAA_DOC } from "@/lib/hipaa";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata, pageSchema } from "@/lib/pages";

/**
 * /hipaa — HIPAA Statement page.
 *
 * Uses the shared LegalPage component (same shell as /privacy + /terms).
 * Honest framing: explains where HIPAA actually applies, why we use
 * its Security Rule as a design baseline, and previews the upcoming
 * Healthcare Pros tier where HIPAA fully applies.
 */

export const revalidate = 432000; // 5 days

export const metadata = pageMetadata("hipaa");

export default function HipaaPage() {
  const schema = pageSchema("hipaa");

  return (
    <>
      <Header />
      <LegalPage
        doc={HIPAA_DOC}
        slots={{
          // Section 5 is "PharmaGuide for Healthcare Pros (2026)" —
          // the highest-intent surface for clinician leads. Replaces
          // a passive mailto with a structured form that lands in the
          // providers inbox.
          "professional-tier": <HipaaProvidersForm />,
        }}
      />
      <Footer />

      <JsonLd nodes={schema} />
    </>
  );
}
