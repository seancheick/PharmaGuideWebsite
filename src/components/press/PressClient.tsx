"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { site } from "@/lib/site";

/**
 * /press — Press & Media page.
 *
 * Built for the practical needs of a journalist or editor writing
 * about PharmaGuide:
 *   • Quick boilerplate descriptions (one-liner, one-paragraph,
 *     longer)
 *   • Brand assets (logo download, app icon)
 *   • Founder + clinical advisory team facts
 *   • Press contact email
 *   • Brand-usage guidelines (how to describe us, how to say "PharmaGuide"
 *     consistently)
 *
 * Compact and dense, not heavy and animated. Press pages are
 * reference material — design optimizes for "find the fact and copy
 * it" rather than narrative.
 */

const FACTS = [
  { label: "Founded", value: "2025" },
  { label: "Headquarters", value: "Boston, MA · USA" },
  { label: "Founder & CEO", value: "Sean Cheick Baradji" },
  { label: "Parent company", value: "B&Br Technology" },
  { label: "Catalog scale", value: "180,000+ products" },
  { label: "Clinical review", value: "Licensed PharmD + NP" },
  { label: "Launch", value: "Opening in waves through 2026" },
  { label: "Categories", value: "Health · Medical · Lifestyle" },
];

const LEADERSHIP = [
  {
    initials: "SC",
    photo: "/team/sean-cheick.webp",
    name: "Sean Cheick Baradji",
    role: "Founder & CEO",
    bio: "Built PharmaGuide after watching family members navigate medication and supplement complexity without the tools to do it safely. Based in Boston.",
  },
  {
    initials: "LP",
    photo: "/team/laurie-pham.webp",
    name: "Laurie Pham, PharmD",
    role: "Doctor of Pharmacy · Clinical Review",
    bio: "Leads clinical accuracy review across drug-supplement interactions, depletion mappings, and dose-summation reasoning. 15+ years pharmacovigilance.",
  },
  {
    initials: "MF",
    photo: "/team/miriam-farez.webp",
    name: "Miriam Farez, NP",
    role: "Nurse Practitioner · Patient-Education Review",
    bio: "Patient-education review. Reads every interaction warning + post from a healthcare-provider angle: clarity, accessibility, action.",
  },
];

const BOILERPLATE = {
  oneLiner:
    "PharmaGuide is a clinician-reviewed supplement and medication safety platform with on-device interaction analysis, evidence-graded by clinicians.",
  paragraph:
    "PharmaGuide is the supplement and medication co-pilot for people who want to understand what they actually take. The mobile apps (iOS + Android) read your full stack as a system — flagging interactions, medication-nutrient depletions, dose accumulation, FDA recalls, and ingredient quality across a 180,000+ product on-device catalog. Every interaction is reviewed by a licensed clinical pharmacist before it ships. The architecture is privacy-first: your stack and conditions never leave your device. Founded 2025 in Boston by Sean Cheick Baradji. Opening in waves through 2026.",
  longer:
    "Most consumer health apps check one supplement at a time. PharmaGuide reads the full stack — multi-way interactions, dose accumulation across products, timing conflicts, and the depletion patterns of common prescriptions (statins → CoQ10, metformin → B12 + folate, PPIs → magnesium + B12). Live FDA recall monitoring surfaces alerts on the products you actually scanned. A 4-pillar PG Score evaluates ingredient quality, safety + purity, evidence + research, and brand trust — including the proprietary blends most apps can't decompose. The catalog covers 180,000+ products and is reviewed continuously by Laurie Pham, PharmD (Clinical Pharmacist) and Miriam Farez, NP (Nurse Practitioner). All computation runs on-device with AES-256 encryption locally; no health data is uploaded to PharmaGuide servers. The architecture is HIPAA-aligned. Founded in 2025 by Sean Cheick Baradji and B&Br Technology, headquartered in Boston, MA. Mobile apps open in waves through 2026.",
};

export function PressClient() {
  return (
    <main id="main">
      {/* ━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="press-hero-heading"
        className="relative pt-24 pb-section-y-sm overflow-hidden sm:pt-28 md:pt-32"
      >
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
            className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center md:gap-9"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              Press &amp; Media
            </motion.p>

            <motion.h1
              id="press-hero-heading"
              variants={fadeUpItem}
              className="text-balance text-display-lg leading-[1.06] text-ink"
            >
              Everything a journalist needs,{" "}
              <span className="font-serif italic text-accent">
                in one place.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              Boilerplate descriptions, leadership facts, brand assets, and
              the press contact. If you&apos;re writing about PharmaGuide and
              need something we haven&apos;t included, email us — we respond
              within one business day.
            </motion.p>

            <motion.p
              variants={fadeUpItem}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/80"
            >
              Press contact ·{" "}
              <a
                href="mailto:press@pharmaguide.io"
                className="text-link underline decoration-link/60 underline-offset-[3px] hover:text-link-strong hover:decoration-link"
              >
                press@pharmaguide.io
              </a>
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ QUICK FACTS ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="press-facts-heading"
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
            className="mx-auto max-w-5xl"
          >
            <motion.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              Quick facts
            </motion.p>
            <motion.h2
              variants={fadeUpItem}
              id="press-facts-heading"
              className="mt-4 text-balance text-display-md text-ink"
            >
              The numbers and the names.
            </motion.h2>

            <motion.dl
              variants={fadeUpItem}
              className="mt-12 grid gap-x-10 gap-y-6 border-y border-border py-8 sm:grid-cols-2 md:mt-14 md:py-10 lg:grid-cols-3"
            >
              {FACTS.map((f) => (
                <div key={f.label} className="flex flex-col gap-1">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
                    {f.label}
                  </dt>
                  <dd className="font-serif text-h3 italic leading-tight text-ink">
                    {f.value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ BOILERPLATE ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="press-boilerplate-heading"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-4xl">
            <motion.div
              variants={fadeUpContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-15%" }}
              className="flex flex-col items-start gap-3"
            >
              <motion.p
                variants={fadeUpItem}
                className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
              >
                Boilerplate
              </motion.p>
              <motion.h2
                variants={fadeUpItem}
                id="press-boilerplate-heading"
                className="text-balance text-display-md text-ink"
              >
                Three lengths.{" "}
                <span className="font-serif italic">Pick what you need.</span>
              </motion.h2>
            </motion.div>

            <div className="mt-12 flex flex-col gap-6 md:mt-14">
              <BoilerplateBlock label="One-liner" text={BOILERPLATE.oneLiner} />
              <BoilerplateBlock label="One paragraph" text={BOILERPLATE.paragraph} />
              <BoilerplateBlock label="Longer description" text={BOILERPLATE.longer} />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ LEADERSHIP ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="press-leadership-heading"
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
              Leadership &amp; clinical oversight
            </motion.p>
            <motion.h2
              variants={fadeUpItem}
              id="press-leadership-heading"
              className="text-balance text-display-md text-ink"
            >
              Names + bios for{" "}
              <span className="font-serif italic">attribution.</span>
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
            className="mx-auto mt-12 grid max-w-5xl gap-5 md:mt-14 md:grid-cols-3 md:gap-6"
          >
            {LEADERSHIP.map((m) => (
              <motion.li
                key={m.name}
                variants={fadeUpItem}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={m.photo}
                    alt={m.name}
                    width={96}
                    height={96}
                    quality={95}
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0">
                    <p className="font-serif text-h3 italic leading-tight text-ink">
                      {m.name}
                    </p>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
                      {m.role}
                    </p>
                  </div>
                </div>
                <p className="text-body-sm leading-relaxed text-muted">
                  {m.bio}
                </p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ BRAND ASSETS ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="press-assets-heading"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-4xl">
            <motion.div
              variants={fadeUpContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-15%" }}
              className="flex flex-col gap-3"
            >
              <motion.p
                variants={fadeUpItem}
                className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
              >
                Brand assets
              </motion.p>
              <motion.h2
                variants={fadeUpItem}
                id="press-assets-heading"
                className="text-balance text-display-md text-ink"
              >
                Logo, screenshots,{" "}
                <span className="font-serif italic">brand colors.</span>
              </motion.h2>
            </motion.div>

            <div className="mt-12 grid gap-4 md:mt-14 md:grid-cols-2">
              <AssetCard
                label="Primary logo · 512px"
                href={`${site.url}/icon2.png`}
                preview={
                  <div className="flex h-32 items-center justify-center rounded-xl bg-accent">
                    <span
                      aria-hidden="true"
                      className="block h-3 w-3 rounded-full bg-background"
                    />
                  </div>
                }
              />
              <AssetCard
                label="Favicon · 32px"
                href={`${site.url}/icon.png`}
                preview={
                  <div className="flex h-32 items-center justify-center rounded-xl bg-surface-subtle">
                    <div className="rounded-lg bg-accent px-3 py-2">
                      <span
                        aria-hidden="true"
                        className="block h-1 w-1 rounded-full bg-background"
                      />
                    </div>
                  </div>
                }
              />
            </div>

            {/* Brand colors */}
            <div className="mt-10 rounded-2xl border border-border bg-surface p-6 md:p-8">
              <p className="font-mono text-eyebrow font-medium uppercase tracking-[0.14em] text-foreground/80">
                Brand colors
              </p>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {[
                  { name: "Accent · deep teal", hex: "#183B3F", className: "bg-accent" },
                  { name: "Background · warm cream", hex: "#FAF9F6", className: "bg-background border border-border" },
                  { name: "Ink · near black", hex: "#111314", className: "bg-ink" },
                  { name: "Surface · subtle", hex: "#F4F2EE", className: "bg-surface-subtle border border-border" },
                ].map((c) => (
                  <li key={c.hex} className="flex flex-col gap-2">
                    <span
                      aria-hidden="true"
                      className={`block h-12 w-full rounded-xl ${c.className}`}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/85">
                      {c.name}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-subtle">
                      {c.hex}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ BRAND USAGE ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="press-usage-heading"
        className="relative section-y-sm bg-surface-raised/40"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />

        <div className="container relative mx-auto">
          <div className="mx-auto max-w-4xl">
            <motion.div
              variants={fadeUpContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-15%" }}
              className="flex flex-col gap-3"
            >
              <motion.p
                variants={fadeUpItem}
                className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
              >
                Brand usage
              </motion.p>
              <motion.h2
                variants={fadeUpItem}
                id="press-usage-heading"
                className="text-balance text-display-md text-ink"
              >
                How to write our name + a few rules.
              </motion.h2>
            </motion.div>

            <ul className="mt-10 flex flex-col gap-3 md:mt-12">
              {[
                {
                  do: "PharmaGuide",
                  notes: "One word, capital P + G. Camel-case.",
                },
                {
                  do: "Pharma Guide",
                  notes: "Don't space it. ✕",
                  bad: true,
                },
                {
                  do: "PharmaGuide is a supplement and medication safety platform",
                  notes: "Default first-mention sentence.",
                },
                {
                  do: 'Brand voice descriptors that work: "clinical-grade," "evidence-graded," "privacy-first," "clinician-reviewed."',
                  notes: "Avoid: 'AI-powered', 'revolutionary', 'game-changing'.",
                },
              ].map((rule, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-4 rounded-2xl border bg-surface p-5 shadow-xs ${rule.bad ? "border-severity-avoid/30" : "border-border"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${rule.bad ? "bg-severity-avoid/15 text-severity-avoid" : "bg-severity-safe/15 text-severity-safe"}`}
                  >
                    {rule.bad ? "✕" : "✓"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-h3 italic leading-snug text-ink">
                      {rule.do}
                    </p>
                    <p className="mt-1 text-body-sm leading-relaxed text-muted">
                      {rule.notes}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ CTA ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Press contact"
        className="relative section-y-sm border-t border-border"
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
              Couldn&apos;t find what you needed?
            </p>
            <p className="max-w-prose text-body-lg leading-relaxed text-muted">
              Email{" "}
              <a
                href="mailto:press@pharmaguide.io"
                className="text-link underline decoration-link/60 underline-offset-[3px] hover:text-link-strong hover:decoration-link"
              >
                press@pharmaguide.io
              </a>{" "}
              — we respond within one business day. Founder availability for
              interviews is real and reasonable; just give us 48 hours&apos;
              notice.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink"
            >
              Read more about us
              <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

// ─── Boilerplate block ─────────────────────────────────────────────

function BoilerplateBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      className="rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
    >
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-accent">
        {label}
      </p>
      <p className="mt-4 text-body leading-relaxed text-foreground/85">
        {text}
      </p>
    </motion.div>
  );
}

// ─── Asset card ────────────────────────────────────────────────────

function AssetCard({
  label,
  href,
  preview,
}: {
  label: string;
  href: string;
  preview: React.ReactNode;
}) {
  return (
    <a
      href={href}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent md:p-6"
    >
      {preview}
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground/85">
          {label}
        </p>
        <span
          aria-hidden="true"
          className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-accent transition-transform duration-fast ease-smooth group-hover:translate-x-0.5"
        >
          Download →
        </span>
      </div>
    </a>
  );
}
