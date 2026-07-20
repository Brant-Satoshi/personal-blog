---
title: loops 入门：Claude Code 的 agentic loops
date: 2026-06-30
summary: Anthropic 这篇 Claude Code 文章的中文翻译：如何理解智能体循环，以及如何从基于回合的循环，逐步使用基于目标、基于时间和主动式循环。
category: Tools
tags: [Claude Code, Agents, Loops]
series: Claude Code 实践
featured: true
---

原文：[Getting started with loops](https://claude.com/blog/getting-started-with-loops)。作者是 Anthropic 的 Delba de Oliveira 和 Michael Segner。本文为中文翻译，图片来自原文。

现在有很多人在谈论“设计循环”，而不是单纯给你的编程智能体写提示词。如果你花点时间在 X 上试图弄清楚循环到底是什么，你会看到很多不同答案。

在 Claude Code 团队，我们把 `loops` **定义为：智能体重复执行工作周期，直到满足停止条件**。我们会根据以下维度区分几类不同的循环：

- 它们如何被触发
- 它们如何停止
- 使用了哪种 Claude Code 原语
- 每种循环最适合哪类任务

下面会介绍主要的循环类型、何时使用它们，以及如何在管理 token 使用量的同时保持代码质量。并不是所有任务都需要复杂循环；从最简单的方案开始，有选择地使用这些模式。

## 基于回合的循环（Turn-based loops）

![](/posts/getting-started-with-loops/turn-based-loops.png)

- **触发方式**：用户提示词。
- **停止条件**：Claude 判断任务已完成，或需要更多上下文。
- **最适合**：较短的任务，且这些任务不属于固定流程或定期计划。
- **使用量管理方式**：编写具体的提示词，并通过 skills 改进验证流程，减少回合数。

你发送的每一个提示词，都会启动一个由你逐回合引导的手动循环。Claude 会收集上下文、采取行动、检查自己的工作，必要时重复，然后回复你。我们称这为智能体循环(`agentic loop`)。

例如，你让 Claude 创建一个点赞按钮。它会读取你的代码、进行编辑、运行测试，然后交付一个它*认为*可用的结果。接着你手动检查这项工作，并写下下一条提示词。

你可以把手动验证步骤编码进 `SKILL.md`，从而改进验证环节，让 Claude 能够端到端地检查更多自己的工作。这应当包含一些工具或连接器，让 Claude 能够*看到*、*测量*或*交互*结果。检查越量化，Claude 就越容易自我验证。

例如，你可以在 `SKILL.md` 文件中指定：

```plaintext
---
name: verify-frontend-change
description: 在声明完成之前，端到端验证任何 UI 变更。
---

# 验证前端变更

绝不要仅仅因为编辑成功，就报告 UI 变更已完成。要像人工评审一样验证它：

1. 启动开发服务器，并在浏览器中打开被编辑的页面。

2. 直接与变更交互。对于新的控件（按钮、输入框、开关）：点击它，确认预期的状态变化，并截取前后对比截图。

3. 检查浏览器控制台：没有新的错误或警告。

4. 使用 Chrome DevTools MCP，运行性能追踪并审计 Core Web Vitals。

如果任何步骤失败，修复问题并从第 1 步重新运行；不要交付只经过部分验证的工作。
```

## 基于目标的循环（/goal）

![](/posts/getting-started-with-loops/goal-based-loops.png)

- **触发方式**：实时手动提示词。
- **停止条件**：目标达成，或达到最大回合数。
- **最适合**：拥有可验证退出条件的任务。
- **使用量管理方式**：设置具体完成标准和明确回合上限，例如“尝试 5 次后停止”。

有时，一个回合并不够，尤其是对于更复杂的任务。智能体在能够迭代时表现更好。你可以通过 `/goal` 定义“完成”的样子，从而延长 Claude 持续迭代的时间。

当你定义成功标准后，Claude 就不必自行判断什么叫“足够好”，也不会过早结束循环。每当 Claude 试图停止时，一个评估模型会检查你的条件，并在目标尚未满足时让它继续工作，直到目标达成或达到你定义的回合数。

这就是为什么确定性的标准非常有效，例如通过的测试数量，或达到某个分数阈值。

例如：

```plaintext
/goal 将首页 Lighthouse 分数提升到 90 或以上，尝试 5 次后停止。
```

## 基于时间的循环（/loop 和 /schedule）

- **触发方式**：指定的时间间隔。
- **停止条件**：你取消它，或工作完成（例如 PR 已合并、队列为空）。
- **最适合**：重复性工作，或与外部环境/系统交互。
- **使用量管理方式**：设置更长间隔，或基于事件而不是时间做出反应。

有些智能体工作是重复发生的：任务保持不变，只是输入发生变化。例如，每天早上总结 Slack 消息。另一些工作依赖外部系统，而与外部系统交互的一种简单方式，就是按时间间隔检查它，并根据变化做出反应。例如，一个可能收到代码评审意见或 CI 失败的 PR。

对于这类任务，你可以使用 `/loop` 触发 Claude 按间隔重新运行提示词。例如：

```plaintext
/loop 5m 检查我的 PR，处理评审评论，并修复失败的 CI
```

`/loop` 在你的电脑上运行，因此如果你关机，它就会停止。你可以通过创建 `/schedule` 例程，把这个循环迁移到云端。

## 主动式循环

![](/posts/getting-started-with-loops/proactive-loops.png)

- **触发方式**：事件或计划任务，不需要人类实时参与。
- **停止条件**：每个任务在目标达成时退出。例程本身会一直运行，直到你关闭它。
- **最适合**：定义清晰、持续出现的重复工作流：错误报告、issue 分流、迁移、依赖升级等。
- **使用量管理方式**：将例程路由给更小、更快的模型，并在需要判断时使用能力最强的模型。

上面的原语，加上 Claude Code 的其他功能，例如 **auto mode** 和 **dynamic workflows**（研究预览），可以组合成长时间运行工作的循环。

例如，为了处理不断进入的反馈，你可以使用：

1. **`/schedule`**（研究预览）运行一个例程，检查新的报告
2. **`/goal`** 定义完成标准，并用 **skills** 记录如何验证
3. **Dynamic workflows** 编排智能体，对每个报告进行分流、修复并评审修复
4. **Auto mode** 让例程运行时无需停下来请求权限

组合起来，一个提示词可以像这样：

```plaintext
/schedule every hour: 检查 #project-feedback 中的错误报告。/goal: 不要停止，直到本次运行中发现的每一条报告都完成分流、处理并回复。修复 bug 时，使用 workflow 在三个并行 worktree 中探索三种方案，并让一个 judge 对它们进行对抗式评审。
```

## 保持代码质量

循环输出的质量取决于它周围的系统。设计系统时：

- **保持代码库本身干净**：Claude 会遵循代码库中已有的模式和约定。
- **给 Claude 一种验证自己工作的方式**：用 [skills](https://code.claude.com/docs/en/skills) 编码你和团队对“好”的定义。
- **让文档易于访问**：框架和库的文档包含最新最佳实践。
- **使用第二个智能体做代码评审**：带有新上下文的评审者偏见更少，也不会受主智能体推理过程影响。你可以使用内置的 `/code-review` skill，或用于 GitHub 的 [Code Review](https://code.claude.com/docs/en/code-review)。

当某个单独结果没有达到标准时，不要只停留在修复这个单独问题上；试着把它编码进系统中，改善未来所有迭代。

## 管理 token 使用量

为了管理 token 使用量，循环应当有清晰边界：

- **为任务选择合适的原语和模型**：较小任务不需要多个智能体或循环。有些任务可以使用更便宜、更快的模型。
- **定义清晰的成功和停止标准**：明确“完成”是什么样子，让 Claude 更快到达解决方案（但不要太早停止）。
- **大规模运行前先试点**：Dynamic workflows 可能会生成数百个智能体。先在较小范围内评估使用量。
- **对确定性工作使用脚本**：运行脚本比推理每个步骤更便宜。例如，PDF skill 可以附带一个表单填写脚本，让 Claude 每次运行它，而不是每次重新推导代码。
- **不要比需要更频繁地运行例程**：让间隔匹配你监控对象的变化频率。
- **查看使用量**：`/usage` 命令会按 skills、subagents 和 MCPs 拆分最近使用量；不带参数的 `/goal` 会显示目前的回合数和 token 使用量；`/workflows` 会显示每个智能体的 token 使用量，并且你可以随时停止某个智能体。

## 入门建议

总结一下：

想开始使用循环，可以先看看你已经在做的工作。选择一个你自己是瓶颈的任务，然后问：哪一部分可以交给 Claude？你能写出验证检查吗？目标是否足够清晰？这项工作是否按计划到达？

有了想法后，运行这个循环，观察结果，例如它在哪里卡住、在哪里过度发挥，然后继续迭代它。

更多信息请阅读 Claude Code 文档中的[并行运行智能体](https://code.claude.com/docs/en/agents)，以及 [loop](https://code.claude.com/docs/en/goal)、[schedule](https://code.claude.com/docs/en/routines)、[goal](https://code.claude.com/docs/en/goal) 和 [dynamic workflows](https://code.claude.com/docs/en/workflows#orchestrate-subagents-at-scale-with-dynamic-workflows) 页面。

*本文由 Delba de Oliveira 和 Michael Segner 撰写。*

## 相关文章

探索更多产品新闻，以及面向使用 Claude 构建应用的团队的最佳实践。

### Claude Fable 5 实地指南：发现你的未知项

2026 年 7 月 6 日  
Claude Code  
[A field guide to Claude Fable 5: Finding your unknowns](https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns)

### 每个任务都有一个执行框架：Claude Code 中的 dynamic workflows

2026 年 6 月 2 日  
Claude Code  
[A harness for every task: dynamic workflows in Claude Code](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code)

### 用 AI 进行 COBOL 现代化：打破成本壁垒

2026 年 2 月 23 日  
Claude Code  
[COBOL Modernization with AI: Breaking the Cost Barrier](https://claude.com/blog/how-ai-helps-break-cost-barrier-cobol-modernization)

### 使用 Claude Agent SDK 构建智能体

2025 年 9 月 29 日  
Claude Code  
[Building agents with the Claude Agent SDK](https://claude.com/blog/building-agents-with-the-claude-agent-sdk)
