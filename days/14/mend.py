# Day 14: mend the long jumps in the one line (run after line.py): python3 -I days/14/mend.py
# 2-opt with neighbour lists leaves a few long straight jumps. For each edge longer than LIMIT, try every possible
# 2-opt swap against the whole tour and take the best; repeat until no long edge can be shortened.
import json, os, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); f = os.path.join(HERE, 'path.json')
d = json.load(open(f)); T = np.array(d['points'], dtype=np.float64); P = T[:, :2]; n = len(P)
LIMIT = 40
for it in range(400):
    seg = np.hypot(*(P[1:] - P[:-1]).T); bad = np.where(seg > LIMIT)[0]
    if not len(bad): break
    improved = False
    for i in bad[np.argsort(-seg[bad])]:
        a, b = P[i], P[i + 1]
        # every edge (j, j+1): gain of reversing the run between them
        c, dd = P[:-1], P[1:]
        gain = seg[i] + seg - np.hypot(*(a - c).T) - np.hypot(*(b - dd).T)
        gain[max(0, i - 1):i + 2] = -1
        j = int(np.argmax(gain))
        if gain[j] > 1e-6:
            lo, hi = (i + 1, j) if j > i else (j + 1, i)
            T[lo:hi + 1] = T[lo:hi + 1][::-1].copy(); P = T[:, :2]; improved = True; break
    if not improved: break
seg = np.hypot(*(P[1:] - P[:-1]).T)
print('longest edge now', round(seg.max()), 'edges over', LIMIT, int((seg > LIMIT).sum()), 'length', round(seg.sum()))
json.dump({'points': [[round(float(x), 1), round(float(y), 1), round(float(k), 2)] for x, y, k in T], 'length': round(seg.sum())}, open(f, 'w'))
