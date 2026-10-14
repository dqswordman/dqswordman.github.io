import imperialCrisis from './narrative/imperial-crisis.mjs';
import lateQing from './narrative/late-qing-reconstruction.mjs';
import republic from './narrative/republic-and-society.mjs';
import revolution from './narrative/revolution-and-invasion.mjs';
import flood1931 from './narrative/flood-1931.mjs';
import war1937 from './narrative/war-1937.mjs';
import fronts from './narrative/fronts-1938-1944.mjs';
import occupation from './narrative/occupation-and-atrocities.mjs';
import homefront from './narrative/wartime-homefront.mjs';
import resistance from './narrative/resistance-and-politics.mjs';
import victory from './narrative/alliance-and-victory.mjs';
import stateBuilding from './narrative/state-building.mjs';
import planning from './narrative/planning-and-dissent.mjs';
import flood1954 from './narrative/flood-1954.mjs';
import famine from './narrative/great-famine.mjs';
import culturalRevolution from './narrative/cultural-revolution.mjs';
import banqiao from './narrative/banqiao-1975.mjs';
import tangshan from './narrative/tangshan-1976.mjs';
import coldWar from './narrative/cold-war.mjs';
import reform from './narrative/reform-1976-1989.mjs';
import protests from './narrative/protests-1989.mjs';
import markets from './narrative/market-transformation.mjs';
import governance from './narrative/governance-2012-2026.mjs';
import strait from './narrative/strait-and-hongkong.mjs';
import borderlands from './narrative/borderlands-and-rights.mjs';
import welfare from './narrative/population-and-welfare.mjs';
import science from './narrative/science-and-environment.mjs';
import { fullFigures } from './full-figures.mjs';

export const fullStudies = [
  imperialCrisis, lateQing, republic, revolution, flood1931,
  war1937, fronts, occupation, homefront, resistance, victory,
  stateBuilding, planning, flood1954, famine, culturalRevolution,
  banqiao, tangshan, coldWar, reform, protests, markets, governance,
  strait, borderlands, welfare, science,
].map(chapter => ({ ...chapter, figure: fullFigures[chapter.id] }));
