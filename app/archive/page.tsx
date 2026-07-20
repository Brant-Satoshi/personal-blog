import Link from "next/link";
import type { Metadata } from "next";
import { getArchiveGroups } from "@/lib/posts";
import { getDict, getLocale } from "@/lib/i18n";
import { formatLongDate } from "@/lib/post-meta";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDict(await getLocale());
  return {
    title: t.archive.title,
    description: t.archive.subtitle,
    alternates: { canonical: "/archive" },
  };
}

export default async function ArchivePage() {
  const locale = await getLocale();
  const t = getDict(locale);
  const groups = getArchiveGroups();
  return (
    <section className="mx-auto max-w-310 px-6 pb-32 pt-24 sm:px-10 sm:pt-32">
      <header className="reveal max-w-2xl">
        <p className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">{t.archive.eyebrow}</p>
        <h1 className="mt-3 text-[42px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[56px]">{t.archive.title}</h1>
        <p className="mt-5 text-[17px] leading-relaxed text-ink/65 sm:text-[19px]">{t.archive.subtitle}</p>
      </header>
      <div className="mt-16 space-y-14">
        {groups.map((group) => (
          <section key={group.year} className="grid gap-6 border-t border-ink/10 pt-7 md:grid-cols-[8rem_1fr]">
            <h2 className="text-3xl font-bold tracking-tight text-ink">{group.year}</h2>
            <ol className="space-y-1">
              {group.posts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/${post.slug}`} className="group flex flex-col gap-1 rounded-xl px-3 py-4 transition-colors hover:bg-ink/5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <span className="text-[18px] font-semibold text-ink group-hover:text-azure">{post.title}</span>
                    <time dateTime={post.date} className="shrink-0 text-[13px] text-ink/50">{formatLongDate(post.date, locale)}</time>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </section>
  );
}
