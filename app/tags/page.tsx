import type { Metadata } from "next";
import { TaxonomyIndex } from "@/components/taxonomy-index";
import { getDict, getLocale } from "@/lib/i18n";
import { getAllTags } from "@/lib/posts";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDict(await getLocale());
  return { title: t.taxonomy.tags, description: t.taxonomy.browseTags, alternates: { canonical: "/tags" } };
}

export default async function TagsPage() {
  const t = getDict(await getLocale());
  return <TaxonomyIndex title={t.taxonomy.tags} description={t.taxonomy.browseTags} basePath="/tags" items={getAllTags()} />;
}
