> Superseded for copy and proposed cadence by [the November 5 revised drafts](16-email-research-and-revised-copy.md). Earlier poll and reply requests are parked. Nothing is approved or activated.

# Email journey review

Reviewed November 5, 2026. Proposed changes below are not deployed or activated.

## Observed state

Live Resend readback returned the beta waiting automation as disabled, with zero runs and no further run page. Its graph waits five days, checks waiting status, sends Day 5, waits nine days, checks again, and sends Day 14. Both reconnect and newsletter broadcasts are unscheduled drafts. This contradicts the enabled-state claim in docs/12-email-campaigns.md; historical acceptance is not evidence of current activation.

The live preference and poll routes return the expected invalid-token responses, and the webhook rejects GET with 405. This establishes route presence only, not successful signed-event processing or inbox delivery.

The shared branded shell is src/emails/email-layout.cjs: logo, deep teal, Georgia heading, warm background, founder signature and preference footer. Keep this owner for every campaign.

## Findings

1. Beta welcome provides expectations and a reply request, but no immediate resource. Lead with the existing Supplement Safety Brief and keep one primary action.
2. Day 5 leads with a caution and then pivots to medication-related nutrient depletion. Make the subject, lesson and linked resource tell one coherent story.
3. Day 14 already has a useful six-choice confirmed interest poll. Keep it, shorten the introduction, and avoid asking for health details.
4. Newsletter welcome links to the entire blog. Give readers one specific starting resource instead.
5. The reconnect draft mostly describes development work. Lead with something readers can use now, acknowledge their earlier signup, and state that no new signup is needed.
6. The archived Day 28, founder story, product counts and access promises are not approved current copy. Do not revive those claims automatically.
7. Beta and newsletter membership overlap. A seven-day gap between broadcasts must also account for automated notes; choose eligible recipients from current send history immediately before sending.

## Recommended cadence

| Audience / timing | Subject | Reader value / primary action |
| --- | --- | --- |
| New beta / immediately | You're on the list. Here's something useful now. | Open the existing Supplement Safety Brief directly; no second signup |
| New beta / Day 5 | When a medication affects nutrient levels | One short explanation of why evidence differs; read the published medication and nutrient guide |
| New beta / Day 14 | What would you like to check first? | Choose one general interest through the existing confirmed poll |
| Existing waiting beta / once | Still curious about PharmaGuide? Start here. | Offer the brief, acknowledge earlier signup, clarify that access invitations are separate |
| Newsletter / immediately | Your first PharmaGuide read | One useful resource and honest monthly expectations |
| Newsletter / about monthly | Chosen for the actual article | One substantial resource, optional factual product update; skip empty issues |
| Beta invitation / when a place exists | Your PharmaGuide beta invitation | Real access instructions; mark invited before sending |
| After confirmed access / about seven days | How did your first check go? | One feedback request; no automatic reminder loop |

Keep the current three-message beta journey rather than adding Day 2 and Day 28 emails immediately. A longer course is an alternative only once enough distinct, reviewed resources exist. Interest-based branching can follow later when each branch has useful content and sufficient audience evidence.

## Suggested welcome body

Hi, I'm Sean, the founder of PharmaGuide.

Thanks for joining the beta list. While you wait, here's something you can use now: the Supplement Safety Brief, with a worksheet you can bring to your next pharmacy visit.

Primary button: Get the free brief. Link directly to https://pharmaguide.io/supplement-safety-brief.pdf.

I'm opening beta access in small groups. I'll email you separately when I can offer you a place; joining the list doesn't give you app access yet.

Over the next two weeks, I'll send one useful guide and a short question about what you'd like to try. You can stop beta updates using the link below.

## Activation requirements

After Sean approves this revised journey, update the canonical templates and documentation, render previews, run email contract checks and typecheck, verify current provider settings and contact preferences, and qualify revised messages with owner-only tests. Check actual reply inbox receipt. Preserve stable preference signing secrets and known opt-outs.

Confirm the website enrollment flag and activation cutoff against production before enabling the existing native automation. No historical backfill or replacement automation. Inspect current recipients and recent sends before a reconnect broadcast, then send it once to eligible existing waiting beta subscribers. Keep the newsletter draft unscheduled until at least seven days later and only send when there is distinct value. Any deployed welcome changes require the website release as well as the Resend update.

No app invitation, first check or access confirmation may be inferred from opens, clicks or poll responses.
