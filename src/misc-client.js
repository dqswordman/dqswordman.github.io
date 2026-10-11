import { initVisitorStats } from './visitors.mjs';
import { matchesHistoryRecord } from './history-search.mjs';
import { graphModel, graphSvg, escape } from './history-graph.mjs';

const menu = document.querySelector('[data-menu]');
const navigation = document.querySelector('#misc-nav');
if (menu && navigation) {
  document.documentElement.classList.add('m-enhanced');
  menu.hidden = false;
  const setMenu = (open) => {
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
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
    count.textContent = `显示 ${records.length} 项中的 ${visible} 项`;
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
    const draw = (person, event = '', persist = false) => {
      const model = graphModel(data, person, event);
      personSelect.value = model.person.id;
      eventSelect.replaceChildren(new Option('全部关联事件', ''), ...model.allEvents.map((item) => new Option(`${item.start} · ${item.title}`, item.id)));
      eventSelect.value = model.events.length === 1 && event ? model.events[0].id : '';
      canvas.innerHTML = graphSvg(model, base);
      canvas.querySelector('svg').style.width = `${970 * zoom}px`;
      status.textContent = `${model.person.name} · ${model.events.length}个事件 · ${model.peers.length}位同事件人物 · ${model.edges.length}条参与记录`;
      detail.innerHTML = `<h2>${escape(model.person.name)}的事件与行动</h2><ul class="h-network-events">${model.events.map((item) => {
        const actor = item.actors.find((record) => record.person === model.person.id);
        return `<li><h3><a href="${base}/misc/history/events/${item.id}/">${item.start} · ${escape(item.title)}</a></h3><p><strong>立场</strong> ${escape(actor.stance)}</p><p><strong>行动</strong> ${escape(actor.action)}</p><p><strong>结果</strong> ${escape(actor.result)} <a href="${base}/misc/history/events/${item.id}/#actions">阅读证据 →</a></p><p class="h-small">同事件人物：${item.actors.filter((record) => record.person !== model.person.id).map((record) => { const peer = data.people.find((item) => item.id === record.person); return `<a href="${base}/misc/history/people/${peer.id}/">${escape(peer.name)}</a>`; }).join(' · ') || '本总目暂无其他人物行动记录'}</p></li>`;
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
      zoom = direction ? Math.min(1.8, Math.max(0.55, zoom + direction * 0.15)) : 1;
      canvas.querySelector('svg').style.width = `${970 * zoom}px`;
      status.textContent = `图谱缩放 ${Math.round(zoom * 100)}%，可在图谱区域内滚动。`;
    }));
    window.addEventListener('popstate', restore);
    controls.hidden = false;
    restore();
  } catch {
    const notice = document.createElement('p');
    notice.className = 'h-notice';
    notice.setAttribute('role', 'status');
    notice.textContent = '交互数据暂时无法加载。下方静态图和完整人物目录仍可阅读，请刷新后重试。';
    root.prepend(notice);
  }
}
initNetwork();
initVisitorStats();
