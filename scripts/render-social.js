// Usage: node scripts/render-social.js 01
// Renders the day's social frames from days/_template/social/frames.html, light and dark, at full size (scale 3):
//   ig-1..5      Instagram carousel, 1080 × 1440
//   li-1..5      LinkedIn document carousel, 1080 × 1350 (packed into a PDF by package-day.js)
//   li-single    LinkedIn single image, 1080 × 1350
//   story        Instagram Story, 1080 × 1920
// Output: days/NN/social/export/NAME-THEME.png
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const day = process.argv[2], root = path.resolve(__dirname, '..');
const data = require('./social-data.js')(day);
const out = path.join(root, 'days', day, 'social', 'export');
const tpl = 'file://' + path.join(root, 'days', '_template', 'social', 'frames.html');
const jobs = [];
for (let s = 1; s <= 5; s++) { jobs.push([`ig-${s}`, 'ig-post', s]); jobs.push([`li-${s}`, 'li-portrait', s]); }
jobs.push(['li-single', 'li-portrait', 'single'], ['story', 'ig-story', 'single']);

(async () => {
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(), errs = [];
  for (const theme of ['light', 'dark']) for (const [name, fmt, slide] of jobs) {
    const p = await b.newPage({ viewport: { width: 420, height: 700 }, deviceScaleFactor: 3 });
    p.on('pageerror', e => errs.push(`${name}: ${e.message}`));
    await p.addInitScript(d => { window.DATA = d; }, data);
    await p.goto(`${tpl}?fmt=${fmt}&slide=${slide}&theme=${theme}`);
    await p.waitForFunction(() => document.body.dataset.ready, null, { timeout: 15000 });
    // nothing may spill out of its tile
    const spill = await p.evaluate(() => [...document.querySelectorAll('.tile')].filter(t => t.scrollHeight > t.clientHeight + 1 || t.scrollWidth > t.clientWidth + 1).map(t => t.className));
    if (spill.length) errs.push(`${name}-${theme}: text spills out of ${spill.join(', ')}`);
    await (await p.$('[data-frame]')).screenshot({ path: path.join(out, `${name}-${theme}.png`) });
    await p.close();
  }
  await b.close();
  if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
  console.log('exported', jobs.length * 2, 'frames to', out);
})();
