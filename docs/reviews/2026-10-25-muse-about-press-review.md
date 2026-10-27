# Muse About and Press branch review

Reviewed October 25, 2026. Review only; no merge, push, deployment or page edits.

## Exact revision

- Branch: `origin/founder/about-press-v1`
- Reviewed head: `ae1badc3faaf1d7ad85b89cd3d7425022a9c3b01`
- Base: `9af0b6b370e6945c17805283b0b0200ca143139d` (origin/main)
- Muse rebased the originally reported `372f693` before pushing. That old object
  is not present in this clone; this review is of the actual pushed revision.
- Only two files changed: AboutClient.tsx and PressClient.tsx.
- Read-only snapshot: `.tmp/muse-about-press-review/`.

## Verdict

Keep the structure, but do not merge unchanged. The stats band, press-story
angles, reusable founder material and interview contact make the pages more
useful. Claims should be sharpened through specificity, not bigger absolutes.

## New or expanded issues

### P1: Replace the blanket pre-market testing quotation

`src/components/press/PressClient.tsx:61`

The new founder quote describes supplements as the only health products that
reach shelves before testing. Lack of FDA premarket approval does not establish
that manufacturers do no premarket evaluation/testing. FDA says supplement
manufacturers/distributors must evaluate safety and labeling before marketing;
its CGMP guidance also describes component and finished-product verification.
FDA's cosmetics material separately illustrates why premarket approval and
manufacturer safety obligations are different questions.

State the actual regulatory gap: FDA does not preapprove dietary supplements,
and consumers can struggle to evaluate the available evidence and labeling.
Do not publish the current broad claim as a direct quote from Sean.

- https://www.fda.gov/food/dietary-supplements
- https://www.fda.gov/regulatory-information/search-fda-guidance-documents/small-entity-compliance-guide-current-good-manufacturing-practice-manufacturing-packaging-labeling
- https://www.fda.gov/cosmetics/resources-consumers-cosmetics/cosmetics-qa-why-are-cosmetics-not-fda-approved

### P1: Verify the new universal clinical-release assurance

`src/components/about/AboutClient.tsx:318` through the new payoff paragraph;
`src/components/press/PressClient.tsx:51` and `:66`.

The new About paragraph says a licensed pharmacist reviews guidance before it
reaches the user. The new founder story and AI quote repeat pre-release clinical
review. Clinicians testing the app does not by itself establish that release-wide
review process. Current inspected pipeline review guidance distinguishes source
verification, engineering approval and clinician sign-off.

Either verify an approval trail covering the asserted scope or narrow the copy
to the actual reviewer/tester role. This review does not conclude that no clinical
review exists; it has not established the universal coverage these sentences imply.
Related universal assertions already in main's boilerplate are inherited, not
introduced by this branch.

### P2: The new stat breaks an existing single-source contract test

`src/components/about/AboutClient.tsx:48`

The new `200,000+` literal duplicates `SOURCE_LABEL_COUNT` from `src/lib/site.ts`.
The existing `tests/catalog-size-contract.test.cjs` explicitly prohibits that
duplication and fails on this branch. Import and use the canonical constant.
Keep the new label explaining this is NIH's source database, not PharmaGuide's
own evaluated-product count; that distinction is good.

### P2: Separate label data from laboratory-measured dose accuracy

`src/components/press/PressClient.tsx:74`

The melatonin pitch moves from an assay study to an offer about what the catalog
shows about dose accuracy across categories. The 2023 study measured products;
a label-derived catalog does not establish actual bottle contents. The study
itself is a suitable story source, but the follow-on offer needs a real dataset
with that measurement scope or narrower wording about declared doses, labels
and published studies. Likewise, confirm actual exports before promising
most-frequent depletion flags or category-level blend prevalence.

- https://pubmed.ncbi.nlm.nih.gov/37097362/
- https://jamanetwork.com/journals/jama/fullarticle/2804077

## Inherited issues, not attributed to Muse

- Press boilerplate still claims live FDA recall monitoring and scanned-product
  alerts. The app's inspected stack provider loads an authored banned/recalled
  ingredient reference dataset and product flags. That is not evidence of a live
  product/lot recall notification service. Describe that boundary accurately;
  do not claim the app has no recall-related checks at all.
- Main's About recall comparison still overstates universal prescription
  notification and understates public supplement recall alerts. See the earlier
  current-main review for FDA sources.

## Approval notes

- Treat all newly attributed founder quotes as proposed language requiring
  Sean's explicit copy approval, not prior verbatim quotations.
- Confirm Sean wants personal health context offered as an interview topic
  (PressClient.tsx:94); do not expand that detail beyond his chosen boundary.
- Remove `Ever.` from the new zero-sponsorship stat unless it is an intentional
  permanent company commitment. A present-tense independence statement suffices.
- Clinical interview availability and the one-business-day response promise
  should reflect what Sean and the named reviewer can actually offer.

## Verification

- Exact pushed snapshot TypeScript check: passed.
- Focused ESLint on both changed components: passed.
- `git diff --check` against origin/main: passed.
- Existing catalog claim tests on current main sources: 2 passed.
- Same tests on the pushed snapshot: 1 passed, 1 failed; failure identifies the
  new hardcoded label-source number in AboutClient.tsx.
- Public six-pillar score shape was checked against the current canonical
  pipeline `scripts/scoring_v4/config/quality_score.json`; six dimensions itself
  is not a finding.
- No full production build, rendered visual QA, publishing or live-page changes
  were performed. These findings are source and claim review, not release approval.
