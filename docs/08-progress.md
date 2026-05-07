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
- Anchor `#waitlist` not yet present — currently links to nothing. Will resolve
  once Final CTA section ships in Phase 9.

---

## 2026-05-07 — Phase 2 (Hero) shipped

**What shipped:**
- `src/components/sections/Hero.tsx` — server-rendered hero
  - Two-column 1.05fr/1fr (copy slightly wider) on `md:`, stacked on mobile
  - Halo gradient backdrop via `halo-hero` utility
  - Padding-top 8rem mobile / 10rem desktop (clears the floating header)
  - Eyebrow + headline + subhead + trust row + dual CTA stack
  - Headline: line 1 in `text-ink`, line 2 in `text-muted` for visual rhythm
  - Trust row: tabular nums on "180,000+" with token-driven separators
  - Primary CTA: pill button with `hover:shadow-glow` (uses new accent token)
  - Secondary CTA: text link with arrow that translates down on hover
  - CSS-driven entrance: `animate-fade-up` with arbitrary `[animation-delay:Xms]`
    for stagger (eyebrow → headline → subhead → trust → CTAs → phone)
- `src/components/hero/PhoneMockup.tsx` — client component
  - rounded-[3rem] ink bezel, 9:19 aspect ratio
  - Bezel highlight gradient + inner ring for depth
  - Dynamic-island-style notch
  - 6s `easeInOut` Y oscillation (motion)
  - Tilt `2.5deg` desktop only — wrapped to avoid transform conflict with motion
  - Width responsive: 280 → 300 → 320px
- `src/components/hero/AppUILoop.tsx` — client component
  - Status bar (9:41 in mono, signal dots, battery svg)
  - App header (back arrow + "Add to stack")
  - Search bar with state-driven typewriter (`setSearchText` per char)
  - Cursor (vertical bar, blinking via new `animate-cursor-blink` keyframe)
  - Search result card slides in (AnimatePresence + transitions.reveal)
  - Stack section: outer AnimatePresence for section, inner for items
  - Items use `layout` prop for smooth re-flow when added
  - Interaction card: springs up from bottom (y: "110%" → 0, transitions.spring)
    with severity-monitor pill, recommendation, evidence
  - Loop cycle: ~9s, restarts cleanly via `cancelled` flag pattern
  - `useReducedMotion` → snapshot of final state, no timers
- `tailwind.config.ts`:
  - Added `cursor-blink` keyframe (50/50 step-end, 1s infinite)
- `src/app/page.tsx`:
  - Hero mounted above TokenPreview
  - `#problem` anchor stub keeps secondary CTA functional pre-Phase-4

**Decisions made:**
- Server-rendered Hero copy + client-rendered PhoneMockup separation —
  optimal LCP without sacrificing animation polish
- Loop cycle ~9s (not the 6-8s originally specced) — needed time for typing
  to feel deliberate without rushing. Premium > efficient.
- Headline line 2 muted (`text-muted`) for editorial rhythm, not solid weight
- Stack items show name + dose to feel like a real app, not a mockup
- No FaceID/camera detail in the notch — Dynamic Island pill is sufficient
- All in-phone text uses fixed `text-[Xpx]` arbitrary sizes — these are
  app-screen sizes, not site typography, so they shouldn't grow with the
  fluid scale

**Open:**
- Phone tilt `2.5deg` could be tuned to taste
- Loop timing could be faster/slower based on user preference

---

## 2026-05-07 — Phase 2 (Hero) refinement pass

**Triggered by review feedback.** Tightened pacing, fixed status bar,
branded the mockup, surfaced personalization, added depth.

**Changes:**
- Loop: 9s → 7s (cut idle pause, faster typing, tighter transitions)
- Status bar: rectangular bars (not circles), bottom-aligned (was upside-down)
- App header: PharmaGuide wordmark with accent dot + "Add to stack" subtitle
- Interaction copy: "Magnesium may reduce levothyroxine absorption when
  taken too closely together" + "Separate by at least 4 hours."
- Screen background: subtle 3-stop gradient (white → background → surface-subtle)
- Cards: shadow ladder (xs → sm → md → lg) for layered hierarchy
- Interaction card: soft accent halo behind it (bg-accent/10 + blur-2xl)
- New "Good fit with timing adjustment" personalization chip — appears 1s
  after the interaction card, distinct visual plane (backdrop-blur),
  severity-safe checkmark, "For You" eyebrow on the right
- Hero trust row: "180,000+" → "180,000+ products"
- Updated reduced-motion snapshot to include the new chip

---

## 2026-05-07 — Phase 3 (Infrastructure Strip) shipped

**What shipped:**
- `src/components/sections/InfrastructureStrip.tsx`
- Subtle band: `bg-surface-subtle/30` + `border-y border-border/60`
- Three platform claims: "Cross-referenced catalog · Evidence-graded ·
  Privacy-first architecture"
- Type: mono uppercase eyebrow (12px), wide letter-spacing, muted color
- Mobile: stacked vertically (gap-y-2)
- Tablet+: inline with dot separators
- `whileInView` opacity fade with `once: true` and `-15%` viewport margin
- aria-label="Platform principles" on the section
- Mounted in page.tsx directly under Hero, above the #problem anchor stub

**Decisions made:**
- Subtle bg tint instead of plain background — gives the strip its own
  "register" without competing with the hero halo or future Problem section
- Both top + bottom borders (not just one) — definition matters for a band
- whileInView once-only — strip enters viewport ~1 scroll-tick after hero,
  so it should feel like a quiet reveal, not a re-trigger

**Note:** User revised the strip copy after approval to:
"Evidence-graded interactions · Clinician-informed review · Privacy-first architecture"
(was: "Cross-referenced catalog · Evidence-graded · Privacy-first architecture").
docs/03-content-spec.md updated to match.

---

## 2026-05-07 — Phase 4 (Problem) shipped

**What shipped:**
- `src/components/sections/Problem.tsx`
- Pure-typography section, no cards / icons / decoration
- Eyebrow: "The problem" (mono uppercase, muted)
- Headline: "A label tells you what's in the bottle. / Not what happens with
  your other bottles." (display-lg, line 2 in muted — same rhythm as hero)
- Three statements, text-only, `text-h3` size, `text-muted` color:
  - Googling "X with Y" gives you conflicting answers.
  - Most apps check one product. You take a stack.
  - Timing can change how something works.
- 3-column grid on desktop (gap-10/14), stacked on mobile
- `text-balance` on statements + thesis for editorial line breaks
- Closing thesis (font-serif italic, display-md, ink, centered):
  "Because interactions happen between products — not in isolation."
- Three independent scroll-triggered groups for natural pacing:
  - Block 1 (eyebrow + headline): viewport `-15%`, fadeUpContainer stagger
  - Block 2 (statements): viewport `-12%`, custom 120ms staggerChildren
  - Block 3 (thesis): viewport `-20%`, opacity + y + scale 0.97 → 1
- Section uses `id="problem"` so the Hero secondary CTA scrolls here
- Anchor stub removed from page.tsx

**Decisions made:**
- Three separate scroll triggers (not one big container) so each block lands
  deliberately as the reader scrolls past it. Single container caused thesis
  to appear before statements finished staggering.
- Custom 120ms stagger for the statements (vs default 80ms) so each one is
  read before the next arrives. Pacing trumps efficiency here.
- Thesis gets a slight scale-up (0.97 → 1) on top of opacity+y to signal
  importance without being showy. Italic serif carries the weight.
- "Smart quotes" used in copy ("X with Y") for editorial polish.

---

<!-- Append new entries above this line as phases complete -->
