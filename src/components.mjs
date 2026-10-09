import { escapeHtml as h } from './content.mjs';

const paths = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  external: '<path d="M7 17 17 7M7 7h10v10"/>',
  down: '<path d="M12 4v16M6 14l6 6 6-6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  chart:
    '<path d="M4 4v16h16M8 15l4-5 4 3 5-8"/><circle cx="8" cy="15" r="1"/><circle cx="12" cy="10" r="1"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5c4 2 10 2 14 0M5 17.5c4-2 10-2 14 0"/>',
  award: '<circle cx="12" cy="8" r="5"/><path d="m8 12-2 9 6-3 6 3-2-9"/>',
  book: '<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15"/>',
  code: '<path d="m8 6-6 6 6 6M16 6l6 6-6 6M14 3l-4 18"/>',
  print: '<path d="M7 8V3h10v5M7 17H3V8h18v9h-4M7 14h10v7H7zM17 11h1"/>',
};

export function icon(name, className = '') {
  if (!paths[name]) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="icon ${h(className)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

export function monogram() {
  return '<svg class="monogram" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="m5 12 5 17 6-14 6 14 4-17M26 12h3a8.5 8.5 0 0 1 0 17h-3" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M26 12v17" stroke="currentColor" stroke-width="1.8"/></svg>';
}

// An original mathematical drawing. The mesh is rendered at build time,
// so the hero needs neither a graphics library nor a browser animation loop.
export function trustField() {
  const project = (lat, lon) => {
    let x = Math.cos(lat) * Math.cos(lon);
    let y = Math.sin(lat);
    let z = Math.cos(lat) * Math.sin(lon);
    const tilt = -0.38;
    const yy = y * Math.cos(tilt) - z * Math.sin(tilt);
    z = y * Math.sin(tilt) + z * Math.cos(tilt);
    y = yy;
    const roll = -0.36;
    const xx = x * Math.cos(roll) - y * Math.sin(roll);
    y = x * Math.sin(roll) + y * Math.cos(roll);
    x = xx;
    const scale = 185 * (1 + z * 0.09);
    return { x: 280 + x * scale, y: 280 + y * scale, z };
  };
  const line = (points, opacity) =>
    `<polyline points="${points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" opacity="${opacity}"/>`;
  const mesh = [];
  for (let i = 1; i < 19; i++) {
    const lat = -Math.PI / 2 + (i / 19) * Math.PI;
    mesh.push(
      line(
        Array.from({ length: 97 }, (_, j) => project(lat, (j / 96) * Math.PI * 2)),
        '.39',
      ),
    );
  }
  for (let i = 0; i < 32; i++) {
    const lon = (i / 32) * Math.PI * 2;
    mesh.push(
      line(
        Array.from({ length: 65 }, (_, j) => project(-Math.PI / 2 + (j / 64) * Math.PI, lon)),
        '.3',
      ),
    );
  }
  const stars = Array.from({ length: 39 }, (_, i) => {
    const x = 32 + ((i * 137.51) % 496);
    const y = 30 + ((i * 83.73) % 500);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 5 === 0 ? '1.4' : '.7'}" opacity="${i % 3 === 0 ? '.55' : '.22'}"/>`;
  }).join('');
  return `<svg class="trust-field" viewBox="0 0 560 560" fill="none" aria-hidden="true">
    <defs><radialGradient id="field-glow"><stop stop-color="#86a494" stop-opacity=".12"/><stop offset="1" stop-color="#86a494" stop-opacity="0"/></radialGradient><linearGradient id="orbit-stroke" x1="40" y1="100" x2="500" y2="460" gradientUnits="userSpaceOnUse"><stop stop-color="#d5b88b" stop-opacity=".2"/><stop offset=".52" stop-color="#d5b88b"/><stop offset="1" stop-color="#d5b88b" stop-opacity=".3"/></linearGradient></defs>
    <circle cx="280" cy="280" r="255" fill="url(#field-glow)"/>
    <g fill="#b7c9b8">${stars}</g>
    <g stroke="#9fb7a4" stroke-width=".65">${mesh.join('')}</g>
    <ellipse cx="280" cy="280" rx="249" ry="87" transform="rotate(-30 280 280)" stroke="url(#orbit-stroke)" stroke-width="1.1"/>
    <ellipse cx="280" cy="280" rx="231" ry="233" stroke="#a9b9a9" stroke-opacity=".13" stroke-dasharray="2 8"/>
    <path d="M63 130h52l42 43M403 383l43 43h52M280 31v27M280 502v27M31 280h27M502 280h27" stroke="#a6b7a5" stroke-opacity=".37" stroke-width=".8"/>
    <g fill="#dfc69e"><circle cx="157" cy="173" r="3"/><circle cx="403" cy="383" r="3"/><circle cx="477" cy="163" r="4"/></g>
    <circle class="field-pulse" cx="477" cy="163" r="10" stroke="#dfc69e" stroke-opacity=".45"/>
  </svg>`;
}
