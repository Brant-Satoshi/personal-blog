"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { TocItem } from "@/lib/posts";

type Props = {
  items: TocItem[];
  title: string;
};

type Group = { item: TocItem; children: TocItem[] };

function buildGroups(items: TocItem[]): Group[] {
  const groups: Group[] = [];
  for (const item of items) {
    if (item.depth >= 3 && groups.length > 0) {
      groups[groups.length - 1].children.push(item);
    } else {
      groups.push({ item, children: [] });
    }
  }
  return groups;
}

export function TableOfContents({ items, title }: Props) {
  const groups = useMemo(() => buildGroups(items), [items]);
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length === 0) return;

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const onScroll = () => {
      // At the bottom of the page the last section may be too short to reach
      // the activation line, so force-highlight the last heading.
      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (scrolledToBottom) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }

      const activationLine = window.innerHeight * 0.2;
      let current = headings[0].id;
      for (const el of headings) {
        if (el.getBoundingClientRect().top <= activationLine) {
          current = el.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (items.length === 0) return null;

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <nav aria-label="Table of contents" className="sticky top-28">
      <h3 className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink">
        {title}
      </h3>
      <ul className="mt-5 flex flex-col gap-0.5 border-l border-ink/12 text-[14.5px]">
        {groups.map((group) => {
          const hasChildren = group.children.length > 0;
          const activeInGroup =
            group.item.id === activeId ||
            group.children.some((c) => c.id === activeId);
          // Keep the section holding the active heading expanded.
          const open =
            hasChildren && (!collapsed.has(group.item.id) || activeInGroup);
          const headActive = activeId === group.item.id;
          return (
            <li key={group.item.id}>
              <div className="flex items-center">
                {hasChildren ? (
                  <button
                    type="button"
                    aria-label={open ? "Collapse section" : "Expand section"}
                    aria-expanded={open}
                    onClick={() => toggle(group.item.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center text-ink/40 transition-colors hover:text-ink"
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform ${
                        open ? "rotate-90" : ""
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                ) : (
                  <span className="w-6 shrink-0" aria-hidden />
                )}
                <a
                  href={`#${group.item.id}`}
                  className={`relative block flex-1 py-1.5 leading-snug transition-colors ${
                    headActive
                      ? "font-semibold text-azure"
                      : "text-ink/55 hover:text-ink"
                  }`}
                >
                  {headActive ? (
                    <span
                      aria-hidden
                      className="absolute top-0 h-full w-0.5 bg-azure"
                      style={{ left: "-1.5rem" }}
                    />
                  ) : null}
                  {group.item.text}
                </a>
              </div>

              {open ? (
                <ul className="flex flex-col gap-0.5">
                  {group.children.map((child) => {
                    const active = activeId === child.id;
                    return (
                      <li key={child.id} style={{ paddingLeft: "2.4rem" }}>
                        <a
                          href={`#${child.id}`}
                          className={`relative block py-1.5 leading-snug transition-colors ${
                            active
                              ? "font-semibold text-azure"
                              : "text-ink/55 hover:text-ink"
                          }`}
                        >
                          {active ? (
                            <span
                              aria-hidden
                              className="absolute top-0 h-full w-0.5 bg-azure"
                              style={{ left: "-2.4rem" }}
                            />
                          ) : null}
                          {child.text}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
