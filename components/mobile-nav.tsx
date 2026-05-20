"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type NavItem = { href: string; label: string };

export function MobileNav({
  items,
  menuLabel,
}: {
  items: NavItem[];
  menuLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={menuLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer rounded-full p-2.5 transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <Menu className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </button>

      {open ? (
        <div className="page-surface fixed inset-0 z-50 flex flex-col">
          <div className="mx-auto flex w-full max-w-[1240px] items-center justify-end px-6 py-6">
            <button
              type="button"
              aria-label={menuLabel}
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-full p-2.5 text-ink/65 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </button>
          </div>
          <nav className="mx-auto flex w-full max-w-[1240px] flex-col px-6 pt-4">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink/10 py-5 text-[26px] font-bold tracking-tight text-ink transition-colors last:border-0 hover:text-azure"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
