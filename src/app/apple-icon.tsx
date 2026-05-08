import { ImageResponse } from "next/og";

/**
 * iOS / iPadOS home-screen icon — generated programmatically.
 *
 * Apple's "Add to Home Screen" looks for /apple-icon.png at 180×180.
 * Next.js's `app/apple-icon.tsx` convention emits exactly that.
 *
 * Same design as the favicon (icon.tsx) but scaled up: deep teal
 * background, cream "P," generous border radius so iOS's automatic
 * mask doesn't clip the mark. iOS adds its own mask on top, so we
 * design the artwork to look right both unmasked and after iOS's
 * superellipse clip is applied.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#183B3F", // --color-accent
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FAF9F6", // --color-background
          fontSize: 120,
          fontWeight: 600,
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        P
      </div>
    ),
    { ...size }
  );
}
