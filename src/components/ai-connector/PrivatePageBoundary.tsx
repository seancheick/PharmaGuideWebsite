"use client";

import { useEffect, useState, type ReactNode } from "react";
import { privatePageNeedsReload } from "@/lib/analytics";

/** Never mount private content in a document that already started trackers. */
export function PrivatePageBoundary({ children }: { children: ReactNode }) {
  const [reload] = useState(privatePageNeedsReload);
  useEffect(() => {
    if (reload) window.location.reload();
  }, [reload]);
  return (
    <main id="main" data-clarity-mask="true" className="mx-auto min-h-screen max-w-xl px-5 pb-16 pt-8 sm:pt-12">
      <p className="mb-8 inline-block text-lg font-semibold tracking-tight text-neutral-900">PharmaGuide</p>
      {reload ? <p>Opening your private connection page…</p> : children}
    </main>
  );
}
