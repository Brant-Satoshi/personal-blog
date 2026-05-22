"use client";

import { useEffect, useRef, useState } from "react";
import { List } from "lucide-react";
import type { TocItem } from "@/lib/posts";

type Props = {
  items: TocItem[];
  label: string;
};

export function TocMenu({ items, label }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={rootRef} className="lg:hidden">
      {open ? (
        <nav
          aria-label={label}
          className="fixed bottom-[5.25rem] right-5 z-40 max-h-[60vh] w-[min(17rem,calc(100vw-2.5rem))] overflow-y-auto rounded-2xl border border-ink/10 bg-paper shadow-xl"
        >
          <p className="sticky top-0 border-b border-ink/10 bg-paper px-4 py-3 text-[13px] font-bold uppercase tracking-[0.18em] text-ink">
            {label}
          </p>
          <ul className="py-2">
            {items.map((item) => (
              <li
                key={item.id}
                style={{ paddingLeft: item.depth === 3 ? "1rem" : "0" }}
              >
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-[14.5px] leading-snug text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-ink/10 bg-paper text-ink shadow-lg transition-colors hover:text-azure"
      >
        <List className="h-5 w-5" strokeWidth={1.9} />
      </button>
    </div>
  );
}
