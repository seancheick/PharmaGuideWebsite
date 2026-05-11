import Link from "next/link";
import type { BlogPost } from "@/lib/blog-types";
import { formatBlogDate, getCategory } from "@/lib/blog-types";
import { BlogCardCover } from "./BlogCardCover";

/**
 * BlogFeaturedCard — the Editor's Pick at the top of /blog.
 *
 * Layout:
 *   md+   Two-column 60/40 split. Image fills the left 60%, content
 *         lives in the right 40% with generous padding. Min-height
 *         keeps both sides in proportion regardless of content length.
 *   <md   Stacks vertically. Image on top (16:10), content below.
 *
 * Visually distinct from grid cards by:
 *   • Larger overall size (full-width up to max-w-6xl)
 *   • Larger title (text-display-md, italic-serif)
 *   • More generous content padding
 *   • "Editor's Pick" eyebrow above the category badge
 *
 * Hover same as grid cards — card lifts, shadow deepens, image scales.
 */

export function BlogFeaturedCard({ post }: { post: BlogPost }) {
  const cat = getCategory(post.category);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-md transition-[transform,box-shadow,border-color] duration-fast ease-smooth hover:-translate-y-1 hover:border-border-strong hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent md:grid md:grid-cols-[3fr_2fr] md:gap-0"
    >
      {/* Cover — 60% on desktop (3fr of 5fr), full-width 16:10 on mobile */}
      <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:h-full md:min-h-[420px]">
        <BlogCardCover
          post={post}
          sizes="(max-width: 768px) 100vw, 60vw"
        />
        {/* Pill row: SPOTLIGHT (featured flag) + category. Two pills
            side-by-side on the image, top-left. The featured pill is
            accent-teal-on-white (the loudest visual on the card); the
            category pill is ink-on-white (informational). */}
        <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2 sm:left-6 sm:top-6">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white shadow-xs">
            <span aria-hidden="true" className="block h-1 w-1 rounded-full bg-white/90" />
            Spotlight
          </span>
          {cat && (
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface/95 px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink shadow-xs backdrop-blur-sm">
              {cat.shortLabel}
            </span>
          )}
        </div>
      </div>

      {/* Content — 40% on desktop */}
      <div className="flex flex-col justify-center gap-5 p-7 md:p-9 lg:p-10">
        <h3 className="text-balance font-serif text-display-sm italic leading-tight text-ink md:text-display-md">
          {post.title}
        </h3>

        <p className="line-clamp-4 text-body leading-relaxed text-muted">
          {post.description}
        </p>

        {/* Meta strip + read CTA */}
        <div className="mt-2 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-body-sm text-muted">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]">
              {formatBlogDate(post.date)}
            </span>
            <span aria-hidden="true" className="text-border-strong">·</span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]">
              {post.readTime}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-accent">
            Read article
            <span
              aria-hidden="true"
              className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
