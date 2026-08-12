# Opportunity Radar 内容契约

`_posts/` 中的 Markdown 是 Opportunity Radar 的唯一数据源。ChatGPT 自动化、人工编辑和站点构建都必须遵循本文件。

## 文件规则

- 路径固定为 `_posts/YYYY-MM-DD-daily-opportunities.md`。
- 日期使用 `Asia/Singapore` 当地日期，且文件名日期必须等于 front matter 的 `date`。
- 每天最多一篇报告；同日重跑时更新原文件，不新建重复文件。
- 报告包含 1–5 个机会；每个机会在该日报内的 `slug` 必须唯一。

## Front matter

```yaml
---
layout: post
title: "每日机会扫描 — 2026-08-12"
date: 2026-08-12
summary: "一句话总结当天最重要的机会信号。"
categories: [opportunities]
opportunities:
  - slug: ai-session-manager
    title: "AI 编程会话资产化与跨设备连续性"
    score: 23
    demand: 5
    payment: 4
    mvp: 5
    competition: 4
    acquisition: 5
    category: developer-tools
    decision: "深挖"
---
```

| 字段 | 类型与规则 |
| --- | --- |
| `layout` | 必填，固定为 `post`。保留以兼容既有 Markdown。 |
| `title` | 必填，非空文本；格式为 `每日机会扫描 — YYYY-MM-DD`。 |
| `date` | 必填，`YYYY-MM-DD`，与文件名日期一致。 |
| `summary` | 必填，非空的一句话中文摘要。 |
| `categories` | 必填数组，必须包含 `opportunities`。 |
| `opportunities` | 必填数组，包含 1–5 个机会对象。 |
| `slug` | 必填，小写 kebab-case，例如 `agent-browser-replay`。 |
| `title` | 必填，机会的清晰中文名称。 |
| `score` | 必填整数，0–25，必须等于五项子评分之和。 |
| `demand`、`payment`、`mvp`、`competition`、`acquisition` | 必填整数，各为 0–5。 |
| `category` | 必填，小写 kebab-case，例如 `ai-infra`、`developer-tools`、`hr-tech`。 |
| `decision` | 必填，只能为 `深挖`、`观察` 或 `跳过`。 |

## 正文与锚点

正文保留完整的机会描述、为什么现在、2–4 个可核验来源、评分、判断、今日优先级与扫描说明。每个机会标题前必须放置稳定锚点，供 Radar 卡片跳转：

```html
<a id="opportunity-ai-session-manager"></a>

## 1. AI 编程会话「资产化 + 跨设备连续性」 — 23/25
```

锚点中的 slug 必须与该机会的 `opportunities[].slug` 完全一致。

## 写入前检查

自动化写入前必须检查：所有必填字段存在；总分计算正确；slug、分类和判断值合法；每个 slug 都有对应锚点；正文含完整证据链接。任一检查失败时，不写入仓库并说明失败原因。
