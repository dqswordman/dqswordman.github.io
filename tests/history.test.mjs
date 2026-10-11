import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { history, localizedHistory, validateHistory, referencesFor, eventsForPerson, historyRoutes, studiesForEvent, articleText } from '../src/history.mjs';
import { graphModel, graphSvg } from '../src/history-graph.mjs';
import { matchesHistoryRecord } from '../src/history-search.mjs';
import { renderMiscPage } from '../src/misc-render.mjs';
import { loadContent } from '../src/content.mjs';
import { outputRoot, projectRoot } from '../scripts/build.mjs';

const { profile } = await loadContent(projectRoot);
const assets = { miscCss: 'misc.css', miscJs: 'misc.js', graphData: 'history.json' };

test('the declared catalog covers every period with complete, connected articles', () => {
  assert.equal(validateHistory(), history);
  assert.equal(history.events.length, 90);
  assert.equal(history.people.length, 80);
  assert.equal(history.chapters.length, 14);
  assert.equal(history.themes.length, 9);
  assert.equal(history.sources.length, 153);
  for (const period of history.periods) assert.ok(history.events.some((event) => event.period === period.id));
  for (const person of history.people) assert.ok(eventsForPerson(person.id).length);
});

test('content validation rejects missing evidence, unknown actors and dangling connections', () => {
  for (const mutate of [
    (data) => { data.events[0].actors[0].person = 'missing-person'; },
    (data) => { data.events[0].sections[0].refs = []; },
    (data) => { data.events[0].related = ['missing-event']; },
    (data) => { data.events[0].actors.push(data.events[0].actors[0]); },
    (data) => { data.studies.forEach(s => { s.events = s.events.filter(id => id !== data.events[0].id); }); },
    (data) => { data.studies[0].sections[0].refs = ['missing-source']; },
  ]) {
    const data = structuredClone(history);
    mutate(data);
    assert.throws(() => validateHistory(data), /History content:/);
  }
});

test('Full has substantive bilingual chapters, prioritizes war and post-1949, and covers the complete event catalog', () => {
  const en = validateHistory(localizedHistory('en'));
  assert.equal(history.studies.length, 23);
  assert.equal(history.studies.reduce((n, s) => n + s.sections.length, 0), 172);
  assert.equal(history.studies.filter(s => s.part === 'war').length, 6);
  assert.equal(history.studies.filter(s => s.part === 'prc').length, 11);
  assert.deepEqual(historyRoutes(en), historyRoutes(history));
  for (const kind of ['events', 'people', 'chapters', 'themes', 'studies', 'sources']) {
    assert.deepEqual(en[kind].map(s => s.id), history[kind].map(s => s.id), kind);
  }
  for (const chapter of history.studies) {
    const translated = en.studies.find(s => s.id === chapter.id);
    assert.equal(translated.sections.length, chapter.sections.length, chapter.id);
    assert.ok((articleText(chapter).match(/[\u3400-\u9fff]/gu) || []).length >= 1000, chapter.id);
    assert.ok(articleText(translated).split(/\s+/).length >= 500, chapter.id);
    chapter.sections.forEach((section, i) => assert.deepEqual(translated.sections[i].refs, section.refs, chapter.id));
    for (const eventId of chapter.events) for (const ref of history.events.find(e => e.id === eventId).visual?.refs || []) {
      assert.ok(referencesFor(chapter).includes(ref), `embedded visual must have chapter evidence: ${chapter.id}/${ref}`);
    }
  }
  for (const event of history.events) assert.ok(studiesForEvent(event.id).length, event.id);
});

test('English prose and source notes cannot silently fall back to Chinese', () => {
  const en = structuredClone(localizedHistory('en'));
  en.people[0].sections[0].paragraphs[0] = '遗漏的中文正文';
  assert.throws(() => validateHistory(en), /untranslated English/);
  const sourceData = structuredClone(localizedHistory('en'));
  sourceData.sources[0].note = '遗漏的引用说明';
  assert.throws(() => validateHistory(sourceData), /untranslated English source/);
});

test('unknown death dates and living people do not get fabricated death years', () => {
  const he = history.people.find((person) => person.id === 'he-zhen');
  assert.equal(he.died, null);
  assert.match(he.dates, /不详/);
  assert.equal(history.people.find((person) => person.id === 'tu-youyou').died, null);
  assert.match(history.people.find((person) => person.id === 'li-keqiang').dates, /2023/);
  assert.match(history.people.find((person) => person.id === 'claire-chennault').dates, /1890.*1893/);
  assert.match(articleText(localizedHistory('en').people.find((person) => person.id === 'joseph-stalin')), /1878[\s\S]*1879/);
});

test('numeric visuals include verifiable references and reject nonfinite or unsourced values', () => {
  const bars = history.events.filter((event) => event.visual?.type === 'bars');
  assert.ok(bars.length >= 2);
  for (const event of bars) for (const reference of event.visual.refs) assert.ok(referencesFor(event).includes(reference));
  const data = structuredClone(history);
  data.events.find((event) => event.visual?.type === 'bars').visual.values[0][1] = Infinity;
  assert.throws(() => validateHistory(data), /bar chart/);
});

test('graph edges only connect an explicitly recorded person and event, including opponents', () => {
  for (const person of history.people) {
    const model = graphModel(history, person.id);
    assert.equal(model.events.length, eventsForPerson(person.id).length);
    for (const edge of model.edges) assert.ok(history.events.find((event) => event.id === edge.event).actors.some((actor) => actor.person === edge.person));
    assert.ok(!model.peers.some((peer) => peer.id === person.id));
    const specific = graphModel(history, person.id, model.events[0].id);
    assert.equal(specific.events.length, 1);
    assert.equal(specific.edges.length, specific.events[0].actors.length);
  }
  assert.ok(graphModel(history, 'mao-zedong', 'civil-war').peers.some((person) => person.id === 'chiang-kai-shek'));
  assert.ok(graphModel(history, 'iwane-matsui').events.some(event => event.id === 'nanjing-atrocities'));
  assert.ok(graphModel(localizedHistory('en'), 'joseph-stilwell').peers.some(person => person.id === 'chiang-kai-shek'));
});

test('graph labels escape arbitrary text and honor project base paths', () => {
  const model = graphModel(history, 'sun-yatsen');
  model.person = { ...model.person, name: '<script>alert(1)</script>' };
  const svg = graphSvg(model, '/preview');
  assert.ok(!svg.includes('<script>'));
  assert.ok(svg.includes('&lt;script&gt;'));
  assert.ok(svg.includes('/preview/misc/history/people/sun-yatsen/'));
});

test('search combines words, period memberships, exact topics and inclusive year ranges', () => {
  const record = { search: '1919 五四运动 胡适 ＡＩ', period: 'republic|revolution', tags: '思想|社会', start: '1918', end: '1920' };
  assert.equal(matchesHistoryRecord(record, { q: '胡适 ai', period: 'revolution', topic: '思想', year: '1919' }), true);
  assert.equal(matchesHistoryRecord(record, { q: '胡适 毛泽东' }), false);
  assert.equal(matchesHistoryRecord(record, { period: 'state' }), false);
  assert.equal(matchesHistoryRecord(record, { topic: '思' }), false);
  assert.equal(matchesHistoryRecord(record, { year: '1921' }), false);
  assert.equal(matchesHistoryRecord(record, { year: '2027' }), false);
});

test('all routes render semantic static content with article evidence and accessible navigation', () => {
  for (const locale of ['zh', 'en']) for (const route of historyRoutes()) {
    const html = renderMiscPage({ route, profile, assets, basePath: '/preview', locale });
    assert.equal((html.match(/<h1\b/g) || []).length, 1, route);
    assert.equal((html.match(/<main\b/g) || []).length, 1, route);
    assert.ok(html.includes(`rel="canonical" href="${profile.url}/preview/${locale === 'en' ? 'en/' : ''}${route}"`), `${locale}/${route}`);
    assert.ok(html.includes(`data-language-switch lang="${locale === 'en' ? 'zh-CN' : 'en'}"`), route);
    assert.ok(!html.includes('undefined'), route);
    if (/\/(events|people|chapters|themes|full)\/.+\/$/.test(route)) {
      assert.ok(html.includes('id="references"'), route);
      assert.ok(html.includes('id="section-1"'), route);
    }
    assert.ok(html.includes('data-visitors'), route);
  }
});

test('Full diagrams use chapter citation numbers, with a real reference target for each citation', () => {
  for (const locale of ['zh', 'en']) for (const chapter of localizedHistory(locale).studies) {
    const html = renderMiscPage({ route: `misc/history/full/${chapter.id}/`, profile, assets, locale });
    const references = referencesFor(chapter);
    for (const match of html.matchAll(/href="#ref-([a-z0-9-]+)"[^>]*>\[(\d+)\]<\/a>/g)) {
      assert.equal(Number(match[2]), references.indexOf(match[1]) + 1, `${locale}/${chapter.id}/${match[1]}`);
      assert.ok(html.includes(`id="ref-${match[1]}"`));
    }
  }
});

test('published acceptance catalog includes all article URLs and the contemporaneous data boundary', async () => {
  for (const locale of ['zh', 'en']) {
    const catalog = JSON.parse(await readFile(new URL(`assets/history-catalog${locale === 'en' ? '.en' : ''}.json`, outputRoot), 'utf8'));
    assert.equal(catalog.version, 2);
    assert.equal(catalog.locale, locale);
    assert.equal(catalog.events.length, history.events.length);
    assert.equal(catalog.people.length, history.people.length);
    assert.equal(catalog.chapters.length, history.chapters.length);
    assert.equal(catalog.themes.length, history.themes.length);
    assert.equal(catalog.sources.length, history.sources.length);
    assert.equal(catalog.studies.length, history.studies.length);
    assert.equal(catalog.counts.fullSections, 172);
    assert.equal(catalog.counts.actions, history.events.reduce((count, event) => count + event.actors.length, 0));
    assert.ok(catalog.futureAdditions.length);
    assert.match(catalog.scope, /非穷尽|not an exhaustive/);
    assert.match(catalog.range, /2026-10-10/);
    for (const event of catalog.events) {
      assert.ok(event.references.length && event.people.length && event.fullChapters.length && event.status);
      assert.ok(event.urls.zh && event.urls.en);
    }
    for (const chapter of catalog.studies) {
      assert.equal(chapter.edition, 'Full');
      assert.ok(chapter.sections.length >= 6);
      assert.ok(chapter.urls.zh && chapter.urls.en);
    }
  }
  assert.match(history.events.find((event) => event.id === 'china-2026').sections.map((section) => section.paragraphs.join('')).join(''), /预测/);
});
