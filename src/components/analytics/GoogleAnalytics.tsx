"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { analyticsEnabled } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const noop = () => () => {};

/**
 * Google Analytics 4 — page views + event tracking.
 * `lazyOnload` loads it in browser idle time after the page is done.
 * `afterInteractive` also emitted a high-priority <link rel=preload> for
 * gtag.js in <head>, which competed with CSS and fonts for bandwidth on
 * slow mobile connections. No-ops if GA_ID is missing or the visit isn't
 * counted (lib/analytics.ts analyticsEnabled — false on the server, so
 * the scripts are added after hydration, which lazyOnload did anyway).
 */
export function GoogleAnalytics() {
  const enabled = useSyncExternalStore(noop, analyticsEnabled, () => false);
  if (!GA_ID || !enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      <Script id="ga-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
