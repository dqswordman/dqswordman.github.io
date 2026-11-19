# Wenzhang Du · Research Homepage

[中文主页](https://dqswordman.github.io/zh/) · [English homepage](https://dqswordman.github.io/) · [GitHub 个人页](https://github.com/dqswordman)

从[精选研究](https://dqswordman.github.io/zh/research/#selected)进入项目概览，浏览[论文目录](https://dqswordman.github.io/zh/#publications)、[双语技术报告](https://dqswordman.github.io/zh/technical-reports/)或[开源项目](https://dqswordman.github.io/zh/open-source/)。

## 本地运行

需要 **Node.js 22 或更新版本**。项目没有 npm 运行依赖，也不需要 Ruby、Jekyll 或 `npm install`。

```powershell
# 监听内容与源文件变化；修改后刷新浏览器
npm run dev

# 构建、运行测试、检查输出
npm run verify

# 预览当前源码生成的站点
npm run preview
```

默认预览地址为 `http://127.0.0.1:4173/`。更换端口：

```powershell
npm run dev -- --port 4174
```

`npm run build` 只输出到 `dist/`。构建过程只清理该固定目录，不读取或清理共享缓存。

## 内容维护

| 文件                        | 用途                                                       |
| --------------------------- | ---------------------------------------------------------- |
| `content/profile.json`      | 个人资料、中英文文案与 News 时间轴                          |
| `content/publications.json` | 正式论文元数据、录用日期来源与已公开入口                    |
| `content/projects.json` | 项目稳定 ID、双语概览、适用范围与已公开的报告清单               |
| `content/technical-reports/` | 双语报告正文、分节、图表、复现说明及证据链接               |
| `src/render.mjs`            | 页面与组件组合、双语界面文字、SEO 与结构化数据             |
| `src/components.mjs`        | 原创图标、WD 标识、数学球面图形                            |
| `src/styles.css`            | 响应式设计、无障碍状态与打印样式                           |
| `src/client.js`             | 导航、论文筛选、News 年份切换、语言切换与复制功能          |
| `src/filter.mjs`            | 搜索匹配与可分享的筛选状态                                 |
| `src/visitors.mjs`          | 真实访客统计、线上域名判断与失败回退                       |
| `src/experience.mjs`       | 共用动效开关、进入反馈、图形景深、阅读进度线与返回顶部     |
| `src/experience.css`       | 主页的视觉细节、动效与打印回退                             |
| `scripts/`                  | 构建、开发服务器、输出校验和品牌素材工具                   |
| `public/`                   | 原样复制到发布目录的静态资源                               |

修改个人资料时，同时维护 `locales.en` 与 `locales.zh`，并更新 `updated`。WSDM 记录了已录用稿，PAIRSAFE 条目链接到 ACL Anthology 长文及其页码。GPA 按本人要求简写为 **3.5/4**。

首页首屏展示 `featured` 中第一篇有技术报告的论文。若要预览一张报告表格，可在表格中用 `previewColumn` 指定数值列（从 0 开始，第 0 列是行标签）。预览直接使用表内数据，并链接到报告对应小节。没有预览列时显示报告摘要。

首屏下方的 News 默认展示两条最新消息，可按年份切换、展开完整时间轴并跳转到对应论文。论文录用消息由 `acceptedDate` 自动生成，日期统一显示为 `YYYY-MM-DD`。其他有确切日期的近况可放入 `profile.json` 的 `news` 数组，使用 `title`、`text` 保存中英文。

时间轴、论文排序与年份筛选采用录用日期；会议届次仍保存在 `year`，用于会议名称和学术引用。例如 WSDM 2027 的录用消息归入 2026 年。收件时间统一按本人确认的 America/Tijuana 时区换算，时区保存在 `acceptanceTimeZone`。IBSR 和 Structure-Aware 两篇按本人指定，参照同届 iEECON 2026 的 **2026-01-09** 记录日期，使用 `acceptedDateBasis: "same-conference"` 保存这一来源。尚未取得日期的记录可留空，取得日期后自动进入时间轴。

视觉和交互增强共用原生浏览器模块，没有新增运行时依赖。右下角可以暂停动效；系统设置为减少动态效果时自动采用静态模式。装饰动画只在图形可见且页面处于前台时运行。正文始终可见，不以等待动画为阅读条件。动效偏好保存在本机浏览器，未开放本地存储时仍能使用当页功能。模块与样式参与内容哈希，根路径和项目子目录使用同一构建逻辑。

添加论文示例：

```json
{
  "id": "stable-paper-id",
  "title": "The exact publication title",
  "authors": ["Wenzhang Du", "Another Author"],
  "venue": "Conference",
  "year": 2027,
  "group": "major",
  "topics": ["evaluation"]
}
```

`id` 必须唯一且稳定，它同时用于论文深链接。`venue` 仅填会议名称，年份单独存入 `year`。`group` 使用 `major`（主要发表）或 `ei`（EI 会议论文），按本人指定的 CCF／CORE 会议排名标准维护；WCCI 下的 CEC、IJCNN 与 IGARSS 归入主要发表。`topics` 支持 `evaluation`、`earth`、`efficient`、`applied`。`profile.json` 中的 `featured` 指向需要展示的论文 ID。

已录用、尚未正式发表的论文使用 `"status": "accepted"`，已核实的首次通知接收日期填入 `acceptedDate`（必须为完整日期），正式发表后改为 `"status": "published"`。列表展示标题、会议与接收日期，完整作者和发表状态保留在可展开引用中。`affiliation` 可保存论文对应身份。PAIRSAFE 的录用日期为 **2026-09-08**，WSDM 的录用日期为 **2026-11-03**，会议届次为 [WSDM 2027](https://www.wsdm-conference.org/2027/)。

在 `content/projects.json` 登记稳定的项目 `id`、双语 `title` 和 `summary`。关联论文用 `publicationId`，独立项目则直接填写 `authors`。按展示顺序将已公开的文档放入 `reports`，每项填写 `id` 和 `type`。类型支持 `paper-companion`、`technical-report`、`research-note` 和 `replication-report`。独立报告可以先于论文发表，也可以只提供正文与来源。首页精选由 `profile.featured` 的项目 ID 与顺序决定。

将双语正文保存为 `content/technical-reports/<报告 ID>.json`。沿用 [WSDM 报告](content/technical-reports/decision-sufficiency.json) 的 `locales`、`sections`、`metrics` 和 `sources` 结构。`article.version`、`published`、`updated` 记录网页文档本身的版本、首发和最近实质更新；对应稿件的日期可另填 `manuscriptDate`。`artifact` 可链接固定软件版本。每次发布按公开报告清单构建，报告目录默认按首发日期倒序，`?sort=updated` 切换到更新时间。

正式论文继续遵循从 WSDM 2027 Findings 起的配套约定。录用日期为 **2026-11-03** 及以后的论文同时提供公开 `codeUrl` 和登记为 `paper-companion` 的双语伴读。论文目录、复制引用和搜索均读取同一份 track 字段。

构建为两种语言分别生成项目目录 `/research/`、项目页 `/research/<项目 ID>/`、报告目录 `/technical-reports/`、报告页 `/technical-reports/<报告 ID>/` 及开源目录 `/open-source/`。已有论文和报告的深链接保持有效。旧首页锚点 `#technical-reports` 与 `#open-source` 会转到相应目录。

WSDM 的三张网页图和六张数据表来自公开的 `v1.0.0` 复现归档。使用有 NumPy 和 Matplotlib 的 Python 3.9 或更新环境，在站点仓库运行 `python scripts/render-wsdm-figures.py --artifact ../rag-decision-sufficiency` 可重新生成。脚本固定读取该版本的 Git 对象，核对归档 P1 掩码、策略对比与选例。站点构建直接使用提交的图片和表格数据。论文各表的原始设置与输出对应关系见 [复现指南](https://github.com/dqswordman/rag-decision-sufficiency/blob/main/docs/reproduction.md)。

如有已经核实的 Google Scholar 链接，可增加 `scholarUrl`；否则自动生成按完整标题检索的 Scholar 入口。引用复制使用记录中的作者、标题、会议与年份。当前资料没有 DOI、论文 PDF 或可下载 CV，页面不生成这些信息或空链接。最初若只记录了一名作者，请核实完整作者列表后直接补充数据。

论文年份、总数和分组均由数据自动计算。搜索支持标题、作者、会议、年份及方向名称，多关键词以 AND 方式组合。年份、方向与查询同步到网址，可分享，也会随语言切换保留。

## 发布到 GitHub Pages

仓库已提供 `.github/workflows/pages.yml`。在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。这是采用自定义静态构建流程所需的发布源设置，参见 [GitHub 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

工作流会在 Pull Request 上校验；提交到 `main` 时，在校验通过后上传 `dist/` 并部署。也可以手动触发工作流。它不写入源码分支，不创建统计分支，也不需要 Scholar Secret。

发布时将远端 Pages 的构建模式切换为 GitHub Actions，再推送到 `main`，并确认部署工作流通过。`content/profile.json` 中的 `url` 应与实际站点来源一致，当前为 `https://dqswordman.github.io`。

如果将来部署到项目子目录，可设置 `BASE_PATH`，并在工作流构建步骤中设置同一个值：

```powershell
$env:BASE_PATH = '/research'
npm run verify
npm run preview
# 地址变为 http://127.0.0.1:4173/research/
```

`profile.url` 保持域名来源；路径前缀由 `BASE_PATH` 管理。清除当前 PowerShell 会话的前缀可执行 `$env:BASE_PATH = ''`。

## 兼容与体验

- `/about/`、`/about.html` 及对应中文地址重定向至首页；启用 JavaScript 时保留查询参数与锚点。
- 旧的 `#about-me`、`#news`、`#research-profile`、`#publications`、`#honors-and-awards`、`#education`、`#internships`、`#skills` 全部保留。
- 无 JavaScript 时可阅读全部资料、展开引用并使用导航与外部链接；增强控件会隐藏。
- 剪贴板被拒绝或不可用时，打开可手动选择文本的原生对话框。
- 打印个人资料时包含完整论文列表，不受当前筛选影响。
- 支持键盘焦点、跳至正文、手机菜单、减少动态效果与原生 404 页面。
- 字体、图形、样式与主站脚本均从本站加载；页面内容和主要交互不依赖访客统计服务，也不依赖远程字体或引用抓取。

## 访问统计

页脚显示全站访客数（UV）与访问量（PV），计数来自 [Busuanzi 原服务](https://busuanzi.ibruce.info/)。统计模块是本项目独立实现，只向服务请求站点级计数，不加载旧主题或旧统计脚本。UV 按服务自身口径去重，不能视为精确的现实人数。

- `profile.json` 中的 `visitorStats.enabled` 控制是否启用。
- 仅在 HTTPS 且来源与 `profile.url` 完全相同时发起请求；localhost、预览域名、文件预览和 404 不计数。
- 中英文共享站点统计，搜索、筛选和锚点切换不会额外发起计数请求。
- 请求只发送站点来源作为 Referer，不发送搜索词或锚点。
- 本地显示“上线后显示真实统计”；加载失败或超过 8 秒时显示不可用状态，数字保留为破折号。
- 未启用 JavaScript 时显示说明；不会用本地存储或写死的数字模拟访客数。

上线后由真实访问产生或继续累积服务端计数。第三方服务可能被网络或浏览器扩展阻止，这不会影响主页其他功能。

旧版使用同一 Busuanzi 服务、同一站点域名，所以新版直接继续读取已有累计值。本人在发布前提供的历史快照为 **127 位访客 / 170 次访问**；该快照仅作为迁移记录，不在实时计数上重复叠加，也不重置服务端数据。

## 校验

```powershell
npm test       # 自动先构建，再运行 Node 原生测试
npm run check  # 检查已有 dist 输出
npm run verify
```

校验包括内容字段与地址格式、HTML 转义、论文迁移、双语输出、组合筛选、查询参数、404、旧地址、预览服务器、内部链接、结构化数据、图标文件与压缩传输预算。真实浏览器回归和无障碍检查记录见 [重构说明](docs/rebuild-notes.md)。

更新分享卡时运行 `npm run brand:svg` 生成 SVG，然后将 `public/assets/social-card.svg` 按 **1200 × 630** 栅格化为同目录 `social-card.png`。Apple Touch 图标为 **180 × 180**；ICO 可使用原创图标的方形 PNG 生成：

```powershell
node scripts/brand-ico.mjs path/to/square-icon.png
```

原来的个人头像保留在 `public/assets/avatar.jpg`，目前版面使用原创 WD 标识。

## 源码与许可

本次重构移除了旧主题的模板、SCSS、jQuery 及插件、图标字体、赞助配置、旧文档与抓取工作流。保留的是个人资料、论文记录、头像，以及项目原有 MIT 许可证。Git 历史仍保留，方便追溯资料来源；当前页面实现独立于旧主题。详见 [重构说明](docs/rebuild-notes.md)。
