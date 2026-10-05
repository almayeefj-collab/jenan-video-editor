"""يولّد موسيقى خلفية سينمائية رسمية (strings + بيانو + إيقاع تايكو) بـ numpy فقط.

الاستخدام:
    .venv/bin/python tools/compose_music.py --seconds 107 --drums 0:13.1 --drums 97.5:107 \
        -o remotion/public/music/background.wav

--drums: فترات (بالثواني) فيها الإيقاع والحماس كامل؛ باقي الوقت strings وبيانو هادي.
"""
import argparse
import wave

import numpy as np

SR = 44100
BPM = 88
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(11)

NOTE = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
# Dm - Bb - F - C  (i - VI - III - VII): رسمي وفيه أمل
PROG = [('D', ['D', 'F', 'A']), ('Bb', ['Bb', 'D', 'F']), ('F', ['F', 'A', 'C']), ('C', ['C', 'E', 'G'])]
# لحن بيانو بسيط فوق التتابع (نوتة، أوكتاف، بداية بالـ beats، طول بالـ beats)
MELODY = [
    [('A', 5, 0, 1.5), ('F', 5, 1.5, 0.5), ('D', 5, 2, 2)],
    [('D', 5, 0, 1), ('F', 5, 1, 1), ('Bb', 5, 2, 2)],
    [('A', 5, 0, 1.5), ('C', 6, 1.5, 0.5), ('A', 5, 2, 1), ('F', 5, 3, 1)],
    [('G', 5, 0, 2), ('E', 5, 2, 1), ('C', 5, 3, 1)],
]


def hz(name, octave):
    return 440.0 * 2 ** ((NOTE[name] + 12 * (octave + 1) - 69) / 12)


def spectral(x, fn):
    X = np.fft.rfft(x)
    X *= fn(np.fft.rfftfreq(len(x), 1 / SR))
    return np.fft.irfft(X, len(x))


def lowpass(x, fc, order=2):
    return spectral(x, lambda f: 1 / np.sqrt(1 + (f / fc) ** (2 * order)))


def highpass(x, fc, order=2):
    return spectral(x, lambda f: 1 / np.sqrt(1 + (fc / np.maximum(f, 1e-3)) ** (2 * order)))


def place(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf) or i + len(sig) <= 0:
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def adsr(n, a, r):
    t = np.arange(n) / SR
    env = np.minimum(1, t / a)
    tail = (n - np.arange(n)) / SR
    return env * np.minimum(1, tail / r)


def string_voice(freq, n, bright=1.0):
    """ensemble: 6 سوتوث مع detune وvibrato"""
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(6):
        det = 1 + (k - 2.5) * 0.0018
        vib = 1 + 0.0025 * np.sin(2 * np.pi * (5 + 0.3 * k) * t + k)
        phase = np.cumsum(freq * det * vib) / SR + rng.random()
        out += 2 * (phase % 1) - 1
    return out / 6


def piano(freq, dur):
    n = int((dur + 2.5) * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    B = 0.00035
    for k in range(1, 9):
        fk = freq * k * np.sqrt(1 + B * k * k)
        if fk > SR / 2:
            break
        sig += (1 / k ** 1.4) * np.sin(2 * np.pi * fk * t) * np.exp(-t * (1.1 + 0.55 * k))
    hammer = highpass(rng.standard_normal(n), 2000) * np.exp(-t * 120) * 0.04
    rel = np.where(t > dur, np.exp(-(t - dur) * 5), 1)
    return (sig + hammer) * rel * np.minimum(1, t / 0.003)


def taiko(n_sec=0.9, f0=62, amp=1.0):
    n = int(n_sec * SR)
    t = np.arange(n) / SR
    f = f0 + 70 * np.exp(-t * 25)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
    skin = lowpass(rng.standard_normal(n), 900) * np.exp(-t * 30) * 0.6
    return (body + skin) * amp


def reverb(x, seconds=3.0, mix=0.35):
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 6.5, n))
    ir = lowpass(ir, 4500)
    ir[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
    ir /= np.sqrt(np.sum(ir ** 2))
    size = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return (1 - mix) * x + mix * y


def in_ranges(t, ranges):
    return any(a <= t < b for a, b in ranges)


def compose(seconds, drum_ranges):
    n = int(seconds * SR)
    strings = np.zeros(n)
    lows = np.zeros(n)
    keys = np.zeros(n)
    perc = np.zeros(n)

    bars = int(np.ceil(seconds / BAR)) + 1
    for b in range(bars):
        t0 = b * BAR
        root, chord = PROG[b % 4]
        hot = in_ranges(t0 + 0.1, drum_ranges)
        # strings pad: voicing واسع
        ln = int((BAR + 1.2) * SR)
        env = adsr(ln, 0.7, 1.2)
        voicing = [(root, 3), (chord[2], 3), (chord[1], 4), (root, 4), (chord[2], 4)]
        for nm, octv in voicing:
            place(strings, string_voice(hz(nm, octv), ln) * env * 0.09, t0)
        # low strings ostinato (eighths) — قوي وقت الحماس، خفيف غير كذا
        for k in range(8):
            ln = int(BEAT / 2 * SR)
            tt = np.arange(ln) / SR
            acc = 1.0 if k % 2 == 0 else 0.7
            sig = string_voice(hz(root, 2), ln) * np.exp(-tt * 6) * (0.32 if hot else 0.12) * acc
            place(lows, sig, t0 + k * BEAT / 2)
        # بيانو: chord نصّي + لحن
        for nm in chord:
            place(keys, piano(hz(nm, 4), BEAT * 1.8) * 0.10, t0)
            place(keys, piano(hz(nm, 4), BEAT * 1.8) * 0.08, t0 + 2 * BEAT)
        for nm, octv, st, du in MELODY[b % 4]:
            place(keys, piano(hz(nm, octv - 1), du * BEAT) * 0.22, t0 + st * BEAT)
        # إيقاع تايكو في الانترو والأوترو
        if hot:
            pattern = [(0, 1.0, 58), (1.5, 0.55, 75), (2, 0.85, 58), (3, 0.5, 90), (3.5, 0.6, 90)]
            for st, amp, f0 in pattern:
                place(perc, taiko(amp=amp, f0=f0), t0 + st * BEAT)
            for k in range(8):  # shaker خفيف
                ln = int(0.07 * SR)
                sh = highpass(rng.standard_normal(ln), 6000) * np.exp(-np.arange(ln) / SR * 50) * 0.05
                place(perc, sh, t0 + k * BEAT / 2 + 0.01)

    # cymbal swell قبل بداية كل فترة حماس + boom في بدايتها
    for a, _ in drum_ranges:
        ln = int(2.2 * SR)
        swell = highpass(rng.standard_normal(ln), 5000) * np.linspace(0, 1, ln) ** 3 * 0.18
        place(perc, swell, a - 2.2)
        place(perc, taiko(2.5, 40, 1.4), a)

    strings = lowpass(strings, 2400)
    lows = lowpass(lows, 900)
    hot_env = np.array([1.0 if in_ranges(i / SR, drum_ranges) else 0.0 for i in range(0, n, SR // 20)])
    hot_env = np.repeat(hot_env, SR // 20)[:n]
    hot_env = np.convolve(hot_env, np.ones(SR) / SR, mode='same')
    strings *= 0.75 + 0.45 * hot_env

    wet = reverb(strings + keys + lows * 0.6, 3.2, 0.38)
    music = wet + lows * 0.5 + reverb(perc, 1.8, 0.25)
    music = np.tanh(music * 1.1)
    music /= np.max(np.abs(music)) / 0.89
    fade = int(0.03 * SR)
    music[:fade] *= np.linspace(0, 1, fade)
    return music


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--seconds', type=float, required=True)
    ap.add_argument('--drums', action='append', default=[], help='start:end بالثواني')
    ap.add_argument('-o', '--out', required=True)
    args = ap.parse_args()
    ranges = [tuple(map(float, r.split(':'))) for r in args.drums]
    music = compose(args.seconds, ranges)
    stereo = np.stack([music, np.roll(music, int(0.015 * SR))], axis=1)
    pcm = (stereo * 32767).astype('<i2')
    with wave.open(args.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main()
