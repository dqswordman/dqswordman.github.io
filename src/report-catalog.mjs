import { escapeHtml as h, reportKinds, venueLabel } from './content.mjs';
import { icon } from './components.mjs';
import { directorySection } from './research-directory.mjs';

const categories = {
  'ccf-a': ['CCF A venues', 'CCF A 类会议'], 'ccf-b': ['CCF B venues', 'CCF B 类会议'],
  'ccf-c': ['CCF C venues', 'CCF C 类会议'], conference: ['Other conferences', '其他会议'],
  preprint: ['Preprints', '预印本'], 'open-research': ['Open research reports', '开放研究报告'], independent: ['Independent reports', '独立报告'],
};
const labels = {
  en: { search: 'Search reports', example: 'Title, topic, author or keyword', tier: 'Venue classification', venue: 'Venue or platform',
    all: 'All', reset: 'Reset', total: '{n} reports', result: '{n} of {total} reports', empty: 'No reports match these filters.',
    group: 'Group reports', byProject: 'By research collection', byTier: 'By venue classification', refine: 'Filters and sorting',
    order: 'Directory order', source: 'CCF venue directory', sourceNote: 'CCF classifications apply to conference venues.' },
  zh: { search: '搜索报告', example: '搜索标题、主题、作者或关键词', tier: '会议分级', venue: '会议或平台',
    all: '全部', reset: '重置', total: '{n} 份报告', result: '显示 {n} / {total} 份报告', empty: '没有符合当前条件的报告。',
    group: '报告分组', byProject: '按研究栏目', byTier: '按会议分级', refine: '筛选与排序',
    order: '目录顺序', source: 'CCF 会议目录', sourceNote: 'CCF 分级依据论文所属会议。' },
};

export function reportCategory(paper) {
  if (paper.collection === 'open-research') return 'open-research';
  if (paper.status === 'preprint') return 'preprint';
  if (paper.venueRank) return 'ccf-' + paper.venueRank.toLowerCase();
  return paper.venue ? 'conference' : 'independent';
}

export function reportSearchText(paper) {
  const body = paper.technicalReport;
  return [paper.title, ...Object.values(paper.projectTitle ?? {}), ...(paper.authors ?? []), paper.venue && venueLabel(paper),
    paper.year, paper.preprintId, ...(paper.topics ?? []), ...categories[reportCategory(paper)], ...(body.keywords ?? []),
    ...Object.values(body.locales).flatMap(copy => [copy.title, copy.summary]),
    ...(body.sections ?? []).flatMap(section => Object.values(section.title))].filter(Boolean).join(' ');
}

export function renderReportCatalog(groups, t, locale, card) {
  const l = labels[locale];
  const entries = groups.flatMap(group => group.entries);
  if (!entries.length) return `<div class="container projects-list"><p>${h(t.emptyResearch)}</p></div>`;
  const active = Object.keys(categories).filter(key => entries.some(paper => reportCategory(paper) === key));
  const label = key => categories[key][locale === 'zh' ? 1 : 0];
  const options = pairs => pairs.map(([value, text]) => `<option value="${h(value)}">${h(text)}</option>`).join('');
  const venues = [...new Set(entries.map(e => e.venue).filter(Boolean))].sort();
  const kinds = [...new Set(entries.map(e => e.documentType ?? 'paper-companion'))];
  const anchors = new Set();
  const sections = groups.map(group => directorySection(group, group.entries.map(doc => {
    const tier = reportCategory(doc);
    const anchor = anchors.has(tier) ? '' : 'group-' + tier;
    anchors.add(tier);
    return card(doc, anchor);
  }).join('')));
  const tierSections = active.map(key => directorySection({ key, label: label(key) }, '', 'tier'));
  return `<div class="container projects-list report-directory">
    <form class="catalog-tools" data-catalog-tools hidden role="search" aria-label="${h(l.search)}">
      <div class="catalog-toolbar">
        <label class="catalog-search"><span class="sr-only">${h(l.search)}</span>${icon('search')}
          <input name="q" type="search" maxlength="180" placeholder="${h(l.example)}" aria-controls="report-list"></label>
        <label class="catalog-grouping"><span class="sr-only">${h(l.group)}</span><select name="group" aria-controls="report-list">${options([['collection',l.byProject],['tier',l.byTier]])}</select></label>
        <button type="button" class="catalog-disclosure" data-filter-toggle aria-expanded="false" aria-controls="report-filters">${h(l.refine)}<span data-filter-count></span>${icon('down')}</button>
      </div>
      <fieldset id="report-filters" class="catalog-options" hidden><legend class="sr-only">${h(l.refine)}</legend>
        <label>${h(l.tier)}<select name="tier"><option value="">${h(l.all)}</option>${options(active.map(k => [k,label(k)]))}</select></label>
        <label>${h(l.venue)}<select name="venue"><option value="">${h(l.all)}</option>${options(venues.map(v => [v,v]))}</select></label>
        ${kinds.length > 1 ? `<label>${h(t.documentType)}<select name="type"><option value="">${h(l.all)}</option>${options(kinds.map(k => [k,reportKinds[k][locale]]))}</select></label>` : ''}
        <label>${h(t.orderBy)}<select name="sort" data-report-order>${options([['directory',l.order],['published',t.firstPublished],['updated',t.lastUpdated]])}</select></label>
        <p class="catalog-source">${h(l.sourceNote)} <a href="https://www.ccf.org.cn/Academic_Evaluation/By_category/2026-03-31/870181.shtml" target="_blank" rel="noopener noreferrer">${h(l.source)} ${icon('external')}</a></p>
      </fieldset>
      <div class="catalog-feedback"><output role="status" aria-live="polite" data-catalog-count data-total="${h(l.total)}" data-template="${h(l.result)}"></output><button class="text-button" type="reset" hidden>${h(l.reset)}</button></div>
    </form>
    <div id="report-list" data-report-list>${sections.join('')}${tierSections.join('')}</div>
    <p class="catalog-empty" data-catalog-empty hidden>${h(l.empty)}</p>
  </div>`;
}
