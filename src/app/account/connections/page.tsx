import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ConnectionsClient from "./connections-client";
import { PrivatePageBoundary } from "@/components/ai-connector/PrivatePageBoundary";

/** S5: see and end AI assistant connections. Linked from the consent card. */
export const metadata: Metadata = {
  title: "Connected AI assistants | PharmaGuide",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ConnectionsPage() {
  return (
    <>
      <Header />
      <main id="main" data-clarity-mask="true" className="mx-auto max-w-xl px-4 py-16">
        <PrivatePageBoundary><ConnectionsClient /></PrivatePageBoundary>
      </main>
      <Footer />
    </>
  );
}
