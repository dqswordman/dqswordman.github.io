import { escapeHtml as h } from './content.mjs';

const categories = {
  'ccf-a': ['CCF A venues', 'CCF A 类会议'], 'ccf-b': ['CCF B venues', 'CCF B 类会议'],
  'ccf-c': ['CCF C venues', 'CCF C 类会议'], conference: ['Other conferences', '其他会议'],
  preprint: ['Preprints', '预印本'], independent: ['Independent reports', '独立报告'],
};
const labels = {
  en: { search:'Search reports', example:'Title, topic, author or keyword', tier:'Venue category', venue:'Venue or archive',
    all:'All', reset:'Clear filters', result:'{n} of {total} reports', empty:'No reports match these filters.',
    source:'CCF venue directory', sourceNote:'Conference categories refer to the venue. Preprints appear separately.' },
  zh: { search:'搜索报告', example:'标题、研究主题、作者或关键词', tier:'会议分级', venue:'会议或平台',
    all:'全部', reset:'清除筛选', result:'显示 {total} 份报告中的 {n} 份', empty:'没有符合当前条件的报告。',
    source:'CCF 会议目录', sourceNote:'会议分级按举办会议归类，预印本单独列出。' },
};

export function reportCategory(paper) {
  if (paper.status === 'preprint') return 'preprint';
  if (paper.venueRank) return 'ccf-' + paper.venueRank.toLowerCase();
  return paper.venue ? 'conference' : 'independent';
}

export function reportSearchText(paper) {
  const body = paper.technicalReport;
  return [paper.title, ...(paper.authors ?? []), paper.venue, paper.year, paper.preprintId,
    ...(paper.topics ?? []), ...categories[reportCategory(paper)], ...(body.keywords ?? []),
    ...Object.values(body.locales).flatMap(copy => [copy.title, copy.summary]),
    ...(body.sections ?? []).flatMap(section => Object.values(section.title))].filter(Boolean).join(' ');
}

export function renderReportCatalog(entries, t, locale, card) {
  const l = labels[locale];
  const active = Object.keys(categories).filter(key => entries.some(paper => reportCategory(paper) === key));
  const label = key => categories[key][locale === 'zh' ? 1 : 0];
  if (!entries.length) return `<div class="container research-list"><p>${h(t.emptyResearch)}</p></div>`;
  const options = pairs => pairs.map(([value, text]) => `<option value="${h(value)}">${h(text)}</option>`).join('');
  const venues = [...new Set(entries.map(e => e.venue).filter(Boolean))].sort();
  const kinds = [...new Set(entries.map(e => e.documentType))].filter(Boolean);
  return `<div class="container catalog-shell">
    <form class="catalog-tools" data-catalog-tools hidden role="search" aria-label="${h(l.search)}">
      <label class="catalog-query">${h(l.search)}<input name="q" type="search" maxlength="180" placeholder="${h(l.example)}" aria-controls="report-list"></label>
      <label>${h(l.tier)}<select name="tier"><option value="">${h(l.all)}</option>${options(active.map(k => [k,label(k)]))}</select></label>
      <label>${h(l.venue)}<select name="venue"><option value="">${h(l.all)}</option>${options(venues.map(v => [v,v]))}</select></label>
      ${kinds.length > 1 ? `<label>${h(t.documentType)}<select name="type"><option value="">${h(l.all)}</option>${options(kinds.map(k=>[k,t.kindLabels[k][locale]]))}</select></label>` : ''}
      <label>${h(t.orderBy)}<select name="sort" data-report-order>${options([['published',t.firstPublished],['updated',t.lastUpdated]])}</select></label>
      <div class="catalog-feedback"><output role="status" aria-live="polite" data-catalog-count data-template="${h(l.result)}"></output><button class="text-button" type="reset">${h(l.reset)}</button></div>
    </form>
    <p class="catalog-source">${h(l.sourceNote)} <a href="https://www.ccf.org.cn/Academic_Evaluation/By_category/2026-03-31/870181.shtml" target="_blank" rel="noopener noreferrer">${h(l.source)} ↗</a></p>
    <div class="catalog-list" id="report-list" data-report-list>${active.map(key => {
      const group = entries.filter(paper => reportCategory(paper) === key);
      return `<section class="catalog-group" data-tier="${key}" aria-labelledby="group-${key}"><header><h2 id="group-${key}">${h(label(key))}</h2><span data-group-size>${group.length}</span></header><div data-group-entries>${group.map(card).join('')}</div></section>`;
    }).join('')}</div>
    <p class="catalog-empty" data-catalog-empty hidden>${h(l.empty)}</p>
  </div>`;
}
