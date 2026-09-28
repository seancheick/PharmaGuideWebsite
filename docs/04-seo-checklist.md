# SEO + AI-search system

> Goal: rank for high-intent supplement-interaction queries and be citable by
> AI answer engines (Google AI Overviews / AI Mode, ChatGPT search, Perplexity,
> Claude). Last audited 2026-09-28.

## One system — where each fact lives

| Fact | Owner | Read by |
|---|---|---|
| Company facts (name, legal name, parent company, founding, address, emails, socials) | `src/lib/site.ts` | footer, press, Organization schema, llms.txt |
| People (founder, clinicians: credentials, bios, photos) | `src/lib/people.ts` | About, Press, Methodology, blog bylines, ClinicianBadge, Person schema, llms.txt, OG cards |
| Static pages (title, description, share-card copy, sitemap priority, llms summary) | `src/lib/pages.ts` | `pageMetadata()`, `pageSchema()`, `/og/page/[key]`, sitemap, llms.txt |
| Metadata (title, canonical, OG/Twitter incl. images, RSS link) | `src/lib/seo.ts` `buildMetadata()` | every route |
| Structured data | `src/lib/schema.ts` | root layout emits Organization + WebSite + Persons once; pages emit WebPage + breadcrumb + their own entity and reference the rest by `@id` |
| Share images | `src/lib/og.tsx` | `/og/page/[key]`, `/og/post/[slug]` (static at build) |
| FAQ answers | `src/lib/faq.ts` (`body`; `faqPlainText()` derives the schema text) | FAQ page + FAQPage schema |

## Adding things

- **New page:** add an entry to `PAGES` in `src/lib/pages.ts`, then in the route
  `export const metadata = pageMetadata("key")` and render
  `<JsonLd nodes={pageSchema("key")} />`. Share card, sitemap and llms.txt follow.
- **New article:** `author` / `reviewer` in frontmatter must be a
  `src/lib/people.ts` id (or name) — unknown names fail the build. Set
  `updated_at` on every substantive edit and `reviewed_at` when a clinician signs off.
- **New person:** add them to `PEOPLE`; their `/about#id` card and Person node appear.

## Rules

- Titles lead with the search phrase; descriptions ≤160 characters.
- Never mark up content that isn't visible (FAQ answers stay in the DOM).
- `reviewedBy` / `lastReviewed` go on the WebPage (`MedicalWebPage`) node — not on BlogPosting.
- `lastmod` only from real content dates — never the build time.
- Don't claim review on content that wasn't reviewed ("every article reviewed" was false once).
- Keep AI crawlers allowed (robots `*`); keep Vercel's "AI Bots" firewall rule off — Deny blocks AI search bots too.

## Done

- [x] Per-page metadata, canonical, OG + Twitter images on every page (was 1 of 15)
- [x] Organization (legalName, parentOrganization, founder, contactPoint, sameAs), WebSite, Person
- [x] MedicalWebPage + BlogPosting (image, author, reviewer, dates), BreadcrumbList, FAQPage, AboutPage, CollectionPage
- [x] FAQ answers server-rendered (were click-only; 0 of 11 indexable)
- [x] Visible "Updated" dates + `dateModified`; sitemap real `lastmod`
- [x] RSS at `/blog/feed.xml`, linked from every page
- [x] llms.txt generated from the registries
- [x] Homepage links to the latest articles
- [x] Framer Motion loaded async via `LazyMotion` (`m.*` only; `strict` guards it)
- [x] www → apex redirect (Vercel domain setting)

## Owner actions (dashboards)

- [ ] Search Console: Page indexing report → request indexing for missing URLs; submit sitemap
- [ ] Search Console → Settings → Search generative AI: confirm "Include"; watch the Generative AI performance report
- [ ] Bing Webmaster Tools: import from Search Console, submit sitemap (Bing feeds Copilot, DuckDuckGo, Yahoo)
- [ ] Test a page in https://search.google.com/test/rich-results after each deploy
