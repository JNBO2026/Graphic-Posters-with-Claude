// Usage: node scripts/package-day.js 01
// Makes the handover: days/NN/handover/Day-NN_LinkedIn.zip, Day-NN_Instagram.zip and Day-NN_Poster.zip.
// {{LINK}} in the copy becomes the site address with this day's deep link.
const fs = require('fs'), path = require('path'), vm = require('vm'), { execFileSync } = require('child_process');
const day = process.argv[2], root = path.resolve(__dirname, '..'), dir = path.join(root, 'days', day);
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'site', 'site.config.js'), 'utf8'), ctx);
const LINK = `${ctx.window.SITE.url}#day-${day}`;
const exp = path.join(dir, 'social', 'export'), copy = path.join(dir, 'copy');
const shots = fs.readdirSync(exp).sort();
const pick = (fmt, theme) => shots.filter(f => f.includes(`-${fmt}-${theme}.png`)).map(f => path.join(exp, f));
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
  ['post-image.png', pick('li-portrait', 'light')[0]],
  ['post-copy.txt', text('linkedin-post.txt')],
  ['first-comment.txt', text('linkedin-first-comment.txt')],
  ['how-to-post.txt', text('linkedin-how-to-post.txt')],
  ['dark-version/post-image-dark.png', pick('li-portrait', 'dark')[0]],
  ...motion,
]);
pack(`${D}_Instagram`, [
  ...pick('ig-post', 'light').map((f, i) => [`Feed-carousel/${i + 1}.png`, f]),
  ['Feed-carousel/caption.txt', text('instagram-caption.txt')],
  ['Story/story.png', pick('ig-story', 'light')[0]],
  ['Story/stickers.txt', text('instagram-story-stickers.txt')],
  ['how-to-post.txt', text('instagram-how-to-post.txt')],
  ...pick('ig-post', 'dark').map((f, i) => [`dark-version/Feed-carousel/${i + 1}.png`, f]),
  ['dark-version/Story/story.png', pick('ig-story', 'dark')[0]],
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
