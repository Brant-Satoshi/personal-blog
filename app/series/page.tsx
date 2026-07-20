import type { Metadata } from "next";
import { TaxonomyIndex } from "@/components/taxonomy-index";
import { getDict, getLocale } from "@/lib/i18n";
import { getAllSeries } from "@/lib/posts";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDict(await getLocale());
  return { title: t.taxonomy.series, description: t.taxonomy.browseSeries, alternates: { canonical: "/series" } };
}
export default async function SeriesPage() {
  const t = getDict(await getLocale());
  return <TaxonomyIndex title={t.taxonomy.series} description={t.taxonomy.browseSeries} basePath="/series" items={getAllSeries()} />;
}
