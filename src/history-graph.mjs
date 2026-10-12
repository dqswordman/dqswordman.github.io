// This pure module is shared by static rendering and the interactive graph.
export const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function graphModel(data, personId, eventId = '') {
  const person = data.people.find((item) => item.id === personId) || data.people[0];
  const allEvents = data.events.filter((event) => event.actors.some((actor) => actor.person === person.id));
  const events = eventId && allEvents.some((event) => event.id === eventId) ? allEvents.filter((event) => event.id === eventId) : allEvents;
  const peerIds = new Set(events.flatMap((event) => event.actors.map((actor) => actor.person)).filter((id) => id !== person.id));
  const peers = data.people.filter((item) => peerIds.has(item.id));
  const edges = events.flatMap((event) => event.actors.map((actor) => ({ person: actor.person, event: event.id })));
  return { person, allEvents, events, peers, edges };
}

export function graphSvg(model, base = '', titleId = 'network-title', locale = 'zh') {
  const { person, events, peers } = model;
  const en = locale === 'en', t = (zh, english) => en ? english : zh;
  const height = Math.max(360, Math.max(events.length, peers.length) * 64 + 80);
  const position = (index, total) => 50 + ((index + 0.5) / Math.max(total, 1)) * (height - 90);
  const center = height / 2;
  const fit = (label, width) => {
    let units = 0, output = '';
    for (const c of label) { units += /[\u3400-\u9fff]/u.test(c) ? 2 : 1; if (units > (width - 40) / 8) return output + '…'; output += c; }
    return output;
  };
  const node = (x, y, width, label, href, kind, id, selected = false) => `<a href="${escape(href)}" aria-label="${escape(label)}" data-node-kind="${kind}" data-node-id="${escape(id)}"><title>${escape(label)}</title><rect x="${x}" y="${y - 21}" width="${width}" height="42" rx="5" class="${selected ? 'graph-selected' : 'graph-node'}"/><text x="${x + 13}" y="${y + 5}" class="${selected ? 'graph-selected-text' : ''}">${escape(fit(label, width))}</text></a>`;
  const lines = events.map((event, index) => {
    const y = position(index, events.length);
    return `<path d="M190 ${center} C235 ${center} 240 ${y} 285 ${y}" class="graph-edge graph-primary" data-edge-person="${escape(person.id)}" data-edge-event="${escape(event.id)}"/>${event.actors.filter((actor) => actor.person !== person.id).map((actor) => {
      const peerY = position(peers.findIndex((peer) => peer.id === actor.person), peers.length);
      return `<path d="M615 ${y} C665 ${y} 670 ${peerY} 720 ${peerY}" class="graph-edge" data-edge-person="${escape(actor.person)}" data-edge-event="${escape(event.id)}"/>`;
    }).join('')}`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 970 ${height}" width="970" height="${height}" role="group" aria-labelledby="${escape(titleId)}"><title id="${escape(titleId)}">${escape(person.name)}${t('的人物—事件关联图：线表示行动记录，不表示同盟或亲疏', ': person–event graph. Edges show recorded participation, not alliance or closeness.')}</title><text x="20" y="24" class="graph-label">${t('所选人物', 'Selected person')}</text><text x="285" y="24" class="graph-label">${t('关联事件', 'Associated events')}</text><text x="720" y="24" class="graph-label">${t('同一事件中的其他人物', 'Other participants')}</text>${lines}${node(10, center, 180, person.name, `${base}/misc/history/people/${person.id}/`, 'person', person.id, true)}${events.map((event, index) => node(285, position(index, events.length), 330, `${event.start} · ${event.title}`, `${base}/misc/history/events/${event.id}/`, 'event', event.id)).join('')}${peers.map((peer, index) => node(720, position(index, peers.length), 230, peer.name, `${base}/misc/history/people/${peer.id}/`, 'person', peer.id)).join('')}</svg>`;
}
