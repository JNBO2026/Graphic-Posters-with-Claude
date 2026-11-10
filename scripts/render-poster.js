// Usage: node scripts/render-poster.js 01
// Renders days/NN/poster.html (A3, 1240 x 1754) to:
//   poster.jpg  2x still (for an animated poster: its first frame)
//   thumb.jpg   for the wall when zoomed in
//   thumb-s.jpg for the wall
//   poster.mp4  only when the poster is animated
//
// Animated posters declare it in their <head>:
//   <meta name="poster-motion" content="8">        seconds in one loop
//   <meta name="poster-motion-fps" content="30">   optional, default 30
// Frames are captured deterministically, never in real time. Each frame the
// recorder calls window.__seek(seconds) if the poster defines it (use this for
// GSAP: gsap.globalTimeline.time(t), canvas or WebGL), otherwise it pauses
// every CSS animation and Web Animation and sets their currentTime.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os'), { execFileSync } = require('child_process');
const day = process.argv[2];
const W = 1240, H = 1754;

(async () => {
  const dir = path.resolve(__dirname, '..', 'days', day);
  const url = 'file://' + path.join(dir, 'poster.html');
  const b = await chromium.launch();

  const open = async scale => {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    return p;
  };
  const seek = (p, t) => p.evaluate(t => {
    if (typeof window.__seek === 'function') return window.__seek(t);
    document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000; });
  }, t);

  const probe = await open(1);
  const motion = await probe.evaluate(() => {
    const m = document.querySelector('meta[name="poster-motion"]'), f = document.querySelector('meta[name="poster-motion-fps"]');
    return m ? { secs: parseFloat(m.content), fps: f ? parseInt(f.content, 10) : 30 } : null;
  });
  await probe.close();

  // thumb-s.jpg (558 wide) is what the wall loads; thumb.jpg (1116 wide) only when someone zooms in
  for (const [scale, out] of [[2, 'poster.jpg'], [0.9, 'thumb.jpg'], [0.45, 'thumb-s.jpg']]) {
    const p = await open(scale);
    if (motion) await seek(p, 0);
    await p.screenshot({ path: path.join(dir, out), type: 'jpeg', quality: scale < 1 ? 85 : 92 });
    await p.close();
  }

  const mp4 = path.join(dir, 'poster.mp4');
  if (motion) {
    const frames = fs.mkdtempSync(path.join(os.tmpdir(), 'frames-'));
    const p = await open(1);
    const n = Math.round(motion.secs * motion.fps);
    for (let i = 0; i < n; i++) {
      await seek(p, i / motion.fps);
      await p.screenshot({ path: path.join(frames, `f${String(i).padStart(5, '0')}.png`) });
    }
    await p.close();
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(motion.fps), '-i', path.join(frames, 'f%05d.png'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart', mp4]);
    fs.rmSync(frames, { recursive: true, force: true });
    console.log(`rendered day ${day}: still, thumb and ${motion.secs}s video at ${motion.fps}fps`);
  } else {
    fs.rmSync(mp4, { force: true });
    console.log('rendered day', day);
  }
  await b.close();
})();
