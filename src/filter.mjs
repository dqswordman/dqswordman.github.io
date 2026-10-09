export function normalizeSearch(value) {
  return String(value).normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/g, ' ').trim();
}

export function matchesPaper(paper, { query = '', year = 'all', topic = 'all' }) {
  const tokens = normalizeSearch(query).split(' ').filter(Boolean);
  return (
    (year === 'all' || String(paper.year) === String(year)) &&
    (topic === 'all' || paper.topics.includes(topic)) &&
    tokens.every((token) => normalizeSearch(paper.search).includes(token))
  );
}

export function readFilterState(search, years, topics) {
  const params = new URLSearchParams(search);
  const year = params.get('year') || 'all';
  const topic = params.get('topic') || 'all';
  return {
    query: (params.get('q') || '').slice(0, 200),
    year: years.includes(year) ? year : 'all',
    topic: topics.includes(topic) ? topic : 'all',
  };
}

export function writeFilterState(url, state) {
  const next = new URL(url);
  for (const [key, value] of [
    ['q', state.query.trim()],
    ['year', state.year],
    ['topic', state.topic],
  ]) {
    if (!value || value === 'all') next.searchParams.delete(key);
    else next.searchParams.set(key, value);
  }
  return next;
}
