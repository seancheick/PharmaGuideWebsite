"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem } from "@/lib/tokens";
import type { BlogPost, BlogCategory } from "@/lib/blog-types";
import { BlogCard } from "./BlogCard";
import { BlogFeaturedCard } from "./BlogFeaturedCard";
import { BlogListItem } from "./BlogListItem";
import { BlogPagination } from "./BlogPagination";
import { BlogViewToggle, type BlogView } from "./BlogViewToggle";
import { cn } from "@/lib/utils";

/**
 * Blog hub client.
 *
 * Layout flow:
 *   1. Search bar
 *   2. Category chips (left) + view toggle (right)
 *   3. Featured Editor's Pick (only on page 1, no filters)
 *   4. "Latest" section header + post-count caption
 *   5. Posts (grid OR list — user-toggleable, persists in localStorage)
 *   6. Pagination (12 per page, smart ellipsis at scale)
 *
 * Pagination:
 *   - 12 posts per page (sweet spot — 3 cols × 4 rows on desktop)
 *   - Page 1 includes the Featured card; pages 2+ skip it (already
 *     surfaced on page 1)
 *   - Filter changes (category or search) reset page to 1
 *   - Static pagination via state (could swap to ?page=N URLs later
 *     for direct deep-linking — same component, different state source)
 *
 * View persistence:
 *   - Stored in localStorage as `pg-blog-view` ('grid'|'list')
 *   - Default = grid
 *   - Read on mount only (avoids SSR/hydration mismatch)
 */

const POSTS_PER_PAGE = 12;
const VIEW_STORAGE_KEY = "pg-blog-view";

interface BlogHubClientProps {
  posts: BlogPost[];
  featured: BlogPost | undefined;
  categories: readonly BlogCategory[];
}

export function BlogHubClient({
  posts,
  featured,
  categories,
}: BlogHubClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<BlogView>("grid");

  // Hydrate view from localStorage on mount (client-only — avoid SSR
  // mismatch by starting with the default and reading on first effect)
  useEffect(() => {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === "grid" || stored === "list") {
      setView(stored);
    }
  }, []);

  const handleViewChange = (next: BlogView) => {
    setView(next);
    localStorage.setItem(VIEW_STORAGE_KEY, next);
  };

  const isUnfiltered = activeCategory === "all" && !query.trim();

  // Filter posts by category + search query.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (isUnfiltered && featured && p.slug === featured.slug) return false;
      if (activeCategory !== "all" && p.category !== activeCategory)
        return false;
      if (q) {
        const haystack = [
          p.title,
          p.description,
          p.author,
          ...(p.tags ?? []),
          categories.find((c) => c.id === p.category)?.label ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [posts, activeCategory, query, featured, categories, isUnfiltered]);

  // Reset to page 1 whenever the filter inputs change.
  useEffect(() => {
    setPage(1);
  }, [activeCategory, query]);

  // Slice into the current page.
  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * POSTS_PER_PAGE;
  const visible = filtered.slice(pageStart, pageStart + POSTS_PER_PAGE);

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━ FILTER + SEARCH (TOP) ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Browse posts"
        className="relative pb-10 md:pb-12"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-5xl">
            {/* Search bar */}
            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="7" cy="7" r="4.5" />
                  <path d="M10.5 10.5l3 3" />
                </svg>
              </span>
              <label htmlFor="blog-search" className="sr-only">Search blog posts</label>
              <input
                id="blog-search"
                type="search"
                placeholder="Search articles — interactions, depletions, recalls…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-pill border border-border bg-surface px-5 py-3.5 pl-12 text-body text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow"
              />
            </div>

            {/* Category chips — full row. The grid/list view toggle
                sits with the grid section header below the featured
                card (closer to what it actually controls). */}
            <div className="mt-5 flex flex-wrap gap-2">
              <CategoryChip
                label="All posts"
                active={activeCategory === "all"}
                onClick={() => setActiveCategory("all")}
              />
              {categories.map((c) => (
                <CategoryChip
                  key={c.id}
                  label={c.label}
                  active={activeCategory === c.id}
                  onClick={() => setActiveCategory(c.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ FEATURED (Editor's Pick) ━━━━━━━━━━━━━━━━━━ */}
      {/* Only on page 1 with no filters applied — pages 2+ skip it */}
      {featured && isUnfiltered && safePage === 1 && (
        <section
          aria-label="Editor's pick"
          className="relative pb-12 md:pb-16"
        >
          <div className="container relative mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="mx-auto max-w-6xl"
            >
              <BlogFeaturedCard post={featured} />
            </motion.div>
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━ POSTS ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Latest articles"
        className="relative pb-section-y"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-6xl">
            {/* Section header — only when there are posts.
                Grid/list toggle sits here on the right because this
                is what it controls (filters + featured already up top). */}
            {filtered.length > 0 && (
              <div className="mb-8 flex flex-wrap items-center justify-between gap-3 md:mb-10">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/65">
                    {isUnfiltered
                      ? "Latest"
                      : query.trim()
                        ? `Results · "${query.trim()}"`
                        : categories.find((c) => c.id === activeCategory)?.label ?? "Latest"}
                  </h2>
                  <span aria-hidden="true" className="text-border-strong">·</span>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">
                    {filtered.length}{" "}
                    {filtered.length === 1 ? "article" : "articles"}
                  </p>
                </div>
                <BlogViewToggle view={view} onChange={handleViewChange} />
              </div>
            )}

            {filtered.length === 0 ? (
              <EmptyState
                hasQuery={query.length > 0}
                category={
                  categories.find((c) => c.id === activeCategory)?.label
                }
              />
            ) : view === "grid" ? (
              <motion.ul
                key={`grid-${activeCategory}-${query}-${safePage}`}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
                initial="hidden"
                animate="visible"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7"
              >
                {visible.map((post) => (
                  <motion.li key={post.slug} variants={fadeUpItem}>
                    <BlogCard post={post} />
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <motion.ul
                key={`list-${activeCategory}-${query}-${safePage}`}
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.04 } },
                }}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3"
              >
                {visible.map((post) => (
                  <motion.li key={post.slug} variants={fadeUpItem}>
                    <BlogListItem post={post} />
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {/* Pagination — only when there's more than one page */}
            {filtered.length > 0 && (
              <BlogPagination
                currentPage={safePage}
                totalPages={totalPages}
                onChange={(p) => {
                  setPage(p);
                  // Smooth-scroll back to the section top so the user
                  // doesn't lose context after clicking a page number
                  document
                    .querySelector('section[aria-label="Latest articles"]')
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                totalPosts={filtered.length}
                visiblePosts={visible.length}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-pill border px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.12em] transition-[background-color,border-color,color] duration-fast ease-smooth focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-surface text-muted hover:border-border-strong hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}

function EmptyState({
  hasQuery,
  category,
}: {
  hasQuery: boolean;
  category?: string;
}) {
  return (
    <motion.div
      variants={fadeUpContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-2xl text-center"
    >
      <motion.p
        variants={fadeUpItem}
        className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-subtle"
      >
        Nothing yet
      </motion.p>
      <motion.h2
        variants={fadeUpItem}
        className="mt-4 text-balance font-serif text-h2 italic leading-tight text-ink"
      >
        {hasQuery
          ? "No articles match that search."
          : category
            ? `Nothing in ${category} yet.`
            : "More content coming soon."}
      </motion.h2>
      <motion.p
        variants={fadeUpItem}
        className="mx-auto mt-4 max-w-prose text-body leading-relaxed text-muted"
      >
        We&apos;re publishing regularly — sign up for the newsletter
        below and the next dispatch lands in your inbox.
      </motion.p>
    </motion.div>
  );
}
