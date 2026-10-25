"""موسيقى حماسية حديثة (طابع تقني/إيجابي) لريل ملخص الورشة — آلات SoundFont (GeneralUser GS).

الهيكل بالـ bars:
    intro     : pad + arpeggio إلكتريك بيانو
    build     : يدخل الباص والهاي هات، ورول سنير قبل الدخلة
    main      : إيقاع كامل (kick + clap + hats) + بيانو + لحن جلوكنسبيل
    breakdown : أخف (للتكريم) — بيانو وpad و arpeggio
    finale    : رجعة الإيقاع وكورد ختامي يرن

الاستخدام:
    python tools/compose_upbeat.py --sf2 GeneralUser-GS.sf2 --seconds 70 -o remotion/public/music/upbeat.wav

يحتاج: numpy و tinysoundfont (pip install --no-deps tinysoundfont).
"""
import argparse
import wave

import numpy as np
import tinysoundfont

from compose_formal import reverb

SR = 44100

CH = {
    'pad': (0, 89),  # Warm Pad
    'arp': (1, 4),  # Electric Piano 1
    'piano': (2, 0),  # Acoustic Grand Piano
    'bass': (3, 38),  # Synth Bass 1
    'bell': (4, 9),  # Glockenspiel
    'strings': (5, 48),  # String Ensemble 1
    'drums': (9, 0),
}
KICK, SNARE, CLAP, HAT, OHAT, CRASH = 36, 38, 39, 42, 46, 49

NOTE = {'C': 0, 'C#': 1, 'D': 2, 'E': 4, 'F#': 6, 'G': 7, 'A': 9, 'B': 11}
# D - A - Bm - G  (I - V - vi - IV)
PROG = [('D', ['D', 'F#', 'A']), ('A', ['A', 'C#', 'E']), ('B', ['B', 'D', 'F#']), ('G', ['G', 'B', 'D'])]
# لحن الجلوكنسبيل: (نوتة، أوكتاف، بداية بالـ beats، طول)
MELODY = [
    [('F#', 6, 0, 1), ('A', 6, 1, 1), ('F#', 6, 2, 0.5), ('E', 6, 2.5, 1.5)],
    [('E', 6, 0, 1), ('C#', 6, 1, 1), ('E', 6, 2, 0.5), ('A', 6, 2.5, 1.5)],
    [('F#', 6, 0, 1), ('D', 6, 1, 0.5), ('F#', 6, 1.5, 0.5), ('B', 6, 2, 2)],
    [('A', 6, 0, 1), ('G', 6, 1, 1), ('F#', 6, 2, 1), ('E', 6, 3, 1)],
]


def midi(name, octave):
    return 12 * (octave + 1) + NOTE[name]


class Score:
    def __init__(self, bpm):
        self.beat = 60 / bpm
        self.ev = []

    def note(self, part, t, dur, key, vel):
        ch = CH[part][0]
        self.ev.append((t, 1, ch, key, int(max(1, min(127, vel)))))
        self.ev.append((t + dur, 0, ch, key, 0))


def compose(bpm, bars):
    s = Score(bpm)
    b = s.beat
    bar = 4 * b
    intro, build = 4, 4
    breakdown = (bars - 8, bars - 4)  # الوقوف والتكريم
    finale_end = bars - 2  # آخر بارين: كورد ختامي

    for n in range(bars):
        t0 = n * bar
        root, tri = PROG[n % 4]
        main = intro + build <= n < breakdown[0] or breakdown[1] <= n < finale_end
        brk = breakdown[0] <= n < breakdown[1]
        ending = n >= finale_end

        if ending:
            if n == finale_end:
                for name in tri:
                    s.note('pad', t0, 2 * bar, midi(name, 4), 80)
                    s.note('piano', t0, 2 * bar, midi(name, 4), 85)
                    s.note('strings', t0, 2 * bar, midi(name, 5), 70)
                s.note('bass', t0, 2 * bar, midi('D', 2), 95)
                s.note('drums', t0, 1, CRASH, 100)
                s.note('drums', t0, 0.2, KICK, 110)
                s.note('bell', t0, 2 * bar, midi('F#', 6), 90)
            continue

        # pad دائم
        for name in tri:
            s.note('pad', t0, bar, midi(name, 4), 55 if main else 65)

        # arpeggio بالثمنيات
        arp = [midi(tri[0], 4), midi(tri[1], 4), midi(tri[2], 4), midi(tri[0], 5)]
        pat = [0, 1, 2, 3, 2, 1, 2, 3]
        for i in range(8):
            vel = 62 + (8 if i % 2 == 0 else 0) + (10 if main else 0)
            s.note('arp', t0 + i * b / 2, b / 2 * 0.9, arp[pat[i]], vel)

        # باص
        if n >= intro and not brk:
            for i in range(8):
                if main or i % 2 == 0:
                    s.note('bass', t0 + i * b / 2, b / 2 * 0.8, midi(root, 2), 88 if i % 2 == 0 else 70)

        # بيانو: كورد على أول البار وستاب على 2.5
        if main or brk:
            for name in tri:
                s.note('piano', t0, b * 1.5, midi(name, 5), 68)
                if main:
                    s.note('piano', t0 + 2.5 * b, b, midi(name, 5), 58)

        # لحن
        if main or brk:
            for name, octv, st, du in MELODY[n % 4]:
                s.note('bell', t0 + st * b, du * b, midi(name, octv), 78 if main else 65)

        # strings في النص الثاني من الإيقاع الكامل
        if main and n >= intro + build + 8:
            for name in tri:
                s.note('strings', t0, bar, midi(name, 4), 52)

        # درامز
        if n >= intro:
            for i in range(8):
                s.note('drums', t0 + i * b / 2, 0.1, HAT, 62 if i % 2 else 45)
        if main:
            for i in range(4):
                s.note('drums', t0 + i * b, 0.2, KICK, 112)
            for i in (1, 3):
                s.note('drums', t0 + i * b, 0.2, CLAP, 92)
            s.note('drums', t0 + 3.5 * b, 0.2, OHAT, 60)
            if n in (intro + build, breakdown[1]):
                s.note('drums', t0, 1, CRASH, 105)
        elif brk:
            s.note('drums', t0, 0.2, KICK, 85)
            s.note('drums', t0 + 2 * b, 0.2, KICK, 75)
        # رول سنير قبل الدخلة والرجعة
        if n in (intro + build - 1, breakdown[1] - 1):
            for i in range(16):
                if i >= 8:
                    s.note('drums', t0 + i * b / 4, 0.1, SNARE, 50 + i * 4)
        elif intro <= n < intro + build - 1:
            s.note('drums', t0, 0.2, KICK, 80)

    return s, bars * bar + 3.0


def render(score, length, sf2):
    syn = tinysoundfont.Synth(samplerate=SR, gain=-6)
    sf = syn.sfload(sf2)
    for part, (ch, prog) in CH.items():
        syn.program_select(ch, sf, 128 if part == 'drums' else 0, prog, is_drums=part == 'drums')
    ev = sorted(score.ev, key=lambda e: (e[0], e[1]))
    out = []
    t = 0.0
    for time, on, ch, key, vel in ev + [(length, -1, 0, 0, 0)]:
        n = int(round((time - t) * SR))
        if n > 0:
            out.append(np.frombuffer(syn.generate(n), dtype=np.float32).copy())
            t += n / SR
        if on == 1:
            syn.noteon(ch, key, vel)
        elif on == 0:
            syn.noteoff(ch, key)
    return np.concatenate(out).reshape(-1, 2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sf2', required=True)
    ap.add_argument('--bpm', type=float, default=112)
    ap.add_argument('--seconds', type=float, default=74)
    ap.add_argument('-o', '--out', required=True)
    a = ap.parse_args()
    bars = int(np.ceil(a.seconds / (4 * 60 / a.bpm)))
    score, length = compose(a.bpm, bars)
    audio = reverb(render(score, length, a.sf2), seconds=1.8, wet=0.16)
    audio /= np.abs(audio).max() / 0.89
    pcm = (audio * 32767).astype(np.int16)
    with wave.open(a.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main()
