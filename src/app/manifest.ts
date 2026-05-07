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
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
