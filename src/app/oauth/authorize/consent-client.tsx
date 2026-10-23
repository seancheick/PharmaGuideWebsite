"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SignInPanel } from "@/components/ai-connector/SignInPanel";
import { CONNECTIONS_PATH, consentCopy, redirectMatchesCallback } from "@/lib/ai-connector";
import { browserSupabase } from "@/lib/supabase-browser";

type Preview = { client_name: string; callback_host: string; redirect_uri: string };

type View =
  | { kind: "loading" }
  | { kind: "message"; text: string }
  | { kind: "signin" }
  | {
      kind: "consent";
      session: Session;
      authorizationId: string;
      preview: Preview;
      busy: boolean;
      code?: string;
      approved?: boolean;
      expiresAt?: string;
      error?: string;
    };

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
  return <ConsentRequest key={authorizationId} authorizationId={authorizationId} />;
}

function ConsentRequest({authorizationId}: {authorizationId: string}) {
  const lifecycle = useRef({active: false});
  const actionPending = useRef(false);
  const [view, setView] = useState<View>({ kind: "loading" });

  useEffect(() => {
    const lifetime = lifecycle.current;
    lifetime.active = true;
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
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData.session;
        if (!session) return show({ kind: "signin" });
        // The route is the only reader: details lookup can complete a
        // returning authorization, so it must not run twice in parallel.
        const { ok, json } = await callRoute(session, { action: "preview", authorization_id: authorizationId });
        if (!ok) return show({ kind: "message", text: String(json.error ?? "This connection cannot be approved.") });
        show({ kind: "consent", authorizationId, session, preview: json as unknown as Preview, busy: false });
      } catch {
        show({ kind: "message", text: "The connection could not be loaded. Try again from the assistant." });
      }
    }
    void load();
    return () => {
      cancelled = true;
      lifetime.active = false;
    };
  }, [authorizationId]);

  async function currentSession(original: Session): Promise<Session> {
    const current = (await browserSupabase()?.auth.getSession())?.data.session;
    const identity = (session: Session) => {
      const claims = JSON.parse(atob((session.access_token.split(".")[1] ?? "").replace(/-/g, "+").replace(/_/g, "/")));
      if (!claims.sub || !claims.session_id || claims.client_id || claims.is_anonymous) throw new Error("Invalid session");
      return `${claims.sub}:${claims.session_id}`;
    };
    if (!current || identity(current) !== identity(original)) throw new Error("Session changed");
    return current;
  }

  async function pair(action: "pair_start" | "pair_status") {
    if (view.kind !== "consent" || view.authorizationId !== authorizationId || view.busy || actionPending.current) return;
    actionPending.current = true;
    const lifetime = lifecycle.current;
    const live = () => lifetime.active;
    setView({...view, busy: true, error: undefined});
    try {
      const session = await currentSession(view.session);
      if (!live()) return;
      const {ok, json} = await callRoute(session, {action, authorization_id: authorizationId});
      await currentSession(view.session);
      if (!live()) return;
      if (!ok) throw new Error(String(json.error ?? "Phone approval is unavailable. Try again."));
      if (typeof json.expires_at !== "string" || !Number.isFinite(Date.parse(json.expires_at)) || Date.parse(json.expires_at) <= Date.now()) throw new Error("Expired approval");
      setView({...view, busy: false, code: action === "pair_start" ? String(json.code) : view.code,
        expiresAt: String(json.expires_at), approved: action === "pair_status" && json.approved === true,
        error: action === "pair_status" && json.approved !== true ? "Waiting for approval in the PharmaGuide app." : undefined});
    } catch {
      if (!live()) return;
      setView({...view, busy: false, approved: false, error: "Phone approval could not finish. Restart this connection from the assistant."});
    } finally { if (live()) actionPending.current = false; }
  }

  async function decide(approve: boolean) {
    if (view.kind !== "consent" || view.authorizationId !== authorizationId || view.busy || actionPending.current) return;
    actionPending.current = true;
    const lifetime = lifecycle.current;
    const live = () => lifetime.active;
    const supabase = browserSupabase();
    if (!supabase) {
      actionPending.current = false;
      setView({ ...view, busy: false, error: "Connecting assistants is unavailable right now." });
      return;
    }
    setView({ ...view, busy: true, error: undefined });
    try {
      const session = await currentSession(view.session);
      if (!live()) return;
      let redirectUrl: unknown;
      if (approve) {
        if (!view.approved || !view.expiresAt || !Number.isFinite(Date.parse(view.expiresAt)) || Date.parse(view.expiresAt) <= Date.now()) throw new Error("Approval expired");
        // The route creates the connection, approves with Auth and closes
        // the new connection on an approval failure before responding.
        const written = await callRoute(session, { action: "approve", authorization_id: authorizationId });
        if (!live()) return;
        if (!written.ok) {
          setView({ ...view, busy: false, error: String(written.json.error ?? "PharmaGuide could not record this connection.") });
          return;
        }
        redirectUrl = written.json.redirect_url;
      } else {
        const cancelled = await callRoute(session, {action: "pair_cancel", authorization_id: authorizationId});
        if (!live()) return;
        if (!cancelled.ok) throw new Error("Cancellation failed");
        const result = await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
        if (result.error) throw new Error("denial failed");
        redirectUrl = result.data?.redirect_url;
      }
      await currentSession(view.session);
      if (!live()) return;
      if (typeof redirectUrl !== "string" || !redirectMatchesCallback(redirectUrl, view.preview.redirect_uri)) {
        throw new Error("callback unavailable");
      }
      window.location.assign(redirectUrl);
    } catch {
      if (!live()) return;
      setView({ ...view, busy: false, error: "The connection could not finish. Check your connections page before trying again from the assistant." });
    } finally { if (live()) actionPending.current = false; }
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
      <section className="space-y-3" aria-label="Phone approval">
        <h2 className="font-semibold">Approve in PharmaGuide on your phone</h2>
        <p>Sign in to the same account in the app. Open AI connections, enter this code, and review the assistant and destination before approving.</p>
        {view.code ? <><p className="font-mono text-2xl" aria-label="Pairing code">{view.code.match(/.{1,4}/g)?.join("-")}</p><p>This code expires in five minutes. Approval connects the assistant; sharing a snapshot is a separate step.</p></> : null}
        {!view.code ? <button type="button" disabled={view.busy} onClick={() => void pair("pair_start")} className="underline">Get approval code</button> : <p>If the code expires, restart this connection from the assistant.</p>}
        {view.code ? <button type="button" disabled={view.busy} onClick={() => void pair("pair_status")} className="ml-4 underline">Check phone approval</button> : null}
        {view.approved ? <p role="status">Approved. Finish connecting below.</p> : null}
      </section>
      {view.error ? (
        <p role="alert" className="text-sm text-neutral-900 dark:text-white">
          {view.error}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={view.busy || !view.approved}
          onClick={() => void decide(true)}
          className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          Finish connecting
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
