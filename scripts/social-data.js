// The data the social frames need for one day: poster, numbers, keywords, how it was made, logos and the mark.
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const inner = s => s.slice(s.indexOf('>') + 1, s.lastIndexOf('</svg>')).replace(/<title>.*?<\/title>/, '');
module.exports = function socialData(day) {
  const dir = path.join(root, 'days', day), meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  const prompt = fs.readFileSync(path.join(dir, 'prompt.md'), 'utf8').trim();
  const markSrc = fs.readFileSync(path.join(root, 'system/assets/brand/bo-mark.svg'), 'utf8');
  const mark = { vb: markSrc.match(/viewBox="([^"]+)"/)[1], body: inner(markSrc).replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"') };
  const codeOnly = /^code only/i.test(meta.process || ''), models = (meta.tools || []).filter(t => t.includes(':'));
  const made = meta.made || (codeOnly || !models.length ? 'Code only' : models[0].split(':').slice(1).join(':').trim() + (models.length > 1 ? ` +${models.length - 1}` : ''));

  // logos for the tools, the same way the site picks them: a model word wins, then the tool name
  const c = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(root, 'site/vendor/tool-icons.js'), 'utf8'), c); const TI = c.window.TOOL_ICONS;
  const words = Object.keys(TI.models).sort((a, b) => b.length - a.length).map(w => [new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9])`), TI.models[w]]);
  const slugFor = n => { const [t, ...r] = n.split(':'), m = r.join(':').trim().toLowerCase(); if (m) for (const [re, s] of words) if (re.test(m)) return s; return TI.tools[t.trim().toLowerCase()] || null; };
  const named = [...(meta.tools || []), ...((meta.process || '').match(/\[\[[^\]]+\]\]/g) || []).map(x => x.slice(2, -2))];
  const seen = new Set(), tools = [];
  for (const n of named) { const s = slugFor(n), label = n.includes(':') ? n.split(':').slice(1).join(':').trim() : n.trim(), k = (s || label).toLowerCase();
    if (seen.has(k) || (!s && !n.includes(':'))) continue; seen.add(k);
    const i = s && TI.icons[s]; tools.push({ label, svg: i ? `<svg viewBox="${i[0]}" fill="currentColor"${i[2] ? ' fill-rule="evenodd"' : ''}>${i[1]}</svg>` : '' }); }

  const d = new Date(meta.date + 'T12:00:00Z'), W = 2480;
  const crop = meta.social_crop || { x: .06, y: .05, w: .5 };
  return {
    day: meta.day, total: 30, title: meta.title, words: prompt.split(/\s+/).length, made, prompt,
    keywords: (meta.keywords || []).map(k => typeof k === 'string' ? k : k.text),
    process: (meta.process || '').replace(/\[\[([^\]]+)\]\]/g, '$1'), tools,
    date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    poster: 'file://' + path.join(dir, 'poster.jpg'), pw: W, crop: { x: crop.x * W, y: crop.y * W * 1.4142, w: crop.w * W },
    icons: { instagram: inner(fs.readFileSync(path.join(root, 'library/logos/instagram.svg'), 'utf8')), linkedin: inner(fs.readFileSync(path.join(root, 'library/logos/linkedin.svg'), 'utf8')) },
    mark
  };
};
