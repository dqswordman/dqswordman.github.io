// Source identities retired during the narrative edition; event identities stay unchanged.
const replacements = {
  "qing-overview": [
    "world-colonial-empires"
  ],
  "republic-sources": [],
  "military-lateqing": [
    "world-colonial-empires",
    "accidental-holyland"
  ],
  "may30-study": [
    "may30-chinese-protest",
    "may30-us-cable"
  ],
  "unitedfront-study": [
    "frus-1927",
    "sun-stages"
  ],
  "nanjing-decade": [
    "nanjing-currency-1935",
    "chiang-newlife"
  ],
  "split-1927": [
    "frus-1927"
  ],
  "northern-finance": [
    "frus-1927"
  ],
  "resistance-war": [
    "army-china-defensive",
    "war-occupation"
  ],
  "civilwar-study": [
    "civilwar-us",
    "frus-1946"
  ],
  "taiwan-republic": [
    "taiwan-white-terror",
    "taiwan-history-gov"
  ],
  "rectification-study": [
    "accidental-holyland"
  ],
  "land-mao-liu": [
    "accidental-holyland",
    "resolution-1981"
  ],
  "early-prc-campaigns": [
    "political-violence",
    "land-property"
  ],
  "political-campaign-databases": [
    "resolution-1981",
    "political-violence"
  ],
  "third-front": [
    "prc-chronology"
  ],
  "third-front-study": [
    "prc-chronology"
  ],
  "birth-policy": [
    "birth-policy-study",
    "unfpa-programme"
  ],
  "vietnam-war": [
    "vietnam-war-records",
    "deng-carter-vietnam"
  ],
  "falungong-study": [
    "falungong-amnesty-2000"
  ],
  "henan-famine-study": [
    "henan-famine-history",
    "henan-white-report"
  ],
  "civilwar-social": [
    "frus-1946",
    "gold-yuan-records"
  ],
  "gold-yuan-1948": [
    "gold-yuan-records"
  ],
  "rural-reconstruction": [
    "rural-reconstruction-2021"
  ],
  "wenchuan-accountability": [
    "wenchuan-parents-2009",
    "wenchuan-reconstruction-plan"
  ],
  "guangxi-1968": [
    "cultural-revolution-impact"
  ],
  "tangshan-usgs": [
    "tangshan-reconstruction-record",
    "usgs-earthquake-prediction"
  ],
  "wenchuan-response": [
    "wenchuan-reconstruction-plan"
  ],
  "wenchuan-memory": [
    "wenchuan-reconstruction-plan"
  ],
  "land-reform-law-1950": [
    "land-law-1950"
  ],
  "soe-reform-imf": [
    "stimulus-study"
  ],
  "housing-reform-1998": [
    "housing-1998"
  ],
  "tiananmen-victim-testimony": [
    "tiananmen-family-records"
  ],
  "tangshan-memorial": [
    "tangshan-reconstruction-record"
  ],
  "climate-ndc": [
    "climate-ndc-2035"
  ],
  "chennault-biography": [
    "chennault-air-university"
  ]
};
export const retiredSourceIds = Object.freeze(Object.keys(replacements));
export function reviseReferences(data) {
  function visit(value, context) {
    if (Array.isArray(value)) return value.map(item => visit(item, context));
    if (!value || typeof value !== 'object') return value;
    const article = value.id && value.sections ? value : context;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => {
      if (key !== 'refs') return [key, visit(item, article)];
      const refs = [...new Set(item.flatMap(id => {
        if (id === 'republic-sources' && value.person) {
          const direct = { 'qiu-jin':['qiu-jin-record'], 'song-qingling':['soong-welfare-1978'], 'lu-xun':['lu-xun-biography'], 'cai-yuanpei':['pku-cai-history'], 'chen-duxiu':['ccp-formation'], 'li-dazhao':['ccp-formation'], 'mao-zedong':['accidental-holyland'], 'zhou-enlai':['accidental-holyland','prc-chronology'] };
          if (direct[value.person]) return direct[value.person];
        }
        if (id === 'nanjing-decade' || id === 'northern-finance') {
          const year = article?.start ?? 1930;
          if (year < 1926) return ['ww1-politics'];
        }
        return Object.hasOwn(replacements, id) ? replacements[id] : [id];
      }))];
      if (!refs.length) throw new Error('An article needs a direct source: ' + (article?.id || 'unknown'));
      return [key, refs];
    }));
  }
  return visit(data, null);
}
