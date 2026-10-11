export const normalizeHistorySearch = (text) => String(text || '').normalize('NFKC').toLocaleLowerCase('zh-CN').trim();

export function matchesHistoryRecord(record, { q = '', period = '', topic = '', year = '' } = {}) {
  const terms = normalizeHistorySearch(q).split(/\s+/).filter(Boolean);
  const searchable = normalizeHistorySearch(record.search);
  if (!terms.every((term) => searchable.includes(term))) return false;
  if (period && !String(record.period || '').split('|').includes(period)) return false;
  if (topic && !String(record.tags || '').split('|').includes(topic)) return false;
  if (year) {
    const numeric = Number(year);
    if (!Number.isInteger(numeric) || numeric < 1840 || numeric > 2026 || numeric < Number(record.start) || numeric > Number(record.end)) return false;
  }
  return true;
}
