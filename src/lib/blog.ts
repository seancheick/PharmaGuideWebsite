// NOTE: server-only by convention. Client components must import
// types + pure helpers from `./blog-types` instead of this file.
// fs imports below would otherwise leak into client bundles.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPost, RecallSummary } from "./blog-types";
import { findPerson, type PersonId } from "./people";

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
 *   updated_at: "2026-06-24"                  (optional — last substantive edit)
 *   author: "sean-cheick-baradji"             (lib/people.ts id or name)
 *   reviewer: "laurie-pham"                   (optional, same rule)
 *   reviewed_at: "2026-06-24"                 (optional — reviewer sign-off)
 *   featured: false                           (sets the editor's pick)
 *   image: "/blog/...."                       (optional hero image)
 *   tags: ["statins", "metformin", ...]
 *   ---
 *
 *   <post body in MDX>
 */

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/**
 * A byline is a claim about a real person. If the frontmatter names someone
 * who isn't in lib/people.ts, stop the build rather than publish a name we
 * can't link to a profile or credential.
 */
function resolvePersonId(value: unknown, field: string, filename: string): PersonId {
  const person = typeof value === "string" ? findPerson(value) : undefined;
  if (!person) {
    throw new Error(
      `content/blog/${filename}: ${field} "${String(value)}" is not in src/lib/people.ts`
    );
  }
  return person.id;
}

/**
 * Read all posts from /content/blog. Returns posts sorted newest-first.
 */
/**
 * Drafts (content/blog/.drafts/) render only on Vercel preview deployments,
 * so the PharmD can review a post on a real URL before `pnpm blog:approve`.
 * Never in production, whatever else is set. BLOG_SHOW_DRAFTS=1 does the
 * same for a local `pnpm build && pnpm start`.
 */
export function draftsVisible(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;
  return process.env.VERCEL_ENV === "preview" || process.env.BLOG_SHOW_DRAFTS === "1";
}

/**
 * Published posts only. Everything that lists posts (hub, sitemap, feed,
 * llms.txt, related posts) uses this, so a draft never appears in an index,
 * even on a preview.
 */
export function getAllPosts(): BlogPost[] {
  return readPosts(BLOG_DIR, false);
}

/** Drafts, on preview deployments only (see draftsVisible). */
function getDraftPosts(): BlogPost[] {
  return draftsVisible() ? readPosts(path.join(BLOG_DIR, ".drafts"), true) : [];
}

/**
 * Every slug the post route renders: published posts plus, on previews,
 * drafts (a draft of a live post shares its slug).
 */
export function getRenderableSlugs(): string[] {
  return [...new Set([...getAllPosts(), ...getDraftPosts()].map((p) => p.slug))];
}

function readPosts(dir: string, isDraft: boolean): BlogPost[] {
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const posts = files.map((filename) => {
    const filePath = path.join(dir, filename);
    const source = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(source);
    const stats = readingTime(content);
    const slug =
      (data.slug as string | undefined) ??
      filename.replace(/\.mdx?$/, "").replace(/^\d+-/, "");

    // Governance frontmatter keys arrive snake_case from YAML; map to
    // camelCase on the BlogPost shape. Older posts won't have them.
    const reviewRequired =
      data.review_required !== undefined
        ? Boolean(data.review_required)
        : data.reviewRequired !== undefined
          ? Boolean(data.reviewRequired)
          : undefined;
    const evidenceLevel = (data.evidence_level ??
      data.evidenceLevel) as BlogPost["evidenceLevel"];

    return {
      slug,
      title: (data.title as string) ?? "Untitled",
      seoTitle: (data.seoTitle ?? data.seo_title) as string | undefined,
      description: (data.description as string) ?? "",
      category: (data.category as string) ?? "health-education",
      date: (data.date as string) ?? new Date().toISOString().slice(0, 10),
      updatedAt: (data.updated_at ?? data.updatedAt) as string | undefined,
      authorId: resolvePersonId(data.author, "author", filename),
      reviewerId: data.reviewer
        ? resolvePersonId(data.reviewer, "reviewer", filename)
        : undefined,
      reviewedAt: (data.reviewed_at ?? data.reviewedAt) as string | undefined,
      featured: Boolean(data.featured),
      image: data.image as string | undefined,
      tags: data.tags as string[] | undefined,
      readTime: stats.text,
      wordCount: stats.words,
      content,
      reviewRequired,
      evidenceLevel,
      ...(data.format === "recall-digest" ? { recall: recallSummary(data.title as string, content) } : {}),
      ...(isDraft ? { isDraft } : {}),
    } satisfies BlogPost;
  });

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

/** On previews a draft wins, so an update to a live post shows the new version. */
// Reads what scripts/lib/recalls.mjs writes: the title "Supplement recalls:
// <week>", one <RecallCard> per recall, and "still being checked" while
// FDA records are unclassified.
function recallSummary(title: string, content: string): RecallSummary {
  return {
    week: (title ?? "").replace(/^Supplement recalls:\s*/, ""),
    count: (content.match(/<RecallCard\b/g) ?? []).length,
    unsettled: /still being checked/.test(content),
  };
}

/** The newest weekly recall roundup, linked from the blog hub. */
export function getLatestRecallDigest(): BlogPost | undefined {
  return getAllPosts().find((p) => p.recall);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getDraftPosts().find((p) => p.slug === slug) ?? getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(categoryId: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === categoryId);
}

export function getFeaturedPost(): BlogPost | undefined {
  const posts = getAllPosts();
  // Weekly recall roundups never become the editor's pick by being newest.
  return posts.find((p) => p.featured) ?? posts.find((p) => !p.recall);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  // Recall roundups relate to each other, never under a regular article.
  const all = getAllPosts().filter((p) => p.slug !== post.slug && (post.recall || !p.recall));
  const sameCategory = all.filter((p) => p.category === post.category);
  // Fall back to most recent posts when the category has no other entries
  const pool = sameCategory.length > 0 ? sameCategory : all;
  return pool.slice(0, limit);
}

// Re-export types + pure helpers so server code can keep one import path
export {
  CATEGORIES,
  formatBlogDate,
  getCategory,
  postModified,
  recallCountLabel,
  toCardPost,
} from "./blog-types";
export type { BlogCardPost, BlogCategory, BlogPost } from "./blog-types";
