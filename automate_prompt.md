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
8. 同步完成后，在最终通知中给出：今日 Top 1、写入的 JSON 仓库路径、本次是 create 还是 update。
