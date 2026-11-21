# Day 14: one photo, one line. Code only, no generative model.
# Run: python3 -I days/14/line.py  ->  days/14/path.json (the whole picture as one continuous path)
# 1. The photo (src/puppy-02.jpg, CC0, Wikimedia Commons) becomes a density map: dark draws more line.
# 2. Weighted stippling: points scattered by darkness, then relaxed (Lloyd's algorithm) so they space themselves evenly.
# 3. A travelling salesman tour through every point: nearest neighbour to start, then 2-opt until no crossing is worth undoing.
import numpy as np, json, os, time
from PIL import Image, ImageOps, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, M = 1240, 1754, 72
AW, AH = W - 2 * M, H - 2 * M
N = int(os.environ.get('N', 11000))
rng = np.random.default_rng(14)

im = Image.open(os.path.join(HERE, 'src', 'puppy-02.jpg')).convert('L')
cw = int(im.height * AW / AH); x0 = (im.width - cw) // 2
im = im.crop((x0, 0, x0 + cw, im.height)).resize((AW // 4, AH // 4), Image.LANCZOS)   # density grid, 4 px a cell
im = ImageOps.autocontrast(im, cutoff=1).filter(ImageFilter.GaussianBlur(.6))
dark = 1 - np.asarray(im).astype(np.float32) / 255
dens = np.clip((dark - .12) / .8, 0, 1) ** 2.0 + .01             # a little everywhere, so the line can always cross the page
gh, gw = dens.shape
ys, xs = np.mgrid[0:gh, 0:gw]; cells = np.stack([xs.ravel() + .5, ys.ravel() + .5], 1).astype(np.float32); wts = dens.ravel()

# scatter by density
p = wts / wts.sum(); idx = rng.choice(len(p), N, p=p)
pts = cells[idx] + rng.uniform(-.5, .5, (N, 2)).astype(np.float32)

# Lloyd relaxation, weighted: each point moves to the weighted centre of the cells nearest it
t0 = time.time()
for it in range(int(os.environ.get('ITERS', 12))):
    near = np.empty(len(cells), np.int32)
    for a in range(0, len(cells), 1500):
        c = cells[a:a + 1500]
        d = ((c[:, None, :] - pts[None, :, :]) ** 2).sum(2)
        near[a:a + 1500] = d.argmin(1)
    sw = np.bincount(near, wts, N); sx = np.bincount(near, wts * cells[:, 0], N); sy = np.bincount(near, wts * cells[:, 1], N)
    ok = sw > 0
    pts[ok, 0] = sx[ok] / sw[ok]; pts[ok, 1] = sy[ok] / sw[ok]
    print('lloyd', it, round(time.time() - t0, 1), flush=True)
P = pts * 4 + M                                        # poster pixels

# neighbours on a grid, for the tour
def knn(P, k):
    out = np.empty((len(P), k), np.int32)
    for a in range(0, len(P), 2000):
        d = ((P[a:a + 2000, None, :] - P[None, :, :]) ** 2).sum(2)
        out[a:a + 2000] = np.argsort(d, 1)[:, 1:k + 1]
    return out
NB = knn(P, 10)

# nearest neighbour tour, starting top left
n = len(P); used = np.zeros(n, bool); tour = [int(np.argmin(P[:, 0] + P[:, 1]))]; used[tour[0]] = True
for _ in range(n - 1):
    c = tour[-1]; nxt = -1
    for j in NB[c]:
        if not used[j]: nxt = j; break
    if nxt < 0:
        d = ((P - P[c]) ** 2).sum(1); d[used] = np.inf; nxt = int(np.argmin(d))
    tour.append(int(nxt)); used[nxt] = True
tour = np.array(tour)

# 2-opt with neighbour lists: undo every crossing that shortens the line
pos = np.empty(n, np.int32); pos[tour] = np.arange(n)
dist = lambda a, b: float(np.hypot(*(P[a] - P[b])))
improved, passes = True, 0
while improved and passes < 40 and time.time() - t0 < 600:
    improved = False; passes += 1
    for i in range(n - 1):
        a, b = tour[i], tour[i + 1]; dab = dist(a, b)
        for c in NB[a]:
            j = pos[c]
            if j <= i + 1 or j >= n - 1: continue
            d_ = tour[j + 1]
            delta = dist(a, c) + dist(b, d_) - dab - dist(c, d_)
            if delta < -1e-6:
                tour[i + 1:j + 1] = tour[i + 1:j + 1][::-1]; pos[tour[i + 1:j + 1]] = np.arange(i + 1, j + 1)
                improved = True; break
    L = sum(dist(tour[k], tour[k + 1]) for k in range(n - 1))
    print('2-opt pass', passes, 'length', round(L), flush=True)

# how dark the picture is at each point, so the stroke can thicken in the shadows like an engraving
dk = dark[np.clip((P[:, 1] - M) / 4, 0, gh - 1).astype(int), np.clip((P[:, 0] - M) / 4, 0, gw - 1).astype(int)]
out = [[round(float(P[k, 0]), 1), round(float(P[k, 1]), 1), round(float(dk[k]), 2)] for k in tour]
json.dump({'points': out, 'length': round(L)}, open(os.path.join(HERE, 'path.json'), 'w'))
print('done', n, 'points, one line', round(L / 1000, 1), 'thousand px long')
