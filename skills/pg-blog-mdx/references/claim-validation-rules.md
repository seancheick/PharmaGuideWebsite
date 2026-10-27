# Claim Validation & Risk Score (new MDX pipeline)

This is the medical-credibility guard. Every post produced by `pg-blog-mdx` or repurposed by `pg-social-mdx` runs through claim validation before drafting. The Risk Score gates publishability.

Ported from `pg-social` Phase 2.5 (old WordPress system) and tightened for the new site.

---

## When this runs

In `pg-blog-mdx`: Phase 3 (after research, before risk gate)
In `pg-social-mdx`: Phase 2.5 (after intelligence extraction, before generation)

Both skills use this same matrix and scoring formula.

---

## The validation matrix

For each candidate claim extracted from research, assign one of five statuses:

| Status | Definition | Acceptable evidence qualifier | Action |
|---|---|---|---|
| **VERIFIED** | Exact quote found in source + cross-confirmed by independent source (PubMed, FDA, NIH ODS) | "Research shows" / "Evidence supports" | Use freely in MDX with `<Source>` chip |
| **SUPPORTED** | Source supports the claim with caveats; single RCT, observational study, or single high-quality review | "Studies suggest" / "Research indicates" | Use with evidence qualifier and `<Source>` chip |
| **WEAK** | Low-confidence evidence, observational only, small sample, conflicting findings | "Early research suggests" / "Preliminary evidence" / "Some studies indicate" | Use SPARINGLY with `<EvidencePill level="Limited">` chip + explicit caveat |
| **UNVERIFIABLE** | Cannot trace to a specific source passage; claim might be true but is not citable | None | **DROP from draft.** Do not include. |
| **CONTRADICTED** | PubMed / OpenFDA cross-check disagrees with the claim | None | **DROP from draft.** Flag in `.review.md` for human review. |

**The dropping rule is strict:** UNVERIFIABLE and CONTRADICTED claims do not appear in the body draft. They appear ONLY in the `.review.md` claim audit table for transparency.

---

## How to validate a claim

For each candidate claim:

1. **Find the source citation** that supposedly supports it
2. **Verify the URL** is real and the page exists
3. **Read the source's relevant passage** — extract the exact quote that supports the claim
4. **Cross-check** against an independent authoritative source (PubMed, OpenFDA, NIH ODS, DailyMed, Cochrane). If the claim involves:
   - **Dosing** → cross-check via PubMed for the most cited dosing study
   - **Drug interaction** → cross-check via DailyMed drug labeling
   - **Adverse event / recall** → cross-check via OpenFDA `/drug/enforcement.json` or `/drug/event.json`
   - **General efficacy** → cross-check via PubMed for systematic reviews or meta-analyses
5. **Assign status** per the matrix above
6. **Record** in `.review.md` claim audit table with: claim text, status, source number, evidence level

---

## API-driven cross-checking

The new pipeline has direct access to authoritative APIs. Use them.

### PubMed E-utilities (`PUBMED_API_KEY` in `.env`)

```bash
# esearch to find PMIDs
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=<query>&retmode=json&api_key=$PUBMED_API_KEY"

# efetch to get abstracts
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=<PMID>&retmode=xml&api_key=$PUBMED_API_KEY"
```

Use to: find systematic reviews and RCTs for any clinical claim, get abstracts to verify exact wording, confirm publication dates and journal.

### OpenFDA (`OPENFDA_API_KEY` in `.env`)

```bash
# Drug labels (mechanism, indications, contraindications, warnings)
curl "https://api.fda.gov/drug/label.json?search=openfda.generic_name:<drug>&api_key=$OPENFDA_API_KEY"

# Recalls (enforcement actions on supplements, drugs)
curl "https://api.fda.gov/drug/enforcement.json?search=product_description:<term>&api_key=$OPENFDA_API_KEY"

# Adverse events (FAERS)
curl "https://api.fda.gov/drug/event.json?search=patient.drug.openfda.generic_name:<drug>&api_key=$OPENFDA_API_KEY"
```

Use to: confirm FDA recall status, get exact recall lot numbers and reasons, verify drug labeling claims, retrieve FAERS adverse-event signals.

### NIH ODS Health Professional fact sheets

Not an API but the authoritative reference for vitamins/minerals. URLs follow:

```
https://ods.od.nih.gov/factsheets/<Nutrient>-HealthProfessional/
```

Examples that work: `CoenzymeQ10`, `Magnesium`, `VitaminB12`, `VitaminD`, `Iron`, `Calcium`, `Folate`, `Selenium`, `Zinc`.

### DailyMed (drug labels)

```
https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=<drug>
```

Use to: verify drug indications, contraindications, full prescribing information.

---

## Risk Score formula (0–100)

Computed at the end of claim validation. Five factors, weighted, summed, capped at 100.

| Factor | Weight | Calculation |
|---|---|---|
| Evidence strength (avg across claims) | 30% | Strong=0, Moderate=15, Limited=25, Mixed=30 |
| WEAK or UNVERIFIABLE claims count | 25% | 0 claims=0, 1=10, 2=20, 3+=25 |
| Drug interaction warnings present | 15% | No=0, Yes=15 |
| Pregnancy/nursing cautions | 15% | No=0, Yes=15 |
| Conflicting studies / contradictions found | 15% | No=0, Yes=15 |

Round to nearest integer. Score interpretation gates publishability:

| Score | Risk band | Pipeline action |
|---|---|---|
| **0–30** | Low | Auto-draft. `featured: false`, no `review_required` flag. |
| **31–70** | Moderate | Draft allowed. Set `review_required: true` in frontmatter. Banner in `.review.md`. Human PharmD must sign off before `pnpm blog:publish-check` passes. |
| **71–100** | High | **No body draft generated.** Output a research brief only at `content/blog/.briefs/<slug>.brief.md`. The topic requires human PharmD authorship. |

---

## Worked example

Topic: "Metformin and B12 depletion"

| # | Claim | Source | Validation | Evidence |
|---|---|---|---|---|
| 1 | Metformin reduces B12 absorption in long-term users | NIH ODS B12 fact sheet + multiple RCTs | VERIFIED | Strong |
| 2 | The mechanism involves calcium-dependent B12 uptake in the ileum | DailyMed metformin labeling | VERIFIED | Strong |
| 3 | 30% of long-term metformin users develop B12 deficiency | Cited from single observational study | SUPPORTED | Moderate (single source) |
| 4 | Methylcobalamin is more bioavailable than cyanocobalamin | PubMed has mixed RCT data | WEAK | Mixed |
| 5 | B12 deficiency from metformin can cause irreversible neuropathy | One review mentions; not strongly corroborated | UNVERIFIABLE | — |

**Compute risk:**

- Evidence avg: (Strong 0 + Strong 0 + Moderate 15 + Mixed 30) / 4 = 11 → 11/100 of 30% weight = ~3.3
- WEAK/UNVERIFIABLE count: 2 → 20% weight = 20
- Drug interaction warnings: Yes → 15
- Pregnancy cautions: Yes (metformin label includes them) → 15
- Conflicting studies: No → 0

**Risk Score: 3.3 + 20 + 15 + 15 + 0 = ~53** → **Moderate band** → write `.mdx` with `review_required: true`, drop claim 5 from the draft, label claim 4 with `<EvidencePill level="Limited">` and "early research suggests" qualifier.

---

## Editor sidecar — claim audit table

The `.review.md` includes the full audit for the human reviewer:

```markdown
## Claim audit

| # | Claim | Status | Source | Evidence | In draft? |
|---|---|---|---|---|---|
| 1 | Metformin reduces B12 absorption… | VERIFIED | [1, 2] | Strong | Yes |
| 2 | Mechanism: calcium-dependent ileal uptake | VERIFIED | [3] | Strong | Yes |
| 3 | ~30% of long-term users develop deficiency | SUPPORTED | [4] | Moderate | Yes (with qualifier) |
| 4 | Methylcobalamin > cyanocobalamin bioavailability | WEAK | [5] | Mixed | Yes (with EvidencePill "Limited") |
| 5 | Neuropathy can be irreversible | UNVERIFIABLE | — | — | **No — dropped** |
```

The reviewer can quickly see what's strongly evidenced, what's caveated, and what was dropped.

---

## Editorial qualifiers (must match validation status)

The exact phrasing inside the MDX maps from the validation status:

| Validation status | Use this language |
|---|---|
| VERIFIED + multiple RCTs | "Research shows" |
| VERIFIED + meta-analysis | "Evidence supports" |
| SUPPORTED | "Studies suggest" / "Research indicates" |
| WEAK | "Early research suggests" / "Preliminary evidence" / "Some studies indicate" |
| Mixed evidence across claims | "Results are mixed" / "Some studies show X while others…" |

Never say "proven" — that's an absolute claim no clinical literature actually supports. Never say "guaranteed."

---

## What this layer protects against

1. Fabricated studies — every claim must trace to a verifiable URL
2. Cherry-picking — Risk Score factors in conflicting studies
3. Over-confident dosing — dosing claims always get explicit sources
4. Drug interaction blindness — interaction-warning factor catches these
5. Pregnancy / pediatric blind spots — explicit factor
6. Sensational publishing — Risk Score ≥ 71 blocks the auto-draft path entirely
7. Brand sneak-ins — separately enforced by banned-brand validator rule

If validation is followed, the worst-case output is a too-cautious post. The skill never ships an under-evidenced one.

---

## Source integrity rules (HARD — never break)

These rules are enforced by both `pg-blog-mdx` and `pg-social-mdx`. A single fabricated source destroys PharmaGuide's credibility permanently.

### Rule 0 — Transcribe, never recall (the anti-hallucination rule)

**Fetching a record is not the same as reading it.** This is the rule that gets broken most, and
it does not feel like fabricating when it happens:

> You call the API. You get the real abstract. You write an accurate, well-hedged sentence. Then
> you type the author surname from memory, because you "know" this paper. The surrounding prose is
> correct, the citation is invented, and nothing in your own output looks wrong to you.

Fluent prose is not evidence that the identifiers in it are real. Confidence is not recall.

**Every author, title, year, journal, number, dose, sample size, population and quoted phrase must
be copied from the fetched response, in the same turn you write it.** Not from memory. Not from a
plausible pattern. Not from a search snippet. Not from what the title implies the paper found.

**The test:** if the value is not visible in your own tool output in this conversation, you do not
know it. Go print it.

**The procedure:**

1. Fetch the record (`efetch`, openFDA, or the page itself).
2. **Print the identity fields explicitly** — PMID, first author + initials, year, journal,
   exact title — as their own visible output. Do not skip this because the abstract is already
   on screen; the abstract and the author line are different fields.
3. Paste those exact strings into the draft. Copy, never retype.
4. For every number you attribute, paste the sentence from the abstract that contains it into the
   claim audit. No quote on screen, no VERIFIED.

**What this forbids specifically:**

- Guessing an author from a topic, a country, a journal or a co-author you remember.
- "Tidying" a title — shortening it, dropping a parenthetical like `(Phyto-mineral)`, removing the
  trailing period, or fixing its punctuation. Titles are matched character-for-character.
- Reconstructing a PMID, DOI or URL from a pattern.
- Attributing a figure from study A to review B because B cites A.
- Writing a population, dose or duration the abstract never stated.

**Recorded failure (2026-10-15, shilajit post).** Five abstracts were fetched and read correctly.
Four of five first authors were then invented — Ahmad, Rahimi, Ahmed, Pawar written in place of
Hussain A, Kamgar E, Aldakheel RK, Kohli HK. Six validator failures; the prose itself was accurate
throughout. The abstracts had been read. The author lines had never been looked at. The fix is
mechanical: **print the fields, then paste them.**

**If a check is impossible, say so.** "I could not verify this source" is always an acceptable
output. An invented identifier never is. Drop the claim and mark it UNVERIFIABLE in the sidecar.

### Rules 1–7

1. **Every PMID must be verified before inclusion.** Call PubMed E-utilities (`esearch`/`efetch`) or WebFetch the URL (`https://pubmed.ncbi.nlm.nih.gov/<PMID>/`) and confirm the article exists and its title matches your description. If the fetch fails or the title doesn't match, **do not use that PMID.**

2. **Every URL must resolve.** HEAD or GET the URL before including it. 404, 500, or timeout → **do not include.** Fall back to the parent resource URL (e.g., `https://ods.od.nih.gov/` instead of a broken sub-page).

3. **No duplicate PMIDs in a single Sources section.** Each source entry must have a unique URL. If two claims reference the same PMID, cite it once and reference that number from both claims.

4. **Title must match the actual article.** When listing a source as "Title — [link]", use the actual title from the PubMed record or page `<title>`. Abbreviation is acceptable; invention is not. Never paraphrase a title to make it sound more relevant.

5. **Prefer PubMed canonical URLs** (`pubmed.ncbi.nlm.nih.gov/<PMID>/`) over journal-specific URLs. PMIDs are stable forever; journal URLs change, paywall, or break.

6. **If a source cannot be verified, do not include it.** Never guess a PMID. Never construct a URL from memory or pattern-matching. If you believe the research exists but cannot find it live, describe the general evidence landscape instead and mark the claim UNVERIFIABLE in the sidecar.

7. **The validator enforces this at build time.** `pnpm blog:validate` fetches every URL via HEAD request and fails on 4xx/5xx responses. But the skill should never rely on the validator to catch mistakes — verify sources *during research*, not after drafting.
