# Day 09: the collage, and the illusion inside it. Code only, no generative model.
# Run: python3 -I days/09/collage.py  ->  days/09/collage.png (2480 x 3508, the poster at 2x)
#
# Every piece is a CC0 or public domain photo from Wikimedia Commons (days/09/src, sources in src/credits.json),
# torn by hand in code and laid down in layers. Each piece is chosen, and cropped, for how closely its colours match
# the same patch of one photo: a cup of tea on a saucer (src/teacup-02.jpg). So the tea is made of sunsets, the cup
# of cloud and surf. Then the low frequencies are swapped for the cup's: up close you see the holiday, but small on a
# phone, or blurred by a scroll, all you can see is the first brew back home.
import numpy as np, os, json, math
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src')
W, H, M = 2480, 3508, 160                      # canvas and the paper margin round the collage
IW, IH = W - 2 * M, H - 2 * M
rng = np.random.default_rng(int(os.environ.get('SEED', 9)))
SIGMA = float(os.environ.get('SIGMA', 26))     # where "up close" ends and "at a glance" begins
SWAP = float(os.environ.get('SWAP', .85))      # how much of the cup's low frequencies replace the collage's

# ---------- the target: the cup, cut out and set low, steam rising, on the grey of a rainy afternoon at home ----------
cup = Image.open(os.path.join(SRC, 'teacup-02.jpg')).convert('RGB')
cwid = int(IW * 1.04); k = cwid / cup.width; cup = cup.resize((cwid, round(cup.height * k)), Image.LANCZOS)
# the cup and saucer, by hand: the glass, and the saucer's ellipse (in the photo's own 1080 x 1440 frame, scaled)
cm = Image.new('L', cup.size, 0); dm = ImageDraw.Draw(cm); s3 = k * 3
dm.rounded_rectangle((60 * s3, 108 * s3, 312 * s3, 300 * s3), radius=40 * s3, fill=255)
dm.ellipse((-4 * s3, 236 * s3, 364 * s3, 356 * s3), fill=255)
cm = cm.filter(ImageFilter.GaussianBlur(10))
yy = np.linspace(0, 1, IH)[:, None, None]
bg = (np.array([96, 108, 122]) * (1 - yy) + np.array([150, 158, 166]) * yy) * np.ones((1, IW, 1))
T = Image.fromarray(bg.astype(np.uint8))
# steam: three soft wisps rising from the tea, the way it does in a cold kitchen
st = Image.new('L', (IW, IH), 0); ds = ImageDraw.Draw(st)
cy0 = int(IH * .55)
for j, (x0, amp, ph, wd) in enumerate([(.38, 110, 0., 120), (.55, 140, 1.7, 150), (.70, 90, 3.1, 100)]):
    pts = []
    for t in np.linspace(0, 1, 160):
        y = cy0 - t * IH * .52; x = IW * x0 + math.sin(t * 6.5 + ph) * amp * (.3 + t) + (t * t) * 120 * (j - 1)
        pts.append((x, y))
    for i in range(len(pts) - 1):
        t = i / len(pts); ds.line([pts[i], pts[i + 1]], fill=int(255 * (1 - t) ** .8 * min(1, t * 6)), width=int(wd * (1 + t * 1.6)))
st = st.filter(ImageFilter.GaussianBlur(60))
T = Image.composite(Image.new('RGB', (IW, IH), (240, 240, 236)), T, st.point(lambda v: min(255, v * 1.15)))
T.paste(cup, (int((IW - cwid) / 2), int(IH * .55 - 108 * s3)), cm)
Ta = np.asarray(T).astype(np.float32)
Tsmall = np.asarray(T.resize((IW // 8, IH // 8), Image.BILINEAR)).astype(np.float32)
T.save(os.path.join(HERE, 'dev', '_target.png'))

# ---------- the holiday: every other photo, each offering a few dozen crops ----------
HOME = {'teacup-02'}   # the cup is the target, not a piece
SKIP = {'lavender-01'}  # one lavender is plenty: two turned the grey purple
names = sorted(f[:-4] for f in os.listdir(SRC) if f.endswith('.jpg') and f[:-4] not in HOME | SKIP)
srcs = {n: Image.open(os.path.join(SRC, n + '.jpg')).convert('RGB') for n in names}
G = 6  # each patch compared as a 6 x 6 colour grid
cands = []
for n, im in srcs.items():
    for _ in range(48):
        z = rng.uniform(.25, .8)                               # how much of the photo the crop takes
        cw2, ch2 = im.width * z, im.width * z * rng.uniform(.75, 1.35)
        ch2 = min(ch2, im.height)
        x0, y0 = rng.uniform(0, im.width - cw2), rng.uniform(0, im.height - ch2)
        box = (x0, y0, x0 + cw2, y0 + ch2)
        g = np.asarray(im.resize((G, G), Image.BILINEAR, box=box)).astype(np.float32)
        cands.append((n, box, g))
cg = np.stack([c[2] for c in cands]).reshape(len(cands), -1)
used = np.zeros(len(cands))
img_of = np.array([names.index(c[0]) for c in cands]); img_used = np.zeros(len(names))  # so no one photo takes over

def torn_mask(w, h, torn_sides, seed):
    """A photo with some edges torn: a ragged, fibrous line; returns the photo mask and the white paper core
    that shows along the torn edges only (a cut edge has none)."""
    r = np.random.default_rng(seed)
    def edge(a, b, torn, out=0., n=90):
        pts = []; ph = r.uniform(0, 9, 3)
        for i in range(n):
            t = i / n; x = a[0] + (b[0] - a[0]) * t; y = a[1] + (b[1] - a[1]) * t
            nx, ny = -(b[1] - a[1]), (b[0] - a[0]); L = math.hypot(nx, ny); nx, ny = nx / L, ny / L
            if torn:
                d = 5 * math.sin(t * 3.1 + ph[0]) + 3 * math.sin(t * 11 + ph[1]) + r.normal(0, 1.1)
                d -= out * (2.5 + 2.5 * (.5 + .5 * math.sin(t * 7 + ph[2])))   # the white core is wider in places
                x += nx * d; y += ny * d
            pts.append((x, y))
        return pts
    c = [(9, 9), (w - 9, 9), (w - 9, h - 9), (9, h - 9)]
    photo, core = [], []
    st = r.integers(1 << 30)
    for i in range(4):
        r = np.random.default_rng(st + i); photo += edge(c[i], c[(i + 1) % 4], i in torn_sides)
    for i in range(4):
        r = np.random.default_rng(st + i); core += edge(c[i], c[(i + 1) % 4], i in torn_sides, out=1.)
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).polygon(photo, fill=255)
    cm = Image.new('L', (w, h), 0); ImageDraw.Draw(cm).polygon(core, fill=255)
    return m.filter(ImageFilter.GaussianBlur(.7)), cm.filter(ImageFilter.GaussianBlur(.9))

canvas = Image.new('RGB', (IW, IH), (238, 232, 220))
paper = np.asarray(canvas).astype(np.float32)

def place(cx, cy, size):
    w = int(size * rng.uniform(.8, 1.25)); h = int(size * rng.uniform(.8, 1.25)); ang = rng.uniform(-14, 14)
    if rng.random() < .18: w, h = (int(size * 1.9), int(size * .6)) if rng.random() < .5 else (int(size * .6), int(size * 1.9))  # strips
    x0, y0 = int(cx - w / 2), int(cy - h / 2)
    # what the cup looks like under this piece
    box = (max(0, x0) // 8, max(0, y0) // 8, max(1, min(IW, x0 + w) // 8), max(1, min(IH, y0 + h) // 8))
    if box[2] <= box[0] or box[3] <= box[1]: return
    tg = np.asarray(Image.fromarray(Tsmall[box[1]:box[3], box[0]:box[2]].astype(np.uint8)).resize((G, G), Image.BILINEAR)).astype(np.float32).reshape(-1)
    lumw = np.tile([.35, .5, .15], G * G) * 3
    d = (((cg - tg) ** 2) * lumw).mean(1) + used * 260 + img_used[img_of] * 9 + rng.uniform(0, 120, len(cands))
    i = int(np.argmin(d)); used[i] += 1; img_used[img_of[i]] += 1
    n, sbox, _ = cands[i]
    piece = srcs[n].resize((w, h), Image.LANCZOS, box=sbox)
    torn = set(rng.choice(4, size=int(rng.integers(1, 4)), replace=False).tolist())
    m, rim = torn_mask(w, h, torn, int(rng.integers(1e6)))
    # a soft shadow on whatever is underneath
    sh = rim.filter(ImageFilter.GaussianBlur(9))
    big = lambda im, fill: im.rotate(ang, resample=Image.BICUBIC, expand=True, fillcolor=fill)
    piece_r, m_r, rim_r, sh_r = big(piece, (0, 0, 0)), big(m, 0), big(rim, 0), big(sh, 0)
    px, py = int(cx - piece_r.width / 2), int(cy - piece_r.height / 2)
    canvas.paste((20, 16, 12), (px + 5, py + 8), sh_r.point(lambda v: v * .22))
    canvas.paste((240, 236, 226), (px, py), rim_r)
    canvas.paste(piece_r, (px, py), m_r)

# ---------- layers: big pieces first, smaller ones where the cup's edges need drawing ----------
edge = np.asarray(T.convert('L').resize((IW // 8, IH // 8)).filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(3))).astype(np.float32)
edge /= edge.max()
for size, count, follow in [(900, 14, 0), (600, 50, 0), (400, 110, .2), (260, 240, .5), (170, 420, .8), (105, 600, .9)]:
    for _ in range(count):
        if rng.random() < follow:   # small pieces cluster on the cup's contour, so its shape stays sharp
            flat = edge.reshape(-1) + 1e-4; j = rng.choice(flat.size, p=flat / flat.sum())
            cy, cx = divmod(j, edge.shape[1]); cx = cx * 8 + rng.uniform(0, 8); cy = cy * 8 + rng.uniform(0, 8)
        else:
            cx, cy = rng.uniform(-60, IW + 60), rng.uniform(-60, IH + 60)
        place(cx, cy, size)
    print('layer', size, flush=True)

C = np.asarray(canvas).astype(np.float32)
# ---------- the illusion: keep the collage's detail, give it the cup's low frequencies ----------
blur = lambda a: np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(SIGMA))).astype(np.float32)
out = C + (blur(Ta) - blur(C)) * SWAP
out = np.clip(out, 0, 255)

final = Image.new('RGB', (W, H), (236, 230, 218))
final.paste(Image.fromarray(out.astype(np.uint8)), (M, M))
final.save(os.path.join(HERE, 'collage.png'))
json.dump({'pieces': int(used.sum()), 'photos': sorted({cands[i][0] for i in np.nonzero(used)[0]})}, open(os.path.join(HERE, 'collage.json'), 'w'), indent=1)
print('done', int(used.sum()), 'pieces')
