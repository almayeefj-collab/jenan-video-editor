"""يولّد موسيقى خلفية هادية (بيانو ناعم + pad دافي + bass خفيف، بدون طبول) بـ numpy فقط.

الاستخدام:
    .venv/bin/python tools/compose_calm.py --seconds 75 --swell 0:9 --swell 66:75 \
        -o remotion/public/music/calm.wav

--swell: فترات (بالثواني) الموسيقى فيها أوسع وأدفى شوي (الانترو والأوترو)؛ باقي الوقت أهدى.
"""
import argparse
import wave

import numpy as np

from compose_music import SR, adsr, highpass, hz, in_ranges, lowpass, piano, place, reverb

rng = np.random.default_rng(23)
BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT

# Fmaj7 - Am7 - Dm9 - Bbmaj7: دافي وفيه أمل بدون دراما
PROG = [
    ('F', [('F', 3), ('A', 3), ('C', 4), ('E', 4)]),
    ('A', [('E', 3), ('G', 3), ('C', 4), ('A', 4)]),
    ('D', [('F', 3), ('A', 3), ('C', 4), ('E', 4)]),
    ('Bb', [('D', 3), ('F', 3), ('A', 3), ('C', 4)]),
]
# لحن بيانو قليل النوتات (نوتة، أوكتاف، بداية بالـ beats، طول بالـ beats)
MELODY = [
    [('C', 5, 0, 2), ('A', 4, 2, 1), ('G', 4, 3, 1)],
    [('E', 5, 0, 3), ('C', 5, 3, 1)],
    [('D', 5, 0, 1.5), ('F', 5, 1.5, 1.5), ('E', 5, 3, 1)],
    [('D', 5, 0, 2), ('C', 5, 2, 2)],
]


def pad_voice(freq, n):
    """pad ناعم: موجات sine/triangle مع detune بطيء"""
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(4):
        det = 1 + (k - 1.5) * 0.0025
        drift = 1 + 0.0015 * np.sin(2 * np.pi * (0.2 + 0.07 * k) * t + k)
        phase = np.cumsum(freq * det * drift) / SR + rng.random()
        tri = 2 * np.abs(2 * (phase % 1) - 1) - 1
        out += 0.6 * np.sin(2 * np.pi * phase) + 0.4 * tri
    return out / 4


def compose(seconds, swell_ranges):
    n = int(seconds * SR)
    pad = np.zeros(n)
    keys = np.zeros(n)
    bass = np.zeros(n)
    air = np.zeros(n)

    bars = int(np.ceil(seconds / BAR)) + 1
    for b in range(bars):
        t0 = b * BAR
        root, chord = PROG[b % 4]
        warm = in_ranges(t0 + 0.1, swell_ranges)
        ln = int((BAR + 2.0) * SR)
        env = adsr(ln, 1.4, 2.0)
        for nm, octv in chord:
            place(pad, pad_voice(hz(nm, octv), ln) * env * 0.07, t0)
        # bass طويل وناعم
        bl = int((BAR + 0.8) * SR)
        place(bass, np.sin(2 * np.pi * hz(root, 2) * np.arange(bl) / SR) * adsr(bl, 0.5, 1.0) * 0.16, t0)
        # arpeggio بيانو هادي بالثمنيات
        arp = [chord[0], chord[2], chord[1], chord[3], chord[2], chord[1], chord[3], chord[2]]
        for k, (nm, octv) in enumerate(arp):
            vel = (0.07 if k % 2 == 0 else 0.05) * (1.15 if warm else 1)
            place(keys, piano(hz(nm, octv + 1), BEAT * 0.9) * vel, t0 + k * BEAT / 2 + rng.uniform(0, 0.012))
        # اللحن يطلع كل ثاني دورة بس عشان ما يزحم الكلام
        if (b // 4) % 2 == 1 or warm:
            for nm, octv, st, du in MELODY[b % 4]:
                place(keys, piano(hz(nm, octv), du * BEAT) * 0.13, t0 + st * BEAT)

    # هوا خفيف (shimmer) يرتفع قبل كل فترة swell
    for a, _ in swell_ranges:
        ln = int(2.5 * SR)
        sw = highpass(rng.standard_normal(ln), 7000) * np.linspace(0, 1, ln) ** 2 * 0.035
        place(air, sw, a - 2.5)

    pad = lowpass(pad, 1800)
    keys = lowpass(keys, 5000)
    step = SR // 20
    warm_env = np.array([1.0 if in_ranges(i / SR, swell_ranges) else 0.0 for i in range(0, n, step)])
    warm_env = np.repeat(warm_env, step)[:n]
    warm_env = np.convolve(warm_env, np.ones(2 * SR) / (2 * SR), mode='same')
    pad *= 0.8 + 0.4 * warm_env

    music = reverb(pad + keys + air, 4.0, 0.45) + bass * 0.7
    music = np.tanh(music * 1.05)
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
    stereo = np.stack([music, np.roll(music, int(0.012 * SR))], axis=1)
    pcm = (stereo * 32767).astype('<i2')
    with wave.open(args.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main()
