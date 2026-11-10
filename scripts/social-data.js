// The data the social frames need for one day: poster, numbers, icons and the mark. Used by render-social.js and the review previews.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
module.exports = function socialData(day) {
  const dir = path.join(root, 'days', day), meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  const prompt = fs.readFileSync(path.join(dir, 'prompt.md'), 'utf8').trim();
  const inner = f => { const s = fs.readFileSync(f, 'utf8'); return s.slice(s.indexOf('>') + 1, s.lastIndexOf('</svg>')).replace(/<title>.*?<\/title>/, ''); };
  const markSrc = fs.readFileSync(path.join(root, 'system/assets/brand/bo-mark.svg'), 'utf8');
  const mark = { vb: markSrc.match(/viewBox="([^"]+)"/)[1], body: inner(path.join(root, 'system/assets/brand/bo-mark.svg')).replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"') };
  const codeOnly = /^code only/i.test(meta.process || ''), models = (meta.tools || []).filter(t => t.includes(':'));
  const made = meta.made || (codeOnly || !models.length ? 'Code only' : models[0].split(':').slice(1).join(':').trim() + (models.length > 1 ? ` +${models.length - 1}` : ''));
  const d = new Date(meta.date + 'T12:00:00Z');
  const W = 2480; // poster.jpg width
  const crop = meta.social_crop || { x: .06, y: .05, w: .5 }; // the close up: fractions of the poster
  return {
    day: meta.day, total: 30, words: prompt.split(/\s+/).length, made,
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    poster: 'file://' + path.join(dir, 'poster.jpg'), pw: W, crop: { x: crop.x * W, y: crop.y * W * 1.4142, w: crop.w * W },
    icons: { instagram: inner(path.join(root, 'library/logos/instagram.svg')), linkedin: inner(path.join(root, 'library/logos/linkedin.svg')) },
    mark
  };
};
