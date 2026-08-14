import "server-only";
import { cache } from "react";
import { env } from "./env";
import { log } from "./logger";
import {
  SHARE_CODE_RE,
  generateShareCode,
  resolveShareSnapshotFromIndex,
  shareIndexShardForDsldId,
  type CatalogDisposition,
  type ShareRequest,
  type ShareHighlight,
  type ShareSnapshot,
} from "./share-snapshot";
import { type QualityTierId } from "./quality-score";

/**
 * Storage for public share snapshots, over Supabase PostgREST.
 *
 * ─── WHY RAW FETCH AND NOT @supabase/supabase-js ───────────────────────────
 * This module resolves one immutable release shard, inserts one row, and
 * selects one row by primary key. The official client would add ~50 KB and pull in realtime,
 * auth, and storage sub-clients none of which are used here, in exchange for
 * sugar over two REST calls. PostgREST is a plain HTTP API and `fetch` speaks
 * it directly, which also keeps Next's fetch caching under our control.
 *
 * If this file ever grows joins, RPC, or auth, revisit that call.
 *
 * Every storage and table operation uses the service role in this server-only
 * module. Browser roles have no table grant, so knowing or guessing a code
 * never grants PostgREST enumeration; `/s/{code}` is the only read surface.
 */

const TABLE = "public_share_snapshots";

/** Columns the read path asks for. Explicit so a future column is opt-in. */
const READ_COLUMNS =
  "code,dsld_id,product_name,brand_name,catalog_disposition,quality_score,quality_tier,score_confidence,highlights,catalog_version,created_at";

type SnapshotRow = {
  code: string;
  dsld_id: string;
  product_name: string;
  brand_name: string | null;
  catalog_disposition: CatalogDisposition;
  quality_score: number | null;
  quality_tier: string | null;
  score_confidence: string | null;
  highlights: string[] | null;
  catalog_version: string;
  created_at: string;
};

/** A stored snapshot, with the code and creation time the writer assigned. */
export type StoredShareSnapshot = ShareSnapshot & {
  code: string;
  createdAt: string;
};

function restUrl(path: string): string {
  return `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`;
}

function rowToSnapshot(row: SnapshotRow): StoredShareSnapshot {
  return {
    code: row.code,
    dsldId: row.dsld_id,
    productName: row.product_name,
    brandName: row.brand_name,
    catalogDisposition: row.catalog_disposition,
    qualityScore: row.quality_score,
    // Trusted on the way out because it was validated on the way in and the
    // table has a CHECK keeping score and tier paired. Cast rather than
    // re-validate so a tier the app adds later still renders its number.
    qualityTier: (row.quality_tier as QualityTierId | null) ?? null,
    confidence: row.score_confidence === "Limited" ? "Limited" : null,
    highlights: (row.highlights ?? []) as ShareHighlight[],
    catalogVersion: row.catalog_version,
    createdAt: row.created_at,
  };
}

function storageObjectUrl(path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/authenticated/pharmaguide/${encoded}`;
}

/** Resolve public fields from the exact immutable catalog release on-device. */
export async function resolveCanonicalShareSnapshot(
  request: ShareRequest
): Promise<{ ok: true; value: ShareSnapshot } | { ok: false; error: string }> {
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !env.SUPABASE_URL) {
    return { ok: false, error: "Share storage is not configured." };
  }
  const shard = shareIndexShardForDsldId(request.dsldId);
  const path = `v${request.catalogVersion}/share_index/${shard}.json`;

  let response: Response;
  try {
    response = await fetch(storageObjectUrl(path), {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
      // Versioned release objects are immutable. Cache the small shard; never
      // cache the POST or the mutable share-snapshot table.
      cache: "force-cache",
    });
  } catch (error) {
    log.error("share.catalog_network_error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return { ok: false, error: "Could not reach the catalog release." };
  }

  if (!response.ok) {
    log.warn("share.catalog_release_unavailable", {
      status: response.status,
      catalog_version: request.catalogVersion,
    });
    return { ok: false, error: "Catalog release is not available for sharing." };
  }

  const decoded = await response.json().catch(() => null);
  const resolved = resolveShareSnapshotFromIndex(decoded, request);
  if (!resolved.ok) {
    log.error("share.catalog_contract_invalid", {
      catalog_version: request.catalogVersion,
      error: resolved.error,
    });
  }
  return resolved;
}

/**
 * Insert a validated snapshot and return its code.
 *
 * Codes come from a 6.6e11 space, so a collision is not something to design
 * around — but it is something to survive. A duplicate primary key surfaces
 * as PostgREST 409, which retries with a fresh code. Three attempts, then we
 * fail loudly rather than looping.
 */
export async function createShareSnapshot(
  snapshot: ShareSnapshot
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !env.SUPABASE_URL) {
    // Dev without Supabase configured. Fail explicitly — silently returning a
    // code that resolves to nothing would ship a dead link to a real person.
    return { ok: false, error: "Share storage is not configured." };
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateShareCode();
    let response: Response;
    try {
      response = await fetch(restUrl(TABLE), {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          code,
          dsld_id: snapshot.dsldId,
          product_name: snapshot.productName,
          brand_name: snapshot.brandName,
          catalog_disposition: snapshot.catalogDisposition,
          quality_score: snapshot.qualityScore,
          quality_tier: snapshot.qualityTier,
          score_confidence: snapshot.confidence,
          highlights: snapshot.highlights,
          catalog_version: snapshot.catalogVersion,
        }),
        cache: "no-store",
      });
    } catch (error) {
      log.error("share.insert_network_error", {
        message: error instanceof Error ? error.message : "unknown",
      });
      return { ok: false, error: "Could not reach share storage." };
    }

    if (response.ok) return { ok: true, code };

    // 409 is the unique-violation retry case. Everything else is a real
    // failure and retrying it would just burn the caller's request budget.
    if (response.status !== 409) {
      const detail = await response.text().catch(() => "");
      log.error("share.insert_failed", {
        status: response.status,
        detail: detail.slice(0, 300),
      });
      return { ok: false, error: "Could not save the share." };
    }
    log.warn("share.code_collision", { attempt });
  }

  log.error("share.code_collision_exhausted", {});
  return { ok: false, error: "Could not allocate a share code." };
}

/**
 * Fetch a snapshot by code, or null when it does not exist.
 *
 * The code is validated against the same pattern the database enforces before
 * any request goes out, so a junk path segment costs a regex rather than a
 * round trip — and cannot be used to probe PostgREST with crafted filter
 * syntax.
 *
 * Cached at two levels. React's `cache()` dedupes within a single render —
 * `generateMetadata` and the page body both need the snapshot, and without it
 * a cache miss costs two round trips for one pageview. Next's data cache then
 * holds it for an hour across requests: rows are immutable once written, so
 * the only thing revalidation would catch is a deletion, and an hour of
 * staleness on a takedown beats serving every scan from origin.
 */
export const getShareSnapshot = cache(async function getShareSnapshot(
  code: string
): Promise<StoredShareSnapshot | null> {
  if (!SHARE_CODE_RE.test(code)) return null;

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !env.SUPABASE_URL) {
    log.error("share.read_not_configured", {});
    return null;
  }

  let response: Response;
  try {
    response = await fetch(restUrl(`${TABLE}?code=eq.${code}&select=${READ_COLUMNS}&limit=1`), {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });
  } catch (error) {
    log.error("share.read_network_error", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }

  if (!response.ok) {
    log.error("share.read_failed", { status: response.status });
    return null;
  }

  const rows = (await response.json().catch(() => null)) as SnapshotRow[] | null;
  if (!Array.isArray(rows)) return null;
  const row = rows[0];
  return row ? rowToSnapshot(row) : null;
});
