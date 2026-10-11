# Wenzhang Du · Research Homepage

Wenzhang Du 的个人学术主页，使用原创页面结构、视觉设计与交互实现。英文首页位于 `/`，中文首页位于 `/zh/`。

深绿、暖白与黄铜色构成视觉基调，衬线标题搭配简洁正文。首屏的球面网格、WD 标识、图标与分享卡均由本项目代码绘制。所有主要内容在构建时生成 HTML，JavaScript 只增强搜索、筛选、导航与复制功能。

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
| `content/profile.json`      | 姓名、网址、联系方式、教育信息、研究兴趣、荣誉与中英文文案 |
| `content/publications.json` | 两种语言共享的完整论文记录                                 |
| `src/render.mjs`            | 页面与组件组合、双语界面文字、SEO 与结构化数据             |
| `src/components.mjs`        | 原创图标、WD 标识、数学球面图形                            |
| `src/styles.css`            | 响应式设计、无障碍状态与打印样式                           |
| `src/client.js`             | 导航、筛选、语言切换、引用与邮箱复制                       |
| `src/filter.mjs`            | 搜索匹配与可分享的筛选状态                                 |
| `src/visitors.mjs`          | 真实访客统计、线上域名判断与失败回退                       |
| `scripts/`                  | 构建、开发服务器、输出校验和品牌素材工具                   |
| `public/`                   | 原样复制到发布目录的静态资源                               |

修改个人资料时，同时维护 `locales.en` 与 `locales.zh`，并更新 `updated`。当前资料更新于 **2026-10**，包括独立研究者身份和 PAIRSAFE 录用信息；原始 2026-06 新闻仍保留。GPA 按本人要求简写为 **3.5/4**。

添加论文示例：

```json
{
  "id": "stable-paper-id",
  "title": "The exact publication title",
  "authors": ["Wenzhang Du", "Another Author"],
  "venue": "Conference 2027",
  "year": 2027,
  "topics": ["evaluation"]
}
```

`id` 必须唯一且稳定，它同时用于论文深链接。`topics` 支持 `evaluation`、`earth`、`efficient`、`applied`，可以填写多个。`profile.json` 中的 `featured` 指向需要展示的论文 ID。

已录用、尚未正式发表的论文使用 `"status": "accepted"`，页面与引用都会明确标注。正式发表后改为 `"status": "published"`。`affiliation` 可填写论文对应身份；PAIRSAFE 当前记录为 AACL-IJCNLP 2026 已录用、唯一作者、Independent Researcher。该录用信息由本人提供；[会议官网](https://2026.aaclnet.org/)确认会议于 2026 年 11 月举行。

如有已经核实的 Google Scholar 链接，可增加 `scholarUrl`；否则自动生成按完整标题检索的 Scholar 入口。引用复制使用记录中的作者、标题、会议与年份。当前资料没有 DOI、论文 PDF 或可下载 CV，页面不生成这些信息或空链接。最初若只记录了一名作者，请核实完整作者列表后直接补充数据。

论文年份、总数和分组均由数据自动计算。搜索支持标题、作者、会议、年份及方向名称，多关键词以 AND 方式组合。年份、方向与查询同步到网址，可分享，也会随语言切换保留。

## 杂项与中国近代史研究

中英文主页导航均有“杂项 / Miscellany”入口，中文版为 `/misc/`，英文版为 `/en/misc/`。五个栏目分别为科研项目博客、大部头讲义、中国近代史研究、书籍博客及金融博客。科研项目按 ICLR 2027、WWW 2027、WSDM 2027 预留位置；讲义含明确标为示意的先修学习网格，书籍及金融栏目保留筹备说明。

历史板块分为 **Full 详细版**和 **Lite 概览版**，两版均有完整中英文页面。Full 位于 `/misc/history/full/` 与 `/en/misc/history/full/`，新增 **23 章、172 个双语对应小节**，其中抗战 6 章、建国后 11 章、背景 4 章、贯通社会专题 2 章。详细版摘要、小节标题及正文共 **43,360 个汉字 / 20,167 个英文词**，不含原 Lite、行动表、时序、引用及资料说明。数字按汉字字符及空格分词分别统计，不能直接比较两种语言的字数。

原有 14 章通史、9 个专题和 90 个事件保留为 Lite，入口为 `/misc/history/lite/` 与英文对应路径。每个事件都能进入对应 Full 章节。现在共有 **80 位人物、153 项资料和 268 条人物行动记录**，新增日本及盟国关键人物；人物传记、事件行动表和图谱复用相同的参与记录。传记、事件、来源注释、图表、检索及图谱界面也都提供英文内容。

验收依据覆盖 1840—2026 年各阶段及主要主题的明确编年总目；包含 1839 年禁烟背景，事实截点为 **2026-10-10**。不声称穷尽每个地方的全部事件。范围、数字口径、资料限制及后续增补方向公开于 `/misc/history/method/`；编年总目位于 `/misc/history/timeline/`。中英方法页分别提供 `history-catalog.json` / `history-catalog.en.json`，v2 总目包含双语 URL、全部 Full 正文小节、来源和增补项。

| 文件 | 用途 |
| --- | --- |
| `content/history/schema.mjs` | 分期及段落、人物行动、传记的内容结构 |
| `content/history/events-*.mjs` | 五组事件正文、人物立场与行动、时序和可选图表 |
| `content/history/people-*.mjs` | 三组人物传记；未知卒年明确标注 |
| `content/history/essays.mjs` | 通史章节与跨时期专题 |
| `content/history/full-*.mjs` / `full.mjs` | Full 双语长章、具体案例、来源及章节汇总 |
| `content/history/en-*.mjs` / `english.mjs` | Lite 英文正文、人物、行动、图表和来源本地化 |
| `content/history/people-international.mjs` | 日本及盟国人物传记、英文正文与参与记录 |
| `content/history/sources.mjs` | 来源元数据、直达链接、材料类型与使用限制 |
| `src/history.mjs` | 内容汇总、关联查询、完整性校验与路由 |
| `src/misc-render.mjs` / `src/misc.css` | 杂项及历史页面的独立原创结构与设计 |
| `src/misc-client.js` / `src/history-search.mjs` | 渐进增强导航、检索、筛选与状态恢复 |
| `src/history-graph.mjs` | 静态与交互页面共用的人物—事件图谱 |

新增事件时使用稳定 ID，提供双语正文、来源、人物行动、关键节点、分析问题及 Full 阅读路径；先登记资料及其英文使用说明。新增人物须提供双语传记，并至少关联一个有证据的事件。Full 使用成对小节，保持中英文相同的节序、引用和事件关联。构建检查全部引用及关系，缺少英文正文或来源说明会报错。图谱只表达有记录的事件参与，不自动推断同盟、亲属或影响力。

正文及资料直接生成静态 HTML，不依赖外部接口或 JavaScript 才能阅读。每种语言有 230 个杂项路由，全站共 467 个 HTML 页面；逐页提供 canonical、对应语言链接与 sitemap。事件支持关键词、分期、主题与包含年份的组合筛选，人物和资料支持双语检索；语言切换保留查询、图谱选择及对应阅读小节。图谱支持缩放、浏览器后退和节点跳转；数据加载失败时仍保留静态图与人物目录。文章有目录、参考资料、章节前后导航及打印样式。

维护、引用原则及本次浏览器验收记录见 [历史板块说明](docs/history-notes.md)。

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
