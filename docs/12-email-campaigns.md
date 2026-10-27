# PharmaGuide email system

## Day 14 interest poll

Day 14 alone offers six general testing topics: interactions, the whole stack,
evidence, condition fit, ingredient or dose overlap, and something else.
The condition-fit choice asks for an interest, never a diagnosis or condition name.
The interactions choice does not promise that a combination is safe.
Each signed link opens a branded
confirmation page. Opening a link never records an answer. Confirming stores only
the latest choice (`pg_beta_interest`) and date (`pg_beta_interest_at`) on the
Resend contact. Reconfirming the same choice is a no-op. No free text, health
details, signup, invitation, or consent change is involved.

View answers in Resend under Contacts, then the contact's custom properties.
For an overview, run:

```sh
node --env-file=.env --env-file=.tmp/email-review/deployment.env scripts/email-ops.mjs poll-report
```

This read-only command refreshes `.tmp/email-review/poll-report.html`, `.csv`,
and `.json`. Open the HTML report locally to see counts, confirmed answers and
people without an answer. The cohort includes current subscribed beta contacts,
including invited testers, but excludes opt-outs, suppression and known tests.
Only each person's latest answer counts. Earlier poll choices are shown separately,
not reassigned to new options. The report is a dated snapshot, not live analytics.
It contains email addresses: keep it private and never deploy it or serve its
parent folder. Re-run the command when reviewing responses. No opens or clicks
are counted as answers, and this command cannot send or schedule emails.

Email choices use filled deep-teal, table-backed buttons. The confirmation page
shows the selected answer and one Confirm button. Change answer reveals the
selector. Opening either page remains read-only.

The `refresh-drafts` command creates missing properties, backfills signed poll
links for beta contacts, and updates the disabled templates and draft broadcasts.
It does not send, schedule, or enroll anyone. New waiting contacts receive a poll
link during normal signup synchronization. Keep the signing secret stable.


Updated October 23, 2026. Resend handles sending and subscriber preferences.
Hostinger remains the reply inbox. Sean approved the waiting sequence for new
beta signups only. Broadcasts remain unscheduled drafts pending separate approval.

The earlier old-lead and personal outreach plan is preserved in
[the original outreach archive](archive/email-outreach-plan-original.md), with
separate Reactivation and Friends & Family sections. It is reference material,
not current approved copy. No friends are imported or subscribed automatically.
The restored current drafts are described in
Founder outreach drafts (kept locally, not in this public repo). The old-lead note remains a
Resend broadcast draft; the friends-and-family message is a personal draft only.

## Verified account state

- `pharmaguide.io` is verified in Resend and sending is enabled for the domain.
- The beta waiting automation is enabled for new website beta joins after the
  activation cutoff. Its trigger is `pg.beta.waitlist_joined.v1`. Existing beta
  contacts are not backfilled. The private activation receipt records the cutoff.
- Two broadcast drafts are prepared: a beta signup update and a monthly note.
- Correction, October 26, 2026: the email routes were not in git, so production
  did not have them; `POST https://pharmaguide.io/api/email-events` returned 404.
  Delivery tracking goes live when this work merges. The webhook must target
  `https://pharmaguide.io/api/email-events`, without the `www` redirect.
- One approved beta-welcome test reached Sean's Gmail inbox, in Promotions.
  SPF, DKIM, and DMARC passed. Reply-To is `info@pharmaguide.io`.
- The test's actual delivered event was replayed after fixing the webhook redirect.
  Production saved its delivery receipt and the contact's delivered status.
  Message receipts retain the newest event even when older events replay later.
- Beta one-click and newsletter confirmation opt-outs were checked against
  Resend. Beta opt-out removed waiting membership without changing newsletter
  consent. Only Sean's original test preferences were restored afterward.
- Changing the owner test contact to invited triggered waiting-list removal through
  the live webhook without an invitation send. Its original status was restored.
- Owner-only native tests also reached Gmail: Day 5, Day 14, the beta update,
  and the monthly note. The subscriber automation stayed disabled during those tests.
  A temporary automation used a unique event and an exact owner-email condition;
  it completed and was disabled. Broadcast copies used a private, opt-out-default
  test topic with exactly one eligible recipient, not the live subscriber topic.
- Native topic-only unsubscribe preserved other preferences. Native global
  unsubscribe also worked. The owner's choices from the start of this test were
  restored, including the beta opt-out made after the earlier welcome test.
- Shared email styling is owned by `src/emails/email-layout.cjs`. The website
  templates and native campaign renderer use that same logo, typography, spacing,
  signature and footer. Do not build a separate shell for a new campaign.
- Sean confirmed the postal address: PharmaGuide Inc., 100 Sudbury St, Boston, MA 02114.

The 16 supplied MailerLite contacts were confirmed by Sean for both beta and
newsletter updates. Fourteen were new; two already existed. No import triggered
a welcome or sequence enrollment. The resulting active lists have 28 beta
contacts and 17 newsletter contacts. The lists overlap; do not add those counts
to claim a total audience size. One confirmed provider bounce and two known test
aliases are excluded. Their records remain so they are not accidentally reactivated.

Subscriber addresses, import evidence, previews, provider IDs, and generated
deployment secrets are in the ignored `.tmp/email-review/` folder. Never commit
that folder or copy subscriber details into a public review or analytics event.

## What runs where

| Message                        | Owner                        | Trigger                             |
| ------------------------------ | ---------------------------- | ----------------------------------- |
| Beta welcome                   | Website React Email template | A successful new beta signup        |
| Newsletter welcome             | Website React Email template | A successful new newsletter signup  |
| Brief delivery                 | Website React Email template | An explicit brief request           |
| Day 5 and Day 14 waiting notes | Enabled Resend automation    | New beta join after activation only |
| Invitation                     | Sean, through Hostinger      | A testing place is actually ready   |
| Feedback request               | Sean, through Hostinger      | About a week after confirmed access |
| Monthly newsletter             | Resend Broadcast draft       | Sean reviews and chooses to send    |

The exact immediate copy lives in `src/emails/`. The exact later copy lives in
`scripts/lib/email-campaigns.mjs`; the operator tool renders it for Resend and
the private review page. Edit those sources rather than keeping a second copy
of the email text here.

Brief requests join the newsletter and beta lists (the form says so, and an
earlier opt-out from either list is kept). The brief email is the only message
sent; it carries an unsubscribe link for each list, and the inbox one-click
unsubscribe stops the monthly notes. Requests come from one form, `src/components/brief/BriefForm.tsx`, on three
surfaces: `/checklist`, the end of every blog post (always shown), and the
automatic blog offer (`BriefOffer.tsx`). The automatic offer appears after 45
visible seconds plus the article midpoint, at most once a session, quiet for 30
days after a dismissal and for good after a confirmed request
(`src/lib/brief-offer.ts`). The PDF is `public/supplement-safety-brief.pdf`;
re-render `public/images/brief-cover.webp` from its page 1 whenever it changes.

From: Sean at PharmaGuide, using the verified `hello@pharmaguide.io` address.
Reply-to: `info@pharmaguide.io`. During active testing, check replies daily or
use Hostinger/mail-client notifications. No automatic daily inbox watcher or
automatic reply sender has been installed. Do not promise that one exists.

## The small sequence

| Moment           | Subject                                       | Action                                  |
| ---------------- | --------------------------------------------- | --------------------------------------- |
| Signup           | You're on the PharmaGuide beta list           | Reply with one general topic            |
| Day 5            | A missing warning isn't a guarantee of safety | Read one published guide                |
| Day 14           | What would make your beta access useful?      | Say what they want to try               |
| A place is ready | Your PharmaGuide beta invitation              | Use a real access link                  |
| After access     | How did your first check go?                  | Describe one confusing or missing thing |

Day 14 explicitly acknowledges the earlier signup. No promised access date,
automatic first-wave status, invented founder anecdote, or claim of complete
interaction coverage. Ask for general topics rather than medication lists,
medical records, or someone else's health information.

Send one feedback request, then respond personally if they reply. Do not put
nonresponders into repeating reminders. Keep the monthly note to one useful
article, one real product update if there is one, and one optional question.
Skip the send when there is nothing useful. No automatic switch to weekly.

## Invitation status stops waiting messages

### New-signup activation boundary

The enabled sequence is for new beta-list joins, not a catch-up send to existing
contacts. `pg_beta_joined_at` is recorded only when a website visitor newly joins
the beta segment. Resubmitting an existing beta signup does not stamp a new date.
Enrollment requires both `RESEND_WAITING_SEQUENCE_ENABLED=true` and a valid join
date at or after `RESEND_WAITING_SEQUENCE_STARTED_AT`. Older imported contacts
without that date remain outside the sequence. An existing newsletter subscriber
can still join beta for the first time after activation. Existing beta leads need
a separately reviewed reconnect message, never a burst of overdue sequence emails.

The welcome is immediate. Day 5 follows the enrollment event; Day 14 is nine days
later, provided the person's current status remains waiting. No invitation or app
access is granted by enrolling in the email sequence. Copy describes opening beta
access in small groups, rather than recruiting the first testers.

`pg_beta_status` is the one beta-stage field in Resend:

| Value                                | Meaning                                                              |
| ------------------------------------ | -------------------------------------------------------------------- |
| `waiting`                            | Eligible for waiting notes, provided their beta preference is active |
| `invited`                            | An invitation is ready or has been issued; no waiting notes          |
| `access_confirmed`                   | The tester confirmed access; no waiting notes                        |
| `feedback_received`                  | Feedback about using the app was received; no waiting notes          |
| `test`, `suppressed`, `unsubscribed` | Excluded from waiting messages                                       |

Use `first_check_confirmed` when a tester confirms their first product check.
Do not infer this from email engagement. This status also stops waiting messages.

Mark a person invited **before** sending their invitation. The operator action
updates the field and removes them from the waiting segment; it does not send
an invitation. After deployment and webhook activation, editing this field in
Resend also removes them from the waiting segment through the signed webhook.

The native sequence waits five days, checks that the current status is exactly
`waiting`, sends Day 5, waits nine days, and checks again before Day 14. Every
other status ends that path. A temporary workflow containing no email steps
verified that `contact.properties.pg_beta_status` reads the updated status
after a delay. That test was stopped and removed.

The reconnect broadcast targets the waiting segment. Invitations and confirmed
users must not remain in that segment. A message already accepted for delivery
cannot be recalled; marking invited prevents future waiting steps and inclusion
in future waiting broadcasts.

New website signups can synchronize status when the prepared settings are
deployed. Actual event enrollment remains off until
`RESEND_WAITING_SEQUENCE_ENABLED=true` is deliberately configured after approval.
An uncertain event submission is flagged `pg_sequence_status=needs_review`
rather than blindly retried and potentially starting duplicate runs. Imports
never send enrollment events.

## Consent and unsubscribe

The signed website unsubscribe page uses standalone, script-free branded HTML with
no external requests, no-store/no-referrer/noindex and hash-authorized inline CSS.
GET is read-only, including “Keep current preferences.” One visible confirmation
opts out only the signed topic. After success, an optional native reason select
can save the latest `list:reason` in Resend's `pg_unsubscribe_feedback` contact
property, only after verifying that topic is opted out. Allowed reasons are
`too_many`, `not_relevant`, `not_using`, `did_not_signup`, and `other`; no free text
or medical data. Storage is disclosed beside the form and in the privacy policy.
Feedback failure never reverses unsubscribe or claims feedback was saved.
One-click List-Unsubscribe POST stays an empty 200 without a survey.
There is no additional stop-all action, pause, or resubscribe flow on this page.

Segments record which list someone joined. Topics hold their email preferences.
Beta and newsletter consent are separate. A beta signup alone does not enroll
someone into the newsletter segment. Being eligible for a topic alone never
qualifies someone for a send; the matching list membership is also required.

Existing global opt-outs and topic opt-outs are preserved, including when an
address exists outside the requested segment. New contact creation includes
the requested segment and topic consent in a single provider request. A later
preference lookup failure is retryable without inventing an unsubscribe.
Preparation never changes an existing topic preference to `opt_in`.

Immediate emails use a signed, list-specific URL with contact ID rather than
email address in the token. GET displays confirmation; POST updates only that
topic. Beta opt-out also changes beta status and stops waiting. Failed writes
return an error rather than claiming success. The route includes no trackers
and sends no-store, no-referrer, and noindex headers.

Broadcasts use their matching Topic and Resend's native unsubscribe link.
Native Automation unsubscribe is global rather than topic-scoped. Waiting
templates therefore label that link **Unsubscribe from all marketing** and also
offer **Stop beta updates only** through the custom signed preference URL.
Do not describe the native global action as beta-only.

Never delete an opt-out record, import addresses as subscribed after they opted
out, or treat an unusual name or foreign domain as proof of a fake address.
Keep all app and security mail outside marketing unsubscribe decisions.

## Delivery tracking and list cleaning

The signed `/api/email-events` webhook accepts only supported events and
processes PharmaGuide sends and its list members. Other businesses using the
same Resend account are ignored. Invalid signatures cannot update contacts.

- Permanent bounces and complaints are excluded from future marketing and waiting.
- A generic send failure, temporary bounce, full mailbox, or provider quota problem
  is recorded for review. It does not establish that an address is fake.
- Duplicate event deliveries are harmless. A delayed old event does not clear
  an existing hard-bounce or complaint state.
- Resend stores contact delivery status. The existing Upstash store retains
  minimal event receipts for 90 days with message/contact identifiers and status,
  without subjects, addresses, medical details, click URLs, or message bodies.
- Available provider history was backfilled. Historical status timestamps are
  the message creation time when an exact delivery-event time was unavailable.
  Unknown older history stays unknown.

Welcome delivery uses persistent receipts and a stable provider idempotency key.
The original message is kept until accepted so retries use the same payload.
Accepted receipts drop the message body. A 23-hour retry window begins at the
first possible send, not at contact reservation. Expired workers cannot overwrite
newer receipts. Older uncertain sends require a provider log check.

## Review and activation

Review `.tmp/email-review/preview/review.html` for recipients and all four prepared
messages. Footer URLs in preview files are placeholders, not a live inbox test.
The same drafts are visible in Resend. Templates are published internally only
because Resend requires that for a disabled automation to reference them;
publishing a reusable template does not send a message.

Before sending to subscribers:

1. Sean reviews the copy and recipient list. Do not send both the reconnect
   update and the monthly note to overlapping recipients at the same time.
   Start with the beta update, then wait at least a week before a separate note.
2. Apply the generated private deployment settings, retaining the stable
   unsubscribe key. Keep the sequence flag false.
3. Verify the live preference route and direct webhook endpoint. Keep the webhook
   enabled. Confirm the Hostinger reply inbox receives mail; the owner test checked
   the Reply-To header, not an actual incoming reply.
4. Website and owner-only native tests are complete. Review the revised branded
   test rather than the earlier plain campaign tests. Do not activate a subscriber
   send simply because a test passed.
5. Approve an individual broadcast or sequence activation separately. Review
   the actual recipient count immediately before sending. Do not auto-enroll
   historical contacts just because they were imported.

Operator actions, run with the existing environment loaded:

```
node --env-file=.env scripts/email-ops.mjs review
node --env-file=.env scripts/email-ops.mjs status person@example.com invited
```

The tool has no send or enable command. Its review guard rejects email sends,
broadcast scheduling, real enrollment events, and enabled sending automations.
Daily inbox monitoring remains a separate choice, not an implied feature.

## Claims and measurement

| Wording                                             | Evidence owner                                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Scan or look up supplements                         | App `lib/features/scanner/scanner_logic.dart` and scanner screens                                                               |
| Review product information and interaction warnings | App `lib/services/stack/stack_interaction_checker.dart`                                                                         |
| Coverage varies                                     | Pipeline `scripts/data/curated_interactions/curated_interactions_v1.json`; rules have specific ingredient and medication scopes |
| Newsletter provides general information             | Website signup collects an email, not the subscriber's medication list                                                          |

This is a source-code check, not a new clinical review or proof of the release
installed on every beta device. Do not add product counts, brand integrations,
real-user rankings, instant recall notifications, or personalized safety promises
without current evidence for the exact wording.

Measure useful replies, invitations accepted, confirmed first checks, recurring
problems, bounces, and complaints. Email opens and clicks do not prove app use.
Open and click tracking were off on the sending domain and remain off. Write
plain sentences; no double hyphens, em dashes, invented urgency, or generic wellness copy.

Validation: `pnpm test:email`, typecheck, lint, and production build. Mocked
delivery tests and the no-email provider probe do not establish inbox placement.

References:

- [Automation conditions](https://resend.com/docs/dashboard/automations/condition)
- [Automation unsubscribe behavior](https://resend.com/docs/dashboard/automations/send-email)
- [Contact topics](https://resend.com/docs/dashboard/contacts/manage-topics)
- [Individual API unsubscribe handling](https://resend.com/docs/dashboard/emails/add-unsubscribe-to-transactional-emails)
- [Provider idempotency window](https://resend.com/changelog/idempotency-keys)
