import test from 'node:test';
import assert from 'node:assert/strict';
import { localizedHistory, referencesFor } from '../src/history.mjs';
import { retiredSourceIds } from '../content/history/source-edition.mjs';

const collections = ['studies', 'events', 'people', 'chapters', 'themes'];
const defensiveProse = /cannot be read as|does not imply access|require examination of|was not an automatic consequence|alone cannot explain|without making .{0,60} inevitable|本站不|本页不|不能把|不能将|不等于|需要区分|必须区分|研究(?:应|需要|必须)|评价(?:应|需要|需)|应(?:记录|考察|说明|区分|核对|保留)/iu;
const rubricLead = /^(?:Read|Examine|Trace|Distinguish|Explain|Connect|Follow|Separate|Compare|Discuss|Consider|Explore|Track|Link)\b/iu;

test('bilingual narrative uses historical statements and complete long sections', () => {
  for (const locale of ['zh', 'en']) {
    const data = localizedHistory(locale);
    for (const kind of collections) for (const article of data[kind]) {
      assert.doesNotMatch(article.summary, rubricLead, `${locale}/${article.id}: rubric summary`);
      assert.doesNotMatch(article.summary, defensiveProse, `${locale}/${article.id}: defensive summary`);
      for (const section of article.sections) {
        for (const paragraph of section.paragraphs) {
          assert.doesNotMatch(paragraph, defensiveProse, `${locale}/${article.id}/${section.title}`);
        }
        if (kind === 'studies') assert.ok(section.paragraphs.length >= 4, `${locale}/${article.id}: incomplete section`);
      }
    }
  }
});

test('published references resolve to the canonical bibliography after source retirement', () => {
  const retired = new Set(retiredSourceIds);
  for (const locale of ['zh', 'en']) {
    const data = localizedHistory(locale), sources = new Set(data.sources.map(s => s.id));
    for (const id of retired) assert.ok(!sources.has(id), `${locale}: retired bibliography record ${id}`);
    for (const kind of collections) for (const article of data[kind]) for (const id of referencesFor(article)) {
      assert.ok(sources.has(id), `${locale}/${article.id}: missing source ${id}`);
      assert.ok(!retired.has(id), `${locale}/${article.id}: retired source ${id}`);
    }
  }
});
