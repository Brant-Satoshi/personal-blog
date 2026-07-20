import fs from "node:fs";
import path from "node:path";

const configured = process.env.SITE_URL;
if (!configured) {
  throw new Error("SITE_URL is required to verify the SEO build output");
}

const origin = new URL(configured).origin;
const appOutput = path.join(process.cwd(), ".next", "server", "app");
const firstArticle = fs
  .readdirSync(path.join(process.cwd(), "content", "posts"))
  .find((file) => file.endsWith(".md"));

if (!firstArticle) throw new Error("No article found for SEO verification");

const files = [
  path.join(appOutput, "index.html"),
  path.join(appOutput, "sitemap.xml.body"),
  path.join(appOutput, "robots.txt.body"),
  path.join(appOutput, firstArticle.replace(/\.md$/, ".html")),
];

for (const file of files) {
  if (!fs.existsSync(file)) throw new Error(`Missing prerendered SEO artifact: ${file}`);
  const output = fs.readFileSync(file, "utf8");
  if (!output.includes(origin)) {
    throw new Error(`${path.relative(process.cwd(), file)} does not contain ${origin}`);
  }
  if (/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(output)) {
    throw new Error(`${path.relative(process.cwd(), file)} contains a localhost URL`);
  }
}

console.log(`Verified SEO build artifacts use ${origin}`);
