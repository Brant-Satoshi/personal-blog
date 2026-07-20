import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = SITE_URL;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: absoluteUrl("/sitemap.xml", siteUrl),
    host: siteUrl.origin,
  };
}
