"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/posts";

type Props = {
  items: TocItem[];
  title: string;
};

export function TableOfContents({ items, title }: Props) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );

    const observed = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    observed.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="sticky top-10">
      <h3 className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink">
        {title}
      </h3>
      <ul className="mt-5 flex flex-col gap-0.5 border-l border-ink/12 text-[14.5px]">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <li key={item.id} style={{ paddingLeft: item.depth === 3 ? "1.8rem" : "0.9rem" }}>
              <a
                href={`#${item.id}`}
                className={`relative block py-1.5 leading-snug transition-colors ${
                  active ? "font-semibold text-azure" : "text-ink/55 hover:text-ink"
                }`}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute top-0 h-full w-[2px] bg-azure"
                    style={{ left: item.depth === 3 ? "-1.8rem" : "-0.9rem" }}
                  />
                ) : null}
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
