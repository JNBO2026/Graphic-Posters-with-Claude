// Usage: node scripts/render-social.js 01
// Renders the day's social frames from days/_template/social/frames.html, light and dark, at full size (scale 3):
//   ig-1..5      Instagram carousel, 1080 × 1440
//   li-1..5      LinkedIn document carousel, 1080 × 1350 (packed into a PDF by package-day.js)
//   li-single    LinkedIn single image, 1080 × 1350
//   (the Instagram Reel is scripts/render-reel.js; there's no Story frame: James shares the carousel to his Story)
// Output: days/NN/social/export/NAME-THEME.png
// Animated posters also get NAME-THEME.mp4 for li-single and ig-1: the same frame with poster.mp4 playing in the poster's place.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
const day = process.argv[2], root = path.resolve(__dirname, '..');
const data = require('./social-data.js')(day);
const out = path.join(root, 'days', day, 'social', 'export');
const tpl = 'file://' + path.join(root, 'days', '_template', 'social', 'frames.html');
const jobs = [], holes = {}, MOTION = ['li-single', 'ig-1'];
const VIDEO = fs.existsSync(path.join(root, 'days', day, 'poster.mp4')) ? path.join(root, 'days', day, 'poster.mp4') : null;
for (let s = 1; s <= 5; s++) { jobs.push([`ig-${s}`, 'ig-post', s]); jobs.push([`li-${s}`, 'li-portrait', s]); }
jobs.push(['li-single', 'li-portrait', 'single']);

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
    const fr = await p.$('[data-frame]');
    await fr.screenshot({ path: path.join(out, `${name}-${theme}.png`) });
    // where the poster sits in the frame, in export pixels, for the video version
    if (VIDEO && MOTION.includes(name)) holes[`${name}-${theme}`] = await p.evaluate(() => {
      const f = document.querySelector('[data-frame]').getBoundingClientRect(), i = document.querySelector('[data-frame] img').getBoundingClientRect(), k = 3;
      const ev = v => Math.round(v * k / 2) * 2; return { x: ev(i.left - f.left), y: ev(i.top - f.top), w: ev(i.width), h: ev(i.height) }; });
    await p.close();
  }
  await b.close();
  // the moving versions: the branded frame as a still, the poster's own loop laid exactly over its picture
  for (const [key, h] of Object.entries(holes)) {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-i', path.join(out, `${key}.png`), '-i', VIDEO,
      '-filter_complex', `[1:v]scale=${h.w}:${h.h}:flags=lanczos[p];[0:v][p]overlay=${h.x}:${h.y}:shortest=1,format=yuv420p`,
      '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-movflags', '+faststart', path.join(out, `${key}.mp4`)]);
  }
  if (Object.keys(holes).length) console.log('videos', Object.keys(holes).length);
  if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
  console.log('exported', jobs.length * 2, 'frames to', out);
})();
