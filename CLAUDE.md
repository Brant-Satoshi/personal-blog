# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (`packageManager: pnpm@11.1.3`). The README and CONTRIBUTING.md show `npm` commands and a `type-check` script — those are stale; use pnpm and the script names below.

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

- **Framework**: Next.js **16.1.6** App Router + React 19. Several docs (`ai/CONTEXT.md`, `docs/ARCHITECTURE.md`) still say "Next.js 15" — the code is on 16.
- **Content pipeline**: [lib/posts.ts](lib/posts.ts) is the single source of truth for post loading. `getAllPosts()` returns sorted `PostMeta`; `getPostBySlug()` parses frontmatter with `gray-matter` and renders the body with `marked`. During render it also builds a table of contents (`h2`/`h3` headings get slugified `id`s) and auto-extracts an excerpt when frontmatter omits one. Both functions read synchronously from disk via `node:fs` — they only work in Server Components / build context, never in client components.
- **Categories**: [lib/categories.ts](lib/categories.ts) defines a fixed `CATEGORIES` array (slug + bilingual name/description + lucide icon). A post joins a category by its `category` frontmatter string, matched case-insensitively against the category's English `name`. Categories are not derived from posts — editing the taxonomy means editing this file.
- **i18n**: [lib/i18n.ts](lib/i18n.ts) drives English/Chinese. Locale is **cookie-based** (`locale` cookie, values `en`/`zh`, default `en`) — there are **no `/en` or `/zh` route prefixes**. `getLocale()` reads the cookie (async, Server Components only); `getDict(locale)` returns the typed translation `Dict`. The `LanguageToggle` client component writes the cookie and calls `router.refresh()`. All UI strings live in the `en`/`zh` dicts in this file; categories carry their own `nameZh`/`descriptionZh`.
- **Theme**: dark mode toggles a `.dark` class on `<html>`. [app/layout.tsx](app/layout.tsx) injects an inline no-flash script that applies the class from `localStorage.theme` (or `prefers-color-scheme`) before paint; `ThemeToggle` is a client component that updates both.
- **Routes**: [app/page.tsx](app/page.tsx) (index/listing), [app/[slug]/page.tsx](app/[slug]/page.tsx) (post detail, with [table-of-contents.tsx](app/[slug]/table-of-contents.tsx)), [app/about/](app/about/), [app/categories/page.tsx](app/categories/page.tsx) (category listing) and [app/categories/[slug]/page.tsx](app/categories/[slug]/page.tsx) (per-category posts). Shared chrome (`SiteHeader`/`SiteFooter`) lives in [components/site-shell.tsx](components/site-shell.tsx).
- **Styling**: Tailwind CSS 4 with CSS-first config — there is **no `tailwind.config.*`**; the theme (custom tokens like `ink`, `azure`, `pink`, `paper`) lives in [app/globals.css](app/globals.css) via `@theme`. PostCSS uses `@tailwindcss/postcss`.
- **UI primitives**: shadcn/ui is wired up ([components.json](components.json): `new-york` style, `neutral` base, `lucide` icons). Generated components go in [components/ui/](components/ui/). Use `cn()` from [lib/utils.ts](lib/utils.ts) for class merging.
- **Path alias**: `@/*` resolves to the project root (see [tsconfig.json](tsconfig.json)), so `@/lib/posts` works from anywhere.

## Conventions

From [ai/CONTEXT.md](ai/CONTEXT.md) and [ai/STYLE.md](ai/STYLE.md) (both in Chinese):
- Default to Server Components; only add `"use client"` when interactivity requires it.
- Don't add jQuery, Bootstrap, or heavy form libraries. Keep dependencies minimal.
- No global stylesheets beyond `app/globals.css`; use Tailwind utilities.
- Component files target ≤200 lines; split if larger.

## Deployment

`next.config.ts` sets `output: "standalone"`; the app runs as a Next.js standalone server on port **3000** (no Nginx/Caddy). [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds a Docker image, pushes it to GHCR, and deploys to a VPS over SSH on every push to `main`. Routes for `content/posts/` are generated at image build time, so re-build the image after adding or editing posts.

## Reference Documents

Read these before non-trivial work, but verify against current code — several are out of date:
- [ai/CONTEXT.md](ai/CONTEXT.md) — project overview, constraints (in Chinese; says Next.js 15)
- [ai/STYLE.md](ai/STYLE.md) — naming + file-org conventions (Chinese)
- [ai/PROMPTS.md](ai/PROMPTS.md) — workflow templates (Chinese)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — planned route map and SEO strategy (Chinese; describes routes like `archive/`, `robots.ts`, `sitemap.ts` that don't exist yet)
- [docs/PRD.md](docs/PRD.md), [docs/ROADMAP.md](docs/ROADMAP.md), [docs/DECISIONS/](docs/DECISIONS/) — product/decision context
