# Thirty posters

**See the wall: [REPLACE-WITH-VERCEL-URL](https://REPLACE-WITH-VERCEL-URL/)**

30 days. 30 posters. Each one made in Claude Code from a prompt written in 60 seconds, then posted as is. Every prompt is on the site, free to copy.

Want each one as it lands? Click **Watch > Custom > Releases** at the top of this page, or sign up on the site.

## How it works
- `days/NN/`: the prompt, the poster, the socials and the copy for each day
- `scripts/build-day.sh NN`: renders a day, packs the social zips, builds the site
- `scripts/publish-site.sh`: pushes the site to its own repo, which Vercel deploys
- `site/`: the website source
- `system/`: the Blame Opal template kit the socials are built on

we give a sh*t.
