[English](./README.md) | 简体中文

# Personal Blog

一个基于 Next.js App Router 的个人博客系统。

## 快速开始

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 类型检查
pnpm typecheck

# Lint 检查
pnpm lint

# 构建生产版本
SITE_URL=http://localhost:3000 pnpm build

# 启动生产版本
pnpm start
```

## 核心命令

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm check` | 运行 ESLint、TypeScript 和测试 |
| `pnpm test` | 运行自动测试 |

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

以 Next.js standalone 方式运行在 **3000** 端口，仅通过 HTTP 访问：`http://<IP>:3000`（本方案不包含 Nginx/Caddy）。

**本地验证**

```bash
docker compose build
docker compose up
# 浏览器打开 http://127.0.0.1:3000
docker compose down
```

**VPS 首次部署**

1. 在 VPS 上安装 Docker（[安装说明](https://docs.docker.com/engine/install/)）。
2. 在防火墙与云安全组中放行 **3000** 端口。
3. 克隆仓库并启动：

```bash
git clone <你的仓库地址> personal-blog
cd personal-blog
docker compose up -d --build
```

浏览器访问 `http://<VPS公网IP>:3000`。

**更新部署**

```bash
cd personal-blog
git pull
docker compose up -d --build
```

新增或修改 `content/posts/` 下的 Markdown 后，必须带 `--build` 重新构建镜像（路由在构建时生成）。

**查看日志**

```bash
docker compose logs -f
```

**停止服务**

```bash
docker compose down
```


### 自建服务器

```bash
npm run build
npm run start
```

**环境变量**：部署时必须配置 `SITE_URL=https://你的域名`。`LIKES_DIR` 默认为项目下的 `data/`；Docker Compose 已配置持久卷。

`SITE_URL` 会在静态预渲染阶段写入 sitemap、robots、canonical、Open Graph 和 JSON-LD。Docker 构建通过 `--build-arg SITE_URL=...` 传入；GitHub 部署需要配置同名的 Repository Variable，缺失或不是生产 HTTPS 地址时 workflow 会直接失败。
