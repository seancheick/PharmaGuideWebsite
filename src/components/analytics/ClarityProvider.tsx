"use client";

import { useEffect } from "react";
import clarity from "@microsoft/clarity";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * Microsoft Clarity — heatmaps + session recordings.
 * Initializes once on mount. No-ops if CLARITY_ID is missing.
 */
export function ClarityProvider() {
  useEffect(() => {
    if (CLARITY_ID) {
      clarity.init(CLARITY_ID);
    }
  }, []);

  return null;
}
