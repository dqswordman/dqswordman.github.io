import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, relative, sep } from 'node:path';
import { loadContent, normalizeBasePath, escapeHtml as h } from '../src/content.mjs';
import { renderPage } from '../src/render.mjs';
import { renderMiscPage, historyRoutes } from '../src/misc-render.mjs';
import { history, localizedHistory, validateHistory, referencesFor, studiesForEvent, historyCensus } from '../src/history.mjs';

export const projectRoot = new URL('../', import.meta.url);
export const outputRoot = new URL('dist/', projectRoot);
const hash = (value) => createHash('sha256').update(value).digest('hex').slice(0, 12);

export async function buildSite({ basePath = process.env.BASE_PATH || '' } = {}) {
  basePath = normalizeBasePath(basePath);
  const { profile, publications } = await loadContent(projectRoot);
  validateHistory();
  validateHistory(localizedHistory('en'));
  if (historyCensus().hanCharacters < 200_000) throw new Error('The Full edition requires at least 200,000 unique Chinese narrative characters.');
  const [css, originalJs, filter, visitors] = await Promise.all(
    ['styles.css', 'client.js', 'filter.mjs', 'visitors.mjs'].map((name) =>
      readFile(new URL(`src/${name}`, projectRoot), 'utf8'),
    ),
  );
  const filterName = `filter.${hash(filter)}.js`;
  const visitorsName = `visitors.${hash(visitors)}.js`;
  const js = originalJs
    .replace("'./filter.mjs'", `'./${filterName}'`)
    .replace("'./visitors.mjs'", `'./${visitorsName}'`);
  const assets = { css: `site.${hash(css)}.css`, js: `site.${hash(js)}.js` };
  const [miscCss, originalMiscJs, graph, search] = await Promise.all(
    ['misc.css', 'misc-client.js', 'history-graph.mjs', 'history-search.mjs'].map((name) => readFile(new URL(`src/${name}`, projectRoot), 'utf8')),
  );
  const graphName = `history-graph.${hash(graph)}.js`;
  const searchName = `history-search.${hash(search)}.js`;
  const miscJs = originalMiscJs.replace("'./visitors.mjs'", `'./${visitorsName}'`).replace("'./history-graph.mjs'", `'./${graphName}'`).replace("'./history-search.mjs'", `'./${searchName}'`);
  // Only the graph page fetches this data. Article bodies stay in static HTML.
  const graphFor = locale => {
    const data = localizedHistory(locale);
    return JSON.stringify({ locale, people: data.people.map(({ id, name }) => ({ id, name })), events: data.events.map(({ id, title, start, end, period, actors }) => ({ id, title, start, end, period, actors })) });
  };
  const graphData = graphFor('zh'), graphDataEn = graphFor('en');
  Object.assign(assets, { miscCss: `misc.${hash(miscCss)}.css`, miscJs: `misc.${hash(miscJs)}.js`, graphData: `history-data.${hash(graphData)}.json`, graphDataEn: `history-data.${hash(graphDataEn)}.json` });
  const catalogFor = locale => {
    const data = localizedHistory(locale), prefix = `${profile.url}${basePath}/${locale === 'en' ? 'en/' : ''}misc/history/`;
    const urls = (kind, id) => Object.fromEntries(['zh', 'en'].map(l => [l, `${profile.url}${basePath}/${l === 'en' ? 'en/' : ''}misc/history/${kind}/${id}/`]));
    return {
      version: 3, edition: 'Full', narrativeCensus: historyCensus(data), locale, title: locale === 'en' ? 'Modern Chinese history: edition catalog' : '中国近代史研究 · 双语版本总目', updated: data.updated, cutoff: data.cutoff,
      range: `1840–2026 (1839 background; ${data.cutoff})`, scope: locale === 'en' ? 'A defined catalog across periods and major themes, not an exhaustive record of every local event.' : '覆盖各阶段与主要主题的明确总目，非穷尽全部地方事件。',
      counts: { events: data.events.length, people: data.people.length, chapters: data.chapters.length, themes: data.themes.length, fullChapters: data.studies.length, fullSections: data.studies.reduce((n, s) => n + s.sections.length, 0), sources: data.sources.length, actions: data.events.reduce((n, e) => n + e.actors.length, 0) },
      periods: data.periods,
      events: data.events.map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end, dates: e.dates, period: e.period, tags: e.tags, status: 'complete', url: `${prefix}events/${e.id}/`, urls: urls('events', e.id), people: e.actors.map(a => a.person), references: referencesFor(e), fullChapters: studiesForEvent(e.id, data).map(s => s.id), summary: e.summary, sections: e.sections })),
      people: data.people.map(p => ({ id: p.id, name: p.name, dates: p.dates, role: p.role, status: 'complete', url: `${prefix}people/${p.id}/`, urls: urls('people', p.id), summary: p.summary, sections: p.sections })),
      ...Object.fromEntries(['chapters', 'themes', 'studies'].map(kind => [kind, data[kind].map(s => ({ id: s.id, title: s.title, part: s.part, dates: s.dates, summary: s.summary, status: 'complete', edition: 'Full', url: `${prefix}${kind === 'studies' ? 'full' : kind}/${s.id}/`, urls: urls(kind === 'studies' ? 'full' : kind, s.id), events: s.events, references: referencesFor(s), sections: s.sections, ...(s.figure ? { figure: s.figure } : {}) }))])),
      sources: data.sources,
      futureAdditions: locale === 'en' ? ['Local and community microhistories beyond the declared catalog', 'Additional provincial and county-level campaign studies', 'More non-elite biographies and oral histories', 'Page-specific citations and archival identifiers where full texts are accessible', 'Historical images with verified authorship and permissions, and comparable data', 'Events after the evidence cutoff'] : ['公开总目之外的地方与社区微观史', '更多省县层面的政治运动专案', '更多普通人物与口述', '取得全文后补充精确页码及档案编号', '核实作者和许可的历史图像及同口径数据', '事实截点之后的新内容'],
    };
  };

  // This is the only directory cleaned by the build. Its location is fixed,
  // verified, and never taken from environment variables or command-line input.
  const root = fileURLToPath(projectRoot);
  const output = fileURLToPath(outputRoot);
  if (relative(root, output) !== `dist${sep}` && relative(root, output) !== 'dist')
    throw new Error('Refusing to clean an unexpected build directory');
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(new URL('assets/', outputRoot), { recursive: true });
  await cp(new URL('public/', projectRoot), outputRoot, { recursive: true });
  await Promise.all([
    writeFile(new URL(`assets/${assets.css}`, outputRoot), css),
    writeFile(new URL(`assets/${assets.js}`, outputRoot), js),
    writeFile(new URL(`assets/${filterName}`, outputRoot), filter),
    writeFile(new URL(`assets/${visitorsName}`, outputRoot), visitors),
    writeFile(new URL(`assets/${assets.miscCss}`, outputRoot), miscCss),
    writeFile(new URL(`assets/${assets.miscJs}`, outputRoot), miscJs),
    writeFile(new URL(`assets/${graphName}`, outputRoot), graph),
    writeFile(new URL(`assets/${searchName}`, outputRoot), search),
    writeFile(new URL(`assets/${assets.graphData}`, outputRoot), graphData),
    writeFile(new URL(`assets/${assets.graphDataEn}`, outputRoot), graphDataEn),
    writeFile(new URL('assets/history-catalog.json', outputRoot), JSON.stringify(catalogFor('zh'), null, 2)),
    writeFile(new URL('assets/history-catalog.en.json', outputRoot), JSON.stringify(catalogFor('en'), null, 2)),
  ]);

  for (const locale of ['en', 'zh']) {
    const folder = locale === 'en' ? outputRoot : new URL('zh/', outputRoot);
    await mkdir(folder, { recursive: true });
    await writeFile(
      new URL('index.html', folder),
      renderPage({ profile, publications, locale, basePath, assets }),
    );
  }
  await writeFile(
    new URL('404.html', outputRoot),
    renderPage({ profile, publications, basePath, assets, notFound: true }),
  );
  const miscRoutes = historyRoutes();
  for (const locale of ['zh', 'en']) for (const route of miscRoutes) {
    const folder = new URL(`${locale === 'en' ? 'en/' : ''}${route}`, outputRoot);
    await mkdir(folder, { recursive: true });
    const localizedAssets = { ...assets, graphData: locale === 'en' ? assets.graphDataEn : assets.graphData };
    await writeFile(new URL('index.html', folder), renderMiscPage({ route, profile, basePath, assets: localizedAssets, locale }));
  }

  const redirect = (target, label = 'Visit Wenzhang Du’s homepage', lang = 'en') =>
    `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wenzhang Du · Redirect</title><link rel="canonical" href="${h(profile.url + target)}"><meta http-equiv="refresh" content="0;url=${h(target)}"><script src="${basePath}/assets/redirect.js" defer></script></head><body><p>${lang === 'zh-CN' ? '此入口已迁移。' : 'This page has moved.'} <a href="${h(target)}">${h(label)}</a>.</p></body></html>\n`;
  for (const locale of ['zh', 'en']) {
    const destination = new URL((locale === 'en' ? 'en/' : '') + 'misc/history/lite/', outputRoot);
    await mkdir(destination, { recursive: true });
    await writeFile(new URL('index.html', destination), redirect(basePath + '/' + (locale === 'en' ? 'en/' : '') + 'misc/history/full/', locale === 'en' ? 'Read the Full history edition' : '阅读中国近代史 Full 全文', locale === 'en' ? 'en' : 'zh-CN'));
  }
  for (const folder of ['about', 'zh/about']) {
    const destination = new URL(`${folder}/`, outputRoot);
    await mkdir(destination, { recursive: true });
    await writeFile(
      new URL('index.html', destination),
      redirect(`${basePath}/${folder.startsWith('zh/') ? 'zh/' : ''}`),
    );
  }
  await writeFile(new URL('about.html', outputRoot), redirect(`${basePath}/`));
  await writeFile(new URL('zh/about.html', outputRoot), redirect(`${basePath}/zh/`));
  await writeFile(
    new URL('assets/redirect.js', outputRoot),
    "const target = new URL(document.querySelector('link[rel=canonical]').href); target.search = location.search; target.hash = location.hash; location.replace(target.pathname + target.search + target.hash);\n",
  );
  const urls = [`${profile.url}${basePath}/`, `${profile.url}${basePath}/zh/`];
  const alternates = `<xhtml:link rel="alternate" hreflang="en" href="${h(urls[0])}"/><xhtml:link rel="alternate" hreflang="zh-CN" href="${h(urls[1])}"/>`;
  const miscSitemap = miscRoutes.map(route => {
    const pair = ['zh-CN', 'en'].map(locale => [locale, `${profile.url}${basePath}/${locale === 'en' ? 'en/' : ''}${route}`]);
    const links = pair.map(([locale, url]) => `<xhtml:link rel="alternate" hreflang="${locale}" href="${h(url)}"/>`).join('');
    return pair.map(([, url]) => `<url><loc>${h(url)}</loc><lastmod>${history.updated}</lastmod>${links}</url>`).join('');
  }).join('');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.map((url) => `<url><loc>${h(url)}</loc>${alternates}</url>`).join('')}${miscSitemap}</urlset>\n`;
  await writeFile(new URL('sitemap.xml', outputRoot), sitemap);
  await writeFile(
    new URL('robots.txt', outputRoot),
    `User-agent: *\nAllow: /\nSitemap: ${profile.url}${basePath}/sitemap.xml\n`,
  );
  await writeFile(new URL('.nojekyll', outputRoot), '');
  await writeFile(
    new URL('site.webmanifest', outputRoot),
    JSON.stringify(
      {
        name: 'Wenzhang Du · Research',
        short_name: 'Wenzhang Du',
        id: `${basePath}/`,
        lang: 'en',
        start_url: `${basePath}/`,
        scope: `${basePath}/`,
        display: 'browser',
        background_color: '#f8f7f3',
        theme_color: '#17332e',
        icons: [
          {
            src: `${basePath}/assets/favicon.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          { src: `${basePath}/assets/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' },
        ],
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `Built English + Chinese pages, ${publications.length} publications, ${miscRoutes.length} miscellany routes (${history.events.length} events, ${history.people.length} people) → ${output}${basePath ? ` (base path: ${basePath})` : ''}`,
  );
  return { profile, publications, assets, basePath };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await buildSite();
}
