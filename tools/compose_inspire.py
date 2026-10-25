"""موسيقى ملهمة هادية-متوسطة (بيانو + وتريات + إيقاع خفيف) — آلات SoundFont (GeneralUser GS).

الهيكل بالـ bars:
    intro     : بيانو arpeggio بس
    build     : تدخل الوتريات والتشيلو
    main      : إيقاع خفيف (kick ناعم + shaker + snap) ولحن بيانو عالي
    breakdown : بيانو ووتريات بدون إيقاع (للتكريم)
    finale    : رجعة قصيرة وكورد ختامي يرن

الاستخدام:
    python tools/compose_inspire.py --sf2 GeneralUser-GS.sf2 --seconds 70 -o remotion/public/music/inspire.wav
"""
import argparse
import wave

import numpy as np

from compose_formal import reverb
from compose_upbeat import SR, render
import compose_upbeat

CH = {
    'piano': (0, 0),  # Acoustic Grand Piano
    'strings': (1, 49),  # String Ensemble 2 (أنعم)
    'cello': (2, 42),  # Cello
    'pad': (3, 89),  # Warm Pad
    'lead': (4, 0),  # بيانو للحن العالي
    'drums': (9, 0),
}
KICK, SNAP, SHAKER, CRASH = 36, 37, 70, 49

NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
# C - G - Am - F
PROG = [('C', ['C', 'E', 'G']), ('G', ['G', 'B', 'D']), ('A', ['A', 'C', 'E']), ('F', ['F', 'A', 'C'])]
MELODY = [
    [('E', 6, 0, 1.5), ('D', 6, 1.5, 0.5), ('C', 6, 2, 1), ('G', 5, 3, 1)],
    [('D', 6, 0, 1.5), ('B', 5, 1.5, 0.5), ('G', 5, 2, 2)],
    [('C', 6, 0, 1), ('E', 6, 1, 1), ('A', 6, 2, 1.5), ('G', 6, 3.5, 0.5)],
    [('F', 6, 0, 1.5), ('E', 6, 1.5, 0.5), ('C', 6, 2, 2)],
]


def midi(name, octave):
    return 12 * (octave + 1) + NOTE[name]


def compose(bpm, bars):
    s = compose_upbeat.Score(bpm)
    b = s.beat
    bar = 4 * b
    intro, build = 2, 4
    breakdown = (bars - 7, bars - 3)
    finale_end = bars - 2

    for n in range(bars):
        t0 = n * bar
        root, tri = PROG[n % 4]
        main = intro + build <= n < breakdown[0] or breakdown[1] <= n < finale_end
        brk = breakdown[0] <= n < breakdown[1]

        if n >= finale_end:
            if n == finale_end:
                for name in tri:
                    s.note('piano', t0, 2 * bar, midi(name, 4), 80)
                    s.note('strings', t0, 2 * bar, midi(name, 5), 70)
                    s.note('pad', t0, 2 * bar, midi(name, 4), 55)
                s.note('cello', t0, 2 * bar, midi('C', 2), 80)
                s.note('lead', t0, 2 * bar, midi('E', 6), 75)
                s.note('drums', t0, 1, CRASH, 70)
            continue

        # arpeggio بيانو بالثمنيات
        arp = [midi(root, 3), midi(tri[1], 4), midi(tri[2], 4), midi(tri[0], 5), midi(tri[2], 4), midi(tri[1], 4), midi(tri[2], 4), midi(tri[0], 5)]
        for i, k in enumerate(arp):
            s.note('piano', t0 + i * b / 2, b * 0.9, k, (70 if i == 0 else 56) + (6 if main else 0))

        if n >= intro:
            for name in tri:
                s.note('strings', t0, bar, midi(name, 4), 48 if not main else 58)
            s.note('cello', t0, bar * 0.95, midi(root, 2), 70)
        if main or brk:
            for name in tri:
                s.note('pad', t0, bar, midi(name, 4), 40)
            for name, octv, st, du in MELODY[n % 4]:
                s.note('lead', t0 + st * b, du * b, midi(name, octv), 76 if main else 66)

        if main:
            s.note('drums', t0, 0.2, KICK, 82)
            s.note('drums', t0 + 2.5 * b, 0.2, KICK, 66)
            for i in (1, 3):
                s.note('drums', t0 + i * b, 0.2, SNAP, 70)
            for i in range(8):
                s.note('drums', t0 + i * b / 2, 0.1, SHAKER, 50 if i % 2 else 38)
            if n in (intro + build, breakdown[1]):
                s.note('drums', t0, 1, CRASH, 62)

    return s, bars * bar + 3.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sf2', required=True)
    ap.add_argument('--bpm', type=float, default=92)
    ap.add_argument('--seconds', type=float, default=70)
    ap.add_argument('-o', '--out', required=True)
    a = ap.parse_args()
    compose_upbeat.CH = CH  # render يقرأ الآلات من compose_upbeat
    bars = int(np.ceil(a.seconds / (4 * 60 / a.bpm)))
    score, length = compose(a.bpm, bars)
    audio = reverb(render(score, length, a.sf2), seconds=2.6, wet=0.24)
    audio /= np.abs(audio).max() / 0.89
    with wave.open(a.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((audio * 32767).astype(np.int16).tobytes())


if __name__ == '__main__':
    main()
