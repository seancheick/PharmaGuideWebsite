"use client";

import { useEffect, useState, type ReactNode } from "react";
import { privatePageNeedsReload } from "@/lib/analytics";

/** Never mount private content in a document that already started trackers. */
export function PrivatePageBoundary({ children }: { children: ReactNode }) {
  const [reload] = useState(privatePageNeedsReload);
  useEffect(() => {
    if (reload) window.location.reload();
  }, [reload]);
  return reload ? <p>Opening your private connection page…</p> : children;
}
