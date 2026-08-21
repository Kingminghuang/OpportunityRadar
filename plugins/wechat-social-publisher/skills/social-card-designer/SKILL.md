---
name: social-card-designer
description: Use when a reviewed Chinese social Post Brief needs a multi-card visual series for WeChat image posts or Xiaohongshu-like content.
metadata:
  short-description: Turn a Post Brief into readable social card assets
---

# 社交卡片设计

把 Post Brief 变成一套“先停住、再看懂、最后行动”的卡片。它负责视觉节奏和图片素材，不重写事实，也不调用微信 API。

## Workflow

1. 读取 brief 的 `post` 和 `cards`，保持每张卡片一个观点；不要为了视觉填充新增市场事实。
2. 选择一种统一视觉语气：数据/工程/AI 主题优先使用 Signal Proof（证据感、留白、标记线）；更叙事的主题可使用 Bridge Canvas（场景化、跨平台卡片感）。
3. 默认封面 900×900，内容卡片 900×1200；用 5–7 张讲清一个主机会，过长时优先合并重复解释而不是缩小字号。
4. 如需生图，使用 `imagegen` 生成不含中文正文的氛围背景、抽象隐喻或场景图。生成多张时为每张卡片单独写 `backgroundPath`，并保持色彩、镜头和光线的一致性。
5. 最终正文由 `create_draft.mjs` 的 SVG 文字层确定性渲染。AI 图片不能承担标题、数字、证据或 CTA，避免错字和事实漂移。
6. 交给 `wechat-newspic-draft` 做 dry-run，检查文字是否溢出、背景对比度、卡片顺序、PNG 大小和 manifest 的来源映射。

## Card roles

| kind | 视觉任务 | 文案重点 |
| --- | --- | --- |
| `cover` | 一眼停住 | 问题、反差或承诺 |
| `hook` | 把抽象报告变成场景 | “为什么这件事会卡住我” |
| `signal` | 给出证据感 | 2–3 个短信号或指标 |
| `mvp` | 降低行动门槛 | 先做什么、先测什么 |
| `cta` | 让读者参与 | 一个可回答的问题 |

文字要留白，背景要服务阅读；“像小红书/贴图”指的是内容节奏和视觉卡片化，不是把报告缩小后贴在图片上。
