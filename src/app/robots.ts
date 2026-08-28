import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * /robots.txt — exposes the sitemap and configures crawler access.
 * GEO-friendly: open by default, references canonical sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /s/ is deliberately NOT disallowed, despite holding thousands of
        // per-person share snapshots. Blocking it was tried on 2026-08-13 for
        // crawl-budget reasons and was wrong twice over:
        //
        //   1. It broke social unfurls. Slackbot, Twitterbot, Applebot and
        //      WhatsApp all honour robots.txt, so they could not fetch either
        //      /s/{code} or its opengraph-image — a shared link posted as a
        //      bare URL with no card, which is the entire point of the page.
        //   2. It defeated its own goal. A crawler that cannot fetch a URL
        //      never sees the `noindex` on it, so Google may still surface a
        //      disallowed URL it learned about elsewhere, with no snippet.
        //      `noindex` only works on pages crawlers are allowed to read.
        //
        // Every /s/ page sends `noindex, nofollow` (see s/[code]/page.tsx) and
        // none are in the sitemap, so they stay out of the index while
        // remaining fetchable by the crawlers that need to render the card.
        // /_next/ is not blocked either. Google's guidance is explicit: do not
        // block CSS or JavaScript, because Googlebot renders pages and needs
        // them to judge layout and mobile-friendliness. These are hashed,
        // immutable, already-public build assets — there is nothing to protect
        // and, on a site this size, no crawl budget to save by hiding them.
        disallow: ["/api/", "/preview/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
