import { backgroundStudies } from './full-background.mjs';
import { warStudies } from './full-war.mjs';
import { earlyPrcStudies } from './full-prc-early.mjs';
import { laterPrcStudies } from './full-prc-later.mjs';
import { thematicStudies } from './full-themes.mjs';
import { warCases } from './full-war-cases.mjs';
import { prcCases } from './full-prc-cases.mjs';
import { disasterStudies } from './full-disasters.mjs';
import { fullFigures } from './full-figures.mjs';
const cases = { ...warCases, ...prcCases };
const insertAfter = { 'flood-1931': 'revolution-and-invasion', 'flood-1954': 'planning-and-dissent', 'banqiao-1975': 'cultural-revolution', 'tangshan-1976': 'cultural-revolution' };
export const fullStudies = [...backgroundStudies, ...warStudies, ...earlyPrcStudies, ...laterPrcStudies, ...thematicStudies].flatMap(chapter => [chapter, ...disasterStudies.filter(extra => insertAfter[extra.id] === chapter.id)]).map(chapter => ({
  ...chapter,
  figure: fullFigures[chapter.id],
  sections: chapter.sections.flatMap((section, index) => [section, ...(cases[chapter.id] || []).filter(group => group.after === index + 1).flatMap(group => group.sections)]),
}));
