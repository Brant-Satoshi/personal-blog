# 架构文档

## 技术栈

| 领域 | 选择 | 理由 |
|------|------|------|
| 框架 | Next.js 16 (App Router) + React 19 | 全静态预渲染、良好生态 |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS 4 | 原子化 CSS、CSS-first 配置（无 tailwind.config） |
| 内容 | Markdown + gray-matter | 简单、版本友好、Git 协作 |
| 校验 | Zod | Frontmatter 严格校验，坏数据在构建期失败 |
| 渲染 | marked、Shiki、Mermaid | 定制渲染器、双主题高亮、图表 |
| 测试 | Vitest | 内容、点赞、markdown 管线的自动测试 |
| 部署 | VPS + Docker | standalone 镜像推送 GHCR，SSH 部署到 VPS（端口 3000） |

## 数据流

```text
content/posts/*.md
  → Frontmatter 严格校验
  → 构建期生成文章、分类、标签、系列、分页和搜索索引
  → 静态页面 / RSS / sitemap / 社交分享图
```

文章页面静态生成；点赞 API 是动态路由，计数在客户端按需获取。全文搜索索引由 `/search-index.json` 静态生成，只有打开搜索框时才下载。复制按钮、code group 切换、mermaid 渲染与图片灯箱由客户端组件在文章页水合。

## 内容存储

1. `content/posts/*.md` 存储文章，一个文件一篇（中文翻译是独立文章）
2. 文章配图放 `public/posts/<slug>/`
3. 同步读盘，包在 React `cache()` 中；生产环境另有模块级缓存（文章文件构建时打进镜像，改内容需重新构建镜像）

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
excerpt: 首段节选（可选，缺省时从正文自动提取）
category: Tools
tags: [Claude Code, Agents]
series: Claude Code 实践
updated: 2026-07-19
draft: false
featured: true
```

`title`、`date`、`summary` 必填；分类必须来自分类配置；`updated` 不能早于发布日期。无效内容会让测试或生产构建失败。

## SEO 待办

- BreadcrumbList Schema 未实现
- 正文图片是原生 `<img>`（懒加载 + 灯箱），未走 `next/image`

## 部署状态

页面构建不访问 Google Fonts。`SITE_URL` 是构建期必需配置，因为 sitemap、robots、canonical、Open Graph 与 JSON-LD 会静态预渲染。Dockerfile 通过 `ARG SITE_URL` 将其传给 builder，并在 runner 保留相同值供 RSS 等动态路由使用；部署 workflow 从 GitHub Repository Variable `SITE_URL` 读取并校验生产 HTTPS 域名。Docker Compose 将点赞数据挂载到命名卷 `blog-likes`。
