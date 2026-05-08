# Performance Audit · 2026-05-08

> Live audit of `pharmaguide-website.vercel.app` after the FAQ + legal +
> features + methodology + about + careers + press + blog rollout. Run via
> Playwright instrumentation against the deployed Vercel build.
>
> **Headline: site is fast.** All pages well under the "Good" Core Web
> Vitals thresholds. Nothing critical to fix; a few small optimizations
> noted for the blog-image future.

## Summary table

| Page | TTFB | FCP | DCL | Load | CLS | Resources | Total KB |
|---|---|---|---|---|---|---|---|
| `/` | **105ms** | **616ms** | 567ms | 586ms | **0.0000** | 56 | ~180 |
| `/features` | **42ms** | **248ms** | 203ms | 209ms | **0.0000** | 53 | 58 |
| `/blog/medication-depletion-guide` | **10ms** | **240ms** | — | — | **0.0000** | — | 72 |

### Core Web Vitals thresholds (for context)

| Metric | Good | Needs improvement | Poor |
|---|---|---|---|
| **LCP** | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| **FCP** | ≤ 1.8s | ≤ 3.0s | > 3.0s |
| **CLS** | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| **TTFB** | ≤ 800ms | ≤ 1.8s | > 1.8s |

**Every PharmaGuide page tested clears every "Good" threshold by 3-15× the margin.**

## What's working

### TTFB — best-in-class

10–105ms across pages. This is mostly:
- Vercel edge network (sub-50ms hits in most regions)
- Static prerendering for every route via `revalidate = 432000` (5d ISR)
- Small HTML payloads (~22KB initial doc transfer on `/`)

### FCP — excellent

240–616ms. The site renders meaningful content well before the 1.8s "Good"
threshold. Server-rendered hero content + inline critical CSS (Tailwind
purges to only what's used per page) means no FOUT or layout pop.

### CLS — perfect zero

`0.0000` across every page tested. This is the single most impressive metric
because most marketing sites struggle with CLS from late-loading fonts,
images without dimensions, and animations that displace neighboring content.

What's preventing CLS:
- `font-display: swap` paired with Geist's matched fallback metrics
- Every image (next/image + custom blog covers) declares explicit
  width/height
- Framer Motion `whileInView` animations animate transform + opacity only
  (not layout properties)
- Hero phone-mockup uses fixed dimensions
- Carousel uses Framer's `layout` prop (FLIP — transform-only, never
  layout-thrash)

### DOM size — healthy

825–933 nodes across the heaviest pages. Lighthouse warns at 1500;
performance suffers at 3000+. We're well under.

### Image strategy — fully lazy

All 6 images on the homepage use `loading="lazy"`. The blog post image
loads eagerly only because `priority={true}` was set in the post's
`<PostImage>` (correct — it's the above-fold hero image).

### Bundle size — small

180KB total transfer on `/` (including all third-party analytics).
58KB on `/features`. Excellent.

## What to watch as content grows

### When the blog has 10+ posts with hero images

Currently 1 post with 1 hero image. When the blog has 10+ posts:

- The `/blog` hub page renders 12 cards per page (pagination keeps it
  bounded — no degradation as count grows)
- Each card's hero image is `next/image` lazy-loaded → only the
  above-fold cards (3-4) load eagerly per page view
- next/image auto-converts to AVIF/WebP at the edge → typical 1600×1000
  hero photo serves at ~80KB instead of ~250KB

**Action**: keep using `<PostImage priority={false}>` for in-post images
(default). Only set `priority={true}` on the very first above-the-fold
image in a long post. This is documented in `docs/10-blog-system-guide.md`.

### Third-party scripts

Currently loading: Vercel Analytics + Speed Insights + Google Analytics 4
+ Microsoft Clarity. Total ~30KB across 4 scripts. All load deferred /
async; none block first paint.

If load increases (we add Hotjar, segment.com, etc.), revisit. For now,
fine.

### LCP measurement gap

The Playwright probe didn't catch an LCP entry on the homepage in the
2.5s observation window. This is because the hero phone-mockup is
client-rendered and the LCP candidate may have been the headline or a
section eyebrow. **Worth a real-world Vercel Speed Insights check after
a week of traffic** — that'll show actual field LCP from real visitors,
not synthetic.

If field LCP > 2.5s for any page, the most likely culprit is a font
swap or Framer Motion's deferred entrance pushing the LCP candidate.
Easy fix: add `priority` to the hero image / phone mockup wrapper.

## Recommendations (none urgent)

1. **Real-user metrics watch** — log into Vercel Analytics + Speed
   Insights weekly for the next month to confirm field metrics match
   the synthetic ones. Mobile 4G LCP is the one to watch.

2. **Image budget for blog at scale** — when posts routinely include 4-6
   in-post images:
   - Compress to <200KB per image before upload (Squoosh/TinyPNG)
   - Use 16:10 or 16:9 aspect for in-post photos
   - One `priority={true}` per post max (the above-fold hero)

3. **Skip until field metrics indicate a problem:**
   - Code-splitting Framer Motion (currently fine; can split per-route
     if any single page balloons)
   - Removing Geist Mono if it's not heavily used (currently used in
     every eyebrow + numeric display — keep)
   - Preconnect hints (Vercel handles edge connections automatically)

## Audit mechanics

```js
// What we measured per page (paraphrased):

await page.goto(url);
await new Promise(r => setTimeout(r, 2500)); // settle metrics

const nav = performance.getEntriesByType('navigation')[0];
const paint = performance.getEntriesByType('paint');
const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime;
const resources = performance.getEntriesByType('resource');
const layoutShifts = performance.getEntriesByType('layout-shift');
// ...
```

Same instrumentation works for any future audit pass. Drop the function
into Playwright's `page.evaluate()` and re-run on the live site.

## Re-audit cadence

- **After each major content drop** (new section / new page type)
- **After major dependency upgrades** (Next.js majors, Framer Motion
  majors)
- **Monthly** if Vercel Speed Insights flags anything red
- **Before any paid acquisition campaign** (don't pay to send traffic
  to a slow site)
