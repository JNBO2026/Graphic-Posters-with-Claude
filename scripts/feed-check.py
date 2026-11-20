# Usage: python3 -I scripts/feed-check.py 11
# The posters live on phones. This shows days/NN/poster.jpg the size people actually see it, so anything that vanishes
# can be fixed before the socials are built:
#   290 px wide  the poster inside carousel frame 1 on a phone (about 390 px of screen, the frame's border and labels round it)
#   130 px wide  a tile on the Instagram profile grid
# Both are also shown blown back up (nearest neighbour), so you see exactly which pixels survive.
# Output: days/NN/feed.jpg (git-ignored). Look at it every day before moving on.
import sys, os
from PIL import Image, ImageDraw

day = sys.argv[1]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = Image.open(os.path.join(root, 'days', day, 'poster.jpg')).convert('RGB')
H = 820
feed, grid = src.resize((290, round(290 * src.height / src.width)), Image.LANCZOS), src.resize((130, round(130 * src.height / src.width)), Image.LANCZOS)
up = lambda im: im.resize((round(H * im.width / im.height), H), Image.NEAREST)
panels = [('feed, 290 px', feed), ('feed, blown up', up(feed)), ('grid tile, 130 px', grid), ('grid tile, blown up', up(grid))]
w = sum(p[1].width for p in panels) + 30 * (len(panels) + 1)
out = Image.new('RGB', (w, H + 60), (128, 128, 128)); d = ImageDraw.Draw(out); x = 30
for label, im in panels:
    out.paste(im, (x, 40)); d.text((x, 14), label, fill=(255, 255, 255)); x += im.width + 30
out.save(os.path.join(root, 'days', day, 'feed.jpg'), quality=88)
print('feed check:', os.path.join('days', day, 'feed.jpg'))
