---
title: 每个任务都有一个执行框架：Claude Code 中的 dynamic workflows
date: 2026-06-02
summary: Anthropic 这篇 Claude Code 文章的中文翻译：Claude Code 现在可以按需编写并编排自己的多智能体执行框架。本文解释 dynamic workflows 的工作方式，以及最值得使用的模式。
category: Tools
---

原文：[A harness for every task: dynamic workflows in Claude Code](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code)。作者是 Anthropic 的 Thariq Shihipar 和 Sid Bidasaria。本文为中文翻译，图片来自原文。

上周，我们在 Claude Code 中发布了 [dynamic workflows](https://code.claude.com/docs/en/workflows)。现在，Claude 可以按需编写自己的 [harness](https://code.claude.com/docs/en/glossary#agentic-harness)，也就是为当前任务量身定制的执行框架。

默认的 Claude Code harness 是为编码而构建的，但它也适用于许多其他类型的任务。事实证明，很多任务都和编码任务很像。不过也有一些任务类型，为了达到最佳表现，我们过去不得不在 Claude Code 之上构建自定义 harness，比如 [Research](https://support.claude.com/en/articles/11088861-using-research-on-claude)、[安全分析](https://support.claude.com/en/articles/11932705-automated-security-reviews-in-claude-code)、[agent teams](https://code.claude.com/docs/en/agent-teams)，或 [Code Review](https://code.claude.com/docs/en/code-review)。

Workflows 让你可以在 Claude Code 之上动态创建 harness，使 Claude 能够更自然地解决这些问题。你也可以把这些 workflows 分享给他人并复用。

在这篇文章中，我会介绍自己早期使用 workflows 的经验和学习心得，帮助你更充分地利用它们。请记住，最佳实践仍在形成中：dynamic workflows 通常会使用更多 token，更适合复杂、高价值的任务。

## 示例提示词

在进入技术细节之前，我想先给出几个示例提示词，帮助你想象 workflows 的可能性：

> 这个测试大约每运行 50 次会失败 1 次。设置一个 workflow 来复现它。形成几个关于竞态条件的竞争性假设，并且不要停止，直到其中一个假设经受住证据检验。

> 使用 workflow，回顾我最近 50 个会话，挖掘我反复纠正的问题，并把重复出现的问题转成 `CLAUDE.md` 规则。

> 用 workflow 翻查过去六个月 Slack 里的 `#incidents`，找出那些反复出现但还没人建 ticket 的根因。

> 拿我的商业计划做一个 workflow，让不同 agent 分别从投资人、客户和竞争对手视角来拆解它。

> 这里有一个包含 80 份简历的文件夹，用 workflow 按后端岗位要求给它们排序，并复核前 10 名。使用 AskUserQuestion 工具采访我，确定评分标准。

> 我需要给这个 CLI 工具起名。用 workflow 头脑风暴一批候选名称，并通过锦标赛选出前 3 个。

> 使用 workflow，把我们的 User model 在所有地方重命名为 Account。

> 用 workflow 检查我的博客文章草稿，并对照代码库验证每一个技术论断。我不想发布任何错误内容。

## Dynamic workflows 如何工作

Dynamic workflows 会执行一个 JavaScript 文件，并提供几个特殊函数，帮助生成和协调 [subagents](https://code.claude.com/docs/en/sub-agents)：

![](/posts/a-harness-for-every-task-dynamic-workflows-in-claude-code/workflow-functions.png)

Dynamic workflows 也包含标准 JavaScript 函数，例如 JSON、Math 和 Array，用来帮助处理数据。

尤其有用的一点是，dynamic workflows 可以决定某个 agent 使用哪个模型，以及 subagents 是否在自己的 worktree 中运行。这样，Claude 就能根据需要选择合适的智能水平和隔离程度。

如果 workflow 被中断，例如用户操作导致中断，或终端退出，恢复会话后 workflow 可以从中断处继续。

## 为什么需要 dynamic workflows

当你让默认 Claude Code harness 执行一个任务时，它需要在同一个上下文窗口中同时规划和执行。对于很多编码任务来说，这非常有效，但对于长时间运行、大规模并行、高度结构化，或者带有对抗性质的任务，这种方式可能会失效。

原因是，当 Claude 在单一上下文窗口中处理复杂任务的时间越长，它越容易受到几类特定失败模式的影响：

- **Agentic laziness**：指 Claude 在完成一个特别复杂、由多个部分组成的任务之前就停下来，并在只取得部分进展后宣称工作已完成。例如，在安全评审中处理了 50 个条目中的 35 个就停止。
- **Self-preferential bias**：指 Claude 倾向于偏好自己的结果或发现，尤其是在被要求根据评分标准验证或评判这些结果时。
- **Goal drift**：指随着许多回合的推进，尤其是在上下文压缩之后，Claude 会逐渐偏离原始目标。每次总结都会损失信息，边界情况要求或“不要做 X”这类约束可能会丢失。

创建 workflow 可以通过编排彼此独立的 Claude subagents 来对抗这些问题。每个 subagent 都有自己的上下文窗口，以及聚焦、隔离的目标。

## Dynamic workflows 与 static workflows

你以前可能已经用 Claude Agent SDK 或 `claude -p` 创建过 static workflow，用来协调多个 Claude Code 实例。

但由于 static workflows 需要覆盖所有边界情况，它们通常更通用。借助 [Claude Opus 4.8](https://www.anthropic.com/news/claude-opus-4-8) 和 dynamic workflows，现在 Claude 已经足够聪明，可以为你的具体用例编写量身定制的 harness。

![](/posts/a-harness-for-every-task-dynamic-workflows-in-claude-code/static-vs-dynamic-workflows.png)

## 使用 dynamic workflows 的有用模式

你可以直接让 Claude 创建一个 workflow，或者使用触发词 `ultracode`，确保 Claude Code 创建 workflow。

不过，建立一个关于 dynamic workflows 如何工作的心智模型，会帮助你理解什么时候该使用它们，以及如何通过提示词引导 Claude。

Claude 在构建 workflows 时，可能会使用并组合以下几种常见模式：

![](/posts/a-harness-for-every-task-dynamic-workflows-in-claude-code/patterns-overview.png)

### 分类并执行

使用一个分类 agent 判断任务类型，然后根据任务路由到不同的 agent 或行为。也可以在最后使用分类器来判断输出。

### 扇出并综合

把一个任务拆成许多更小的步骤，在每个步骤上运行一个 agent，然后综合这些结果。这在有大量小步骤，或者每个步骤都需要独立干净的上下文窗口以避免相互干扰、交叉污染时特别有用。综合步骤是一道屏障：它会等待所有扇出的 agents 完成，然后把它们的结构化输出合并成一个结果。

### 对抗式验证

对于每个生成出来的 agent，再运行一个独立生成的 agent，根据评分标准或条件，对它的输出进行对抗式验证。

### 生成并过滤

围绕某个主题生成一批想法，然后通过评分标准或验证来过滤它们，去除重复项，只返回质量最高、经过测试的想法。

### 锦标赛

不是把工作拆分，而是让 agents 竞争。生成 N 个 agents，让它们分别用不同方法尝试同一个任务。然后通过评审 agent，以两两比较的方式评判提示词或模型的结果，直到选出胜者。

### 循环直到完成

对于工作量未知的任务，不要固定运行若干轮，而是循环生成 agents，直到满足停止条件，例如没有新的发现，或日志中不再有错误。

## 使用场景

你可以更有创造力地思考何时以及如何让 Claude Code 创建 dynamic workflows。我发现 workflows 有时在非技术工作中甚至更有用。

### 迁移与重构

[Bun](https://bun.com/) 使用 workflows 从 Zig 重写为 Rust。你可以阅读 [Jarred 在 X 上的帖子](https://x.com/jarredsumner/status/2060050578026189172)，了解更多细节。

关键是把任务拆成一系列需要处理的步骤，例如调用点、失败测试、模块等。为每个修复在 worktree 中启动一个 subagent，让它完成修复，然后让另一个 agent 进行对抗式评审并合并结果。可以考虑告诉 agent 不要使用资源密集型命令，这样你就能最大化并行度，而不至于耗尽本机资源。

### 深度研究

我们在 Claude Code 中发布了一个使用 dynamic workflows 的 deep research skill（`/deep-research`）。具体来说，它会扇出网页搜索、抓取来源、对抗式验证其中的论断，并综合出一份带引用的报告。

但你做的不一定只是网页搜索式研究。例如，你可以让 Claude 根据 Slack 中的上下文整理状态报告，或者通过深入探索代码库来研究某个功能是如何工作的。

### 深度验证

![](/posts/a-harness-for-every-task-dynamic-workflows-in-claude-code/deep-verification.png)

另一方面，如果你有一份报告，希望检查并溯源其中引用的每一条事实性论断，你可能会想生成一个 workflow：先由一个 agent 识别所有事实性论断，然后为每条论断启动一个 subagent 进行详细检查。你还可以让一个验证 agent 检查来源 subagent，确保它使用的来源质量足够高。

### 排序

![](/posts/a-harness-for-every-task-dynamic-workflows-in-claude-code/sorting.png)

你可能有一个项目列表，希望按照某种定性指标排序，而你相信 Claude Code 擅长评估这个指标。例如，按 bug 严重程度对支持工单排序。但如果你试图在一个提示词里排序 1000 多行，质量会下降，而且上下文也放不下。更好的做法是运行锦标赛、一条由两两比较 agents 组成的流水线（比较式判断比绝对打分更可靠），或者并行分桶排名后再合并。每次比较都是自己的 agent，因此确定性循环持有整个 bracket，只有运行顺序保留在上下文中。

### 记忆与规则遵守

![](/posts/a-harness-for-every-task-dynamic-workflows-in-claude-code/memory-and-rule-compliance.png)

如果你发现 Claude 对某组规则经常漏掉或处理困难，即使这些规则已经写进 `CLAUDE.md`，也可以创建一个 workflow，把这些规则列出来，并让 verifier agents 逐条检查。每条规则对应一个 verifier。创建一个带怀疑者人格的 subagent 来审查规则是否合理，有助于避免太多误报。

反方向也同样有效：挖掘你最近的会话和代码评审评论，找出你反复纠正的问题；用并行 agents 对它们聚类；对每个候选规则做对抗式验证，比如判断这条规则是否曾经能防止一个真实错误；然后把保留下来的规则提炼回 `CLAUDE.md`。

### 根因调查

调试最有效的方式，是提出几个独立假设并测试它们。但如果你只使用一个上下文窗口，Claude 可能会陷入 self-preferential bias。

Workflow 可以通过结构来避免这个问题：启动多个 agents，让它们从互不重叠的证据中生成假设。例如，分别为日志、文件和数据创建 agents。然后，每个假设都可以面对一组验证者和反驳者。

这不仅适用于代码。Workflows 也可以用于销售分析（为什么 3 月销售额下降了？）、数据工程（为什么这条 pipeline 失败了？），或任何事后复盘。

### 大规模分流

![](/posts/a-harness-for-every-task-dynamic-workflows-in-claude-code/triage-at-scale.png)

每个团队都有支持队列、错误报告，或某种无法完全由人类处理的积压事项。

分流 workflow 会对每个事项分类，和已经跟踪的事项去重，然后采取行动。这可能意味着尝试修复，也可能意味着升级给人类用户。

对分流 workflows 来说，一个有用模式是隔离区。这意味着读取不可信公共内容的 agents 不能执行高权限操作；这些操作改由负责根据信息采取行动的 agents 完成。

把分流 workflows 和 `/loop` 配合使用，可以让 Claude 持续执行这类工作。

### 探索与品味

当你想探索某个解决方案的不同方法时，workflows 会很有用。尤其是那些基于品味的任务，比如设计或命名，而且最好有一套评分标准。

可以让 Claude 探索一批解决方案，并给 review agent 一套“好方案是什么样”的评分标准。当 review agent 认为已经达到标准时，任务就完成了。解决方案也可以基于这套评分标准通过锦标赛排序或选出。

### 评测

你可以为特定任务运行轻量评测：在 worktree 中启动独立 agents，然后再启动比较 agents，根据评分标准比较并打分具体输出。例如，根据特定标准评估并改进你创建的某个 skill。

### 模型与智能路由

创建一个针对你的任务调优过的分类 agent，让它决定使用哪个模型。当任务涉及许多工具调用，并且执行前的研究可以帮助判断最适合的模型时，这会很有用。

例如，对于“解释 auth 模块如何工作”这个任务，最适合的模型取决于 auth 模块中有多少文件，以及代码库的结构。分类 agent 可以先做这项研究，然后根据预期复杂度路由到 Sonnet 或 Opus。

## 什么时候不要使用 dynamic workflows

Workflows 仍然很新。虽然在很多用例中它能带来超出常规的效果，但并不是每个任务都需要它，而且它可能会显著增加 token 使用量。

最好创造性地使用 workflows，把 Claude Code 推向你以前没有尝试过的使用方式。对于常规编码任务，可以先问自己：它真的需要更多计算量吗？例如，大多数传统编码任务并不需要一个由 5 个评审者组成的评审小组。

## 构建 dynamic workflows 的建议

### 提示词

对 dynamic workflows 来说，使用上面描述的具体技巧进行详细提示，会产生最好的结果。

Workflows 不只适用于大型任务。你也可以提示模型使用一个 “quick workflow”。例如，你可以快速创建一个对某个假设的对抗式评审。

### 结合 `/goal` 和 `/loop`

当使用可以重复执行的 workflows 时，例如分流、研究或验证，可以把它们和 `/loop` 搭配，让它们定期运行；同时用 `/goal` 设置硬性的完成要求。

### Token 使用预算

你可以为 dynamic workflows 设置明确的 token 使用预算，限制某个任务使用多少 token。你可以在提示词中给出类似 “use 10k tokens” 的预算，它会设置上限。

### 保存和分享 dynamic workflows

你可以在 workflow 菜单中按 “s” 保存 workflows。你可以把它们提交到 `~/.claude/workflows`，或者通过 skill 分发。

![](/posts/a-harness-for-every-task-dynamic-workflows-in-claude-code/saving-workflows.png)

如果要通过 skill 分享，把你的 JavaScript workflow 文件放进 skill 文件夹中，并在 `SKILL.md` 中引用它们。为了获得更高灵活性，你可能希望提示 Claude 把 skill 中的 workflows 当作模板，而不是必须逐字运行的脚本。

![](/posts/a-harness-for-every-task-dynamic-workflows-in-claude-code/sharing-via-skills.png)

## 一个新的探索起点

Workflows 是扩展 Claude Code 的一种有用新方式。我建议你把它们视为一个起点，用来探索使用 Claude 帮你完成任务的新方式。关于如何最好地使用它们，仍然有很多东西值得发现。欢迎告诉我你发现了什么。

*关于什么东西首先应该放进 harness，可以参考我们用于构建 Claude 应用的三种 [harness design patterns](https://claude.com/blog/harnessing-claudes-intelligence)。*

*本文由 Anthropic 技术团队成员 Thariq Shihipar 和 Sid Bidasaria 撰写，他们从事 Claude Code 相关工作。*

## 相关文章

探索更多产品新闻，以及面向使用 Claude 构建应用的团队的最佳实践。

### 构建 Claude Code 的经验：Prompt caching 就是一切

2026 年 4 月 30 日  
Claude Code  
[Lessons from building Claude Code: Prompt caching is everything](https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything)

### 驾驭 Claude Code：CLAUDE.md 文件、skills、hooks、rules、subagents 等

2026 年 6 月 18 日  
Claude Code  
[Steering Claude Code: CLAUDE.md files, skills, hooks, rules, subagents and more](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)

### 在 Claude Code 中选择 Claude 模型和 effort level

2026 年 7 月 7 日  
Claude Code  
[Choosing a Claude model and effort level in Claude Code](https://claude.com/blog/claude-model-and-effort-level-in-claude-code)

### Claude Fable 5 实地指南：发现你的未知项

2026 年 7 月 6 日  
Claude Code  
[A field guide to Claude Fable 5: Finding your unknowns](https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns)
