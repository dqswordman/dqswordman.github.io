const en = document.documentElement.lang === 'en';
const t = (zh, english) => en ? english : zh;
const readStore = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const writeStore = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Reading remains available without storage. */ } };
const normal = value => value.normalize('NFKC').toLocaleLowerCase().trim();

export function initLibrary() {
  const form = document.querySelector('[data-chapter-filters]');
  if (!form) return;
  const input = form.querySelector('input');
  const buttons = [...form.querySelectorAll('[data-library-part]')];
  const cards = [...document.querySelectorAll('[data-chapter]')];
  const groups = [...document.querySelectorAll('[data-chapter-group]')];
  const status = form.querySelector('[data-library-count]');
  const empty = document.querySelector('[data-library-empty]');
  let part = '';
  const apply = (persist = true) => {
    const words = normal(input.value).split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      card.hidden = Boolean(part && card.dataset.chapterPart !== part) || !words.every(word => normal(card.dataset.chapterSearch).includes(word));
      if (!card.hidden) count++;
    });
    groups.forEach(group => { group.hidden = !group.querySelector('[data-chapter]:not([hidden])'); });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.libraryPart === part)));
    status.textContent = t(`${count} / ${cards.length} 个长章`, `${count} / ${cards.length} chapters`);
    empty.hidden = count > 0;
    if (persist) {
      const url = new URL(location.href);
      input.value.trim() ? url.searchParams.set('chapter', input.value.trim()) : url.searchParams.delete('chapter');
      part ? url.searchParams.set('part', part) : url.searchParams.delete('part');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  };
  const restore = () => {
    const params = new URLSearchParams(location.search);
    input.value = (params.get('chapter') || '').slice(0, 200);
    part = buttons.some(button => button.dataset.libraryPart === params.get('part')) ? params.get('part') : '';
    apply(false);
  };
  form.hidden = false;
  input.addEventListener('input', () => apply());
  buttons.forEach(button => button.addEventListener('click', () => { part = button.dataset.libraryPart; apply(); }));
  form.addEventListener('submit', event => { event.preventDefault(); apply(); });
  form.addEventListener('reset', event => { event.preventDefault(); input.value = ''; part = ''; apply(); input.focus(); });
  addEventListener('popstate', restore);
  restore();

  const saved = readStore('wd-history-reading');
  const continuation = document.querySelector('[data-reading-continue]');
  if (saved && continuation && typeof saved.path === 'string') {
    const normalizePath = path => {
      const prefix = form.dataset.basePath || '';
      return path.startsWith(prefix + '/') ? path.slice(prefix.length).replace(/^\/en(?=\/)/, '') : path;
    };
    const card = cards.find(card => normalizePath(new URL(card.href).pathname) === normalizePath(saved.path));
    if (card && /^[a-z][a-z0-9-]*$/i.test(saved.section || '') && saved.percent > 0) {
      const anchor = continuation.querySelector('a');
      anchor.href = `${card.href}#${saved.section}`;
      anchor.querySelector('[data-continue-title]').textContent = card.querySelector('h3').textContent;
      continuation.querySelector('[data-continue-percent]').textContent = t(`上次读至 ${Math.min(100, Math.round(saved.percent))}%`, `Last read: ${Math.min(100, Math.round(saved.percent))}%`);
      continuation.hidden = false;
    }
  }
}

export function initReading() {
  const article = document.querySelector('.h-article');
  const toc = document.querySelector('.h-toc');
  if (!article || !toc) return;
  const tools = toc.querySelector('[data-reading-tools]');
  const disclosure = toc.querySelector('details');
  const nav = toc.querySelector('nav');
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
  const progress = tools.querySelector('progress');
  const percent = tools.querySelector('[data-reading-percent]');
  const sectionCount = toc.querySelector('[data-current-section]');
  const small = matchMedia('(max-width: 760px)');
  const header = document.querySelector('.m-header');
  let size = Number(readStore('wd-reading-size')) || 17;
  let positions = [], start = 0, end = 1, offset = 120, frame = 0, active = '', value = 0, bookmarkTimer = 0, hasRead = false;
  tools.hidden = false;
  document.documentElement.setAttribute('data-reader', '');
  toc.setAttribute('data-reading-ready', '');
  if (small.matches) disclosure.open = false;
  const setOffset = () => {
    // Expanded mobile contents do not change the destination below the closed bar.
    const closedHeight = small.matches ? toc.offsetHeight - (disclosure.open ? nav.offsetHeight : 0) : 0;
    offset = header.offsetHeight + closedHeight + 22;
    document.documentElement.style.setProperty('--reading-offset', `${offset}px`);
    document.documentElement.style.setProperty('--reading-header', `${header.offsetHeight}px`);
  };
  const measure = () => {
    setOffset();
    positions = sections.map(section => section.getBoundingClientRect().top + scrollY);
    start = article.getBoundingClientRect().top + scrollY - offset;
    end = article.getBoundingClientRect().bottom + scrollY - innerHeight;
    update();
  };
  const save = () => {
    if (hasRead && article.dataset.fullChapter && active) writeStore('wd-history-reading', { path: location.pathname, section: active, percent: value });
  };
  const update = () => {
    frame = 0;
    value = Math.max(0, Math.min(100, Math.round(100 * (scrollY - start) / Math.max(1, end - start))));
    progress.value = value;
    progress.setAttribute('aria-valuetext', t(`已阅读 ${value}%`, `${value}% read`));
    percent.textContent = `${value}%`;
    document.documentElement.style.setProperty('--page-progress', value / 100);
    let index = 0;
    positions.forEach((position, i) => { if (position <= scrollY + offset + 32) index = i; });
    const next = sections[index]?.id || '';
    sectionCount.textContent = `${String(index + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
    if (active !== next) {
      active = next;
      links.forEach(link => link.hash === `#${active}` ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
      const current = links.find(link => link.hash === `#${active}`);
      if (current && !small.matches && !nav.contains(document.activeElement)) {
        const relativeTop = current.offsetTop - nav.offsetTop;
        if (relativeTop < nav.scrollTop || relativeTop + current.offsetHeight > nav.scrollTop + nav.clientHeight) nav.scrollTop = Math.max(0, relativeTop - 70);
      }
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const applySize = () => {
    size = Math.max(15, Math.min(22, size));
    article.style.setProperty('--reading-size', `${size}px`);
    tools.querySelector('[data-reader-size="-1"]').disabled = size === 15;
    tools.querySelector('[data-reader-size="1"]').disabled = size === 22;
    tools.querySelector('[data-reader-size="0"]').setAttribute('aria-label', t(`恢复默认字号，当前 ${size}`, `Reset text size; currently ${size}`));
    measure();
  };
  tools.querySelectorAll('[data-reader-size]').forEach(button => button.addEventListener('click', () => {
    const current = sections.find(section => section.id === active);
    const previousTop = current?.getBoundingClientRect().top;
    size = Number(button.dataset.readerSize) ? size + Number(button.dataset.readerSize) : 17;
    applySize();
    writeStore('wd-reading-size', size);
    if (current && previousTop < offset) window.scrollBy({ top: current.getBoundingClientRect().top - previousTop, behavior: 'instant' });
  }));
  nav.addEventListener('click', event => {
    if (small.matches && event.target.closest('a')) { disclosure.open = false; setOffset(); }
  });
  disclosure.addEventListener('toggle', measure);
  toc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && small.matches && disclosure.open) { disclosure.open = false; disclosure.querySelector('summary').focus(); setOffset(); }
  });
  small.addEventListener('change', () => { disclosure.open = !small.matches; measure(); });
  addEventListener('scroll', () => {
    schedule();
    if (scrollY > start + 60) hasRead = true;
    clearTimeout(bookmarkTimer);
    bookmarkTimer = setTimeout(save, 800);
  }, { passive: true });
  addEventListener('resize', measure, { passive: true });
  addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => requestAnimationFrame(measure));
    observer.observe(article);
    observer.observe(header);
  }
  applySize();
}

export function initReferencePreviews() {
  const references = document.querySelector('.h-references');
  if (!references) return;
  const popup = document.createElement('div');
  popup.className = 'reference-preview';
  popup.id = 'reference-preview';
  popup.setAttribute('role', 'tooltip');
  popup.hidden = true;
  document.body.append(popup);
  const back = document.createElement('a');
  back.className = 'h-reference-back';
  back.hidden = true;
  back.textContent = t('↑ 返回刚才的引用处', '↑ Return to the citation');
  references.querySelector('h2').after(back);
  let anchor = null, timer = 0;
  const hide = () => {
    clearTimeout(timer);
    if (anchor) {
      const ids = (anchor.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== popup.id);
      ids.length ? anchor.setAttribute('aria-describedby', ids.join(' ')) : anchor.removeAttribute('aria-describedby');
    }
    popup.hidden = true;
    anchor = null;
  };
  const show = link => {
    if (!link || anchor === link) return;
    const reference = document.getElementById(link.hash.slice(1));
    if (!reference?.closest('.h-references')) return;
    hide();
    anchor = link;
    const text = reference.textContent.replace(/\s+/g, ' ').trim();
    popup.textContent = text.length > 480 ? text.slice(0, 480) + '…' : text;
    anchor.setAttribute('aria-describedby', [anchor.getAttribute('aria-describedby'), popup.id].filter(Boolean).join(' '));
    popup.hidden = false;
    const rect = link.getBoundingClientRect();
    const box = popup.getBoundingClientRect();
    popup.style.left = `${Math.max(12, Math.min(innerWidth - box.width - 12, rect.left - 16))}px`;
    popup.style.top = `${Math.max(12, Math.min(innerHeight - box.height - 12, rect.top - box.height - 12 > 90 ? rect.top - box.height - 12 : rect.bottom + 12))}px`;
  };
  const citation = target => target.closest?.('.h-citations a[href^="#ref-"]');
  document.addEventListener('pointerover', event => {
    if (event.pointerType !== 'touch' && matchMedia('(hover:hover)').matches) {
      if (popup.contains(event.target)) clearTimeout(timer);
      else if (citation(event.target)) show(citation(event.target));
    }
  });
  document.addEventListener('pointerout', event => {
    if (citation(event.target) || popup.contains(event.target)) timer = setTimeout(() => { if (document.activeElement !== anchor && !popup.matches(':hover')) hide(); }, 180);
  });
  document.addEventListener('focusin', event => {
    const link = citation(event.target);
    if (link) requestAnimationFrame(() => { if (document.activeElement === link) show(link); });
    else hide();
  });
  document.addEventListener('click', event => {
    const link = citation(event.target);
    if (!link) return;
    const destination = link.closest('.h-citations[id]')?.id || link.closest('section[id]')?.id;
    if (destination) { back.href = `#${destination}`; back.hidden = false; }
    hide();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  addEventListener('scroll', hide, { passive: true });
  addEventListener('resize', hide, { passive: true });
}

export function initGraphFocus() {
  document.querySelectorAll('[data-graph-canvas]').forEach(canvas => {
    const highlight = node => {
      const svg = node?.closest('svg');
      if (!svg) return;
      const edges = [...svg.querySelectorAll('[data-edge-person]')];
      const matched = edges.filter(edge => node.dataset.nodeKind === 'event' ? edge.dataset.edgeEvent === node.dataset.nodeId : edge.dataset.edgePerson === node.dataset.nodeId);
      const people = new Set(matched.map(edge => edge.dataset.edgePerson));
      const events = new Set(matched.map(edge => edge.dataset.edgeEvent));
      svg.classList.add('has-graph-focus');
      edges.forEach(edge => edge.classList.toggle('is-related', matched.includes(edge)));
      svg.querySelectorAll('[data-node-id]').forEach(item => item.classList.toggle('is-related', item === node || (item.dataset.nodeKind === 'event' ? events : people).has(item.dataset.nodeId)));
    };
    const clear = () => canvas.querySelector('svg')?.classList.remove('has-graph-focus');
    canvas.addEventListener('pointerover', event => {
      const node = event.target.closest?.('[data-node-id]');
      if (node && event.pointerType !== 'touch') highlight(node);
      else if (!canvas.contains(document.activeElement) || !document.activeElement.matches('[data-node-id]')) clear();
    });
    canvas.addEventListener('pointerleave', () => canvas.contains(document.activeElement) && document.activeElement.matches('[data-node-id]') ? highlight(document.activeElement) : clear());
    canvas.addEventListener('focusin', event => { const node = event.target.closest?.('[data-node-id]'); node ? highlight(node) : clear(); });
    canvas.addEventListener('focusout', () => requestAnimationFrame(() => { if (!canvas.contains(document.activeElement)) clear(); }));
    canvas.addEventListener('keydown', event => { if (event.key === 'Escape') clear(); });
    canvas.setAttribute('data-graph-enhanced', '');
  });
}
