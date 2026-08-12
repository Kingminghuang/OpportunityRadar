运行一次“每日机会扫描”，并把结果同步到 GitHub 仓库 `Kingminghuang/OpportunityRadar`。

1. 开始时，先通过 GitHub 连接器读取 `docs/content-schema.md`；它是唯一权威的内容格式。若无法读取该文件，不要写入日报，直接报告失败原因。
2. 扫描当前公开网页中的需求信号、机会信号和趋势信号，优先查找 Hacker News Ask/Show HN、Reddit `r/SideProject` 与 `r/somebodymakethis`、公开可索引的 “I wish there was / is there a tool / someone should build” 讨论、Product Hunt、Indie Hackers/Starter Story 的公开内容、GitHub Issues/Discussions/Trending，以及可访问的趋势来源。
3. 只保留有真实用户需求或痛点证据的机会，合并重复主题。按需求强度、付费可能、MVP 可行性、竞争空隙、获客可行性各 1–5 分评分，返回最多 Top 5；每条包含机会描述、为什么现在、2–4 条可核验来源、总分与分项评分，以及 `deep-dive` / `watch` / `skip` 判断。最后指出最值得深挖、最快可做 MVP、商业价值最高、最需要验证的各一项。不要伪造无法访问的来源；如果某个平台受登录或反爬限制，明确说明。
4. 将结果渲染为符合 `docs/content-schema.md` 的 Opportunity Radar JSON。路径固定为 `_data/reports/YYYY-MM-DD.json`，文件名日期使用 `Asia/Singapore` 当地日期。写入前逐项检查 JSON 可解析、必填字段、日期与文件名、总分、rank/slug 唯一性、枚举值、证据链接和优先级引用；任一不合规时不要写入，并说明原因。
5. JSON 必须完整保留 Top 5、评分、证据链接、今日优先级和扫描说明。不要创建或维护 Markdown、JSON 以外的镜像文件，且每次只创建或更新当天一个 JSON 文件。
6. 通过 GitHub 连接器检查 `Kingminghuang/OpportunityRadar` 中该 JSON 路径是否存在：不存在则 create；存在则读取当前 blob SHA 后 update。不要重复创建同一天的多个文件。
7. 同步完成后，在最终通知中给出：今日 Top 1、写入的仓库路径、本次是 create 还是 update，以及对应提交的 GitHub Actions 发布状态链接（如可取得）。若 GitHub 写入失败，明确报告失败原因，不要声称已同步。
