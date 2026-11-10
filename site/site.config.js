// Site settings. The only file to touch when an account or address changes.
window.SITE = {
  // The live address on Vercel, with a trailing slash. Used in link previews and the post copy.
  url: 'https://thirty-posters-site.vercel.app/',
  // The challenge repo (prompts, process, releases).
  repo: 'https://github.com/JNBO2026/Graphic-Posters-with-Claude',
  // Follow links in the bottom-left module. Leave one empty to hide its button.
  instagram: 'https://www.instagram.com/blameopal/',
  linkedin: 'https://www.linkedin.com/in/jamesnawka',
  // Design options while James picks: empty slot tiles 'd' | 'e' | 'f', phone layout 'k' | 'l' | 'm' | 'n'. ?tile= and ?mobile= preview the others.
  tile: 'f',
  mobile: 'l',
  // hover on a posted poster (desktop): 'a' title card, 'b' prompt snippet, 'c' ledger card, 'd' cursor only
  hover: 'c',
  total: 30,
  // The schedule starts when day 01 is posted, not when it was prompted (James posts it 7am 11 Nov). Day N is due start + N x 24h
  start: '2026-11-11T07:00:00Z'
};
