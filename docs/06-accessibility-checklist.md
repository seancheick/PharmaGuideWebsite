# Accessibility Checklist (WCAG 2.1 AA)

> Health products have a higher accessibility bar. Aim for AA conformance,
> aspire toward AAA where reasonable. Audit before launch.

## ✅ Foundation (done)

- [x] `lang="en"` on `<html>`
- [x] `<a>` skip-to-content link in layout
- [x] Semantic HTML mindset (use `<main>`, `<nav>`, `<section>`, `<article>`)
- [x] Focus-visible outline styled via `:focus-visible`
- [x] `prefers-reduced-motion` respected globally
- [x] Color tokens chosen for contrast (verify per-section)

## 🔜 Color contrast

WCAG AA requires:
- **Normal text:** ≥ 4.5:1
- **Large text (18pt+ or 14pt+ bold):** ≥ 3:1
- **UI components / graphical objects:** ≥ 3:1

Verify each combination after building:

- [ ] `foreground` on `background` (primary body) — measure
- [ ] `muted` on `background` — measure
- [ ] `subtle` on `background` (smallest text) — must clear 4.5:1 or be reserved for large
- [ ] `accent` on `background` (CTA links) — measure
- [ ] White on `accent` (primary CTA button) — measure
- [ ] Severity colors on their bg tints — measure each
- [ ] White on `foreground` (skip link, modals) — measure

Use https://webaim.org/resources/contrastchecker/ or `axe DevTools`.

## 🔜 Keyboard navigation

- [ ] Every interactive element reachable via Tab
- [ ] Logical tab order matches visual order
- [ ] Focus indicator visible on every focusable element
- [ ] No keyboard trap (modals, mobile menu must allow Esc to close)
- [ ] Skip link reaches `#main`
- [ ] Carousel (Real-Life Moments) navigable via arrow keys
- [ ] Form fields submittable via Enter

## 🔜 Screen reader support

- [ ] All images have `alt` text (descriptive, not "image of...")
- [ ] Decorative images use `alt=""`
- [ ] All icons have `aria-label` or are decorative (`aria-hidden="true"`)
- [ ] Form fields labeled with `<label>` (visible) or `aria-label`
- [ ] Buttons have visible text or `aria-label`
- [ ] Loading states announce via `aria-live="polite"`
- [ ] Form errors announce via `role="alert"`
- [ ] FAQ accordion: proper `aria-expanded`, `aria-controls`
- [ ] Real-Life Moments expand: announce state change

## 🔜 Forms

- [ ] Labels associated with inputs (via `htmlFor` or wrapping)
- [ ] Required fields marked with `required` AND visible indicator
- [ ] Error messages associated via `aria-describedby`
- [ ] Inputs have appropriate `inputmode`, `autocomplete`, `type`
- [ ] Email field: `type="email"` `autocomplete="email"`
- [ ] Submit button announces loading + success states

## 🔜 Motion + animation

- [x] `prefers-reduced-motion: reduce` disables animations globally
- [ ] Hero loop pauses or freezes when reduce-motion is on
- [ ] No flashing > 3 times/sec (seizure trigger threshold)
- [ ] Auto-playing animations can be paused (consider for hero loop)

## 🔜 Touch targets

- [ ] All buttons and links ≥ 44×44px on mobile
- [ ] Adequate spacing between targets (≥ 8px)
- [ ] Hover states never required to use the site

## 🔜 Headings

- [ ] One `<h1>` per page (Hero headline)
- [ ] Heading hierarchy not skipped (no h1 → h3)
- [ ] Sections use `<h2>` for their primary headline
- [ ] Card titles use `<h3>`

## 🔜 Landmarks

- [ ] `<header>` for site header
- [ ] `<nav>` for navigation (with `aria-label="Main"`)
- [ ] `<main id="main">` for primary content (already in layout)
- [ ] `<footer>` for site footer
- [ ] Major sections use `<section>` with `aria-labelledby` referencing the heading

## 🔜 Pre-launch audit

- [ ] Manual keyboard-only test — complete every flow without mouse
- [ ] Screen reader test — VoiceOver (Mac) and NVDA (Windows)
- [ ] axe DevTools browser extension audit on every page
- [ ] Lighthouse Accessibility score: ≥95
- [ ] Test with browser zoom at 200% — no horizontal scroll, no overlap
- [ ] Test in high-contrast mode (Windows / macOS)
- [ ] Forced-colors media query support tested

## 🔜 Inclusive copy

- [ ] No reliance on color alone to convey meaning (severity has dot + label + color)
- [ ] No directional language ("click below" → use "Below" or specific anchor)
- [ ] Plain language (avoid jargon where possible; define when used)
- [ ] Reading level checked (Hemingway editor target: grade 8 or below for marketing copy)
