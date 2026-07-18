import Link from "next/link";
import type { Metadata } from "next";
import {
  CATEGORIES,
  getCategoryCounts,
  getCategoryDescription,
  getCategoryName,
} from "@/lib/categories";
import { getDict, getLocale } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDict(await getLocale());
  return {
    title: t.meta.categoriesTitle,
    description: t.meta.categoriesDescription,
    alternates: { canonical: "/categories" },
  };
}

export default async function CategoriesPage() {
  const counts = getCategoryCounts();
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <>
      <section className="mx-auto max-w-310 px-6 pt-24 pb-16 sm:px-10 sm:pt-32">
        <div className="reveal max-w-2xl">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">
            {t.categories.eyebrow}
          </h2>
          <h1 className="mt-3 text-[42px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[56px]">
            {t.categories.title}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-ink/65 sm:text-[19px]">
            {t.categories.subtitle}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-310 px-6 pb-32 sm:px-10">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const count = counts[cat.slug] ?? 0;
            return (
              <li
                key={cat.slug}
                className="reveal"
                style={{ animationDelay: `${120 + idx * 60}ms` }}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-ink/10 bg-paper/60 px-6 py-6 transition-colors hover:border-azure/50 hover:bg-paper/90"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-azure/10 text-azure transition-colors group-hover:bg-azure/15">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-[20px] font-semibold text-ink group-hover:text-azure">
                        {getCategoryName(cat, locale)}
                      </span>
                      <span className="text-[13px] text-ink/50">
                        {t.categories.postsLabel(count)}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-[15px] leading-snug text-ink/60">
                      {getCategoryDescription(cat, locale)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
