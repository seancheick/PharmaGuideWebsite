# 13 — Blog topic backlog

Written October 10, 2026. Ranked list of the next posts, so the blog ships on a steady cadence
instead of one topic at a time. Re-rank monthly from Search Console (see
[09 — Search Console setup](./09-search-console-setup.md)); the demand column below is a
starting estimate, not measured traffic.

North star (Sean, sharpened October 11, 2026): anyone who scans a supplement gets a straight, verified answer: what the product is, whether it is good quality, and whether it is safe for them (their pregnancy or breastfeeding, conditions and medications), with the reason and the source. We flag only real, sourced concerns, never noise; when we find none we say "no known concerns", never "safe". No invented claims, and never a false reassurance. Every post
serves that sentence: it answers one question people already search, then shows that the app
answers it in one scan.

## How a topic ships

1. `/pg-blog-mdx <topic>` drafts the post. Its risk gate, claim validation and
   `pnpm blog:publish-check` decide publishability ([10 — Blog system guide](./10-blog-system-guide.md)).
   Risk 31–70 needs Laurie Pham, PharmD as `reviewer:`; risk ≥ 71 yields a brief for PharmD authorship only.
2. Sean turns the same verified facts into the Instagram carousel (Red Flag / Interaction Alert /
   Myth vs Fact series, keyword CTA). One fact set feeds both, so the post and the carousel never disagree.
3. The "PharmaGuide data" column names what the app already holds on the topic (pipeline
   `scripts/data/ingredient_interaction_rules.json` severities and `banned_recalled_ingredients.json`
   entries, checked October 10). It is a pointer for the drafter, not a citation: every claim in the
   post still gets its own primary source.
4. Regulatory words are exact: a warning letter or import alert is not a ban; say what FDA actually did.

Cadence: a target of two posts a week, not a promise; accuracy wins over the calendar. The agents
verify every clinical claim live against its source (right study by title and body; ingredient,
population, dose, outcome and severity match), as the pipeline roadmap's Launch track L4 describes.
**Med-heavy** marks posts likely to score risk 31–70; `blog:publish-check` needs a `reviewer:` field
for those, so they go to Laurie in a batch for a quick double-check.

## Wave 1 — high demand, app data behind it

| # | Working title | Why people search it | PharmaGuide data (research lead) | Social pair | Med-heavy |
|---|---|---|---|---|---|
| 1 | Magnesium glycinate vs citrate vs oxide: which form, and who should be careful | "magnesium glycinate" is among the most-searched supplement terms of 2026 (third-party estimate ~1M/month) | Magnesium: kidney disease avoid; thyroid medications and fluoroquinolones caution (spacing). Keep the brief's corrected wording: citrate, chloride and lactate are the better-absorbed forms; glycinate is gentle on the stomach | Red Flag No. 01 (posted) | |
| 2 | Melatonin gummies: what's really in the bottle | Sleep is a top search driver; the JAMA 2023 label-accuracy study is already verified in the brief | Melatonin: sedatives caution, seizure disorder monitor | Red Flag No. 02 | |
| 3 | How to read a Supplement Facts label (proprietary blends included) | Evergreen; shows exactly what the app automates | Engine: disclosure, blend detection, form | Label Decoded | |
| 4 | Third-party seals decoded: USP, NSF, Informed Sport | Trust question behind every purchase; the brief has a seals page | Verification pillar (`cert_evidence.py`) | Did You Know | |
| 5 | Creatine for women and adults over 40: what the evidence says, and the kidney question | Creatine searches up sharply in 2026 | Creatine: kidney disease caution | Myth vs Fact | |
| 6 | How much vitamin D is too much? Stacking past the upper limit | Popular, and the brief's stacking chart already exists | Vitamin D: anticoagulants, thiazide diuretics monitor; UL data | Big Stat | |
| 7 | Ashwagandha: who should not take it | Persistent top social-media supplement | Ashwagandha: thyroid disorder and sedatives caution; withaferin A (an ashwagandha constituent) is on the banned_recalled watchlist, not banned | Red Flag | |
| 8 | Your thyroid pill and calcium, iron, magnesium or zinc: how far apart | Evergreen, high-intent; the roughly 20–25% calcium figure (Zamfirescu, Thyroid 2011) is already verified | Calcium, iron, magnesium, zinc × thyroid medications: caution | Interaction Alert | yes |
| 9 | Berberine, "nature's Ozempic": what it does and what it interacts with | Viral weight-loss claim; pairs with the existing GLP-1 post | Berberine: MAOIs avoid; statins, CYP3A4 substrates, diabetes medicines caution | Myth vs Fact | yes |
| 10 | Hidden drugs in "sexual enhancement" and weight-loss supplements | Shareable safety story; the brief's FDA adulteration data is verified | banned_recalled: sildenafil/tadalafil analogs, sibutramine entries and recalled products | Red Flag | |
| 11 | Supplements to stop before surgery | Common pre-op search; clear, actionable | Ginkgo avoid before surgery; fish oil and vitamin K monitor | Interaction Alert | yes |
| 12 | Rhodiola: the fastest-growing stress supplement, and who should skip it | Third-party estimate +234% year over year | Rhodiola: immunosuppressants caution; blood pressure and sedatives monitor | Did You Know | |
| 13 | Turmeric and curcumin: liver warnings and blood thinners | Very high consumer use | Turmeric/curcumin: liver disease avoid; anticoagulants and antiplatelets caution | Interaction Alert | yes |
| 14 | Green tea extract and your liver | Weight-loss products; liver-injury data is in the brief | Green tea: liver disease avoid; beta blockers avoid | Red Flag | yes |
| 15 | Red yeast rice and statins: why not both | Cholesterol audience; recall news | Red yeast rice × statins: avoid; banned_recalled entries | Interaction Alert | yes |
| 16 | Fish oil and blood thinners: what the bleeding risk really is | Very common pair | Fish oil: anticoagulants, antiplatelets, bleeding disorders caution | Myth vs Fact | yes |
| 17 | St John's wort: birth control, antidepressants and transplant drugs | The best-documented herb–drug interaction | Contraindicated with SSRIs/SNRIs, oral contraceptives, immunosuppressants, MAOIs, anticoagulants | Interaction Alert | yes (risk ≥ 71 likely: PharmD-authored brief) |

## Wave 2 — high risk or needs new research

| # | Working title | Note |
|---|---|---|
| 18 | Kratom, 7-OH and tianeptine ("gas station heroin") | Risk ≥ 71 expected: PharmD-authored brief. banned_recalled has kratom, 7-hydroxymitragynine and tianeptine entries. |
| 19 | Lithium orotate: the trend and the medicine it shares a name with | Third-party estimate +309%; interacts with lithium-drug rules; PharmD-authored. |
| 20 | SARMs and MK-677 sold as supplements | Use the FDA document that names each compound; no "ban" unless FDA said ban. |
| 21 | Compounded or counterfeit GLP-1 products sold online | banned_recalled has a contaminated-GLP-1 high-risk entry; pairs with the GLP-1 post. |
| 22 | Potassium supplements and blood-pressure medicines | Kidney disease and potassium-sparing diuretics: avoid. |
| 23 | Iron: which form, and when to take it | Iron: thyroid medications, fluoroquinolones caution; depletion data. |
| 24 | Biotin can skew lab tests | Verify the FDA safety communication before drafting; app rule today is informational only. |
| 25 | Collagen: what the evidence actually supports | High demand; no interaction rule, so this is an evidence post. |
| 26 | Electrolyte powders: sodium and potassium for people with high blood pressure or kidney disease | High demand; potassium rules apply. |

Already published: medication depletion guide, statins and CoQ10 (needs Laurie's re-review after
its edit), GLP-1 supplements and nutrient gaps.

## Demand sources (third-party estimates, checked October 10, 2026)

- [Top 50 Supplement Trends, September 2026 — risingtrends.co](https://www.risingtrends.co/trends/supplement-trends-2026)
- [Top 33 Supplement & Vitamin Trends of 2026 — Glimpse](https://meetglimpse.com/trends/supplement-vitamin-trends/)
- [Top Searched + Trending Supplements 2026 — NutraSeller](https://nutraseller.com/top-searched-trending-supplements-to-sell-for-2026/)
- [Top supplement trends according to Google and TikTok — NutraIngredients-USA (2025)](https://www.nutraingredients-usa.com/Article/2025/05/05/top-supplement-trends-according-to-google-tiktok)
- [The growing problem of supplement–drug interactions in seniors — Science-Based Medicine](https://sciencebasedmedicine.org/the-growing-problem-of-supplement-drug-interactions-in-seniors/)
