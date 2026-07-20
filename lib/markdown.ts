import { Marked, type Tokens } from "marked";
import { createHighlighter, type Highlighter } from "shiki";

export type TocItem = {
  id: string;
  text: string;
  depth: number;
};

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

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
  return slug.length > 0 ? slug.slice(0, 80) : "section";
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
        `<li class="code-lang-option" role="option" tabindex="${b.lang === active ? "0" : "-1"}" data-lang="${escapeHtml(b.lang)}" aria-selected="${b.lang === active}">` +
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

export async function renderMarkdown(
  content: string,
): Promise<{ html: string; toc: TocItem[] }> {
  const highlighter = await getHighlighter();

  const toc: TocItem[] = [];
  const headingIds = new Map<string, number>();
  const parser = new Marked({
    renderer: {
      heading(text: string, level: number) {
        const plain = stripHtml(text);
        const baseId = slugify(plain);
        const seen = headingIds.get(baseId) ?? 0;
        headingIds.set(baseId, seen + 1);
        const id = seen === 0 ? baseId : `${baseId}-${seen + 1}`;
        if (level === 2 || level === 3) {
          toc.push({ id, text: plain, depth: level });
        }
        return `<h${level} id="${id}">${text}</h${level}>\n`;
      },
      link(href: string, title: string | null | undefined, text: string) {
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
        const targetAttr = /^https?:\/\//i.test(href)
          ? ` target="_blank" rel="noopener noreferrer"`
          : "";
        return `<a href="${escapeHtml(href)}"${titleAttr}${targetAttr}>${text}</a>`;
      },
      image(href: string, title: string | null, text: string) {
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
        return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" decoding="async">`;
      },
      html(html: string) {
        return escapeHtml(html);
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

  parser.use({
    extensions: [
      {
        name: "codeGroup",
        renderer(token: Tokens.Generic) {
          return token.html as string;
        },
      },
    ],
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
      const groupToken: Tokens.Generic = {
        type: "codeGroup",
        raw: "",
        html: renderCodeGroup(highlighter, blocks),
      };
      tokens.splice(i, lastCodeIdx - i + 1, groupToken);
      i++;
    } else {
      i = lastCodeIdx + 1;
    }
  }

  const html = parser.parser(tokens) as string;
  return { html, toc };
}
