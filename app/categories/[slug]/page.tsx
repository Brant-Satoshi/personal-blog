import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import {
  CATEGORIES,
  getCategoryBySlug,
  getCategoryDescription,
  getCategoryName,
  getPostsByCategory,
} from "@/lib/categories";
import type { PostMeta } from "@/lib/posts";
import { getDict, getLocale } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

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
  };
}

function PostCard({ post, readMore }: { post: PostMeta; readMore: string }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-ink/10 bg-paper/60 p-7 transition-colors hover:border-azure/50 hover:bg-paper/90">
      <Link href={`/${post.slug}`} className="inline-flex w-fit">
        <h3 className="text-[22px] font-bold leading-snug tracking-tight text-ink group-hover:text-azure sm:text-[24px]">
          {post.title}
        </h3>
      </Link>
      {post.summary ? (
        <p className="mt-3 text-[15.5px] leading-[1.6] text-ink/65">{post.summary}</p>
      ) : null}
      <Link
        href={`/${post.slug}`}
        className="link-arrow mt-6 inline-flex w-fit items-center gap-2 text-[14.5px] font-bold text-ink hover:text-azure"
      >
        {readMore}
        <span className="arrow-slide text-azure" aria-hidden>→</span>
      </Link>
    </article>
  );
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
    <div className="page-surface min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-[1240px] px-6 pt-24 pb-10 sm:px-10 sm:pt-32">
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

      <section className="mx-auto max-w-[1240px] px-6 pb-32 sm:px-10">
        {posts.length === 0 ? (
          <p className="text-ink/60">{t.categories.noPosts}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} readMore={t.actions.readMore} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
