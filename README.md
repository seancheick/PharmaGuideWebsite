<div align="center">

# PharmaGuide

**The supplement &amp; medication co-pilot most people don't realize they need.**
It reads your full stack as a system — multi-way interactions, medication-nutrient depletions, dose accumulation across products, live FDA recall monitoring, and ingredient quality — so the things you take to feel better stop quietly working against each other. Clinician-reviewed. Evidence-graded. Private by architecture.

<sub>Live at **[pharmaguide.io](https://pharmaguide.io)** · mobile app opening in waves through 2026</sub>

<br />

[![Status](https://img.shields.io/badge/Status-Production-12B886?style=for-the-badge)](https://pharmaguide.io)
[![Framework](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Hosting](https://img.shields.io/badge/Vercel-Edge-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](./tsconfig.json)
[![Tailwind](https://img.shields.io/badge/Tailwind-v3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](./tailwind.config.ts)
[![Motion](https://img.shields.io/badge/Framer%20Motion-11-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![MDX](https://img.shields.io/badge/Content-MDX-F9AC00?style=flat-square&logo=mdx&logoColor=white)](./content/blog)
[![Pages](https://img.shields.io/badge/pages-13-6E40C9?style=flat-square)](./src/app)
[![Components](https://img.shields.io/badge/components-42-DB2777?style=flat-square)](./src/components)
[![LOC](https://img.shields.io/badge/code-17.6k%20LOC-555555?style=flat-square)](./src)
[![License](https://img.shields.io/badge/license-Proprietary-CB2030?style=flat-square)](#license)

</div>

---

## The product behind the site

PharmaGuide is a **clinician-reviewed supplement and medication intelligence platform**. The website is one surface; the larger product is a mobile app that reads your full stack as a system — multi-way interactions, medication-nutrient depletions, dose accumulation, ingredient quality, and live FDA recall monitoring across a **180,000+ product catalog**.

This repo holds the marketing site, the editorial blog, the legal/disclosure pages, and the embedded **AI assistant widget** that fronts the [pharmaguide-chatbot-api](https://github.com/seancheick/pharmaguide-chatbot-api) — a four-layer safety pipeline (gates → grounded retrieval → multi-provider LLM → post-response validator) so visitors can ask supplement / medication / interaction questions right here, on-brand, with the same clinical-tone responses the mobile app will ship with.

---

## What lives here

| Page | Surface |
|---|---|
| `/` | 9-section homepage — Hero · InfrastructureStrip · Problem · HowItWorks · InteractionLadder · BeyondInteractions · RealLifeMoments · YourFit · FinalCTA |
| `/features` | 6 product pillars with deep-dive sections + the "Two scales, two questions" callout |
| `/methodology` | Sourcing &amp; verification — including a **real specimen card** (Atorvastatin ↔ CoQ10) pulled from the production pipeline with PubMed PMIDs, reviewer signature, schema version |
| `/about` | Founder origin · 4 industry-lies cards with NEJM / FDA / NIH sources · drug-vs-supplement recall comparison · team with photos |
| `/blog` + `/blog/[slug]` | Editorial hub with Featured pill (Spotlight + category dual-pill), MDX-driven posts, BlogShare rail (X / LinkedIn / Facebook / email / copy), Editorial Standards strip, related posts |
| `/faq` | 11 questions grouped into Product / Privacy / Launch with sticky search, per-group numbering, JSON-LD `FAQPage` schema |
| `/careers` | "Not actively hiring · always reading inbound" with stay-in-touch capture |
| `/press` | Press kit — boilerplate (3 lengths), leadership with real photos, brand colors, brand-usage do/don't, asset downloads |
| `/privacy` `/terms` `/hipaa` `/accessibility` | Legal/disclosure shell with sticky TOC, scroll-spy, `<time dateTime>` last-updated stamps, mobile collapsible `<details>`. HIPAA page also embeds a real **Healthcare Pros early-access form** routed to `providers@pharmaguide.io` via Resend |
| `/llms.txt` | LLM-discovery file for AI crawlers — boilerplate + key authority signals |
| `/sitemap.xml` `/robots.txt` `/manifest.webmanifest` | Auto-generated SEO + PWA surfaces |

---

## Architecture highlights

**Design tokens are the source of truth.** Every color, font size, line height, tracking, radius, shadow, transition, and section-padding value lives in `src/app/globals.css` as a CSS custom property. Tailwind reads from those vars. There are zero hardcoded hex values, zero magic px numbers in component classNames — only token classes. The design system documents the link family separately from the accent family so inline links read as clearly teal instead of near-black on the warm cream background.

**Motion as a design language.** Framer Motion 11 drives every entrance, hover, scroll-reveal, and accordion. Choreographies are timed against a single token system in `src/lib/tokens.ts` (`transitions.reveal`, `transitions.hover`, `transitions.ambient`). The Hero's count-up to 4,100 ER visits per day, the YourFit dual-read card, the InteractionLadder's evidence-level reveal, and the cinematic FinalCTA all share the same easing curve.

**Editorial voice over engineering vanity.** Content lives in versioned data files (`src/lib/features.ts`, `src/lib/methodology.ts`, `src/lib/faq.ts`, `src/lib/hipaa.ts`, MDX in `content/blog/`) so copy can be reviewed without touching layout. Voice is calm-clinical: second-person, restrained, evidence-graded. No marketing adjectives, no "AI-powered", no "revolutionary". The about page's drug-vs-supplement-recall comparison and the methodology page's specimen card do more conversion work than any CTA.

**Accessibility &amp; performance built in.**

- `aria-labelledby`, `aria-live`, `role="region"` on every interactive surface
- Scroll-spy TOC on legal pages
- Reduced-motion fallbacks in `useReducedMotion()`
- Focus traps + ESC handling on mobile menu and chat panel
- Next/Image with explicit `width` × `height` × `quality={95}` on team portraits (2× retina-grade)
- JSON-LD: `Organization`, `Article`, `BreadcrumbList`, `FAQPage`, `HowTo`, `Person`, `SoftwareApplication`, `ItemList` across the site
- Prefers-color-scheme themed manifest

---

## AI assistant widget

A floating "Ask PharmaGuide AI" launcher fades in after the visitor scrolls past the hero. It opens a slide-up panel (400 × 600 on desktop, full bottom-sheet on mobile) with:

- Quick-start chips (sleep, depletion check, privacy) on empty state
- Auto-resize textarea with Enter-to-send / Shift-Enter newline
- Conversation persistence across visits via `localStorage`
- Single-line "educational only" disclaimer footer
- Hidden entirely on legal pages so it never intrudes on serious reading

Requests are proxied through `/api/chat` (Next.js route handler) which forwards to the upstream [chatbot API](https://github.com/seancheick/pharmaguide-chatbot-api). The proxy adds per-IP Upstash rate-limiting and strips `model` / `_state` from the response so the underlying engine stays opaque under the "PharmaGuide AI" brand.

Same engine, same four-layer safety pipeline as the app — visitors can ask any supplement / medication / interaction question right here.

---

## Tech stack

[![Next.js 16](https://img.shields.io/badge/Next.js-16%20App%20Router-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict%20%2B%20noUncheckedIndexedAccess-3178C6?style=flat-square&logo=typescript&logoColor=white)](./tsconfig.json)
[![Tailwind](https://img.shields.io/badge/Tailwind-v3%20token--driven-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](./tailwind.config.ts)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11-0055FF?style=flat-square&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vercel](https://img.shields.io/badge/Vercel-Analytics%20%2B%20Speed%20Insights-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![Resend](https://img.shields.io/badge/Resend-Transactional%20Email-000000?style=flat-square)](https://resend.com)
[![Upstash](https://img.shields.io/badge/Upstash-Redis%20%2B%20Ratelimit-DC2626?style=flat-square)](https://upstash.com)
[![Clarity](https://img.shields.io/badge/Microsoft%20Clarity-Behavior%20Analytics-002050?style=flat-square)](https://clarity.microsoft.com)
[![MDX](https://img.shields.io/badge/next--mdx--remote-MDX%206-F9AC00?style=flat-square)](https://github.com/hashicorp/next-mdx-remote)

- **Framework** · Next.js 16 (App Router · React Server Components · Turbopack dev)
- **Type system** · TypeScript strict + `noUncheckedIndexedAccess`
- **Styling** · Tailwind v3 reading from CSS custom properties in `globals.css`
- **Motion** · Framer Motion 11 with token-driven transitions
- **Typography** · Geist Sans (UI/headlines) + Newsreader (editorial display) + Geist Mono (data/eyebrows)
- **Forms &amp; email** · React Email 2 + Resend 6 for transactional + audience management
- **Rate limiting** · Upstash Redis sliding-window for the beta waitlist, Healthcare-Pros inquiry form, and chat proxy
- **Analytics** · Vercel Analytics + Speed Insights + Microsoft Clarity (heatmaps / session replay)
- **Content** · MDX via `next-mdx-remote` with custom components (`Callout`, `EvidencePill`, `PostImage`, `Source`) + remark-gfm

---

## Performance &amp; SEO baselines

- **Statically generated** — every page is prerendered with 5-day ISR. The chat widget is the only client-island; everything else is RSC.
- **Image pipeline** — Next/Image with `quality={95}` and 2× natural-width hints for retina screens. AVIF served where supported.
- **`llms.txt`** — published at `/llms.txt` with boilerplate, authority signals, and policy references so AI crawlers index us accurately.
- **JSON-LD** — Schema.org Organization tag in `<head>`, plus page-specific `Article`, `FAQPage`, `HowTo`, `SoftwareApplication`, `ItemList`.
- **Verification meta** — env-driven Google / Bing / Yandex site-verification tags.
- **Sitemap + robots** — auto-generated, includes blog posts + last-modified.
- **Security headers** — strict-transport-security, x-content-type-options, x-frame-options, referrer-policy via `next.config.ts`.
- **Speed Insights** continuously monitors LCP, CLS, INP, TTFB on production traffic.

---

## Repository structure

```
.
├── content/blog/                    MDX blog posts
├── docs/                            Design system + content spec + checklists
│   ├── 01-design-system.md          Token reference (single source of truth)
│   ├── 03-content-spec.md           All site copy by section
│   ├── 04-seo-checklist.md
│   ├── 05-performance-checklist.md
│   ├── 06-accessibility-checklist.md
│   └── 07-motion-spec.md
├── public/
│   ├── brand/                       Logos, press assets
│   └── team/                        Founder + clinician portraits
└── src/
    ├── app/                         Routes (App Router)
    │   ├── api/chat/                Proxy to chatbot-api
    │   ├── actions/subscribe.ts     Resend audience server actions
    │   ├── globals.css              ← Design tokens live here
    │   └── (13 page routes)
    ├── components/
    │   ├── chat/                    Floating AI assistant + gate
    │   ├── layout/                  Header (floating pill) + Footer + BackToTop
    │   ├── sections/                Homepage section components
    │   ├── about/ blog/ careers/ faq/ features/ legal/ methodology/ press/
    │   └── shared/                  ClinicianBadge + Logo + RelatedLinks
    ├── emails/                      React Email templates
    └── lib/                         site config, blog/features/methodology data, tokens, utils
```

---

## Voice &amp; copy

Voice spec lives in `docs/03-content-spec.md`.

- **Tone** · calm clinical intelligence — second-person, restrained, evidence-graded
- **Restraint promises** in the footer trust-bar: HIPAA Compliant · AES-256 Encrypted · Offline-First · No Data Selling
- **Banned vocabulary** · "AI-powered", "revolutionary", "trusted" (when unproven), "game-changing", any bold-everywhere emphasis
- **Earn it instead** · concrete numbers (4,100 daily ER visits · 180,000+ catalog · clinician-reviewed) over adjectives

---

## Acknowledgements

Clinical accuracy review by **Laurie Pham, PharmD** (Doctor of Pharmacy · 15+ years clinical pharmacy).
Patient-education review by **Miriam Farez, NP** (Nurse Practitioner · integrative health practice).

Built and maintained by **Sean Cheick Baradji** · founder, PharmaGuide · B&Br Technology, Boston, MA.

## License

Proprietary © 2026 PharmaGuide. All rights reserved.
