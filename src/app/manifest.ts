import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * /manifest.webmanifest — for PWA / Add to Home Screen.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F6",
    theme_color: "#FAF9F6",
    orientation: "portrait",
    categories: ["health", "medical", "lifestyle"],
    // Icons emitted by Next.js App Router conventions:
    //   src/app/icon.tsx        → /icon.png (32×32, favicon)
    //   src/app/icon1.tsx       → /icon1.png (192×192, PWA)
    //   src/app/apple-icon.tsx  → /apple-icon.png (180×180, iOS home)
    icons: [
      { src: "/icon1.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
