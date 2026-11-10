// Usage: node scripts/render-poster.js 01
// Renders days/NN/poster.html (A3, 1240 x 1754) to poster.jpg (2x) and thumb.jpg (for the wall).
const { chromium } = require('playwright');
const path = require('path');
const day = process.argv[2];
(async () => {
  const dir = path.resolve(__dirname, '..', 'days', day);
  const b = await chromium.launch();
  for (const [scale, out] of [[2, 'poster.jpg'], [0.65, 'thumb.jpg']]) {
    const p = await b.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: scale });
    await p.goto('file://' + path.join(dir, 'poster.html'), { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(dir, out), type: 'jpeg', quality: 92 });
    await p.close();
  }
  await b.close();
  console.log('rendered day', day);
})();
