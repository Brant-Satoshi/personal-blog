# 项目概览

这是一个个人博客项目，采用 Next.js App Router 构建。

## 核心约束

- **路由规范**：使用 Next.js App Router，页面组件放在 `app/` 目录下，默认 Server Components，只有需要交互才用 "use client"
- **禁止引入的库**：不要引入 jQuery、不必要的 UI 库（如 Bootstrap）、复杂的表单库
- **样式方案**：使用 Tailwind CSS；文章渲染器与交互动画使用拆分后的全局样式
- **数据源**：内容以 Markdown 文件形式存储在 `content/` 目录
- **SEO**：metadata、sitemap.ts、robots.ts 是否启用

## 技术栈

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Markdown (内容管理)
- Zod (Frontmatter 校验)
- Vitest (自动测试)
