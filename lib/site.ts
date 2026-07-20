export const SITE_NAME = "Brant Satoshi";
export const SITE_AUTHOR = "Brant Satoshi";
export const SITE_DESCRIPTION = "Notes on software, systems, and product craft.";

function configuredSiteUrl(): URL | undefined {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const candidate = configuredUrl ?? (vercelUrl ? `https://${vercelUrl}` : undefined);

  if (!candidate) return undefined;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("must use http or https");
    }
    return url;
  } catch (error) {
    throw new Error(`Invalid SITE_URL: ${candidate}`, { cause: error });
  }
}

const configuredUrl = configuredSiteUrl();

if (process.env.NODE_ENV === "production" && !configuredUrl) {
  throw new Error(
    "SITE_URL is required during production builds so canonical and social URLs are not generated with localhost",
  );
}

export const SITE_URL = configuredUrl ?? new URL("http://localhost:3000");

export function siteUrlFromRequest(requestUrl: string, requestHeaders: Headers): URL {
  const configured = configuredSiteUrl();
  if (configured) return configured;

  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0];

  if (host) {
    const protocol = forwardedProtocol ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    try {
      return new URL(`${protocol}://${host}`);
    } catch {
      // Fall through to the request URL.
    }
  }

  return new URL("/", requestUrl);
}

export function absoluteUrl(pathname = "/", base = SITE_URL): string {
  return new URL(pathname, base).toString();
}
