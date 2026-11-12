import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { request } from 'node:http';
import {
  escapeHtml,
  safeHttps,
  validateContent,
  loadContent,
  normalizeBasePath,
  paperUrl,
  citation,
  legacyAnchors,
  acceptanceYear,
  newsItems,
  researchIndexes,
  researchIndexPath,
  technicalReportPath,
} from '../src/content.mjs';
import {
  normalizeSearch,
  matchesPaper,
  readFilterState,
  writeFilterState,
} from '../src/filter.mjs';
import { renderPage } from '../src/render.mjs';
import { projectRoot } from '../scripts/build.mjs';
import { createSiteServer } from '../scripts/serve.mjs';
import { parseVisitCounts, shouldCountVisit } from '../src/visitors.mjs';

const { profile, publications } = await loadContent(projectRoot);
const assets = { css: 'site.css', js: 'site.js' };
const paperRecord = (paper) => ({
  year: acceptanceYear(paper),
  topics: paper.topics,
  search: [paper.title, ...paper.authors, paper.venue, paper.year].join(' '),
});

test('both locales render every paper, authors, and original anchors without JavaScript', () => {
  for (const locale of ['en', 'zh']) {
    const html = renderPage({ profile, publications, locale, assets });
    for (const paper of publications) {
      assert.ok(html.includes(escapeHtml(paper.title)));
      for (const author of paper.authors) assert.ok(html.includes(escapeHtml(author)));
      assert.ok(html.includes(escapeHtml(paper.venue)));
    }
    for (const id of legacyAnchors) assert.ok(html.includes(`id="${id}"`));
    assert.ok(html.includes('data-filter-tools hidden'));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
  }
});

test('publications retain one explicit Scholar URL and generate precise title searches for the others', () => {
  const explicit = publications.filter((paper) => paper.scholarUrl);
  assert.equal(explicit.length, 1);
  for (const paper of publications) {
    const url = new URL(paperUrl(paper));
    assert.equal(url.hostname, 'scholar.google.com');
    assert.equal(url.searchParams.get('q'), `"${paper.title}"`);
  }
});

test('PAIRSAFE retains its authorship and acceptance record in the bilingual news timeline', () => {
  const paper = publications.find((paper) => paper.id === 'pairsafe');
  assert.equal(
    paper.title,
    'PAIRSAFE: Proxy-Resistant Paired Safety Evaluation for Refusal Boundaries',
  );
  assert.deepEqual(paper.authors, [profile.name]);
  assert.equal(paper.affiliation, 'Independent Researcher');
  assert.equal(paper.venue, 'AACL-IJCNLP');
  assert.equal(paper.status, 'accepted');
  assert.ok(citation(paper).endsWith('Accepted; forthcoming.'));
  for (const [locale, label] of [
    ['en', 'Accepted at · AACL-IJCNLP 2026'],
    ['zh', '录用于 · AACL-IJCNLP 2026'],
  ]) {
    const html = renderPage({ profile, publications, locale, assets });
    assert.ok(html.includes(label));
    assert.ok(html.includes('datetime="2026-09-08"'));
  }
});

test('WSDM news preserves the announcement date separately from the conference year and confirmed authorship', () => {
  const paper = publications.find(p => p.id === 'decision-sufficiency');
  assert.equal(paper.title, 'Complex Utility, Simple Calibration: Decision Sufficiency in RAG Evidence Selection');
  assert.equal(paper.venue, 'WSDM');
  assert.equal(paper.year, 2027);
  assert.equal(paper.acceptedDate, '2026-11-03');
  assert.deepEqual(paper.authors, ['Wenzhang Du']);
  assert.equal(paper.group, 'major');
  const announcement = newsItems(profile, publications).find(n => n.publication === paper.id);
  assert.equal(announcement.date, paper.acceptedDate);
  assert.equal(announcement.kind, 'acceptance');
  for (const locale of ['zh', 'en']) {
    const html = renderPage({ profile, publications, locale, assets });
    assert.match(html, /class="news-panel" id="news"/);
    assert.ok(html.indexOf('id="news"') < html.indexOf('id="about-me"'));
    assert.match(html, /datetime="2026-11-03"/);
    assert.match(html, /href="#paper-decision-sufficiency" data-paper-jump/);
  }
});

test('WSDM resources link both homepages, their localized reports, and the code repository', async () => {
  const paper = publications.find((item) => item.id === 'decision-sufficiency');
  const basePath = normalizeBasePath(process.env.BASE_PATH || '');
  for (const [locale, home] of [['en', '/'], ['zh', '/zh/']]) {
    const route = technicalReportPath(paper.id, locale);
    const counterpart = technicalReportPath(paper.id, locale === 'en' ? 'zh' : 'en', basePath);
    const html = renderPage({ profile, publications, locale, assets, basePath });
    const row = html.split(`id="paper-${paper.id}"`)[1].split('</article>')[0];
    assert.ok(row.includes(`href="${basePath + route}"`));
    assert.ok(row.includes(`href="${paper.codeUrl}"`));
    for (const index of researchIndexes) {
      const path = researchIndexPath(index, locale);
      const alt = researchIndexPath(index, locale === 'en' ? 'zh' : 'en', basePath);
      assert.ok(html.includes(`id="${index}" data-research-index href="${basePath + path}"`));
      const indexHtml = await readFile(new URL(`dist${path}index.html`, projectRoot), 'utf8');
      assert.match(indexHtml, /class="research-index"/);
      assert.ok(indexHtml.includes(`rel="canonical" href="${profile.url + basePath + path}"`));
      assert.ok(indexHtml.includes(`data-language href="${alt}"`));
      assert.ok(indexHtml.includes(`href="${basePath + route}"`));
      assert.doesNotMatch(indexHtml, /OSAG EO Governance|osag-eo-governance/);
    }
    assert.doesNotMatch(html, /class="research-resources"|马汉科理工大学|Mahanakorn University/);

    const report = await readFile(new URL(`dist${route}index.html`, projectRoot), 'utf8');
    assert.ok(report.includes(escapeHtml(paper.technicalReport.locales[locale].summary)));
    assert.ok(report.includes(`rel="canonical" href="${profile.url + basePath + route}"`));
    assert.ok(report.includes(`data-language href="${counterpart}"`));
    assert.ok(report.includes(`href="${basePath + home}#paper-${paper.id}"`));
    assert.ok(report.includes(`href="${paper.codeUrl}"`));
    for (const section of ['overview', 'results', 'method', 'worked-examples', 'evaluation', 'reproduce', 'sources'])
      assert.ok(report.includes(`href="#${section}"`) && report.includes(`id="${section}"`));
    assert.equal((report.match(/<figure class="report-figure">/g) ?? []).length, 2);
    assert.equal((report.match(/<table>/g) ?? []).length, 3);
    assert.ok(report.includes('0.272') && report.includes('0.162') && report.includes('2hop__10620_49084'));
  }
});

test('new dated papers require a bilingual technical report and a GitHub repository', () => {
  const wsdm = publications.find((paper) => paper.id === 'decision-sufficiency');
  const future = { ...wsdm, id: 'next-paper', acceptedDate: '2026-11-04' };
  assert.doesNotThrow(() => validateContent(profile, [...publications, future]));
  for (const key of ['codeUrl', 'technicalReport'])
    assert.throws(
      () => validateContent(profile, [...publications, { ...future, [key]: undefined }]),
      /Technical report and GitHub repository required/,
    );
  assert.throws(
    () => validateContent(profile, [...publications, { ...future, codeUrl: 'https://github.com.example.org/owner/repo' }]),
    /GitHub repository URL/,
  );
});

test('publication groups contain every paper once and presentation classifications stay out of venue records', () => {
  const groups = Object.fromEntries(['major', 'ei'].map(g => [g, publications.filter(p => p.group === g)]));
  assert.equal(groups.major.length, 7);
  assert.equal(groups.ei.length, 8);
  for (const p of publications) assert.doesNotMatch(p.venue, /\b(?:oral|poster|findings|main)\b/i);
  for (const locale of ['zh', 'en']) {
    const html = renderPage({ profile, publications, locale, assets });
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const [group, papers] of Object.entries(groups)) {
      const content = html.split(`id="${group}-publications"`)[1].split('class="publication-group"')[0];
      for (const paper of papers) assert.ok(content.includes(`id="paper-${paper.id}"`));
    }
    assert.doesNotMatch(html, /class="paper-(?:badge|authors|topics|author-note)"/);
  }
});

test('editorial validation rejects incomplete or impossible dates, dangling news links, and unknown publication groups', () => {
  const first = { id: 'fixture-news', date: '2026-11-03', kind: 'update', title: { en: 'Update', zh: '动态' }, text: { en: 'Research update.', zh: '研究近况。' } };
  for (const date of ['2026', '2026-11', '2026-02-30', '2026-13', 'November 3']) {
    assert.throws(() => validateContent({ ...profile, news: [{ ...first, date }] }, publications), /news date/);
    assert.throws(() => validateContent(profile, publications.map((p, i) => i === 0 ? { ...p, acceptedDate: date } : p)), /acceptance date/);
  }
  assert.throws(() => validateContent({ ...profile, news: [{ ...first, publication: 'missing' }] }, publications), /News publication/);
  assert.throws(() => validateContent(profile, publications.map((p, i) => i === 0 ? { ...p, group: 'unknown' } : p)), /publication group/);
});

test('acceptance dates determine news and publication years without using the conference year as a substitute', () => {
  const news = newsItems(profile, publications);
  const dated = publications.filter(p => p.acceptedDate);
  assert.equal(news.filter(n => n.kind === 'acceptance').length, dated.length);
  for (const paper of dated) {
    const item = news.find(n => n.publication === paper.id);
    assert.equal(item.date, paper.acceptedDate);
    assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.deepEqual(news.map(n => n.date), [...news.map(n => n.date)].sort().reverse());
  assert.equal(acceptanceYear(publications.find(p => p.id === 'decision-sufficiency')), 2026);
  assert.equal(acceptanceYear(publications.find(p => p.id === 'lightweight-gru')), 2024);
  assert.equal(acceptanceYear({ year: 2027 }), 'undated');
  for (const locale of ['en', 'zh']) {
    const html = renderPage({ profile, publications, locale, assets });
    assert.match(html, /id="paper-decision-sufficiency" data-publication data-year="2026"/);
    assert.match(html, /id="paper-lightweight-gru" data-publication data-year="2024"/);
    assert.doesNotMatch(html, /data-year-filter="2027"/);
    const displayed = [...html.matchAll(/class="news-date"><time datetime="([^"]+)">([^<]+)<\/time>/g)];
    for (const [, date, label] of displayed) assert.equal(date, label);
  }
});

test('visitor counting only runs on the exact published HTTPS origin', () => {
  assert.equal(shouldCountVisit('https://dqswordman.github.io/zh/?q=EEG', profile.url), true);
  for (const url of [
    'http://127.0.0.1:4173/',
    'http://localhost/',
    'http://dqswordman.github.io/',
    'https://dqswordman.github.io.evil.test/',
    'https://preview.example.com/',
    'file:///index.html',
    'invalid',
  ])
    assert.equal(shouldCountVisit(url, profile.url), false);
});

test('visitor responses accept real integer totals and reject malformed or fabricated defaults', () => {
  assert.deepEqual(parseVisitCounts({ site_uv: '1234', site_pv: 5678 }), {
    visitors: 1234,
    views: 5678,
  });
  assert.deepEqual(parseVisitCounts({ site_uv: 0, site_pv: 0 }), { visitors: 0, views: 0 });
  for (const payload of [
    null,
    {},
    { site_uv: -1, site_pv: 2 },
    { site_uv: NaN, site_pv: 2 },
    { site_uv: '<script>', site_pv: 2 },
    { site_uv: [], site_pv: 2 },
    { site_uv: [1], site_pv: 2 },
    { site_uv: 1, site_pv: Infinity },
  ])
    assert.equal(parseVisitCounts(payload), null);
});

test('citations contain recorded authors, title, venue, and year without invented identifiers', () => {
  const paper = publications.find((paper) => paper.id === 'projection-gru');
  assert.equal(
    citation(paper),
    'Wenzhang Du, Suchada Sitjongsataporn, Pipat Sakarin. Improving EEG Emotion Recognition with Projection Layer and Output-Gated GRU Network. ICPEI 2025.',
  );
});

test('content validation rejects duplicate IDs, invalid links, missing authors and unknown featured work', () => {
  assert.throws(() => validateContent(profile, [...publications, publications[0]]), /duplicate/);
  assert.throws(
    () => validateContent({ ...profile, github: 'javascript:alert(1)' }, publications),
    /HTTPS/,
  );
  assert.throws(() => validateContent(profile, [{ ...publications[0], authors: [] }]), /authors/);
  assert.throws(
    () => validateContent({ ...profile, featured: ['missing'] }, publications),
    /does not exist/,
  );
  assert.throws(
    () => validateContent(profile, [{ ...publications[0], topics: ['invented'] }]),
    /topics/,
  );
});

test('HTML data is escaped in text, attributes, and structured data', () => {
  assert.equal(
    escapeHtml('<script a="x">&\'</script>'),
    '&lt;script a=&quot;x&quot;&gt;&amp;&#39;&lt;/script&gt;',
  );
  const malicious = { ...profile, name: '</script><img src=x onerror=alert(1)>' };
  const html = renderPage({ profile: malicious, publications, assets });
  assert.ok(!html.includes('<img src=x'));
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(json).mainEntity.name, malicious.name);
});

test('URL validation refuses credentials and non-HTTPS schemes', () => {
  for (const value of [
    'http://example.com',
    'javascript:alert(1)',
    'https://name:secret@example.com',
  ])
    assert.throws(() => safeHttps(value));
  assert.equal(safeHttps('https://example.com'), 'https://example.com/');
  assert.throws(
    () =>
      validateContent(
        { ...profile, url: 'https://dqswordman.github.io?source=test' },
        publications,
      ),
    /site origin/,
  );
});

test('base paths support project Pages and reject traversal or URL fragments', () => {
  assert.equal(normalizeBasePath('/research/'), '/research');
  assert.equal(normalizeBasePath('research/site'), '/research/site');
  assert.equal(normalizeBasePath('/'), '');
  for (const value of ['../site', '/a/../b', '//evil.com', '/site?x=1', '/a\\b'])
    assert.throws(() => normalizeBasePath(value));
  const html = renderPage({ profile, publications, assets, basePath: '/research', locale: 'zh' });
  assert.ok(html.includes('href="/research/"'));
  assert.ok(html.includes('href="/research/assets/site.css"'));
  assert.ok(html.includes('href="https://dqswordman.github.io/research/zh/"'));
});

test('search handles mixed case, Unicode width, whitespace, and multi-token queries', () => {
  assert.equal(normalizeSearch('  ＰＡＫＤＤ\t2026  '), 'pakdd 2026');
  const record = paperRecord(publications.find((paper) => paper.id === 'paired-bootstrap'));
  assert.equal(matchesPaper(record, { query: 'PAKDD bootstrap 2026' }), true);
  assert.equal(matchesPaper(record, { query: 'bootstrap nonexistent' }), false);
});

test('both language pages index both languages for stable search during language switching', () => {
  for (const locale of ['en', 'zh']) {
    const html = renderPage({ profile, publications, locale, assets });
    const indexes = [...html.matchAll(/data-search="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(
      indexes.filter((search) => normalizeSearch(search).includes('对地观测')).length,
      4,
    );
    assert.equal(
      indexes.filter((search) => normalizeSearch(search).includes('earth observation')).length,
      4,
    );
  }
});

test('year and topic constraints combine with text search', () => {
  const records = publications.map(paperRecord);
  assert.equal(records.filter((paper) => matchesPaper(paper, { year: '2025' })).length, 4);
  assert.equal(
    records.filter((paper) => matchesPaper(paper, { year: '2026', topic: 'earth' })).length,
    4,
  );
  assert.equal(
    records.filter((paper) =>
      matchesPaper(paper, { query: 'EEG', year: '2025', topic: 'efficient' }),
    ).length,
    2,
  );
  assert.equal(
    records.filter((paper) =>
      matchesPaper(paper, { query: 'light-weight', year: '2024', topic: 'efficient' }),
    ).length,
    1,
  );
});

test('filter URLs are shareable, bounded, and tolerate unknown values', () => {
  const state = readFilterState(
    '?q=small+improvements&year=2026&topic=evaluation',
    ['all', '2026', '2025'],
    ['all', 'evaluation'],
  );
  assert.deepEqual(state, { query: 'small improvements', year: '2026', topic: 'evaluation' });
  assert.deepEqual(readFilterState('?year=1999&topic=bad', ['2026'], ['earth']), {
    query: '',
    year: 'all',
    topic: 'all',
  });
  assert.equal(readFilterState(`?q=${'a'.repeat(300)}`, [], []).query.length, 200);
  const url = writeFilterState('https://example.com/zh/?source=test#publications', state);
  assert.equal(url.searchParams.get('source'), 'test');
  assert.equal(url.searchParams.get('q'), 'small improvements');
  assert.equal(url.hash, '#publications');
  const reset = writeFilterState(url, { query: '', year: 'all', topic: 'all' });
  assert.equal(reset.search, '?source=test');
});

test('404 has noindex, useful navigation, and no misleading ProfilePage schema', () => {
  const html = renderPage({ profile, publications, assets, notFound: true });
  assert.ok(html.includes('name="robots" content="noindex"'));
  assert.ok(html.includes('href="/#publications"'));
  assert.ok(!html.includes('application/ld+json'));
});

test('legacy redirects preserve hashes and use local navigation', async () => {
  const redirect = await readFile(new URL('dist/about.html', projectRoot), 'utf8');
  const script = await readFile(new URL('dist/assets/redirect.js', projectRoot), 'utf8');
  assert.ok(redirect.includes('http-equiv="refresh"'));
  assert.ok(script.includes('target.hash = location.hash'));
  assert.ok(script.includes('target.search = location.search'));
  assert.ok(script.includes('location.replace(target.pathname'));
});

test('preview serves HTML, assets, redirects, HEAD, 404, and rejects traversal and writes', async (t) => {
  const server = createSiteServer({ basePath: '' });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const port = server.address().port;
  const fetchPath = async (path, method = 'GET') =>
    new Promise((resolve, reject) => {
      const req = request({ hostname: '127.0.0.1', port, path, method }, (response) => {
        const chunks = [];
        response.on('data', (data) => chunks.push(data));
        response.on('end', () =>
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(chunks).toString(),
          }),
        );
      });
      req.on('error', reject);
      req.end();
    });
  assert.equal((await fetchPath('/')).status, 200);
  assert.equal((await fetchPath('/zh/')).status, 200);
  assert.equal((await fetchPath('/zh')).status, 308);
  assert.equal((await fetchPath('/zh?year=2026')).headers.location, '/zh/?year=2026');
  const head = await fetchPath('/', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
  assert.equal((await fetchPath('/not-a-page')).status, 404);
  assert.equal((await fetchPath('/%2e%2e%2fpackage.json')).status, 403);
  assert.equal((await fetchPath('/%5c..%5cpackage.json')).status, 400);
  assert.equal((await fetchPath('/%E0%A4%A')).status, 400);
  assert.equal((await fetchPath('/', 'POST')).status, 405);
  const icon = await fetchPath('/assets/favicon.svg');
  assert.equal(icon.headers['content-type'], 'image/svg+xml');
  assert.equal(icon.headers['x-content-type-options'], 'nosniff');
});

test('preview supports project subdirectories with correct prefix and directory redirects', async (t) => {
  const server = createSiteServer({ basePath: '/research' });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const origin = `http://127.0.0.1:${server.address().port}`;
  const get = (path) => fetch(origin + path, { redirect: 'manual' });
  assert.equal((await get('/research/')).status, 200);
  assert.equal((await get('/research/zh/')).status, 200);
  assert.equal((await get('/research/assets/favicon.svg')).status, 200);
  const prefix = await get('/research?year=2025');
  assert.equal(prefix.status, 308);
  assert.equal(prefix.headers.get('location'), '/research/?year=2025');
  assert.equal((await get('/research/zh')).headers.get('location'), '/research/zh/');
  assert.equal((await get('/research-other/')).status, 404);
  assert.equal((await get('/zh/')).status, 404);
});
