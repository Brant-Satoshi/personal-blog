# 架构文档

## 技术栈选择

| 领域 | 选择 | 理由 |
|------|------|------|
| 框架 | Next.js 16 | App Router、SSR、良好生态 |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS 4 | 原子化 CSS、CSS-first 配置（无 tailwind.config） |
| 内容 | Markdown | 简单、版本友好、Git 协作 |
| 部署 | VPS + Docker | 构建镜像推送到 GHCR，SSH 部署到 VPS（standalone 服务，端口 3000） |

## 路由结构（现状）

```
app/
├── page.tsx                    # 首页 / 文章列表
├── layout.tsx                  # 根布局（读 locale cookie、注入主题脚本、渲染页眉页脚）
├── globals.css                 # 全局样式（@import styles/markdown.css、styles/code-blocks.css）
├── robots.ts                   # robots.txt
├── sitemap.ts                  # sitemap.xml
├── feed.xml/route.ts           # RSS 订阅
├── opengraph-image.tsx         # 站点级社交图（twitter-image.tsx 同）
├── about/page.tsx              # 关于页 /about
├── categories/page.tsx         # 分类列表 /categories
├── categories/[slug]/page.tsx  # 分类下文章 /categories/[slug]
├── api/likes/[slug]/route.ts   # 点赞接口（POST 自增并返回总数）
└── [slug]/page.tsx             # 文章详情 /[slug]（TOC、点赞、逐文章社交图）
```

规划中、尚未实现：`archive/` 归档页。

## 数据流

```
用户请求 → App Router（全部按需 SSR）→ lib/posts.ts 读取 content/posts/*.md
        → gray-matter 解析 frontmatter → lib/markdown.ts 渲染
          （marked + shiki 双主题高亮 + mermaid 占位 + code group 合并）
        → 页面输出（复制按钮、语言切换、mermaid 由客户端组件水合）
```

### 读取逻辑

1. `content/posts/*.md` 存储文章，一个文件一篇（中文翻译是独立文章）
2. 文章配图放 `public/posts/<slug>/`
3. 同步读盘，包在 React `cache()` 中；生产环境另有模块级缓存（文章文件构建时打进镜像，改内容需重新构建镜像）

## 内容管理

- **来源**：本地 Markdown 文件（`content/posts/`）
- **格式**：纯 Markdown（marked 渲染，不支持 MDX；支持 mermaid 代码块与相邻多语言代码块合并成 code group）
- **Frontmatter**：
  ```yaml
  title: 文章标题        # 必填
  date: 2026-01-01      # 必填
  summary: 摘要          # 必填，列表与 SEO description 使用
  excerpt: 首段节选      # 可选，缺省时从正文自动提取
  category: Tools       # 可选，需匹配 lib/categories.ts 中分类的英文 name（大小写不敏感）
  updated: 2026-02-01   # 可选，最近更新日期
  ```

## 缓存策略（现状）

| 层 | 做法 |
|------|----------|
| 渲染 | 全部路由按需 SSR：根布局读取 locale cookie，因此没有 SSG/ISR，也没有 generateStaticParams |
| 进程内 | React cache() 做请求内去重；生产环境用模块级缓存保存解析结果 |
| HTTP | feed.xml 设置 `s-maxage=3600` + `stale-while-revalidate`；静态资源走浏览器缓存 |

## SEO 策略

- **已实现**：
  - 每个页面唯一 `<title>` 和 `<meta name="description">`；语义化标签（`<article>`、`<header>`、`<main>`）
  - `robots.txt`、`sitemap.xml`、RSS（`/feed.xml`）
  - JSON-LD Article Schema（文章页）
  - Open Graph / Twitter Card；站点级与逐文章社交图（`next/og` 生成）
  - 字体优化（`next/font`）；mermaid 按需动态导入
- **未实现**：
  - BreadcrumbList Schema
  - 正文图片走 `next/image`（目前 Markdown 图片是原生 `<img>`）
