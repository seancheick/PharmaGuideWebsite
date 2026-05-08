"use server";

import { subscribe, type SubscribeResult } from "@/lib/resend";

/**
 * Server actions consumed by the form clients (FinalCTA + NewsletterCTA).
 *
 * These run on the server, can read env vars, and return a serializable
 * result the client uses to render success / error UI. No API route
 * needed — Next.js wires up the RPC call automatically.
 *
 * Both actions sanitize inputs (trim, lowercase email) before passing
 * to the Resend layer.
 */

export async function joinBetaWaitlist(
  email: string,
  note?: string
): Promise<SubscribeResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanNote = note?.trim() || undefined;
  return subscribe({ email: cleanEmail, list: "beta", note: cleanNote });
}

export async function subscribeToNewsletter(
  email: string
): Promise<SubscribeResult> {
  const cleanEmail = email.trim().toLowerCase();
  return subscribe({ email: cleanEmail, list: "newsletter" });
}
