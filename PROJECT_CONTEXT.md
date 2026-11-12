# Thirty posters: project context

The full story of this project so far, for any session that picks it up cold (including after a conversation is compacted). `CLAUDE.md` is the operating manual; this file is the why and the history. Read both.

Last updated: 10 Nov 2026, end of the set-up phase, before day one.

---

## What this is

James (Blame Opal, London; Instagram `blameopal`, LinkedIn `jamesnawka`) is running a public 30 day challenge: **30 posters in 30 minutes**. Each day he opens a Claude Code session, sends "day N", gets 60 seconds to type one prompt, then is hands off. Claude makes the poster, packages the socials, publishes it to the website and hands over three zips. Whatever comes back gets posted as is.

### His rules (non-negotiable)
1. Generative AI can be used (image models on the connected MCPs: Canva, Figma, Flora).
2. 60 seconds to write the prompt.
3. He can only answer questions Claude asks. No re-prompting or visual direction afterwards.
4. Hands off: Claude makes every decision the prompt doesn't.
5. Post it as is.

Prompts are dictated with a voice to text tool, not typed. That's why the site says "The prompt, inputted in 60 seconds". Transcripts come through unpunctuated with misheard words (day 01: "bow house" for Bauhaus). Interpret the intent, keep the transcript verbatim. In copy, say "said" or "dictated" rather than "typed".

During a challenge day: never offer options to pick from. Ask only if genuinely blocked. During set-up and website work (like this session) he does want options, presented on the review page.

### The daily trigger (see CLAUDE.md for the exact steps)
"day N" → reply "Day NN. You have 60 seconds from now. Go." and start a background `sleep 60` → on wake send "STOP. Hit enter." plus a push notification → his next message is the prompt, verbatim → make it → hand over the three zips and the live link.

The challenge **has not started**. `days/` holds only `_template/`. Day 01's `started_at` will set the whole schedule on the site.

---

## Where everything lives

| Thing | Where |
|---|---|
| This repo (pipeline, days, site source) | `JNBO2026/Graphic-Posters-with-Claude`, branch `claude/exciting-tesla-8tm4yz` (it is also the default branch) |
| Site repo (built output only) | `JNBO2026/thirty-posters-site` (private), branch `main`, cloned at `../thirty-posters-site`. Never edit by hand; `scripts/publish-site.sh` mirrors `dist/` into it |
| Live site | https://thirty-posters-site.vercel.app (Vercel deploys the site repo on push) |
| Example data version | https://thirty-posters-site.vercel.app/?demo (three demo posters, one animated; shows a "Preview with example data" banner; never on the real wall) |
| Review page (option picking) | https://thirty-posters-site.vercel.app/review (not linked, noindex) |
| Per-day share previews | `/d/NN` pages built by `build-site.js`, each with that poster as its link preview |
| Design system kit | `system/` (copy of the Blame Opal template kit from the Blame Opal Design System MCP). Don't edit |
| Social frames | `days/_template/social/frames.html` + `scripts/social-data.js` (layout B, round seven) |
| Copy templates | `days/_template/copy/*.txt` |

### Scripts
- `scripts/build-day.sh NN`: render poster (+ MP4 if animated) → render socials light and dark → pack zips → build site.
- `scripts/render-poster.js NN`: `poster.jpg` (2x), `thumb.jpg` (1116 wide, for zoom), `thumb-s.jpg` (558 wide, the wall), `poster.mp4` for posters with `<meta name="poster-motion">` (frames captured deterministically, encoded with FFmpeg).
- `scripts/render-social.js NN`: mounts the poster into the template frames and exports PNGs.
- `scripts/package-day.js NN`: `Day-NN_LinkedIn.zip`, `Day-NN_Instagram.zip`, `Day-NN_Poster.zip` (see HANDOVER.md). Refuses to run if copy files still contain template text.
- `scripts/build-site.js`: builds `dist/` (site, posters, data, share pages, OG tags).
- `scripts/publish-site.sh "message"`: pushes `dist/` to the site repo.
- `scripts/verify-skill.sh URL`: checks a public skill exists before it's credited.
- `scripts/make-tool-icons.py`: regenerates `site/vendor/tool-icons.js` from `scripts/tools.json` and `library/logos/`. The site build trims it to the logos in use.

### Logo library
`library/logos/`: 77 mono SVG logos for every platform, image, video, audio and 3D model brand we might use (Flora's full model list was checked), plus the code tools and socials. Sources LobeHub Icons (MIT) and Simple Icons (CC0); `logos.json` and the README list what each covers. James asked for this to be kept and reused. Still missing, and James has offered to supply them: Moonvalley (Marey), Hyper3D/Deemos (Rodin), Quiver AI (Arrow), Hi3D, Magnific's own mark (Freepik's stands in). Veo, Imagen and Lyria use DeepMind's mark; Seedream and Seedance ByteDance's; Wan Alibaba's.
- `.github/workflows/release.yml`: a GitHub Release per new day (poster, MP4, how it was made, skills). This is the notification route.

### Environment
- Network allowlist on the "A Poster a day with Claude" environment: the Blame Opal system host, the Vercel site, `media.flora.ai` and `export-download.canva.com` (so generated images can be downloaded into a poster; added after the rehearsal found them blocked), and James's 10 UI reference sites (canvasui.dev, vgpu.sh, threeui.com, www.usefragments.com, ui.shadcn.com, www.kibo-ui.com, magicui.design, heroui.com, smoothui.dev, blocks.so).
- github.com web pages are blocked; git over HTTPS works (used by verify-skill.sh). `gh` is for search only.
- The Bash safety check sometimes rejects long heredoc python commands as "possible rm"; write the script to the scratchpad and run the file instead.
- Playwright Chromium can't play H.264, so video playback can't be verified headless (check `paused`, `src`, `error` instead).

---

## Decisions made (and why)

### Website (site/index.html)
- **An endless, draggable, zoomable wall** of 30 A3 slots (GSAP 3.13 Draggable + Inertia, vendored). Bento: paper tiles, 10px corners, 2px black seams; four-pointed stars where corners meet. Trackpad pans 1:1; mouse wheel gets a short glide; pinch, ctrl/cmd-scroll, the zoom chip or +/- to zoom (up to a poster at ~86% of the viewport height).
- **Empty slot tiles: F, Departures** (round two pick). Day number and status ("Opens 11 Nov", "Next, opens", "Starts with day one", "Overdue by"), then one hairline row each for days, hours, minutes, seconds. Countdown to the end of each day's 24 hours: day N is due at day 01 start + N × 24h.
- **Hover on posted posters: C, ledger card** (round five pick). Title, then rows: Prompt (word count), Made with, Tools. Made with is words only: "Code only"; the model ("Flux 1.1 Pro"); "Code + model" for one model plus code; "first model +N" for several. `meta.made` overrides with a short label. Tools (replaced Posted at James's request) is a row of logos, models first, one per maker, up to six then "+N".
- **Motion posters** autoplay muted on the wall while on screen and pause off screen; labelled by day only.
- **Poster view**: grows out of the tile; arrows sit in gutters beside the poster; count under it; on phone a full-screen card you can swipe anywhere. Prompt, "How it was made" with inline tool lozenges (logos from Simple Icons, CC0; lettered badge otherwise; no duplicates between inline and list), "Skills used" (public skills only, linked), Copy the prompt (adds "Include @BlameOpal somewhere in the design as a subtle credit for where this prompt came from."), downloads (video + still for motion posters).
- **Magnifier** (asked for 11 Nov): in the poster view on desktop the cursor becomes a zoom-in glass. Click zooms 3x into the full 2480 px poster.jpg, the zoom follows the cursor, click or Esc zooms back out (Esc doesn't close the view while zoomed), and pinch over the poster zooms it (1x to 5x) instead of the whole page. Phones are unchanged.
- **Prompt keywords: B, fade the rest** (round six pick, 11 Nov). In the poster view the phrases from `meta.keywords` stay full ink and bold, the rest of the prompt fades to grey. Nothing else: James cut the line explaining each phrase (highlighting is enough), so `keywords` is just a list of phrases. Copying the prompt copies it plain. A, C, D stay in code behind `?kw=`.
- **Phone pinch zoom** (asked for 11 Nov): in the poster view on phone, pinch zooms the poster inside its container (1x to 5x, clipped to the container, the edges never pull away), one finger pans while zoomed and is kept from the swipe to the next poster, double tap zooms back out (or in 2.5x when not zoomed). Vertical scrolling over the poster still scrolls the card when not zoomed.
- **Desktop HUD**: the about module bottom left ("30 posters in 30 minutes.", about text, Instagram and LinkedIn pills, "we give a sh*t."), a green "Get notified on GitHub" tab tucked into the bottom edge bottom right, a hint and zoom chip bottom centre. No posted counter, no second clock (removed at James's request).
- **Phone: L** (round four pick). The logo and a burger on a floating bar at the bottom; the burger opens a bottom sheet (about, socials, Get notified on GitHub). No clocks outside the wall.
- **Notifications: GitHub only** (Watch → Custom → Releases). James rejected email (Buttondown costs money for RSS-to-email), RSS, and a calendar subscription (calendars are too busy).
- **Removed at his request**: the share-to-socials panel, the posted counter, the second clock, the calendar, RSS, the top-left lockup chip, the "Latest poster" recap.
- **Intro**: a 60 → 00 counter once per session, then tiles rise in.
- **Motion rules**: one easing, cubic-bezier(.2,.7,.2,1); 200ms hovers, 300ms close, 450ms open; transform and opacity only (nothing animates width, height, top or left); stagger only infrequent entrances; 0.96 press.
- **Performance** (measured, iPhone 13 profile, CPU 4x slower): 14,236 → 5,182 DOM nodes (one text node per rolling digit), clocks only update on screen, render only when the wall moves, nothing ticks in hidden tabs, 558px thumbs with 1116px only when zoomed, no backdrop blur on poster chips, font preloaded. 35 → 51fps dragging, longest task 892 → 334ms. Desktop 60fps.
- The design options not picked (tiles D and E; phone and hover variants) are still in code behind `?tile=`, `?mobile=`, `?hover=` for reference. Defaults live in `site/site.config.js`.

### Socials (round seven, 11 Nov)
- James: the poster is the hero, the follow second, the challenge numbers third. Picked **B** (poster over a ledger and an acid follow tile) for single frames.
- Instagram carousel, five slides at 1080 × 1440: 1 the poster perfectly centred with crop marks and small labels; 2 the prompt's word count and the `keywords` that shaped it; 3 the numbers; 4 how it was made with tool logos; 5 follow and save. Every slide after the first is plain Blame Opal bento.
- LinkedIn: 4:5 (1080 × 1350) is the tallest a single image renders in the feed, and the same five slides go out as a PDF document carousel. A single 4:5 image is in the zip as a backup. Vendor claims that documents beat images are unsourced, so watch the numbers in the first week.
- Animated posters (asked for 12 Nov, day 02): the branded frames are supplied as videos, not a bare full bleed poster video. LinkedIn: `post-video.mp4`, the B single frame with the poster playing, posted instead of the carousel. Instagram: slide 1 as `1.mp4`, the Story as `story.mp4`. ffmpeg lays `poster.mp4` over the poster's exact spot in each still frame.
- 12 Nov, after day 02: no Story frames (James shares the carousel to his Story). Carousels weren't getting engagement on Instagram, so every day now gets a 10 second Reel: the carousel as one continuous bento that rearranges itself, no hard cuts or fades, nothing that looks AI made, every move on a 120 BPM beat. The handover message suggests three to five songs from that day's search for trending Reels audio near 120 BPM.
- LinkedIn's first line has to be extremely catchy: under a big caption it's the only line people see. Under 12 words, stops the scroll on its own.
- Day 01's LinkedIn post is the launch post: what the challenge is, the goal (how far Claude Code on Opus 5.5 gets on direction alone, which visual treatments it's good at, what it sticks to), and a call for suggestions.

### Brand and voice
- Socials are in the Blame Opal system (framed bento, Instrument Sans, one acid #67FF67 per view, sentence case, UK English, no em or en dashes). The **posters** follow the prompt, not the brand.
- Copy in James's voice: load `james-tone-of-voice` and `blame-opal`, run the Blame Opal `check` tool. `we give a sh*t.` only as a sign-off, lower case, asterisk.
- Instagram is `blameopal` everywhere.

### What James likes and dislikes (from the review rounds)
- Likes: Swiss and fintech typography (hairline rows, label left and value right, tabular figures, big numerals), edge over calm, minimal phone chrome, options shown live on a review page with one copy button.
- Dislikes: duplicated information (day number twice, tags twice), too many countdowns, too much text on hover, controls on video, anything that feels janky or slow, calendar reminders, social sharing panels.
- He reviews on his phone a lot. Check every change at iPhone size.

---

## Open items
- [ ] This repo's About > Website: set to https://thirty-posters-site.vercel.app (James, in GitHub settings).
- [ ] Real-device checks: video playback, pinch zoom, swipe, the sheet drag, frame rate on a cheap Android.
- [ ] Missing logos (see the logo library above): James to supply.
- [x] Full rehearsal (10 Nov): two test days (a still and an animated poster) through every stage in a throwaway copy. Fixed: the site build crashed on a day with meta.json but no render yet; share links now open the poster straight away (skipping the intro); the copy and Release links now use `/d/NN` so they show that poster as the link preview; Flora and Canva downloads were blocked.
- [x] Day 01, "Day one.", prompted 10 Nov 2026 at 21:55 UTC (147 words), published that night. James posts it at 7am on 11 Nov, so its `date` is 11 Nov and `start` in site.config.js anchors the schedule there: day N is due 11 Nov 07:00 + N x 24h. When it does, follow CLAUDE.md exactly.

## How to get context back fast
1. Read `CLAUDE.md` (operating manual) and this file.
2. `git log --oneline | head -40` for the history of changes.
3. Open the review page and `?demo` to see the current state.
