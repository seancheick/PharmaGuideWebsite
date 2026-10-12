"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { SignInPanel } from "@/components/ai-connector/SignInPanel";
import { CONNECTIONS_COPY } from "@/lib/ai-connector";
import { browserSupabase } from "@/lib/supabase-browser";

type Grant = { clientId: string; name: string; grantedAt: string };
type ConnectionRow = { client_id: string; status: string; expires_at: string };

type View =
  | { kind: "loading" }
  | { kind: "message"; text: string }
  | { kind: "signin" }
  | { kind: "list"; session: Session; grants: Grant[]; latest: Record<string, ConnectionRow>; notice?: string };

function statusLine(row: ConnectionRow | undefined): string {
  if (!row) return "No PharmaGuide connection on record.";
  if (row.status === "revoked") return "Disconnected.";
  const expires = new Date(row.expires_at);
  if (row.status !== "active" || expires.getTime() <= Date.now()) return "Ended. Connect again from the assistant to continue.";
  return `Active until ${expires.toLocaleString()}.`;
}

export default function ConnectionsClient() {
  const [view, setView] = useState<View>({ kind: "loading" });

  const load = useCallback(async (notice?: string): Promise<View> => {
    const supabase = browserSupabase();
    if (!supabase) return { kind: "message", text: "Connections are not available right now." };
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) return { kind: "signin" };
    const [{ data: grants, error }, { data: rows }] = await Promise.all([
      supabase.auth.oauth.listGrants(),
      supabase
        .from("ai_connections")
        .select("client_id,status,expires_at")
        .order("created_at", { ascending: false }),
    ]);
    if (error) return { kind: "message", text: "Your connections could not be loaded. Try again shortly." };
    const latest: Record<string, ConnectionRow> = {};
    for (const row of (rows ?? []) as ConnectionRow[]) latest[row.client_id] ??= row;
    return {
      kind: "list",
      session,
      notice,
      grants: (grants ?? []).map((g) => ({ clientId: g.client.id, name: g.client.name, grantedAt: g.granted_at })),
      latest,
    };
  }, []);

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
    if (!supabase) return;
    // Mark the connection revoked first: the personal MCP server refuses the
    // next call even before Supabase revokes the grant and its refresh tokens.
    const response = await fetch("/api/ai-connections", {
      method: "POST",
      headers: { Authorization: `Bearer ${view.session.access_token}`, "content-type": "application/json" },
      body: JSON.stringify({ action: "disconnect", client_id: clientId }),
    });
    const { error } = await supabase.auth.oauth.revokeGrant({ clientId });
    const notice =
      response.ok && !error
        ? CONNECTIONS_COPY.disconnected
        : "PharmaGuide could not finish disconnecting. Try again shortly.";
    setView(await load(notice));
  }

  if (view.kind === "loading") return <p className="text-neutral-500">Loading…</p>;
  if (view.kind === "message") return <p className="text-neutral-700 dark:text-neutral-300">{view.text}</p>;
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
