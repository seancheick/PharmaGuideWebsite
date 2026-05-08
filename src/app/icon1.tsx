import { ImageResponse } from "next/og";

/**
 * PWA icon (192×192) for "Add to Home Screen" on Android + manifest.
 * Filename `icon1.tsx` (not `icon.tsx`) so Next emits BOTH the 32×32
 * favicon and this larger PWA size. The manifest references it as
 * /icon1.png — see manifest.ts.
 */
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon192() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#183B3F",
          borderRadius: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FAF9F6",
          fontSize: 128,
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
