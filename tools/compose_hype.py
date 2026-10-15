"""يولّد موسيقى حماسية لريلز الأخبار (electronic / news beat) بـ numpy فقط.

kick + snare/clap + hi-hats + bass + arp سريع، مع riser وboom في البداية (لحظة «خبر نازل»)
وdrop كل مرة يتغير الخبر.

الاستخدام:
    python3 tools/compose_hype.py --seconds 45 --hits 4.8 16.8 -o remotion/public/ainews/ep01/music.wav

--hits: ثواني فيها boom + crash (بداية كل خبر). الإيقاع كامل طول المقطع.
"""
import argparse
import wave

import numpy as np

SR = 44100
BPM = 124
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)

NOTE = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
# Am - F - C - G : حماسي ومألوف
PROG = [('A', ['A', 'C', 'E']), ('F', ['F', 'A', 'C']), ('C', ['C', 'E', 'G']), ('G', ['G', 'B', 'D'])]


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


def t_(sec):
    return np.arange(int(sec * SR)) / SR


def kick():
    t = t_(0.45)
    f = 48 + 120 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + 0.3 * np.exp(-t * 400) * rng.standard_normal(len(t))


def clap():
    t = t_(0.3)
    n = highpass(rng.standard_normal(len(t)), 1200)
    env = np.exp(-t * 22)
    for d in (0.0, 0.012, 0.024):  # ضربات متتالية سريعة = clap
        env += np.where(t >= d, np.exp(-(t - d) * 120), 0) * 0.6
    return lowpass(n, 7000) * env * 0.45


def hat(open_=False):
    t = t_(0.25 if open_ else 0.06)
    return highpass(rng.standard_normal(len(t)), 8000) * np.exp(-t * (14 if open_ else 80)) * 0.18


def saw(freq, sec, voices=3, det=0.006):
    t = t_(sec)
    out = np.zeros(len(t))
    for k in range(voices):
        ph = (freq * (1 + (k - (voices - 1) / 2) * det) * t + rng.random()) % 1
        out += 2 * ph - 1
    return out / voices


def bass(freq, sec):
    t = t_(sec)
    s = saw(freq, sec, 2, 0.003) + 0.6 * np.sin(2 * np.pi * freq / 2 * t)
    return lowpass(s, 420) * np.minimum(1, t / 0.005) * np.exp(-t * 3)


def pluck(freq, sec):
    t = t_(sec)
    s = saw(freq, sec, 3, 0.008)
    return lowpass(s, 3200) * np.exp(-t * 9) * np.minimum(1, t / 0.002)


def boom():
    t = t_(2.2)
    f = 35 + 90 * np.exp(-t * 6)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    return body * 1.3 + lowpass(rng.standard_normal(len(t)), 500) * np.exp(-t * 8) * 0.5


def crash():
    t = t_(2.0)
    return highpass(rng.standard_normal(len(t)), 5000) * np.exp(-t * 2.5) * 0.22


def riser(sec):
    t = t_(sec)
    p = t / sec
    noise = highpass(rng.standard_normal(len(t)), 2500) * p ** 2.5 * 0.25
    tone = np.sin(2 * np.pi * np.cumsum(200 + 1400 * p ** 2) / SR) * p ** 2 * 0.12
    return noise + tone


def compose(seconds, hits):
    n = int(seconds * SR)
    drums = np.zeros(n)
    low = np.zeros(n)
    synth = np.zeros(n)
    fx = np.zeros(n)
    start = hits[0] if hits else 0  # قبل أول hit: riser بس (توتر)
    bars = int(np.ceil(seconds / BAR)) + 1
    for b in range(bars):
        t0 = start + b * BAR
        root, chord = PROG[b % 4]
        for k in range(4):
            place(drums, kick() * 0.95, t0 + k * BEAT)
        for k in (1, 3):
            place(drums, clap(), t0 + k * BEAT)
        for k in range(8):
            place(drums, hat(open_=(k % 2 == 1)), t0 + k * BEAT / 2)
        # bass off-beat (ستايل الأخبار والحماس)
        for k in range(8):
            if k % 2 == 1:
                place(low, bass(hz(root, 2), BEAT / 2) * 0.55, t0 + k * BEAT / 2)
        # arp 16th
        notes = [chord[0], chord[1], chord[2], chord[1]]
        for k in range(16):
            nm = notes[k % 4]
            octv = 5 if k % 8 < 4 else 4
            place(synth, pluck(hz(nm, octv), BEAT / 2) * 0.16, t0 + k * BEAT / 4)
        # pad
        for nm in chord:
            place(synth, lowpass(saw(hz(nm, 3), BAR, 4, 0.01), 1400) * 0.05 * np.minimum(1, t_(BAR) / 0.3), t0)
    # sidechain بسيط: الموسيقى تنخفض مع كل kick
    env = np.ones(n)
    k_len = int(0.22 * SR)
    duck = 1 - 0.6 * np.exp(-np.arange(k_len) / SR * 14)
    beat_t = start
    while beat_t < seconds:
        i = int(beat_t * SR)
        j = min(n, i + k_len)
        if i < n:
            env[i:j] = np.minimum(env[i:j], duck[: j - i])
        beat_t += BEAT
    music = drums + (low + synth) * env
    # riser قبل أول hit، وboom + crash مع كل hit
    if hits:
        r = riser(min(hits[0], 4.0))
        place(fx, r, hits[0] - len(r) / SR)
    for h in hits:
        place(fx, boom(), h)
        place(fx, crash(), h)
    music = music + fx
    music[: int(start * SR)] *= 0.0 if start else 1
    music[: int(start * SR)] += fx[: int(start * SR)]
    music = np.tanh(music * 1.2)
    music /= np.max(np.abs(music)) / 0.9
    fade = int(1.2 * SR)
    music[-fade:] *= np.linspace(1, 0, fade)
    return music


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--seconds', type=float, required=True)
    ap.add_argument('--hits', type=float, nargs='*', default=[])
    ap.add_argument('-o', '--out', required=True)
    args = ap.parse_args()
    music = compose(args.seconds, sorted(args.hits))
    stereo = np.stack([music, np.roll(music, int(0.012 * SR))], axis=1)
    pcm = (stereo * 32767).astype('<i2')
    with wave.open(args.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main()
