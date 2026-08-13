# 深挖 Issue 内容契约

GitHub Issue 正文是 Opportunity Radar 深挖报告的唯一事实源。GitHub Pages 构建时只读取符合本契约的 Issue；普通 Issue、Pull Request 和 Issue 评论不会出现在站点中。

## 固定元数据

正文第一个非空块必须为单行 HTML 注释，且必须包含合法、紧凑的 JSON：

```html
<!-- opportunity-radar:research {"version":1,"opportunityId":"2026-08-12--ai-session-manager","originReport":"2026-08-12","originSlug":"ai-session-manager","status":"research-complete","siteSummary":"验证重度 AI 编程用户是否愿意为会话持久化付费。"} -->
```

| 字段 | 规则 |
| --- | --- |
| `version` | 固定整数 `1`。 |
| `opportunityId` | 必须为 `{originReport}--{originSlug}`。 |
| `originReport` | 原日报日期，格式为 `YYYY-MM-DD`。 |
| `originSlug` | 原机会的小写 kebab-case `slug`。 |
| `status` | 固定为 `research-complete`。 |
| `siteSummary` | 非空、可公开显示的一句话研究结论。 |

元数据无效、稳定 ID 重复或引用不存在的日报机会会使 Pages 部署失败，避免发布错误的研究内容。

## 完整公开报告

删除元数据注释后的所有 Markdown 都会原样公开渲染。请保留以下二级标题：

```markdown
## 研究结论
## 用户与问题
## 证据
## 竞品与替代方案
## 市场与付费
## MVP
## 验证计划
## 风险与 Kill Criteria
```

GitHub Flavored Markdown（表格、任务列表、代码块）可用；原始 HTML 不会被站点渲染。不要在正文中放私密访谈、凭据或未证实的敏感信息。
