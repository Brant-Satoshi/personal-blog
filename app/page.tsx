import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { CATEGORIES, getCategoryName } from "@/lib/categories";
import { getDict, getLocale, type Locale } from "@/lib/i18n";
import { PostCard } from "@/components/post-card";

export function generateMetadata(): Metadata {
  return {
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": "/feed.xml" },
    },
  };
}

export default async function Home() {
  const posts = getAllPosts();
  const featured = posts.slice(0, 4);
  const locale: Locale = await getLocale();
  const t = getDict(locale);

  return (
    <section className="mx-auto max-w-310 px-6 pb-20 pt-24 sm:px-10 sm:pb-32 sm:pt-32">
      <div className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">
            {t.home.articles}
          </h2>

          {posts.length === 0 ? (
            <p className="mt-10 text-ink/60">{t.home.empty}</p>
          ) : (
            <div className="mt-10 flex flex-col gap-12 sm:mt-12 sm:gap-16">
              {posts.map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  variant="featured"
                  readMore={t.actions.readMore}
                  locale={locale}
                  readingTime={t.actions.readingTime(post.readingTime)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-14 lg:col-span-4 lg:col-start-9">
          <div className="reveal" style={{ animationDelay: "200ms" }}>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">
              {t.home.browseBy}
            </h3>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {CATEGORIES.map((cat) => (
                <Link key={cat.slug} href={`/categories/${cat.slug}`} className="chip">
                  {getCategoryName(cat, locale)}
                </Link>
              ))}
            </div>
            <Link
              href="/categories"
              className="link-arrow mt-5 inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink/70 hover:text-azure"
            >
              {t.actions.seeAllCategories}
              <span className="arrow-slide text-azure" aria-hidden>→</span>
            </Link>
          </div>

          <div className="reveal" style={{ animationDelay: "300ms" }}>
            <h3 className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">
              {t.home.popular}
            </h3>
            <ul className="mt-6 flex flex-col">
              {featured.map((post) => (
                <li key={post.slug} className="border-b border-ink/10 last:border-0">
                  <Link
                    href={`/${post.slug}`}
                    className="group flex items-center gap-4 py-5 text-[17.5px] font-semibold text-ink transition-colors hover:text-azure"
                  >
                    <span className="arrow-slide text-ink" aria-hidden>
                      →
                    </span>
                    <span className="leading-snug">{post.title}</span>
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
