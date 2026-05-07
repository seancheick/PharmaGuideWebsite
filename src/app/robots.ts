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
        disallow: ["/api/", "/_next/", "/preview/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
