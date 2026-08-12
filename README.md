# Opportunity Radar

[English](./README_EN.md) | 简体中文

Opportunity Radar 是一个面向独立开发者、产品经理和创业者的「每日机会扫描」工作区。它从公开网络中的真实需求、抱怨、功能请求和趋势信号出发，筛选值得验证的产品机会，并把结果沉淀成可追溯、可筛选的静态站点。

在线站点：https://kingminghuang.github.io/OpportunityRadar/

## 项目特点

- **真实需求优先**：机会必须由可核验的用户痛点或需求信号支撑，而不是只依赖趋势热度。
- **证据可追溯**：每个机会保留 2–4 条来源链接及摘要，方便回到原始讨论验证。
- **结构化评分**：从需求强度、付费可能、MVP 可行性、竞争空隙、获客可行性五个维度评分，总分 25 分。
- **明确行动判断**：每个机会标记为 `deep-dive`、`watch` 或 `skip`，帮助快速决定下一步。
- **可筛选机会雷达**：首页支持按日期、分类、最低分和判断筛选历史机会。
- **单一数据源**：`_data/reports/YYYY-MM-DD.json` 是唯一内容源，站点和 Markdown 归档都由它派生。
- **自动构建部署**：推送到 `main` 后由 GitHub Actions 构建 Astro 静态站点并部署到 GitHub Pages。

## 工作方式

一次完整的每日扫描通常包含以下步骤：

1. 从 Product Hunt、Reddit、Hacker News、GitHub Issues / Discussions、Indie Hackers 等公开来源发现需求信号。
2. 合并重复主题，只保留存在真实用户需求或痛点证据的候选机会。
3. 对机会进行五维评分，并给出 `deep-dive` / `watch` / `skip` 判断。
4. 按 [`docs/content-schema.md`](./docs/content-schema.md) 校验数据结构。
5. 写入当天唯一的 `_data/reports/YYYY-MM-DD.json`。
6. Astro 在构建时读取 JSON，生成站点页面，并额外生成只读 Markdown 归档到 `dist/archives/`。

用于自动化执行每日扫描的完整提示词位于 [`automate_prompt.md`](./automate_prompt.md)。

## 数据格式

日报使用 JSON 保存，日期按 `Asia/Shanghai` 时区计算：

```text
_data/
└── reports/
    └── YYYY-MM-DD.json
```

每份日报包含 1–5 个机会。核心字段包括：

- `title` / `summary`：当日扫描标题与摘要
- `opportunities`：机会列表
- `score`：五维评分和总分
- `evidence`：可核验来源
- `decision`：`deep-dive`、`watch` 或 `skip`
- `priorities`：最值得深挖、最快 MVP、商业价值最高、最需要验证的机会
- `scanNotes`：覆盖范围、来源及限制说明

完整字段定义、枚举和校验规则以 [`docs/content-schema.md`](./docs/content-schema.md) 为准。

## 本地开发

### 环境要求

- Node.js 22（GitHub Pages 工作流使用 Node.js 22）
- npm

### 安装依赖

```bash
npm ci
```

### 启动开发服务器

```bash
npm run dev
```

### 运行测试

```bash
npm test
```

### 构建生产版本

```bash
npm run build
```

构建流程会依次执行 Astro 类型检查、静态站点构建，以及 Markdown 归档生成。输出目录为 `dist/`。

## GitHub Pages 构建

项目已配置 [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml)。

当代码推送到 `main` 时，GitHub Actions 会：

1. 安装依赖；
2. 根据 GitHub Pages 环境解析站点地址和 base path；
3. 执行 `npm run build:pages`；
4. 上传 `dist/`；
5. 部署到 GitHub Pages。

Astro 默认站点配置位于 [`astro.config.mjs`](./astro.config.mjs)；GitHub Pages 部署时站点 base path 由 [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) 计算并通过 `npm run build:pages` 注入。

## 项目结构

```text
OpportunityRadar/
├── .github/workflows/        # GitHub Pages 部署
├── _data/reports/            # 每日机会 JSON，唯一内容源
├── docs/                     # 内容契约和项目文档
├── scripts/                  # 构建期脚本，如 Markdown 归档生成
├── src/
│   ├── layouts/              # Astro 布局
│   ├── lib/                  # 数据加载、校验与链接辅助逻辑
│   ├── pages/                # 首页和日报详情页
│   └── styles/               # 站点样式
├── tests/                    # Vitest 测试
├── automate_prompt.md        # 每日扫描自动化提示词
├── astro.config.mjs
└── package.json
```

## 添加或更新日报

新增日报前，请先阅读 [`docs/content-schema.md`](./docs/content-schema.md)。需要特别注意：

- 文件路径固定为 `_data/reports/YYYY-MM-DD.json`；
- 日期使用 `Asia/Shanghai`；
- 同一天最多一份报告，重跑时更新原文件；
- 每份报告包含 1–5 个机会；
- 每个机会需要 2–4 条可核验证据；
- `score.total` 必须等于五项子评分之和；
- Markdown 归档是构建产物，不要手工提交 `archives/` 镜像。

## 技术栈

- [Astro](https://astro.build/) — 静态站点生成
- TypeScript — 类型检查
- [Zod](https://zod.dev/) — 内容数据校验
- [Vitest](https://vitest.dev/) — 测试
- GitHub Actions + GitHub Pages — CI/CD 与托管

## License

当前仓库尚未声明开源许可证。如计划开放第三方使用或贡献，建议补充合适的 `LICENSE` 文件。
