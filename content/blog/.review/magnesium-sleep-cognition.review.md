# Review: magnesium-sleep-cognition

**Generated:** 2026-06-19
**Revised:** 2026-06-20 (clinical reviewer feedback applied — 10 fixes)
**Risk Score:** 45/100 — Moderate
**Category:** ingredient-spotlights
**Evidence Level:** Limited-to-Moderate
**Review required:** yes
**Reviewer assigned:** PENDING

> ⚠️ Moderate risk — PharmD review required before publishing

## Clinical reviewer fixes applied

1. "Deficiency" vs "low intake" language throughout — opening, H2 headings, body text
2. Serum test wording softened ("can miss" not "won't catch") + acknowledged clinical utility
3. Evidence level downgraded to Limited-to-Moderate; sleep section reframed with effect size (Cohen's d = 0.2)
4. Supplemental UL of 350 mg/day added; dosing recommendations lowered to 100–200 mg start
5. Medication spacing corrected: bisphosphonates 2h, antibiotics 2h before/4–6h after, levothyroxine 4h
6. Cognition evidence pill changed from "Established" to "Mechanistic"; heading reworded
7. Magtein section: Threotech funding disclosure expanded, "brain age" metric caveated, Raven's null result + Oura null result added
8. Glycinate and threonate claims softened; FAQ rewritten to avoid "best" superlative
9. Magnesium oxide 4% claim sourced (Firoz & Graber 2001, PMID 11794633); soil depletion claim removed (unsourced)
10. Three missing sources added: Chen 2024 cognitive SR/MA (PMID 39009081), Al-Kum 2026 Palestinian study (PMID 41877271), Firoz 2001 oxide bioavailability (PMID 11794633)

## Claim audit

| # | Claim | Status | Source(s) | Evidence | In draft? |
|---|---|---|---|---|---|
| 1 | ~50% of Americans consume below Mg EAR (intake, not clinical deficiency) | VERIFIED | [1] PMID 22364157 + NIH ODS | Strong | Yes |
| 2 | <1% of body Mg in serum; serum test can miss low body stores | VERIFIED | [2] PMC6163803 + NIH ODS | Strong | Yes |
| 3 | Magnesium involved in 300+ enzymatic reactions | VERIFIED | NIH ODS fact sheet | Strong | Yes |
| 4 | Mg L-threonate improved cognitive metrics in 6-week RCT (100 adults) | SUPPORTED | [5] Frontiers 2026 | Limited (single RCT, industry-funded, mixed results) | Yes (with extensive caveats) |
| 5 | Magnesium supplementation modestly improves insomnia severity | SUPPORTED | [3] PMID 35184264, [4] PMID 40918053 | Limited-to-Moderate (d=0.2) | Yes (with effect size) |
| 6 | RCT evidence for Mg supplementation improving cognition insufficient | VERIFIED | [7] PMID 39009081 | Strong (negative finding) | Yes |
| 7 | PPIs and diuretics deplete magnesium | VERIFIED | NIH ODS + FDA safety comms | Strong | Yes |
| 8 | Mg modulates GABA receptors and HPA axis | VERIFIED | NIH ODS + multiple reviews | Strong (mechanistic) | Yes |
| 9 | Different Mg forms have different absorption profiles | SUPPORTED | [9] PMID 11794633 + NIH ODS | Moderate | Yes |
| 10 | Threonate "crosses BBB via glucose transporters" | WEAK | Animal data; no human comparative BBB study | Limited | Yes (framed as "proposed mechanism") |
| 11 | Supplemental Mg UL is 350 mg/day for adults | VERIFIED | NIH ODS | Strong | Yes |

## SEO package

- **Focus keyword:** magnesium sleep cognition
- **Secondary keywords:** magnesium low intake, magnesium glycinate vs threonate, magnesium for brain fog, magnesium for sleep, magnesium supplement forms
- **Suggested title (≤60ch):** Magnesium for sleep and cognition: what works
- **Meta description (≤155ch):** Many Americans fall short on magnesium intake, and serum testing can miss low body stores. Here's what clinical research says about magnesium, sleep, and cognition.
- **Non-commodity hook:** Every nootropics guide ranks magnesium forms and moves on. None address the diagnostic gap (serum tests can miss low body stores) or the sleep→cognition pathway that makes magnesium's real value indirect.
- **Schema type:** Article + FAQPage (5 FAQ questions present)
- **Fan-out queries covered:**
  - "why can blood test miss magnesium" (H2: Why can a blood test miss low magnesium status?)
  - "does magnesium improve sleep" (H2: Does magnesium actually improve sleep?)
  - "magnesium for cognitive function evidence" (H2: Can magnesium improve cognitive function?)
  - "magnesium glycinate vs threonate" (H2: Which form of magnesium matters?)
  - "magnesium supplement dosing upper limit" (H2: How much magnesium do you need?)

## Internal-link checklist

- [x] /blog/medication-depletion-guide — cross-link to existing post (2 mentions)
- [x] /blog/magnesium-with-blood-pressure-medication — cross-link to BP interaction post (verify this post is published before this one goes live)
- [ ] Consider adding /methodology/ or /how-it-works/ link

## Scans

- Banned marketing words: PASS
- Banned medical-advice phrases: PASS
- Brand-recommendation phrases: PASS (Magtein/Threotech mentioned as study context with funding disclosure)
- Unsupported superlatives: PASS
- URL check: PASS (pnpm blog:validate)

## Image-mode summary

| Slot | Mode | File / Component |
|---|---|---|
| Section 2 (blood test gap) | illustration | inline `<Illustration>` — body magnesium distribution |
| Section 5 (form comparison) | illustration | inline `<Illustration>` — form comparison table |

## Next steps

1. ~~Run `pnpm blog:validate magnesium-sleep-cognition`~~ DONE — passed
2. Open `/blog/magnesium-sleep-cognition` in `pnpm dev` and visually inspect
3. Assign a PharmD reviewer and add `reviewer: "<Name, PharmD>"` to frontmatter
4. Run `pnpm blog:publish-check magnesium-sleep-cognition` before committing
5. Consider adding editorial photo for hero (lifestyle/kitchen counter)
6. Verify `/blog/magnesium-with-blood-pressure-medication` is published or adjust cross-link

---

## Verified sources

1. https://pubmed.ncbi.nlm.nih.gov/22364157/ — Rosanoff 2012, suboptimal Mg status in US
2. https://pmc.ncbi.nlm.nih.gov/articles/PMC6163803/ — Costello 2018, challenges in Mg diagnosis
3. https://pubmed.ncbi.nlm.nih.gov/35184264/ — Cao 2022, Mg and sleep systematic review
4. https://pubmed.ncbi.nlm.nih.gov/40918053/ — Mg bisglycinate sleep RCT 2025
5. https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2025.1729164/full — Magtein RCT 2026
6. https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/ — NIH ODS Magnesium fact sheet
7. https://pubmed.ncbi.nlm.nih.gov/39009081/ — Chen 2024, Mg cognitive health SR/MA
8. https://pubmed.ncbi.nlm.nih.gov/41877271/ — Al-Kum 2026, serum Mg and cognition in elderly
9. https://pubmed.ncbi.nlm.nih.gov/11794633/ — Firoz 2001, US Mg preparation bioavailability
