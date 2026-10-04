"use client";

import { useEffect } from "react";
import clarity from "@microsoft/clarity";
import { analyticsEnabled } from "@/lib/analytics";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * Microsoft Clarity — heatmaps + session recordings.
 * Initializes once on mount. No-ops if CLARITY_ID is missing or the visit
 * isn't counted (lib/analytics.ts analyticsEnabled).
 */
export function ClarityProvider() {
  useEffect(() => {
    if (CLARITY_ID && analyticsEnabled()) {
      clarity.init(CLARITY_ID);
    }
  }, []);

  return null;
}
