"""يولّد موسيقى خلفية أوركسترالية رسمية بآلات حقيقية مسجلة (SoundFont):
وتريات legato + بيانو + هارب + هورن + تيمباني، بطابع رسمي دافي ومتفائل.

يحتاج SoundFont بصيغة sf2، مثلاً GeneralUser GS (رخصته تسمح بالاستخدام في إنتاج الموسيقى):
    curl -L -o GeneralUser-GS.sf2 https://raw.githubusercontent.com/mrbumpy409/GeneralUser-GS/main/GeneralUser-GS.sf2
    .venv/bin/pip install --no-deps tinysoundfont

الاستخدام:
    .venv/bin/python tools/compose_orchestral.py --sf2 GeneralUser-GS.sf2 --seconds 100 \
        --swell 0:8 --swell 88:100 --hit 6.2 -o remotion/public/music/orchestral.wav

--swell: فترات الأوركسترا فيها كاملة (هورن + تيمباني + وتريات أعلى)؛ باقي الوقت بيانو ووتريات هادية تحت الكلام.
--hit: ثواني فيها ضربة تيمباني مع chord كامل (مثلاً لحظة ظهور العنوان).
"""
import argparse
import wave

import numpy as np
import tinysoundfont

SR = 44100
BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT

# قنوات MIDI والآلات (أرقام General MIDI)
PIANO, STRINGS, LOW, HARP, HORN, TIMP, CHOIR = range(7)
PROGRAMS = {PIANO: 0, STRINGS: 49, LOW: 48, HARP: 46, HORN: 60, TIMP: 47, CHOIR: 52}

N = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}


def m(name, octave):
    return N[name] + 12 * (octave + 1)


# D - A/C# - Bm - G - D/F# - G - Em7 - A : تتابع رسمي ومتفائل (8 مازورات)
PROG = [
    ('D', 2, ['D', 'F#', 'A']),
    ('C#', 2, ['C#', 'E', 'A']),
    ('B', 1, ['B', 'D', 'F#']),
    ('G', 1, ['G', 'B', 'D']),
    ('F#', 1, ['F#', 'A', 'D']),
    ('G', 1, ['G', 'B', 'D']),
    ('E', 2, ['E', 'G', 'B', 'D']),
    ('A', 1, ['A', 'C#', 'E']),
]
# لحن البيانو (نوتة، أوكتاف، بداية بالـ beats، طول بالـ beats) لكل مازورة
MELODY = [
    [('F#', 5, 0, 1.5), ('E', 5, 1.5, 0.5), ('D', 5, 2, 2)],
    [('E', 5, 0, 1), ('A', 4, 1, 1), ('C#', 5, 2, 2)],
    [('D', 5, 0, 1.5), ('F#', 5, 1.5, 0.5), ('B', 5, 2, 2)],
    [('A', 5, 0, 1), ('G', 5, 1, 1), ('D', 5, 2, 2)],
    [('A', 5, 0, 1.5), ('F#', 5, 1.5, 0.5), ('D', 5, 2, 2)],
    [('B', 5, 0, 1), ('A', 5, 1, 1), ('G', 5, 2, 2)],
    [('G', 5, 0, 1), ('F#', 5, 1, 1), ('E', 5, 2, 2)],
    [('E', 5, 0, 2), ('C#', 5, 2, 2)],
]


def in_ranges(t, ranges):
    return any(a <= t < b for a, b in ranges)


class Score:
    def __init__(self):
        self.events = []

    def note(self, t, dur, chan, key, vel):
        self.events.append((t, 1, lambda s: s.noteon(chan, key, vel)))
        self.events.append((t + dur, 0, lambda s: s.noteoff(chan, key)))

    def cc(self, t, chan, ctl, val):
        self.events.append((t, 0, lambda s: s.control_change(chan, ctl, int(val))))


def compose(score, seconds, swells, hits):
    bars = int(np.ceil(seconds / BAR)) + 1
    for b in range(bars):
        t0 = b * BAR
        if t0 >= seconds:
            break
        root, roct, chord = PROG[b % 8]
        full = in_ranges(t0 + 0.05, swells)
        # وتريات legato: voicing مفتوح، تمسك المازورة كاملة مع تداخل خفيف
        voicing = [m(chord[0], 3), m(chord[1], 3), m(chord[2], 4), m(chord[0], 4)]
        for k in voicing:
            score.note(t0, BAR + 0.15, STRINGS, k, 78 if full else 62)
        score.note(t0, BAR + 0.1, LOW, m(root, roct + 1), 80 if full else 60)
        # بيانو: لحن + chord ناعم بالنص
        for nm, octv, st, du in MELODY[b % 8]:
            score.note(t0 + st * BEAT, du * BEAT * 0.95, PIANO, m(nm, octv), 72 if full else 64)
        for k, nm in enumerate(chord[:3]):
            score.note(t0 + k * 0.03, BEAT * 1.8, PIANO, m(nm, 4), 42)
            score.note(t0 + 2 * BEAT + k * 0.03, BEAT * 1.8, PIANO, m(nm, 4), 38)
        # هارب: arpeggio بالثمنيات طالع
        arp = [m(chord[0], 3), m(chord[1], 3), m(chord[2], 3), m(chord[0], 4), m(chord[1], 4), m(chord[2], 4), m(chord[0], 5), m(chord[2], 4)]
        for k, key in enumerate(arp):
            score.note(t0 + k * BEAT / 2, BEAT * 1.5, HARP, key, 58 if full else 46)
        if full:
            # هورن يمسك اللحن بأوكتاف أوطى + كورال خفيف + تيمباني على أول المازورة
            for nm, octv, st, du in MELODY[b % 8]:
                score.note(t0 + st * BEAT, du * BEAT, HORN, m(nm, octv - 1), 70)
            for k in voicing[1:]:
                score.note(t0, BAR, CHOIR, k + 12, 40)
            score.note(t0, 0.8, TIMP, m(root, 2), 76)
            score.note(t0 + 3.5 * BEAT, 0.4, TIMP, m(root, 2), 50)
    for h in hits:
        # ضربة: تيمباني roll قصير ثم ضربة قوية مع chord كامل
        for k in range(10):
            score.note(h - 0.9 + k * 0.08, 0.1, TIMP, m('D', 2), 30 + k * 6)
        score.note(h, 1.5, TIMP, m('D', 2), 112)
        for k in [m('D', 3), m('A', 3), m('D', 4), m('F#', 4), m('A', 4)]:
            score.note(h, 2.4, HORN, k - 12 if k > 60 else k, 92)
            score.note(h, 2.6, STRINGS, k, 100)


def render(sf2, seconds, score):
    synth = tinysoundfont.Synth(samplerate=SR, gain=-6)
    sfid = synth.sfload(sf2)
    for chan, prog in PROGRAMS.items():
        synth.program_select(chan, sfid, 0, prog)
        synth.control_change(chan, 91, 70)  # reverb send
        synth.control_change(chan, 7, 100)
    synth.control_change(STRINGS, 10, 54)
    synth.control_change(HARP, 10, 80)
    synth.control_change(HORN, 10, 44)
    events = sorted(score.events, key=lambda e: (e[0], e[1]))
    total = int(seconds * SR)
    out = np.zeros((total, 2), dtype=np.float32)
    pos = 0
    i = 0
    while pos < total:
        nxt = total if i >= len(events) else min(total, max(pos, int(events[i][0] * SR)))
        if nxt > pos:
            buf = synth.generate_simple(nxt - pos)
            out[pos:nxt] = np.frombuffer(buf, dtype=np.float32).reshape(-1, 2)
            pos = nxt
        while i < len(events) and int(events[i][0] * SR) <= pos:
            events[i][2](synth)
            i += 1
        if i >= len(events) and pos >= total:
            break
    return out


def finish(audio):
    # reverb قاعة بسيط (convolution) + تطبيع + fade
    rng = np.random.default_rng(3)
    n = int(2.6 * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir[: int(0.015 * SR)] *= np.linspace(0, 1, int(0.015 * SR))
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = np.zeros_like(audio)
    size = len(audio) + n
    for c in range(2):
        wet[:, c] = np.fft.irfft(np.fft.rfft(audio[:, c], size) * np.fft.rfft(ir, size), size)[: len(audio)]
    mix = 0.78 * audio + 0.22 * wet
    mix = np.tanh(mix * 1.2)
    mix /= np.max(np.abs(mix)) / 0.89
    fade = int(0.04 * SR)
    mix[:fade] *= np.linspace(0, 1, fade)[:, None]
    tail = int(2.5 * SR)
    mix[-tail:] *= np.linspace(1, 0, tail)[:, None] ** 1.5
    return mix


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sf2', required=True)
    ap.add_argument('--seconds', type=float, required=True)
    ap.add_argument('--swell', action='append', default=[], help='start:end بالثواني')
    ap.add_argument('--hit', action='append', type=float, default=[], help='ثانية ضربة التيمباني')
    ap.add_argument('-o', '--out', required=True)
    args = ap.parse_args()
    swells = [tuple(map(float, r.split(':'))) for r in args.swell]
    score = Score()
    compose(score, args.seconds, swells, args.hit)
    audio = finish(render(args.sf2, args.seconds, score))
    pcm = (audio * 32767).astype('<i2')
    with wave.open(args.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == '__main__':
    main()
