import { escapeHtml as h, paperUrl, citation } from './content.mjs';
import { icon, monogram, trustField } from './components.mjs';

export const ui = {
  en: {
    nav: ['About', 'Research', 'Publications', 'Experience'],
    contact: 'Let’s talk',
    skip: 'Skip to content',
    home: 'Wenzhang Du — home',
    language: '中文',
    languageLabel: 'Switch to Chinese',
    menu: 'Open navigation',
    closeMenu: 'Close navigation',
    primaryNav: 'Main navigation',
    viewWork: 'Explore my research',
    getInTouch: 'Get in touch',
    scroll: 'Scroll to discover',
    fieldTop: 'TRUST, THROUGH EVIDENCE',
    fieldBottom: 'EVALUATE · AUDIT · IMPROVE',
    stats: ['Publications & accepted papers', 'Research directions', 'Best Paper · ICPEI'],
    about: '01 / ABOUT',
    research: '02 / RESEARCH',
    selected: 'SELECTED WORK',
    publications: '03 / PUBLICATIONS',
    experience: '04 / EXPERIENCE',
    awards: '05 / RECOGNITION',
    contactLabel: '06 / CONTACT',
    allPapers: 'Full publication index',
    scholar: 'Google Scholar',
    education: 'Education',
    internship: 'Research experience',
    gpa: 'Cumulative GPA',
    news: 'Latest update',
    based: 'Based in',
    focus: 'Research focus',
    focusText: 'Trustworthy AI & rigorous evaluation',
    profile: 'Research profile',
    profileNote: 'Computer Engineering & Artificial Intelligence',
    paperHeading: 'The publication index.',
    search: 'Search publications',
    searchPlaceholder: 'Search title, author, venue…',
    clearSearch: 'Clear search',
    years: 'Filter by year',
    allYears: 'All years',
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
    oral: 'Oral presentation',
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
    nav: ['关于', '研究方向', '论文', '经历'],
    contact: '联系我',
    skip: '跳至正文',
    home: 'Wenzhang Du — 首页',
    language: 'EN',
    languageLabel: 'Switch to English',
    menu: '打开导航',
    closeMenu: '关闭导航',
    primaryNav: '主导航',
    viewWork: '探索我的研究',
    getInTouch: '联系交流',
    scroll: '向下探索',
    fieldTop: '信任，源于证据',
    fieldBottom: '评估 · 审计 · 改进',
    stats: ['会议论文与已录用论文', '主要研究方向', '最佳论文 · ICPEI'],
    about: '01 / 关于',
    research: '02 / 研究方向',
    selected: '近期研究',
    publications: '03 / 学术论文',
    experience: '04 / 教育与经历',
    awards: '05 / 荣誉',
    contactLabel: '06 / 联系',
    allPapers: '完整论文索引',
    scholar: '谷歌学术',
    education: '教育背景',
    internship: '研究经历',
    gpa: '累计 GPA',
    news: '最近更新',
    based: '所在地',
    focus: '研究重点',
    focusText: '可信人工智能与严谨的实证评估',
    profile: '个人研究资料',
    profileNote: '计算机工程与人工智能',
    paperHeading: '学术论文索引。',
    search: '搜索论文',
    searchPlaceholder: '搜索标题、作者、会议…',
    clearSearch: '清空搜索',
    years: '按年份筛选',
    allYears: '全部年份',
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
    oral: '口头报告',
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

const navigationIds = ['about-me', 'research-profile', 'publications', 'experience'];
const external = 'target="_blank" rel="noopener noreferrer"';
const multiline = (value) => h(value).replace(/\n/g, '<br>');

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

function header(profile, copy, t, locale, basePath, isError) {
  const home = `${basePath}/${locale === 'zh' ? 'zh/' : ''}`;
  const alternate = `${basePath}/${locale === 'en' ? 'zh/' : ''}`;
  const anchor = (id) => `${isError ? home : ''}#${id}`;
  return `<header class="site-header" data-header>
    <div class="container header-inner">
      <a class="brand" href="${isError ? home : '#top'}">${monogram()}<span>${h(profile.name)}<small>${h(copy.role)}</small></span></a>
      <nav class="main-nav" id="main-nav" aria-label="${h(t.primaryNav)}">${navigationIds.map((id, i) => `<a href="${anchor(id)}" data-nav="${id}">${h(t.nav[i])}</a>`).join('')}<a href="${basePath}/misc/">${locale === 'en' ? 'Miscellany' : '杂项'}</a><a class="mobile-contact" href="${anchor('contact')}">${h(t.contact)} ${icon('external')}</a></nav>
      <div class="header-actions"><a class="language-link" data-language href="${alternate}" lang="${locale === 'en' ? 'zh-CN' : 'en'}" hreflang="${locale === 'en' ? 'zh-CN' : 'en'}" aria-label="${h(t.language)} — ${h(t.languageLabel)}">${h(t.language)}</a><a class="header-contact" href="${anchor('contact')}">${h(t.contact)} ${icon('external')}</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="${h(t.menu)}" data-open-label="${h(t.menu)}" data-close-label="${h(t.closeMenu)}" data-menu hidden>${icon('menu')}<span class="sr-only">${h(t.menu)}</span></button></div>
    </div>
  </header>`;
}

function paperBadge(paper, t) {
  if (paper.status === 'accepted') return `<span class="paper-badge">${h(t.accepted)}</span>`;
  if (paper.venue.includes('Oral')) return `<span class="paper-badge">${h(t.oral)}</span>`;
  if (paper.venue === 'ICPEI 2025')
    return `<span class="paper-badge">${icon('award')}${h(t.bestPaper)}</span>`;
  return '';
}

function paperRow(paper, index, profile, t) {
  const search = [
    paper.title,
    ...paper.authors,
    paper.venue,
    paper.year,
    paper.affiliation || '',
    paper.status === 'accepted' ? `${ui.en.accepted} ${ui.zh.accepted}` : '',
    ...paper.topics,
    ...paper.topics.flatMap((topic) => [ui.en.topics[topic], ui.zh.topics[topic]]),
  ].join(' ');
  return `<li class="publication" id="paper-${h(paper.id)}" data-publication data-year="${paper.year}" data-topics="${h(paper.topics.join(' '))}" data-search="${h(search)}">
    <span class="paper-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
    <article class="paper-content" aria-labelledby="title-${h(paper.id)}">
      <div class="paper-meta"><span>${h(paper.venue)}</span>${paperBadge(paper, t)}</div>
      <h3 id="title-${h(paper.id)}"><a href="${h(paperUrl(paper))}" ${external}>${h(paper.title)} ${icon('external')}</a></h3>
      <p class="paper-authors">${paper.authors.map((author) => (author === profile.name ? `<strong>${h(author)}</strong>` : h(author))).join(', ')}</p>
      ${paper.affiliation ? `<p class="paper-author-note">${paper.authors.length === 1 ? `${h(t.soleAuthor)} · ` : ''}${h(paper.affiliation === 'Independent Researcher' ? t.independentResearcher : paper.affiliation)}</p>` : ''}
      <div class="paper-bottom"><div class="paper-topics">${paper.topics.map((topic) => `<span>${h(t.topics[topic])}</span>`).join('')}</div><details class="citation-details"><summary>${h(t.citation)} <span aria-hidden="true">+</span></summary><div class="citation-body"><p id="citation-${h(paper.id)}">${h(citation(paper))}</p><button class="text-button" type="button" data-copy="citation-${h(paper.id)}" hidden>${icon('copy')}${h(t.copyCitation)}</button></div></details></div>
    </article>
  </li>`;
}

function footer(profile, copy, t, notFound) {
  const visitors =
    profile.visitorStats?.enabled && !notFound
      ? `<section class="container visitor-stats" aria-label="${h(t.visitorLabel)}" data-visitors data-site-origin="${h(profile.url)}" data-local-label="${h(t.visitorLocal)}" data-loading-label="${h(t.visitorLoading)}" data-error-label="${h(t.visitorError)}"><dl class="visitor-values"><div><dt>${h(t.visitors)}</dt><dd data-visitor-count>—</dd></div><div><dt>${h(t.views)}</dt><dd data-view-count>—</dd></div></dl><p class="visitor-status" data-visitor-status role="status">${h(t.visitorNoScript)}</p><a class="visitor-provider" href="https://busuanzi.ibruce.info/" ${external}>Busuanzi ${icon('external')}</a></section>`
      : '';
  return `<footer class="site-footer">${visitors}<div class="container footer-inner"><a class="footer-brand" href="#top">${monogram()}<span>${h(profile.name)}<small>${h(copy.footerNote)}</small></span></a><p>© ${profile.copyrightStart}–${new Date().getUTCFullYear()} ${h(profile.name)}<span>${h(t.footer)}</span></p><a class="back-top" href="#top">${h(t.backTop)} ${icon('arrow')}</a></div></footer>`;
}

export function renderPage({
  profile,
  publications,
  locale = 'en',
  basePath = '',
  assets,
  notFound = false,
}) {
  const copy = profile.locales[locale];
  const t = ui[locale];
  const home = `${basePath}/${locale === 'zh' ? 'zh/' : ''}`;
  const canonical = `${profile.url}${home}`;
  const years = [...new Set(publications.map((paper) => paper.year))].sort((a, b) => b - a);
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
      alumniOf: {
        '@type': 'CollegeOrUniversity',
        name: 'Mahanakorn University of Technology',
        url: profile.universityUrl,
      },
      knowsAbout: copy.research.flatMap((item) => item.tags),
    },
  };
  const main = notFound
    ? `<main id="main" class="error-page container" tabindex="-1"><p class="eyebrow">404 / ${h(profile.name)}</p><h1>${h(t.notFound)}</h1><p>${h(t.notFoundText)}</p><a class="button button-dark" href="${home}">${h(t.returnHome)}${icon('arrow')}</a></main>`
    : `
  <main id="main" tabindex="-1">
    <section class="hero" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <div class="hero-copy"><p class="eyebrow hero-eyebrow"><span class="status-dot"></span>${h(copy.heroEyebrow)}</p><h1 id="hero-title">${h(profile.name)}<span class="name-period">.</span></h1><p class="hero-statement">${h(copy.heroStatement[0])}<br><em>${h(copy.heroStatement[1])}</em></p><p class="hero-intro">${h(copy.heroIntro)}</p><div class="hero-actions"><a class="button button-cream" href="#publications">${h(t.viewWork)}${icon('arrow')}</a><a class="hero-text-link" href="mailto:${h(profile.email)}">${h(t.getInTouch)}${icon('external')}</a></div></div>
        <div class="hero-art"><div class="art-heading"><span>${h(t.fieldTop)}</span><span aria-hidden="true">FIG. 01</span></div>${trustField()}<div class="art-caption"><span class="art-cross" aria-hidden="true">+</span><span>${h(t.fieldBottom)}</span><span class="art-cross" aria-hidden="true">+</span></div></div>
      </div>
      <div class="container hero-bottom"><p>${icon('pin')}${h(copy.location)}<span class="hero-divider" aria-hidden="true"></span>${h(copy.heroNote)}</p><a href="#about-me">${h(t.scroll)}${icon('down')}</a></div>
    </section>
    <div class="facts-strip"><div class="container facts-grid"><dl><dt>${h(t.stats[0])}</dt><dd>${String(publications.length).padStart(2, '0')}<span> / ${years.at(-1)}–${years[0]}</span></dd></dl><dl><dt>${h(t.stats[1])}</dt><dd>${String(copy.research.length).padStart(2, '0')}<span> / AI · ML · EO</span></dd></dl><dl><dt>${h(t.stats[2])}</dt><dd>2025<span class="fact-award">${icon('award')}</span></dd></dl><div class="facts-link"><a href="${h(profile.scholar)}" ${external}>${h(t.scholar)}${icon('external')}</a><a href="${h(profile.github)}" ${external}>GitHub${icon('external')}</a></div></div></div>
    <section class="section about-section container" id="about-me" aria-labelledby="about-title" data-section>
      <div class="section-heading"><p class="eyebrow">${h(t.about)}</p><h2 id="about-title">${multiline(copy.aboutTitle)}</h2></div>
      <div class="about-body"><p class="body-lead">${h(copy.aboutLead)}</p>${copy.aboutParagraphs.map((p) => `<p>${h(p)}</p>`).join('')}<div class="about-links"><a class="text-link" href="${h(profile.github)}" ${external}>GitHub ${icon('external')}</a><a class="text-link" href="${h(profile.scholar)}" ${external}>${h(t.scholar)} ${icon('external')}</a><button class="text-button print-button" type="button" data-print hidden>${icon('print')}${h(t.print)}</button></div><aside class="news-note" id="news"><span class="eyebrow">${h(t.news)}</span>${copy.news.map((news) => `<p><time datetime="${h(news.date)}">${h(dateLabel(news.date, locale))}</time>${h(news.text)}</p>`).join('')}</aside></div>
    </section>
    <section class="research-section" id="research-profile" aria-labelledby="research-title" data-section><div class="container section"><div class="section-heading section-heading-row"><div><p class="eyebrow">${h(t.research)}</p><h2 id="research-title">${multiline(copy.researchTitle)}</h2></div><p class="section-description">${h(copy.researchIntro)}</p></div><div class="research-grid">${copy.research.map((item, index) => `<article class="research-card"><div class="research-card-top">${icon(item.icon)}<span>0${index + 1}</span></div><h3>${h(item.title)}</h3><p>${h(item.description)}</p><ul class="research-tags">${item.tags.map((tag) => `<li>${h(tag)}</li>`).join('')}</ul></article>`).join('')}</div>
      <div class="selected-heading"><p class="eyebrow">${h(t.selected)}</p><a class="text-link" href="#publications">${h(t.allPapers)}${icon('arrow')}</a></div>
      <div class="selected-grid">${profile.featured
        .map((id, i) => {
          const paper = publications.find((item) => item.id === id);
          return `<a class="selected-paper" href="#paper-${h(id)}" data-featured="${h(id)}"><span class="selected-number">0${i + 1}</span><div><span class="selected-venue">${h(paper.venue)}</span><h3>${h(paper.title)}</h3></div>${icon('external')}</a>`;
        })
        .join('')}</div>
    </div></section>
    <section class="section publications-section container" id="publications" aria-labelledby="publications-title" data-section><div class="section-heading section-heading-row"><div><p class="eyebrow">${h(t.publications)}</p><h2 id="publications-title">${h(t.paperHeading)}</h2></div><div class="publication-heading-note"><p>${h(copy.publicationIntro)}</p><a class="text-link" href="${h(profile.scholar)}" ${external}>${h(t.scholar)}${icon('external')}</a></div></div>
      <div class="publication-tools" data-filter-tools hidden><div class="search-wrap">${icon('search')}<label class="sr-only" for="publication-search">${h(t.search)}</label><input id="publication-search" type="search" placeholder="${h(t.searchPlaceholder)}" autocomplete="off" maxlength="200" aria-controls="publication-list"><button class="search-clear" type="button" data-clear-search aria-label="${h(t.clearSearch)}" hidden>${icon('close')}</button></div><div class="year-filters" role="group" aria-label="${h(t.years)}"><button type="button" data-year-filter="all" aria-pressed="true">${h(t.allYears)}</button>${years.map((year) => `<button type="button" data-year-filter="${year}" aria-pressed="false">${year}</button>`).join('')}</div><label class="sr-only" for="publication-topic">${h(t.topic)}</label><select id="publication-topic" aria-controls="publication-list"><option value="all">${h(t.allTopics)}</option>${Object.entries(
        t.topics,
      )
        .map(([key, value]) => `<option value="${key}">${h(value)}</option>`)
        .join('')}</select></div>
      <div class="publication-count"><p data-result-count data-template="${h(t.showing)}" role="status" aria-live="polite" aria-atomic="true">${h(t.showing.replace('{count}', publications.length).replace('{total}', publications.length))}</p><span>${years[0]} — ${years.at(-1)}</span></div><noscript><p class="no-js-note">${h(t.jsNote)}</p></noscript>
      <div id="publication-list">${years
        .map(
          (year) =>
            `<section class="publication-year" data-year-group="${year}" aria-labelledby="year-${year}"><div class="year-heading"><h3 id="year-${year}">${year}</h3><span data-year-count>${publications.filter((paper) => paper.year === year).length}</span><span class="year-rule" aria-hidden="true"></span></div><ol class="publication-list">${publications
              .filter((paper) => paper.year === year)
              .map((paper) => paperRow(paper, publications.indexOf(paper), profile, t))
              .join('')}</ol></section>`,
        )
        .join('')}</div>
      <div class="empty-state" data-empty-state hidden>${icon('search')}<h3>${h(t.noResults)}</h3><p>${h(t.noResultsHint)}</p><button class="button button-dark" type="button" data-reset-filters>${h(t.reset)}${icon('arrow')}</button></div>
    </section>
    <section class="experience-section" id="experience" aria-labelledby="experience-title" data-section><div class="container section"><div class="section-heading"><p class="eyebrow">${h(t.experience)}</p><h2 id="experience-title">${multiline(copy.experienceTitle)}</h2></div><div class="experience-body"><article class="timeline-item" id="internships"><div class="timeline-marker">${icon('globe')}</div><p class="eyebrow">${h(t.internship)}</p><p class="timeline-date"><time datetime="${profile.internshipStart}">${h(dateLabel(profile.internshipStart, locale))}</time> — ${h(copy.present)}</p><h3>${h(copy.internshipRole)}</h3><p class="timeline-team">${h(copy.internshipTeam)}</p><a class="text-link" href="${h(profile.universityUrl)}" ${external}>${h(copy.university)}${icon('external')}</a></article><article class="timeline-item" id="education"><div class="timeline-marker">${icon('book')}</div><p class="eyebrow">${h(t.education)}</p><p class="timeline-date"><time datetime="${profile.education.start}">${h(dateLabel(profile.education.start, locale))}</time> — <time datetime="${profile.education.end}">${profile.education.end}</time><span class="graduated-label">${h(copy.graduate)}</span></p><h3>${h(copy.degree)}</h3><p class="timeline-team">${h(copy.college)} · ${h(copy.university)}</p><p class="gpa-line">${h(t.gpa)}<strong>${h(profile.education.gpa)}<span> / ${h(profile.education.gpaScale)}</span></strong></p></article></div></div></section>
    <section class="section recognition-section container" id="honors-and-awards" aria-labelledby="awards-title" data-section><div class="section-heading"><p class="eyebrow">${h(t.awards)}</p><h2 id="awards-title">${multiline(copy.awardsTitle)}</h2></div><div class="awards-list">${copy.awards.map((award) => `<article class="award-item"><span class="award-icon">${icon(award.kind === 'grant' ? 'globe' : 'award')}</span><div><h3>${h(award.title)}</h3><p>${h(award.detail)}</p></div>${award.date ? `<time datetime="${h(award.date)}">${h(dateLabel(award.date, locale))}</time>` : ''}</article>`).join('')}</div><div class="skills-section" id="skills"><div><p class="eyebrow">${h(copy.skillsTitle)}</p>${icon('code')}</div><dl class="skills-grid">${copy.skills.map((skill) => `<div><dt>${h(skill.title)}</dt><dd>${h(skill.text)}</dd></div>`).join('')}</dl></div></section>
    <section class="contact-section" id="contact" aria-labelledby="contact-title" data-section><div class="container contact-inner"><div><p class="eyebrow">${h(t.contactLabel)}</p><h2 id="contact-title">${multiline(copy.contactTitle)}</h2><p class="contact-intro">${h(copy.contactIntro)}</p></div><div class="contact-links"><a class="contact-email" href="mailto:${h(profile.email)}"><span id="contact-email">${h(profile.email)}</span>${icon('external')}</a><div class="contact-secondary"><button type="button" class="text-button" data-copy="contact-email" hidden>${icon('copy')}${h(t.copyEmail)}</button><a class="text-link" href="${h(profile.github)}" ${external}>GitHub${icon('external')}</a><a class="text-link" href="${h(profile.scholar)}" ${external}>${h(t.scholar)}${icon('external')}</a></div><p class="contact-location">${icon('pin')}${h(copy.location)}</p></div></div></section>
  </main>`;
  return `<!doctype html>
<html lang="${localeCode}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${notFound ? '404 · ' : ''}${h(profile.name)} · ${h(copy.role)}</title>
  <meta name="description" content="${h(copy.description)}">
  <meta name="theme-color" content="#17332e">
  <meta name="color-scheme" content="light">
  ${notFound ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${h(canonical)}">\n  <link rel="alternate" hreflang="en" href="${h(`${profile.url}${basePath}/`)}">\n  <link rel="alternate" hreflang="zh-CN" href="${h(`${profile.url}${basePath}/zh/`)}">\n  <link rel="alternate" hreflang="x-default" href="${h(`${profile.url}${basePath}/`)}">`}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${h(profile.name)}">
  <meta property="og:title" content="${h(profile.name)} · ${h(copy.role)}">
  <meta property="og:description" content="${h(copy.description)}">
  <meta property="og:locale" content="${locale === 'zh' ? 'zh_CN' : 'en_US'}">
  <meta property="og:url" content="${h(canonical)}">
  <meta property="og:image" content="${h(`${profile.url}${basePath}/assets/social-card.png`)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${h(`${profile.name} · ${profile.locales.en.heroStatement.join(' ')}`)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${basePath}/assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="${basePath}/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="${basePath}/assets/apple-touch-icon.png">
  <link rel="manifest" href="${basePath}/site.webmanifest">
  <link rel="stylesheet" href="${basePath}/assets/${assets.css}">
  ${notFound ? '' : `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`}
  <script type="module" src="${basePath}/assets/${assets.js}"></script>
</head>
<body id="top" data-locale="${locale}" data-copy-success="${h(t.copied)}" data-copy-failed="${h(t.copyFailed)}">
  <a class="skip-link" href="#main">${h(t.skip)}</a>
  ${header(profile, copy, t, locale, basePath, notFound)}
  ${main}
  ${footer(profile, copy, t, notFound)}
  <div class="toast" role="status" aria-live="polite" aria-atomic="true" data-toast></div>
  <dialog class="copy-dialog" data-copy-dialog aria-labelledby="copy-title"><div class="copy-dialog-heading"><h2 id="copy-title">${h(t.copyTitle)}</h2><button type="button" data-close-copy aria-label="${h(t.done)}">${icon('close')}</button></div><p>${h(t.copyFailed)}</p><label class="sr-only" for="copy-fallback-text">${h(t.copyTitle)}</label><textarea id="copy-fallback-text" readonly rows="6"></textarea><button class="button button-dark" type="button" data-close-copy>${h(t.done)}${icon('check')}</button></dialog>
</body>
</html>\n`;
}
