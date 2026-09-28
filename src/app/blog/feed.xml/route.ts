import { getAllPosts, getCategory, postModified } from "@/lib/blog";
import { PAGES } from "@/lib/pages";
import { PEOPLE, displayName } from "@/lib/people";
import { absoluteUrl } from "@/lib/schema";
import { FEED_PATH } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * /blog/feed.xml — RSS 2.0 for every article. Google accepts RSS as a
 * discovery source alongside the sitemap; feed readers and AI aggregators
 * pick up new posts from it. Linked from every page's <head>.
 */

export const revalidate = 432000; // 5 days

const escape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const rfc822 = (iso: string) => new Date(iso).toUTCString();

export async function GET() {
  const posts = getAllPosts();
  const lastBuild = posts.map(postModified).sort().at(-1);

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const category = getCategory(post.category)?.label;
      return [
        "    <item>",
        `      <title>${escape(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escape(post.description)}</description>`,
        `      <dc:creator>${escape(displayName(PEOPLE[post.authorId]))}</dc:creator>`,
        `      <pubDate>${rfc822(post.date)}</pubDate>`,
        ...(category ? [`      <category>${escape(category)}</category>`] : []),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(`${site.name} — ${PAGES.blog.title}`)}</title>
    <link>${absoluteUrl(PAGES.blog.path)}</link>
    <description>${escape(PAGES.blog.description)}</description>
    <language>${site.lang}</language>
    <atom:link href="${absoluteUrl(FEED_PATH)}" rel="self" type="application/rss+xml"/>
${lastBuild ? `    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=432000",
    },
  });
}
