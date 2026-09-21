// Regenerates public/sets/<slug>.jpg (framed mosaic of each set's real product photos, read from the live Google feed).
// Run: NODE_PATH=<a node_modules with sharp> node scripts/compose-set-mosaics.cjs, then bump SET_HERO_VERSION in prisma/seed.ts.
const sharp = require('sharp'); const fs = require('fs'); const path = require('path');
const OUT = 'C:/Users/leona/cmac-app/public/sets'; const W = 1200, H = 1500, G = 18, R = 26;
const BG = '#F5F1EA';
const buf = async u => Buffer.from(await (await fetch(u)).arrayBuffer());
const roundMask = (w, h) => Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${R}" ry="${R}"/></svg>`);
const badge = n => Buffer.from(`<svg width="120" height="64"><rect x="0" y="0" width="120" height="64" rx="32" fill="#1F2422"/><text x="60" y="44" font-family="Arial" font-size="34" font-weight="700" fill="#F5F1EA" text-anchor="middle">×${n}</text></svg>`);
function layout(n) {
  const iw = W - 2 * G, ih = H - 2 * G;
  const cell = (x, y, w, h) => ({ x: G + x, y: G + y, w, h });
  if (n === 3) { const w = (iw - G) / 2, h = (ih - G) / 2; return [cell(0, 0, w, ih), cell(w + G, 0, w, h), cell(w + G, h + G, w, h)]; }
  if (n === 4) { const w = (iw - G) / 2, h = (ih - G) / 2; return [0, 1, 2, 3].map(i => cell((i % 2) * (w + G), Math.floor(i / 2) * (h + G), w, h)); }
  if (n === 5) { const h1 = (ih - G) * 0.55, h2 = ih - G - h1, w2 = (iw - G) / 2, w3 = (iw - 2 * G) / 3;
    return [cell(0, 0, w2, h1), cell(w2 + G, 0, w2, h1), ...[0, 1, 2].map(i => cell(i * (w3 + G), h1 + G, w3, h2))]; }
  const w = (iw - G) / 2, h = (ih - 2 * G) / 3; return [0, 1, 2, 3, 4, 5].slice(0, n).map(i => cell((i % 2) * (w + G), Math.floor(i / 2) * (h + G), w, h));
}
(async () => {
  const xml = await (await fetch('https://cmacbeauty.ca/feeds/google.xml')).text(); const img = {};
  for (const it of xml.split('<item>').slice(1)) img[it.match(/<g:id>([^<]+)/)[1]] = it.match(/<g:image_link>([^<]+)/)[1].replace(/&amp;/g, '&');
  const src = fs.readFileSync('C:/Users/leona/cmac-app/src/lib/sets.ts', 'utf8');
  for (const m of src.matchAll(/"(set-[a-z0-9-]+)": \[([\s\S]*?)\n  \]/g)) {
    const comps = [...m[2].matchAll(/slug: "([^"]+)", qty: (\d+)/g)].map(x => ({ slug: x[1], qty: +x[2] }));
    const cells = layout(comps.length); const layers = [];
    for (let i = 0; i < comps.length; i++) {
      const c = comps[i], k = cells[i], w = Math.round(k.w), h = Math.round(k.h);
      const tile = await sharp(await buf(img[c.slug].replace('/f_auto/', '/f_jpg/'))).resize(w, h, { fit: 'cover', position: 'centre' })
        .composite([{ input: roundMask(w, h), blend: 'dest-in' }]).png().toBuffer();
      layers.push({ input: tile, left: Math.round(k.x), top: Math.round(k.y) });
      layers.push({ input: Buffer.from(`<svg width="${w}" height="${h}"><rect x="1" y="1" width="${w-2}" height="${h-2}" rx="${R}" ry="${R}" fill="none" stroke="#E4D9CB" stroke-width="2"/></svg>`), left: Math.round(k.x), top: Math.round(k.y) });
      if (c.qty > 1) layers.push({ input: badge(c.qty), left: Math.round(k.x) + 22, top: Math.round(k.y) + 22 });
    }
    await sharp({ create: { width: W, height: H, channels: 4, background: BG } }).composite(layers).flatten({ background: BG })
      .jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, m[1] + '.jpg'));
    console.log(m[1], comps.length);
  }
  const f = fs.readdirSync(OUT).filter(x => x.endsWith('.jpg'));
  const tiles = await Promise.all(f.map(x => sharp(path.join(OUT, x)).resize(400, 500).toBuffer()));
  await sharp({ create: { width: 1600, height: 1000, channels: 3, background: '#888' } }).composite(tiles.map((t, i) => ({ input: t, left: (i % 4) * 400, top: Math.floor(i / 4) * 500 }))).jpeg().toFile(process.env.TEMP + '/sets-contact.jpg');
})().catch(e => { console.error(e); process.exit(1); });
