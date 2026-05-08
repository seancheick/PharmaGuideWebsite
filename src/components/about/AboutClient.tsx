"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";

/**
 * /about page client — full body of the About route.
 *
 * Voice + structure refreshed from the legacy WordPress version.
 * Original was 4,800 lines (mostly inlined CSS). This rebuild keeps
 * the content angles that work — supplement-industry critique, recall
 * comparison, values, founder + advisory team — and translates them
 * into our typography/restraint system.
 *
 * Section flow:
 *   1. Hero — "The supplement industry was built to sell.
 *             Not to protect you." (the legacy headline; strong, kept)
 *   2. Origin — short founder note + the thesis
 *   3. The gap — drug vs supplement recall comparison (2-card split)
 *   4. What we believe — 4 value cards
 *   5. Team — founder card + 2 advisor cards
 *   6. CTA — Join the beta
 */

const VALUES = [
  {
    num: "01",
    title: "Radical transparency",
    body: "Every interaction shows the mechanism, evidence level, and source. When evidence is weak or conflicting, we say so directly.",
  },
  {
    num: "02",
    title: "No conflicts of interest",
    body: "We don't accept supplement-brand sponsorships, affiliate commissions, or paid placements. The product is the business model.",
  },
  {
    num: "03",
    title: "Privacy by design",
    body: "Your stack and conditions stay on your device. AES-256 encryption locally. We can't read your data — by architecture, not policy.",
  },
  {
    num: "04",
    title: "Clinician-reviewed",
    body: "Every interaction is reviewed by a licensed pharmacist before it ships. Not just AI, not just engineers — actual clinical judgment.",
  },
];

const TEAM = [
  {
    initials: "SB",
    name: "Sean Cheick Baradji",
    role: "Founder & CEO",
    org: "B&Br Technology · Boston, MA",
    note: "Built PharmaGuide after watching family members navigate medication and supplement complexity without the tools to do it safely.",
  },
  {
    initials: "PL",
    name: "Dr. Pham L., PharmD",
    role: "Clinical Pharmacist",
    org: "15+ years pharmacovigilance",
    note: "Reviews every interaction before it ships. Owns the clinical accuracy bar — drug-supplement, supplement-supplement, and dose-summation reasoning.",
  },
  {
    initials: "MD",
    name: "Miriam D., NP",
    role: "Nurse Practitioner",
    org: "Integrative health practice",
    note: "Patient-education review. Reads every post and warning from a healthcare-provider angle: is this clear, accessible, and actionable?",
  },
];

export function AboutClient() {
  return (
    <main id="main">
      {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="about-hero-heading"
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
            className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center md:gap-9"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              About
            </motion.p>

            <motion.h1
              id="about-hero-heading"
              variants={fadeUpItem}
              className="text-balance text-display-lg leading-[1.04] text-ink"
            >
              The supplement industry was built to sell.{" "}
              <span className="font-serif italic text-accent">
                Not to protect you.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              Most dietary supplements enter the US market without FDA
              pre-market safety testing. The catalog is enormous, the labels
              are confusing, and when something gets recalled, you&apos;re
              usually the last to find out.
            </motion.p>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose font-serif text-h3 italic leading-snug text-ink"
            >
              We built PharmaGuide because this shouldn&apos;t be normal.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ THE GAP ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="about-gap-heading"
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
              01 · The gap we&apos;re closing
            </motion.p>

            <motion.h2
              id="about-gap-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              Two systems.{" "}
              <span className="font-serif italic">Wildly different rules.</span>
            </motion.h2>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body leading-relaxed text-muted"
            >
              Compare what happens when a prescription drug is recalled vs.
              when a supplement is recalled. The gap is the entire reason
              PharmaGuide exists.
            </motion.p>
          </motion.div>

          <motion.div
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.15 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="mx-auto mt-12 grid max-w-5xl gap-5 md:mt-14 md:grid-cols-2 md:gap-6"
          >
            {/* Drugs — what works */}
            <motion.div
              variants={fadeUpItem}
              className="rounded-2xl border border-severity-safe/30 bg-severity-safe/[0.04] p-7 shadow-sm md:p-8"
            >
              <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-severity-safe">
                If your prescription drug is recalled
              </p>
              <h3 className="mt-4 font-serif text-h2 italic leading-tight text-ink">
                You&apos;re tracked, notified, protected.
              </h3>
              <ul className="mt-5 flex flex-col gap-2.5 text-body leading-relaxed text-foreground/85">
                {[
                  "Pharmacy has your record on file",
                  "FDA mandates direct notification",
                  "Insurance flags the prescription",
                  "Your prescriber is informed",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[10px] block h-1 w-1 shrink-0 rounded-full bg-severity-safe"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Supplements — what's broken */}
            <motion.div
              variants={fadeUpItem}
              className="rounded-2xl border border-severity-avoid/30 bg-severity-avoid/[0.04] p-7 shadow-sm md:p-8"
            >
              <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-severity-avoid">
                If your supplement is recalled
              </p>
              <h3 className="mt-4 font-serif text-h2 italic leading-tight text-ink">
                You keep taking it.
              </h3>
              <ul className="mt-5 flex flex-col gap-2.5 text-body leading-relaxed text-foreground/85">
                {[
                  "No purchase record connects you to the brand",
                  "FDA recalls reach industry, not consumers",
                  "No insurer or prescriber flags it",
                  "You learn from a news article — if at all",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
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

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={transitions.ambient}
            className="mx-auto mt-12 max-w-2xl text-balance text-center font-serif text-body-lg italic leading-relaxed text-ink md:mt-14"
          >
            We built PharmaGuide to close this gap.
          </motion.p>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ WHAT WE BELIEVE ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="about-values-heading"
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
              02 · What we believe
            </motion.p>

            <motion.h2
              id="about-values-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              Four principles.{" "}
              <span className="font-serif italic">Non-negotiable.</span>
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
            {VALUES.map((v) => (
              <motion.li
                key={v.num}
                variants={fadeUpItem}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
              >
                <span className="font-mono text-[11px] font-medium tabular-nums uppercase tracking-[0.18em] text-accent">
                  {v.num}
                </span>
                <h3 className="font-serif text-h2 italic leading-tight text-ink">
                  {v.title}
                </h3>
                <p className="text-body leading-relaxed text-muted">
                  {v.body}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ TEAM ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="about-team-heading"
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
              03 · The team
            </motion.p>

            <motion.h2
              id="about-team-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              Small team.{" "}
              <span className="font-serif italic">Real names.</span>
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
            {TEAM.map((m, i) => (
              <motion.li
                key={m.name}
                variants={fadeUpItem}
                className={`flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8 ${i === 0 ? "md:col-span-3 lg:col-span-1" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-background"
                  >
                    <span className="font-serif text-h3 italic">{m.initials}</span>
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-h3 italic leading-tight text-ink">
                      {m.name}
                    </p>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
                      {m.role}
                    </p>
                  </div>
                </div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-foreground/65">
                  {m.org}
                </p>
                <p className="text-body-sm leading-relaxed text-muted">
                  {m.note}
                </p>
              </motion.li>
            ))}
          </motion.ul>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={transitions.ambient}
            className="mx-auto mt-10 max-w-2xl text-balance text-center font-serif text-body-lg italic leading-relaxed text-ink md:mt-14"
          >
            Boston · Cambridge medical ecosystem.
          </motion.p>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ CTA ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Join us"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={transitions.reveal}
            className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center md:gap-7"
          >
            <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80">
              Sound like something you need?
            </p>
            <h2 className="text-balance text-display-md text-ink">
              Join us in building something{" "}
              <span className="font-serif italic text-accent">
                that actually matters.
              </span>
            </h2>
            <p className="max-w-prose text-body-lg leading-relaxed text-muted">
              Opening in waves through 2026. Be among the first to use
              PharmaGuide as we prepare for launch.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              <Link
                href="/#waitlist"
                className="inline-flex items-center justify-center gap-2 rounded-pill bg-accent px-6 py-3.5 text-body font-medium text-white shadow-sm transition-[background-color,box-shadow,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
              >
                Join the beta
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink"
              >
                Read the methodology
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
