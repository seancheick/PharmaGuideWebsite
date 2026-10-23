"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SignInPanel } from "@/components/ai-connector/SignInPanel";
import { CONNECTIONS_COPY } from "@/lib/ai-connector";
import { browserSupabase } from "@/lib/supabase-browser";

type Grant = { clientId: string; name: string; grantedAt: string };
type ConnectionRow = { client_id: string; client_name: string | null; status: string; expires_at: string | null; oauth_issuer?: string; consent_id?: string };

type View =
  | { kind: "loading" }
  | { kind: "message"; text: string }
  | { kind: "signin" }
  | { kind: "list"; session: Session; grants: Grant[]; latest: Record<string, ConnectionRow>; notice?: string; busyClientId?: string };

function statusLine(row: ConnectionRow | undefined): string {
  if (!row) return "No PharmaGuide connection on record.";
  if (row.status === "revoked") return "Disconnected.";
  if (row.status === "active" && row.oauth_issuer && row.expires_at === null) return "Active until you disconnect. Shared snapshots expire separately.";
  const expires = new Date(row.expires_at ?? "");
  if (row.status !== "active" || !Number.isFinite(expires.getTime()) || expires.getTime() <= Date.now()) return "Ended. Connect again from the assistant to continue.";
  return `Active until ${expires.toLocaleString()}.`;
}

export default function ConnectionsClient({workosMode = false}: {workosMode?: boolean} = {}) {
  const [view, setView] = useState<View>({ kind: "loading" });

  const load = useCallback(async (notice?: string): Promise<View> => {
    const supabase = browserSupabase();
    if (!supabase) return { kind: "message", text: "Connections are not available right now." };
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) return { kind: "signin" };
      const [{ data: grants, error }, { data: rows, error: rowsError }] = await Promise.all([
        workosMode ? Promise.resolve({data: [], error: null}) : supabase.auth.oauth.listGrants(),
        supabase
          .from("ai_connections")
          .select("client_id,client_name,status,expires_at,oauth_issuer,consent_id")
          .order("created_at", { ascending: false }),
      ]);
      if (error || rowsError) return { kind: "message", text: "Your connections could not be loaded. Try again shortly." };
      const latest: Record<string, ConnectionRow> = {};
      for (const row of (rows ?? []) as ConnectionRow[]) latest[row.client_id] ??= row;
      const combined = new Map<string, Grant>();
      for (const grant of grants ?? []) {
        combined.set(grant.client.id, { clientId: grant.client.id, name: grant.client.name, grantedAt: grant.granted_at });
      }
      // A failed database revoke can leave access active after Auth removed
      // the grant. Keep stored rows visible so Disconnect can be retried.
      for (const row of Object.values(latest)) {
        combined.set(row.client_id, {
          clientId: row.client_id,
          name: row.client_name || combined.get(row.client_id)?.name || "AI assistant",
          grantedAt: combined.get(row.client_id)?.grantedAt ?? "",
        });
      }
      if (workosMode) {
        const recovery = await fetch("/api/ai-connections", {
          method: "POST", headers: {Authorization: `Bearer ${session.access_token}`, "content-type": "application/json"},
          body: JSON.stringify({action: "revocation_status"}),
        });
        if (!recovery.ok) throw new Error("Disconnect recovery unavailable");
        const pending = await recovery.json() as {client_id?: string | null};
        if (pending.client_id) {
          if (!combined.has(pending.client_id)) combined.set(pending.client_id, {clientId: pending.client_id, name: "Unfinished assistant disconnect", grantedAt: ""});
          notice ??= "PharmaGuide access has ended. Retry Disconnect to finish removing the assistant's provider access.";
        }
      }
      return { kind: "list", session, notice, grants: [...combined.values()], latest };
    } catch {
      return { kind: "message", text: "Your connections could not be loaded. Try again shortly." };
    }
  }, [workosMode]);

  useEffect(() => {
    let cancelled = false;
    void load().then((next) => {
      if (!cancelled) setView(next);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function disconnect(clientId: string) {
    if (view.kind !== "list") return;
    const supabase = browserSupabase();
    if (!supabase || view.busyClientId) return;
    setView({ ...view, busyClientId: clientId, notice: undefined });
    let connectionEnded = false;
    let grantEnded = false;
    let providerHandled = workosMode || Boolean(view.latest[clientId]?.oauth_issuer);
    let providerError: string | undefined;
    // Close the database gate first. Still attempt Auth revocation if that
    // request fails, and retain the row until cleanup can be retried.
    try {
      const response = await fetch("/api/ai-connections", {
        method: "POST",
        headers: { Authorization: `Bearer ${view.session.access_token}`, "content-type": "application/json" },
        body: JSON.stringify({ action: "disconnect", client_id: clientId }),
      });
      connectionEnded = response.ok;
      const result = await response.json().catch(() => ({}));
      providerHandled ||= result.provider_handled === true;
      if (providerHandled) { grantEnded = response.ok; providerError = result.error; }
    } catch { /* Keep the retryable connection visible below. */ }
    try {
      if (!providerHandled) {
        const { error } = await supabase.auth.oauth.revokeGrant({ clientId });
        grantEnded = !error;
      }
    } catch { /* A failed Auth revoke also needs a visible retry. */ }
    const notice = connectionEnded && grantEnded
      ? CONNECTIONS_COPY.disconnected
      : providerError ?? "PharmaGuide could not finish disconnecting. Try again shortly.";
    const next = await load(notice);
    setView(next.kind === "message" ? { ...view, busyClientId: undefined, notice: `${notice} ${next.text}` } : next);
  }

  if (view.kind === "loading") return <p className="text-neutral-500">Loading…</p>;
  if (view.kind === "message") return (
    <div className="space-y-3">
      <p role="alert" className="text-neutral-700 dark:text-neutral-300">{view.text}</p>
      <button type="button" onClick={() => { setView({ kind: "loading" }); void load().then(setView); }} className="font-semibold underline">Try again</button>
    </div>
  );
  if (view.kind === "signin") {
    const supabase = browserSupabase();
    return supabase ? <SignInPanel supabase={supabase} reason="Sign in to see your connected assistants." /> : null;
  }

  return (
    <article className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{CONNECTIONS_COPY.title}</h1>
      <p className="text-neutral-700 dark:text-neutral-300">{CONNECTIONS_COPY.intro}</p>
      {view.notice ? (
        <p role="status" className="text-sm text-neutral-900 dark:text-white">
          {view.notice}
        </p>
      ) : null}
      {view.grants.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">{CONNECTIONS_COPY.empty}</p>
      ) : (
        <ul className="space-y-3">
          {view.grants.map((grant) => (
            <li
              key={grant.clientId}
              className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-700"
            >
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">{grant.name}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{statusLine(view.latest[grant.clientId])}</p>
              </div>
              <button
                type="button"
                disabled={Boolean(view.busyClientId)}
                onClick={() => void disconnect(grant.clientId)}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 dark:border-neutral-600 dark:text-white"
              >
                {CONNECTIONS_COPY.disconnect}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{CONNECTIONS_COPY.chatHistoryNote}</p>
    </article>
  );
}
