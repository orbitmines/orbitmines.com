// Generates placeholder SVGs for lore characters and book covers.
// Replace the output files by hand later — this only fills in dummies for ids
// that don't already have a real asset.
//
//   node scripts/lore/gen-images.mjs
//
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ASSETS = path.join(ROOT, 'public', 'lore-assets');

// Deterministic pleasant colour from a string.
function hue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]
  ));
}

function avatar(id, label) {
  const h = hue(id);
  const a = `hsl(${h} 55% 28%)`;
  const b = `hsl(${(h + 40) % 360} 60% 16%)`;
  const fg = `hsl(${h} 70% 80%)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
  </linearGradient></defs>
  <rect width="400" height="400" rx="28" fill="url(#g)"/>
  <circle cx="200" cy="155" r="70" fill="${fg}" opacity="0.18"/>
  <rect x="95" y="240" width="210" height="120" rx="60" fill="${fg}" opacity="0.18"/>
  <text x="200" y="210" text-anchor="middle" font-family="Georgia, serif"
    font-size="${label.length > 3 ? 92 : 120}" font-weight="700" fill="${fg}">${escapeXml(label)}</text>
</svg>`;
}

function cover(id, label) {
  const h = hue(id);
  const a = `hsl(${h} 50% 22%)`;
  const b = `hsl(${(h + 30) % 360} 55% 10%)`;
  const fg = `hsl(${h} 65% 82%)`;
  // A5 ratio 1:1.414
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 594" width="420" height="594">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/>
  </linearGradient></defs>
  <rect width="420" height="594" fill="url(#g)"/>
  <rect x="22" y="22" width="376" height="550" rx="6" fill="none" stroke="${fg}" stroke-opacity="0.35"/>
  <text x="210" y="300" text-anchor="middle" font-family="Georgia, serif"
    font-size="${label.length > 4 ? 120 : 150}" font-weight="700" fill="${fg}">${escapeXml(label)}</text>
</svg>`;
}

function write(rel, svg) {
  const file = path.join(ASSETS, rel);
  if (fs.existsSync(file)) return; // don't clobber real art
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, svg);
  console.log('  +', path.relative(ROOT, file));
}

const CHARACTERS = ['I', 'IA', 'IB', 'IC', 'II', 'IIA', 'IIB', 'IIC', 'IID', 'III', 'IIIA', 'IIIB', 'IIIC', 'S', 'B'];
const COVERS = { main: '★', I: 'I', II: 'II', III: 'III', S: 'S', B: 'B', ether: 'Eth', university: 'Uni' };

console.log('Generating placeholder lore assets...');
for (const id of CHARACTERS) write(`characters/${id}.svg`, avatar(id, `[${id}]`));
for (const [id, label] of Object.entries(COVERS)) write(`covers/${id}.svg`, cover(id, label));
console.log('Done.');
