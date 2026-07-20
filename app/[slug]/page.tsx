import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MermaidRenderer } from "@/components/mermaid-renderer";
import { CodeCopyButtons } from "@/components/code-copy";
import { CodeGroups } from "@/components/code-groups";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ReadingProgress } from "@/components/reading-progress";
import { ImageLightbox } from "@/components/image-lightbox";
import { getAdjacentPosts, getAllPosts, getPostBySlug, getRelatedPosts, taxonomySlug, type TocItem } from "@/lib/posts";
import { findCategoryByName, getCategoryName } from "@/lib/categories";
import { TableOfContents } from "./table-of-contents";
import { LikeButton } from "./like-button";
import { TocMenu } from "@/components/toc-menu";
import { getDict, getLocale } from "@/lib/i18n";
import { formatLongDate } from "@/lib/post-meta";
import { absoluteUrl, SITE_AUTHOR, SITE_NAME, SITE_URL } from "@/lib/site";

const MOBILE_TOC_MIN_HEADINGS = 5;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const t = getDict(await getLocale());

  if (!post) {
    return { title: t.meta.notFound };
  }

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/${post.slug}`,
      siteName: SITE_NAME,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [SITE_AUTHOR],
      section: post.category,
      images: [
        {
          url: `/${post.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [`/${post.slug}/twitter-image`],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const locale = await getLocale();
  const t = getDict(locale);
  const publishedOn = formatLongDate(post.date, locale);
  const updatedOn = post.updated ? formatLongDate(post.updated, locale) : null;
  const category = findCategoryByName(post.category);

  const tocItems: TocItem[] =
    post.toc.length > 0
      ? [{ id: "introduction", text: t.post.introduction, depth: 2 }, ...post.toc]
      : [];
  const showMobileToc = post.toc.length >= MOBILE_TOC_MIN_HEADINGS;
  const canonicalUrl = absoluteUrl(`/${post.slug}`, SITE_URL);
  const related = getRelatedPosts(post);
  const adjacent = getAdjacentPosts(slug);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: canonicalUrl,
    url: canonicalUrl,
    image: absoluteUrl(`/${post.slug}/opengraph-image`, SITE_URL),
    author: {
      "@type": "Person",
      name: SITE_AUTHOR,
    },
    publisher: {
      "@type": "Person",
      name: SITE_AUTHOR,
      url: absoluteUrl("/", SITE_URL),
    },
    ...(post.category ? { articleSection: post.category } : {}),
  };

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="mx-auto max-w-310 px-6 pt-28 pb-32 sm:px-10 sm:pt-36">
        <div className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="reveal max-w-3xl" style={{ animationDelay: "120ms" }}>
              <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-ink sm:text-[44px]">
                {post.title}
              </h1>
              <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink/65 sm:text-[19px]">
                {post.summary}
              </p>
              <p className="mt-7 text-[14.5px] text-ink/60">
                {post.category ? (
                  <>
                    <em className="not-italic text-ink/50">{t.post.filedUnder} </em>
                    {category ? (
                      <Link
                        href={`/categories/${category.slug}`}
                        className="font-semibold text-ink/85 transition-colors hover:text-azure"
                      >
                        {getCategoryName(category, locale)}
                      </Link>
                    ) : (
                      <span className="font-semibold text-ink/85">{post.category}</span>
                    )}
                    <em className="not-italic text-ink/50"> {t.post.on} </em>
                  </>
                ) : (
                  <em className="not-italic text-ink/50">{t.post.publishedOn} </em>
                )}
                <span className="font-medium text-ink/85">{publishedOn}</span>
                <span className="text-ink/50">.</span>
                {updatedOn ? (
                  <>
                    {" "}
                    <em className="not-italic text-ink/50">{t.post.lastUpdated} </em>
                    <span className="font-medium text-ink/85">{updatedOn}</span>
                    <span className="text-ink/50">.</span>
                  </>
                ) : null}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {post.series ? <Link href={`/series/${taxonomySlug(post.series)}`} className="chip">{post.series}</Link> : null}
                {post.tags.map((tag) => <Link key={tag} href={`/tags/${taxonomySlug(tag)}`} className="chip">#{tag}</Link>)}
                <CopyLinkButton label={t.post.copyLink} copiedLabel={t.post.copied} />
              </div>
            </div>

            <article id="introduction" className="markdown-article reveal scroll-mt-28 mt-12 sm:mt-14">
              <div
                className="markdown"
                dangerouslySetInnerHTML={{ __html: post.html }}
              />
              <MermaidRenderer key={`mermaid-${slug}`} />
              <CodeCopyButtons />
              <CodeGroups key={`groups-${slug}`} />
              <ImageLightbox closeLabel={t.actions.close} />
            </article>

            {related.length > 0 ? (
              <section className="mt-20 border-t border-ink/10 pt-9">
                <h2 className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">{t.post.related}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {related.map((item) => (
                    <Link key={item.slug} href={`/${item.slug}`} className="group rounded-2xl border border-ink/10 bg-paper/50 p-5 transition-colors hover:border-azure/45">
                      <span className="text-[17px] font-semibold leading-snug text-ink group-hover:text-azure">{item.title}</span>
                      <span className="mt-2 block text-[13px] text-ink/50">{t.actions.readingTime(item.readingTime)}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <nav aria-label="Post navigation" className="mt-12 grid gap-4 border-t border-ink/10 pt-8 sm:grid-cols-2">
              {adjacent.newer ? (
                <Link href={`/${adjacent.newer.slug}`} className="group rounded-xl p-3 transition-colors hover:bg-ink/5">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-ink/45">← {t.post.newer}</span>
                  <span className="mt-2 block font-semibold text-ink group-hover:text-azure">{adjacent.newer.title}</span>
                </Link>
              ) : <span />}
              {adjacent.older ? (
                <Link href={`/${adjacent.older.slug}`} className="group rounded-xl p-3 text-right transition-colors hover:bg-ink/5">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-ink/45">{t.post.older} →</span>
                  <span className="mt-2 block font-semibold text-ink group-hover:text-azure">{adjacent.older.title}</span>
                </Link>
              ) : null}
            </nav>

            <div className="mt-16 flex justify-center lg:hidden">
              <LikeButton slug={slug} label={t.post.like} initialLikes={0} />
            </div>
          </div>

          <aside className="hidden lg:col-span-3 lg:col-start-10 lg:block">
            <div className="sticky top-28 flex flex-col gap-12">
              <TableOfContents items={tocItems} title={t.post.toc} />
              <LikeButton slug={slug} label={t.post.like} initialLikes={0} />
            </div>
          </aside>
        </div>
      </section>

      {showMobileToc ? (
        <TocMenu items={tocItems} label={t.post.toc} />
      ) : null}
    </>
  );
}
