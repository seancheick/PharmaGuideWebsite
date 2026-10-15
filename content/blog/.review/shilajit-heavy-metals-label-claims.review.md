# Review: shilajit-heavy-metals-label-claims

**Generated:** 2026-10-15
**Risk Score:** 59/100 — Moderate
**Category:** ingredient-spotlights
**Evidence Level:** Moderate
**Review required:** yes
**Reviewer assigned:** PENDING

> 🟡 **MODERATE RISK (59/100).** Draft permitted with `review_required: true`. A PharmD must sign off and add `reviewer:` to frontmatter before `pnpm blog:publish-check` will pass. Key review targets: the animal-only toxicity framing (§"Is shilajit bad for your kidneys or liver?"), the pregnancy/child lead caution, and the testosterone FAQ.

## Risk Score computation

| Factor | Weight | Finding | Points |
|---|---|---|---|
| Evidence strength (avg across 13 claims) | 30% | 11 Moderate (15), 1 Strong (0), 1 Limited (25) → avg 14.6 | 4.4 |
| WEAK or UNVERIFIABLE claims | 25% | 3 (1 WEAK in draft, 2 UNVERIFIABLE dropped) | 25 |
| Drug interaction warnings present | 15% | No verified drug-interaction claim; scoped out of post | 0 |
| Pregnancy / nursing cautions | 15% | Yes — WHO lead guidance, `<Callout tone="warn">` | 15 |
| Conflicting studies / contradictions | 15% | Yes — metals "below limits except in few studies"; tolerated acutely vs tissue changes | 15 |
| **Total** | | | **59** |

## Claim audit

| # | Claim | Status | Source(s) | Evidence | In draft? |
|---|---|---|---|---|---|
| 1 | Shilajit's chemical composition "is not known with certainty"; no complete chemical analysis published; source disputed | VERIFIED | [2] | Moderate | Yes |
| 2 | Compositions differ substantially between regions | VERIFIED | [2] | Moderate | Yes |
| 3 | ~65 metals reported in shilajit, including Cu, Al, Pb, As, Cd, Hg | VERIFIED | [1] | Moderate | Yes |
| 4 | WHO/FDA herbal-product ceilings: Cd 0.20–0.30 ppm, Hg 1 ppm, As 10 ppm, Pb 10 ppm, Cu 20 ppm, Zn 50 ppm | VERIFIED | [1] | Moderate | Yes (table) |
| 5 | Reported levels "lower than the permissible limits set by WHO and FDA, except in few studies where exceeded levels were reported" | VERIFIED | [1] | Moderate | Yes (both halves) |
| 6 | "Shilajit consumption without knowing permissible levels of metals is not safe and could pose serious health problems" | VERIFIED | [1] | Moderate | Yes (quoted) |
| 7 | Commercial Indian/Pakistani shilajit analysed by LIBS/ICP/EDX contained Pb, As, Hg, Cr, Ni among ~23 elements | VERIFIED | [3] | Moderate | Yes |
| 8 | Marker compounds (fulvic acid, hippuric acid, urolithin A) require HPLC/HPTLC/LC-MS to quantify | VERIFIED | [5] | Moderate | Yes (FAQ) |
| 9 | Rodent acute oral LD50 > 2000 mg/kg; no mortality, clinical signs, or weight/intake changes over 14 days | VERIFIED | [4] | Moderate (animal) | Yes |
| 10 | Histopathology: "mild to moderate degenerative and necrotic changes in hepatic and renal tissues," no fibrosis/pronounced renal lesions | VERIFIED | [4] | Moderate (animal) | Yes |
| 11 | Authors: findings "do not exclude tissue effects or establish their reversibility"; long-term studies warranted | VERIFIED | [4] | Moderate | Yes (quoted) |
| 12 | Exploratory follow-up of the 2 highest-testosterone samples: total/free testosterone ~2.5× / ~3.5× vs control | WEAK | [4] | Limited (animal, exploratory, 2 samples) | Yes — `<EvidencePill level="Limited">` + explicit caveats |
| 13 | Antioxidant activity varied ~2–4× across samples; only samples 6 and 7 rich in urolithin A / phenolic acids | VERIFIED | [4] | Moderate | Yes |
| 14 | No safe lead level known; children absorb 4–5× adult dose; bone lead released in pregnancy exposes fetus; linked to reduced fetal growth and preterm birth | VERIFIED | [6] | Strong | Yes |
| 15 | 6 CAERS reports name shilajit; 3 serious outcomes (2 hospitalisation, 1 life-threatening); reactions cluster allergic | VERIFIED | [7] | Moderate | Yes, framed as voluntary reports, no causation |
| 16 | 2 all-time FDA food recalls name shilajit; neither for heavy metals (2026 under-processing/C. botulinum + unlawful claim; 2014 supplier powder) | VERIFIED | [8] | Moderate | Yes |
| 17 | "4,000 mg" on most shilajit gummies is really ~400 mg of a 10:1 extract | UNVERIFIABLE | — (r/ShilajitBenefits, self-disclosed brand owner) | — | **No — dropped.** Prevalence unsourceable. Replaced with a sourced explanation of extract-ratio labelling and a Supplement Facts instruction. |
| 18 | An "87% fulvic acid" claim is chemically impossible for authentic shilajit | UNVERIFIABLE | — (Reddit) | — | **No — dropped.** Answered instead via [5]: the figure needs an assay method and lab report to mean anything. |

**Note on claims 17–18:** both originated as `/pg-trends` social signals, which are demand indicators, never facts. They set two H2/FAQ questions; the answers come from the literature, not from the posts.

## SEO package

- **Focus keyword:** shilajit heavy metals
- **Secondary keywords:** is shilajit safe, is shilajit bad for kidneys, shilajit fulvic acid percentage, shilajit label 4000 mg, shilajit certificate of analysis, is shilajit legit
- **Suggested title (≤60ch):** Shilajit: what's actually in the bottle (38)
- **Meta description (≤155ch):** Shilajit's composition changes with the rock it came from. What metal testing found, what "4,000 mg" means, and how to read a lab report. (139)
- **Non-commodity hook:** The strongest existing page on this topic covers USP daily limits and how to read a COA, but never explains *why* a single COA tells you so little — that the peer-reviewed chemistry says shilajit's composition "is not known with certainty" and varies by region — and cites none of the WHO/FDA ppm ceilings, the 2026 animal histopathology, or FDA's own adverse-event and recall records. This post is the first to join label math, compositional variability and FDA's primary records in one place.
- **Schema type:** Article + FAQPage (5 `###` questions under `## Frequently asked questions`)
- **Fan-out queries covered:**
  1. "is shilajit safe"
  2. "does shilajit contain heavy metals"
  3. "what does 4000 mg shilajit mean"
  4. "is shilajit bad for your kidneys"
  5. "can you trust fulvic acid percentage shilajit"
  6. "is shilajit fda approved"

## Questions answered

| H2 / FAQ question (reader's wording) | Where the question came from |
|---|---|
| Is shilajit safe? | pg-trends autocomplete ("is shilajit safe", 100/100 kept) |
| What is shilajit, and why does every batch differ? | Derived from [2]; Reddit review thread questioning an "87% fulvic acid" claim (r/ShilajitBenefits) |
| Does shilajit contain heavy metals? | pg-trends Reddit — "heavy metals detected in blood work" (r/Supplements, 29↑/43 comments); TikTok @doctor.azad (191 shares / 18.9k plays) |
| What does "4,000 mg" on a shilajit label actually mean? | pg-trends Reddit — "Did you know '4,000 mg' … is really about 400 mg?" (r/ShilajitBenefits) |
| Is shilajit bad for your kidneys or liver? | pg-trends autocomplete — "is shilajit good for kidneys", "is shilajit bad for kidneys", "can shilajit help your kidneys" |
| Who should be most careful? | WHO lead guidance [6]; CAERS allergic cluster [7] |
| How to read a shilajit lab report | Phase 1b gap — competitor covers COA reading; none connect it to batch variability |
| FAQ: Is shilajit legit? | pg-trends autocomplete — "is shilajit legit" |
| FAQ: Can you trust a "fulvic acid" percentage? | pg-trends Reddit — "87% fulvic acid" review thread |
| FAQ: Does shilajit raise testosterone? | pg-trends autocomplete — "does shilajit increase testosterone", "can shilajit boost testosterone"; r/Testosterone thread |
| FAQ: Is shilajit FDA approved? | pg-trends autocomplete — "is shilajit legit"; competitor FDA-status section |

## pg-trends coverage table (as run 2026-10-15, 30-day window)

| Source | Status | Returned | Kept | Note |
|---|---|---|---|---|
| Google autocomplete | ok | 100 | 100 | strongest question signal |
| Wikipedia interest | ok | 60 | 1 | 13,140 views, **−14%** vs prior 30 days — flat-to-declining, not a spike |
| Reddit | ok | 1702 | 9 | free Arctic Shift sweep of r/Supplements, `--pages 22` |
| TikTok | error | 0 | 0 | ScrapeCreators credits exhausted (HTTP 402) |
| Instagram | error | 0 | 0 | same |
| YouTube | ok | 50 | 47 | free YouTube Data API v3 |
| X (via Exa) | ok | 0 | 0 | no coverage — not evidence of silence |
| News and web (Exa) | ok | 25 | 20 | competitors are "10 Best" listicles plus one COA explainer |
| Hacker News | ok | 3 | 0 | |
| PubMed | ok | 1 | 1 | PMID 42797531 |
| FDA adverse events (CAERS) | ok | 6 | 3 | all time, not windowed |
| FDA recalls | empty | 0 | 0 | none in window; 2 all-time |

**Thin-scan disclosure:** TikTok and Instagram returned nothing (exhausted paid credits), so the social-format signal for this post rests on an earlier run. X returned zero results through Exa, which means no coverage rather than no conversation.

## Image prompts

All slots are inline SVG. Risk Score 59 > 30, so editorial-photo mode is disabled per the image policy; `GEMINI_API_KEY` was not used.

| Slot | Mode | Prompt (subject, composition, palette) | Caption takeaway |
|---|---|---|---|
| Hero | illustration | Two-column comparison card. Left "On the label": milligram total, fulvic acid %, origin story, "third-party tested" — each with a muted sub-line saying why a buyer can't check it. Right "On the batch lab report": Pb/As/Cd/Hg in ppm, batch number, accredited lab. Background `#FAF9F6`, right panel recessed `#F4F2EE`, accent `#183B3F`, generous whitespace, no gradients. | What the label claims is not what a lab report measures |
| §2 | illustration | Two rock-source boxes on the left flowing right into "different trace metals" and "different markers", both converging on one dark teal box reading "Same label text: Pure Himalayan Shilajit". Dashed convergence lines in `#94a3b8`. | Provenance drives composition; the label can't carry it |
| §3 | illustration | Horizontal equation: [result in ppm] × [grams per day] = [micrograms per day], final box filled `#183B3F` with inverted text. Three muted footnotes on unusable report formats. | ppm × grams/day = µg/day, the only comparable number |
| §4 | illustration | Left box "4,000 mg — raw-material equivalent — FRONT OF BOTTLE"; arrow labelled "10:1 concentration"; right box "400 mg — extract actually present — SUPPLEMENT FACTS"; third teal box "Quote this one". | An extract ratio turns one number into two |
| §7 | illustration | Three-step decision ladder: certificate for this batch? → reports numbers? → do the daily arithmetic. Red `#b4341f` "No →" branches with consequences; final step filled teal with green "Then →". | A decision path you can run in a shop |

**Gap vs target:** category target for a 1,900–2,600-word deep dive is 6–8 visuals; this post ships 5. A sixth slot worth adding on review: an evidence scorecard for the animal toxicity section (acute tolerability = reassuring / tissue findings = unresolved / long-term = unknown), mirroring the `statins-and-coq10` scorecard pattern.

## Internal-link checklist

- [x] At least 3 internal links — `/methodology/`, `/blog/medication-depletion-guide`, `/blog/statins-and-coq10`
- [x] At least 1 link to another blog post — two
- [x] Anchor text natural, not keyword-stuffed ("assess evidence and product quality", "medication depletion guide", "statins and CoQ10")

## Scans

- Banned marketing words: **PASS**
- Banned medical-advice phrases: **PASS**
- Brand-recommendation phrases: **PASS** (LIQUID BLENZ CORP is named only in factual FDA-recall context, which the voice guide permits)
- Unsupported superlatives: **PASS**
- Academic connectives: **PASS**
- URL check (`pnpm blog:validate`): **PASS** — all 8 sources resolve; no fda.gov page URLs used because they return 503 to the validator's HEAD request, so openFDA API endpoints (`api.fda.gov`, authoritative via `fda.gov`) are cited instead
- PubMed identity check: **PASS** after correction — first-pass draft mislabelled 4 of 5 first authors; all now match the `efetch` record (Hussain A, Kamgar E, Aldakheel RK, Rizun N, Kohli HK)

## Outstanding warnings (3) and disposition

1. `reviewer-invariants` — **expected.** `review_required: true` with no reviewer. Blocks `publish-check` by design until PharmD sign-off.
2. `readability: 1 paragraph exceeds 5 sentences` — **validator artifact.** The offending "paragraph" is the `<Sources>` component block. `checkReadability()` strips content from a `## Sources` *markdown heading* onward, but the component contract mandates the `<Sources>` component instead, so the stripper never fires. Affects all 3 posts that use `<Sources>`.
3. `readability: 3 sentences exceed 40 words` — **validator artifact.** All three are splitter artifacts, not run-on prose: (a) the markdown ppm table counts as one 94-word "sentence" since table rows contain no sentence-ending punctuation; (b) a sentence ending `."` isn't split because the period is followed by a quote mark rather than whitespace; (c) a `<Source>` chip ending in `)` merges into the next paragraph. Prose left as written.

## Image-mode summary

| Slot | Mode | File / Component |
|---|---|---|
| Hero | illustration | inline `<Illustration>` — label vs lab report |
| §2 | illustration | inline `<Illustration>` — provenance → composition |
| §3 | illustration | inline `<Illustration>` — ppm → µg/day |
| §4 | illustration | inline `<Illustration>` — extract-ratio math |
| §7 | illustration | inline `<Illustration>` — COA decision path |
| Card image | reused asset | `/images/moments/recall.jpg` (existing editorial asset; nothing generated) |

## Next steps

1. **Assign a PharmD reviewer** and add `reviewer: "<person-id>"` to frontmatter — must be a `PersonId` from `src/lib/people.ts` (`laurie-pham` or `miriam-farez`), not a display name. Add `reviewed_at` on sign-off.
2. Reviewer focus: (a) is the animal-only toxicity framing adequately hedged in "Is shilajit bad for your kidneys or liver?"; (b) is the pregnancy/child lead caution proportionate; (c) is the testosterone FAQ sufficiently caveated as 2 samples in rats.
3. Consider the sixth illustration noted above.
4. Re-run `pnpm blog:validate` then `pnpm blog:publish-check` after the reviewer field lands.
5. `pnpm dev` and eyeball `/blog/shilajit-heavy-metals-label-claims` — check all 5 SVGs scale and read in both light and dark mode.
6. Pair with `/pg-social-mdx` for the carousel. Lead with the extract-ratio reveal; the "composition is not known with certainty" line is the second slide.

## Sources

1. Hussain A, et al. (2024). *Hazardous or Advantageous: Uncovering the Roles of Heavy Metals and Humic Substances in Shilajit (Phyto-mineral) with Emphasis on Heavy Metals Toxicity and Their Detoxification Mechanisms.* Biol Trace Elem Res — https://pubmed.ncbi.nlm.nih.gov/38393486/
2. Kamgar E, et al. (2025). *A Comprehensive Review on Shilajit: What We Know about Its Chemical Composition.* Crit Rev Anal Chem — https://pubmed.ncbi.nlm.nih.gov/38133965/
3. Aldakheel RK, et al. (2022). *Rapid Determination and Quantification of Nutritional and Poisonous Metals in Vastly Consumed Ayurvedic Herbal Medicine (Rejuvenator Shilajit) by Humans Using Three Advanced Analytical Techniques.* Biol Trace Elem Res — https://pubmed.ncbi.nlm.nih.gov/34800280/
4. Rizun N, et al. (2026). *Biogeochemical Evaluation of Shilajit: Testosterone-Modulating Effects, In Vivo Toxicity and Lipid Profile Analysis.* Pharmaceuticals (Basel) — https://pubmed.ncbi.nlm.nih.gov/42797531/
5. Kohli HK, et al. (2026). *Shilajit-analytical study to understand the phyto complex present in shilajit raw material, extract and resin by using hyphenated techniques.* J Chromatogr A — https://pubmed.ncbi.nlm.nih.gov/41330163/
6. World Health Organization. *Lead poisoning and health* — https://www.who.int/news-room/fact-sheets/detail/lead-poisoning-and-health
7. FDA CAERS. *Adverse event reports naming shilajit* — https://api.fda.gov/food/event.json?search=products.name_brand:%22shilajit%22
8. FDA enforcement reports. *Recalls naming shilajit* — https://api.fda.gov/food/enforcement.json?search=product_description:%22shilajit%22
