# PharmaGuide email copy — revised for review

November 5, 2026. This revision replaces the proposed marketing copy and poll-led journey in docs/14-email-journey-review.md and docs/15-email-copy-for-approval.md. Draft review. Resend draft setup is now authorized and in progress. Audience housekeeping is deployed so the existing three groups can be reused. Hosted revised emails and the waiting sequence remain off. No inbox tests, scheduling, subscriber sends or activation authorized. Updated again November 5 with founder voice, personal-benefit questions, the basket/stack explanation, scoped recall-notification wording and the Resend ownership plan.

## Direction

Start with a situation the reader knows. Show what they can understand with PharmaGuide. Give them something useful now. Keep the writing short, friendly and confident. Explain the technology through what it does, rather than calling it sophisticated. Do not request replies or poll answers during the waiting journey.

Use “everything you take” rather than “stack.” If needed: “Your stack is your basket of supplements and medications.” The audience remains the intended adult audience; simple language is a readability goal.

Proposed recurring signature: **Here's to taking good care of yourself.** It is an encouraging wish, not a promised health outcome. Alternative: **A little more clarity. A little more care.** Avoid implying illness reflects poor effort or that health guarantees wealth.

## Research behind the approach

Sources checked November 5, 2026:

- [Loewenstein, 1994, The Psychology of Curiosity](https://www.cmu.edu/dietrich/sds/docs/loewenstein/PsychofCuriosity.pdf): an influential theoretical review describes curiosity as noticing a gap in understanding. Application: open with a concrete question such as how to compare two bottles, then deliver an answer. This is a theoretical basis, not proof of email performance.
- [Gruber, Gelman and Ranganath, 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4252494/): laboratory experiments found better memory for material learned during high curiosity. Application: give each email one interesting question and a useful explanation. The study examined learning with trivia, not supplement email conversions.
- [Berger and Milkman, 2012](https://journals.sagepub.com/doi/10.1509/jmr.10.0353): their news-sharing research linked useful, interesting and surprising content with sharing; experiments also investigated emotional activation. Application: make the reader feel discovery and possibility. This does not establish that hype, fear, or any particular subject line will work for this list.
- [Chernev, Böckenholt and Goodman, 2015](https://chernev.com/wp-content/uploads/2017/02/ChoiceOverload_JCP_2015.pdf): a meta-analysis found that complexity, decision difficulty and uncertainty about preferences help explain when many options hinder decisions. Application: use the pharmacy aisle and a simple comparison framework. More choice is not always harmful, and this does not prove every supplement shopper feels overwhelmed.

The cadence and specific copy below are editorial recommendations. These studies do not establish the best timing, guarantee engagement, or show a small list cannot give useful feedback. Parking early reply requests is Sean's preferred experience.

## Product evidence and limits

Current local source inspection supports these capability categories, not qualification of every beta build or hosted data release:

- Evidence: app lib/features/product_detail/v2/sections/evidence_section.dart reads study matches, citations and evidence scope. Ingredient evidence is not automatically a study of the finished bottle. Research support is not proof a product is helping one individual.
- Medication and nutrient notes: app lib/services/stack/depletion_checker.dart consumes authored medication–nutrient relationships, evidence levels and sources; pipeline scripts/data/medication_depletions.json owns the underlying reference. Not all notes describe a true deficiency or depletion. Copy must not diagnose a deficiency.
- Reviewed safety alerts: app lib/services/safety_alerts/safety_alert.dart and safety_alert_repository.dart handle reviewed events, exact matching and verified release/cache behavior. Do not promise every FDA recall is covered, instant notices, complete lot-level matching, or personalized email monitoring.
- Combined review: app lib/services/stack/stack_intelligence_engine.dart composes existing warning, overlap and safety reports. Do not imply it can choose the single best supplement for every shopper.

Sean confirmed November 5 that recall notifications are a committed beta feature and engineering owns delivery. Include that commitment in the copy as forthcoming beta functionality; delivery qualification is not a blocker to reviewing or preparing these emails. Keep the match scope clear and do not claim every recall is covered. Other product claims must match their actual scope. No “first,” “only,” “nothing like it,” or market-uniqueness claim without substantiation.

## Who gets what

Retain the private November 5 recipient audit: 31 unique subscribed people, 30 beta and one newsletter-only; 16 are on both lists. Twenty-four beta contacts have no message in available Resend history. Missing history is not proof nobody ever emailed them.

Existing waiting beta subscribers receive catch-up email 1 once after approval and delivery-history checks. Those with earlier messages use the alternate opening. People in both lists receive one catch-up. No old subscriber receives overdue Day 5 and Day 14 emails. Sean subsequently clarified that both existing and new beta signups include monthly notes. Reconcile existing memberships under that explicit instruction, preserving prior topic/global opt-outs; never send a duplicate welcome.

New beta subscribers: email 2 immediately, email 3 on Day 5, email 4 on Day 14 while still waiting and subscribed. New newsletter-only subscribers: email 5. Brief requesters: email 9 instead of simultaneous duplicate welcomes. Newsletter subscribers: email 6 when appropriate, avoiding the new-beta journey and allowing at least seven days after catch-up or another general marketing note. Real invitations and post-access feedback are emails 7 and 8, subject to actual status. Waiting notes stop when invited.

## Shared presentation

Use src/emails/email-layout.cjs for every message: current logo, warm background, teal buttons and readable text. One main button per email. Keep the existing address, disclaimer and preference controls. Subject and preview are inbox text; the heading is inside the email. Metadata and operator instructions below are not sent.

From: Sean at PharmaGuide <hello@pharmaguide.io><br>
Reply-To: info@pharmaguide.io

Each body ends with:

Here's to taking good care of yourself.

Sean<br>
Founder, PharmaGuide

The footer follows the signature. Exact footer variants are below.

## 1. Existing beta subscribers — catch-up

**Subject:** So many supplements. Which ones deserve your money?<br>
**Preview:** A closer look at what we're building, plus something free for you.<br>
**Heading:** You shouldn't have to guess.

You joined the PharmaGuide beta a while back. My team and I have been working hard, and I'm excited to show you more of what we've been building.

You walk into the pharmacy for a supplement. A whole shelf promises the same thing.

Which one do you choose? Does it do what it says? And how does it fit with everything you already take?

A way to look beyond the bottle: understand the research, see relevant warnings, and spot ingredients you may already be taking in another product.

Think of it as turning the bottle around, with more of the story in view.

If you haven't seen it yet, our free Supplement Safety Brief is yours to download. It includes a shopping checklist and a worksheet for your next pharmacy visit.

**[Get your free brief](https://pharmaguide.io/supplement-safety-brief.pdf)**

[Explore PharmaGuide features](https://pharmaguide.io/features)

You're already on the beta list. No need to sign up again. I'll send your invitation separately when your place is ready.

[Shared signature and footer B]

**Operator note:** Same body can serve eligible waiting subscribers with or without earlier welcomes. Review recent sends and brief delivery before targeting; defer a duplicate resource offer. Do not suggest their silence has gone unnoticed or that an email was never sent without evidence.

## 2. New beta signup — welcome

**Subject:** Welcome to the PharmaGuide family 🧡
**Preview:** You're here early, and I'm glad you found us.
**Heading:** Welcome to the PharmaGuide family.

You're here early, and I'm glad you found us.

Around here, we look beyond the label.

- **Does it do what it says?**
- **What research backs it up?**
- **Does it fit with your medications?**
- **Are you already taking the same ingredient in another product?**

And the big one: **how would you know if it's helping you?**

You don't need to know all the answers to belong here. That's why we're building PharmaGuide.

My team and I have been working hard to make supplement labels, research and warnings easier to understand—with sources you can check yourself.

Whether you're choosing your first supplement or taking a closer look at your daily routine, welcome. Let's learn more about what we put in our bodies, together.

While you wait, here's a free guide you can use today. The Supplement Safety Brief includes a shopping checklist and a worksheet for your next pharmacy visit.

**[Get your free brief](https://pharmaguide.io/supplement-safety-brief.pdf)**

**[Explore PharmaGuide features](https://pharmaguide.io/features)**

[Only when newsletter enrollment is confirmed: include the newsletter acknowledgment.]

Over the next two weeks, I'll show you more. Your beta invitation will come separately when a place is ready.

[Shared signature and footer B; all unsubscribe links below the sign-off.]

## 3. Beta Day 5 — does it do what it says?

**Subject:** A good label. But what backs it up?<br>
**Preview:** You take it every day. How do you know what to expect?<br>
**Heading:** The promise is easy. What backs it up?

“Supports energy.” “Helps you focus.”

Sounds good. But does it do what it says? And how would you know if it's working for you?

Those are the questions I want PharmaGuide to help you untangle.

First, what's behind the promise? PharmaGuide helps you find and understand research linked to the ingredients in a product. Was it studied in people? What did they find? Was the actual product tested, or just an ingredient inside it?

Think of the label as a movie trailer. It gives you the pitch. The research gives you more of the story.

Then there's you. Research can help explain what to expect. It can't tell us from a scan whether you're personally getting that benefit.

That difference matters. My team and I are building PharmaGuide to help you see what the research supports, and where the answer is still unclear.

For a practical example, here's how to look past the claims on a shilajit label and read the lab report behind it.

**[Look beyond the label](https://www.pharmaguide.io/blog/shilajit-heavy-metals-label-claims)**

[Shared signature and footer A]

**Operator note:** No promise that the app measures individual benefit or settles every claim as true/false. Do not add clinical examples, expected timelines or testing instructions without reviewed support.

## 4. Beta Day 14 — recalls and your stack

**Subject:** What if a supplement you take gets recalled?
**Preview:** What happens when you take them together?
**Heading:** One bottle is only part of the story.

Think of everything you take as one basket: your supplements and medications.

In PharmaGuide, we call that your **stack**. Your stack is your basket: one list of everything you take.

Now the questions get more interesting.

Are two bottles giving you the same ingredient? Could a supplement interact with a medication? Could your supplements interact with each other, too? Are there medication-related nutrient changes worth understanding?

The same nutrient can show up in several products, so the amounts can add up without you noticing the overlap. Too much of some nutrients can be harmful. For example, too much preformed vitamin A over time can cause liver problems.

[Source: NIH vitamin A guide](https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/)

And what if a supplement in that basket gets recalled? How would you hear about it?

That's part of what my team and I have been working on: connecting the information to the products on your list.

We're building a notification system that checks FDA recall notices against the supplements in your stack, so you can get a heads-up when something you take is recalled. With notifications turned on, open the app to see what's been flagged and why.

It won't cover every recall or every product. But you won't have to rely only on spotting a matching recall in the news.

That's the bigger picture I'm excited for you to explore.

Want to look at one piece of it now? This guide explains medication and nutrient links, without jumping straight to “buy another supplement.”

[Explore the medication and nutrient guide](https://www.pharmaguide.io/blog/medication-depletion-guide)

[Shared signature and bottom unsubscribe footer.]

## 5. Newsletter welcome

**Subject:** A little clarity for your next supplement choice.<br>
**Preview:** Your free guide is inside. No extra signup needed.<br>
**Heading:** Start with better questions.

The supplement aisle has plenty of promises. Knowing which ones to trust can be hard.

Welcome to PharmaGuide's monthly notes. We make room for the useful questions: what backs up a claim, what a label tells you, and what to ask before adding another bottle.

Start with our free Supplement Safety Brief. It includes a shopping checklist and a worksheet for your next pharmacy visit.

**[Get your free brief](https://pharmaguide.io/supplement-safety-brief.pdf)**

About once a month, we'll send something worth knowing. A clear guide, a closer look at the research, or a real PharmaGuide update.

These are general updates, not personal health advice or alerts about products you take. Monthly notes and beta invitations are separate subscriptions.

[Shared signature and footer N]

**Operator note:** Last sentence applies only to newsletter-only signups. Omit it for existing beta members. Do not send an extra welcome alongside emails 1, 2 or 9.

## 6. First monthly note — different resource from Day 5

**Subject:** Before you add another supplement, read this.<br>
**Preview:** Medication and nutrient claims can leave out an important part of the story.<br>
**Heading:** A reason to look closer. Not rush to buy.

You've seen the claim: a medication can affect a nutrient. Does that mean you need another supplement?

That's exactly the kind of question I want to make easier to understand.

Our medication and nutrient guide takes a closer look at those claims: what the research says, where the answers differ, and what questions to bring to your pharmacist.

My team and I have been working to make the information behind these questions easier to find, so you're not left piecing it together from a headline.

**[Read the medication and nutrient guide](https://www.pharmaguide.io/blog/medication-depletion-guide)**

[Shared signature and footer N]

**Operator note:** Different article from Day 5. This resource is also used in Day 14. This issue is for catch-up/newsletter-only readers who have not received that guide recently. New beta subscribers completing Day 14 do not receive this issue; defer their monthly note until a distinct reviewed resource is ready. Do not substitute an unreviewed article merely to fill the calendar. No reply request or unsupported new product announcement.

## 7. Beta invitation — real selected place only

**Subject:** You're in. Let's put PharmaGuide in your hands.<br>
**Preview:** Your place in our small beta group is ready.<br>
**Heading:** Congratulations. You're in.

I've been looking forward to sending you this.

You've been selected to join our small PharmaGuide beta group. Your place is ready.

My team and I have been working on the details behind what you'll see: the product information, the research and the checks that help put it together. Now I'm excited for you to explore it.

**[Start exploring PharmaGuide — verified access link required]**

Start with one supplement. Look it up. See what's behind the label. Then build your basket of the supplements and medications you take. That's your **stack**.

You're joining at a stage where your experience can help shape what we improve next. I'll check in after you've had a chance to try it.

Thanks for being part of this. I can't wait for you to take a look.

[Shared signature and footer B]

**Operator note:** “Selected,” “small group” and “ready” must reflect the actual allocated place. Provide verified access link/platform instructions before sending. Mark invited first; waiting notes then stop. No invented deadline, market-first claim, guaranteed result or free-lifetime offer.

## 8. Feedback — after about a week of confirmed access

**Subject:** Help shape what PharmaGuide does next.<br>
**Preview:** A few words can help make the next version better.<br>
**Heading:** Your idea could help shape what's next.

You've had a little time with PharmaGuide. We hope it's helped make something clearer.

What would make it better for you?

Hit reply and finish any one of these:

**I liked…**

**I got stuck when…**

**I wish it could…**

A few words are enough. A missing feature, a confusing screen, or something you'd love to see: it all helps.

No need to answer everything. If you haven't tried it yet, that's okay too.

Please leave out personal health details. We're interested in your experience with the app.

Thanks for helping shape what comes next.

[Shared signature and footer B]

**Operator note:** One message after confirmed access; no waiting-list feedback request. No new form or feedback buttons implied. Reply is the working interaction through info@pharmaguide.io. Do not promise every suggestion will be built or that replies are automatically monitored.

## 9. Requested free brief — delivery

**Subject:** Your free Supplement Safety Brief is here.<br>
**Preview:** A shopping checklist and a worksheet for your next pharmacy visit.<br>
**Heading:** A clearer place to start.

Here's the Supplement Safety Brief you requested.

Use the checklist when you're looking at a supplement. Save the worksheet for your next pharmacy visit. You don't need to work it all out at once.

**[Open your free brief](https://pharmaguide.io/supplement-safety-brief.pdf)**

[Only if newsletter subscription is confirmed:] You're also signed up for our monthly notes: clear guides and useful PharmaGuide updates, about once a month. These are general updates, not personal product alerts.

[If beta subscription is confirmed:] You're on the beta list too, as explained on the request form. We'll send a separate invitation when a testing place is ready.

[Otherwise, instead of the previous paragraph:] We couldn't confirm an active beta subscription for this address. For help with your email preferences, contact info@pharmaguide.io.

The brief is for learning, not a personal treatment plan. Your pharmacist or clinician can help with questions about what you take.

[Shared signature and footer D]

**Operator note:** Send only the applicable paragraphs, with existing consent rules preserved. No duplicate welcome at that moment. Preference help is service support, not an early feedback request.

## Shared footer text and preference behavior

B: “You joined the PharmaGuide beta list. PharmaGuide provides information, not medical advice.” Link: “Unsubscribe from beta invitations and updates.” Use beta-topic unsubscribe for native beta broadcasts and the existing signed beta-only preference mechanism for website/manual messages.

A: Same beta reason and disclaimer. Links: “Unsubscribe from all marketing” (native automation URL) and “Stop beta updates only” (signed beta-only URL). Do not label the native global link beta-only.

N: “You subscribed to PharmaGuide's monthly notes. PharmaGuide provides information, not medical advice.” Link: “Unsubscribe from monthly notes.”

D: “You requested the Supplement Safety Brief. PharmaGuide provides information, not medical advice.” Show available beta and newsletter preference links without changing prior opt-outs.

Every footer ends: PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02114.

## Resend as the email control center

Sean wants to manage copy, automations, broadcasts, contacts and subscriber groups in Resend. This is the target, not the current implementation.

- Native templates for every email in this review, using the existing visual theme. Imported HTML uses the Resend code editor (the drag-and-drop editor is disabled for these templates). Draft edits and publishing in Resend control future sends. Maintain a dated exported copy for review/backup; do not let a later repository upload silently overwrite dashboard edits.
- The website currently renders beta/newsletter welcomes and the brief in code and passes HTML to Resend. Migrate those sends to stable Resend template IDs/aliases and variables before calling them dashboard-editable. Preserve signup consent, delivery receipts, idempotency, topic preferences and unsubscribe headers. Creating dashboard copies alone does not change what the website sends.
- Keep the existing waiting automation, amend its template content and remove the poll from the send path. Preserve Day 5/Day 14 delays and checks. Never auto-enroll old contacts as catch-up. Publish qualified templates before activation; verify the automation references the intended versions.
- Manage beta waiting and newsletter subscriber groups through Segments and Topics. Segments organize people; Topics express subscription preferences. Membership alone must not override opt-outs. Prepare an explicit one-time catch-up cohort from fresh history/preference readback and exclude tests, suppression and recent conflicting sends.
- Create catch-up and each reviewed newsletter as separate native broadcast drafts. Invitations and feedback stay conditional sends tied to actual beta stage. Do not trigger either from opens/clicks.
- Delivery logs and broadcast reporting stay in Resend. Sean explicitly approved open/click tracking on November 5; both are enabled on pharmaguide.io. Report deliveries, failures, bounces, complaints and opt-outs. Opens are estimates and do not establish reading, benefit or app use. Track feedback replies in the existing Hostinger inbox; do not claim those replies are managed in Resend.
- App recall notifications remain on the app/pipeline push system. Do not send sensitive product lists or health details to Resend to imitate those alerts. “Everything in Resend” here means this email program, not the app's safety matching.

Verified November 5 sources: [Resend templates](https://resend.com/docs/dashboard/templates/introduction), [template draft/publish behavior](https://github.com/resend/resend-skills/blob/main/skills/resend/references/templates.md), [broadcast reporting and open-rate limitations](https://resend.com/docs/dashboard/broadcasts/performance-tracking).

## Before approval and activation

Sean reviews these bodies, subjects, signature and revised Day 14. The actual branded renders, exact current recipients, working links and email preference behavior still require verification before subscriber sends. Recall-notification delivery is owned by engineering, as Sean directed; its committed beta inclusion is reflected in the copy. Earlier copy is superseded, not approved. No production changes or activation until explicit approval of this revision.

## November 5: explicit signup and owner-test approvals

Sean approved NEW beta form submissions also joining monthly notes, disclosed before joining, while preserving earlier opt-outs. Sean later explicitly confirmed that existing beta signups also belong to monthly notes. That permits reconciling their newsletter segment membership without overriding prior opt-outs or sending a new welcome. Only one beta welcome is sent; no separate newsletter welcome or receipt is created by bundled enrollment. A previous beta member may explicitly submit the updated form to join monthly notes, subject to prior opt-outs; that does not trigger another beta welcome. The monthly paragraph and preference link are conditional on confirmed enrollment.

Sean also approved owner-only inbox tests of all nine current drafts. Nine numbered tests were delivered, plus one refreshed beta-welcome preview after the monthly-note change. Private receipts are kept in .tmp/email-review/. Preview preference/access links are harmless stand-ins and no subscription preferences were changed by the tests. Domain tracking was enabled after the first four tests; it applies to later sends. No audience broadcast, enrollment event, template publication or automation activation is approved by these tests.

## Existing beta subscribers are part of monthly notes

Sean explicitly clarified that monthly notes are included for old and new beta signups. The active monthly-notes segment is the single recipient list for future general monthly issues. The beta segment continues to own beta-stage communications, and the campaign queue owns one explicitly selected campaign at a time. Overlap between these lists does not create extra Contact records or authorize duplicate sends. Keep all current drafts held until Sean supplies and approves the monthly issue. A beta-only opt-out does not remove a separately active monthly preference; a monthly opt-out must not be restored by reconciliation. No welcome or overdue waiting-sequence emails are sent by membership alignment.
