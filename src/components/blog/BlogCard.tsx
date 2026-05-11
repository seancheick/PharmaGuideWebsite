import Link from "next/link";
import type { BlogPost } from "@/lib/blog-types";
import { formatBlogDate, getCategory } from "@/lib/blog-types";
import { BlogCardCover } from "./BlogCardCover";

/**
 * BlogCard — image-top, content-below editorial card.
 *
 * Layout (Vercel/Stripe pattern):
 *   16:10 cover image at top (rounded with the card's outer radius)
 *   Category eyebrow + date
 *   Italic-serif title
 *   1-2 line excerpt
 *   Hairline divider + author + read time
 *
 * Hover: card lifts, shadow deepens, image scales gently. The cover
 * component handles its own image-zoom animation; we drive the lift +
 * shadow on the card wrapper.
 *
 * Used in the hub's recent-posts grid AND in the related-posts section
 * at the bottom of a post page.
 */

export function BlogCard({ post }: { post: BlogPost }) {
  const cat = getCategory(post.category);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition-[transform,box-shadow,border-color] duration-fast ease-smooth hover:-translate-y-1 hover:border-border-strong hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
    >
      {/* Cover (16:10) — fills the top of the card flush with corners */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <BlogCardCover post={post} />
        {/* Category badge — overlay top-left */}
        {cat && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-pill bg-surface/95 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink shadow-xs backdrop-blur-sm">
            {cat.shortLabel}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">
          {formatBlogDate(post.date)}
        </p>

        <h3 className="font-serif text-h2 italic leading-snug text-ink">
          {post.title}
        </h3>

        <p className="line-clamp-3 text-body-sm leading-relaxed text-muted">
          {post.description}
        </p>

        {/* Meta strip — date appears above title; this row carries the
            read-time only (author belongs on the post page byline, not
            on the listing card where it adds noise without value). */}
        <div className="mt-auto flex items-center gap-3 border-t border-border pt-4 text-body-sm text-muted">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]">
            {post.readTime}
          </span>
        </div>
      </div>
    </Link>
  );
}
