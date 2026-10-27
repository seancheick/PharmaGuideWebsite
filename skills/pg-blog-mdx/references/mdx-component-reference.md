# MDX Component Reference (new site)

The new PharmaGuide site has **7 general MDX components** plus the **teaching-figure components** listed in `src/components/blog/figures/index.ts`. Everything else is plain markdown. The validator allows exactly that set.

This is much smaller than the old WordPress system (20+ `pg-*` modules). The discipline is intentional: the new site is premium and restrained — too many custom components recreate the old visual noise.

**Allowed components:**

1. `<Callout tone>` — boxed callouts in three tones
2. `<EvidencePill level>` — inline evidence-confidence chip (evidence only)
3. `<Source>` — one-line citation under the claim it backs
4. `<Sources>` — collapsible sources dropdown
5. `<PostImage>` — optimized image with caption
6. `<Illustration>` — caption frame for a teaching figure
7. `<SvgStyle css>` — stylesheet for a legacy inline SVG (new figures don't need it)
8. Teaching figures — one component per figure, registered in `src/components/blog/figures/index.ts` (e.g. `<ShilajitLabReport />`)

**Anything else (e.g., `<div class="…">`, raw HTML tags, custom components like `<TLDR>`, `<QuickFacts>`, `<Hero>`) will fail validation.**

For everything else, use plain markdown — the MDX component map already styles h1–h4, p, ul/ol, blockquote, code, hr, links, strong, em.

---

## When to use a component vs plain markdown

| Need | Use |
|---|---|
| Section heading | `## ...` (plain markdown) — DO NOT wrap in a component |
| Emphasized paragraph | Plain markdown with `**bold**` or `_italic_` |
| Quick-fact list at top | A short `<ul>` with bolded leading terms — NOT a custom component |
| FAQ section | `## Frequently asked questions` + `### Question?` for each — plain markdown |
| Comparison table | Plain markdown table |
| Dosage table | Plain markdown table |
| Pull-quote | Plain markdown `>` blockquote |
| TL;DR / orientation | First paragraph + `<Callout tone="info">` for the YMYL disclaimer |
| Interaction severity | Words in the text and a `<Callout tone="warn">` — e.g. "**Caution:** …". Never an evidence pill |
| YMYL disclaimer | `<Callout tone="info">` |
| Safety warning | `<Callout tone="warn">` |
| Recommendation / decision summary | `<Callout tone="accent">` |
| Inline citation chip | `<Source>` |
| Mechanism diagram / teaching figure | `<Illustration>` wrapping a React figure component (see §5) |
| Hero photo | `<PostImage>` with editorial-mood image |
| Section-end source line | `<Source>` (same component as every citation) |
| Sources section | `<Sources>` component wrapping numbered list (collapsible dropdown) |

The goal is restraint. If a sentence can be plain markdown, write plain markdown.

---

## 1. `<Callout tone>` — Boxed callouts

```mdx
<Callout tone="info">
  This is **educational information**, not medical advice. Specific dosing
  decisions should always involve your healthcare provider.
</Callout>
```

**Three tones:**

| Tone | Visual | Use for |
|---|---|---|
| `info` (default) | Neutral, calm | YMYL disclaimers, definitions, background context |
| `accent` | Stronger teal | Decision summaries, "what to do next" boxes |
| `warn` | Amber | Safety cautions, "who should be careful," contraindications |

**Rules:**

- Every post must contain a `<Callout tone="info">` within the first 300 words (YMYL disclaimer requirement)
- Don't stack two callouts back-to-back
- Don't use callouts for visual variety — they earn placement only when they highlight a decision-bearing fact

---

## 2. `<EvidencePill level>` — Inline evidence-confidence chip

```mdx
This is consistent with multiple RCTs. <EvidencePill level="Established" /> The
question of whether supplementing reverses the symptoms is messier.
<EvidencePill level="Mixed" />
```

**`level` must be one of five evidence levels** (the validator fails anything else): `Established` · `Moderate` · `Limited` · `Mixed` · `Conditional` (holds only under a stated condition, e.g. high doses or a specific population). It comes from the claim record's confidence.

Pills grade **evidence only**. Three things stay separate on the page:

- **Evidence confidence** → this pill.
- **Interaction severity / action** (Contraindicated · Avoid · Caution · Monitor · No known concerns) → said in the text, usually in a `<Callout tone="warn">`. Never "safe": "no known concerns".
- **Review status** → frontmatter only; the page shows it in the byline.

A pill applies to the one claim it follows, never to the ingredient overall: "Established" beside a composition fact must not read as an endorsement of the ingredient.

**Rules:**

- Use inline at the end of the sentence the chip qualifies
- Don't pile multiple pills on the same claim
- Pair the pill with prose that explains why (no naked label)

---

## 3. `<Source>` — One-line citation

Renders as one line of metadata directly under the paragraph it backs: a small mono "SOURCE" label in accent, then the citation in 15px muted text (body is 18px), with tighter spacing above than between paragraphs. No box. It must read as supporting material, never as body text, so **every in-body citation uses `<Source>`**; do not write bold `**Source:** [link]` lines.

```mdx
One trial in healthy men aged 45–55 found higher testosterone after 90 days on one purified shilajit preparation.

<Source>
  Pandit S, et al., *Andrologia* 2016 — [pubmed.ncbi.nlm.nih.gov/26395129](https://pubmed.ncbi.nlm.nih.gov/26395129/)
</Source>
```

**A `<Source>` directly under the claim is required for:**

- Dosing claims (any number tied to a dose)
- Drug interactions / drug-supplement interactions
- FDA recalls or safety communications
- Adverse-event signals
- Contraindications
- Pregnancy / lactation / pediatric / geriatric guidance
- Chronic-disease management claims
- Mechanism-of-action statements that drive a recommendation
- Efficacy claims with specific numbers ("X reduces Y by Z%")

**Not needed for:** definitions, general physiology, historical context, editorial transitions. For background framing, end the H2 with one `<Source>` line rather than citing every sentence.

**For the final sources section, use the `<Sources>` component (collapsible dropdown):**

```mdx
<Sources>
- Pandit S, et al. (2016). [Clinical evaluation of purified Shilajit on testosterone levels in healthy volunteers.](https://pubmed.ncbi.nlm.nih.gov/26395129/) *Andrologia.*
- NIH Office of Dietary Supplements. [Vitamin B12 — Health Professional Fact Sheet](https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/).
3. ...
</Sources>
```

Do NOT use a bare `## Sources` heading — the `<Sources>` component renders as a styled collapsible disclosure element that saves space while keeping references accessible.

---

## 4. `<PostImage>` — Optimized image

```mdx
<PostImage
  src="/blog/medication-depletion-guide/pills-on-counter.jpg"
  alt="Three orange prescription bottles on a kitchen counter, morning light"
  caption="Long-term prescription users often don't realize what's depleting"
  width={1600}
  height={1000}
  priority={false}
/>
```

**Required props:** `src`, `alt`
**Optional:** `caption`, `width` (default 1600), `height` (default 1000), `priority` (default false)

**Files live at `public/blog/<slug>/<filename>`** — the `src` path must start with `/blog/<slug>/...`.

**Image policy** (see voice-guide.md image policy):

- Use ONLY for editorial-mood imagery: kitchen counter, evening lamp, hands on counter, abstract texture, lifestyle context
- NEVER for: fake pills, fake supplement bottles, fake medication labels, fake doctors, fake pharmacists, fake stethoscopes, fake lab settings, fake clinical scenes
- For posts with clinical claims, prefer `<Illustration>`; an editorial photo never stands in for a teaching figure

**Dimensions:**

- Hero: 1600×1000 (16:10) — `priority={true}` if very first image
- In-post: 1600×900 (16:9)
- Documentary: 1600×1200 (4:3)
- Subject-focused / square: 1600×1600

**Filename rule:** filenames must NOT contain `doctor`, `pharmacist`, `stethoscope`, `lab-coat`, `pills`, `supplement-bottle`, `medication-label`. The validator warns on these patterns.

---

## 5. `<Illustration>` — the caption frame for a teaching figure

```mdx
<Illustration caption="Turning a ppm figure on a lab report into a daily microgram figure">
  <ShilajitExposureMath />
</Illustration>
```

The figure itself is a **React component** in `src/components/blog/figures/<Topic>Figures.tsx`, listed in the registry `src/components/blog/figures/index.ts` (`export * from "./<Topic>Figures";`). `MdxComponents.tsx` spreads that registry into the MDX map and the validator allows exactly the functions it re-exports, so a figure is valid exactly when it renders. Export only figure components from a figures file. Reference implementation: `ShilajitFigures.tsx` (annotated jar on a photo, strata scene, exposure arithmetic, Supplement Facts panel, annotated lab report, checklist). Full build rules are in SKILL.md, Phase 7.

**This is the default image type for PharmaGuide.** Use for:

- Annotated real-world objects (label, Supplement Facts panel, certificate of analysis)
- Worked arithmetic with hypothetical values (ppm × g/day = µg/day)
- Mechanism diagrams, severity ladders, comparison charts, decision flows, checklists

**Rules in brief:**

- Readable text is HTML with the site's type scale, never small SVG `<text>`: it must stay legible at 375px.
- Use the figures file's `Frame` shell: "Figure N · …" eyebrow, serif-italic title, limitation note, source + URL footer, and a "fictional"/"hypothetical" tag where anything is invented.
- Colors are design tokens: `text-ink`, `text-muted`, `text-subtle`, `text-accent`, `bg-surface`, `bg-surface-subtle`, `ring-border`, `text-severity-caution`, `text-severity-safe`, `text-severity-avoid`, `text-severity-contraindicated`.
- Responsive grids use `repeat(auto-fit, minmax(…))`; Tailwind `sm:` is 1200px on this site. Wide compositions use `.fig-stage` / `.fig-wide` / `.fig-narrow`.
- Inline SVG is for drawn shapes only, with JSX presentation attributes. **Never `<style>{`…`}</style>` in MDX** (next-mdx-remote strips it); legacy SVGs use `<SvgStyle css="…" />`.
- Accessibility: decorative SVG gets `aria-hidden="true"`; meaning-carrying drawings get `role="img"` + `aria-label`. Never put critical information in color alone.

**Caption (optional):** A short italic line below the diagram. Adds context.
**Credit (optional):** Source attribution if the diagram is adapted from elsewhere.

---

## What NEVER appears in MDX

- Raw HTML `<div>`, `<span>`, `<section>` (validator fails)
- Custom components like `<TLDR>`, `<QuickFacts>`, `<DosageTable>`, `<FAQ>`, `<Hero>`, `<CTA>` (validator fails)
- Inline CSS via `style="..."` attribute on plain markdown elements
- Custom React imports at the top of the file
- `<script>` tags
- Embedded YouTube / Vimeo iframes
- Tweet embeds

If you need any of these, the design system needs a new component first. Do not invent components.

---

## Checking your draft

After writing the body, run:

```bash
cd "/Users/seancheick/PharmaGuide Website"
pnpm blog:validate <slug>
```

If validation fails on `mdx-components`, you used a tag that doesn't belong. Replace it with plain markdown or one of the components above; a new figure must be added to `src/components/blog/figures/index.ts` first.
