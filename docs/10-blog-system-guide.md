# Blog System Guide

> Everything you need to know to write, publish, and rank PharmaGuide blog
> posts. Read this once.

---

## Changing the featured post (Editor's Pick)

The big card at the top of `/blog` is whichever post has `featured: true`
in its frontmatter. **Only ONE post should be featured at a time.**

Two commands handle this safely:

```bash
# See every post and which one is currently featured
pnpm blog:list

# Set a new featured post (auto-unsets the previous one)
pnpm blog:feature statins-and-coq10
```

That's it. The script reads every `.mdx` file, sets `featured: true` on
the slug you name, sets `featured: false` on everything else, and tells
you exactly what changed. After running, commit + push:

```bash
git add content/blog
git commit -m "feature: set <slug> as Editor's Pick"
git push
```

Vercel ISR rolls the change to production within the 5-day revalidation
window. To make it live immediately, redeploy from the Vercel dashboard.

### Example session

```
$ pnpm blog:list

PharmaGuide blog — 2 posts

  status   date         category               slug
  ──────   ──────────   ─────────────────────  ────────────────
    draft     2026-05-09   ingredient-spotlights  statins-and-coq10
             Statins and CoQ10: what the research actually shows

  ● FEATURED   2026-05-08   health-education       medication-depletion-guide
             What your medication might be quietly depleting

✓ Editor's Pick is set correctly.

$ pnpm blog:feature statins-and-coq10

+ featured  statins-and-coq10
  Statins and CoQ10: what the research actually shows
- unfeatured medication-depletion-guide

✓ Done. 2 files updated.

Next:
  1. Verify with pnpm blog:list
  2. Commit + push:
       git add content/blog
       git commit -m "feature: set statins-and-coq10 as Editor's Pick"
       git push
```

### Why a script instead of editing files by hand

- Manual edits are error-prone — you can forget to unset the previous
  featured post and end up with two, which means the wrong one wins on
  the hub.
- The script makes the change atomically across every file.
- One command to remember. No file paths, no line numbers, no "wait,
  which one was featured?" — just `pnpm blog:list`.

## TL;DR — Publishing a new post

```bash
# 1. Create the file
touch "content/blog/your-post-slug.mdx"

# 2. Add frontmatter + body (see "Post structure" below)

# 3. Drop images into a folder named after the slug
mkdir -p "public/blog/your-post-slug"
# (then add your-image.jpg etc.)

# 4. Reference images in the post:
#    <PostImage src="/blog/your-post-slug/hero.jpg" alt="..." caption="..." />

# 5. Push to main — Vercel ISR rolls it onto production
git add content/blog/your-post-slug.mdx public/blog/your-post-slug/
git commit -m "post: your-post-slug"
git push
```

That's it. The hub picks it up automatically. The sitemap auto-updates. Every
SEO + JSON-LD schema generates from the frontmatter.

---

## How the system works

```
content/blog/                       ← Post source (you write these)
  └── your-post-slug.mdx            ← One file per post; slug = filename

public/blog/                        ← Post images (you upload these)
  └── your-post-slug/
      ├── hero.jpg                  ← Hero / featured-card image
      ├── pills-on-counter.jpg
      └── interaction-diagram.png

src/lib/blog.ts                     ← Server-only loader (don't edit)
src/lib/blog-types.ts               ← Categories list (edit if adding categories)
src/components/blog/
  ├── BlogHubClient.tsx             ← Hub page (search + filter + grid/list + pagination)
  ├── BlogCard.tsx                  ← Image-top card in grid view
  ├── BlogListItem.tsx              ← Compact row in list view
  ├── BlogFeaturedCard.tsx          ← 60/40 Editor's Pick card
  ├── BlogCardCover.tsx             ← Cover-art renderer (real image OR brand fallback)
  ├── BlogPagination.tsx            ← Numbered pagination with smart ellipsis
  ├── BlogViewToggle.tsx            ← Grid/list segmented control
  ├── EditorialStandards.tsx        ← Compact bottom strip
  └── MdxComponents.tsx             ← MDX → React component map (Callout, PostImage, etc.)

src/app/blog/
  ├── page.tsx                      ← /blog hub server route
  └── [slug]/page.tsx               ← /blog/[slug] post server route

src/app/llms.txt/route.ts           ← AI crawler index (auto-generated)
```

The pipeline: write `.mdx` → push → Vercel ISR rebuilds page within 5 days
(or trigger immediately via Vercel dashboard) → live.

---

## Post structure

Every post is a single `.mdx` file with **YAML frontmatter** + **MDX body**.

```mdx
---
title: "Your post title here (clear, claim-driven, search-optimized)"
description: "1-2 sentence summary used in OG cards, search results, RSS feeds, and the hub card excerpt. Aim for 150-160 chars for SEO."
slug: "your-post-slug"               # optional — defaults to filename
category: "health-education"          # one of the 5 categories below
date: "2026-05-15"                    # ISO 8601, controls sort + display
author: "Sean Cheick Baradji"
reviewer: "Dr. Pham L., PharmD"       # optional but strongly recommended
featured: false                        # true = becomes Editor's Pick on hub
image: "/blog/your-post-slug/hero.jpg" # optional but strongly recommended
tags: ["statins", "CoQ10", "interaction"]  # 5-10 tags, helps search + AI crawl
---

## Lead paragraph

Your post body in markdown + MDX...
```

### Required fields
- **title** — what shows up in `<h1>`, browser tab, search result, OG card
- **description** — used everywhere; the most important field for SEO
- **category** — must match one of the 5 category IDs (see below)
- **date** — ISO 8601 (`YYYY-MM-DD`)
- **author** — display name

### Optional fields
- **reviewer** — clinical reviewer; appears in meta strip + JSON-LD `reviewedBy`
- **featured** — only ONE post should have `featured: true` at a time
- **image** — `/blog/[slug]/hero.jpg` recommended; without it, the system renders
  a programmatic brand-art fallback (deep teal + category label)
- **tags** — boosts discoverability in search + signals topic clusters to crawlers

---

## Categories

The 5 categories preserve your legacy WordPress slugs for SEO continuity. Edit
in `src/lib/blog-types.ts` if you need to add/rename.

| Category ID | Display | What goes here |
|---|---|---|
| `health-education` | Health Education | Broad how-to + explainer guides (the medication-depletion post lives here) |
| `ingredient-spotlights` | Ingredient Spotlights | Single-ingredient deep dives (creatine, ashwagandha, magnesium) |
| `interactions-stacks` | Interactions & Stacks | Specific pairs (St. John's Wort × sertraline) + stack-design guides |
| `news-research` | News & Research | FDA updates, new study summaries, industry shifts |
| `safety-alerts` | Safety Alerts | Recalls, FAERS signals, contamination findings |

---

## Images — where to put them, what sizes to use

### Folder structure

```
public/blog/your-post-slug/
  ├── hero.jpg                    ← Hero / featured-card image
  ├── 01-pills-on-counter.jpg     ← In-post image #1
  ├── 02-interaction-diagram.png
  └── 03-evidence-table.jpg
```

One folder per post, named identically to the slug. Numbering helps you keep
images in reading order.

### Sizes to use

| Type | Aspect | Pixel size | File size |
|---|---|---|---|
| **Hero (frontmatter `image`)** | 16:10 | 1600 × 1000 | < 300 KB |
| **In-post hero / featured shot** | 16:9 or 16:10 | 1600 × 900 | < 250 KB |
| **In-post documentary photo** | 4:3 | 1600 × 1200 | < 250 KB |
| **In-post detail shot (subject-focused)** | 1:1 | 1200 × 1200 | < 200 KB |

> **Compress before uploading.** Use [Squoosh.app](https://squoosh.app) or
> [TinyPNG](https://tinypng.com). PharmaGuide loads on phones; every kilobyte
> matters for Core Web Vitals.

### File formats

- **JPEG for photos** (people, products, scenes) — best compression for natural images
- **PNG for diagrams/illustrations with text** — preserves crispness
- **SVG for charts/icons** — scalable, tiny

Next.js's `<Image>` component auto-converts to AVIF/WebP at request time, so
the source format only needs to be sane.

### Using images in posts

Two ways:

**1. `<PostImage>` (recommended — full optimization + caption support):**

```mdx
<PostImage
  src="/blog/your-post-slug/01-pills-on-counter.jpg"
  alt="Three orange prescription bottles on a kitchen counter"
  caption="Long-term prescription users often don't realize what's depleting"
  width={1600}
  height={1000}
  priority={false}
/>
```

- `alt` is mandatory (a11y + SEO). Describe what's in the image, not what it
  represents conceptually.
- `caption` is optional but recommended for editorial polish.
- `priority={true}` on the FIRST image only if it's above the fold (e.g. a
  hero shot at the top of the post). Otherwise leave default `false`.
- `width` × `height` must match the actual file dimensions (next/image
  requirement to prevent layout shift).

**2. Standard markdown `![alt](/path)`:**

```mdx
![Three orange prescription bottles](/blog/your-post-slug/01-pills.jpg)
```

The `alt` text doubles as the caption. Less control, but simpler. Use for
quick documentary/illustrative images.

### How many images per post?

**Recommended: 4–6 in-post images for long-form (1,500+ words).**

Pattern:
1. **Hero** (frontmatter `image`) — sets the visual tone, used on hub card + OG card
2. **Section-opener** every 2–3 sections — breaks up text, drives Time-on-Page
3. **Diagram** when explaining mechanism (e.g., "how statins block CoQ10")
4. **Comparison table or annotated screenshot** when showing data
5. **Closing visual** — often a softer scene, optional

For shorter posts (<1,000 words), 2–3 images is enough.

---

## MDX components you can use in posts

Drop these directly into post bodies — no import needed.

### `<Callout tone="info | accent | warn">`

Inline emphasis box. Three tones:

```mdx
<Callout tone="info">
This is **educational information**, not medical advice.
</Callout>

<Callout tone="accent">
**Reading on PharmaGuide.io?** [Join the beta →](/#waitlist)
</Callout>

<Callout tone="warn">
This is a high-stakes interaction. Do not adjust without your clinician.
</Callout>
```

### `<EvidencePill level="...">`

Tiny inline chip for evidence grade. Use the in-app levels:

```mdx
A meta-analysis of 17 RCTs supports this claim. <EvidencePill level="Established" />
```

Levels: `Established` · `Probable` · `Moderate` · `Limited` · `Theoretical`

### `<PostImage>` — see Images section above.

### Standard markdown all works:
- **Bold**, *italic*, `inline code`
- Headings (h2, h3, h4 — h1 is auto-generated from frontmatter title)
- Bullet + numbered lists
- `[Links](https://example.com)` (external auto-open in new tab)
- Tables (GitHub-flavored markdown)
- `> Blockquotes`
- Code blocks
- `---` for dividers

---

## SEO + AI crawler authority — the big plan

You said: *"super high SEO and AI crawler — be the main source of information,
better than Harvard Medical."* Here's how the technical foundation supports that.

### What's already shipped

- **JSON-LD on every post**: `BlogPosting`, `Article`, `Person` (author + reviewedBy),
  `BreadcrumbList`, `Organization`. Search engines + AI crawlers parse these
  for direct citations.
- **Per-post metadata**: title, description, canonical URL, OG, Twitter card,
  publishedTime, modifiedTime, keywords (from tags), articleSection (category)
- **Word count + read time**: surfaced in JSON-LD so crawlers can rank long-form
  authoritatively
- **Reviewed-by schema**: `reviewedBy` Person node with PharmD credentials —
  Google's algorithm specifically boosts medically-reviewed content for YMYL
  ("Your Money or Your Life") queries
- **Blog hub schema**: `Blog` type with one `BlogPosting` node per post
- **Sitemap auto-generated** from MDX files; one URL per post
- **`/llms.txt`** at the root — emerging standard for AI crawlers (Perplexity,
  ChatGPT, Claude, Google AI Overviews) to find authoritative content quickly.
  Most sites don't have one yet → being early gives you a citation edge.
- **External authority links throughout `/features`** — FDA, NIH ODS, DSLD,
  PubMed, Cochrane, NCCIH, DailyMed. Search engines reward reciprocal authority.

### What you need to write to win

**Length: 1,500–3,500 words per post.** Harvard Health averages ~1,200; thinly
written ranks worse than long-and-substantial.

**Citations: every claim links to a primary source.** PubMed, NIH, FDA preferred.
Avoid linking to other blog summaries — link to the underlying study.

**Author authority on every post.** Author byline + reviewer credentials baked
into JSON-LD = Google's "E-E-A-T" (Experience, Expertise, Authoritativeness,
Trustworthiness) signal. This is the #1 ranking factor for medical content.

**Topic clusters.** Internal linking from any post to:
- The relevant `/features` pillar
- `/methodology` (the proof page)
- Other posts on related topics

Goal: every supplement-or-medication question someone asks should have a
PharmaGuide page somewhere in the top 3 search results.

**TL;DR or "short answer" at the top.** Helps:
- AI summarizers (ChatGPT, Perplexity) extract a clean answer
- Featured snippets (Google's "answer box")
- Skim readers who decide to dig deeper

**Tables, numbered lists, structured data** make content extractable. AI
crawlers prefer well-structured pages because they parse them more reliably.
Compare a 3-column comparison table to a paragraph of prose — the table wins.

**Update the `dateModified` field whenever you revise.** Google rewards
freshness for medical content; a 2024 article with `dateModified: 2026` ranks
better than a static 2024 article.

### Realistic timeline expectations

**Week 0–4**: posts indexed by Google + Bing (this happens automatically once
GSC is verified — see `docs/09-search-console-setup.md`)

**Month 1–3**: 5+ posts published, internal links between them. Rankings start
appearing for long-tail queries ("does metformin deplete B12 reddit"-class
queries with low competition).

**Month 3–6**: 10–15 posts published, topic clusters forming. Mid-tail queries
("metformin and vitamins") start ranking. AI summarizers begin citing.

**Month 6–12**: 25+ posts, link equity accumulating from external links to
your evidence-rich content. Big keywords start moving.

**Month 12+**: real authority. The "better than Harvard Medical" outcome is
realistic only after 30+ pieces of authoritative content over 12+ months,
plus genuine external citations from `.edu` and `.gov` sites.

> **The honest part**: SEO + AI authority is mostly a content-quantity-with-quality
> game once the technical foundation is in place. The site is now technically
> excellent. The next 12 months of authoring is where the actual ranking happens.

### One specific tactic that works

For each `/features` pillar, write 3–5 deep blog posts that link back to it.
Example for **Medication Depletion** (already started):
1. ✅ "What your medication might be quietly depleting" (general guide)
2. "Statins and CoQ10: what the research actually shows" (deep dive #1)
3. "Metformin, B12, and the silent neuropathy risk" (deep dive #2)
4. "PPIs and magnesium: why long-term acid suppression depletes minerals" (deep dive #3)
5. "Birth control and B-complex: what most pamphlets don't tell you" (deep dive #4)

This is called a **topic cluster**. Google rewards sites that demonstrate
depth on a topic by ranking the entire cluster higher.

---

## Pagination — current and future

**Currently**: 12 posts per page. Sweet spot — 3 cols × 4 rows on desktop.

**At 1,000 posts**: 84 pages. Smart-ellipsis pagination handles this gracefully:
`1 ... 5 6 [7] 8 9 ... 84`. Each page is its own URL pattern, indexable.

**At 10,000+ posts**: still works. Only 12 posts render per page so page weight
stays constant. Server-side filtering would be needed to make category/search
filters scale; current implementation filters client-side which is fine through
several thousand posts.

**View toggle** (grid ↔ list): persists in `localStorage` per browser. Default
is grid. Users who prefer dense scanning can switch to list and the choice
sticks across sessions.

---

## Testing locally

```bash
pnpm dev
# → http://localhost:3000/blog

# Hot-reload picks up MDX file changes (sometimes needs a soft refresh)
```

Edit a post, save, refresh the browser tab. Frontmatter changes (like
`featured: true/false`) require a hard refresh in dev mode.

## Production deploy

Push to `main`:
- Vercel auto-deploys
- Static pages regenerate (route shows `(SSG)` in build output)
- ISR refreshes within 5 days (configured via `revalidate = 432000` in
  `src/app/blog/page.tsx` and `[slug]/page.tsx`)

To force an immediate refresh of a published post: Vercel dashboard → project
→ Deployments → Redeploy.

---

## Cross-link maintenance — keep the site interconnected as content grows

The site is already cross-linked at the page level (every major page hands
off to /features, /methodology, /blog via `<RelatedLinks>` strips at the
bottom). As the blog grows, the next layer of cross-linking is **post-level
hand-offs**: each /features pillar should link to the matching deep-dive
blog posts when they exist.

### The pattern

When you publish a blog post, ask: **"Which /features pillar is this post
the deep-dive for?"** Then link both directions.

| /features pillar | Posts that should link here | Where pillar should link to |
|---|---|---|
| `/features#medication-depletion` | "What your medication might be quietly depleting" ✅ shipped · Statins+CoQ10 · Metformin+B12 · PPIs+magnesium · OCs+B-complex · Loop diuretics+potassium | The single highest-converting post per topic |
| `/features#stack-intelligence` | Multi-supplement risks · Caffeine ceiling · Iron-thyroid timing · Calcium-thyroid timing | Same |
| `/features#ingredient-transparency` | How to read a proprietary blend · Active vs inactive ingredients · Third-party testing certifications · USP/NSF/Informed Sport explained | Same |
| `/features#personal-fit` | Pregnancy-safe supplements · SSRI + supplement guide · Hypertension + supplements · Anticoagulant interactions | Same |
| `/features#nutrient-accumulation` | Vitamin D upper limit · Iron toxicity · Zinc-copper depletion · Vitamin A teratogenic risk | Same |
| `/features#recall-safety` | 5 recalls of [year] · How to spot a sketchy supplement · FDA warning letter explainer · FAERS reporting guide | Same |

### How to add a "From the blog" cross-link to a /features pillar

When the second post in any cluster is published (so there's a real
recommendation to make), add a link inside that pillar's deep-dive section.

**Where**: `src/components/features/FeaturesClient.tsx` — inside each
pillar's content block, after the capabilities/examples list but before
the closing div.

**What to add** (example for medication-depletion):

```tsx
{/* Featured post — shown only when a relevant deep-dive exists */}
<motion.div variants={fadeUpItem} className="mt-6">
  <Link
    href="/blog/medication-depletion-guide"
    className="group inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-body-sm transition-[background-color,border-color,transform] duration-fast ease-smooth hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-raised"
  >
    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
      From the blog
    </span>
    <span className="text-ink">
      What your medication might be quietly depleting
    </span>
    <span aria-hidden="true" className="text-accent transition-transform duration-fast ease-smooth group-hover:translate-x-0.5">→</span>
  </Link>
</motion.div>
```

Or a simpler approach — drop a `<RelatedLinks>` strip at the bottom of
specific pillar sections that have multiple deep-dives.

### Why this matters

**Topic-cluster SEO**: Google's "topic authority" signal rewards sites
where the cluster anchor (the /features pillar) is reciprocally linked
to multiple deep-dive supporting articles. Each new post in a cluster
boosts the rank of every other piece in the cluster (and the pillar
itself).

**AI crawl**: Perplexity, ChatGPT, Claude, Google AI Overviews follow
internal link graphs to build their citation paths. A pillar with 5+
linked deep-dives is much more likely to be cited than one with 0.

**UX**: visitors who land on a /features pillar deep-dive want concrete
reading. A "From the blog" link gives them the next click without
having to navigate to /blog and search.

### Maintenance checklist when publishing a new post

After committing a new MDX post:

- [ ] Tag the post with the right `category` (matches one of the 5 slugs)
- [ ] Confirm `featured: false` unless this is meant to be the new
      Editor's Pick (in which case unset `featured` on the previous
      featured post)
- [ ] Add the post to the "From the blog" link in the matching
      `/features` pillar (if this is the first or strongest post for
      that pillar)
- [ ] If the post mentions another existing post inline, link it via
      `[anchor text](/blog/other-slug)` in the MDX
- [ ] If the post references a /features pillar conceptually, link
      to `/features#pillar-slug` from inside the post body
- [ ] Sitemap auto-includes — no manual step
- [ ] llms.txt auto-includes — no manual step

### Other cross-link patterns already wired

These are maintained automatically; just be aware of them:

| Page | Cross-links to | Component |
|---|---|---|
| `/about` | /methodology · /features · /careers | `<RelatedLinks>` |
| `/methodology` | /features · /blog · /faq | `<RelatedLinks>` |
| `/faq` | /features · /methodology · /blog | `<RelatedLinks>` |
| `/press` | /about · /methodology · /features | `<RelatedLinks>` |
| `/careers` | /about · /methodology · /features | `<RelatedLinks>` |
| `/blog/[slug]` | 3 related posts (same category) | Built into post layout |
| Homepage `HowItWorks` credentials | /methodology | Inline `<Link>` |
| Homepage `BeyondInteractions` footer | /features (pill) + /blog (secondary) | Inline links |
| Homepage `YourFit` callback | /features#ingredient-transparency | Inline mono link |

If you want to add another cross-link strip somewhere, drop in
`<RelatedLinks>` from `src/components/shared/RelatedLinks.tsx` — it's
fully reusable.

