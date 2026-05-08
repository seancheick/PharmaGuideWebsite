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
    // Static PNGs in src/app/ (App Router convention):
    //   icon.png        → 32×32   browser tab favicon
    //   apple-icon.png  → 180×180 iOS "Add to Home Screen"
    //   icon1.png       → 192×192 Android PWA install
    //   icon2.png       → 512×512 Android PWA splash + high-DPI
    icons: [
      { src: "/icon1.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon2.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
