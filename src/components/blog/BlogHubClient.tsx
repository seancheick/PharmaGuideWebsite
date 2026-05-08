"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem } from "@/lib/tokens";
import type { BlogPost, BlogCategory } from "@/lib/blog-types";
import { BlogCard } from "./BlogCard";
import { cn } from "@/lib/utils";

/**
 * Blog hub client — the interactive parts of /blog:
 *   • Category filter chips
 *   • Search input (client-side keyword filter for now;
 *     swap for server-side full-text when post count grows)
 *   • Featured (Editor's Pick) card
 *   • Filtered recent-posts grid
 *
 * Server component (page.tsx) reads posts at build time and passes
 * them in as props. This client only handles the filtering UI.
 */

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

  // Filter posts by category + search query. The featured post is
  // shown separately above the grid, so we exclude it from the grid
  // when no filter is active.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      // Hide featured from the recent grid when no filter is active
      if (
        activeCategory === "all" &&
        !q &&
        featured &&
        p.slug === featured.slug
      ) {
        return false;
      }
      // Category filter
      if (activeCategory !== "all" && p.category !== activeCategory) {
        return false;
      }
      // Keyword filter — title, description, tags, category label
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
  }, [posts, activeCategory, query, featured, categories]);

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━ FEATURED (Editor's Pick) ━━━━━━━━━━━━━━━━━━ */}
      {featured && activeCategory === "all" && !query && (
        <section
          aria-label="Editor's pick"
          className="relative pb-12 md:pb-16"
        >
          <div className="container relative mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="mx-auto max-w-5xl"
            >
              <p className="mb-5 font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/65">
                Editor&apos;s pick
              </p>
              <BlogCard post={featured} variant="featured" />
            </motion.div>
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━ FILTER + SEARCH ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Browse posts"
        className="relative pb-8 md:pb-10"
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
              <input
                type="search"
                placeholder="Search articles — interactions, depletions, recalls…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search blog posts"
                className="w-full rounded-pill border border-border bg-surface px-5 py-3.5 pl-12 text-body text-ink shadow-xs outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow"
              />
            </div>

            {/* Category chips */}
            <div className="mt-6 flex flex-wrap gap-2">
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

      {/* ━━━━━━━━━━━━━━━━━━ POSTS GRID ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Latest articles"
        className="relative pb-section-y"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-6xl">
            {filtered.length === 0 ? (
              <EmptyState
                hasQuery={query.length > 0}
                category={categories.find((c) => c.id === activeCategory)?.label}
              />
            ) : (
              <motion.ul
                key={`${activeCategory}-${query}`}
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.06 },
                  },
                }}
                initial="hidden"
                animate="visible"
                className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
              >
                {filtered.map((post) => (
                  <motion.li key={post.slug} variants={fadeUpItem}>
                    <BlogCard post={post} />
                  </motion.li>
                ))}
              </motion.ul>
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
      <motion.h3
        variants={fadeUpItem}
        className="mt-4 text-balance font-serif text-h2 italic leading-tight text-ink"
      >
        {hasQuery
          ? "No articles match that search."
          : category
            ? `Nothing in ${category} yet.`
            : "More content coming soon."}
      </motion.h3>
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
