# 代码风格规范

## ESLint / 类型检查

项目已配置 ESLint（未配置 Prettier），提交前确保通过检查：

```bash
pnpm lint
pnpm typecheck
```

## 命名规范

- **文件**：kebab-case，如 `post-card.tsx`、`post-meta.ts`
- **组件**：文件内导出 PascalCase 组件，如 `PostCard`、`SiteHeader`
- **函数**：camelCase，如 `formatLongDate`；Hook 以 `use` 开头
- **常量**：UPPER_SNAKE_CASE，如 `CATEGORIES`、`WORDS_PER_MINUTE`

## 文件组织

```
app/                  # 路由：页面、布局、route handlers
├── [slug]/           # 文章详情（TOC、点赞、逐文章社交图）
├── categories/       # 分类列表 + [slug] 分类详情
├── api/likes/        # 点赞接口
└── feed.xml/         # RSS
components/           # 共享组件（含 ui/ 下 shadcn 生成的组件）
lib/                  # 数据与工具：posts、markdown、post-meta、categories、i18n 等
styles/               # 由 globals.css @import 的全局样式
content/posts/        # 文章 Markdown
public/posts/<slug>/  # 文章配图
```

## 其他

- 组件文件不超过 200 行，超出则拆分
- 优先使用显式类型推导
