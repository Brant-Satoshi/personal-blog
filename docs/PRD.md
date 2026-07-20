# 产品需求文档

## 产品定位

面向技术社区读者的中文个人博客，以版本化 Markdown 管理内容，强调长文阅读、搜索、分享、SEO 与低运维成本。

## 核心页面

| 页面 | 路径 | 描述 |
|------|------|------|
| 首页 | `/`、`/page/[page]` | 文章列表（分页）、分类入口、精选文章 |
| 文章详情 | `/[slug]` | 正文、目录、点赞、相关文章、前后篇、社交分享图 |
| 分类 | `/categories`、`/categories/[slug]` | 分类列表与分类下文章 |
| 标签 / 系列 | `/tags`、`/tags/[slug]`、`/series`、`/series/[slug]` | 标签与系列索引及详情 |
| 归档 | `/archive` | 按年份归档 |
| 关于 | `/about` | 个人介绍、联系方式 |

## 已实现

- Markdown、代码高亮、代码组、Mermaid、文章目录
- 首页分页、年份归档、分类、标签、系列、相关文章、前后篇
- 按需全文搜索与关键词高亮
- 深色模式、响应式导航、阅读进度、图片灯箱、复制链接
- 全局点赞计数（Docker 持久卷）
- sitemap、robots、RSS 全文、Open Graph、Twitter Card、Article JSON-LD
- 构建期 Frontmatter 校验与自动测试

## 明确不做

- 登录注册、复杂 CMS、广告和付费阅读
- 在没有真实翻译文章前提供仅翻译导航的“伪双语”界面
- 依赖客户端实时推送的复杂评论系统

## 成功指标

1. LCP < 2.5s、CLS < 0.1
2. 生产构建、ESLint、TypeScript、测试全部通过
3. 发布时不存在失效本地图片或无效 Frontmatter
4. Lighthouse Accessibility > 90
