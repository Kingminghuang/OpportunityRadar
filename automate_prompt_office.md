# 每日白领办公机会扫描（独立轨道）

运行一次“每日白领办公机会扫描”，并把结果同步到 GitHub 仓库 `https://github.com/Kingminghuang/OpportunityRadar`。

本提示词与 `automate_prompt.md` 完全独立、互不影响：

- `automate_prompt.md` 只扫描开发者/编程需求（Product Hunt、HN、GitHub、Indie Hackers 等），写入 `_data/reports/YYYY-MM-DD.json`。
- 本提示词只扫描白领办公需求（销售、市场、财会、法律、HR、通用办公），写入独立的 `_data/office-reports/YYYY-MM-DD.json`。
- 两份日报可以同一天存在；两者各自拥有独立的来源池、证据门槛、输出路径与深挖稳定 ID。

1. 开始时，先通过 GitHub 连接器读取 `docs/content-schema.md`；它是唯一权威的内容格式。写入的 JSON 必须携带 `"track": "office"`。若无法读取该文件，不要写入日报，直接报告失败原因。

2. 扫描白领办公领域的需求信号、机会信号和趋势信号，优先扫描以下来源（海外 + 国内；按优先级分 P0/P1/P2）：

   **海外 · 产品反馈（需求信号，P0）**
   - [HubSpot Ideas](https://ideas.hubspot.com/)：CRM、销售自动化、营销、客服、报表
   - [Xero Product Ideas](https://productideas.xero.com/)、[QuickBooks Ideas](https://accountants.intuit.com/community/ideas)：对账、发票、工资、税务、事务所流程
   - [Microsoft Feedback Portal](https://feedbackportal.microsoft.com/)：Excel、Word、Outlook、Teams、Power BI、SharePoint 的公开办公痛点（公开可浏览、投票、评论）
   - [Salesforce IdeaExchange](https://ideas.salesforce.com/)：CRM、销售运营、客服、营销自动化

   **海外 · 角色社区（需求信号，P0）**
   - Reddit：[r/sales](https://www.reddit.com/r/sales/)、[r/salesops](https://www.reddit.com/r/salesops/)、[r/CRM](https://www.reddit.com/r/CRM/)、[r/marketing](https://www.reddit.com/r/marketing/)、[r/PPC](https://www.reddit.com/r/PPC/)、[r/SEO](https://www.reddit.com/r/SEO/)、[r/emailmarketing](https://www.reddit.com/r/emailmarketing/)、[r/Accounting](https://www.reddit.com/r/Accounting/)、[r/bookkeeping](https://www.reddit.com/r/bookkeeping/)、[r/taxpros](https://www.reddit.com/r/taxpros/)、[r/LawFirm](https://www.reddit.com/r/LawFirm/)、[r/legaltech](https://www.reddit.com/r/legaltech/)、[r/paralegal](https://www.reddit.com/r/paralegal/)、[r/humanresources](https://www.reddit.com/r/humanresources/)、[r/recruiting](https://www.reddit.com/r/recruiting/)、[r/AskHR](https://www.reddit.com/r/AskHR/)
   - 过滤“职业抱怨”与广告；财会/法律讨论避免把合规意见当产品需求，个案法律咨询不得作为机会证据。

   **海外 · 软件评论（需求/付费信号，P0/P1）**
   - [G2](https://www.g2.com/)、[Capterra](https://www.capterra.com/)、[TrustRadius](https://www.trustradius.com/)：真实抱怨、换软件原因、部署/集成/合规/迁移痛点（可能有反爬限制，不建议大规模抓取）

   **海外 · 通用办公社区（需求信号，P1）**
   - [Stack Exchange API](https://api.stackexchange.com/docs)：[Workplace](https://workplace.stackexchange.com/)、[Project Management](https://pm.stackexchange.com/)、[Web Applications](https://webapps.stackexchange.com/)、[Law](https://law.stackexchange.com/)、[Personal Finance & Money](https://money.stackexchange.com/)（结构化 API，问题/答案/评分/时间字段）
   - [Airtable Community](https://community.airtable.com/)、[Google Workspace Community](https://support.google.com/a/community?hl=zh-Hans)、[Asana Forum](https://forum.asana.com/)、[monday.com Community](https://community.monday.com/)、[Zapier Community](https://community.zapier.com/)（Excel/表格 workaround、销售台账、审批等内部工具场景）

   **海外 · 采购（机会信号，P2）**
   - [TED Search API](https://docs.ted.europa.eu/api/latest/search.html)、[Contracts Finder API](https://www.contractsfinder.service.gov.uk/apidocumentation/)：政府软件、数据、财务、法务、HR、咨询采购需求

   **海外 · 法规与趋势（趋势信号，P2）**
   - [Federal Register API](https://www.federalregister.gov/developers/documentation/api/v1)：新规带来的合规、申报、审计和文档工作
   - [Google Trends](https://trends.google.com/trends/)、[Exploding Topics](https://explodingtopics.com/)：关键词热度、增长主题和新兴需求；只能作为辅助信号

   **国内 · 产品反馈（需求信号，P0）**
   - [WPS Office 官方社区·反馈直通车](https://forum.wps.cn/)、[飞行家社区（飞书）](https://www.feishu.cn/community/)、[钉钉需求建议](https://page.dingtalk.com/wow/dingtalk/default/dingtalk/4NHXXTEaxoGI3nzJQyAeJ?dd_mini_app_id=5000000004997171)、[友户通用户社区（用友）](https://success.yonyoucloud.com/surl/wsYwtoW4)、[明道云社区](https://bbs.mingdao.net/)、[金蝶社区](https://vip.kingdee.com/)

   **国内 · 软件评论/选型（需求/付费信号，P1）**
   - [36氪企服点评](https://www.36dianping.com/)（最值得优先接入的国内企业软件评论站；须区分厂商入驻内容与真实用户点评；抓差评中反复出现的具体任务、人工导出 Excel 的 workaround、集成/权限/审批/报表/迁移问题、价格与更换系统证据）

   **国内 · 角色社区（需求信号，P0/P1/P2）**
   - 财会：[中国会计视野论坛](https://bbs.esnai.cn/)（P0，贴近实际工作）
   - HR：[HRoot BBS](https://bbs.hroot.com/)（P0/P1，招聘、eHR、劳动法规版块）
   - 市场：[数英网](https://www.digitaling.com/)、[梅花网](https://www.meihua.info/)、[运营派](https://yunyingpai.com/)（P1，偏案例与趋势，须与评论/采购交叉验证）
   - 销售：[销售易社区](https://club.xiaoshouyi.com/)、[销售与市场](https://www.cmmo.cn/)（P1，注意厂商营销内容占比）
   - 法律：[学法网](https://www.xuefa.com/)、[中国法学创新网·法治论坛](https://www.fxcxw.org.cn/html/146/)、[知乎法律实务检索](https://www.zhihu.com/search?q=%E6%B3%95%E5%BE%8B%E5%AE%9E%E5%8A%A1)（P1/P2，公开法律论坛偏知识问答，应结合电子合同/法务 SaaS 评论区与采购公告）

   **国内 · 通用办公（需求信号，P0/P1）**
   - [ExcelHome 技术论坛](https://club.excelhome.net/)（P0，复制粘贴/手工汇总/复杂公式痛点）、[Microsoft Q&A 中文社区](https://learn.microsoft.com/zh-cn/answers/)、[WPS Office 社区](https://forum.wps.cn/)、[飞书社区](https://www.feishu.cn/community/)、[钉钉社区](https://page.dingtalk.com/wow/dingtalk/default/dingtalk/4g2RgM4eOLM23E8SgtjHN?dd_mini_app_id=5000000004997171)

   **国内 · 采购与政策（机会/趋势信号，P2）**
   - [中国政府采购网](https://www.ccgp.gov.cn/)、[全国公共资源交易平台](https://www.ggzy.gov.cn/)：政府采购、服务采购、招投标、交易结果
   - [12366 纳税服务平台](https://12366.chinatax.gov.cn/wap/pages/index.html)：发票、增值税、申报、电子凭证等财税问题与政策变化

   访问与核验规则（必须严格遵守）：
   - 区分三种失败：`anti_bot_evidence`（captcha / cloudflare / access_denied）≠ `fetch_failure`（timeout / empty_js_shell / connector_error）≠ `login_required_for_read`（仅需登录互动时记为 `login_required_for_posting`）。不要把 JS 页面或网络超时轻易判定为“严格反爬”。
   - 国内来源实测分级：A 类可直接自动扫描（WPS、明道云、36氪企服点评、中国会计视野、HRoot 首页、数英网、运营派、微软中文支持、全国公共资源交易平台、12366）；B 类需浏览器渲染或站内 API（飞书社区、钉钉需求建议、友户通、HRoot BBS）；C 类当前抓取不稳定、未确认是反爬（梅花网、销售易、学法网、中国法学创新网、ExcelHome、中国政府采购网），应先再尝试浏览器访问，仍失败再降级为搜索引擎发现 + 人工核验。
   - 无法核验原帖 URL 和正文的信号只能记录为“发现线索”，不能作为最终证据。
   - 知乎、微信公众号、小红书、百度知道：可作为发现线索，必须能核验原文与发布时间；不把点赞数当付费需求；无法稳定访问或确认作者角色时不进入最终 Top 5。

3. 白领机会的证据门槛比开发者轨道更严格。一个机会至少需要：

   1) 一条角色社区/用户讨论中的真实痛点或工作流描述，并记录：角色、任务、当前 workaround、发生频率、可能付费方；
   2) 一条产品反馈、软件评论或公开采购证据（交叉验证）；
   3) 趋势来源只能加强判断，不能单独构成机会；
   4) 厂商宣传、产品发布、客户案例不得单独作为需求证据；国内社区区分厂商内容与用户讨论。

   合并重复主题。按需求强度、付费可能、MVP 可行性、竞争空隙、获客可行性各 1–5 分评分，返回最多 Top 5；每条包含机会描述、为什么现在、2–4 条可核验来源、总分与分项评分，以及 `deep-dive` / `watch` / `skip` 判断。最后指出最值得深挖、最快可做 MVP、商业价值最高、最需要验证的各一项。不要伪造无法访问的来源；受登录或反爬限制的平台要明确说明。

4. 只生成符合 `docs/content-schema.md` 的 Opportunity Radar JSON，且 `track` 必须为 `"office"`。路径固定为 `_data/office-reports/YYYY-MM-DD.json`，文件名日期使用 `Asia/Shanghai` 当地日期。文件内容必须是有效 UTF-8 JSON；不要使用 Markdown 代码围栏，也不要附加 JSON 以外的说明。

5. 写入前逐项检查：JSON 可解析、所有必填字段、`track` 为 `"office"`、日期与文件名一致、总分、rank/slug 唯一性、枚举值（evidence 的 sourceType 使用白领枚举：`product-feedback` / `software-review` / `role-community` / `procurement` / `regulatory` / `community` / `other` 等，以 schema 为准）、每个机会 2–4 条证据链接、以及所有优先级引用。任一不合规时不要写入，并说明原因。

6. `_data/office-reports/YYYY-MM-DD.json` 是白领轨道唯一内容源。不要创建、更新或提交 `_posts/`、`archives/` 或任何 Markdown 镜像文件；GitHub Pages 构建会从 JSON 自动生成只读归档。每次只创建或更新当天一个 JSON 文件，不要与 `_data/reports/` 的文件混写。

7. 通过 GitHub 连接器检查 `https://github.com/Kingminghuang/OpportunityRadar` 中该 JSON 路径是否存在：不存在则 create；存在则读取当前 blob SHA 后 update。不要重复创建同一天的多个文件。

8. 同步完成后，在最终通知中给出：今日白领 Top 1、写入的 JSON 仓库路径、本次是 create 还是 update；随后列出当天全部 1–5 条机会的 `rank`、标题、总分和判断。不要向用户提问，直接进入下面的深挖流程。

## 深挖流程

日报写入并同步后，立即自动执行以下深挖流程，不询问用户、不等待任何回复：

1. 使用刚写入的 `_data/office-reports/YYYY-MM-DD.json`（日期即当天日报日期），选择 `priorities.deepDive.slug` 对应的机会读取全部字段；若该字段缺失或无效，则改选 `decision` 为 `deep-dive` 且 `rank` 最小的机会；若仍无，则深挖 `rank` 为 1 的机会。

2. 计算稳定 ID：`office-{date}--{slug}`，例如 `office-2026-09-03--reconciliation-ledger`。通过 GitHub 连接器搜索仓库 `Kingminghuang/OpportunityRadar` 中正文包含该 ID 的 Issue，并逐一读取正文，只有第一个非空块为 `<!-- opportunity-radar:research {...} -->` 且 JSON 中 `opportunityId` 精确相等的 Issue 才算匹配。（`office-` 前缀用于与开发者轨道的 `{date}--{slug}` 稳定 ID 区分，避免冲突。）

3. 精确匹配为零时，完成一次完整深挖后创建 Issue，标题固定为 `[Deep Dive] <机会标题>`。精确匹配为一时，先读取该 Issue 当前正文，再完成增量调研并更新正文；Issue 正文是权威记录，必须保留人工补充的内容，除非用户明确要求删除或重写。精确匹配超过一时，停止写入并报告重复 Issue 链接。

4. Issue 正文的第一个非空块必须是单行 HTML 注释，格式严格遵循 [`docs/research-issue-schema.md`](./docs/research-issue-schema.md)：`<!-- opportunity-radar:research {"version":1,"opportunityId":"office-2026-09-03--reconciliation-ledger","originReport":"2026-09-03","originSlug":"reconciliation-ledger","status":"research-complete","siteSummary":"…"} -->`。不要使用 YAML front matter、代码围栏或 labels；不要改动稳定 ID。注释之后写完整 Markdown 研究报告。

5. 完整报告必须包含：研究结论、用户与问题、证据、竞品与替代方案、市场与付费、MVP、验证计划、风险与 Kill Criteria。所有内容会公开显示，不能写入私密访谈信息、凭据或未证实的断言；外部证据必须给出可核验链接。

6. 完成后返回：深挖机会名称、`research-complete` 状态、创建或更新动作、Issue URL，以及一句话研究结论。Issue 编辑会在下一次 `main` 推送或手动 GitHub Pages 部署时同步到站点；不要回写日报 JSON。
