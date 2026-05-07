# PharmaGuide Website

Marketing website for **PharmaGuide** — supplement intelligence platform.
Premium product feel: **Apple / Linear / Oura level**, not a SaaS template.

## Stack

- **Next.js 16** (App Router, React 19)
- **TypeScript** (strict mode + `noUncheckedIndexedAccess`)
- **Tailwind CSS v3** (CSS-variable-driven, no hardcoded values)
- **Framer Motion 11** for all motion
- **Geist Sans + Newsreader + Geist Mono** typography
- **Vercel** for hosting + Analytics + Speed Insights

## Getting started

```bash
nvm use            # uses .nvmrc → 22.16.0
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm typecheck` | Type-check without emitting |
| `pnpm format` | Format with Prettier |

## Project structure

```
.
├── docs/                      # Planning + reference docs
│   ├── 00-master-plan.md      # Index + status
│   ├── 01-design-system.md    # Token reference
│   ├── 02-build-sequence.md   # Sprint task list ([ ] / [x])
│   ├── 03-content-spec.md     # All copy by section
│   ├── 04-seo-checklist.md
│   ├── 05-performance-checklist.md
│   ├── 06-accessibility-checklist.md
│   ├── 07-motion-spec.md
│   └── 08-progress.md         # Phase log
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout, fonts, metadata
│   │   ├── page.tsx           # Homepage (currently TokenPreview)
│   │   ├── globals.css        # ← Design tokens live here
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── manifest.ts
│   ├── components/
│   │   ├── layout/            # Header, Footer
│   │   ├── sections/          # Hero, Problem, ... FinalCTA
│   │   ├── preview/           # TokenPreview (V1 placeholder)
│   │   └── ui/                # Button, Container, etc.
│   └── lib/
│       ├── site.ts            # Brand constants, nav, footer
│       ├── tokens.ts          # TS token mirror for Framer Motion
│       └── utils.ts           # cn() helper
├── tailwind.config.ts         # Reads from CSS variables
├── next.config.ts             # Image opt, security headers
└── tsconfig.json
```

## Design tokens

**Source of truth: `src/app/globals.css`.** Tailwind config reads from CSS variables.
Never hardcode colors, sizes, or curves — extend tokens instead.

See `docs/01-design-system.md` for the complete reference.

## Build sequence

We build **section by section**, with approval after each phase.
See `docs/02-build-sequence.md` for the live task list.

Current state: **Phase 0 (Foundation) — pending design system approval.**

## Voice and copy

All site copy lives in `docs/03-content-spec.md`.
Voice: second-person, restrained, "calm clinical intelligence."
See banned-words list at the bottom of that doc.

## Deployment

- Production: Vercel (TBD)
- Preview deployments: every PR
- Custom domain: TBD (`pharmaguide.io`)

## License

Proprietary — © 2026 PharmaGuide.
