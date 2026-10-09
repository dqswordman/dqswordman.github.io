import { readFile, writeFile } from 'node:fs/promises';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/brand-ico.mjs path/to/square-icon.png');
const png = await readFile(input);
if (png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')
  throw new Error('Input must be a PNG');
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width !== height || width < 16 || width > 256)
  throw new Error('Use a square PNG between 16 and 256 pixels');
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = width === 256 ? 0 : width;
header[7] = height === 256 ? 0 : height;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(new URL('../public/favicon.ico', import.meta.url), Buffer.concat([header, png]));
console.log(`Wrote favicon.ico with the original ${width}×${height} PNG.`);
