import {
  escapeHtml as h, paperUrl, citation, publicationGroups, acceptanceYear, newsItems,
  researchIndexes, researchIndexPath, technicalReportPath, venueLabel,
} from './content.mjs';
import { icon, monogram } from './components.mjs';
import { renderResearchIndex, renderReport, reportPreview } from './research.mjs';

export const ui = {
  en: {
    nav: ['About', 'Research', 'Publications', 'Reports', 'Open source', 'Experience'],
    contact: 'Contact',
    skip: 'Skip to content',
    home: 'Wenzhang Du — home',
    language: '中文',
    languageLabel: 'Switch to Chinese',
    menu: 'Open navigation',
    closeMenu: 'Close navigation',
    primaryNav: 'Main navigation',
    about: 'About',
    research: 'Research interests',
    selected: 'Selected papers',
    publications: 'Publications',
    experience: 'Education & experience',
    awards: 'Honors & awards',
    allPapers: 'All publications',
    reports: 'Technical reports',
    report: 'Technical report',
    openSource: 'Open source',
    reportsDescription: 'Methods, figures, and evidence behind the publications.',
    codeDescription: 'Public code and versioned reproducibility releases for the publications.',
    emptyResearch: 'No entries are available yet.',
    readReport: 'Read the report',
    resultsPreview: 'Read the results',
    githubRepository: 'GitHub repository',
    reproductionGuide: 'Reproduction guide',
    release: 'Release',
    publicationEntry: 'Publication entry',
    paperCompanion: 'Paper companion',
    firstPublished: 'First published',
    lastUpdated: 'Updated',
    authorFinal: 'Author-final manuscript',
    updateNote: 'Version',
    reportSources: 'Sources & data',
    reportContents: 'On this page',
    viewFigure: 'View full size',
    figureSource: 'Source data',
    copyCommand: 'Copy commands',
    scholar: 'Google Scholar',
    education: 'Education',
    internship: 'Research experience',
    gpa: 'Cumulative GPA',
    news: 'News',
    newsYears: 'Filter news by year',
    newsAll: 'All',
    newsCount: '{count} of {total} updates',
    newsExpand: 'View the timeline',
    newsCollapse: 'Latest updates',
    newsKinds: { acceptance: 'Accepted', award: 'Recognition', update: 'Milestone' },
    acceptedAt: 'Accepted at',
    acceptedOn: 'Accepted',
    groups: { major: 'Major publications', ei: 'EI conference papers' },
    groupCount: '{count} papers',
    based: 'Based in',
    focus: 'Research focus',
    focusText: 'Trustworthy AI & rigorous evaluation',
    profile: 'Research profile',
    profileNote: 'Computer Engineering & Artificial Intelligence',
    search: 'Search publications',
    searchPlaceholder: 'Search title, author, venue…',
    clearSearch: 'Clear search',
    years: 'Filter by acceptance year',
    allYears: 'All years',
    datePending: 'Date pending',
    topic: 'Research area',
    allTopics: 'All research areas',
    topics: {
      evaluation: 'Trust & evaluation',
      earth: 'Earth observation',
      efficient: 'Efficient ML',
      applied: 'Applied AI',
    },
    showing: 'Showing {count} of {total} publications',
    noResults: 'No matching publications.',
    noResultsHint: 'Try a different keyword or clear the filters.',
    reset: 'Reset filters',
    findPaper: 'Find on Scholar',
    citation: 'Citation',
    copyCitation: 'Copy citation',
    copyEmail: 'Copy email address',
    copied: 'Copied to clipboard.',
    copyFailed: 'Copy was unavailable. Select and copy the text below.',
    copyTitle: 'Copy text',
    done: 'Done',
    print: 'Print profile',
    backTop: 'Back to top',
    footer: 'Independent research homepage',
    updated: 'Profile updated',
    bestPaper: 'Best Paper Award',
    accepted: 'Accepted · forthcoming',
    soleAuthor: 'Sole author',
    independentResearcher: 'Independent Researcher',
    visitorLabel: 'Site statistics',
    visitors: 'Visitors (UV)',
    views: 'Page views (PV)',
    visitorLoading: 'Loading live statistics…',
    visitorLocal: 'Live statistics appear on the published site.',
    visitorError: 'Statistics are temporarily unavailable.',
    visitorNoScript: 'Enable JavaScript to load live statistics.',
    notFound: 'This page has moved off the map.',
    notFoundText:
      'The page you are looking for does not exist. Continue exploring from the homepage.',
    returnHome: 'Return to homepage',
    jsNote: 'All publications are shown. Enable JavaScript to search, filter, and copy citations.',
    openPaper: 'Find this publication on Google Scholar',
  },
  zh: {
    nav: ['关于', '研究方向', '论文', '技术报告', '开源项目', '经历'],
    contact: '联系我',
    skip: '跳至正文',
    home: 'Wenzhang Du — 首页',
    language: 'EN',
    languageLabel: 'Switch to English',
    menu: '打开导航',
    closeMenu: '关闭导航',
    primaryNav: '主导航',
    about: '关于',
    research: '研究方向',
    selected: '精选论文',
    publications: '学术论文',
    experience: '教育与研究经历',
    awards: '荣誉与奖励',
    allPapers: '全部论文',
    reports: '技术报告',
    report: '技术报告',
    openSource: '开源项目',
    reportsDescription: '阅读论文背后的方法、图表与实验证据。',
    codeDescription: '查看已公开的论文代码、实验归档与复现版本。',
    emptyResearch: '暂无条目。',
    readReport: '阅读技术报告',
    resultsPreview: '阅读实验结果',
    githubRepository: 'GitHub 仓库',
    reproductionGuide: '复现指南',
    release: '复现版本',
    publicationEntry: '论文条目',
    paperCompanion: '论文伴读',
    firstPublished: '首次发布',
    lastUpdated: '更新',
    authorFinal: '作者最终稿',
    updateNote: '版本',
    reportSources: '资料与数据',
    reportContents: '报告目录',
    viewFigure: '查看原图',
    figureSource: '数据来源',
    copyCommand: '复制命令',
    scholar: '谷歌学术',
    education: '教育背景',
    internship: '研究经历',
    gpa: '累计 GPA',
    news: '研究动态',
    newsYears: '按年份筛选动态',
    newsAll: '全部',
    newsCount: '{count} / {total} 条动态',
    newsExpand: '展开时间轴',
    newsCollapse: '收起至近期动态',
    newsKinds: { acceptance: '论文录用', award: '荣誉', update: '近况' },
    acceptedAt: '录用于',
    acceptedOn: '录用',
    groups: { major: '主要发表', ei: 'EI 会议论文' },
    groupCount: '{count} 篇论文',
    based: '所在地',
    focus: '研究重点',
    focusText: '可信人工智能与严谨的实证评估',
    profile: '个人研究资料',
    profileNote: '计算机工程与人工智能',
    search: '搜索论文',
    searchPlaceholder: '搜索标题、作者、会议…',
    clearSearch: '清空搜索',
    years: '按录用年份筛选',
    allYears: '全部年份',
    datePending: '日期待补',
    topic: '研究方向',
    allTopics: '全部研究方向',
    topics: {
      evaluation: '可信学习与评估',
      earth: '对地观测',
      efficient: '高效机器学习',
      applied: '人工智能应用',
    },
    showing: '显示 {total} 篇论文中的 {count} 篇',
    noResults: '没有找到匹配的论文。',
    noResultsHint: '请尝试其他关键词，或清空筛选条件。',
    reset: '重置筛选',
    findPaper: '在谷歌学术中查找',
    citation: '引用信息',
    copyCitation: '复制引用',
    copyEmail: '复制邮箱地址',
    copied: '已复制到剪贴板。',
    copyFailed: '暂时无法自动复制，请选中并复制下方文本。',
    copyTitle: '复制文本',
    done: '完成',
    print: '打印个人资料',
    backTop: '返回顶部',
    footer: '独立构建的个人学术主页',
    updated: '资料更新于',
    bestPaper: '最佳论文奖',
    accepted: '已录用 · 即将发表',
    soleAuthor: '唯一作者',
    independentResearcher: '独立研究者',
    visitorLabel: '网站访问统计',
    visitors: '访客数（UV）',
    views: '访问量（PV）',
    visitorLoading: '正在加载真实统计…',
    visitorLocal: '上线后显示真实统计。',
    visitorError: '统计服务暂时不可用。',
    visitorNoScript: '启用 JavaScript 后加载真实统计。',
    notFound: '这个页面暂时不在地图上。',
    notFoundText: '你访问的页面不存在，可以从首页继续探索。',
    returnHome: '返回首页',
    jsNote: '当前显示全部论文。启用 JavaScript 后可搜索、筛选并复制引用。',
    openPaper: '在谷歌学术中查找这篇论文',
  },
};

const navigationIds = ['about-me', 'research-profile', 'publications', ...researchIndexes, 'experience'];
const external = 'target="_blank" rel="noopener noreferrer"';

function dateLabel(value, locale) {
  if (!value) return '';
  if (/^\d{4}$/.test(value)) return value;
  const date = new Date(`${value.length === 7 ? `${value}-01` : value}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    ...(value.length > 7 ? { day: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(date);
}

function header(profile, t, locale, basePath, { away, alternate, currentIndex }) {
  const home = `${basePath}/${locale === 'zh' ? 'zh/' : ''}`;
  const anchor = (id) => `${away ? home : ''}#${id}`;
  const links = navigationIds.map((id, i) => {
    const label = h(t.nav[i]);
    if (researchIndexes.includes(id)) {
      const href = researchIndexPath(id, locale, basePath);
      return `<a href="${h(href)}"${currentIndex === id ? ' aria-current="true"' : ''}>${label}</a>`;
    }
    return `<a href="${anchor(id)}" data-nav="${id}">${label}</a>`;
  }).join('');
  return `<header class="site-header" data-header>
    <div class="container header-inner">
      <a class="brand" href="${away ? home : '#top'}" aria-label="${h(t.home)}">${monogram()}<span>${h(profile.name)}</span></a>
      <nav class="main-nav" id="main-nav" aria-label="${h(t.primaryNav)}">${links}<a class="mobile-contact" href="${anchor('contact')}">${h(t.contact)} ${icon('external')}</a></nav>
      <div class="header-actions"><a class="language-link" data-language href="${alternate}" lang="${locale === 'en' ? 'zh-CN' : 'en'}" hreflang="${locale === 'en' ? 'zh-CN' : 'en'}" aria-label="${h(t.language)} — ${h(t.languageLabel)}">${h(t.language)}</a><a class="header-contact" href="${anchor('contact')}">${h(t.contact)} ${icon('external')}</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="${h(t.menu)}" data-open-label="${h(t.menu)}" data-close-label="${h(t.closeMenu)}" data-menu hidden>${icon('menu')}<span class="sr-only">${h(t.menu)}</span></button></div>
    </div>
  </header>`;
}

function newsPanel(profile, publications, t, locale) {
  const items = newsItems(profile, publications);
  const years = [...new Set(items.map(item => item.date.slice(0, 4)))];
  return `<aside class="news-panel" id="news" aria-labelledby="news-title" data-news data-section>
    <header class="news-heading"><h2 id="news-title">${h(t.news)}</h2>${icon('chart')}</header>
    <div class="news-tools" data-news-tools hidden><div class="news-years" role="group" aria-label="${h(t.newsYears)}"><button type="button" data-news-filter="all" aria-pressed="true" aria-controls="news-list">${h(t.newsAll)}</button>${years.map(year => `<button type="button" data-news-filter="${year}" aria-pressed="false" aria-controls="news-list">${year}</button>`).join('')}</div></div>
    <ol class="news-timeline" id="news-list" role="list">${items.map((item) => {
      const paper = item.publication ? publications.find(p => p.id === item.publication) : null;
      const title = paper ? paper.title : item.title[locale];
      const label = paper
        ? `${item.kind === 'acceptance' ? t.acceptedAt : t.bestPaper} · ${venueLabel(paper)}`
        : t.newsKinds[item.kind];
      return `<li class="news-item" data-news-item data-news-year="${h(item.date.slice(0, 4))}"><div class="news-date"><time datetime="${h(item.date)}">${h(item.date)}</time><span>${h(label)}</span></div><h3>${paper ? `<a href="#paper-${h(paper.id)}" data-paper-jump>${h(title)} ${icon('arrow')}</a>` : h(title)}</h3>${paper ? '' : `<p class="news-detail">${h(item.text[locale])}</p>`}</li>`;
    }).join('')}</ol>
    <footer class="news-footer"><p data-news-count data-template="${h(t.newsCount)}" role="status" aria-live="polite" aria-atomic="true">${h(t.newsCount.replace('{count}', items.length).replace('{total}', items.length))}</p><button type="button" class="news-toggle" data-news-toggle data-expand-label="${h(t.newsExpand)}" data-collapse-label="${h(t.newsCollapse)}" aria-controls="news-list" aria-expanded="false" hidden><span>${h(t.newsExpand)}</span>${icon('down')}</button></footer>
  </aside>`;
}

function paperRow(paper, t, locale, basePath) {
  const search = [
    paper.title,
    ...paper.authors,
    paper.venue,
    paper.year,
    paper.acceptedDate || '',
    paper.affiliation || '',
    paper.status === 'accepted' ? `${ui.en.accepted} ${ui.zh.accepted}` : '',
    ...paper.topics,
    ...paper.topics.flatMap((topic) => [ui.en.topics[topic], ui.zh.topics[topic]]),
  ].join(' ');
  return `<li class="publication" id="paper-${h(paper.id)}" data-publication data-year="${h(acceptanceYear(paper))}" data-topics="${h(paper.topics.join(' '))}" data-search="${h(search)}">
    <article class="paper-content" aria-labelledby="title-${h(paper.id)}">
      <div class="paper-meta"><span>${h(paper.venue)} ${paper.year}</span>${paper.acceptedDate ? `<time datetime="${h(paper.acceptedDate)}" aria-label="${h(t.acceptedOn)} ${h(paper.acceptedDate)}">${h(paper.acceptedDate)}</time>` : `<span class="paper-date-pending">${h(t.datePending)}</span>`}</div>
      <h3 id="title-${h(paper.id)}"><a href="${h(paperUrl(paper))}" ${external}>${h(paper.title)} ${icon('external')}</a></h3>
      <div class="paper-bottom">
        ${paper.technicalReport ? `<a class="resource-link" href="${h(technicalReportPath(paper.id, locale, basePath))}">${icon('book')}${h(t.report)}</a>` : ''}
        ${paper.codeUrl ? `<a class="resource-link" href="${h(paper.codeUrl)}" ${external}>${icon('code')}GitHub${icon('external')}</a>` : ''}
        <details class="citation-details"><summary>${h(t.citation)} <span aria-hidden="true">+</span></summary><div class="citation-body"><p id="citation-${h(paper.id)}">${h(citation(paper))}</p><button class="text-button" type="button" data-copy="citation-${h(paper.id)}" hidden>${icon('copy')}${h(t.copyCitation)}</button></div></details>
      </div>
    </article>
  </li>`;
}

function footer(profile, t, notFound) {
  const visitors =
    profile.visitorStats?.enabled && !notFound
      ? `<section class="container visitor-stats" aria-label="${h(t.visitorLabel)}" data-visitors data-site-origin="${h(profile.url)}" data-local-label="${h(t.visitorLocal)}" data-loading-label="${h(t.visitorLoading)}" data-error-label="${h(t.visitorError)}"><dl class="visitor-values"><div><dt>${h(t.visitors)}</dt><dd data-visitor-count>—</dd></div><div><dt>${h(t.views)}</dt><dd data-view-count>—</dd></div></dl><p class="visitor-status" data-visitor-status role="status">${h(t.visitorNoScript)}</p><a class="visitor-provider" href="https://busuanzi.ibruce.info/" ${external}>Busuanzi ${icon('external')}</a></section>`
      : '';
  return `<footer class="site-footer">${visitors}<div class="container footer-inner"><a class="footer-brand" href="#top">${monogram()}<span>${h(profile.name)}</span></a><p>© ${profile.copyrightStart}–${new Date().getUTCFullYear()} ${h(profile.name)}</p><a class="back-top" href="#top">${h(t.backTop)} ${icon('arrow')}</a></div></footer>`;
}

export function renderPage({
  profile,
  publications,
  locale = 'en',
  basePath = '',
  assets,
  notFound = false,
  report,
  index,
}) {
  const copy = profile.locales[locale];
  const t = ui[locale];
  const home = `${basePath}/${locale === 'zh' ? 'zh/' : ''}`;
  const localizedPath = (language) => {
    if (report) return technicalReportPath(report.id, language, basePath);
    if (index) return researchIndexPath(index, language, basePath);
    return `${basePath}/${language === 'zh' ? 'zh/' : ''}`;
  };
  const routes = { en: localizedPath('en'), zh: localizedPath('zh') };
  const canonical = profile.url + routes[locale];
  const indexTitle = index === 'technical-reports' ? t.reports : t.openSource;
  const indexDescription = index === 'technical-reports' ? t.reportsDescription : t.codeDescription;
  const reportCopy = report?.technicalReport.locales[locale];
  const title = report ? `${reportCopy.title ?? report.title} · ${t.report}`
    : index ? `${indexTitle} · ${profile.name}` : `${profile.name} · ${copy.role}`;
  const description = report ? reportCopy.summary
    : index ? indexDescription : copy.description;
  const article = report?.technicalReport.article;
  const figure = reportPreview(report?.technicalReport)?.figure;
  const shareImage = figure ?? { file: 'assets/social-card.png', width: 1200, height: 630 };
  const shareAlt = figure?.alt[locale] ?? `${profile.name} · ${profile.locales.en.heroStatement.join(' ')}`;
  const orderedPapers = [...publications].sort((a, b) => (b.acceptedDate || '').localeCompare(a.acceptedDate || ''));
  const years = [...new Set(publications.map(acceptanceYear).filter(year => year !== 'undated'))].sort((a, b) => b - a);
  const yearGroups = [...years, ...(publications.some(paper => !paper.acceptedDate) ? ['undated'] : [])];
  const yearLabel = year => year === 'undated' ? t.datePending : year;
  const localeCode = locale === 'zh' ? 'zh-CN' : 'en';
  const person = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: canonical,
    inLanguage: localeCode,
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      url: `${profile.url}${basePath}/`,
      description: copy.description,
      jobTitle: copy.identity,
      email: `mailto:${profile.email}`,
      sameAs: [profile.github, profile.scholar],
      knowsAbout: copy.research.flatMap((item) => item.tags),
    },
  };
  const main = notFound
    ? `<main id="main" class="error-page container" tabindex="-1"><p class="eyebrow">404 / ${h(profile.name)}</p><h1>${h(t.notFound)}</h1><p>${h(t.notFoundText)}</p><a class="button button-dark" href="${home}">${h(t.returnHome)}${icon('arrow')}</a></main>`
    : report ? renderReport(report, t, locale, home, basePath)
      : index ? renderResearchIndex(index, orderedPapers, t, locale, home, basePath) : `
  <main id="main" tabindex="-1">
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <div class="hero-copy">
          <p class="eyebrow hero-eyebrow"><span class="status-dot" aria-hidden="true"></span>${h(copy.identity)}</p>
          <h1 id="hero-title">${h(profile.name)}</h1>
          <p class="hero-role">${h(copy.role)}</p>
          <p class="hero-statement">${h(copy.heroStatement[0])} <em>${h(copy.heroStatement[1])}</em></p>
          <p class="hero-intro">${h(copy.heroIntro)}</p>
          <div class="hero-actions">
            <a class="button button-dark" href="#publications">${h(t.publications)}${icon('down')}</a>
            <a class="hero-route" id="technical-reports" data-research-index href="${h(researchIndexPath('technical-reports', locale, basePath))}">${icon('book')}${h(t.reports)}${icon('arrow')}</a>
            <a class="hero-route" id="open-source" data-research-index href="${h(researchIndexPath('open-source', locale, basePath))}">${icon('code')}${h(t.openSource)}${icon('arrow')}</a>
          </div>
        </div>
        ${newsPanel(profile, publications, t, locale)}
      </div>
      <div class="container hero-bottom">
        <p>${icon('pin')}${h(copy.location)}<span class="hero-divider" aria-hidden="true"></span>${h(copy.degree)}</p>
        <div class="hero-links">
          <a class="text-link" href="${h(profile.scholar)}" ${external}>${h(t.scholar)}${icon('external')}</a>
          <a class="text-link" href="${h(profile.github)}" ${external}>GitHub${icon('external')}</a>
        </div>
      </div>
    </section>
    <section class="section about-section container" id="about-me" aria-labelledby="about-title" data-section>
      <div class="section-heading"><h2 id="about-title">${h(t.about)}</h2></div>
      <div class="about-body"><p class="body-lead">${h(copy.aboutLead)}</p>${copy.aboutParagraphs.map((p) => `<p>${h(p)}</p>`).join('')}<div class="about-links"><button class="text-button print-button" type="button" data-print hidden>${icon('print')}${h(t.print)}</button></div></div>
    </section>
    <section class="research-section" id="research-profile" aria-labelledby="research-title" data-section><div class="container section"><div class="section-heading section-heading-row"><h2 id="research-title">${h(t.research)}</h2><p class="section-description">${h(copy.researchIntro)}</p></div><div class="research-grid">${copy.research.map((item) => `<article class="research-card"><div class="research-card-top">${icon(item.icon)}</div><h3>${h(item.title)}</h3><p>${h(item.description)}</p><ul class="research-tags">${item.tags.map((tag) => `<li>${h(tag)}</li>`).join('')}</ul></article>`).join('')}</div>
      <div class="selected-heading"><h3>${h(t.selected)}</h3><a class="text-link" href="#publications">${h(t.allPapers)}${icon('arrow')}</a></div>
      <div class="selected-grid">${profile.featured
        .map((id) => {
          const paper = publications.find((item) => item.id === id);
          return `<a class="selected-paper" href="#paper-${h(id)}" data-featured="${h(id)}"><div><span class="selected-venue">${h(venueLabel(paper))}${paper.acceptedDate ? ` · <time datetime="${h(paper.acceptedDate)}">${h(paper.acceptedDate)}</time>` : ''}</span><span class="selected-title">${h(paper.title)}</span></div>${icon('arrow')}</a>`;
        })
        .join('')}</div>
    </div></section>
    <section class="section publications-section container" id="publications" aria-labelledby="publications-title" data-section><div class="section-heading section-heading-row"><h2 id="publications-title">${h(t.publications)}</h2><div class="publication-heading-note"><p>${h(copy.publicationIntro)}</p><a class="text-link" href="${h(profile.scholar)}" ${external}>${h(t.scholar)}${icon('external')}</a></div></div>
      <div class="publication-tools" data-filter-tools hidden><div class="search-wrap">${icon('search')}<label class="sr-only" for="publication-search">${h(t.search)}</label><input id="publication-search" type="search" placeholder="${h(t.searchPlaceholder)}" autocomplete="off" maxlength="200" aria-controls="publication-list"><button class="search-clear" type="button" data-clear-search aria-label="${h(t.clearSearch)}" hidden>${icon('close')}</button></div><div class="year-filters" role="group" aria-label="${h(t.years)}"><button type="button" data-year-filter="all" aria-pressed="true">${h(t.allYears)}</button>${yearGroups.map((year) => `<button type="button" data-year-filter="${year}" aria-pressed="false">${h(yearLabel(year))}</button>`).join('')}</div><label class="sr-only" for="publication-topic">${h(t.topic)}</label><select id="publication-topic" aria-controls="publication-list"><option value="all">${h(t.allTopics)}</option>${Object.entries(
        t.topics,
      )
        .map(([key, value]) => `<option value="${key}">${h(value)}</option>`)
        .join('')}</select></div>
      <div class="publication-count"><p data-result-count data-template="${h(t.showing)}" role="status" aria-live="polite" aria-atomic="true">${h(t.showing.replace('{count}', publications.length).replace('{total}', publications.length))}</p><span>${years[0]} — ${years.at(-1)}</span></div><noscript><p class="no-js-note">${h(t.jsNote)}</p></noscript>
      <div id="publication-list">${publicationGroups.map(group => {
        const papers = orderedPapers.filter(paper => paper.group === group);
        const groupYears = yearGroups.filter(year => papers.some(paper => acceptanceYear(paper) === year));
        return `<section class="publication-group" id="${group}-publications" data-publication-group aria-labelledby="${group}-publications-title"><header class="publication-group-heading"><h3 id="${group}-publications-title">${h(t.groups[group])}</h3><p data-group-count data-template="${h(t.groupCount)}">${h(t.groupCount.replace('{count}', papers.length))}</p></header>${groupYears.map(year => `<section class="publication-year" data-year-group="${year}" aria-labelledby="${group}-year-${year}"><div class="year-heading"><h4 id="${group}-year-${year}">${h(yearLabel(year))}</h4><span data-year-count>${papers.filter(paper => acceptanceYear(paper) === year).length}</span><span class="year-rule" aria-hidden="true"></span></div><ol class="publication-list" role="list">${papers.filter(paper => acceptanceYear(paper) === year).map(paper => paperRow(paper, t, locale, basePath)).join('')}</ol></section>`).join('')}</section>`;
      }).join('')}</div>
      <div class="empty-state" data-empty-state hidden>${icon('search')}<h3>${h(t.noResults)}</h3><p>${h(t.noResultsHint)}</p><button class="button button-dark" type="button" data-reset-filters>${h(t.reset)}${icon('arrow')}</button></div>
    </section>
    <section class="experience-section" id="experience" aria-labelledby="experience-title" data-section><div class="container section"><div class="section-heading"><h2 id="experience-title">${h(t.experience)}</h2></div><div class="experience-body"><article class="timeline-item" id="internships"><div class="timeline-marker">${icon('globe')}</div><p class="eyebrow">${h(t.internship)}</p><p class="timeline-date"><time datetime="${profile.internshipStart}">${h(dateLabel(profile.internshipStart, locale))}</time> — ${h(copy.present)}</p><h3>${h(copy.internshipRole)}</h3><p class="timeline-team">${h(copy.internshipTeam)}</p></article><article class="timeline-item" id="education"><div class="timeline-marker">${icon('book')}</div><p class="eyebrow">${h(t.education)}</p><p class="timeline-date"><time datetime="${profile.education.start}">${h(dateLabel(profile.education.start, locale))}</time> — <time datetime="${profile.education.end}">${profile.education.end}</time><span class="graduated-label">${h(copy.graduate)}</span></p><h3>${h(copy.degree)}</h3><p class="gpa-line">${h(t.gpa)}<strong>${h(profile.education.gpa)}<span> / ${h(profile.education.gpaScale)}</span></strong></p></article></div></div></section>
    <section class="section recognition-section container" id="honors-and-awards" aria-labelledby="awards-title" data-section><div class="section-heading"><h2 id="awards-title">${h(t.awards)}</h2></div><div class="awards-list">${copy.awards.map((award) => `<article class="award-item"><span class="award-icon">${icon(award.kind === 'grant' ? 'globe' : 'award')}</span><div><h3>${h(award.title)}</h3>${award.detail ? `<p>${h(award.detail)}</p>` : ''}</div>${award.date ? `<time datetime="${h(award.date)}">${h(dateLabel(award.date, locale))}</time>` : ''}</article>`).join('')}</div><div class="skills-section" id="skills"><div><p class="eyebrow">${h(copy.skillsTitle)}</p>${icon('code')}</div><dl class="skills-grid">${copy.skills.map((skill) => `<div><dt>${h(skill.title)}</dt><dd>${h(skill.text)}</dd></div>`).join('')}</dl></div></section>
    <section class="contact-section" id="contact" aria-labelledby="contact-title" data-section><div class="container contact-inner"><div><h2 id="contact-title">${h(t.contact)}</h2><p class="contact-intro">${h(copy.contactIntro)}</p></div><div class="contact-links"><a class="contact-email" href="mailto:${h(profile.email)}"><span id="contact-email">${h(profile.email)}</span>${icon('external')}</a><div class="contact-secondary"><button type="button" class="text-button" data-copy="contact-email" hidden>${icon('copy')}${h(t.copyEmail)}</button><a class="text-link" href="${h(profile.github)}" ${external}>GitHub${icon('external')}</a><a class="text-link" href="${h(profile.scholar)}" ${external}>${h(t.scholar)}${icon('external')}</a></div><p class="contact-location">${icon('pin')}${h(copy.location)}</p></div></div></section>
  </main>`;
  return `<!doctype html>
<html lang="${localeCode}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${notFound ? '404 · ' : ''}${h(title)}</title>
  <meta name="description" content="${h(description)}">
  ${report ? `<meta name="author" content="${h(report.authors.join(', '))}">` : ''}
  <meta name="theme-color" content="#f7f8f3">
  <meta name="color-scheme" content="light">
  ${notFound ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${h(canonical)}">\n  <link rel="alternate" hreflang="en" href="${h(profile.url + routes.en)}">\n  <link rel="alternate" hreflang="zh-CN" href="${h(profile.url + routes.zh)}">\n  <link rel="alternate" hreflang="x-default" href="${h(profile.url + routes.en)}">`}
  <meta property="og:type" content="${report ? 'article' : 'website'}">
  <meta property="og:site_name" content="${h(profile.name)}">
  <meta property="og:title" content="${h(title)}">
  <meta property="og:description" content="${h(description)}">
  <meta property="og:locale" content="${locale === 'zh' ? 'zh_CN' : 'en_US'}">
  <meta property="og:url" content="${h(canonical)}">
  <meta property="og:image" content="${h(`${profile.url}${basePath}/${shareImage.file}`)}">
  <meta property="og:image:width" content="${shareImage.width}">
  <meta property="og:image:height" content="${shareImage.height}">
  <meta property="og:image:alt" content="${h(shareAlt)}">
  ${article ? `<meta property="article:published_time" content="${h(article.published)}">
  <meta property="article:modified_time" content="${h(article.updated)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${basePath}/assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="${basePath}/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="${basePath}/assets/apple-touch-icon.png">
  <link rel="manifest" href="${basePath}/site.webmanifest">
  <link rel="stylesheet" href="${basePath}/assets/${assets.css}">
  ${(report || index) && assets.researchCss ? `<link rel="stylesheet" href="${basePath}/assets/${assets.researchCss}">` : ''}
  ${assets.experienceCss ? `<link rel="stylesheet" href="${basePath}/assets/${assets.experienceCss}">` : ''}
  ${notFound || report || index ? '' : `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`}
  <script type="module" src="${basePath}/assets/${assets.js}"></script>
</head>
<body id="top" data-locale="${locale}" data-copy-success="${h(t.copied)}" data-copy-failed="${h(t.copyFailed)}">
  <a class="skip-link" href="#main">${h(t.skip)}</a>
  ${header(profile, t, locale, basePath, {
    away: Boolean(notFound || report || index),
    alternate: routes[locale === 'en' ? 'zh' : 'en'],
    currentIndex: report ? 'technical-reports' : index,
  })}
  ${main}
  ${footer(profile, t, notFound)}
  <div class="toast" role="status" aria-live="polite" aria-atomic="true" data-toast></div>
  <dialog class="copy-dialog" data-copy-dialog aria-labelledby="copy-title"><div class="copy-dialog-heading"><h2 id="copy-title">${h(t.copyTitle)}</h2><button type="button" data-close-copy aria-label="${h(t.done)}">${icon('close')}</button></div><p>${h(t.copyFailed)}</p><label class="sr-only" for="copy-fallback-text">${h(t.copyTitle)}</label><textarea id="copy-fallback-text" readonly rows="6"></textarea><button class="button button-dark" type="button" data-close-copy>${h(t.done)}${icon('check')}</button></dialog>
</body>
</html>\n`;
}
