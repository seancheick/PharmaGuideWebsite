"use client";

import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import {
  ADVISORY_TEAM,
  AI_DOES,
  AI_DOES_NOT,
  DATA_SOURCES,
  PROCESS_STEPS,
  SCOPE_IS,
  SCOPE_IS_NOT,
  TRUST_PILLARS,
} from "@/lib/methodology";

/**
 * Methodology page client — the entire body of /methodology.
 *
 * Custom layout (NOT the LegalPage component) because methodology is
 * a content-marketing piece, not a legal doc:
 *   • Three trust pillars in a 3-col grid
 *   • Four data-source cards with mono badges
 *   • Five-step vertical timeline (the "process")
 *   • Two-card advisory team with monogram avatars
 *   • Two-column "AI does / does NOT" split
 *   • Two-column "We are / are NOT" split
 *   • CTA strip linking back to FAQ + waitlist
 *
 * All sections animate in with the same fadeUpContainer/Item pattern
 * used elsewhere on the site.
 */

export function MethodologyClient() {
  return (
    <main id="main">
      {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="meth-hero-heading"
        className="relative section-y-sm overflow-hidden"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute h-[140px] w-[480px] rounded-pill bg-accent/[0.06] blur-3xl"
            style={{ top: "-40px", right: "-160px", transform: "rotate(-10deg)" }}
          />
          <div
            className="absolute h-[100px] w-[340px] rounded-pill bg-foreground/[0.04] blur-3xl"
            style={{ top: "55%", left: "-120px", transform: "rotate(15deg)" }}
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
              Methodology
            </motion.p>

            <motion.h1
              id="meth-hero-heading"
              variants={fadeUpItem}
              className="text-balance text-display-lg leading-[1.06] text-ink"
            >
              The science behind{" "}
              <span className="font-serif italic text-accent">
                every verdict.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              How we collect, verify, and ship the interaction data that
              powers PharmaGuide — including who reviews it, what AI does
              and doesn&apos;t do, and where we draw the line.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ TRUST PILLARS ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="meth-pillars-heading"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              01 · Why methodology matters
            </motion.p>

            <motion.h2
              id="meth-pillars-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              In a market full of opinions,{" "}
              <span className="font-serif italic">we show our work.</span>
            </motion.h2>
          </motion.div>

          <motion.ul
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.15 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="mx-auto mt-12 grid max-w-5xl gap-5 md:mt-14 md:grid-cols-3 md:gap-6"
          >
            {TRUST_PILLARS.map((p, i) => (
              <motion.li
                key={p.title}
                variants={fadeUpItem}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
              >
                <span className="font-mono text-[11px] font-medium tabular-nums uppercase tracking-[0.18em] text-accent">
                  {`0${i + 1}`}
                </span>
                <h3 className="font-serif text-h2 italic leading-tight text-ink">
                  {p.title}
                </h3>
                <p className="text-body-sm leading-relaxed text-muted">
                  {p.body}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ DATA SOURCES ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="meth-sources-heading"
        className="relative section-y-sm bg-surface-raised/50"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />

        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              02 · Where our data comes from
            </motion.p>

            <motion.h2
              id="meth-sources-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              Four primary sources.{" "}
              <span className="font-serif italic">No anonymous claims.</span>
            </motion.h2>
          </motion.div>

          <motion.ul
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.15 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="mx-auto mt-12 grid max-w-5xl gap-5 md:mt-14 md:grid-cols-2 md:gap-6"
          >
            {DATA_SOURCES.map((source) => (
              <motion.li
                key={source.name}
                variants={fadeUpItem}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-background">
                    <span className="font-mono text-[10px] font-semibold tracking-[0.08em]">
                      {source.badge}
                    </span>
                  </span>
                  <h3 className="font-serif text-h3 italic leading-tight text-ink">
                    {source.name}
                  </h3>
                </div>

                <ul className="flex flex-col gap-2 border-l-2 border-border-strong pl-4">
                  {source.items.map((item) => (
                    <li
                      key={item}
                      className="text-body-sm leading-relaxed text-muted"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="mt-1 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                  {source.use}
                </p>
              </motion.li>
            ))}
          </motion.ul>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={transitions.ambient}
            className="mx-auto mt-10 max-w-2xl text-balance text-center font-serif text-body italic leading-relaxed text-muted md:mt-14"
          >
            We do not access medical records, pharmacy systems, or any
            personal health data outside what you put into the app.
          </motion.p>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ 5-STEP PROCESS ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="meth-process-heading"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              03 · Our 5-step process
            </motion.p>

            <motion.h2
              id="meth-process-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              From source to verdict,{" "}
              <span className="font-serif italic">every interaction.</span>
            </motion.h2>
          </motion.div>

          {/* Vertical timeline — left rail with numbered nodes,
              right column with step content. */}
          <motion.ol
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.15 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-5%" }}
            className="mx-auto mt-12 max-w-3xl md:mt-16"
          >
            {PROCESS_STEPS.map((step, i) => (
              <motion.li
                key={step.num}
                variants={fadeUpItem}
                className="relative grid grid-cols-[auto_1fr] gap-x-6 pb-10 md:gap-x-10 md:pb-12 last:pb-0"
              >
                {/* Vertical connector line — drawn only between items */}
                {i < PROCESS_STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[19px] top-12 bottom-0 w-px bg-border-strong/60 md:left-[23px]"
                  />
                )}
                {/* Numbered node */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent bg-surface md:h-12 md:w-12">
                  <span className="font-mono text-[10.5px] font-medium tabular-nums tracking-[0.08em] text-accent md:text-[12px]">
                    {step.num}
                  </span>
                </div>
                {/* Step content */}
                <div className="min-w-0 pt-1.5">
                  <h3 className="font-serif text-h3 italic leading-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-body leading-relaxed text-muted">
                    {step.body}
                  </p>
                  {/* Optional metadata row */}
                  {(step.reviewer || step.output || step.schedule) && (
                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">
                      {step.reviewer && (
                        <span>
                          <span className="text-foreground/55">Reviewer · </span>
                          <span className="text-foreground/85">{step.reviewer}</span>
                        </span>
                      )}
                      {step.output && (
                        <span>
                          <span className="text-foreground/55">Output · </span>
                          <span className="text-foreground/85">{step.output}</span>
                        </span>
                      )}
                      {step.schedule && (
                        <span>
                          <span className="text-foreground/55">Schedule · </span>
                          <span className="text-foreground/85">{step.schedule}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ ADVISORY TEAM ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="meth-team-heading"
        className="relative section-y-sm bg-surface-raised/50"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />

        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              04 · Medical advisory team
            </motion.p>

            <motion.h2
              id="meth-team-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              Real clinicians,{" "}
              <span className="font-serif italic">named.</span>
            </motion.h2>
          </motion.div>

          <motion.ul
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.15 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="mx-auto mt-12 grid max-w-3xl gap-5 md:mt-14 md:grid-cols-2 md:gap-6"
          >
            {ADVISORY_TEAM.map((m) => (
              <motion.li
                key={m.name}
                variants={fadeUpItem}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
              >
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-background"
                  >
                    <span className="font-serif text-h3 italic">{m.initials}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-h3 italic leading-tight text-ink">
                      {m.name}
                    </p>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
                      {m.title}
                    </p>
                  </div>
                </div>
                <p className="text-body-sm leading-relaxed text-foreground/85">
                  {m.credentials}
                </p>
                <p className="text-body-sm leading-relaxed text-muted">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">
                    Focus ·{" "}
                  </span>
                  {m.focus}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ AI TRANSPARENCY ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="meth-ai-heading"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              05 · AI transparency
            </motion.p>

            <motion.h2
              id="meth-ai-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              AI does some of the work.{" "}
              <span className="font-serif italic">Humans do the rest.</span>
            </motion.h2>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body leading-relaxed text-muted"
            >
              We use AI to scale the parts that benefit from scale. We use
              clinicians for everything else. Here&apos;s exactly where the
              line is.
            </motion.p>
          </motion.div>

          <motion.div
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.15 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="mx-auto mt-12 grid max-w-4xl gap-5 md:mt-14 md:grid-cols-2 md:gap-6"
          >
            <motion.div
              variants={fadeUpItem}
              className="rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
            >
              <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-severity-safe">
                What AI does
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {AI_DOES.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-body-sm leading-relaxed text-foreground/85"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[8px] block h-1 w-1 shrink-0 rounded-full bg-severity-safe"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={fadeUpItem}
              className="rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
            >
              <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-severity-avoid">
                What AI does not do
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {AI_DOES_NOT.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-body-sm leading-relaxed text-foreground/85"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                      className="mt-[5px] shrink-0 text-severity-avoid"
                    >
                      <path
                        d="M3 3l8 8M11 3l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ SCOPE — IS / IS NOT ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="meth-scope-heading"
        className="relative section-y-sm bg-surface-raised/50"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />

        <div className="container relative mx-auto">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              06 · Limitations and scope
            </motion.p>

            <motion.h2
              id="meth-scope-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              Built to inform.{" "}
              <span className="font-serif italic">Not to replace.</span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.15 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="mx-auto mt-12 grid max-w-4xl gap-5 md:mt-14 md:grid-cols-2 md:gap-6"
          >
            <motion.div
              variants={fadeUpItem}
              className="rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
            >
              <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-severity-safe">
                PharmaGuide is
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {SCOPE_IS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-body leading-relaxed text-foreground/85"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[10px] block h-1 w-1 shrink-0 rounded-full bg-severity-safe"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={fadeUpItem}
              className="rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
            >
              <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-severity-avoid">
                PharmaGuide is not
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {SCOPE_IS_NOT.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-body leading-relaxed text-foreground/85"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                      className="mt-[7px] shrink-0 text-severity-avoid"
                    >
                      <path
                        d="M3 3l8 8M11 3l-8 8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={transitions.ambient}
            className="mx-auto mt-12 max-w-2xl text-balance text-center font-serif text-body-lg italic leading-relaxed text-ink md:mt-14"
          >
            Always consult a qualified healthcare provider before starting,
            stopping, or changing any supplement or medication.
          </motion.p>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ CTA STRIP ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Next steps"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center md:gap-6">
            <p className="font-serif text-h2 italic leading-tight text-ink">
              Want to see it in action?
            </p>
            <p className="max-w-prose text-body-lg leading-relaxed text-muted">
              The methodology is the foundation. The product is the proof.
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
                href="/faq"
                className="inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              >
                Read the FAQ
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
