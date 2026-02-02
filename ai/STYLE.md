# 代码风格规范

## ESLint / Prettier

项目已配置 ESLint 和 Prettier，提交前确保通过检查：

```bash
npm run lint
```

## 命名规范

- **组件**：PascalCase，如 `BlogCard.tsx`
- **Hook**：camelCase 以 `use` 开头，如 `usePosts.ts`
- **工具函数**：camelCase，如 `formatDate.ts`
- **常量**：UPPER_SNAKE_CASE 或 camelCase
- **文件**：kebab-case 用于配置文件，如 `next.config.ts`

## 文件组织

```
app/
├── page.tsx          # 路由入口
├── layout.tsx        # 布局组件
├── globals.css       # 全局样式
└── [slug]/           # 动态路由
    └── page.tsx
```

## 其他

- 组件文件不超过 200 行，超出则拆分
- 优先使用显式类型推导
