# SEO + GEO Checklist

> Goal: Rank for high-intent supplement-interaction queries. Be discoverable
> in AI answer engines (Google AI Overviews, Perplexity, ChatGPT search).

## ✅ Foundation (done in Phase 0)

- [x] `metadataBase` URL configured
- [x] Title template (`%s · PharmaGuide`)
- [x] Description with primary keywords
- [x] Keywords field
- [x] OpenGraph (type: website, locale, image, title, description)
- [x] Twitter card (summary_large_image)
- [x] Robots directives (index, follow, max-image-preview: large)
- [x] Canonical URL (`/`)
- [x] `sitemap.ts` auto-generates `/sitemap.xml`
- [x] `robots.ts` auto-generates `/robots.txt`
- [x] `manifest.ts` for PWA / Add to Home
- [x] JSON-LD Organization schema in layout
- [x] `lang="en"` on `<html>`
- [x] Theme color metadata for browser chrome

## 🔜 Per-page metadata

When adding new routes, ensure each page exports its own `metadata`:

- [ ] `/how-it-works`
- [ ] `/methodology`
- [ ] `/about`
- [ ] `/blog`
- [ ] `/faq` (with FAQPage schema)
- [ ] Each blog post (with Article schema)

## 🔜 Structured data (JSON-LD)

- [x] Organization (in root layout)
- [ ] WebSite schema with SearchAction
- [ ] FAQPage schema on `/faq`
- [ ] Article schema on each blog post
- [ ] BreadcrumbList where applicable
- [ ] Product schema (later, if applicable)

## 🔜 GEO-readiness (AI answer engines)

GEO = Generative Engine Optimization. To get cited by AI answer engines:

- [ ] Clear, concise factual statements (not marketing fluff)
- [ ] Specific numbers and dates (NOT "thousands of...", DO "180,000+ products")
- [ ] Cite sources (FDA, NIH, PubMed) where claims are made
- [ ] Define your terms clearly (what is FitScore? what is "interaction"?)
- [ ] Use semantic HTML headings (`<h1>` → `<h6>`) hierarchically
- [ ] Add `<dl>`, `<dt>`, `<dd>` for definitional content
- [ ] Avoid burying facts inside images — text first
- [ ] Include "About this site" / "About this content" sections
- [ ] Last-updated dates on content pages

## 🔜 Performance for SEO (Core Web Vitals)

These directly impact ranking. See `05-performance-checklist.md` for details.

- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] FCP < 1.8s

## 🔜 Pre-launch verification

- [ ] Submit `/sitemap.xml` to Google Search Console
- [ ] Submit `/sitemap.xml` to Bing Webmaster Tools
- [ ] Verify domain ownership in both
- [ ] Set canonical domain (with vs without www)
- [ ] HTTPS enforced (Vercel default)
- [ ] HSTS header (consider adding)
- [ ] Test rich results: https://search.google.com/test/rich-results
- [ ] Test mobile-friendliness: https://search.google.com/test/mobile-friendly
- [ ] Run Lighthouse SEO audit (target 100)

## 🔜 Image SEO

- [ ] Every `<Image>` has descriptive `alt` text
- [ ] `priority` flag on hero/above-fold images only
- [ ] `loading="lazy"` on below-fold (Next.js default)
- [ ] Use AVIF/WebP via next/image (configured)
- [ ] Image filenames: `chronic-conditions-card.jpg`, not `IMG_1234.jpg`

## 🔜 Internal linking strategy

- [ ] Footer links to all top pages
- [ ] Hero secondary CTA anchors to Problem section (already specced)
- [ ] FAQ link from CTA to `/faq`
- [ ] Blog posts cross-link to relevant other posts
- [ ] Methodology page links to research sources

## 🔜 Long-tail keyword targets

Primary keywords to optimize content for over time:

- "supplement drug interaction checker"
- "magnesium and levothyroxine"
- "supplement interaction app"
- "drug supplement interaction database"
- "evidence-based supplement guide"
- "supplement timing optimization"
- "[medication name] supplement interactions"
- "[supplement name] drug interactions"

The blog is the primary vehicle for ranking on these. Each post = one cluster.
