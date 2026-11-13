import Link from "next/link";
import { BlogListItem } from "@/components/blog/BlogListItem";
import type { BlogCardPost } from "@/lib/blog-types";

/**
 * Latest research — the homepage's bridge into the articles.
 *
 * The homepage is the site's strongest page and linked to no article at
 * all, so the posts earned authority only through /blog. Three newest
 * posts as list rows (the hub's BlogListItem), beside a left-aligned
 * header that carries the "all articles" link,
 * newsroom-style, so it reads as a shelf rather than another pitch.
 */
export function LatestResearch({ posts }: { posts: BlogCardPost[] }) {
  if (posts.length === 0) return null;

  // Compact since 2026-11-13: heading on the left, the three latest posts as
  // list rows (the blog hub's own list view) on the right, instead of three
  // full-size cards under a full-width header.
  return (
    <section aria-labelledby="latest-research-heading" className="section-y-sm relative">
      <div className="container mx-auto grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] lg:items-start lg:gap-14">
        <div>
          <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
            From the research desk
          </p>
          <h2
            id="latest-research-heading"
            className="mt-3 text-balance text-display-sm text-ink lg:mt-4"
          >
            What the evidence <span className="font-serif italic text-accent">actually says.</span>
          </h2>
          <p className="mt-3 max-w-[38ch] text-body leading-relaxed text-muted lg:mt-4">
            Plain-language guides to the research behind common supplement and medication questions
            — every claim cited, every article dated and signed.
          </p>
          <Link
            href="/blog"
            className="group mt-5 inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-5 py-2.5 text-body-sm font-medium text-ink shadow-xs transition-[transform,border-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            All articles
            <span
              aria-hidden="true"
              className="transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>

        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogListItem post={post} compact />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
