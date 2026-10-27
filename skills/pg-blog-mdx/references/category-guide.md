# PharmaGuide Category Guide (new MDX site)

5 categories. Each has a different decision objective, length target, and recommended MDX component pattern. Read the row for your topic's category before outlining.

The schema id (used in frontmatter `category:` field) is in **bold**; the visible site label is in parentheses.

> **Slug vs label.** Schema ids (e.g., `ingredient-spotlights`) are frozen for SEO and URL continuity — `/blog?category=ingredient-spotlights` must keep working. Display labels (e.g., "Ingredient Deep Dives") may change for editorial reasons. **Always use the slug in frontmatter.** The site's `CATEGORIES` constant ([src/lib/blog-types.ts](/Users/seancheick/PharmaGuide%20Website/src/lib/blog-types.ts)) maps slug → display label.

---

## **`health-education`** (Health Education)

**When to use.** Beginner explainers, foundational concepts, common supplement questions, practical "how it works" topics, medication-supplement depletion guides.

**Decision objective.** Help the reader:
- Understand if this is worth knowing
- Identify when it actually matters
- Avoid overestimating benefits

**Tone.** Friendly teacher with pharmacist-level caution.

**Length.** 1,600–2,200 words target. Validator minimum: 1,400 (tight depletion-style posts pass; padded ones don't earn extra credit).

**Required patterns:**
- Fast answer in first paragraph
- Plain-language explanation
- Real-world framing ("the gap most people miss")
- Practical next steps
- Safety context as `<Callout tone="info">` or `<Callout tone="warn">`
- Clear bottom-line section

**Recommended MDX components:**
- `<Callout tone="info">` for YMYL disclaimer (always)
- `<Callout tone="warn">` for cautionary context (when relevant)
- `<Source>` inline for any drug-specific or dosing claim
- `<Illustration>` for mechanism diagrams (e.g., "how metformin affects B12 absorption")

**Optional MDX:**
- `<EvidencePill level="…">` next to a claim to label evidence strength
- `<PostImage>` editorial-mood image at the open (medication-depletion-guide uses this pattern)

**Internal-link priorities:**
- `/methodology/` when explaining evidence
- `/how-it-works/` for interaction system explanations
- `/blog/` as fallback or for related articles

**Schema (JSON-LD):** Article. `FAQPage` only if a visible FAQ section exists. `HowTo` only if truly procedural.

**Image style.** Clean educational visuals, mechanism diagrams, comparison illustrations. Avoid generic wellness photos.

**Reference post:** `/Users/seancheick/PharmaGuide Website/content/blog/medication-depletion-guide.mdx`

**Do NOT:** open with filler intros, over-explain basics, turn simple topics into deep dives, add unnecessary complexity.

---

## **`ingredient-spotlights`** (Ingredient Deep Dives)

**When to use.** Deep dives on one ingredient — what the evidence actually says, dosing, forms, risks, what to look for on a label.

**Decision objective.** Help the reader decide:
- Whether this ingredient fits their situation
- Whether form or dose changes outcomes
- Whether it's worth taking at all

**Tone.** Curious but skeptical. Practical, not academic.

**Length.** 1,900–2,600 words. Validator minimum: 1,900.

**Required patterns:**
- Fast verdict early
- Mechanism explanation
- Evidence framing (Strong / Moderate / Limited / Mixed)
- Form and dose guidance with `<Source>` chips
- Safety section with `<Callout tone="warn">` if relevant
- Bottom-line / decision summary

**Recommended MDX components:**
- `<Callout tone="info">` for YMYL disclaimer
- `<EvidencePill level="…">` to grade specific claims
- `<Source>` inline for every dosing or efficacy claim
- `<Illustration>` for mechanism diagrams, form comparisons, dose-response curves

**Optional MDX:**
- `<PostImage>` editorial image (lifestyle context only, no fake clinical scenes)

**Internal-link priorities:**
- `/methodology/` for evidence framing
- `/about/` for credibility context
- `/blog/` for related deep dives

**Schema:** Article. `FAQPage` if visible FAQ exists.

**Image style.** Ingredient visuals (illustrations), mechanism diagrams, form comparisons. Editorial photos OK for lifestyle context.

**Reference post:** `/Users/seancheick/PharmaGuide Website/content/blog/statins-and-coq10.mdx` (technically interactions-stacks but exemplary for evidence-grading style)

**Do NOT:** write a textbook-style deep dive, list every study, overstate evidence, delay the practical takeaway.

---

## **`interactions-stacks`** (Interactions & Stacks)

**When to use.** "Can I take X with Y," drug-supplement interactions, supplement-supplement conflicts, stack design.

**Decision objective.** Help the reader decide:
- Is this combination safe together?
- Should I adjust timing or dose?
- Should I avoid this combination?

**Tone.** Careful pharmacist. Direct. Calm. Not alarmist.

**Length.** 1,400–2,000 words. Validator minimum: 1,400.

**Required patterns:**
- Immediate answer in first paragraph (safety verdict)
- Clear interaction severity using `<EvidencePill level>` (High Risk / Moderate / Low Risk / Generally Safe)
- Who is at risk
- What to do next (timing change? dose adjust? avoid combo?)
- Safer alternatives where applicable
- Bottom-line decision

**Special citation rule:** Every H2 section must have at least one `<Source>` line. The validator enforces this for `interactions-stacks` posts.

**Recommended MDX components:**
- `<Callout tone="info">` for YMYL disclaimer
- `<Callout tone="warn">` for caution callouts
- `<EvidencePill level="High Risk">` / `<EvidencePill level="Monitor">` etc. for severity
- `<Source>` inline for every interaction claim
- `<Illustration>` for severity ladders, decision flows, timing diagrams

**Optional MDX:**
- `<PostImage>` lifestyle context only

**Internal-link priorities:**
- `/how-it-works/` for interaction system context
- `/methodology/` for evidence framing
- `/blog/` for related interaction articles

**Schema:** Article. `FAQPage` only if useful and visible.

**Image style.** Interaction charts (illustrations), severity visuals, decision graphics.

**Reference post:** `/Users/seancheick/PharmaGuide Website/content/blog/statins-and-coq10.mdx`

**Do NOT:** delay the safety answer, soften real risks, add generic filler, over-explain unrelated topics.

---

## **`safety-alerts`** (Safety Alerts)

**When to use.** FDA recalls, FAERS adverse-event signals, contamination findings, dangerous combinations.

**Decision objective.** Help the reader:
- Determine if they're affected
- Understand urgency
- Take action quickly

**Tone.** Urgent but controlled. Clear, factual. No alarm.

**Length.** 700–1,200 words. Validator minimum: 700. **Shorter posts are intentional for this category.**

**Required patterns:**
- Immediate alert summary
- Affected products / lot numbers / batches (factual, not promotional)
- Affected groups
- Issue details (mechanism of harm if known)
- Action steps (return product? contact provider? FDA reporting?)
- Sources (FDA enforcement records, FAERS, NIH)

**Special citation rule:** Every H2 section must have at least one `<Source>` line. Same as interactions-stacks.

**Recommended MDX components:**
- `<Callout tone="warn">` for the alert summary at top (in place of standard YMYL `<Callout tone="info">` if alert is urgent — but still include an `info` callout somewhere in first 300 words for compliance)
- `<EvidencePill level="High Risk">` / `<EvidencePill level="Recall">` for severity
- `<Source>` inline for every fact tied to the recall
- `<Illustration>` for product-identification visuals if needed

**Optional MDX:**
- Short `<PostImage>` for non-clinical visual context

**Internal-link priorities:**
- `/methodology/`
- `/blog/`

**Schema:** Article. Usually no FAQ.

**Image style.** Alert visuals (illustrations), product identification graphics. **Never AI-generated photos of pills, bottles, or labels.**

**Brand-naming rule:** Brand names ARE allowed in this category when they're the subject of the FDA action. The brand-recommendation guard applies to recommendation language, not factual mentions.

**Do NOT:** add long explanations, soften the risk, include unnecessary MDX components, write more than 1,200 words.

---

## **`news-research`** (News & Research)

**When to use.** New studies, trend analyses, clinical findings worth knowing about.

**Decision objective.** Help the reader:
- Understand what changed
- Avoid overreacting to a single study
- Interpret real-world impact

**Tone.** Smart health journalist. Evidence-aware. Restrained.

**Length.** 1,100–1,800 words. Validator minimum: 1,100.

**Required patterns:**
- Clear summary of the finding
- Evidence strength (study type, sample size, replication status)
- Real-world meaning ("does this change what people should do?")
- Limitations of the study
- Bottom-line context

**Recommended MDX components:**
- `<Callout tone="info">` for YMYL disclaimer
- `<EvidencePill level="Limited">` / `<EvidencePill level="Preliminary">` to grade the new finding
- `<Source>` inline for the cited study and any supporting research
- `<Illustration>` for study-design visuals or data visualizations

**Optional MDX:**
- `<PostImage>` editorial-mood imagery for context

**Internal-link priorities:**
- `/methodology/` for evidence framing
- `/about/` for credibility
- `/blog/` for related coverage

**Schema:** Article. `FAQPage` only if needed.

**Image style.** Study visuals (illustrations), data graphics. Editorial photos for lifestyle context only.

**Do NOT:** present early findings as fact, sound promotional, overstate results, ignore study limitations.

---

## Decision: which category fits?

If a topic could fit two categories, pick the one whose **decision objective** matches the reader's primary question:

| Reader is asking | Category |
|---|---|
| "What is this and should I care?" | health-education |
| "What's the evidence for this single ingredient?" | ingredient-spotlights |
| "Can I take X with Y?" | interactions-stacks |
| "Is there a recall I should know about?" | safety-alerts |
| "What does this new study mean?" | news-research |

---

## Final category rule

Choose the simplest structure that fully solves the reader's problem. Do not overbuild. A 1,400-word interactions piece that nails the decision is better than a 2,200-word interactions piece that buries it.
