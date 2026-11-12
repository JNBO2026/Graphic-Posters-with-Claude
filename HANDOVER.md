# What you get every day

Three zips, sent to you in the chat when the day is done. They're also saved in `days/NN/handover/` (kept out of git, so rebuild with `node scripts/package-day.js NN` if you need them again).

Every link in the copy is the day's share link (`/d/NN`): it previews that poster when pasted into LinkedIn or Instagram, then opens straight onto the poster and its prompt.

## Day-NN_LinkedIn.zip

```
Day-NN_LinkedIn/
├── carousel.pdf              the five slides as a LinkedIn document, 1080 × 1350 (4:5), light
├── post-copy.txt             the post, ready to paste
├── first-comment.txt         the site link, posted as the first comment
├── how-to-post.txt           order of play and why
├── single-image/
│   └── post-image.png        1080 × 1350, if you'd rather post one image: the poster, the ledger and the follow
└── dark-version/
    ├── carousel-dark.pdf
    └── post-image-dark.png
```

## Day-NN_Instagram.zip

```
Day-NN_Instagram/
├── Feed-carousel/            1080 × 1440 (3:4)
│   ├── 1.png                 the poster, centred, crop marks and four small labels
│   ├── 2.png                 the prompt: words in 60 seconds, and the phrases that shaped it
│   ├── 3.png                 the numbers: word count large, time, edits, made with
│   ├── 4.png                 how it was made, with the tools and their logos
│   ├── 5.png                 follow and save
│   └── caption.txt           the caption, ready to paste
├── Story/
│   ├── story.png             1080 × 1920: the poster over the ledger and the follow, clear of Instagram's top and bottom bars
│   └── stickers.txt          link sticker (site) and a poll, with exact wording
├── how-to-post.txt           order of play and why
└── dark-version/
    ├── Feed-carousel/1.png to 5.png
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

Animated posters: the branded frames move too. The LinkedIn zip gets `post-video.mp4` (the single image layout with the poster playing in it, 1080 × 1350, post it instead of the carousel), the Instagram zip gets `Feed-carousel/1.mp4` (slide 1 moving) and `Story/story.mp4` (also works as a Reel), each with a dark version. The bare poster loop stays in the Poster zip as `poster-A3.mp4`.

## And without you doing anything

- The site updates on Vercel: new poster at the top, added to the wall, prompt copyable.
- A GitHub Release goes out, so anyone watching the repo is notified.
