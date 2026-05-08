"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem } from "@/lib/tokens";
import { type LegalDocument, formatLegalDate } from "@/lib/legal";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Shared layout for legal pages (Privacy, Terms, HIPAA, Accessibility).
 *
 * Layout:
 *   • Compact hero — eyebrow + italic-serif punchline + last-updated date
 *   • Optional summary block — exec-overview bullets
 *   • Two-column body at lg+: sticky TOC left, content right
 *   • Single-column on mobile with collapsible TOC
 *   • Bottom contact strip
 *
 * Why two-column at lg+ (vs single column like /faq):
 *   • Legal docs are long (15+ sections). Sticky TOC = persistent
 *     navigation without scrolling back to top
 *   • Section headings serve as scroll-spy anchors — clicking a TOC
 *     entry scrolls smoothly to the section
 *
 * Section anchors: each LegalSection.id becomes the URL fragment
 * (/privacy#data-collection). Server-rendered so users can deep-link
 * to specific sections from emails, support replies, etc.
 *
 * Inline-markdown renderer: same one used in FAQClient — handles
 * **bold** and [link](/url) in section bodies. Defined inline below.
 */

export function LegalPage({ doc }: { doc: LegalDocument }) {
  // Active section tracking via IntersectionObserver — TOC entry for
  // the section currently in view gets highlighted.
  const [activeId, setActiveId] = useState<string>(doc.sections[0]?.id ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const headings = doc.sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the first entry that's intersecting (closest to top of viewport)
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      {
        // Headings are "active" when they're in the upper third of the viewport
        rootMargin: "-20% 0px -65% 0px",
      }
    );

    headings.forEach((h) => observer.observe(h));
    observers.push(observer);

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, [doc.sections]);

  return (
    <main id="main">
      {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="legal-hero-heading"
        className="relative section-y-sm overflow-hidden"
      >
        {/* Subtle ambient halo — same pattern as /faq for continuity */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute h-[140px] w-[480px] rounded-pill bg-accent/[0.06] blur-3xl"
            style={{ top: "-40px", right: "-160px", transform: "rotate(-10deg)" }}
          />
        </div>

        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              {doc.eyebrow}
            </motion.p>

            <motion.h1
              id="legal-hero-heading"
              variants={fadeUpItem}
              className="text-balance text-display-lg leading-[1.08] text-ink"
            >
              {doc.titleLead}{" "}
              <span className="font-serif italic text-accent">
                {doc.titleEm}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              {doc.subhead}
            </motion.p>

            <motion.p
              variants={fadeUpItem}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle"
            >
              Last updated{" "}
              <time dateTime={doc.lastUpdated} className="text-foreground/65">
                {formatLegalDate(doc.lastUpdated)}
              </time>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ EXEC SUMMARY (optional) ━━━━━━━━━━━━━━━━━━ */}
      {doc.summary && (
        <section
          aria-labelledby="legal-summary-heading"
          className="relative pb-12 md:pb-16"
        >
          <div className="container relative mx-auto">
            <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-surface-raised/60 p-6 sm:p-8">
              <p
                id="legal-summary-heading"
                className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-foreground/65"
              >
                {doc.summary.title}
              </p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {doc.summary.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-body leading-relaxed text-muted"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[10px] block h-1 w-1 shrink-0 rounded-full bg-accent"
                    />
                    <span className="text-ink/85">{renderInline(point)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ━━━━━━━━━━━━━━━━━━ TOC + CONTENT ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Document contents"
        className="relative pb-section-y"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
            {/* Sticky TOC — desktop. Mobile: collapsible <details> */}
            <aside aria-label="Table of contents">
              <details
                className="group lg:hidden"
                open={false}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4 font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-foreground/80 [&::-webkit-details-marker]:hidden">
                  Contents
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="transition-transform duration-fast ease-smooth group-open:rotate-45"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 3v10M3 8h10"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </summary>
                <TOCList sections={doc.sections} activeId={activeId} />
              </details>

              {/* Desktop sticky TOC */}
              <div className="hidden lg:block lg:sticky lg:top-28">
                <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-subtle">
                  Contents
                </p>
                <TOCList sections={doc.sections} activeId={activeId} />
              </div>
            </aside>

            {/* Content column */}
            <div className="min-w-0">
              <div className="flex flex-col gap-12 md:gap-14">
                {doc.sections.map((section) => (
                  <article
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28"
                  >
                    <header className="mb-4 flex items-baseline gap-3">
                      <span className="font-mono text-[11px] font-medium tabular-nums uppercase tracking-[0.18em] text-accent">
                        {section.num}
                      </span>
                      <h2 className="font-serif text-h2 italic leading-tight text-ink">
                        {section.title}
                      </h2>
                    </header>
                    <div className="max-w-prose text-body leading-[1.7] text-muted [&_p+p]:mt-4 [&_strong]:font-medium [&_strong]:text-ink">
                      {renderBody(section.body)}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ CONTACT STRIP ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Contact"
        className="relative section-y-sm border-t border-border bg-surface-subtle/40"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center md:gap-4">
            <p className="font-serif text-h2 italic leading-tight text-ink">
              Questions about this policy?
            </p>
            <p className="text-body-sm text-muted">
              Reach us at{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-accent underline decoration-accent/40 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:decoration-accent"
              >
                {site.email}
              </a>{" "}
              — a human reads every reply.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

// ─── TOCList ─────────────────────────────────────────────────────────
// Vertical list of section anchors. Active section gets accent color
// + accent left border. Click smooth-scrolls to section (CSS scroll-
// behavior: smooth + scroll-margin-top on each section header).

function TOCList({
  sections,
  activeId,
}: {
  sections: LegalDocument["sections"];
  activeId: string;
}) {
  return (
    <ul className="mt-4 flex flex-col gap-1.5 lg:mt-5">
      {sections.map((s) => {
        const isActive = s.id === activeId;
        return (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                "block py-1.5 pl-3 text-body-sm leading-snug transition-colors duration-fast ease-smooth border-l-2",
                isActive
                  ? "border-accent text-ink font-medium"
                  : "border-transparent text-muted hover:text-ink hover:border-border-strong"
              )}
            >
              <span className="font-mono text-[10px] tabular-nums tracking-[0.06em] text-subtle mr-2">
                {s.num}
              </span>
              {s.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// ─── Body renderer ───────────────────────────────────────────────────
// Splits on \n\n for paragraphs, \n for soft breaks, parses **bold**
// and [text](href) inline. Same approach as FAQClient.

function renderBody(text: string): React.ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, i) => (
    <p key={i}>
      {para.split(/\n/).map((line, j, arr) => (
        <span key={j}>
          {renderInline(line)}
          {j < arr.length - 1 && <br />}
        </span>
      ))}
    </p>
  ));
}

function renderInline(text: string): React.ReactNode {
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
      return <strong key={i}>{tok.value}</strong>;
    }
    if (tok.type === "link") {
      const isExternal = /^https?:\/\//.test(tok.href);
      return (
        <a
          key={i}
          href={tok.href}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-accent underline decoration-accent/40 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:decoration-accent"
        >
          {tok.value}
        </a>
      );
    }
    return <span key={i}>{tok.value}</span>;
  });
}
