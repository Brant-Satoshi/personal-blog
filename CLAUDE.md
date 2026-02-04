# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Next.js 16 App Router. The project is in early stages with a planned blog architecture using Markdown content from `content/posts`.

## Commands

```bash
pnpm dev       # Start development server
pnpm build     # Build for production
pnpm start     # Start production server
pnpm lint      # Run ESLint
```

Note: This project uses **pnpm** as the package manager (version 10.25.0).

## Architecture

- **App Router**: Uses Next.js 16 App Router with routes defined in `app/` directory
- **Styling**: Tailwind CSS 4 with CSS-first configuration (see `app/globals.css`)
- **Fonts**: Geist Sans/Mono loaded via `next/font/google` (defined in `app/layout.tsx`)
- **Type Safety**: TypeScript with strict mode; paths alias `@/*` maps to project root

## Important Context Files

Before starting work, read these files for project-specific context:
- `ai/PROMPTS.md` - Contains reusable prompt templates and project-specific workflows
- `ai/CONTEXT.md` (if exists) - Additional context
- `ai/STYLE.md` (if exists) - Coding style guidelines
- `docs/PRD.md` (if exists) - Product requirements
- `docs/ARCHITECTURE.md` (if exists) - Architecture documentation

## Planned Features (from ai/PROMPTS.md)

- Markdown-based blog posts from `content/posts`
- Article detail pages at `app/[slug]`
- Frontmatter parsing with gray-matter
- SEO metadata for articles

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on PRs and main branch pushes:
- Linting via `pnpm lint`
- Type checking (if script present)
- Tests (if script present)
- Production build verification
