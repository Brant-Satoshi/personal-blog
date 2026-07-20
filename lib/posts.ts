import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { parsePostFrontmatter } from "@/lib/content-schema";
import { renderMarkdown, type TocItem } from "@/lib/markdown";
import { estimateReadingTime } from "@/lib/post-meta";

export type { TocItem };

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  excerpt?: string;
  category?: string;
  updated?: string;
  tags: string[];
  series?: string;
  featured: boolean;
  readingTime: number;
};

export type Post = PostMeta & {
  content: string;
  html: string;
  toc: TocItem[];
};

export type SearchPost = Pick<
  PostMeta,
  "slug" | "title" | "summary" | "category" | "tags"
> & { text: string };

export const POSTS_PER_PAGE = 6;

export type TaxonomyItem = { slug: string; name: string; count: number };

const postsDirectory = path.join(process.cwd(), "content", "posts");
const isProd = process.env.NODE_ENV === "production";

function extractExcerpt(content: string, maxLength = 320): string | undefined {
  const stripped = plainText(content);
  const firstParagraph = stripped.split(/\n\s*\n/)[0]?.trim();
  if (!firstParagraph) return undefined;
  if (firstParagraph.length <= maxLength) return firstParagraph;

  const truncated = firstParagraph.slice(0, maxLength);
  const boundary = Math.max(
    truncated.lastIndexOf("。"),
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf(" "),
  );
  return `${truncated.slice(0, boundary > maxLength * 0.5 ? boundary : maxLength)}…`;
}

function plainText(content: string): string {
  return content
    .replace(/^#+\s+.*$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_`>#|~-]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function readSource(file: string) {
  const filePath = path.join(postsDirectory, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const data = parsePostFrontmatter(file, parsed.data);
  const slug = file.replace(/\.md$/, "");
  return { slug, content: parsed.content, data };
}

function toPostMeta(
  slug: string,
  content: string,
  data: ReturnType<typeof parsePostFrontmatter>,
): PostMeta {
  return {
    slug,
    title: data.title,
    date: data.date,
    summary: data.summary,
    excerpt: data.excerpt ?? extractExcerpt(content),
    category: data.category,
    updated: data.updated,
    tags: data.tags,
    series: data.series,
    featured: data.featured,
    readingTime: estimateReadingTime(content),
  };
}

let allPostsCache: PostMeta[] | null = null;

export const getAllPosts = cache((): PostMeta[] => {
  if (isProd && allPostsCache) return allPostsCache;
  if (!fs.existsSync(postsDirectory)) return [];

  const posts = fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map(readSource)
    .filter(({ data }) => !data.draft)
    .map(({ slug, content, data }) => toPostMeta(slug, content, data))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (isProd) allPostsCache = posts;
  return posts;
});

const postCache = new Map<string, Post>();

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const cached = isProd ? postCache.get(slug) : undefined;
  if (cached) return cached;
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) return null;

  const file = `${slug}.md`;
  const filePath = path.join(postsDirectory, file);
  if (!fs.existsSync(filePath)) return null;

  const { content, data } = readSource(file);
  if (data.draft) return null;
  const { html, toc } = await renderMarkdown(content);
  const post: Post = { ...toPostMeta(slug, content, data), content, html, toc };
  if (isProd) postCache.set(slug, post);
  return post;
});

export function getAdjacentPosts(slug: string): {
  newer?: PostMeta;
  older?: PostMeta;
} {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index < 0) return {};
  return { newer: posts[index - 1], older: posts[index + 1] };
}

export function getRelatedPosts(post: PostMeta, limit = 3): PostMeta[] {
  const tags = new Set(post.tags.map((tag) => tag.toLowerCase()));
  return getAllPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      candidate,
      score:
        (candidate.series && candidate.series === post.series ? 5 : 0) +
        (candidate.category && candidate.category === post.category ? 2 : 0) +
        candidate.tags.filter((tag) => tags.has(tag.toLowerCase())).length * 3,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.date.localeCompare(a.candidate.date))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function getSearchIndex(): SearchPost[] {
  const published = new Set(getAllPosts().map((post) => post.slug));
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map(readSource)
    .filter(({ slug }) => published.has(slug))
    .map(({ slug, content, data }) => ({
      slug,
      title: data.title,
      summary: data.summary,
      category: data.category,
      tags: data.tags,
      text: plainText(content),
    }));
}

export function getArchiveGroups(): { year: string; posts: PostMeta[] }[] {
  const groups = new Map<string, PostMeta[]>();
  for (const post of getAllPosts()) {
    const year = post.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return Array.from(groups, ([year, posts]) => ({ year, posts }));
}

export function getPostsPage(page: number, pageSize = POSTS_PER_PAGE): {
  posts: PostMeta[];
  page: number;
  totalPages: number;
} {
  const allPosts = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(allPosts.length / pageSize));
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  return {
    posts: allPosts.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    totalPages,
  };
}

export function taxonomySlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function collectTaxonomy(values: string[]): TaxonomyItem[] {
  const items = new Map<string, TaxonomyItem>();
  for (const name of values) {
    const slug = taxonomySlug(name);
    const current = items.get(slug);
    items.set(slug, { slug, name: current?.name ?? name, count: (current?.count ?? 0) + 1 });
  }
  return Array.from(items.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getAllTags(): TaxonomyItem[] {
  return collectTaxonomy(getAllPosts().flatMap((post) => post.tags));
}

export function getAllSeries(): TaxonomyItem[] {
  return collectTaxonomy(getAllPosts().flatMap((post) => post.series ? [post.series] : []));
}

export function getPostsByTag(slug: string): PostMeta[] {
  return getAllPosts().filter((post) => post.tags.some((tag) => taxonomySlug(tag) === slug));
}

export function getPostsBySeries(slug: string): PostMeta[] {
  return getAllPosts().filter((post) => post.series && taxonomySlug(post.series) === slug);
}
