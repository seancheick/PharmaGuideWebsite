import type { Metadata } from "next";
import ConnectionsClient from "./connections-client";
import { PrivatePageBoundary } from "@/components/ai-connector/PrivatePageBoundary";

// Read the server provider mode per request, matching the API route configuration.
export const dynamic = "force-dynamic";

/** S5: see and end AI assistant connections. Linked from the consent card. */
export const metadata: Metadata = {
  title: "Connected AI assistants | PharmaGuide",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ConnectionsPage() {
  return (
    <PrivatePageBoundary>
      <ConnectionsClient workosMode={Boolean(process.env.WORKOS_ISSUER)} />
    </PrivatePageBoundary>
  );
}
