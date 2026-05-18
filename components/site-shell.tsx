import Link from "next/link";
import { Rss, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 sm:px-10 sm:py-7">
        <Link
          href="/"
          className="group flex items-baseline gap-1.5 text-[22px] font-semibold tracking-tight text-azure"
        >
          <span>Brant</span>
          <span className="text-azure/40 transition-transform group-hover:rotate-12" aria-hidden>
            ◇
          </span>
          <span>Liang</span>
        </Link>

        <nav className="hidden items-center gap-9 text-[15px] font-medium text-ink/80 md:flex">
          <Link href="/" className="link-underline hover:text-ink">Posts</Link>
          <Link href="/categories" className="link-underline hover:text-ink">Categories</Link>
          <Link href="/about" className="link-underline hover:text-ink">About</Link>
          <Link href="/" className="link-underline hover:text-ink">Notes</Link>
          <Link href="/about" className="link-underline hover:text-ink">Now</Link>
        </nav>

        <div className="flex items-center gap-1.5 text-ink/65">
          <button
            type="button"
            aria-label="Search"
            className="rounded-full p-2.5 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>
          <ThemeToggle />
          <button
            type="button"
            aria-label="RSS feed"
            className="rounded-full p-2.5 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <Rss className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-4 px-6 py-10 text-[13px] text-ink/55 sm:flex-row sm:items-center sm:px-10">
        <span>© {new Date().getUTCFullYear()} Brant · Built quietly with Next.js.</span>
        <div className="flex items-center gap-6">
          <Link href="/about" className="link-underline hover:text-ink">About</Link>
          <Link href="/" className="link-underline hover:text-ink">RSS</Link>
          <Link href="/" className="link-underline hover:text-ink">Twitter</Link>
        </div>
      </div>
    </footer>
  );
}
