# Performance Checklist

> Target: Lighthouse 95+ on Performance, Best Practices, SEO, Accessibility.
> Core Web Vitals all green.

## Core Web Vitals targets

| Metric | Target | Notes |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Hero text + phone mockup |
| CLS (Cumulative Layout Shift) | < 0.1 | Reserve space for images, fonts, animations |
| INP (Interaction to Next Paint) | < 200ms | Avoid heavy JS on interaction |
| FCP (First Contentful Paint) | < 1.8s | Fast initial render |
| TTFB (Time to First Byte) | < 600ms | Vercel edge handles this |
| TBT (Total Blocking Time) | < 200ms | Keep JS bundles small |

## ✅ Foundation (done)

- [x] Static generation by default (App Router with no dynamic data)
- [x] `next/image` configured with AVIF/WebP
- [x] `next/font` for Geist + Newsreader (no FOUT)
- [x] `optimizePackageImports` for framer-motion, clsx, tailwind-merge
- [x] Compress enabled in next.config
- [x] Long cache headers on `/_next/static/*`
- [x] Vercel Analytics + Speed Insights wired in

## 🔜 Image optimization

- [ ] All images use `<Image>` from `next/image` (never raw `<img>`)
- [ ] Specify `width` and `height` to prevent CLS
- [ ] Use `priority` on hero LCP image only
- [ ] Use `placeholder="blur"` with `blurDataURL` for hero
- [ ] Use `sizes` prop accurately (e.g., `(max-width: 768px) 100vw, 50vw`)
- [ ] Compress source images before adding (TinyPNG / Squoosh)
- [ ] Lifestyle photos kept under 200KB each after compression

## 🔜 Font optimization

- [x] `next/font` (no external CSS request)
- [x] `display: swap` on Newsreader (system font shows immediately)
- [x] Subset to Latin only
- [ ] `unicode-range` if more subsetting needed

## 🔜 JavaScript bundle

- [ ] Run `pnpm build` and inspect bundle analyzer output
- [ ] Total JS for homepage < 150KB (uncompressed)
- [ ] No client components above the fold unless interactive
- [ ] Lazy-load Framer Motion components below fold via dynamic imports
- [ ] Avoid icon libraries — use inline SVG for the few icons used
- [ ] No moment.js, lodash full imports, or other heavyweights

## 🔜 CSS

- [x] Tailwind purge configured (only `src/**/*.{ts,tsx}`)
- [x] Critical CSS inlined automatically by Next.js
- [ ] No `@import` chains in CSS
- [ ] Container queries used where appropriate (cleaner than media queries)

## 🔜 Animation performance

- [ ] All animations use `transform` and `opacity` only (GPU-accelerated)
- [ ] Avoid animating `width`, `height`, `top`, `left`, `box-shadow`
- [ ] Use `will-change` only when needed (not blanket)
- [ ] `prefers-reduced-motion` disables non-essential animations
- [ ] Hero loop animation runs at 60fps minimum (test on mid-tier mobile)

## 🔜 Network

- [ ] HTTP/2 enabled (Vercel default)
- [ ] Brotli compression (Vercel default)
- [ ] Preconnect to critical origins (e.g., images.unsplash.com if used)
- [ ] No render-blocking third-party scripts

## 🔜 Third-party scripts

- [ ] Only Vercel Analytics + Speed Insights initially
- [ ] When adding GA: use `next/script` with `strategy="afterInteractive"`
- [ ] When adding Clarity: same pattern
- [ ] Defer all non-critical scripts

## 🔜 Pre-launch checks

- [ ] Run `pnpm build` — no errors, no warnings
- [ ] Run `pnpm typecheck` — no type errors
- [ ] Test on real device (iPhone SE, mid-tier Android)
- [ ] Test on slow 3G in Chrome DevTools
- [ ] Lighthouse score on production deploy: ≥95 across all four categories
- [ ] WebPageTest run on Moto G4 / Slow 4G
- [ ] Real User Monitoring set up (Vercel Speed Insights handles this)

## Bundle size budget

| Asset | Budget |
|---|---|
| Total JS (homepage) | 150KB |
| Total CSS | 50KB |
| Total fonts | 100KB |
| Hero image / loop | 0KB (Framer Motion) |
| Each lifestyle image | 200KB after compression |
| Total page weight | < 1MB |
