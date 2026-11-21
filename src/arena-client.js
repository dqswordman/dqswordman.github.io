const form = document.querySelector('[data-arena-tools]');
const body = document.querySelector('#arena-body');
const counter = form.querySelector('output');
const reset = form.querySelector('[type="reset"]');
const empty = document.querySelector('[data-arena-empty]');
const rubric = document.getElementById('rubric');
const language = document.querySelector('[data-language]');
const defaults = { scope: 'public', q: '', score: '', tier: '', sort: 'rank' };
const fold = text => text.normalize('NFKC').toLowerCase().replace(/[–—]/g,'-');
const rows = [...body.rows].map((element, index) => ({
  element, index, data: element.dataset, keywords: fold(element.dataset.keywords),
}));
const headers = [...body.closest('table').tHead.rows[0].cells];
function setLanguageLink() {
  const url = new URL(language.href);
  url.search = location.search;
  url.hash = location.hash;
  language.href = url.href;
}
function display() {
  const state = Object.fromEntries(new FormData(form));
  const words = fold(state.q.trim()).split(/\s+/).filter(Boolean);
  const minimum = state.score.startsWith('min-') ? Number(state.score.slice(4)) : null;
  let count = 0;
  for (const {element,data,keywords} of rows) {
    const scoreMatches = minimum !== null ? Number(data.score) >= minimum : !state.score || data.score === state.score;
    element.hidden = (state.scope === 'public' && data.scope !== 'public') || !scoreMatches ||
      Boolean(state.tier && state.tier !== data.tier) || !words.every(word => keywords.includes(word));
    if (!element.hidden) count++;
  }
  const sorted = state.sort === 'rank' ? rows : [...rows].sort((a, b) => {
    const left = a.data.date, right = b.data.date;
    if (!left || !right) return Number(Boolean(right)) - Number(Boolean(left)) || a.index - b.index;
    return (state.sort === 'newest' ? right.localeCompare(left) : left.localeCompare(right)) || a.index - b.index;
  });
  sorted.forEach(({element}, index) => {
    if (body.rows[index] !== element) body.insertBefore(element,body.rows[index] ?? null);
  });
  headers[0].removeAttribute('aria-sort');
  headers[4].removeAttribute('aria-sort');
  (state.sort === 'rank' ? headers[0] : headers[4]).setAttribute('aria-sort',state.sort === 'newest' ? 'descending' : 'ascending');
  const inScope = state.scope === 'all' ? rows.length : rows.filter(r => r.data.scope === 'public').length;
  counter.value = counter.dataset.template.replace('{n}', count).replace('{total}', inScope);
  empty.hidden = count > 0;
  reset.hidden = !Object.entries(state).some(([name,value]) => defaults[name] !== value);
  setLanguageLink();
}
function restore() {
  const params = new URLSearchParams(location.search);
  const destination = document.getElementById(location.hash.slice(1));
  const scope = params.get('scope');
  form.elements.scope.value = scope === 'all' || (!scope && destination?.dataset.scope === 'anonymous') ? 'all' : 'public';
  form.elements.q.value = (params.get('q') ?? '').slice(0,160);
  for (const name of ['score','tier','sort']) {
    const select = form.elements[name], value = params.get(name);
    select.value = [...select.options].some(option => option.value === value) ? value : defaults[name];
  }
  if (destination === rubric) rubric.open = true;
  display();
  if (destination?.matches('[data-arena-row]') && !destination.hidden)
    requestAnimationFrame(() => destination.scrollIntoView({block:'start',behavior:'instant'}));
}
function sync(replace = false) {
  const url = new URL(location.href);
  for (const [name,value] of new FormData(form)) {
    if (value === defaults[name]) url.searchParams.delete(name);
    else url.searchParams.set(name,value);
  }
  if (url.hash.startsWith('#entry-')) url.hash = '';
  if (url.href !== location.href) history[replace ? 'replaceState' : 'pushState'](null,'',url);
  display();
}
form.addEventListener('submit', event => { event.preventDefault(); sync(true); });
form.elements.q.addEventListener('input',() => sync(true));
form.addEventListener('change',event => { if (event.target.name !== 'q') sync(); });
form.addEventListener('reset',event => {
  event.preventDefault();
  for (const [name,value] of Object.entries(defaults)) form.elements[name].value = value;
  sync();
  form.elements.q.focus();
});
document.querySelector('.arena-stamp a[href="#rubric"]').addEventListener('click', () => { rubric.open = true; });
addEventListener('popstate', restore);
addEventListener('hashchange', restore);
form.hidden = false;
restore();
