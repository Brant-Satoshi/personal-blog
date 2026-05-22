"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { PostMeta } from "@/lib/posts";

type Props = {
  posts: PostMeta[];
  searchLabel: string;
  closeLabel: string;
  placeholder: string;
  hint: string;
  noResults: string;
};

export function SearchDialog({
  posts,
  searchLabel,
  closeLabel,
  placeholder,
  hint,
  noResults,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [close, open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return posts.filter((post) =>
      [post.title, post.summary, post.category ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [posts, query]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={searchLabel}
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-full p-2.5 transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </button>

      {open ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] backdrop-blur-sm"
          onClick={close}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={searchLabel}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-ink/10 bg-paper"
          >
            <div className="flex items-center gap-3 border-b border-ink/10 px-4">
              <Search
                className="h-[18px] w-[18px] shrink-0 text-ink/45"
                strokeWidth={1.9}
                aria-hidden
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="flex-1 bg-transparent py-4 text-[16px] text-ink placeholder:text-ink/40 focus:outline-none"
              />
              <button
                type="button"
                aria-label={closeLabel}
                onClick={close}
                className="cursor-pointer rounded-full p-1.5 text-ink/45 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-[16px] w-[16px]" strokeWidth={1.9} />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto">
              {query.trim() === "" ? (
                <p className="px-4 py-6 text-[14px] text-ink/50">{hint}</p>
              ) : results.length === 0 ? (
                <p className="px-4 py-6 text-[14px] text-ink/50">{noResults}</p>
              ) : (
                <ul className="py-2">
                  {results.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/${post.slug}`}
                        onClick={close}
                        className="block px-4 py-3 transition-colors hover:bg-ink/5"
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="text-[15.5px] font-semibold text-ink">
                            {post.title}
                          </span>
                          {post.category ? (
                            <span className="shrink-0 text-[12px] uppercase tracking-wide text-ink/45">
                              {post.category}
                            </span>
                          ) : null}
                        </span>
                        {post.summary ? (
                          <span className="mt-0.5 block text-[13.5px] leading-snug text-ink/55">
                            {post.summary}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
