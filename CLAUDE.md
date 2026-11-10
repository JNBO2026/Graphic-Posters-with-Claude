# Thirty posters: how this repo runs

James is doing a 30 day challenge. Each day he opens a session and types one prompt. Claude makes a poster from it.

## The rules (his, non-negotiable)
1. Generative AI can be used. The image models on the connected MCPs (Canva, Figma, Flora) are fair game if the idea needs them.
2. He gets 60 seconds to write the prompt. Nothing after that.
3. He can only answer questions Claude asks. He can't re-prompt, redirect or give visual direction afterwards.
4. Hands off. Claude makes every decision the prompt doesn't.
5. Whatever Claude hands back gets posted as is.

So: don't offer options to pick from (this overrides the Blame Opal "show two or three approaches" step). Ask a question only when you genuinely can't proceed without one. Then make it, check it properly, and hand back finished work.

## Every day, do all of this
1. `days/NN/prompt.md`: his prompt, verbatim, typos and all. Never tidy it.
2. `days/NN/meta.json`: `day`, `date` (YYYY-MM-DD), `title`, `note` (one line on the idea).
3. `days/NN/poster.html`: the poster. A3 portrait, exactly 1240 × 1754 px. Self-contained HTML (fonts from Google Fonts are fine). Any generated images go in `days/NN/` next to it.
   The poster follows the prompt, not the Blame Opal brand. Only the socials are in the brand.
4. `days/NN/social/social.html`: copy the previous day's and change only the JSON content block (labels, titles, day number). Keep the frames: 3 × ig-post carousel (fb2 poster, statement, e2), 1 × ig-story fb2, 1 × li-portrait fb2. Use the `mount-N.jpg` image names, where N is the frame number. Move the fb2 corner around day to day so the series doesn't repeat.
5. Run `scripts/build-day.sh NN`. Look at `poster.jpg` and every export before handing over: no clipped, overlapping or wrapped-badly type.
6. `days/NN/copy.md`: LinkedIn post and first comment, Instagram caption, Story stickers. Same structure as day 01. Load the `james-tone-of-voice` and `blame-opal` skills first, and run the Blame Opal `check` tool on the copy. UK English, no em or en dashes, no emoji, tagline `we give a sh*t.` only as a sign-off.
7. Commit and push.

## The wall
`index.html` at the root reads `data/posters.js` (made by `scripts/build-wall.js`). It's a gapless grid of A3 tiles, 30 slots. Hover shows the prompt, click opens the poster with copy and download. Don't hand-edit `data/posters.js`.

## Design system
`system/` is a copy of the Blame Opal template kit (from the Blame Opal Design System MCP, `get_template`). Don't edit it. If the MCP's build changes, pull it again.
