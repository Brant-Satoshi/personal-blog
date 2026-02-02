[English](./README.md) | 简体中文

# Personal Blog

一个基于 Next.js App Router 的个人博客系统。

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 类型检查
npm run type-check

# Lint 检查
npm run lint

# 构建生产版本
npm run build

# 启动生产版本
npm start
```

## 核心命令

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint |
| `npm run type-check` | 运行 TypeScript 类型检查 |

## 目录结构

```
├── app/              # Next.js App Router 页面
├── docs/             # 项目文档
│   ├── PRD.md        # 产品需求文档
│   ├── ARCHITECTURE.md   # 架构文档
│   ├── WORKFLOW.md   # 工作流规范
│   ├── ROADMAP.md    # 路线图
│   └── DECISIONS/    # 技术决策记录
├── ai/               # AI 辅助开发配置
│   ├── CONTEXT.md    # 项目概览 + 关键约束
│   ├── STYLE.md      # 代码风格规范
│   ├── PROMPTS.md    # 常用指令模板
│   └── CHECKLIST.md  # 自检清单
├── content/          # 内容文件
│   ├── posts/        # 博客文章 (Markdown)
│   └── pages/        # 独立页面
├── public/           # 静态资源
└── ...配置文件
```

## 部署方式

### Vercel（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 自动部署

### Docker

```bash
docker build -t blog .
docker run -p 3000:3000 blog
```

### 自建服务器

```bash
npm run build
npm run start
```

**环境变量**：部署时需配置 `NEXT_PUBLIC_*` 相关变量。
