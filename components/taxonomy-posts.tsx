import { PostCard } from "@/components/post-card";
import { getDict, type Locale } from "@/lib/i18n";
import type { PostMeta } from "@/lib/posts";

export function TaxonomyPosts({ eyebrow, title, posts, locale }: { eyebrow: string; title: string; posts: PostMeta[]; locale: Locale }) {
  const t = getDict(locale);
  return (
    <section className="mx-auto max-w-310 px-6 pb-32 pt-24 sm:px-10 sm:pt-32">
      <header className="reveal max-w-3xl">
        <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">{eyebrow}</p>
        <h1 className="mt-3 text-[42px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[56px]">{title}</h1>
      </header>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {posts.map((post) => <PostCard key={post.slug} post={post} variant="grid" locale={locale} readMore={t.actions.readMore} readingTime={t.actions.readingTime(post.readingTime)} />)}
      </div>
    </section>
  );
}
