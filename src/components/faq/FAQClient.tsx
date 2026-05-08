"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { fadeUpContainer, fadeUpItem } from "@/lib/tokens";
import { FAQ_ITEMS } from "@/lib/faq";
import { cn } from "@/lib/utils";

/**
 * FAQ accordion — single-column, hairline-divided, Framer-animated.
 *
 * Why single column (not the legacy two-column masonry):
 *   • When one accordion expands, two-column layouts shift the column
 *     and the question the user is reading jumps. Apple, Stripe, Linear,
 *     Vercel all use single-column FAQ for exactly this reason.
 *   • Single column at max-w-3xl reads as a "well-typeset document,"
 *     matches the rest of the site's "typography does the work" tone.
 *
 * Why Framer Motion (not the CSS grid-template-rows trick):
 *   • Same animation system as the rest of the site — visual continuity.
 *   • Smooth height: 0 → auto with proper layout settling.
 *   • Built-in aria-expanded handling + focus management.
 *
 * Multi-open by default — users can keep multiple answers visible while
 * comparing/scanning. No "only one open at a time" constraint.
 *
 * Inline emphasis: each FAQ item has a `body` string with **bold** and
 * [link](/url) markdown-ish syntax. Parsed by `renderInline` below into
 * React nodes — keeps the data file readable without a full markdown
 * dependency.
 */

export function FAQClient() {
  // Set of indices currently open. Multi-open allowed.
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <motion.ul
      variants={fadeUpContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      className="mx-auto max-w-3xl divide-y divide-border border-y border-border"
    >
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openSet.has(i);
        const buttonId = `faq-q-${i}`;
        const panelId = `faq-a-${i}`;

        // Q01, Q02, … Q11 — mono-caps numbering above each question.
        // Adds Linear/Vercel-style structure without category-tag noise.
        const qNum = `Q${String(i + 1).padStart(2, "0")}`;

        return (
          <motion.li key={item.q} variants={fadeUpItem} className="group">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
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
                    {qNum}
                  </span>
                  <span className="font-serif text-h3 italic leading-snug">
                    {item.q}
                  </span>
                </div>
                <PlusIcon isOpen={isOpen} />
              </button>
            </h3>

            {/* Animated panel — height 0 → auto + opacity for cross-fade.
                AnimatePresence so the exit animation runs on close.    */}
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
                  {/* Answer body — pb-7 to match the question's py-6
                      breathing room. Right-pad so it never bumps into
                      the +/× icon. Slightly larger leading for
                      readability since these can be 3-4 lines. */}
                  <div className="max-w-prose pb-7 pr-10 text-body leading-[1.65] text-muted">
                    {renderInline(item.body)}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </motion.ul>
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
      return (
        <a
          key={i}
          href={tok.href}
          className="text-accent underline decoration-accent/40 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:decoration-accent"
        >
          {tok.value}
        </a>
      );
    }
    return <span key={i}>{tok.value}</span>;
  });
}

