import { escapeHtml as h } from './content.mjs';
import { icon, monogram } from './components.mjs';
import { history, historyRoutes, referencesFor, eventsForPerson, readingMinutes } from './history.mjs';
import { graphModel, graphSvg } from './history-graph.mjs';

const ext = 'target="_blank" rel="noopener noreferrer"';
const json = (data) => JSON.stringify(data).replaceAll('<', '\\u003c');
const kinds = { events: '事件', people: '人物', chapters: '通史', themes: '专题' };
const categoryLinks = [['', '总览'], ['timeline/', '编年'], ['events/', '事件'], ['people/', '人物'], ['network/', '图谱'], ['sources/', '资料'], ['method/', '收录与方法']];
const miscSections = [
  ['research', '01', '科研项目博客', '以会议为线索，记录问题、实验和研究过程。', 'ICLR · WWW · WSDM'],
  ['lectures', '02', '大部头讲义', '分享系统学习路径、成体系讲义与先修关系。', '学习路径 · 讲义 · 路线图'],
  ['history', '03', '中国近代史研究', '从事件到人物，从史料到解释，阅读1840—2026年的中国。', '90个事件 · 72位人物 · 14章通史'],
  ['books', '04', '书籍博客', '以一本书为单位，留下阅读笔记与持续追问。', '书目 · 笔记 · 讨论'],
  ['finance', '05', '金融博客', '理解金融机制，记录数据、制度与市场之间的关系。', '研究笔记 · 数据与制度'],
];

function header(base, route) {
  return `<header class="m-header"><div class="m-container m-header-inner"><a class="m-brand" href="${base}/zh/">${monogram()}<span>Wenzhang Du<small>研究之外，保持好奇</small></span></a><nav aria-label="主导航" id="misc-nav" class="m-nav"><a href="${base}/zh/">学术主页</a><a href="${base}/misc/" ${route === 'misc/' ? 'aria-current="page"' : ''}>杂项</a><a href="${base}/misc/history/" ${route.startsWith('misc/history/') ? 'aria-current="page"' : ''}>中国近代史</a><a href="${base}/" lang="en">EN Home</a></nav><button class="m-menu" aria-label="打开导航" aria-controls="misc-nav" aria-expanded="false" data-menu hidden>${icon('menu')}</button></div></header>`;
}

function footer(profile, base) {
  return `<footer class="m-footer"><div class="m-container"><div class="m-footer-top"><a class="m-brand" href="${base}/zh/">${monogram()}<span>Wenzhang Du<small>独立构建 · 以证据连接好奇心</small></span></a><a href="#top">返回顶部 ↑</a></div><div class="m-footer-bottom"><p>© 2026 Wenzhang Du · 资料截点 ${history.updated}</p><div class="m-visitors" data-visitors data-site-origin="${h(profile.url)}" data-local-label="本地预览不计入访问量。" data-loading-label="正在加载真实统计…" data-error-label="统计服务暂时不可用。"><span>访客 <strong data-visitor-count>—</strong></span><span>浏览 <strong data-view-count>—</strong></span><small data-visitor-status role="status">启用 JavaScript 后加载真实统计。</small></div></div></div></footer>`;
}

const crumb = (base, parts = []) => `<nav class="m-breadcrumb" aria-label="面包屑"><a href="${base}/misc/">杂项</a>${parts.map(([label, path]) => `<span aria-hidden="true">/</span>${path ? `<a href="${base}/${path}">${h(label)}</a>` : `<span aria-current="page">${h(label)}</span>`}`).join('')}</nav>`;
const eyebrow = (text) => `<p class="m-eyebrow">${h(text)}</p>`;
const title = (label, heading, description) => `<div class="m-page-heading">${eyebrow(label)}<h1>${h(heading)}</h1><p class="m-lead">${h(description)}</p></div>`;
const historyNav = (base, route) => `<nav class="h-tabs" aria-label="历史板块导航">${categoryLinks.map(([path, label]) => `<a href="${base}/misc/history/${path}" ${route === `misc/history/${path}` ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
const tagList = (tags) => `<div class="h-tags">${tags.map((tag) => `<span>${h(tag)}</span>`).join('')}</div>`;
const linkArticle = (item, kind, base) => `${base}/misc/history/${kind}/${item.id}/`;

function eventCard(event, base) {
  const people = event.actors.map((actor) => history.people.find((person) => person.id === actor.person).name);
  return `<li class="h-event-card" data-record data-period="${event.period}" data-tags="${h(event.tags.join('|'))}" data-start="${event.start}" data-end="${event.end}" data-search="${h([event.title, event.summary, event.start, event.end, ...event.tags, ...people].join(' '))}"><div class="h-card-date">${event.start === event.end ? event.start : `${event.start}—${event.end}`}</div><div><h3><a href="${linkArticle(event, 'events', base)}">${h(event.title)}</a></h3><p>${h(event.summary)}</p>${tagList(event.tags)}<small>${people.map(h).join(' · ')}</small></div><span class="h-card-arrow" aria-hidden="true">↗</span></li>`;
}

function essayCard(item, kind, base, index) {
  return `<a class="h-essay-card" href="${linkArticle(item, kind, base)}"><span class="m-eyebrow">${String(index + 1).padStart(2, '0')} ${item.dates ? ` / ${h(item.dates)}` : ''}</span><h3>${h(item.title)}</h3><p>${h(item.summary)}</p><span class="m-text-link">阅读${kinds[kind]} ${icon('arrow')}</span></a>`;
}

function stats() {
  return `<dl class="h-stats">${[[history.events.length, '事件条目'], [history.people.length, '人物传记'], [history.chapters.length, '通史章节'], [history.sources.length, '参考资料']].map(([count, label]) => `<div><dt>${label}</dt><dd>${count}<span> / </span></dd></div>`).join('')}</dl>`;
}

function filters(kind, extra = '') {
  return `<form class="h-filters" data-filters hidden><div class="h-search"><label for="q">${kind === 'people' ? '搜索人物、身份或关联事件' : '搜索标题、人物、主题或关键词'}</label><div>${icon('search')}<input id="q" name="q" type="search" placeholder="${kind === 'people' ? '例如：林则徐、教育、1989' : '例如：改革、妇女、林则徐'}" autocomplete="off"></div></div><div><label for="period">历史阶段</label><select name="period" id="period"><option value="">全部阶段</option>${history.periods.map((period) => `<option value="${period.id}">${h(period.dates)} · ${h(period.title)}</option>`).join('')}</select></div>${extra}<button type="reset" class="m-button m-button-light">重置</button><p class="h-filter-count" data-result-count role="status" aria-live="polite"></p></form><noscript><p class="h-notice">当前显示全部条目。启用 JavaScript 可检索和筛选，所有正文均可直接阅读。</p></noscript>`;
}

function citations(article) {
  const ids = referencesFor(article);
  return (refs) => `<span class="h-citations">${refs.map((id) => `<a href="#ref-${h(id)}" aria-label="参考资料 ${ids.indexOf(id) + 1}">[${ids.indexOf(id) + 1}]</a>`).join(' ')}</span>`;
}

function sourcesList(article) {
  return `<section class="h-references" id="references"><h2>参考资料与阅读说明</h2><p class="h-small">编号对应正文和人物行动中的引文。官方文件、当事人记述与研究解释各有范围；书目或摘要链接不表示已开放全文。</p><ol>${referencesFor(article).map((id) => {
    const source = history.sources.find((item) => item.id === id);
    return `<li id="ref-${id}"><span class="h-source-type">${h(source.type)}</span><a href="${h(source.url)}" ${ext}>${h(source.title)} ${icon('external')}</a><p>${h(source.publisher)} · ${h(source.note)}</p></li>`;
  }).join('')}</ol></section>`;
}

function sections(article) {
  const cite = citations(article);
  return article.sections.map((section, index) => `<section class="h-prose" id="section-${index + 1}"><h2><span>${String(index + 1).padStart(2, '0')}</span>${h(section.title)}</h2>${section.paragraphs.map((paragraph, paragraphIndex) => `<p>${h(paragraph)}${paragraphIndex === section.paragraphs.length - 1 ? cite(section.refs) : ''}</p>`).join('')}</section>`).join('');
}

function table(headers, rows, caption) {
  return `<div class="h-table-wrap" tabindex="0" role="region" aria-label="${h(caption)}"><table><caption>${h(caption)}</caption><thead><tr>${headers.map((header) => `<th scope="col">${h(header)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, index) => `<${index ? 'td' : 'th scope="row"'}>${cell}</${index ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function chronology(event) {
  return `<section id="chronology" class="h-prose"><h2><span>时序</span>关键节点</h2><ol class="h-milestones">${event.milestones.map((point) => `<li><time>${h(point.date)}</time><p>${h(point.label)}</p></li>`).join('')}</ol><p class="h-small">节点按顺序排列，间距不表示实际时间长度。未来目标另以文字标明。</p></section>`;
}

function eventVisual(event) {
  const visual = event.visual;
  if (!visual) return '';
  const cite = citations(event);
  if (visual.type === 'bars') {
    const maximum = Math.max(...visual.values.map(([, value]) => value));
    return `<section class="h-prose" id="visual"><h2><span>图表</span>${h(visual.title)}</h2><figure class="h-bar-chart"><figcaption>${h(visual.title)} · ${h(visual.unit)}</figcaption><ul>${visual.values.map(([label, value]) => `<li><span>${h(label)}</span><div><svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><rect width="${(value / maximum * 100).toFixed(3)}" height="12" rx="1"/></svg></div><strong>${value}${h(visual.unit)}</strong></li>`).join('')}</ul><p>${h(visual.note)} ${cite(visual.refs)}</p></figure></section>`;
  }
  return `<section class="h-prose" id="visual"><h2><span>图解</span>${h(visual.title)}</h2>${table(visual.headers, visual.rows.map((row) => row.map(h)), visual.title)}</section>`;
}

function actions(event, base) {
  const cite = citations(event);
  return `<section class="h-prose" id="actions"><h2><span>人物</span>立场、行动与结果</h2>${table(['人物', '立场及目标', '实际行动', '结果与责任'], event.actors.map((actor) => {
    const person = history.people.find((item) => item.id === actor.person);
    return [`<a href="${linkArticle(person, 'people', base)}">${h(person.name)}</a>`, h(actor.stance), h(actor.action), `${h(actor.result)} ${cite(actor.refs)}`];
  }), '此事件中的人物行动记录')}</section>`;
}

function graphPanel(personId, base, compact = false) {
  const model = graphModel(history, personId);
  return `<div class="h-graph-panel"><p class="h-graph-legend"><span>● 所选人物</span><span>▭ 关联事件</span><span>○ 同事件人物</span></p><p class="h-small">连线表示正文中有行动记录，${compact ? '可进入完整图谱筛选事件。' : '可以点击节点进入正文。'}共同参与不表示同盟；图的位置和距离不表示亲疏或影响力。</p><div class="h-graph-scroll" tabindex="0" role="region" aria-label="人物事件图，可在区域内滚动浏览" data-graph-canvas>${graphSvg(model, base)}</div></div>`;
}

function articleBody(article, kind, base) {
  let additions = '';
  if (kind === 'events') additions = chronology(article) + eventVisual(article) + actions(article, base) + `<section class="h-prose" id="analysis"><h2><span>分析</span>理解与讨论</h2><ul class="h-questions">${article.questions.map((question) => `<li>${h(question)}</li>`).join('')}</ul></section>`;
  if (kind === 'people') {
    const events = eventsForPerson(article.id);
    additions = `<section class="h-prose" id="actions"><h2><span>行动</span>在各事件中的立场与行动</h2><p>以下直接对应本总目中 ${events.length} 个事件的记录。只列已收录事件，不表示此人全部人生行动。</p>${table(['事件', '立场及目标', '实际行动', '结果与责任'], events.map((event) => {
      const actor = event.actors.find((record) => record.person === article.id);
      return [`<a href="${linkArticle(event, 'events', base)}">${event.start} · ${h(event.title)}</a>`, h(actor.stance), h(actor.action), `${h(actor.result)} <a href="${linkArticle(event, 'events', base)}#actions">查看证据 →</a>`];
    }), `${article.name}的逐事件行动`)}<h3>人物—事件关联图</h3>${graphPanel(article.id, base, true)}<a class="m-text-link" href="${base}/misc/history/network/?person=${article.id}">在完整图谱中探索 ${icon('arrow')}</a></section>`;
  }
  if (article.events) additions += `<section class="h-prose" id="related-events"><h2><span>延伸</span>关联事件</h2><ul class="h-event-list">${article.events.map((id) => eventCard(history.events.find((event) => event.id === id), base)).join('')}</ul></section>`;
  if (article.related) additions += `<section class="h-prose" id="related"><h2><span>继续</span>关联阅读</h2><div class="h-related">${article.related.map((id) => {
    const related = history[kind].find((item) => item.id === id);
    return `<a href="${linkArticle(related, kind, base)}">${h(related.title || related.name)} ${icon('arrow')}</a>`;
  }).join('')}</div></section>`;
  const toc = [...article.sections.map((section, index) => [`section-${index + 1}`, section.title]), ...(kind === 'events' ? [['chronology', '关键节点'], ...(article.visual ? [['visual', '图表与图解']] : []), ['actions', '人物行动'], ['analysis', '理解与讨论']] : []), ...(kind === 'people' ? [['actions', '逐事件行动与关联图']] : []), ...(article.events ? [['related-events', '关联事件']] : []), ['references', '参考资料']];
  return `<div class="h-article-layout"><aside class="h-toc"><nav aria-label="本文目录"><p class="m-eyebrow">本文目录</p>${toc.map(([id, label]) => `<a href="#${id}">${h(label)}</a>`).join('')}</nav><button type="button" data-print hidden>${icon('print')} 打印 / 保存 PDF</button></aside><article class="h-article">${sections(article)}${additions}${sourcesList(article)}<p class="h-article-note">独立编写 · 资料截点 ${history.updated} · <a href="${base}/misc/history/method/">收录范围与方法</a></p></article></div>`;
}

function miscellaneous(base) {
  return `${title('MISCELLANY / 杂项', '研究之外，仍有值得追问的世界。', '把科研、学习、历史、阅读与金融放在同一个开放的笔记空间。写下过程，也保留问题。')}<section class="m-hub-grid" aria-label="杂项栏目">${miscSections.map(([id, number, heading, description, line]) => `<a class="m-hub-card ${id === 'history' ? 'm-hub-feature' : ''}" href="${base}/misc/${id}/"><span class="m-eyebrow">${number} / ${id.toUpperCase()}</span><h2>${heading}</h2><p>${description}</p><span>${id === 'history' ? '本次完整专题' : '栏目筹备中'}</span><small>${line}</small>${icon('external')}</a>`).join('')}</section>`;
}

function placeholder(route, base) {
  const key = route.split('/')[1];
  const [, number, heading, description] = miscSections.find(([id]) => id === key);
  let body;
  if (key === 'research') body = `<div class="m-placeholder-grid">${['ICLR 2027', 'WWW 2027', 'WSDM 2027'].map((conference, index) => `<article class="m-placeholder-card"><span class="m-eyebrow">${String(index + 1).padStart(2, '0')} / 会议分类</span><h2>${conference}</h2><p>项目博客待补充</p><small>未来将记录研究问题、方法、实验及复盘。此卡片是栏目占位，不表示投稿或录用。</small></article>`).join('')}</div>`;
  if (key === 'lectures') body = `<section class="m-placeholder-card"><span class="m-status">待发布</span><h2>成体系的学习，而不止是一份书单。</h2><p>这里将分享学习路径、大部头讲义与先修关系网格。讲义和课程清单尚未发布，以下仅示意未来的组织方式。</p><ol class="m-learning-grid"><li><span>01</span><h3>基础模块</h3><p>数学、编程及领域基础</p></li><li><span>02</span><h3>核心模块</h3><p>明确标注先修基础</p></li><li><span>03</span><h3>进阶专题</h3><p>连接理论、论文和实践</p></li><li><span>04</span><h3>研究实践</h3><p>整合已有知识与实验</p></li></ol><p class="h-small">示意顺序：基础 → 核心 → 进阶 → 实践。正式路线发布后，每个模块会提供可查看的先修链接。</p></section>`;
  if (key === 'books') body = `<section class="m-placeholder-card"><span class="m-status">待建书目</span><h2>每本书，一个持续更新的阅读档案。</h2><p>书籍博客将按书目组织，包含阅读记录、核心问题、批评与延伸资料。目前尚未发布书评。</p><div class="m-book-placeholder" aria-hidden="true"><span>READ</span><span>REFLECT</span><span>RETURN</span></div></section>`;
  if (key === 'finance') body = `<section class="m-placeholder-card"><span class="m-status">筹备中</span><h2>从机制出发，理解市场。</h2><p>未来在这里记录金融制度、宏观数据、公司分析和研究方法。文章目录将随实际内容发布，目前没有已完成的金融博客。</p><div class="m-finance-lines" aria-hidden="true">DATA / INSTITUTIONS / MARKETS</div></section>`;
  return `${crumb(base, [[heading]])}${title(`${number} / ${key.toUpperCase()}`, heading, description)}${body}<a class="m-text-link m-return" href="${base}/misc/">← 返回杂项总览</a>`;
}

function historyHome(base) {
  return `<section class="h-hero"><div>${eyebrow('CHINA / A HISTORY IN CONTEXT')}<h1>在变化中，<br>理解中国。</h1><p class="h-hero-years">1840 <span>—</span> 2026</p><p class="m-lead">从战争、革命与建设，到日常生活、权利与知识。<br>沿着事件与人物，追问变革如何发生，又由谁承担代价。</p><div class="m-actions"><a class="m-button" href="${base}/misc/history/chapters/opening/">从第一章开始 ${icon('arrow')}</a><a class="m-button m-button-light" href="${base}/misc/history/timeline/">浏览编年总目</a></div></div><div class="h-hero-art" aria-hidden="true"><span>秩序</span><span>变革</span><span>生活</span><svg viewBox="0 0 420 360" fill="none"><path d="M30 310C70 280 80 80 150 110S210 320 270 210 310 30 390 45"/><path d="M30 240C90 270 100 30 180 80S250 280 300 155 350 125 390 100"/><path d="M30 180C110 100 140 260 220 150S310 260 390 170"/><path d="M30 325h360M30 25v300"/><circle cx="150" cy="110" r="7"/><circle cx="270" cy="210" r="7"/><circle cx="390" cy="45" r="7"/></svg><p>连接真实记录，保留解释的边界。</p></div></section>${stats()}<p class="h-scope-note">90个事件与72位人物均已成文。按公开总目验收，覆盖各阶段及主要主题；<a href="${base}/misc/history/method/">查看收录范围、核查方法与后续增补项 →</a></p><section class="h-index-section"><div class="h-section-heading"><div>${eyebrow('01 / 通史')}<h2>十四章，读懂变化的脉络。</h2></div><a href="${base}/misc/history/timeline/">完整编年 ${icon('arrow')}</a></div><div class="h-chapter-grid">${history.chapters.map((chapter, index) => essayCard(chapter, 'chapters', base, index)).join('')}</div></section><section class="h-index-section"><div class="h-section-heading"><div>${eyebrow('02 / 专题')}<h2>同一段历史，不止一种问题。</h2></div></div><div class="h-theme-grid">${history.themes.map((theme, index) => essayCard(theme, 'themes', base, index)).join('')}</div></section><section class="h-explore"><div>${eyebrow('03 / 交叉阅读')}<h2>从一个人物，走进一组事件。</h2><p>图谱以实际行动记录连接人物与事件。可以聚焦人物，再切换到特定事件，阅读其中各方的立场、行动和责任。</p><a class="m-button" href="${base}/misc/history/network/">打开人物—事件图谱 ${icon('arrow')}</a></div><div class="h-feature-people">${['lin-zexu', 'sun-yatsen', 'he-zhen', 'mao-zedong', 'deng-xiaoping', 'tu-youyou'].map((id) => { const person = history.people.find((item) => item.id === id); return `<a href="${linkArticle(person, 'people', base)}"><span>${h(person.name)}</span><small>${h(person.role)}</small>${icon('external')}</a>`; }).join('')}</div></section>`;
}

function eventIndex(base) {
  const tags = [...new Set(history.events.flatMap((event) => event.tags))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  return `${title('EVENTS / 事件索引', '把大事放回具体处境。', '每个条目包含背景、过程、结果、关键节点和人物行动；数值图表注明统计口径。可按历史阶段、主题、年份及关键词交叉检索。')}${filters('events', `<div><label for="topic">主题</label><select id="topic" name="topic"><option value="">全部主题</option>${tags.map((tag) => `<option>${h(tag)}</option>`).join('')}</select></div><div><label for="year">包含年份</label><input type="number" id="year" name="year" min="1840" max="2026" placeholder="如 1919"></div>`)}<ul class="h-event-list">${history.events.map((event) => eventCard(event, base)).join('')}</ul><p class="h-no-results" data-empty hidden>没有匹配条目。请修改关键词或重置筛选。</p>`;
}

function peopleIndex(base) {
  return `${title('PEOPLE / 人物索引', '看见人物，也看见选择的条件。', '每位人物均有独立传记，以及本总目中逐事件的立场、行动和责任记录。人物名单是明确的收录范围，不能代替所有社会群体的历史。')}${filters('people')}<ul class="h-people-grid">${history.people.slice().sort((a, b) => a.born - b.born).map((person) => {
    const events = eventsForPerson(person.id);
    return `<li data-record data-period="${[...new Set(events.map((event) => event.period))].join('|')}" data-search="${h([person.name, person.role, person.summary, person.born, ...events.map((event) => `${event.title} ${event.start}`)].join(' '))}"><a href="${linkArticle(person, 'people', base)}"><span class="h-person-initial" aria-hidden="true">${h(person.name.slice(0, 1))}</span><span class="m-eyebrow">${h(person.dates)} · ${events.length}个事件</span><h3>${h(person.name)}</h3><p>${h(person.role)}</p><small>${h(person.summary)}</small></a></li>`;
  }).join('')}</ul><p class="h-no-results" data-empty hidden>没有匹配人物。请修改关键词或重置筛选。</p>`;
}

function timeline(base) {
  return `${title('CHRONOLOGY / 编年总目', '一条时间线，许多种经历。', '这是本次验收的90项明确总目。每项均链接完整事件条目，按事件起始年排序；长时段事件只在起始位置列一次，主题或阶段分类可以交叉。')}${filters('timeline')}<ol class="h-timeline">${history.events.map((event, index) => `<li data-record data-period="${event.period}" data-search="${h([event.title, event.summary, event.start, event.end, ...event.tags, ...event.actors.map((actor) => history.people.find((person) => person.id === actor.person).name)].join(' '))}"><div class="h-timeline-year">${event.start}<small>${String(index + 1).padStart(2, '0')}</small></div><article><span class="m-eyebrow">${h(history.periods.find((period) => period.id === event.period).title)}</span><h2><a href="${linkArticle(event, 'events', base)}">${h(event.title)}</a></h2><p>${h(event.summary)}</p><small>${h(event.dates)}</small>${tagList(event.tags)}</article></li>`).join('')}</ol><p class="h-no-results" data-empty hidden>没有匹配条目。</p>`;
}

function network(base, assets) {
  return `${title('CONNECTIONS / 人物—事件图谱', '沿着行动，建立关联。', '选择人物与事件，查看同一事件中的其他参与者。图只表达有正文支持的参与关系，不推断私人关系、同盟或因果强度。')}<div class="h-network-controls" data-network-controls hidden><div><label for="graph-person">聚焦人物</label><select id="graph-person" name="person">${history.people.map((person) => `<option value="${person.id}" ${person.id === 'sun-yatsen' ? 'selected' : ''}>${h(person.name)}</option>`).join('')}</select></div><div><label for="graph-event">聚焦事件</label><select id="graph-event" name="event"><option value="">全部关联事件</option></select></div><div class="h-zoom" role="group" aria-label="图谱缩放"><button type="button" data-zoom="-1" aria-label="缩小图谱">−</button><button type="button" data-zoom="0">重置</button><button type="button" data-zoom="1" aria-label="放大图谱">+</button></div><p role="status" data-graph-status></p></div><section data-network data-url="${base}/assets/${assets.graphData}" data-base="${base}">${graphPanel('sun-yatsen', base)}<div data-graph-detail><h2>孙中山的关联事件</h2><ul class="h-event-list">${eventsForPerson('sun-yatsen').map((event) => eventCard(event, base)).join('')}</ul></div></section><noscript><p class="h-notice">当前显示孙中山的静态图谱。所有人物页都提供独立图谱和行动表，可从下方目录进入。</p></noscript><details class="h-network-directory"><summary>完整人物目录（也可直接进入每人的静态图谱）</summary><div class="h-directory-links">${history.people.map((person) => `<a href="${linkArticle(person, 'people', base)}">${h(person.name)}</a>`).join('')}</div></details>`;
}

function sourceLibrary(base) {
  return `${title('SOURCES / 资料库', '让解释回到可追溯的材料。', '133项资料包括条约、档案、当事人记述、统计和学术研究。每项都说明类型、来源和使用边界，正文使用相应编号链接。')}<form class="h-source-search" data-filters hidden><label for="q">搜索资料标题、机构、类型或说明</label><input id="q" name="q" type="search" placeholder="例如：档案、人口、Cambridge"><button type="reset" class="m-button m-button-light">重置</button><p data-result-count role="status"></p></form><ol class="h-source-library">${history.sources.map((source) => `<li id="source-${source.id}" data-record data-search="${h([source.title, source.publisher, source.type, source.note].join(' '))}"><span class="h-source-type">${h(source.type)}</span><h2><a href="${h(source.url)}" ${ext}>${h(source.title)} ${icon('external')}</a></h2><p>${h(source.publisher)}</p><p>${h(source.note)}</p><details><summary>查看引用此资料的文章</summary><div class="h-directory-links">${['events', 'people', 'chapters', 'themes'].flatMap((kind) => history[kind].filter((article) => referencesFor(article).includes(source.id)).map((article) => `<a href="${linkArticle(article, kind, base)}">${h(article.title || article.name)}</a>`)).join('') || '<p>列作延伸资料。</p>'}</div></details></li>`).join('')}</ol><p class="h-no-results" data-empty hidden>没有匹配资料。</p><p class="h-scope-note">资料可访问状态和公开程度可能变化。无法获取全文时保留摘要或书目信息的边界，不以链接数量代替证据质量。</p>`;
}

function method(base) {
  return `${title('SCOPE & METHOD / 收录与方法', '公开边界，才能认真讨论完整。', '本次按覆盖1840—2026年各阶段和主要主题的明确编年总目验收。总目内条目均已成文；没有把未收录的地方个案或人物伪装成已完成内容。')}${stats()}<div class="h-method-layout"><section class="h-prose"><h2>收录范围与验收标准</h2><p>主要时间范围为1840年至2026年10月10日。为说明战争起因，首条包含1839年禁烟背景；长时段专题可横跨多个阶段。各阶段是阅读分类，时间有交叠，不表示互斥的历史分期。</p><p>本总目包括政治与制度、战争与外交、经济劳动、妇女家庭、教育科技、边疆民族、台湾港澳、灾害环境及公共卫生。90个事件均有正文、时序、人物行动、分析和引用；72位人物均有传记及事件关联；14章和9专题提供贯通解释。每个事件有时序可视化，需要数值或机制比较时另配图表。</p><p>“已完成”指本页链接的明确总目完成，不表示穷尽186年每个地方的所有事件。编年总目是公开清单，任何增删都需同步修改来源、关联及版本记录。</p><a class="m-text-link" href="${base}/misc/history/timeline/">逐项查看编年总目 ${icon('arrow')}</a><p class="h-small"><a href="${base}/assets/history-catalog.json" download>下载本次验收总目（JSON）</a></p></section><section class="h-prose"><h2>事实、立场与解释</h2><p>正文首先交代可证实的过程，再说明参与者目标和行动。官方文件与个人自述用于确认其立场，不能直接当作中立评价。学术研究用于理解机制；网页只开放书介或摘要时，资料说明如实标注。</p><p>客观公正不等于把否认暴行与有充分证据的记录各占一半。既记录建设、抵抗、改革和生活改善，也记录侵略、镇压、歧视、饥荒和强制。成果不能抵销受害者的伤害，受害身份也不能取消同一人物在其他事件中的责任。</p><p>人物行动表依据已收录事件生成，图谱只连接人物与事件。没有私人关系数据时，不绘制“友谊”“敌对”或影响力排名；同一事件中的人物可能合作，也可能对抗。</p></section><section class="h-prose"><h2>数字、图表与当代史</h2><p>伤亡估计必须区分地区、时段、对象、样本和统计方法。超额死亡不等于少出生人口，医院报告不等于全部死亡，装机不等于发电量。口径不一致时不拼接曲线，不填入没有来源的精确值。</p><p>时序节点间距只表达排列；机制表不是计量因果模型，人物图谱距离不表示关系强弱。数值图表注明单位、来源及限制。</p><p>2026年尚未结束：2026年公布的2025年统计属于既成资料，2026年经济增速预测属于预测，2030和2060气候目标属于承诺。更新时会保留这种区分。</p></section><section class="h-prose"><h2>公开的后续增补项</h2><ul class="h-questions"><li>地方与微观史：省县饥荒、城市劳工、农村生活和具体司法个案的独立档案条目。</li><li>社会群体：更多普通女性、少数民族、移民、残障者、儿童和照护者的口述与传记。</li><li>专题扩展：婚姻法实施、卫生与医疗制度、艺术文学、宗教社群及更细的环境史。</li><li>资料深化：为目前只能公开摘要的研究增加可合法访问的全文，补充页码、档案号及多语种互证。</li><li>空间与数据：有明确边界和许可的历史地图，以及同口径、可下载的原始数据图表。</li><li>当代增补：2026年10月10日之后的新事实与年度正式统计，经核查后追加，不提前填充。</li></ul><p>以上是明确未包含在本次验收中的深化方向，栏目内没有将它们标为完成或制作空白的历史文章。</p></section></div><section class="h-index-section"><div class="h-section-heading"><h2>按阶段核对正文覆盖</h2><span>90 / 90 事件已成文</span></div>${table(['阅读阶段', '时间范围', '事件数', '逐项阅读'], history.periods.map((period) => [`${h(period.title)}`, h(period.dates), String(history.events.filter((event) => event.period === period.id).length), `<a href="${base}/misc/history/events/?period=${period.id}">查看事件 →</a>`]), '阶段覆盖核对表')}<p class="h-small">长时段条目只计入一个编辑分类，不能把事件数理解为历史重要性评分。</p></section>`;
}

export function renderMiscPage({ route, profile, basePath: base = '', assets }) {
  let body, heading, description;
  const historyRoute = route.startsWith('misc/history/');
  const pieces = route.split('/');
  const kind = pieces[2], id = pieces[3];
  const article = id && history[kind]?.find((item) => item.id === id);
  if (article) {
    heading = article.title || article.name;
    description = article.summary;
    body = `${crumb(base, [['中国近代史', 'misc/history/'], [kinds[kind], kind === 'chapters' || kind === 'themes' ? 'misc/history/' : `misc/history/${kind}/`], [heading]])}<header class="h-article-header">${eyebrow(`${kinds[kind]} / ${article.dates || '专题阅读'}`)}<h1>${h(heading)}</h1>${article.role ? `<p class="h-person-role">${h(article.role)}</p>` : ''}<p class="m-lead">${h(description)}</p><div class="h-article-meta"><span>约${readingMinutes(article)}分钟 · 正文</span><span>资料截点 ${history.updated}</span>${article.tags ? tagList(article.tags) : ''}</div></header>${articleBody(article, kind, base)}`;
    if (kind === 'events') {
      const index = history.events.indexOf(article);
      body += `<nav class="h-prev-next" aria-label="编年相邻条目">${[[history.events[index - 1], '← 上一条'], [history.events[index + 1], '下一条 →']].map(([event, label]) => event ? `<a href="${linkArticle(event, 'events', base)}"><small>${label}</small><span>${event.start} · ${h(event.title)}</span></a>` : '<span></span>').join('')}</nav>`;
    }
  } else {
    const section = pieces[2] || '';
    const titles = { '': '中国近代史研究', events: '事件索引', people: '人物索引', timeline: '编年总目', network: '人物—事件图谱', sources: '参考资料库', method: '收录范围与方法' };
    heading = historyRoute ? titles[section] : route === 'misc/' ? '杂项' : miscSections.find(([id]) => id === pieces[1])[2];
    description = historyRoute ? '1840—2026中国近代与当代史：通史、人物、事件及可追溯的资料。' : 'Wenzhang Du的科研、学习、历史、阅读与金融笔记。';
    if (!historyRoute) body = route === 'misc/' ? miscellaneous(base) : placeholder(route, base);
    else body = ({ '': historyHome, events: eventIndex, people: peopleIndex, timeline, network, sources: sourceLibrary, method })[section](base, assets);
  }
  const canonical = `${profile.url}${base}/${route}`;
  const structured = article ? { '@context': 'https://schema.org', '@type': 'Article', headline: heading, description, inLanguage: 'zh-CN', dateModified: history.updated, author: { '@type': 'Person', name: profile.name, url: `${profile.url}${base}/` }, mainEntityOfPage: canonical, citation: referencesFor(article).map((id) => history.sources.find((source) => source.id === id).url) } : { '@context': 'https://schema.org', '@type': 'CollectionPage', name: heading, description, inLanguage: 'zh-CN', url: canonical };
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#17332e"><title>${h(heading)} · Wenzhang Du</title><meta name="description" content="${h(description)}"><link rel="canonical" href="${h(canonical)}"><meta property="og:type" content="${article ? 'article' : 'website'}"><meta property="og:title" content="${h(heading)} · Wenzhang Du"><meta property="og:description" content="${h(description)}"><meta property="og:url" content="${h(canonical)}"><meta property="og:locale" content="zh_CN"><meta property="og:image" content="${h(profile.url + base)}/assets/social-card.png"><link rel="icon" href="${base}/assets/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="${base}/assets/apple-touch-icon.png"><link rel="manifest" href="${base}/site.webmanifest"><link rel="stylesheet" href="${base}/assets/${assets.miscCss}"><script type="application/ld+json">${json(structured)}</script><script type="module" src="${base}/assets/${assets.miscJs}"></script></head><body id="top"><a class="m-skip" href="#main">跳至正文</a>${header(base, route)}<main id="main" class="m-container">${historyRoute ? historyNav(base, route) : ''}${body}</main>${footer(profile, base)}</body></html>\n`;
}

export { historyRoutes };
