English | [简体中文](./README.zh-CN.md)

# Personal Blog

A personal blog system built with Next.js App Router.

## Quick Start

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Type check
pnpm typecheck

# Lint
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## Core Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |

## Project Structure

```
├── app/              # Next.js App Router pages
├── docs/             # Project documentation
│   ├── PRD.md        # Product Requirements Document
│   ├── ARCHITECTURE.md   # Architecture documentation
│   ├── WORKFLOW.md   # Workflow guidelines
│   └── ROADMAP.md    # Roadmap
├── ai/               # AI-assisted development configuration
│   ├── CONTEXT.md    # Project overview + key constraints
│   ├── STYLE.md      # Code style guidelines
│   ├── PROMPTS.md    # Common prompt templates
│   └── CHECKLIST.md  # Self-review checklist
├── content/          # Content files
│   └── posts/        # Blog posts (Markdown)
├── public/           # Static assets
└── ...config files
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Auto-deploy

### Docker

Runs as a Next.js standalone app on port **3000**. Access via HTTP only: `http://<IP>:3000` (no Nginx/Caddy in this setup).

**Local verification**

```bash
docker compose build
docker compose up
# Open http://127.0.0.1:3000
docker compose down
```

**First deploy on a VPS**

1. Install Docker on the VPS ([install guide](https://docs.docker.com/engine/install/)).
2. Open port **3000** in the firewall and cloud security group.
3. Clone the repo and start:

```bash
git clone <your-repo-url> personal-blog
cd personal-blog
docker compose up -d --build
```

Visit `http://<VPS_PUBLIC_IP>:3000`.

**Update deployment**

```bash
cd personal-blog
git pull
docker compose up -d --build
```

Re-run `--build` after adding or editing files under `content/posts/` (routes are generated at image build time).

**View logs**

```bash
docker compose logs -f
```

**Stop the service**

```bash
docker compose down
```


### Self-hosted Server

```bash
pnpm build
pnpm start
```

**Environment Variables**: Configure `NEXT_PUBLIC_*` variables for deployment.
