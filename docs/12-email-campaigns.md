# 12 — Email Campaigns

All transactional + manual email copy lives here. Single source of truth.
Welcome emails ship from `src/emails/*.tsx` (React Email components). Everything
in this doc is **copy-only** — paste into Resend Automations, Resend Broadcasts,
or your personal mail client.

---

## Voice & legal quick-reference

| Surface | Voice | Footer requirements |
|---|---|---|
| **Drip 1–3** (beta waitlist) | Brand voice: calm, precise, italic-serif punchlines, second-person, no exclamations | Physical address (CAN-SPAM) + unsubscribe link |
| **Reactivation** (old subscribers) | Brand voice, warmer | Physical address + unsubscribe |
| **Friends & Family** (Sean's personal send) | Personal, warm, genuinely excited — drop the brand restraint, you're writing to people who love you | None — personal email, not commercial |

**CAN-SPAM footer** (copy-paste for any Resend send):
```
PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02124
Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}
```

**Sending map:**

| Message | Tool | Trigger |
|---|---|---|
| Day 5 / 14 / 28 drips | Resend → Automations | Contact added to "Beta Waitlist" audience |
| Reactivation | Resend → Broadcasts | One-off send to "Beta Waitlist" segment, filter: joined > 60 days ago |
| Friends & Family | Your personal email (Gmail/Outlook) | BCC list, sent from seancheick@gmail.com |

---

## Drip 1 — Day 5 — Why we built PharmaGuide

**Subject:** Why pharmacists wouldn't answer my question
**Preview text:** The conversation that became this whole thing.
**From:** PharmaGuide <info@pharmaguide.io>
**Send when:** 5 days after waitlist signup
**Audience:** Beta Waitlist

---

Hey —

A few years ago I walked into a pharmacy holding a bottle of fish oil and a
prescription for atorvastatin, and asked a simple question: *do these
interact?*

The pharmacist looked at the prescription, then at me, then back at the
prescription. "We don't really cover supplements."

I tried three more pharmacies. Same answer. *Supplements aren't our scope.*

So I asked my doctor. Same shrug. *Ask the pharmacist.*

The thing is — interactions like this are documented. Calcium can reduce
thyroid medication absorption by up to 30% if taken together. Metformin is
associated with lower B12 levels over time. There's *literature* on all of
this. It just sits in a place where the people who could read it to you have
decided it isn't their job.

That's why PharmaGuide exists.

We built the thing the pharmacist wouldn't, the doctor couldn't, and the
supplement aisle definitely wasn't going to. *One check, across your full
stack — medications and supplements, together.*

Not a quiz. Not a vibes-based "wellness score." A real analysis: interactions,
medication-nutrient depletions, dose accumulation across products, ingredient
quality, FDA recalls. Graded by evidence strength, with the citations attached.

Beta opens soon. You'll be one of the first in.

— Sean
Founder, PharmaGuide

---

PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02124
Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}

---

## Drip 2 — Day 14 — Inside the database

**Subject:** Inside the database — 180,000 products and counting
**Preview text:** Where the data comes from, and why that matters.
**From:** PharmaGuide <info@pharmaguide.io>
**Send when:** 14 days after waitlist signup
**Audience:** Beta Waitlist

---

Hey again —

Quick one. Got a few "how do you actually know what's in my supplement" emails
after the last note, so here's the answer.

The PharmaGuide catalog covers **180,000+ products** — supplements, OTC meds,
and a growing prescription drug index. The data comes from four places that
disagree with each other constantly, which is exactly the point of having
all four:

- **NIH Dietary Supplement Label Database (DSLD)** — the FDA-aligned
  label-of-record for supplements sold in the US. The ground truth.
- **FDA drug labeling + recall sources** — active drug ingredients, dose
  strengths, and the recall pipeline.
- **FAERS** — adverse event signals. Helps surface safety concerns that
  require context, not just theoretical interaction risk.
- **Manufacturer label scrapes + brand-direct integrations** — for the
  proprietary blend gap. (Yes, we decompose those too.)

When the same product shows up across all four sources with conflicting dose
labels — and it happens more than you'd think — we surface the disagreement
instead of picking one. *Your check is only as good as what's behind it.*

That's also why we don't sell your stack data. You shouldn't have to wonder
who else is reading what you swallow.

Beta opens soon.

— Sean

---

PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02124
Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}

---

## Drip 3 — Day 28 — Read while you wait

**Subject:** A few reads while you wait
**Preview text:** Three pieces worth your time before beta opens.
**From:** PharmaGuide <info@pharmaguide.io>
**Send when:** 28 days after waitlist signup
**Audience:** Beta Waitlist

---

Hey —

Beta's getting close. While you wait, three things from the blog that are
worth the ten minutes:

**→ The interactions almost nobody warns you about**
The five most common supplement-medication conflicts we catch in real user
stacks. Evidence-graded, no fluff.
*(/blog/most-common-interactions)*

**→ What "proprietary blend" actually hides**
A look at what a manufacturer is legally allowed to leave off the label,
and what we do about it.
*(/blog/proprietary-blends-decoded)*

**→ Why your multivitamin and your statin are arguing**
Medication-nutrient depletions, the category most clinicians skip
entirely. Worked through with one real example.
*(/blog/statins-and-coq10)*

If any of those resonate, hit reply and let me know — the blog roadmap is
shaped more by what waitlist readers ask about than by SEO research.

*Almost there.*

— Sean

---

PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02124
Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}

---

> **Note:** Update the three blog URLs above to your actual top-performing
> posts before sending. The titles in this draft are placeholders chosen to
> match topics likely in the catalog — swap them for whatever's actually
> live and getting reads at the time you wire the automation.

---

## Reactivation — old subscribers

**Subject:** We went quiet on purpose
**Preview text:** Heads down for months. The result is live.
**From:** PharmaGuide <info@pharmaguide.io>
**Send when:** One-off broadcast, anytime post-launch
**Audience:** Beta Waitlist, filter: signed up > 60 days ago AND not engaged in last 30 days

---

Hey —

You signed up for PharmaGuide a while back, and then we went quiet. That
wasn't an accident.

We've been heads down — rebuilding the site, rewriting the engine, and
training the chatbot so it doesn't say anything we can't back up with a
citation. The early version we could've shipped six months ago wasn't good
enough. So we didn't ship it.

*The version we wanted to ship is now live.*

A quick tour of what's new:

- **A redesigned site** at [pharmaguide.io](https://www.pharmaguide.io) —
  the full product story, not just a signup form.
- **A new chatbot** that can actually walk you through a real interaction
  check, citing the evidence as it goes. Not a sales bot, not a wellness
  chatbot — a clinical-grade engine in conversation.
- **A live blog** with evidence-graded pieces on the interactions,
  depletions, and ingredient-quality questions we get asked most.
- **180,000+ products** in the catalog. Beta access opening to waitlist
  in the coming weeks — you're still on the list.

If you want to come back and look around, the door's open. If your needs
have shifted and you'd rather not hear from us, the unsubscribe link below
is honest and one-click — no offense taken.

Either way, thanks for waiting.

— Sean
Founder, PharmaGuide

---

PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02124
Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}

---

## Friends & Family — personal launch announcement

**Subject:** What I've been heads down on (and a gift for you)
**Preview text:** Two years of work. Free forever for you.
**From:** seancheick@gmail.com (your personal Gmail)
**Send when:** Launch day, sent BCC to your personal contact list
**Audience:** Friends, family, mentors — your people

> **Note:** This is a personal email, not a marketing send. No CAN-SPAM
> footer, no unsubscribe link, no Resend involvement. Write it from your
> personal Gmail, BCC the list so nobody sees each other's addresses, and
> sign it as Sean.

---

Hey —

You've probably heard me bring up "PharmaGuide" a few too many times over
the last couple of years. Today's the day I get to actually show you.

**[pharmaguide.io](https://www.pharmaguide.io)** is live.

In one sentence: it's the supplement and medication co-pilot I wished
existed when I first walked into a pharmacy asking whether my supplements
were going to fight with my prescription — and got told *"we don't cover
that."*

It does what nobody else will:

- Checks every supplement and medication you take, *together*, for real
  interactions — the kind backed by clinical evidence, not chatroom rumor.
- Catches what your medications may be quietly *taking away* from you —
  some medications are associated with lower nutrient levels over time,
  like metformin and B12, and most clinicians won't mention it.
- Decodes what's actually inside a "proprietary blend" so you stop paying
  for pixie dust.
- Flags FDA recalls and adverse-event signals on products you're already
  taking, the moment they happen.

180,000+ products in the catalog. Real citations. No vibes, no horoscope.
Just the answer to *"is this safe for me, given everything else I'm
on?"* — finally, in one place.

**Here's the part for you specifically:**

PharmaGuide is **free forever** for my close people. Just sign up at
[pharmaguide.io](https://www.pharmaguide.io) and I'll make sure your
account is unlocked on the house — no time limit, no "free trial that
becomes a charge" nonsense. Forever.

If you have parents on five medications and a kitchen counter full of
supplements? Sign them up too. If you have a friend who's been on
medication for years and nobody's ever checked what else it might
affect? Send them this email. The whole reason I built this
is the people I love kept getting hurt by a system that wasn't paying
attention.

Reach out — text, call, email — for *anything*. Questions about the
product, questions about how to use it, questions about what to ask
your clinician. I'll help you understand the tool and get the most
out of it.

Thank you for putting up with me talking about this for two years. The
work is real now. Let's get healthy together.

— Sean

P.S. If you have a moment and you like what you see, the single best
thing you can do for me today is forward this to one person you think
would actually use it. That's how things spread. ❤️

---

## Wiring checklist

When you sit down to actually send these, in this order:

- [ ] **Drips 1–3 in Resend Automations**
  - Open Resend → Automations → New
  - Trigger: "Contact added to audience: Beta Waitlist"
  - Step 1: Wait 5 days → Send email (paste Drip 1 HTML)
  - Step 2: Wait 9 days → Send email (paste Drip 2 HTML)
  - Step 3: Wait 14 days → Send email (paste Drip 3 HTML)
  - Toggle ON
  - **Important:** Before toggling on, run a test send to `seancheick+drip1@gmail.com` and verify it lands and renders in Gmail web + iOS Mail.
- [ ] **Reactivation as a Broadcast**
  - Resend → Broadcasts → New
  - Audience: Beta Waitlist, filtered to "created_at > 60 days ago"
  - Schedule for a Tuesday or Wednesday, 10am Eastern (best open rates)
- [ ] **Friends & Family from personal Gmail**
  - Compose in Gmail
  - **BCC** everyone — never To/CC; respect their privacy
  - Send from your personal address, not info@
  - Don't auto-send — proofread once more before hitting go

---

## Rendering the drip HTML

Drips 1–3 are written as plain markdown above. To get sendable HTML for
Resend, you have two options:

**Option A — quick & dirty (15 min, no code):**
Paste the markdown into a markdown-to-html converter (e.g. dillinger.io
or hashnode's preview), strip the resulting `<html>/<body>` wrapper, and
paste the inner HTML into Resend's "HTML" email editor. Style with their
defaults. Good enough for v1.

**Option B — branded templates (60 min, one commit):**
Convert each drip into a React Email component under
`src/emails/drip/Day5.tsx`, `Day14.tsx`, `Day28.tsx`. Mirror the
`BetaWelcomeEmail.tsx` structure (logo row, Container, footer with
address + unsubscribe). Add a `pnpm render-drips` script that outputs
`./out/drip-day-5.html` etc. Paste those into Resend's HTML editor.
Looks identical to the welcome email. Recommended once you have
breathing room post-launch.

The copy in this doc is the source of truth either way — if you tweak the
words, tweak them here first, then propagate.

---

## Changelog

- **2026-05-11** — Initial draft. Drip 1/2/3 + Reactivation + Friends & Family.
