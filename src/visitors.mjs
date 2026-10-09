// Live counts come from the provider. Previews never send counting requests.
export const visitorEndpoint = 'https://busuanzi.ibruce.info/busuanzi';

export function shouldCountVisit(href, siteOrigin) {
  try {
    const current = new URL(href);
    const site = new URL(siteOrigin);
    return current.protocol === 'https:' && current.origin === site.origin;
  } catch {
    return false;
  }
}

export function parseVisitCounts(payload) {
  const read = (value) => {
    if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value)))
      return null;
    const count = Number(value);
    return Number.isSafeInteger(count) && count >= 0 ? count : null;
  };
  const visitors = read(payload?.site_uv);
  const views = read(payload?.site_pv);
  return visitors === null || views === null ? null : { visitors, views };
}

export function initVisitorStats({
  document: doc = globalThis.document,
  window: win = globalThis.window,
  timeoutMs = 8000,
} = {}) {
  const root = doc.querySelector('[data-visitors]');
  if (!root) return;
  const status = root.querySelector('[data-visitor-status]');
  if (!shouldCountVisit(win.location.href, root.dataset.siteOrigin)) {
    root.dataset.state = 'preview';
    status.textContent = root.dataset.localLabel;
    return;
  }
  root.dataset.state = 'loading';
  status.textContent = root.dataset.loadingLabel;
  const callback = `__wdVisits_${Math.random().toString(36).slice(2)}`;
  const script = doc.createElement('script');
  const url = new URL(visitorEndpoint);
  url.searchParams.set('jsonpCallback', callback);
  script.src = url.href;
  script.async = true;
  // Site-level totals need the origin, not the search terms or section URL.
  script.referrerPolicy = 'strict-origin-when-cross-origin';
  let settled = false;
  let timeout;
  const finish = (counts) => {
    if (settled) return;
    settled = true;
    win.clearTimeout(timeout);
    script.remove();
    // A delayed JSONP response must remain harmless after a timeout.
    win[callback] = () => {};
    win.setTimeout(() => delete win[callback], 60000);
    if (!counts) {
      root.dataset.state = 'error';
      status.textContent = root.dataset.errorLabel;
      return;
    }
    const formatter = new Intl.NumberFormat(doc.documentElement.lang || 'en');
    root.querySelector('[data-visitor-count]').textContent = formatter.format(counts.visitors);
    root.querySelector('[data-view-count]').textContent = formatter.format(counts.views);
    root.dataset.state = 'ready';
    status.textContent = '';
    status.hidden = true;
  };
  win[callback] = (payload) => finish(parseVisitCounts(payload));
  script.onerror = () => finish(null);
  timeout = win.setTimeout(() => finish(null), timeoutMs);
  doc.head.append(script);
}
