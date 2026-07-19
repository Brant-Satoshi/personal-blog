# 项目概览

这是一个个人博客项目，采用 Next.js App Router 构建。

## 核心约束

- **路由规范**：使用 Next.js App Router，页面组件放在 `app/` 目录下，默认 Server Components，只有需要交互才用 "use client"
- **包管理**：统一使用 pnpm，不要用 npm/yarn
- **禁止引入的库**：不要引入 jQuery、不必要的 UI 库（如 Bootstrap）、复杂的表单库
- **样式方案**：使用 Tailwind CSS 4（CSS-first 配置，无 `tailwind.config.*`）；全局样式集中在 `app/globals.css` 及其 `@import` 的 `styles/*.css`，不要新增全局样式文件
- **数据源**：文章以 Markdown 文件存储在 `content/posts/`，一个 `.md` 就是一篇文章（中文翻译也是独立文章）；配图放 `public/posts/<slug>/`
- **SEO**：metadata、`sitemap.ts`、`robots.ts`、RSS（`/feed.xml`）与社交图片均已启用，调整路由时需同步维护

## 技术栈

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- Markdown (内容管理)
