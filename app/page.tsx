import type { Metadata } from "next";
import { HomeContent } from "@/components/home-content";
import { getLocale } from "@/lib/i18n";
import { getAllPosts, getPostsPage } from "@/lib/posts";

export function generateMetadata(): Metadata {
  return {
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": "/feed.xml" },
    },
  };
}

export default async function Home() {
  const locale = await getLocale();
  const page = getPostsPage(1);
  return <HomeContent {...page} allPosts={getAllPosts()} locale={locale} />;
}
