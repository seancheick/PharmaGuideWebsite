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

- [x] Create `src/components/sections/Problem.tsx`
- [x] Eyebrow: "The problem"
- [x] Headline: "A label tells you what's in the bottle. / Not what happens with your other bottles."
- [x] Headline line 2 muted (matches hero rhythm)
- [x] Three statements (text-only, NOT cards), `text-h3` size, `text-muted`:
  - "Googling 'X with Y' gives you conflicting answers."
  - "Most apps check one product. You take a stack."
  - "Timing can change how something works."
- [x] 3-column grid on desktop, stacked on mobile, `text-balance`
- [x] Three independent scroll-triggered groups:
  - Block 1 (eyebrow + headline): viewport `-15%`, `fadeUpContainer` stagger
  - Block 2 (statements): viewport `-12%`, custom 120ms stagger left-to-right
  - Block 3 (thesis): viewport `-20%`, slight scale-up entrance
- [x] Closing thesis: `font-serif italic`, `text-display-md`, ink color, centered
- [x] Section uses `id="problem"` so the Hero secondary CTA scrolls here
- [x] Anchor stub removed from page.tsx
- [x] **User approved Phase 4** (with refinement pass)

---

## 🔜 Phase 5 — Interaction Ladder `(in progress)`

- [x] Create `src/components/sections/InteractionLadder.tsx`
- [x] Eyebrow: "Severity"
- [x] Headline: "Clear verdicts. / Cited reasoning." (line 2 muted)
- [x] Subheadline: "We translate complex interaction data into simple safety
  levels — so you know what deserves attention, and why."
- [x] 5 tier cards in a row (1 col mobile, 5 cols desktop) — uses
  `severityTiers` from tokens
- [x] Each card: severity-color dot + label + description + 01–05 number
- [x] Hover: lift + shadow upgrade + border-strong
- [x] Featured example card: Magnesium + Levothyroxine — Monitor
  - [x] Soft accent halo behind it (matches hero depth language)
  - [x] Title row with "Interaction detected" eyebrow + verdict pill
  - [x] Body text + recommendation + evidence row (sm:grid-cols)
- [x] Section bg: `bg-surface-subtle/30` band differentiates from Problem
- [ ] **User approves Phase 5** ← gating

---

## 🔜 Phase 6 — Real-Life Moments `(in progress)`

**Rebuilt to match the Oura-style horizontal carousel reference (see
`/Users/seancheick/Downloads/PharmaGuide.html` for the design intent).**

- [x] Create `src/components/sections/RealLifeMoments.tsx`
- [x] Data extracted to `src/lib/moments.ts` (image URLs swappable to Cloudinary)
- [x] Section bg: `bg-surface-subtle` (warm tinted band — distinct register)
- [x] Eyebrow: "Built for real life"
- [x] Headline: "The moments people don't realize / *they need this.*"
- [x] Subhead: "PharmaGuide helps you catch risks, avoid conflicts, and make
  smarter decisions before you take your next dose."
- [x] **Horizontal scrolling carousel** (snap-x, mandatory)
  - [x] Compact card 320×440 (78vw × 380 mobile)
  - [x] Open card width: 880px (88vw md / 92vw < 980 / 90vw mobile)
  - [x] CSS transition on width (700ms cubic-bezier(0.32,0.72,0.24,1))
- [x] Per-card composition:
  - [x] Full-bleed background image (next/image fill + scale-on-hover)
  - [x] Dark gradient overlay (transparent top → dark bottom)
  - [x] Frosted-glass category pill (top-left, backdrop-blur-md)
  - [x] Plus button (top-right, white, rotates 45° to close on open)
  - [x] Serif title at bottom-left (slides up + grows on open)
  - [x] Description + Learn-more pill button revealed on open
- [x] Insights aside (revealed on open, md+ only):
  - [x] Member spotlight quote card (avatar + name + role + quote)
  - [x] PharmaGuide flag card (severity dot + label + name + description + meta row)
  - [x] Both glass-style: bg-ink/55 + backdrop-blur-md + white text
- [x] Carousel controls:
  - [x] Prev/Next arrow buttons (round, bordered, hover lift)
  - [x] Scroll progress bar (auto-updates on scroll/resize)
- [x] Keyboard / a11y:
  - [x] Esc closes the open card
  - [x] aria-label on rail, prev/next, plus button
  - [x] aria-expanded on plus button
  - [x] Cards have role="listitem"
- [x] Smooth scroll-into-view when card opens (rAF + scrollBy)
- [x] Click anywhere on compact card to open
- [x] Click only the plus (now ×) on open card to close (prevents
  accidental close when clicking insights)
- [x] Stop propagation on Learn-more link click
- [x] Unsplash placeholder URLs in V1 (clearly labeled, swap to Cloudinary)
- [x] **`images.json` at repo root** — comprehensive AI image generation
  prompts per card (Flux 2 Pro, Imagen 4 Ultra, Midjourney v7 raw),
  plus avatar prompts, universal negatives, 2026 techniques, and ethical
  disclosure guidance (NY Synthetic Performer Disclosure Law, FTC, ELVIS Act)
- [ ] **User approves Phase 6** ← gating

---

## 🔜 Phase 7 — Your Fit `(in progress)`

**Renamed from "FitScore"** — the personal assessment is no longer purely
numerical. PharmaGuide does TWO reads on every product:
  1. Quality (numerical: 89/100)
  2. Your Fit (qualitative: Excellent / Good / Limited / Concerning / Not recommended)

The section teaches that duality.

- [x] Create `src/components/sections/YourFit.tsx`
- [x] Two-column desktop (copy left, card right), stacked mobile
- [x] Eyebrow: "Your Fit"
- [x] Headline: "What's high quality for one person / *may deserve a
      second look for another.*" (italic-serif punchline matches site rhythm)
- [x] Subheadline: "PharmaGuide gives you two reads on every product —
      objective quality, and personal fit."
- [x] Italic-serif callback line: "Quality is what's in the bottle. /
      Fit is everything around it."  (callbacks to the Problem section's
      "label tells you what's in the bottle" thesis)
- [x] Single dual-assessment card with two stacked sections:
  - [x] Top: Product label · QUALITY · count-up score (0→89 in 1.2s) ·
        progress bar fills · descriptor line
  - [x] Animated divider draws horizontally
  - [x] Bottom: YOUR FIT · pill badge in severity-safe ("Good fit") ·
        bulleted notes that stagger in
  - [x] Footer line: "Personalised to your stack · updated continuously"
- [x] useInView hook triggers count-up animation when card scrolls into view
- [x] Soft accent halo behind card (matches site depth language)
- [x] Animation choreography:
      0→200ms card fades · 200→1400 quality bar+score animate · 1400→1900
      divider draws · 1600→2100 fit badge appears · 1900→2400 notes stagger
- [ ] **User approves Phase 7** ← gating

---

## 🔜 Phase 8 — Trust Block `(in progress)`

- [x] Create `src/components/sections/TrustBlock.tsx`
- [x] Eyebrow: "How we think"
- [x] Headline: "Built to explain uncertainty — / *not hide it.*"
      (italic-serif punchline matches site rhythm)
- [x] Subhead: "If evidence is weak, conflicting, or incomplete, we say so directly."
- [x] Three trust cards (centered, 3 cols on md+):
  - [x] "Evidence-graded." — strength of supporting evidence noted, even when missing
  - [x] "AI-assisted. Human-reviewed." — clinician review for accuracy + safety
  - [x] "Privacy is part of the architecture." — never sold, licensed, or shared
  - [x] Card style: rounded-2xl + border + shadow-sm with serif italic title + body-sm body
  - [x] Hover: shadow-sm → shadow-md (subtle)
- [x] "What we don't do" restraint group:
  - [x] Eyebrow: "What we don't do" (centered)
  - [x] 4 restraint items in 2x2 (sm) → 1x4 (lg) grid
  - [x] Custom ✕ SVG (not the unicode glyph) in muted color
  - [x] bg-surface/40 + backdrop-blur-sm — visually lighter than trust cards
  - [x] Statements: don't diagnose / don't replace clinician /
        don't tell to stop meds / don't sell health data
- [x] Freshness signal at bottom:
  - [x] Pulsing severity-safe dot (animate-ping)
  - [x] Mono caption: "Catalog updated weekly · Interaction reviews added regularly"
- [x] No ambient decoration — restraint is the message
- [x] All animation triggered via whileInView with staggered children
- [ ] **User approves Phase 8** ← gating
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
