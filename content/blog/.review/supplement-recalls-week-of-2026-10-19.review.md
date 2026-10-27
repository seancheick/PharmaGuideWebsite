# Review: supplement-recalls-week-of-2026-10-19

Generated 2026-10-27 by `pnpm recalls:digest`. Week: Oct 19–25, 2026.

## Coverage: complete

| Source | Required | Status | Attempts | Records | Supplement records | Detail |
| --- | --- | --- | --- | --- | --- | --- |
| FDA Recalls, Market Withdrawals & Safety Alerts | yes | ok | 1 | 1096 | 57 | newest posting 2026-10-27 |
| FDA-posted company announcement pages | yes | ok | 1 | 8 | 8 | pages posted since 2026-07-21 |
| FDA Enforcement Report: reports with updated records | yes | ok | 1 |  |  |  |
| FDA Enforcement Report, 2026-09-23 | yes | ok | 1 | 172 | 3 | has updated records |
| FDA Enforcement Report, 2026-09-30 | yes | ok | 1 | 132 | 0 | has updated records |
| FDA Enforcement Report, 2026-10-07 | yes | ok | 1 | 198 | 0 | has updated records |
| FDA Enforcement Report, 2026-10-14 | yes | ok | 1 | 125 | 2 | has updated records |
| FDA Enforcement Report, 2026-10-21 | yes | ok | 1 | 134 | 0 | this week |
| openFDA food enforcement (cross-check only) | no | ok | 1 |  |  |  |

## openFDA cross-check

openFDA lists 0 food enforcement record(s) mentioning "supplement" with a report date in this week; the Enforcement Report CSVs gave 0 classified supplement record(s). Only in openFDA: none. Only in the Enforcement Report: none. openFDA lags and is cross-check only; investigate any record only in openFDA.

## Check every card against its notice

### Tonight We Ride, LLC — new_announcement (2026-10-24)

- Key: `fda-announcement:/safety/recalls-market-withdrawals-safety-alerts/tonight-we-ride-llc-issues-voluntary-recall-ultimate-forza-male-supplement-due-presence-undeclared`
- Why included: FDA product type: Dietary Supplements
- Notice: https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/tonight-we-ride-llc-issues-voluntary-recall-ultimate-forza-male-supplement-due-presence-undeclared
- [ ] Brand, product, lots, sizes and identifiers match the notice
- [ ] Reason and instructions are quoted, not paraphrased
- [ ] Not generalised to an ingredient

Full notice text as fetched:

> October 24, 2026, Tonight We Ride, LLC of Lakeville, Minnesota is voluntarily recalling all lots of Ultimate Forza Male Supplement capsules to the consumer level because it has been found to contain undeclared Sildenafil, Tadalafil, and Dapoxetine.
> The presence of Sildenafil, Tadalafil, and Dapoxetine in this product renders them unapproved drugs for which the safety and efficacy have not been established.
> Sildenafil and Tadalafil are active ingredients in FDA-approved prescription drugs Viagra and Cialis, respectively, used to treat erectile dysfunction. FDA approval of Viagra and Cialis is restricted to use under the supervision of a licensed health care professional. These undeclared ingredients may interact with nitrates found in some prescription drugs, such as nitroglycerin, and may lower blood pressure to dangerous levels. People with diabetes, high blood pressure, high cholesterol, or heart disease often take nitrates.
> Dapoxetine is an active ingredient not approved by the U.S. FDA and therefore its safety or efficacy has not been established. Chemically, dapoxetine belongs to a class of drugs known as selective serotonin reuptake inhibitors (SSRIs) used to treat depression. Consumption has been shown to increase the risk of suicidal thinking and behavior in children, adolescents, and young adults.
> Ultimate Forza products subject to the recall include the Ultimate Forza Multi-Capsule/Box (Item #810208, UPC 868592000002) and the Ultimate Forza Single Pack (Item #810222, UPC 868592000040). These items were distributed through certain independently owned and operated GNC franchise locations in the United States from 2017 to October 1, 2026. The products were not sold through GNC corporate stores.
> Ultimate Forza Male Supplement capsules are marketed as male performance dietary supplements. The Multi-Capsule/Box configuration contains ten blue hard-shell capsules, and the Single Pack contains one capsule.
> No adverse events or complaints have been reported to date.
> The recall was initiated after GNC's third-party product testing identified undeclared sildenafil, tadalafil, and dapoxetine. Sales were stopped, affected products were quarantined at franchise locations, and customers were notified to discontinue use and return remaining product.
> Consumers should stop using Ultimate Forza Male Supplement immediately. Consumers may return unopened or partially used product to a GNC store for a full refund. A receipt or the phone number or email address associated with the loyalty account used for the purchase should be provided so the purchase can be verified.
> Consumers with questions may contact GNC Customer Service at 1-877-462-4700 or GNCRecalls@gnc-hq.com.
> Consumers should contact their physician or healthcare provider if they have experienced any problems that may be related to taking or using this product.
> Adverse reactions or quality problems experienced with the use of this product may be reported to the FDA's MedWatch Adverse Event Reporting program either online, by regular mail or by fax.
> Complete and submit the report Online: www.fda.gov/medwatch/report.htm
> Regular Mail or Fax: Download form www.fda.gov/MedWatch/getforms.htm or call 1-800-332-1088 to request a reporting form, then complete and return to the address on the pre-addressed form, or submit by fax to 1-800-FDA-0178.

## Before publishing

- [ ] Every card checked against its official notice (above)
- [ ] Coverage note matches the table above; never publish "no recalls" on incomplete coverage
- [ ] Every record listed under Possible supplements / Only in openFDA is classified; re-render (`pnpm recalls:digest --week-ending <Sunday>`) once none are left, so the post can drop its "still being checked" note
- [ ] Nothing interprets risk beyond quoting the notice (that needs a regular, PharmD-reviewed post; digests are team-checked only)
- [ ] After checking: `pnpm blog:approve supplement-recalls-week-of-2026-10-19` (moves the draft live, runs publish-check, rolls back on failure)
