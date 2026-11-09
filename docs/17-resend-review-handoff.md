# Resend email program — activation November 8, 2026

Sean approved publication, website activation, waiting automation and eligible warm-up sends on November 8. Historical review-only statements below describe earlier checkpoints and are superseded by this approval. Beta access invitations remain unsent until Sean supplies the real TestFlight link. The newsletter example is a draft for future editorial use, not a repeating monthly send.

## Read the final emails in Resend

| Email | Draft |
|---|---|
| Existing subscribers | [Catch-up](https://resend.com/templates/c4d37353-b610-4a0b-9a52-76275087e388) |
| New beta welcome | [Welcome](https://resend.com/templates/4da280c3-1159-4f6f-b010-cace38e808bc) |
| Day 5 | [What backs the claim?](https://resend.com/templates/61fff820-2c5f-4e9a-ab6a-41e823d70f67) |
| Day 14 | [What if a supplement you take gets recalled?](https://resend.com/templates/9940426a-0e0b-486c-a741-724430dcf70f) |
| Newsletter welcome | [Welcome to monthly notes](https://resend.com/templates/122ce1a3-c12f-4f89-8ca5-6bb957d56ba6) |
| First monthly note | [Before adding another supplement](https://resend.com/templates/0f443d11-9947-41c7-92a9-b4ec19db6067) |
| Invitation | [You're in](https://resend.com/templates/3f2e3345-fa6e-4fc4-8fe8-57a9e54f84e8) |
| Feedback | [Help shape what's next](https://resend.com/templates/02e646d4-2cc2-4185-987c-538bb9227b0e) |
| Brief delivery | [Your free brief](https://resend.com/templates/e94ef5f0-0adf-469a-850f-bf42ed36fe87) |

All use the canonical existing theme and 24-frame animated PNG logo. Clients without animation support may show a still frame. The selected signature is “Here's to taking good care of yourself.” The catch-up includes a secondary features-page link. Day 14 explains stack as a basket and includes a sourced, scoped nutrient-overlap/vitamin A example.

These templates are HTML imports: use More actions → Edit template in Resend for its HTML code editor, or provide copy edits for the agent to apply there. The visual drag-and-drop editor is disabled for this imported format. Template previews show literal preference variables until prepared for a real recipient; do not click those placeholders as if they were live unsubscribe links.

The brief's subscription paragraphs and preference links are variables supplied from confirmed signup preferences. Its unfilled draft preview is not a claim that every requester is subscribed. The invitation has a required access-link variable; no invitation can be sent until real access instructions are supplied.

## Broadcasts and automation

- [Existing-subscriber catch-up broadcast](https://resend.com/broadcasts/1e77004a-de2c-4e9f-ba33-ee6ecbe2f3e0)
- [First monthly broadcast](https://resend.com/broadcasts/708aa23c-bb70-494c-9e36-69dec868e6d3)
- [Waiting automation](https://resend.com/automations/01a16ae5-69f1-73aa-a24b-863540a06b5c/editor)

Resend requires published templates in automation steps. The existing automation stays disabled and still references the historical v1 templates until approval to publish v2 templates and attach them. The reviewed replacement graph is privately saved at .tmp/email-review/waiting-v2-proposed.json. Day 5 and Day 14 retain the current-status checks; the new graph has no poll variable. No event is sent and no old subscriber is backfilled.

The account stays at three segments: Beta signups, Monthly notes, and Current campaign. The first two keep their original IDs and consent topics. Waiting status is now tracked on contacts, freeing the third group for an exact, reusable campaign queue. There are 31 subscribed people across both lists: 27 catch-up candidates, three recent beta signups deferred to avoid sending too soon, and one newsletter-only subscriber whose beta opt-out is respected. Each has one review category. Three excluded test/suppression records remain preserved. Both broadcasts still target the empty private review topic, so the populated queue does not arm a send. Refresh and approve eligibility before any future send.

## Website connection

The source now supports Resend-managed content behind RESEND_HOSTED_TEMPLATES_ENABLED, default false. Beta welcome, newsletter welcome and brief have stable template aliases. The housekeeping release is deployed with both new-email switches false and the obsolete waiting-segment setting blank. Live signup confirmations continue using the existing templates until the hosted content is explicitly approved and enabled.

The website retrieves clean published content, resolves trusted variables, and freezes welcome HTML/text/subject in the existing persistent delivery receipt. This preserves retries and duplicate protection. A previously verified published snapshot serves while dashboard drafts are edited. A cold cache cannot infer published content from a pending draft; publish and prime the clean snapshot before enabling. Missing configuration, missing required preference variables or unresolved placeholders fail closed.

The website still owns signup consent, topic preferences, signed links and one-click unsubscribe headers. Dashboard edits must preserve those required variables in HTML and text. No duplicate native welcome automation is created. Hostinger remains the reply inbox. Recall notifications stay in the app's safety system.

## Verification and approval boundary

86 email tests and 14 privacy tests passed, including real-render integration for hosted welcomes and brief, consent variants, draft rejection, stored retries and unsubscribe escaping. Typecheck, focused lint and production build passed. The build reports two pre-existing allowed blog-review exceptions; no blog text was changed. Features, brief PDF, both article links and logo returned HTTP 200. Chrome inspection confirmed Resend Draft status, the theme and the code editor. Provider readback and cohort receipt are kept privately in .tmp/email-review/. Final preparation completed November 5 at 7:22 p.m. America/New_York: 27 catch-up candidates, zero candidates for this particular monthly issue after catch-up/recent-send/duplicate-resource exclusions; both broadcast audiences remain held empty. Nine v2 templates read back as drafts; two broadcasts read back as unscheduled drafts; automation read back disabled.

The setup does not send tests automatically. Sean separately approved all nine owner-only inbox previews on November 5; all nine were delivered, plus one updated beta-welcome sample. That approval does not authorize real audience broadcasts, live invitations, enrollment events, template publication or automation activation.

After Sean approves the final emails: refresh and confirm the campaign queue, publish approved template versions, connect the disabled graph, prime published snapshots, qualify actual owner delivery with explicit approval, and obtain the chosen send/activation approval before enabling either switch. Keep old subscribers outside the new-signup sequence and defer overlapping or duplicate-resource newsletter sends.

## Audience reconciliation and copy changes — November 5

Sean approved repurposing the redundant waiting segment without upgrading. The website housekeeping release detaches waiting-stage tracking from segment membership: contact status and topic preferences remain canonical. Production settings have RESEND_BETA_WAITING_SEGMENT_ID blank and both RESEND_WAITING_SEQUENCE_ENABLED and RESEND_HOSTED_TEMPLATES_ENABLED false. Legacy automatic signup confirmations remain unchanged. The third group is now Current campaign, not a second beta-consent owner. Use reconcile-email-audiences.mjs to audit and refresh its explicitly approved review cohort; never let new signups flow automatically into an old catch-up campaign.

The new opening is “But does it tell you what you need to know?” The four welcome questions are real bold bullet items. The features link is an outlined secondary button. Newsletter wording is “Knowing which ones to trust can be hard.” The skip-issue sentence is removed. Nine templates and both broadcasts retain draft/review status. Template aliases stay stable even when display names change.

The first staged housekeeping deployment mistakenly included Git-ignored operational files because the Vercel CLI does not inherit .gitignore. It was never promoted and was deleted. Explicit .vercelignore exclusions now protect .tmp and local env files. The replacement source tree was checked: no private source files; an empty .tmp directory marker only. The replacement was built and promoted with both email switches false.

Final audience readback: three groups, no plan upgrade; queue exactly 27 unique IDs. Review categories cover all 31 subscribed contacts once (27 ready beta, three recent beta, one newsletter-only). The newsletter-only contact previously opted out of beta, and remains eligible for monthly notes; no beta consent is restored. All original source-list memberships and topic/global preferences were checked unchanged. The updated audience helper now tests that boundary explicitly. See [template keep/retire inventory](18-email-template-inventory.md).

## Tracking and combined signup follow-up

Open and click tracking are enabled for pharmaguide.io at Sean's explicit request, with domain readback verified. First four owner previews preceded the tracking change; the remaining previews and refreshed beta welcome followed it. Opens are estimates rather than proof of reading. Signup and privacy copy now state that the beta form includes monthly notes and describe email tracking. Historic subscription choices remain unchanged. Hosted revised emails and the native waiting sequence stay off.

The combined-signup and tracking-disclosure release is live as deployment dpl_HAtJ1J6ednq6m8NAkFiydWbMwv3b. Live homepage text states beta invitations and monthly notes before joining; live privacy text describes email open/link tracking. The hosted v2 email switch and waiting-sequence switch remain false, the old waiting-segment setting remains blank, broadcasts remain held drafts, and no historical contact import/backfill was run. Native beta welcome now contains conditional monthly-enrollment copy and a separate monthly preference link. Nine numbered previews plus UPDATED TEST 02/09 were delivered to Sean's explicitly authorized inbox; private receipts record provider IDs and status. Preview links do not change preferences or grant beta access.

## Later clarification: old and new beta signups include monthly notes

Sean explicitly confirmed that monthly notes are included for existing as well as new beta signups. Existing eligible beta Contacts are being aligned with the Monthly notes segment without creating duplicate Contact records, changing topic/global opt-outs, triggering welcomes, or sending enrollment events. Prior statements limiting monthly enrollment to new form submissions describe the earlier authorization and are superseded by this clarification. The historical audit receipts remain unchanged. Future general monthly issues use the single Monthly notes audience and its newsletter Topic; the native draft stays on its empty hold Topic until an actual send is approved.

## Naming clarification

There is one newsletter. “Monthly notes” was the earlier label, not a second program or recurring message. The Resend group is now named PharmaGuide · Newsletter (same ID). The general-newsletter template is named 06 · Newsletter example · review, and its broadcast is Newsletter example · unscheduled review. It is a sample issue, not a monthly repeating send. Sean writes and signs future issues, saves them as separate drafts, and chooses when to send each. Existing beta subscribers get the warm-up; new beta subscribers get their regular automatic welcome; both belong to the same newsletter audience. Native campaign sends and the waiting sequence stay off during review.

The warm-up draft now starts with a personal update from Sean and his team. The free brief is an optional gift. The regular automatic signup flow was not changed by this copy adjustment.

### Footer and features correction — November 5

All nine Resend review drafts now use the shared footer: sign-off, Sean's name, small disclosure, unsubscribe controls, then postal address. Conditional newsletter/beta preference links no longer appear in the body. Both held broadcast drafts were updated too. The warm-up and new-beta welcome now have a visible outlined **Explore PharmaGuide features** button linking to `/features`, above the sign-off. Website welcome uses the same footer placement. All nine remain unpublished; broadcasts stay unscheduled and the waiting automation stays disabled.

Footer correction verified against all nine draft readbacks; 89 email checks, typecheck, focused lint and production build pass. Corrected owner-only beta test delivered to Sean (`[CORRECTED TEST 02/09]`). Website footer correction promoted in deployment `dpl_73dAHuPtyfrpc5tqkULjxNSEDsb5`; both sending switches remain false. Private operational files excluded from deployment source.


### Approved family welcome — November 5

Sean approved the family / shared-standards direction. Beta welcome subject and heading now welcome readers to the PharmaGuide family; opening uses “You’re here early” and “Around here, we look beyond the label.” Four bold questions, free brief, outlined features button, conditional newsletter acknowledgment, approved signature and bottom preference footer remain. No elite percentages, minority claims, advisory status or granted beta access implied. Only the unpublished welcome draft changes; audience sends and automation stay off.


## November 8 activation

All nine approved templates are published. The beta invitation includes Sean’s supplied welcome artwork, hosted in existing public brand storage, with a separate accessible access button. Day 14 now explains stack as a basket, asks about supplement–supplement interactions, and describes the planned FDA recall notification system. The website uses published Resend content, with persistent delivery receipts and a new-signup-only activation cutoff. Existing contacts are not enrolled retroactively. Preference updates from Resend’s `contact.topics.updated` event stop the waiting journey after a beta opt-out.

The current audience audit covers 34 records: 30 active beta subscribers (all also newsletter members), one newsletter-only subscriber, and three excluded test/suppression records. There are 28 eligible warm-up recipients now and two deferred until a seven-day gap after their recent messages. The campaign queue is reserved for the deferred warm-up until that broadcast sends; future general newsletters use the Newsletter segment. No plan upgrade or extra segment is needed.

Nine invitation/artwork and earlier owner previews were sent only to Sean; no access is granted by a test. The actual invitation and post-access feedback are reserved for the future beta-access phase.
