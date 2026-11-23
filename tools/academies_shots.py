"""يبني قائمة اللقطات لكل قسم من مقاطعه، ومدد اللقطات على الإيقاع: نص بار (35/34 فريم) أو بار (69 = 2.3ث).

- كل لقطة تنأخذ من أثبت جزء بالمقطع (أقل اهتزاز) حسب motion.json من tools/shake_profile.py
- المقاطع الأقصر من 1.2 ثانية، أو اللي ما فيها جزء ثابت، تنشال
- بدون هدف: كل المقاطع (والطويل فوق 6 ثواني ينقسم لقطتين)
- مع هدف (قسم:بارات): ينختار عدد مقاطع موزعة بالتساوي على التسلسل الزمني لين يطابق المجموع الهدف بالضبط

الاستخدام:
    python tools/academies_shots.py durs.txt shots.json --motion motion.json lead:24 dev:16 techno:26
    python tools/academies_shots.py durs.txt shots.json --motion motion.json techno dev lead     # كل المقاطع
"""
import argparse
import json
import sys

import numpy as np

BAR, HALF = 69, 35
SHAKY = 1.2  # متوسط إزاحة (بكسل على عرض 160) فوقها تنحسب اللقطة مهتزة
# استثناءات يدوية: اسم المقطع ← [(بداية بالثواني، مدة بالفريمات)] لجزء خربان ما يبينه قياس الاهتزاز (أحد يمر قدام الكاميرا)
OVR = {'techno_C7031': [(0.6, BAR)], 'techno_C7032': [(0.0, HALF)], 'lead_C7235': [(1.4, BAR)], 'lead_C7147': [(9.2, BAR)]}

ap = argparse.ArgumentParser()
ap.add_argument('durs')
ap.add_argument('out')
ap.add_argument('sections', nargs='+')
ap.add_argument('--motion')
a = ap.parse_args()
durs = {n: float(t) for n, t in (l.split() for l in open(a.durs))}
motion = json.load(open(a.motion)) if a.motion else {}


def best_start(n, d, lo=0.0, hi=None):
    """بداية (بالثواني) لأثبت نافذة مدتها d فريم داخل [lo, hi]، والأقرب للنص عند التساوي."""
    L = durs[n]
    hi = L if hi is None else hi
    m = np.array(motion.get(n, []))
    first, last = int(lo * 30) + 3, int(hi * 30) - d - 2
    if len(m) == 0 or last <= first:
        return max(0.1, min((L - d / 30) / 2, L - d / 30 - 0.05)), 0.0
    c = np.concatenate([[0], np.cumsum(m)])
    best = None
    mid = (first + last) / 2
    for s in range(first, last + 1):
        e = min(len(m), s + d)
        cost = (c[e] - c[min(s, len(m))]) / max(1, e - s)
        key = (round(cost, 1), abs(s - mid))
        if best is None or key < best[0]:
            best = (key, s, cost)
    return best[1] / 30, best[2]


def segs_for(n, full, split):
    if n in OVR:
        return OVR[n]
    L = durs[n]
    d = BAR if full else HALF
    if split and L >= 6:
        out = []
        for lo, hi in ((0, L / 2 + 1), (L / 2 - 1, L)):
            st, cost = best_start(n, BAR, lo, hi)
            if cost <= SHAKY:
                out.append((st, BAR))
        if len(out) == 2 and out[1][0] - out[0][0] < 2.4:
            out = out[:1]
        return out
    st, cost = best_start(n, d)
    return [(st, d)] if cost <= SHAKY else []


res = {}
for spec in a.sections:
    sec, _, tgt = spec.partition(':')
    names = sorted([n for n in durs if n.startswith(sec + '_')], key=lambda n: (len(n), n))
    usable = [n for n in names if durs[n] >= 1.2 and segs_for(n, durs[n] >= 2.4, False)]
    dropped = [n for n in names if n not in usable]
    if not tgt:
        plan = [(n, s) for n in usable for s in segs_for(n, durs[n] >= 2.4, True)]
    else:
        T = int(tgt) * 2  # بأنصاف البارات
        pick = usable
        for N in range(len(usable), 0, -1):
            idx = np.unique(np.round(np.linspace(0, len(usable) - 1, N)).astype(int))
            cand = [usable[i] for i in idx]
            if sum(2 if durs[n] >= 2.4 else 1 for n in cand) <= T or N == 1:
                pick = cand
                break
        full = {n: durs[n] >= 2.4 for n in pick}
        # إذا ناقص، كبّر لقطات من نص بار لبار (موزعة)، وإذا ما كفى أضف مقاطع
        while sum(2 if full[n] else 1 for n in pick) < T:
            halves = [n for n in pick if not full[n] and durs[n] >= 2.4]
            if halves:
                full[halves[len(halves) // 2]] = True
                continue
            extra = [n for n in usable if n not in full]
            if not extra:
                break
            n = extra[len(extra) // 2]
            full[n] = False
            pick = [m for m in usable if m in full]
        plan = [(n, s) for n in pick for s in segs_for(n, full[n], False)]
    shots, half = [], 0
    for n, (st, d) in plan:
        if d == HALF:
            d = 35 if half % 2 == 0 else 34
            half += 1
        shots.append([n + '.mp4', round(float(st), 2), d])
    tot = sum(s[2] for s in shots)
    r = (-tot) % BAR
    if r:
        shots[-1][2] += r
        n = shots[-1][0][:-4]
        shots[-1][1] = round(max(0.0, min(shots[-1][1], durs[n] - shots[-1][2] / 30 - 0.05)), 2)
    res[sec] = shots
    print(sec, len(shots), 'shots', (tot + r) // BAR, 'bars', round((tot + r) / 30, 1), 's', '| dropped:', ' '.join(dropped) or '-', file=sys.stderr)
json.dump(res, open(a.out, 'w'))
