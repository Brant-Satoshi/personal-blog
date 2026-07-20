import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("markdown rendering", () => {
  it("creates stable unique heading ids", async () => {
    const result = await renderMarkdown("## Repeat\n\nText\n\n## Repeat\n\nMore");
    expect(result.toc.map((item) => item.id)).toEqual(["repeat", "repeat-2"]);
    expect(result.html).toContain('id="repeat-2"');
  });

  it("escapes raw html and lazily decodes images", async () => {
    const result = await renderMarkdown('<script>alert("x")</script>\n\n![Alt](/image.png)');
    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;script&gt;");
    expect(result.html).toContain('loading="lazy"');
    expect(result.html).toContain('decoding="async"');
  });

  it("renders generated code groups without enabling raw html", async () => {
    const result = await renderMarkdown(
      '```python\nprint("hello")\n```\n\n```javascript\nconsole.log("hello")\n```',
    );

    expect(result.html).toContain('<div class="code-group">');
    expect(result.html).not.toContain('&lt;div class=&quot;code-group&quot;&gt;');
  });

  it("only opens external web links in a new tab", async () => {
    const result = await renderMarkdown("[Local](/about) [External](https://example.com)");
    expect(result.html).toContain('<a href="/about">Local</a>');
    expect(result.html).toContain('target="_blank"');
  });
});
