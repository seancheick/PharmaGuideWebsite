import { createElement } from "react";
import { Text, Link, Button, Section, Row, Column } from "@react-email/components";
import { render } from "@react-email/render";
import { EmailLayout, paragraphStyle } from "../../src/emails/email-layout.cjs";
import { pollChoices } from "../../src/lib/email-poll.cjs";

export const WAITING_EVENT = "pg.beta.waitlist_joined.v1";
export const WAITING_SEGMENT = "PharmaGuide Beta Waiting";
export const AUTOMATION_NAME = "PharmaGuide beta waiting sequence";
export const contactProperties = [
  "pg_beta_status",
  "pg_beta_joined_at",
  "pg_source",
  "pg_delivery_status",
  "pg_status_updated_at",
  "pg_delivery_updated_at",
  "pg_legacy_joined_at",
  "pg_sequence_status",
  "pg_beta_unsubscribe_url",
  "pg_unsubscribe_feedback",
  "pg_beta_poll_url",
  "pg_beta_interest",
  "pg_beta_interest_at",
];

export const campaigns = {
  day5: {
    name: "PharmaGuide beta Day 5",
    subject: "A missing warning isn't a guarantee of safety",
    paragraphs: [
      "Hi,",
      "A result is more useful when you can understand the reason behind it.",
      "PharmaGuide lets you look up supplements and review product information and interaction warnings. What it can tell you depends on the information available for the product and the details you've entered. A missing warning isn't a guarantee that a combination is safe.",
      "This guide explains a related question: what does it mean when a medication is linked to lower nutrient levels, and when is that worth discussing with a clinician?",
    ],
    link: {
      label: "Read the medication and nutrient guide",
      href: "https://www.pharmaguide.io/blog/medication-depletion-guide?utm_source=resend&utm_medium=email&utm_campaign=beta-day5",
    },
  },
  day14: {
    name: "PharmaGuide beta Day 14",
    subject: "What would make your beta access useful?",
    paragraphs: [
      "Hi,",
      "You signed up for the PharmaGuide beta a couple of weeks ago. Thanks for offering to help.",
      "I'm opening beta access in small groups. While you wait, I'd like to know what you'd want to try first.",
      "What do you most want PharmaGuide to check for you? Choose a topic below, then confirm on the next page. No typing or sign-in needed.",
      "I'll follow up when I can offer you a testing place. I don't have a confirmed date for everyone yet.",
    ],
  },
  reconnect: {
    name: "PharmaGuide beta update for review",
    subject: "Come take a look at PharmaGuide",
    paragraphs: [
      "Hello,",
      "You signed up for PharmaGuide a while back. I've been working on it since then, and I'd like to show you where it is now.",
      "A lot of that work has gone into checking the product data and the information behind the results. I've also been improving the app and updating the website so you can get a clearer picture of what PharmaGuide does.",
      "You can look up supplements, review product and ingredient information, and understand interaction warnings. The new website walks through how it works and has guides you can read while you wait for access.",
      "You're already on the beta list, so there's no need to sign up again. I'm opening access in small groups and will send invitations separately.",
    ],
    link: {
      label: "Explore the new PharmaGuide website",
      href: "https://pharmaguide.io/?utm_source=resend&utm_medium=email&utm_campaign=beta-reconnect",
    },
    closing: "If this is no longer for you, you can unsubscribe below.",
  },
  newsletter: {
    name: "PharmaGuide monthly note for review",
    subject: "When a medication affects nutrient levels",
    paragraphs: [
      "Hi,",
      "Not every medication and nutrient link has the same evidence behind it. That distinction matters when deciding what to ask your pharmacist or clinician.",
      "This guide explains the differences and why monitoring depends on the medication and your circumstances.",
    ],
    link: {
      label: "Read the guide",
      href: "https://www.pharmaguide.io/blog/medication-depletion-guide?utm_source=resend&utm_medium=email&utm_campaign=monthly-depletion",
    },
    closing:
      "What would you like a future guide to explain? Reply with a general topic, without personal medical details.",
  },
};

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function renderCampaign(campaign) {
  const paragraphs = [...campaign.paragraphs];
  const body = paragraphs.map((paragraph, index) => createElement(Text, { key: `paragraph-${index}`, style: paragraphStyle }, paragraph));
  if (campaign === campaigns.day14) {
    body.splice(body.length - 1, 0, ...pollChoices.map(({ value, label }) =>
      createElement(Section, { key: value, style: { margin: "0 0 12px" } },
        createElement(Row, null,
          createElement(Column, { bgcolor: "#183B3F", style: { backgroundColor: "#183B3F", borderRadius: "10px" } },
            createElement(Button, {
              href: `{{{BETA_POLL_URL}}}&choice=${value}`,
              style: { display: "block", boxSizing: "border-box", width: "100%", padding: "18px 20px", backgroundColor: "#183B3F", borderRadius: "10px", color: "#FAF9F6", fontFamily: "Arial, sans-serif", fontSize: "15px", lineHeight: "24px", textAlign: "left", textDecoration: "none", fontWeight: 600 },
            }, label, createElement("span", { "aria-hidden": "true", style: { color: "#B5D6CC", whiteSpace: "nowrap" } }, "  →")))))));
  }
  if (campaign.link)
    body.push(createElement(Text, { key: "link", style: paragraphStyle }, createElement(Link, { href: campaign.link.href, style: { color: "#183B3F" } }, campaign.link.label)));
  if (campaign.closing) body.push(createElement(Text, { key: "closing", style: paragraphStyle }, campaign.closing));
  const footer = "PharmaGuide Inc. · 100 Sudbury St, Boston, MA 02114";
  const unsubscribe = "{{{RESEND_UNSUBSCRIBE_URL}}}";
  const waitingEmail = [campaigns.day5, campaigns.day14].includes(campaign);
  const reason = campaign === campaigns.newsletter
    ? "You subscribed to PharmaGuide's monthly notes."
    : "You joined the PharmaGuide beta list.";
  const message = createElement(EmailLayout, {
    preview: campaign.subject,
    heading: campaign.subject,
    reason,
    unsubscribeUrl: unsubscribe,
    unsubscribeLabel: waitingEmail ? "Unsubscribe from all marketing" : "Unsubscribe from this topic",
    preferenceLinks: waitingEmail ? [{ href: "{{{BETA_UNSUBSCRIBE_URL}}}", label: "Stop beta updates only" }] : [],
  }, ...body);
  return {
    html: await render(message),
    text: [
      ...paragraphs,
      ...(campaign === campaigns.day14 ? pollChoices.map(({ value, label }) => `${label}: {{{BETA_POLL_URL}}}&choice=${value}`) : []),
      campaign.link ? `${campaign.link.label}: ${campaign.link.href}` : "",
      campaign.closing ?? "",
      "Sean\nFounder, PharmaGuide",
      reason,
      "PharmaGuide provides information, not medical advice.",
      footer,
      `${waitingEmail ? "Unsubscribe from all marketing" : "Unsubscribe from this topic"}: ${unsubscribe}`,
      waitingEmail ? "Stop beta updates only: {{{BETA_UNSUBSCRIBE_URL}}}" : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

export function waitingAutomation(templateIds, propertyField) {
  if (!["contact.properties.pg_beta_status", "contact.pg_beta_status"].includes(propertyField))
    throw new Error("Waiting-property path has not been verified");
  return {
    name: AUTOMATION_NAME,
    status: "disabled",
    steps: [
      { key: "joined", type: "trigger", config: { event_name: WAITING_EVENT } },
      { key: "wait5", type: "delay", config: { duration: "5d" } },
      {
        key: "still_waiting5",
        type: "condition",
        config: { type: "rule", field: propertyField, operator: "eq", value: "waiting" },
      },
      {
        key: "day5",
        type: "send_email",
        config: {
          template: {
            id: templateIds.day5,
            variables: {
              BETA_UNSUBSCRIBE_URL: { var: "contact.properties.pg_beta_unsubscribe_url" },
            },
          },
        },
      },
      { key: "wait9", type: "delay", config: { duration: "9d" } },
      {
        key: "still_waiting14",
        type: "condition",
        config: { type: "rule", field: propertyField, operator: "eq", value: "waiting" },
      },
      {
        key: "day14",
        type: "send_email",
        config: {
          template: {
            id: templateIds.day14,
            variables: {
              BETA_UNSUBSCRIBE_URL: { var: "contact.properties.pg_beta_unsubscribe_url" },
              BETA_POLL_URL: { var: "contact.properties.pg_beta_poll_url" },
            },
          },
        },
      },
    ],
    connections: [
      { from: "joined", to: "wait5" },
      { from: "wait5", to: "still_waiting5" },
      { from: "still_waiting5", to: "day5", type: "condition_met" },
      { from: "day5", to: "wait9" },
      { from: "wait9", to: "still_waiting14" },
      { from: "still_waiting14", to: "day14", type: "condition_met" },
    ],
  };
}

// Owner test aliases live in EMAIL_TEST_ADDRESSES (comma-separated, local .env),
// not in this public repo.
export function isKnownTestAddress(email) {
  const owners = (process.env.EMAIL_TEST_ADDRESSES ?? "")
    .split(",")
    .map((address) => address.trim().toLowerCase())
    .filter(Boolean);
  return (
    owners.includes(String(email).toLowerCase()) ||
    /@(example\.(com|net|org)|resend\.dev)$/i.test(email)
  );
}

export function permanentSuppression(event) {
  if (event.type === "email.complained") return "complained";
  if (event.type === "email.bounced" && event.data?.bounce?.type?.toLowerCase() === "permanent")
    return "hard_bounced";
  return null;
}
