---
name: wechat-newspic-draft
description: Use when a source-backed social post brief and card images need to become a WeChat Official Account newspic draft without publishing it.
metadata:
  short-description: Create a reviewed WeChat image-post draft
---

# 微信贴图草稿适配

这是插件的最后一层，只负责把已审核的 `content-brief.json` 和卡片图片写入微信公众号草稿箱。不要在这一层重新写作，也不要模拟公众号网页编辑器。

## Required handoff

- `topic-researcher` 已生成 `topic-brief.json`：日报 opportunity + GitHub Deep Dive 研究报告。
- `article-writer` 已生成 `article.json`：500–700 字正文（newspic 草稿的 `content`），可选。
- `social-post-writer` 已生成 brief；每张卡片有 `sourceRefs`。
- `social-card-designer` 已生成 `backgroundPath` 或决定使用确定性模板。
- 日报 JSON 与研究报告仍是事实来源；brief 与文章只能扩展解释、推论、行动建议和问题，不能伪造证据。

## Safety and execution

- 默认执行 dry-run；只有用户明确要求创建草稿时才使用 `--create`。
- `--report` 可选：省略时以 `brief.source.reportDate` 为准（brief 与 article 交叉校验）；提供时校验日期与 slug 必须存在于该日报。先运行：

  ```bash
  node plugins/wechat-social-publisher/skills/wechat-newspic-draft/scripts/create_draft.mjs \
    --brief OUTPUT_DIR/content-brief.json \
    --article OUTPUT_DIR/article.json \
    --out OUTPUT_DIR \
    --dry-run
  ```

- `--article` 可选：提供时草稿 `title`/`content` 使用文章标题与正文，否则回退 `brief.post` 的标题与描述。
- `--create` 只调用 `stable_token`、永久图片素材上传和 `draft/add`，不调用发布、定时发布、删除或网页自动化接口。
- 凭据只能来自服务端环境变量 `WECHAT_APPID`、`WECHAT_APPSECRET`；API 超时且状态不明时不要盲目重试。
- 这是一次性进程，不要求常驻服务端；真实草稿写入需要服务端或受控 CI 环境保存密钥。

详细 API 约束和 brief 校验见 [`skills/wechat-newspic-draft/SKILL.md`](../../../../skills/wechat-newspic-draft/SKILL.md)。
