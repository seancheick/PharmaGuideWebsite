# PharmaGuide Website — Master Plan

> Status: **Phase 0 (Foundation) — pending design system approval.**

This is the navigational index for the website build. Every doc lives in `docs/`
and tracks one concern. Don't lose track — this file is the entry point.

## Documents

| Doc | Purpose |
|---|---|
| [00 — Master Plan](./00-master-plan.md) | This file. Index + overall status. |
| [01 — Design System](./01-design-system.md) | All tokens (color, type, spacing, motion). Reference. |
| [02 — Build Sequence](./02-build-sequence.md) | Sprint task list with `[ ]` / `[x]`. **Source of truth for progress.** |
| [03 — Content Spec](./03-content-spec.md) | All copy by section. Hero → Footer. |
| [04 — SEO Checklist](./04-seo-checklist.md) | Metadata, sitemap, structured data, GEO. |
| [05 — Performance Checklist](./05-performance-checklist.md) | Core Web Vitals, image, font, bundle. |
| [06 — Accessibility Checklist](./06-accessibility-checklist.md) | WCAG 2.1 AA targets. |
| [07 — Motion Spec](./07-motion-spec.md) | Animation philosophy + token usage. |
| [08 — Progress Log](./08-progress.md) | Live diary of what shipped + decisions. |

## Phases

### Phase 0 — Foundation `(in progress)`
- [x] Project scaffolded (Next.js 16 + TypeScript + Tailwind + Framer Motion)
- [x] Design tokens defined in `globals.css`
- [x] TypeScript token mirror (`src/lib/tokens.ts`)
- [x] Site constants (`src/lib/site.ts`)
- [x] SEO infrastructure (sitemap, robots, manifest, metadata)
- [x] Token preview page (`/`)
- [ ] **User approval of design system** ← gating

### Phase 1 — Header
- [ ] Floating glass pill header with smart show/hide on scroll
- [ ] Mobile hamburger overlay
- [ ] Skip-to-content link

### Phase 2 — Hero
- [ ] Two-column layout (copy left, animated phone right)
- [ ] Animated app UI loop (Framer Motion, infinite, no video)
- [ ] CTA buttons + trust row

### Phase 3 — Infrastructure Strip
- [ ] Single-line dot-separated row under hero

### Phase 4 — Problem
- [ ] Headline + 3 supporting statements + closing thesis

### Phase 5 — Interaction Ladder
- [ ] 5-tier severity row + featured example card
- [ ] Hover-expand behavior

### Phase 6 — Real-Life Moments
- [ ] Horizontal scroll carousel (Oura-style)
- [ ] 4 cards with shared-layout expand
- [ ] Placeholder lifestyle images (swappable)

### Phase 7 — FitScore
- [ ] Circular UI with count-up animation
- [ ] Two-column copy layout

### Phase 8 — Trust Block
- [ ] 3 trust cards + 4 restraint cards
- [ ] Tiny freshness signal at bottom

### Phase 9 — Final CTA
- [ ] Email + optional supplements input form
- [ ] Disclaimer + business model trust note
- [ ] Social proof slot (designed, hidden until populated)

### Phase 10 — Footer
- [ ] 4-column grid (Brand · Product · Company · Legal)
- [ ] Badges row + city + email

### Phase 11 — Polish
- [ ] Mobile pass on every section
- [ ] Motion polish pass
- [ ] Accessibility audit
- [ ] Performance audit (Lighthouse 95+ targets)
- [ ] OG image generation
- [ ] Vercel deployment

## Current decisions (locked)

- **Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v3, Framer Motion 11
- **Fonts:** Geist Sans (UI/headlines), Newsreader (editorial display), Geist Mono (data)
- **Accent color:** Deep slate teal (`#1F3A4D`)
- **Severity colors:** Polished defaults — match Flutter app exactly later
- **Logo:** Typographic placeholder for V1
- **Images:** Placeholder URLs in `lib/site.ts` — swap when ready
- **Hosting:** Vercel (planned)

## Open decisions

- [ ] Brand domain confirmed? `pharmaguide.io` placeholder
- [ ] Final logo file (SVG)
- [ ] Real lifestyle photography sources (Stocksy budget? AI gen?)
- [ ] Email provider for waitlist (MailerLite proposed)
- [ ] Analytics setup (GA + Clarity IDs)
