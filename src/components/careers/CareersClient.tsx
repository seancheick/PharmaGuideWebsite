"use client";

import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { site } from "@/lib/site";

/**
 * /careers — recruiting page.
 *
 * Honest framing: we're not always actively hiring. The page describes
 * the kind of work we do, the kind of people who fit, and the roles
 * we'd jump on if the right person reached out — instead of pretending
 * to have 6 active reqs when we don't.
 *
 * This pattern (small founder-stage companies that name the roles
 * they'd hire for, but don't pretend reqs are open) tends to attract
 * higher-quality inbound than a heavy "we're hiring!" page.
 */

const WHY = [
  {
    num: "01",
    title: "Clinical impact, not metrics impact",
    body: "PharmaGuide ships into people's actual medicine routines — interaction warnings that prevent harm, depletion checks that save years of unexplained fatigue. Not optimizing engagement on a feed.",
  },
  {
    num: "02",
    title: "Ground floor, full ownership",
    body: "Small team. The work you do shows up in production within the same week. Architecture decisions stick around for years. Founding-team equity for the right people.",
  },
  {
    num: "03",
    title: "Quality over velocity",
    body: "We test before we ship. We review every clinical claim. We don't chase weekly feature ship dates if it means the science is sloppy. Clinically-aligned engineering culture.",
  },
  {
    num: "04",
    title: "Clinician-engineer collaboration",
    body: "Engineers work directly with our pharmacist + nurse-practitioner advisors. The interaction logic isn't designed in a vacuum — it's reviewed, challenged, and shipped together.",
  },
];

const ROLES = [
  {
    role: "Flutter / Mobile Engineer",
    body: "Cross-platform iOS + Android. You'll work on the offline-first catalog, scan flow, stack analysis UI, and the shipping sequence to App Store + Play.",
  },
  {
    role: "Backend / Pipeline Engineer",
    body: "TypeScript or Python. You'll work on the interaction-rules pipeline, OTA catalog updater, and the systems that keep the 180,000+ product catalog and the clinical rule set fresh.",
  },
  {
    role: "Clinical Pharmacist (PharmD)",
    body: "Reviewer for new interactions + medication-depletion mappings. Part-time or contract OK. Pharmacovigilance experience valued.",
  },
  {
    role: "Content Lead",
    body: "Long-form medical writing for the blog (1,500-3,000 words per post, 3-4 posts/month). Health journalism background or pharmacy degree. Voice rules in our style guide are strict.",
  },
];

const CULTURE = [
  "Ownership over titles",
  "Transparency by default",
  "Quality over velocity",
  "Calm clinical intelligence — no manufactured urgency",
];

export function CareersClient() {
  return (
    <main id="main">
      {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="careers-hero-heading"
        className="relative pt-24 pb-section-y-sm overflow-hidden sm:pt-28 md:pt-32"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute h-[160px] w-[520px] rounded-pill bg-accent/[0.07] blur-3xl"
            style={{ top: "-50px", right: "-180px", transform: "rotate(-10deg)" }}
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
              Careers
            </motion.p>

            <motion.h1
              variants={fadeUpItem}
              id="careers-hero-heading"
              className="text-balance text-display-lg leading-[1.04] text-ink"
            >
              Build technology that{" "}
              <span className="font-serif italic text-accent">
                prevents harm.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              A focused team building the first interaction engine that covers
              depletions, dose accumulation, and real-time recalls — all
              on-device. Early stage. Direct clinical impact. No theater.
            </motion.p>

            {/* Honest framing — we're not always actively hiring */}
            <motion.div
              variants={fadeUpItem}
              className="mt-2 inline-flex items-center gap-2.5 rounded-pill border border-border bg-surface-raised/60 px-4 py-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-foreground/80"
            >
              <span
                aria-hidden="true"
                className="block h-1.5 w-1.5 rounded-full bg-severity-monitor"
              />
              Not actively hiring · Always reading inbound
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ WHY ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="careers-why-heading"
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
            className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              01 · Why work here
            </motion.p>
            <motion.h2
              variants={fadeUpItem}
              id="careers-why-heading"
              className="text-balance text-display-md text-ink"
            >
              Four reasons this work{" "}
              <span className="font-serif italic">actually matters.</span>
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
            {WHY.map((w) => (
              <motion.li
                key={w.num}
                variants={fadeUpItem}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
              >
                <span className="font-mono text-[11px] font-medium tabular-nums uppercase tracking-[0.18em] text-accent">
                  {w.num}
                </span>
                <h3 className="font-serif text-h2 italic leading-tight text-ink">
                  {w.title}
                </h3>
                <p className="text-body leading-relaxed text-muted">{w.body}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ ROLES ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="careers-roles-heading"
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
              02 · Roles we&apos;d jump on
            </motion.p>
            <motion.h2
              variants={fadeUpItem}
              id="careers-roles-heading"
              className="text-balance text-display-md text-ink"
            >
              The right person for any of these{" "}
              <span className="font-serif italic">won&apos;t wait long.</span>
            </motion.h2>
            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body leading-relaxed text-muted"
            >
              These aren&apos;t open reqs. They&apos;re the shapes of people we
              would prioritize hiring. If you read one of them and recognize
              yourself, write to us.
            </motion.p>
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
            className="mx-auto mt-12 grid max-w-5xl gap-4 md:mt-14 md:grid-cols-2 md:gap-5"
          >
            {ROLES.map((r) => (
              <motion.li
                key={r.role}
                variants={fadeUpItem}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-7"
              >
                <h3 className="font-serif text-h3 italic leading-tight text-ink">
                  {r.role}
                </h3>
                <p className="text-body-sm leading-relaxed text-muted">
                  {r.body}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ CULTURE STRIP ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="careers-culture-heading"
        className="relative pb-section-y-sm"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-surface-raised/60 p-7 md:p-9">
            <p
              id="careers-culture-heading"
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-foreground/80"
            >
              How we work
            </p>
            <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CULTURE.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-3 text-body leading-relaxed text-foreground/85"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[10px] block h-1 w-1 shrink-0 rounded-full bg-accent"
                  />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ CTA ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Get in touch"
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
              Recognize yourself in any of those?
            </p>
            <p className="max-w-prose text-body-lg leading-relaxed text-muted">
              Send a short note to{" "}
              <a
                href={`mailto:careers@pharmaguide.io?subject=PharmaGuide%20—%20Inbound`}
                className="text-link underline decoration-link/60 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:text-link-strong hover:decoration-link"
              >
                careers@pharmaguide.io
              </a>{" "}
              with what you&apos;ve built and what you&apos;d want to build
              with us. Two paragraphs is fine. We read every one.
            </p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
              {site.city} · Remote-friendly for the right person
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
