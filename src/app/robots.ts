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
        // /s/ holds per-person share snapshots. Each page already sends
        // `noindex`, but that only helps after a crawler has fetched it —
        // disallowing the prefix keeps thousands of near-duplicate product
        // pages out of the crawl budget entirely, so the pages meant to rank
        // are the ones getting crawled.
        disallow: ["/api/", "/_next/", "/preview/", "/s/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
