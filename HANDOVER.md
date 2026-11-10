# What you get every day

Three zips, sent to you in the chat when the day is done. They're also saved in `days/NN/handover/` (kept out of git, so rebuild with `node scripts/package-day.js NN` if you need them again).

Every link in the copy is the day's share link (`/d/NN`): it previews that poster when pasted into LinkedIn or Instagram, then opens straight onto the poster and its prompt.

## Day-NN_LinkedIn.zip

```
Day-NN_LinkedIn/
├── post-image.png            1080 × 1350, portrait, light
├── post-copy.txt             the post, ready to paste
├── first-comment.txt         the site link, posted as the first comment
├── how-to-post.txt           order of play and why
└── dark-version/
    └── post-image-dark.png
```

## Day-NN_Instagram.zip

```
Day-NN_Instagram/
├── Feed-carousel/
│   ├── 1.png                 1080 × 1440, the poster
│   ├── 2.png                 the rules
│   ├── 3.png                 the call to the site
│   └── caption.txt           the caption, ready to paste
├── Story/
│   ├── story.png             1080 × 1920, words kept out of Instagram's top and bottom zones
│   └── stickers.txt          link sticker (site) and a poll, with exact wording
├── how-to-post.txt           order of play and why
└── dark-version/
    ├── Feed-carousel/1.png 2.png 3.png
    └── Story/story.png
```

## Day-NN_Poster.zip

```
Day-NN_Poster/
├── poster-A3.jpg             2480 × 3508, the master (A3 ratio)
├── poster-A3.mp4             animated posters only: 1240 × 1754 MP4, loops
├── prompt.txt                your prompt, as typed
├── how-it-was-made.txt       code only, or which generative model made what
└── link.txt                  its page on the site
```

Animated posters also get `motion/poster.mp4` in the LinkedIn and Instagram zips, ready to post as a video or a Reel. The branded frames stay still.

## And without you doing anything

- The site updates on Vercel: new poster at the top, added to the wall, prompt copyable.
- A GitHub Release goes out, so anyone watching the repo is notified.
