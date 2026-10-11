import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';
import { outputRoot, projectRoot } from './build.mjs';
import { loadContent, legacyAnchors, normalizeBasePath } from '../src/content.mjs';
import { history, localizedHistory, historyRoutes, validateHistory } from '../src/history.mjs';

const root = fileURLToPath(outputRoot);
const { profile, publications } = await loadContent(projectRoot);
const basePath = normalizeBasePath(process.env.BASE_PATH || '');
const errors = [];
validateHistory();
validateHistory(localizedHistory('en'));
const check = (condition, message) => {
  if (!condition) errors.push(message);
};
async function walk(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? walk(resolve(folder, entry.name)) : resolve(folder, entry.name),
      ),
    )
  ).flat();
}
const paths = await walk(root);
const files = new Set(paths);
const pages = new Map();
for (const path of paths.filter((path) => path.endsWith('.html'))) {
  const html = await readFile(path, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  check(new Set(ids).size === ids.length, `Duplicate IDs in ${relative(root, path)}`);
  pages.set(path, { html, ids: new Set(ids) });
}
const decode = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
let references = 0;
for (const [path, { html }] of pages) {
  const route = relative(root, path)
    .replaceAll('\\', '/')
    .replace(/index\.html$/, '');
  const url = new URL(`${basePath}/${route}`, profile.url);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const target = new URL(decode(match[1]), url);
    if (target.origin !== new URL(profile.url).origin) continue;
    if (!['http:', 'https:'].includes(target.protocol)) continue;
    references++;
    const pathname = decodeURIComponent(target.pathname).slice(basePath.length);
    const targetPath = resolve(root, `.${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`);
    check(files.has(targetPath), `Broken local link in ${relative(root, path)}: ${match[1]}`);
    if (target.hash && pages.has(targetPath))
      check(
        pages.get(targetPath).ids.has(decodeURIComponent(target.hash.slice(1))),
        `Missing anchor in ${relative(root, path)}: ${match[1]}`,
      );
  }
  for (const link of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))
    check(
      link[0].includes('rel="noopener noreferrer"'),
      `Unsafe external tab in ${relative(root, path)}`,
    );
  check(
    !/<base\b|<iframe\b|on(?:click|load|error)=/.test(html),
    `Unexpected legacy or inline runtime in ${relative(root, path)}`,
  );
}
for (const locale of ['en', 'zh']) {
  const path = resolve(root, locale === 'en' ? 'index.html' : 'zh/index.html');
  const { html, ids } = pages.get(path);
  check((html.match(/<h1\b/g) || []).length === 1, `Expected one h1 in ${locale}`);
  check((html.match(/<main\b/g) || []).length === 1, `Expected one main in ${locale}`);
  check((html.match(/<head>/g) || []).length === 1, `Invalid head structure in ${locale}`);
  check(
    html.includes(`lang="${locale === 'en' ? 'en' : 'zh-CN'}"`),
    `Missing page language: ${locale}`,
  );
  for (const id of legacyAnchors) check(ids.has(id), `Missing legacy anchor: ${locale}/#${id}`);
  for (const paper of publications)
    check(ids.has(`paper-${paper.id}`), `Missing publication ${paper.id} in ${locale}`);
  check(
    (html.match(/data-publication /g) || []).length === publications.length,
    `Publication count mismatch in ${locale}`,
  );
  const structured = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  try {
    const data = JSON.parse(structured);
    assert.equal(data.mainEntity.name, profile.name);
  } catch {
    errors.push(`Invalid structured data in ${locale}`);
  }
  check(
    /rel="canonical"/.test(html) && /hreflang="zh-CN"/.test(html),
    `Missing SEO links in ${locale}`,
  );
  check(gzipSync(html).length < 32 * 1024, `HTML transfer budget exceeded in ${locale}`);
  check(
    !/<script\b[^>]*src="https?:\/\//.test(html) &&
      !/<link\b[^>]*rel="stylesheet"[^>]*href="https?:\/\//.test(html),
    `Third-party runtime request in ${locale}`,
  );
  check(!/>\s*undefined\s*</.test(html), `Missing translated content in ${locale}`);
}
for (const locale of ['zh', 'en']) for (const originalRoute of historyRoutes()) {
  const route = `${locale === 'en' ? 'en/' : ''}${originalRoute}`;
  const page = pages.get(resolve(root, route, 'index.html'));
  check(Boolean(page), `Missing miscellany route: ${route}`);
  if (!page) continue;
  check((page.html.match(/<h1\b/g) || []).length === 1, `Expected one h1: ${route}`);
  check((page.html.match(/<main\b/g) || []).length === 1, `Expected one main: ${route}`);
  check(page.html.includes(`href="${profile.url}${basePath}/${route}"`), `Wrong canonical: ${route}`);
  const counterpart = `${locale === 'en' ? '' : 'en/'}${originalRoute}`;
  check(page.html.includes(`hreflang="${locale === 'en' ? 'zh-CN' : 'en'}" href="${profile.url}${basePath}/${counterpart}"`), `Missing language counterpart: ${route}`);
  check(page.html.includes(`<html lang="${locale === 'en' ? 'en' : 'zh-CN'}"`), `Wrong article language: ${route}`);
  check(!page.html.includes('undefined'), `Missing history data: ${route}`);
  check(!/<script\b[^>]*src="https?:\/\//.test(page.html), `Third-party initial runtime: ${route}`);
  if (/\/(events|people|chapters|themes|full)\/.+\/$/.test(route)) check(page.ids.has('references'), `Missing article sources: ${route}`);
}
for (const path of paths.filter((path) => /\.(css|js)$/.test(path))) {
  const content = await readFile(path, 'utf8');
  check(
    !/jQuery|jquery|Stickyfill|Magnific|MathJax|RayeRen|Minimal Mistakes/.test(content),
    `Legacy dependency in ${relative(root, path)}`,
  );
  const budget = path.endsWith('.css') ? 12 * 1024 : 6 * 1024;
  check(
    gzipSync(content).length < budget,
    `Asset transfer budget exceeded: ${relative(root, path)}`,
  );
  for (const match of content.matchAll(/(?:import .*? from |import\s*)['"](\.\/[^'"]+)['"]/g))
    check(
      files.has(resolve(path, '..', match[1])),
      `Broken JavaScript import in ${relative(root, path)}`,
    );
}
const manifest = JSON.parse(await readFile(resolve(root, 'site.webmanifest'), 'utf8'));
check(
  manifest.name.includes(profile.name) && manifest.start_url === `${basePath}/`,
  'Invalid web manifest identity or start URL',
);
for (const icon of manifest.icons)
  check(
    files.has(resolve(root, `.${icon.src.slice(basePath.length)}`)),
    `Missing manifest icon: ${icon.src}`,
  );
check(files.has(resolve(root, '.nojekyll')), 'Missing .nojekyll');
const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
check(sitemap.includes(`${profile.url}${basePath}/zh/`), 'Chinese page missing from sitemap');
check(!sitemap.includes('404.html'), '404 should not be indexed');
for (const locale of ['zh', 'en']) for (const route of historyRoutes()) check(sitemap.includes(`${profile.url}${basePath}/${locale === 'en' ? 'en/' : ''}${route}`), `Miscellany page missing from sitemap: ${locale}/${route}`);
const pngSignature = '89504e470d0a1a0a';
for (const name of ['assets/social-card.png', 'assets/apple-touch-icon.png']) {
  const path = resolve(root, name);
  if (files.has(path))
    check(
      (await readFile(path)).subarray(0, 8).toString('hex') === pngSignature,
      `Invalid PNG: ${name}`,
    );
}
const bytes = (await Promise.all(paths.map((path) => stat(path)))).reduce(
  (sum, info) => sum + info.size,
  0,
);
if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Checked ${pages.size} HTML pages, ${references} local references, ${publications.length} papers, metadata, legacy URLs, icons, and transfer budgets. Total build: ${(bytes / 1024).toFixed(1)} KiB.`,
  );
