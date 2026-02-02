# 架构文档

## 技术栈选择

| 领域 | 选择 | 理由 |
|------|------|------|
| 框架 | Next.js 15 | App Router、SSR、良好生态 |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS | 原子化 CSS、开发效率高 |
| 内容 | Markdown | 简单、版本友好、Git 协作 |
| 部署 | Vercel | 零配置、边缘网络 |

## 路由结构

```
app/
├── page.tsx              # 首页 / 文章列表
├── layout.tsx            # 根布局
├── globals.css           # 全局样式
├── robots.ts             # robots.txt
├── sitemap.ts            # sitemap.xml
├── archive/
│   └── page.tsx          # 归档页 /archive
├── about/
│   └── page.tsx          # 关于页 /about
└── [slug]/
    └── page.tsx          # 文章详情页 /[slug]
```

## 数据流

```
用户请求 → Next.js (SSR/SSG) → 读取 Markdown → 解析 Frontmatter → 渲染页面
```

### 读取逻辑

1. `content/posts/*.md` 存储文章
2. `content/pages/*.md` 存储独立页面
3. 构建时读取文件列表，生成静态路由

## 内容管理

- **来源**：本地 Markdown 文件 (`content/` 目录)
- **格式**：MDX（可选，支持 React 组件）
- **Frontmatter**：
  ```yaml
  title: 文章标题
  date: 2024-01-01
  tags: [tag1, tag2]
  description: SEO description
  draft: false
  ```

## 缓存策略

| 策略 | 适用场景 |
|------|----------|
| ISR (Incremental Static Regeneration) | 文章列表、详情页 |
| 静态生成 (SSG) | 首页、归档页 |
| 浏览器缓存 | 静态资源 (public/) |

```typescript
// ISR 示例
export const revalidate = 3600 // 1 小时重新生成
```

## SEO 策略

- **基础**：
  - 每个页面唯一 `<title>` 和 `<meta name="description">`
  - 语义化标签 (`<article>`, `<header>`, `<main>`)
  - `robots.txt` 和 `sitemap.xml`

- **结构化数据**：
  - JSON-LD Article Schema
  - BreadcrumbList Schema

- **性能优化**：
  - 字体优化 (`next/font`)
  - 图片优化 (`next/image`)
  - 懒加载

- **Open Graph**：
  - og:image
  - og:title
  - og:description
  - twitter:card
