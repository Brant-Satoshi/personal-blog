import Link from "next/link";
import { CATEGORIES, getCategoryName } from "@/lib/categories";
import { getDict, type Locale } from "@/lib/i18n";
import type { PostMeta } from "@/lib/posts";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";

type Props = {
  posts: PostMeta[];
  allPosts: PostMeta[];
  locale: Locale;
  page: number;
  totalPages: number;
};

export function HomeContent({ posts, allPosts, locale, page, totalPages }: Props) {
  const t = getDict(locale);
  const explicitlyFeatured = allPosts.filter((post) => post.featured);
  const featured = (explicitlyFeatured.length > 0 ? explicitlyFeatured : allPosts).slice(0, 4);

  return (
    <section className="mx-auto max-w-310 px-6 pb-20 pt-24 sm:px-10 sm:pb-32 sm:pt-32">
      <div className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h1 className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">{t.home.articles}</h1>
          {posts.length === 0 ? (
            <p className="mt-10 text-ink/60">{t.home.empty}</p>
          ) : (
            <div className="mt-10 flex flex-col gap-12 sm:mt-12 sm:gap-16">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} readMore={t.actions.readMore} locale={locale} readingTime={t.actions.readingTime(post.readingTime)} />
              ))}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} previousLabel={t.actions.previousPage} nextLabel={t.actions.nextPage} />
        </div>

        <aside className="flex flex-col gap-14 lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9 lg:self-start">
          <div className="reveal" style={{ animationDelay: "200ms" }}>
            <h2 className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">{t.home.browseBy}</h2>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {CATEGORIES.map((category) => <Link key={category.slug} href={`/categories/${category.slug}`} className="chip">{getCategoryName(category, locale)}</Link>)}
            </div>
            <Link href="/categories" className="link-arrow mt-5 inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink/70 hover:text-azure">{t.actions.seeAllCategories}<span className="arrow-slide text-azure" aria-hidden>→</span></Link>
          </div>

          <div className="reveal" style={{ animationDelay: "300ms" }}>
            <h2 className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">{t.home.popular}</h2>
            <ul className="mt-6 flex flex-col">
              {featured.map((post) => (
                <li key={post.slug} className="border-b border-ink/10 last:border-0">
                  <Link href={`/${post.slug}`} className="group flex items-center gap-4 py-5 text-[17.5px] font-semibold text-ink transition-colors hover:text-azure">
                    <span className="arrow-slide text-ink" aria-hidden>→</span><span className="leading-snug">{post.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
