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
   - [QuickBooks Ideas](https://accountants.intuit.com/community/ideas)：对账、发票、工资、税务、事务所流程

   **海外 · 角色社区（需求信号，P0）**
   - Reddit：[r/sales](https://www.reddit.com/r/sales/)、[r/salesops](https://www.reddit.com/r/salesops/)、[r/CRM](https://www.reddit.com/r/CRM/)、[r/marketing](https://www.reddit.com/r/marketing/)、[r/PPC](https://www.reddit.com/r/PPC/)、[r/SEO](https://www.reddit.com/r/SEO/)、[r/emailmarketing](https://www.reddit.com/r/emailmarketing/)、[r/Accounting](https://www.reddit.com/r/Accounting/)、[r/bookkeeping](https://www.reddit.com/r/bookkeeping/)、[r/taxpros](https://www.reddit.com/r/taxpros/)、[r/LawFirm](https://www.reddit.com/r/LawFirm/)、[r/legaltech](https://www.reddit.com/r/legaltech/)、[r/paralegal](https://www.reddit.com/r/paralegal/)、[r/humanresources](https://www.reddit.com/r/humanresources/)、[r/recruiting](https://www.reddit.com/r/recruiting/)、[r/AskHR](https://www.reddit.com/r/AskHR/)
   - 过滤“职业抱怨”与广告；财会/法律讨论避免把合规意见当产品需求，个案法律咨询不得作为机会证据。

   **海外 · 通用办公社区（需求信号，P1）**
   - [Workplace](https://workplace.stackexchange.com/)、[Project Management](https://pm.stackexchange.com/)、[Web Applications](https://webapps.stackexchange.com/)、[Law](https://law.stackexchange.com/)、[Personal Finance & Money](https://money.stackexchange.com/)（结构化 API，问题/答案/评分/时间字段）
   - [Airtable Community](https://community.airtable.com/community)、[Google Workspace Community](https://support.google.com/a/threads?hl=zh-Hans&sjid=1321923704055357861-NC)、[Asana Forum](https://forum.asana.com/c/forum-en/tips/6)、[monday.com Community](https://community.monday.com/ask-the-com)、[Zapier Community](https://community.zapier.com/get-help-50)（Excel/表格 workaround、销售台账、审批等内部工具场景）

   **海外 · 知识管理/数据工作流社区（需求/实现信号，P1/P2）**
   - [Obsidian Forum](https://forum.obsidian.md/)：重点扫描 Help、Feature requests、Plugins ideas、Knowledge management、Workflows & Templates；Discourse 页面公开展示正文、回复、浏览量、活跃时间，Feature requests 的 Hearts 可作为互动强度。适合发现知识库、文档、检索、同步、移动端、PDF/OCR、日历/任务和插件集成工作流；默认记为 `community`，但它偏工具爱好者/知识管理用户，不能单独满足销售、财会、HR 等角色痛点或付费证据门槛。插件发布、主题展示、纯 API/CSS 技术讨论只作实现/竞争线索。
   - [Reddit r/Notion](https://www.reddit.com/r/Notion/)：按 Reddit 公开社区扫描帖子正文、评论、作者 flair、发布时间、投票/互动和规范 URL。适合发现知识库、文档、数据库、模板、自动化、协作、同步、移动端和第三方集成工作流；默认记为 `community`，但它偏工具用户而非职业角色社区，不能单独满足销售、财会、HR 等角色痛点或付费证据门槛。模板展示、教程、产品新闻、推广和纯“怎么用”问答只作发现或实现线索；只有能核验用户角色、具体任务、当前 workaround 或重复请求时，才可进入机会候选。
   - [Snowflake Community](https://community.snowflake.com/s/) / [Snowflake Discourse Forum](https://snowflake.discourse.group/)：优先扫描公开 Discourse 的 Ideas、General、Snowsight/UI、Governance & Security、Agents & Snowflake CoWork 等分类；保留主题正文、作者/时间、回复、点赞、浏览量、标签、解决状态和规范 URL。适合发现 BI/仪表盘权限、数据治理、报表共享、成本控制、数据工程和 AI 数据工作流需求；面向数据专业人士，默认为数据/技术工作流信号，不能单独证明一般白领角色需求或付费意愿。官方门户的资源卡片、博客、培训和活动仅作背景/趋势。

   **海外 · GitHub 开源办公工具（需求/实现信号，P0/P1）**
   - [Nextcloud Server Issues](https://github.com/nextcloud/server/issues) / [Pull requests](https://github.com/nextcloud/server/pulls)：文件协作、共享链接、权限、外部存储、Office 集成、企业部署与升级问题
   - [ONLYOFFICE DocumentServer Issues](https://github.com/ONLYOFFICE/DocumentServer/issues) / [Discussions](https://github.com/ONLYOFFICE/DocumentServer/discussions)：DOCX/XLSX/PPTX 兼容性、多人编辑、嵌入式集成、移动端、无障碍、PDF 与保存/导出问题；该仓库当前以 Issue/Discussion 为主，不要臆造不存在的 PR
   - [CryptPad Issues](https://github.com/cryptpad/cryptpad/issues) / [Pull requests](https://github.com/cryptpad/cryptpad/pulls)：端到端加密协作文档、表格、表单、共享权限、移动端、导入/导出与隐私需求
   - [Collabora Online Issues](https://github.com/CollaboraOnline/online/issues) / [Pull requests](https://github.com/CollaboraOnline/online/pulls)：浏览器办公编辑、WOPI/集成、格式兼容性、无障碍、性能与自托管部署；其官方开发流程可能使用 Gerrit，GitHub PR 只作为补充实现信号
   - [Grist Core Issues](https://github.com/gristlabs/grist-core/issues) / [Pull requests](https://github.com/gristlabs/grist-core/pulls)：表格/数据库混合工作流、公式、权限、导入导出、自定义组件、嵌入与自动化
   - [Paperless-ngx Issues](https://github.com/paperless-ngx/paperless-ngx/issues) / [Pull requests](https://github.com/paperless-ngx/paperless-ngx/pulls)：文档收件、OCR、邮件导入、元数据、归档/保留、检索、权限、OIDC 与合规流程
   - [AppFlowy Issues](https://github.com/AppFlowy-IO/AppFlowy/issues) / [Pull requests](https://github.com/AppFlowy-IO/AppFlowy/pulls)：文档/知识库、数据库、日历、协作、本地/自托管 AI、权限与集成
   - [LibreOffice Core Issues](https://github.com/LibreOffice/core/issues)：桌面办公套件、DOCX/XLSX/PPTX 兼容性、宏、打印、无障碍与性能；GitHub core 仓库是只读仓库且不接收 PR，补丁评审在 [Gerrit](https://gerrit.libreoffice.org/)，因此只扫描 GitHub Issue 作为用户痛点/缺陷线索

   **海外 · GitHub 开源业务办公工具（需求/实现信号，P1）**
   - [ERPNext Issues](https://github.com/frappe/erpnext/issues) / [Pull requests](https://github.com/frappe/erpnext/pulls)：财务、采购、库存、销售、CRM、项目与 HR 流程中的配置、报表、审批、权限和本地化问题
   - [Twenty Issues](https://github.com/twentyhq/twenty/issues) / [Pull requests](https://github.com/twentyhq/twenty/pulls)：开源 CRM 的联系人、销售管道、自动化、导入导出、权限、API 与企业部署需求
   - [OpenProject Issues](https://github.com/opf/openproject/issues) / [Pull requests](https://github.com/opf/openproject/pulls)：项目管理、资源排期、工时、看板、权限、报表与外部集成需求

   GitHub 扫描规则：对上述仓库分别扫描 Issue、Pull request，优先看近 180 天新建或活跃、带有 `feature request` / `enhancement` / `workflow` / `integration` / `permissions` / `import` / `export` / `accessibility` / `mobile` / `self-hosted` / `SSO` / `API` / `performance` 等标签或正文关键词的条目；必要时回溯 12 个月。Issue 正文中的真实用户场景、当前 workaround、部署环境、重复出现的评论与明确的功能请求，可以作为社区需求信号；已合并 PR 只能说明需求已经进入实现/交付阶段，需读取关联 Issue、PR 描述和讨论，不能只凭 PR 标题推断市场需求。排除依赖升级、CI/构建、纯重构、机器人翻译、维护者内部任务、安全报告、重复条目、`good first issue` 和没有用户影响描述的技术噪声。GitHub Issue/PR 默认记为 `community`（或 schema 中最接近的已定义枚举），不得新增未定义的 `sourceType`；GitHub 信号不能单独满足白领机会的角色痛点证据门槛，必须与角色社区/产品反馈/软件评论/采购来源交叉验证。

   **海外 · 法规与趋势（趋势信号，P2）**
   - [Federal Register API](https://www.federalregister.gov/developers/documentation/api/v1)：新规带来的合规、申报、审计和文档工作
   - [Google Trends](https://trends.google.com/trends/)、[Exploding Topics](https://explodingtopics.com/)：关键词热度、增长主题和新兴需求；只能作为辅助信号

   **国内 · 产品反馈（需求信号，P0）**
   - [WPS Office 官方社区·反馈直通车](https://forum.wps.cn/)、[飞行家社区（飞书）](https://www.feishu.cn/community/)、[钉钉需求建议](https://n.dingtalk.com/dingding/dingguagua/home/index.html)、[友户通用户社区创意广场](https://success.yonyoucloud.com/community/idea?cid=f534db71f1f5da2d)、[明道云社区](https://bbs.mingdao.net/)

   **国内 · 软件评论/选型（需求/付费信号，P1）**
   - [36氪企服点评](https://www.36dianping.com/dianping/)（最值得优先接入的国内企业软件评论站；须区分厂商入驻内容与真实用户点评；抓差评中反复出现的具体任务、人工导出 Excel 的 workaround、集成/权限/审批/报表/迁移问题、价格与更换系统证据）

   **国内 · 角色社区（需求信号，P0/P1/P2）**
   - 市场：[数英网](https://www.digitaling.com/moments)、[梅花网](https://www.meihua.info/info)、[运营派](https://www.yunyingpai.com/archive)（P1，偏案例与趋势，须与评论/采购交叉验证）
   - 销售：[销售与市场](https://cmmo.cn/portal.php?mod=list&catid=18)（P1，注意厂商营销内容占比）

   **国内 · 通用办公（需求信号，P0/P1）**
   - [ExcelHome 技术论坛](https://club.excelhome.net/forum.php?mod=guide&view=newthread)（P0，复制粘贴/手工汇总/复杂公式痛点）、[Microsoft Q&A 中文社区](https://learn.microsoft.com/zh-cn/answers/questions/)、[WPS Office 社区](https://forum.wps.cn/)、[飞书社区](https://www.feishu.cn/community/prompts?tab=inspiration)

   **聚合热榜/AI 资讯（发现与趋势信号，P2）**
   - [aigcbb 今日热榜](https://www.aigcbb.com/hotnews/)：页面聚合人人都是产品经理、36 氪、百度、虎扑、哔哩哔哩等多个站点的榜单，并链接回原文；只用于发现候选主题、关键词和趋势，若需暂存发现使用 `other`，不得把榜单排名、热度或聚合页标题当作真实用户痛点、付费意愿或事实核验。进入最终机会证据前必须打开并引用原始文章/帖子，并按原始来源重新判断作者身份、发布时间、内容类型和是否与白领工作流相关；厂商宣传、媒体评论和热点新闻通常只能作辅助背景。

   访问与核验规则（必须严格遵守）：
   - 区分三种失败：`anti_bot_evidence`（captcha / cloudflare / access_denied）≠ `fetch_failure`（timeout / empty_js_shell / connector_error / rate_limit）≠ `login_required_for_read`（只有正文或评论必须登录才能读取时才使用；仅需登录互动时记为 `login_required_for_posting`）。不要把 JS 页面、网络超时、GitHub 暂时限流或空搜索结果轻易判定为严格反爬。
   - GitHub 来源先通过连接器打开具体仓库的 `/issues`、`/pulls` 或 `/discussions` 页面，再读取条目的完整标题、正文、评论、标签、创建/更新时间、状态、关联 Issue/PR 与合并状态；搜索摘要、Issue/PR 标题、标签、点赞/表情数量只能用于发现，不能代替正文。必须保留规范的 Issue/PR URL、仓库名和编号。只读仓库、仓库明确不接收 GitHub PR、没有公开 PR，或仅有维护者内部讨论，应记录为“来源限制/无公开 PR”，不得记为抓取失败，也不得臆造内容。
   - GitHub Issue/Discussion 只有在正文或评论中能核验真实角色/部署者、具体任务、当前 workaround、用户影响或重复出现的请求时，才可作为社区需求信号；PR 必须连同关联 Issue/Discussion、PR 描述和 review 讨论一起读取。已合并 PR 主要表示实现/交付信号，不能单独证明付费需求；没有用户上下文的技术修复只能作为竞争或可行性线索，不能进入最终机会证据。
   - 国内当前来源按可访问性分级：A 类可直接自动扫描（WPS、明道云、36氪企服点评、微软中文支持、数英网、运营派）；B 类需浏览器渲染或站内 API（飞书社区、钉钉需求建议、友户通）；C 类当前抓取不稳定或需先确认正文可见性（梅花网、ExcelHome、销售与市场）。B/C 类应先尝试官方页面或站内入口，仍无法读取原文时降级为搜索引擎发现 + 人工核验；不得把搜索摘要当作最终证据。
   - 新增海外来源当前实测分级：Obsidian Forum 为 A 类，公开 Discourse 页面可直接读取；Snowflake 官方社区门户为 B 类，但其公开 Discourse 论坛可直接读取，优先扫描后者；Reddit r/Notion 沿用 Reddit 社区的访问规则，正文或评论不可见时只能记录为访问限制/发现线索；aigcbb 今日热榜为 C 类，本次文本抓取返回 403，但浏览器可打开，仍必须把它视为聚合发现页。分级是访问路径记录，不改变“聚合页不等于原始需求证据”的证据规则。
   - 任何来源无法同时核验规范 URL、原文正文和发布时间时，只能记录为“发现线索”；无法确认作者角色、用户身份或实际工作场景时，不得用来满足白领机会的角色痛点证据门槛，也不得仅凭互动量推断付费意愿。
   - 对所有来源优先读取原始用户内容，厂商公告、产品发布、客户案例、维护者 roadmap、聚合热榜、自动生成内容和技术依赖更新只能作为辅助背景；安全报告、机器人账号、重复条目、CI/构建、纯重构和无用户影响描述的 Issue/PR 不进入最终 Top 5。除非用户明确要求，不向外部来源仓库评论、投票、创建 Issue 或提交 PR。

3. 白领机会的证据门槛比开发者轨道更严格。一个机会至少需要：

   1) 一条角色社区/用户讨论中的真实痛点或工作流描述，并记录：角色、任务、当前 workaround、发生频率、可能付费方；
   2) 一条产品反馈、软件评论或公开采购证据（交叉验证）；
   3) 趋势来源只能加强判断，不能单独构成机会；
   4) 厂商宣传、产品发布、客户案例、Snowflake 官方门户资源卡片、aigcbb 聚合榜单不得单独作为需求证据；Reddit r/Notion 中的模板/教程/推广内容也不得替代真实用户工作流；国内社区区分厂商内容与用户讨论。

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
