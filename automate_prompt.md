运行一次“每日机会扫描”，并把结果同步到 GitHub 仓库 `https://github.com/Kingminghuang/OpportunityRadar`。

1. 开始时，先通过 GitHub 连接器读取 `docs/content-schema.md`；它是唯一权威的内容格式。若无法读取该文件，不要写入日报，直接报告失败原因。
2. 扫描当前公开网页中的需求信号、机会信号和趋势信号，优先扫描以下来源：
   - [Product Hunt](https://www.producthunt.com/)
   - [Starter Story](https://www.starterstory.com/)
   - [Reddit `r/SideProject`](https://www.reddit.com/r/SideProject/)
   - [Reddit `r/somebodymakethis`](https://www.reddit.com/r/somebodymakethis/)
   - [Hacker News Ask HN](https://news.ycombinator.com/ask)
   - [Hacker News Show HN](https://news.ycombinator.com/show)
   - [X](https://x.com/)：优先查找公开可索引且包含 “I wish there was” / “is there a tool” / “someone should build” 的帖子。若 X 搜索页因登录、反爬或访问限制无法直接读取，可使用公开 Web 搜索中的 `site:x.com` 查询辅助发现，但只有能够核验原帖 URL 和内容的信号才能作为证据，不得仅凭搜索摘要推断。
   - [Exploding Topics](https://explodingtopics.com/)
   - [GitHub Issues / Discussions](https://github.com/)：在与候选问题相关的公开仓库中查找明确的功能请求、抱怨、workaround 和讨论。
   - [GitHub Trending](https://github.com/trending)
   - [Google Trends](https://trends.google.com/trends/explore)
   - [Indie Hackers](https://www.indiehackers.com/)
   若某来源受登录、反爬、索引或访问限制，明确记录限制，不得假装已扫描成功。趋势来源只能作为支持信号，不能替代真实用户需求或痛点证据。
3. 只保留有真实用户需求或痛点证据的机会，合并重复主题。按需求强度、付费可能、MVP 可行性、竞争空隙、获客可行性各 1–5 分评分，返回最多 Top 5；每条包含机会描述、为什么现在、2–4 条可核验来源、总分与分项评分，以及 `deep-dive` / `watch` / `skip` 判断。最后指出最值得深挖、最快可做 MVP、商业价值最高、最需要验证的各一项。不要伪造无法访问的来源；如果某个平台受登录或反爬限制，明确说明。
4. 只生成符合 `docs/content-schema.md` 的 Opportunity Radar JSON。路径固定为 `_data/reports/YYYY-MM-DD.json`，文件名日期使用 `Asia/Shanghai` 当地日期。文件内容必须是有效 UTF-8 JSON；不要使用 Markdown 代码围栏，也不要附加 JSON 以外的说明。
5. 写入前逐项检查：JSON 可解析、所有必填字段、日期与文件名一致、总分、rank/slug 唯一性、枚举值、每个机会 2–4 条证据链接、以及所有优先级引用。任一不合规时不要写入，并说明原因。
6. `_data/reports/YYYY-MM-DD.json` 是唯一内容源。不要创建、更新或提交 `_posts/`、`archives/` 或任何 Markdown 镜像文件；GitHub Pages 构建会从 JSON 自动生成只读归档 `archives/YYYY-MM-DD.md`。每次只创建或更新当天一个 JSON 文件。
7. 通过 GitHub 连接器检查 `https://github.com/Kingminghuang/OpportunityRadar` 中该 JSON 路径是否存在：不存在则 create；存在则读取当前 blob SHA 后 update。不要重复创建同一天的多个文件。
8. 同步完成后，在最终通知中给出：今日 Top 1、写入的 JSON 仓库路径、本次是 create 还是 update；随后列出当天全部 1–5 条机会的 `rank`、标题、总分和判断，并只问一句：`要深挖哪一项？回复“深挖 <rank>”，例如“深挖 1”。`

## 深挖指令

当用户在同一任务对话中回复 `深挖 <rank>`（或 `深挖 YYYY-MM-DD <rank>`）时，立即执行以下流程，不再要求二次确认：

1. 使用刚刚展示的日报；如果当前对话存在多个候选日报且指令未给出日期，询问用户日期，不得猜测。读取 `_data/reports/YYYY-MM-DD.json` 中该 `rank` 的机会。
2. 计算稳定 ID：`{date}--{slug}`。例如 `2026-08-12--ai-session-manager`。通过 GitHub 连接器搜索仓库 `Kingminghuang/OpportunityRadar` 中正文包含该 ID 的 Issue，并逐一读取正文，只有第一个非空块为 `<!-- opportunity-radar:research {...} -->` 且 JSON 中 `opportunityId` 精确相等的 Issue 才算匹配。
3. 精确匹配为零时，完成一次完整深挖后创建 Issue，标题固定为 `[Deep Dive] <机会标题>`。精确匹配为一时，先读取该 Issue 当前正文，再完成增量调研并更新正文；Issue 正文是权威记录，必须保留人工补充的内容，除非用户明确要求删除或重写。精确匹配超过一时，停止写入并报告重复 Issue 链接。
4. Issue 正文的第一个非空块必须是单行 HTML 注释，格式严格遵循 [`docs/research-issue-schema.md`](./docs/research-issue-schema.md)：`<!-- opportunity-radar:research {"version":1,"opportunityId":"…","originReport":"…","originSlug":"…","status":"research-complete","siteSummary":"…"} -->`。不要使用 YAML front matter、代码围栏或 labels；不要改动稳定 ID。注释之后写完整 Markdown 研究报告。
5. 完整报告必须包含：研究结论、用户与问题、证据、竞品与替代方案、市场与付费、MVP、验证计划、风险与 Kill Criteria。所有会公开显示，不能写入私密访谈信息、凭据或未证实的断言；外部证据必须给出可核验链接。
6. 完成后返回：深挖机会名称、`research-complete` 状态、创建或更新动作、Issue URL，以及一句话研究结论。Issue 编辑会在下一次 `main` 推送或手动 GitHub Pages 部署时同步到站点；不要回写日报 JSON。
