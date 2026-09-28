import type { Metadata } from "next";
import { absoluteUrl } from "./schema";
import { site } from "./site";

/**
 * Metadata builder — every route's <title>, description, canonical,
 * Open Graph and Twitter tags come from here.
 *
 * Why one builder: Next.js replaces a parent's `openGraph` / `twitter`
 * object wholesale when a child route defines its own. Each page used to
 * hand-assemble those objects without `images`, so 14 of 15 pages shipped
 * no share image at all. Building them in one place makes an image,
 * canonical and feed link impossible to forget.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const FEED_PATH = "/blog/feed.xml";

export const ogImagePath = {
  page: (key: string) => `/og/page/${key}`,
  post: (slug: string) => `/og/post/${slug}`,
} as const;

export interface MetadataInput {
  /** Segment title; the root template appends " · PharmaGuide". */
  title: string;
  /** Use the title as-is (homepage). */
  absoluteTitle?: boolean;
  description: string;
  path: string;
  image: { path: string; alt: string };
  article?: {
    publishedTime: string;
    modifiedTime: string;
    authors: string[];
    section?: string;
    tags?: string[];
  };
  robots?: Metadata["robots"];
}

export function buildMetadata(m: MetadataInput): Metadata {
  const url = absoluteUrl(m.path);
  const images = [{ url: m.image.path, ...OG_SIZE, alt: m.image.alt, type: "image/png" }];
  const socialTitle = m.absoluteTitle ? m.title : `${m.title} · ${site.name}`;

  return {
    title: m.absoluteTitle ? { absolute: m.title } : m.title,
    description: m.description,
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": [{ url: FEED_PATH, title: `${site.name} — Articles` }],
      },
    },
    openGraph: {
      title: socialTitle,
      description: m.description,
      url,
      siteName: site.name,
      locale: site.locale,
      images,
      ...(m.article
        ? {
            type: "article",
            publishedTime: m.article.publishedTime,
            modifiedTime: m.article.modifiedTime,
            authors: m.article.authors,
            ...(m.article.section ? { section: m.article.section } : {}),
            ...(m.article.tags ? { tags: m.article.tags } : {}),
          }
        : { type: "website" }),
    },
    twitter: {
      card: "summary_large_image",
      site: site.twitter,
      creator: site.twitter,
      title: socialTitle,
      description: m.description,
      images,
    },
    ...(m.robots ? { robots: m.robots } : {}),
  };
}
