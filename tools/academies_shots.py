"""يبني قائمة اللقطات لكل قسم من كل المقاطع: قصير (<2.4ث) = نص بار، متوسط (<6ث) = بار، طويل = لقطتين من جزئين مختلفين.
المقاطع الأقصر من 1.2 ثانية تنشال. مجموع كل قسم يتقرّب لمضاعف البار (69 فريم = 2.3ث).

الاستخدام:
    for f in proxies/*.mp4; do n=$(basename $f .mp4); echo "$n $(ffprobe -v error -show_entries format=duration -of csv=p=0 $f)"; done > durs.txt
    python tools/academies_shots.py durs.txt shots.json techno dev lead
"""
import json
import sys

BAR = 69
# استثناءات يدوية: اسم المقطع → [(بداية بالثواني، مدة بالفريمات)] لما يكون فيه جزء خربان (أحد يمر قدام الكاميرا مثلاً)
OVR = {'techno_C7031': [(0.6, BAR)], 'techno_C7032': [(0.0, 35)], 'lead_C7235': [(1.4, BAR)]}

durs = {n: float(t) for n, t in (l.split() for l in open(sys.argv[1]))}
out = {}
for a in sys.argv[3:]:
    names = sorted([n for n in durs if n.startswith(a + '_')], key=lambda n: (len(n), n))
    shots, half = [], 0
    for n in names:
        L = durs[n]
        if n in OVR:
            segs = OVR[n]
        elif L < 1.2:
            continue
        elif L < 2.4:
            segs = [(0.1, 35)]
        elif L < 6:
            segs = [(max(0.2, (L - 2.3) / 2), BAR)]
        else:
            segs = [(0.25 * L, BAR), (min(0.65 * L, L - 2.4), BAR)]
        for st, d in segs:
            if d == 35:
                d = 35 if half % 2 == 0 else 34
                half += 1
            shots.append([n + '.mp4', round(st, 2), d])
    tot = sum(s[2] for s in shots)
    r = (-tot) % BAR
    shots[-1][2] += r
    shots[-1][1] = round(max(0, min(shots[-1][1], durs[shots[-1][0][:-4]] - shots[-1][2] / 30 - 0.05)), 2)
    out[a] = shots
    print(a, len(shots), 'shots', (tot + r) // BAR, 'bars', round((tot + r) / 30, 1), 's', file=sys.stderr)
json.dump(out, open(sys.argv[2], 'w'))
