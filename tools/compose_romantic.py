"""يولّد موسيقى خلفية هادية رومانسية (بيانو arpeggio + strings ناعمة) بـ numpy فقط.

الاستخدام:
    .venv/bin/python tools/compose_romantic.py --seconds 55 --bloom 18.8 \
        -o remotion/public/music/romantic.wav

--bloom: الثانية اللي تبدأ فيها الموسيقى تكبر (لحن البيانو + strings وتشيللو)؛
قبلها بيانو arpeggio خفيف وpad بس، عشان تكون تحت الكلام.
"""
import argparse
import wave

import numpy as np

from compose_music import SR, adsr, hz, lowpass, piano, place, reverb, string_voice

BPM = 66
BEAT = 60 / BPM
BAR = 4 * BEAT

# D - A - Bm - G  (I - V - vi - IV): دافي ورومانسي
PROG = [('D', ['D', 'F#', 'A']), ('A', ['A', 'C#', 'E']), ('B', ['B', 'D', 'F#']), ('G', ['G', 'B', 'D'])]
# arpeggio اليد اليسرى: (درجة من الكورد، أوكتاف) على كل eighth
ARP = [(0, 2), (2, 2), (0, 3), (1, 3), (2, 3), (1, 3), (0, 3), (2, 2)]
# لحن اليد اليمنى (نوتة، أوكتاف، بداية بالـ beats، طول بالـ beats)
MELODY = [
    [('F#', 5, 0, 1.5), ('E', 5, 1.5, 0.5), ('D', 5, 2, 2)],
    [('E', 5, 0, 1), ('C#', 5, 1, 1), ('A', 4, 2, 2)],
    [('D', 5, 0, 1.5), ('C#', 5, 1.5, 0.5), ('B', 4, 2, 1), ('F#', 5, 3, 1)],
    [('B', 4, 0, 1), ('D', 5, 1, 1), ('G', 5, 2, 1.5), ('F#', 5, 3.5, 0.5)],
    [('A', 5, 0, 1.5), ('F#', 5, 1.5, 0.5), ('D', 5, 2, 2)],
    [('E', 5, 0, 1), ('A', 5, 1, 1), ('C#', 5, 2, 2)],
    [('D', 5, 0, 1), ('F#', 5, 1, 1), ('B', 5, 2, 1.5), ('A', 5, 3.5, 0.5)],
    [('G', 5, 0, 1.5), ('F#', 5, 1.5, 0.5), ('E', 5, 2, 1), ('D', 5, 3, 1)],
]
NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']


def chord_note(chord, degree, octave):
    """درجة الكورد بالأوكتاف الصح (النوتات اللي تحت الجذر ترتفع أوكتاف)"""
    root = NAMES.index(chord[0])
    name = chord[degree]
    return hz(name, octave + (1 if NAMES.index(name) < root else 0))


def compose(seconds, bloom):
    n = int(seconds * SR)
    pad = np.zeros(n)
    cello = np.zeros(n)
    left = np.zeros(n)
    right = np.zeros(n)

    bars = int(np.ceil(seconds / BAR)) + 1
    for b in range(bars):
        t0 = b * BAR
        full = t0 + BAR * 0.5 >= bloom
        _, chord = PROG[b % 4]
        # pad strings ناعم (يكبر بعد الـ bloom)
        ln = int((BAR + 1.6) * SR)
        env = adsr(ln, 1.2, 1.6)
        for deg, octv in [(0, 3), (2, 3), (1, 4)] + ([(0, 4), (2, 4)] if full else []):
            place(pad, string_voice(chord_note(chord, deg, octv), ln) * env * (0.075 if full else 0.05), t0)
        if full:
            place(cello, string_voice(chord_note(chord, 0, 2), ln) * env * 0.11, t0)
        # arpeggio بيانو
        for k, (deg, octv) in enumerate(ARP):
            amp = 0.10 if k % 4 == 0 else 0.07
            place(left, piano(chord_note(chord, deg, octv), BEAT * 1.2) * amp * (1.15 if full else 1), t0 + k * BEAT / 2)
        # اللحن بعد الـ bloom بس
        if full:
            for nm, octv, st, du in MELODY[b % 8]:
                place(right, piano(hz(nm, octv), du * BEAT) * 0.21, t0 + st * BEAT)

    pad = lowpass(pad, 2200)
    cello = lowpass(cello, 900)
    music = reverb(pad + cello + left + right, 3.6, 0.42)
    music = np.tanh(music * 1.05)
    music /= np.max(np.abs(music)) / 0.89
    fi, fo = int(1.5 * SR), int(3.0 * SR)
    music[:fi] *= np.linspace(0, 1, fi)
    music[-fo:] *= np.linspace(1, 0, fo) ** 1.5
    return music


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--seconds', type=float, required=True)
    ap.add_argument('--bloom', type=float, default=0.0)
    ap.add_argument('-o', '--out', required=True)
    args = ap.parse_args()
    music = compose(args.seconds, args.bloom)
    stereo = np.stack([music, np.roll(music, int(0.015 * SR))], axis=1)
    pcm = (stereo * 32767).astype('<i2')
    with wave.open(args.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main()
