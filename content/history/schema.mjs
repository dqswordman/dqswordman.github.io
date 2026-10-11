// Historical prose is authored here, independently of the rendering layer.
export const section = (title, body, refs) => ({
  title,
  paragraphs: body.split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean),
  refs,
});

export const actor = (person, stance, action, result, refs) => ({ person, stance, action, result, refs });
export const point = (date, label) => ({ date, label });

export const biography = (id, name, born, died, role, summary, background, career, assessment, refs, dates) => ({
  id, name, born, died, role, summary, dates: dates || `${born}—${died ?? '在世'}`,
  sections: [section('生平与形成背景', background, refs), section('主要活动与历史处境', career, refs), section('评价、责任与阅读边界', assessment, refs)],
});

export const periods = [
  { id: 'opening', title: '帝国与世界的碰撞', dates: '1839—1860', start: 1839, end: 1860 },
  { id: 'crisis', title: '内战、重建与自强', dates: '1851—1895', start: 1851, end: 1895 },
  { id: 'reform', title: '改革与帝制的终结', dates: '1895—1912', start: 1895, end: 1912 },
  { id: 'republic', title: '共和的困境与思想转型', dates: '1912—1919', start: 1912, end: 1919 },
  { id: 'revolution', title: '政党、社会动员与革命', dates: '1920—1927', start: 1920, end: 1927 },
  { id: 'state', title: '国家建设与多重危机', dates: '1928—1936', start: 1928, end: 1936 },
  { id: 'war', title: '全面抗战与社会巨变', dates: '1937—1945', start: 1937, end: 1945 },
  { id: 'transition', title: '战后重建、内战与分治', dates: '1945—1949', start: 1945, end: 1949 },
  { id: 'founding', title: '新国家与社会主义改造', dates: '1949—1956', start: 1949, end: 1956 },
  { id: 'campaigns', title: '政治运动与制度危机', dates: '1957—1976', start: 1957, end: 1976 },
  { id: 'reopening', title: '改革开放与转型探索', dates: '1976—1989', start: 1976, end: 1989 },
  { id: 'integration', title: '市场转型与全球融入', dates: '1989—2001', start: 1989, end: 2001 },
  { id: 'growth', title: '高速增长的成就与代价', dates: '2001—2012', start: 2001, end: 2012 },
  { id: 'contemporary', title: '治理变迁与当代中国', dates: '2012—2026', start: 2012, end: 2026 },
];
