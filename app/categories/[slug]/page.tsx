import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCategoryBySlug,
  getCategoryDescription,
  getCategoryName,
  getPostsByCategory,
} from "@/lib/categories";
import { getDict, getLocale } from "@/lib/i18n";
import { PostCard } from "@/components/post-card";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// No generateStaticParams: the root layout reads the `locale` cookie, which
// opts every route into on-demand rendering, so a prerender list is never used.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDict(locale);
  const category = getCategoryBySlug(slug);
  if (!category) return { title: t.meta.categoryNotFound };
  const name = getCategoryName(category, locale);
  return {
    title: `${name} · ${t.meta.categoriesTitle}`,
    description: getCategoryDescription(category, locale),
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const locale = await getLocale();
  const t = getDict(locale);
  const posts = getPostsByCategory(slug);
  const Icon = category.icon;
  const count = posts.length;

  return (
    <>
      <section className="mx-auto max-w-310 px-6 pt-24 pb-10 sm:px-10 sm:pt-32">
        <Link
          href="/categories"
          className="link-arrow inline-flex items-center gap-1.5 text-[13.5px] font-semibold uppercase tracking-[0.14em] text-ink/55 hover:text-ink"
        >
          <span className="arrow-slide inline-block rotate-180 text-ink/55" aria-hidden>→</span>
          {t.actions.allCategories}
        </Link>

        <div className="reveal mt-8 flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-azure/10 text-azure">
              <Icon className="h-7 w-7" strokeWidth={1.9} />
            </span>
            <h1 className="mt-1 text-[44px] font-bold leading-none tracking-tight text-ink sm:text-[60px]">
              {getCategoryName(category, locale)}
            </h1>
          </div>
          <p className="text-[15px] font-medium text-ink/55">
            {t.categories.articlesLabel(count)}
          </p>
        </div>

        <p className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-ink/65">
          {getCategoryDescription(category, locale)}
        </p>
      </section>

      <section className="mx-auto max-w-310 px-6 pb-32 sm:px-10">
        {posts.length === 0 ? (
          <p className="text-ink/60">{t.categories.noPosts}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard
                key={post.slug}
                post={post}
                variant="compact"
                readMore={t.actions.readMore}
                locale={locale}
                readingTime={t.actions.readingTime(post.readingTime)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
