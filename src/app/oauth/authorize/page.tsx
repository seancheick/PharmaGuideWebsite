import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ConsentClient from "./consent-client";
import { PrivatePageBoundary } from "@/components/ai-connector/PrivatePageBoundary";

/**
 * Supabase Auth's OAuth 2.1 server sends a user here with ?authorization_id=…
 * when an AI assistant asks to connect (Authentication → OAuth Server →
 * authorization path). The card implements S3 and S4 of the AI connector
 * threat model; /api/ai-connections writes the connection on approval.
 */
export const metadata: Metadata = {
  title: "Connect an AI assistant | PharmaGuide",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AuthorizePage() {
  return (
    <>
      <Header />
      <main id="main" data-clarity-mask="true" className="mx-auto max-w-xl px-4 py-16">
        <PrivatePageBoundary><Suspense fallback={<p className="text-neutral-500">Loading…</p>}>
          <ConsentClient />
        </Suspense></PrivatePageBoundary>
      </main>
      <Footer />
    </>
  );
}
