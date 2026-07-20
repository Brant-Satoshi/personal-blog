"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { SearchPost } from "@/lib/posts";

type Props = {
  searchLabel: string;
  closeLabel: string;
  placeholder: string;
  hint: string;
  noResults: string;
  loading: string;
};

let cachedPosts: SearchPost[] | null = null;
let postsRequest: Promise<SearchPost[]> | null = null;

function loadPosts(): Promise<SearchPost[]> {
  if (cachedPosts) return Promise.resolve(cachedPosts);
  postsRequest ??= fetch("/search-index.json")
    .then((response) => {
      if (!response.ok) throw new Error("Search index unavailable");
      return response.json() as Promise<SearchPost[]>;
    })
    .then((posts) => {
      cachedPosts = posts;
      return posts;
    })
    .catch((error) => {
      postsRequest = null;
      throw error;
    });
  return postsRequest;
}

function score(post: SearchPost, query: string): number {
  const title = post.title.toLowerCase();
  const summary = post.summary.toLowerCase();
  const category = post.category?.toLowerCase() ?? "";
  const tags = post.tags.join(" ").toLowerCase();
  const text = post.text.toLowerCase();
  if (![title, summary, category, tags, text].some((value) => value.includes(query))) {
    return -1;
  }
  return (
    (title === query ? 100 : title.includes(query) ? 50 : 0) +
    (tags.includes(query) ? 20 : 0) +
    (category.includes(query) ? 15 : 0) +
    (summary.includes(query) ? 10 : 0) +
    (text.includes(query) ? 1 : 0)
  );
}

function snippet(post: SearchPost, query: string): string {
  const source = post.text || post.summary;
  const index = source.toLowerCase().indexOf(query);
  if (index < 0) return post.summary;
  const start = Math.max(0, index - 55);
  const end = Math.min(source.length, index + query.length + 95);
  return `${start > 0 ? "…" : ""}${source.slice(start, end)}${end < source.length ? "…" : ""}`;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let index = lower.indexOf(query);
  while (index >= 0) {
    parts.push(text.slice(cursor, index));
    parts.push(
      <mark key={index} className="rounded bg-azure/15 px-0.5 text-inherit">
        {text.slice(index, index + query.length)}
      </mark>,
    );
    cursor = index + query.length;
    index = lower.indexOf(query, cursor);
  }
  parts.push(text.slice(cursor));
  return parts;
}

export function SearchDialog({
  searchLabel,
  closeLabel,
  placeholder,
  hint,
  noResults,
  loading,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<SearchPost[]>(cachedPosts ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  const launch = useCallback(() => {
    setIsLoading(!cachedPosts);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        launch();
      }
    };
    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  }, [launch]);

  useEffect(() => {
    if (!open || cachedPosts) return;
    let active = true;
    loadPosts()
      .then((items) => {
        if (active) setPosts(items);
      })
      .catch(() => {
        if (active) setPosts([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
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

  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      normalizedQuery
        ? posts
            .map((post) => ({ post, score: score(post, normalizedQuery) }))
            .filter((result) => result.score >= 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
        : [],
    [normalizedQuery, posts],
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${searchLabel} (⌘K)`}
        onClick={launch}
        className="cursor-pointer rounded-full p-2.5 transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] backdrop-blur-sm"
              onClick={close}
            >
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={searchLabel}
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-xl overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-2xl"
              >
                <div className="flex items-center gap-3 border-b border-ink/10 px-4">
                  <Search className="h-[18px] w-[18px] shrink-0 text-ink/45" strokeWidth={1.9} aria-hidden />
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={placeholder}
                    aria-label={placeholder}
                    className="flex-1 bg-transparent py-4 text-[16px] text-ink placeholder:text-ink/40 focus:outline-none"
                  />
                  <kbd className="hidden rounded border border-ink/15 px-1.5 py-0.5 text-[11px] text-ink/45 sm:inline">⌘K</kbd>
                  <button type="button" aria-label={closeLabel} onClick={close} className="cursor-pointer rounded-full p-1.5 text-ink/45 transition-colors hover:bg-ink/5 hover:text-ink">
                    <X className="h-[16px] w-[16px]" strokeWidth={1.9} />
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <p className="px-4 py-6 text-[14px] text-ink/50">{loading}</p>
                  ) : !normalizedQuery ? (
                    <p className="px-4 py-6 text-[14px] text-ink/50">{hint}</p>
                  ) : results.length === 0 ? (
                    <p className="px-4 py-6 text-[14px] text-ink/50">{noResults}</p>
                  ) : (
                    <ul className="py-2">
                      {results.map(({ post }) => {
                        const preview = snippet(post, normalizedQuery);
                        return (
                          <li key={post.slug}>
                            <Link href={`/${post.slug}`} onClick={close} className="block px-4 py-3 transition-colors hover:bg-ink/5 focus:bg-ink/5 focus:outline-none">
                              <span className="flex items-baseline justify-between gap-3">
                                <span className="text-[15.5px] font-semibold text-ink"><Highlight text={post.title} query={normalizedQuery} /></span>
                                {post.category ? <span className="shrink-0 text-[12px] uppercase tracking-wide text-ink/45">{post.category}</span> : null}
                              </span>
                              <span className="mt-1 line-clamp-2 block text-[13.5px] leading-snug text-ink/55"><Highlight text={preview} query={normalizedQuery} /></span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
