# Day 21: Lenia, a continuous cellular automaton (Bert Chan, 2019). Code only, no generative model.
# Run: python3 -I days/21/lenia.py  ->  days/21/frames/fNNNN.png (git-ignored) and days/21/lenia.png
# A field of values between 0 and 1. Each step every cell looks at a ring of its neighbours (a smooth kernel),
# and grows or shrinks by how close that neighbourhood is to a sweet spot. Seeded with noise, it organises itself
# into creatures that hold their shape, glide, divide and die. Convolution by FFT, on a torus.
import numpy as np, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); FR = os.path.join(HERE, 'frames'); os.makedirs(FR, exist_ok=True)
GW, GH = int(os.environ.get('GW', 310)), int(os.environ.get('GH', 438))
R, MU, SIG, DT = float(os.environ.get('R', 13)), float(os.environ.get('MU', .15)), float(os.environ.get('SIG', .016)), .1
SEED, WARM, FRAMES, SPF = int(os.environ.get('SEED', 21)), int(os.environ.get('WARM', 200)), int(os.environ.get('FRAMES', 300)), 2
rng = np.random.default_rng(SEED)
y, x = np.mgrid[0:GH, 0:GW]
dx = np.minimum(x, GW - x); dy = np.minimum(y, GH - y); r = np.sqrt(dx ** 2 + dy ** 2) / R
K = np.where(r < 1, np.exp(4 - 1 / np.maximum(r * (1 - r), 1e-9)), 0); K /= K.sum()   # the smooth ring
FK = np.fft.fft2(K)
grow = lambda u: 2 * np.exp(-((u - MU) ** 2) / (2 * SIG ** 2)) - 1
A = np.zeros((GH, GW))
CREATURE = os.path.join(HERE, 'creature.npy')
if os.path.exists(CREATURE) and not os.environ.get('SOUP'):
    # a population: one creature found by searching soups (see the dev log), copied in eight orientations
    c = np.load(CREATURE); places = int(os.environ.get('N', 11))
    for i in range(places):
        cc = np.rot90(c, i % 4); cc = cc[:, ::-1] if (i // 4) % 2 else cc
        for _ in range(200):
            ox, oy = rng.integers(0, GW - cc.shape[1]), rng.integers(0, GH - cc.shape[0])
            if A[max(0, oy - 8):oy + cc.shape[0] + 8, max(0, ox - 8):ox + cc.shape[1] + 8].max() == 0: break
        A[oy:oy + cc.shape[0], ox:ox + cc.shape[1]] = np.maximum(A[oy:oy + cc.shape[0], ox:ox + cc.shape[1]], cc)
for _ in range(0 if (os.path.exists(CREATURE) and not os.environ.get('SOUP')) else int(os.environ.get('BLOBS', 40))):          # patches of noise, the soup life starts from
    cx, cy, s = rng.integers(0, GW), rng.integers(0, GH), int(rng.integers(int(R * 1.2), int(R * 2.2)))
    A[np.ix_((np.arange(s) + cy) % GH, (np.arange(s) + cx) % GW)] = rng.uniform(0, 1, (s, s))
step = lambda A: np.clip(A + DT * grow(np.real(np.fft.ifft2(np.fft.fft2(A) * FK))), 0, 1)
for _ in range(WARM): A = step(A)
for f in range(FRAMES):
    for _ in range(SPF): A = step(A)
    Image.fromarray((A * 255).astype(np.uint8)).save(os.path.join(FR, 'f%04d.png' % (f + 1)))
Image.fromarray((A * 255).astype(np.uint8)).save(os.path.join(HERE, 'lenia.png'))
print('done mass', round(float(A.mean()), 4))
if os.environ.get('SAVE_CREATURE'):
    my, mx = np.unravel_index(np.argmax(A), A.shape); A = np.roll(np.roll(A, GH // 2 - my, 0), GW // 2 - mx, 1)   # centre it, off the seam
    ys, xs = np.nonzero(A > .005); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    np.save(CREATURE, A[y0:y1, x0:x1]); print('creature', y1 - y0, 'x', x1 - x0)
