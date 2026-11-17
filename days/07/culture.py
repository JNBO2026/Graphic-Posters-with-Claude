# Grows the culture in the petri dish: a Gray-Scott reaction-diffusion simulation, numpy only, no generative model.
# Run: python3 -I days/07/culture.py   ->  days/07/culture.png (R = colony density, G = species, B = age: when growth reached each point)
# Seven species, each its own feed and kill rate, so the plate grows spots, mazes, coral and holes side by side;
# seeded the way a plate is: a few drops, and a zig-zag streak from an inoculating loop.
import numpy as np, os
from PIL import Image

N, STEPS, rng = 1024, 9000, np.random.default_rng(7)
y, x = (np.mgrid[0:N, 0:N].astype(np.float32) + .5) / N * 2 - 1
inside = (x * x + y * y) < .985

# species: feed (F) and kill (k) pairs: spots, mazes, coral, holes, worms, mitosis, fine labyrinth
SPECIES = [(.0367, .0649), (.0290, .0570), (.0545, .0620), (.0390, .0580), (.0420, .0610), (.0300, .0550), (.0260, .0530)]
DEAD = (.0250, .0700)  # bare agar: nothing survives here, so colonies stop at their own edges
# the plate's composition (texture space, -1..1; x < 0 is the half on the page): a few big colonies, many small, one streak
COLONIES = [(-.48, -.36, .34, 1), (-.56, .40, .29, 2), (-.10, .02, .21, 3), (-.22, .70, .17, 0), (-.16, -.78, .15, 4),
            (-.86, .02, .10, 5), (-.30, -.02, .07, 6), (.08, .45, .12, 0), (.10, -.42, .10, 5)]
for _ in range(34):
    cx, cy = rng.uniform(-.95, .15), rng.uniform(-.95, .95)
    COLONIES.append((cx, cy, rng.uniform(.02, .07), int(rng.integers(0, 7))))
def wob(cx, cy, k):  # an irregular edge, so no colony is a perfect circle
    a = np.arctan2(y - cy, x - cx)
    return 1 + .10 * np.sin(3 * a + k) + .06 * np.sin(5 * a + 2 * k) + .04 * np.sin(11 * a + 3 * k)
def grow(M, n):
    M = M.copy()
    for _ in range(n): M = M | np.roll(M, 1, 0) | np.roll(M, -1, 0) | np.roll(M, 1, 1) | np.roll(M, -1, 1)
    return M
F = np.full((N, N), DEAD[0], np.float32); K = np.full((N, N), DEAD[1], np.float32)
species = np.zeros((N, N), np.float32); terr = np.zeros((N, N), bool)
for j, (cx, cy, r, sp) in enumerate(COLONIES):
    m = np.hypot(x - cx, y - cy) < r * wob(cx, cy, j * 1.7)
    m &= ~grow(terr, 7); terr |= m   # a strip of bare agar between neighbours, like a road between fields
    F[m], K[m] = SPECIES[sp]; species[m] = sp / 6
# the streak: an inoculating loop dragged back and forth across the top left
streak = np.zeros((N, N), bool)
for t in np.linspace(0, 1, 900):
    sx, sy = -.92 + .7 * t, -.70 + .16 * np.sin(t * np.pi * 7) + .1 * t
    streak |= (x - sx) ** 2 + (y - sy) ** 2 < .022 ** 2
streak &= ~grow(terr, 7); terr |= streak
F[streak], K[streak] = SPECIES[0]; species[streak] = 0
F = F * inside + DEAD[0] * ~inside; K = K * inside + DEAD[1] * ~inside

U = np.ones((N, N), np.float32); V = np.zeros((N, N), np.float32)
def seed(cx, cy, r):
    m = ((x - cx) ** 2 + (y - cy) ** 2 < r * r) & terr
    U[m] = .5; V[m] = .25 + rng.uniform(0, .05, m.sum())
for cx, cy, r, sp in COLONIES:
    seed(cx, cy, max(.012, r * .12))
    for _ in range(int(r * 14)): seed(cx + rng.uniform(-.6, .6) * r, cy + rng.uniform(-.6, .6) * r, .01)
for t in np.linspace(0, 1, 60): seed(-.92 + .7 * t, -.70 + .16 * np.sin(t * np.pi * 7) + .1 * t, .012)

age = np.full((N, N), -1, np.float32)
lap = lambda Z: np.roll(Z, 1, 0) + np.roll(Z, -1, 0) + np.roll(Z, 1, 1) + np.roll(Z, -1, 1) - 4 * Z
for i in range(STEPS):
    uvv = U * V * V
    U += (1.0 * lap(U) * .2 - uvv + F * (1 - U))
    V += (.5 * lap(V) * .2 + uvv - (F + K) * V)
    U[~inside] = 1; V[~inside] = 0
    if i % 30 == 0:
        new = (V > .15) & (age < 0); age[new] = i
    if i % 1000 == 0: print(i, flush=True)

age[age < 0] = STEPS
# every bare point takes the species of the nearest colony, so a colour never changes at a colony's edge
lab, have = species.copy(), terr.copy()
while not have.all():
    for ax, sh in ((0, 1), (0, -1), (1, 1), (1, -1)):
        nl, nh = np.roll(lab, sh, ax), np.roll(have, sh, ax)
        take = nh & ~have; lab[take] = nl[take]; have |= take
species = lab
img = np.stack([np.clip(V / max(V.max(), 1e-6), 0, 1), species, age / STEPS], -1)
Image.fromarray((img * 255).round().astype(np.uint8)).save(os.path.join(os.path.dirname(__file__), 'culture.png'))
print('done')
