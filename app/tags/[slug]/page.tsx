import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TaxonomyPosts } from "@/components/taxonomy-posts";
import { getDict, getLocale } from "@/lib/i18n";
import { getAllTags, getPostsByTag } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getAllTags().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = getAllTags().find((item) => item.slug === slug);
  return tag ? { title: tag.name, alternates: { canonical: `/tags/${slug}` } } : {};
}
export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tag = getAllTags().find((item) => item.slug === slug);
  if (!tag) notFound();
  const locale = await getLocale();
  return <TaxonomyPosts eyebrow={getDict(locale).taxonomy.tags} title={tag.name} posts={getPostsByTag(slug)} locale={locale} />;
}
