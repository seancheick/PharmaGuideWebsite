"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Same identities as the app: Sign in with Apple or Google via Supabase Auth. */
export function SignInPanel({ supabase, reason }: { supabase: SupabaseClient; reason: string }) {
  const signIn = (provider: "apple" | "google") =>
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.href } });
  return (
    <div className="space-y-4">
      <p className="text-base text-neutral-700 dark:text-neutral-300">{reason}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => signIn("apple")}
          className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
        >
          Continue with Apple
        </button>
        <button
          type="button"
          onClick={() => signIn("google")}
          className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 dark:border-neutral-600 dark:text-white"
        >
          Continue with Google
        </button>
      </div>
      <p className="text-sm text-neutral-500">Use the same account you use in the PharmaGuide app.</p>
    </div>
  );
}
