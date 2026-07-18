import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { getCurrentSiteUrl } from "@/lib/request-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getCurrentSiteUrl();
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
