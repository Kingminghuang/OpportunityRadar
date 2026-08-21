---
name: topic-researcher
description: Use when a user gives an Opportunity Radar opportunity slug and needs the source-backed topic data (daily report opportunity + GitHub Deep Dive research issue) assembled before any article or card is written.
metadata:
  short-description: Turn an OP slug into a source-backed topic-brief
---

# 选题数据获取（topic-researcher）

在 `article-writer` 之前运行：接收用户给定的机会 slug，把「日报里的 opportunity 数据」和「GitHub 上对应的 Deep Dive 研究报告」组装成一个 `topic-brief.json`。`article-writer` 只消费这个文件，不再自己读取日报。

不要直接调用微信 API；不要修改日报 JSON；不要在这里写文章。

## Inputs

- 用户给定的 OP `slug`（必填，小写 kebab-case，如 `ai-session-manager`）。
- 可选 `--report YYYY-MM-DD`：限定该 slug 出现的日报日期；省略时在所有 `_data/reports` 中查找。
- 仓库与凭据：优先脚本内 `GITHUB_TOKEN` / `GITHUB_REPOSITORY` 环境变量，否则自动回退 `gh auth token` 与 git remote origin（本机已登录 gh 时可直接运行）。

## Workflow

1. 运行选题脚本（首选，复用 [`sync-issue-research.mjs`](../../../../scripts/sync-issue-research.mjs) 的解析与校验）：

   ```bash
   node scripts/fetch-topic-research.mjs --slug SLUG [--report YYYY-MM-DD]
   ```

   脚本会：
   - 从 `_data/reports` 定位含该 slug 的日报与 opportunity 对象；
   - **实时同步** `.opportunity-radar/research-index.json`（调用 `sync-issue-research.mjs`，一次全量拉取并解析全部研究 Issue，含章节完整性与 opportunityId 一致性校验）；
   - 从索引中按 `opportunityId = <reportDate>--<slug>` 查询 Deep Dive 研究（如 `ai-session-manager` → Issue #3）；
   - 输出 `artifacts/topic-research/<date>--<slug>.json`。

   - 索引已是最新、只想本地查询时加 `--no-sync`；同步/查询失败时脚本会给出明确错误。

2. 若脚本不可用（无 Node/网络受限），用 gh CLI 手动等价操作：

   ```bash
   gh api 'repos/OWNER/REPO/issues?state=all&per_page=100' --paginate --jq '.[] | select(.body | contains("opportunity-radar:research"))'
   ```

   逐条解析 body 首行元数据，`opportunityId === "<reportDate>--<slug>"` 的 issue 即目标研究数据；body 其余部分（去掉元数据注释行）是研究报告 markdown。

3. 校验 `topic-brief.json`（契约见 [`references/topic-brief-schema.md`](references/topic-brief-schema.md)）：
   - `source.reportDate` / `source.opportunityId` 与 slug 一致；
   - `opportunity` 是日报中完整的 opportunity 对象（含 `opportunity`、`whyNow`、`evidence`、`verdict`）；
   - `research.markdown` 非空，且包含全部必填章节：研究结论、用户与问题、证据、竞品与替代方案、市场与付费、MVP、验证计划、风险与 Kill Criteria。

4. 将 `topic-brief.json` 路径交给 `article-writer`；不要在这里输出文章。

## Output

写入 `artifacts/topic-research/<reportDate>--<slug>.json`：

- `source`：slug、报告日期/路径、`opportunityId`、issue 编号/URL/标题/更新时间；
- `opportunity`：日报中的完整机会对象（事实来源之一）；
- `research`：GitHub Deep Dive 研究报告（`title`、`updatedAt`、`metadata`、`markdown`）。

`topic-brief.json` 是 `article-writer` 的唯一输入。若脚本报错（slug 不存在、无对应研究 Issue、缺少章节），把错误原样反馈给用户，不要用日报字段拼凑研究报告。
