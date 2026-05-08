import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PharmaGuide — Supplement intelligence.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Auto-generated OG image. Next.js serves this at /opengraph-image
 * and wires it into the metadata automatically — no manual <meta> tag needed.
 *
 * Design: cream background (#FAF9F6), deep teal accent (#183B3F),
 * matching the homepage's "calm clinical premium" aesthetic.
 */
export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "100%",
          padding: "80px 90px",
          backgroundColor: "#FAF9F6",
          position: "relative",
        }}
      >
        {/* Subtle halo in top-right */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(24,59,63,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Accent dot + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#183B3F",
            }}
          />
          <span
            style={{
              fontSize: "32px",
              fontWeight: 500,
              color: "#181A1B",
              letterSpacing: "-0.01em",
            }}
          >
            PharmaGuide
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "64px",
              fontWeight: 500,
              color: "#181A1B",
              lineHeight: 1.08,
              letterSpacing: "-0.022em",
            }}
          >
            Your supplements don't
          </span>
          <span
            style={{
              fontSize: "64px",
              fontWeight: 500,
              color: "#181A1B",
              lineHeight: 1.08,
              letterSpacing: "-0.022em",
            }}
          >
            work in isolation.
          </span>
          <span
            style={{
              fontSize: "64px",
              fontWeight: 500,
              color: "#183B3F",
              lineHeight: 1.08,
              letterSpacing: "-0.022em",
              fontStyle: "italic",
            }}
          >
            Neither should your check.
          </span>
        </div>

        {/* Trust row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginTop: "48px",
            fontSize: "18px",
            color: "#63666A",
          }}
        >
          <span style={{ fontWeight: 500, color: "#181A1B" }}>
            180,000+ products
          </span>
          <span style={{ color: "#D1CDC4" }}>·</span>
          <span>Evidence-graded</span>
          <span style={{ color: "#D1CDC4" }}>·</span>
          <span>Clinician-informed</span>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#183B3F",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
