"""يولّد موسيقى خلفية هادية ومتفائلة بطابع مختلف عن compose_music/compose_calm:
كاليمبا/ماريمبا ناعمة بالـ arpeggio + أجراس زجاجية + pad هوائي + bass نابض خفيف،
وفي فترات الـ swell يدخل kick ناعم وصفقة خفيفة. numpy فقط.

الاستخدام:
    .venv/bin/python tools/compose_glow.py --seconds 110 --swell 0:8 --swell 92:110 \
        -o remotion/public/music/glow.wav
"""
import argparse
import wave

import numpy as np

from compose_music import NOTE, SR, adsr, highpass, hz, in_ranges, lowpass, place, reverb

# أسماء الدييز اللي يحتاجها مفتاح A major
NOTE.update({'G#': 8, 'D#': 3, 'A#': 10})

rng = np.random.default_rng(46)
BPM = 92
BEAT = 60 / BPM
BAR = 4 * BEAT

# A - E - F#m - D (I - V - vi - IV): مشرق ومتفائل
PROG = [
    ('A', [('A', 3), ('C#', 4), ('E', 4)]),
    ('E', [('G#', 3), ('B', 3), ('E', 4)]),
    ('F#', [('A', 3), ('C#', 4), ('F#', 4)]),
    ('D', [('A', 3), ('D', 4), ('F#', 4)]),
]
# نمط الكاليمبا بالسادس عشر (مؤشر نوتة في الكورد، أوكتاف إضافي)
PATTERN = [(0, 1), (2, 1), (1, 1), (2, 1), (0, 2), (2, 1), (1, 1), (2, 1)] * 2
# موتيف الأجراس كل دورتين (نوتة، أوكتاف، بداية بالـ beats)
BELLS = [[('E', 6, 0), ('C#', 6, 1.5)], [('B', 5, 0), ('E', 6, 2)], [('C#', 6, 0), ('A', 5, 1.5)], [('F#', 5, 0), ('A', 5, 2)]]


def kalimba(freq, dur=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * freq * t) * np.exp(-t * 6)
    tine = 0.35 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 28)
    return (body + tine) * np.minimum(1, t / 0.002)


def bell(freq, dur=2.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for ratio, amp, dec in [(1, 1, 1.4), (2.76, 0.45, 2.6), (5.4, 0.22, 4.5), (8.9, 0.1, 7)]:
        sig += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t * dec)
    return sig * np.minimum(1, t / 0.003)


def air_pad(freq, n):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(3):
        det = 1 + (k - 1) * 0.003
        out += np.sin(2 * np.pi * freq * det * t + k) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * t + k))
    breath = lowpass(highpass(rng.standard_normal(n), freq * 0.8), freq * 3) * 0.25
    return out / 3 + breath


def soft_kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 48 + 60 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def soft_clap():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    return lowpass(highpass(rng.standard_normal(n), 900), 5000) * np.exp(-t * 22) * 0.35


def compose(seconds, swell_ranges):
    n = int(seconds * SR)
    keys = np.zeros(n)
    bells = np.zeros(n)
    pad = np.zeros(n)
    bass = np.zeros(n)
    perc = np.zeros(n)

    bars = int(np.ceil(seconds / BAR)) + 1
    for b in range(bars):
        t0 = b * BAR
        root, chord = PROG[b % 4]
        warm = in_ranges(t0 + 0.1, swell_ranges)
        for k, (idx, up) in enumerate(PATTERN):
            nm, octv = chord[idx]
            vel = (0.075 if k % 4 == 0 else 0.05) * (1.2 if warm else 1)
            place(keys, kalimba(hz(nm, octv + up)) * vel, t0 + k * BEAT / 4 + rng.uniform(0, 0.008))
        ln = int((BAR + 1.5) * SR)
        for nm, octv in chord:
            place(pad, air_pad(hz(nm, octv), ln) * adsr(ln, 1.2, 1.5) * 0.05, t0)
        # bass نابض بالثمنيات بس ناعم
        for k in range(8):
            bl = int(BEAT / 2 * SR)
            tt = np.arange(bl) / SR
            sig = np.sin(2 * np.pi * hz(root, 2) * tt) * np.exp(-tt * 5) * (0.2 if k % 2 == 0 else 0.12)
            place(bass, sig, t0 + k * BEAT / 2)
        if b % 2 == 1 or warm:
            for nm, octv, st in BELLS[b % 4]:
                place(bells, bell(hz(nm, octv)) * 0.06, t0 + st * BEAT)
        if warm:
            for k in range(4):
                place(perc, soft_kick() * 0.55, t0 + k * BEAT)
            for k in (1, 3):
                place(perc, soft_clap(), t0 + k * BEAT)

    for a, _ in swell_ranges:
        ln = int(2.0 * SR)
        sw = highpass(rng.standard_normal(ln), 6000) * np.linspace(0, 1, ln) ** 2 * 0.04
        place(perc, sw, a - 2.0)

    pad = lowpass(pad, 2200)
    keys = lowpass(keys, 7000)
    music = reverb(keys + bells + pad, 3.0, 0.38) + lowpass(bass, 400) * 0.8 + reverb(perc, 1.2, 0.2)
    music = np.tanh(music * 1.1)
    music /= np.max(np.abs(music)) / 0.85
    fade = int(0.05 * SR)
    music[:fade] *= np.linspace(0, 1, fade)
    return music


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--seconds', type=float, required=True)
    ap.add_argument('--swell', action='append', default=[], help='start:end بالثواني')
    ap.add_argument('-o', '--out', required=True)
    args = ap.parse_args()
    ranges = [tuple(map(float, r.split(':'))) for r in args.swell]
    music = compose(args.seconds, ranges)
    stereo = np.stack([music, np.roll(music, int(0.011 * SR))], axis=1)
    pcm = (stereo * 32767).astype('<i2')
    with wave.open(args.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main()
