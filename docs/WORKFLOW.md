# 工作流联动说明（vibe coding 版本）

本项目采用“轻约束 + 快迭代”的 vibe coding 工作流。关键在于让 `docs/` 和 `ai/` 形成可执行的约束与记忆，避免每次重启都重新解释目标。

## 文件职责与联动关系

- `docs/PRD.md`：定义做什么/不做什么，功能范围的最终依据。
- `docs/ARCHITECTURE.md`：目标架构蓝图，用于对照“现在在哪、还缺什么”。
- `docs/ROADMAP.md`：阶段性目标与里程碑，指导迭代顺序。
- `docs/WORKFLOW.md`：流程规范与协作约定（本文）。

- `ai/CONTEXT.md`：AI 的项目约束（路由、样式、数据源、禁用依赖等）。
- `ai/STYLE.md`：编码风格与组织规范。
- `ai/PROMPTS.md`：高频任务的“起手式”，保证指令质量一致。
- `ai/CHECKLIST.md`：落地后验收的最低标准。

## 具体使用方式

1) 发指令前，先对齐：`docs/PRD.md` 与 `docs/ARCHITECTURE.md`。  
2) 执行改动时，遵守：`ai/CONTEXT.md` 与 `ai/STYLE.md`。  
3) 交付前，自检：`ai/CHECKLIST.md`。  
4) 高频需求，沉淀为：`ai/PROMPTS.md` 的模板。  

## 最小指令模板（示例）

```
用 Next.js App Router 做最小博客：
首页文章列表、/[slug] 详情、/about。
文章来自 content/posts/*.md，含 frontmatter：title/date/summary。
先能 build，样式极简。
```

## 变更记录建议

- 需求变更 → 更新 `docs/PRD.md`
- 架构调整 → 更新 `docs/ARCHITECTURE.md`
- 新的高频任务 → 更新 `ai/PROMPTS.md`
