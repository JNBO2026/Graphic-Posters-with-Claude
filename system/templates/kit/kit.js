/* Blame Opal template kit (26 Oct 2026). Draws every picked layout from the content block in the page:
   <script type="application/json" id="bo-content">{"format": "...", "topic": "...", "frames": [{"layout": "...", ...}]}</script>
   Agents change the content, never this file. Layouts, formats and fields are listed in templates/README.md.
   URL: ?theme=dark  ?frame=2 (one frame alone, for export)  ?zones=1 (platform zones)  ?still=1 (motion at its end state)
   Rules it enforces: the framed bento, the one radius, the named type styles, acid once, words out of platform zones,
   and FB2's tile never in the same corner twice in a row (never bottom right on a Reel).
   The typography layer (27 Oct 2026, rules in kit/typography.json, built into assets.js as BO_TYPE) typesets every word:
   the character rules run on the content before it is drawn, the line break rules run once the fonts are in, and the page is
   marked data-typeset="done" when it has finished so an export never catches it half way. A \n in the content is a hard line break. */
(function () {
  const A = window.BO_SVG || { mark: '', micro: {}, icons: {} };
  const Z = window.BO_ZONES || {};
  const q = new URLSearchParams(location.search);
  const theme = q.get('theme') === 'dark' ? 'dark' : 'light';
  const only = q.get('frame');

  // typography layer, characters: the one ordered rule table (kit/typography.json), run on every word before it is drawn
  const TY = window.BO_TYPE;
  const rx = (p, f) => new RegExp(p, f || '');
  const PROTECT = TY ? rx('(' + TY.protect.join('|') + ')', 'gi') : null;
  const fixText = t => TY && typeof t === 'string'
    ? t.trim().split(PROTECT).map((p, i) => i % 2 ? p : TY.characters.reduce((a, r) => a.replace(rx(r.find, r.flags), r.replace), p)).join('') : t;
  window.BO_TYPESET = fixText; // exposed so the tests can hold the browser to the same table as the Python and hosted versions
  const NOT_WORDS = new Set(['layout', 'image', 'focus', 'format', 'page', 'micro', 'micros', 'corner', 'theme', 'preview', 'actions', 'kind', 'mark']);
  const typesetData = v => Array.isArray(v) ? v.map(typesetData)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, NOT_WORDS.has(k) ? x : typesetData(x)]))
    : fixText(v);
  const br = t => String(t).replace(/\n/g, '<br>');

  const FORMATS = {
    'li-square':   { w: 360, h: 360, scale: 3, name: 'LinkedIn square, 1080 × 1080' },
    'li-portrait': { w: 360, h: 450, scale: 3, name: 'LinkedIn portrait, 1080 × 1350' },
    'li-landscape':{ w: 400, h: 209, scale: 3, name: 'LinkedIn landscape, 1200 × 627' },
    'li-banner':   { w: 528, h: 132, scale: 3, name: 'LinkedIn banner, 1584 × 396' },
    'ig-post':     { w: 360, h: 480, scale: 3, name: 'Instagram carousel, 1080 × 1440', ring: true },
    'ig-story':    { w: 360, h: 640, scale: 3, name: 'Instagram Story, 1080 × 1920', zone: 'Instagram Story' },
    'ig-reel':     { w: 360, h: 640, scale: 3, name: 'Reel cover, 1080 × 1920', zone: 'Reel cover' },
    'deck':        { w: 640, h: 360, scale: 3, name: 'Slide, 1920 × 1080' },
    'doc':         { w: 420, h: 594, scale: 3, name: 'A4 page' },
    'link':        { w: 600, h: 315, scale: 2, name: 'Link card, 1200 × 630' },
    'readme':      { w: 640, h: 320, scale: 2, name: 'README banner, 1280 × 640' },
    'oscard':      { w: 240, h: 240, scale: 2, name: 'Open source card' },
    'video':       { w: 640, h: 360, scale: 3, name: 'Video, 1920 × 1080' },
    'short':       { w: 360, h: 640, scale: 3, name: 'Short or Reel, 1080 × 1920', zone: 'Reel cover' },
    'thumb':       { w: 640, h: 360, scale: 2, name: 'Thumbnail, 1280 × 720' },
  };

  // assets
  const size = (s, w, h) => s.replace(/width="[\d.]+" height="[\d.]+"/, `width="${w}" height="${h}"`);
  const bo = w => A.mark ? size(A.mark, w, Math.round(w * 16 / 60) * 2) : '';
  const micro = (n, z = 28) => A.micro[n] ? size(A.micro[n], z, z) : '';
  const icon = (n, z = 16) => A.icons[n] ? size(A.icons[n], z, z).replace(/stroke-width="1\.5"/, `stroke-width="${+(1.5 * 24 / z).toFixed(3)}"`) : '';
  const img = (src, focus, extra = '') => `<div class="tl img"${extra}><img src="${src}" alt="" style="object-position:${focus || '50% 50%'}"></div>`;
  const k = t => t ? `<span class="k">${br(t)}</span>` : '';
  const T = (cls, t) => t ? `<span class="${cls}">${br(t)}</span>` : '';
  // short frames (LinkedIn landscape) step down a size so the headline never clips
  const big = x => x && x.h <= 240 ? 'bo-text-title-strong' : 'bo-text-heading-large';
  const head = x => x.h <= 240 ? 'bo-text-title-strong' : x.w < 300 ? 'bo-text-title-strong' : 'bo-text-heading-small';

  // the framed bento: masthead and footer around the tiles, pushed clear of the platform's zones
  // slides drop the masthead and keep one quiet line at the foot (F3, picked 27 Oct 2026)
  function frame(x, rows, cols, body, topic, page) {
    if (x.deck) return { cls: 'fr', style: `grid-template-rows:${rows} auto;${cols ? 'grid-template-columns:' + cols : ''}`, html: body + `<div class="tl foot line" style="grid-column:1/-1"><span class="lock">${bo(18)}blame opal</span><span class="bo-text-meta sec">${[topic ?? x.topic, page ?? x.page].filter(Boolean).join(' · ')}</span></div>` };
    const mast = `<div class="tl mast" style="grid-column:1/-1;min-height:${32 + x.zt}px;align-items:flex-end;padding-bottom:10px"><span class="lock">${bo(22)}blame opal</span><span class="k">${topic ?? x.topic}</span></div>`;
    const foot = `<div class="tl foot" style="grid-column:1/-1;min-height:${28 + x.zb}px;align-items:flex-start;padding-top:8px"><span class="bo-text-meta sec">blameopal.studio</span><span class="bo-text-meta sec">${page ?? x.page}</span></div>`;
    return { cls: 'fr', style: `grid-template-rows:auto ${rows} auto;${cols ? 'grid-template-columns:' + cols : ''}`, html: mast + body + foot };
  }
  const stat = s => `<div class="tl">${T('bo-text-heading-small', s.value)}${k(s.label)}</div>`;
  // quotes and terms (picked 7 Nov 2026): rows of a name and a plain line. kv rows put the line in a second column (34%, or 46% with wide),
  // left aligned in the secondary colour, so a long line wraps under itself and never beside the name. Plain rows put an amount on the right
  const kv = (rows, wide) => `<div class="rows kv${wide ? ' wide' : ''}">${(rows || []).map(([a, b]) => `<div><span class="bo-text-body-small">${br(a)}</span><span class="bo-text-body-small sec">${br(b || '')}</span></div>`).join('')}</div>`;
  const amounts = rows => `<div class="rows amt">${(rows || []).map(([a, b]) => `<div><span class="bo-text-body-small">${br(a)}</span><span class="bo-text-body-small">${br(b || '')}</span></div>`).join('')}</div>`;
  const qtile = (label, body) => `<div class="tl qt">${k(label)}<span class="qbody">${body}</span></div>`;

  // Viewfinder (P1, picked 27 Oct 2026): the picture as a canvas. Corner brackets, the lockup and page chips, and a selection box
  // drawn in acid with its tag and size. sel is the box in % of the frame: [left, top, width, height]
  function vfChrome(c, x) {
    const [l, t, w, h] = c.sel || [24, 30, 50, 26], hd = [[0, 0], [50, 0], [100, 0], [0, 50], [100, 50], [0, 100], [50, 100], [100, 100]];
    return `<i class="vfb tl_"></i><i class="vfb tr_"></i><i class="vfb bl_"></i><i class="vfb br_"></i>
      <div class="float chipf vfchip" style="--i:0;left:14px;top:${x.zt + 14}px"><span class="lock">${bo(20)}blame opal</span></div>
      ${x.page ? `<div class="float chipf vfchip" style="--i:0;right:14px;top:${x.zt + 14}px"><span class="bo-text-meta vfmono">${x.page}</span></div>` : ''}
      <div class="vfsel" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%">${hd.map(([a, b]) => `<i class="vfh" style="left:${a}%;top:${b}%"></i>`).join('')}
        ${c.sel_label ? `<span class="vftag bo-text-meta" style="bottom:calc(100% + 6px);left:0">${c.sel_label}</span>` : ''}${c.sel_size ? `<span class="vftag bo-text-meta vfmono" style="top:calc(100% + 6px);left:50%;transform:translateX(-50%)">${c.sel_size}</span>` : ''}</div>`;
  }

  // FB2: the corner moves, the bar takes the opposite edge
  let lastCorner = null;
  function corner(want, x) {
    const allowed = ['tl', 'br', 'tr', 'bl'].filter(c => !(x.rail && c === 'br'));
    // an explicit corner is kept unless it repeats the last frame's; otherwise the next corner in the cycle
    let c = allowed.includes(want) && want !== lastCorner ? want : allowed[(allowed.indexOf(lastCorner) + 1) % allowed.length];
    lastCorner = c; return c;
  }
  function fb2(c, x, tilew) {
    const cr = corner(c.corner || 'auto', x), top = x.zt + 8, bot = x.zb + 8;
    const tv = cr[0] === 't' ? `top:${top}px` : `bottom:${bot}px`, th = cr[1] === 'l' ? 'left:8px' : 'right:8px';
    const bv = cr[0] === 't' ? `bottom:${bot}px` : `top:${top}px`, br = x.rail && cr[0] === 't' ? '80px' : '8px';
    return { cls: 'bleed', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}">
      <div class="float glass bar" style="--i:0;left:8px;right:${br};${bv}"><span class="lock">${bo(22)}blame opal</span><span class="k">${[c.topic || x.topic, c.page ?? x.page].filter(Boolean).join(' · ')}</span></div>
      <div class="float tile" style="--i:1;${tv};${th};width:${tilew || (x.w > 500 ? '40%' : '58%')}">${k(c.label)}${T(head(x), c.title)}</div>` };
  }

  // Viewfinder helpers (27 Oct 2026): the selection, the cursor (Lucide mouse-pointer-2) with its name tag, brackets and chips, all clear of the platform zones
  const HD = [[0, 0], [50, 0], [100, 0], [0, 50], [100, 50], [0, 100], [50, 100], [100, 100]];
  const handles = () => HD.map(([a, b]) => `<i class="vfh" style="left:${a}%;top:${b}%"></i>`).join('');
  // the tag names the layer (Instrument Sans), the size under it is data (Geist Mono)
  const sel = ([l, t, w, h], label, sz) => `<div class="vfsel" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%">${handles()}${label ? `<span class="vftag bo-text-meta" style="bottom:calc(100% + 6px);left:0">${label}</span>` : ''}${sz ? `<span class="vftag bo-text-meta vfmono" style="top:calc(100% + 6px);left:50%;transform:translateX(-50%)">${sz}</span>` : ''}</div>`;
  const cursor = at => `<div class="vfcur" style="left:${at[0]}%;top:${at[1]}%">${icon('mouse-pointer-2', 18)}<span class="vfcurtag bo-text-meta">blame opal</span></div>`;
  const brackets = () => ['tl_', 'tr_', 'bl_', 'br_'].map(s => `<i class="vfb ${s}"></i>`).join('');
  const chips = (x, leftOnly) => `<div class="float chipf vfchip" style="left:14px;top:${x.zt + 14}px"><span class="lock">${bo(20)}blame opal</span></div>${x.page && !leftOnly ? `<div class="float chipf vfchip" style="right:14px;top:${x.zt + 14}px"><span class="bo-text-meta vfmono">${x.page}</span></div>` : ''}`;
  // Type selection and Acid field: the title's lines, one of them selected. Tags sit beside the line, or under it when it is the last
  function wordSel(c) { const ls = String(c.title || '').split('\n'), last = c.sel_line === ls.length - 1;
    const pa = last ? 'top:calc(100% + 6px);left:0' : 'left:calc(100% + 8px);top:0', pb = last ? 'top:calc(100% + 6px);right:0' : 'left:calc(100% + 8px);bottom:0';
    return ls.map((l, i) => i === c.sel_line ? `<span class="vfsl">${l}<span class="vfsel" style="inset:-2px -8px 0 -8px">${handles()}${c.sel_label ? `<span class="vftag bo-text-meta" style="${pa}">${c.sel_label}</span>` : ''}${c.sel_size ? `<span class="vftag bo-text-meta vfmono" style="${pb}">${c.sel_size}</span>` : ''}</span></span>` : l).join('<br>'); }

  // the workflow header: label and title on the left, an arrow on the right
  const wfHead = c => `<div class="tl" style="grid-column:1/-1;flex-direction:row;justify-content:space-between;align-items:flex-end;padding:16px 20px"><span style="display:flex;flex-direction:column;gap:4px">${k(c.label)}${T('bo-text-heading-small', c.title)}</span>${icon('arrow-right', 16)}</div>`;
  // lede: a paragraph set large. **phrases** stay in full ink and the rest steps back to the disabled text colour, so it can be skimmed
  const lede = t => !t ? '' : /\*\*/.test(t) ? `<span class="bo-text-title-lede em">${br(t).replace(/\*\*(.+?)\*\*/g, '<span class="on">$1</span>')}</span>` : T('bo-text-title-lede', t);
  // The cursor as the picture (8 Nov 2026). The blame opal cursor drawn large, in one colour only: a solid fill (opal, ink or acid) or an outline
  // (opal-line, ink-line or acid-line), never both. The tag is optional and grows with the cursor, stepping through the named text styles
  const CUR = 'M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z';
  const COL = { opal: 'var(--bo-color-opal-100)', ink: 'var(--bo-color-ink-1000)', acid: 'var(--acid)' };
  const tagStyle = z => z >= 140 ? 'bo-text-heading-small' : z >= 96 ? 'bo-text-title-strong' : z >= 64 ? 'bo-text-label' : 'bo-text-meta';
  const ev2 = v => Math.max(2, Math.round(v / 2) * 2);
  // rot turns the cursor about its tip so its body can sit in empty space; tagAt places the tag on its own (in % of the frame)
  const bigCur = (at, size = 72, look = 'ink', tag = '', rot = 0, tagAt = null) => {
    const [col, line] = String(look).split('-'), paint = COL[col] || COL.ink, sw = +(2 * 24 / size).toFixed(3);
    const path = line ? `<path d="${CUR}" fill="none" stroke="${paint}" stroke-width="${sw}" stroke-linejoin="round"/>` : `<path d="${CUR}" fill="${paint}"/>`;
    const tone = col === 'opal' && !line ? 'opal' : 'ink';
    const pad = `padding:${ev2(size / 24)}px ${ev2(size / 8)}px`;
    const t = tag ? `<span class="bctag ${tone} ${tagStyle(size)}" style="${pad};${tagAt ? `position:absolute;left:${tagAt[0]}%;top:${tagAt[1]}%;margin:0` : `margin:${-ev2(size / 18)}px 0 0 ${ev2(size / 2)}px`}">${tag}</span>` : '';
    const c = `<div class="bcur" style="left:calc(${at[0]}% - ${size * 4 / 24}px);top:calc(${at[1]}% - ${size * 4 / 24}px);--s:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="transform:rotate(${rot}deg);transform-origin:${100 * 4 / 24}% ${100 * 4 / 24}%">${path}</svg>${tagAt ? '' : t}</div>`;
    return tagAt ? c + t.replace('class="bctag', 'class="bctag bcfree') : c; };
  // alt text shown the way a browser tooltip would: the attribute name in mono, then the description
  const altTip = (at, text, w) => `<div class="calt" style="left:${at[0]}%;top:${at[1]}%${w ? `;width:${w}%` : ''}"><span class="bo-text-meta vfmono sec">alt</span>${T('bo-text-body-small', text)}</div>`;
  const L = {
    // social and shared
    statement: (c, x) => frame(x, '1fr 96px', '1fr 1fr', `<div class="tl${c.ink ? ' ink' : ''}" style="grid-column:1/-1;justify-content:flex-end;padding:16px">${k(c.label)}${T(big(x), c.title)}${T('bo-text-body-small sec', c.body)}</div>
      <div class="tl" style="justify-content:flex-end">${micro(c.micro || 'asterisk')}</div><div class="tl" style="justify-content:space-between">${bo(30)}<span class="k">we give a sh*t.</span></div>`),
    list: (c, x) => frame(x, '1fr auto', null, `<div class="tl" style="justify-content:flex-end;padding:16px">${k(c.label)}${T(big(x), c.title)}</div>
      <div class="tl">${k(c.list_label)}<div class="list">${(c.items || []).map(([a, b]) => `<div><span class="bo-text-body-small">${a}</span><span class="bo-text-meta sec">${b || ''}</span></div>`).join('')}</div></div>`),
    work: (c, x) => frame(x, '1fr auto auto', '1fr 1fr', `${img(c.image, c.focus, ' style="grid-column:1/-1"')}<div class="tl" style="grid-column:1/-1">${k(c.label)}${T(x.w > 500 ? 'bo-text-heading-small' : 'bo-text-title-strong', c.title)}${T('bo-text-body-small sec', c.body)}</div>
      ${(c.stats || []).slice(0, 2).map(stat).join('')}${(c.stats || []).length < 2 ? `<div class="tl" style="justify-content:space-between">${k(c.client)}${T('bo-text-meta sec', c.year)}</div>` : ''}${c.sticker ? `<div class="tl" style="grid-column:1/-1"><div class="ph" style="height:52px">${c.sticker}</div></div>` : ''}`),
    // short frames put the headline beside the two detail tiles, so it keeps its height
    announce: (c, x) => frame(x, x.h <= 240 ? '1fr 1fr' : '1fr auto', x.h <= 240 ? '1.3fr 1fr' : '1fr 1fr', `<div class="tl" style="${x.h <= 240 ? 'grid-row:span 2' : 'grid-column:1/-1'};justify-content:flex-end;padding:16px">${k(c.label)}${T(big(x), c.title)}${T('bo-text-body-small sec', c.body)}</div>
      <div class="tl" style="justify-content:flex-end">${k(c.detail_label)}${T('bo-text-body-small', c.detail)}</div>
      <div class="tl" style="justify-content:flex-end"><span class="k" style="display:flex;align-items:center;gap:6px"><i class="dot"></i>${c.ask_label || ''}</span>${T('bo-text-ui-button', c.ask)}</div>`),
    question: (c, x) => frame(x, '1fr auto', null, `<div class="tl" style="justify-content:flex-end;padding:16px">${k(c.label)}${T(big(x), c.title)}</div><div class="tl"><div class="ph" style="height:150px">${c.sticker || 'Question or poll sticker'}</div></div>`),
    photo: (c, x) => frame(x, '1fr auto', '1.6fr 1fr', `${img(c.image, c.focus, ' style="grid-column:1/-1"')}<div class="tl">${k(c.label)}${T('bo-text-title-strong', c.title)}</div><div class="tl" style="align-items:flex-end;justify-content:flex-end">${bo(30)}</div>`),
    item: (c, x) => frame(x, '1fr auto auto', '1fr 1fr', `${img(c.image, c.focus, ' style="grid-column:1/-1"')}<div class="tl" style="grid-column:1/-1">${k(c.label)}${T('bo-text-heading-small', c.title)}${T('bo-text-body-small sec', c.body)}</div>${(c.stats || []).slice(0, 2).map(stat).join('')}`),
    point: (c, x) => frame(x, '1fr auto', null, `<div class="tl" style="justify-content:flex-end;padding:16px">${k(c.label)}${T(big(x), c.title)}</div><div class="tl">${T('bo-text-body-small sec', c.body)}</div>`),
    film: (c, x) => frame(x, '1fr auto', null, `${img(c.image, c.focus)}<div class="tl" style="padding-right:${x.rail ? 84 : 12}px">${k(c.label)}${T('bo-text-heading-small', c.title)}</div>`),
    fb2: (c, x) => fb2(c, x),
    c1: (c, x) => frame(x, `1fr ${x.h <= 340 ? 72 : x.h > 600 ? 120 : 88}px`, '1fr '.repeat((c.micros || ['asterisk', 'nautilus-spiral']).slice(0, 2).length), `<div class="tl" style="grid-column:1/-1;justify-content:flex-end;padding:16px">${k(c.label)}${T(x.h <= 340 && x.w <= 620 ? 'bo-text-heading-small' : big(x), c.title)}</div>`
      + (c.micros || ['asterisk', 'nautilus-spiral']).slice(0, 2).map(m => `<div class="tl" style="align-items:center;justify-content:center">${micro(m)}</div>`).join('')),
    e2: (c, x) => frame(x, '1fr', null, `<div class="tl ink" style="justify-content:space-between;padding:16px">${bo(x.h > 500 ? 130 : x.h > 400 ? 110 : 90)}<span style="display:flex;flex-direction:column;gap:6px">${T('bo-text-heading-small', c.title)}<span class="k" style="display:flex;align-items:center;gap:6px"><i class="dot"></i>${c.ask || ''}</span></span></div>`),
    banner: (c, x) => ({ cls: 'fr', style: 'grid-template-columns:0.9fr 1.2fr 0.8fr', html: `<div class="tl" style="align-items:flex-end">${micro(c.micro || 'nine-circle-grid', 24)}</div><div class="tl" style="justify-content:flex-end">${k(c.label)}${T('bo-text-title-strong', c.title)}</div><div class="tl" style="justify-content:flex-end;align-items:flex-end"><span class="lock" style="font-size:16px">${bo(34)}blame opal</span></div><i class="zone" style="left:16px;top:58px;width:120px;height:74px"><b>Profile photo</b></i>` }),
    // full pictures, picked 27 Oct 2026: Edge to edge (a lockup chip and one glass caption) and Type on the picture (one big line on a scrim)
    bleed: (c, x) => ({ cls: 'bleed', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}">
      <div class="float glass chipf" style="left:${8 + x.zs}px;top:${x.zt + 8}px"><span class="lock">${bo(20)}blame opal</span>${T('bo-text-meta sec', x.page)}</div>
      <div class="float glass" style="left:${8 + x.zs}px;bottom:${x.zb + 8}px;max-width:${x.rail ? 'calc(100% - 104px)' : x.w > 500 ? '46%' : '80%'};padding:12px 14px">${k(c.label)}${T(x.w > 500 ? 'bo-text-heading-small' : 'bo-text-title-strong', c.title)}</div>` }),
    type: (c, x) => ({ cls: 'bleed onpic', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}"><i class="scrim"></i>
      <span class="lock" style="position:absolute;left:${12 + x.zs}px;top:${x.zt + 12}px">${bo(20)}blame opal</span>${x.page ? `<span class="bo-text-meta" style="position:absolute;right:${12 + x.zs}px;top:${x.zt + 14}px">${x.page}</span>` : ''}
      <div style="position:absolute;left:${14 + x.zs}px;right:${x.rail ? 88 : 14 + x.zs}px;bottom:${x.zb + 14}px;display:flex;flex-direction:column;gap:6px">${k(c.label)}${T(x.w > 500 ? 'bo-text-display-large' : 'bo-text-heading-large', c.title)}</div>` }),
    // Viewfinder: the chrome, an optional "Use it for" callout, then the word tile and one acid number tile at the foot
    vf: (c, x) => ({ cls: 'bleed vfr', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}">${vfChrome(c, x)}
      ${c.use ? `<div class="vfuse" style="left:${(c.use_at || [26, 10])[0]}%;top:${(c.use_at || [26, 10])[1]}%"><i class="vfbo">${bo(16)}</i><div class="tl">${k('Use it for')}${T('bo-text-body-small', c.use)}</div></div>` : ''}
      <div class="vffoot" style="bottom:${x.zb + 8}px;height:${x.h > 600 ? 30 : 38}%"><div class="tl" style="--i:1">${k(c.meta)}<span style="flex:1"></span>${T('bo-text-heading-small', c.title)}${c.repo ? `<span class="bo-text-meta vfmono sec">${c.repo}</span>` : ''}${T('bo-text-body-small sec', c.body)}</div>
      ${c.stat ? `<div class="tl acid" style="--i:2">${k(c.stat_label)}<span style="flex:1"></span>${T(c.stat.length > 5 ? 'bo-text-heading-small' : 'bo-text-heading-large', c.stat)}<span class="k" style="margin-top:6px">${c.ask || 'Swipe'}</span></div>` : ''}</div>` }),
    // Instagram library (picked 27 Oct 2026). Covers that double as end frames: the framed bento, copy heavy, no hairline. Layers, Acid tile, Acid field
    layers: (c, x) => frame(x, '1fr auto', '1.45fr 1fr', `<div class="tl" style="grid-column:1/-1;justify-content:flex-end;padding:16px">${k(c.label)}${T(big(x), c.title)}${T('bo-text-body-small sec', c.body)}</div>
      <div class="tl">${`<div class="row">${k(c.list_label)}${T('bo-text-meta sec', c.list_note)}</div>`}<div class="vfrows">${(c.items || []).map(([a, b], i) => `<div class="${i === c.mark ? 'acid' : ''}"><span class="bo-text-meta sec">${String(i + 1).padStart(2, '0')}</span><span class="bo-text-body-small">${a}</span><span class="bo-text-meta sec">${b || ''}</span></div>`).join('')}</div></div>
      <div class="tl" style="justify-content:space-between">${micro(c.micro || 'layer-stack', 24)}<span style="display:flex;flex-direction:column;gap:4px">${k(c.side_label)}${T('bo-text-title-strong', c.side)}</span></div>`),
    // acid as a ground: the hero tile is acid (Acid tile), or the whole frame is the acid field (full: true). Still one acid per frame, ink on it
    field: (c, x) => c.full ? {
      cls: 'vffield', html: `<i class="vfb tl_ ink_"></i><i class="vfb tr_ ink_"></i><i class="vfb bl_ ink_"></i><i class="vfb br_ ink_"></i>
        <div class="row" style="margin-top:${x.zt}px"><span class="lock">${bo(22)}blame opal</span><span class="bo-text-meta">${x.page || x.topic}</span></div>
        <span style="flex:1"></span>${k(c.label)}<span class="bo-text-display-large">${wordSel(c, x)}</span>${T('bo-text-body', c.body)}
        ${c.sticker ? `<div class="ph" style="flex:none;height:110px;margin:6px 0 ${x.zb}px">${c.sticker}</div>` : `<div class="row vfrule" style="margin-bottom:${x.zb}px"><span class="bo-text-ui-button">${c.ask || ''}</span><span class="k">${c.sign || ''}</span></div>`}` }
      : frame(x, '1fr auto', '1fr 1fr', `<div class="tl acid" style="grid-column:1/-1;justify-content:space-between;padding:16px"><span class="vfmark">${bo(x.h > 500 ? 120 : 96)}</span><span style="display:flex;flex-direction:column;gap:6px">${k(c.label)}${T(big(x), c.title)}</span></div>
        <div class="tl" style="justify-content:flex-end">${k(c.note_label)}${T('bo-text-body-small', c.note)}</div>
        <div class="tl" style="justify-content:space-between">${micro(c.micro || 'asterisk', 24)}${k(c.sign || c.foot)}</div>`),
    // Type selection (end frame or Story): a big line on ink, one line selected like a text layer
    word: (c, x) => ({ cls: 'vfword', html: `<div class="row" style="margin-top:${x.zt}px"><span class="lock">${bo(22)}blame opal</span><span class="bo-text-meta vfmono">${x.page || ''}</span></div>
      <span style="flex:1"></span>${k(c.label)}${T('bo-text-heading-small sec', c.lede)}<span class="${c.hero ? 'bo-text-display-hero' : 'bo-text-display-large'}">${wordSel(c, x)}</span><span style="flex:1"></span>
      <div class="vfwfoot" style="margin-bottom:${x.zb}px">${T('bo-text-title-strong', c.ask)}${T('bo-text-body-small sec', c.body)}<div class="row vfrule"><span class="k">${c.sign || ''}</span><span class="bo-text-meta sec">blameopal.studio</span></div></div>` }),
    // Viewfinder interiors: the picture leads, the hairline goes round it. Inspector, Selection and cursor, Rulers and guides, Before and after, Crop, Acid wipe
    insp: (c, x) => ({ cls: 'bleed vfr', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}">${brackets()}${chips(x, true)}${c.sel ? sel(c.sel, c.sel_label, c.sel_size) : ''}${c.cursor ? cursor(c.cursor) : ''}
      <div class="vfins" style="top:${x.zt + 8}px;bottom:${x.zb + 8}px"><div class="row">${k('Inspector')}<span class="bo-text-meta sec vfmono">${x.page || ''}</span></div>
        <div class="vftabs">${['Layer', 'Info', 'Export'].map((t, i) => `<span class="bo-text-meta${i === (c.tab || 0) ? ' on' : ''}">${t}</span>`).join('')}</div>
        <div class="vfsec">${k(c.meta)}${T('bo-text-heading-small', c.title)}${c.file ? `<span class="bo-text-meta vfmono sec">${c.file}</span>` : ''}</div>
        ${T('bo-text-body-small', c.body)}
        ${c.stat ? `<div class="tl acid vfstat">${k(c.stat_label)}${T('bo-text-heading-large', c.stat)}</div>` : ''}
        <div class="vfsec">${(c.facts || []).map(([a, b]) => `<div class="row">${k(a)}<span class="bo-text-meta">${b}</span></div>`).join('')}</div>
        <span style="flex:1"></span><div class="row vfrule">${T('bo-text-ui-button', c.ask || 'Swipe')}${T('bo-text-meta sec', c.next)}</div></div>` }),
    // Cursor carousel (8 Nov 2026), options offered beside the Selection and cursor frame
    // cbig: a picture with the cursor drawn large over it, pointing at the subject
    cbig: (c, x) => ({ cls: 'bleed vfr', html: `<img src="${c.image}" alt="${c.alt || ''}" style="object-position:${c.focus || '50% 50%'}">${brackets()}${chips(x)}${bigCur(c.cursor || [50, 40], c.size || 72, c.look || 'ink', c.tag, c.rot, c.tag_at)}
      <div class="float tile" style="--i:1;left:8px;bottom:${x.zb + 8}px;width:${c.wide ? 'calc(100% - 16px)' : '64%'};padding:14px">${k(c.label)}${T('bo-text-heading-small', c.title)}${T('bo-text-body-small sec', c.body)}</div>` }),
    // calt: the cursor hovering a picture, its alt text showing beside it
    calt: (c, x) => ({ cls: 'bleed vfr', html: `<img src="${c.image}" alt="${c.alt || ''}" style="object-position:${c.focus || '50% 50%'}">${brackets()}${chips(x)}${bigCur(c.cursor || [40, 40], c.size || 48, c.look || 'ink', c.tag, c.rot, c.tag_at)}${altTip(c.alt_at || [52, 50], c.alt, c.alt_w)}
      <div class="float tile" style="--i:1;left:8px;${c.tile_top ? `top:${x.zt + 48}px` : `bottom:${x.zb + 8}px`};width:${c.wide ? 'calc(100% - 16px)' : (c.tile_w || 64) + '%'};padding:14px">${k(c.label)}${T('bo-text-heading-small', c.title)}${T('bo-text-body-small sec', c.body)}</div>` }),
    // cclick: a type frame where the cursor clicks the one acid button, three rings where it lands
    cclick: (c, x) => ({ cls: 'vfplain', html: `<div class="row" style="margin-top:${x.zt}px"><span class="lock">${bo(22)}blame opal</span><span class="bo-text-meta vfmono">${x.page || ''}</span></div>
      <span style="flex:1"></span>${k(c.label)}${T('bo-text-heading-large', c.title)}${T('bo-text-body sec', c.body)}
      <div class="cbtnrow" style="margin-bottom:${x.zb + 72}px"><span class="cbtnwrap"><span class="cbtn bo-text-ui-button">${c.ask || 'Save this'}</span><span class="crings"><i></i><i></i><i></i></span>${bigCur([0, 0], c.size || 56, c.look || 'ink', c.tag)}</span></div>` }),
    // cduo: two cursors on one selection, blame opal and the person reading
    cduo: (c, x) => ({ cls: 'bleed vfr', html: `<img src="${c.image}" alt="${c.alt || ''}" style="object-position:${c.focus || '50% 50%'}">${brackets()}${chips(x)}${c.sel ? sel(c.sel, c.sel_label, c.sel_size) : ''}${bigCur(c.cursor || [60, 50], c.size || 56, c.look || 'opal', c.tag ?? 'blame opal', c.rot, c.tag_at)}${bigCur(c.cursor2 || [30, 30], c.size || 56, c.look2 || 'acid-line', c.tag2 ?? 'you', c.rot2, c.tag2_at)}
      <div class="float tile" style="--i:1;left:8px;bottom:${x.zb + 8}px;width:${c.wide ? 'calc(100% - 16px)' : '64%'};padding:14px">${k(c.label)}${T('bo-text-heading-small', c.title)}${T('bo-text-body-small sec', c.body)}</div>` }),
    // cdrag: a big line on ink, one line picked up by the cursor and moved, the gap it left still showing
    cdrag: (c, x) => { const ls = String(c.title || '').split('\n'); return { cls: 'vfword', html: `<div class="row" style="margin-top:${x.zt}px"><span class="lock">${bo(22)}blame opal</span><span class="bo-text-meta vfmono">${x.page || ''}</span></div>
      <span style="flex:1"></span>${k(c.label)}<span class="bo-text-heading-large cdrag">${ls.map((l, i) => i === (c.sel_line || 0) ? `<span class="cghost">${l}<span class="cmoved"><span class="vfsel" style="inset:-2px -8px 0 -8px">${handles()}</span>${l}${bigCur([70, 60], c.size || 64, c.look || 'opal', c.tag)}</span></span>` : l).join('<br>')}</span>
      ${T('bo-text-body', c.body)}<div class="row vfrule" style="margin-bottom:${x.zb}px"><span class="bo-text-ui-button">${c.ask || ''}</span><span class="k">${c.sign || ''}</span></div>` }; },
    // cfield: the whole frame acid, the cursor huge in ink, the line under it
    cfield: (c, x) => ({ cls: 'vffield', html: `<i class="vfb tl_ ink_"></i><i class="vfb tr_ ink_"></i><i class="vfb bl_ ink_"></i><i class="vfb br_ ink_"></i>
      <div class="row" style="margin-top:${x.zt}px"><span class="lock">${bo(22)}blame opal</span><span class="bo-text-meta">${x.page || x.topic}</span></div>
      <div style="flex:1;position:relative">${bigCur(c.cursor || [30, 14], c.size || 168, c.look || 'ink', c.tag)}</div>${k(c.label)}${T('bo-text-display-large', c.title)}${T('bo-text-body', c.body)}
      <div class="row vfrule" style="margin-bottom:${x.zb}px"><span class="bo-text-ui-button">${c.ask || ''}</span><span class="k">${c.sign || ''}</span></div>` }),
    cur: (c, x) => ({ cls: 'bleed vfr', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}">${brackets()}${chips(x)}${c.sel ? sel(c.sel, c.sel_label, c.sel_size) : ''}${c.cursor ? cursor(c.cursor) : ''}
      <div class="float tile" style="--i:1;left:8px;bottom:${x.zb + 8}px;width:${c.wide ? 'calc(100% - 16px)' : '64%'};padding:14px">${k(c.label)}${T('bo-text-heading-small', c.title)}${T('bo-text-body-small sec', c.body)}</div>` }),
    rulers: (c, x) => ({ cls: 'bleed vfr', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}">
      <div class="vfrul h" style="top:${x.zt + 8}px">${[0, 1, 2, 3].map(i => `<span class="bo-text-meta vfmono" style="left:${i * 25 + 1}%">${i * 300}</span>`).join('')}</div>
      <div class="vfrul v" style="top:${x.zt + 30}px">${[0, 1, 2, 3].map(i => `<span class="bo-text-meta vfmono" style="top:${i * 25 + 1}%">${i * 400}</span>`).join('')}</div>
      <i class="vfguide v" style="left:${c.guides[0]}%"></i><i class="vfguide h" style="top:${c.guides[1]}%"></i>
      <div class="vfmeas" style="left:${c.measure[0]}%;top:${c.measure[1]}%;width:${c.measure[2]}%"><i class="vfh" style="left:0;top:0"></i><i class="vfh" style="left:100%;top:0"></i><span class="vftag bo-text-meta vfmono" style="bottom:calc(100% + 6px);left:50%;transform:translateX(-50%)">${c.measure_label}</span></div>
      <div class="float tile" style="--i:1;right:8px;bottom:${x.zb + 8}px;width:62%;padding:14px"><div class="row">${k(c.label)}<span class="lock">${bo(18)}blame opal</span></div>${T('bo-text-heading-small', c.title)}${T('bo-text-body-small sec', c.body)}</div>` }),
    split: (c, x) => ({ cls: 'bleed vfr', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}"><div class="vfbefore" style="clip-path:inset(0 ${100 - (c.at || 50)}% 0 0)"><img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}"></div>
      <i class="vfdiv" style="left:${c.at || 50}%"></i>${brackets()}
      ${chips(x)}<span class="float glass chipf" style="right:calc(${100 - (c.at || 50)}% + 10px);top:calc(${c.chip_y || 40}% - 14px)"><span class="bo-text-label">${c.before || 'Before'}</span></span><span class="float chipf acid" style="left:calc(${c.at || 50}% + 10px);top:calc(${c.chip_y || 40}% - 14px)"><span class="bo-text-label">${c.after || 'After'}</span></span>
      <div class="float tile" style="--i:1;left:8px;bottom:${x.zb + 8}px;width:66%;padding:14px">${k(c.label)}${T('bo-text-heading-small', c.title)}${T('bo-text-body-small sec', c.body)}</div>` }),
    crop: (c, x) => { const [l, t, w, h] = c.crop; return { cls: 'bleed vfr', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}">${chips(x)}
      <div class="vfcrop" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%"><i class="vfb tl_ th_"></i><i class="vfb tr_ th_"></i><i class="vfb bl_ th_"></i><i class="vfb br_ th_"></i>
        <span class="vftag bo-text-meta vfmono" style="bottom:calc(100% + 6px);left:0">${c.ratio}</span><span class="vftag bo-text-meta vfmono" style="top:calc(100% + 6px);right:0">${c.size}</span></div>
      <div class="float tile" style="--i:1;left:8px;right:8px;bottom:${x.zb + 8}px;padding:14px;flex-direction:row;align-items:flex-end;justify-content:space-between;gap:12px"><span style="display:flex;flex-direction:column;gap:6px">${k(c.label)}${T('bo-text-heading-small', c.title)}</span>${T('bo-text-body-small sec vfcropb', c.body)}</div>` }; },
    wipe: (c, x) => ({ cls: 'bleed vfr', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'};height:${100 - (c.h || 40)}%">${chips(x)}${c.sel ? sel(c.sel, c.sel_label, c.sel_size) : ''}
      <div class="acid vfwipe" style="height:${c.h || 40}%;padding-bottom:${x.zb + 16}px"><div class="row">${k(c.label)}<span class="bo-text-meta">${c.note || ''}</span></div><span style="flex:1"></span>${T(x.h > 600 ? 'bo-text-heading-large' : 'bo-text-heading-large', c.title)}${T('bo-text-body-small', c.body)}</div>` }),
    // deck
    cover: (c, x) => frame(x, '1fr', '1.2fr 1fr', `<div class="tl" style="justify-content:flex-end;padding:20px">${k(c.label)}${T('bo-text-heading-large', c.title)}</div>${img(c.image, c.focus)}`),
    section: (c, x) => frame(x, '1fr', '1fr 1.4fr', `<div class="tl" style="justify-content:flex-end;padding:20px">${T('bo-text-display-large', c.number)}</div><div class="tl" style="justify-content:flex-end;padding:20px">${k(c.label)}${T('bo-text-heading-small', c.title)}</div>`),
    slide: (c, x) => frame(x, '1fr auto', null, `<div class="tl" style="justify-content:center;padding:28px">${T('bo-text-display-large', c.title)}</div><div class="tl" style="flex-direction:row;justify-content:space-between;align-items:flex-start;padding:20px">${T('bo-text-body-small sec', c.body)}${micro(c.micro || 'asterisk', 24)}</div>`),
    case: (c, x) => frame(x, '1fr auto', '1.15fr 1fr', `${img(c.image, c.focus, ' style="grid-row:span 2"')}<div class="tl" style="justify-content:flex-end;padding:16px">${k(c.label)}${T('bo-text-heading-small', c.title)}${T('bo-text-body-small sec', c.body)}</div>
      <div class="tl" style="flex-direction:row;gap:16px">${(c.stats || []).slice(0, 2).map(s => `<span style="flex:1;display:flex;flex-direction:column;gap:4px">${T('bo-text-title-strong', s.value)}${k(s.label)}</span>`).join('')}</div>`),
    picture: (c, x) => frame(x, '1fr auto', null, `${img(c.image, c.focus)}<div class="tl" style="flex-direction:row;justify-content:space-between;align-items:center">${T('bo-text-body-small', c.caption)}${T('bo-text-meta sec', c.meta)}</div>`),
    chart: (c, x) => { const max = Math.max(...(c.bars || []).map(b => b.value), 1); return frame(x, '1fr', '1fr 1.3fr', `<div class="tl" style="justify-content:flex-end;padding:20px">${k(c.label)}${T('bo-text-heading-small', c.title)}</div>
      <div class="tl" style="justify-content:center;gap:16px;padding:20px">${(c.bars || []).map(b => `<div style="display:flex;flex-direction:column;gap:6px"><div class="row"><span class="bo-text-body-small">${b.label}</span><span class="bo-text-meta sec">${b.value} ${b.unit || ''}</span></div><div style="height:22px;border-radius:1000px;width:${(b.value / max * 100).toFixed(0)}%;background:${b.mark ? 'var(--acid)' : 'var(--fg)'}"></div></div>`).join('')}${k(c.note)}</div>`); },
    workflow: (c, x) => frame(x, 'auto 1fr', `repeat(${(c.steps || []).length || 1},1fr)`, `<div class="tl" style="grid-column:1/-1;flex-direction:row;justify-content:space-between;align-items:flex-end;padding:16px 20px"><span style="display:flex;flex-direction:column;gap:4px">${k(c.label)}${T('bo-text-heading-small', c.title)}</span>${icon('arrow-right', 16)}</div>`
      + (c.steps || []).map((s, i) => `<div class="tl${i === c.mark ? ' acid' : ''}" style="justify-content:space-between"><span class="bo-text-meta${i === c.mark ? '' : ' sec'}">${String(i + 1).padStart(2, '0')}</span><span style="display:flex;flex-direction:column;gap:2px">${T('bo-text-title-strong', s.name)}${k(s.line)}</span></div>`).join('')),
    // From live deck work (8 Nov 2026): the picked layouts and the options offered beside them, so the next deck has more to choose from.
    // stack: workflow steps as full-width rows, number, name and line read left to right. mark picks the acid row
    stack: (c, x) => frame(x, `auto repeat(${(c.steps || []).length || 1},1fr)`, null, wfHead(c)
      + (c.steps || []).map((s, i) => `<div class="tl${i === c.mark ? ' acid' : ''}" style="flex-direction:row;align-items:center;justify-content:flex-start;padding:0 20px"><span class="bo-text-meta${i === c.mark ? '' : ' sec'}" style="width:46px;flex:none">${String(i + 1).padStart(2, '0')}</span><span style="width:36%;flex:none">${T('bo-text-title-strong', s.name)}</span>${k(s.line)}</div>`).join('')),
    // stepgrid: three by two, the headline takes the first tile and up to five steps fill the rest
    stepgrid: (c, x) => frame(x, '1fr 1fr', 'repeat(3,1fr)', `<div class="tl" style="justify-content:space-between;padding:16px">${k(c.label)}${T('bo-text-heading-small', c.title)}</div>`
      + (c.steps || []).slice(0, 5).map((s, i) => `<div class="tl${i === c.mark ? ' acid' : ''}" style="justify-content:space-between;padding:16px"><span class="bo-text-meta${i === c.mark ? '' : ' sec'}">${String(i + 1).padStart(2, '0')}</span><span style="display:flex;flex-direction:column;gap:2px">${T('bo-text-title-strong', s.name)}${k(s.line)}</span></div>`).join('')),
    // lead: a short header with the headline at heading size, and a long paragraph set large as the main read
    lead: (c, x) => frame(x, 'auto 1fr', null, `<div class="tl" style="padding:16px 20px;gap:4px">${k(c.label)}${T('bo-text-heading-small', c.title)}</div><div class="tl" style="flex-direction:row;justify-content:space-between;align-items:flex-end;gap:24px;padding:20px">${lede(c.body)}<span style="align-self:flex-start;flex:none">${micro(c.micro || 'asterisk', 24)}</span></div>`),
    // Statement slides (8 Nov 2026): a long paragraph cut down and broken up. lead with **key phrases** was picked; pull, checklist and beats were offered beside it.
    // pull: one line pulled out large on the left, a short paragraph beside it
    pull: (c, x) => frame(x, 'auto 1fr', '1.35fr 1fr', `<div class="tl" style="grid-column:1/-1;padding:16px 20px;gap:4px">${k(c.label)}${T('bo-text-heading-small', c.title)}</div><div class="tl" style="justify-content:flex-end;padding:20px">${T('bo-text-heading-small', c.pull)}</div><div class="tl" style="justify-content:flex-end;padding:20px">${T('bo-text-body-small sec', c.body)}</div>`),
    // checklist: the things being tested as a row of tiles, an intro under the headline and one line under the row
    checklist: (c, x) => frame(x, 'auto 1fr auto', `repeat(${(c.items || []).length || 1},1fr)`, `<div class="tl" style="grid-column:1/-1;padding:16px 20px;gap:4px">${k(c.label)}${T('bo-text-heading-small', c.title)}${T('bo-text-body-small sec', c.intro)}</div>`
      + (c.items || []).map((s, i) => `<div class="tl" style="justify-content:space-between;padding:12px"><span class="bo-text-meta sec">${String(i + 1).padStart(2, '0')}</span>${T('bo-text-title-strong', s)}</div>`).join('')
      + `<div class="tl" style="grid-column:1/-1;padding:20px">${lede(c.line)}</div>`),
    // beats: three short statements, each with one line, starting on one line across the tiles. mark picks the acid tile
    beats: (c, x) => frame(x, 'auto 1fr', `repeat(${(c.beats || []).length || 1},1fr)`, `<div class="tl" style="grid-column:1/-1;padding:16px 20px;gap:4px">${k(c.label)}${T('bo-text-heading-small', c.title)}</div>`
      + (c.beats || []).map((b, i) => `<div class="tl${i === c.mark ? ' acid' : ''}" style="justify-content:space-between;padding:16px"><span class="bo-text-meta${i === c.mark ? '' : ' sec'}">${String(i + 1).padStart(2, '0')}</span><span style="height:48%;display:flex;flex-direction:column;gap:6px">${T('bo-text-heading-small', b.name)}${k(b.line)}</span></div>`).join('')),
    // halves: the headline large on the left, a long paragraph in a full-height tile on the right
    halves: (c, x) => frame(x, '1fr', '1fr 1fr', `<div class="tl" style="justify-content:flex-end;padding:20px">${k(c.label)}${T('bo-text-display-large', c.title)}</div><div class="tl" style="justify-content:flex-end;padding:20px">${T('bo-text-body-small sec', c.body)}</div>`),
    // Quote (7 Nov 2026): what you get on the left, what it costs on the right. One to one quotes only: prices never go in public work
    quote: (c, x) => frame(x, '1fr', '1.35fr 1fr', qtile(c.label, kv(c.items, c.wide))
      + qtile(c.cost_label, `<span class="qprice">${T('bo-text-display-large', c.price)}${T('bo-text-title-strong', c.per)}</span>${amounts(c.lines)}${T('bo-text-body-small sec', c.note)}`)),
    // Terms: two tiles of the same rows, paying and if you need more, each with an optional closing note
    terms: (c, x) => frame(x, '1fr', '1.35fr 1fr', (c.tiles || []).slice(0, 2).map(t => qtile(t.label, kv(t.rows, t.wide) + T('bo-text-body-small sec', t.note))).join('')),
    next: (c, x) => frame(x, '1fr', '1.4fr 1fr', `<div class="tl" style="justify-content:flex-end;padding:24px">${k(c.label)}${T('bo-text-display-large', c.title)}</div><div class="tl" style="justify-content:space-between;padding:20px">${T('bo-text-body', c.body)}<span style="display:flex;flex-direction:column;gap:10px">${T('bo-text-ui-button', c.contact || 'James@blameopal.studio')}<span class="row">${bo(30)}<span class="k">we give a sh*t.</span></span></span></div>`),
    // documents, P2
    paper: (c, x) => ({ cls: 'paper', html: `<div class="row" style="padding-bottom:20px"><span class="lock">${bo(22)}blame opal</span><span class="k">${c.label || ''}</span></div>${T('bo-text-heading-small', c.title)}${T('bo-text-body-small sec', c.intro)}<div style="height:12px"></div>`
      + (c.sections || []).map(s => s.stats ? `<div class="sec2"><span class="k">${s.h}</span><span></span></div><div class="stats">${s.stats.map(t => `<div>${T('bo-text-title-strong', t.value)}${k(t.label)}${T('bo-text-meta sec', t.source)}</div>`).join('')}</div>`
        : `<div class="sec2"><span class="k">${s.h}</span>${s.steps ? `<div class="steps">${s.steps.map((t, i) => `<span${i === s.mark ? ' class="on"' : ''}>${t}</span>`).join('')}</div>` : s.rows ? `<div class="rows${s.rows.some(([, b]) => String(b || '').length > 24) ? ' kv' : ''}">${s.rows.map(([a, b]) => `<div><span class="bo-text-body-small">${a}</span><span class="bo-text-body-small">${b}</span></div>`).join('')}</div>` : T('bo-text-body-small', s.text)}</div>`).join('')
      + `<div class="row" style="margin-top:auto;padding-top:10px;border-top:2px solid var(--ln)"><span class="bo-text-meta sec">James@blameopal.studio · blameopal.studio</span><span class="bo-text-meta sec">we give a sh*t.</span></div>` }),
    // web
    oscard: (c, x) => ({ cls: 'oscard', html: `<div class="well">${c.image ? `<img src="${c.image}" alt="" style="width:100%;height:100%;object-fit:cover">` : preview(c.preview)}</div><div class="row"><span>${T('bo-text-ui-control', c.name)}<br>${T('bo-text-meta sec', c.kind)}</span><span class="acts">${(c.actions || ['download', 'copy']).map(a => `<span>${icon(a)}</span>`).join('')}</span></div>` }),
    readme: (c, x) => frame(x, '1fr', '1.2fr 1fr', `<div class="tl" style="justify-content:flex-end;padding:20px">${k(c.label)}${T('bo-text-heading-large', c.title)}${T('bo-text-body-small sec', c.body)}</div><div class="tl" style="padding:0">${c.image ? `<img src="${c.image}" alt="" style="width:100%;height:100%;object-fit:cover">` : preview(c.preview, 28)}</div>`),
    // video
    tc2: (c, x) => Object.assign(fb2(Object.assign({ corner: 'bl' }, c), x, x.w > 500 ? '44%' : '62%'), { anim: true }),
    lt1: (c, x) => ({ cls: 'bleed', anim: true, transparent: !c.image, style: c.image ? '' : 'background:transparent;border-radius:0', html: `${c.image ? `<img src="${c.image}" alt="" style="object-position:${c.focus || '50% 50%'}">` : ''}<div class="float glass" style="--i:0;left:16px;bottom:${x.zb + 16}px;width:max-content;white-space:nowrap;flex-direction:row;padding:8px 14px"><span class="rv" style="--i:1;display:flex;flex-direction:column;gap:2px"><span class="bo-text-ui-button">${c.name}<i class="dot" style="width:6px;height:6px;margin:0 0 2px 6px;vertical-align:middle"></i></span>${k(c.role)}</span></div>` }),
    ec2: (c, x) => Object.assign(frame(x, '1fr', '1fr 232px', `<div class="tl ink" style="--i:0;justify-content:space-between;padding:20px">${bo(70)}<span style="display:flex;flex-direction:column;gap:6px">${T('bo-text-heading-small', c.title)}<span class="k" style="display:flex;align-items:center;gap:6px"><i class="dot"></i>${c.ask || ''}</span></span></div><div style="background:transparent"></div><i class="zone" style="right:24px;top:70px;width:200px;height:112px"><b>End screen</b></i><i class="zone" style="right:24px;top:196px;width:200px;height:112px"><b>End screen</b></i>`), { anim: true }),
    th2: (c, x) => ({ cls: 'bleed', html: `<img src="${c.image}" alt="" style="object-position:${c.focus || '0% 50%'}"><div class="float tile" style="left:8px;top:8px;width:46%;padding:16px">${T('bo-text-heading-large', c.title)}</div><i class="zone" style="right:6px;bottom:6px;width:46px;height:22px"><b>Time</b></i>` }),
  };

  function preview(kind, fs) {
    if (kind === 'falling-words') return '<div class="fall" style="position:absolute;inset:0;overflow:hidden">' + [['Falling', 8, 8, -6, 0], ['words', 46, 8, 8, .15], ['stack', 22, 30, 3, .3], ['up', 62, 30, -14, .45]]
      .map(([w, l, b, r, d]) => `<span style="position:absolute;left:${l}%;bottom:${b}px;font:600 ${fs || 16}px/1 var(--bo-font-family-sans);transform:rotate(${r}deg);animation:bo-fall 2.8s var(--bo-motion-ease) ${d}s infinite;--r:${r}deg">${w}</span>`).join('') + '</div>';
    return `<div class="ph" style="position:absolute;inset:8px">${kind || 'Preview'}</div>`;
  }

  function zones(fmt) {
    const z = Z[(FORMATS[fmt] || {}).zone]; if (!z) return '';
    const f = FORMATS[fmt], out = [];
    if (z.top) out.push(['top', 0, 0, f.w, z.top]); if (z.bottom) out.push(['bottom', 0, f.h - z.bottom, f.w, z.bottom]);
    if (z.rail) out.push(['like, comment, share', f.w - z.rail.right, z.rail.from_y, z.rail.right, f.h - z.rail.from_y]);
    return out.map(([n, l, t, w, h]) => `<i class="zone" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px"><b>${n}</b></i>`).join('');
  }

  // 20px of surround at 1080, so a third of that at the 1x design size
  const RING = 20 / 3, PICTURE = ['fb2', 'bleed', 'type', 'vf', 'insp', 'cur', 'rulers', 'split', 'crop', 'wipe'];
  const data = typesetData(JSON.parse(document.getElementById('bo-content').textContent));
  const frames = data.frames || [];
  const out = [];
  // pages count the run of frames in the file's main format, so Stories or covers in the same file don't throw the numbers off
  const run = frames.filter(c => !c.format || c.format === data.format), total = String(run.length).padStart(2, '0');
  frames.forEach((c, i) => {
    const fmt = c.format || data.format, f = FORMATS[fmt];
    if (!f) throw new Error('Unknown format ' + fmt);
    const z = Z[f.zone] || {};
    const x = { w: f.ring ? f.w - 2 * RING : f.w, h: f.ring ? f.h - 2 * RING : f.h, zt: z.top || 0, zb: z.bottom || 0, zs: Math.max(z.left || 0, z.right || 0), rail: !!z.rail, deck: fmt === 'deck', topic: c.topic || data.topic || '', page: c.page ?? (run.length > 1 && run.includes(c) ? `${String(run.indexOf(c) + 1).padStart(2, '0')} / ${total}` : '') };
    if (!L[c.layout]) throw new Error('Unknown layout ' + c.layout);
    const r = L[c.layout](c, x);
    const still = q.get('still') === '1' || only !== null;
    const cls = [r.cls, r.anim ? 'anim' + (still ? ' still' : ' play') : ''].join(' ');
    // the framed carousel (picked 27 Oct 2026): the design sits in a rounded frame on Instagram's dark mode colour. The hairline only goes round a picture, never the bento
    const el = f.ring
      ? `<div data-frame data-format="${fmt}" data-layout="${c.layout}" data-scale="${f.scale}" data-theme="${theme}" class="ring" style="width:${f.w}px;height:${f.h}px;padding:${RING}px"><div class="${cls} ringin${PICTURE.includes(c.layout) ? ' lined' : ''}" style="width:${x.w}px;height:${x.h}px;${r.style || ''}">${r.html}</div></div>`
      : `<div data-frame data-format="${fmt}" data-layout="${c.layout}" data-scale="${f.scale}"${r.transparent ? ' data-transparent' : ''} data-theme="${theme}" class="${cls}" style="width:${f.w}px;height:${f.h}px;${x.zs ? `--padx:${x.zs}px;` : ''}${r.style || ''}">${r.html}${zones(fmt)}</div>`;
    out.push({ el, name: `${i + 1}. ${c.layout}, ${f.name}` });
  });

  if (only !== null) {
    document.body.classList.add('single');
    document.body.innerHTML = out[Math.max(0, Math.min(out.length - 1, +only - 1))].el;
  } else {
    const bar = `<div class="kit-bar"><button data-t="light">Light</button><button data-t="dark">Dark</button><button data-z>Zones</button></div>`;
    document.body.innerHTML = bar + `<div class="kit-row">${out.map(o => `<div class="kit-cell"><span>${o.name}</span>${o.el}</div>`).join('')}</div>`;
    document.querySelectorAll('[data-t]').forEach(b => { b.classList.toggle('on', b.dataset.t === theme); b.onclick = () => { const p = new URLSearchParams(location.search); p.set('theme', b.dataset.t); location.search = p; }; });
    document.querySelector('[data-z]').onclick = e => e.currentTarget.classList.toggle('on', document.body.classList.toggle('zones'));
    if (q.get('zones') === '1') document.body.classList.add('zones');
    setInterval(() => document.querySelectorAll('.anim.play').forEach(a => { a.classList.remove('play'); void a.offsetWidth; a.classList.add('play'); }), 4200);
  }

  // typography layer, line breaks: measured on the real fonts, so it waits for them. Headlines of two or more sentences break at each
  // full stop when every sentence then fits on one line; a text of three or more words never ends on a line with one word on it (a headline that stacks one word per line is left alone).
  // CSS does the rest (balanced headlines, pretty body copy). What it could not fix is left in window.BO_TYPE_REPORT for check_design.
  const WORDS = t => t.split(/[  ]+/).filter(Boolean).length;
  function lines(el) {
    const n = el.firstChild; if (!n || n.nodeType !== 3 || el.childElementCount) return null;
    const rg = document.createRange(), out = []; let i = 0;
    n.textContent.split(/( +)/).forEach(w => {
      if (w && w[0] !== ' ') { rg.setStart(n, i); rg.setEnd(n, i + w.length); const r = rg.getClientRects()[0]; if (r) { const top = Math.round(r.top); (out.length && out[out.length - 1].top === top ? out[out.length - 1] : out[out.push({ top, t: '' }) - 1]).t += w + ' '; } }
      i += w.length;
    });
    return out;
  }
  const lineCount = el => Math.round(el.getBoundingClientRect().height / (parseFloat(getComputedStyle(el).lineHeight) || 1));
  const SENT = /(?<=[.!?][”’]?) +(?=[A-Z“‘])/;
  function typesetDOM() {
    const report = [];
    document.querySelectorAll('[data-frame]').forEach((fr, fi) => fr.querySelectorAll('[class*="bo-text-"], .k').forEach(el => {
      const txt = el.textContent.trim(); if (!txt || el.childElementCount || el.closest('.fall')) return;
      const head = /bo-text-(display|heading|title-strong)/.test(el.className), note = { frame: fi + 1, text: txt.slice(0, 60), fixed: [] };
      if (head && SENT.test(txt)) {
        const sents = txt.split(SENT), keep = el.innerHTML; el.innerHTML = sents.join('<br>');
        if (lineCount(el) === sents.length) note.fixed.push('sentence breaks'); else el.innerHTML = keep;
      }
      const L = lines(el);
      if (L && L.length > 1 && WORDS(el.textContent) >= 3 && WORDS(L[L.length - 1].t) === 1 && WORDS(L[L.length - 2].t) >= 2) {
        // bind the last two words; if that chain is too wide, let go of the short word bound before them and try again
        const n = el.firstChild, t = n.textContent, i = t.lastIndexOf(' '), j = t.lastIndexOf('\u00a0', i);
        const ok = () => { const L2 = lines(el); return L2 && WORDS(L2[L2.length - 1].t) >= 2 && el.scrollWidth <= el.clientWidth + 1 && L2.every(l => l.t.trim().split(/[ \u00a0]+/).length > 1 || l === L2[0]); };
        if (i > 0) {
          n.textContent = t.slice(0, i) + '\u00a0' + t.slice(i + 1);
          if (ok()) note.fixed.push('last line');
          else if (j > 0 && (n.textContent = t.slice(0, j) + ' ' + t.slice(j + 1, i) + '\u00a0' + t.slice(i + 1), ok())) note.fixed.push('last line, a short word let go');
          else { n.textContent = t; note.left = 'one word on the last line'; }
        }
      }
      if (note.fixed.length || note.left) report.push(note);
    }));
    window.BO_TYPE_REPORT = report;
  }
  const settle = () => Promise.all(['400', '500', '600'].map(w => document.fonts.load(w + ' 16px "Instrument Sans"'))).then(() => document.fonts.ready);
  // outer corners: a tile corner that sits on the frame's own corner is square, so the ground never shows as a dark wedge there
  // (7 Nov 2026). Measured with offsets, not client rects, so entry animations do not throw it off.
  function squareOuterCorners() {
    const at = (el, fr) => { let x = 0, y = 0, n = el; while (n && n !== fr) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return n === fr ? { x, y } : null; };
    const near = (a, b) => Math.abs(a - b) <= 1;
    document.querySelectorAll('[data-frame]').forEach(fr => {
      const W = fr.offsetWidth, H = fr.offsetHeight;
      fr.style.borderRadius = '0'; // the exported edge is the frame itself: a radius there exports as dark corners (Bleed, FB2 and the other picture layouts)
      fr.querySelectorAll('.tl, .bleed').forEach(el => {
        const p = at(el, fr); if (!p) return;
        const x1 = p.x + el.offsetWidth, y1 = p.y + el.offsetHeight;
        if (near(p.x, 0) && near(p.y, 0)) el.style.borderTopLeftRadius = '0';
        if (near(x1, W) && near(p.y, 0)) el.style.borderTopRightRadius = '0';
        if (near(x1, W) && near(y1, H)) el.style.borderBottomRightRadius = '0';
        if (near(p.x, 0) && near(y1, H)) el.style.borderBottomLeftRadius = '0';
      });
    });
  }
  squareOuterCorners();
  // a quote's figure stays on one line: when it is wider than its tile it steps down one named size instead of running out
  const fitPrices = () => document.querySelectorAll('.qprice .bo-text-display-large').forEach(el => {
    if (el.scrollWidth > el.parentElement.clientWidth + 1) { el.classList.replace('bo-text-display-large', 'bo-text-heading-large'); }
  });
  // Anchor across tiles (8 Nov 2026): neighbouring tiles share lines, the way a terms slide was realigned by hand.
  // The fullest tile sets where the rows start and where the closing note sits, and the other tiles match it, so no block floats at its own height
  function anchorTiles() {
    const top = (el, fr) => { let y = 0, n = el; while (n && n !== fr) { y += n.offsetTop; n = n.offsetParent; } return y; };
    document.querySelectorAll('[data-frame][data-layout="terms"]').forEach(fr => {
      const tiles = [...fr.querySelectorAll('.qt')].map(t => { const b = t.querySelector('.qbody'), r = b && b.querySelector(':scope > .rows'); return r ? { t, b, r, n: r.nextElementSibling } : null; }).filter(Boolean);
      if (tiles.length < 2) return;
      const rowLine = Math.min(...tiles.map(x => top(x.r, fr)));
      const notes = tiles.filter(x => x.n), noteLine = notes.length ? Math.min(...notes.map(x => top(x.n, fr))) : 0;
      tiles.forEach(x => {
        x.t.style.justifyContent = 'flex-start'; x.b.style.flex = '1';
        x.r.style.marginTop = Math.max(0, rowLine - top(x.r, fr)) + 'px';
        if (x.n && noteLine) x.n.style.marginTop = Math.max(0, noteLine - top(x.n, fr)) + 'px';
      });
    });
  }
  settle().catch(() => {}).then(() => { try { fitPrices(); typesetDOM(); anchorTiles(); } finally { document.body.dataset.typeset = 'done'; } });
  const st = document.createElement('style'); st.textContent = '@keyframes bo-fall{0%{transform:translateY(-320px) rotate(0)}60%,100%{transform:translateY(0) rotate(var(--r))}}@media (prefers-reduced-motion:reduce){.fall span{animation:none!important}}'; document.head.appendChild(st);
})();
