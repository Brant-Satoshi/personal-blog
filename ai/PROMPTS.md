# 常用指令模板


## Global Rules (Always Follow)

```
Read context first
Before doing anything, read: docs/PRD.md, docs/ARCHITECTURE.md, ai/CONTEXT.md, ai/STYLE.md.
```

## 新增文章

```
在 content/posts/ 新建 <slug>.md：
1. frontmatter：title、date、summary 必填；excerpt、category、updated 可选
2. category 需匹配 lib/categories.ts 中某个分类的英文 name（大小写不敏感）
3. 配图放 public/posts/<slug>/，正文以 /posts/<slug>/xxx.png 引用
4. 无需改代码；生产环境重新构建镜像后生效
```

## 添加新功能

```
请为博客添加 [功能描述]，需要：
1. 在合适位置创建组件
2. 添加必要的类型定义
3. 编写样式（使用 Tailwind）
4. 确保响应式兼容
```

## 代码重构

```
请重构 [组件/函数名]：
1. 提取可复用的逻辑到 Hook
2. 简化条件判断
3. 优化类型定义
4. 保持功能不变
```

## 修复 Bug

```
[描述问题]：发生时点击 [按钮/链接]，[期望行为] 但实际 [实际行为]
请定位问题并修复
```
