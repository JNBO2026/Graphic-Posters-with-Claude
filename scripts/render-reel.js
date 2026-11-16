// Usage: node scripts/render-reel.js 02
// The Instagram Reel: days/_template/social/reel.html played frame by frame at 30 fps, 1080 × 1920, in the day's theme:
// 10 s, or 12.5 s when the day has a development log.
// Animated posters play inside it: their poster.mp4 frames are swapped in as the Reel runs.
// Output: days/NN/social/export/reel-light.mp4 and reel-dark.mp4
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), { execFileSync } = require('child_process');
const day = process.argv[2], root = path.resolve(__dirname, '..'), dir = path.join(root, 'days', day);
const data = require('./social-data.js')(day);
const out = path.join(dir, 'social', 'export'); fs.mkdirSync(out, { recursive: true });
const tpl = 'file://' + path.join(root, 'days', '_template', 'social', 'reel.html');
const FPS = 30;
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-'));
  const video = path.join(dir, 'poster.mp4');
  if (fs.existsSync(video)) { // the poster's own loop as stills the Reel can swap through
    const pf = path.join(tmp, 'poster'); fs.mkdirSync(pf);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-i', video, '-vf', 'scale=900:-2', '-q:v', '3', path.join(pf, '%04d.jpg')]);
    data.frames = fs.readdirSync(pf).sort().map(f => 'file://' + path.join(pf, f));
  }
  const b = await chromium.launch(), errs = [];
  for (const theme of ['light']) { // Reels are always light (James); the carousel alternates
    const p = await b.newPage({ viewport: { width: 400, height: 680 }, deviceScaleFactor: 3 });
    p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(d => { window.DATA = d; }, data);
    await p.goto(`${tpl}?theme=${theme}`);
    await p.waitForFunction(() => document.body.dataset.ready, null, { timeout: 20000 });
    const frames = path.join(tmp, theme); fs.mkdirSync(frames);
    const SECS = await p.evaluate(() => window.REEL_SECS || 10);
    const reel = await p.$('#reel');
    for (let i = 0; i < SECS * FPS; i++) {
      await p.evaluate(t => window.__seek(t), i / FPS);
      await reel.screenshot({ path: path.join(frames, `f${String(i).padStart(4, '0')}.png`) });
    }
    await p.close();
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, 'f%04d.png'),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(out, `reel-${theme}.mp4`)]);
  }
  await b.close(); fs.rmSync(tmp, { recursive: true, force: true });
  if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
  console.log('reel: light,', 'in', out);
})();
