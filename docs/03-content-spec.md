# Content Spec — All Copy by Section

> Every word that appears on the homepage. Edit here, then code reflects the change.
> Voice: second-person, restrained, "calm clinical intelligence."
> Avoid: "we revolutionize", "AI-powered", excessive capitalization, !!!

## Header

```
[Logo: PharmaGuide]    How It Works    Methodology    Blog    About    [Join Beta →]
```

Mobile menu opens to a full-screen overlay with the same items vertically stacked.

---

## Hero

**Eyebrow:**
```
The interaction layer for your stack
```

**Headline:**
```
Your supplements don't work in isolation.
Neither should your check.
```

**Subheadline:**
```
See how your supplements, medications, and timing
work together — not one bottle at a time.
```

**Trust row:**
```
180,000+ products · Evidence-graded · On-device
```

**Primary CTA:** `Join Beta →`
**Secondary CTA:** `Why interactions matter ↓` (anchors to Problem section)

**Hero loop content (animated app UI):**
```
Step 1: User searches "magnesium" → result card appears
Step 2: User searches "levothyroxine" → result card appears
Step 3: Interaction card slides up:

  Magnesium + Levothyroxine
  [Monitor]
  May reduce absorption when taken together.
  ─────────
  Recommendation:
  Separate doses by at least 4 hours.
  Evidence: Moderate

Step 4: Hold for 1.5s, fade, restart.
```

---

## Infrastructure Strip

```
Evidence-graded interactions · Clinician-informed review · Privacy-first architecture
```

---

## Problem

**Headline:**
```
A label tells you what's in the bottle.
Not what happens with your other bottles.
```

**Three statements** (each split lead/tail — lead in ink, tail in muted):

1. **Googling "X with Y"** · usually gives you three different answers.
2. **Most products are checked one at a time.** · That's not how people take them.
3. **Sometimes it's not the ingredient.** · It's the timing.

**CDC stat callout** (between statements and thesis — quantifies the problem):

```
4,100+
ER visits per day · U.S.

Every day, thousands of people visit the ER from
adverse drug events, including known drug interactions.

Information is your first line of defense.

Source: CDC ↗  ·  Not all interactions require emergency care
```

Big number in sans tabular-nums (clinical "data" feel — distinct from
the section's italic-serif moments). The "+" suffix in accent color.
Empowerment line in regular sans (not italic — preserves italic for
the closing thesis below). Source links to:
https://www.cdc.gov/medication-safety/data-research/facts-stats/index.html

**Closing thesis (italic serif, large):**
```
Because interactions happen between products — not in isolation.
```

---

## Interaction Ladder

**Headline:**
```
Clear verdicts. Cited reasoning.
```

**Subheadline:**
```
We translate complex interaction data into simple safety levels,
so you know what deserves attention and why.
```

**5 tier pills:**

| Tier | Label | Description |
|---|---|---|
| 1 | Contraindicated | Do not combine. |
| 2 | Avoid | Strong reason to separate. |
| 3 | Caution | Risk depends on context. |
| 4 | Monitor | Manage with timing or awareness. |
| 5 | No known issue | Evidence shows no concern. |

**Featured example card:**
```
Magnesium + Levothyroxine            [Monitor]

May reduce absorption when taken together.

Recommendation:
Separate doses by at least 4 hours.

Evidence: Moderate
```

---

## Real-Life Moments

**Section label:** `Built for real life`

**Headline:**
```
The moments people don't realize they need this
```

**Subheadline:**
```
Many risks come from combinations, timing, or
situations people assume are harmless.
```

### Card 1 — Chronic conditions / medication routine

- **Image direction:** 55–70 year old, kitchen counter with prescription bottles + coffee, morning light. Editorial, not staged.
- **Title:** `You manage medications and take supplements every day.`
- **Expanded:**
  ```
  If you take metformin, statins, thyroid medication, blood pressure
  medication, or blood thinners, your supplement routine may need
  extra context.
  ```
- **What PharmaGuide checks:** Drug-supplement interactions, timing conflicts, dosage concerns.
- **Example flag:** `Magnesium ↔ Levothyroxine — Monitor, separate by 4h`

### Card 2 — Pregnancy

- **Image direction:** Hand on softly visible bump, neutral environment, no clichéd "expecting" pose.
- **Title:** `You're pregnant… and still taking your usual supplements.`
- **Expanded:**
  ```
  Some ingredients that are normally safe may need review during
  pregnancy, including high-dose vitamin A and certain herbal extracts.
  ```
- **What PharmaGuide checks:** Pregnancy-related ingredient risks, dosage concerns, timing guidance.
- **Example flag:** `High-dose Vitamin A — Caution`

### Card 3 — SSRI / mood support

- **Image direction:** Evening kitchen, soft lamplight, glass of water. No tears, no sad expressions.
- **Title:** `You take an SSRI and add something "natural" for mood.`
- **Expanded:**
  ```
  Some herbal supplements, like St. John's Wort, may interact with
  antidepressants and increase safety concerns.
  ```
- **What PharmaGuide checks:** Drug-herb interactions, serotonin-related risks, mechanism context.
- **Example flag:** `St. John's Wort + SSRI — Avoid`

### Card 4 — Stack optimizer

- **Image direction:** Mid-30s/40s, organized desk with multiple supplement bottles, slight tech vibe.
- **Title:** `You built the "perfect" supplement stack.`
- **Expanded:**
  ```
  More products can mean more overlap, timing conflicts, and diminishing
  returns. We help you see the stack as a system.
  ```
- **What PharmaGuide checks:** Ingredient overlap, redundancy, timing conflicts, stack-level insights.
- **Example flag:** `Multiple magnesium sources detected — redundancy review`

---

## Your Fit

**Renamed from "FitScore"** — the personal assessment is now qualitative
(Excellent / Good / Limited / Concerning / Not recommended). PharmaGuide
does TWO reads on every product: objective Quality + personal Fit.

**Eyebrow:**
```
Your Fit
```

**Headline:**
```
What's high quality for one person
may deserve a second look for another.
```
(Line 2 in italic Newsreader serif — site's punchline rhythm.)

**Subheadline:**
```
PharmaGuide gives you two reads on every product —
objective quality, and personal fit.
```

**Italic-serif callback line:**
```
Quality is what's in the bottle.
Fit is everything around it.
```
Direct callback to the Problem section's "A label tells you what's in
the bottle. Not what happens with your other bottles." Closes the loop.

**Visual — single dual-assessment card:**
```
┌─────────────────────────────────────┐
│ Magnesium Glycinate · 200 mg        │  ← product label
│                                      │
│ QUALITY                          89  │  ← counts 0→89, bar fills
│ ████████████████████████░░░          │
│ Excellent quality · 3rd-party tested │
│                                      │
│ ─────────────────────────────────── │  ← divider draws in
│                                      │
│ YOUR FIT                             │
│ ● Good fit                           │  ← pill in severity-safe color
│                                      │
│   • 2 timing notes                   │  ← stagger in
│   • 1 interaction to review          │
│   • No major conflicts detected      │
│                                      │
│ PERSONALISED TO YOUR STACK · UPDATED │  ← footer attribution
└─────────────────────────────────────┘
```

**Animation choreography:**
- T=0       card fades in
- T=200ms   quality bar fills + score counts 0→89 (1200ms easeOutCubic)
- T=1400ms  divider draws in horizontally
- T=1600ms  Your Fit badge slides up
- T=1900ms  notes stagger in (100ms between)
- T=2500ms  footer attribution fades in

---

## Trust Block

**Headline:**
```
Built to explain uncertainty — not hide it.
```

**Subheadline:**
```
If evidence is weak, conflicting, or incomplete, we say so directly.
```

### Three trust cards

**Card 1 — Evidence-graded**
```
Each interaction includes the strength of supporting
evidence where available.
```

**Card 2 — AI-assisted. Human-reviewed.**
```
Educational content and interaction logic are reviewed
for accuracy, clarity, and safety framing.
```

**Card 3 — Privacy is part of the architecture.**
```
Your stack and health context are designed
to stay under your control.
```

### What we don't do (4 restraint cards)

```
✕ We don't diagnose conditions.
✕ We don't replace your clinician.
✕ We don't tell you to stop medications.
✕ We don't sell your health data.
```

### Freshness signal (tiny, bottom of section)

```
Catalog updated weekly · Interaction reviews added regularly
```

---

## Final CTA

**Social proof slot (designed, hidden via CSS until populated):**
```
Joining 1,200+ early members · Advised by [Dr. Name, PharmD]
```

**Headline:**
```
Opening in waves.
```

**Subheadline:**
```
Join the beta and be among the first to use PharmaGuide
as we prepare for launch.
```

**Form:**
```
[ your@email.com                                    ]
[ Optional: what supplements or medications         ]
[ do you currently take?                            ]
[ e.g. magnesium glycinate, vitamin D, metformin    ]

[ Request early access → ]
```

**Trust note (small, below form):**
```
Free during beta. No spam. We will never sell your health data.
```

**Disclaimer (smaller, muted, bottom):**
```
PharmaGuide is not a replacement for medical care.
It's a clearer way to understand what may deserve a second look.
```

**FAQ link (very small):**
```
More questions? Read the FAQ →
```

---

## Footer

### Column 1 — Brand
```
PharmaGuide
Supplement intelligence.

Boston, MA
info@pharmaguide.io
```

### Column 2 — Product
- How It Works
- Methodology
- Blog
- FAQ

### Column 3 — Company
- About
- Contact
- Press

### Column 4 — Legal
- Privacy
- Terms
- Accessibility

### Bottom row
```
Evidence-graded · On-device analysis · Privacy-first · Clinician-informed
© 2026 PharmaGuide
```

---

## Voice rules

1. **Second-person preferred.** "You take a stack" > "Users take a stack".
2. **Use "we", not "PharmaGuide" mid-sentence.** Reads more human.
3. **No exclamation marks.** Confidence > excitement.
4. **No "AI-powered", "revolutionary", "game-changing".** Empty signal.
5. **Concrete numbers > adjectives.** "180,000 products" > "comprehensive database".
6. **Admit limits.** "If evidence is weak, we say so." > "Always accurate."
7. **Restraint > emphasis.** No bold-everywhere, no all-caps shouting.

## Banned words (will get rewritten)

- AI-powered / AI-driven
- Revolutionary / Game-changing / Cutting-edge
- Seamless / Frictionless
- Empower / Empowering
- Holistic / Comprehensive (when generic)
- Trusted (when unproven — earn it instead)
- Best-in-class / World-class
- Synergy / Synergistic
