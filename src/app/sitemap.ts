import type { MetadataRoute } from "next";
import { getAllPosts, postModified } from "@/lib/blog";
import { PAGE_KEYS, pageSitemapEntry } from "@/lib/pages";
import { site } from "@/lib/site";

/**
 * /sitemap.xml — every registered page (lib/pages.ts) plus every post.
 *
 * `lastmod` is only emitted when we know a real content date. Stamping
 * every URL with the build time (the old behaviour) makes the dates
 * useless, and Google stops trusting a site's lastmod altogether — which
 * would hide the updates that matter, like a revised article.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latestPost = posts.map(postModified).sort().at(-1);

  const pages = PAGE_KEYS.map((key) =>
    // Home and the blog hub list the newest articles, so they change
    // when an article does.
    pageSitemapEntry(key, key === "home" || key === "blog" ? latestPost : undefined)
  );

  const articles: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: new Date(postModified(post)),
    changeFrequency: "monthly",
    priority: 0.7,
    ...(post.image ? { images: [`${site.url}${post.image}`] } : {}),
  }));

  return [...pages, ...articles];
}
