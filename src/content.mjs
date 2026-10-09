import { readFile } from 'node:fs/promises';

export const supportedLocales = ['en', 'zh'];
export const topicKeys = ['evaluation', 'earth', 'efficient', 'applied'];
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

export function validateContent(profile, publications) {
  for (const key of ['url', 'github', 'scholar', 'universityUrl']) safeHttps(profile[key]);
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
  }
  for (const id of profile.featured)
    if (!ids.has(id)) throw new Error(`Featured publication does not exist: ${id}`);
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

export function paperUrl(paper) {
  return paper.scholarUrl
    ? safeHttps(paper.scholarUrl)
    : `https://scholar.google.com/scholar?hl=en&q=${encodeURIComponent(`"${paper.title}"`)}`;
}

export function citation(paper) {
  return `${paper.authors.join(', ')}. ${paper.title}. ${paper.venue}, ${paper.year}.${paper.status === 'accepted' ? ' Accepted; forthcoming.' : ''}`;
}
