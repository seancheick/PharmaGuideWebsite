# Progress Log

> Live diary of what shipped + decisions made. Append-only.
> When you finish a phase, add an entry here so context isn't lost between sessions.

---

## 2026-05-07 — Phase 0 (Foundation) shipped

**What shipped:**
- Next.js 16 + React 19 + TypeScript strict + Tailwind v3 + Framer Motion 11 scaffold
- Design system tokens (color, typography, spacing, motion, radius, shadow, severity, blur, gradients)
  - Single source: `src/app/globals.css`
  - TS mirror: `src/lib/tokens.ts`
- SEO infrastructure
  - Metadata API (title template, description, keywords, OG, Twitter, robots, canonical)
  - `sitemap.ts`, `robots.ts`, `manifest.ts`
  - JSON-LD Organization schema in root layout
- Fonts: Geist Sans + Geist Mono via `geist` package, Newsreader via `next/font/google`
- Site-wide constants in `src/lib/site.ts` (nav, footer, brand)
- Token preview page at `/` for visual approval
- Documentation suite (`docs/00` through `docs/08`)
- Security headers in `next.config.ts`
- Image optimization config (AVIF, WebP, deviceSizes)

**Decisions made:**
- Tailwind v3 over v4 for ecosystem stability
- Geist + Newsreader pairing for premium-but-free typography
- Accent color: deep teal `#183B3F` (revised from `#1F3A4D` after preview)
- Surface-subtle cooled to `#F4F2EE` (was `#F5F3EE`, read tan on some monitors)
- Severity-safe deepened to `#3F6250` (was `#476E57`, felt too "organic wellness")
- Build directly in code (no Figma middle step)
- 8 sections in homepage (compressed from dev's 11)
- About in nav, no Features, no Clinician page V1
- No Blog nav until 5+ posts (user said they have 5+, will add when ready)

**Open:**
- Awaiting design system approval before Phase 1 (Header)
- Logo placeholder will be typographic
- Lifestyle images will be Unsplash placeholders, marked for swap

---

## 2026-05-07 — Phase 1 (Header) shipped

**What shipped:**
- `src/components/layout/Header.tsx` — floating glass pill header
- Smart scroll behavior:
  - At y=0 → transparent over content
  - After 24px → glass background + subtle border + shadow
  - Scrolling DOWN past 200px → slides up out of view (Framer Motion)
  - Scrolling UP at any time → slides back in
  - `prefers-reduced-motion` → slide disabled
- Pill-shaped wordmark with tiny accent dot mark (subtle brand signal)
- Desktop nav: 4 items + "Request Access" pill CTA with `hover:shadow-glow`
- Mobile menu:
  - Hamburger trigger
  - Full-screen backdrop overlay (95% bg + xl blur)
  - Nav items in italic serif (Newsreader) at display-sm size
  - Stagger entrance (60ms + 70ms per item)
  - Esc key closes
  - Click backdrop closes
  - Body scroll-lock while open
  - Focus returns to hamburger on close
  - `aria-modal="true"` + `role="dialog"`
- All animations driven by token presets from `src/lib/tokens.ts`
- Mounted in `page.tsx` above TokenPreview for review

**Decisions made:**
- CTA copy: "Request Access" (vs "Join Beta") — more invitation-only / premium
- Wordmark: text-only with 6px accent dot before "PharmaGuide"
- Header positioned `top-3 sm:top-4` (mobile slightly tighter)
- Max width `max-w-3xl` for the pill (proportional, not full-width)
- Mobile nav uses serif italic (matches editorial moments elsewhere)
- Skipped formal focus-trap library for V1 (Esc + close button + backdrop close
  is enough; full trap deferred to Phase 11 a11y audit)

**Open:**
- Awaiting Phase 1 approval
- Anchor `#waitlist` not yet present — currently links to nothing. Will resolve
  once Final CTA section ships in Phase 9.

---

<!-- Append new entries above this line as phases complete -->
