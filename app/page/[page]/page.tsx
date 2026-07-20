import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HomeContent } from "@/components/home-content";
import { getLocale } from "@/lib/i18n";
import { getAllPosts, getPostsPage, POSTS_PER_PAGE } from "@/lib/posts";

type Props = { params: Promise<{ page: string }> };

export function generateStaticParams() {
  const count = Math.ceil(getAllPosts().length / POSTS_PER_PAGE);
  return Array.from({ length: Math.max(0, count - 1) }, (_, index) => ({
    page: String(index + 2),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = Number((await params).page);
  const locale = await getLocale();
  return {
    title: locale === "zh" ? `第 ${page} 页` : `Page ${page}`,
    alternates: { canonical: `/page/${page}` },
  };
}

export default async function PostsPage({ params }: Props) {
  const pageNumber = Number((await params).page);
  const page = getPostsPage(pageNumber);
  if (!Number.isInteger(pageNumber) || pageNumber < 2 || pageNumber > page.totalPages) {
    notFound();
  }
  return <HomeContent {...page} allPosts={getAllPosts()} locale={await getLocale()} />;
}
