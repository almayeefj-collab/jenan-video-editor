"""موسيقى رسمية أوركسترالية لفيديو التوصيات — آلات حقيقية من SoundFont (GeneralUser GS).

الهيكل مقسّم بالـ bars عشان كل "ضربة" (hit) تجي بالضبط على بداية مشهد:
    intro  : strings + harp هادية، ثم بناء تيمباني وضربة عنوان
    recs   : مقطع لكل توصية، يبدأ بضربة brass + تيمباني + صنج، والشدة تزيد تدريجياً
    outro  : كورد ختامي كبير يتلاشى

--style soft: نسخة هادئة (بيانو ووتريات ممتدة) بدون الضربات بين المشاهد.

الاستخدام:
    python tools/compose_formal.py --sf2 GeneralUser-GS.sf2 --bpm 96 --intro 6 --recs 15 --rec-bars 3 --outro 4 \
        -o remotion/public/music/formal.wav

يحتاج: numpy و tinysoundfont (pip install --no-deps tinysoundfont).
SoundFont: https://raw.githubusercontent.com/mrbumpy409/GeneralUser-GS/main/GeneralUser-GS.sf2
"""
import argparse
import wave

import numpy as np
import tinysoundfont

SR = 44100

# القنوات والآلات (General MIDI)
CH = {
    'strings': (0, 48),  # String Ensemble 1
    'horns': (1, 60),  # French Horn
    'brass': (2, 61),  # Brass Section
    'timp': (3, 47),  # Timpani
    'harp': (4, 46),  # Orchestral Harp
    'choir': (5, 52),  # Choir Aahs
    'basses': (6, 43),  # Contrabass
    'spicc': (7, 45),  # Pizzicato Strings
    'drums': (9, 0),
    # آلات النسخة الهادئة (--style soft)
    'piano': (8, 0),  # Acoustic Grand Piano
    'pad': (11, 89),  # Warm Pad
}
KICK, CRASH, SUS_CYM = 36, 49, 51

# D - Bm - G - A  (I - vi - IV - V) تتابع رسمي وفيه أمل
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'E': 4, 'F#': 6, 'G': 7, 'A': 9, 'B': 11}
PROG = [
    ('D', ['D', 'F#', 'A']),
    ('B', ['B', 'D', 'F#']),
    ('G', ['G', 'B', 'D']),
    ('A', ['A', 'C#', 'E']),
]
# لحن الهورن: نوتة (من السلم) لكل beat في البار، None = سكوت
HORN = [
    ['A', None, 'F#', 'A'],
    ['B', None, 'A', 'F#'],
    ['G', None, None, 'B'],
    ['A', None, None, None],
]


def midi(name, octave):
    return 12 * (octave + 1) + NOTE[name]


class Score:
    def __init__(self, bpm):
        self.beat = 60 / bpm
        self.ev = []  # (time, kind, ch, key, vel)

    def note(self, part, t, dur, key, vel):
        ch = CH[part][0]
        self.ev.append((t, 1, ch, key, int(max(1, min(127, vel)))))
        self.ev.append((t + dur, 0, ch, key, 0))


def compose(bpm, intro, recs, rec_bars, outro):
    s = Score(bpm)
    b = s.beat
    bar = 4 * b
    total_bars = intro + recs * rec_bars + outro
    hits = [intro + i * rec_bars for i in range(recs)]

    def chord_at(n):
        return PROG[n % len(PROG)]

    for n in range(total_bars):
        t0 = n * bar
        root, tones = chord_at(n)
        is_intro = n < intro
        is_outro = n >= intro + recs * rec_bars
        rec_i = (n - intro) // rec_bars if not is_intro and not is_outro else -1
        # الشدة: تزيد مع التوصيات
        level = 0.55 if is_intro else (1.0 if is_outro else 0.62 + 0.38 * rec_i / max(1, recs - 1))

        if is_outro and n > intro + recs * rec_bars:
            continue  # الكورد الختامي يرن من أول بار في الأوترو

        # strings pad: كورد ممتد بالبار كامل
        dur = bar * (outro if is_outro else 1) + 0.05
        for i, nm in enumerate(tones):
            s.note('strings', t0, dur, midi(nm, 4 if i else 3), 70 * level + 10)
        s.note('strings', t0, dur, midi(tones[0], 5), 55 * level + 10)
        s.note('basses', t0, dur, midi(root, 2), 80 * level + 10)

        if is_outro:
            for i, nm in enumerate(tones):
                s.note('brass', t0, bar * 3, midi(nm, 4), 100)
                s.note('horns', t0, bar * 3, midi(nm, 3 + (i == 0)), 95)
                s.note('choir', t0, bar * 3.5, midi(nm, 4), 85)
            s.note('timp', t0, b, midi('D', 2), 127)
            s.note('drums', t0, b, CRASH, 120)
            s.note('drums', t0, b, KICK, 127)
            continue

        # harp: أربيجيو 8ths
        arp = [midi(tones[0], 4), midi(tones[1], 4), midi(tones[2], 4), midi(tones[0], 5)]
        seq = arp + arp[::-1]
        for k in range(8):
            s.note('harp', t0 + k * b / 2, b, seq[k], 62 + 20 * level)

        if not is_intro:
            # pizzicato ostinato على الـ beats يعطي إحساس "خبر رسمي"
            for k in range(4):
                s.note('spicc', t0 + k * b, b / 2, midi(root, 3), 78 + 25 * level)
                s.note('spicc', t0 + k * b + b / 2, b / 2, midi(tones[2], 3), 60 + 20 * level)
            # timpani نبض خفيف
            s.note('timp', t0, b, midi(root if root in ('D', 'A') else 'A', 2), 70 + 30 * level)
            s.note('timp', t0 + 2 * b, b, midi('A', 2), 55 + 25 * level)
            # لحن الهورن في البارات الثانية والثالثة من كل توصية
            if (n - intro) % rec_bars:
                mel = HORN[n % len(HORN)]
                for k, nm in enumerate(mel):
                    if nm:
                        s.note('horns', t0 + k * b, b * 1.4, midi(nm, 4), 70 + 30 * level)
            # الكورال في النص الثاني من الفيديو
            if rec_i >= recs // 3:
                for nm in tones:
                    s.note('choir', t0, bar, midi(nm, 4), 45 + 35 * level)
            if rec_i >= 2 * recs // 3:
                s.note('drums', t0 + 2 * b, b, KICK, 70)

    # بناء الانترو: رول تيمباني يكبر قبل أول توصية
    roll_start = (intro - 2) * bar
    steps = int(2 * bar / (b / 6))
    for k in range(steps):
        s.note('timp', roll_start + k * b / 6, b / 6, midi('A', 2), 25 + 95 * k / steps)
    # ضربة العنوان في الانترو
    for nm in ('D', 'F#', 'A'):
        s.note('brass', 2 * bar, b * 2, midi(nm, 4), 95)
    s.note('timp', 2 * bar, b, midi('D', 2), 115)
    s.note('drums', 2 * bar, b, CRASH, 100)

    # ضربة بداية كل توصية
    for i, h in enumerate(hits):
        t = h * bar
        root, tones = chord_at(h)
        v = 92 + 30 * i / max(1, recs - 1)
        for nm in tones:
            s.note('brass', t, b * 0.9, midi(nm, 4), v)
        s.note('brass', t, b * 0.9, midi(root, 3), v)
        s.note('timp', t, b, midi(root if root in ('D', 'A') else 'D', 2), 127)
        s.note('drums', t, b, CRASH, 95 + 25 * i / recs)
        s.note('drums', t, b, KICK, 120)

    return s, total_bars * bar + 4.5


# النسخة الهادئة: بيانو + وتريات ممتدة + باد دافي، بدون ضربات ولا بيتزيكاتو بين التوصيات
SOFT_PROG = [
    ('D', ['D', 'F#', 'A'], ('D', 2)),
    ('A', ['C#', 'E', 'A'], ('C#', 2)),
    ('B', ['B', 'D', 'F#'], ('B', 1)),
    ('G', ['G', 'B', 'D'], ('G', 1)),
]
# لحن البيانو لكل جملة (4 بارات): (نوتة، أوكتاف، بداية بالـ beats، طول)
SOFT_MEL = [
    [[('A', 5, 0, 2), ('F#', 5, 2, 1), ('E', 5, 3, 1)], [('E', 5, 0, 3), ('C#', 5, 3, 1)], [('D', 5, 0, 2), ('F#', 5, 2, 2)], [('D', 5, 0, 2), ('B', 4, 2, 2)]],
    [[('D', 5, 0, 1), ('E', 5, 1, 1), ('F#', 5, 2, 2)], [('E', 5, 0, 2), ('A', 4, 2, 2)], [('B', 4, 0, 1), ('D', 5, 1, 1), ('F#', 5, 2, 2)], [('G', 5, 0, 2), ('F#', 5, 2, 1), ('E', 5, 3, 1)]],
]


def compose_soft(bpm, intro, recs, rec_bars, outro):
    s = Score(bpm)
    b = s.beat
    bar = 4 * b
    body = intro + recs * rec_bars
    total_bars = body + outro
    for n in range(body):
        t0 = n * bar
        _, tones, (bass, bo) = SOFT_PROG[n % 4]
        rec_i = (n - intro) // rec_bars if n >= intro else -1
        # الشدة تكبر بهدوء: انترو خفيف، ثم تزيد مع التوصيات
        level = 0.45 + 0.25 * min(1, n / max(1, intro)) if rec_i < 0 else 0.7 + 0.3 * rec_i / max(1, recs - 1)
        for i, nm in enumerate(tones):
            s.note('strings', t0, bar + b * 0.4, midi(nm, 4), 42 + 30 * level)
        s.note('pad', t0, bar + b * 0.4, midi(tones[0], 4), 40 + 20 * level)
        s.note('pad', t0, bar + b * 0.4, midi(tones[2], 4), 36 + 20 * level)
        if rec_i >= 0 or n >= intro - 2:
            s.note('basses', t0, bar, midi(bass, bo + 1), 40 + 30 * level)
        # أربيجيو بيانو ناعم 8ths
        arp = [midi(bass, bo + 1), midi(tones[2], 3), midi(tones[0], 4), midi(tones[1], 4), midi(tones[2], 4), midi(tones[1], 4), midi(tones[0], 4), midi(tones[2], 3)]
        for k, key in enumerate(arp):
            v = (44 + 18 * level) * (1.12 if k % 4 == 0 else 1.0)
            s.note('piano', t0 + k * b / 2, b * 0.9, key, v)
        # اللحن يدخل من أول توصية
        if rec_i >= 0:
            phrase = SOFT_MEL[(rec_i // 2) % 2]
            for nm, octv, st, dur in phrase[(n - intro) % 4]:
                s.note('piano', t0 + st * b, dur * b * 0.95, midi(nm, octv), 50 + 16 * level)
        if rec_i >= recs // 3:
            for nm in tones:
                s.note('choir', t0, bar + b * 0.4, midi(nm, 4), 30 + 25 * level)
        if rec_i >= 2 * recs // 3:
            s.note('strings', t0, bar, midi(tones[0], 5), 40 + 25 * level)
    # الختام: كورد D ممتد يتلاشى
    t0 = body * bar
    for i, nm in enumerate(['D', 'F#', 'A']):
        s.note('strings', t0, bar * outro, midi(nm, 4), 80)
        s.note('choir', t0, bar * outro, midi(nm, 4), 60)
        s.note('pad', t0, bar * outro, midi(nm, 4), 55)
    s.note('basses', t0, bar * outro, midi('D', 2), 70)
    for k, key in enumerate([midi('D', 3), midi('A', 3), midi('D', 4), midi('F#', 4), midi('A', 4), midi('D', 5)]):
        s.note('piano', t0 + k * b / 2, bar * 2, key, 66)
    return s, total_bars * bar + 4.5


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
            buf = syn.generate(n)
            out.append(np.frombuffer(buf, dtype=np.float32).copy())
            t += n / SR
        if on == 1:
            syn.noteon(ch, key, vel)
        elif on == 0:
            syn.noteoff(ch, key)
    audio = np.concatenate(out).reshape(-1, 2)
    return audio


def reverb(x, seconds=2.4, wet=0.22):
    # ريفيرب قاعة بسيط: IR من ضوضاء متلاشية + تأخير بسيط بين القناتين
    rng = np.random.default_rng(3)
    n = int(seconds * SR)
    env = np.exp(-np.linspace(0, 7, n))
    out = np.zeros_like(x)
    for c in range(2):
        ir = rng.standard_normal(n) * env
        ir[: int(0.012 * SR)] = 0
        ir /= np.sqrt((ir ** 2).sum())
        size = 1 << int(np.ceil(np.log2(len(x) + n)))
        y = np.fft.irfft(np.fft.rfft(x[:, c], size) * np.fft.rfft(ir, size), size)[: len(x)]
        out[:, c] = y
    return x * (1 - wet) + out * wet * 3


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sf2', required=True)
    ap.add_argument('--bpm', type=float, default=96)
    ap.add_argument('--intro', type=int, default=6)
    ap.add_argument('--recs', type=int, default=15)
    ap.add_argument('--rec-bars', type=int, default=3)
    ap.add_argument('--outro', type=int, default=4)
    ap.add_argument('--style', choices=['formal', 'soft'], default='formal')
    ap.add_argument('-o', '--out', required=True)
    a = ap.parse_args()
    fn = compose_soft if a.style == 'soft' else compose
    score, length = fn(a.bpm, a.intro, a.recs, a.rec_bars, a.outro)
    audio = reverb(render(score, length, a.sf2))
    audio /= np.abs(audio).max() / 0.89
    fade = int(3 * SR)
    audio[-fade:] *= np.linspace(1, 0, fade)[:, None]
    pcm = (audio * 32767).astype('<i2')
    with wave.open(a.out, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f'{a.out}: {len(audio) / SR:.1f}s, bar={4 * 60 / a.bpm:.3f}s')


if __name__ == '__main__':
    main()
