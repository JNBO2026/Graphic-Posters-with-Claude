# Day 30: copy each day's small thumbnail into tiles/ and rank them by brightness, for the mosaic.
# Run after every other day is rendered: python3 -I days/30/tiles.py
import os, json
from PIL import Image, ImageStat
HERE = os.path.dirname(os.path.abspath(__file__)); DAYS = os.path.dirname(HERE)
out = []
for d in range(1, 30):
    src = os.path.join(DAYS, '%02d' % d, 'thumb-s.jpg')
    im = Image.open(src).convert('RGB').resize((176, 249), Image.LANCZOS)
    im.save(os.path.join(HERE, 'tiles', '%02d.jpg' % d), quality=86)
    out.append({'day': d, 'lum': round(ImageStat.Stat(im.convert('L')).mean[0] / 255, 3)})
out.sort(key=lambda o: o['lum'])
json.dump(out, open(os.path.join(HERE, 'tiles.json'), 'w'), indent=1)
print(' '.join('%02d:%.2f' % (o['day'], o['lum']) for o in out))
