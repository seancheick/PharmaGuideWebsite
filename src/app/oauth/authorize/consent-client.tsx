"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SignInPanel } from "@/components/ai-connector/SignInPanel";
import { CONNECTIONS_PATH, consentCopy, redirectMatchesCallback } from "@/lib/ai-connector";
import { browserSupabase } from "@/lib/supabase-browser";

type Preview = { client_name: string; callback_host: string; redirect_uri: string };

type View =
  | { kind: "loading" }
  | { kind: "message"; text: string }
  | { kind: "signin" }
  | { kind: "consent"; session: Session; preview: Preview; busy: boolean; error?: string };

const ID_PATTERN = /^[A-Za-z0-9_-]{1,255}$/;

async function callRoute(session: Session, payload: Record<string, string>) {
  const response = await fetch("/api/ai-connections", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}`, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: response.ok, json };
}

export default function ConsentClient() {
  const authorizationId = useSearchParams().get("authorization_id") ?? "";
  const [view, setView] = useState<View>({ kind: "loading" });

  useEffect(() => {
    const supabase = browserSupabase();
    let cancelled = false;
    const show = (next: View) => {
      if (!cancelled) setView(next);
    };
    async function load() {
      if (!supabase) return show({ kind: "message", text: "Connecting assistants is not available right now." });
      if (!ID_PATTERN.test(authorizationId)) {
        return show({ kind: "message", text: "This link is incomplete. Start the connection again from the assistant." });
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) return show({ kind: "signin" });
      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
      if (error || !data) {
        return show({ kind: "message", text: "This connection request has ended. Start again from the assistant." });
      }
      if (!("authorization_id" in data)) {
        // Supabase approved it from an earlier consent; no new card was shown,
        // so PharmaGuide does not add a connection silently.
        return show({
          kind: "message",
          text: "This assistant already has an approval on record. To review or end it, open your connections page, disconnect it, and connect again.",
        });
      }
      const { ok, json } = await callRoute(session, { action: "preview", authorization_id: authorizationId });
      if (!ok) return show({ kind: "message", text: String(json.error ?? "This connection cannot be approved.") });
      show({ kind: "consent", session, preview: json as unknown as Preview, busy: false });
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    if (view.kind !== "consent") return;
    const supabase = browserSupabase();
    if (!supabase) return;
    setView({ ...view, busy: true, error: undefined });
    if (approve) {
      const written = await callRoute(view.session, { action: "approve", authorization_id: authorizationId });
      if (!written.ok) {
        setView({ ...view, busy: false, error: String(written.json.error ?? "PharmaGuide could not record this connection.") });
        return;
      }
    }
    const result = approve
      ? await supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
      : await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
    const redirectUrl = result.data?.redirect_url;
    if (result.error || !redirectUrl || !redirectMatchesCallback(redirectUrl, view.preview.redirect_uri)) {
      setView({ ...view, busy: false, error: "The assistant could not be reached. Start again from the assistant." });
      return;
    }
    window.location.assign(redirectUrl);
  }

  if (view.kind === "loading") return <p className="text-neutral-500">Loading…</p>;
  if (view.kind === "message") {
    return (
      <div className="space-y-4">
        <p className="text-base text-neutral-700 dark:text-neutral-300">{view.text}</p>
        <Link href={CONNECTIONS_PATH} className="text-sm font-semibold underline">
          Your connections
        </Link>
      </div>
    );
  }
  if (view.kind === "signin") {
    const supabase = browserSupabase();
    return supabase ? (
      <SignInPanel supabase={supabase} reason="Sign in to PharmaGuide to review this connection." />
    ) : null;
  }

  const copy = consentCopy(view.preview.client_name);
  return (
    <article className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{copy.title}</h1>
      <section aria-label="Destination" className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{copy.destinationLabel}</p>
        <p className="mt-1 break-all text-3xl font-bold text-neutral-900 dark:text-white">{view.preview.callback_host}</p>
      </section>
      <section className="space-y-1">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{copy.categoriesHeading}</h2>
        <p className="text-neutral-700 dark:text-neutral-300">{copy.categoriesIncluded}</p>
        <p className="text-neutral-700 dark:text-neutral-300">{copy.categoriesExcluded}</p>
      </section>
      <section className="space-y-1">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{copy.durationHeading}</h2>
        <p className="text-neutral-700 dark:text-neutral-300">{copy.duration}</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{copy.locationsHeading}</h2>
        <ol className="space-y-2">
          {copy.locations.map((location) => (
            <li key={location.label} className="text-neutral-700 dark:text-neutral-300">
              <span className="font-semibold">{location.label}.</span> {location.detail}
            </li>
          ))}
        </ol>
      </section>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {copy.revocation}{" "}
        <Link href={CONNECTIONS_PATH} className="font-semibold underline">
          Your connections
        </Link>
      </p>
      {view.error ? (
        <p role="alert" className="text-sm text-neutral-900 dark:text-white">
          {view.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={view.busy}
          onClick={() => void decide(true)}
          className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {copy.approve}
        </button>
        <button
          type="button"
          disabled={view.busy}
          onClick={() => void decide(false)}
          className="rounded-lg border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-900 disabled:opacity-50 dark:border-neutral-600 dark:text-white"
        >
          {copy.deny}
        </button>
      </div>
    </article>
  );
}
