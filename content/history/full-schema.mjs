import { section } from './schema.mjs';

// Both editions are authored together; a missing language is a build error.
export const d = (zh, en, bodyZh, bodyEn, refs) => ({ zh: section(zh, bodyZh, refs), en: section(en, bodyEn, refs) });
export const study = (id, part, dates, titleZh, titleEn, summaryZh, summaryEn, events, sections) => ({
  id, part, dates, title: { zh: titleZh, en: titleEn }, summary: { zh: summaryZh, en: summaryEn }, events, sections,
});
