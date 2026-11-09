// Revised copy snapshot: docs/16-email-research-and-revised-copy.md, November 5, 2026.
// Dashboard edits are authoritative after provisioning; never upload over them silently.
import { createElement } from "react";
import { Text, Link, Button, Section, Img } from "@react-email/components";
import { render } from "@react-email/render";
import { EmailLayout, paragraphStyle } from "../../src/emails/email-layout.cjs";
export const SIGNATURE = "Here's to taking good care of yourself.";
export const journey = {
  catchup: {
    name: "PharmaGuide Existing beta subscribers — catch-up",
    alias: "pg-catchup-v2",
    subject: "So many supplements. Which ones deserve your money?",
    preview: "A closer look at what we're building, plus something free for you.",
    heading: "You shouldn't have to guess.",
    blocks: [
      {
        type: "paragraph",
        text: "You joined the PharmaGuide beta a while back. My team and I have been working hard, and I'm excited to show you more of what we've been building.",
      },
      {
        type: "paragraph",
        text: "You walk into the pharmacy for a supplement. A whole shelf promises the same thing.",
      },
      {
        type: "paragraph",
        text: "Which one do you choose? Does it do what it says? And how does it fit with everything you already take?",
      },
      {
        type: "paragraph",
        text: "A way to look beyond the bottle: understand the research, see relevant warnings, and spot ingredients you may already be taking in another product.",
      },
      {
        type: "paragraph",
        text: "Think of it as turning the bottle around, with more of the story in view.",
      },
      {
        type: "paragraph",
        text: "If you haven't seen it yet, our free Supplement Safety Brief is yours to download. It includes a shopping checklist and a worksheet for your next pharmacy visit.",
      },
      {
        type: "button",
        label: "Get your free brief",
        href: "https://pharmaguide.io/supplement-safety-brief.pdf",
      },
      {
        type: "button",
        variant: "secondary",
        label: "Explore PharmaGuide features",
        href: "https://pharmaguide.io/features",
      },
      {
        type: "paragraph",
        text: "You're already on the beta list. No need to sign up again. I'll send your invitation separately when your place is ready.",
      },
    ],
  },
  betaWelcome: {
    name: "PharmaGuide New beta signup — welcome",
    alias: "pg-beta-welcome-v2",
    subject: "Welcome to the PharmaGuide family 🧡",
    preview: "You're here early, and I'm glad you found us.",
    heading: "Welcome to the PharmaGuide family.",
    blocks: [
      {
        type: "paragraph",
        text: "You're here early, and I'm glad you found us.",
      },
      { type: "paragraph", text: "Around here, we look beyond the label." },
      {
        type: "list",
        items: [
          "**Does it do what it says?**",
          "**What research backs it up?**",
          "**Does it fit with your medications?**",
          "**Are you already taking the same ingredient in another product?**",
        ],
      },
      {
        type: "paragraph",
        text: "And the big one: **how would you know if it's helping you?**",
      },
      { type: "paragraph", text: "You don't need to know all the answers to belong here. That's why we're building PharmaGuide." },
      {
        type: "paragraph",
        text: "My team and I have been working hard to make supplement labels, research and warnings easier to understand—with sources you can check yourself.",
      },
      {
        type: "paragraph",
        text: "Whether you're choosing your first supplement or taking a closer look at your daily routine, welcome. Let's learn more about what we put in our bodies, together.",
      },
      {
        type: "paragraph",
        text: "While you wait, here's a free guide you can use today. The Supplement Safety Brief includes a shopping checklist and a worksheet for your next pharmacy visit.",
      },
      {
        type: "button",
        label: "Get your free brief",
        href: "https://pharmaguide.io/supplement-safety-brief.pdf",
      },
      {
        type: "button", variant: "secondary", label: "Explore PharmaGuide features",
        href: "https://pharmaguide.io/features",
      },
      { type: "fragment", variable: "NEWSLETTER_SUBSCRIPTION_COPY" },
      {
        type: "paragraph",
        text: "Over the next two weeks, I'll show you more. Your beta invitation will come separately when a place is ready.",
      },
    ],
  },
  day5: {
    name: "PharmaGuide Beta Day 5 — does it do what it says?",
    alias: "pg-beta-day5-v2",
    subject: "A good label. But what backs it up?",
    preview: "You take it every day. How do you know what to expect?",
    heading: "The promise is easy. What backs it up?",
    blocks: [
      {
        type: "paragraph",
        text: "“Supports energy.” “Helps you focus.”",
      },
      {
        type: "paragraph",
        text: "Sounds good. But does it do what it says? And how would you know if it's working for you?",
      },
      {
        type: "paragraph",
        text: "Those are the questions I want PharmaGuide to help you untangle.",
      },
      {
        type: "paragraph",
        text: "First, what's behind the promise? PharmaGuide helps you find and understand research linked to the ingredients in a product. Was it studied in people? What did they find? Was the actual product tested, or just an ingredient inside it?",
      },
      {
        type: "paragraph",
        text: "Think of the label as a movie trailer. It gives you the pitch. The research gives you more of the story.",
      },
      {
        type: "paragraph",
        text: "Then there's you. Research can help explain what to expect. It can't tell us from a scan whether you're personally getting that benefit.",
      },
      {
        type: "paragraph",
        text: "That difference matters. My team and I are building PharmaGuide to help you see what the research supports, and where the answer is still unclear.",
      },
      {
        type: "paragraph",
        text: "For a practical example, here's how to look past the claims on a shilajit label and read the lab report behind it.",
      },
      {
        type: "button",
        label: "Look beyond the label",
        href: "https://www.pharmaguide.io/blog/shilajit-heavy-metals-label-claims",
      },
    ],
  },
  day14: {
    name: "PharmaGuide Beta Day 14 — recalls and your stack",
    alias: "pg-beta-day14-v2",
    subject: "What if a supplement you take gets recalled?",
    preview: "What happens when you take them together?",
    heading: "One bottle is only part of the story.",
    blocks: [
      {
        type: "paragraph",
        text: "Think of everything you take as one basket: your supplements and medications.",
      },
      {
        type: "paragraph",
        text: "In PharmaGuide, we call that your **stack**. Your stack is your basket: one list of everything you take.",
      },
      {
        type: "paragraph",
        text: "Now the questions get more interesting.",
      },
      {
        type: "paragraph",
        text: "Are two bottles giving you the same ingredient? Could a supplement interact with a medication? Could your supplements interact with each other, too? Are there medication-related nutrient changes worth understanding?",
      },
      {
        type: "paragraph",
        text: "The same nutrient can show up in several products, so the amounts can add up without you noticing the overlap. Too much of some nutrients can be harmful. For example, too much preformed vitamin A over time can cause liver problems.",
      },
      {
        type: "link",
        label: "Source: NIH vitamin A guide",
        href: "https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/",
      },
      {
        type: "paragraph",
        text: "And what if a supplement in that basket gets recalled? How would you hear about it?",
      },
      {
        type: "paragraph",
        text: "That's part of what my team and I have been working on: connecting the information to the products on your list.",
      },
      {
        type: "paragraph",
        text: "We're building a notification system that checks FDA recall notices against the supplements in your stack, so you can get a heads-up when something you take is recalled. With notifications turned on, open the app to see what's been flagged and why.",
      },
      {
        type: "paragraph",
        text: "It won't cover every recall or every product. But you won't have to rely only on spotting a matching recall in the news.",
      },
      {
        type: "paragraph",
        text: "That's the bigger picture I'm excited for you to explore.",
      },
      {
        type: "paragraph",
        text: "Want to look at one piece of it now? This guide explains medication and nutrient links, without jumping straight to “buy another supplement.”",
      },
      {
        type: "button",
        label: "Explore the medication and nutrient guide",
        href: "https://www.pharmaguide.io/blog/medication-depletion-guide",
      },
    ],
  },
  newsletterWelcome: {
    name: "PharmaGuide Newsletter welcome",
    alias: "pg-newsletter-welcome-v2",
    subject: "A little clarity for your next supplement choice.",
    preview: "Your free guide is inside. No extra signup needed.",
    heading: "Start with better questions.",
    blocks: [
      {
        type: "paragraph",
        text: "The supplement aisle has plenty of promises. Knowing which ones to trust can be hard.",
      },
      {
        type: "paragraph",
        text: "Welcome to PharmaGuide's monthly notes. We make room for the useful questions: what backs up a claim, what a label tells you, and what to ask before adding another bottle.",
      },
      {
        type: "paragraph",
        text: "Start with our free Supplement Safety Brief. It includes a shopping checklist and a worksheet for your next pharmacy visit.",
      },
      {
        type: "button",
        label: "Get your free brief",
        href: "https://pharmaguide.io/supplement-safety-brief.pdf",
      },
      {
        type: "paragraph",
        text: "About once a month, we'll send something worth knowing. A clear guide, a closer look at the research, or a real PharmaGuide update.",
      },
      {
        type: "paragraph",
        text: "These are general updates, not personal health advice or alerts about products you take. Monthly notes and beta invitations are separate subscriptions.",
      },
    ],
  },
  newsletter: {
    name: "PharmaGuide Newsletter example",
    alias: "pg-newsletter-v2",
    subject: "Before you add another supplement, read this.",
    preview: "Medication and nutrient claims can leave out an important part of the story.",
    heading: "A reason to look closer. Not rush to buy.",
    blocks: [
      {
        type: "paragraph",
        text: "You've seen the claim: a medication can affect a nutrient. Does that mean you need another supplement?",
      },
      {
        type: "paragraph",
        text: "That's exactly the kind of question I want to make easier to understand.",
      },
      {
        type: "paragraph",
        text: "Our medication and nutrient guide takes a closer look at those claims: what the research says, where the answers differ, and what questions to bring to your pharmacist.",
      },
      {
        type: "paragraph",
        text: "My team and I have been working to make the information behind these questions easier to find, so you're not left piecing it together from a headline.",
      },
      {
        type: "button",
        label: "Read the medication and nutrient guide",
        href: "https://www.pharmaguide.io/blog/medication-depletion-guide",
      },
    ],
  },
  invitation: {
    name: "PharmaGuide Beta invitation — real selected place only",
    alias: "pg-beta-invitation-v2",
    subject: "You're in. Let's put PharmaGuide in your hands.",
    preview: "Your place in our small beta group is ready.",
    heading: "Congratulations. You're in.",
    blocks: [
      {
        type: "image",
        src: "https://omayamxacvacrnvdvzhr.supabase.co/storage/v1/object/public/pharmaguide/email-assets/beta-welcome-20261108.png",
        alt: "Welcome to the beta. Welcome to the PharmaGuide family.",
      },
      {
        type: "paragraph",
        text: "I've been looking forward to sending you this.",
      },
      {
        type: "paragraph",
        text: "You've been selected to join our small PharmaGuide beta group. Your place is ready.",
      },
      {
        type: "paragraph",
        text: "My team and I have been working on the details behind what you'll see: the product information, the research and the checks that help put it together. Now I'm excited for you to explore it.",
      },
      {
        type: "button",
        label: "Start exploring PharmaGuide",
        href: "{{{BETA_ACCESS_URL}}}",
      },
      {
        type: "paragraph",
        text: "Start with one supplement. Look it up. See what's behind the label. Then build your basket of the supplements and medications you take. That's your **stack**.",
      },
      {
        type: "paragraph",
        text: "You're joining at a stage where your experience can help shape what we improve next. I'll check in after you've had a chance to try it.",
      },
      {
        type: "paragraph",
        text: "Thanks for being part of this. I can't wait for you to take a look.",
      },
    ],
  },
  feedback: {
    name: "PharmaGuide Feedback — after about a week of confirmed access",
    alias: "pg-beta-feedback-v2",
    subject: "Help shape what PharmaGuide does next.",
    preview: "A few words can help make the next version better.",
    heading: "Your idea could help shape what's next.",
    blocks: [
      {
        type: "paragraph",
        text: "You've had a little time with PharmaGuide. We hope it's helped make something clearer.",
      },
      {
        type: "paragraph",
        text: "What would make it better for you?",
      },
      {
        type: "paragraph",
        text: "Hit reply and finish any one of these:",
      },
      {
        type: "paragraph",
        text: "**I liked…**",
      },
      {
        type: "paragraph",
        text: "**I got stuck when…**",
      },
      {
        type: "paragraph",
        text: "**I wish it could…**",
      },
      {
        type: "paragraph",
        text: "A few words are enough. A missing feature, a confusing screen, or something you'd love to see: it all helps.",
      },
      {
        type: "paragraph",
        text: "No need to answer everything. If you haven't tried it yet, that's okay too.",
      },
      {
        type: "paragraph",
        text: "Please leave out personal health details. We're interested in your experience with the app.",
      },
      {
        type: "paragraph",
        text: "Thanks for helping shape what comes next.",
      },
    ],
  },
  brief: {
    name: "PharmaGuide Requested free brief — delivery",
    alias: "pg-brief-delivery-v2",
    subject: "Your free Supplement Safety Brief is here.",
    preview: "A shopping checklist and a worksheet for your next pharmacy visit.",
    heading: "A clearer place to start.",
    blocks: [
      {
        type: "paragraph",
        text: "Here's the Supplement Safety Brief you requested.",
      },
      {
        type: "paragraph",
        text: "Use the checklist when you're looking at a supplement. Save the worksheet for your next pharmacy visit. You don't need to work it all out at once.",
      },
      {
        type: "button",
        label: "Open your free brief",
        href: "https://pharmaguide.io/supplement-safety-brief.pdf",
      },
      {
        type: "fragment",
        variable: "NEWSLETTER_SUBSCRIPTION_COPY",
      },
      {
        type: "fragment",
        variable: "BETA_SUBSCRIPTION_COPY",
      },
      {
        type: "paragraph",
        text: "The brief is for learning, not a personal treatment plan. Your pharmacist or clinician can help with questions about what you take.",
      },
    ],
  },
};

function inline(text) {
  return text
    .split(/(\*\*.*?\*\*|\n)/s)
    .map((part, i) =>
      part === "\n"
        ? createElement("br", { key: i })
        : part.startsWith("**")
          ? createElement("strong", { key: i }, part.slice(2, -2))
          : part
    );
}
const plain = (text) => text.replaceAll("**", "");
export function preferenceScope(key) {
  if (key === "brief")
    return {
      reason: "You requested the Supplement Safety Brief.",
      unsubscribeLabel: "",
      preferenceLinks: [],
    };
  const newsletter = ["newsletter", "newsletterWelcome"].includes(key);
  const automation = ["day5", "day14"].includes(key);
  return {
    reason: newsletter
      ? "You subscribed to PharmaGuide's monthly notes."
      : "You joined the PharmaGuide beta list.",
    unsubscribeUrl: ["betaWelcome", "newsletterWelcome", "invitation", "feedback"].includes(key)
      ? "{{{UNSUBSCRIBE_URL}}}"
      : "{{{RESEND_UNSUBSCRIBE_URL}}}",
    unsubscribeLabel: automation
      ? "Unsubscribe from all marketing"
      : newsletter
        ? "Unsubscribe from monthly notes"
        : "Unsubscribe from beta invitations and updates",
    preferenceLinks: automation
      ? [{ href: "{{{BETA_UNSUBSCRIBE_URL}}}", label: "Stop beta updates only" }]
      : [],
  };
}
export async function renderJourney(key) {
  const definition = journey[key];
  if (!definition) throw new Error(`Unknown journey: ${key}`);
  const scope = preferenceScope(key);
  const body = definition.blocks.map((block, i) => {
    if (block.type === "image")
      return createElement(Img, {
        key: i, src: block.src, alt: block.alt, width: 512,
        style: { width: "100%", maxWidth: "512px", height: "auto", borderRadius: "12px", margin: "0 0 24px" },
      });
    if (block.type === "fragment")
      return createElement(Text, { key: i, style: paragraphStyle }, `{{{${block.variable}}}}`);
    if (block.type === "paragraph")
      return createElement(Text, { key: i, style: paragraphStyle }, ...inline(block.text));
    if (block.type === "list")
      return createElement(
        "ul",
        { key: i, style: { ...paragraphStyle, paddingLeft: "24px" } },
        ...block.items.map((item, itemIndex) =>
          createElement("li", { key: itemIndex, style: { marginBottom: "8px" } }, ...inline(item))
        )
      );
    if (block.type === "link")
      return createElement(
        Text,
        { key: i, style: paragraphStyle },
        createElement(Link, { href: block.href, style: { color: "#183B3F" } }, block.label)
      );
    return createElement(
      Section,
      { key: i, style: { textAlign: "center", margin: "8px 0 28px" } },
      createElement(
        Button,
        {
          href: block.href,
          style: {
            backgroundColor: block.variant === "secondary" ? "#FFFFFF" : "#183B3F",
            color: block.variant === "secondary" ? "#183B3F" : "#FFFFFF",
            ...(block.variant === "secondary" ? { border: "1px solid #183B3F" } : {}),
            fontSize: "15px",
            fontWeight: 600,
            borderRadius: "999px",
            padding: "14px 24px",
            textDecoration: "none",
          },
        },
        block.label
      )
    );
  });
  const footerPreferenceContent = key === "betaWelcome"
    ? "{{{NEWSLETTER_PREFERENCE_LINK}}}"
    : key === "brief"
      ? createElement("span", null, "{{{BETA_PREFERENCE_LINK}}}", createElement("br"), "{{{NEWSLETTER_PREFERENCE_LINK}}}")
      : undefined;
  const html = await render(
    createElement(
      EmailLayout,
      {
        ...scope,
        preview: definition.preview,
        heading: definition.heading,
        signatureLine: SIGNATURE,
        footerPreferenceContent,
      },
      ...body
    )
  );
  const text = [
    definition.heading,
    ...definition.blocks.map((block) =>
      block.type === "image"
        ? block.alt
        : block.type === "paragraph"
        ? plain(block.text)
        : block.type === "list"
          ? block.items.map((item) => `- ${plain(item)}`).join("\n")
          : block.type === "fragment"
            ? `{{{${block.variable}}}}`
            : `${block.label}: ${block.href}`
    ),
    SIGNATURE,
    "Sean\nFounder, PharmaGuide",
    scope.reason,
    "PharmaGuide provides information, not medical advice.",
    ...(scope.unsubscribeUrl ? [`${scope.unsubscribeLabel}: ${scope.unsubscribeUrl}`] : []),
    ...scope.preferenceLinks.map((link) => `${link.label}: ${link.href}`),
    ...(key === "brief" ? ["{{{BETA_PREFERENCE_LINK}}}", "{{{NEWSLETTER_PREFERENCE_LINK}}}"] : []),
    ...(key === "betaWelcome" ? ["{{{NEWSLETTER_PREFERENCE_LINK}}}"] : []),
    "PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02114",
  ].join("\n\n");
  return { html, text };
}
// Reserved native Resend unsubscribe variables are supplied by the provider.
for (const [key, definition] of Object.entries(journey)) {
  const variables =
    key === "brief"
      ? [
          "NEWSLETTER_SUBSCRIPTION_COPY",
          "BETA_SUBSCRIPTION_COPY",
          "BETA_PREFERENCE_LINK",
          "NEWSLETTER_PREFERENCE_LINK",
        ]
      : ["day5", "day14"].includes(key)
        ? ["BETA_UNSUBSCRIBE_URL"]
        : ["betaWelcome", "newsletterWelcome", "invitation", "feedback"].includes(key)
          ? [
              "UNSUBSCRIBE_URL",
              ...(key === "invitation" ? ["BETA_ACCESS_URL"] : []),
              ...(key === "betaWelcome"
                ? ["NEWSLETTER_SUBSCRIPTION_COPY", "NEWSLETTER_PREFERENCE_LINK"]
                : []),
            ]
          : [];
  definition.variables = variables.map((key) => ({ key, type: "string" }));
}
export const templateDefinitions = Object.entries(journey).map(([key, definition]) => ({
  key,
  ...definition,
}));
