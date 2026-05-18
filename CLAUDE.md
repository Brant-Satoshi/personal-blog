# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **pnpm** (`packageManager: pnpm@10.25.0`). The README and CONTRIBUTING.md show `npm` commands — those are stale; use pnpm.

```bash
pnpm dev     # Next.js dev server
pnpm build   # Production build (also the most reliable "does this still compile" check)
pnpm start   # Run the production build
pnpm lint    # ESLint (script is bare `eslint`, which lints the whole project)
```

No `typecheck` or `test` script exists yet, despite README mentions and CI checking for them (`.github/workflows/ci.yml` runs them with `--if-present`, so they no-op). For type checks, run `pnpm exec tsc --noEmit`.

## Architecture

Static-ish blog: Markdown files in `content/posts/` are read at request/build time and rendered via Next.js App Router.

- **Framework**: Next.js **16.1.6** App Router + React 19. Note that several docs (`ai/CONTEXT.md`, `docs/ARCHITECTURE.md`) still say "Next.js 15" — the code is on 16.
- **Content pipeline**: [lib/posts.ts](lib/posts.ts) is the single source of truth for post loading. `getAllPosts()` lists post metadata (used by [app/page.tsx](app/page.tsx)); `getPostBySlug()` parses frontmatter with `gray-matter` and renders body with `marked`. Both read synchronously from `content/posts/*.md` via `node:fs` — they only work in Server Components / build context, never in client components.
- **Routes**: [app/page.tsx](app/page.tsx) (index/listing), [app/[slug]/page.tsx](app/[slug]/page.tsx) (post detail), [app/about/](app/about/). Adding a post = drop a `.md` file in `content/posts/` with `title`, `date`, `summary` frontmatter; no code change required.
- **Styling**: Tailwind CSS 4 with CSS-first config — there is **no `tailwind.config.*`**; theme lives in [app/globals.css](app/globals.css) via `@theme`. PostCSS uses `@tailwindcss/postcss`.
- **UI primitives**: shadcn/ui is wired up ([components.json](components.json): `new-york` style, `neutral` base, `lucide` icons). Generated components go in [components/ui/](components/ui/). Use `cn()` from [lib/utils.ts](lib/utils.ts) for class merging.
- **Path alias**: `@/*` resolves to the project root (see [tsconfig.json](tsconfig.json)), so `@/lib/posts` works from anywhere.

## Conventions

From [ai/CONTEXT.md](ai/CONTEXT.md) and [ai/STYLE.md](ai/STYLE.md) (both in Chinese):
- Default to Server Components; only add `"use client"` when interactivity requires it.
- Don't add jQuery, Bootstrap, or heavy form libraries. Keep dependencies minimal.
- No global stylesheets beyond `app/globals.css`; use Tailwind utilities.
- Component files target ≤200 lines; split if larger.

## Reference Documents

Read these before non-trivial work, but verify against current code — several are out of date:
- [ai/CONTEXT.md](ai/CONTEXT.md) — project overview, constraints (in Chinese; says Next.js 15)
- [ai/STYLE.md](ai/STYLE.md) — naming + file-org conventions (Chinese)
- [ai/PROMPTS.md](ai/PROMPTS.md) — workflow templates (Chinese)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — planned route map and SEO strategy (Chinese; describes routes like `archive/`, `robots.ts`, `sitemap.ts` that don't exist yet)
- [docs/PRD.md](docs/PRD.md), [docs/ROADMAP.md](docs/ROADMAP.md), [docs/DECISIONS/](docs/DECISIONS/) — product/decision context
