import { initVisitorStats } from './visitors.mjs';
import { matchesHistoryRecord } from './history-search.mjs';
import { graphModel, graphSvg, escape } from './history-graph.mjs';
import { initExperience } from './experience.mjs';
import { initLibrary, initReading, initReferencePreviews, initGraphFocus } from './reading.mjs';

const locale = document.documentElement.lang === 'en' ? 'en' : 'zh';
const t = (zh, en) => locale === 'en' ? en : zh;
document.querySelectorAll('[data-language-switch]').forEach(link => link.addEventListener('click', () => {
  const target = new URL(link.href);
  target.search = location.search;
  target.hash = location.hash;
  const readingOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reading-offset')) || 160;
  // Keep the last reached heading even when the reading line lies in the gap
  // between sections. Otherwise an old fragment can replace the visible chapter.
  const currentSection = [...document.querySelectorAll('.h-article > section[id]')].filter(section => section.getBoundingClientRect().top <= readingOffset + 32).at(-1);
  let currentAnchor;
  try { currentAnchor = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { /* Keep an unrecognized fragment unchanged. */ }
  const anchorVisible = currentAnchor && currentAnchor.getBoundingClientRect().bottom >= 0 && currentAnchor.getBoundingClientRect().top < innerHeight;
  // A citation is an explicit destination even while smooth scrolling is in flight.
  const referenceAnchor = currentAnchor?.closest('.h-references');
  if (anchorVisible && currentAnchor.dataset.alternateAnchor) target.hash = currentAnchor.dataset.alternateAnchor;
  if (currentSection && !anchorVisible && !referenceAnchor) target.hash = currentSection.dataset.alternateAnchor || currentSection.id;
  link.href = target.pathname + target.search + target.hash;
}));

const menu = document.querySelector('[data-menu]');
const navigation = document.querySelector('#misc-nav');
if (menu && navigation) {
  document.documentElement.classList.add('m-enhanced');
  menu.hidden = false;
  const setMenu = (open) => {
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? t('关闭导航', 'Close navigation') : t('打开导航', 'Open navigation'));
    navigation.classList.toggle('is-open', open);
  };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
  });
  matchMedia('(min-width: 761px)').addEventListener('change', () => setMenu(false));
}

document.querySelectorAll('[data-print]').forEach((button) => {
  button.hidden = false;
  button.addEventListener('click', () => window.print());
});

const form = document.querySelector('[data-filters]');
if (form) {
  const records = [...document.querySelectorAll('[data-record]')];
  const fields = [...form.querySelectorAll('input[name],select[name]')];
  const count = form.querySelector('[data-result-count]');
  const empty = document.querySelector('[data-empty]');
  const apply = (persist = true) => {
    const state = Object.fromEntries(fields.map((field) => [field.name, field.value]));
    let visible = 0;
    for (const record of records) { record.hidden = !matchesHistoryRecord(record.dataset, state); if (!record.hidden) visible++; }
    count.textContent = t(`显示 ${records.length} 项中的 ${visible} 项`, `Showing ${visible} of ${records.length} entries`);
    if (empty) empty.hidden = visible > 0;
    if (persist) {
      const url = new URL(location.href);
      for (const [name, value] of Object.entries(state)) value ? url.searchParams.set(name, value) : url.searchParams.delete(name);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  };
  const restore = () => {
    const params = new URLSearchParams(location.search);
    fields.forEach((field) => { field.value = params.get(field.name) || ''; });
    apply(false);
  };
  form.hidden = false;
  form.addEventListener('input', () => apply());
  form.addEventListener('change', () => apply());
  form.addEventListener('submit', (event) => { event.preventDefault(); apply(); });
  form.addEventListener('reset', (event) => {
    event.preventDefault();
    fields.forEach((field) => { field.value = ''; });
    apply();
  });
  window.addEventListener('popstate', restore);
  restore();
}

async function initNetwork() {
  const root = document.querySelector('[data-network]');
  if (!root) return;
  const controls = document.querySelector('[data-network-controls]');
  const personSelect = controls.querySelector('#graph-person');
  const eventSelect = controls.querySelector('#graph-event');
  const canvas = root.querySelector('[data-graph-canvas]');
  const detail = root.querySelector('[data-graph-detail]');
  const status = controls.querySelector('[data-graph-status]');
  const base = root.dataset.base;
  try {
    const response = await fetch(root.dataset.url);
    if (!response.ok) throw new Error('Graph data unavailable');
    const data = await response.json();
    let zoom = 1;
    const applyZoom = (direction) => {
      zoom = direction ? Math.min(1.8, Math.max(0.55, Math.round((zoom + direction * 0.15) * 100) / 100)) : 1;
      canvas.querySelector('svg').style.width = `${970 * zoom}px`;
      if (!direction) canvas.scrollTo({ left: 0, top: 0, behavior: 'instant' });
      controls.querySelector('[data-zoom="-1"]').disabled = zoom === 0.55;
      controls.querySelector('[data-zoom="1"]').disabled = zoom === 1.8;
      controls.querySelector('[data-zoom-level]').textContent = `${Math.round(zoom * 100)}%`;
    };
    const draw = (person, event = '', persist = false) => {
      const model = graphModel(data, person, event);
      personSelect.value = model.person.id;
      eventSelect.replaceChildren(new Option(t('全部关联事件', 'All associated events'), ''), ...model.allEvents.map((item) => new Option(`${item.start} · ${item.title}`, item.id)));
      eventSelect.value = model.events.length === 1 && event ? model.events[0].id : '';
      canvas.innerHTML = graphSvg(model, base, 'network-title', locale);
      applyZoom(0);
      if (document.documentElement.dataset.motion === 'on') canvas.querySelector('svg').animate([{ opacity: .45 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' });
      status.textContent = t(`${model.person.name} · ${model.events.length}个事件 · ${model.peers.length}位同事件人物 · ${model.edges.length}条参与记录`, `${model.person.name} · ${model.events.length} ${model.events.length === 1 ? 'event' : 'events'} · ${model.peers.length} other ${model.peers.length === 1 ? 'participant' : 'participants'} · ${model.edges.length} action ${model.edges.length === 1 ? 'record' : 'records'}`);
      detail.innerHTML = `<h2>${escape(model.person.name)} · ${t('事件与行动', 'events and actions')}</h2><ul class="h-network-events">${model.events.map((item) => {
        const actor = item.actors.find((record) => record.person === model.person.id);
        return `<li><h3><a href="${base}/misc/history/events/${item.id}/">${item.start} · ${escape(item.title)}</a></h3><p><strong>${t('立场', 'Position')}</strong> ${escape(actor.stance)}</p><p><strong>${t('行动', 'Action')}</strong> ${escape(actor.action)}</p><p><strong>${t('结果', 'Outcome')}</strong> ${escape(actor.result)} <a href="${base}/misc/history/events/${item.id}/#actions">${t('阅读证据 →', 'Read evidence →')}</a></p><p class="h-small">${t('同事件人物', 'Other participants')}: ${item.actors.filter((record) => record.person !== model.person.id).map((record) => { const peer = data.people.find((item) => item.id === record.person); return `<a href="${base}/misc/history/people/${peer.id}/">${escape(peer.name)}</a>`; }).join(' · ') || t('本总目暂无其他人物记录', 'No other participant in this catalog')}</p></li>`;
      }).join('')}</ul>`;
      if (persist) {
        const url = new URL(location.href);
        url.searchParams.set('person', model.person.id);
        eventSelect.value ? url.searchParams.set('event', eventSelect.value) : url.searchParams.delete('event');
        history.pushState(null, '', url.pathname + url.search);
      }
    };
    const restore = () => {
      const params = new URLSearchParams(location.search);
      draw(params.get('person') || 'sun-yatsen', params.get('event') || '');
    };
    personSelect.addEventListener('change', () => draw(personSelect.value, '', true));
    eventSelect.addEventListener('change', () => draw(personSelect.value, eventSelect.value, true));
    controls.querySelectorAll('[data-zoom]').forEach((button) => button.addEventListener('click', () => {
      const direction = Number(button.dataset.zoom);
      applyZoom(direction);
      status.textContent = t(`图谱缩放 ${Math.round(zoom * 100)}%，可在图谱区域内滚动。`, `Zoom ${Math.round(zoom * 100)}%. Scroll within the graph region.`);
    }));
    canvas.addEventListener('keydown', (event) => {
      if (event.target !== canvas || !['+', '=', '-', '0'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === '0' ? 0 : event.key === '-' ? -1 : 1;
      applyZoom(direction);
      status.textContent = t(`图谱缩放 ${Math.round(zoom * 100)}%`, `Graph zoom ${Math.round(zoom * 100)}%`);
    });
    window.addEventListener('popstate', restore);
    controls.hidden = false;
    restore();
  } catch {
    const notice = document.createElement('p');
    notice.className = 'h-notice';
    notice.setAttribute('role', 'status');
    notice.textContent = t('交互数据暂时无法加载。静态图和人物目录仍可阅读。', 'Interactive data could not load. The static graph and directory remain available.');
    root.prepend(notice);
  }
}
initNetwork();
initVisitorStats();
initExperience();
initLibrary();
initReading();
initReferencePreviews();
initGraphFocus();
