import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { renderMarkdown, type TocItem } from "./markdown";
import { estimateReadingTime, extractExcerpt } from "./post-meta";

export type { TocItem };

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  excerpt?: string;
  category?: string;
  updated?: string;
  readingTime: number;
};

export type Post = PostMeta & {
  content: string;
  html: string;
  toc: TocItem[];
};

const postsDirectory = path.join(process.cwd(), "content", "posts");

// Post files are baked into the image at build time, so parsed/rendered
// results are safe to cache for the server's lifetime in production. In dev
// they are re-read per request; React cache() still dedupes within a request.
const isProd = process.env.NODE_ENV === "production";

function safeString(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
}

function optionalString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
}

// YAML parses an unquoted `date: 2026-05-21` into a Date object, not a string.
function normalizeDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
}

function toPostMeta(slug: string, data: Record<string, unknown>, content: string): PostMeta {
  return {
    slug,
    title: safeString(data.title, slug),
    date: normalizeDate(data.date) ?? "1970-01-01",
    summary: safeString(data.summary, ""),
    excerpt: optionalString(data.excerpt) ?? extractExcerpt(content),
    category: optionalString(data.category),
    updated: normalizeDate(data.updated),
    readingTime: estimateReadingTime(content),
  };
}

let allPostsCache: PostMeta[] | null = null;

export const getAllPosts = cache((): PostMeta[] => {
  if (isProd && allPostsCache) return allPostsCache;

  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const files = fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));

  const posts = files
    .map((file) => {
      const filePath = path.join(postsDirectory, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      return toPostMeta(file.replace(/\.md$/, ""), data, content);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isProd) allPostsCache = posts;
  return posts;
});

const postCache = new Map<string, Post>();

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const cached = isProd ? postCache.get(slug) : undefined;
  if (cached) return cached;

  const filePath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const { html, toc } = await renderMarkdown(content);

  const post: Post = { ...toPostMeta(slug, data, content), content, html, toc };
  if (isProd) postCache.set(slug, post);
  return post;
});
