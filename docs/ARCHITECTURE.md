# 架构文档

## 技术栈

- Next.js 16 App Router、React 19、TypeScript
- Tailwind CSS 4 与少量文章交互样式
- Markdown + gray-matter；Zod 校验 Frontmatter
- marked、Shiki、Mermaid
- Vitest
- Next.js standalone Docker 镜像

## 数据流

```text
content/posts/*.md
  → Frontmatter 严格校验
  → 构建期生成文章、分类、标签、系列、分页和搜索索引
  → 静态页面 / RSS / sitemap / 社交分享图
```

文章页面静态生成；点赞 API 是动态路由，计数在客户端按需获取。全文搜索索引由 `/search-index.json` 静态生成，只有打开搜索框时才下载。

## 路由

- `/`、`/page/[page]`：文章列表与分页
- `/[slug]`：文章详情
- `/archive`：年份归档
- `/categories`、`/categories/[slug]`
- `/tags`、`/tags/[slug]`
- `/series`、`/series/[slug]`
- `/about`
- `/api/likes/[slug]`、`/feed.xml`、`/search-index.json`

## Frontmatter

```yaml
title: 标题
date: 2026-07-18
summary: 摘要
category: Tools
tags: [Claude Code, Agents]
series: Claude Code 实践
updated: 2026-07-19
draft: false
featured: true
```

`title`、`date`、`summary` 必填；分类必须来自分类配置；`updated` 不能早于发布日期。无效内容会让测试或生产构建失败。

## 部署状态

页面构建不访问 Google Fonts。`SITE_URL` 是构建期必需配置，因为 sitemap、robots、canonical、Open Graph 与 JSON-LD 会静态预渲染。Dockerfile 通过 `ARG SITE_URL` 将其传给 builder，并在 runner 保留相同值供 RSS 等动态路由使用；部署 workflow 从 GitHub Repository Variable `SITE_URL` 读取并校验生产 HTTPS 域名。Docker Compose 将点赞数据挂载到命名卷 `blog-likes`。
