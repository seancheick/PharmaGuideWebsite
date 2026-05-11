"use client";

import { usePathname } from "next/navigation";
import { ChatLauncher } from "./ChatLauncher";

/**
 * ChatLauncherGate — decides whether to render the chat launcher
 * based on the current route. Keeps the launcher off:
 *   • Legal & disclosure pages (privacy / terms / hipaa / accessibility)
 *     — where it would intrude on serious reading
 *
 * Everywhere else (home, features, methodology, faq, blog hub + posts,
 * about, careers, press) the launcher fades in after scroll.
 *
 * Wraps ChatLauncher so the layout can mount it server-side without
 * a `use client` directive on the layout itself.
 */

const HIDDEN_ROUTES = ["/privacy", "/terms", "/hipaa", "/accessibility"];

export function ChatLauncherGate() {
  const pathname = usePathname();
  const shouldHide = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  if (shouldHide) return null;
  return <ChatLauncher />;
}
