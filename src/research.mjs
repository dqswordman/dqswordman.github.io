import { renderReportCatalog, reportSearchText } from './report-catalog.mjs';
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

export function renderResearchIndex(index, papers, t, locale, home, basePath) {
  const reports = index === 'technical-reports';
  const title = reports ? t.reports : t.openSource;
  const description = reports ? t.reportsDescription : t.codeDescription;
  const entries = papers.filter((paper) => reports ? paper.technicalReport : paper.codeUrl);
  if (reports) entries.sort((a, b) => b.technicalReport.article.published.localeCompare(a.technicalReport.article.published) || a.id.localeCompare(b.id));
  return `<main id="main" class="research-index" tabindex="-1">
    <header class="research-banner">
      <div class="container research-banner-inner">
        <a class="text-link research-back" href="${home}">${icon('arrow')}${h(t.returnHome)}</a>
        <h1>${h(title)}</h1>
        <p class="research-deck">${h(description)}</p>
      </div>
    </header>
    ${reports ? renderReportCatalog(entries, { ...t, kindLabels: reportKinds }, locale,
      paper => reportIndexCard(paper, t, locale, basePath)) : `<div class="container research-list">
      ${entries.length ? entries.map(paper => codeIndexCard(paper, t, locale, basePath)).join('') : `<p>${h(t.emptyResearch)}</p>`}</div>`}
  </main>`;
}

function reportIndexCard(paper, t, locale, basePath) {
  const report = paper.technicalReport;
  const href = technicalReportPath(paper.id, locale, basePath);
  const copy = report.locales[locale];
  const preview = reportPreview(report);
  const kind = reportKinds[paper.documentType ?? 'paper-companion'][locale];
  const { version, published, updated } = report.article;
  return `<article class="research-entry${preview ? ' research-entry-preview' : ''}" data-doc="${h(paper.id)}" data-venue="${h(paper.venue ?? '')}" data-keywords="${h(reportSearchText(paper))}" data-kind="${h(paper.documentType ?? 'paper-companion')}" data-published="${h(published)}" data-updated="${h(updated)}">
    <div>
      <p class="research-kicker">${h(kind)}${paper.venue ? ` · ${h(venueLabel(paper))}` : ''}</p>
      <h3><a href="${h(href)}">${h(copy.title ?? paper.title)}</a></h3>
      ${copy.title && paper.venue ? `<p class="research-entry-paper"><cite lang="en">${h(paper.title)}</cite></p>` : ''}
      <p class="catalog-dates"><span>v${h(version)}</span><span>${h(updated === published ? t.sameReportDate : t.firstPublished)} <time datetime="${h(published)}">${h(published)}</time></span>${updated !== published ? `<span>${h(t.lastUpdated)} <time datetime="${h(updated)}">${h(updated)}</time></span>` : ''}</p>
      <p class="research-entry-copy">${h(copy.summary)}</p>
      <div class="research-actions">
        <a class="button button-dark" href="${h(href)}">${h(t.readReport)}${icon('arrow')}</a>
        ${pdfLink(paper,t,basePath)}
        ${paper.codeUrl ? `<a class="text-link" href="${h(paper.codeUrl)}" ${external}>GitHub${icon('external')}</a>` : ''}
        ${spaceBadge(report.artifact, t)}
      </div>
    </div>
    ${preview ? `<a class="research-entry-figure" href="${h(href)}#${h(preview.sectionId)}" aria-label="${h(t.resultsPreview)}">${reportFigure(preview.figure, locale, basePath)}</a>` : ''}
  </article>`;
}

function codeIndexCard(paper, t, locale, basePath) {
  const report = paper.technicalReport;
  const artifact = report?.artifact;
  const repo = new URL(paper.codeUrl).pathname.replace(/^\/|\/$/g, '');
  return `<article class="research-entry research-entry-repo">
    <div>
      <p class="research-kicker">${h(paper.venue ? venueLabel(paper) : t.openSource)}</p>
      <h2><a href="${h(paper.codeUrl)}" ${external}>${h(paper.title)}</a></h2>
      ${artifact || report ? `<p class="research-entry-copy">${h(artifact?.description[locale] ?? report.locales[locale].summary)}</p>` : ''}
      ${report ? `<a class="text-link" href="${h(technicalReportPath(paper.id, locale, basePath))}">${h(t.report)}${icon('arrow')}</a>` : ''}
    </div>
    <div class="repository-access">
      <p class="repository-name">${icon('code')}<span>${h(repo)}</span></p>
      <div class="repository-platforms">
        <a class="platform-badge" href="${h(paper.codeUrl)}" ${external}>${h(t.githubRepository)}${icon('external')}</a>
        ${spaceBadge(artifact, t)}
      </div>
      ${artifact ? `<div class="repository-links">
        ${artifact.guide ? `<a class="text-link" href="${h(artifact.guide)}" ${external}>${h(t.reproductionGuide)}${icon('external')}</a>` : ''}
        <a class="text-link" href="${h(artifact.url)}" ${external}>${h(t.release)} ${h(artifact.version)}${icon('external')}</a>
      </div>` : ''}
    </div>
  </article>`;
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
    return `<article class="open-report-card"><${headingTag}><a href="${h(projectUrl)}">${h(body.locales[locale].title)}</a></${headingTag}>
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
  const selected = featured.map(id => projects.find(project => project.id === id)).filter(Boolean);
  const rest = projects.filter(p => !featured.includes(p.id) && p.collection !== 'open-research');
  const cards = list => list.map(project => `<article class="project-entry">
    <p class="research-kicker">${h(projectVenue(project, t))}</p>
    <h2><a href="${h(projectPath(project.id, locale, basePath))}">${h(project.title[locale])}</a></h2>
    <p>${h(project.summary[locale])}</p>
    <div class="research-actions"><a class="text-link" href="${h(projectPath(project.id, locale, basePath))}">${h(t.projectOverview)}${icon('arrow')}</a>
    ${project.reports.map(doc => `<a class="text-link" href="${h(technicalReportPath(doc.id, locale, basePath))}">${h(reportKinds[doc.documentType][locale])}${icon('arrow')}</a>`).join('')}
    ${project.codeUrl ? `<a class="text-link" href="${h(project.codeUrl)}" ${external}>GitHub${icon('external')}</a>` : ''}</div>
  </article>`).join('');
  return `<main id="main" class="research-index" tabindex="-1"><header class="research-banner"><div class="container research-banner-inner">
    <a class="text-link research-back" href="${home}">${icon('arrow')}${h(t.returnHome)}</a>
    <h1>${h(t.projectDirectory)}</h1><p class="research-deck">${h(t.projectsDescription)}</p>
    </div></header><div class="container projects-list">
    ${selected.length ? `<section id="selected" aria-label="${h(t.selectedResearch)}">${rest.length ? `<h2 class="project-group-title">${h(t.selectedResearch)}</h2>` : ''}<div class="project-grid">${cards(selected)}</div></section>` : ''}
    ${openReports(projects,t,locale,basePath,'directory')}
    ${rest.length ? `<section aria-label="${h(t.moreProjects)}"><h2 class="project-group-title">${h(t.moreProjects)}</h2><div class="project-grid">${cards(rest)}</div></section>` : ''}
    </div></main>`;
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
