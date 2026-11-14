import { escapeHtml as h, researchIndexPath, technicalReportPath, venueLabel } from './content.mjs';
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

export function renderResearchIndex(index, papers, t, locale, home, basePath) {
  const reports = index === 'technical-reports';
  const title = reports ? t.reports : t.openSource;
  const description = reports ? t.reportsDescription : t.codeDescription;
  const entries = papers.filter((paper) => reports ? paper.technicalReport : paper.codeUrl);
  return `<main id="main" class="research-index" tabindex="-1">
    <header class="research-banner">
      <div class="container research-banner-inner">
        <a class="text-link research-back" href="${home}">${icon('arrow')}${h(t.returnHome)}</a>
        <h1>${h(title)}</h1>
        <p class="research-deck">${h(description)}</p>
      </div>
    </header>
    <div class="container research-list">
      ${entries.length ? entries.map((paper) => reports
        ? reportIndexCard(paper, t, locale, basePath)
        : codeIndexCard(paper, t, locale, basePath)).join('') : `<p>${h(t.emptyResearch)}</p>`}
    </div>
  </main>`;
}

function reportIndexCard(paper, t, locale, basePath) {
  const report = paper.technicalReport;
  const href = technicalReportPath(paper.id, locale, basePath);
  const copy = report.locales[locale];
  const preview = reportPreview(report);
  return `<article class="research-entry${preview ? ' research-entry-preview' : ''}">
    <div>
      <p class="research-kicker">${h(venueLabel(paper))}</p>
      <h2><a href="${h(href)}">${h(copy.title ?? paper.title)}</a></h2>
      ${copy.title ? `<p class="research-entry-paper"><cite lang="en">${h(paper.title)}</cite></p>` : ''}
      <p class="research-entry-copy">${h(copy.summary)}</p>
      <div class="research-actions">
        <a class="button button-dark" href="${h(href)}">${h(t.readReport)}${icon('arrow')}</a>
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
      <p class="research-kicker">${h(venueLabel(paper))}</p>
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
  const publication = `${home}#paper-${paper.id}`;
  return `<main id="main" class="report-page" tabindex="-1">
    <article aria-labelledby="report-title">
      <header class="research-banner report-banner">
        <div class="container research-banner-inner">
          <a class="text-link research-back" href="${h(index)}">${icon('arrow')}${h(t.reports)}</a>
          <p class="research-kicker">${h(venueLabel(paper))}${paper.acceptedDate ? ` <span>·</span> <time datetime="${h(paper.acceptedDate)}">${h(t.acceptedOn)} ${h(paper.acceptedDate)}</time>` : ''}</p>
          <h1 id="report-title">${h(title ?? paper.title)}</h1>
          <p class="research-deck">${h(summary)}</p>
          <div class="report-identity">
            <p class="report-byline">${h(paper.authors.join(', '))}</p>
            ${article ? `<ul class="report-dates" role="list">
              <li>${h(t.paperCompanion)} ${h(article.version)}</li>
              <li>${h(t.firstPublished)} <time datetime="${h(article.published)}">${h(article.published)}</time></li>
              <li>${h(t.lastUpdated)} <time datetime="${h(article.updated)}">${h(article.updated)}</time></li>
            </ul>` : ''}
          </div>
          ${article ? `<p class="report-paper">
            <a href="${h(publication)}"><cite lang="en">${h(paper.title)}</cite> ${icon('arrow')}</a>
            <span>${h(t.authorFinal)} <time datetime="${h(article.manuscriptDate)}">${h(article.manuscriptDate)}</time></span>
          </p>` : ''}
          <div class="research-actions">
            ${paper.codeUrl ? `<a class="button button-dark" href="${h(paper.codeUrl)}" ${external}>${icon('code')}GitHub ${icon('external')}</a>` : ''}
            ${spaceBadge(artifact, t)}
            ${artifact ? `<a class="text-link" href="${h(artifact.url)}" ${external}>${h(t.release)} ${h(artifact.version)}${icon('external')}</a>` : ''}
            ${artifact?.guide ? `<a class="text-link" href="${h(artifact.guide)}" ${external}>${h(t.reproductionGuide)} ${icon('external')}</a>` : ''}
            ${article ? '' : `<a class="text-link" href="${h(publication)}">${h(t.publicationEntry)} ${icon('arrow')}</a>`}
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
            ${article?.updateNote ? `<p class="report-update"><strong>${h(t.updateNote)} ${h(article.version)}</strong> · ${h(article.updateNote[locale])}</p>` : ''}
          </section>` : ''}
        </div>
      </div>
    </article>
  </main>`;
}
