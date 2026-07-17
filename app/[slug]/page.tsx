import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MermaidRenderer } from "@/components/mermaid-renderer";
import { CodeCopyButtons } from "@/components/code-copy";
import { CodeGroups } from "@/components/code-groups";
import { getLikes } from "@/lib/likes";
import { getAllPosts, getPostBySlug, type TocItem } from "@/lib/posts";
import { findCategoryByName, getCategoryName } from "@/lib/categories";
import { TableOfContents } from "./table-of-contents";
import { LikeButton } from "./like-button";
import { TocMenu } from "@/components/toc-menu";
import { getDict, getLocale, type Locale } from "@/lib/i18n";

const MOBILE_TOC_MIN_HEADINGS = 5;

type PageProps = {
  params: Promise<{ slug: string }>;
};

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
  };
}

function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  const last = day % 10;
  if (last === 1) return `${day}st`;
  if (last === 2) return `${day}nd`;
  if (last === 3) return `${day}rd`;
  return `${day}th`;
}

function formatLongDate(dateStr: string, locale: Locale): string {
  const d = new Date(dateStr);
  if (locale === "zh") {
    return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
  }
  const month = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const day = ordinal(d.getUTCDate());
  const year = d.getUTCFullYear();
  return `${month} ${day}, ${year}`;
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
  const initialLikes = getLikes(slug);

  return (
    <>
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
            </div>

            <article id="introduction" className="reveal scroll-mt-28 mt-12 sm:mt-14">
              <div
                className="markdown"
                dangerouslySetInnerHTML={{ __html: post.html }}
              />
              <MermaidRenderer key={`mermaid-${slug}`} />
              <CodeCopyButtons />
              <CodeGroups key={`groups-${slug}`} />
            </article>

            <div className="mt-16 flex justify-center lg:hidden">
              <LikeButton slug={slug} label={t.post.like} initialLikes={initialLikes} />
            </div>
          </div>

          <aside className="hidden lg:col-span-3 lg:col-start-10 lg:block">
            <div className="sticky top-28 flex flex-col gap-12">
              <TableOfContents items={tocItems} title={t.post.toc} />
              <LikeButton slug={slug} label={t.post.like} initialLikes={initialLikes} />
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
