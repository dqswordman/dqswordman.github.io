import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, relative, sep } from 'node:path';
import { loadContent, normalizeBasePath, escapeHtml as h } from '../src/content.mjs';
import { renderPage } from '../src/render.mjs';
import { renderMiscPage, historyRoutes } from '../src/misc-render.mjs';
import { history, validateHistory, referencesFor } from '../src/history.mjs';

export const projectRoot = new URL('../', import.meta.url);
export const outputRoot = new URL('dist/', projectRoot);
const hash = (value) => createHash('sha256').update(value).digest('hex').slice(0, 12);

export async function buildSite({ basePath = process.env.BASE_PATH || '' } = {}) {
  basePath = normalizeBasePath(basePath);
  const { profile, publications } = await loadContent(projectRoot);
  validateHistory();
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
  const graphData = JSON.stringify({
    people: history.people.map(({ id, name }) => ({ id, name })),
    events: history.events.map(({ id, title, start, end, period, actors }) => ({ id, title, start, end, period, actors })),
  });
  Object.assign(assets, { miscCss: `misc.${hash(miscCss)}.css`, miscJs: `misc.${hash(miscJs)}.js`, graphData: `history-data.${hash(graphData)}.json` });

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
    writeFile(new URL('assets/history-catalog.json', outputRoot), JSON.stringify({
      version: 1, title: '中国近代史研究 · 本次验收总目', updated: history.updated, range: '1840—2026（含1839禁烟背景；事实截点2026-10-10）',
      scope: '覆盖各阶段和主要主题的明确总目，非穷尽每个地区的全部历史事件。',
      counts: { events: history.events.length, people: history.people.length, chapters: history.chapters.length, themes: history.themes.length, sources: history.sources.length, actions: history.events.reduce((count, event) => count + event.actors.length, 0) },
      periods: history.periods,
      events: history.events.map((event) => ({ id: event.id, title: event.title, start: event.start, end: event.end, dates: event.dates, period: event.period, tags: event.tags, status: '正文、时序、人物行动、分析及引用完成', url: `${profile.url}${basePath}/misc/history/events/${event.id}/`, people: event.actors.map((actor) => actor.person), references: referencesFor(event) })),
      people: history.people.map((person) => ({ id: person.id, name: person.name, dates: person.dates, role: person.role, status: '传记及逐事件行动完成', url: `${profile.url}${basePath}/misc/history/people/${person.id}/` })),
      ...Object.fromEntries(['chapters', 'themes'].map((kind) => [kind, history[kind].map((item) => ({ id: item.id, title: item.title, status: '正文、关联事件及引用完成', url: `${profile.url}${basePath}/misc/history/${kind}/${item.id}/`, events: item.events, references: referencesFor(item) }))])),
      sources: history.sources,
      futureAdditions: ['地方与微观史个案', '更多普通群体的口述与传记', '婚姻、卫生、艺术、宗教及环境专题细分', '合法开放全文、页码、档案号及多语种互证', '有明确边界和许可的历史地图及同口径数据', '2026-10-10以后的新事实及正式年度统计'],
    }, null, 2) + '\n'),
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
  for (const route of miscRoutes) {
    const folder = new URL(route, outputRoot);
    await mkdir(folder, { recursive: true });
    await writeFile(new URL('index.html', folder), renderMiscPage({ route, profile, basePath, assets }));
  }

  const redirect = (target) =>
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wenzhang Du · Redirect</title><link rel="canonical" href="${h(profile.url + target)}"><meta http-equiv="refresh" content="0;url=${h(target)}"><script src="${basePath}/assets/redirect.js" defer></script></head><body><p>This page has moved. <a href="${h(target)}">Visit Wenzhang Du’s homepage</a>.</p></body></html>\n`;
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
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.map((url) => `<url><loc>${h(url)}</loc>${alternates}</url>`).join('')}${miscRoutes.map((route) => `<url><loc>${h(profile.url + basePath + '/' + route)}</loc><lastmod>${history.updated}</lastmod></url>`).join('')}</urlset>\n`;
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
