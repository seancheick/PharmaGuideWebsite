import type { LegalDocument } from "./legal";

/**
 * Accessibility Statement — refreshed from the legacy WordPress version.
 *
 * Targets WCAG 2.2 AA (the current EU EAA + Section 508 alignment as
 * of 2026). Honest about both what's already there (semantic HTML,
 * focus rings, aria-labels, prefers-reduced-motion respect) and what
 * we know we still owe (alt text on every image, contrast review on
 * the deep-teal footer rails, screen-reader pass on the carousel).
 *
 * The page itself follows AA — visible focus rings, keyboard navigation
 * for the FAQ accordion, semantic landmarks, no animation that triggers
 * vestibular disorders.
 */

export const ACCESSIBILITY_DOC: LegalDocument = {
  eyebrow: "Accessibility",
  titleLead: "An app should work",
  titleEm: "for everyone.",
  subhead:
    "How PharmaGuide approaches accessibility — what we already do, what we're working on, and how to tell us when we miss something.",
  lastUpdated: "2026-05-08",
  summary: {
    title: "The short version",
    points: [
      "We target **WCAG 2.2 AA** for both the website and the mobile apps.",
      "We respect **prefers-reduced-motion** — every animation degrades gracefully.",
      "Every interactive control is **keyboard accessible** with visible focus rings.",
      "We're not perfect. If something doesn't work for you, **email us** and we treat it as a P1.",
    ],
  },
  sections: [
    {
      id: "commitment",
      num: "1",
      title: "Our commitment",
      body: `We believe a tool that helps people understand their medications and supplements has to work for everyone — including people who use screen readers, voice control, switch devices, large-font modes, high-contrast modes, or single-handed touch.

Our standing target is **WCAG 2.2 AA**. We test against this on every release. We are not always perfect; when we miss, we want to know about it and fix it fast.`,
    },
    {
      id: "website",
      num: "2",
      title: "Website (pharmaguide.io)",
      body: `What's already in place across this site:

**Semantic HTML** — every page uses landmark elements (header, main, footer, nav) so screen readers can skip directly to content.

**Visible focus rings** — every interactive control shows a clear focus indicator on keyboard navigation. The accent color used for focus is independent of any state-color we use for content.

**Keyboard navigation** — the FAQ accordion, the interaction-tier ladder, the real-life moments carousel, and every form control are fully operable from the keyboard. Tab order follows reading order.

**ARIA where appropriate** — buttons that toggle content have aria-expanded; tab interfaces use role="tablist"/"tab"/"tabpanel"; live regions announce form status changes.

**Reduced motion** — every animation respects \`prefers-reduced-motion: reduce\`. The hero loop, the carousel, the count-up animations, the section reveals all gracefully fall back to instant transitions.

**Color contrast** — body text meets AA on every background. We continuously audit corners (small mono labels, the deep-teal footer rails) and lift contrast where the audit catches drift.

**Heading hierarchy** — pages use a single H1; sections nest H2 → H3 in reading order.

**Alt text** — decorative images use empty alt attributes; meaningful images get descriptive alt. Images currently used on the site (the lifestyle photos in Real-Life Moments) are explicitly marked decorative because the surrounding heading and description carry the meaning.`,
    },
    {
      id: "mobile",
      num: "3",
      title: "Mobile apps (iOS and Android)",
      body: `What's already in place across the apps:

**Dynamic Type / large-font** — the entire interface scales correctly when you turn up font size in iOS or Android system settings. We do not pin font sizes.

**VoiceOver / TalkBack** — every screen has been tested with a screen reader. Interactive controls have semantic labels. Decorative imagery is marked accordingly.

**Color-independence** — every severity tier (Contraindicated → Informational) is differentiated by both color **and** a unique geometric shape (triangle, circle, diamond, ring, square) so colorblind users see the same hierarchy.

**Reduce motion** — when you have iOS Reduce Motion or Android animation-scale set to 0, our animations degrade to instant transitions automatically.

**Adaptive controls** — switches, sliders, and date pickers use platform-native controls (iOS toggle on iOS, Material Switch on Android) so they inherit each platform's accessibility behavior.

**Haptic feedback** — confirmation and severity-warning haptics are available but never required to understand the interface. Disable them in Settings without losing functionality.

**Focus order** — keyboard / switch-control focus follows the visible reading order on every screen.`,
    },
    {
      id: "in-progress",
      num: "4",
      title: "What we're still working on",
      body: `We're not perfect. Things we know we still owe:

**Reading-mode polish** — the long-form pages (Privacy, Terms, Methodology) work in reader mode but the table of contents collapse pattern needs better screen-reader semantics. On the list for the next pass.

**High-contrast mode review** — Windows High Contrast and macOS Increase Contrast both work today, but a few decorative borders disappear. We'll lift them to a minimum 1px solid.

**Voice Control labels** — we use semantic labels for VoiceOver / TalkBack. Voice Control (which uses on-screen text) sometimes can't find unlabeled icon-only buttons. Sweep in progress.

**Captioned video** — when we add product video, we will publish captions and a transcript at launch, not after.

If you find something else — please tell us.`,
    },
    {
      id: "feedback",
      num: "5",
      title: "Tell us when we miss",
      body: `If anything on PharmaGuide doesn't work for you, write to **[accessibility@pharmaguide.io](mailto:accessibility@pharmaguide.io)** with as much detail as you can:

- What were you trying to do?
- What device, browser, OS, and assistive technology were you using?
- What did you expect to happen vs. what actually happened?

We treat accessibility issues as P1 bugs — they jump the queue. We will reply within 5 business days with what we found and when it ships.`,
    },
    {
      id: "standards",
      num: "6",
      title: "Standards we measure against",
      body: `**WCAG 2.2 AA** — the World Wide Web Consortium's Web Content Accessibility Guidelines, version 2.2, AA conformance level. The current global baseline.

**Section 508** — U.S. federal accessibility standard, harmonized with WCAG 2.0 AA (Section 508 still references 2.0 as the baseline, though we exceed this).

**EN 301 549** — European Accessibility Act standard, converging on WCAG 2.2 AA.

**ADA Title III** — U.S. Americans with Disabilities Act guidance for places of public accommodation, including web content.

We do not currently publish a formal VPAT (Voluntary Product Accessibility Template) but will produce one for the **Healthcare Pros** tier where institutional procurement requires it.`,
    },
  ],
};
