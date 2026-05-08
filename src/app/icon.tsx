import { ImageResponse } from "next/og";

/**
 * Browser-tab favicon — generated programmatically.
 *
 * Next.js App Router convention: any `app/icon.{tsx,png,svg}` becomes
 * the site's favicon. This file emits a 32×32 PNG at build time using
 * the brand tokens (deep teal background + cream "P"). When the real
 * bitmap logo is ready, replace this file with a static `app/icon.png`
 * (or `app/favicon.ico`) and Next will pick it up automatically.
 *
 * Why programmatic instead of a static PNG?
 *   - No static asset to manage / commit
 *   - Always in sync with brand tokens (change the teal here, every
 *     surface that uses the favicon stays consistent)
 *   - Works at any resolution Next requests
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#183B3F", // --color-accent
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FAF9F6", // --color-background (warm cream)
          fontSize: 22,
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
