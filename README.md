English | [简体中文](./README.zh-CN.md)

# Personal Blog

A personal blog system built with Next.js App Router.

## Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Core Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

## Project Structure

```
├── app/              # Next.js App Router pages
├── docs/             # Project documentation
│   ├── PRD.md        # Product Requirements Document
│   ├── ARCHITECTURE.md   # Architecture documentation
│   ├── WORKFLOW.md   # Workflow guidelines
│   ├── ROADMAP.md    # Roadmap
│   └── DECISIONS/    # Architecture Decision Records
├── ai/               # AI-assisted development configuration
│   ├── CONTEXT.md    # Project overview + key constraints
│   ├── STYLE.md      # Code style guidelines
│   ├── PROMPTS.md    # Common prompt templates
│   └── CHECKLIST.md  # Self-review checklist
├── content/          # Content files
│   ├── posts/        # Blog posts (Markdown)
│   └── pages/        # Standalone pages
├── public/           # Static assets
└── ...config files
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Auto-deploy

### Docker

```bash
docker build -t blog .
docker run -p 3000:3000 blog
```

### Self-hosted Server

```bash
npm run build
npm run start
```

**Environment Variables**: Configure `NEXT_PUBLIC_*` variables for deployment.
