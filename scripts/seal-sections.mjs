import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash, randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizeBasePath, escapeHtml as h } from '../src/content.mjs';

const iterations = 600000;
const purpose = Buffer.from('section-archive:v1');
const digest = bytes => createHash('sha256').update(bytes).digest('hex').slice(0, 16);
export const protectedFile = path => /^(?:en\/)?misc\//.test(path) || /^assets\/history-(?:catalog(?:\.en)?|data\.[a-f0-9]+)\.json$/.test(path);

export function sealArchive(files, password) {
  if (typeof password !== 'string' || !password.length) throw new Error('Section access configuration is unavailable.');
  const salt = randomBytes(16), iv = randomBytes(12);
  const key = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(purpose);
  const body = gzipSync(JSON.stringify({ version: 1, files }));
  return Buffer.concat([Buffer.from('WDV1'), salt, iv, cipher.update(body), cipher.final(), cipher.getAuthTag()]);
}

export function openArchive(bytes, password) {
  if (bytes.subarray(0, 4).toString() !== 'WDV1' || bytes.length < 48) throw new Error('Invalid section archive.');
  const key = pbkdf2Sync(password, bytes.subarray(4, 20), iterations, 32, 'sha256');
  const decipher = createDecipheriv('aes-256-gcm', key, bytes.subarray(20, 32));
  decipher.setAAD(purpose);
  decipher.setAuthTag(bytes.subarray(-16));
  return JSON.parse(gunzipSync(Buffer.concat([decipher.update(bytes.subarray(32, -16)), decipher.final()])).toString('utf8'));
}

function gate({ en, basePath, path, archive, script, style }) {
  const t = (zh, english) => en ? english : zh;
  const home = `${basePath}/${en ? '' : 'zh/'}`;
  const alternate = `${basePath}/${en ? path.replace(/^en\//, '') : 'en/' + path.replace(/^en\//, '')}`.replace(/index\.html$/, '');
  return `<!doctype html><html lang="${en ? 'en' : 'zh-CN'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="same-origin"><title>${t('暂未开放', 'Restricted access')} · Wenzhang Du</title><link rel="icon" href="${basePath}/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${basePath}/assets/${style}"><script type="module" src="${basePath}/assets/${script}" data-section-archive="${basePath}/assets/${archive}" data-base-path="${h(basePath)}"></script></head><body><header><a class="brand" href="${home}">Wenzhang Du</a><a class="language" href="${h(alternate)}" lang="${en ? 'zh-CN' : 'en'}">${en ? '中文' : 'English'}</a></header><main><p class="eyebrow">A QUIET CORNER</p><div class="mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div><h1>${t('这里，暂未开放。', 'A little space, on pause.')}</h1><p class="lead">${t('此区域暂时限制访问。输入访问密码后可以继续阅读。', 'This area is temporarily restricted. Enter the access password to continue reading.')}</p><form data-access-form method="post"><label for="access-password">${t('访问密码', 'Access password')}</label><input id="access-password" name="password" type="password" disabled autocomplete="current-password" maxlength="128" required aria-describedby="access-status"><button type="submit" disabled>${t('进入', 'Enter')}</button><p id="access-status" class="status" data-access-status role="status" aria-live="polite"></p></form><noscript><p>${t('请输入密码前，请启用 JavaScript。', 'Enable JavaScript to enter the access password.')}</p></noscript><a class="return" href="${home}">${t('← 返回主页', '← Return home')}</a></main><footer><span>Wenzhang Du</span><span>${t('研究之外，保持好奇。', 'Curiosity beyond research.')}</span></footer></body></html>\n`;
}

export async function sealSections({ root = new URL('../dist/', import.meta.url), password = process.env.MISC_ACCESS_PASSWORD, basePath = process.env.BASE_PATH || '' } = {}) {
  if (typeof password !== 'string' || !password.length) throw new Error('Section access configuration is unavailable.');
  basePath = normalizeBasePath(basePath);
  const files = {};
  async function walk(folder, prefix = '') {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = prefix + entry.name;
      if (entry.isDirectory()) await walk(new URL(entry.name + '/', folder), path + '/');
      else if (protectedFile(path)) {
        let body = await readFile(new URL(entry.name, folder), 'utf8');
        if (path.endsWith('.html')) {
          if (body.includes('data-section-archive=')) throw new Error('Sections have already been sealed.');
          body = body.replace(/<meta\b[^>]*name="robots"[^>]*>/gi, '').replace('</head>', '<meta name="robots" content="noindex,nofollow,noarchive"></head>');
        }
        files[path] = { type: path.endsWith('.html') ? 'text/html' : 'application/json', body };
      }
    }
  }
  await walk(root);
  if (!files['misc/index.html'] || !files['en/misc/index.html']) throw new Error('Section entry pages are unavailable.');
  const bytes = sealArchive(files, password);
  const archive = `section.${digest(bytes)}.bin`;
  const js = await readFile(new URL('../src/access.js', import.meta.url));
  const css = await readFile(new URL('../src/access.css', import.meta.url));
  const script = `access.${digest(js)}.js`, style = `access.${digest(css)}.css`;
  await writeFile(new URL(`assets/${archive}`, root), bytes);
  await writeFile(new URL(`assets/${script}`, root), js);
  await writeFile(new URL(`assets/${style}`, root), css);
  for (const [path, file] of Object.entries(files)) {
    const body = file.type === 'text/html' ? gate({ en: path.startsWith('en/'), basePath, path, archive, script, style }) : JSON.stringify({ restricted: true });
    await writeFile(new URL(path, root), body);
  }
  const sitemap = await readFile(new URL('sitemap.xml', root), 'utf8');
  await writeFile(new URL('sitemap.xml', root), sitemap.replace(/<url>[\s\S]*?<\/url>/g, entry => /\/misc\//.test(entry) ? '' : entry));
  await writeFile(new URL('robots.txt', root), `User-agent: *\nAllow: /\nDisallow: ${basePath}/misc/\nDisallow: ${basePath}/en/misc/\nDisallow: ${basePath}/assets/history-\nSitemap: https://dqswordman.github.io${basePath}/sitemap.xml\n`);
  console.log(`Prepared ${Object.keys(files).length} restricted section files.`);
  return { files: Object.keys(files).length, archive, script, style };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await sealSections();
