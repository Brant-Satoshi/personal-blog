import type { Locale } from "@/lib/i18n";

const WORDS_PER_MINUTE = 200;
const CJK_CHARACTERS_PER_MINUTE = 300;

function ordinal(day: number): string {
  if (day >= 11 && day <= 13) return `${day}th`;
  const last = day % 10;
  if (last === 1) return `${day}st`;
  if (last === 2) return `${day}nd`;
  if (last === 3) return `${day}rd`;
  return `${day}th`;
}

export function formatLongDate(dateStr: string, locale: Locale): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (locale === "zh") {
    return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
  }

  const month = date.toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  return `${month} ${ordinal(date.getUTCDate())}, ${date.getUTCFullYear()}`;
}

// Single markdown→prose pass shared by excerpt extraction and reading time.
// Drops fenced code, heading lines, images, HTML tags, and markup characters;
// unwraps links and keeps inline-code text (readers read it). Blank-line
// paragraph breaks survive so callers can split on them.
function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#+\s+.*$/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`>]/g, "");
}

export function extractExcerpt(content: string, maxLength = 320): string | undefined {
  const stripped = stripMarkdown(content).trim();

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

export function estimateReadingTime(content: string): number {
  const prose = stripMarkdown(content);

  const cjkCharacters = prose.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)?.length ?? 0;
  const latinWords = prose
    .replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu, " ")
    .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;

  return Math.max(
    1,
    Math.ceil(
      latinWords / WORDS_PER_MINUTE +
        cjkCharacters / CJK_CHARACTERS_PER_MINUTE,
    ),
  );
}
