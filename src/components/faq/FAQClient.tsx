"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { fadeUpContainer, fadeUpItem } from "@/lib/tokens";
import { FAQ_GROUPS, FAQ_ITEMS, type FAQGroup } from "@/lib/faq";
import { cn } from "@/lib/utils";

/**
 * FAQ accordion — grouped, single-column, hairline-divided, Framer-animated.
 *
 * Why single column (not the legacy two-column masonry):
 *   • When one accordion expands, two-column layouts shift the column
 *     and the question the user is reading jumps. Apple, Stripe, Linear,
 *     Vercel all use single-column FAQ for exactly this reason.
 *   • Single column at max-w-3xl reads as a "well-typeset document,"
 *     matches the rest of the site's "typography does the work" tone.
 *
 * Why grouped (not a flat list of 11):
 *   • At 11+ Qs, a flat accordion has no skim affordance. Three group
 *     headings (Product · Privacy · Launch) give the reader an IA they
 *     can scan in one second.
 *   • Per-group numbering (P01, P02 / D01 / L01) keeps the linear sense
 *     of "I'm 2 of 5 in this section" instead of "I'm Q07 of 11."
 *
 * Sticky search: filters across q + body. When active, group headings
 * stay rendered as labels so users see WHERE matches live.
 *
 * Multi-open by default — users can keep multiple answers visible.
 */

const GROUP_PREFIX: Record<FAQGroup, string> = {
  product: "P",
  privacy: "PR",
  launch: "L",
};

export function FAQClient() {
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();

  const grouped = useMemo(() => {
    return FAQ_GROUPS.map((g) => {
      const items = FAQ_ITEMS.filter((it) => it.group === g.id).map(
        (it, idx) => ({
          ...it,
          num: `${GROUP_PREFIX[g.id]}${String(idx + 1).padStart(2, "0")}`,
        })
      );
      const filtered = normalized
        ? items.filter(
            (it) =>
              it.q.toLowerCase().includes(normalized) ||
              it.a.toLowerCase().includes(normalized)
          )
        : items;
      return { ...g, items: filtered };
    });
  }, [normalized]);

  const totalMatches = grouped.reduce((n, g) => n + g.items.length, 0);

  const toggle = (key: string) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <motion.div
      variants={fadeUpContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      className="mx-auto max-w-3xl"
    >
      {/* Search bar — sticks just below the page header at lg+ so the
          filter stays reachable as users scroll into Privacy and
          Launch sections. */}
      <motion.div
        variants={fadeUpItem}
        className="z-10 -mx-4 mb-8 bg-background/80 px-4 py-3 backdrop-blur-md md:sticky md:top-24"
      >
        <label className="relative block">
          <span className="sr-only">Search the FAQ</span>
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="search"
            inputMode="search"
            placeholder="Search questions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-pill border border-border bg-surface py-2.5 pl-11 pr-4 text-body-sm text-ink outline-none transition-[border-color,box-shadow] duration-fast ease-smooth placeholder:text-subtle focus:border-accent focus:shadow-glow"
          />
        </label>
        {normalized && (
          <p className="mt-2 px-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
            {totalMatches} match{totalMatches === 1 ? "" : "es"} for &ldquo;{query}&rdquo;
          </p>
        )}
      </motion.div>

      {grouped.map((group, gIdx) => {
        if (group.items.length === 0 && normalized) return null;
        return (
          <section
            key={group.id}
            aria-labelledby={`faq-group-${group.id}`}
            className={cn(gIdx > 0 && "mt-12 md:mt-16")}
          >
            {/* Group header — mono caps eyebrow + serif italic hint */}
            <header className="mb-5 flex flex-col gap-1.5">
              <p
                id={`faq-group-${group.id}`}
                className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-accent"
              >
                {group.label}
              </p>
              <p className="font-serif text-body-lg italic leading-snug text-muted">
                {group.hint}
              </p>
            </header>

            <ul className="divide-y divide-border border-y border-border">
              {group.items.map((item) => {
                const key = `${group.id}-${item.num}`;
                const isOpen = openSet.has(key);
                const buttonId = `faq-q-${key}`;
                const panelId = `faq-a-${key}`;
                return (
                  <motion.li key={key} variants={fadeUpItem} className="group">
            {/* h2 (not h3) — page hero is h1, so questions need to be
                h2 to keep heading order proper for screen readers and
                axe-core. Visual size unchanged.                       */}
                    <h2>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggle(key)}
                        className={cn(
                          "flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-fast ease-smooth",
                          "hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
                          isOpen ? "text-ink" : "text-foreground/85"
                        )}
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <span
                            className={cn(
                              "font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] tabular-nums transition-colors duration-fast ease-smooth",
                              isOpen ? "text-accent" : "text-subtle"
                            )}
                          >
                            {item.num}
                          </span>
                          <span className="font-serif text-h3 italic leading-snug">
                            {item.q}
                          </span>
                        </div>
                        <PlusIcon isOpen={isOpen} />
                      </button>
                    </h2>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.section
                          key="panel"
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
                            opacity: { duration: 0.22, ease: [0.32, 0.72, 0, 1] },
                          }}
                          className="overflow-hidden"
                        >
                          <div className="max-w-prose pb-7 pr-10 text-body leading-[1.65] text-muted">
                            {renderInline(item.body)}
                          </div>
                        </motion.section>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {/* No-match empty state when search returns nothing */}
      {normalized && totalMatches === 0 && (
        <p className="mt-10 text-center font-serif text-body-lg italic text-muted">
          No matches for &ldquo;{query}&rdquo;. Try fewer or different terms.
        </p>
      )}
    </motion.div>
  );
}

// ─── PlusIcon ────────────────────────────────────────────────────────
// "+" rotates 45° to "×" on open. Single SVG, transform-only animation.
// 11×11 stroke matches the rest of the site's icon weights.

function PlusIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-[transform,border-color,color] duration-fast ease-smooth",
        isOpen
          ? "rotate-45 border-accent text-accent"
          : "border-border text-muted group-hover:border-accent/40 group-hover:text-accent"
      )}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 3v10M3 8h10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

// ─── renderInline ────────────────────────────────────────────────────
// Tiny inline-markdown renderer for **bold** and [text](href).
// Anything else passes through as plain text. Keeps the FAQ data file
// readable without pulling in a full markdown library.

function renderInline(text: string): React.ReactNode {
  // Tokenize: walk through and split into plain text / **bold** /
  // [text](href) chunks. Order matters — links can contain bold.
  const tokens: Array<
    | { type: "text"; value: string }
    | { type: "bold"; value: string }
    | { type: "link"; value: string; href: string }
  > = [];

  const re = /\*\*(.+?)\*\*|\[(.+?)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: text.slice(last, match.index) });
    }
    if (match[1] !== undefined) {
      tokens.push({ type: "bold", value: match[1] });
    } else if (match[2] !== undefined && match[3] !== undefined) {
      tokens.push({ type: "link", value: match[2], href: match[3] });
    }
    last = re.lastIndex;
  }
  if (last < text.length) {
    tokens.push({ type: "text", value: text.slice(last) });
  }

  return tokens.map((tok, i) => {
    if (tok.type === "bold") {
      return (
        <strong key={i} className="font-medium text-ink">
          {tok.value}
        </strong>
      );
    }
    if (tok.type === "link") {
      const isExternal = /^https?:\/\//.test(tok.href);
      return (
        <a
          key={i}
          href={tok.href}
          {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
          className="text-link underline decoration-link/60 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:text-link-strong hover:decoration-link"
        >
          {tok.value}
        </a>
      );
    }
    return <span key={i}>{tok.value}</span>;
  });
}

