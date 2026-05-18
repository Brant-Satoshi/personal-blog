import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getAllPosts, getPostBySlug, type TocItem } from "@/lib/posts";
import { TableOfContents } from "./table-of-contents";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
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

function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const day = ordinal(d.getUTCDate());
  const year = d.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedOn = formatLongDate(post.date);
  const updatedOn = post.updated ? formatLongDate(post.updated) : null;

  const tocItems: TocItem[] =
    post.toc.length > 0
      ? [{ id: "introduction", text: "Introduction", depth: 2 }, ...post.toc]
      : [];

  return (
    <div className="page-surface min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-[1240px] px-6 pt-32 pb-10 sm:px-10 sm:pt-40 sm:pb-14">
        <div className="reveal max-w-3xl" style={{ animationDelay: "120ms" }}>
          <h1 className="text-[42px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[58px]">
            {post.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink/65 sm:text-[19px]">
            {post.summary}
          </p>
          <p className="mt-7 text-[14.5px] text-ink/60">
            {post.category ? (
              <>
                <em className="not-italic text-ink/50">Filed under </em>
                <span className="font-semibold text-ink/85">{post.category}</span>
                <em className="not-italic text-ink/50"> on </em>
              </>
            ) : (
              <em className="not-italic text-ink/50">Published on </em>
            )}
            <span className="font-medium text-ink/85">{publishedOn}</span>
            <span className="text-ink/50">.</span>
            {updatedOn ? (
              <>
                {" "}
                <em className="not-italic text-ink/50">Last updated on </em>
                <span className="font-medium text-ink/85">{updatedOn}</span>
                <span className="text-ink/50">.</span>
              </>
            ) : null}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 pb-32 pt-8 sm:px-10 sm:pt-12">
        <div className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12">
          <article id="introduction" className="reveal lg:col-span-8">
            <div
              className="markdown"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </article>

          <aside className="hidden lg:col-span-3 lg:col-start-10 lg:block">
            <TableOfContents items={tocItems} />
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
