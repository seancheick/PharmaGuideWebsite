import { Resend } from "resend";
import { env } from "@/lib/env";
import { recordEmailEvent } from "@/lib/email-tracking";
import { log } from "@/lib/logger";

export const runtime = "nodejs";
const resend = new Resend(env.RESEND_API_KEY);

export async function POST(request: Request) {
  if (!env.RESEND_WEBHOOK_SECRET) return new Response(null, { status: 503 });
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature) return new Response(null, { status: 400 });
  let event;
  try {
    event = resend.webhooks.verify({
      payload: await request.text(),
      headers: { id, timestamp, signature },
      webhookSecret: env.RESEND_WEBHOOK_SECRET,
    });
  } catch {
    return new Response(null, { status: 400 });
  }
  try {
    await recordEmailEvent(event, id);
    return new Response(null, { status: 200 });
  } catch {
    log.error("email.event_processing_failed", { event_id: id, type: event.type });
    return new Response(null, { status: 503 });
  }
}
