const script = document.querySelector('script[data-section-archive]');
const archiveUrl = script.dataset.sectionArchive;
const basePath = script.dataset.basePath || '';
const en = document.documentElement.lang === 'en';
const t = (zh, english) => en ? english : zh;
const storageKey = 'section-access-session';
const iterations = 600000;
const encoder = new TextEncoder(), decoder = new TextDecoder();
const originalFetch = window.fetch.bind(window);
const form = document.querySelector('[data-access-form]');
const input = form.querySelector('input');
const button = form.querySelector('button');
const status = document.querySelector('[data-access-status]');
let archive;
input.disabled = false;
button.disabled = false;

const fromBase64 = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
const toBase64 = value => btoa(String.fromCharCode(...value));
const forget = () => { try { sessionStorage.removeItem(storageKey); } catch {} };

async function loadArchive() {
  if (archive) return archive;
  const response = await originalFetch(archiveUrl, { credentials: 'same-origin' });
  if (!response.ok) throw new Error('unavailable');
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 48 || decoder.decode(bytes.slice(0, 4)) !== 'WDV1') throw new Error('unavailable');
  archive = { salt: bytes.slice(4, 20), iv: bytes.slice(20, 32), ciphertext: bytes.slice(32) };
  return archive;
}

async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, material, 256));
}

async function openArchive(raw) {
  const payload = await loadArchive();
  const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
  const compressed = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: payload.iv, additionalData: encoder.encode('section-archive:v1') }, key, payload.ciphertext);
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
  const data = JSON.parse(await new Response(stream).text());
  if (data.version !== 1 || !data.files) throw new Error('unavailable');
  return data.files;
}

function resourcePath(url) {
  const parsed = new URL(url, location.href);
  if (parsed.origin !== location.origin || (basePath && !parsed.pathname.startsWith(basePath + '/'))) return null;
  return decodeURIComponent(parsed.pathname.slice(basePath.length)).replace(/^\//, '');
}

function installTools(files) {
  const lock = document.createElement('button');
  lock.type = 'button';
  lock.textContent = t('锁定', 'Lock');
  lock.dataset.accessLock = '';
  lock.style.cssText = 'position:fixed;left:18px;bottom:18px;z-index:50;padding:10px 16px;border:1px solid #9baaa1;border-radius:24px;background:#f8f7f3;color:#17332e;font:13px Arial,sans-serif;cursor:pointer;box-shadow:0 2px 14px #17332e12';
  lock.addEventListener('click', () => { forget(); location.reload(); });
  document.body.append(lock);
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    try {
      const session = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (session?.archive === archiveUrl && session.key) return;
    } catch {}
    location.reload();
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const path = resourcePath(link.href), file = path && files[path];
    if (!file || file.type !== 'application/json') return;
    event.preventDefault();
    const url = URL.createObjectURL(new Blob([file.body], { type: file.type }));
    const download = document.createElement('a');
    download.href = url; download.download = path.split('/').at(-1); download.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

function show(files) {
  let path = resourcePath(location.href);
  if (path?.endsWith('/')) path += 'index.html';
  const page = path && files[path];
  if (!page || page.type !== 'text/html') throw new Error('unavailable');
  window.fetch = async (resource, options) => {
    const url = resource instanceof Request ? resource.url : String(resource);
    const path = resourcePath(url), file = path && files[path];
    if (file && (!options?.method || options.method === 'GET') && (!(resource instanceof Request) || resource.method === 'GET')) {
      return new Response(file.body, { status: 200, headers: { 'Content-Type': file.type, 'Cache-Control': 'no-store' } });
    }
    return originalFetch(resource, options);
  };
  document.open();
  document.write(page.body);
  document.close();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => installTools(files), { once: true });
  else installTools(files);
}

function busy(active) {
  button.disabled = active;
  button.textContent = active ? t('正在打开…', 'Opening…') : t('进入', 'Enter');
  form.setAttribute('aria-busy', String(active));
}

async function unlock(password) {
  if (!crypto.subtle || typeof DecompressionStream === 'undefined') throw new Error('unsupported');
  const payload = await loadArchive();
  const raw = await deriveKey(password, payload.salt);
  const files = await openArchive(raw);
  try { sessionStorage.setItem(storageKey, JSON.stringify({ archive: archiveUrl, key: toBase64(raw) })); } catch {}
  input.value = '';
  show(files);
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (button.disabled || !input.value) return;
  status.textContent = '';
  busy(true);
  try { await unlock(input.value); }
  catch (error) {
    forget();
    status.textContent = error.name === 'OperationError' ? t('密码不正确，请重试。', 'Incorrect password. Please try again.') : error.message === 'unsupported' ? t('请使用较新的浏览器打开此页面。', 'Please use a recent browser to open this page.') : t('暂时无法打开，请稍后重试。', 'Unable to open this page. Please try again.');
    input.value = ''; input.focus();
    busy(false);
  }
});

try {
  const session = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
  if (session?.archive === archiveUrl && typeof session.key === 'string') {
    busy(true);
    const files = await openArchive(fromBase64(session.key));
    show(files);
  }
} catch { forget(); busy(false); }
