import { headers } from "next/headers";
import { SITE_URL, siteUrlFromRequest } from "@/lib/site";

export async function getCurrentSiteUrl(): Promise<URL> {
  if (SITE_URL.hostname !== "localhost") return SITE_URL;

  const requestHeaders = await headers();
  return siteUrlFromRequest(SITE_URL.toString(), requestHeaders);
}
