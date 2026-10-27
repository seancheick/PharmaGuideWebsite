# Recall digest format

"PharmaGuide Weekly: Supplement Recalls and Safety Updates" — one post per Monday–Sunday week,
listing every U.S. dietary-supplement recall FDA posted that week, product by product.

Trigger: `/pg-blog-mdx this week's FDA supplement recalls` (or any weekly-recall request).

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
- **One card per notice or Enforcement Report event, one row per product.** Brand, product, lots,
  sizes, expiry and identifiers; the reason; the notice's instructions; announcement date; the
  official link.
- **Quote, don't paraphrase.** Scope, reasons and instructions are quoted from the notice. The
  editor may trim a quote but never rewords it.
- **Never generalise to an ingredient.** "Ultimate Forza Male Supplement recalled", never
  "sildenafil supplements recalled" or "magnesium recalled".
- **Coverage first.** A failed source makes coverage incomplete; the post says which source and
  never says "no recalls". A quiet week is stated only when every required source was read.
- Factual restatement of notices is the default. Any sentence that interprets risk needs PharmD
  (Laurie Pham) sign-off; the draft sets `review_required: true` either way.

## Publishing (a human step)

1. Check every card against its notice using the sidecar checklist.
2. Add `reviewer` and `reviewed_at` on sign-off.
3. Move the draft to `content/blog/<slug>.mdx` and run `pnpm blog:publish-check <slug>`.
4. Commit and open a PR. A push to `main` deploys production.

## Schedule (not built yet)

Collect daily, publish weekly:

- **Daily** `pnpm recalls:digest --collect-only` (e.g. 10:00 ET). Daily runs date notice changes
  close to when FDA made them; announcement pages are re-read for 90 days after posting.
- **Weekly** on Monday, after the last daily run, render the previous week's draft and open a PR
  for review. Enforcement Reports post on Wednesdays, so a Monday run has the whole week.
- The runner needs network access to fda.gov, accessdata.fda.gov and api.fda.gov, write access
  to commit `content/recalls/history.json` on a branch (never `main`), an optional
  `OPENFDA_API_KEY`, and an alert when the script exits 3 (incomplete coverage) or 1 (crash).
  A GitHub Actions cron or a Vercel cron that opens a PR both fit; nothing should auto-merge.
