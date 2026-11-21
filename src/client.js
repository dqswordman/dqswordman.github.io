import { matchesPaper, readFilterState, writeFilterState } from './filter.mjs';
import { initVisitorStats } from './visitors.mjs';
import { initExperience } from './experience.mjs';

function followLegacyResearchAnchor() {
  const link = document.getElementById(location.hash.slice(1));
  if (!link?.hasAttribute('data-research-index')) return false;
  const destination = new URL(link.href);
  destination.search = location.search;
  location.replace(destination);
  return true;
}

if (!followLegacyResearchAnchor()) initVisitorStats();
window.addEventListener('hashchange', followLegacyResearchAnchor);
initExperience();

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu]');
const nav = document.querySelector('#main-nav');
const mobile = window.matchMedia('(max-width: 960px)');

function setMenu(open, restoreFocus = false) {
  header.toggleAttribute('data-menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  const label = open ? menuButton.dataset.closeLabel : menuButton.dataset.openLabel;
  menuButton.setAttribute('aria-label', label);
  menuButton.querySelector('.sr-only').textContent = label;
  if (open) (nav.querySelector('[aria-current]') || nav.querySelector('a')).focus();
  if (restoreFocus) menuButton.focus();
}

menuButton.addEventListener('click', () =>
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true'),
);
nav.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link || !header.hasAttribute('data-menu-open')) return;
  setMenu(false);
  if (link.pathname !== location.pathname) return;
  const target = document.getElementById(link.hash.slice(1));
  if (target) {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
});
document.addEventListener('click', (event) => {
  if (!header.contains(event.target)) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true')
    setMenu(false, true);
});
header.addEventListener('focusout', () => {
  requestAnimationFrame(() => {
    if (!header.contains(document.activeElement)) setMenu(false);
  });
});
mobile.addEventListener('change', () => {
  if (!mobile.matches) setMenu(false);
});
header.setAttribute('data-enhanced', '');
menuButton.hidden = false;

// Scroll work is bounded to the navigation targets and one animation frame.
const navigationGroups = ['[data-nav]', '[data-report-contents] a'].map((selector) =>
  [...document.querySelectorAll(selector)]
    .filter((link) => link.pathname === location.pathname)
    .map((link) => [link, document.getElementById(link.hash.slice(1))])
    .filter(([, section]) => section),
);
let scrollPending = false;
function updateNavigation() {
  header.toggleAttribute('data-scrolled', window.scrollY > 16);
  const offset = header.offsetHeight + 90;
  for (const group of navigationGroups) {
    let active;
    for (const [link, section] of group) {
      if (section.getBoundingClientRect().top <= offset) active = link;
    }
    for (const [link] of group) {
      if (link === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  scrollPending = false;
}
window.addEventListener(
  'scroll',
  () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateNavigation);
    }
  },
  { passive: true },
);
window.addEventListener('resize', updateNavigation, { passive: true });
window.addEventListener('hashchange', updateNavigation);
updateNavigation();

const languageLink = document.querySelector('[data-language]');
const languagePath = languageLink.getAttribute('href');
function updateLanguageLink() {
  const next = new URL(languagePath, location.origin);
  next.search = location.search;
  next.hash = location.hash;
  languageLink.href = next.href;
}
window.addEventListener('hashchange', updateLanguageLink);
window.addEventListener('popstate', updateLanguageLink);
updateLanguageLink();

const news = document.querySelector('[data-news]');
if (news) {
  const entries = [...news.querySelectorAll('[data-news-item]')];
  const buttons = [...news.querySelectorAll('[data-news-filter]')];
  const toggle = news.querySelector('[data-news-toggle]');
  const count = news.querySelector('[data-news-count]');
  const list = news.querySelector('.news-timeline');
  const years = buttons.map(button => button.dataset.newsFilter);
  const previewCount = 2;
  let year = 'all', expanded = false;

  function showNews({ updateUrl = true, animate = true } = {}) {
    const matches = entries.filter(item => year === 'all' || item.dataset.newsYear === year);
    const visible = new Set(expanded ? matches : matches.slice(0, previewCount));
    for (const item of entries) item.hidden = !visible.has(item);
    for (const button of buttons)
      button.setAttribute('aria-pressed', String(button.dataset.newsFilter === year));
    toggle.hidden = matches.length <= previewCount;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.querySelector('span').textContent = expanded ? toggle.dataset.collapseLabel : toggle.dataset.expandLabel;
    count.textContent = count.dataset.template.replace('{count}', visible.size).replace('{total}', matches.length);
    list.scrollTop = 0;
    if (animate && document.documentElement.dataset.motion === 'on') {
      [...visible].forEach((item, index) => {
        item.getAnimations().forEach(animation => animation.cancel());
        item.animate?.([
          { opacity: .35, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 360, delay: index * 40, easing: 'cubic-bezier(.2,.65,.2,1)' });
      });
    }
    if (updateUrl) {
      try {
        const url = new URL(location.href);
        if (year === 'all') url.searchParams.delete('newsYear');
        else url.searchParams.set('newsYear', year);
        history.replaceState(null, '', url);
      } catch { /* Local previews remain interactive. */ }
      updateLanguageLink();
    }
  }

  function restoreNews() {
    const requested = new URL(location.href).searchParams.get('newsYear');
    year = years.includes(requested) ? requested : 'all';
    expanded = false;
    showNews({ updateUrl: false, animate: false });
  }
  for (const button of buttons) button.addEventListener('click', () => {
    year = button.dataset.newsFilter;
    expanded = false;
    showNews();
  });
  toggle.addEventListener('click', () => {
    expanded = !expanded;
    showNews();
  });
  window.addEventListener('popstate', restoreNews);
  restoreNews();
  news.querySelector('[data-news-tools]').hidden = false;
}

const searchInput = document.querySelector('#publication-search');
if (searchInput) {
  const topicInput = document.querySelector('#publication-topic');
  const clearButton = document.querySelector('[data-clear-search]');
  const yearButtons = [...document.querySelectorAll('[data-year-filter]')];
  const yearGroups = [...document.querySelectorAll('[data-year-group]')];
  const publicationGroups = [...document.querySelectorAll('[data-publication-group]')];
  const resultCount = document.querySelector('[data-result-count]');
  const emptyState = document.querySelector('[data-empty-state]');
  const records = [...document.querySelectorAll('[data-publication]')].map((element) => ({
    element,
    year: element.dataset.year,
    topics: element.dataset.topics.split(' '),
    search: element.dataset.search,
  }));
  const years = yearButtons.map((button) => button.dataset.yearFilter);
  const topics = [...topicInput.options].map((option) => option.value);
  let state = readFilterState(location.search, years, topics);

  function filter({ updateUrl = true } = {}) {
    searchInput.value = state.query;
    topicInput.value = state.topic;
    clearButton.hidden = !state.query;
    for (const button of yearButtons)
      button.setAttribute('aria-pressed', String(button.dataset.yearFilter === state.year));
    let count = 0;
    for (const paper of records) {
      const visible = matchesPaper(paper, state);
      paper.element.hidden = !visible;
      if (visible) count++;
    }
    for (const group of yearGroups) {
      const count = [...group.querySelectorAll('[data-publication]')].filter(element => !element.hidden).length;
      group.hidden = count === 0;
      group.querySelector('[data-year-count]').textContent = count;
    }
    for (const group of publicationGroups) {
      const count = [...group.querySelectorAll('[data-publication]')].filter(element => !element.hidden).length;
      group.hidden = count === 0;
      const label = group.querySelector('[data-group-count]');
      label.textContent = label.dataset.template.replace('{count}', count);
    }
    resultCount.textContent = resultCount.dataset.template
      .replace('{count}', count)
      .replace('{total}', records.length);
    emptyState.hidden = count !== 0;
    if (updateUrl) {
      try {
        history.replaceState(null, '', writeFilterState(location.href, state));
      } catch {
        /* Filters remain usable in file previews. */
      }
    }
    updateLanguageLink();
  }

  function reset() {
    state = { query: '', year: 'all', topic: 'all' };
    filter();
  }
  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    filter();
  });
  clearButton.addEventListener('click', () => {
    state.query = '';
    filter();
    searchInput.focus();
  });
  topicInput.addEventListener('change', () => {
    state.topic = topicInput.value;
    filter();
  });
  for (const button of yearButtons)
    button.addEventListener('click', () => {
      state.year = button.dataset.yearFilter;
      filter();
    });
  document.querySelector('[data-reset-filters]').addEventListener('click', () => {
    reset();
    searchInput.focus();
  });
  function revealLinkedPaper() {
    const target = records.find((paper) => `#${paper.element.id}` === location.hash);
    if (!target?.element.hidden) return;
    reset();
    target.element.scrollIntoView();
  }
  for (const link of document.querySelectorAll('[data-featured], [data-paper-jump]'))
    link.addEventListener('click', event => {
      if (link.hash === location.hash && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey)
        revealLinkedPaper();
    });
  window.addEventListener('popstate', () => {
    state = readFilterState(location.search, years, topics);
    filter({ updateUrl: false });
  });
  window.addEventListener('hashchange', revealLinkedPaper);
  filter();
  revealLinkedPaper();
  document.querySelector('[data-filter-tools]').hidden = false;
}

const toast = document.querySelector('[data-toast]');
let toastTimeout;
function notify(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.setAttribute('data-visible', '');
  toastTimeout = setTimeout(() => toast.removeAttribute('data-visible'), 4000);
}

const copyDialog = document.querySelector('[data-copy-dialog]');
const fallbackText = copyDialog.querySelector('textarea');
for (const button of document.querySelectorAll('[data-close-copy]'))
  button.addEventListener('click', () => copyDialog.close());
copyDialog.addEventListener('click', (event) => {
  if (event.target === copyDialog) {
    const rect = copyDialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      copyDialog.close();
  }
});

for (const button of document.querySelectorAll('[data-copy]')) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const text = document.getElementById(button.dataset.copy)?.textContent?.trim();
    if (!text) return;
    button.disabled = true;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      notify(document.body.dataset.copySuccess);
    } catch {
      fallbackText.value = text;
      copyDialog.showModal();
      fallbackText.focus();
      fallbackText.select();
    } finally {
      button.disabled = false;
    }
  });
}

for (const button of document.querySelectorAll('[data-print]')) {
  button.hidden = false;
  button.addEventListener('click', () => window.print());
}

const catalogTools = document.querySelector('[data-catalog-tools]');
if (catalogTools) {
  const list = document.querySelector('[data-report-list]');
  const fields = Array.from(catalogTools.querySelectorAll('[name]'));
  const panel = catalogTools.querySelector('#report-filters');
  const toggle = catalogTools.querySelector('[data-filter-toggle]');
  const reset = catalogTools.querySelector('[type="reset"]');
  const counter = catalogTools.querySelector('[data-catalog-count]');
  const fold = value => value.normalize('NFKC').toLowerCase().replace(/[–—]/g, '-');
  const defaultValue = field => field.options?.[0]?.value ?? '';
  const isChanged = field => field.value !== defaultValue(field);
  const sections = Array.from(list.querySelectorAll(':scope > section'), section => {
    const axis = section.hasAttribute('data-tier') ? 'tier' : 'collection';
    return { section, axis, key: section.dataset[axis], body: section.querySelector('[data-group-entries]') };
  });
  const documents = Array.from(list.querySelectorAll('[data-doc]'), element => ({
    element, tier: element.dataset.reportTier, collection: element.closest('[data-collection]').dataset.collection,
    keywords: fold(element.dataset.keywords),
  }));
  // The static list puts each historic fragment on its first report. With
  // grouping available, that same fragment can lead to the whole category.
  for (const { section, axis, key } of sections) {
    if (axis !== 'tier') continue;
    const anchor = document.getElementById('group-' + key);
    if (anchor) {
      section.id = anchor.id;
      anchor.removeAttribute('id');
    }
  }

  function expandFilters(expanded) {
    panel.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
  }

  function display() {
    const { q, group, tier, venue, type, sort } = Object.fromEntries(new FormData(catalogTools));
    const words = fold(q.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const doc of documents) {
      const { element } = doc;
      element.hidden = Boolean((tier && tier !== doc.tier) || (venue && venue !== element.dataset.venue) ||
        (type && type !== element.dataset.kind) || !words.every(word => doc.keywords.includes(word)));
      if (!element.hidden) count++;
    }
    const ordered = sort === 'directory' ? documents : [...documents].sort((a,b) =>
      b.element.dataset[sort].localeCompare(a.element.dataset[sort]) || a.element.dataset.doc.localeCompare(b.element.dataset.doc));
    for (const { section, axis, key, body } of sections) {
      const members = axis === group ? ordered.filter(doc => doc[axis] === key) : [];
      section.hidden = !members.some(doc => !doc.element.hidden);
      members.forEach(({ element }, position) => {
        if (body.children[position] !== element) body.insertBefore(element, body.children[position] ?? null);
      });
    }
    const countLabel = count === documents.length ? counter.dataset.total : counter.dataset.template;
    counter.value = countLabel.replace('{n}', count).replace('{total}', documents.length);
    document.querySelector('[data-catalog-empty]').hidden = count !== 0;
    reset.hidden = !fields.some(isChanged);
    const advanced = Array.from(panel.querySelectorAll('select')).filter(isChanged).length;
    toggle.querySelector('[data-filter-count]').textContent = advanced ? ' (' + advanced + ')' : '';
    return advanced;
  }

  function restore() {
    const params = new URLSearchParams(location.search);
    for (const field of fields) {
      const value = params.get(field.name);
      if (field.name === 'q') field.value = (value ?? '').slice(0,180);
      else field.value = [...field.options].some(option => option.value === value) ? value : defaultValue(field);
    }
    const fragment = document.getElementById(location.hash.slice(1));
    if (!params.has('group') && fragment?.hasAttribute('data-tier'))
      catalogTools.elements.group.value = 'tier';
    expandFilters(display() > 0);
    updateLanguageLink();
    if (fragment && list.contains(fragment) && !fragment.hidden)
      requestAnimationFrame(() => fragment.scrollIntoView({ block: 'start', behavior: 'instant' }));
  }

  function sync(replace = false) {
    const url = new URL(location.href);
    for (const field of fields) {
      if (isChanged(field)) url.searchParams.set(field.name,field.value);
      else url.searchParams.delete(field.name);
    }
    if (url.hash && list.contains(document.getElementById(url.hash.slice(1)))) url.hash = '';
    if (url.href !== location.href) history[replace ? 'replaceState' : 'pushState'](null,'',url);
    display();
    updateLanguageLink();
  }
  toggle.addEventListener('click', () => expandFilters(panel.hidden));
  catalogTools.elements.q.addEventListener('input', () => sync(true));
  catalogTools.addEventListener('change', event => { if (event.target.tagName === 'SELECT') sync(); });
  catalogTools.addEventListener('submit', event => { event.preventDefault(); sync(true); });
  catalogTools.addEventListener('reset', event => {
    event.preventDefault();
    for (const field of fields) field.value = defaultValue(field);
    expandFilters(false);
    sync();
    catalogTools.elements.q.focus();
  });
  addEventListener('popstate', restore);
  addEventListener('hashchange', restore);
  restore();
  catalogTools.hidden = false;
}
