# Claim Validation & Review Routing (new MDX pipeline)

This is the medical-credibility guard. Every post produced by `pg-blog-mdx` runs its claims through this before and after drafting. It answers five separate questions for each claim, and routes the post to the right review. (It replaced a numeric Risk Score in October 2026: that formula let a serious, well-evidenced drug interaction score "Low" and skip clinical review.)

`pg-social-mdx` keeps its own older copy of this file; when you change the rules here, update it or point it here.

---

## When this runs

1. **Before drafting** (Phase 4 of SKILL.md): build a claim record for every candidate claim.
2. **After drafting**: re-check the *final* article, including figures, captions and FAQs, for any claim that was added or reworded during writing. New wording needs its own record.

---

## The claim record

One row per claim. Five things, kept separate because they fail separately:

| Field | Question it answers | Example |
|---|---|---|
| **Source + passage** | Does a real, verified source say this? Identifier (PMID/DOI/URL), title as fetched, and the exact supporting sentence or table | PMID 26395129, "…significantly (P < 0.05) increased total testosterone…" |
| **Applicability** | Does it apply to *this* claim's subject? Preparation, population, dose, duration, outcome | Purified shilajit, healthy men 45–55, 250 mg twice daily, 90 days, serum hormones |
| **Finding** | What did it show? Benefit · harm · no clear effect · inconsistent · insufficient | Benefit (hormone levels) |
| **Confidence** | How convincing is the body of evidence *for this outcome*? Established · Moderate · Limited · Mixed — with the reason (bias, inconsistency, indirectness, imprecision) | Limited: one small RCT, one preparation, surrogate outcome |
| **Allowed wording** | The sentence the article may say, no stronger | "One trial in healthy men aged 45–55 found higher testosterone after 90 days on one purified preparation." |

**Rules:**

- **Identity is not support.** A real, correctly cited paper can still fail to support the sentence. The passage must state the population, dose, duration and direction you write.
- **Two pages repeating one trial are one source.** Independent confirmation means independent data.
- **Study type is not confidence.** A meta-analysis of small, biased trials can be Limited. Judge the evidence for the specific outcome.
- **A qualifier never rescues an unsupported claim.** "May" or "early research suggests" describe weak support; they do not create it. No supporting passage → the claim goes.
- **Unsupported or contradicted claims stay out of the body.** List them in the sidecar with why (no passage found / source says otherwise / doesn't apply to this population).

### Statuses for the sidecar

The record determines a status, which the sidecar shows at a glance:

| Status | Meaning | In the article? |
|---|---|---|
| **SUPPORTED** | Passage supports the allowed wording; applicability matches | Yes, at the recorded confidence and wording |
| **SUPPORTED, NARROWED** | Supports a narrower claim than drafted (population, preparation, dose) | Yes, narrowed to what the source covers |
| **UNSUPPORTED** | No passage supports it | No |
| **CONTRADICTED** | The best evidence says otherwise | No; consider saying what the evidence does show |
| **UNRESOLVED** | Could change a health decision and can't yet be settled | Not until resolved (see routing) |

---

## Research coverage (budgets, not completeness)

"Top 3–5 papers" or "5–8 sources" are starting budgets for effort, not proof the research is complete. Before drafting, the evidence must cover:

- the best relevant synthesis or official guidance (systematic review, NIH ODS fact sheet, label, guideline);
- the primary studies behind every key number or preparation-specific conclusion;
- important contrary findings and harms;
- relevant older human evidence, not only the newest paper;
- newer evidence published after the main review;
- any material question that remains open, named as open.

Phrases like "the only", "no studies", "nobody has followed up" need an exhaustive search to be true. Prefer "the studies discussed here".

---

## Where to cross-check each kind of claim

| Claim | Primary source | Cross-check |
|---|---|---|
| Dosing | The trial or label that used the dose; NIH ODS | PubMed for the most-cited dosing study |
| Drug–supplement interaction | DailyMed / drug label; interaction reviews | PubMed; the app's interaction rules as a lead, not a citation |
| Supplement adverse events | FDA CAERS records, stated with search date, field and terms | openFDA `food/event`; never imply incidence or cause |
| Drug adverse events | Drug label; FAERS records | openFDA `drug/event` |
| Supplement recall / safety notice | **The FDA notice page itself** (fda.gov recall announcement or safety communication) | FDA Enforcement Report; openFDA `food/enforcement` for record checks only |
| Drug recall | FDA notice / Enforcement Report | openFDA `drug/enforcement` |
| General efficacy | Systematic reviews, then key RCTs | Cochrane where available |

**Use the precise source that supports the claim.** If an fda.gov page fails an automated check, open it in a browser, confirm it matches, and record it in the validator's `MANUALLY_VERIFIED_URLS` (who, when, what the page showed). Never substitute an API query for an FDA notice or regulatory explanation. openFDA's food-enforcement documentation warns against using that dataset to issue public alerts or track a recall's lifecycle.

---

## API reference

### PubMed E-utilities (`PUBMED_API_KEY` in `.env`)

```bash
# esearch to find PMIDs
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=<query>&retmode=json&api_key=$PUBMED_API_KEY"

# efetch to get abstracts
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=<PMID>&retmode=xml&api_key=$PUBMED_API_KEY"
```

### openFDA (`OPENFDA_API_KEY` in `.env`) — supplements are *food* endpoints

```bash
# Supplement adverse-event reports (CAERS)
curl "https://api.fda.gov/food/event.json?search=products.name_brand:<term>&limit=100&api_key=$OPENFDA_API_KEY"

# Supplement / food recall records (record checks only — not an alert feed)
curl "https://api.fda.gov/food/enforcement.json?search=product_description:<term>&limit=100&api_key=$OPENFDA_API_KEY"

# Drug labels (mechanism, indications, contraindications, warnings)
curl "https://api.fda.gov/drug/label.json?search=openfda.generic_name:<drug>&api_key=$OPENFDA_API_KEY"

# Drug adverse events (FAERS) and drug recalls
curl "https://api.fda.gov/drug/event.json?search=patient.drug.openfda.generic_name:<drug>&api_key=$OPENFDA_API_KEY"
curl "https://api.fda.gov/drug/enforcement.json?search=product_description:<drug>&api_key=$OPENFDA_API_KEY"
```

When a post states a count from these, it says the search date, field and terms, and calls them records returned by that search.

### NIH ODS Health Professional fact sheets

`https://ods.od.nih.gov/factsheets/<Nutrient>-HealthProfessional/` — e.g. `CoenzymeQ10`, `Magnesium`, `VitaminB12`, `VitaminD`, `Iron`, `Calcium`, `Folate`, `Selenium`, `Zinc`.

### DailyMed (drug labels)

`https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=<drug>`

---

## Review routing (replaces the Risk Score)

Three labels stay separate everywhere — never merge them into one score or one pill:

1. **Evidence confidence** — Established · Moderate · Limited · Mixed · Conditional (claim record; `<EvidencePill>`; frontmatter `evidence_level`).
2. **Interaction severity / recommended action** — Contraindicated · Avoid · Caution · Monitor · No known concerns (the app's vocabulary). Said in text and callouts, never in an evidence pill. Never write "safe": write "no known concerns".
3. **Editorial review status** — `review_required`, `reviewer`, `reviewed_at` in frontmatter.

**Routing:**

| Content | Route |
|---|---|
| Every post | `review_required: true`. Laurie Pham, PharmD reviews all PharmaGuide content (Sean, 2026-10-11). |
| Clinical efficacy, dosing, interactions, contraindications, pregnancy/breastfeeding, children, chronic disease | Clinical review of those conclusions, on the exact version to be published |
| General literacy and document interpretation (label reading, units, how a report works) | Same review; the claim records will be short |
| A claim that could change a health decision and is **UNRESOLVED** | Draft everything else; leave that claim out or mark its section as pending; list the exact claim and what would resolve it in the sidecar. Don't publish until it's resolved. |

Drafting and permission to publish are separate. A hard topic still gets a full research record and a carefully scoped draft; publication waits for the review. `reviewer` and `reviewed_at` are added only after the PharmD signs off on that version: the page shows a "Clinically reviewed" badge and `reviewedBy` data from them. Never add a reviewer to clear the validator.

---

## Worked example

Topic: "Metformin and B12"

| # | Drafted claim | Record | Status | In the article |
|---|---|---|---|---|
| 1 | Long-term metformin use is associated with lower B12 levels | NIH ODS B12 fact sheet + cited studies; adults with type 2 diabetes on metformin | SUPPORTED · Established | "Long-term metformin use is linked to lower vitamin B12 levels." |
| 2 | About 30% of long-term users become deficient | One observational study; population and definition of deficiency specific to it | SUPPORTED, NARROWED · Limited | "In one observational study of [population], about 30% met its definition of deficiency." |
| 3 | Methylcobalamin is better absorbed than cyanocobalamin | NIH ODS: no evidence that absorption differs by supplemental form | CONTRADICTED | Not as drafted. If useful: "Supplement forms of B12 haven't been shown to differ in how well they're absorbed." |
| 4 | B12 deficiency can cause neurological damage that may be irreversible | NIH ODS B12 fact sheet describes neurological effects of deficiency, which can be irreversible | SUPPORTED · Established (general consequence of deficiency) | State it as a consequence of B12 deficiency generally, cited to ODS. Don't make a narrower metformin-specific claim unless a source covers it. |

Route: clinical review (dosing context, a medication, a chronic disease). Every post gets `review_required: true` anyway.

---

## Editor sidecar — claim audit table

```markdown
## Claim audit

| # | Claim (allowed wording) | Source + passage | Applicability | Finding | Confidence | Status |
|---|---|---|---|---|---|---|
| 1 | Long-term metformin use is linked to lower B12 levels | [1] "…" | adults, T2D, metformin ≥ … | harm (lower B12) | Established | SUPPORTED |
| 3 | (dropped) Methylcobalamin better absorbed | [1] "…no evidence…" | — | — | — | CONTRADICTED |
```

---

## Editorial qualifiers (must match confidence)

| Confidence | Use this language |
|---|---|
| Established | "Research shows" / "Evidence supports" |
| Moderate | "Studies suggest" / "Research indicates" |
| Limited | "Early research suggests" / "Preliminary evidence" — and say what kind |
| Mixed | "Results are mixed" / "Some studies show X while others…" |

Never say "proven" or "guaranteed".

---

## What this layer protects against

1. Fabricated studies — every claim traces to a fetched source and a quoted passage
2. Right paper, wrong claim — support and applicability are checked separately from identity
3. Cherry-picking — contrary findings and harms are part of required coverage
4. Over-confident dosing — dosing claims need their own source, with the exact regimen
5. Drug-interaction blindness — interaction claims always route to clinical review
6. Pregnancy / pediatric blind spots — always routed to clinical review
7. Hedged-in falsehoods — a qualifier never rescues an unsupported claim
8. Brand sneak-ins — separately enforced by the banned-brand validator rule

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

2. **Every URL must resolve, to the precise page that supports the claim.** Fetch it before including it. A dead link (404, gone) means find the moved page or another source that supports the same claim; never fall back to a homepage or parent page, which doesn't support the specific claim. A timeout, 5xx or bot block (401/403/429) is an access problem, not a dead link: retry, open it in a browser, and if it says what the post claims, record it in `MANUALLY_VERIFIED_URLS` (SKILL.md source rule 8).

3. **No duplicate PMIDs in a single Sources section.** Each source entry must have a unique URL. If two claims reference the same PMID, cite it once and reference that number from both claims.

4. **Title must match the actual article.** When listing a source as "Title — [link]", use the actual title from the PubMed record or page `<title>`. Abbreviation is acceptable; invention is not. Never paraphrase a title to make it sound more relevant.

5. **Prefer PubMed canonical URLs** (`pubmed.ncbi.nlm.nih.gov/<PMID>/`) over journal-specific URLs. PMIDs are stable forever; journal URLs change, paywall, or break.

6. **If a source cannot be verified, do not include it.** Never guess a PMID. Never construct a URL from memory or pattern-matching. If you believe the research exists but cannot find it live, describe the general evidence landscape instead and mark the claim UNVERIFIABLE in the sidecar.

7. **The validator is a net, not the check.** `pnpm blog:validate` fetches every URL and fails on dead links; 401/403/429 (bot protection) are warnings to open by hand, then record in `MANUALLY_VERIFIED_URLS`. It also checks PubMed identity and basic support. Verify sources *during research*, not after drafting.
