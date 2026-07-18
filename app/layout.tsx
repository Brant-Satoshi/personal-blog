import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Newsreader, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getDict, getLocale } from "@/lib/i18n";
import { SITE_AUTHOR, SITE_NAME } from "@/lib/site";
import { getCurrentSiteUrl } from "@/lib/request-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: "500",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDict(locale);
  const siteUrl = await getCurrentSiteUrl();
  return {
    metadataBase: siteUrl,
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${newsreader.variable} ${notoSansSC.variable} antialiased`}
      >
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
