"use client";

import { cn } from "@/lib/utils";

/**
 * BlogPagination — numbered pages + prev/next.
 *
 * Smart ellipsis for scale:
 *   1 ‹ 2 [3] 4 5            (small total — show all)
 *   1 ... 4 5 [6] 7 8 ... 84 (large total — show neighbors + ends)
 *
 * Stateless. Parent owns the page state. This component just renders
 * the controls and calls onChange(newPage).
 *
 * Why this pattern (vs infinite scroll): each page is its own URL
 * (?page=N), so each page is independently indexable by Google,
 * which matters for blog-at-scale SEO. Infinite scroll is also
 * accessibility-hostile.
 */

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Total post count for the "X of Y" label. Optional. */
  totalPosts?: number;
  /** Posts shown on the current page. Optional. */
  visiblePosts?: number;
}

export function BlogPagination({
  currentPage,
  totalPages,
  onChange,
  totalPosts,
  visiblePosts,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-14 flex flex-col items-center gap-5 md:mt-16"
    >
      {/* Page numbers + prev/next */}
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        {/* Prev */}
        <li>
          <PageButton
            disabled={currentPage === 1}
            onClick={() => onChange(currentPage - 1)}
            aria-label="Previous page"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">Prev</span>
          </PageButton>
        </li>

        {/* Numbered pages with ellipsis */}
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <li key={`gap-${i}`} aria-hidden="true">
              <span className="px-2 text-subtle">…</span>
            </li>
          ) : (
            <li key={p}>
              <PageButton
                onClick={() => onChange(p)}
                aria-label={`Go to page ${p}`}
                aria-current={p === currentPage ? "page" : undefined}
                active={p === currentPage}
              >
                {p}
              </PageButton>
            </li>
          )
        )}

        {/* Next */}
        <li>
          <PageButton
            disabled={currentPage === totalPages}
            onClick={() => onChange(currentPage + 1)}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <span aria-hidden="true">→</span>
          </PageButton>
        </li>
      </ul>

      {/* "X of Y" caption */}
      {totalPosts !== undefined && visiblePosts !== undefined && (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
          Showing {visiblePosts} of {totalPosts}{" "}
          {totalPosts === 1 ? "article" : "articles"}
          <span className="mx-2 text-border-strong">·</span>
          Page {currentPage} of {totalPages}
        </p>
      )}
    </nav>
  );
}

// ─── Page button ────────────────────────────────────────────────────

function PageButton({
  active = false,
  disabled = false,
  onClick,
  children,
  ...rest
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-pill border px-3 font-mono text-[12px] font-medium tabular-nums transition-[background-color,border-color,color,transform] duration-fast ease-smooth focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
        disabled
          ? "cursor-not-allowed border-border bg-surface text-subtle opacity-50"
          : active
            ? "border-accent bg-accent text-white"
            : "border-border bg-surface text-muted hover:-translate-y-0.5 hover:border-border-strong hover:text-ink"
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// ─── Smart page-list builder ────────────────────────────────────────
// For totalPages ≤ 7: show all (1 2 3 4 5 6 7)
// Otherwise: show 1, ellipsis, neighbors of current, ellipsis, last
//   page=1   →  [1] 2 3 4 5 ... 84
//   page=7   →  1 ... 5 6 [7] 8 9 ... 84
//   page=84  →  1 ... 80 81 82 83 [84]

function buildPageList(
  current: number,
  total: number
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const leftBound = Math.max(2, current - 1);
  const rightBound = Math.min(total - 1, current + 1);

  if (leftBound > 2) pages.push("ellipsis");
  for (let i = leftBound; i <= rightBound; i++) pages.push(i);
  if (rightBound < total - 1) pages.push("ellipsis");
  pages.push(total);

  return pages;
}
