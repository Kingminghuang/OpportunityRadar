# Article Schema

`article.json` 是文章正文与渲染脚本之间的稳定接口。`article-writer` 消费 `topic-brief.json` 写正文，`wechat-newspic-draft` 的 `create_draft.mjs --article` 把它作为 newspic 草稿的 `content`（正文）与 `title`。

## Required shape

```json
{
  "schemaVersion": 1,
  "source": {
    "slug": "ai-session-manager",
    "reportPath": "_data/reports/2026-08-12.json",
    "reportDate": "2026-08-12",
    "opportunityId": "2026-08-12--ai-session-manager",
    "opportunitySlugs": ["ai-session-manager"],
    "issue": {
      "number": 3,
      "url": "<issue-url>",
      "title": "[Deep Dive] AI 编程会话资产化与跨设备连续性"
    }
  },
  "article": {
    "title": "换台电脑，你的 AI 会话还在吗？",
    "body": "AI 编程会话正在从临时聊天变成长生命周期的工作资产……",
    "wordCount": 632,
    "angle": "AI 会话资产化后，跨设备连续性成为真实痛点",
    "audience": "重度 AI coding 用户、开发者",
    "style": "数据 + 叙事",
    "sourceRefs": [
      "opportunity.whyNow",
      "research.markdown:研究结论",
      "opportunity.evidence[0].summary"
    ]
  }
}
```

## Field contract

- `source` 继承自 `topic-brief.json`（`topic-researcher` 产物）：`slug`、`reportPath`、`reportDate`、`opportunityId`、`issue` 都来自 `topic-brief.source`；`opportunitySlugs` 至少包含该 slug（`create_draft.mjs` 用它校验与日报匹配）。
- `article.title` 最多 20 个 Unicode code points；会被用作 newspic 草稿标题（`draft/add.articles[0].title`）。
- `article.body` 是**纯文本**正文，空行分段（`\n\n`）；500–700 字为宜，任何情况不超过 1000 字；最终作为 newspic 草稿 `content`。不要包含 HTML、外部图片 URL 或 Base64。
- `article.wordCount` 以中文字符计（不含标题），用于人工复核长度。
- `article.sourceRefs` 是正文事实句对应的来源路径：`opportunity.*`（日报字段）或 `research.markdown:<章节>`（研究报告章节），不渲染到草稿，但必须足够让人工复核。
Article 是“有来源的编辑叙事”，不是报告字段的扩写。可以新增角度、比喻、场景、问题、解释和行动建议；不能新增没有来源的市场规模、客户、效果、时间线或验证结论。
