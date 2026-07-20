---
title: Claude Code Prompt engineering
date: 2026-05-19
summary: 面向 Claude 最新模型的提示工程综合指南：从清晰表达、示例与 XML 结构，到 effort、自适应思考、工具使用和智能体系统，并附大量可直接套用的提示词片段与迁移要点。
category: Tools
tags: [Claude, Prompt Engineering, Agents]
series: Claude Code 实践
featured: true
---

原文是一篇关于 **Claude 最新模型提示词最佳实践** 的文档。

## 提示词最佳实践

这是一份关于 Claude 最新模型提示工程技巧的综合指南，涵盖清晰表达、示例、XML 结构、思考能力以及智能体系统等内容。

这是针对 Claude 最新模型进行提示工程的统一参考，包括 Claude Opus 4.7、Claude Opus 4.6、Claude Sonnet 4.6 和 Claude Haiku 4.5。它涵盖基础技巧、输出控制、工具使用、思考能力和智能体系统。你可以直接跳到与你当前场景最相关的部分。

## 提示 Claude Opus 4.7

Claude Opus 4.7 是目前 Anthropic 最强的通用可用模型，尤其擅长长期智能体任务、知识工作、视觉任务和记忆任务。它通常能够很好地兼容已有的 Claude Opus 4.6 提示词。下面的模式主要覆盖最常需要调优的行为。

如果你从 Claude Opus 4.6 迁移过来，需要关注 API 参数变化，包括 effort 等级、任务预算、thinking 配置、采样参数移除和 token 化方式等，具体可参考迁移指南。

### 回答长度和详细程度

Claude Opus 4.7 会根据它判断任务复杂度来调整回答长度，而不是默认采用固定的详细程度。这通常意味着：简单查询会回答得更短，开放式分析会回答得更长。

如果你的产品依赖某种固定风格或详细程度，你可能需要调整提示词。例如，如果想降低啰嗦程度，可以加入：

```text
Provide concise, focused responses. Skip non-essential context, and keep examples minimal.
```

如果你发现某些特定类型的啰嗦，比如过度解释，可以在提示词中加入额外约束。通常，给出正向示例，让 Claude 学会合适的简洁表达，会比负向指令更有效。

### 校准 effort 和思考深度

`effort` 参数可以用来调节 Claude 的智能程度和 token 消耗，在能力、速度和成本之间做权衡。对于编码和智能体场景，建议从新的 `xhigh` effort 等级开始；对于大多数对智能要求较高的场景，至少使用 `high`。可以根据需求继续测试其他等级：

`max`：最高 effort 在某些场景中可能带来性能提升，但也可能出现边际收益递减，并且更容易过度思考。适合非常需要智能的任务。

`xhigh`：新的超高 effort，最适合大多数编码和智能体场景。

`high`：在 token 使用和智能之间取得平衡。大多数智能敏感型任务至少推荐使用这个等级。

`medium`：适合成本敏感场景，可以减少 token 使用，但会牺牲一定智能。

`low`：适合短小、范围明确、对延迟敏感且不太需要高智能的任务。

与 Claude Opus 4.6 相比，Claude Opus 4.7 会更严格地遵守 effort 等级，尤其是在低 effort 下。`low` 和 `medium` 时，模型会更专注于你明确要求的内容，不太会主动做额外工作。这有利于降低延迟和成本，但对于中等复杂任务，可能会出现思考不足。

如果你发现复杂问题推理较浅，优先把 effort 提高到 `high` 或 `xhigh`，而不是靠提示词绕过。如果必须保持 `low` 以控制延迟，可以加入更有针对性的引导：

```text
This task involves multi-step reasoning. Think carefully through the problem before responding.
```

对于这个模型来说，effort 比以往任何 Opus 模型都更重要，因此升级时建议主动实验不同 effort。

自适应思考的触发行为也是可以被引导的。如果你发现模型思考得太频繁，尤其是在系统提示词很大或很复杂时，可以加入引导语。和其他提示词修改一样，应该通过评估来验证效果。例如：

```text
Thinking adds latency and should only be used when it will meaningfully improve answer quality — typically for problems that require multi-step reasoning. When in doubt, respond directly.
```

反过来，如果你在 `medium` 下运行困难任务时发现模型思考不足，首要手段是提高 effort。如果需要更细粒度控制，可以直接在提示词中要求。

如果使用 Claude Opus 4.7 的 `max` 或 `xhigh` effort，需要设置较大的最大输出 token 预算，让模型有空间在子智能体和工具调用之间进行思考和行动。建议从 64k token 开始，再根据实际情况调整。

### 工具使用触发

Claude Opus 4.7 相比 Claude Opus 4.6 更倾向于少用工具、多用推理。大多数情况下这会带来更好的结果。不过，提高 effort 设置有助于提升工具使用频率，尤其是知识工作场景。`high` 或 `xhigh` 会在智能体搜索和编码中显著增加工具使用。

如果你希望模型更多使用工具，也可以在提示词中明确说明什么时候、为什么、如何使用工具。例如，如果你发现模型没有使用网页搜索工具，就清楚描述搜索工具应该在什么情况下使用。

### 面向用户的进度更新

Claude Opus 4.7 在长时间智能体执行过程中，会更规律地向用户提供质量更高的进度更新。如果你之前在提示词里添加过强制中间状态消息的脚手架，例如“每 3 次工具调用后总结进度”，可以尝试移除。如果你觉得进度更新的长度或内容不适合你的产品场景，可以在提示词中明确说明更新应该是什么样，并提供示例。

### 更字面化地遵循指令

Claude Opus 4.7 比 Claude Opus 4.6 更字面、更明确地理解提示词，尤其是在较低 effort 下。它不会默默把一条指令从某个项目推广到另一个项目，也不会推断你没有明确提出的请求。

好处是：更精准、更少来回折腾，也更适合 API 场景中经过仔细调优的提示词、结构化抽取和可预测流水线。如果你需要 Claude 把某条指令广泛应用，就要明确说明适用范围。例如：“把这种格式应用到每一个章节，而不仅仅是第一章。”

### 语气和写作风格

和任何新模型一样，长文写作风格可能会发生变化。Claude Opus 4.7 更直接、更有观点，相比 Claude Opus 4.6 那种更温暖、更多认可式表达的风格，它的 emoji 更少，也没那么“安抚式”。

如果你的产品依赖某种特定声音，需要重新评估风格提示词。例如，如果你想要更温暖、更像协作对话的语气，可以加入：

```text
Use a warm, collaborative tone. Acknowledge the user's framing before answering.
```

### 控制子智能体生成

Claude Opus 4.7 默认倾向于生成更少的子智能体。不过这可以通过提示词控制。你可以明确说明什么时候适合使用子智能体。一个编码场景的简单示例：

```text
Do not spawn a subagent for work you can complete directly in a single response (e.g. refactoring a function you can already see).

Spawn multiple subagents in the same turn when fanning out across items or reading multiple files.
```

### 设计和前端默认风格

Claude Opus 4.7 比 Claude Opus 4.6 有更强的设计直觉，但它也有一个比较稳定的默认“家族风格”：暖奶油色或米白背景，大约 `#F4F1EA`；serif 展示字体，比如 Georgia、Fraunces、Playfair；斜体文字点缀；陶土色或琥珀色强调色。

这种风格适合编辑类、酒店餐饮类、作品集类页面，但如果用于仪表盘、开发者工具、金融科技、医疗健康或企业应用，就可能显得不合适。这个默认风格不仅会出现在网页 UI，也会出现在幻灯片中。

这种默认倾向比较顽固。泛泛地说“不要用奶油色”“做得干净简洁”，通常只会让模型切换到另一个固定调色板，而不是产生真正的多样性。更可靠的方法有两个。

第一，指定一个具体的替代视觉方向。模型会非常准确地遵循明确规范。例如，你可以给出完整的视觉方向、颜色范围、字体风格、布局节奏、按钮样式等。

第二，在构建前先让模型提出多个设计方向。这可以打破默认风格，让用户拥有选择权。如果你过去依赖 `temperature` 来获得设计多样性，这种方法更有效。示例：

```text
Before building, propose 4 distinct visual directions tailored to this brief (each as: bg hex / accent hex / typeface — one-line rationale). Ask the user to pick one, then implement only that direction.
```

此外，相比之前的模型，Claude Opus 4.7 需要更少的前端设计提示，就能避免用户所说的“AI 味”通用审美。对于前端审美，可以加入类似这样的提示：

```text
<frontend_aesthetics>
NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white or dark backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character. Use unique fonts, cohesive colors and themes, and animations for effects and micro-interactions.
</frontend_aesthetics>
```

### 交互式编码产品

Claude Opus 4.7 在自治型异步编码智能体和交互式同步编码智能体中的 token 使用与行为可能不同。

具体来说，在交互式场景中，它往往会使用更多 token，主要原因是每次用户发言后它都会进行更多推理。这可以提升长周期一致性、指令遵循和编码能力，但也会增加 token 使用。

为了同时最大化性能和 token 效率，建议在编码产品中使用 `xhigh` 或 `high` effort，加入自动模式等自治功能，并减少用户必须参与的交互次数。

当然，如果要减少用户交互，就必须在第一轮用户输入中清楚说明任务、意图和相关约束。清晰、完整、准确的初始任务描述有助于提升自治能力和智能表现，同时减少后续交互带来的额外 token 消耗。相反，模糊或分散在多轮对话中的需求，会相对降低 token 效率，有时也会降低性能。

### 代码审查 harness

Claude Opus 4.7 在发现 bug 方面明显强于之前模型。在 Anthropic 一个基于真实 PR 的最难 bug-finding 评估中，召回率提高了 11 个百分点，同时召回率和精确率都有提升。

不过，如果你的代码审查 harness 是为早期模型调优的，刚开始可能会看到更低的召回率。这更可能是 harness 问题，而不是模型能力退步。

原因是：当 review prompt 里写着“只报告高严重性问题”“保守一点”“不要 nitpick”时，Claude Opus 4.7 会比以前更严格地遵守这些指令。它可能仍然深入调查代码、识别出 bug，但如果它判断这些问题低于你设定的报告门槛，就不会报告出来。结果是精确率上升，但召回率可能下降。

推荐提示词：

```text
Report every issue you find, including ones you are uncertain about or consider low-severity. Do not filter for importance or confidence at this stage - a separate verification step will do that. Your goal here is coverage: it is better to surface a finding that later gets filtered out than to silently drop a real bug. For each finding, include your confidence level and an estimated severity so a downstream filter can rank them.
```

即使你没有真正的第二步验证，这段提示词也可以使用。把置信度过滤从“发现阶段”移出去，通常会有帮助。如果你的 harness 确实有单独的验证、去重或排序阶段，要明确告诉模型：发现阶段的目标是覆盖率，而不是过滤。

如果你希望模型单轮自我过滤，就不要用“重要”这种模糊词，而要明确标准。例如：“报告任何可能导致错误行为、测试失败或误导性结果的 bug；只忽略纯风格或命名偏好之类的 nit。”

建议用一部分 eval 或测试用例迭代提示词，验证召回率或 F1 是否提升。

### 计算机使用

Computer use 能力支持多种分辨率，最高可达 2576px / 3.75MP。测试中发现，发送 1080p 图像在性能和成本之间比较平衡。

对于特别成本敏感的任务，推荐使用 720p 或 1366×768，它们成本更低且表现仍然不错。建议你根据自己的场景测试理想设置；尝试不同 effort 也可以帮助调节模型行为。

# 通用原则

## 清晰直接

Claude 很适合处理清晰、明确的指令。具体说明你想要的输出，可以提升结果质量。如果你想要“超出基础要求”的行为，需要明确提出，而不是依赖模型从模糊提示中推断。

可以把 Claude 想象成一个很聪明但刚入职的新员工，它不了解你的规范和工作流。你解释得越具体，它完成得越好。

黄金法则：把你的提示词给一个不了解背景的同事看，让他按照提示执行。如果他会困惑，Claude 也会困惑。

你应该明确希望的输出格式和约束；如果步骤顺序或完整性很重要，就用编号列表或项目符号写出顺序步骤。

示例：创建分析仪表盘。

不太有效：

```text
Create an analytics dashboard
```

更有效：

```text
Create an analytics dashboard. Include as many relevant features and interactions as possible. Go beyond the basics to create a fully-featured implementation.
```

## 添加上下文以提升表现

提供上下文或动机，比如解释为什么某个行为很重要，可以帮助 Claude 更好地理解目标，输出更贴合需求。

示例：格式偏好。

不太有效：

```text
NEVER use ellipses
```

更有效：

```text
Your response will be read aloud by a text-to-speech engine, so never use ellipses since the text-to-speech engine will not know how to pronounce them.
```

Claude 足够聪明，可以从解释中泛化。

## 有效使用示例

示例是引导 Claude 输出格式、语气和结构最可靠的方法之一。少量精心设计的示例，也就是 few-shot 或 multishot prompting，可以显著提升准确性和一致性。

添加示例时，要注意三点：相关性、多样性、结构化。示例应该贴近你的实际使用场景；覆盖边界情况并保持足够变化，避免 Claude 学到意外模式；用 `<example>` 标签包裹单个示例，用 `<examples>` 包裹多个示例，让 Claude 能区分示例和指令。

通常包含 3 到 5 个示例效果最好。你也可以让 Claude 评估这些示例的相关性和多样性，或者基于已有示例生成更多示例。

## 使用 XML 标签组织提示词

XML 标签可以帮助 Claude 清楚解析复杂提示词，尤其当提示词同时包含指令、上下文、示例和变量输入时。把每种内容放入自己的标签中，比如 `<instructions>`、`<context>`、`<input>`，可以减少误解。

最佳实践是：使用一致、描述性的标签名；当内容存在自然层级时，使用嵌套标签，比如 `<documents>` 中包含多个 `<document index="n">`。

## 给 Claude 一个角色

在 system prompt 中设置角色，可以聚焦 Claude 的行为和语气。即使只有一句话，也会有帮助。例如：

```python
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    system="You are a helpful coding assistant specializing in Python.",
    messages=[
        {"role": "user", "content": "How do I sort a list of dictionaries by key?"}
    ],
)
print(message.content)
```

## 长上下文提示

当处理大型文档或数据密集型输入，也就是 20k token 以上时，需要仔细组织提示词。

首先，把长文档和输入放在提示词顶部，放在问题、指令和示例之前。这可以显著提升所有模型的表现。测试中发现，把问题放在末尾，在复杂多文档输入场景下最多可以提升 30% 的回答质量。

其次，用 XML 标签组织文档内容和元数据。处理多个文档时，可以用 `<document>` 标签，并在里面加入 `<document_content>`、`<source>` 等子标签。例如：

```xml
<documents>
  <document index="1">
    <source>annual_report_2023.pdf</source>
    <document_content>
      {{ANNUAL_REPORT}}
    </document_content>
  </document>
  <document index="2">
    <source>competitor_analysis_q2.xlsx</source>
    <document_content>
      {{COMPETITOR_ANALYSIS}}
    </document_content>
  </document>
</documents>

Analyze the annual report and competitor analysis. Identify strategic advantages and recommend Q3 focus areas.
```

第三，让回答基于引用。对于长文档任务，可以先要求 Claude 找出相关原文引用，再执行任务。这能帮助 Claude 从大量噪声中抓住关键内容。

# 输出与格式

## 沟通风格和详细程度

Claude 最新模型相比之前模型，沟通风格更简洁自然：

它更直接、更基于事实，会提供事实性的进度报告，而不是自我表扬式更新；它更像自然对话，少一些机器感；它也更少啰嗦，除非你明确要求，否则可能跳过详细总结以提高效率。

这意味着，在工具调用后 Claude 可能不会总是口头总结，而是直接进入下一步。如果你希望更清楚看到它完成了什么，可以这样提示：

```text
After completing a task that involves tool use, provide a quick summary of the work you've done.
```

## 控制回答格式

有几种特别有效的方法可以控制输出格式。

第一，告诉 Claude 应该做什么，而不是不应该做什么。比如，与其说“不要使用 markdown”，不如说“你的回答应该由流畅的自然段组成”。

第二，使用 XML 格式标记。比如：“把文章段落写在 `<smoothly_flowing_prose_paragraphs>` 标签中。”

第三，让提示词风格匹配目标输出。如果你发现输出格式难以控制，可以让提示词本身尽量接近期望的输出风格。例如，减少提示词中的 markdown，可能会减少模型输出中的 markdown。

第四，对于具体格式偏好，使用详细提示词。例如：

````text
<avoid_excessive_markdown_and_bullet_points>
When writing reports, documents, technical explanations, analyses, or any long-form content, write in clear, flowing prose using complete paragraphs and sentences. Use standard paragraph breaks for organization and reserve markdown primarily for `inline code`, code blocks (```...```), and simple headings (###, and ###). Avoid using **bold** and *italics*.

DO NOT use ordered lists (1. ...) or unordered lists (*) unless : a) you're presenting truly discrete items where a list format is the best option, or b) the user explicitly requests a list or ranking

Instead of listing items with bullets or numbers, incorporate them naturally into sentences. This guidance applies especially to technical writing. Using prose instead of excessive formatting will improve user satisfaction. NEVER output a series of overly short bullet points.

Your goal is readable, flowing text that guides the reader naturally through ideas rather than fragmenting information into isolated points.
</avoid_excessive_markdown_and_bullet_points>
````

## LaTeX 输出

Claude 最新模型在数学表达、方程和技术解释中默认倾向于使用 LaTeX。如果你想要纯文本，可以加入：

```text
Format your response in plain text only. Do not use LaTeX, MathJax, or any markup notation such as \( \), $, or \frac{}{}. Write all math expressions using standard text characters (e.g., "/" for division, "*" for multiplication, and "^" for exponents).
```

## 文档创建

Claude 最新模型很擅长创建演示文稿、动画和视觉文档，通常第一次就能产出比较 polished、可用的结果。

为了获得更好结果，可以这样提示：

```text
Create a professional presentation on [topic]. Include thoughtful design elements, visual hierarchy, and engaging animations where appropriate.
```

## 迁移 away from prefilled responses

从 Claude 4.6 模型和 Claude Mythos Preview 开始，不再支持最后一轮 assistant 的 prefilled responses。对这些模型使用 prefilled assistant message 会返回 400 错误。由于模型智能和指令遵循能力提升，大多数 prefill 场景已经不再需要。

常见 prefill 场景及迁移方式如下。

用于控制 JSON、YAML、分类等固定输出格式时，应该迁移到 Structured Outputs，或者直接要求模型遵守结构；新模型在明确要求时通常能可靠匹配复杂 schema，尤其配合重试机制。分类任务可以使用带 enum 字段的工具或结构化输出。

用于消除开头套话时，可以在 system prompt 中直接写：“直接回答，不要使用 ‘Here is...’、‘Based on...’ 这类开场。”也可以要求模型输出在 XML 标签内，或者在后处理时去掉偶发的开场白。

用于避免不必要拒绝时，现在 Claude 已经更擅长合理拒绝。通常只需要在用户消息里清楚表达即可，不再需要 prefill。

用于继续被中断的回答时，把续写要求放到用户消息中，并包含上次中断的结尾文本，例如：“Your previous response was interrupted and ended with `[previous_response]`. Continue from where you left off.”

用于上下文刷新和角色一致性时，可以把过去 prefilled assistant reminders 改成注入用户轮次。如果上下文注入是复杂智能体系统的一部分，可以通过工具进行上下文 hydration，或者在上下文压缩时处理。

# 工具使用

## 工具使用

Claude 最新模型经过训练，能更精准地遵循指令，并且在使用具体工具时受益于明确说明。如果你说“能不能建议一些改进”，Claude 有时会只给建议，而不会真正修改，即使你本意是希望它改代码。

如果你希望 Claude 采取行动，需要更明确：

不太有效：

```text
Can you suggest some changes to improve this function?
```

更有效：

```text
Change this function to improve its performance.
```

或者：

```text
Make these edits to the authentication flow.
```

如果希望 Claude 默认更主动采取行动，可以加入：

```text
<default_to_action>
By default, implement changes rather than only suggesting them. If the user's intent is unclear, infer the most useful likely action and proceed, using tools to discover any missing details instead of guessing. Try to infer the user's intent about whether a tool call (e.g., file edit or read) is intended or not, and act accordingly.
</default_to_action>
```

反过来，如果希望模型更谨慎，不要轻易进入实现，可以加入：

```text
<do_not_act_before_instructions>
Do not jump into implementation or change files unless clearly instructed to make changes. When the user's intent is ambiguous, default to providing information, doing research, and providing recommendations rather than taking action. Only proceed with edits, modifications, or implementations when the user explicitly requests them.
</do_not_act_before_instructions>
```

Claude Opus 4.5 和 Claude Opus 4.6 比之前模型更响应 system prompt。如果你的提示词过去是为了防止工具触发不足而写得很激进，现在可能会导致工具过度触发。解决方法是减少强硬措辞。比如，把“CRITICAL: You MUST use this tool when...”改成更普通的“Use this tool when...”。

## 优化并行工具调用

Claude 最新模型很擅长并行执行工具。它们会在研究中运行多个推测性搜索，会同时读取多个文件以更快建立上下文，也可能并行执行 bash 命令，甚至对系统性能造成压力。

这种行为可以被引导。虽然模型本身已经有较高的并行工具调用成功率，你可以通过提示词进一步提高，或者降低并行程度。

最大化并行效率的提示词：

```text
<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between the tool calls, make all of the independent tool calls in parallel. Prioritize calling tools simultaneously whenever the actions can be done in parallel rather than sequentially. For example, when reading 3 files, run 3 tool calls in parallel to read all 3 files into context at the same time. Maximize use of parallel tool calls where possible to increase speed and efficiency. However, if some tool calls depend on previous calls to inform dependent values like the parameters, do NOT call these tools in parallel and instead call them sequentially. Never use placeholders or guess missing parameters in tool calls.
</use_parallel_tool_calls>
```

降低并行执行的提示词：

```text
Execute operations sequentially with brief pauses between each step to ensure stability.
```

# 思考与推理

## 过度思考和过度全面

Claude Opus 4.6 相比之前模型，会进行更多前置探索，尤其在较高 effort 下。这种初始工作通常有助于优化最终结果，但模型可能会收集大量上下文，或者在没有要求的情况下探索多个研究方向。

如果你的提示词过去鼓励模型更全面，你应该针对 Claude Opus 4.6 调整。

可以把泛化默认改成更有针对性的说明。例如，不要写“默认使用某工具”，而是写“当某工具能增强你对问题的理解时使用它”。

也可以移除过度提示。过去容易触发不足的工具，在新模型中可能已经能合适触发。像“If in doubt, use tool”这样的指令会导致过度触发。

还可以降低 effort。如果 Claude 仍然过于激进，就使用更低的 effort。

有时 Claude Opus 4.6 会思考很多，导致 thinking tokens 膨胀、响应变慢。如果不想这样，可以通过提示词限制推理，或者降低 effort。

示例：

```text
When you're deciding how to approach a problem, choose an approach and commit to it. Avoid revisiting decisions unless you encounter new information that directly contradicts your reasoning. If you're weighing two approaches, pick one and see it through. You can always course-correct later if the chosen approach fails.
```

如果需要严格控制思考成本，旧式 extended thinking 加 `budget_tokens` 在 Opus 4.6 和 Sonnet 4.6 中仍然可用，但已被弃用。更推荐降低 effort，或者使用 `max_tokens` 作为自适应思考的硬上限。

## 利用 thinking 和 interleaved thinking 能力

Claude 最新模型提供 thinking 能力，尤其适合需要工具使用后反思或复杂多步推理的任务。你可以引导它的初始思考或交错思考，以获得更好结果。

Claude Opus 4.6 和 Claude Sonnet 4.6 使用自适应思考，即 `thinking: {type: "adaptive"}`。Claude 会根据 effort 参数和问题复杂度动态决定是否思考以及思考多少。effort 越高，越可能思考；问题越复杂，也越可能思考。简单问题不需要思考时，模型会直接回答。内部评估显示，自适应思考通常比 extended thinking 更可靠地提升表现。

对于需要智能体行为的任务，比如多步工具使用、复杂编码任务、长周期智能体循环，建议使用自适应思考。旧模型使用手动 thinking 模式和 `budget_tokens`。

可以这样引导 Claude 的思考：

```text
After receiving tool results, carefully reflect on their quality and determine optimal next steps before proceeding. Use your thinking to plan and iterate based on this new information, and then take the best next action.
```

如果你发现模型思考太频繁，可以加入：

```text
Extended thinking adds latency and should only be used when it will meaningfully improve answer quality - typically for problems that require multi-step reasoning. When in doubt, respond directly.
```

如果从旧的 extended thinking 迁移，需要把 thinking 配置换成 adaptive，并通过 effort 控制思考深度。

旧写法：

```python
client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=64000,
    thinking={"type": "enabled", "budget_tokens": 32000},
    messages=[{"role": "user", "content": "..."}],
)
```

新写法：

```python
client.messages.create(
    model="claude-opus-4-7",
    max_tokens=64000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},
    messages=[{"role": "user", "content": "..."}],
)
```

如果你没有使用 extended thinking，就不需要改。省略 `thinking` 参数时，thinking 默认关闭。

一般建议是：优先使用通用引导，而不是规定死板步骤。像“think thoroughly”这样的提示，常常比人类手写的步骤列表更能产生好推理。Claude 的推理可能超出人类预设步骤。

多示例也可以配合 thinking 使用。可以在 few-shot 示例中使用 `<thinking>` 标签展示推理模式，Claude 会把这种风格泛化到自己的 extended thinking blocks。

当 thinking 关闭时，也可以用手动 CoT 作为备用方案，鼓励模型一步步推理。可以用 `<thinking>` 和 `<answer>` 标签把推理和最终回答分开。

还可以要求 Claude 自检，例如在末尾加入：“Before you finish, verify your answer against [test criteria].” 这对编码和数学尤其有帮助。

# 智能体系统

## 长周期推理和状态跟踪

Claude 最新模型非常擅长长周期推理任务，并具备很强的状态跟踪能力。Claude 会通过关注增量进展，在长会话中保持方向感，一次推进少量事情，而不是试图一次完成所有内容。这种能力在多个上下文窗口或任务迭代中尤其明显：Claude 可以在复杂任务中工作，保存状态，然后在新上下文窗口中继续。

### 上下文感知和多窗口工作流

Claude 4.6 和 Claude 4.5 模型具备上下文感知能力，能够在对话中跟踪剩余上下文窗口，也就是 token 预算。这能让 Claude 更有效地执行任务和管理上下文。

如果你在 agent harness 中使用上下文压缩，或者允许保存上下文到外部文件，比如 Claude Code，可以在提示词中加入这些信息，帮助 Claude 正确行动。否则，它可能会在接近上下文限制时自然尝试收尾。

示例：

```text
Your context window will be automatically compacted as it approaches its limit, allowing you to continue working indefinitely from where you left off. Therefore, do not stop tasks early due to token budget concerns. As you approach your token budget limit, save your current progress and state to memory before the context window refreshes. Always be as persistent and autonomous as possible and complete tasks fully, even if the end of your budget is approaching. Never artificially stop any task early regardless of the context remaining.
```

memory tool 很适合和上下文感知搭配，用于平滑上下文切换。

### 多上下文窗口工作流

对于跨多个上下文窗口的任务，可以使用不同策略。

第一，第一个上下文窗口使用不同提示词。第一窗口用于建立框架，比如写测试、创建初始化脚本，之后的窗口根据 todo-list 迭代。

第二，让模型用结构化格式写测试。先让 Claude 创建测试，并用 JSON 等结构化方式跟踪测试，能提升长期迭代能力。要提醒 Claude 测试的重要性：“不能删除或修改测试，因为这可能掩盖缺失或错误功能。”

第三，设置改善开发体验的工具。鼓励 Claude 创建初始化脚本，比如 `init.sh`，用于启动服务、运行测试和 linter。这样在新上下文窗口继续时可以减少重复工作。

第四，在清空上下文时，有时应该从全新的上下文窗口开始，而不是使用压缩。Claude 最新模型非常擅长从本地文件系统恢复状态。在某些场景中，这比压缩更有利。可以明确要求它如何开始，比如：“Call pwd; you can only read and write files in this directory.” 或 “Review progress.txt, tests.json, and the git logs.”

第五，提供验证工具。随着自治任务变长，Claude 需要在没有持续人工反馈的情况下验证正确性。Playwright MCP server 或 computer use 这类工具对测试 UI 很有帮助。

第六，鼓励充分使用上下文。可以提示 Claude 系统地完成组件，再进入下一项：

```text
This is a very long task, so it may be beneficial to plan out your work clearly. It's encouraged to spend your entire output context working on the task - just make sure you don't run out of context with significant uncommitted work. Continue working systematically until you have completed this task.
```

### 状态管理最佳实践

状态数据适合使用结构化格式，比如 JSON，用于跟踪测试结果或任务状态，这有助于 Claude 理解 schema 要求。

进度笔记适合使用非结构化文本，用于记录一般进展和上下文。

Git 非常适合状态跟踪，因为它提供了完成记录和可恢复检查点。Claude 最新模型尤其擅长利用 git 跟踪跨会话状态。

还应该强调增量进展，明确要求 Claude 跟踪进度，并专注逐步推进。

示例结构化状态文件：

```json
{
  "tests": [
    { "id": 1, "name": "authentication_flow", "status": "passing" },
    { "id": 2, "name": "user_management", "status": "failing" },
    { "id": 3, "name": "api_endpoints", "status": "not_started" }
  ],
  "total": 200,
  "passing": 150,
  "failing": 25,
  "not_started": 25
}
```

示例进度笔记：

```text
Session 3 progress:
- Fixed authentication token validation
- Updated user model to handle edge cases
- Next: investigate user_management test failures (test #2)
- Note: Do not remove tests as this could lead to missing functionality
```

## 平衡自治和安全

如果没有引导，Claude Opus 4.6 可能会采取一些难以逆转或影响共享系统的操作，比如删除文件、强制 push、向外部服务发帖等。如果你希望 Claude 在执行有风险操作前确认，可以加入：

```text
Consider the reversibility and potential impact of your actions. You are encouraged to take local, reversible actions like editing files or running tests, but for actions that are hard to reverse, affect shared systems, or could be destructive, ask the user before proceeding.

Examples of actions that warrant confirmation:
- Destructive operations: deleting files or branches, dropping database tables, rm -rf
- Hard to reverse operations: git push --force, git reset --hard, amending published commits
- Operations visible to others: pushing code, commenting on PRs/issues, sending messages, modifying shared infrastructure

When encountering obstacles, do not use destructive actions as a shortcut. For example, don't bypass safety checks (e.g. --no-verify) or discard unfamiliar files that may be in-progress work.
```

## 研究和信息收集

Claude 最新模型具备非常强的智能体搜索能力，能有效从多个来源查找并综合信息。为了获得最佳研究结果：

首先，提供清晰的成功标准，定义怎样才算成功回答了研究问题。

其次，鼓励来源验证，让 Claude 在多个来源之间交叉验证信息。

对于复杂研究任务，可以使用结构化方式：

```text
Search for this information in a structured way. As you gather data, develop several competing hypotheses. Track your confidence levels in your progress notes to improve calibration. Regularly self-critique your approach and plan. Update a hypothesis tree or research notes file to persist information and provide transparency. Break down this complex research task systematically.
```

这种结构化方法可以让 Claude 几乎查找并综合任何规模语料中的信息，并在过程中不断批判和修正自己的发现。

## 子智能体编排

Claude 最新模型显著提升了原生子智能体编排能力。它们能识别什么时候任务适合委派给专门子智能体，并主动执行，而不一定需要明确指令。

要利用这种能力，需要确保子智能体工具定义清楚，让 Claude 自然编排。同时也要注意过度使用。Claude Opus 4.6 有较强的子智能体偏好，可能在简单任务中也生成子智能体。例如，对于简单代码探索，直接 grep 可能比开子智能体更快。

如果你发现子智能体使用过度，可以明确说明什么时候该用、什么时候不该用：

```text
Use subagents when tasks can run in parallel, require isolated context, or involve independent workstreams that don't need to share state. For simple tasks, sequential operations, single-file edits, or tasks where you need to maintain context across steps, work directly rather than delegating.
```

## 链式复杂提示

有了自适应思考和子智能体编排，Claude 可以在内部处理大多数多步推理。显式 prompt chaining，也就是把任务拆成多个连续 API 调用，仍然适合需要检查中间输出或强制某种流水线结构的场景。

最常见的链式模式是自我修正：先生成草稿，再让 Claude 根据标准审查，再根据审查结果改进。每一步都是单独 API 调用，这样你可以在任意环节记录、评估或分支。

## 减少智能体编码中的文件创建

Claude 最新模型有时会为了测试和迭代创建新文件，尤其是处理代码时。这种方式允许 Claude 使用文件，特别是 Python 脚本，作为临时草稿区，然后再保存最终输出。对于智能体编码场景，临时文件有时能改善结果。

如果你想最小化新增文件，可以要求 Claude 清理：

```text
If you create any temporary new files, scripts, or helper files for iteration, clean up these files by removing them at the end of the task.
```

## 过度积极

Claude Opus 4.5 和 Claude Opus 4.6 有时会过度工程化，比如创建额外文件、增加不必要抽象，或者构建用户没有要求的灵活性。如果出现这种情况，可以加入具体约束，保持方案最小化：

```text
Avoid over-engineering. Only make changes that are directly requested or clearly necessary. Keep solutions simple and focused:

- Scope: Don't add features, refactor code, or make "improvements" beyond what was asked. A bug fix doesn't need surrounding code cleaned up. A simple feature doesn't need extra configurability.

- Documentation: Don't add docstrings, comments, or type annotations to code you didn't change. Only add comments where the logic isn't self-evident.

- Defensive coding: Don't add error handling, fallbacks, or validation for scenarios that can't happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs).

- Abstractions: Don't create helpers, utilities, or abstractions for one-time operations. Don't design for hypothetical future requirements. The right amount of complexity is the minimum needed for the current task.
```

## 避免只为通过测试而硬编码

Claude 有时可能过度关注让测试通过，而牺牲通用性；也可能使用 helper scripts 等 workaround 来快速完成复杂重构，而不是直接使用标准工具。为了避免这种情况，可以加入：

```text
Please write a high-quality, general-purpose solution using the standard tools available. Do not create helper scripts or workarounds to accomplish the task more efficiently. Implement a solution that works correctly for all valid inputs, not just the test cases. Do not hard-code values or create solutions that only work for specific test inputs. Instead, implement the actual logic that solves the problem generally.

Focus on understanding the problem requirements and implementing the correct algorithm. Tests are there to verify correctness, not to define the solution. Provide a principled implementation that follows best practices and software design principles.

If the task is unreasonable or infeasible, or if any of the tests are incorrect, please inform me rather than working around them. The solution should be robust, maintainable, and extendable.
```

## 减少智能体编码中的幻觉

Claude 最新模型已经更少幻觉，并且能基于代码给出更准确、更扎实的回答。为了进一步减少幻觉，可以加入：

```text
<investigate_before_answering>
Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.
</investigate_before_answering>
```

# 特定能力技巧

## 改进的视觉能力

Claude Opus 4.5 和 Claude Opus 4.6 相比之前模型具有更强的视觉能力。它们在图像处理和数据抽取任务中表现更好，尤其当上下文里有多张图像时。这些提升也会延伸到 computer use，使模型更可靠地理解截图和 UI 元素。

一个有效增强视觉表现的技巧是给 Claude 提供 crop tool 或 skill，让它能放大相关区域。测试表明，当 Claude 可以“缩放”查看图像中的关键区域时，视觉评估表现会稳定提升。

## 前端设计

Claude Opus 4.5 和 Claude Opus 4.6 擅长构建复杂、真实世界的 Web 应用，并有较强前端设计能力。但如果没有引导，模型可能默认生成通用模式，也就是用户常说的“AI 味”审美。为了创建更独特、更有创意、更令人惊喜的前端，可以使用这样的系统提示片段：

```text
<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight.

Focus on:
- Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.
- Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.
- Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>
```

# 迁移注意事项

从早期模型迁移到 Claude 4.6 时，需要注意以下几点。

第一，明确具体行为。仔细描述你希望在输出中看到什么。

第二，用修饰语塑造指令。添加能鼓励模型提升质量和细节的修饰语，可以更好塑造结果。比如，不要只说“Create an analytics dashboard”，而是说“Create an analytics dashboard. Include as many relevant features and interactions as possible. Go beyond the basics to create a fully-featured implementation.”

第三，显式要求具体功能。动画和交互元素如果需要，就应该明确要求。

第四，更新 thinking 配置。Claude 4.6 模型使用自适应 thinking，即 `thinking: {type: "adaptive"}`，而不是手动 `budget_tokens`。使用 effort 参数控制思考深度。

第五，迁移 away from prefilled responses。从 Claude 4.6 起，最后一轮 assistant prefilled responses 不再支持。

第六，调整 anti-laziness prompting。如果你过去的提示词鼓励模型更全面或更激进地使用工具，现在需要降低强度。Claude 4.6 模型主动性明显更高，旧模型需要的强指令可能在新模型上导致过度触发。

## 从 Claude Sonnet 4.5 迁移到 Claude Sonnet 4.6

Claude Sonnet 4.6 默认 effort 是 `high`，而 Claude Sonnet 4.5 没有 effort 参数。从 Sonnet 4.5 迁移到 Sonnet 4.6 时，应该考虑调整 effort。如果不显式设置，默认 high 可能带来更高延迟。

推荐 effort 设置：

`Medium`：适合大多数应用。

`Low`：适合高吞吐或延迟敏感场景。

中高 effort 时，建议设置较大的 max output token 预算，比如 64k，以便模型有足够空间思考和行动。

什么时候使用 Opus 4.7？对于最难、最长周期的问题，比如大规模代码迁移、深度研究、长期自治任务，Opus 4.7 仍然是更合适的选择。Sonnet 4.6 更适合重视快速响应和成本效率的场景。

如果你没有使用 extended thinking，可以继续不使用。应该显式设置适合场景的 effort。在 `low` effort 且 thinking disabled 的情况下，相比 Sonnet 4.5 无 extended thinking，表现预计相近或更好。

示例：

```python
client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8192,
    thinking={"type": "disabled"},
    output_config={"effort": "low"},
    messages=[{"role": "user", "content": "..."}],
)
```

如果你正在使用 extended thinking 和 `budget_tokens`，在 Sonnet 4.6 中仍然可用，但已经弃用。建议迁移到 adaptive thinking，并用 effort 参数控制。

自适应 thinking 特别适合这些工作负载：

自治多步智能体，比如编码智能体、数据分析流水线、bug 查找等。自适应 thinking 让模型能根据每一步动态调整推理程度，并在长轨迹中保持方向。此类任务可以从 `high` effort 开始；如果担心延迟或 token 使用，可以降到 `medium`。

Computer use 智能体。Claude Sonnet 4.6 在 computer use 评估中使用自适应模式取得了很好的准确率。

双模态工作负载，也就是混合简单和困难任务的场景。自适应模式会在简单查询中跳过思考，在复杂问题中深入推理。

使用 adaptive thinking 时，建议在你的任务上评估 `medium` 和 `high`。合适等级取决于质量、延迟和 token 使用之间的权衡。

示例：

```python
client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=64000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},
    messages=[{"role": "user", "content": "..."}],
)
```

如果你暂时需要保留 `budget_tokens`，16k token 左右的预算可以为困难问题提供空间，同时降低 token 失控风险。但这种配置已经弃用，未来版本会移除。

编码场景可以从 `medium` effort 开始：

```python
client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=16384,
    thinking={"type": "enabled", "budget_tokens": 16384},
    output_config={"effort": "medium"},
    messages=[{"role": "user", "content": "..."}],
)
```

聊天和非编码场景可以从 `low` effort 开始：

```python
client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=8192,
    thinking={"type": "enabled", "budget_tokens": 16384},
    output_config={"effort": "low"},
    messages=[{"role": "user", "content": "..."}],
)
```

这篇文章的核心意思可以概括成一句话：**新一代 Claude 更聪明、更直接、更能遵循字面指令，所以提示词要更明确、更具体、更少“过度强制”；同时要用 effort、adaptive thinking、结构化上下文和清晰工具规则来控制成本、质量和行为边界。**
