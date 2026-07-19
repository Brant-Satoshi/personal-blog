import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { formatLongDate } from "@/lib/post-meta";
import type { PostMeta } from "@/lib/posts";

// "featured" is the large editorial card on the home list (with excerpt);
// "compact" is the bordered card used in category grids. Both share one
// skeleton so card content changes happen in one place.
type Variant = "featured" | "compact";

const STYLES: Record<
  Variant,
  {
    article: string;
    titleLink: string;
    title: string;
    summary: string;
    meta: string;
    readMore: string;
  }
> = {
  featured: {
    article: "reveal flex flex-col",
    titleLink: "group inline-flex w-fit",
    title:
      "text-[28px] font-bold leading-tight tracking-tight text-ink decoration-ink/40 underline-offset-[6px] group-hover:underline sm:text-[34px]",
    summary: "mt-3 text-[17px] leading-snug text-ink/60",
    meta: "mt-4 text-[13.5px] font-medium text-ink/50",
    readMore:
      "link-arrow mt-7 inline-flex w-fit items-center gap-2 text-[15px] font-bold text-ink hover:text-azure",
  },
  compact: {
    article:
      "group flex h-full flex-col rounded-2xl border border-ink/10 bg-paper/60 p-7 transition-colors hover:border-azure/50 hover:bg-paper/90",
    titleLink: "inline-flex w-fit",
    title:
      "text-[22px] font-bold leading-snug tracking-tight text-ink group-hover:text-azure sm:text-[24px]",
    summary: "mt-3 text-[15.5px] leading-[1.6] text-ink/65",
    meta: "mt-4 text-[13px] font-medium text-ink/50",
    readMore:
      "link-arrow mt-auto pt-6 inline-flex w-fit items-center gap-2 text-[14.5px] font-bold text-ink hover:text-azure",
  },
};

export function PostCard({
  post,
  variant,
  readMore,
  locale,
  readingTime,
}: {
  post: PostMeta;
  variant: Variant;
  readMore: string;
  locale: Locale;
  readingTime: string;
}) {
  const s = STYLES[variant];
  return (
    <article className={s.article}>
      <Link href={`/${post.slug}`} className={s.titleLink}>
        <h3 className={s.title}>{post.title}</h3>
      </Link>
      {post.summary ? <p className={s.summary}>{post.summary}</p> : null}
      <p className={s.meta}>
        <time dateTime={post.date}>{formatLongDate(post.date, locale)}</time>
        <span aria-hidden> · </span>
        <span>{readingTime}</span>
      </p>
      {variant === "featured" && post.excerpt ? (
        <p className="mt-6 text-[16px] leading-[1.65] text-ink/65">{post.excerpt}</p>
      ) : null}
      <Link href={`/${post.slug}`} className={s.readMore}>
        {readMore}
        <span className="arrow-slide text-azure" aria-hidden>→</span>
      </Link>
    </article>
  );
}
