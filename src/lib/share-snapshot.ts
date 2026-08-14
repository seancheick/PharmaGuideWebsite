/**
 * The public share contract — one shape, one validator, one brain.
 *
 * ─── WHAT THIS IS ──────────────────────────────────────────────────────────
 * Tapping Share posts only a DSLD id and the locally active catalog version.
 * The server resolves every display field from the immutable share-index
 * shard published with that pipeline release, then stores the resolved row.
 *
 * The stored snapshot remains immutable, but its content is not client
 * authored. The release artifact is a projection of the same checksum-verified
 * SQLite row the phone renders, so historical links stay honest without a
 * second scorer or a public catalog API.
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

import { createHash } from "node:crypto";
import { QUALITY_TIER_IDS, type QualityTierId } from "./quality-score";

export const SHARE_INDEX_SCHEMA_VERSION = 2;
export const SHARE_INDEX_SHARD_PREFIX_LENGTH = 2;

/** Map a product id to the immutable release shard published by the pipeline. */
export function shareIndexShardForDsldId(dsldId: string): string {
  return createHash("sha256")
    .update(dsldId)
    .digest("hex")
    .slice(0, SHARE_INDEX_SHARD_PREFIX_LENGTH);
}

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
 * Form-derived reasons remain excluded because this card intentionally keeps
 * its claims to compact, objectively checkable product facts.
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

export const CATALOG_DISPOSITIONS = ["scored", "not_scored", "blocked"] as const;
export type CatalogDisposition = (typeof CATALOG_DISPOSITIONS)[number];

export type ShareRequest = {
  dsldId: string;
  catalogVersion: string;
};

export function shareDispositionCopy(disposition: CatalogDisposition): {
  title: string;
  body: string;
  description: string;
} {
  switch (disposition) {
    case "blocked":
      return {
        title: "Blocked from scoring",
        body: "PharmaGuide found a product-level safety issue and does not publish a quality score for this product. Open it in PharmaGuide for the full details.",
        description:
          "PharmaGuide blocked this product from quality scoring because of a catalog-level safety issue.",
      };
    case "not_scored":
      return {
        title: "Quality score not published",
        body: "This product does not have a published quality score because its label data did not meet the scoring requirements. Open it in PharmaGuide for the full details.",
        description: "This product does not have a published PharmaGuide quality score.",
      };
    case "scored":
      return {
        title: "Quality score published",
        body: "This product has a published PharmaGuide quality score.",
        description: "This product has a published PharmaGuide quality score.",
      };
  }
}

/** A validated snapshot, exactly as stored and exactly as rendered. */
export type ShareSnapshot = {
  dsldId: string;
  productName: string;
  brandName: string | null;
  catalogDisposition: CatalogDisposition;
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
  catalogVersion: string;
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
    const bytes = crypto.getRandomValues(new Uint8Array(SHARE_CODE_LENGTH - out.length));
    for (const byte of bytes) {
      if (byte >= limit) continue;
      out += CODE_ALPHABET[byte % CODE_ALPHABET.length];
    }
  }
  return out;
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

function trimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/**
 * Validate the only two values the app may author at the public boundary.
 * Unknown keys are rejected so trusted product fields cannot quietly return.
 */
export function validateShareRequest(raw: unknown): ValidationResult<ShareRequest> {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Body must be a JSON object." };
  }
  const body = raw as Record<string, unknown>;
  const keys = Object.keys(body);
  if (keys.some((key) => key !== "dsldId" && key !== "catalogVersion")) {
    return { ok: false, error: "Body contains unsupported fields." };
  }

  const dsldId = trimmedString(body.dsldId);
  if (!dsldId) return { ok: false, error: "dsldId is required." };
  if (!/^\d{1,64}$/.test(dsldId)) {
    return { ok: false, error: "dsldId is invalid." };
  }

  const catalogVersion = trimmedString(body.catalogVersion);
  if (!catalogVersion || !/^\d{4}\.\d{2}\.\d{2}\.\d{6}$/.test(catalogVersion)) {
    return { ok: false, error: "catalogVersion is invalid." };
  }

  return { ok: true, value: { dsldId, catalogVersion } };
}

/** Resolve and validate one product from an untrusted decoded release shard. */
export function resolveShareSnapshotFromIndex(
  rawIndex: unknown,
  request: ShareRequest
): ValidationResult<ShareSnapshot> {
  if (typeof rawIndex !== "object" || rawIndex === null) {
    return { ok: false, error: "Catalog share index is invalid." };
  }
  const index = rawIndex as Record<string, unknown>;
  if (
    index.schemaVersion !== SHARE_INDEX_SCHEMA_VERSION ||
    index.shardPrefixLength !== SHARE_INDEX_SHARD_PREFIX_LENGTH ||
    index.catalogVersion !== request.catalogVersion
  ) {
    return { ok: false, error: "Catalog share index version mismatch." };
  }
  if (typeof index.products !== "object" || index.products === null) {
    return { ok: false, error: "Catalog share index has no products." };
  }
  const raw = (index.products as Record<string, unknown>)[request.dsldId];
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Product is not available in this catalog release." };
  }
  const entry = raw as Record<string, unknown>;

  const productName = trimmedString(entry.productName);
  if (!productName || productName.length > 200) {
    return { ok: false, error: "Catalog product name is invalid." };
  }
  const brandName = entry.brandName === null ? null : trimmedString(entry.brandName);
  if (entry.brandName !== null && (!brandName || brandName.length > 200)) {
    return { ok: false, error: "Catalog brand name is invalid." };
  }
  const disposition = trimmedString(entry.catalogDisposition);
  if (!disposition || !(CATALOG_DISPOSITIONS as readonly string[]).includes(disposition)) {
    return { ok: false, error: "Catalog disposition is invalid." };
  }
  const catalogDisposition = disposition as CatalogDisposition;

  let qualityScore: number | null = null;
  let qualityTier: QualityTierId | null = null;
  if (catalogDisposition === "scored") {
    if (
      !Number.isInteger(entry.qualityScore) ||
      (entry.qualityScore as number) < 0 ||
      (entry.qualityScore as number) > 100
    ) {
      return { ok: false, error: "Catalog quality score is invalid." };
    }
    const tier = trimmedString(entry.qualityTier)?.toLowerCase();
    if (!tier || !(QUALITY_TIER_IDS as readonly string[]).includes(tier)) {
      return { ok: false, error: "Catalog quality tier is invalid." };
    }
    qualityScore = entry.qualityScore as number;
    qualityTier = tier as QualityTierId;
  } else if (entry.qualityScore !== null || entry.qualityTier !== null) {
    return { ok: false, error: "Unscored catalog product contains a score." };
  }

  let confidence: ShareConfidence | null = null;
  if (entry.confidence !== null) {
    if (catalogDisposition !== "scored" || entry.confidence !== "Limited") {
      return { ok: false, error: "Catalog confidence is invalid." };
    }
    confidence = "Limited";
  }

  if (!Array.isArray(entry.highlights) || entry.highlights.length > MAX_HIGHLIGHTS) {
    return { ok: false, error: "Catalog highlights are invalid." };
  }
  const highlights = entry.highlights.filter(
    (value): value is ShareHighlight =>
      typeof value === "string" && (HIGHLIGHT_ALLOWLIST as readonly string[]).includes(value)
  );
  if (
    highlights.length !== entry.highlights.length ||
    new Set(highlights).size !== highlights.length
  ) {
    return { ok: false, error: "Catalog highlights contain unsupported values." };
  }
  if (catalogDisposition === "blocked" && highlights.length > 0) {
    return { ok: false, error: "Blocked catalog product contains positive highlights." };
  }

  return {
    ok: true,
    value: {
      dsldId: request.dsldId,
      productName,
      brandName,
      catalogDisposition,
      qualityScore,
      qualityTier,
      confidence,
      highlights,
      catalogVersion: request.catalogVersion,
    },
  };
}
