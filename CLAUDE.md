# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (`packageManager: pnpm@11.1.3`). CONTRIBUTING.md still shows `npm` commands — those are stale; use pnpm and the script names below.

```bash
pnpm dev        # Next.js dev server (Turbopack)
pnpm build      # Production build — requires SITE_URL (e.g. SITE_URL=http://localhost:3000 pnpm build)
pnpm start      # Run the production build
pnpm lint       # ESLint (script is bare `eslint`, which lints the whole project)
pnpm typecheck  # tsc --noEmit
pnpm test       # Vitest (tests/: content schema, posts, likes, markdown rendering)
pnpm check      # lint + typecheck + test
pnpm verify:seo # Assert prerendered output uses SITE_URL, no localhost leaks (run after a build)
```

`pnpm build` throws without `SITE_URL` set — `lib/site.ts` requires it for production builds so canonical/OG/sitemap URLs can't silently point at localhost. CI (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, `test`, `build`, and `verify:seo` on Node 22 — all must pass.

## Architecture

Static blog: Markdown files in `content/posts/` are read at build time and rendered via the Next.js App Router — every route is prerendered except `/feed.xml`. Adding a post = drop a `.md` file in `content/posts/` with `title`, `date`, `summary` frontmatter (optional: `excerpt`, `category`, `updated`, `tags`, `series`, `draft`, `featured`); no code change required, but the image must be rebuilt for it to appear.

- **Framework**: Next.js **16.1.6** App Router + React 19.
- **Content pipeline**: [lib/posts.ts](lib/posts.ts) is the single source of truth for post loading. Frontmatter is parsed with `gray-matter` and validated by zod in [lib/content-schema.ts](lib/content-schema.ts) — an invalid post **throws** (build fails, dev pages error) instead of silently degrading, and `draft: true` posts are excluded everywhere. `getAllPosts()` returns sorted `PostMeta`; `getPostBySlug()` renders the body via `renderMarkdown()` and auto-extracts an excerpt when frontmatter omits one (the excerpt, CJK-aware `readingTime`, and long-date formatting live in [lib/post-meta.ts](lib/post-meta.ts) and share one `stripMarkdown()` pass). Derived views live in the same file: pagination (`getPostsPage`, 6/page), tags/series taxonomy (`getAllTags`/`getAllSeries`/`taxonomySlug`), archive groups, related posts, and the search index. Everything reads synchronously from disk via `node:fs`, wrapped in React `cache()` plus a module-level cache in production — Server Components / build context only, never client components.
- **Markdown rendering**: [lib/markdown.ts](lib/markdown.ts) drives `marked` with a custom renderer: raw HTML in markdown is escaped, only external `http(s)` links get `target="_blank"`, `h2`/`h3` headings get slugified deduped `id`s that feed the TOC, code is highlighted with `shiki` (github-light/github-dark dual themes), ` ```mermaid ` fences become `.mermaid-diagram` placeholders, adjacent fenced blocks in different languages merge into one language-switcher "code group", and code blocks get copy buttons. The interactive parts are hydrated on the post page by client components: [components/code-copy.tsx](components/code-copy.tsx), [components/code-groups.tsx](components/code-groups.tsx), and [components/mermaid-renderer.tsx](components/mermaid-renderer.tsx) (lazy-imports `mermaid`; zoom/preview controls in [components/mermaid-zoom.ts](components/mermaid-zoom.ts)).
- **Categories**: [lib/category-data.ts](lib/category-data.ts) defines the fixed `CATEGORIES` array (slug + bilingual name/description + lucide icon); [lib/categories.ts](lib/categories.ts) re-exports it and adds the post-joining helpers. A post joins a category by its `category` frontmatter string, matched case-insensitively against the category's English `name` — unknown category names fail schema validation. Categories are not derived from posts — editing the taxonomy means editing `category-data.ts`.
- **i18n**: [lib/i18n.ts](lib/i18n.ts) holds typed `en`/`zh` dicts, but the locale is **hardcoded to `zh`** — `getLocale()` returns a constant (no cookie, no language toggle, no route prefixes), which is what lets every page prerender statically. `getDict(locale)` returns the typed `Dict`; categories carry their own `nameZh`/`descriptionZh`.
- **Theme**: dark mode toggles a `.dark` class on `<html>`. [app/layout.tsx](app/layout.tsx) injects an inline no-flash script that applies the class from `localStorage.theme` (or `prefers-color-scheme`) before paint; `ThemeToggle` is a client component that updates both.
- **Routes**: [app/page.tsx](app/page.tsx) (page 1 of the listing) + [app/page/[page]/page.tsx](app/page/[page]/page.tsx) (pagination; `/page/1` 404s in favor of `/`), [app/[slug]/page.tsx](app/[slug]/page.tsx) (post detail with TOC, tags/series chips, related posts, prev/next nav; sidebar TOC in [app/[slug]/table-of-contents.tsx](app/[slug]/table-of-contents.tsx), mobile floating TOC in [components/toc-menu.tsx](components/toc-menu.tsx)), [app/archive/page.tsx](app/archive/page.tsx) (by-year listing), [app/tags/](app/tags/) and [app/series/](app/series/) (taxonomy index + detail), [app/about/](app/about/), [app/categories/](app/categories/). The home list and category/taxonomy grids share [components/post-card.tsx](components/post-card.tsx) (`variant`: `list` editorial card with excerpt, `grid` bordered card). Param routes use `generateStaticParams` + `dynamicParams = false`. Shared chrome (`SiteHeader`/`SiteFooter`) lives in [components/site-shell.tsx](components/site-shell.tsx).
- **SEO/RSS**: [app/robots.ts](app/robots.ts) and [app/sitemap.ts](app/sitemap.ts) (static + category + tag/series + post URLs), a full-content RSS feed at [app/feed.xml/route.ts](app/feed.xml/route.ts) (CDATA-wrapped HTML, `zh-CN`), social images via `next/og` in [lib/social-image.tsx](lib/social-image.tsx) (site-wide and per-post `opengraph-image.tsx`/`twitter-image.tsx`), and Article JSON-LD on post pages. Absolute URLs resolve in [lib/site.ts](lib/site.ts) from `NEXT_PUBLIC_SITE_URL`/`SITE_URL` (Vercel URL fallback) — required for production builds, which throw without it.
- **Likes**: global per-post like counts live in `likes.json` via [lib/likes.ts](lib/likes.ts) (no database; directory comes from `LIKES_DIR`, default `data/` — gitignored locally, named volume `blog-data:/app/data` in production). Pages are static, so [app/[slug]/like-button.tsx](app/[slug]/like-button.tsx) renders with `initialLikes={0}` and fetches the real total from `GET /api/likes/[slug]`; `POST` increments via an atomic tmp-file rename (503 if persisting fails) and localStorage caps each reader at 10 clicks (the animation/red state is per-reader, the number shown is global).
- **Search**: [components/search-dialog.tsx](components/search-dialog.tsx) is a client-side modal rendered inside `SiteHeader` (⌘K / Ctrl+K). On first open it fetches `/search-index.json` ([app/search-index.json/route.ts](app/search-index.json/route.ts), `force-static` — generated at build time with each post's full plain text) and does in-memory scored matching (title > tags > category > summary > body) with highlighted snippets, capped at 10 results.
- **Styling**: Tailwind CSS 4 with CSS-first config — there is **no `tailwind.config.*`**; the theme (custom tokens like `ink`, `azure`, `pink`, `paper`) lives in [app/globals.css](app/globals.css) via `@theme`, which also `@import`s [styles/markdown.css](styles/markdown.css) and [styles/code-blocks.css](styles/code-blocks.css) (rendered-post body and code-block styling). Fonts are system stacks (`--font-sans`/`--font-serif`/`--font-mono` in globals.css) — `next/font` and Google Fonts are not used. PostCSS uses `@tailwindcss/postcss`.
- **Path alias**: `@/*` resolves to the project root (see [tsconfig.json](tsconfig.json)), so `@/lib/posts` works from anywhere.

## Conventions

From [ai/CONTEXT.md](ai/CONTEXT.md) and [ai/STYLE.md](ai/STYLE.md) (both in Chinese):
- Default to Server Components; only add `"use client"` when interactivity requires it.
- Don't add jQuery, Bootstrap, or heavy form libraries. Keep dependencies minimal.
- No new global stylesheets — global CSS stays in `app/globals.css` and the `styles/*.css` files it imports; use Tailwind utilities.
- Component files target ≤200 lines; split if larger.

## Deployment

`next.config.ts` sets `output: "standalone"`; the app runs as a Next.js standalone server on port **3000** (no Nginx/Caddy). [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds a Docker image, pushes it to GHCR, and deploys to a VPS over SSH on every push to `main`. The image build **requires** the `SITE_URL` build-arg — the deploy workflow reads it from the `SITE_URL` GitHub repository variable and validates it is a public HTTPS origin before building; the same value is passed to the container at runtime for `/feed.xml`. Routes for `content/posts/` are generated at image build time, so re-build the image after adding or editing posts. Like counts persist in the `blog-data` Docker named volume mounted at `/app/data` (created by the compose file the deploy script writes; local `docker-compose.yml` uses a volume named `blog-likes`); deleting that volume resets all counts.

## Reference Documents

Read these before non-trivial work (all in Chinese) — but verify against current code; if they drift, trust the code:
- [ai/CONTEXT.md](ai/CONTEXT.md) — project overview + constraints
- [ai/STYLE.md](ai/STYLE.md) — naming + file-org conventions
- [ai/PROMPTS.md](ai/PROMPTS.md) — workflow templates
- [ai/CHECKLIST.md](ai/CHECKLIST.md) — pre-delivery self-check
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — route map, data flow, caching, SEO status
- [docs/PRD.md](docs/PRD.md) — product scope with implementation status; [docs/ROADMAP.md](docs/ROADMAP.md) — milestones + unordered candidate pool
- [docs/WORKFLOW.md](docs/WORKFLOW.md) — how the docs/ and ai/ files link together
