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

- [ ] Create `src/components/layout/Header.tsx`
- [ ] Pill shape (`rounded-pill`) floating from top
- [ ] Glass effect (`backdrop-blur-md` + 72% bg opacity)
- [ ] Logo (typographic placeholder for V1)
- [ ] Nav links (How It Works, Methodology, Blog, About)
- [ ] Primary CTA pill button (Join Beta)
- [ ] Smart scroll behavior: hide on scroll-down, show on scroll-up
- [ ] Mobile: hamburger trigger + full-screen overlay menu
- [ ] Keyboard accessible (focus trap when mobile menu open)
- [ ] `aria-label` on nav, hamburger
- [ ] Skip-to-content already in layout
- [ ] Test on mobile + desktop
- [ ] Approve

---

## 🔜 Phase 2 — Hero

**Goal:** Two-column layout with animated app UI loop (no video — live React).

- [ ] Create `src/components/sections/Hero.tsx`
- [ ] Two-column layout (50/50 desktop, stacked mobile)
- [ ] Eyebrow: "The interaction layer for your stack"
- [ ] Headline: "Your supplements don't work in isolation. / Neither should your check."
- [ ] Subheadline: "See how your supplements, medications, and timing work together — not one bottle at a time."
- [ ] Trust row: "180,000+ products · Evidence-graded · On-device"
- [ ] Primary CTA: "Join Beta →"
- [ ] Secondary CTA: "Why interactions matter ↓" (anchors to Problem)
- [ ] Phone mockup component (`src/components/hero/PhoneMockup.tsx`)
  - [ ] Realistic device frame
  - [ ] Slight tilt (~3°)
  - [ ] Shadow-lg
  - [ ] Floating animation (4s loop, 6px vertical)
- [ ] Animated app UI loop (`src/components/hero/AppUILoop.tsx`)
  - [ ] Search bar with typing animation: "magnesium"
  - [ ] Result card appears
  - [ ] Second search: "levothyroxine"
  - [ ] Interaction card slides up with spring animation
  - [ ] Verdict pill: Monitor
  - [ ] Recommendation: Separate by 4 hours
  - [ ] Evidence: Moderate
  - [ ] Loop seamlessly (8s cycle)
  - [ ] Respect `prefers-reduced-motion`
- [ ] Hero halo gradient backdrop
- [ ] Approve

---

## 🔜 Phase 3 — Infrastructure Strip

- [ ] Create `src/components/sections/InfrastructureStrip.tsx`
- [ ] Single horizontal centered line
- [ ] Three items: "Cross-referenced catalog · Evidence-graded · Privacy-first architecture"
- [ ] Subtle (60% opacity, 13px text)
- [ ] Fade-in on scroll
- [ ] Approve

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
| 2026-05-07 | Accent: deep slate teal `#1F3A4D` | "Calm clinical" — neither wellness green nor biotech blue |
| 2026-05-07 | No Features page | Premium products don't list features in nav |
| 2026-05-07 | About in nav, not About Us | Cleaner, more modern |
| 2026-05-07 | No Clinician page in V1 | Premature without traction/published validation |
| 2026-05-07 | No Blog nav until 5+ posts | Avoid "unfinished" tell |
| 2026-05-07 | Hero loop = live React + Framer Motion | Pixel-perfect, no compression artifacts, infinitely loopable |
