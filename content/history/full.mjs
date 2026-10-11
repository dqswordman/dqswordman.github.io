import { backgroundStudies } from './full-background.mjs';
import { warStudies } from './full-war.mjs';
import { earlyPrcStudies } from './full-prc-early.mjs';
import { laterPrcStudies } from './full-prc-later.mjs';
import { thematicStudies } from './full-themes.mjs';
import { warCases } from './full-war-cases.mjs';
import { prcCases } from './full-prc-cases.mjs';
const cases = { ...warCases, ...prcCases };
export const fullStudies = [...backgroundStudies, ...warStudies, ...earlyPrcStudies, ...laterPrcStudies, ...thematicStudies].map(chapter => ({
  ...chapter,
  sections: chapter.sections.flatMap((section, index) => [section, ...(cases[chapter.id] || []).filter(group => group.after === index + 1).flatMap(group => group.sections)]),
}));
