# Build Sequence — Sprint Tasks

> **Source of truth for what's done and what's next.**
> Use checkboxes (`[ ]` / `[x]`). Update as you go. One section at a time.
> No commits across phases — each phase ships and gets approved standalone.

---

## ✅ Phase 0 — Foundation

- [x] Initialize Next.js 16 project with TypeScript strict mode
- [x] Install dependencies (framer-motion, geist, clsx, tailwind-merge, vercel analytics)
- [x] Pin Node version (`.nvmrc`)
- [x] Configure `next.config.ts` (image opt, security headers, package optimization)
- [x] Configure `tsconfig.json` (strict, noUncheckedIndexedAccess)
- [x] Configure `tailwind.config.ts` (CSS-variable-driven, no hardcoded values)
- [x] Configure `postcss.config.mjs`
- [x] Implement design tokens in `src/app/globals.css`
- [x] Implement TS token mirror in `src/lib/tokens.ts`
- [x] Implement utility helpers (`cn()`, site constants)
- [x] Configure root layout with fonts (Geist Sans, Newsreader, Geist Mono)
- [x] Configure SEO infrastructure (metadata, sitemap, robots, manifest, JSON-LD)
- [x] Build token preview page at `/`
- [x] Initialize git
- [ ] **User approves design system** ← gating
- [ ] Run dev server, verify foundation renders correctly

---

## 🔜 Phase 1 — Header

**Goal:** Floating glass pill header with smart scroll behavior.

- [x] Create `src/components/layout/Header.tsx`
- [x] Pill shape (`rounded-pill`) floating from top
- [x] Glass effect (`backdrop-blur-md` + 72% bg opacity)
- [x] Logo (typographic placeholder for V1, with tiny accent dot mark)
- [x] Nav links (How It Works, Methodology, Blog, About)
- [x] Primary CTA pill button — **Request Access**
- [x] Smart scroll behavior: hide on scroll-down past 200px, show on scroll-up
- [x] Glass effect activates after scrolling past 24px
- [x] Mobile: hamburger trigger + full-screen overlay menu
- [x] `prefers-reduced-motion` respected (no slide animation)
- [x] Esc key closes mobile menu
- [x] Click backdrop closes mobile menu
- [x] Body scroll-lock when mobile menu is open
- [x] Focus returns to hamburger on close
- [x] `aria-label` on nav + hamburger + close + dialog
- [x] Skip-to-content already in layout
- [x] Mounted in `page.tsx` for review
- [ ] **User approves Phase 1** ← gating

---

## 🔜 Phase 2 — Hero

**Goal:** Two-column layout with animated app UI loop (no video — live React).

- [x] Create `src/components/sections/Hero.tsx`
- [x] Two-column layout (1.05fr/1fr desktop, stacked mobile)
- [x] Eyebrow: "The interaction layer for your stack"
- [x] Headline: "Your supplements don't work in isolation. / Neither should your check."
- [x] Subheadline: "See how your supplements, medications, and timing work together — not one bottle at a time."
- [x] Trust row: "180,000+ · Evidence-graded · On-device"
- [x] Primary CTA: "Request Access →"
- [x] Secondary CTA: "Why interactions matter ↓" (anchors to #problem)
- [x] CSS-driven fade-up stagger (eyebrow → headline → subhead → trust → CTAs → phone)
- [x] Phone mockup component (`src/components/hero/PhoneMockup.tsx`)
  - [x] Realistic device frame (rounded-[3rem] bezel, dynamic island)
  - [x] Slight tilt (`md:rotate-[2.5deg]`) — desktop only
  - [x] Shadow-2xl
  - [x] Floating animation (6s loop, 8px Y oscillation, easeInOut)
- [x] Animated app UI loop (`src/components/hero/AppUILoop.tsx`)
  - [x] Status bar (9:41, signal dots, battery)
  - [x] App header (back arrow + "Add to stack")
  - [x] Search bar with typewriter animation: "magnesium" (75ms/char)
  - [x] Cursor-blink keyframe added to tailwind config
  - [x] Result card slides in with `transitions.reveal`
  - [x] Stack section appears with stagger; items use `layout` for smooth re-flow
  - [x] Second search: "levothyroxine" (60ms/char)
  - [x] Interaction card springs up from bottom (transitions.spring)
  - [x] Verdict pill: Monitor (severity-monitor token)
  - [x] Recommendation: Separate by 4 hours
  - [x] Evidence: Moderate
  - [x] Loop restarts cleanly (~9s cycle)
  - [x] Respects `prefers-reduced-motion` (snapshot of final state, no timers)
- [x] Hero halo gradient backdrop (`halo-hero` utility)
- [x] Anchor stub for `#problem` mounted in page.tsx until Phase 4 ships
- [ ] **User approves Phase 2** ← gating

---

## 🔜 Phase 3 — Infrastructure Strip

- [x] Create `src/components/sections/InfrastructureStrip.tsx`
- [x] Three items: "Cross-referenced catalog · Evidence-graded · Privacy-first architecture"
- [x] Mono uppercase eyebrow size (12px), `text-muted` for restraint
- [x] Wide tracking via `--ls-eyebrow` token
- [x] Stacks vertically on mobile, inline with dot separators on tablet+
- [x] Subtle `bg-surface-subtle/30` band + `border-y border-border/60`
- [x] `whileInView` opacity fade with `once: true` and `-15%` viewport margin
- [x] Mounted in `page.tsx` directly under Hero
- [x] aria-label="Platform principles" on the section
- [ ] **User approves Phase 3** ← gating

---

## 🔜 Phase 4 — Problem

- [ ] Create `src/components/sections/Problem.tsx`
- [ ] Headline: "A label tells you what's in the bottle. Not what happens with your other bottles."
- [ ] Three statements (text-only, not cards):
  1. "Googling 'X with Y' gives you conflicting answers."
  2. "Most apps check one product. You take a stack."
  3. "Timing can change how something works."
- [ ] Closing thesis (italic serif): "Because interactions happen between products — not in isolation."
- [ ] Stagger entrance on scroll
- [ ] Approve

---

## 🔜 Phase 5 — Interaction Ladder

- [ ] Create `src/components/sections/InteractionLadder.tsx`
- [ ] Headline: "Clear verdicts. Cited reasoning."
- [ ] Subheadline
- [ ] 5-tier pill row (uses `severityTiers` from tokens)
- [ ] Featured example card: Magnesium + Levothyroxine
- [ ] Hover lift on tiers
- [ ] Approve

---

## 🔜 Phase 6 — Real-Life Moments

- [ ] Create `src/components/sections/RealLifeMoments.tsx`
- [ ] Section label, headline, subhead
- [ ] Horizontal scroll carousel (snap-scroll)
- [ ] 4 cards: chronic, pregnancy, SSRI, optimizer
- [ ] Each card: background image + title + expanded state
- [ ] Shared layout transition for expand (Framer Motion `layoutId`)
- [ ] Placeholder images from Unsplash (note: swap with editorial photography later)
- [ ] Touch-swipe on mobile
- [ ] Approve

---

## 🔜 Phase 7 — FitScore

- [ ] Create `src/components/sections/FitScore.tsx`
- [ ] Two-column desktop, centered mobile
- [ ] Headline: "A score that changes with your stack."
- [ ] Subheadline (revised, no "conditions/goals" overload)
- [ ] Microcopy: "Product quality matters. Personal context matters too."
- [ ] Circular FitScore visual:
  - [ ] Score number (Geist Mono, tabular nums)
  - [ ] Ring fills clockwise on view
  - [ ] Counts up 0 → 82 over 1.2s
  - [ ] Notes appear after count
- [ ] Approve

---

## 🔜 Phase 8 — Trust Block

- [ ] Create `src/components/sections/TrustBlock.tsx`
- [ ] Headline: "Built to explain uncertainty — not hide it."
- [ ] Subheadline
- [ ] Three trust cards: Evidence-graded · AI-assisted Human-reviewed · Privacy-first
- [ ] "What we don't do" — 4 restraint cards with ✕ symbol
- [ ] Tiny freshness signal at bottom: "Catalog updated weekly · Interaction reviews added regularly"
- [ ] Approve

---

## 🔜 Phase 9 — Final CTA

- [ ] Create `src/components/sections/FinalCTA.tsx`
- [ ] Cinematic centered layout, generous padding
- [ ] Social proof slot (designed, hidden via CSS until populated)
- [ ] Headline: "Opening in waves."
- [ ] Subheadline
- [ ] Form:
  - [ ] Email input
  - [ ] Optional supplements/medications textarea
  - [ ] Submit button with loading + success states
- [ ] Trust note: "Free during beta. No spam. We will never sell your health data."
- [ ] Disclaimer: "PharmaGuide is not a replacement for medical care..."
- [ ] FAQ link: "More questions? Read the FAQ →"
- [ ] Form submission stub (wire to MailerLite later)
- [ ] Approve

---

## 🔜 Phase 10 — Footer

- [ ] Create `src/components/layout/Footer.tsx`
- [ ] 4-column grid: Brand · Product · Company · Legal
- [ ] Brand: PharmaGuide / Supplement intelligence. / Boston, MA / info@pharmaguide.io
- [ ] Bottom row: badges + copyright
- [ ] Approve

---

## 🔜 Phase 11 — Polish

- [ ] Mobile pass on every section (test 375px, 414px, 768px, 1024px, 1440px)
- [ ] Motion polish pass — verify `prefers-reduced-motion`
- [ ] Accessibility audit (WCAG 2.1 AA — see `06-accessibility-checklist.md`)
- [ ] Performance audit (Lighthouse 95+ on all metrics — see `05-performance-checklist.md`)
- [ ] SEO audit (see `04-seo-checklist.md`)
- [ ] OG image (1200×630 PNG)
- [ ] Favicon set (32, 192, 512, apple-touch-icon)
- [ ] Connect Vercel deployment
- [ ] Set up custom domain
- [ ] Add Google Analytics + Microsoft Clarity
- [ ] Submit sitemap to Google Search Console + Bing Webmaster

---

## Decision log

Capture key decisions as they're made. Avoids re-litigating later.

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-07 | Build directly in code, skip Figma | Faster, single source of truth, no handoff degradation |
| 2026-05-07 | Tailwind v3 (not v4) | More stable ecosystem, no surprise tooling issues |
| 2026-05-07 | Geist Sans + Newsreader + Geist Mono | Free, premium, distinctive italic serif for editorial moments |
| 2026-05-07 | Accent: deep teal `#183B3F` | "Calm clinical" — leans teal, neither wellness green nor biotech blue |
| 2026-05-07 | Surface-subtle cooled `#F5F3EE → #F4F2EE` | Avoid "tan" rendering on warm-shifted monitors |
| 2026-05-07 | Severity-safe deepened `#476E57 → #3F6250` | Less "organic wellness", more clinical confidence |
| 2026-05-07 | No Features page | Premium products don't list features in nav |
| 2026-05-07 | About in nav, not About Us | Cleaner, more modern |
| 2026-05-07 | No Clinician page in V1 | Premature without traction/published validation |
| 2026-05-07 | No Blog nav until 5+ posts | Avoid "unfinished" tell |
| 2026-05-07 | Hero loop = live React + Framer Motion | Pixel-perfect, no compression artifacts, infinitely loopable |
