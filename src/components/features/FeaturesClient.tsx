"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import {
  PILLARS,
  CLINICIAN_REPORT,
  BUILT_ON,
  BOUNDARIES,
} from "@/lib/features";
import { Illustration } from "./Illustrations";

/**
 * /features page client — the entire body.
 *
 * Layout flow:
 *   Hero (broader positioning — NOT just "interaction checker")
 *   Pillar overview (compact 2-col grid linking to deep-dives)
 *   ↓ for each PILLAR (6 of them):
 *     Two-column section — illustration + copy (alternates side
 *     each pillar so the page rhythm doesn't go flat)
 *     Capabilities list, examples panel, external sources footer
 *   Clinician report bonus block
 *   "Built on" trust strip
 *   "What we don't do" boundaries
 *   CTA
 *
 * Pillars alternate side at md+ for visual rhythm. On mobile each
 * pillar stacks (illustration on top, content below) so reading
 * order stays natural.
 */

export function FeaturesClient() {
  return (
    <main id="main">
      {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="features-hero-heading"
        className="relative section-y-sm overflow-hidden"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute h-[160px] w-[520px] rounded-pill bg-accent/[0.07] blur-3xl"
            style={{ top: "-50px", right: "-180px", transform: "rotate(-10deg)" }}
          />
          <div
            className="absolute h-[120px] w-[400px] rounded-pill bg-foreground/[0.04] blur-3xl"
            style={{ top: "55%", left: "-140px", transform: "rotate(15deg)" }}
          />
        </div>

        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center md:gap-9"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              Features
            </motion.p>

            <motion.h1
              id="features-hero-heading"
              variants={fadeUpItem}
              className="text-balance text-display-lg leading-[1.04] text-ink"
            >
              The supplement and medication co-pilot{" "}
              <span className="font-serif italic text-accent">
                you actually need.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              Most apps check one bottle at a time. PharmaGuide reads your
              full stack as a system — flagging interactions, depletions,
              dose accumulation, recalls, and quality issues across every
              supplement and medication you take.
            </motion.p>

            {/* Tiny strength rail */}
            <motion.div
              variants={fadeUpItem}
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle"
            >
              <span>180,000-product catalog</span>
              <span aria-hidden="true" className="text-border-strong">·</span>
              <span>Clinician-reviewed</span>
              <span aria-hidden="true" className="text-border-strong">·</span>
              <span>Offline-first</span>
              <span aria-hidden="true" className="text-border-strong">·</span>
              <span>Privacy by architecture</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ PILLAR OVERVIEW ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Capability overview"
        className="relative pb-section-y-sm"
      >
        <div className="container relative mx-auto">
          <motion.ul
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.05 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="mx-auto grid max-w-5xl gap-3 md:grid-cols-2 md:gap-4"
          >
            {PILLARS.map((p) => (
              <motion.li
                key={p.id}
                variants={fadeUpItem}
                className="rounded-xl border border-border bg-surface px-5 py-4 transition-[transform,box-shadow,border-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md"
              >
                <a href={`#${p.id}`} className="block">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-[10.5px] font-medium tabular-nums uppercase tracking-[0.18em] text-accent">
                      {p.num}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                      {p.eyebrow}
                    </span>
                  </div>
                  <p className="mt-2 font-serif text-h4 italic leading-snug text-ink">
                    {p.titleLead}{" "}
                    <span className="text-accent">{p.titleEm}</span>
                  </p>
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ PILLAR DEEP-DIVES ━━━━━━━━━━━━━━━━━━ */}
      {PILLARS.map((pillar, i) => {
        const reverse = i % 2 === 1; // alternate side at md+
        const isShaded = i % 2 === 0; // alternate surface tint
        return (
          <section
            key={pillar.id}
            id={pillar.id}
            aria-labelledby={`${pillar.id}-heading`}
            className={`relative section-y-sm scroll-mt-24 ${isShaded ? "bg-surface-raised/40" : ""}`}
          >
            {isShaded && (
              <>
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />
              </>
            )}
            <div className="container relative mx-auto">
              <div
                className={`mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-20 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                {/* COPY column */}
                <motion.div
                  variants={fadeUpContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-10%" }}
                  className="flex flex-col gap-5"
                >
                  <motion.div variants={fadeUpItem} className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] font-medium tabular-nums uppercase tracking-[0.18em] text-accent">
                      {pillar.num}
                    </span>
                    <span className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
                      {pillar.eyebrow}
                    </span>
                  </motion.div>

                  <motion.h2
                    id={`${pillar.id}-heading`}
                    variants={fadeUpItem}
                    className="text-balance text-display-md leading-[1.08] text-ink"
                  >
                    {pillar.titleLead}{" "}
                    <span className="font-serif italic text-accent">
                      {pillar.titleEm}
                    </span>
                  </motion.h2>

                  <motion.p
                    variants={fadeUpItem}
                    className="max-w-prose text-body-lg leading-relaxed text-muted"
                  >
                    {pillar.intro}
                  </motion.p>

                  {/* Capabilities */}
                  <motion.ul
                    variants={fadeUpItem}
                    className="mt-2 flex flex-col gap-2.5"
                  >
                    {pillar.capabilities.map((cap, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-body leading-relaxed text-foreground/85"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[10px] block h-1 w-1 shrink-0 rounded-full bg-accent"
                        />
                        <span>{renderInline(cap)}</span>
                      </li>
                    ))}
                  </motion.ul>

                  {/* Examples */}
                  {pillar.examples.length > 0 && (
                    <motion.div
                      variants={fadeUpItem}
                      className="mt-3 rounded-xl border border-border bg-surface/80 p-5 backdrop-blur-sm"
                    >
                      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-subtle">
                        In practice
                      </p>
                      <ul className="mt-3 flex flex-col divide-y divide-border/70">
                        {pillar.examples.map((ex, k) => (
                          <li
                            key={k}
                            className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-3"
                          >
                            <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.1em] text-subtle sm:w-[42%]">
                              {ex.trigger}
                            </span>
                            <span className="text-body-sm leading-snug text-ink sm:flex-1">
                              {renderInline(ex.result)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* External sources */}
                  {pillar.sources.length > 0 && (
                    <motion.p
                      variants={fadeUpItem}
                      className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle"
                    >
                      Sources ·{" "}
                      {pillar.sources.map((s, k) => (
                        <span key={s.url}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline decoration-accent/40 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:decoration-accent"
                          >
                            {s.name}
                          </a>
                          {k < pillar.sources.length - 1 && (
                            <span className="mx-2 text-border-strong">·</span>
                          )}
                        </span>
                      ))}
                    </motion.p>
                  )}

                  {/* "From the blog" — appears only when relatedPosts
                      exist on the pillar. Lists 1-3 deep-dive articles
                      that belong to this pillar's topic cluster. As more
                      cluster posts ship, add them via relatedPosts in
                      src/lib/features.ts. See docs/10-blog-system-guide.md
                      "Cross-link maintenance" for the full strategy. */}
                  {pillar.relatedPosts && pillar.relatedPosts.length > 0 && (
                    <motion.div variants={fadeUpItem} className="mt-2 flex flex-col gap-2.5">
                      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-accent">
                        From the blog
                      </p>
                      <ul className="flex flex-col gap-2">
                        {pillar.relatedPosts.map((post) => (
                          <li key={post.slug}>
                            <Link
                              href={`/blog/${post.slug}`}
                              className="group inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-body-sm leading-snug text-ink shadow-xs transition-[transform,border-color,background-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
                            >
                              <span className="font-serif italic">
                                {post.title}
                              </span>
                              <span
                                aria-hidden="true"
                                className="text-accent transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
                              >
                                →
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </motion.div>

                {/* ILLUSTRATION column */}
                <div className="w-full">
                  <Illustration kind={pillar.illustration} />
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ━━━━━━━━━━━━━━━━━━ CLINICIAN BONUS ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="clinician-heading"
        className="relative section-y-sm bg-surface-raised/40"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />
        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center md:gap-6"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              {CLINICIAN_REPORT.eyebrow}
            </motion.p>
            <motion.h2
              id="clinician-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              <span className="font-serif italic">{CLINICIAN_REPORT.title}</span>
            </motion.h2>
            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              {CLINICIAN_REPORT.body}
            </motion.p>
            <motion.ul
              variants={fadeUpItem}
              className="mt-2 flex flex-col gap-2 text-left sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-2"
            >
              {CLINICIAN_REPORT.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2.5 text-body-sm leading-relaxed text-foreground/85"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[8px] block h-1 w-1 shrink-0 rounded-full bg-accent"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ BUILT ON ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="built-on-heading"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center md:gap-6"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              The foundation
            </motion.p>
            <motion.h2
              id="built-on-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              Built on what makes the rest possible.{" "}
              <span className="font-serif italic">By design.</span>
            </motion.h2>
          </motion.div>

          <motion.ul
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.1 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="mx-auto mt-12 grid max-w-5xl gap-5 md:mt-14 md:grid-cols-2 md:gap-6"
          >
            {BUILT_ON.map((item) => (
              <motion.li
                key={item.label}
                variants={fadeUpItem}
                className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-7"
              >
                <p className="font-serif text-h3 italic leading-tight text-ink">
                  {item.label}
                </p>
                <p className="mt-3 text-body-sm leading-relaxed text-muted">
                  {item.detail}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ BOUNDARIES ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="boundaries-heading"
        className="relative pb-section-y-sm"
      >
        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-subtle"
            >
              {BOUNDARIES.title}
            </motion.p>
            <motion.ul
              variants={fadeUpItem}
              className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
            >
              {BOUNDARIES.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 rounded-xl border border-border/70 bg-surface/50 px-4 py-3.5 text-left backdrop-blur-sm"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="mt-[3px] shrink-0 text-muted"
                  >
                    <path
                      d="M3 3l8 8M11 3l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-body-sm leading-snug text-ink">
                    {item}
                  </span>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ CTA STRIP ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Next steps"
        className="relative section-y-sm border-t border-border bg-surface-subtle/40"
      >
        <div className="container relative mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={transitions.reveal}
            className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center md:gap-6"
          >
            <p className="font-serif text-h2 italic leading-tight text-ink">
              Ready to see your stack the way we do?
            </p>
            <p className="max-w-prose text-body-lg leading-relaxed text-muted">
              Join the beta. Opening in waves through 2026.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              <a
                href="/#waitlist"
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-accent px-6 py-3.5 text-body font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              >
                Join the beta
                <span aria-hidden="true">→</span>
              </a>
              <a
                href="/methodology"
                className="inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink"
              >
                Read the methodology
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// ─── Inline-markdown renderer for **bold** + [link](url) ─────────────

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
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-accent underline decoration-accent/40 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:decoration-accent"
        >
          {tok.value}
        </a>
      );
    }
    return <span key={i}>{tok.value}</span>;
  });
}
