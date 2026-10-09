import { writeFile, mkdir } from 'node:fs/promises';
import { trustField } from '../src/components.mjs';
import { escapeHtml as h, loadContent } from '../src/content.mjs';

const { profile } = await loadContent(new URL('../', import.meta.url));
const copy = profile.locales.en;

const destination = new URL('../public/assets/', import.meta.url);
await mkdir(destination, { recursive: true });
const field = trustField().replace(
  '<svg class="trust-field"',
  '<svg x="660" y="63" width="540" height="540"',
);
const source = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#17332e"/>
<path d="M64 75h1072M64 560h1072" stroke="#afc0ad" stroke-opacity=".22"/>
<circle cx="71" cy="140" r="4" fill="#d4b98c"/>
<g font-family="Arial, sans-serif" fill="#bfccbf"><text x="89" y="144" font-size="12" letter-spacing="3">${h(copy.heroEyebrow)}</text></g>
<text x="64" y="257" font-family="Georgia, serif" font-size="82" letter-spacing="-4" fill="#f4f0e5">${h(profile.name)}<tspan fill="#d4b98c">.</tspan></text>
<text x="64" y="348" font-family="Georgia, serif" font-size="48" fill="#f4f0e5">${h(copy.heroStatement[0])}</text>
<text x="64" y="406" font-family="Georgia, serif" font-size="48" font-style="italic" fill="#d4b98c">${h(copy.heroStatement[1])}</text>
<text x="64" y="478" font-family="Arial, sans-serif" font-size="17" fill="#b7c9b8">AI safety · Rigorous evaluation · Empirical machine learning</text>
<text x="64" y="596" font-family="Arial, sans-serif" font-size="13" letter-spacing="1" fill="#b7c9b8">${h(new URL(profile.url).hostname)}</text>
${field}
</svg>\n`;
await writeFile(new URL('social-card.svg', destination), source);
console.log('Wrote original social-card.svg. Rasterize at 1200×630 to update social-card.png.');
