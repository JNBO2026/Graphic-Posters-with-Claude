// Usage: node scripts/render-layers.js 06
// For the Reel's exploded view: renders each layer listed in days/NN/layers.json on its own, transparent, from the poster's
// own layer mode (poster.html?layer=KEY). Still layers become days/NN/layers/KEY.png; animated ones become
// days/NN/layers/KEY/f0001.webp... for one loop at 30 fps. The output is git-ignored; rerun to rebuild it.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), http = require('http');
const day = process.argv[2], dir = path.resolve(__dirname, '..', 'days', day), out = path.join(dir, 'layers');
const list = JSON.parse(fs.readFileSync(path.join(dir, 'layers.json'), 'utf8'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(dir, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const SCALE = .7, FPS = 30;
srv.listen(0, '127.0.0.1', async () => {
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(), base = `http://127.0.0.1:${srv.address().port}/poster.html`;
  for (const L of list) {
    const p = await b.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: SCALE });
    p.on('pageerror', e => console.error(L.key, e.message));
    await p.goto(`${base}?layer=${L.key}`, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
    const secs = await p.evaluate(() => { const m = document.querySelector('meta[name="poster-motion"]'); return m ? +m.content : 0; });
    if (!L.animated || !secs) { await p.evaluate(() => window.__seek && window.__seek(0)); await p.screenshot({ path: path.join(out, `${L.key}.png`), omitBackground: true }); }
    else { fs.mkdirSync(path.join(out, L.key));
      for (let i = 0; i < secs * FPS; i++) { await p.evaluate(t => window.__seek(t), i / FPS);
        const png = await p.screenshot({ omitBackground: true, type: 'png' });
        fs.writeFileSync(path.join(out, L.key, `f${String(i + 1).padStart(4, '0')}.png`), png); } }
    await p.close();
  }
  await b.close(); srv.close();
  console.log('layers:', list.map(l => l.key).join(', '));
});
