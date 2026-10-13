"""يولّد موسيقى ريلز حماسية (pop/electro) بـ numpy فقط — كل seed يعطي مقطوعة مختلفة:
مقام، سرعة، تتابع أوتار، لحن، نمط إيقاع، وصوت السنث كلها تتغير.

الاستخدام:
    .venv/bin/python tools/reel_music.py --seconds 52 -o remotion/public/music/ainews.wav
    .venv/bin/python tools/reel_music.py --seconds 52 --seed 2026-10-14 -o ...   # افتراضياً seed = تاريخ اليوم
"""
import argparse
import datetime as dt
import hashlib
import wave

import numpy as np

SR = 44100

# تتابعات بدرجات السلم (0 = الأساس) — كلها تتابعات pop مشرقة
PROGS = [
    [0, 4, 5, 3],  # I V vi IV
    [5, 3, 0, 4],  # vi IV I V
    [0, 5, 3, 4],  # I vi IV V
    [3, 0, 4, 5],  # IV I V vi
    [0, 3, 5, 4],
]
MAJOR = [0, 2, 4, 5, 7, 9, 11]
STYLES = ['pluck', 'square', 'saw', 'bell']
KICKS = [
    [0, 4, 8, 12],  # four on the floor
    [0, 6, 8, 11],  # syncopated
    [0, 3, 8, 10],
]


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def chord_notes(root_midi, degree):
    # triad مبني على درجات السلم الكبير
    return [root_midi + MAJOR[(degree + k) % 7] + 12 * ((degree + k) // 7) for k in (0, 2, 4)]


def env(n, a, d, s, r):
    t = np.arange(n) / SR
    total = n / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = np.clip((total - t) / max(r, 1e-4), 0, 1)
    return e * rel


def osc(kind, f, n, rng):
    t = np.arange(n) / SR
    ph = 2 * np.pi * f * t
    if kind == 'square':
        return np.sign(np.sin(ph)) * 0.5 + 0.3 * np.sin(ph)
    if kind == 'saw':
        x = sum(np.sin(ph * (1 + d)) for d in (-0.004, 0, 0.004)) / 3
        return 2 * ((f * t) % 1) - 1 + 0.3 * x
    if kind == 'bell':
        return np.sin(ph + 2.0 * np.sin(ph * 3.5) * np.exp(-t * 4))
    # pluck: harmonics تتلاشى بسرعة
    return sum(np.sin(ph * h) / h * np.exp(-t * (3 + h * 3)) for h in range(1, 6))


def lowpass(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return np.fft.irfft(X, len(x))


def place(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def kick(rng):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def snare(rng):
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    return (0.7 * noise * np.exp(-t * 18) + 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)) * 0.6


def hat(rng, open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    noise = noise - lowpass(noise, 7000)
    return noise * np.exp(-t * (14 if open_ else 70)) * 0.25


def compose(seconds, seed):
    h = int(hashlib.sha256(seed.encode()).hexdigest(), 16)
    rng = np.random.default_rng(h % 2**32)
    bpm = int(rng.integers(100, 126))
    key = int(rng.integers(0, 12))
    root = 48 + key  # C3 + key
    prog = PROGS[int(rng.integers(len(PROGS)))]
    lead_kind = STYLES[int(rng.integers(len(STYLES)))]
    kick_pat = KICKS[int(rng.integers(len(KICKS)))]
    arp_order = rng.permutation([0, 1, 2, 1])
    beat = 60 / bpm
    step = beat / 4  # 16th
    bar = 4 * beat
    n = int(seconds * SR)
    drums = np.zeros(n)
    bass = np.zeros(n)
    pad = np.zeros(n)
    lead = np.zeros(n)

    k, s, hh, ho = kick(rng), snare(rng), hat(rng), hat(rng, True)
    # لحن: 8 نوتات لكل bar من نغمات الكورد + درجات قريبة
    motif = [[int(x) for x in rng.integers(0, 5, 8)] for _ in range(2)]
    rests = rng.random(8) < 0.3

    bars = int(np.ceil(seconds / bar))
    intro_bars = 2
    for b in range(bars):
        t0 = b * bar
        deg = prog[b % 4]
        notes = chord_notes(root, deg)
        full = b >= intro_bars
        # pad
        dur = int(bar * SR)
        p = sum(osc('saw', midi_hz(m + 12), dur, rng) for m in notes) / 3
        p = lowpass(p, 1800 if full else 900) * env(dur, 0.25, 1.0, 0.8, 0.3)
        place(pad, p * 0.22, t0)
        # bass: 8ths مع pump
        for i in range(8):
            if not full and i % 4:
                continue
            ln = int(step * 2 * SR * 0.9)
            bsig = osc('saw', midi_hz(notes[0] - 12), ln, rng)
            bsig = lowpass(bsig, 400) * env(ln, 0.005, 0.12, 0.5, 0.05)
            place(bass, bsig * 0.5, t0 + i * step * 2)
        # arp / lead
        for i in range(8):
            if rests[i] and full:
                continue
            m = notes[arp_order[i % 4]] + 24 if not full else root + 24 + MAJOR[(deg + motif[b % 2][i]) % 7]
            ln = int(step * 2 * SR)
            l = osc(lead_kind, midi_hz(m), ln, rng) * env(ln, 0.005, 0.15, 0.3, 0.05)
            place(lead, l * (0.18 if full else 0.12), t0 + i * step * 2)
        # drums
        if full:
            for i in range(16):
                at = t0 + i * step
                if i in kick_pat:
                    place(drums, k * 0.9, at)
                if i in (4, 12):
                    place(drums, s, at)
                if i % 2 == 0:
                    place(drums, hh, at)
                if i == 14 and b % 2:
                    place(drums, ho, at)
            # fill كل 4 bars
            if b % 4 == 3:
                for i in (13, 14, 15):
                    place(drums, s * 0.6, t0 + i * step)

    # sidechain pumping على الـ pad والـ bass
    t = np.arange(n) / SR
    pump = 1 - 0.55 * np.exp(-((t % beat) / 0.12))
    pump[t < intro_bars * bar] = 1
    mix = drums + (pad + bass) * pump + lead
    # echo بسيط للـ lead
    d = int(step * 3 * SR)
    echo = np.zeros(n)
    echo[d:] = lead[:-d] * 0.35
    mix += echo
    # fade in/out
    fade = np.minimum(1, t / 0.6) * np.clip((seconds - t) / 2.5, 0, 1)
    mix *= fade
    mix /= np.max(np.abs(mix)) + 1e-9
    mix = np.tanh(mix * 1.4) / np.tanh(1.4) * 0.9
    stereo = np.stack([mix, np.roll(mix, int(0.008 * SR)) * 0.96 + mix * 0.04], axis=1)
    info = f'seed={seed} bpm={bpm} key={key} prog={prog} lead={lead_kind}'
    return stereo, info


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--seconds', type=float, required=True)
    ap.add_argument('--seed', default=dt.date.today().isoformat())
    ap.add_argument('-o', '--out', required=True)
    a = ap.parse_args()
    audio, info = compose(a.seconds, a.seed)
    pcm = (audio * 32767).astype('<i2')
    with wave.open(a.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(info, '->', a.out)


if __name__ == '__main__':
    main()
