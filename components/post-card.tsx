import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import type { Locale } from "@/lib/i18n";
import { formatLongDate } from "@/lib/post-meta";

type Props = {
  post: PostMeta;
  readMore: string;
  locale: Locale;
  readingTime: string;
  variant?: "list" | "grid";
};

export function PostCard({
  post,
  readMore,
  locale,
  readingTime,
  variant = "list",
}: Props) {
  if (variant === "grid") {
    return (
      <article className="group flex h-full flex-col rounded-2xl border border-ink/10 bg-paper/60 p-7 transition-colors hover:border-azure/50 hover:bg-paper/90">
        <Link href={`/${post.slug}`} className="inline-flex w-fit">
          <h3 className="text-[22px] font-bold leading-snug tracking-tight text-ink group-hover:text-azure sm:text-[24px]">
            {post.title}
          </h3>
        </Link>
        {post.summary ? <p className="mt-3 text-[15.5px] leading-[1.6] text-ink/65">{post.summary}</p> : null}
        <PostByline post={post} locale={locale} readingTime={readingTime} />
        <Link href={`/${post.slug}`} className="link-arrow mt-auto inline-flex w-fit items-center gap-2 pt-6 text-[14.5px] font-bold text-ink hover:text-azure">
          {readMore}<span className="arrow-slide text-azure" aria-hidden>→</span>
        </Link>
      </article>
    );
  }

  return (
    <article className="reveal flex flex-col">
      <Link href={`/${post.slug}`} className="group inline-flex w-fit">
        <h2 className="text-[28px] font-bold leading-tight tracking-tight text-ink decoration-ink/40 underline-offset-[6px] group-hover:underline sm:text-[34px]">
          {post.title}
        </h2>
      </Link>
      <p className="mt-3 text-[17px] leading-snug text-ink/60">{post.summary}</p>
      <PostByline post={post} locale={locale} readingTime={readingTime} />
      {post.excerpt ? <p className="mt-6 text-[16px] leading-[1.65] text-ink/65">{post.excerpt}</p> : null}
      <Link href={`/${post.slug}`} className="link-arrow mt-7 inline-flex w-fit items-center gap-2 text-[15px] font-bold text-ink hover:text-azure">
        {readMore}<span className="arrow-slide text-azure" aria-hidden>→</span>
      </Link>
    </article>
  );
}

function PostByline({ post, locale, readingTime }: Pick<Props, "post" | "locale" | "readingTime">) {
  return (
    <p className="mt-4 text-[13.5px] font-medium text-ink/50">
      <time dateTime={post.date}>{formatLongDate(post.date, locale)}</time>
      <span aria-hidden> · </span>
      <span>{readingTime}</span>
    </p>
  );
}
