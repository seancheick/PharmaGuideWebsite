# Motion Spec

> The single biggest premium signal. Most sites get this wrong by being too fast,
> too bouncy, or too literal. The goal is "you barely notice it, but it feels right."

## Philosophy

- **Slow over fast.** Apple-style 600–900ms reveals beat 200ms snaps every time.
- **Decelerate, don't bounce.** Spring-bouncy animations are startup-y. Reserve `ease-spring` for one or two moments max (FitScore ring fill).
- **Stagger on entrance.** Items in a row appear one after another, not all at once.
- **Respect reduced motion.** Always.
- **Animate transform + opacity.** Never `width`, `height`, `top`, `left`, `box-shadow` (causes layout thrash).

## Token reference

All motion tokens defined in `src/app/globals.css`. JS mirror in `src/lib/tokens.ts`.

| Token | Value | When to use |
|---|---|---|
| `duration-instant` | 100ms | Button press feedback |
| `duration-fast` | 180ms | Hover, focus changes |
| `duration` | 280ms | Most UI transitions |
| `duration-slow` | 420ms | Card reveals |
| `duration-slower` | 640ms | Section fade-up entrances |
| `duration-slowest` | 960ms | Hero ambient, FitScore counter |

| Easing | Curve | When to use |
|---|---|---|
| `ease-smooth` | `cubic-bezier(0.65, 0, 0.35, 1)` | Buttery default for most things |
| `ease-emphasized` | `cubic-bezier(0.32, 0.72, 0, 1)` | Premium ease-out — entrances |
| `ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Slow finish — ambient reveals |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Reserved for FitScore ring only |

## Section choreography

### Hero
- Headline: stagger fade-up, 100ms between lines, `duration-slower` + `ease-emphasized`
- Subheadline: appears 200ms after headline finishes
- Trust row: appears 100ms after subheadline
- CTAs: appear together, 200ms after trust row
- Phone mockup: gentle continuous float (4s loop, 6px Y oscillation, `ease-smooth`)
- Hero loop animation: starts only after hero is fully entered

### Infrastructure Strip
- Single fade-in, no stagger, `duration-slow` + `ease-decelerate`

### Problem
- Headline: fade-up `duration-slower`
- Three statements: stagger left-to-right, 100ms between, `duration-slow`
- Closing thesis: fade-up after statements complete, slight scale (0.96 → 1)

### Interaction Ladder
- Headline + subhead: standard fade-up
- 5 tier pills: stagger horizontally, 80ms between, `duration-slow` + `ease-emphasized`
- Featured example card: fade-up after tiers, slight Y offset

### Real-Life Moments
- Section header: standard fade-up
- Cards: stagger as the carousel enters viewport
- Card hover: scale 1.02 + shadow lift, `duration-fast` + `ease-smooth`
- Card click expand: shared layout transition via `layoutId`, `transitions.spring`

### FitScore
- Headline + subhead: standard fade-up
- Score number: counts 0 → 82 over 1.2s (`duration-slowest`)
- Ring: fills clockwise via `pathLength` 0 → 1, `transitions.softSpring`
- Notes: appear after counter completes

### Trust Block
- Headline: standard fade-up
- 3 trust cards: stagger, 100ms between
- 4 restraint cards: stagger after trust cards, 80ms between
- Freshness signal: simple fade-in last

### Final CTA
- Whole section fades in slowly (`duration-slowest`), one piece at a time
- Form inputs: subtle lift on focus
- Submit success: form replaced with calm message, no confetti

## Reusable Framer Motion presets

From `src/lib/tokens.ts`:

```ts
import { transitions, fadeUpContainer, fadeUpItem } from "@/lib/tokens";

// Container with staggered children
<motion.div
  variants={fadeUpContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-10%" }}
>
  <motion.h2 variants={fadeUpItem}>Headline</motion.h2>
  <motion.p variants={fadeUpItem}>Subhead</motion.p>
</motion.div>

// Hover lift
<motion.div
  whileHover={{ y: -4 }}
  transition={transitions.hover}
>

// Spring for layout transitions
<motion.div
  layoutId={`card-${id}`}
  transition={transitions.spring}
>
```

## What NOT to do

- ❌ Animate everything. Restraint is the message.
- ❌ Use `ease-spring` more than 2× per page. It gets cute fast.
- ❌ Auto-play complex animations on entry without entrance trigger.
- ❌ Animate hover states on touch devices (no hover, just press feedback).
- ❌ Use `transition: all`. Always specify properties.
- ❌ Add scroll-jacking or scroll-snap on the whole page. Native scroll is sacred.

## Performance rules

- Use `transform: translate3d()` over `top`/`left` (already does this with Framer)
- Avoid layout-triggering properties
- Test on a Moto G4 or 4-year-old iPhone — not on a Mac Pro
- 60fps is the floor, not the goal
- Lazy-load heavy motion components below the fold via dynamic import
