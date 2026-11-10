# Thirty posters: how this repo runs

James is doing a 30 day challenge. Each day he opens a session and types one prompt. Claude makes a poster from it, packages the socials and publishes it to the site.

## The rules (his, non-negotiable)
1. Generative AI can be used. The image models on the connected MCPs (Canva, Figma, Flora) are fair game if the idea needs them.
2. He gets 60 seconds to write the prompt. Nothing after that.
3. He can only answer questions Claude asks. He can't re-prompt, redirect or give visual direction afterwards.
4. Hands off. Claude makes every decision the prompt doesn't.
5. Whatever Claude hands back gets posted as is.

So: don't offer options to pick from (this overrides the Blame Opal "show two or three approaches" step). Ask a question only when you genuinely can't proceed without one. Then make it, check it properly, and hand back finished work.

## The trigger: how a day starts
The challenge hasn't started until James sends "day one", "day 2", "Day 14" or similar. Nothing in `days/NN/` exists before that.

1. **He sends "day N".** Reply with one short message and nothing else, for example "Day 01. You have 60 seconds from now. Go." In the same turn, start the timer: a Bash call with `run_in_background: true` running `sleep 60`. Record the start time (`date -u +%FT%TZ`). Don't do any other work in that turn, then end it so he can type.
2. **The timer ends.** You're woken when the background `sleep` exits. Send one message: "STOP. Hit enter." Also call PushNotification with "STOP. Hit enter." Nothing else.
3. **His next message is the prompt.** Accept it exactly as sent, whatever state it's in. If it arrives before the stop, it still counts. Never ask him to rephrase.
4. **Make it.** Ask a question only if you genuinely can't go on without the answer. His answers are inputs, not new direction. Then run the stages below without stopping.
5. **Hand over.** SendUserFile the three zips in `days/NN/handover/` (see HANDOVER.md), then a short summary with the live link.

The day number comes from his message. The date is today's date when he sends it.

## The stages
1. `days/NN/prompt.md`: his prompt, verbatim, typos and all. Never tidy it.
2. `days/NN/meta.json`: `day`, `date` (YYYY-MM-DD), `started_at` (ISO time his prompt message arrived, UTC), `title`, `note` (one line on the idea). Day 01's `started_at` sets the whole schedule on the site: day N is due at day 01 `started_at` + (N − 1) × 24 hours, and every empty slot counts down to it.
3. `days/NN/poster.html`: the poster. A3 portrait, exactly 1240 × 1754 px. Self-contained HTML (Google Fonts are fine). Any generated images go in `days/NN/`. The poster follows the prompt, not the Blame Opal brand. Only the socials are in the brand.
4. `days/NN/social/social.html`: copy `days/_template/social/social.html`, change only the JSON content block. Keep the five frames in this order: 3 × ig-post (fb2 poster, statement, e2), ig-story fb2, li-portrait fb2. Image names stay `mount-N.jpg`. Move the fb2 `corner` day to day so the series doesn't repeat.
5. `days/NN/copy/`: the six files in `days/_template/copy/`, every word rewritten for the day, `{{LINK}}` left as is (the packager fills it in). Load the `james-tone-of-voice` and `blame-opal` skills first and run the Blame Opal `check` tool on the copy. UK English, no em or en dashes, no emoji, `we give a sh*t.` only as a sign-off. Each platform's shape is in the template: LinkedIn hooks before "see more", link in the first comment, ends on a question; Instagram hooks on line one, asks for the save, niche hashtags; Story is stickers only.
6. `scripts/build-day.sh NN`: renders the poster and the socials (light and dark), packs the zips, builds the site into `dist/`. Then look at `poster.jpg` and every export: no clipped, overlapping or badly wrapped type. Fix and rerun if anything's off.
7. Commit and push this repo (the GitHub Release goes out on its own).
8. Publish the site: `scripts/publish-site.sh "Day NN: Title"` (needs the site repo cloned, see below). Vercel deploys on push. Then check it's live: `curl -s https://thirty-posters-site.vercel.app/data/posters.js` should list day NN (allow up to a minute for the deploy; poll with a Monitor until-loop, not sleep).

## The website
Source is `site/` (page, `site.config.js`, `vercel.json`, `vendor/` GSAP 3.13). `scripts/build-site.js` builds it into `dist/` with the posters, `data/posters.js` and the share tags. The page is an endless draggable wall (GSAP Draggable + Inertia) with a live digital countdown on every empty slot, the Blame Opal cursor and glass HUD, all on the house easing cubic-bezier(.2,.7,.2,1) and the system durations. `dist/` is pushed to the separate site repo, which Vercel deploys.
- `site/site.config.js` holds the live URL. Change it there only.
- Notifications: "Watch on GitHub" only (each day's GitHub Release notifies watchers). No email, no RSS: James decided against both.

## Setup status
- [x] Site repo: `JNBO2026/thirty-posters-site` (private), deploys from `main`. In a new session, if `../thirty-posters-site` is missing: `add_repo` it with push access, then `git clone https://github.com/JNBO2026/thirty-posters-site ../thirty-posters-site`. Do this before the day starts, not mid-timer.
- [x] Vercel: https://thirty-posters-site.vercel.app (in `site/site.config.js`).
- [ ] This repo's About > Website set to the Vercel URL.

## Design system
`system/` is a copy of the Blame Opal template kit (from the Blame Opal Design System MCP, `get_template`). Don't edit it. If the MCP's build changes, pull it again.
