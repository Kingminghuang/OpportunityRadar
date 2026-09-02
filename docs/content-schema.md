# Opportunity Radar 内容契约

`_data/reports/` 与 `_data/office-reports/` 中的 JSON 是 Opportunity Radar 每日扫描的唯一内容数据源。ChatGPT 自动化、人工编辑和站点构建必须遵循本文件；站点不再读取 `_posts/` Markdown。完成深挖后的完整研究报告由 [`research-issue-schema.md`](./research-issue-schema.md) 定义，并以对应 GitHub Issue 正文为唯一内容源。

## 轨道（Track）

Opportunity Radar 分为两条完全独立的轨道，各自使用独立提示词、独立来源池与独立输出目录；同一天可各有一份报告，互不影响。

| 轨道 | `track` 值 | 输出目录 | 提示词 | 深挖稳定 ID |
| --- | --- | --- | --- | --- |
| 开发者 | `developer`（默认） | `_data/reports/YYYY-MM-DD.json` | `automate_prompt.md` | `{date}--{slug}` |
| 白领办公 | `office` | `_data/office-reports/YYYY-MM-DD.json` | `automate_prompt_office.md` | `office-{date}--{slug}` |

`track` 必须与所在目录一致：`_data/reports/` 下的报告 track 只能是 `developer`，`_data/office-reports/` 下的只能是 `office`；不一致将导致构建失败。

## 文件规则

- 路径固定为 `<track目录>/YYYY-MM-DD.json`：开发者轨道 `_data/reports/`，白领轨道 `_data/office-reports/`。
- 日期使用 `Asia/Shanghai` 当地日期，文件名日期必须等于 JSON 的 `date`。
- 每条轨道每天最多一份报告；同日重跑时更新原 JSON，不创建重复文件。
- 每份报告包含 1–5 个机会；`rank` 和 `slug` 均必须在同日报内唯一。

## 完整样例

```json
{
  "schemaVersion": 1,
  "date": "2026-08-12",
  "timezone": "Asia/Shanghai",
  "track": "developer",
  "title": "每日机会扫描 — 2026-08-12",
  "summary": "一句话总结当天最重要的机会信号。",
  "categories": ["opportunities"],
  "opportunities": [
    {
      "rank": 1,
      "slug": "ai-session-manager",
      "title": "AI 编程会话资产化与跨设备连续性",
      "category": "developer-tools",
      "decision": "deep-dive",
      "score": { "total": 23, "demand": 5, "payment": 4, "mvp": 5, "competition": 4, "acquisition": 5 },
      "opportunity": "明确描述用户、痛点和可做的产品。",
      "whyNow": "说明触发需求的近期变化。",
      "evidence": [
        { "title": "证据标题", "url": "https://example.com/source", "sourceType": "github-issue", "publishedAt": "2026-08-12", "summary": "可核验的需求摘要。" },
        { "title": "第二条证据", "url": "https://example.com/source-2", "sourceType": "hacker-news", "summary": "独立交叉验证。" }
      ],
      "verdict": "明确的下一步判断。",
      "tags": ["Agent", "开发者工具"]
    }
  ],
  "priorities": {
    "deepDive": { "slug": "ai-session-manager", "reason": "为什么最值得深挖。" },
    "fastestMvp": { "slug": "ai-session-manager", "reason": "为什么最快可做 MVP。" },
    "highestCommercialValue": { "slug": "ai-session-manager", "reason": "为什么商业价值最高。" },
    "needsValidation": { "slug": "ai-session-manager", "reason": "还需要验证什么。" }
  },
  "scanNotes": {
    "coverageWindow": "2026-08-05 至 2026-08-12",
    "sources": ["GitHub Issues", "Hacker News"],
    "limitations": "无法稳定读取或不具备明确需求证据的平台不纳入结论。"
  }
}
```

## 字段规则

| 位置 | 规则 |
| --- | --- |
| `schemaVersion` | 必填，固定为整数 `1`。 |
| `date` / `timezone` | 必填；`date` 为有效 `YYYY-MM-DD`，`timezone` 固定 `Asia/Shanghai`。 |
| `track` | 必填枚举：`developer`（默认）或 `office`；必须与所在目录一致（见“轨道”一节）。 |
| `title` / `summary` | 必填非空文本。 |
| `categories` | 必填数组，必须包含 `opportunities`。 |
| `opportunities` | 必填数组，1–5 项。 |
| `rank` | 必填整数 1–5，同日报唯一。 |
| `slug` / `category` | 必填小写 kebab-case，例如 `agent-browser-replay`。 |
| `decision` | 必填枚举：`deep-dive`、`watch`、`skip`。网站显示为“深挖 / 观察 / 跳过”。 |
| `score` | 必填对象；`total` 为 0–25 整数，五项子评分均为 0–5 整数，且 `total = demand + payment + mvp + competition + acquisition`。 |
| `opportunity` / `whyNow` / `verdict` | 必填非空文本，分别表达产品机会、时机和结论。 |
| `evidence` | 必填数组，2–4 条。每条都有非空 `title`、绝对 URL、`sourceType`（`github-issue`、`hacker-news`、`reddit`、`product-hunt`、`indie-hackers`、`product-feedback`、`software-review`、`role-community`、`procurement`、`regulatory`、`community`、`other`）、非空 `summary`；`publishedAt` 可选，若有必须是有效日期。白领轨道（`office`）应优先使用其对应枚举：`product-feedback`（产品反馈）、`software-review`（软件评论）、`role-community`（角色社区）、`procurement`（政府采购）、`regulatory`（法规/税务）、`community`（通用办公/论坛），GitHub/HN 等开发者来源仅在确实相关时使用。 |
| `tags` | 必填、至少一个非空标签。 |
| `priorities` | 四项都必填：`deepDive`、`fastestMvp`、`highestCommercialValue`、`needsValidation`。每项的 `slug` 必须引用本报告内机会，且有非空 `reason`。 |
| `scanNotes` | 必填对象，包含非空 `coverageWindow`、至少一个 `sources` 和非空 `limitations`。 |

## 写入前检查

自动化写入前必须检查 JSON 可解析、所有必填字段存在、日期与文件名一致、总分计算正确、`rank`/`slug` 唯一、分类与判断值合法、证据链接完整、所有优先级引用存在。任一检查失败时，不写入仓库并说明原因。

## 派生 Markdown 归档

Markdown 归档不是内容输入，也不提交回仓库。`npm run build` 和 GitHub Pages 的 `npm run build:pages` 会在 JSON 校验与 Astro 构建完成后，自动为每一份 `_data/reports/YYYY-MM-DD.json` 生成 `dist/archives/YYYY-MM-DD.md`，为每一份 `_data/office-reports/YYYY-MM-DD.json` 生成 `dist/archives/office/YYYY-MM-DD.md`。

- 归档文件包含稳定锚点、机会论证、评分表、证据链接、优先级和扫描说明。
- 文件顶部有 `Generated from ... Do not edit.` 标记；对归档的修改会在下次构建被覆盖。
- JSON 无法通过校验时，Astro 构建失败，归档不会生成或部署，因此线上保留上一次成功版本。
