import { readFile } from 'node:fs/promises';

export const supportedLocales = ['en', 'zh'];
export const topicKeys = ['evaluation', 'earth', 'efficient', 'applied'];
export const publicationGroups = ['major', 'ei'];
// WSDM Findings acceptance date, in the site's acceptance time zone.
const researchResourcesFrom = '2026-11-03';
export const legacyAnchors = [
  'about-me',
  'news',
  'research-profile',
  'publications',
  'honors-and-awards',
  'education',
  'internships',
  'skills',
];

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
}

export function safeHttps(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password)
    throw new Error(`Expected a public HTTPS URL: ${value}`);
  return url.href;
}

function validateGitHubRepository(value) {
  const url = new URL(safeHttps(value));
  if (
    url.host !== 'github.com' ||
    !/^\/[\w.-]+\/[\w.-]+\/?$/.test(url.pathname) ||
    url.search ||
    url.hash
  )
    throw new Error(`Expected a GitHub repository URL: ${value}`);
}

const hasText = (value) => typeof value === 'string' && Boolean(value.trim());
const isBilingual = (value) => supportedLocales.every((locale) => hasText(value?.[locale]));

function validateReport(report, id) {
  for (const locale of supportedLocales) {
    const copy = report.locales?.[locale];
    if (
      !hasText(copy?.summary) ||
      !Array.isArray(copy.sections) ||
      !copy.sections.length ||
      !copy.sections.every((section) =>
        hasText(section?.title) &&
        Array.isArray(section.paragraphs) &&
        section.paragraphs.length &&
        section.paragraphs.every(hasText),
      )
    )
      throw new Error(`Incomplete ${locale} technical report: ${id}`);
  }
  if (
    report.metrics !== undefined &&
    (!Array.isArray(report.metrics) ||
      !report.metrics.every((metric) => hasText(metric?.value) && isBilingual(metric.label)))
  )
    throw new Error(`Invalid technical report metrics: ${id}`);
  if (report.sources !== undefined) {
    if (!Array.isArray(report.sources) || !report.sources.every((source) => isBilingual(source?.label)))
      throw new Error(`Invalid technical report sources: ${id}`);
    for (const source of report.sources) safeHttps(source.url);
  }
}

// A news date can have year, month, or day precision; retain the precision supplied.
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(value)) return false;
  const normalized = value.length === 4 ? `${value}-01-01` : value.length === 7 ? `${value}-01` : value;
  const date = new Date(`${normalized}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === normalized;
}

export function acceptanceYear(paper) {
  return paper.acceptedDate ? Number(paper.acceptedDate.slice(0, 4)) : 'undated';
}

export function newsItems(profile, publications) {
  const acceptances = publications.filter(paper => paper.acceptedDate).map(paper => ({
    id: `accepted-${paper.id}`,
    date: paper.acceptedDate,
    kind: 'acceptance',
    publication: paper.id,
  }));
  return [...acceptances, ...profile.news].sort((a, b) => b.date.localeCompare(a.date));
}

export function validateContent(profile, publications) {
  for (const key of ['url', 'github', 'scholar']) safeHttps(profile[key]);
  if (profile.url !== new URL(profile.url).origin)
    throw new Error('profile.url must be the site origin; use BASE_PATH for a subdirectory.');
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(profile.email))
    throw new Error('Invalid contact email');
  if (!/^\d{4}-\d{2}$/.test(profile.updated))
    throw new Error('Use YYYY-MM for the profile update date');
  if (profile.visitorStats && typeof profile.visitorStats.enabled !== 'boolean')
    throw new Error('visitorStats.enabled must be a boolean');
  if (!Array.isArray(publications) || !publications.length)
    throw new Error('Publications must not be empty');
  const ids = new Set();
  for (const paper of publications) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(paper.id) || ids.has(paper.id))
      throw new Error(`Invalid or duplicate publication ID: ${paper.id}`);
    ids.add(paper.id);
    for (const key of ['title', 'venue'])
      if (typeof paper[key] !== 'string' || !paper[key].trim())
        throw new Error(`Missing ${key}: ${paper.id}`);
    if (!Number.isInteger(paper.year) || paper.year < 1900 || paper.year > 2200)
      throw new Error(`Invalid year: ${paper.id}`);
    if (!publicationGroups.includes(paper.group))
      throw new Error(`Invalid publication group: ${paper.id}`);
    if (
      !paper.authors?.length ||
      paper.authors.some((author) => typeof author !== 'string' || !author.trim())
    )
      throw new Error(`Missing authors: ${paper.id}`);
    if (!paper.topics?.length || paper.topics.some((topic) => !topicKeys.includes(topic)))
      throw new Error(`Invalid topics: ${paper.id}`);
    if (paper.scholarUrl) safeHttps(paper.scholarUrl);
    if (paper.status && !['accepted', 'published'].includes(paper.status))
      throw new Error(`Invalid publication status: ${paper.id}`);
    if (paper.affiliation && typeof paper.affiliation !== 'string')
      throw new Error(`Invalid affiliation: ${paper.id}`);
    if (paper.acceptedDate && (!/^\d{4}-\d{2}-\d{2}$/.test(paper.acceptedDate) || !validDate(paper.acceptedDate)))
      throw new Error(`Invalid acceptance date: ${paper.id}`);
    if (paper.track !== undefined && !hasText(paper.track))
      throw new Error(`Invalid publication track: ${paper.id}`);
    if (
      (paper.id === 'decision-sufficiency' || (paper.acceptedDate ?? '') >= researchResourcesFrom) &&
      (!paper.technicalReport || !paper.codeUrl)
    )
      throw new Error(`Technical report and GitHub repository required: ${paper.id}`);
    if (paper.codeUrl) validateGitHubRepository(paper.codeUrl);
    if (paper.technicalReport) validateReport(paper.technicalReport, paper.id);
  }
  for (const id of profile.featured)
    if (!ids.has(id)) throw new Error(`Featured publication does not exist: ${id}`);
  for (const project of profile.openSource ?? []) {
    if (!hasText(project.name) || !isBilingual(project.description))
      throw new Error('Incomplete open-source project');
    validateGitHubRepository(project.url);
  }
  const newsIds = new Set();
  if (!Array.isArray(profile.news)) throw new Error('News must be an array');
  for (const item of profile.news) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || newsIds.has(item.id))
      throw new Error(`Invalid or duplicate news ID: ${item.id}`);
    newsIds.add(item.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !validDate(item.date)) throw new Error(`Invalid news date: ${item.id}`);
    if (!['award', 'update'].includes(item.kind))
      throw new Error(`Invalid news kind: ${item.id}`);
    if (item.publication && !ids.has(item.publication))
      throw new Error(`News publication does not exist: ${item.id}`);
    if (!item.publication && supportedLocales.some(locale => !item.title?.[locale] || !item.text?.[locale]))
      throw new Error(`Incomplete bilingual news: ${item.id}`);
  }
  for (const locale of supportedLocales) {
    const copy = profile.locales[locale];
    if (
      !copy?.description ||
      !copy.aboutParagraphs?.length ||
      !copy.research?.length ||
      !copy.awards?.length ||
      !copy.skills?.length
    )
      throw new Error(`Incomplete ${locale} content`);
  }
  return { profile, publications };
}

export async function loadContent(root) {
  const [profile, publications] = await Promise.all(
    ['profile', 'publications'].map(async (name) =>
      JSON.parse(await readFile(new URL(`content/${name}.json`, root), 'utf8')),
    ),
  );
  return validateContent(profile, publications);
}

export function normalizeBasePath(value = '') {
  if (!value || value === '/') return '';
  const normalized = `/${value.replace(/^\/+|\/+$/g, '')}`;
  if (!/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+$/.test(normalized))
    throw new Error('BASE_PATH must be a plain URL path such as /homepage');
  return normalized;
}

export function technicalReportPath(id, locale, basePath = '') {
  return `${basePath}/${locale === 'zh' ? 'zh/' : ''}technical-reports/${id}/`;
}

export function paperUrl(paper) {
  return paper.scholarUrl
    ? safeHttps(paper.scholarUrl)
    : `https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(`"${paper.title}"`)}`;
}

export function citation(paper) {
  return `${paper.authors.join(', ')}. ${paper.title}. ${paper.venue} ${paper.year}.${paper.status === 'accepted' ? ' Accepted; forthcoming.' : ''}`;
}
