"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client for the AI connector pages only (sign-in, OAuth
 * consent, connections). It uses the publishable key and the user's own
 * session; it never sees the service role. PKCE so the sign-in code returns
 * to the same page and is exchanged there.
 *
 * Unset NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY make
 * the pages say the feature is unavailable instead of failing to render.
 */
let client: SupabaseClient | null | undefined;

export function browserSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  client = url && key ? createClient(url, key, { auth: { flowType: "pkce", persistSession: true } }) : null;
  return client;
}
