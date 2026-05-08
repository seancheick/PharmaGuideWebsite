import Link from "next/link";
import type { BlogPost } from "@/lib/blog-types";
import { formatBlogDate, getCategory } from "@/lib/blog-types";
import { cn } from "@/lib/utils";

/**
 * BlogCard — used in the hub's recent-posts grid AND in the related-posts
 * section at the bottom of a post page.
 *
 * Two variants:
 *   default  — standard card sized for a 3-col grid
 *   featured — larger Editor's Pick card for the hub hero. Currently
 *              the same chrome, just sized larger by parent grid.
 */

export function BlogCard({
  post,
  variant = "default",
}: {
  post: BlogPost;
  variant?: "default" | "featured";
}) {
  const cat = getCategory(post.category);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-fast ease-smooth hover:-translate-y-1 hover:border-border-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent md:p-7",
        variant === "featured" && "md:p-8 lg:p-10"
      )}
    >
      {/* Category eyebrow + date */}
      <div className="flex items-center gap-3 text-xs">
        {cat && (
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-accent">
            {cat.shortLabel}
          </span>
        )}
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">
          {formatBlogDate(post.date)}
        </span>
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-serif italic leading-snug text-ink",
          variant === "featured" ? "text-h1" : "text-h2"
        )}
      >
        {post.title}
      </h3>

      {/* Excerpt */}
      <p className="text-body-sm leading-relaxed text-muted">
        {post.description}
      </p>

      {/* Meta strip — author + read time */}
      <div className="mt-auto flex items-center gap-3 border-t border-border/70 pt-4 text-body-sm text-muted">
        <span className="text-foreground/85">{post.author}</span>
        <span aria-hidden="true" className="text-border-strong">·</span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]">
          {post.readTime}
        </span>
      </div>
    </Link>
  );
}
