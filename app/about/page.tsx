import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getDict, getLocale } from "@/lib/i18n";

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <div className="page-surface min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-[1240px] px-6 pt-24 pb-10 sm:px-10 sm:pt-32 sm:pb-14">
        <div className="reveal max-w-2xl">
          <h2 className="text-[14px] font-bold uppercase tracking-[0.18em] text-pink">
            {t.about.eyebrow}
          </h2>
          <h1 className="mt-3 text-[42px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[56px]">
            {t.about.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-6 pb-32 sm:px-10">
        <div className="reveal markdown max-w-2xl" style={{ animationDelay: "120ms" }}>
          <p>{t.about.body1}</p>
          <p>{t.about.body2}</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
