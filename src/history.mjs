import { sources } from '../content/history/sources.mjs';
import { periods } from '../content/history/schema.mjs';
import { earlyEvents } from '../content/history/events-early.mjs';
import { republicanEvents } from '../content/history/events-republic.mjs';
import { warEvents } from '../content/history/events-war.mjs';
import { prcEvents } from '../content/history/events-prc.mjs';
import { contemporaryEvents } from '../content/history/events-contemporary.mjs';
import { earlyPeople } from '../content/history/people-early.mjs';
import { modernPeople } from '../content/history/people-modern.mjs';
import { prcPeople } from '../content/history/people-prc.mjs';
import { chapters, themes } from '../content/history/essays.mjs';
import { fullSources } from '../content/history/full-sources.mjs';
import { internationalSources, internationalPeople, internationalActors } from '../content/history/people-international.mjs';
import { fullStudies } from '../content/history/full.mjs';
import { englishHistory, localizeStudy } from '../content/history/english.mjs';

export const history = {
  updated: '2026-10-11',
  cutoff: '2026-10-10',
  locale: 'zh',
  sources: [...sources, ...fullSources, ...internationalSources],
  periods,
  events: [...earlyEvents, ...republicanEvents, ...warEvents, ...prcEvents, ...contemporaryEvents].map(e => ({ ...e, actors: [...e.actors, ...(internationalActors[e.id] || [])] })).sort((a, b) => a.start - b.start),
  people: [...earlyPeople, ...modernPeople, ...prcPeople, ...internationalPeople],
  chapters,
  themes,
  studies: fullStudies.map(s => localizeStudy(s, 'zh')),
};

const english = englishHistory(history, fullStudies);
export const localizedHistory = (locale = 'zh') => locale === 'en' ? english : history;
export const studiesForEvent = (id, data = history) => data.studies.filter(s => s.events.includes(id));

export function referencesFor(article) {
  return [...new Set([
    ...(article.refs || []),
    ...article.sections.flatMap((section) => section.refs),
    ...(article.actors || []).flatMap((actor) => actor.refs),
    ...(article.visual?.refs || []),
  ])];
}

export function eventsForPerson(id, data = history) {
  return data.events.filter((event) => event.actors.some((actor) => actor.person === id));
}

export function validateHistory(data = history) {
  const fail = (message) => { throw new Error(`History content: ${message}`); };
  const identities = new Map();
  for (const kind of ['sources', 'periods', 'events', 'people', 'chapters', 'themes', 'studies']) {
    const ids = new Set();
    for (const item of data[kind]) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id)) fail(`invalid or duplicate ${kind} id ${item.id}`);
      ids.add(item.id);
    }
    identities.set(kind, ids);
  }
  for (const source of data.sources) {
    const url = new URL(source.url);
    if (url.protocol !== 'https:' || !source.title || !source.publisher || !source.type || !source.note) fail(`invalid source ${source.id}`);
  }
  for (const kind of ['events', 'people', 'chapters', 'themes', 'studies']) {
    for (const item of data[kind]) {
      if (!(item.title || item.name) || !item.summary || !item.sections?.length) fail(`incomplete ${kind} ${item.id}`);
      if (item.sections.some((s) => !s.title || !s.paragraphs.length || !s.refs.length)) fail(`unreferenced section in ${item.id}`);
      for (const id of referencesFor(item)) if (!identities.get('sources').has(id)) fail(`unknown source ${id} in ${item.id}`);
      for (const id of item.events || []) if (!identities.get('events').has(id)) fail(`unknown event ${id} in ${item.id}`);
      for (const id of item.related || []) if (!identities.get(kind).has(id)) fail(`unknown related ${kind} ${id}`);
    }
  }
  for (const event of data.events) {
    if (!identities.get('periods').has(event.period) || !Number.isInteger(event.start) || !Number.isInteger(event.end) || event.end < event.start) fail(`invalid dates/period ${event.id}`);
    if (!event.milestones?.length || !event.actors?.length || !event.questions?.length) fail(`missing chronology, actors or analysis in ${event.id}`);
    if (new Set(event.actors.map((a) => a.person)).size !== event.actors.length) fail(`duplicate actor in ${event.id}`);
    for (const actor of event.actors) {
      if (!identities.get('people').has(actor.person) || !actor.stance || !actor.action || !actor.result || !actor.refs.length) fail(`invalid actor ${actor.person} in ${event.id}`);
    }
    if (!event.tags?.length || event.sections.length < 2 || articleText(event).length < 200) fail(`thin event ${event.id}`);
    if (event.visual) {
      const visual = event.visual;
      if (!visual.title) fail(`untitled visual ${event.id}`);
      if (visual.type === 'bars') {
        if (!visual.unit || !visual.note || !visual.refs?.length || !visual.values?.length || visual.values.some(([label, value]) => !label || !Number.isFinite(value) || value < 0) || Math.max(...visual.values.map(([, value]) => value)) <= 0) fail(`invalid sourced bar chart ${event.id}`);
      } else if (!visual.headers?.length || !visual.rows?.length || visual.rows.some((row) => row.length !== visual.headers.length)) fail(`invalid table ${event.id}`);
    }
  }
  for (const person of data.people) {
    if (!Number.isInteger(person.born) || (person.died !== null && (!Number.isInteger(person.died) || person.died < person.born)) || !person.dates || !person.role || !eventsForPerson(person.id, data).length) fail(`invalid biography or disconnected person ${person.id}`);
  }
  for (const period of data.periods) if (!data.events.some((event) => event.period === period.id)) fail(`uncovered period ${period.id}`);
  if (data.chapters.length !== data.periods.length || data.periods.some((period) => !data.chapters.some((chapter) => chapter.id === period.id))) fail('chapter/period coverage mismatch');
  for (const event of data.events) if (!studiesForEvent(event.id, data).length) fail(`no Full reading path for ${event.id}`);
  for (const study of data.studies) {
    if (study.sections.length < 6 || !study.events.length) fail(`incomplete Full chapter ${study.id}`);
    const length = data.locale === 'en' ? articleText(study).split(/\s+/).length : articleText(study).length;
    if (length < (data.locale === 'en' ? 450 : 900)) fail(`thin Full chapter ${study.id}`);
  }
  if (data.locale === 'en') {
    for (const kind of ['events', 'people', 'chapters', 'themes', 'studies']) for (const item of data[kind]) {
      const prose = [item.title || item.name, item.dates, item.role, articleText(item), ...(item.actors || []).flatMap(a => [a.stance, a.action, a.result]), ...(item.milestones || []).flatMap(m => [m.date, m.label])].join(' ');
      if (/[\u3400-\u9fff]/u.test(prose)) fail(`untranslated English content ${kind}/${item.id}`);
    }
    for (const source of data.sources) if (/[\u3400-\u9fff]/u.test([source.title, source.publisher, source.note, source.type].join(' '))) fail(`untranslated English source ${source.id}`);
  }
  return data;
}

export const articleText = (article) => [article.summary, ...article.sections.flatMap((s) => [s.title, ...s.paragraphs])].join(' ');
export const readingMinutes = (article, locale = 'zh') => Math.max(2, Math.ceil(locale === 'en' ? articleText(article).split(/\s+/).length / 220 : articleText(article).length / 350));

export function historyRoutes(data = history) {
  return [
    'misc/', 'misc/research/', 'misc/lectures/', 'misc/books/', 'misc/finance/',
    'misc/history/', 'misc/history/lite/', 'misc/history/full/', 'misc/history/events/', 'misc/history/people/',
    'misc/history/timeline/', 'misc/history/network/', 'misc/history/sources/', 'misc/history/method/',
    ...['events', 'people', 'chapters', 'themes'].flatMap((kind) => data[kind].map((item) => `misc/history/${kind}/${item.id}/`)),
    ...data.studies.map(item => `misc/history/full/${item.id}/`),
  ];
}
