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
- Accent color: deep slate teal `#1F3A4D`
- Build directly in code (no Figma middle step)
- 8 sections in homepage (compressed from dev's 11)
- About in nav, no Features, no Clinician page V1
- No Blog nav until 5+ posts (user said they have 5+, will add when ready)

**Open:**
- Awaiting design system approval before Phase 1 (Header)
- Logo placeholder will be typographic
- Lifestyle images will be Unsplash placeholders, marked for swap

---

<!-- Append new entries above this line as phases complete -->
