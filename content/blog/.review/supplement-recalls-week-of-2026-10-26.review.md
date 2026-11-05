# Review: supplement-recalls-week-of-2026-10-26

Generated 2026-11-02 by `pnpm recalls:digest`. Week: Oct 26–Nov 1, 2026.

## Source collection: complete

| Source | Required | Status | Attempts | Records | Supplement records | Detail |
| --- | --- | --- | --- | --- | --- | --- |
| FDA Recalls, Market Withdrawals & Safety Alerts | yes | ok | 1 | 1098 | 57 | newest posting 2026-10-30; nothing posted after 2026-10-30 |
| FDA-posted company announcement pages | yes | ok | 1 | 8 | 8 | pages posted since 2026-07-28 |
| FDA Enforcement Report: reports with updated records | yes | ok | 1 |  |  |  |
| FDA Enforcement Report, 2026-05-13 | yes | ok | 1 | 198 | 0 | has updated records |
| FDA Enforcement Report, 2026-09-02 | yes | ok | 1 | 97 | 4 | has updated records |
| FDA Enforcement Report, 2026-09-23 | yes | ok | 1 | 172 | 3 | has updated records |
| FDA Enforcement Report, 2026-10-14 | yes | ok | 1 | 125 | 2 | has updated records |
| FDA Enforcement Report, 2026-10-28 | yes | ok | 1 | 202 | 3 | this week |
| openFDA food enforcement (cross-check only) | no | ok | 1 |  |  |  |

Records are what the collector read or refreshed, not this week's recall count. Source collection is not factual verification: that is recorded in the checklist below.

## openFDA cross-check

openFDA lists 3 food enforcement record(s) mentioning "supplement" with a report date in this week; the Enforcement Report CSVs gave 3 classified supplement record(s). Only in openFDA: none. Only in the Enforcement Report: none. openFDA lags and is cross-check only; investigate any record only in openFDA.

## Check every card against its notice

### Pacific Health Sciences Llc — enforcement_listed (2026-10-28)

- Key: `fda-enforcement:100068`
- Why included: product description names a supplement
- [ ] Brand, product, lots, sizes and identifiers match the notice
- [ ] Reason, affected scope and consumer instructions faithfully match the notice; no material condition or exclusion (refund requirements included) is omitted
- [ ] Not generalised to an ingredient

### PRIMAL SUPPLEMENTS GROUP LLC — enforcement_listed (2026-10-28)

- Key: `fda-enforcement:98583`
- Why included: product description names a supplement
- [ ] Brand, product, lots, sizes and identifiers match the notice
- [ ] Reason, affected scope and consumer instructions faithfully match the notice; no material condition or exclusion (refund requirements included) is omitted
- [ ] Not generalised to an ingredient

### EVEXIAS HEALTH SOLUTION — enforcement_listed (2026-10-28)

- Key: `fda-enforcement:99942`
- Why included: product description names a supplement
- [ ] Brand, product, lots, sizes and identifiers match the notice
- [ ] Reason, affected scope and consumer instructions faithfully match the notice; no material condition or exclusion (refund requirements included) is omitted
- [ ] Not generalised to an ingredient

## Before publishing

- [ ] Every card checked against its official notice (above)
- [ ] Coverage note matches the table above; never publish "no recalls" on incomplete coverage
- [ ] Every record listed under Possible supplements / Only in openFDA is classified; re-render (`pnpm recalls:digest --week-ending <Sunday>`) once none are left, so the post can drop its "still being checked" note
- [ ] Nothing interprets risk beyond quoting the notice (that needs a regular, PharmD-reviewed post; digests are team-checked only)
- [ ] After checking: `pnpm blog:approve supplement-recalls-week-of-2026-10-26` (moves the draft live, runs publish-check, rolls back on failure)
