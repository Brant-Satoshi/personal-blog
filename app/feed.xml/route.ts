import { getAllPosts } from "@/lib/posts";
import {
  absoluteUrl,
  siteUrlFromRequest,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822Date(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

export function GET(request: Request): Response {
  const posts = getAllPosts();
  const requestSiteUrl = siteUrlFromRequest(request.url, request.headers);
  const feedUrl = absoluteUrl("/feed.xml", requestSiteUrl);
  const siteUrl = absoluteUrl("/", requestSiteUrl);
  const lastBuildDate = posts[0]
    ? toRfc822Date(posts[0].updated ?? posts[0].date)
    : new Date(0).toUTCString();

  const items = posts
    .map((post) => {
      const postUrl = absoluteUrl(`/${post.slug}`, requestSiteUrl);
      const category = post.category
        ? `\n      <category>${escapeXml(post.category)}</category>`
        : "";
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${toRfc822Date(post.date)}</pubDate>${category}
      <description>${escapeXml(post.summary || post.excerpt || "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
