import Link from "next/link";
import type { BlogPost } from "@/lib/blog-types";
import { formatBlogDate, getCategory } from "@/lib/blog-types";
import { BlogCardCover } from "./BlogCardCover";

/**
 * BlogListItem — compact horizontal row (the "list view" variant).
 *
 * Toggle target for users who prefer scanning over visual browsing.
 * Pattern matches Linear/Substack/GitHub Blog list views — small
 * thumbnail (1:1 square, 96px on mobile / 128px on desktop) on the
 * left, content stacked on the right.
 *
 * Aspect choice (1:1 vs 16:9): square thumbs read cleaner in a
 * vertical list at small sizes; 16:9 thumbs feel "TV episode-y" and
 * waste vertical space.
 *
 * Hover: row gets a subtle background tint + the title shifts to
 * accent. Image scales 1.04 (handled by BlogCardCover's group-hover).
 */

export function BlogListItem({ post }: { post: BlogPost }) {
  const cat = getCategory(post.category);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-4 shadow-xs transition-[transform,box-shadow,border-color,background-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-raised hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent sm:gap-5 sm:p-5 md:items-center"
    >
      {/* Thumbnail — 1:1 square, fixed-size based on viewport */}
      <div className="relative aspect-square h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28 md:h-32 md:w-32">
        <BlogCardCover
          post={post}
          sizes="(max-width: 768px) 128px, 144px"
        />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {/* Category + date eyebrow row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {cat && (
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-accent">
              {cat.shortLabel}
            </span>
          )}
          <span aria-hidden="true" className="text-border-strong">·</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            {formatBlogDate(post.date)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-h3 italic leading-snug text-ink transition-colors duration-fast ease-smooth group-hover:text-accent">
          {post.title}
        </h3>

        {/* Excerpt — clamped tighter in list view (1 line on mobile,
            2 on desktop) so each row stays compact + scannable */}
        <p className="line-clamp-1 text-body-sm leading-relaxed text-muted md:line-clamp-2">
          {post.description}
        </p>

        {/* Meta strip — author + read time */}
        <div className="flex items-center gap-3 pt-1 text-body-sm text-muted">
          <span className="text-foreground/85">{post.author}</span>
          <span aria-hidden="true" className="text-border-strong">·</span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]">
            {post.readTime}
          </span>
        </div>
      </div>

      {/* Read CTA — desktop only, subtle */}
      <span
        aria-hidden="true"
        className="hidden shrink-0 self-center text-muted transition-[color,transform] duration-fast ease-smooth group-hover:translate-x-0.5 group-hover:text-accent md:block"
      >
        →
      </span>
    </Link>
  );
}
