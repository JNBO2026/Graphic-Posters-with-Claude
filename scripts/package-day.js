// Usage: node scripts/package-day.js 01
// Makes the handover: days/NN/handover/Day-NN_LinkedIn.zip, Day-NN_Instagram.zip and Day-NN_Poster.zip.
// {{LINK}} in the copy becomes the site address with this day's deep link.
const fs = require('fs'), path = require('path'), vm = require('vm'), { execFileSync } = require('child_process');
const day = process.argv[2], root = path.resolve(__dirname, '..'), dir = path.join(root, 'days', day);
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'site', 'site.config.js'), 'utf8'), ctx);
const LINK = `${ctx.window.SITE.url}d/${day}`;
const exp = path.join(dir, 'social', 'export'), copy = path.join(dir, 'copy');
const shot = (name, theme) => { const f = path.join(exp, `${name}-${theme}.png`); if (!fs.existsSync(f)) throw new Error('missing export ' + f); return f; };
const slides = (fmt, theme) => [1, 2, 3, 4, 5].map(i => shot(`${fmt}-${i}`, theme));
// LinkedIn document carousel: the five 1080 × 1350 slides as one PDF
const pdf = (theme) => { const to = path.join(exp, `linkedin-carousel-${theme}.pdf`);
  execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nims=[Image.open(f).convert("RGB") for f in sys.argv[2:]]\nims[0].save(sys.argv[1], save_all=True, append_images=ims[1:], resolution=72)', to, ...slides('li', theme)]); return to; };
const text = f => fs.readFileSync(path.join(copy, f), 'utf8').replace(/\{\{LINK\}\}/g, LINK);
const out = path.join(dir, 'handover'), tmp = path.join(out, '.tmp');
fs.rmSync(out, { recursive: true, force: true });

function pack(name, files) { // files: [relative path, Buffer | source path]
  const base = path.join(tmp, name);
  for (const [rel, src] of files) {
    const to = path.join(base, rel); fs.mkdirSync(path.dirname(to), { recursive: true });
    Buffer.isBuffer(src) || typeof src !== 'string' || !fs.existsSync(src) ? fs.writeFileSync(to, src) : fs.copyFileSync(src, to);
  }
  execFileSync('zip', ['-qr', path.join(out, name + '.zip'), name], { cwd: tmp });
}
const D = `Day-${day}`;
const VIDEO = path.join(dir, 'poster.mp4'), motion = fs.existsSync(VIDEO) ? [['motion/poster.mp4', VIDEO]] : [];
for (const f of fs.readdirSync(copy)) if (/\[TEMPLATE/.test(fs.readFileSync(path.join(copy, f), 'utf8'))) throw new Error(`copy/${f} still has template text`);

pack(`${D}_LinkedIn`, [
  ['carousel.pdf', pdf('light')],
  ['post-copy.txt', text('linkedin-post.txt')],
  ['first-comment.txt', text('linkedin-first-comment.txt')],
  ['how-to-post.txt', text('linkedin-how-to-post.txt')],
  ['single-image/post-image.png', shot('li-single', 'light')],
  ['dark-version/carousel-dark.pdf', pdf('dark')],
  ['dark-version/post-image-dark.png', shot('li-single', 'dark')],
  ...motion,
]);
pack(`${D}_Instagram`, [
  ...slides('ig', 'light').map((f, i) => [`Feed-carousel/${i + 1}.png`, f]),
  ['Feed-carousel/caption.txt', text('instagram-caption.txt')],
  ['Story/story.png', shot('story', 'light')],
  ['Story/stickers.txt', text('instagram-story-stickers.txt')],
  ['how-to-post.txt', text('instagram-how-to-post.txt')],
  ...slides('ig', 'dark').map((f, i) => [`dark-version/Feed-carousel/${i + 1}.png`, f]),
  ['dark-version/Story/story.png', shot('story', 'dark')],
  ...motion,
]);
pack(`${D}_Poster`, [
  ['poster-A3.jpg', path.join(dir, 'poster.jpg')],
  ...(motion.length ? [['poster-A3.mp4', VIDEO]] : []),
  ['prompt.txt', fs.readFileSync(path.join(dir, 'prompt.md'), 'utf8')],
  ['how-it-was-made.txt', (() => { const m = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); if (!m.process) throw new Error('meta.json has no process'); return m.process.replace(/\[\[([^\]]+)\]\]/g, '$1') + (m.tools ? '\n\nTools: ' + m.tools.join(', ') : '') + ((m.skills || []).length ? '\n\nSkills used (public, free to grab):\n' + m.skills.map(x => `${x.name}: ${x.url}`).join('\n') : '') + '\n'; })()],
  ['link.txt', LINK + '\n'],
]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('handover:', fs.readdirSync(out).join(', '));
