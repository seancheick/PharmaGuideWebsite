import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { site } from "@/lib/site";

/**
 * Auto-generated sitemap.xml. Add static routes manually below;
 * blog posts are added dynamically by reading /content/blog at
 * build time via getAllPosts.
 *
 * Lives at /sitemap.xml — referenced from robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Dynamic blog post entries — one per .mdx file in /content/blog
  const blogPostEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: site.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site.url}/features`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${site.url}/methodology`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${site.url}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${site.url}/careers`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site.url}/press`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site.url}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...blogPostEntries,
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
    {
      url: `${site.url}/hipaa`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${site.url}/accessibility`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    // Future routes will be added here:
    // { url: `${site.url}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // { url: `${site.url}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    // { url: `${site.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    // { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];
}
