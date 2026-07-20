import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getDict, getLocale } from "@/lib/i18n";
import { SITE_AUTHOR, SITE_NAME, SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDict(locale);
  return {
    metadataBase: SITE_URL,
    title: {
      default: t.meta.siteTitle,
      template: `%s · ${SITE_NAME}`,
    },
    description: t.meta.siteDescription,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_AUTHOR }],
    creator: SITE_AUTHOR,
    publisher: SITE_AUTHOR,
    alternates: {
      types: { "application/rss+xml": "/feed.xml" },
    },
    openGraph: {
      type: "website",
      url: "/",
      siteName: SITE_NAME,
      title: t.meta.siteTitle,
      description: t.meta.siteDescription,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.siteTitle,
      description: t.meta.siteDescription,
    },
  };
}

const noFlashScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefers)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const t = getDict(locale);
  return (
    <html lang={t.htmlLang} suppressHydrationWarning>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
        <div className="page-surface min-h-screen">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
