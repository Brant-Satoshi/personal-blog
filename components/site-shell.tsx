import Link from "next/link";
import { Rss } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { LogoMark } from "@/components/logo-mark";
import { MobileNav } from "@/components/mobile-nav";
import { SearchDialog } from "@/components/search-dialog";
import { getAllPosts } from "@/lib/posts";
import { getDict, getLocale } from "@/lib/i18n";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = getDict(locale);

  const navItems = [
    { href: "/", label: t.nav.posts },
    { href: "/categories", label: t.nav.categories },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 sm:px-10 sm:py-7">
        <Link
          href="/"
          className="group flex items-baseline gap-1.5 text-[22px] font-semibold tracking-tight text-azure"
        >
          <span>Brant</span>
          <LogoMark className="h-7 w-7 self-center" />
          <span>Satoshi</span>
        </Link>

        <nav className="hidden items-center gap-9 text-[15px] font-medium text-ink/80 md:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="link-underline hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 text-ink/65">
          <SearchDialog
            posts={getAllPosts()}
            searchLabel={t.actions.search}
            closeLabel={t.actions.close}
            placeholder={t.search.placeholder}
            hint={t.search.hint}
            noResults={t.search.noResults}
          />
          <LanguageToggle locale={locale} label={t.actions.switchLanguage} />
          <ThemeToggle toLightLabel={t.actions.toLight} toDarkLabel={t.actions.toDark} />
          <button
            type="button"
            aria-label={t.actions.rss}
            className="hidden cursor-pointer rounded-full p-2.5 transition-colors hover:bg-ink/5 hover:text-ink md:block"
          >
            <Rss className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>
          <MobileNav items={navItems} menuLabel={t.actions.menu} />
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
        <span>© {new Date().getUTCFullYear()} Brant · {t.footer.tag}</span>
        <div className="flex items-center gap-6">
          <Link href="/about" className="link-underline hover:text-ink">{t.footer.about}</Link>
          <Link href="/" className="link-underline hover:text-ink">{t.footer.rss}</Link>
          <Link href="/" className="link-underline hover:text-ink">{t.footer.twitter}</Link>
        </div>
      </div>
    </footer>
  );
}
