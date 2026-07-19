# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (`packageManager: pnpm@11.1.3`).

```bash
pnpm dev        # Next.js dev server (Turbopack)
pnpm build      # Production build — also the most reliable "does this still compile" check
pnpm start      # Run the production build
pnpm lint       # ESLint (script is bare `eslint`, which lints the whole project)
pnpm typecheck  # tsc --noEmit
```

There is no `test` script and no tests in the repo. CI (`.github/workflows/ci.yml`) runs `lint`, `typecheck`, and `build` on Node 22 — all three must pass.

## Architecture

Static-ish blog: Markdown files in `content/posts/` are read at request/build time and rendered via the Next.js App Router. Adding a post = drop a `.md` file in `content/posts/` with `title`, `date`, `summary` frontmatter (optional: `excerpt`, `category`, `updated`); no code change required.

- **Framework**: Next.js **16.1.6** App Router + React 19.
- **Content pipeline**: [lib/posts.ts](lib/posts.ts) is the single source of truth for post loading. `getAllPosts()` returns sorted `PostMeta`; `getPostBySlug()` parses frontmatter with `gray-matter` and renders the body via `renderMarkdown()` from [lib/markdown.ts](lib/markdown.ts). Metadata derived from the body — the auto-excerpt used when frontmatter omits one, the CJK-aware `readingTime`, long-date formatting — lives in [lib/post-meta.ts](lib/post-meta.ts); excerpt and reading time share one `stripMarkdown()` pass so they never disagree about what counts as prose. Loading reads synchronously from disk via `node:fs`, wrapped in React `cache()` plus a module-level cache in production (post files are baked into the image) — Server Components / build context only, never client components.
- **Markdown rendering**: [lib/markdown.ts](lib/markdown.ts) drives `marked` with a custom renderer: `h2`/`h3` headings get slugified `id`s and feed the TOC, code is highlighted with `shiki` (github-light/github-dark dual themes), ` ```mermaid ` fences become `.mermaid-diagram` placeholders, adjacent fenced blocks in different languages merge into one language-switcher "code group", and code blocks get copy buttons. The interactive parts are hydrated on the post page by client components: [components/code-copy.tsx](components/code-copy.tsx), [components/code-groups.tsx](components/code-groups.tsx), and [components/mermaid-renderer.tsx](components/mermaid-renderer.tsx) (lazy-imports `mermaid`; zoom/preview controls in [components/mermaid-zoom.ts](components/mermaid-zoom.ts)).
- **Categories**: [lib/categories.ts](lib/categories.ts) defines a fixed `CATEGORIES` array (slug + bilingual name/description + lucide icon). A post joins a category by its `category` frontmatter string, matched case-insensitively against the category's English `name`. Categories are not derived from posts — editing the taxonomy means editing this file.
- **i18n**: [lib/i18n.ts](lib/i18n.ts) drives English/Chinese. Locale is **cookie-based** (`locale` cookie, values `en`/`zh`, default `en`) — there are **no `/en` or `/zh` route prefixes**. `getLocale()` reads the cookie (async, Server Components only); `getDict(locale)` returns the typed translation `Dict`. The `LanguageToggle` client component writes the cookie and calls `router.refresh()`. All UI strings live in the `en`/`zh` dicts in this file; categories carry their own `nameZh`/`descriptionZh`. Post content is **not** locale-linked — a Chinese translation is simply another standalone `.md` post.
- **Theme**: dark mode toggles a `.dark` class on `<html>`. [app/layout.tsx](app/layout.tsx) injects an inline no-flash script that applies the class from `localStorage.theme` (or `prefers-color-scheme`) before paint; `ThemeToggle` is a client component that updates both.
- **Routes**: [app/page.tsx](app/page.tsx) (index/listing), [app/[slug]/page.tsx](app/[slug]/page.tsx) (post detail, with [table-of-contents.tsx](app/[slug]/table-of-contents.tsx) in the sidebar and [components/toc-menu.tsx](components/toc-menu.tsx) as the mobile floating TOC), [app/about/](app/about/), [app/categories/page.tsx](app/categories/page.tsx) (category listing) and [app/categories/[slug]/page.tsx](app/categories/[slug]/page.tsx) (per-category posts). The home list and category grid share [components/post-card.tsx](components/post-card.tsx) (`variant`: `featured` home card with excerpt, `compact` bordered grid card). Shared chrome (`SiteHeader`/`SiteFooter`) renders once from the root layout via [components/site-shell.tsx](components/site-shell.tsx). No route defines `generateStaticParams` — the root layout reads the locale cookie, so every route renders on demand.
- **SEO/RSS**: [app/robots.ts](app/robots.ts), [app/sitemap.ts](app/sitemap.ts), and an RSS feed at [app/feed.xml/route.ts](app/feed.xml/route.ts). Social images are generated with `next/og` through [lib/social-image.tsx](lib/social-image.tsx) (site-wide and per-post `opengraph-image.tsx`/`twitter-image.tsx`), and the post page emits Article JSON-LD. Absolute URLs resolve in [lib/site.ts](lib/site.ts) (`NEXT_PUBLIC_SITE_URL`/`SITE_URL` env, then Vercel URLs) with [lib/request-url.ts](lib/request-url.ts) falling back to forwarded request headers when nothing is configured.
- **Likes**: global per-post like counts live in `data/likes.json` via [lib/likes.ts](lib/likes.ts) (no database; `data/` is gitignored locally and a named volume `blog-data:/app/data` in production; `LIKES_DIR` env overrides the directory). `POST /api/likes/[slug]` ([app/api/likes/[slug]/route.ts](app/api/likes/[slug]/route.ts)) increments and returns the total; the post page reads the total server-side and passes it to [app/[slug]/like-button.tsx](app/[slug]/like-button.tsx), which caps each reader at 10 clicks via localStorage (the animation/red state is per-reader, the number shown is global).
- **Search**: [components/search-dialog.tsx](components/search-dialog.tsx) is a client-side modal rendered inside `SiteHeader`. There is no search route or prebuilt index — the server passes `getAllPosts()` in as a prop and the dialog does in-memory, case-insensitive substring matching over each post's title, summary, and category.
- **Styling**: Tailwind CSS 4 with CSS-first config — there is **no `tailwind.config.*`**; the theme (custom tokens like `ink`, `azure`, `pink`, `paper`) lives in [app/globals.css](app/globals.css) via `@theme`. `globals.css` also `@import`s [styles/markdown.css](styles/markdown.css) and [styles/code-blocks.css](styles/code-blocks.css) (rendered-post body and code-block/code-group styling). PostCSS uses `@tailwindcss/postcss`.
- **UI primitives**: shadcn/ui is wired up ([components.json](components.json): `new-york` style, `neutral` base, `lucide` icons). Generated components go in [components/ui/](components/ui/). Use `cn()` from [lib/utils.ts](lib/utils.ts) for class merging.
- **Path alias**: `@/*` resolves to the project root (see [tsconfig.json](tsconfig.json)), so `@/lib/posts` works from anywhere.

## Conventions

From [ai/CONTEXT.md](ai/CONTEXT.md) and [ai/STYLE.md](ai/STYLE.md) (both in Chinese):
- Default to Server Components; only add `"use client"` when interactivity requires it.
- Don't add jQuery, Bootstrap, or heavy form libraries. Keep dependencies minimal.
- No new global stylesheets — global CSS stays in `app/globals.css` and the `styles/*.css` files it imports; use Tailwind utilities.
- Component files target ≤200 lines; split if larger.

## Deployment

`next.config.ts` sets `output: "standalone"`; the app runs as a Next.js standalone server on port **3000** (no Nginx/Caddy). [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds a Docker image, pushes it to GHCR, and deploys to a VPS over SSH on every push to `main`. Routes for `content/posts/` are generated at image build time, so re-build the image after adding or editing posts. Like counts persist in the `blog-data` Docker named volume mounted at `/app/data` (created by the compose file the deploy script writes); deleting that volume resets all counts.

## Reference Documents

Read these before non-trivial work (all in Chinese; refreshed against the code in July 2026 — if they drift again, trust the code):
- [ai/CONTEXT.md](ai/CONTEXT.md) — project overview + constraints
- [ai/STYLE.md](ai/STYLE.md) — naming + file-org conventions
- [ai/PROMPTS.md](ai/PROMPTS.md) — workflow templates
- [ai/CHECKLIST.md](ai/CHECKLIST.md) — pre-delivery self-check
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — current route map, data flow, caching, SEO status (still-planned bits are marked)
- [docs/PRD.md](docs/PRD.md) — product scope with implementation status; [docs/ROADMAP.md](docs/ROADMAP.md) — milestones + unordered candidate pool
- [docs/WORKFLOW.md](docs/WORKFLOW.md) — how the docs/ and ai/ files link together
