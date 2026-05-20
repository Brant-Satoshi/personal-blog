import Link from "next/link";
import { Rss, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { getDict, getLocale } from "@/lib/i18n";
import { SITE_CONFIG } from "@/lib/config";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 sm:px-10 sm:py-7">
        <Link
          href="/"
          className="group flex items-baseline gap-1.5 text-[22px] font-semibold tracking-tight text-azure"
        >
          <span>{SITE_CONFIG.author.firstName}</span>
          <span className="text-azure/40 transition-transform group-hover:rotate-12" aria-hidden>
            ◇
          </span>
          <span>{SITE_CONFIG.author.lastName}</span>
        </Link>

        <nav className="hidden items-center gap-9 text-[15px] font-medium text-ink/80 md:flex">
          <Link href="/" className="link-underline hover:text-ink">{t.nav.posts}</Link>
          <Link href="/categories" className="link-underline hover:text-ink">{t.nav.categories}</Link>
          <Link href="/about" className="link-underline hover:text-ink">{t.nav.about}</Link>
          <a href="#" className="link-underline hover:text-ink">{t.nav.notes}</a>
          <a href="#" className="link-underline hover:text-ink">{t.nav.now}</a>
        </nav>

        <div className="flex items-center gap-1.5 text-ink/65">
          <button
            type="button"
            aria-label={t.actions.search}
            disabled
            aria-disabled="true"
            className="rounded-full p-2.5 opacity-40 cursor-not-allowed"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>
          <LanguageToggle locale={locale} label={t.actions.switchLanguage} />
          <ThemeToggle toLightLabel={t.actions.toLight} toDarkLabel={t.actions.toDark} />
          <button
            type="button"
            aria-label={t.actions.rss}
            disabled
            aria-disabled="true"
            className="rounded-full p-2.5 opacity-40 cursor-not-allowed"
          >
            <Rss className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-4 px-6 py-10 text-[13px] text-ink/55 sm:flex-row sm:items-center sm:px-10">
        <span>© {new Date().getUTCFullYear()} {SITE_CONFIG.copyright} · {t.footer.tag}</span>
        <div className="flex items-center gap-6">
          <Link href="/about" className="link-underline hover:text-ink">{t.footer.about}</Link>
          <Link href="/" className="link-underline hover:text-ink">{t.footer.rss}</Link>
          <Link href="/" className="link-underline hover:text-ink">{t.footer.twitter}</Link>
        </div>
      </div>
    </footer>
  );
}
