---
title: Claude Code Worktree
date: 2026-02-04
summary: A quick sanity check to make sure the blog pipeline works end to end.
category: Notes
---

Claude Code 的 worktree 功能本质上是把 `git worktree` 包了一层,让你能并行跑多个互不干扰的 Claude 会话——每个会话有自己的目录、自己的分支、自己的上下文。下面是具体玩法。

## 一、最快上手:`--worktree` (或 `-w`)

在仓库根目录里直接:

```bash
claude --worktree feature-auth
# 等价于 claude -w feature-auth
```

Claude Code 会自动做这几件事:
- 在 `.claude/worktrees/feature-auth/` 创建一个新工作目录
- 基于 `origin/HEAD`(远端默认分支)创建一个新分支 `worktree-feature-auth`
- 在这个隔离目录里开启会话

**第一次用前**,需要先在该目录跑一次普通 `claude` 接受 workspace trust 弹窗,否则 `--worktree` 会报错退出。

记得把 `.claude/worktrees/` 加进 `.gitignore`,不然主仓库会一直显示一堆未跟踪文件。

## 二、典型并行工作流

开多个终端 tab,每个一个任务:

```bash
# Terminal 1 — 写新功能
claude -w feature-payments

# Terminal 2 — 修线上 bug
claude -w bugfix-auth

# Terminal 3 — 跑测试覆盖
claude -w add-tests
```

三个 Claude 实例完全互不影响,文件系统级隔离。等任意一个完成,该会话结束时 Claude 会处理 cleanup(见下文)。

还有个进阶技巧:基于一个具体 PR 启动 worktree(用 `#PR号` 或完整 GitHub URL),Claude 会拉 `pull/<number>/head` 并把 worktree 放在 `.claude/worktrees/pr-<number>` —— 非常适合 review 别人 PR 时本地跑一跑。

## 三、解决"env 文件丢失"的痛点

这是最容易踩的坑:worktree 是干净 checkout,你那些 `.env`、`.env.local`、本地配置等 **gitignored 文件不会复制过去**。每次都手动 cp 很烦。

解法是在项目根加一个 `.worktreeinclude` 文件,语法跟 `.gitignore` 一样:

```
.env
.env.local
config/secrets.json
```

规则有个保护机制:**只有同时被 gitignore 且匹配此文件 pattern 的文件才会复制**,所以不会意外把已跟踪文件复制成两份。子代理(subagent)创建的 worktree 和 desktop app 自动创建的 worktree 都遵守这个规则。

依赖呢?`node_modules`、`venv` 这些也不会共享,首次进 worktree 要重新 `npm install` / `pip install`。可以考虑用 pnpm/yarn 的全局 store,或者直接接受这个成本。

## 四、Cleanup 行为(别让 worktree 堆积成山)

会话结束时的逻辑:
- **没有任何改动**:worktree 和分支自动删除
- **有未提交改动、未跟踪文件或新 commit**:Claude 会提示你保留还是删除。删除会**丢失所有未推送的 commit 和未提交改动**,确认清楚再选
- **非交互式 `-p` 跑的**:不会自动清理,要手动 `git worktree remove`

子代理留下的孤儿 worktree,启动时如果超过 `cleanupPeriodDays` 设置且无未提交内容,会被自动清理。

平时维护用 `git worktree list` 看一眼现存的,合并完的及时 `git worktree remove`。

## 五、几个实际中很值的模式

**Work + Review 双会话**:一个 Claude 在 worktree 里写代码,另一个 Claude 在主目录里 review 它的 commits。前者推 commit,后者 pull、读 diff、留 review note,前者改。本质上把"等 Claude 想"的空闲时间填满。

**按模块切分而不是按任务**:`feat/billing-*` 永远进 billing-worktree,`feat/auth-*` 进 auth-worktree。同模块的任务串行共享一个 worktree,跨模块的并行。这样两个 Claude 永远不会同时改一个文件,merge 冲突从根上避免。

**rebase 而不是 merge**:worktree 之间整合时用 rebase 保持 history 线性。Claude 读 `git log` 时对线性链的推理明显更好。

**每个 worktree 写自己的 CLAUDE.md**:加载在会话开始时,告诉这个实例它只负责什么范围、不要碰哪些目录。并行场景下,模糊指令的成本是被放大的——两个 session 可能做出互相矛盾的工作。

## 六、几个常见坑

- **数据库/服务不隔离**:worktree 只隔离文件。两个会话同时跑 migration 打同一个本地 DB 就完蛋。用不同 schema、Docker 容器,或每个 worktree 自己的 `.env` 改连接串。
- **同一分支不能在两个 worktree checkout**:`-w` 自动给独立分支名,但手动管理时注意。
- **实用上限大概 3–5 个**:不是 git 限制,是你切 tab 的脑力上限。再多就该考虑 agent orchestration 而不是手动管理了。
- **想从本地 HEAD 而不是远端默认分支起 worktree**:在 settings 里设 `worktree.baseRef` 为 `"head"`,这样未推送的 commit 和当前分支状态会带过去。
- **非 Git 仓库**(Mercurial、Perforce、SVN):配置 `WorktreeCreate` / `WorktreeRemove` hook 替换默认 git 逻辑,`-w` 的其它行为不变。

## 七、会话中临时要个 worktree

不一定非要启动时就指定。会话进行中你可以直接说"在 worktree 里继续这部分工作",Claude 会用 `EnterWorktree` 工具创建一个并切过去。Desktop app 则更激进——每个新 session 默认就给一个 worktree。

---
