// Usage: node scripts/package-day.js 01
// Makes the handover: days/NN/handover/Day-NN_LinkedIn.zip, Day-NN_Instagram.zip and Day-NN_Poster.zip.
// {{LINK}} in the copy becomes the site address with this day's deep link.
const fs = require('fs'), path = require('path'), vm = require('vm'), { execFileSync } = require('child_process');
const day = process.argv[2], root = path.resolve(__dirname, '..'), dir = path.join(root, 'days', day);
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'site', 'site.config.js'), 'utf8'), ctx);
const LINK = `${ctx.window.SITE.url}d/${day}`;
const exp = path.join(dir, 'social', 'export'), copy = path.join(dir, 'copy');
const shot = (name, theme) => { const f = path.join(exp, `${name}-${theme}.png`); if (!fs.existsSync(f)) throw new Error('missing export ' + f); return f; };
const SL = JSON.parse(fs.readFileSync(path.join(exp, 'slides.json'), 'utf8')), TH = SL.theme;
const slides = (fmt, theme) => Array.from({ length: SL.count }, (_, i) => shot(`${fmt}-${i + 1}`, theme));
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
    // a file path must exist; anything else is file content (text or a Buffer)
    if (typeof src === 'string' && path.isAbsolute(src) && !src.includes('\n')) { if (!fs.existsSync(src)) throw new Error('missing file for ' + rel + ': ' + src); fs.copyFileSync(src, to); }
    else fs.writeFileSync(to, src);
  }
  execFileSync('zip', ['-qr', path.join(out, name + '.zip'), name], { cwd: tmp });
}
const D = `Day-${day}`;
const VIDEO = path.join(dir, 'poster.mp4'), motion = fs.existsSync(VIDEO);
// animated posters: the branded frames as videos, the poster playing inside them
const vid = (name, theme) => { const f = path.join(exp, `${name}-${theme}.mp4`); if (!fs.existsSync(f)) throw new Error('missing video ' + f); return f; };
for (const f of fs.readdirSync(copy)) if (/\[TEMPLATE/.test(fs.readFileSync(path.join(copy, f), 'utf8'))) throw new Error(`copy/${f} still has template text`);

// one theme a day, so the Instagram grid reads as a checkerboard: odd days dark, even days light
pack(`${D}_LinkedIn`, [
  ...(motion ? [['post-video.mp4', vid('li-single', TH)]] : []),
  ['carousel.pdf', pdf(TH)],
  ['post-copy.txt', text('linkedin-post.txt')],
  ['first-comment.txt', text('linkedin-first-comment.txt')],
  ['how-to-post.txt', text('linkedin-how-to-post.txt') + (motion ? '\nThis poster moves. Post post-video.mp4 instead of the carousel: the same frame as the single image, with the poster playing in it. It gets more reach than a still. Paste the same post-copy.txt and add the same first comment. The carousel is still here if you want it another day.\n' : '')],
  ['single-image/post-image.png', shot('li-single', TH)],
]);
pack(`${D}_Instagram`, [
  ['Reel/reel.mp4', path.join(exp, `reel-${TH}.mp4`)],
  ...slides('ig', TH).map((f, i) => [`Feed-carousel/${i + 1}.png`, f]),
  ...(motion ? [['Feed-carousel/1.mp4', vid('ig-1', TH)]] : []),
  ['caption.txt', text('instagram-caption.txt')],
  ['story-stickers.txt', text('instagram-story-stickers.txt')],
  ['how-to-post.txt', text('instagram-how-to-post.txt') + (motion ? '\nThis poster moves: in the carousel, use Feed-carousel/1.mp4 as the first slide instead of 1.png.\n' : '')],
]);
pack(`${D}_Poster`, [
  ['poster-A3.jpg', path.join(dir, 'poster.jpg')],
  ...(motion ? [['poster-A3.mp4', VIDEO]] : []),
  ['prompt.txt', fs.readFileSync(path.join(dir, 'prompt.md'), 'utf8')],
  ['how-it-was-made.txt', (() => { const m = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); if (!m.process) throw new Error('meta.json has no process'); return m.process.replace(/\[\[([^\]]+)\]\]/g, '$1') + (m.tools ? '\n\nTools: ' + m.tools.join(', ') : '') + ((m.skills || []).length ? '\n\nSkills used (public, free to grab):\n' + m.skills.map(x => `${x.name}: ${x.url}`).join('\n') : '') + '\n'; })()],
  ['link.txt', LINK + '\n'],
]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('handover:', fs.readdirSync(out).join(', '));
