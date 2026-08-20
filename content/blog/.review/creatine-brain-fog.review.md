# Review: creatine-brain-fog

**Generated:** 2026-06-16
**Risk Score:** 53/100 — Moderate
**Category:** ingredient-spotlights
**Evidence Level:** Limited-to-Moderate
**Review required:** yes
**Reviewer assigned:** PENDING

> Risk Score 53 — Moderate band. Draft generated with `review_required: true`. PharmD sign-off required before publish.

## Claim audit

| # | Claim | Status | Source(s) | Evidence | In draft? |
|---|---|---|---|---|---|
| 1 | Creatine acts as phosphocreatine energy buffer in brain | VERIFIED | [2, 3] | Strong | Yes |
| 2 | Meta-analysis: significant positive effects on memory (16 RCTs, 492 participants) | VERIFIED | [1] | Moderate | Yes |
| 3 | 3-5g daily is the standard effective dose | VERIFIED | [3] | Strong | Yes |
| 4 | Creatine partially buffers cognitive decline during sleep deprivation | SUPPORTED | [4] | Moderate | Yes |
| 5 | Vegetarians have lower baseline creatine; may benefit more cognitively | SUPPORTED | [2] | Mixed | Yes (with Mixed pill) |
| 6 | Women have 70-80% lower endogenous creatine stores | VERIFIED | [5] | Moderate | Yes |
| 7 | Creatine monohydrate is the most studied form | VERIFIED | [3] | Strong | Yes |
| 8 | Generally well-tolerated; no kidney harm in healthy adults at standard doses | VERIFIED | [3] | Strong | Yes |
| 9 | Older adults may benefit from creatine for cognition | SUPPORTED | [6] | Limited | Yes (with Limited pill) |
| 10 | Loading phase optional; daily dosing works for saturation | VERIFIED | [3] | Strong | Yes |
| 11 | One 2009 study found DHT increase; no hair loss measured, not replicated | WEAK | [3] | Limited | Yes (with Limited pill + caveat) |
| 12 | Post-viral fatigue benefit from creatine | UNVERIFIABLE | — | — | **No — dropped** |

## SEO package

- **Focus keyword:** creatine for brain fog
- **Secondary keywords:** creatine cognitive function, creatine monohydrate brain, creatine mental fatigue, creatine sleep deprivation
- **Suggested title (<=60ch):** Creatine for brain fog: what the evidence supports
- **Meta description (<=155ch):** Creatine is studied for cognitive function, not just muscle. Here's what the trials say about brain fog, who benefits, dosing, and what it won't fix.
- **Non-commodity hook:** Every existing article treats creatine-for-brain-fog as a nootropic shopping guide. This post leads with the differential — brain fog has a cause, and creatine only addresses the energy-squeeze subset.
- **Schema type:** Article + FAQPage (FAQ section with 5 questions)
- **Fan-out queries covered:**
  1. "How does creatine work in the brain?" — H2 directly answers
  2. "Does creatine actually help brain fog?" — H2 directly answers
  3. "What creatine won't fix" — H2 directly answers (rare in competitors)
  4. "How to take creatine for cognitive support" — H2 with dose/form/timeline
  5. "Is creatine safe?" — H2 with kidney myth, hair myth

## Internal-link checklist

- [x] `/methodology/` — linked in FAQ and closing section
- [x] `/how-it-works/` — linked in closing section
- [x] `/blog/medication-depletion-guide` — cross-linked in "What creatine won't fix" section
- [x] 3+ internal links total: yes (3)

## Scans

- Banned marketing words: PASS
- Banned medical-advice phrases: PASS
- Brand-recommendation phrases: PASS
- Unsupported superlatives: PASS
- URL check: pending (`pnpm blog:validate`)

## Image-mode summary

| Slot | Mode | File / Component |
|---|---|---|
| Section 1 (mechanism) | illustration | inline `<Illustration>` — PCr energy buffer diagram |
| Hero | pending | editorial photo or summary illustration TBD after review |
| Section 3 (differential) | pending | decision-flow illustration TBD |
| Section 4 (dosing) | none | tables serve as visual break |
| Section 5 (safety) | none | text-only with callout |

## Next steps

1. Run `pnpm blog:validate creatine-brain-fog` to verify
2. Open `/blog/creatine-brain-fog` in `pnpm dev` and visually inspect
3. Assign a PharmD reviewer and add `reviewer: "Name, PharmD"` to frontmatter
4. Add hero image and additional illustrations (2-3 more visuals recommended for ingredient-spotlights depth)
5. Run `pnpm blog:publish-check creatine-brain-fog` before committing

## Source URLs (verified via PubMed E-utilities API)

1. https://pubmed.ncbi.nlm.nih.gov/39070254/ — Xu et al. 2024, meta-analysis
2. https://pubmed.ncbi.nlm.nih.gov/33578876/ — Roschel et al. 2021, brain health review
3. https://pubmed.ncbi.nlm.nih.gov/28615996/ — Kreider et al. 2017, ISSN position stand
4. https://pubmed.ncbi.nlm.nih.gov/21324203/ — Cook et al. 2011, sleep deprivation RCT
5. https://pubmed.ncbi.nlm.nih.gov/33800439/ — Smith-Ryan et al. 2021, women's health
6. https://pubmed.ncbi.nlm.nih.gov/40971619/ — Marshall et al. 2026, aging systematic review
7. https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/ — NIH ODS
