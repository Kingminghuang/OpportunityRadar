# Topic Brief Schema

`topic-brief.json` 是选题数据与 `article-writer` 之间的稳定接口。`topic-researcher` 从日报与 GitHub Deep Dive issue 组装它，`article-writer` 只读它，不再直接读取日报。

## Required shape

```json
{
  "schemaVersion": 1,
  "source": {
    "slug": "ai-session-manager",
    "reportDate": "2026-08-12",
    "reportPath": "_data/reports/2026-08-12.json",
    "opportunityId": "2026-08-12--ai-session-manager",
    "issue": {
      "number": 3,
      "url": "https://github.com/Kingminghuang/OpportunityRadar/issues/3",
      "title": "[Deep Dive] AI 编程会话资产化与跨设备连续性",
      "updatedAt": "2026-08-13T16:17:53Z"
    }
  },
  "opportunity": {
    "rank": 1,
    "slug": "ai-session-manager",
    "title": "AI 编程会话资产化与跨设备连续性",
    "category": "developer-tools",
    "decision": "deep-dive",
    "score": { "total": 23, "demand": 5, "payment": 4, "mvp": 5, "competition": 4, "acquisition": 5 },
    "opportunity": "…日报 opportunity 字段…",
    "whyNow": "…日报 whyNow 字段…",
    "evidence": [ { "title": "", "url": "", "sourceType": "", "publishedAt": "", "summary": "" } ],
    "verdict": "…日报 verdict 字段…",
    "tags": ["…"]
  },
  "research": {
    "title": "[Deep Dive] AI 编程会话资产化与跨设备连续性",
    "updatedAt": "2026-08-13T16:17:53Z",
    "metadata": {
      "version": 1,
      "opportunityId": "2026-08-12--ai-session-manager",
      "originReport": "2026-08-12",
      "originSlug": "ai-session-manager",
      "status": "research-complete",
      "siteSummary": "…"
    },
    "markdown": "## 研究结论\n…（完整 Deep Dive 研究报告，含 8 个必填章节）…"
  }
}
```

## Field contract

- `source.slug` 必须是小写 kebab-case；`source.opportunityId` 必须等于 `<reportDate>--<slug>`。
- `source.reportPath` 是相对仓库根的日报路径；`source.issue` 指向 GitHub 上的 Deep Dive 研究 issue。
- `opportunity` 是日报 JSON 中该 slug 的**完整**机会对象（`scripts/fetch-topic-research.mjs` 原样嵌入），字段以 `docs/content-schema.md` 为准。
- `research.metadata` 来自 issue body 首行 `<!-- opportunity-radar:research {紧凑JSON} -->`，其中 `opportunityId` 必须与 `source.opportunityId` 一致；`research.markdown` 是去掉元数据注释后的研究报告正文，必须包含全部 H2 章节：研究结论、用户与问题、证据、竞品与替代方案、市场与付费、MVP、验证计划、风险与 Kill Criteria。

## 事实层级（article-writer 写作时遵循）

- 日报 opportunity（`opportunity.opportunity/whyNow/evidence/verdict`）与研究报告（`research.markdown`）都是事实来源；研究报告通常比日报更完整、更新，写作时可优先使用，但不得偏离两者给出的结论。
- `sourceRefs` 可指向 `opportunity.*`（日报字段）或 `research.markdown:<章节>`（研究报告章节）；两个来源的说法冲突时，以报告为准并向用户说明。
