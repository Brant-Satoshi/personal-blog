---
title: Generative UI：让 LLM 直接生成 UI 界面，而不只是文字墙
date: 2026-05-26
summary: Google Research 的 Generative UI 论文翻译与梳理。配合合适的 prompt 与工具，现代 LLM 可以稳定地为任意输入生成一个完整、可交互的网页，而不是再吐出一段 markdown。在 LMArena 上对比 markdown 输出，Generative UI 被偏好 82.8%；对比人类专家手写的网站，也在约 50% 的 case 中达到可比水平。
category: AI
---

原文是 Google Research 在 arxiv 上发的论文 [Generative UI: LLMs are Effective UI Generators](https://arxiv.org/abs/2604.09577)（Yaniv Leviathan 等人，2026）。这里做一份中文翻译和梳理。论文配套的可交互样例在 [generativeui.github.io](https://generativeui.github.io)。文中插图均出自论文原文（图片版权归原作者所有）。

![论文 Figure 1：Generative UI 实现产出的若干结果总览](/posts/generative-ui/figure-1.jpg)

## TL, DR

如今 LLM 的输出几乎都是「markdown 文字墙」。这篇论文展示了：在合适的 system prompt + 工具集（图像生成、搜索）配合下，现代 LLM 可以稳定地为任意 prompt 直接生成一个完整、可交互的 HTML 网页——一个面向当前这次提问、即时构造出来的「专属应用」。在人工评测中，这种生成式 UI 大幅好于 markdown 输出，并且在约 50% 的 case 上接近人类专家手写的网站。论文同时把这种能力定性为「涌现能力」：从 Gemini 2.0 Flash-Lite 到 Gemini 3，错误率从 60% 降到 0%，ELO 从 1183 跳到 1706。

## 摘要

> AI 模型擅长创造内容，但通常用静态的、预先设计好的界面来呈现这些内容。具体来说，LLM 的输出通常是一段 markdown「文字墙」。Generative UI 是一个由来已久的承诺：让模型生成的不只是内容，而是界面本身。在此之前，Generative UI 还无法以一种稳健的方式被实现。我们展示了：在合适的 prompt 与工具配合下，一个现代 LLM 可以为几乎任何 prompt 稳定地生成高质量的定制 UI。在忽略生成速度的情况下，我们这套实现产出的结果，被人类评测者压倒性地偏好于标准的 LLM markdown 输出。事实上，虽然结果仍不如人类专家亲手打造的网站，但在 50% 的 case 中至少与之相当。我们还证明了这种稳健的 Generative UI 能力是一种涌现能力，相比上一代模型有显著跃迁。我们同时构建并发布了 PAGEN——一份由专家手工打造结果组成的新数据集，用于评测 Generative UI 系统，也包括我们系统的输出以便后续比较。可交互样例见 [generativeui.github.io](https://generativeui.github.io)。

## 1. 引言：为每个 prompt 召唤一支 AI 团队

今天的 AI 模型在生成内容这件事上很强：文本、代码、图像、视频都能产。但这些内容最终的呈现方式，几乎都是预先写死、预先设计好的界面。Generative UI 是一种新的模态：让模型不只产出内容，而是产出整个用户体验——根据 prompt 即时生成一个定制化的、可交互的页面，可以包含富格式、图像、地图、音频，乃至模拟器和小游戏，而不是再交付一面「文字墙」。

**给每个 prompt 一支瞬时 AI 团队。** 今天那些丰富的视觉界面，都是产品经理、UX 设计师、工程师组成的团队，花大量时间为某个「共性广、用户多」的场景打磨出来的。Generative UI 相当于：针对当前这一次具体的 prompt，在一分钟内拉起一支 AI 版的产品/设计/工程团队，专门为它造一个交互式体验。虽然不如人类专家，但它让「为任意 prompt 定制专属体验」第一次成为可能。

目前 LLM 主流的交互界面，是基于 markdown 的聊天界面：模型输出带标题、emoji、表格、代码块的 markdown。相比纯文本，这已经好读很多，但本文方法产出的结果仍然被压倒性地更偏好（见后文表 2）。评测方法是人类两两偏好打分，并构建并发布了 PAGEN 数据集——一份由人类专家针对各种 prompt 手工写出的网页集合（详见第 4 节）。专家网站整体仍优于本系统，但在很大比例的 prompt 上结果已经可比，这是首次。

## 2. 方法

系统的输出是一个完整的、自包含的 HTML 网页（外加图像等附带资产），在用户浏览器里直接渲染。整体由 3 个主要组件构成：

1. **一个服务端**，对外暴露若干 endpoint，让模型可以调用关键工具——比如图像生成、图像搜索、网页搜索。这些工具的结果可以回灌给模型（提升质量），也可以直接送到浏览器（提升效率）。
2. **精心设计的 system instructions**，包含：(1) 目标，(2) 规划/思考指南，(3) 示例，(4) 一大段技术说明——格式规范、endpoint 使用手册、避坑提示等。这部分直接决定生成质量。论文附录 A.5 给了一个约 3000 词的早期 prototype 完整 prompt，下文会单独讲。
3. **一组轻量后处理器**，用来修补常见问题（如修复 JS 错误、注入 API key、转义 HTML 属性、移除幻觉资产等），同时负责错误上报与页面分析。

![论文 Figure 2：系统总体架构示意](/posts/generative-ui/figure-2.png)

### 2.1 风格一致性

如果希望生成结果在多次生成之间保持视觉风格一致，只需要对 system prompt 做小范围修改：把原本简短的 "Style" 段落，换成一段更详细的版本（论文里命名为 "Classic" 和 "Wizard Green"），具体指定颜色、字体等。模型会乖乖跟随这些风格，更有意思的是，它会**自动把生成的图像、图标也对齐到这个风格**，而不是只调整 CSS。

![论文 Figure 3：使用 "Classic" 风格生成结果的截图](/posts/generative-ui/figure-3.png)

![论文 Figure 4：使用 "Wizard Green" 风格生成结果的截图](/posts/generative-ui/figure-4.png)

## 3. 结果

评测方式：在多种结果形式之间做两两人工偏好对比，包括——

- **专家手写的定制网站**（来自 PAGEN，详见第 4 节）
- **该 query 的 Google 搜索 top 1 网站**
- **纯文本**（LLM 无 markdown 输出）
- **标准 LLM markdown 输出**
- **本文的 Generative UI 实现**

从 LMArena (Chiang et al., 2024) 随机采样 100 个 prompt（其中 8 个去掉，理由见附录 A.4）。每个对比由 2 名评测者用三档打分：左偏好 / 平局 / 右偏好。**生成耗时不计入评测**，给评测者展示的是预先缓存好的结果。除了 LMArena，作者还自构了一组「信息检索类」prompt（附录 A.3，共 100 条），按同样方法评估。

LMArena 上的 ELO 与两两对比胜率如下：

### 表 1：用户偏好 ELO 分数（LMArena）

| 形式 | ELO |
| --- | --- |
| 网站（人类专家） | **1800.3** |
| Generative UI | **1736.2** |
| Generative Markdown | 1437.7 |
| 网站（搜索 top 1） | 1352.2 |
| Generative Text | 1173.7 |

### 表 2：两两胜率（LMArena）

行 = 选了哪一方，列 = 对手。除了被人类专家压制，Generative UI 对其他所有形式都呈压倒性优势。

| 方法 | vs 专家网站 | vs Generative UI | vs Markdown | vs 搜索网站 | vs 纯文本 |
| --- | --- | --- | --- | --- | --- |
| 网站（专家） | — | 50.0% | 90.6% | 91.1% | 97.3% |
| **Generative UI** | **35.3%** | — | **82.8%** | **90.0%** | **97.0%** |
| Markdown | 6.1% | 13.9% | — | 44.4% | 81.1% |
| 网站（搜索） | 6.7% | 6.7% | 52.2% | — | 58.9% |
| 纯文本 | 2.7% | 3.0% | 1.1% | 38.3% | — |

关键数字：Generative UI 相对 Markdown 的胜率是 **82.8%**；面对人类专家的网站，能在 **35.3%** 的 case 中胜出，加上平局，约一半 case 上不输。信息检索类 prompt 上的趋势类似，Generative UI 对 Markdown 的胜率进一步上升到 **90.5%**（附录表 6、7）。

### 3.1 涌现能力

论文对 backbone 模型做了消融，证明 Generative UI 是一种与新模型一同出现的「涌现能力」。在 LMArena 和 Info-Seeking 两个 prompt 集上，新一代 Gemini 模型在用户偏好和错误率两个维度都显著好于上一代——而且差距大到无法用「线性进步」来解释。

### 表 3：不同 backbone 模型的表现（LMArena）

| Backbone 模型 | ELO | 输出错误率 |
| --- | --- | --- |
| **Gemini 3** | **1706.7** | **0%** |
| Gemini 2.5 Pro | 1653.6 | 0% |
| Gemini 2.5 Flash | 1623.9 | 0% |
| Gemini 2.0 Flash | 1332.9 | 29% |
| Gemini 2.0 Flash-Lite | 1183.0 | **60%** |

### 表 4：不同 backbone 模型的表现（Info-Seeking）

| Backbone 模型 | ELO | 输出错误率 |
| --- | --- | --- |
| **Gemini 3** | **1739.31** | 0% |
| Gemini 2.5 Pro | 1578.53 | 0% |
| Gemini 2.5 Flash | 1577.74 | 0% |
| Gemini 2.0 Flash | 1361.75 | 0% |
| Gemini 2.0 Flash-Lite | 1242.67 | 1% |

从 Flash-Lite 到 Gemini 3，错误率从 60% → 0%，ELO 提升超过 500 分。同样的 prompt、同样的工具，仅换模型就能拉出这种差距，是论文把它归类为「涌现能力」的依据。

### 3.2 Prompt 消融

论文还对自家 prompt 策略做了消融。对照组是一份「最小 prompt」——只告诉模型如何使用图像搜索、图像生成，以及如何输出合法 HTML。结果是完整 prompt 在显著更多 case 中胜出。继续从完整 prompt 中拿掉「核心理念」与对应示例，又会进一步下降。

### 表 5：Prompt 策略的影响（LMArena）

| Prompt 设置 | ELO |
| --- | --- |
| **完整 prompt** | **1553.23** |
| 最小 prompt | 1496.00 |
| 去掉「核心理念」 | 1450.77 |

有趣的是，即使只给最小 prompt，模型也已经能给出相当不错的结果——这本身也是一种涌现能力的旁证。

## 4. PAGEN 数据集

为了让 Generative UI 的评测有一个清晰、一致的对照组，作者构造了 PAGEN：一份「专家人类针对 prompt 手写」的网站数据集，覆盖了本文用到的 LMArena 与 Info-Seeking 两个 prompt 集。PAGEN 公开发布，以便后续工作做一致的对比。

收集方式上，作者考虑过三种选项：直接用现存的公开网站、用已有的数据集、找承包商专门做。最终选了第三种——通过 Upwork 雇佣评分较高的独立网页开发者。这样做的好处是：

- 能把「具体 prompt」和「最终网站」干净地配对；
- 在投入时间与成本上保持一致；
- 可以对所有 case 下达一致的指南（强调可交互、视觉质量高）；
- 用户体验优先，不会被 SEO 等外部因素干扰；
- 不引入版权内容；
- 工具一致（鼓励使用 AI 工具）；
- 承包商的多样性与质量可控。

数据采集的具体细节在附录 A.4，简而言之：联系了 34 位承包商，18 位接受邀约，每位制作 5–20 个网站，每个网站报酬 100–130 美元，平均耗时 3–5 小时。承包商在工具选择上完全自主（也允许使用 AI 工具），仅要求最终交付 zip 后的 HTML 文件。

## 5. 相关工作

从高层描述自动生成 UI，是 HCI 与软件工程长期以来的目标。本文工作建立在三条线索之上：

**从自然语言生成 UI。** 早期方法多依赖结构化输入或受限语言，针对特定平台生成界面（Puerta et al., 1994；Landay & Myers, 1995）。深度学习兴起后，方法演化到把视觉输入——手绘草图、截图——直接翻译为代码（Beltramelli, 2017；Gui et al., 2025）。近期强大 LLM 的出现，使得从无结构自然语言直接生成 UI 代码成为可能。本文的差异在于：让 LLM 从单个 prompt 出发，生成一个完整的、可交互的、数据驱动的 Web 应用，实际上是在让它扮演一个自主 Web 开发者。

**LLM 代码生成。** 这块能力是本系统的底座，从 Codex (Chen et al., 2021) 开始就在快速进步，到 AlphaCode (Li et al., 2022)、Code Llama (Rozière et al., 2024) 等。这些模型常被当作开发者的副驾驶（如 GitHub Copilot）使用，本文则把它用在另一种场景：自主、端到端地生成一个完整的面向用户的产品，而不只是代码片段。论文指出，这种「构思并实现一个完整应用」的能力，呈现为最新 SOTA 模型的涌现属性。

**AI 的交互范式。** LLM 当前的标准 UI 是聊天 + markdown 渲染，本质上仍是静态的。一些系统探索过中间态——本文称为「Templated UI」：LLM 可以调用并填充一组预定义、固定库里的可交互组件来丰富回答 (Pinsky, 2023)。本文工作则更进一步——既不是静态 markdown，也不是受限模板，而是让模型直接生成 UI 本身，从而解锁针对每个 prompt 量身定制的、动态的、高度上下文化的体验——游戏、模拟器、定制数据可视化都可以。

## 6. 讨论

作者展示了 Generative UI 的一种实现：模型可以为任意 prompt 生成定制的、可交互的视觉界面。

- **效果**：忽略生成时间时，结果在 83% 的 case 中被压倒性地偏好于标准 markdown UI（表 2）。
- **涌现**：表 3、表 4 显示，使用最新模型时偏好与错误率都有断崖式改善。
- **实现关键**：把工具以易用方式暴露给模型 + 详细 system instructions（附录 A.5）+ 后处理器修补常见问题。

**关于 PAGEN。** 作者强调这是一份「专家人类为 LLM prompt 手工建站」的数据集。虽然专家整体仍优于本系统，但 Generative UI 已经能在 50% 的 case 上至少与之相当。PAGEN 公开发布，希望后续工作能用同一把尺子。

**局限与未来方向。**

- **速度**：当前最大的硬限制，一次生成往往要一两分钟。流式渲染让用户可以提前与部分页面交互，把感知时延砍掉约一半。Speculative decoding (Leviathan et al., 2022) 等加速手段还能继续压榨。
- **错误**：偶发的 JavaScript / CSS / HTML 错误依然存在。

**通往新范式的第一步。** LLM 把人类有限的文本集合，变成了无限集合——可以为任何需要、即时生成一段一次性文本。这件事被证明非常有用。Generative UI 还在早期，但作者描绘的方向是：未来用户不必再从有限的应用库或视觉页面中挑选，而是面对一个无限目录，其中每次都按当前需要、即时生成出最贴合的、一次性的界面。

## 附录 A：精选示例

完整可交互演示在 [generativeui.github.io](https://generativeui.github.io)。论文里给了几个值得拎出来的例子：

- **A.1.1 Fractal Explorer** — prompt: 「Explain fractals — go really in depth — i want to learn everything about it in detail」。系统产出了一个沉浸式的可交互页面：Hausdorff 维度计算器、Mandelbrot 集与对应 Julia 集的双画布联动（跟随鼠标实时变化）、迭代构造 Koch 雪花和 Sierpinski 三角形的滑块、用 Chaos Game 生长 Barnsley 蕨类植物的模拟，最后还有一节讲分形在科技、生物、计算机图形里的实际应用。

![论文 Figure 5："Explain fractals" 生成的 web app](/posts/generative-ui/figure-5.png)

- **A.1.2 History of Time Keeping Devices** — 系统生成了一个标题为 "Chronos: A History of Timekeeping" 的暗色主题滚动页：垂直时间轴动画串起 6 个时代，从埃及方尖碑、水钟，到惠更斯的机械摆轮革命，再到石英与原子钟的精度时代，每个时间轴节点配上主题图与「关键洞察」浮窗。

![论文 Figure 6："History of Time Keeping Devices" 生成的 web app](/posts/generative-ui/figure-6.png)

- **A.1.3 Memory Game** — prompt 是「做一个翻牌记忆游戏，卡牌上是带搞笑道具的人物表情」。系统直接生成了可玩的 "Funny Faces Memory Match" 翻牌游戏：响应式网格、3D 翻牌动效、配对状态跟踪、步数计数、过关弹窗。

![论文 Figure 7："Memory Game" 生成的 web app](/posts/generative-ui/figure-7.png)

- **A.1.4 Basketball Math** — prompt 是「给我 5 岁的儿子，用爱打篮球的可爱小生物，教他加减乘和二进制」。系统生成了 "Little Ballers Math Academy"：中央菜单提供四种游戏模式——加法 (Passing Practice)、减法 (Taking Shots)、乘法 (Team Drills)，以及一种用切换开关表示二进制的「外星球记分牌」挑战，配合实时计分与彩带特效。

![论文 Figure 8："Basketball Math" 生成的 web app](/posts/generative-ui/figure-8.png)

附录 A.3 列出了完整 100 条 Info-Seeking prompt，覆盖人物（Jeff Dean、Taylor Swift、Marie Curie）、教学（量子计算高中版、用咖啡机讲热力学）、视觉/导航（NYC 8 Spruce St 与 56 Leonard 对比、freedom trail 地图）、规划（日本之旅、SF 周末）、产品对比（电动滑板车、空气炸锅）、迷你应用（迷宫生成器、emoji 建模器、机器人拳击）等。

## 附录 A.5：System Instructions（节选要点）

论文公开了一份早期 prototype 的完整 system prompt（约 3000 词，5 个类别：核心理念、示例、规划、技术细节与端点使用、动态注入信息）。完整 prompt 太长，这里挑出最能体现设计意图的几条规则：

**核心理念**

- **优先做可交互应用**：哪怕是「特拉维夫现在几点？」「天气怎样？」这种本可以一句话回答的问题，**也要做成一个可交互应用**（动态时钟应用、能刷新的天气小部件），而不是返回静态文本。
- **拒绝文字墙**：避免长段纯文本，尽量用可交互或可视化元素来承载信息。
- **事实必须通过搜索验证（对实体强制）**：当 prompt 涉及具体实体（人、地点、组织、品牌、事件等）或事实性数据（日期、统计、时事）时，**必须**调用 Google Search 收集和验证，绝对不能只依赖内部知识。
- **绝对禁止占位符**：不能有 placeholder 控件、mock 功能或假数据。如果某元素没有后端支撑，直接删掉，不要假装它能用。
- **完整、深思熟虑地实现**：复杂功能用 JS 完整实现，慢慢想清楚逻辑再写。
- **创造性处理数据需求**：先用 search 拿到所有可能需要的数据，再据此设计能完全落地的方案。**禁止模拟或虚构任何数据 / 功能。**
- **质量与深度优先**：要做的是「真正能用、跑真实数据」的应用，而不是 demo。

**强制的内部思考流程（生成 HTML 之前）**

1. **解读 query**：分析 prompt 与历史，是否强制需要搜索？需要做哪种可交互应用？
2. **规划应用形态**：定义核心可交互功能与设计。
3. **规划内容**：故事线、角色、角色简短的视觉描述。这部分仅内部使用，不要直接放进可见页面里。
4. **识别数据/图片需求**：规划强制性的搜索查询，决定每张图用「生成」还是「检索」，整理好 `src` 的格式（`/image?query=…` 或 `/gen?prompt=…`）。
5. **执行搜索（内部）**：勤勉地使用 Google Search 验证事实，必要时多轮 follow-up。
6. **头脑风暴功能（约 12 项）**：UI 组件、可交互特性、数据展示，规划好图片 `src` URL。
7. **筛选并整合**：剔除弱想法或无法验证的事实，把剩下的好功能全部整合进去。

**输出格式**

- **关键 — HTML 代码标记强制要求**：最终输出必须用 html 代码标记包裹完整 HTML 页面，标记内部除了纯 HTML 之外不允许有任何其他内容（注释、总结、搜索结果、解释、markdown 都不行）。
- **完整 HTML 页面**：从 `<!DOCTYPE html>` 到 `</html>`，标准结构。
- **使用 Tailwind CSS**：通过 Play CDN 引入 `<script src="https://cdn.tailwindcss.com"></script>`。
- **内联 CSS / JS**：自定义 CSS 用 `<style>` 标签，应用 JS 逻辑用 `<script>` 标签。
- **响应式**：要在桌面、移动、平板上都好看。
- **外链新开 tab**：所有外链 `target="_blank"`。

**图片处理策略**

- 必须使用标准 `<img>` 标签 + 指向后端 endpoint 的 `src`。禁止 `<div>` 占位、禁止用 JS 加载图。
- **生成（`/gen` endpoint）**：用在通用概念、创意插画、抽象图像，以及那些图像生成模型很熟悉的全球知名地标。`<img src="/gen?prompt=URL_ENCODED_PROMPT&aspect=ASPECT_RATIO" alt="...">`。
- **图像搜索（`/image` endpoint）**：用在具名人物、不那么知名的场所/建筑/物件/事件，以及需要真实照片的情况。`<img src="/image?query=URL_ENCODED_QUERY" alt="...">`。
- **跨图一致性**：涉及同一人/角色/元素的多张图，必须预先写一段清晰的细节描述，并在每条 prompt 里完整复用。
- **不允许透明**：所有图都是不透明的，设计时不要假设透明背景。

**音频策略（按需）**

- 教学语言/教阅读时，可以用 `window.speechSynthesis` TTS。
- 游戏或视听场景里需要背景音乐时，用 Tone.js 自己合成旋律。
- 需要音效时，同样用 Tone.js。

**JavaScript 规范**

- 用 `DOMContentLoaded` 保证 DOM 就绪再执行。
- 复杂逻辑包 `try...catch` 并打 `console.error`。
- 所有 JS 完全在生成页面的上下文里运行，**禁止访问 `window.parent` 或 `window.top`**。
- **禁止使用 `localStorage` / `sessionStorage`**。

## 附录 A.6：Post-Processors

这些 post-processor 要么补齐运行所需的支持（如注入 API key），要么修复生成结果中的常见问题：

1. 把生成代码里的 API key 占位符替换成真实 key（如 Google Maps）。
2. 注入用于检测和上报客户端错误的 JS。
3. 修复因模型解析问题导致的 JS 错误。
4. 修复 Tailwind CSS 指令缺失导致的 CSS 错误。
5. 修复 Tailwind 的循环依赖。
6. 确保 HTML 属性里的文本字符被正确转义。
7. 移除被错误地写进 JS 代码里的引用标注。
8. 修复常见的 API 问题（例如 Maps）。
9. 修复幻觉资产的常见问题（例如图标）。

## 几点我自己的观察

**第一，「Generative UI 是涌现能力」这条结论并不是嘴硬。** 表 3 给的是同一套 system prompt、同一套工具、同一份评测集，只换 backbone。从 Gemini 2.0 Flash-Lite 到 Gemini 3，错误率 60% → 0%，ELO 涨了 500 多。这意味着这件事不是「prompt 工程的胜利」，而是模型本身的代码生成 + 长程规划能力到了某个阈值才解锁的。

**第二，system prompt 长得像一份岗位说明书。** 附录 A.5 给出的 prompt 不是「请生成一个漂亮的网页」这种泛指，而是把整个生产规范——内部思考流程、强制搜索、禁止占位符、图像 `src` 命名、Tailwind 引入方式、JS 沙盒约束——写成一份给「自主前端工程师」的工作手册。读起来更像 staff engineer 给新人写的 onboarding，而不是 prompt。

**第三，PAGEN 的对照组选择很说明问题。** 评测里把 Generative UI 拿去和「Google 搜索 top 1 网站」「人类承包商专门为这个 prompt 写的网站」对比，而不是和「LLM 之间相互对比」。这把评测从「哪个模型更好」抬到了「能不能取代一支真人小队」的层级。

**第四，"Markdown UI 是过渡形态"的论断值得记一下。** 论文把当前 LLM 主流交互——markdown chat——定性为一种过渡产物。把这个观点放进做产品的视角里，问题就变成：什么场景下，「一次性生成专属界面」比「文字回答 + 复用通用界面」更划算？目前看是知识检索、教学解释、可视化对比、规划类——也就是论文 Info-Seeking 集覆盖的那些。

**第五，生成耗时仍是硬约束。** 1–2 分钟生成一次页面，对很多用例已经太慢。流式渲染能砍一半，speculative decoding（顺便，本文一作 Yaniv Leviathan 同时也是 speculative decoding 的作者）能再压一刀。这件事会不会从「酷炫 demo」变成「主流 UI」，最终很可能取决于推理速度的下一波改进。
