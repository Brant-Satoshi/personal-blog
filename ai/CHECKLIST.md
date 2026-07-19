# 自检清单

## 代码质量

- [ ] TypeScript 类型检查通过 (`pnpm typecheck`)
- [ ] ESLint 检查通过 (`pnpm lint`)
- [ ] 生产构建通过 (`pnpm build`)
- [ ] 无未使用的变量或导入
- [ ] 无 `any` 类型滥用

## 功能验证

- [ ] 页面可正常访问 (200 OK)
- [ ] 链接无死链 (404)
- [ ] 响应式布局在移动端正常
- [ ] 深色模式切换正常（如适用）
- [ ] 中英文两种语言下 UI 文案正常（如适用）

## SEO 基本项

- [ ] 每个页面有唯一的 `<title>`
- [ ] 每个页面有 `<meta name="description">`
- [ ] 图片有 `alt` 属性
- [ ] 语义化标签使用正确 (header/main/footer/article)
- [ ] 新路由已加入 `app/sitemap.ts`（如适用）

## 性能

- [ ] 无大型未优化图片
- [ ] 动态导入已用于大组件（如适用）
