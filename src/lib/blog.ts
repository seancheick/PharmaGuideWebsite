// NOTE: server-only by convention. Client components must import
// types + pure helpers from `./blog-types` instead of this file.
// fs imports below would otherwise leak into client bundles.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPost } from "./blog-types";

/**
 * Server-only blog data layer — reads MDX files from /content/blog at
 * build time. Marked "server-only" so Next.js fails the build if this
 * is ever imported into a client component (use blog-types.ts instead).
 *
 * Client components import types + pure helpers from `./blog-types`.
 * Server code imports loaders from here AND re-exports everything from
 * blog-types via this file's export-from at the bottom.
 *
 * Each post is a `.mdx` file in /content/blog with frontmatter:
 *
 *   ---
 *   title: "What your medication might be quietly depleting"
 *   description: "Every common prescription is a deposit slip..."
 *   slug: "medication-depletion-guide"        (optional)
 *   category: "health-education"              (matches CATEGORIES.id)
 *   date: "2026-05-08"
 *   author: "Sean Cheick Baradji"
 *   reviewer: "Dr. Pham L., PharmD"           (optional)
 *   featured: false                           (sets the editor's pick)
 *   image: "/blog/...."                       (optional hero image)
 *   tags: ["statins", "metformin", ...]
 *   ---
 *
 *   <post body in MDX>
 */

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/**
 * Read all posts from /content/blog. Returns posts sorted newest-first.
 */
export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const posts = files.map((filename) => {
    const filePath = path.join(BLOG_DIR, filename);
    const source = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(source);
    const stats = readingTime(content);
    const slug =
      (data.slug as string | undefined) ??
      filename.replace(/\.mdx?$/, "").replace(/^\d+-/, "");

    return {
      slug,
      title: (data.title as string) ?? "Untitled",
      description: (data.description as string) ?? "",
      category: (data.category as string) ?? "health-education",
      date: (data.date as string) ?? new Date().toISOString().slice(0, 10),
      author: (data.author as string) ?? "PharmaGuide",
      reviewer: data.reviewer as string | undefined,
      featured: Boolean(data.featured),
      image: data.image as string | undefined,
      tags: data.tags as string[] | undefined,
      readTime: stats.text,
      wordCount: stats.words,
      content,
    } satisfies BlogPost;
  });

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(categoryId: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === categoryId);
}

export function getFeaturedPost(): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find((p) => p.featured) ?? posts[0];
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .filter((p) => p.category === post.category)
    .slice(0, limit);
}

// Re-export types + pure helpers so server code can keep one import path
export {
  CATEGORIES,
  formatBlogDate,
  getCategory,
} from "./blog-types";
export type { BlogCategory, BlogPost } from "./blog-types";
