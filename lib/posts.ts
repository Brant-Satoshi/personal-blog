import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  excerpt?: string;
  category?: string;
  updated?: string;
};

export type TocItem = {
  id: string;
  text: string;
  depth: number;
};

export type Post = PostMeta & {
  content: string;
  html: string;
  toc: TocItem[];
};

const postsDirectory = path.join(process.cwd(), "content", "posts");

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

function extractExcerpt(content: string, maxLength = 320): string | undefined {
  const stripped = content
    .replace(/^#+\s+.*$/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>]/g, "")
    .trim();

  const firstParagraph = stripped.split(/\n\s*\n/)[0]?.trim();
  if (!firstParagraph) return undefined;

  if (firstParagraph.length <= maxLength) return firstParagraph;

  const truncated = firstParagraph.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(". ");
  if (lastPeriod > maxLength * 0.5) return truncated.slice(0, lastPeriod + 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace)}…`;
}

function slugify(text: string, seen: Map<string, number>): string {
  const base = text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
  const slug = base.length > 0 ? base.slice(0, 80) : "section";
  const count = seen.get(slug) ?? 0;
  seen.set(slug, count + 1);
  return count === 0 ? slug : `${slug}-${count}`;
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gis, "")
    .replace(/(<[^>]+?)\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "$1")
    .replace(/href\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, 'href="#"');
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const files = fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const filePath = path.join(postsDirectory, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);

      return {
        slug,
        title: safeString(data.title, slug),
        date: safeString(data.date, "1970-01-01"),
        summary: safeString(data.summary, ""),
        excerpt: optionalString(data.excerpt) ?? extractExcerpt(content),
        category: optionalString(data.category),
        updated: optionalString(data.updated),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  const parser = new Marked({
    renderer: {
      heading(text: string, level: number) {
        const plain = stripHtml(text);
        const id = slugify(plain, seen);
        if (level === 2 || level === 3) {
          toc.push({ id, text: plain, depth: level });
        }
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      },
    },
  });

  const html = sanitizeHtml(parser.parse(content) as string);

  return {
    slug,
    title: safeString(data.title, slug),
    date: safeString(data.date, "1970-01-01"),
    summary: safeString(data.summary, ""),
    excerpt: optionalString(data.excerpt) ?? extractExcerpt(content),
    category: optionalString(data.category),
    updated: optionalString(data.updated),
    content,
    html,
    toc,
  };
}
