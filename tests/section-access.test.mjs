import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { sealArchive, openArchive, sealSections, protectedFile } from '../scripts/seal-sections.mjs';
import { renderPage } from '../src/render.mjs';
import { loadContent } from '../src/content.mjs';

const fixturePassword = 'fixture-' + randomBytes(18).toString('hex');

test('section archives round-trip authenticated content and reject wrong keys or changed ciphertext', () => {
  const files = { 'misc/index.html': { type: 'text/html', body: '<h1>Private fixture 正文</h1>' } };
  const bytes = sealArchive(files, fixturePassword);
  assert.deepEqual(openArchive(bytes, fixturePassword), { version: 1, files });
  assert.ok(!bytes.includes(Buffer.from(files['misc/index.html'].body)));
  assert.throws(() => openArchive(bytes, 'another-fixture-key'));
  const changed = Buffer.from(bytes);
  changed[changed.length - 20] ^= 1;
  assert.throws(() => openArchive(changed, fixturePassword));
  assert.notDeepEqual(sealArchive(files, fixturePassword), bytes);
  assert.throws(() => sealArchive(files, ''), /configuration is unavailable/);
});

test('published sections, deep links, data and sitemap are restricted with base-path support', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'section-access-'));
  const root = pathToFileURL(folder + '/');
  try {
    const originals = {
      'misc/index.html': '<html><head></head><body><h1>PRIVATE HUB</h1></body></html>',
      'en/misc/index.html': '<html><head></head><body><h1>PRIVATE EN HUB</h1></body></html>',
      'misc/history/full/example/index.html': '<html><head></head><body><h1>PRIVATE CHAPTER</h1></body></html>',
      'assets/history-catalog.json': '{"private":"PRIVATE CATALOG"}',
      'assets/history-data.0123abcdef.json': '{"private":"PRIVATE GRAPH"}',
    };
    for (const [file, body] of Object.entries(originals)) {
      await mkdir(new URL('.', new URL(file, root)), { recursive: true });
      await writeFile(new URL(file, root), body);
    }
    await writeFile(new URL('sitemap.xml', root), '<urlset><url><loc>https://example.com/preview/</loc></url><url><loc>https://example.com/preview/misc/history/</loc></url><url><loc>https://example.com/preview/en/misc/</loc></url></urlset>');
    await assert.rejects(sealSections({ root, password: '' }), /configuration is unavailable/);
    assert.equal(await readFile(new URL('misc/index.html', root), 'utf8'), originals['misc/index.html']);
    const result = await sealSections({ root, password: fixturePassword, basePath: '/preview' });
    assert.equal(result.files, Object.keys(originals).length);
    for (const [file, original] of Object.entries(originals)) {
      const published = await readFile(new URL(file, root), 'utf8');
      assert.ok(!published.includes('PRIVATE'), file);
      assert.ok(!published.includes(fixturePassword), file);
      if (file.endsWith('.html')) {
        assert.match(published, /noindex,nofollow,noarchive/);
        assert.match(published, /data-section-archive="\/preview\/assets\/section\./);
        assert.match(published, /type="password"/);
      } else assert.deepEqual(JSON.parse(published), { restricted: true });
      assert.notEqual(published, original);
    }
    const archive = openArchive(await readFile(new URL('assets/' + result.archive, root)), fixturePassword);
    assert.equal(archive.files['assets/history-catalog.json'].body, originals['assets/history-catalog.json']);
    assert.match(archive.files['misc/history/full/example/index.html'].body, /PRIVATE CHAPTER/);
    const sitemap = await readFile(new URL('sitemap.xml', root), 'utf8');
    assert.ok(!sitemap.includes('/misc/'));
    assert.ok(sitemap.includes('https://example.com/preview/'));
    assert.match(await readFile(new URL('robots.txt', root), 'utf8'), /Disallow: \/preview\/en\/misc\//);
    await assert.rejects(sealSections({ root, password: fixturePassword }), /already been sealed/);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});

test('public home navigation omits the paused section and protection covers both locales and exported data', async () => {
  const { profile, publications } = await loadContent(new URL('../', import.meta.url));
  for (const locale of ['zh', 'en']) {
    const html = renderPage({ profile, publications, locale, assets: { css:'site.css',js:'site.js',experienceCss:'experience.css' } });
    assert.ok(!/<a\b[^>]*href="(?:\/en)?\/misc\//.test(html));
    assert.match(html, /PAIRSAFE/);
  }
  for (const file of ['misc/index.html', 'en/misc/history/full/test/index.html', 'assets/history-catalog.en.json', 'assets/history-data.abcdef.json']) assert.ok(protectedFile(file), file);
  for (const file of ['index.html', 'zh/index.html', 'assets/site.js', 'assets/favicon.svg']) assert.ok(!protectedFile(file), file);
});
