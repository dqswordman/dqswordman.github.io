import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadContent, resolveProjects, projectPath, technicalReportPath, validateContent, citation, venueLabel } from '../src/content.mjs';
import { renderPage } from '../src/render.mjs';
import { projectRoot } from '../scripts/build.mjs';

const content = await loadContent(projectRoot);
const assets = { css: 'site.css', js: 'site.js' };
const basePath = process.env.BASE_PATH || '';
const both = value => ({ en: value, zh: value });
const jsonLd = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);

test('selected projects have one canonical page per locale and keep the formal publication identity', async () => {
  for (const locale of ['en','zh']) {
    const home = renderPage({ ...content, assets, locale, basePath });
    const catalogue = await readFile(new URL('dist/' + (locale === 'zh' ? 'zh/' : '') + 'research/index.html', projectRoot), 'utf8');
    assert.equal(jsonLd(catalogue)['@type'], 'CollectionPage');
    for (const id of content.profile.featured) {
      const project = content.projects.find(p => p.id === id);
      const url = projectPath(id, locale, basePath);
      assert.ok(home.includes('href="' + url + '"') && catalogue.includes('href="' + url + '"'));
      const page = renderPage({ ...content, locale, basePath, assets, project });
      assert.equal(jsonLd(page)['@id'], content.profile.url + url);
      assert.ok(page.includes('#paper-' + project.publication.id));
    }
    const wsdm = content.publications.find(p => p.id === 'decision-sufficiency');
    assert.equal(venueLabel(wsdm), 'WSDM 2027');
    assert.equal(citation(wsdm), `${wsdm.authors.join(', ')}. ${wsdm.title}. WSDM 2027. Accepted; forthcoming.`);
    const hero = home.split('class="paper-spotlight"')[1].split('</article>')[0];
    for (const value of ['0.213','0.272','0.162','9.00','9.61','180']) assert.ok(hero.includes(value));
  }
});

test('the report index sorts by public date, labels versions and treats a companion as an article about the paper', () => {
  const html = renderPage({ ...content, assets, index: 'technical-reports' });
  for (const [tier, id] of [['ccf-b','decision-sufficiency'],['conference','pairsafe'],['preprint','program-structure-certificates']]) {
    assert.ok(html.split(`data-tier="${tier}"`)[1].split('</section>')[0].includes(`data-doc="${id}"`));
  }
  assert.deepEqual(content.profile.featured, ['decision-sufficiency','program-structure-certificates']);
  for (const id of ['decision-sufficiency', 'pairsafe', 'program-structure-certificates']) {
    const doc = content.projects.find(p => p.id === id).reports[0];
    assert.ok(html.includes('data-published="' + doc.technicalReport.article.published + '"'));
    const page = renderPage({ ...content, assets, report: doc });
    const metadata = jsonLd(page);
    assert.equal(metadata['@type'], 'Article');
    assert.equal(metadata.about.name, doc.title);
    assert.equal(metadata.dateModified, doc.technicalReport.article.updated);
    assert.ok(!page.includes('name="citation_title"'));
    assert.ok(page.includes(technicalReportPath(id, 'zh')));
  }
});

test('arXiv records retain their posted date, cite the paper directly and never receive a venue rank', () => {
  const paper = content.publications.find(paper => paper.id === 'program-structure-certificates');
  assert.equal(paper.postedDate, '2026-11-17');
  assert.equal(paper.acceptedDate, undefined);
  assert.equal(citation(paper), paper.authors.join(', ') + '. ' + paper.title +
    '. arXiv:2611.24975 (2026). https://arxiv.org/abs/2611.24975');
  for (const changes of [{ acceptedDate: paper.postedDate }, { venueRank: 'A' }, { preprintId: '2611.12345' }]) {
    const records = content.publications.map(p => p.id === paper.id ? { ...p, ...changes } : p);
    assert.throws(() => validateContent(content.profile, records, content.projects), /preprint record|CCF venue category/);
  }
});

test('a selected standalone report can have no conference, manuscript date or code repository', async () => {
  const descriptor = { id: 'independent-project', title: both('Independent question'), summary: both('Measured evidence'),
    authors: ['A. Researcher'], reports: [{ id: 'first-note', type: 'replication-report' }] };
  const body = { locales: { en: { title: 'Replication note', summary: 'An observed limit.' }, zh: { title: '复现记录', summary: '一项实测局限。' } },
    article: { version: '1.0', published: '2026-11-10', updated: '2026-11-15' },
    sections: [{ id: 'result', title: both('Result'), paragraphs: { en: ['A null finding.'], zh: ['零效应结果。'] } }] };
  const catalogue = await resolveProjects([descriptor], [], async () => body);
  const doc = catalogue.projects[0].reports[0];
  const profile = { ...content.profile, featured: [descriptor.id] };
  validateContent(profile, content.publications, catalogue.projects);
  const page = renderPage({ profile, ...catalogue, assets, report: doc });
  assert.equal(jsonLd(page)['@type'], 'Report');
  assert.ok(page.includes('name="citation_author" content="A. Researcher"'));
  assert.ok(!page.includes('#paper-first-note') && !page.includes('undefined') && !page.includes('name="citation_pdf_url"'));
  const openSource = renderPage({ profile, ...catalogue, index: 'open-source', assets });
  assert.ok(!openSource.includes('Replication note'));
  assert.equal(catalogue.publications.length, 0);
  const legacy = await resolveProjects([], [{ id: 'old-paper', technicalReport: true, title: 'Old paper', authors: ['A. Researcher'] }], async () => body);
  assert.equal(legacy.publications[0].reportId, 'old-paper');
  await assert.rejects(resolveProjects([descriptor,{...descriptor,id:'second-project'}], [], async () => body), /duplicate public report/);
  await assert.rejects(resolveProjects([{...descriptor,reports:[{id:'first-note',type:'paper-companion'}]}], [], async () => body), /linked publication/);
});

test('the open collection keeps its papers separate from the two selected works and links the original PDFs', () => {
  const batch = content.projects.filter(p => p.collection === 'open-research');
  assert.deepEqual([...content.profile.featured].sort(), ['decision-sufficiency', 'program-structure-certificates']);
  for (const id of ['rag-evidence-selection-paths', 'shared-value-embeddings', 'document-replay-evidence-qa'])
    assert.ok(batch.some(p => p.id === id));
  for (const locale of ['en','zh']) {
    const opts = { ...content, assets, locale, basePath };
    const home = renderPage(opts);
    const selected = home.split('id="selected-research"')[1].split('</section>')[0];
    const collection = renderPage({ ...opts, index: 'open-research' });
    const catalogue = renderPage({ ...opts, index: 'technical-reports' });
    assert.ok(catalogue.includes('data-tier="open-research"'));
    for (const project of batch) {
      const report = project.reports[0];
      assert.ok(!selected.includes(project.id));
      assert.ok(collection.includes(technicalReportPath(report.id,locale,basePath)));
      assert.ok(collection.includes(project.codeUrl));
      assert.ok(collection.includes(report.technicalReport.artifact.space));
      const attachment = '/' + project.manuscriptPdf;
      assert.ok(collection.includes('href="' + basePath + attachment + '"'));
      const article = renderPage({ ...opts, report });
      assert.ok(article.includes('name="citation_pdf_url" content="' + content.profile.url + basePath + attachment + '"'));
    }
  }
});
