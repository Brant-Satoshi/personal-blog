import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { HeaderShell } from "@/components/header-shell";
import { SearchDialog } from "@/components/search-dialog";
import { getDict, getLocale } from "@/lib/i18n";

export async function SiteHeader() {
  const locale = await getLocale();
  const t = getDict(locale);

  const navItems = [
    { href: "/", label: t.nav.posts },
    { href: "/categories", label: t.nav.categories },
    { href: "/archive", label: t.nav.archive },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <HeaderShell>
      <div className="mx-auto flex max-w-310 items-center justify-between px-6 py-3.5 sm:px-10 sm:py-4">
        <Link
          href="/"
          className="font-serif text-[22px] font-medium tracking-[-0.01em] text-ink"
        >
          Brant Satoshi<span className="text-azure">.</span>
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] font-medium text-ink/80 md:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="link-underline hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 text-ink/65">
          <SearchDialog
            searchLabel={t.actions.search}
            closeLabel={t.actions.close}
            placeholder={t.search.placeholder}
            hint={t.search.hint}
            noResults={t.search.noResults}
            loading={t.search.loading}
          />
          <ThemeToggle toLightLabel={t.actions.toLight} toDarkLabel={t.actions.toDark} />
          <MobileNav items={navItems} menuLabel={t.actions.menu} />
        </div>
      </div>
    </HeaderShell>
  );
}

export async function SiteFooter() {
  const locale = await getLocale();
  const t = getDict(locale);

  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-310 flex-col items-start justify-between gap-4 px-6 py-10 text-[13px] text-ink/55 sm:flex-row sm:items-center sm:px-10">
        <span>© {new Date().getUTCFullYear()} Brant · {t.footer.tag}</span>
        <div className="flex items-center gap-6">
          <Link href="/about" className="link-underline hover:text-ink">{t.footer.about}</Link>
          <Link href="/tags" className="link-underline hover:text-ink">{t.taxonomy.tags}</Link>
          <Link href="/series" className="link-underline hover:text-ink">{t.taxonomy.series}</Link>
          <Link href="/feed.xml" className="link-underline hover:text-ink">{t.footer.feed}</Link>
        </div>
      </div>
    </footer>
  );
}
