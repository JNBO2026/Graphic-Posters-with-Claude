# Day 18: an ensō painted by a fluid. Code only, no generative model.
# Run: python3 -I days/18/enso.py  ->  days/18/frames/fNNNN.png (git-ignored) and days/18/enso.png (the finished circle)
# A brush goes once round an open circle, in one breath: it pushes the water (stable fluids, after Jos Stam, 1999)
# and lays ink. The ink rides the flow and soaks into the paper unevenly (a fibre map), so it blooms and feathers.
# Each frame of the stroke is saved; the poster plays them as its loop.
import numpy as np, os, math
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__)); FR = os.path.join(HERE, 'frames'); os.makedirs(FR, exist_ok=True)
N = int(os.environ.get('N', 480)); SC = N / 480          # SC keeps the look the same at any test size
rng = np.random.default_rng(18)
yy, xx = np.mgrid[0:N, 0:N].astype(np.float64)

def blur(a, r=1):
    for _ in range(r):
        a = (a * 4 + np.roll(a, 1, 0) + np.roll(a, -1, 0) + np.roll(a, 1, 1) + np.roll(a, -1, 1)) / 8
    return a

def advect(f, u, v, dt):
    # semi-Lagrangian: look back along the flow and sample there (bilinear)
    px = np.clip(xx - dt * u, 0, N - 1.001); py = np.clip(yy - dt * v, 0, N - 1.001)
    x0 = px.astype(int); y0 = py.astype(int); fx = px - x0; fy = py - y0
    return (f[y0, x0] * (1 - fx) * (1 - fy) + f[y0, x0 + 1] * fx * (1 - fy) + f[y0 + 1, x0] * (1 - fx) * fy + f[y0 + 1, x0 + 1] * fx * fy)

def project(u, v, it=30):
    # make the flow incompressible, so it swirls rather than piles up
    div = -.5 * (np.roll(u, -1, 1) - np.roll(u, 1, 1) + np.roll(v, -1, 0) - np.roll(v, 1, 0))
    p = np.zeros_like(u)
    for _ in range(it): p = (div + np.roll(p, 1, 0) + np.roll(p, -1, 0) + np.roll(p, 1, 1) + np.roll(p, -1, 1)) / 4
    return u - .5 * (np.roll(p, -1, 1) - np.roll(p, 1, 1)), v - .5 * (np.roll(p, -1, 0) - np.roll(p, 1, 0))

# the paper: fibres in every direction, so the ink spreads further along some paths than others
fib = np.zeros((N, N))
for _ in range(3000):
    cx, cy, a, L = rng.uniform(0, N), rng.uniform(0, N), rng.uniform(0, math.pi), rng.uniform(5, 26)
    for t in np.linspace(-.5, .5, int(L) + 1):
        fib[int(cy + math.sin(a) * L * t) % N, int(cx + math.cos(a) * L * t) % N] += 1
fib = .55 + .45 * blur(np.clip(fib, 0, 2) / 2, 1)
noise = blur(rng.uniform(0, 1, (N, N)), 6); noise = (noise - noise.min()) / (noise.max() - noise.min())

u = np.zeros((N, N)); v = np.zeros((N, N)); wet = np.zeros((N, N)); ink = np.zeros((N, N))
CX, CY, R = N * .5, N * .5, N * .34
A0, SWEEP = math.radians(-112), math.radians(322)        # starts low left, goes round clockwise, stops short: the circle left open
FRAMES, SUB = int(os.environ.get('FRAMES', 300)), 2
STROKE = int(FRAMES * .73)                                              # frames the brush is down; the rest is the ink settling
for f in range(FRAMES):
    for s in range(SUB):
        k = (f * SUB + s) / (STROKE * SUB)
        if k <= 1:
            # the brush: eased like a real hand, fast through the middle, slow at the start and the lift
            e = .5 - .5 * math.cos(math.pi * k)
            a = A0 + SWEEP * e
            r = R * (1 + .025 * math.sin(a * 3 + 1))         # a hand isn't a compass
            bx, by = CX + r * math.cos(a), CY + r * math.sin(a)
            # load: a full brush at the start, running dry towards the end, so the stroke breaks into dry streaks
            load = (1 - k) ** .7
            width = 15 * SC * (.32 + .95 * load) * (1 + .1 * math.sin(k * 23))
            d2 = (xx - bx) ** 2 + (yy - by) ** 2
            foot = np.exp(-d2 / (2 * width ** 2))
            tx, ty = -math.sin(a), math.cos(a)
            u += foot * tx * .35 * SC; v += foot * ty * .35 * SC
            # dry brush: as the load falls, the bristles leave gaps across the stroke
            across = ((xx - bx) * math.cos(a) + (yy - by) * math.sin(a)) / width
            bristle = .5 + .5 * np.sin(across * 7 + noise * 4)   # fixed to the brush, so the dry gaps stay open
            core = np.clip((foot - .35) * 3, 0, 1)             # a brush has an edge: ink sits where the bristles touch
            dry = bristle > (.05 + .9 * (1 - load) ** 1.2)
            dep = core * (1.4 * load * .3 + 1.2 * dry)
            ink += dep * .22; wet += foot * (.25 + .5 * load)
        u, v = advect(u, u, v, .7), advect(v, u, v, .7)
        u *= .93; v *= .93
        u, v = project(u, v, 18)
        ink = advect(ink, u, v, .7)
        # capillary bloom: wet ink creeps into the paper along the fibres, then the paper dries
        spread = (blur(ink, 1) - ink) * .22 * fib * np.clip(wet, 0, 1) ** 2
        ink = ink + spread
        wet *= .975
    tone = 1 - np.exp(-ink * 2.6)                                 # how dark, from how much ink
    tone *= .9 + .1 * fib                                         # the fibres show through
    Image.fromarray((np.clip(tone, 0, 1) * 255).astype(np.uint8)).save(os.path.join(FR, 'f%04d.png' % (f + 1)))
    if f % 30 == 0: print('frame', f, flush=True)
Image.fromarray((np.clip(tone, 0, 1) * 255).astype(np.uint8)).save(os.path.join(HERE, 'enso.png'))
print('done')
