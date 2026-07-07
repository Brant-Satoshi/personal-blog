import Link from "next/link";
import { getAllPosts, type PostMeta } from "@/lib/posts";
import { CATEGORIES, getCategoryName } from "@/lib/categories";
import { getDict, getLocale, type Locale } from "@/lib/i18n";

function ArticleCard({ post, readMore }: { post: PostMeta; readMore: string }) {
  return (
    <article className="reveal flex flex-col">
      <Link href={`/${post.slug}`} className="group inline-flex w-fit">
        <h3 className="text-[28px] font-bold leading-tight tracking-tight text-ink decoration-ink/40 underline-offset-[6px] group-hover:underline sm:text-[34px]">
          {post.title}
        </h3>
      </Link>
      <p className="mt-3 text-[17px] leading-snug text-ink/60">
        {post.summary}
      </p>
      {post.excerpt ? (
        <p className="mt-6 text-[16px] leading-[1.65] text-ink/65">
          {post.excerpt}
        </p>
      ) : null}
      <Link
        href={`/${post.slug}`}
        className="link-arrow mt-7 inline-flex w-fit items-center gap-2 text-[15px] font-bold text-ink hover:text-azure"
      >
        {readMore}
        <span className="arrow-slide text-azure" aria-hidden>→</span>
      </Link>
    </article>
  );
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
                <ArticleCard key={post.slug} post={post} readMore={t.actions.readMore} />
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
