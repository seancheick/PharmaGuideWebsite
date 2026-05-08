import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Auto-generated sitemap.xml. Add routes here as they ship.
 * Lives at /sitemap.xml — referenced from robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site.url}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // Future routes will be added here:
    // { url: `${site.url}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // { url: `${site.url}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // { url: `${site.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    // { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];
}
