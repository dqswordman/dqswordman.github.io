import { renderReportCatalog, reportCategory, reportSearchText } from './report-catalog.mjs';
import { directoryGroups, directoryHeader, directorySection } from './research-directory.mjs';
import { escapeHtml as h, projectPath, reportKinds, researchIndexPath, technicalReportPath, venueLabel } from './content.mjs';
import { icon } from './components.mjs';

const external = 'target="_blank" rel="noopener noreferrer"';

function spaceBadge(artifact, t) {
  return artifact?.space
    ? `<a class="platform-badge" href="${h(artifact.space)}" ${external}>${h(t.huggingFaceSpace)}${icon('external')}</a>`
    : '';
}

function reportFigure(figure, locale, basePath) {
  return `<img src="${h(`${basePath}/${figure.file}`)}" width="${figure.width}" height="${figure.height}"
    alt="${h(figure.alt[locale])}" loading="lazy" decoding="async">`;
}

export function reportPreview(report) {
  for (const section of report?.sections ?? []) {
    const figure = section.blocks?.find((block) => block.type === 'figure');
    if (figure) return { figure, sectionId: section.id };
  }
}

function resultChart(report, href, locale, t) {
  for (const section of report.sections ?? []) {
    const table = section.blocks?.find(block => block.type === 'table' && block.previewColumn !== undefined);
    if (!table) continue;
    const column = table.previewColumn;
    const ceiling = Math.max(...table.rows.map(row => Number(row[column]))) || 1;
    return `<figure class="spotlight-figure">
      <figcaption><span>${h(table.columns[column][locale])}</span><a href="${h(href)}#${h(section.id)}">${h(t.resultsPreview)}${icon('arrow')}</a></figcaption>
      <dl class="result-bars">${table.rows.map(row => {
        const label = row[0][locale] ?? row[0];
        const width = (Number(row[column]) / ceiling * 100).toFixed(2);
        const cost = table.previewCostColumn === undefined ? '' :
          `<span class="spotlight-cost">${h(row[table.previewCostColumn])} ${h(t.calls)}</span>`;
        return `<div><dt>${h(label)}${cost}</dt><dd><span class="result-track" aria-hidden="true"><i style="width:${width}%"></i></span><span>${h(row[column])}</span></dd></div>`;
      }).join('')}</dl>
      <p>${h(table.caption[locale])}${table.previewNote ? `<br>${h(table.previewNote[locale])}` : ''}</p>
    </figure>`;
  }
  return '';
}

export function paperSpotlight(paper, t, locale, basePath) {
  if (!paper) return '';
  const report = paper.technicalReport;
  const copy = report.locales[locale];
  const href = technicalReportPath(paper.reportId ?? paper.id, locale, basePath);
  return `<article class="paper-spotlight" aria-labelledby="spotlight-title">
    <div class="spotlight-meta"><span>${h(t.featuredPaper)}</span><span>${h(paper.venue ? venueLabel(paper) : t.researchProject)}</span></div>
    <h2 id="spotlight-title">${h(copy.title ?? paper.title)}</h2>
    ${resultChart(report, href, locale, t) || `<p class="spotlight-summary">${h(copy.summary)}</p>`}
    <div class="spotlight-actions"><a href="${h(href)}">${h(t.readReport)}${icon('arrow')}</a>${paper.codeUrl ? `<a href="${h(paper.codeUrl)}" ${external}>${h(t.sourceCode)}${icon('external')}</a>` : ''}</div>
  </article>`;
}

export function renderReportIndex(documents, featured, t, locale, basePath) {
  const reports = documents.filter(paper => paper.technicalReport);
  const groups = directoryGroups(reports, featured, t);
  const back = researchIndexPath('research', locale, basePath);
  return `<main id="main" class="research-index" tabindex="-1">
    ${directoryHeader(t.reports, t.reportsDescription, t.projectDirectory, back)}
    ${renderReportCatalog(groups, t, locale, (paper, anchor) => reportIndexCard(paper, t, locale, basePath, anchor))}
  </main>`;
}

function actionLink(label, url, outside = false) {
  return `<a class="text-link" href="${h(url)}"${outside ? ' ' + external : ''}>${h(label)}${icon(outside ? 'external' : 'arrow')}</a>`;
}

function reportIndexCard(paper, t, locale, basePath, anchor) {
  const report = paper.technicalReport;
  const copy = report.locales[locale];
  const href = technicalReportPath(paper.id, locale, basePath);
  const kind = paper.documentType ?? 'paper-companion';
  const tier = reportCategory(paper);
  const meta = [paper.venue && venueLabel(paper), paper.venueRank && 'CCF ' + paper.venueRank, reportKinds[kind][locale]].filter(Boolean);
  const { version, published, updated } = report.article;
  const preview = reportPreview(report);
  const manuscript = paper.manuscriptPdf ? pdfLink(paper, t, basePath) : paper.publicationUrl
    ? actionLink(paper.status === 'preprint' ? t.preprint : t.publishedPaper, paper.publicationUrl, true) : '';
  return `<article class="project-entry directory-entry" data-doc="${h(paper.id)}" data-report-tier="${h(tier)}"
    data-venue="${h(paper.venue ?? '')}" data-keywords="${h(reportSearchText(paper))}" data-kind="${h(kind)}"
    data-published="${h(published)}" data-updated="${h(updated)}"${anchor ? ` id="${h(anchor)}"` : ''}>
    <p class="research-kicker">${h(meta.join(' · '))}</p>
    <h3><a href="${h(href)}">${h(copy.title ?? paper.title)}</a></h3>
    <p>${h(copy.summary)}</p>
    <div class="directory-meta"><span>v${h(version)}</span><span>${h(t.firstPublished)} <time datetime="${h(published)}">${h(published)}</time></span>
      ${updated !== published ? `<span>${h(t.lastUpdated)} <time datetime="${h(updated)}">${h(updated)}</time></span>` : ''}</div>
    <div class="research-actions">
      ${paper.projectId ? actionLink(t.projectOverview, projectPath(paper.projectId, locale, basePath)) : ''}
      ${manuscript}
      ${preview ? actionLink(t.reportFigures, href + '#' + preview.sectionId) : ''}
    </div></article>`;
}

function repositoryResources(reports, t, locale, basePath) {
  return reports.map(doc => {
    const report = doc.technicalReport;
    const release = report.artifact;
    const links = [
      release?.url && actionLink(t.release + ' ' + release.version, release.url, true),
      release?.guide && actionLink(t.reproductionGuide, release.guide, true),
      release?.space && actionLink('Hugging Face', release.space, true),
    ].filter(Boolean).join('');
    const reportUrl = technicalReportPath(doc.id, locale, basePath);
    if (reports.length === 1)
      return `<div class="research-actions">${links}${actionLink(t.report, reportUrl)}</div>`;
    return `<div class="directory-resource"><a href="${h(reportUrl)}">${h(report.locales[locale].title ?? doc.title)}</a>
      ${links && `<div class="research-actions">${links}</div>`}</div>`;
  }).join('');
}

function codeIndexCard(project, t, locale, basePath) {
  const { publication, reports } = project;
  const artifact = reports.find(doc => doc.technicalReport.artifact)?.technicalReport.artifact;
  const summary = artifact?.description?.[locale] ?? project.summary?.[locale];
  const venue = publication?.venue ? venueLabel(publication) : project.collection === 'open-research' ? t.openReport : '';
  return `<article class="project-entry directory-entry" data-repository="${h(project.codeUrl)}">
    <p class="research-kicker">${h(['GitHub', venue].filter(Boolean).join(' · '))}</p>
    <h3><a href="${h(project.codeUrl)}" ${external}>${h(project.title[locale])}${icon('external', 'directory-external')}</a></h3>
    ${summary ? `<p>${h(summary)}</p>` : ''}
    ${repositoryResources(reports, t, locale, basePath)}
    ${!reports.length && publication?.publicationUrl ? `<div class="research-actions">${actionLink(publication.status === 'preprint' ? t.preprint : t.publishedPaper, publication.publicationUrl, true)}</div>` : ''}
  </article>`;
}

export function renderCodeIndex(projects, publications, featured, t, locale, basePath) {
  const entries = projects.filter(project => project.codeUrl);
  const known = new Set(entries.map(project => project.codeUrl));
  for (const paper of publications) {
    if (!paper.codeUrl || known.has(paper.codeUrl)) continue;
    known.add(paper.codeUrl);
    entries.push({ id: paper.id, title: { en: paper.title, zh: paper.title }, publication: paper, codeUrl: paper.codeUrl,
      reports: paper.technicalReport?.locales ? [{ ...paper, id: paper.reportId ?? paper.id }] : [] });
  }
  const sections = directoryGroups(entries, featured, t).map(group =>
    directorySection(group, group.entries.map(project => codeIndexCard(project, t, locale, basePath)).join('')));
  return `<main id="main" class="research-index" tabindex="-1">
    ${directoryHeader(t.openSource, t.codeDescription, t.projectDirectory, researchIndexPath('research', locale, basePath))}
    <div class="container projects-list">${sections.join('') || `<p>${h(t.emptyResearch)}</p>`}</div></main>`;
}

function projectVenue(project, t) {
  const paper = project.publication;
  if (!paper) return project.collection === 'open-research' ? t.openReport : t.researchProject;
  const status = paper.status === 'accepted' ? t.acceptedStatus : paper.status === 'published' ? t.publishedStatus : paper.status === 'preprint' ? t.preprint : '';
  return [venueLabel(paper), status].filter(Boolean).join(' · ');
}

export function selectedResearch(projects, featured, t, locale, basePath) {
  const selected = featured.map(id => projects.find(project => project.id === id)).filter(Boolean);
  if (!selected.length) return '';
  return `<section class="container home-selected" id="selected-research" aria-labelledby="selected-title">
    <div class="selected-heading"><h2 id="selected-title">${h(t.selectedResearch)}</h2><a class="text-link" href="${h(researchIndexPath('research', locale, basePath))}">${h(t.projectDirectory)} ${icon('arrow')}</a></div>
    <div class="selected-grid">${selected.map(project => `<a class="selected-paper" href="${h(projectPath(project.id, locale, basePath))}"><div><span class="selected-venue">${h(projectVenue(project, t))}</span><span class="selected-title">${h(project.title[locale])}</span></div>${icon('arrow')}</a>`).join('')}</div>
  </section>`;
}


function pdfLink(item, t, basePath) {
  return item.manuscriptPdf ? `<a class="text-link" href="${h(basePath + '/' + item.manuscriptPdf)}">${h(t.paperPdf)}${icon('arrow')}</a>` : '';
}

export function openReports(projects, t, locale, basePath, view) {
  const entries = projects.filter(p => p.collection === 'open-research');
  if (!entries.length) return '';
  const link = researchIndexPath('open-research', locale, basePath);
  const heading = `<div class="open-heading"><h2>${h(t.openReports)}</h2><a class="text-link" href="${h(link)}">${h(t.browseReports)} ${icon('arrow')}</a></div>`;
  const cards = entries.map(p => {
    const doc = p.reports[0], body = doc.technicalReport;
    const reportUrl = technicalReportPath(doc.id, locale, basePath);
    const projectUrl = projectPath(p.id, locale, basePath);
    const headingTag = view === 'page' ? 'h2' : 'h3';
    const title = view === 'directory' ? p.title[locale] : body.locales[locale].title;
    return `<article class="open-report-card"><${headingTag}><a href="${h(projectUrl)}">${h(title)}</a></${headingTag}>
      <p>${h(p.summary[locale])}</p><div class="research-actions"><a class="text-link" href="${h(reportUrl)}">${h(t.readReport)}${icon('arrow')}</a>
      ${pdfLink(p,t,basePath)}${view === 'page' ? `<a class="text-link" href="${h(p.codeUrl)}" ${external}>GitHub</a>${spaceBadge(body.artifact,t)}` : ''}</div></article>`;
  }).join('');
  if (view === 'page') return `<main id="main" class="research-index" tabindex="-1"><header class="research-banner"><div class="container research-banner-inner">
    <a class="text-link research-back" href="${h(researchIndexPath('research',locale,basePath))}">${icon('arrow')}${h(t.projectDirectory)}</a>
    <h1>${h(t.openReports)}</h1><p class="research-deck">${h(t.openIntro)}</p>
    <div class="research-actions"><a class="text-link" href="${h(researchIndexPath('technical-reports',locale,basePath) + '?tier=open-research')}">${h(locale === 'zh' ? '检索本栏报告' : 'Search these reports')} ${icon('arrow')}</a>
      <a class="text-link" href="https://huggingface.co/collections/DQSWORDMAN/open-research-reports-6b019707aeffeec0b0f43136" ${external}>${h(locale === 'zh' ? 'Hugging Face 合集' : 'Hugging Face collection')} ${icon('external')}</a></div></div></header>
    <div class="container open-report-grid open-collection-cards">${cards}</div></main>`;
  return `<section class="${view==='home'?'container ':''}open-reports" id="open-research">${heading}
    <p class="open-intro">${h(t.openIntro)}</p><div class="open-report-grid">${cards}</div></section>`;
}

export function renderProjects(projects, featured, t, locale, home, basePath) {
  const groups = directoryGroups(projects, featured, t);
  const cards = list => list.map(project => `<article class="project-entry">
    <p class="research-kicker">${h(projectVenue(project, t))}</p>
    <h3><a href="${h(projectPath(project.id, locale, basePath))}">${h(project.title[locale])}</a></h3>
    <p>${h(project.summary[locale])}</p>
    <div class="research-actions"><a class="text-link" href="${h(projectPath(project.id, locale, basePath))}">${h(t.projectOverview)}${icon('arrow')}</a>
    ${project.reports.map(doc => `<a class="text-link" href="${h(technicalReportPath(doc.id, locale, basePath))}">${h(reportKinds[doc.documentType][locale])}${icon('arrow')}</a>`).join('')}
    ${project.codeUrl ? `<a class="text-link" href="${h(project.codeUrl)}" ${external}>GitHub${icon('external')}</a>` : ''}</div>
  </article>`).join('');
  return `<main id="main" class="research-index" tabindex="-1">
    ${directoryHeader(t.projectDirectory, t.projectsDescription, t.returnHome, home)}
    <div class="container projects-list">${groups.map(group => group.key === 'open-research'
      ? openReports(group.entries, t, locale, basePath, 'directory')
      : directorySection(group, cards(group.entries))).join('')}</div></main>`;
}

export function renderProject(project, t, locale, home, basePath) {
  const paper = project.publication;
  const evidence = project.reports.find(doc => doc.technicalReport.metrics?.length);
  const resultSection = evidence?.technicalReport.sections?.find(section => section.id === 'results');
  const evidenceUrl = evidence && technicalReportPath(evidence.id, locale, basePath) + (resultSection ? '#results' : '');
  const resources = project.reports.map(doc => {
    const report = doc.technicalReport;
    return `<article class="project-resource"><p class="research-kicker">${h(reportKinds[doc.documentType][locale])} · v${h(report.article.version)}</p>
      <h3><a href="${h(technicalReportPath(doc.id, locale, basePath))}">${h(report.locales[locale].title ?? project.title[locale])}${icon('arrow')}</a></h3>
      <p>${h(report.locales[locale].summary)}</p>
      ${report.artifact ? `<div class="research-actions">
        <a class="text-link" href="${h(report.artifact.url)}" ${external}>${h(t.release)} ${h(report.artifact.version)}${icon('external')}</a>
        ${report.artifact.guide ? `<a class="text-link" href="${h(report.artifact.guide)}" ${external}>${h(t.reproductionGuide)}${icon('external')}</a>` : ''}
        ${spaceBadge(report.artifact, t)}</div>` : ''}</article>`;
  }).join('');
  return `<main id="main" class="research-index" tabindex="-1"><header class="research-banner"><div class="container research-banner-inner">
    <a class="text-link research-back" href="${h(researchIndexPath('research', locale, basePath))}">${icon('arrow')}${h(t.projectDirectory)}</a>
    <p class="research-kicker">${h(projectVenue(project, t))}</p><h1>${h(project.title[locale])}</h1>
    <p class="research-deck">${h(project.summary[locale])}</p><p class="project-byline">${h(project.authors.join(', '))}</p>
    <div class="research-actions">${project.reports.map(doc => `<a class="button button-dark" href="${h(technicalReportPath(doc.id, locale, basePath))}">${h(t.readReport)}${icon('arrow')}</a>`).join('')}
    ${project.codeUrl ? `<a class="text-link" href="${h(project.codeUrl)}" ${external}>GitHub${icon('external')}</a>` : ''}
    ${pdfLink(project,t,basePath)}
    ${paper ? `<a class="text-link" href="${h(paper.publicationUrl ?? home + '#paper-' + paper.id)}" ${paper.publicationUrl ? external : ''}>${h(paper.publicationUrl ? (paper.status === 'preprint' ? t.preprint : t.publishedPaper) : t.publicationEntry)}${icon(paper.publicationUrl ? 'external' : 'arrow')}</a>` : ''}</div></div></header>
    <div class="container project-body">
      ${evidence ? `<section><h2>${h(t.keyResults)}</h2><dl class="project-metrics">${evidence.technicalReport.metrics.map(m =>
        `<div><dt>${h(m.label[locale])}</dt><dd>${h(m.value)}</dd></div>`).join('')}</dl><a class="text-link" href="${h(evidenceUrl)}">${h(t.resultsPreview)}${icon('arrow')}</a></section>` : ''}
      ${project.scope ? `<section><h2>${h(t.interpretation)}</h2><p>${h(project.scope[locale])}</p></section>` : ''}
      ${resources ? `<section><h2>${h(t.reports)}</h2>${resources}</section>` : ''}
      ${paper ? `<section><h2>${h(t.publicationEntry)}</h2><p><cite lang="en">${h(paper.title)}</cite></p><a class="text-link" href="${h(home + '#paper-' + paper.id)}">${h(t.citation)}${icon('arrow')}</a></section>` : ''}
    </div></main>`;
}

function renderBlock(block, t, locale, basePath, id) {
  switch (block.type) {
    case 'figure': {
      const image = `${basePath}/${block.file}`;
      return `<figure class="report-figure">
        <div class="report-figure-image">${reportFigure(block, locale, basePath)}</div>
        <figcaption>
          <p>${h(block.caption[locale])}</p>
          <div class="figure-links">
            <a href="${h(image)}" ${external}>${h(t.viewFigure)}${icon('external')}</a>
            ${block.source ? `<a href="${h(block.source)}" ${external}>${h(t.figureSource)}${icon('external')}</a>` : ''}
          </div>
        </figcaption>
      </figure>`;
    }
    case 'table': {
      const caption = block.caption[locale];
      const cellText = (value) => h(typeof value === 'object' ? value[locale] : value);
      return `<div class="report-table-scroll" role="region" aria-label="${h(caption)}" tabindex="0">
        <table>
          <caption>${h(caption)}</caption>
          <thead><tr>${block.columns.map((column) => `<th scope="col">${h(column[locale])}</th>`).join('')}</tr></thead>
          <tbody>${block.rows.map(([first, ...cells]) => `<tr><th scope="row">${cellText(first)}</th>${cells.map((cell) => `<td>${cellText(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>${block.source ? `<div class="report-table-source">
        <a class="text-link" href="${h(block.source)}" ${external}>${h(t.figureSource)}${icon('external')}</a>
      </div>` : ''}`;
    }
    case 'steps':
      return `<ol class="report-steps" role="list">${block.steps.map((step, i) => `<li>
        <span class="report-step-number" aria-hidden="true">${i + 1}</span>
        <h3>${h(step.title[locale])}</h3><p>${h(step.text[locale])}</p>
        ${step.formula ? `<code>${h(step.formula)}</code>` : ''}
      </li>`).join('')}</ol>`;
    case 'code':
      return `<div class="report-code"><button class="text-button" type="button" data-copy="${h(id)}" hidden>${icon('copy')}${h(t.copyCommand)}</button><pre><code id="${h(id)}">${h(block.code)}</code></pre></div>`;
    case 'links':
      return `<ul class="report-link-list" role="list">${block.items.map(({ label, url }) =>
        `<li><a class="text-link" href="${h(url)}" ${external}>${h(label[locale])}${icon('external')}</a></li>`).join('')}</ul>`;
  }
}

function renderSection({ id, title, paragraphs, blocks = [] }, t, locale, basePath) {
  const after = new Map();
  blocks.forEach((block, i) => {
    const position = block.afterParagraph ?? paragraphs.length;
    const html = renderBlock(block, t, locale, basePath, `command-${id}-${i}`);
    after.set(position, (after.get(position) ?? '') + html);
  });
  return `<section id="${h(id)}" aria-labelledby="heading-${h(id)}">
    <h2 id="heading-${h(id)}">${h(title)}</h2>
    ${paragraphs.map((paragraph, i) => `<p>${h(paragraph)}</p>${after.get(i + 1) ?? ''}`).join('')}
  </section>`;
}

export function renderReport(paper, t, locale, home, basePath) {
  const { metrics, sources, locales, artifact, article } = paper.technicalReport;
  const { title, summary } = locales[locale];
  const sections = paper.technicalReport.sections?.map((section) => ({
    ...section, title: section.title[locale], paragraphs: section.paragraphs[locale],
  })) ?? locales[locale].sections.map((section, index) => ({ ...section, id: `section-${index + 1}` }));
  const contents = sources?.length ? [...sections, { id: 'sources', title: t.reportSources }] : sections;
  const index = researchIndexPath('technical-reports', locale, basePath);
  const publication = paper.venue ? `${home}#paper-${paper.publicationId ?? paper.id}` : null;
  const manuscript = paper.manuscriptPdf ? basePath + '/' + paper.manuscriptPdf : null;
  const kind = reportKinds[paper.documentType ?? 'paper-companion'][locale];
  return `<main id="main" class="report-page" tabindex="-1">
    <article aria-labelledby="report-title">
      <header class="research-banner report-banner">
        <div class="container research-banner-inner">
          <a class="text-link research-back" href="${h(index)}">${icon('arrow')}${h(t.reports)}</a>
          <p class="research-kicker">${h(paper.venue ? venueLabel(paper) : kind)}${paper.acceptedDate ? ` <span>·</span> <time datetime="${h(paper.acceptedDate)}">${h(t.acceptedOn)} ${h(paper.acceptedDate)}</time>` : ''}</p>
          <h1 id="report-title">${h(title ?? paper.title)}</h1>
          <p class="research-deck">${h(summary)}</p>
          <div class="report-identity">
            <p class="report-byline">${h(paper.authors.join(', '))}</p>
            ${article ? `<ul class="report-dates" role="list">
              <li>${h(kind)} ${h(article.version)}</li>
              <li>${h(t.firstPublished)} <time datetime="${h(article.published)}">${h(article.published)}</time></li>
              <li>${h(t.lastUpdated)} <time datetime="${h(article.updated)}">${h(article.updated)}</time></li>
            </ul>` : ''}
          </div>
          ${article && (publication || manuscript) ? `<p class="report-paper">
            <a href="${h(publication || manuscript)}"><cite lang="en">${h(paper.title)}</cite> ${icon('arrow')}</a>
            ${article.manuscriptDate ? `<span>${h(t.authorFinal)} <time datetime="${h(article.manuscriptDate)}">${h(article.manuscriptDate)}</time></span>` : ''}
          </p>` : ''}
          <div class="research-actions">
            ${pdfLink(paper,t,basePath)}
            ${paper.publicationUrl ? `<a class="text-link" href="${h(paper.publicationUrl)}" ${external}>${h(paper.status === 'preprint' ? t.preprint : t.publishedPaper)} ${icon('external')}</a>` : ''}
            ${paper.codeUrl ? `<a class="button button-dark" href="${h(paper.codeUrl)}" ${external}>${icon('code')}GitHub ${icon('external')}</a>` : ''}
            ${spaceBadge(artifact, t)}
            ${artifact ? `<a class="text-link" href="${h(artifact.url)}" ${external}>${h(t.release)} ${h(artifact.version)}${icon('external')}</a>` : ''}
            ${artifact?.guide ? `<a class="text-link" href="${h(artifact.guide)}" ${external}>${h(t.reproductionGuide)} ${icon('external')}</a>` : ''}
            ${paper.projectId ? `<a class="text-link" href="${h(projectPath(paper.projectId, locale, basePath))}">${h(t.projectOverview)} ${icon('arrow')}</a>` : ''}
          </div>
        </div>
      </header>
      ${metrics?.length ? `<dl class="container report-metrics">${metrics.map(({ value, label }) => `<div><dt>${h(label[locale])}</dt><dd>${h(value)}</dd></div>`).join('')}</dl>` : ''}
      <div class="container report-layout">
        <nav class="report-contents" aria-label="${h(t.reportContents)}" data-report-contents>
          <p>${h(t.reportContents)}</p>
          <ol role="list">${contents.map(({ id, title }) => `<li><a href="#${h(id)}">${h(title)}</a></li>`).join('')}</ol>
        </nav>
        <div class="report-body">
          ${sections.map((section) => renderSection(section, t, locale, basePath)).join('')}
          ${sources?.length ? `<section class="report-sources" id="sources" aria-labelledby="heading-sources">
            <h2 id="heading-sources">${h(t.reportSources)}</h2>
            ${renderBlock({ type: 'links', items: sources }, t, locale, basePath)}
            ${paper.anonymousManuscript ? `<p>${h(locale === 'zh' ? '本报告署名与公开引用一致。PDF 保留了原稿的匿名排版。' : 'This report uses the public author attribution. The PDF preserves the anonymous manuscript title page.')}</p>` : ''}
            ${paper.citationUrl ? `<a class="text-link" href="${h(paper.citationUrl)}" ${external}>BibTeX ${icon('external')}</a>` : ''}
            ${article?.updateNote ? `<p class="report-update"><strong>${h(t.updateNote)} ${h(article.version)}</strong> · ${h(article.updateNote[locale])}</p>` : ''}
          </section>` : ''}
        </div>
      </div>
    </article>
  </main>`;
}
