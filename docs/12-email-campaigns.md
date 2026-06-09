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

**Claim-language guardrails (apply to every drip, broadcast, and personal send):**

PharmaGuide is decision support, not medical advice. Email copy should
reflect that — both for clinical-risk reasons and because over-claiming
erodes the calm-clinical credibility the brand depends on.

| ❌ Avoid | ✅ Use |
|---|---|
| "Reduces absorption by X%" *(without a cited study in the email)* | "Can interfere with absorption when taken too close together" |
| "FDA-aligned," "label-of-record," "ground truth" | "A major public reference," "one of the strongest public reference points" |
| "We decompose / decode proprietary blends" | "We flag blends and surface what can and can't be verified" |
| "Real interactions vs. chatroom rumor" | "Evidence-graded interaction signals" |
| "Is this safe for me?" *(implies clinical answer)* | "What should I know before taking this with everything else in my stack?" |
| "The thing the pharmacist wouldn't, the doctor couldn't" | "The tool between the pharmacy counter, the doctor's office, and the supplement aisle" |

**Trust the reader.** Specifics are good; absolute claims are not. If you
quote a study figure ("up to 30%"), the citation rides along in the same
email or on the linked page. Otherwise, soften.

**Sending map:**

| Message | Tool | Trigger |
|---|---|---|
| Day 5 / 14 / 28 drips | Resend → Automations | Contact added to "Beta Waitlist" audience |
| Reactivation | Resend → Broadcasts | One-off send to "Beta Waitlist" segment, filter: joined > 60 days ago |
| Friends & Family | Your personal email (Gmail/Outlook) | BCC list, sent from seancheick@gmail.com |

---

## Drip 1 — Day 5 — Why we built PharmaGuide

**Subject:** "Probably fine" is not an answer
**Preview text:** The pharmacy-counter question that started all this.
**From:** Sean at PharmaGuide <info@pharmaguide.io>
**Send when:** 5 days after waitlist signup
**Audience:** Beta Waitlist
**Primary KPI:** reply rate

---

Hey —

A few years ago I stood at a pharmacy counter with a bottle of fish oil
and a prescription for atorvastatin, and asked what I thought was a simple
question: *do these interact?*

The pharmacist was generous with his time. He glanced at the bottle and
said, "Those should be fine — maybe space them out a bit."

That was the whole answer. Not because he didn't know his field — because
the systems behind the counter aren't built for the question. Pharmacy
software checks drugs against drugs, automatically, every time. The
supplement half of my question wasn't in the system at all.

My doctor's office, same structural problem: a fifteen-minute visit has
room for the prescriptions, and the supplement list — if it comes up at
all — gets a "probably fine" on the way out the door.

Here's what stuck with me. When I eventually dug through the literature
myself, the answer was mostly reassuring. The frustrating part was never
the answer — *it was that nobody could show me the evidence.* And for
plenty of other combinations, it isn't reassuring at all: calcium can
interfere with thyroid medication absorption when taken too close
together. Metformin is associated with lower B12 levels over time. It's
all documented. It just sits where most people can't reach it.

That's why PharmaGuide exists.

We built the tool I wished existed between the pharmacy counter, the
doctor's office, and the supplement aisle. *One check, across your full
stack — medications and supplements, together.*

Not a quiz. Not a vibes-based "wellness score." Evidence-graded decision
support: interaction signals, medication-nutrient depletions, dose
accumulation across products, ingredient quality, FDA recalls. With the
citations attached.

Beta invites go out in order of signup — you're in the first wave.

One ask while you wait: **hit reply and tell me the one question about
your stack you've never gotten a straight answer on.** An interaction, an
ingredient's quality, a brand you're not sure about — whatever it is.
I read every reply, and the answers shape what we build and write next.

— Sean
Founder, PharmaGuide

---

PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02124
Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}

---

> **Authenticity note:** the pharmacy scene above must be *your* real one.
> If the actual pair wasn't fish oil + atorvastatin, swap in whatever you
> were carrying that day — the copy works with any combination, and a true
> detail always reads truer than an optimized one.

---

## Drip 2 — Day 14 — Inside the database

**Subject:** Inside the database — 180,000 products
**Preview text:** Where the data comes from, and why that matters.
**From:** Sean at PharmaGuide <info@pharmaguide.io>
**Send when:** 14 days after waitlist signup
**Audience:** Beta Waitlist
**Primary KPI:** click-through to the linked post

---

Hey again —

Quick one. Got a few "how do you actually know what's in my supplement" emails
after the last note, so here's the answer.

The PharmaGuide catalog covers **180,000+ products** — supplements, OTC meds,
and a growing prescription drug index. The data comes from four places that
disagree with each other constantly, which is exactly the point of having
all four:

- **NIH Dietary Supplement Label Database (DSLD)** — a major public label
  database for supplements sold in the US. One of the strongest public
  reference points we have.
- **FDA drug labeling + recall sources** — active drug ingredients, dose
  strengths, and the recall pipeline.
- **FAERS** — adverse event signals. Helps surface safety concerns that
  require context, not just theoretical interaction risk.
- **Manufacturer label scrapes + brand-direct integrations** — for the
  proprietary blend gap. (We flag those blends and surface what can and
  can't be verified.)

When the same product shows up across all four sources with conflicting dose
labels — and it happens more than you'd think — we surface the disagreement
instead of picking one. *Your check is only as good as what's behind it.*

That's also why we don't sell your stack data. You shouldn't have to wonder
who else is reading what you swallow.

If you want to see what this looks like in practice, start here:

**→ [What "proprietary blend" actually hides](https://www.pharmaguide.io/blog/proprietary-blends-decoded?utm_source=resend&utm_medium=email&utm_campaign=drip-day14)**

You're one of [N] people on the waitlist — invites go out in order of
signup, and you're in the first wave.

— Sean

---

PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02124
Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}

---

> **Before sending:** replace `[N]` with the real waitlist count, rounded
> down. If the number is still small, cut the "[N] people" clause and keep
> only the wave sentence — never inflate. Swap the linked post for whatever
> deep-dive is actually live; keep the `utm_campaign=drip-day14` tag.

---

## Drip 3 — Day 28 — Read while you wait

**Subject:** The 5 interactions we catch most often
**Preview text:** Evidence-graded, plus two more reads before beta opens.
**From:** Sean at PharmaGuide <info@pharmaguide.io>
**Send when:** 28 days after waitlist signup
**Audience:** Beta Waitlist
**Primary KPI:** blog click-through

---

Hey —

Beta's getting close. While you wait, three things from the blog that are
worth the ten minutes:

**→ [The interactions almost nobody warns you about](https://www.pharmaguide.io/blog/most-common-interactions?utm_source=resend&utm_medium=email&utm_campaign=drip-day28)**
The five most common supplement-medication conflicts we catch in real user
stacks. Evidence-graded, no fluff.

**→ [What "proprietary blend" actually hides](https://www.pharmaguide.io/blog/proprietary-blends-decoded?utm_source=resend&utm_medium=email&utm_campaign=drip-day28)**
A look at what a manufacturer is legally allowed to leave off the label,
and what we do about it.

**→ [Why your multivitamin and your statin are arguing](https://www.pharmaguide.io/blog/statins-and-coq10?utm_source=resend&utm_medium=email&utm_campaign=drip-day28)**
Medication-nutrient depletions, the category most clinicians skip
entirely. Worked through with one real example.

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
> live and getting reads at the time you wire the automation. The first
> slot must match the subject line's promise (the 5-interactions piece);
> keep the `utm_campaign=drip-day28` tag on whatever you swap in.

---

## Reactivation — old subscribers

**Subject:** We went quiet on purpose
**Preview text:** Heads down for months. The result is live.
**From:** Sean at PharmaGuide <info@pharmaguide.io>
**Send when:** One-off broadcast, anytime post-launch
**Primary KPI:** clicks + unsubscribes (clicks = re-engaged; unsubscribes =
list cleaning — both are wins; complaints over 0.10% are the only failure)
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

- **A redesigned site** — the full product story, not just a signup form.
- **A new chatbot** that can actually walk you through a real interaction
  check, citing the evidence as it goes. Not a sales bot, not a wellness
  chatbot — a clinical-grade engine in conversation.
- **A live blog** with evidence-graded pieces on the interactions,
  depletions, and ingredient-quality questions we get asked most.
- **180,000+ products** in the catalog. Beta access opening to waitlist
  in the coming weeks — you're still on the list.

If you want to come back and look around, the door's open:

**→ [pharmaguide.io](https://www.pharmaguide.io?utm_source=resend&utm_medium=email&utm_campaign=reactivation)**

If your needs have shifted and you'd rather not hear from us, the
unsubscribe link below is honest and one-click — no offense taken.

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

> **Operational note — decide BEFORE sending:** "free forever" needs a
> mechanism or it becomes support debt. Pick one: a dedicated promo code,
> or a `friends-family` tag applied manually to their account the day they
> sign up (keep the BCC list as your checklist). The promise is only as
> good as the flag that honors it.

---

Hey —

You've probably heard me bring up "PharmaGuide" a few too many times over
the last couple of years. Today's the day I get to actually show you.

**[pharmaguide.io](https://www.pharmaguide.io)** is live.

In one sentence: it's the supplement and medication co-pilot I wished
existed when I first walked into a pharmacy asking whether my supplements
were going to fight with my prescription — and got told *"we don't cover
that."*

It brings together the pieces most people still have to check separately:

- Checks every supplement and medication you take, *together*, and
  flags evidence-graded interaction signals across your full stack.
- Catches what your medications may be quietly *taking away* from you —
  some medications are associated with lower nutrient levels over time,
  like metformin and B12, and most clinicians won't mention it.
- Surfaces what's verifiable inside a "proprietary blend" — and what
  isn't — so you can see exactly what you're paying for.
- Flags FDA recalls and adverse-event signals on products you're already
  taking, the moment they happen.

180,000+ products in the catalog. Real citations. No vibes, no horoscope.
Just decision support for the question *"what should I know before taking
this with everything else in my stack?"* — finally, in one place.

**Here's the part for you specifically:**

PharmaGuide is **free forever** for my close people. Just sign up at
[pharmaguide.io](https://www.pharmaguide.io) and I'll make sure your
account is unlocked on the house — no time limit, no "free trial that
becomes a charge" nonsense. Forever.

If you have parents on five medications and a kitchen counter full of
supplements? Sign them up too. If you have a friend who's been on
medication for years and nobody's ever checked what else it might
affect? Send them this email. The whole reason I built this
is the people I love kept getting left to figure this out on their own.

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

## Measurement

Apple Mail Privacy Protection pre-fetches images, so open rates run
inflated and are directional at best. Judge every send by clicks and
replies, not opens:

| Email | Primary KPI | Healthy signal |
|---|---|---|
| Drip 1 | Reply rate | Any genuine replies — each one also boosts deliverability |
| Drip 2 | Click-through to linked post | ~2–4% of delivered |
| Drip 3 | Blog click-through | ~2–4% of delivered |
| Reactivation | Clicks + unsubscribes | Clicks = re-engaged, unsubscribes = list cleaning; both fine. Spam complaints are the only failure — stay under 0.10% |
| Friends & Family | Signups (you'll hear directly) | n/a — personal send |

**UTM convention** — every link in a Resend send carries:
`?utm_source=resend&utm_medium=email&utm_campaign=<drip-day5|drip-day14|drip-day28|reactivation>`

**Reply handling:** replies to `info@pharmaguide.io` must land in a real,
monitored inbox. Drip 1's entire CTA is "I read every reply" — that has to
be literally true, and answered replies are the cheapest retention and
research channel this campaign has.

---

## After Day 28 — don't go quiet again

The Reactivation email exists because the list went cold once. Don't
rebuild the same problem behind the new sequence. Once a subscriber
finishes Drip 3, the list needs a heartbeat until beta opens:

- **Monthly safety brief** (Resend Broadcast to the full waitlist): one
  recall worth knowing about + one evidence-graded answer to a real reader
  question (sourced from Drip 1 replies) + one blog link. ~15 minutes to
  assemble from content that already exists.
- Cadence: monthly until beta opens, then shift to weekly once there's
  product activity worth reporting.
- Same claim-language guardrails and CAN-SPAM footer as the drips.

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
  - **Send in batches** — a 60-day-cold segment is a spam-complaint risk,
    and Gmail's tolerance ceiling is 0.10%. First batch: ~20% of the
    segment. Check complaint + unsubscribe rates after 24h before
    releasing the rest.
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
- **2026-06-08** — Clinical-risk pass per dev review. Softened nine specific
  claims across Drip 1, Drip 2, and Friends & Family — replaced "reduces
  absorption by 30%," "FDA-aligned label-of-record," "ground truth,"
  "decompose proprietary blends," "decodes what's actually inside,"
  "real interactions vs. chatroom rumor," "is this safe for me," "does
  what nobody else will," and "hurt by a system that wasn't paying
  attention" with decision-support framing ("interferes when too close
  together," "major public reference," "flags / surfaces what can be
  verified," "evidence-graded interaction signals," "what should I know,"
  "brings together the pieces most people still have to check
  separately," "left to figure this out on their own"). Removed
  adversarial-toward-clinicians framing ("the thing the pharmacist
  wouldn't, the doctor couldn't"). Added a reusable "Claim-language
  guardrails" table so this lesson doesn't have to be relearned for the
  next drip.
- **2026-06-09** — Conversion pass. Rewrote the Drip 1 story for
  credibility: the failure is now a hedged "probably fine" plus a systems
  gap (pharmacy software doesn't see supplements), not clinicians refusing
  to answer — with an authenticity note to swap in the real product pair.
  Sender switched to "Sean at PharmaGuide" on all Resend sends. One CTA
  per email: Drip 1 gains a reply-ask (any stack question — interactions,
  ingredient quality, brands; "I read every reply"), Drip 2 a single
  UTM-tagged deep-dive link + waitlist-count social proof placeholder,
  Drip 3 a benefit-led subject ("The 5 interactions we catch most often")
  + full clickable URLs, Reactivation cut to a single site CTA. Added
  wave mechanics ("invites go out in order of signup"), a Measurement
  section (click/reply KPIs per email, UTM convention, reply-inbox
  requirement), an "After Day 28" warm-keeping plan (monthly safety
  brief), reactivation batch-send guidance, and a free-forever mechanism
  note on Friends & Family.
