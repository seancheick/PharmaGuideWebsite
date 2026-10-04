"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { analyticsEnabled } from "@/lib/analytics";

/**
 * Vercel Web Analytics + Speed Insights, behind the same gate as Clarity
 * and GA4 (lib/analytics.ts analyticsEnabled): team devices and automated
 * browsers are dropped before anything is sent, so all four tools count
 * the same visits. A client component because beforeSend is a function.
 */
const gate = <T,>(event: T): T | null => (analyticsEnabled() ? event : null);

export function VercelInsights() {
  return (
    <>
      <Analytics beforeSend={gate} />
      <SpeedInsights beforeSend={gate} />
    </>
  );
}
