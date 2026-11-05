# Recall digest format

"PharmaGuide Weekly: Supplement Recalls and Safety Updates" — one post per Monday–Sunday week,
listing every U.S. dietary-supplement recall FDA posted that week, product by product.

Trigger: `/pg-blog-mdx this week's FDA supplement recalls` (or any weekly-recall request).

A second weekly post, "Medication recalls", runs through the same pipeline with `--kind medication`.
See [Medication digest](#medication-digest). Everything below applies to both unless that section
says otherwise. Food is never in scope.

## Run it

```bash
pnpm recalls:digest                          # last complete week
pnpm recalls:digest --week-ending 2026-10-25 # a specific Sunday
```

The script (`scripts/recall-digest.mjs`, logic in `scripts/lib/recalls.mjs`) reads the sources,
updates the history store `content/recalls/history.json`, and writes:

- the draft: `content/blog/.drafts/supplement-recalls-week-of-<monday>.mdx` (not loaded by the
  site; `.drafts/` is outside the post list)
- the sidecar: `content/blog/.review/supplement-recalls-week-of-<monday>.review.md` (coverage
  table, openFDA cross-check, "possible supplements" to confirm, the full text of every notice)

Exit code 3 means coverage is incomplete. The draft is still written and says so at the top.

Check it with `node scripts/validate-blog.mjs .drafts/<slug>`.

## Sources

| Source | Role |
| --- | --- |
| FDA Recalls, Market Withdrawals & Safety Alerts (listing JSON + each announcement page) | New announcements, updates to a notice, exact scope |
| FDA Enforcement Report, weekly CSV (every Wednesday in the week, plus reports FDA flags as updated) | Recalls FDA has listed or classified; recalls with no press release |
| openFDA `food/enforcement` | Cross-check only, in the sidecar. Its docs say not to use it to issue alerts or track a recall's lifecycle |

A recall is in scope when FDA files it under Dietary Supplements, or the record's description names a
supplement, or an Enforcement Report record matches a supplement announcement on firm, date
(within a year) and product wording. A firm match alone is not enough.

## Classification

Every history entry is keyed so a re-run never duplicates it (announcements by FDA page path,
Enforcement Report records by FDA Event ID; each event has a content id). Each event is dated by
FDA, and the week's post takes the events dated in that week:

| Kind | Meaning | Post section |
| --- | --- | --- |
| `new_announcement` | FDA posted the company's notice this week | New recall announcements |
| `updated` | The notice changed (more lots, new instructions), a new notice expands an earlier one, or an Enforcement Report record gained products or changed codes | Updates to earlier recalls |
| `enforcement_listed` | First appearance in the Enforcement Report; says "previously announced" with the notice's date when there was one | Newly listed in FDA's Enforcement Report |
| `classified` | FDA rated a recall already under way (Class I/II/III) | Same section, stated as classification, not as new |

FDA's later classification or posting is not an expansion of the original warning. Never present
an `enforcement_listed` or `classified` item as new.

## Writing rules

- **No word-count floor, no mandatory FAQ, no figures.** Frontmatter `format: "recall-digest"`
  exempts the post from the word floor. Length is whatever the week's notices need.
- **One `<RecallCard>` per notice or Enforcement Report event** (`src/components/blog/figures/RecallFigures.tsx`,
  written by the renderer). It answers, in order: do I have this product, does the recall cover my
  package, what should I do. Product and scope first, then **What to do** (the notice's own
  instruction, e.g. "Consumers should stop using X immediately" → "Stop using X immediately."), a
  one-line reason, a package table (package, item number, UPC; or lots and codes for Enforcement
  Report records), where it was sold, the notice's refund and contact lines, and the official link.
  Each fact appears once. Cards carry Save image / Print / Copy link, and a saved card keeps the
  product, scope, action, source, update date and page URL.
- **Preserve exact details in structured fields; don't quote everything.** Product names, lots,
  item numbers, UPCs, dates, exclusions ("not sold through GNC corporate stores") and the notice's
  instructions are kept word for word. Surrounding explanation is short and plain. The full notice
  text stays in the review sidecar, not the post. A lot or identifier is never dropped to shorten
  a card.
- **Empty categories collapse into one scoped note** ("Also checked: no updates to earlier
  supplement recalls; no supplement recalls newly listed in FDA's Enforcement Report for October 21,
  2026"), never a bare "No recalls this week" next to a recall.
- **Product photos:** only the official photo from the FDA notice, never a generated lookalike.
  (Not automated yet: add by hand when it helps identification.)
- **Length follows the notices**: a one-recall week is a few hundred words.
- **Never generalise to an ingredient.** "Ultimate Forza Male Supplement recalled", never
  "sildenafil supplements recalled" or "magnesium recalled".
- **Coverage first.** A failed source makes coverage incomplete; the post says which source and
  never says "no recalls". A quiet week is stated only when every required source was read **and
  every candidate record is classified**.
- **Unresolved records block "every" and "no".** Enforcement rows that read like supplements but
  don't say so, and records only openFDA lists, keep the week unsettled: the post says they are
  still being checked, never "every recall" or "no recalls", and the script exits 3. A person
  classifies each one, recorded with who and when, then re-renders:
  `pnpm recalls:digest --week-ending <Sunday> --classify <Event ID or recall number>=not-supplement:"why" --by sean`
  (`=supplement` makes it a card).
- **Factual restatement only.** Recall digests are checked by our team against the FDA notices,
  not clinically reviewed (Sean, 2026-10-27): the draft sets `review_required: false` and carries
  no `reviewer`, so the page claims no clinical review. A sentence that interprets risk beyond
  the notice doesn't belong in a digest; it goes in a regular, PharmD-reviewed post.

## Medication digest

```bash
pnpm recalls:digest --kind medication
```

Writes `medication-recalls-week-of-<monday>` and keeps its own history in
`content/recalls/medication-history.json`, so a medication record can't change a supplement post.

- **Volume:** about 9 FDA drug recall events a week, range 4 to 14, about 38% injectable (nine
  reports, Sept 2 to Oct 28, 2026).
- **In scope:** FDA files it under Drugs. Veterinary products, supplements and anything the
  supplement digest claims stay out. FDA sometimes files a drug notice under another category on its
  recalls page (American Regent's epinephrine, Sept 2026, under Food & Beverages); it appears once
  the Enforcement Report lists it.
- **Sorted, not filtered.** Tablets, capsules, creams and drops come first, then injections and IV
  products, most serious class first. The headings come from a word match, so a wrong match only
  misplaces a card. A filter could hide a recall.
- **Class III and bulk ingredients** stay in one table with their lots and no card. FDA says using a
  class III drug is not likely to cause health consequences.
- **Patient guidance is FDA's, not ours.** The callout and each card's action restate
  [FDA's guidance](https://www.fda.gov/drugs/drug-recalls/understanding-drug-recalls-what-know-and-what-do)
  by class. Never tell a reader to stop or keep taking a medicine beyond that wording or the
  company's notice.
- **Linking a record to a notice** needs the same firm, the same drug and dates within 120 days. A
  firm match alone would link unrelated recalls, because one manufacturer can have several a month.
- **Not used here:** the openFDA cross-check and `--classify`, which exist for supplement
  look-alikes. Every drug record is already filed under Drugs.

## Publishing (a human step)

1. Check every card against its notice using the sidecar checklist; classify any unresolved records.
2. `pnpm blog:approve <slug>` (no reviewer or date: moves the draft live, runs publish-check,
   rolls back on failure).
3. Commit to the weekly PR branch and merge it. A merge to `main` deploys production.

## Schedule (`.github/workflows/recalls.yml`)

Collect daily, publish weekly:

- Each kind runs as its own job with its own branches, so one failing doesn't block the other.
- **Daily** `pnpm recalls:digest --collect-only` (e.g. 10:00 ET). Daily runs date notice changes
  close to when FDA made them; announcement pages are re-read for 90 days after posting.
- **Weekly** on the first daily run after a Monday–Sunday week ends, render that week's draft and
  open a PR for review. Enforcement Reports post on Wednesdays, so that run has the whole week. If
  GitHub delays or drops a scheduled run, a later day catches up; expect runs hours after the
  scheduled time.
- The runner needs network access to fda.gov, accessdata.fda.gov and api.fda.gov, write access
  to commit `content/recalls/history.json` on a branch (never `main`), an optional
  `OPENFDA_API_KEY`, and an alert when the script exits 3 (incomplete coverage) or 1 (crash).
  Built as a GitHub Actions workflow: daily collection force-pushes the history to
  `automation/recall-history` or `automation/medication-recall-history` (main + one data commit;
  Vercel skips these branches); the first run
  after the week ends renders it, validates it and opens a PR from `recalls/<slug>`. When coverage is
  complete and the checks pass, the run also does `pnpm blog:approve`, so **merging the PR publishes
  the post**. Otherwise it stays a **draft PR**. Nothing auto-merges. If the repo setting "Allow GitHub Actions to create and approve pull requests" is
  off, the run opens an issue with a one-click link to create the PR instead. PRs opened by the
  workflow's token don't trigger CI, so the run puts the recall tests and validator results in
  the PR body. Run it by hand from the Actions tab (`collect` or `weekly`; `both`, `supplement` or `medication`).
