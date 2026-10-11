import { escapeHtml as h } from './content.mjs';

// A small static SVG renderer; all data also appears in the adjacent text table.
export function mechanismSvg(figure, id, locale = 'zh') {
  const width = 224, height = 92;
  const positions = figure.nodes.map((node, i) => ({ ...node, x: 24 + (i % 3) * 262, y: 30 + Math.floor(i / 3) * 182 }));
  const byId = new Map(positions.map(node => [node.id, node]));
  const endpoint = (a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = Math.min(dx ? width / 2 / Math.abs(dx) : Infinity, dy ? height / 2 / Math.abs(dy) : Infinity);
    return [a.x + width / 2 + dx * t, a.y + height / 2 + dy * t];
  };
  const lines = figure.edges.map(edge => {
    const from = byId.get(edge.from), to = byId.get(edge.to);
    const [x1, y1] = endpoint(from, to), [x2, y2] = endpoint(to, from);
    return `<path d="M${x1},${y1} L${x2},${y2}" marker-end="url(#${h(id)}-arrow)"/>`;
  }).join('');
  const boxes = positions.map(node => `<g><rect x="${node.x}" y="${node.y}" width="${width}" height="${height}" rx="10"/><text x="${node.x + width / 2}" y="${node.y + height / 2 - (node.lines.length - 1) * 10}">${node.lines.map((line, i) => `<tspan x="${node.x + width / 2}" dy="${i ? 20 : 0}">${h(line)}</tspan>`).join('')}</text></g>`).join('');
  return `<svg class="h-mechanism-svg" viewBox="0 0 796 340" role="img" aria-labelledby="${h(id)}-title ${h(id)}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${h(id)}-title">${h(figure.title)}</title><desc id="${h(id)}-desc">${h(figure.note)} ${locale === 'en' ? 'All relationships are listed in the following table.' : '全部关系见随后文字表格。'}</desc><defs><marker id="${h(id)}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker></defs><g class="h-mechanism-lines">${lines}</g><g class="h-mechanism-nodes">${boxes}</g></svg>`;
}
