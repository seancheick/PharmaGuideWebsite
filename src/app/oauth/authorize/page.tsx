import type { Metadata } from "next";
import { Suspense } from "react";
import ConsentClient from "./consent-client";
import { PrivatePageBoundary } from "@/components/ai-connector/PrivatePageBoundary";

/**
 * external_auth_id: sign in, then explicitly continue to WorkOS hosted consent.
 * authorization_id: review an authenticated pending setup and approve by phone.
 * The server route owns request verification; URL parameters never name a client.
 */
export const metadata: Metadata = {
  title: "Connect an AI assistant | PharmaGuide",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AuthorizePage() {
  return (
    <PrivatePageBoundary>
      <Suspense fallback={<p className="text-neutral-500">Loading…</p>}>
        <ConsentClient />
      </Suspense>
    </PrivatePageBoundary>
  );
}
