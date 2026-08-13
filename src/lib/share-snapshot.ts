/**
 * The public share contract — one shape, one validator, one brain.
 *
 * ─── WHAT THIS IS ──────────────────────────────────────────────────────────
 * Tapping Share on a product in the app POSTs an allowlisted payload here.
 * `/api/share` validates it against this module, mints a code, and writes one
 * row to `public_share_snapshots`. `/s/{code}` renders that row. Both routes
 * import from this file, so the thing we accept and the thing we display
 * cannot drift.
 *
 * ─── WHY A SNAPSHOT, NOT A CATALOG LOOKUP ──────────────────────────────────
 * This website has no product data — the catalog is a 180k-row SQLite file
 * bundled into the app and a Supabase storage blob for the pipeline. Standing
 * up a public catalog API to serve share links would create a second source of
 * truth for scores that immediately starts drifting from the app.
 *
 * Instead we store what the sharer actually saw, stamped with the catalog
 * version they saw it in. The page can then say "checked on <date>" honestly.
 * A score recomputed next month does not silently rewrite what someone shared
 * last month, and nobody has to keep two scoring systems in sync.
 *
 * ─── WHY THE FIELD LIST IS SO SHORT ────────────────────────────────────────
 * Everything absent here is absent on purpose.
 *
 * No user id, device id, or session token. A share must never be linkable to
 * the person who made it, and the storage columns to do so do not exist.
 *
 * No personal-fit verdict. Quality describes the product; fit depends on the
 * reader's medications and conditions, which we do not know. The app's
 * `ShareService` already enforces this and its tests assert it; this module is
 * the same boundary on the server side.
 *
 * No form-quality or scoring-derived reasons — see HIGHLIGHT_ALLOWLIST.
 */

import { QUALITY_TIER_IDS, type QualityTierId } from "./quality-score";

/**
 * The only highlights allowed onto a public page.
 *
 * These mirror `buildHeroTrustTags()` in the app
 * (`lib/features/product_detail/v2/sections/hero_section.dart`) and share its
 * defining property: every one is an OBJECTIVELY CHECKABLE LABEL FACT. A
 * third-party testing certificate either exists or it does not. Organic
 * certification either exists or it does not. If challenged, each of these
 * resolves to a document.
 *
 * Deliberately NOT on this list: anything derived from form quality
 * ("good ingredient forms", "well-absorbed forms", "premium formulation").
 * Those come from `bio_score` in the pipeline's ingredient quality map, where
 * an audit on 2026-08-13 found 117 of 271 forms rated "excellent" (bio_score
 * >= 12) carrying no evidence reference of any kind. Inside the app that is an
 * internal heuristic a user reads next to an explanation. On a page a stranger
 * opens, with no context and our name on it, it becomes a public claim we
 * cannot currently source.
 *
 * Add form-derived reasons here the day those citations close — not before.
 * The gate is the citation work in the pipeline repo, tracked separately.
 */
export const HIGHLIGHT_ALLOWLIST = [
  "Third-Party Tested",
  "Trusted Manufacturer",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Soy-Free",
  "Organic",
  "Non-GMO",
] as const;

export type ShareHighlight = (typeof HIGHLIGHT_ALLOWLIST)[number];

/** At most this many highlights reach the card. Matches the app's `.take(3)`. */
export const MAX_HIGHLIGHTS = 3;

/**
 * Confidence cue, mirroring `catalogScoreConfidenceLabel()` in the app: only
 * a limited-confidence score gets a label. High and moderate say nothing,
 * because captioning a normal score with "confidence: high" reads as a boast
 * rather than a caveat.
 */
export const SHARE_CONFIDENCE_VALUES = ["Limited"] as const;
export type ShareConfidence = (typeof SHARE_CONFIDENCE_VALUES)[number];

/** A validated snapshot, exactly as stored and exactly as rendered. */
export type ShareSnapshot = {
  dsldId: string;
  productName: string;
  brandName: string | null;
  /**
   * 0–100, or null when the product is blocked or not scored.
   *
   * Score and tier travel together: both present, or both absent. A tier
   * without a number is a verdict with nothing behind it, and a number
   * without a tier is the ambiguity this whole vocabulary exists to prevent.
   * The database enforces the same pairing with a CHECK constraint.
   */
  qualityScore: number | null;
  qualityTier: QualityTierId | null;
  confidence: ShareConfidence | null;
  highlights: ShareHighlight[];
  catalogVersion: string | null;
};

/**
 * Short-code alphabet: 30 symbols, Crockford-style.
 *
 * Excludes i, l, o, u, 0 and 1 — the first five because they are misread when
 * a code is spoken aloud or typed from a screenshot, and `u` so no generated
 * code can spell something unfortunate. 30^8 ≈ 6.6e11 keeps collisions
 * theoretical at any volume this will ever see.
 *
 * MUST stay in sync with the `share_code_format` CHECK constraint on
 * `public_share_snapshots` (`^[a-hjkmnp-tv-z2-9]{8}$`).
 */
const CODE_ALPHABET = "abcdefghjkmnpqrstvwxyz23456789";
export const SHARE_CODE_LENGTH = 8;
export const SHARE_CODE_RE = /^[a-hjkmnp-tv-z2-9]{8}$/;

/**
 * A fresh share code, from the crypto RNG rather than Math.random.
 *
 * Rejection sampling on the byte draw: 256 is not a multiple of 30, so
 * accepting `byte % 30` outright would make the first 16 symbols of the
 * alphabet measurably likelier than the last 14. Bytes at or above the
 * largest multiple of 30 (240) are discarded and redrawn, which costs a few
 * extra bytes and keeps the distribution flat.
 */
export function generateShareCode(): string {
  const limit = Math.floor(256 / CODE_ALPHABET.length) * CODE_ALPHABET.length;
  let out = "";
  while (out.length < SHARE_CODE_LENGTH) {
    const bytes = crypto.getRandomValues(
      new Uint8Array(SHARE_CODE_LENGTH - out.length)
    );
    for (const byte of bytes) {
      if (byte >= limit) continue;
      out += CODE_ALPHABET[byte % CODE_ALPHABET.length];
    }
  }
  return out;
}

export type ValidationResult =
  | { ok: true; value: ShareSnapshot }
  | { ok: false; error: string };

function trimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Validate an untrusted share payload.
 *
 * Written to fail closed on every axis. Unknown highlights are dropped rather
 * than rejected, so an app build that adds a trust tag we have not allowlisted
 * yet still shares successfully with the tags we do recognise — a partial card
 * beats a broken share sheet. Everything else is a hard error.
 */
export function validateShareSnapshot(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Body must be a JSON object." };
  }
  const body = raw as Record<string, unknown>;

  const dsldId = trimmedString(body.dsldId);
  if (!dsldId) return { ok: false, error: "dsldId is required." };
  if (dsldId.length > 64) {
    return { ok: false, error: "dsldId is too long." };
  }

  const productName = trimmedString(body.productName);
  if (!productName) return { ok: false, error: "productName is required." };
  if (productName.length > 200) {
    return { ok: false, error: "productName is too long." };
  }

  const brandName = trimmedString(body.brandName);
  if (brandName && brandName.length > 200) {
    return { ok: false, error: "brandName is too long." };
  }

  // Score and tier are validated as a pair. Either the caller is sharing a
  // scored product and supplies both, or it is sharing a blocked / not-scored
  // one and supplies neither. A half-populated pair means the caller's own
  // gating is broken, and guessing the missing half is how a blocked product
  // acquires a score it was never given.
  const hasScore = body.qualityScore !== null && body.qualityScore !== undefined;
  const rawTier = trimmedString(body.qualityTier);

  let qualityScore: number | null = null;
  let qualityTier: QualityTierId | null = null;

  if (hasScore) {
    const score = Number(body.qualityScore);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return { ok: false, error: "qualityScore must be between 0 and 100." };
    }
    if (!rawTier) {
      return { ok: false, error: "qualityTier is required when qualityScore is present." };
    }
    const tier = rawTier.toLowerCase();
    if (!(QUALITY_TIER_IDS as readonly string[]).includes(tier)) {
      return { ok: false, error: `Unrecognised qualityTier: ${rawTier}` };
    }
    qualityScore = Math.round(score);
    qualityTier = tier as QualityTierId;
  } else if (rawTier) {
    return { ok: false, error: "qualityTier requires qualityScore." };
  }

  let confidence: ShareConfidence | null = null;
  const rawConfidence = trimmedString(body.confidence);
  if (rawConfidence) {
    const match = SHARE_CONFIDENCE_VALUES.find(
      (v) => v.toLowerCase() === rawConfidence.toLowerCase()
    );
    if (!match) {
      return { ok: false, error: `Unrecognised confidence: ${rawConfidence}` };
    }
    confidence = match;
  }

  // Unknown tags are dropped, not rejected — see the doc comment above.
  // De-duplicated because the app builds this list from eight independent
  // booleans and a future refactor could plausibly emit one twice.
  let highlights: ShareHighlight[] = [];
  if (body.highlights !== undefined && body.highlights !== null) {
    if (!Array.isArray(body.highlights)) {
      return { ok: false, error: "highlights must be an array." };
    }
    const seen = new Set<string>();
    highlights = body.highlights
      .map((h) => trimmedString(h))
      .filter((h): h is string => h !== null)
      .map((h) => HIGHLIGHT_ALLOWLIST.find((a) => a.toLowerCase() === h.toLowerCase()))
      .filter((h): h is ShareHighlight => h !== undefined)
      .filter((h) => (seen.has(h) ? false : (seen.add(h), true)))
      .slice(0, MAX_HIGHLIGHTS);
  }

  const catalogVersion = trimmedString(body.catalogVersion);
  if (catalogVersion && catalogVersion.length > 32) {
    return { ok: false, error: "catalogVersion is too long." };
  }

  return {
    ok: true,
    value: {
      dsldId,
      productName,
      brandName,
      qualityScore,
      qualityTier,
      confidence,
      highlights,
      catalogVersion,
    },
  };
}
