import { describe, expect, it } from "vitest";
import { parsePostFrontmatter } from "@/lib/content-schema";

describe("post frontmatter", () => {
  it("normalizes YAML dates and applies optional defaults", () => {
    const result = parsePostFrontmatter("example.md", {
      title: "Example",
      date: new Date("2026-07-18T00:00:00.000Z"),
      summary: "A useful summary",
      category: "Tools",
    });
    expect(result.date).toBe("2026-07-18");
    expect(result.tags).toEqual([]);
    expect(result.draft).toBe(false);
  });

  it("rejects unknown categories", () => {
    expect(() =>
      parsePostFrontmatter("bad.md", {
        title: "Bad",
        date: "2026-07-18",
        summary: "Summary",
        category: "Unknown",
      }),
    ).toThrow(/unknown category/);
  });

  it("rejects an update before publication", () => {
    expect(() =>
      parsePostFrontmatter("bad.md", {
        title: "Bad",
        date: "2026-07-18",
        updated: "2026-07-17",
        summary: "Summary",
      }),
    ).toThrow(/must not be earlier/);
  });

  it("rejects impossible calendar dates", () => {
    expect(() =>
      parsePostFrontmatter("bad.md", {
        title: "Bad",
        date: "2026-02-31",
        summary: "Summary",
      }),
    ).toThrow(/valid calendar date/);
  });
});
