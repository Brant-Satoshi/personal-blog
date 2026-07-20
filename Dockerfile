FROM node:22-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
ARG SITE_URL
ENV SITE_URL=$SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node -e 'const value=process.env.SITE_URL; if (!value) throw new Error("SITE_URL build argument is required"); const url=new URL(value); if (!/^https?:$/.test(url.protocol)) throw new Error("SITE_URL must use http or https")' \
  && pnpm build

FROM node:22-alpine AS runner
WORKDIR /app

ARG SITE_URL
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV SITE_URL=$SITE_URL

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Writable data dir (like counts); a named volume mounts here and inherits
# this ownership on first use.
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
