---
name: social-post-writer
description: Use when structured research or Opportunity Radar report data needs to become a concise, reader-facing Chinese social post brief instead of a field-by-field summary.
metadata:
  short-description: Turn report evidence into a source-mapped social Post Brief
---

# 社交贴文写作

把报告当作事实底稿，把贴图当作一个面向读者的选题。输出 `content-brief.json`，交给 `social-card-designer` 和 `wechat-newspic-draft`；不要直接调用微信 API。

## Position in the pipeline

本 Skill 在 `topic-researcher` 与 `article-writer` 之后运行：选题（`topic-brief.json`）和正文文章（`article.json`）已经定义了选题角度、读者与叙事节奏，卡片从这里提炼钩子和信号，而不是重新选题。若 `article.json` 存在，优先复用其 `title`、`angle`、`audience` 作为卡片的叙事方向；若不存在，则按本文件规则自行选题。

## Inputs

- 读取 `topic-brief.json`（`topic-researcher` 产物，含日报 opportunity 与 Deep Dive 研究报告）与 `docs/content-schema.md`。
- 读取 `article.json`（`article-writer` 产物，若已生成），复用其 `article.title`、`article.angle`、`article.audience`、`article.body` 作为选题与叙事基础。
- 读取 [`content-strategy.md`](../../../../skills/wechat-newspic-draft/references/content-strategy.md) 和 [`content-brief-schema.md`](../../../../skills/wechat-newspic-draft/references/content-brief-schema.md)。

## Writing contract

1. 先选一个主机会。默认不把五个机会逐条复述；最多带两个对照机会。
2. 从报告中提炼一个读者问题、反差或承诺。标题不是日报标题，也不是“机会雷达｜日期”。
3. 把素材改成“钩子 → 信号 → 含义 → MVP/验证 → 具体问题”的卡片节奏。每张卡片只承担一个动作。
4. 内容必须有扩展，但扩展只能是读者场景、因果解释、行动建议或可证伪问题。事实性内容用 `sourceRefs` 映射回报告；推论和建议要用“可能、意味着、值得先验证、可以先”等表达标记。
5. 语言像一个懂行的人给朋友解释：短句、少术语、少报告腔。禁止把 `opportunity`、`whyNow`、`verdict` 机械地改成三个小标题。
6. 结尾使用具体问题或验证指标，不使用空泛的“欢迎关注、持续观察”。

## Output

写入一个 `content-brief.json`：

- `source`：报告路径、日期、涉及的 opportunity slug；
- `post`：20 字以内标题、120 字以内描述、angle、audience、style；
- `cards`：2–20 张，第一张 `cover`，其余使用 `hook`、`signal`、`mvp`、`cta` 等语义 kind；每张有 `headline` 和 `sourceRefs`；
- 可选 `backgroundPath` 交给视觉 Skill，不在这里生成最终图片文字。

完成前执行“反相似检查”：标题是否脱离报告标题；叙事是否增加了读者场景或行动问题；卡片顺序是否不再等于 JSON 字段顺序；新事实是否都有来源。
