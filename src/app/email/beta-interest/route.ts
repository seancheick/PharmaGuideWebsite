import { env } from "@/lib/env";
import { pollChoices, readPollToken } from "../../../lib/email-poll.cjs";
import { preferencePage } from "../../../lib/email-preference-page";
import { saveBetaInterest } from "../../../lib/resend";

function contactFrom(url: URL): string | null {
  if (url.searchParams.getAll("token").length !== 1) return null;
  return readPollToken(url.searchParams.get("token"), env.EMAIL_UNSUBSCRIBE_SECRET || env.RESEND_API_KEY);
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (!contactFrom(url)) return preferencePage("This link isn't valid", "<p>Please use the link in your email or contact info@pharmaguide.io.</p>", 400);
  const selected = url.searchParams.get("choice");
  const selectedChoice = pollChoices.find(({ value }) => value === selected);
  const changing = url.searchParams.get("change") === "1";
  const options = pollChoices.map(({ value, label }) => `<option value="${value}"${value === selected ? " selected" : ""}>${label.replaceAll("'", "&#39;")}</option>`).join("");
  const changeUrl = `?token=${encodeURIComponent(url.searchParams.get("token")!)}&amp;choice=${selectedChoice?.value ?? ""}&amp;change=1`;
  const input = selectedChoice && !changing
    ? `<p class="answer-label">You chose</p><p class="selected-answer">${selectedChoice.label.replaceAll("'", "&#39;")}</p><input type="hidden" name="choice" value="${selectedChoice.value}">`
    : `<label for="choice">Your answer</label><select id="choice" name="choice" required><option value="" disabled${selectedChoice ? "" : " selected"}>Choose a topic</option>${options}</select>`;
  return preferencePage(selectedChoice && !changing ? "One last tap" : "What would you like to check?", `<form class="poll-form" method="post">${input}<button type="submit">Confirm my answer</button></form>${selectedChoice && !changing ? `<p><a href="${changeUrl}">Change answer</a></p>` : ""}<small>Your answer is saved only when you confirm. We store your latest general choice with your email contact in Resend. No medical details are requested. This doesn't change your subscriptions or reserve a beta place.</small>`);
}

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const contactId = contactFrom(url);
  if (!contactId || !request.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded"))
    return preferencePage("This answer wasn't saved", "<p>Please use the poll link in your email.</p>", 400);
  const body = await request.text();
  const fields = new URLSearchParams(body);
  const choice = fields.get("choice");
  if (body.length > 256 || [...fields.keys()].length !== 1 || !pollChoices.some(({ value }) => value === choice))
    return preferencePage("Choose one topic", "<p>Go back and select an answer before confirming.</p>", 400);
  try {
    await saveBetaInterest(contactId, choice!);
    return preferencePage("Thanks for letting me know", "<p>Your answer is saved. You can use the same email link if you want to change it.</p><p>Sean<br>Founder, PharmaGuide</p><p>Your email preferences are unchanged.</p>");
  } catch {
    return preferencePage("Your answer couldn't be saved", "<p>Please try again later. Your email preferences are unchanged.</p>", 503);
  }
}
