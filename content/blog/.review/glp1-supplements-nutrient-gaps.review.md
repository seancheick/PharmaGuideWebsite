# Review: glp1-supplements-nutrient-gaps

**Generated:** 2026-05-15
**Risk Score:** 29/100 — Low
**Category:** health-education
**Evidence Level:** Moderate
**Review required:** no
**Reviewer assigned:** PENDING

> 🟢 Risk Score 29 — Low band. Auto-draft permitted. No review gate.

## Claim audit

| # | Claim | Status | Source(s) | Evidence | In draft? |
|---|---|---|---|---|---|
| 1 | GLP-1s reduce caloric intake by 16–39% | SUPPORTED | [1, 5, 11] | Moderate | Yes (with qualifier) |
| 2 | ~13% develop deficiencies in 6mo, ~22% in 12mo | SUPPORTED | [1] | Moderate | Yes (with qualifier "roughly") |
| 3 | Common deficiencies: D, B12, iron, magnesium, zinc | VERIFIED | [1, 2, 3, 5, 10] | Strong | Yes |
| 4 | 49% higher vitamin D deficiency risk vs other diabetes meds | SUPPORTED | Registry analysis | Moderate | Yes (with qualifier) |
| 5 | GLP-1s slow gastric emptying, delaying oral absorption | VERIFIED | FDA labeling | Strong | Yes |
| 6 | 30–40% experience GI symptoms during dose escalation | SUPPORTED | [6] | Moderate | Yes |
| 7 | Ginger helps with GLP-1 nausea | SUPPORTED | [6], clinical practice | Moderate | Yes (with qualifier) |
| 8 | B6 25–50mg for nausea (pregnancy protocol analogy) | WEAK | Pregnancy literature, applied | Limited | Yes (with EvidencePill "Limited" + explicit caveat) |
| 9 | Protein 1.2–1.6g/kg/day recommended for lean mass | VERIFIED | [4, 7, 8] | Strong | Yes |
| 10 | 88% of GLP-1 users under-consume protein (avg 0.6g/kg) | SUPPORTED | ECO 2025 study | Moderate | Yes (rounded/softened) |
| 11 | Lean mass loss associated with GLP-1 therapy | SUPPORTED | [7, 8] | Moderate (mixed) | Yes (with context) |
| 12 | Avoid St. John's Wort with GLP-1s (CYP induction) | SUPPORTED | Clinical pharmacology refs | Moderate | Yes |

## Risk Score computation

| Factor | Weight | Raw | Contribution |
|---|---|---|---|
| Evidence strength (avg: 3×Strong + 8×Moderate + 1×Limited) | 30% | 12.1 | 3.6 |
| WEAK/UNVERIFIABLE count (1) | 25% | 10 | 10 |
| Drug interaction warnings | 15% | Yes | 15 |
| Pregnancy/nursing cautions | 15% | No | 0 |
| Conflicting studies | 15% | No | 0 |
| **Total** | | | **29** |

## SEO package

- **Focus keyword:** GLP-1 supplements nutrient gaps
- **Secondary keywords:** semaglutide supplements, tirzepatide nutrient deficiency, Ozempic vitamins, GLP-1 protein intake, GLP-1 side effects supplements
- **Suggested title (≤60ch):** GLP-1 Meds & Supplements: Nutrient Gaps to Know
- **Meta description (≤155ch):** GLP-1 medications suppress appetite — and nutrient intake. Here's what the research says about vitamin gaps, protein needs, and which supplements to discuss.
- **Schema type:** Article

## Internal-link checklist

- [x] /methodology/ — evidence framing paragraph
- [x] /blog/medication-depletion-guide — B12 cross-reference
- [x] /how-it-works/ — interaction checking context (×2 mentions)

## Scans

- Banned marketing words: PASS
- Banned medical-advice phrases: PASS
- Brand-recommendation phrases: PASS
- Unsupported superlatives: PASS
- URL check: pending `pnpm blog:validate`

## Image-mode summary

| Slot | Mode | File / Component |
|---|---|---|
| Section 2 (nutrients) | illustration | inline `<Illustration>` — nutrient gap chart SVG |

## Next steps

1. Run `pnpm blog:validate glp1-supplements-nutrient-gaps` to verify
2. Open `/blog/glp1-supplements-nutrient-gaps` in `pnpm dev` and visually inspect
3. Run `pnpm blog:publish-check glp1-supplements-nutrient-gaps` before committing
4. Run `pnpm typecheck` and `pnpm build` for final compilation gate

## Source URLs

1. https://pubmed.ncbi.nlm.nih.gov/41549912/
2. https://pubmed.ncbi.nlm.nih.gov/40584822/
3. https://pubmed.ncbi.nlm.nih.gov/41373949/
4. https://pubmed.ncbi.nlm.nih.gov/40445127/
5. https://pubmed.ncbi.nlm.nih.gov/40352260/
6. https://pmc.ncbi.nlm.nih.gov/articles/PMC12992036/
7. https://www.amjmed.com/article/S0002-9343(26)00162-2/fulltext
8. https://pubmed.ncbi.nlm.nih.gov/41022269/
9. https://www.fda.gov/drugs/postmarket-drug-safety-information-patients-and-providers/fdas-concerns-unapproved-glp-1-drugs-used-weight-loss
10. https://ods.od.nih.gov/
11. https://nutritioncare.org/
