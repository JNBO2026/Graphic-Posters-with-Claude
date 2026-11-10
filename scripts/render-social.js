// Usage: node scripts/render-social.js 01
// 1. Measures every picture frame in days/NN/social/social.html and the space the template's tiles, bars and platform zones leave free.
// 2. Makes mount-N.jpg: the whole poster, never cropped, centred in that free space on the sunken paper colour.
// 3. Exports every frame at full size (scale 3), light and dark, to days/NN/social/export/.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const day = process.argv[2];
const dir = path.resolve(__dirname, '..', 'days', day, 'social');
const poster = path.resolve(dir, '..', 'poster.jpg');
const url = q => 'file://' + path.join(dir, 'social.html') + q;
const ready = p => p.waitForFunction(() => document.body.dataset.typeset === 'done', null, { timeout: 15000 }).catch(() => {});

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1600, height: 1200 } });
  await page.goto(url('?zones=1&still=1')); await ready(page);
  const frames = await page.$$eval('[data-frame]', fs => fs.map((fr, i) => {
    const im = fr.querySelector('img'); if (!im) return null;
    const R = im.getBoundingClientRect(), scale = +fr.dataset.scale || 3;
    const obs = [...fr.querySelectorAll('.float, .zone')].map(e => e.getBoundingClientRect())
      .filter(r => r.width > 0 && r.height > 0).map(r => [Math.max(r.top, R.top) - R.top, Math.min(r.bottom, R.bottom) - R.top]);
    obs.sort((a, b) => a[0] - b[0]);
    // largest vertical band free of tiles, bars and zones
    let best = [0, 0], y = 0;
    for (const [t, bt] of obs) { if (t - y > best[1] - best[0]) best = [y, t]; y = Math.max(y, bt); }
    if (R.height - y > best[1] - best[0]) best = [y, R.height];
    return { i, src: im.getAttribute('src'), w: R.width, h: R.height, band: best, scale };
  }));
  const data = 'data:image/jpeg;base64,' + fs.readFileSync(poster).toString('base64');
  for (const f of frames.filter(Boolean)) {
    const jpg = await page.evaluate(async ({ f, data }) => {
      const s = f.scale, c = document.createElement('canvas'); c.width = Math.round(f.w * s); c.height = Math.round(f.h * s);
      const g = c.getContext('2d'); g.fillStyle = '#E1E1D9'; g.fillRect(0, 0, c.width, c.height);
      const im = new Image(); im.src = data; await im.decode();
      const pad = 14, bw = f.w - 2 * pad, bh = (f.band[1] - f.band[0]) - 2 * pad;
      const k = Math.min(bw / im.width, bh / im.height), w = im.width * k, h = im.height * k;
      const x = (f.w - w) / 2, y = f.band[0] + pad + (bh - h) / 2;
      g.shadowColor = 'rgba(16,16,16,.22)'; g.shadowBlur = 18 * s; g.shadowOffsetY = 6 * s;
      g.drawImage(im, x * s, y * s, w * s, h * s);
      return c.toDataURL('image/jpeg', 0.92);
    }, { f, data });
    fs.writeFileSync(path.join(dir, f.src), Buffer.from(jpg.split(',')[1], 'base64'));
  }
  await page.close();

  const out = path.join(dir, 'export'); fs.mkdirSync(out, { recursive: true });
  const n = frames.length;
  for (const theme of ['light', 'dark']) for (let i = 1; i <= n; i++) {
    const p = await b.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 3 });
    await p.goto(url(`?frame=${i}&theme=${theme}`)); await ready(p); await p.waitForTimeout(200);
    const fr = await p.$('[data-frame]');
    const meta = await fr.evaluate(e => e.dataset.format);
    await fr.screenshot({ path: path.join(out, `${String(i).padStart(2, '0')}-${meta}-${theme}.png`) });
    await p.close();
  }
  await b.close();
  console.log('exported', n * 2, 'frames to', out);
})();
