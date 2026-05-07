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
- [x] **User approved design system** (with refinements: accent → #183B3F, surface-subtle → #F4F2EE, severity-safe → #3F6250)

### Phase 1 — Header
- [x] Floating glass pill header with smart show/hide on scroll
- [x] Mobile hamburger overlay (Esc + backdrop close, scroll-lock, focus return)
- [x] Skip-to-content link (already in layout)
- [x] CTA: "Request Access"
- [x] **User approved Phase 1**

### Phase 2 — Hero
- [x] Two-column layout (copy left, animated phone right)
- [x] Animated app UI loop (Framer Motion, ~7s cycle, no video)
- [x] CTA buttons + trust row + secondary "Why interactions matter ↓"
- [x] Phone mockup with subtle tilt + 6s float
- [x] Cursor-blink keyframe added to Tailwind config
- [x] PharmaGuide wordmark + accent dot inside the phone
- [x] "Good fit with timing adjustment" personalization moment
- [x] Pharmacist-mature interaction copy + accent halo depth
- [x] **User approved Phase 2**

### Phase 3 — Infrastructure Strip `(in progress)`
- [x] Subtle divider band with three platform claims
- [x] Mono uppercase eyebrow type, dot separators on tablet+
- [x] `whileInView` opacity fade
- [x] **User approved Phase 3** (with copy revision)

### Phase 4 — Problem
- [x] Headline + 3 supporting statements + italic-serif closing thesis
- [x] Three independent scroll-triggered groups
- [x] Two-tone statement hierarchy + ambient capsule depth
- [x] `id="problem"` wired to Hero secondary CTA
- [x] **User approved Phase 4** (with refinement pass)

### Phase 5 — Interaction Ladder
- [x] 5-tier interactive ladder (hover/tap to switch active tier)
- [x] Connected detail panel with cross-fade content swap
- [x] Per-tier shapes (triangle/circle/diamond/ring/square)
- [x] Per-tier mechanism + evidence grade + study count
- [x] **User approved Phase 5** (with interactive rebuild)

### Phase 6 — Real-Life Moments `(in progress)`
- [x] 4 expand-on-tap scenario cards (2x2 grid, 1 col mobile)
- [x] Per-card subtle gradients + ambient capsule decorations
- [x] Inline height accordion + Read more / Close affordances
- [x] Severity-color "Example flag" chips reinforce the tier system
- [ ] **User approves Phase 6** ← gating

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
- **Accent color:** Deep teal (`#183B3F`)
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
