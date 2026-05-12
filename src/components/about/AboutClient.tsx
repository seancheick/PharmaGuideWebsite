"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";

/**
 * /about page client — full body of the About route.
 *
 * Substance restored from the legacy WordPress version (which I'd
 * over-trimmed in v1):
 *   • Founder origin story (two concrete quotes — "my father was
 *     hospitalized" + "then it happened to me"). About pages live or
 *     die on the personal narrative; can't drop this.
 *   • Industry-lies section with 4 specific lie/truth cards + sources
 *     (FDA Approved, Proprietary Blend, Natural so it can't hurt me,
 *     100% Daily Value). Concrete claims + linked authoritative sources.
 *   • 23,000+ ER visits/year stat (NEJM 2015, Geller AI et al.) — the
 *     specific supplement-interaction ER stat, separate from the
 *     homepage's 4,100/day ADE figure.
 *
 * Section flow:
 *   Hero        — "Industry was built to sell. Not to protect you."
 *   01 Why we built it  — founder origin (2 personal quotes)
 *   02 Industry lies    — 4 lie/truth cards with sources
 *   03 The gap          — drug vs supplement recall comparison
 *   04 What we believe  — 4 values cards
 *   05 Team             — founder + 2 advisors
 *   RelatedLinks        — cross-link to /methodology + /features + /careers
 *   CTA                 — Join the beta
 */

const FOUNDER_STORY = [
  {
    quote: "My father was hospitalized.",
    body: "He was already on blood pressure medication. The hospital prescribed something new — with a documented interaction with his existing prescription. **A conflict that could have been caught with a simple cross-reference.**",
  },
  {
    quote: "Then it happened to me.",
    body: "After being diagnosed with a metabolic condition and starting prescription medication, I discovered something troubling: **a supplement I was taking was interfering with how my medication worked — and I only found out by accident.** The information existed. Nobody had connected the dots.",
  },
];

const INDUSTRY_LIES = [
  {
    badge: "Zero pre-market approval",
    lie: "FDA Approved",
    truth:
      'The FDA does not approve supplements before they hit shelves. **Most supplements enter the market without pre-market safety testing.** They are "presumed safe" until proven harmful — sometimes years later, after the harm.',
    source: {
      label: "FDA — Information for Consumers on Using Dietary Supplements",
      href: "https://www.fda.gov/food/dietary-supplements/information-consumers-using-dietary-supplements",
    },
  },
  {
    badge: "The fairy-dusting deception",
    lie: "Proprietary Blend",
    truth:
      'Companies use "proprietary blends" to list ingredients without disclosing individual amounts. **The label may not reveal the exact dose of each active ingredient** — and legally, it doesn\'t have to. PharmaGuide decomposes these blends and estimates per-ingredient ranges.',
    source: {
      label: "Learn more · Ingredient & Quality Transparency",
      href: "/features#ingredient-transparency",
    },
  },
  {
    badge: "23,000 ER visits per year",
    lie: "It's natural, so it can't hurt me",
    truth:
      'Every year, supplement-related events send **23,000+ Americans to the Emergency Room.** From internal bleeding to heart palpitations to acute liver injury — "natural" doesn\'t mean safe.',
    source: {
      label: "Geller AI et al., New England Journal of Medicine (2015)",
      href: "https://www.nejm.org/doi/full/10.1056/NEJMsa1504267",
    },
  },
  {
    badge: "The absorption lie",
    lie: "100% Daily Value",
    truth:
      "Your body isn't a beaker. **Different forms of the same vitamin can absorb differently** — for example, synthetic vitamin E is absorbed less efficiently than its natural form. The label tells you what's in the bottle, not what reaches your bloodstream.",
    source: {
      label: "NIH ODS · Vitamin E fact sheet",
      href: "https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional/",
    },
  },
];

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
    body: "Core stack checks are designed with local-first privacy safeguards. Your data stays on your device wherever possible.",
  },
  {
    num: "04",
    title: "Clinician-reviewed",
    body: "Clinical guidance is reviewed by licensed healthcare professionals before release. Not just AI, not just engineers — actual clinical judgment.",
  },
];

const TEAM = [
  {
    initials: "SC",
    photo: "/team/sean-cheick.webp",
    name: "Sean Cheick Baradji",
    role: "Founder & CEO",
    org: "B&Br Technology · Boston, MA",
    note: "Built PharmaGuide after watching family members navigate medication and supplement complexity without the tools to do it safely.",
  },
  {
    initials: "LP",
    photo: "/team/laurie-pham.webp",
    name: "Laurie Pham, PharmD",
    role: "Doctor of Pharmacy · Clinical Review",
    org: "15+ years pharmacovigilance",
    note: "Reviews interaction guidance before release. Owns the clinical accuracy bar — drug-supplement, supplement-supplement, and dose-summation reasoning.",
  },
  {
    initials: "MF",
    photo: "/team/miriam-farez.webp",
    name: "Miriam Farez, NP",
    role: "Nurse Practitioner · Patient-Education Review",
    org: "Integrative health practice",
    note: "Patient-education review. Reads every post and warning from a healthcare-provider angle: is this clear, accessible, and actionable?",
  },
];

// Tiny inline-bold renderer so quotes can have **emphasis** without
// a full markdown dependency. Same pattern used in FAQClient + LegalPage.
function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-medium text-ink">
        {p}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export function AboutClient() {
  return (
    <div>
      {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="about-hero-heading"
        className="relative pt-24 pb-section-y-sm overflow-hidden sm:pt-28 md:pt-32"
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
                Not always to protect you.
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

      {/* ━━━━━━━━━━━━━━━━━━ 01 WHY WE BUILT IT (founder story) ━━━━━━━━ */}
      <section
        aria-labelledby="about-founder-heading"
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
              01 · Why we built it
            </motion.p>
            <motion.h2
              variants={fadeUpItem}
              id="about-founder-heading"
              className="text-balance text-display-md text-ink"
            >
              This started{" "}
              <span className="font-serif italic">personal.</span>
            </motion.h2>
          </motion.div>

          <motion.ul
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12, delayChildren: 0.15 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            className="mx-auto mt-12 grid max-w-5xl gap-5 md:mt-14 md:grid-cols-2 md:gap-6"
          >
            {FOUNDER_STORY.map((story) => (
              <motion.li
                key={story.quote}
                variants={fadeUpItem}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
              >
                <p className="font-serif text-h2 italic leading-tight text-ink">
                  &ldquo;{story.quote}&rdquo;
                </p>
                <p className="text-body leading-relaxed text-muted">
                  {renderInlineBold(story.body)}
                </p>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={transitions.ambient}
            className="mx-auto mt-10 flex items-center justify-center gap-3 md:mt-12"
          >
            <Image
              src="/team/sean-cheick.webp"
              alt="Sean Cheick Baradji"
              width={64}
              height={64}
              quality={95}
              className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
            />
            <p className="font-mono text-eyebrow uppercase text-subtle">
              Sean Cheick Baradji, Founder &amp; CEO
            </p>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ 02 INDUSTRY LIES ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="about-lies-heading"
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
              02 · What supplement labels don&apos;t always make clear
            </motion.p>
            <motion.h2
              variants={fadeUpItem}
              id="about-lies-heading"
              className="text-balance text-display-md text-ink"
            >
              Four common assumptions.{" "}
              <span className="font-serif italic">Worth a closer look.</span>
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
            {INDUSTRY_LIES.map((item) => (
              <motion.li
                key={item.lie}
                variants={fadeUpItem}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
              >
                {/* Red badge — the headline framing */}
                <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-severity-avoid/[0.08] px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-severity-avoid">
                  <span aria-hidden="true" className="block h-1 w-1 rounded-full bg-severity-avoid" />
                  {item.badge}
                </span>

                {/* The Lie */}
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
                    The assumption
                  </p>
                  <p className="mt-1 font-serif text-h2 italic leading-tight text-ink">
                    &ldquo;{item.lie}&rdquo;
                  </p>
                </div>

                {/* The Truth */}
                <div className="border-t border-border pt-4">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-severity-safe">
                    The truth
                  </p>
                  <p className="mt-2 text-body leading-relaxed text-foreground/85">
                    {renderInlineBold(item.truth)}
                  </p>
                </div>

                {/* Source link */}
                <a
                  href={item.source.href}
                  target={item.source.href.startsWith("/") ? undefined : "_blank"}
                  rel={item.source.href.startsWith("/") ? undefined : "noopener noreferrer"}
                  className="mt-auto inline-flex items-center gap-1.5 font-mono text-eyebrow uppercase text-link underline decoration-link/60 underline-offset-[3px] transition-[color,text-decoration-color] duration-fast ease-smooth hover:text-link-strong hover:decoration-link"
                >
                  Source · {item.source.label}{" "}
                  <span aria-hidden="true">→</span>
                </a>
              </motion.li>
            ))}
          </motion.ul>

          {/* Stat disambiguation — the homepage cites 4,100 daily ER
              visits across all drug-related events; this page cites
              23,000 yearly from supplements specifically. A skeptic
              doing the math would notice; we name the difference
              explicitly so the page reads as honest, not loose. */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={transitions.ambient}
            className="mx-auto mt-8 max-w-2xl text-balance text-center text-body-sm leading-relaxed text-subtle md:mt-10"
          >
            The 23,000 figure is supplement-specific. Separately, the
            homepage cites 4,100+ daily ER visits across all
            medication-related events — a broader category that includes
            prescription interactions.
          </motion.p>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ 03 THE GAP ━━━━━━━━━━━━━━━━━━ */}
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
              03 · The gap we&apos;re closing
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
                There are established systems to identify and respond.
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
                You may never hear about it.
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

      {/* ━━━━━━━━━━━━━━━━━━ 04 WHAT WE BELIEVE ━━━━━━━━━━━━━━━━━━ */}
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
              04 · What we believe
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

      {/* ━━━━━━━━━━━━━━━━━━ 05 TEAM ━━━━━━━━━━━━━━━━━━ */}
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
              05 · The team
            </motion.p>

            <motion.h2
              id="about-team-heading"
              variants={fadeUpItem}
              className="text-balance text-display-md text-ink"
            >
              Small team.{" "}
              <span className="font-serif italic text-accent">Sharp focus.</span>
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
                  {m.photo ? (
                    <Image
                      src={m.photo}
                      alt={m.name}
                      width={112}
                      height={112}
                      quality={95}
                      className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-background"
                    >
                      <span className="font-serif text-h3 italic">{m.initials}</span>
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-serif text-h3 italic leading-tight text-ink">
                      {m.name}
                    </p>
                    <p className="font-mono text-eyebrow uppercase text-subtle">
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
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
