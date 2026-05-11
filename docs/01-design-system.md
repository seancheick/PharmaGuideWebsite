# Design System

> The canonical token reference. Source of truth: `src/app/globals.css`.
> If you change a value, change it there first — Tailwind, motion, and component
> styles all flow from CSS variables.

## Philosophy

**Calm clinical intelligence.** Not wellness. Not biotech. Not generic SaaS.

Premium emerges from:
1. **Restraint** — no extra weights, no extra colors, no decoration without purpose
2. **Rhythm** — consistent vertical spacing, predictable type scale
3. **Motion** — slow, emphasized curves; never bouncy or fast
4. **Whitespace** — generous padding, lots of breathing room
5. **Typography** — large display sizes, tight leading, soft weights

Avoid: gradients used as "wow factor", saturated brand colors, harsh shadows,
rounded-full buttons everywhere, animated emoji, biotech green accents.

## Color tokens

All values are RGB triplets so Tailwind's `/<alpha>` modifier works
(`bg-accent/10`, `text-foreground/80`).

### Surface

| Token | Value | Usage |
|---|---|---|
| `background` | `#FAF9F6` (warm off-white) | Page background |
| `surface` | `#FFFFFF` | Card backgrounds |
| `surface-raised` | `#FCFBF8` | Elevated cards (hover, focus) |
| `surface-subtle` | `#F4F2EE` | Recessed surfaces (footer, dividers) |

### Foreground

| Token | Value | Usage |
|---|---|---|
| `ink` | `#111314` | Headlines, deepest text |
| `foreground` | `#181A1B` | Body |
| `muted` | `#63666A` | Secondary text, subheads |
| `subtle` | `#8E9196` | Tertiary, captions, eyebrows |

### Border

| Token | Value | Usage |
|---|---|---|
| `border` | `#E5E2DB` | Default hairlines |
| `border-strong` | `#D1CDC4` | Emphasized borders, inputs |

### Accent + link (brand teal family)

The brand uses a single deep-teal hue across two lightness tiers. Use
`accent` for buttons, focus rings, and chrome where depth + weight
matter; use `link` for inline body-text links where lighter teal stays
distinguishable from near-black body text.

| Token | Value | Usage |
|---|---|---|
| `accent` | `#183B3F` (deep teal, L 17%) | Primary CTA backgrounds, focus rings, italic-serif kickers, eyebrow accents |
| `accent-strong` | `#102A2D` | Hover/active state on CTAs |
| `accent-soft` | `#E6ECEC` | Tinted accent backgrounds |
| `link` | `#246066` (mid teal, L 27%) | Inline body-text links — reads as clearly teal against body copy |
| `link-strong` | `#184F54` | Inline link hover/active |

**Inline link pattern** (use on every body-text `<a>`):

```tsx
className="text-link underline decoration-link/60 underline-offset-[3px]
  transition-[color,text-decoration-color] duration-fast ease-smooth
  hover:text-link-strong hover:decoration-link"
```

Action-CTA arrows and inline mono-caps "link-style" buttons can keep
`text-accent` if they sit on a surface where the deeper teal reads as
ink-strong (e.g. inside a card with its own background).

> **Rule:** never hardcode link colors. Inline links MUST use `text-link`
> / `decoration-link`. Buttons + CTAs MUST use `bg-accent` (filled) or
> `text-accent` (text-only action labels). Source of truth lives in
> `--color-accent` + `--color-link` in `globals.css`.

### Severity (5-tier)

These are polished defaults. Match the Flutter app exactly when ready.

| Tier | Token | Value | Meaning |
|---|---|---|---|
| 1 | `severity-contraindicated` | `#9F2929` | Do not combine |
| 2 | `severity-avoid` | `#B85429` | Strong reason to separate |
| 3 | `severity-caution` | `#AD7A24` | Risk depends on context |
| 4 | `severity-monitor` | `#827140` | Manage with timing/awareness |
| 5 | `severity-safe` | `#3F6250` | No known concern |

Each pairs with a 10% tinted background variant (`-bg`) for chip surfaces.

## Typography

### Font pairing

- **Geist Sans** — UI, body, headlines (variable weight, free, premium)
- **Newsreader** — editorial display moments, italic emphasis (Google Fonts)
- **Geist Mono** — data display (FitScore numbers, captions)

### Weight discipline

Only use **400 (regular)**, **500 (medium)**, **600 (semibold)**.
Never 700+. Restraint > weight.

### Scale

All sizes use `clamp(min, viewport, max)` for fluid typography.

| Token | Range (mobile → desktop) | Usage |
|---|---|---|
| `display-xl` | 44px → 88px | Hero headline |
| `display-lg` | 36px → 72px | Major section headlines |
| `display-md` | 32px → 56px | Section headlines, italic moments |
| `display-sm` | 28px → 44px | Sub-section headlines |
| `h1` | 30px → 40px | Page-level headlines |
| `h2` | 24px → 32px | Card group headlines |
| `h3` | 20px → 24px | Card titles |
| `h4` | 18px → 20px | Small headlines |
| `body-xl` | 20px | Subheadlines, lead paragraphs |
| `body-lg` | 18px | Emphasized body |
| `body` | 16px | Default |
| `body-sm` | 15px | Secondary body |
| `micro` | 13px | Captions, footer text |
| `eyebrow` | 12px | Section eyebrows, labels (uppercase, tracking) |

### Line-height

Generous = premium.

| Token | Value | Use |
|---|---|---|
| `display` | 1.05 | Display text |
| `tight` | 1.15 | Headlines |
| `snug` | 1.3 | Sub-headlines |
| `normal` | 1.5 | Body |
| `relaxed` | 1.65 | Lead paragraphs |
| `loose` | 1.8 | Reserved |

### Letter-spacing

| Token | Value | Use |
|---|---|---|
| `display` | -0.022em | Large display (slight tighten) |
| `tight` | -0.012em | Headlines |
| `eyebrow` | 0.08em | Eyebrows (wide tracking) |
| `wide` | 0.02em | Captions |

## Spacing

Base = 4px. Tailwind's default scale extends seamlessly. Section-level tokens:

| Token | Range | Usage |
|---|---|---|
| `section-y` | 64px → 128px | Major section vertical padding |
| `section-y-sm` | 48px → 80px | Smaller section padding |
| `gutter` | 24px | Between cards |
| `container-max` | 1280px | Max content width |
| `container-padding` | 20px → 32px | Container side padding |
| `prose-max` | 65ch | Reading-width prose blocks |

## Radius

| Token | Value | Use |
|---|---|---|
| `xs` | 4px | Small chips, pill text |
| `sm` | 6px | Inputs, micro elements |
| `default` | 8px | Default UI |
| `md` | 10px | Smaller cards |
| `lg` | 14px | Standard cards |
| `xl` | 20px | Featured cards |
| `2xl` | 28px | Hero cards, mockups |
| `3xl` | 36px | Large feature blocks |
| `pill` | 9999px | Header, chips, pill buttons |

## Shadows

Soft, layered, never harsh. Multiple shadows per token = realistic depth.

| Token | Use |
|---|---|
| `xs` | Subtle hairline emphasis |
| `sm` | Small UI elements |
| `default` | Default cards |
| `md` | Floating cards |
| `lg` | Hero phone, raised elements |
| `xl` | Modals, prominent floating |
| `2xl` | Hero ambient halo |
| `glow` | Accent glow (CTA hover) |

## Motion

### Durations (ms)

| Token | Value | Use |
|---|---|---|
| `instant` | 100 | Button press, micro |
| `fast` | 180 | Hover, focus |
| `default` | 280 | Most transitions |
| `slow` | 420 | Card reveals |
| `slower` | 640 | Section entrances |
| `slowest` | 960 | Hero ambient, FitScore counter |

### Easing

| Token | Curve | Use |
|---|---|---|
| `smooth` | `cubic-bezier(0.65, 0, 0.35, 1)` | Buttery default |
| `emphasized` | `cubic-bezier(0.32, 0.72, 0, 1)` | Premium ease-out (default reveal) |
| `decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Slow-finish reveal |
| `spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Gentle bounce (use sparingly) |

### Stagger

| Token | Value | Use |
|---|---|---|
| `fast` | 60ms | Tight stagger (chip rows) |
| `default` | 80ms | Standard card stagger |
| `slow` | 120ms | Generous stagger (hero items) |

## Blur

For glass effects (floating header, modal overlays).

| Token | Value |
|---|---|
| `xs` | 4px |
| `sm` | 8px |
| `default` | 12px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 40px |

## Z-index

| Token | Value | Use |
|---|---|---|
| `base` | 0 | Default |
| `dropdown` | 100 | Dropdowns |
| `sticky` | 200 | Sticky elements |
| `header` | 300 | Floating header |
| `overlay` | 400 | Modal scrim |
| `modal` | 500 | Modal content |
| `toast` | 600 | Notifications |

## Gradients

| Token | Use |
|---|---|
| `--gradient-warm-fade` | Subtle section transitions |
| `--gradient-hero-halo` | Hero ambient backdrop |
| `--gradient-cta-glow` | CTA button hover glow |

Apply via utilities: `.halo-hero`, `.fade-warm`, `.glow-cta`.
