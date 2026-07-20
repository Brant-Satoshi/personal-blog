import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TaxonomyPosts } from "@/components/taxonomy-posts";
import { getDict, getLocale } from "@/lib/i18n";
import { getAllSeries, getPostsBySeries } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getAllSeries().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const series = getAllSeries().find((item) => item.slug === slug);
  return series ? { title: series.name, alternates: { canonical: `/series/${slug}` } } : {};
}
export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const series = getAllSeries().find((item) => item.slug === slug);
  if (!series) notFound();
  const locale = await getLocale();
  return <TaxonomyPosts eyebrow={getDict(locale).taxonomy.series} title={series.name} posts={getPostsBySeries(slug)} locale={locale} />;
}
