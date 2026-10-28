"use client";

import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
import { fadeUpContainer, fadeUpItem, transitions } from "@/lib/tokens";
import { FOUNDER, LEAD_REVIEWER, TEAM, displayName } from "@/lib/people";
import { SOURCE_LABEL_COUNT, site } from "@/lib/site";

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
  { label: "Founded", value: site.foundingDate },
  { label: "Headquarters", value: "Boston, MA · USA" },
  { label: "Founder & CEO", value: FOUNDER.name },
  { label: "Parent company", value: site.parentCompany },
  { label: "Label source", value: `NIH DSLD · ${SOURCE_LABEL_COUNT} labels` },
  { label: "Beta testing", value: "Small group, including clinicians" },
  { label: "Access", value: "Opening in small groups" },
  { label: "Categories", value: "Health · Medical · Lifestyle" },
];

// Leadership cards read lib/people.ts (TEAM) — same records as /about.

const BOILERPLATE = {
  oneLiner:
    "PharmaGuide helps people understand supplement product information and interaction warnings, with core stack checks running on-device.",
  paragraph:
    `PharmaGuide brings supplement product information, known interaction warnings and stack checks into one app. Its catalog uses label information from NIH's Dietary Supplement Label Database, a source containing ${SOURCE_LABEL_COUNT} labels; that is not a count of products evaluated by PharmaGuide. A small group, including clinicians, is testing the app as beta access opens gradually. Core stack checks run on-device. Medications, conditions and health profiles stay on the device by default, with an explicit, scoped option to share with an AI assistant. FDA recall alerts are in development and are not available in the current beta. Founded ${site.foundingDate} in Boston by ${FOUNDER.name}.`,
  longer:
    `PharmaGuide helps people connect supplement product information with their medications and existing stack. Current checks can surface known interaction warnings, overlapping nutrients and medication and nutrient links. Results depend on the available product data and the details entered. Where a product can be evaluated, the PG Score out of 100 covers six dimensions: formulation, dose, evidence, transparency, verification, and safety and hygiene. A score describes product quality, not personal safety. Hidden amounts in proprietary blends are not guessed. The catalog uses NIH's Dietary Supplement Label Database (${SOURCE_LABEL_COUNT} source labels), not laboratory measurements of every bottle. A small group, including clinicians, is testing the app before wider access. Core interaction analysis runs on-device, and medications, conditions and health profiles stay on the user's phone by default unless explicitly shared with an AI assistant; a signed-in user's supplement list is backed up to their account. FDA recall alerts are in development and are not available in the current beta. Founded in ${site.foundingDate} by ${FOUNDER.name} and ${site.parentCompany}, headquartered in Boston, MA.`,
};

const FOUNDER_STORY =
  "Sean Cheick Baradji built PharmaGuide after the same failure happened twice in his family. His father was hospitalized while on blood pressure medication and prescribed a new drug with a documented interaction with his existing prescription, a conflict a simple cross-reference could have highlighted. Later, after his own diagnosis and prescription, Cheick discovered by accident that a supplement he was taking was interfering with his medication. The information existed in both cases. Nobody had connected the dots, because prescriptions live in one system and supplements in another. A self-taught developer based in Boston, he built PharmaGuide to bring that information together. A small group, including clinicians, is testing the app as he works toward wider access. He also founded Keniya Health, a condition-aware snack box company. PharmaGuide beta access is opening in small groups.";

const PULL_QUOTES = [
  {
    quote:
      "Nobody was reading my whole stack. The pharmacist saw the prescriptions, the label showed the supplement, and the interaction lived in the gap between them.",
    attribution: "Sean Cheick Baradji, on why he built PharmaGuide",
  },
  {
    quote:
      "A supplement being on the shelf is not the same as FDA approval. People deserve a clearer way to understand the label, the evidence and what a warning means.",
    attribution: "Sean Cheick Baradji, on the industry",
    source: { label: "FDA supplement guidance", href: "https://www.fda.gov/food/dietary-supplements" },
  },
  {
    quote:
      "High-risk questions should never be an AI's freehand answer. Our core interaction checks use rules and reference data. The point is to explain what we know and make the limits clear, not replace clinical judgment.",
    attribution: "Sean Cheick Baradji, on AI in health",
  },
];

const STORY_ANGLES = [
  {
    title: "The gummy problem",
    body: "A 2023 JAMA study found 22 of 25 tested melatonin gummies inaccurately labeled, including one with no detectable melatonin. We can explain the published findings and walk through a gummy label. Our catalog contains label information, not measurements of what is inside each bottle.",
    source: { label: "Read the JAMA study", href: "https://jamanetwork.com/journals/jama/fullarticle/2804077" },
  },
  {
    title: "Medication and nutrient links",
    body: "How to read the evidence behind a medication and nutrient link, and what to ask a clinician about monitoring. We can explain why a biochemical change does not automatically establish a benefit from taking a supplement.",
  },
  {
    title: "What proprietary blends hide",
    body: "We can walk through examples of blend labels that disclose ingredients but not individual amounts, and explain why that limits dose-based conclusions. We do not guess hidden quantities.",
  },
  {
    title: "FDA recall alerts, in development",
    body: "Recall notices can be difficult to follow and match to the products people use. We are building FDA recall alerts to help with that gap. They are in development and are not available in the current beta.",
    source: { label: "FDA recall information", href: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts" },
  },
];

const INTERVIEW_TOPICS = [
  {
    name: `${FOUNDER.name} (founder)`,
    topics:
      "Building PharmaGuide as a self-taught solo founder; making supplement labels and warning explanations easier to understand; privacy boundaries; testing with small groups before wider access.",
  },
  {
    name: `${displayName(LEAD_REVIEWER)} (clinical perspective)`,
    topics:
      "Drug and supplement interactions clinicians worry about most; how to read a supplement label like a pharmacist; nutrient depletion from common prescriptions.",
  },
];

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
          <m.div
            variants={fadeUpContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center md:gap-9"
          >
            <m.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              Press &amp; Media
            </m.p>

            <m.h1
              id="press-hero-heading"
              variants={fadeUpItem}
              className="text-balance text-display-lg leading-[1.06] text-ink"
            >
              Everything a journalist needs,{" "}
              <span className="font-serif italic text-accent">
                in one place.
              </span>
            </m.h1>

            <m.p
              variants={fadeUpItem}
              className="max-w-prose text-body-lg leading-relaxed text-muted"
            >
              Boilerplate descriptions, leadership facts, brand assets, and
              the press contact. If you&apos;re writing about PharmaGuide and
              need something we haven&apos;t included, email us with your topic
              and deadline.
            </m.p>

            <m.p
              variants={fadeUpItem}
              className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground/80"
            >
              Press contact ·{" "}
              <a
                href={`mailto:${site.pressEmail}`}
                className="text-link underline decoration-link/60 underline-offset-[3px] hover:text-link-strong hover:decoration-link"
              >
                {site.pressEmail}
              </a>
            </m.p>
          </m.div>
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
          <m.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto max-w-5xl"
          >
            <m.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              Quick facts
            </m.p>
            <m.h2
              variants={fadeUpItem}
              id="press-facts-heading"
              className="mt-4 text-balance text-display-md text-ink"
            >
              The numbers and the names.
            </m.h2>

            <m.dl
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
            </m.dl>
          </m.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ BOILERPLATE ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="press-boilerplate-heading"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-4xl">
            <m.div
              variants={fadeUpContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-15%" }}
              className="flex flex-col items-start gap-3"
            >
              <m.p
                variants={fadeUpItem}
                className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
              >
                Boilerplate
              </m.p>
              <m.h2
                variants={fadeUpItem}
                id="press-boilerplate-heading"
                className="text-balance text-display-md text-ink"
              >
                Three lengths.{" "}
                <span className="font-serif italic">Pick what you need.</span>
              </m.h2>
            </m.div>

            <div className="mt-12 flex flex-col gap-6 md:mt-14">
              <BoilerplateBlock label="One-liner" text={BOILERPLATE.oneLiner} />
              <BoilerplateBlock label="One paragraph" text={BOILERPLATE.paragraph} />
              <BoilerplateBlock label="Longer description" text={BOILERPLATE.longer} />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ FOUNDER STORY + PULL QUOTES ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="press-founder-story-heading"
        className="relative section-y-sm"
      >
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-border" />

        <div className="container relative mx-auto">
          <div className="mx-auto max-w-4xl">
            <m.div
              variants={fadeUpContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-15%" }}
              className="flex flex-col items-start gap-3"
            >
              <m.p
                variants={fadeUpItem}
                className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
              >
                The founder story
              </m.p>
              <m.h2
                variants={fadeUpItem}
                id="press-founder-story-heading"
                className="text-balance text-display-md text-ink"
              >
                It happened twice.{" "}
                <span className="font-serif italic">Then he built the fix.</span>
              </m.h2>
            </m.div>

            <p className="mt-10 max-w-prose text-body-lg leading-relaxed text-muted">
              {FOUNDER_STORY}
            </p>

            <div className="mt-12 flex flex-col gap-6">
              {PULL_QUOTES.map((item) => (
                <figure
                  key={item.quote}
                  className="rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
                >
                  <blockquote className="font-serif text-h3 italic leading-snug text-ink">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
                    {item.attribution}
                  </figcaption>
                  {item.source && (
                    <a href={item.source.href} className="mt-3 inline-block text-body-sm text-link underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                      {item.source.label}
                    </a>
                  )}
                </figure>
              ))}
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
          <m.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-15%" }}
            className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center md:gap-7"
          >
            <m.p
              variants={fadeUpItem}
              className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
            >
              Team &amp; clinical perspectives
            </m.p>
            <m.h2
              variants={fadeUpItem}
              id="press-leadership-heading"
              className="text-balance text-display-md text-ink"
            >
              Names + bios for{" "}
              <span className="font-serif italic">attribution.</span>
            </m.h2>
          </m.div>

          <m.ul
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
            {TEAM.map((person) => (
              <m.li
                key={person.id}
                variants={fadeUpItem}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={person.photo}
                    alt={person.name}
                    width={96}
                    height={96}
                    quality={95}
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />
                  <div className="min-w-0">
                    <p className="font-serif text-h3 italic leading-tight text-ink">
                      {displayName(person)}
                    </p>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-subtle">
                      {person.role}
                    </p>
                  </div>
                </div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-foreground/65">
                  {person.context}
                </p>
                <p className="text-body-sm leading-relaxed text-muted">
                  {person.bio}
                </p>
              </m.li>
            ))}
          </m.ul>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ BRAND ASSETS ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="press-assets-heading"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-4xl">
            <m.div
              variants={fadeUpContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-15%" }}
              className="flex flex-col gap-3"
            >
              <m.p
                variants={fadeUpItem}
                className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
              >
                Brand assets
              </m.p>
              <m.h2
                variants={fadeUpItem}
                id="press-assets-heading"
                className="text-balance text-display-md text-ink"
              >
                Logo, screenshots,{" "}
                <span className="font-serif italic">brand colors.</span>
              </m.h2>
            </m.div>

            <div className="mt-12 grid gap-4 md:mt-14 md:grid-cols-2">
              <AssetCard
                label="Primary logo · 512px"
                href={`${site.url}/icon2.png`}
                preview={
                  <div className="flex h-32 items-center justify-center rounded-xl bg-surface-subtle">
                    <Image
                      src="/icon2.png"
                      alt=""
                      width={88}
                      height={79}
                      className="h-20 w-auto"
                    />
                  </div>
                }
              />
              <AssetCard
                label="Favicon · 32px"
                href={`${site.url}/icon.png`}
                preview={
                  <div className="flex h-32 items-center justify-center rounded-xl bg-surface-subtle">
                    <Image
                      src="/icon.png"
                      alt=""
                      width={40}
                      height={36}
                      className="h-10 w-auto"
                    />
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
            <m.div
              variants={fadeUpContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-15%" }}
              className="flex flex-col gap-3"
            >
              <m.p
                variants={fadeUpItem}
                className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
              >
                Brand usage
              </m.p>
              <m.h2
                variants={fadeUpItem}
                id="press-usage-heading"
                className="text-balance text-display-md text-ink"
              >
                How to write our name + a few rules.
              </m.h2>
            </m.div>

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
                  do: 'Use specific descriptions: "on-device stack checks," "product information," and "interaction warnings."',
                  notes: "Avoid claims of clinical validation, complete coverage or guaranteed safety.",
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

      {/* ━━━━━━━━━━━━━━━━━━ STORY ANGLES + INTERVIEW TOPICS ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-labelledby="press-angles-heading"
        className="relative section-y-sm"
      >
        <div className="container relative mx-auto">
          <div className="mx-auto max-w-4xl">
            <m.div
              variants={fadeUpContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-15%" }}
              className="flex flex-col items-start gap-3"
            >
              <m.p
                variants={fadeUpItem}
                className="font-mono text-eyebrow font-medium uppercase tracking-[0.12em] text-foreground/80"
              >
                Story angles we can help with
              </m.p>
              <m.h2
                variants={fadeUpItem}
                id="press-angles-heading"
                className="text-balance text-display-md text-ink"
              >
                Bring us a story.{" "}
                <span className="font-serif italic">We will bring the data.</span>
              </m.h2>
            </m.div>

            <div className="mt-12 grid gap-5 md:mt-14 md:grid-cols-2 md:gap-6">
              {STORY_ANGLES.map((angle) => (
                <div
                  key={angle.title}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-7 shadow-sm md:p-8"
                >
                  <p className="font-serif text-h3 italic leading-tight text-ink">{angle.title}</p>
                  <p className="text-body-sm leading-relaxed text-muted">{angle.body}</p>
                  {angle.source && (
                    <a href={angle.source.href} className="text-body-sm text-link underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                      {angle.source.label}
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col gap-6">
              {INTERVIEW_TOPICS.map((person) => (
                <div key={person.name} className="flex flex-col gap-2">
                  <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-accent">
                    Interview topics: {person.name}
                  </p>
                  <p className="max-w-prose text-body leading-relaxed text-foreground/85">
                    {person.topics}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━ CTA ━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Press contact"
        className="relative section-y-sm border-t border-border"
      >
        <div className="container relative mx-auto">
          <m.div
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
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
                href={`mailto:${site.pressEmail}`}
                className="text-link underline decoration-link/60 underline-offset-[3px] hover:text-link-strong hover:decoration-link"
              >
                {site.pressEmail}
              </a>{" "}
              with your story angle, preferred interview time and deadline. We&apos;ll
              get back to you about availability.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-body-sm text-muted transition-colors duration-fast ease-smooth hover:text-ink"
            >
              Read more about us
              <span aria-hidden="true">→</span>
            </Link>
          </m.div>
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
    <m.div
      initial={{ y: 12 }}
      whileInView={{ y: 0 }}
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
    </m.div>
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
