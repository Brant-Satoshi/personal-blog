import fs from "node:fs";
import path from "node:path";

// Global like counts, stored as a flat slug→count JSON map so a personal blog
// needs no database. In Docker the directory is a mounted volume so counts
// survive redeploys; locally it defaults to ./data (gitignored). The file is
// re-read on every call (it is tiny) — bundles for pages and route handlers
// each get their own module instance, so an in-memory cache would go stale.
const dataDir = process.env.LIKES_DIR ?? path.join(process.cwd(), "data");
const likesFile = path.join(dataDir, "likes.json");

function load(): Record<string, number> {
  const counts: Record<string, number> = {};
  try {
    const raw: unknown = JSON.parse(fs.readFileSync(likesFile, "utf8"));
    if (raw && typeof raw === "object") {
      for (const [slug, count] of Object.entries(raw)) {
        if (typeof count === "number" && Number.isFinite(count) && count > 0) {
          counts[slug] = Math.floor(count);
        }
      }
    }
  } catch {
    // missing or corrupt file — start from zero
  }
  return counts;
}

export function getLikes(slug: string): number {
  return load()[slug] ?? 0;
}

export function addLike(slug: string): number {
  const counts = load();
  counts[slug] = (counts[slug] ?? 0) + 1;
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    const tmp = `${likesFile}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(counts));
    fs.renameSync(tmp, likesFile); // atomic — a crash never leaves a torn file
  } catch (error) {
    console.error("likes: failed to persist", error);
  }
  return counts[slug];
}
