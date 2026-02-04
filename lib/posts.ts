import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
};

export type Post = PostMeta & {
  content: string;
  html: string;
};

const postsDirectory = path.join(process.cwd(), "content", "posts");

function safeString(value: unknown, fallback: string): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return fallback;
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
      const { data } = matter(raw);

      return {
        slug,
        title: safeString(data.title, slug),
        date: safeString(data.date, "1970-01-01"),
        summary: safeString(data.summary, ""),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const html = marked.parse(content) as string;

  return {
    slug,
    title: safeString(data.title, slug),
    date: safeString(data.date, "1970-01-01"),
    summary: safeString(data.summary, ""),
    content,
    html,
  };
}
