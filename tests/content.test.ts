import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAllPosts, getSearchIndex } from "@/lib/posts";

describe("published content", () => {
  it("has valid unique metadata", () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
    expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
    for (const post of posts) {
      expect(post.title).toBeTruthy();
      expect(post.summary).toBeTruthy();
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("includes body text in the search index", () => {
    const index = getSearchIndex();
    expect(index).toHaveLength(getAllPosts().length);
    expect(index.every((post) => post.text.length > 0)).toBe(true);
  });

  it("does not reference missing local images", () => {
    const contentDir = path.join(process.cwd(), "content", "posts");
    const missing: string[] = [];
    for (const file of fs.readdirSync(contentDir).filter((name) => name.endsWith(".md"))) {
      const markdown = fs.readFileSync(path.join(contentDir, file), "utf8");
      for (const match of markdown.matchAll(/!\[[^\]]*\]\((\/[^)]+)\)/g)) {
        const asset = path.join(process.cwd(), "public", match[1]);
        if (!fs.existsSync(asset)) missing.push(`${file}: ${match[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
