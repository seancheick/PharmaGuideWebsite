import { notFound } from "next/navigation";
import { renderOgCard } from "@/lib/og";
import { PAGE_KEYS, PAGES, isPageKey } from "@/lib/pages";

/** Share card for every registered page — copy lives in lib/pages.ts. */

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return PAGE_KEYS.map((key) => ({ key }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isPageKey(key)) notFound();
  const { eyebrow, headline, accent } = PAGES[key].og;
  return renderOgCard({ eyebrow, headline, accent });
}
