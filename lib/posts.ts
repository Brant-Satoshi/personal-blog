import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked, type Tokens } from "marked";
import { createHighlighter, type Highlighter } from "shiki";

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

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
  return slug.length > 0 ? slug.slice(0, 80) : "section";
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
        date: normalizeDate(data.date) ?? "1970-01-01",
        summary: safeString(data.summary, ""),
        excerpt: optionalString(data.excerpt) ?? extractExcerpt(content),
        category: optionalString(data.category),
        updated: normalizeDate(data.updated),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const LANG_LABELS: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  sh: "Shell",
};

const SHIKI_THEMES = { light: "github-light", dark: "github-dark" } as const;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [SHIKI_THEMES.light, SHIKI_THEMES.dark],
      langs: ["python", "javascript", "typescript", "tsx", "jsx", "json", "bash", "css", "html"],
    });
  }
  return highlighterPromise;
}

const COPY_BUTTON =
  `<button type="button" class="code-copy" aria-label="Copy code">` +
  `<svg class="code-copy-idle" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>` +
  `<svg class="code-copy-done" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>` +
  `</button>`;

function langLabel(lang: string): string {
  return LANG_LABELS[lang] ?? lang.charAt(0).toUpperCase() + lang.slice(1);
}

function highlightCode(highlighter: Highlighter, code: string, lang: string): string {
  try {
    return highlighter.codeToHtml(code, { lang, themes: SHIKI_THEMES });
  } catch {
    return `<pre><code class="language-${escapeHtml(lang)}">${escapeHtml(code)}</code></pre>`;
  }
}

// Adjacent fenced blocks in different languages render as one block with a switcher.
function renderCodeGroup(
  highlighter: Highlighter,
  blocks: { lang: string; code: string }[],
): string {
  const active = blocks[0].lang;
  const check = `<svg class="code-lang-check" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
  const chevron = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>`;
  const options = blocks
    .map(
      (b) =>
        `<li class="code-lang-option" role="option" data-lang="${escapeHtml(b.lang)}" aria-selected="${b.lang === active}">` +
        check +
        `<span>${escapeHtml(langLabel(b.lang))}</span></li>`,
    )
    .join("");
  const panels = blocks
    .map(
      (b) =>
        `<div class="code-group-panel" data-lang="${escapeHtml(b.lang)}"${b.lang === active ? "" : " hidden"}>` +
        highlightCode(highlighter, b.code, b.lang) +
        `</div>`,
    )
    .join("");
  return (
    `<div class="code-group">` +
    `<div class="code-group-head">` +
    `<div class="code-lang-select">` +
    `<button type="button" class="code-lang-trigger" aria-haspopup="listbox" aria-expanded="false">` +
    `<span class="code-lang-current">${escapeHtml(langLabel(active))}</span>${chevron}</button>` +
    `<ul class="code-lang-menu" role="listbox" hidden>${options}</ul>` +
    `</div>` +
    COPY_BUTTON +
    `</div>` +
    `<div class="code-group-body">${panels}</div>` +
    `</div>\n`
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const highlighter = await getHighlighter();

  const toc: TocItem[] = [];
  const parser = new Marked({
    renderer: {
      heading(text: string, level: number) {
        const plain = stripHtml(text);
        const id = slugify(plain);
        if (level === 2 || level === 3) {
          toc.push({ id, text: plain, depth: level });
        }
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      },
      code(code: string, infostring: string | undefined, escaped: boolean) {
        const lang = ((infostring ?? "").match(/^\S*/)?.[0] ?? "").toLowerCase();
        if (lang === "mermaid") {
          return `<div class="mermaid-diagram" data-source="${escapeHtml(code)}"></div>\n`;
        }
        if (!lang) {
          return `<pre><code>${escaped ? code : escapeHtml(code)}</code></pre>\n`;
        }
        return (
          `<div class="code-block" data-lang="${escapeHtml(lang)}">` +
          `<div class="code-block-label">${escapeHtml(langLabel(lang))}${COPY_BUTTON}</div>` +
          highlightCode(highlighter, code, lang) +
          `</div>\n`
        );
      },
      table(header: string, body: string) {
        const rows = body ? `<tbody>${body}</tbody>` : "";
        return `<div class="table-wrap"><table><thead>${header}</thead>${rows}</table></div>\n`;
      },
    },
  });

  const tokens = parser.lexer(content);

  for (let i = 0; i < tokens.length; ) {
    if (tokens[i].type !== "code") {
      i++;
      continue;
    }
    const blocks: { lang: string; code: string }[] = [];
    let lastCodeIdx = i;
    let j = i;
    while (j < tokens.length) {
      const token = tokens[j];
      if (token.type === "code") {
        const lang = ((token.lang ?? "").match(/^\S*/)?.[0] ?? "").toLowerCase();
        if (!lang || lang === "mermaid") break;
        blocks.push({ lang, code: token.text ?? "" });
        lastCodeIdx = j;
        j++;
      } else if (token.type === "space") {
        j++;
      } else {
        break;
      }
    }
    if (blocks.length >= 2 && new Set(blocks.map((b) => b.lang)).size === blocks.length) {
      const groupToken: Tokens.HTML = {
        type: "html",
        raw: "",
        pre: false,
        block: true,
        text: renderCodeGroup(highlighter, blocks),
      };
      tokens.splice(i, lastCodeIdx - i + 1, groupToken);
      i++;
    } else {
      i = lastCodeIdx + 1;
    }
  }

  const html = parser.parser(tokens) as string;

  return {
    slug,
    title: safeString(data.title, slug),
    date: normalizeDate(data.date) ?? "1970-01-01",
    summary: safeString(data.summary, ""),
    excerpt: optionalString(data.excerpt) ?? extractExcerpt(content),
    category: optionalString(data.category),
    updated: normalizeDate(data.updated),
    content,
    html,
    toc,
  };
}
