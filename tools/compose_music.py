"""يولّد موسيقى خلفية هادية ورسمية وحماسية للريل (بدون أي مكتبات خارجية غير numpy).

الاستخدام:
    .venv/bin/python tools/compose_music.py --seconds 104 --drums 0:13.1 --drums 94.8:104 \
        -o remotion/public/music/background.wav

--drums: فترات (بالثواني) فيها إيقاع كامل؛ باقي الوقت pad + arpeggio هادي.
"""
import argparse
import wave

import numpy as np

SR = 44100
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)

NOTE = {'C': 0, 'C#': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
# Dm - Bb - F - C
PROG = [('D', ['D', 'F', 'A']), ('Bb', ['Bb', 'D', 'F']), ('F', ['F', 'A', 'C']), ('C', ['C', 'E', 'G'])]


def hz(name, octave):
    return 440.0 * 2 ** ((NOTE[name] + 12 * (octave + 1) - 69) / 12)


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (f > lo) & (f < hi)
    return np.fft.irfft(X, len(x))


def saw(freq, n):
    t = np.arange(n) / SR
    return 2 * ((t * freq) % 1) - 1


def place(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def reverb(x, seconds=2.4, mix=0.3):
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lowpass(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    size = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return (1 - mix) * x + mix * y


def in_ranges(t, ranges):
    return any(a <= t < b for a, b in ranges)


def compose(seconds, drum_ranges):
    n = int(seconds * SR)
    pad = np.zeros(n)
    keys = np.zeros(n)
    bass = np.zeros(n)
    drums = np.zeros(n)
    strings = np.zeros(n)

    bars = int(np.ceil(seconds / BAR))
    for b in range(bars):
        t0 = b * BAR
        root, chord = PROG[b % 4]
        # pad: سوتوث مزدوجة ناعمة
        ln = int(BAR * SR) + SR
        env = np.minimum(1, np.arange(ln) / (0.6 * SR)) * np.minimum(1, (ln - np.arange(ln)) / (1.0 * SR))
        for i, nm in enumerate(chord):
            for det in (-0.0025, 0.0025):
                pad_note = saw(hz(nm, 3 if i else 4) * (1 + det), ln) * env * 0.05
                place(pad, pad_note, t0)
        # bass: نبضة على كل beat
        for k in range(4):
            ln = int(BEAT * SR)
            tt = np.arange(ln) / SR
            sig = np.sin(2 * np.pi * hz(root, 2) * tt) * np.exp(-tt * 3.5) * 0.35
            place(bass, sig, t0 + k * BEAT)
        # strings ostinato (eighths)
        notes = [chord[0], chord[2], chord[1], chord[2]] * 2
        for k, nm in enumerate(notes):
            ln = int(0.5 * BEAT * SR)
            tt = np.arange(ln) / SR
            sig = saw(hz(nm, 4), ln) * np.exp(-tt * 9) * 0.07
            place(strings, sig, t0 + k * BEAT / 2)
        # keys: arpeggio بيانو ناعم
        arp = [chord[0], chord[1], chord[2], chord[1]]
        for k in range(8):
            nm = arp[k % 4]
            ln = int(1.4 * SR)
            tt = np.arange(ln) / SR
            f = hz(nm, 5)
            sig = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt))
            sig *= np.exp(-tt * 3.2) * np.minimum(1, tt / 0.004) * 0.09
            place(keys, sig, t0 + k * BEAT / 2)
        # drums بس في الانترو والأوترو
        for k in range(8):
            tb = t0 + k * BEAT / 2
            if not in_ranges(tb, drum_ranges):
                continue
            if k in (0, 4, 7):  # kick
                ln = int(0.4 * SR)
                tt = np.arange(ln) / SR
                f = 45 + 90 * np.exp(-tt * 30)
                sig = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7) * 0.9
                place(drums, sig, tb)
            if k in (2, 6):  # clap/snare
                ln = int(0.25 * SR)
                tt = np.arange(ln) / SR
                noise = bandpass(rng.standard_normal(ln), 900, 6000)
                sig = (noise * 0.35 + np.sin(2 * np.pi * 190 * tt) * 0.25) * np.exp(-tt * 18)
                place(drums, sig, tb)
            ln = int(0.06 * SR)  # hi-hat
            hat = bandpass(rng.standard_normal(ln), 7000, 16000) * np.exp(-np.arange(ln) / SR * 60) * 0.12
            place(drums, hat, tb)
        # crash في بداية كل فترة إيقاع
        for a, _ in drum_ranges:
            if abs(t0 - a) < BAR / 2 or (b == 0 and a == 0):
                ln = int(2.5 * SR)
                crash = bandpass(rng.standard_normal(ln), 4000, 15000) * np.exp(-np.arange(ln) / SR * 1.8) * 0.12
                place(drums, crash, max(a, t0))

    pad = lowpass(pad, 1800)
    strings = lowpass(strings, 2600)
    # الـ pad والـ strings أقوى شوي في فترات الإيقاع عشان الحماس
    boost = np.array([1.35 if in_ranges(i / SR, drum_ranges) else 1.0 for i in range(0, n, SR // 10)])
    boost = np.repeat(boost, SR // 10)[:n]
    boost = np.convolve(boost, np.ones(SR // 2) / (SR // 2), mode='same')
    music = reverb(pad * boost + strings * boost + keys, 2.6, 0.35) + bass + drums * 0.9
    music = np.tanh(music * 1.2)
    music /= np.max(np.abs(music)) / 0.89
    fade = int(0.02 * SR)
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
    stereo = np.stack([music, np.roll(music, int(0.012 * SR))], axis=1)
    pcm = (stereo * 32767).astype('<i2')
    with wave.open(args.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main()
