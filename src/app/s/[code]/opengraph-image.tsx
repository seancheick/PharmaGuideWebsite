import { ImageResponse } from "next/og";
import { getShareSnapshot } from "@/lib/share-store";
import { bandForTierId } from "@/lib/quality-score";

export const alt = "PharmaGuide supplement check";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

/**
 * OG image for a shared product link.
 *
 * This is the actual "share card" — the thing a recipient sees in Messages,
 * WhatsApp, or Slack before deciding whether to tap. Rendering it here rather
 * than composing a bitmap in the app means the card and the landing page are
 * generated from one snapshot and physically cannot disagree, and that a
 * design change ships by deploying the website rather than by shipping a new
 * app build through review.
 *
 * ─── PALETTE ───────────────────────────────────────────────────────────────
 * Hardcoded hex, deliberately. Satori resolves no CSS custom properties and no
 * Tailwind, so the design tokens cannot be imported. Values mirror
 * `globals.css`; if the brand palette moves, this file is a known second place
 * to update. The homepage OG image at src/app/opengraph-image.tsx has the same
 * constraint and the same duplication.
 */
const CREAM = "#FAF9F6";
const INK = "#181A1B";
const TEAL = "#183B3F";
const MUTED = "#63666A";
const HAIRLINE = "#D1CDC4";

/** Verdict tone, mirroring the severity tokens the site renders in CSS. */
const TIER_COLOR: Record<string, string> = {
  elite: "#3F6250",
  excellent: "#3F6250",
  strong: "#3F6250",
  acceptable: "#827140",
  weak: "#AD7A24",
  poor: "#B85429",
};

export default async function ShareOgImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const snapshot = await getShareSnapshot(code);

  // A missing snapshot still has to return an image — a scraper that gets a
  // 404 here shows a broken thumbnail next to a working link. Fall back to the
  // brand card instead.
  const productName = snapshot?.productName ?? "PharmaGuide";
  const brandName = snapshot?.brandName ?? null;
  const band = snapshot?.qualityTier
    ? bandForTierId(snapshot.qualityTier)
    : undefined;
  const score = snapshot?.qualityScore ?? null;
  const hasScore = score !== null && band !== undefined;
  const tone = band ? (TIER_COLOR[band.id] ?? TEAL) : TEAL;
  const highlights = snapshot?.highlights ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
          backgroundColor: CREAM,
          position: "relative",
        }}
      >
        {/* Ambient halo, top-right — same motif as the homepage card */}
        <div
          style={{
            position: "absolute",
            top: "-140px",
            right: "-100px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(24,59,63,0.09) 0%, transparent 70%)",
          }}
        />

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: TEAL,
            }}
          />
          <span style={{ fontSize: "26px", fontWeight: 500, color: INK }}>
            PharmaGuide
          </span>
          <span
            style={{
              marginLeft: "10px",
              fontSize: "17px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            Supplement check
          </span>
        </div>

        {/* Product */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "54px",
          }}
        >
          <span
            style={{
              fontSize: productName.length > 42 ? "52px" : "64px",
              fontWeight: 500,
              color: INK,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            {productName.length > 76
              ? `${productName.slice(0, 74)}…`
              : productName}
          </span>
          {brandName && (
            <span
              style={{ fontSize: "28px", color: MUTED, marginTop: "12px" }}
            >
              {brandName.length > 48 ? `${brandName.slice(0, 46)}…` : brandName}
            </span>
          )}
        </div>

        {/* Score block, pinned to the bottom of the card */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          {hasScore ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "112px",
                    fontWeight: 500,
                    color: tone,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {score}
                </span>
                <span style={{ fontSize: "34px", color: MUTED }}>/100</span>
                <span
                  style={{
                    fontSize: "34px",
                    fontWeight: 500,
                    color: tone,
                    marginLeft: "16px",
                  }}
                >
                  {band.label}
                </span>
              </div>
              <span style={{ fontSize: "20px", color: MUTED, marginTop: "18px" }}>
                Quality reflects the product. Personal fit depends on your profile.
              </span>
            </div>
          ) : (
            <span
              style={{ fontSize: "30px", color: MUTED, maxWidth: "760px" }}
            >
              No published quality score yet — open it in PharmaGuide for the
              full picture.
            </span>
          )}

          {highlights.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "10px",
              }}
            >
              {highlights.map((highlight) => (
                <span
                  key={highlight}
                  style={{
                    fontSize: "21px",
                    color: INK,
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: "999px",
                    padding: "8px 18px",
                  }}
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: tone,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
