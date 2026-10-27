# About and Press: current-main source review

Reviewed October 25, 2026. No page edits, merges or deployments performed.

## Scope and missing branch

Fetched origin with prune, listed GitHub branches and all available pull requests,
and inspected local worktrees. GitHub currently exposes only `main`. No Muse
About/Press branch or pull request was identifiable. Local About and Press files
have no uncommitted changes and match origin/main. The latest component change
found was October 13, not a new Muse revision. This report therefore concerns
current main, not an attributable review of Muse's work. The exact branch, PR or
workspace is needed to review Muse's diff or visual design.

## Findings

### P1: Press promises live recall alerts that current product messaging excludes

`src/components/press/PressClient.tsx:45` includes FDA recalls in current app
capabilities. Line 47 explicitly promises live monitoring for scanned products.
`src/app/press/page.tsx:49` repeats recall monitoring; the About features link at
`src/app/about/page.tsx:48` also lists recalls.

The current email claims register explicitly excludes instant recall notifications
(`docs/12-email-campaigns.md`, Claims table section). These surfaces should not
promise that shipped capability without a verified end-to-end implementation.
Remove the live-alert promise or clearly label any planned feature as planned.

### P1: Universal clinician review claims need a clinical sign-off trail

`src/components/press/PressClient.tsx:43` describes evidence as graded by clinicians.
Line 45 says every interaction is pharmacist-reviewed before shipping. Line 47
claims continuous catalog review. Line 425 encourages the phrase clinical-grade.
`src/components/about/AboutClient.tsx:108` also asserts pre-release clinical review.

Clinicians participating in beta testing does not substantiate those universal
claims. Confirm the actual clinical approval records and scope before publishing
them. The pipeline's review packet distinguishes engineering/source verification
from clinician sign-off; it does not treat them as interchangeable. This review
has not established the current clinical approval coverage. Until it is verified,
describe the narrower actual testing/review role rather than every-record approval.

### P2: About's recall comparison is too absolute

`src/components/about/AboutClient.tsx:439` claims mandatory direct notification
for prescription recalls, followed by insurance and prescriber notifications.
Line 468 says supplement recalls reach industry rather than consumers.

FDA describes several ways consumers may learn of a medicine recall, not a
guarantee that every patient is directly notified. FDA also publishes public
food/supplement alerts and offers consumer recall subscriptions. Keep the useful
point that notification gaps can exist, but use conditional language on both
sides rather than implying universal drug notification and no consumer pathway
for supplements.

- [FDA: Understanding Drug Recalls](https://www.fda.gov/drugs/drug-recalls/understanding-drug-recalls-what-know-and-what-do)
- [FDA: Food and Supplement Safety Alerts](https://www.fda.gov/food/recalls-outbreaks-emergencies/alerts-advisories-safety-information)
- [FDA: Product Recalls and Consumer Subscriptions](https://www.fda.gov/consumers/consumer-updates/fda-101-product-recalls)

## Overall

The founder/team story and reusable press boilerplates are useful structures.
The main risk is the strength and consistency of the claims, especially because
journalists may copy the press boilerplates verbatim. No assessment of Muse's
new layout or branch readiness is possible until that revision is identified.
