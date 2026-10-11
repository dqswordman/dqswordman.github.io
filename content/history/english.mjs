import { section } from './schema.mjs';
import { englishEarlyEvents } from './en-events-early.mjs';
import { englishModernEvents } from './en-events-modern.mjs';
import { englishPeople } from './en-people.mjs';
import { englishEssays, englishTags } from './en-essays.mjs';
import { englishActionRows } from './en-actions.mjs';
import { englishSource } from './en-sources.mjs';
import { internationalEnglishPeople, internationalEnglishActors } from './people-international.mjs';
import { dossiers } from './dossiers.mjs';
import { biographyDossiers } from './biography-dossiers.mjs';

const index = items => new Map(items.map(item => [item.id, item]));
const eventTexts = index([...englishEarlyEvents, ...englishModernEvents]);
const peopleTexts = index([...englishPeople, ...internationalEnglishPeople]);
const essayTexts = index(englishEssays);
const required = (map, id) => { const value = map.get(id); if (!value) throw new Error(`Missing English article: ${id}`); return value; };
const refsOf = item => [...new Set(item.sections.flatMap(s => s.refs))];
const dateLabel = date => date.replace('战后', 'Postwar').replace('晚清', 'Late Qing').replace('五四前后', 'Around May Fourth').replace('此后数十年', 'Following decades').replace('年代后期', 's, late').replace('年代', 's').replace('年中', ', mid-year').replace('年初', ', early').replace('以后', ' onward').replace('前后', ' (approx.)').replace('起', ' onward').replace('初', ', early').replaceAll('年', '').replace('春', ', spring').replace('夏', ', summer').replace('秋', ', autumn').replace('冬', ', winter');
const visuals = {
  'treaty-system': ['Accumulation of treaty privileges', ['Document', 'Terms', 'Distinction'], [['Nanjing, 1842', 'Ports, Hong Kong Island, indemnities', 'Not all later privileges'], ['British supplements, 1843', 'Tariffs, jurisdiction, most-favored-nation treatment', 'Separate from main treaty'], ['Wangxia and Huangpu, 1844', 'American and French privileges', 'A developing treaty system']]],
  'self-strengthening': ['Connected elements of self-strengthening', ['Element', 'Measures', 'Constraint'], [['Technology', 'Arsenals and ships', 'Maintenance and investment'], ['People', 'Translation and study', 'Status and suspicion'], ['Finance', 'Enterprises and revenue', 'Fragmentation'], ['Organization', 'Military and diplomacy', 'Coordination']]],
  'twenty-one-demands': ['Different texts in one negotiation', ['Stage', 'Use', 'Caution'], [['Initial demands', 'Maximum objectives', 'Not all binding'], ['Revision and ultimatum', 'Negotiation under threat', 'Version and date'], ['Treaties and exchanges', 'Accepted obligations', 'Compare each provision']]],
  'nanjing-state': ['State-building capacities and limits', ['Field', 'Development', 'Limit'], [['Finance', 'Tariffs and currency', 'Fragmentation'], ['Infrastructure', 'Transport and industry', 'Regional gaps and war'], ['Politics', 'Party-state', 'Repression'], ['Society', 'Education and health', 'Unequal access']]],
  'long-march': ['Central Red Army stages: schematic, not a scaled map', ['Period', 'Area', 'Issue'], [['Late 1934', 'Jiangxi to Hunan and Guangxi', 'Blockade and losses'], ['Early 1935', 'Guizhou and adjacent regions', 'Leadership and maneuver'], ['Mid–late 1935', 'Western Sichuan to northern Shaanxi', 'Supply and geography'], ['1936', 'Northwest', 'Convergence and alliances']]],
  'nanjing-atrocities': ['Evidence and corroboration', ['Material', 'Can establish', 'Cannot establish alone'], [['Diaries and letters', 'Dated observations', 'Complete regional total'], ['Images', 'Recorded scenes', 'Everything outside frame'], ['Burial and population records', 'Clues to scale', 'Precision without boundaries'], ['Trial and military records', 'Acts and responsibility', 'Every victim’s identity']]],
  'civil-war': ['Military results and social consequences', ['Dimension', 'Process', 'Further question'], [['Military', 'Campaigns and surrender', 'Treatment of civilians and prisoners'], ['Economy', 'Currency and prices', 'Household losses'], ['Rural', 'Redistribution', 'Classification and coercion'], ['Population', 'Flight and separation', 'Return and division']]],
  'great-leap-famine': ['Famine feedback mechanisms: schematic, not causal coefficients', ['Stage', 'Mechanism', 'Blocked correction'], [['High targets', 'Competition and punishment', 'Independent measurement'], ['Inflated output', 'Unrealistic procurement', 'Lower extraction'], ['Procurement', 'Less household food', 'Trade and mobility'], ['Hunger and concealment', 'Weaker labor and information', 'Disclosure']]],
  'tiananmen-1989': ['Four evidentiary scopes', ['Scope', 'Established process', 'Limit'], [['Participation', 'Students, workers, residents', 'Different demands'], ['Roads', 'Civilian shooting', 'Not only square center'], ['Evacuation', 'Negotiations', 'Not a citywide census'], ['Aftermath', 'Arrests and exile', 'Not only 4 June']]],
  'covid-19': ['Statistical boundaries', ['Indicator', 'Includes', 'Does not replace'], [['Cases', 'Reporting definitions', 'All infections'], ['Hospital deaths', 'Institutions and dates', 'Population excess mortality'], ['Excess mortality', 'Deaths above baseline', 'Individual diagnosis'], ['Policy costs', 'Care and livelihoods', 'One case count']]],
};
function translateVisual(event) {
  if (!event.visual) return undefined;
  if (event.id === 'war-1938') return { ...event.visual, title: 'Flooded farmland in surveyed affected counties', values: [['Henan', 32], ['Anhui', 49], ['Jiangsu', 14]], note: 'Han Qitong and Nan Zhongwan’s 1948 survey, cited by Micah Muscolino. Affected counties, not whole provinces; retrospective, not a same-day measurement.' };
  if (event.id === 'demographic-turn') return { ...event.visual, title: 'Births and deaths in 2025', unit: '10,000 persons', values: [['Births', 792], ['Deaths', 1131]], note: 'NBS 2025 figures released in 2026, with the same mainland scope. Net change follows the complete statistical method.' };
  const [title, headers, rows] = visuals[event.id] || [];
  if (!title) throw new Error(`Missing English visual: ${event.id}`);
  return { ...event.visual, title, headers, rows };
}
export function localizeStudy(item, locale) {
  return { ...item, title: item.title[locale], summary: item.summary[locale], dates: locale === 'en' && item.dates.includes('/') ? item.dates.split('/').at(-1).trim() : item.dates, sections: item.sections.map(s => s[locale]), figure: item.figure?.[locale] };
}
export function englishHistory(data, rawStudies) {
  return {
    ...data, locale: 'en', sources: data.sources.map(englishSource), studies: rawStudies.map(s => localizeStudy(s, 'en')),
    periods: data.periods.map(p => ({ ...p, title: required(essayTexts, p.id).title })),
    events: data.events.map(event => {
      const text = required(eventTexts, event.id), refs = refsOf(event), rows = englishActionRows[event.id];
      if (text.milestones.length !== event.milestones.length) throw new Error(`English milestone mismatch: ${event.id}`);
      let n = 0;
      const actors = event.actors.map(actor => {
        const triple = internationalEnglishActors[`${event.id}/${actor.person}`] || rows?.[n++]?.split('|');
        if (!triple || triple.length !== 3) throw new Error(`Missing English action: ${event.id}/${actor.person}`);
        return { ...actor, stance: triple[0], action: triple[1], result: triple[2] };
      });
      if (n !== rows.length) throw new Error(`English action count mismatch: ${event.id}`);
      return { ...event, title: text.title, summary: text.summary, dates: `${event.start}${event.end === event.start ? '' : `–${event.end}`}`, tags: event.tags.map(tag => { if (!englishTags[tag]) throw new Error(`Missing English tag ${tag}`); return englishTags[tag]; }), sections: [section('Sequence and context', text.sequence, refs), section('Interpretation and evidence', text.analysis, refs), ...(dossiers[event.id] || []).map(s => s.en)], actors, milestones: event.milestones.map((m, i) => ({ date: dateLabel(m.date), label: text.milestones[i] })), questions: [text.question], visual: translateVisual(event) };
    }),
    people: data.people.map(person => {
      const text = required(peopleTexts, person.id), refs = refsOf(person);
      return { ...person, name: text.name, role: text.role, summary: text.activity, dates: person.id === 'he-zhen' ? 'c. 1884–death unknown' : person.id === 'claire-chennault' ? '1890 (some sources 1893)–1958' : `${person.born}–${person.died ?? 'living'}`, sections: [section('Background and formation', text.background, refs), section('Activity and historical setting', text.activity, refs), section('Assessment and evidence limits', text.assessment, refs), ...(biographyDossiers[person.id] || []).map(s => s.en)] };
    }),
    ...Object.fromEntries(['chapters', 'themes'].map(kind => [kind, data[kind].map(item => {
      const text = required(essayTexts, item.id), refs = refsOf(item);
      return { ...item, title: text.title, summary: text.summary, dates: item.dates ? `${data.periods.find(p => p.id === item.id)?.dates || '1840–2026'}` : undefined, sections: [section('Historical connections', text.context, refs), section('Questions and interpretation', text.interpretation, refs)] };
    })])),
  };
}
