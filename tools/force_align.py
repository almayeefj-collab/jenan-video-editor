"""محاذاة السكربت مع صوت جنان: يولّد الجمل بصوت espeak-ng العربي ويطابقه مع التسجيل بـ DTW على MFCC،
ثم يسحب كل حد لأقرب سكتة. يطبع وقت بداية كل جملة (بالثواني من بداية التسجيل).

الاستخدام:
    python3 tools/force_align.py <التسجيل> <من> <إلى> "جملة ١" "جملة ٢" ...
(يحتاج: apt-get install espeak-ng)
"""
import re
import subprocess
import sys
import tempfile

import numpy as np

SR = 16000


def pcm(args):
    return np.frombuffer(subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', *args, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                                        capture_output=True, check=True).stdout, np.float32)


def mfcc(x, hop=160, n=400, nmel=26, ncep=13):
    w = np.hanning(n)
    fr = np.stack([x[i:i + n] * w for i in range(0, len(x) - n, hop)])
    p = np.abs(np.fft.rfft(fr, 512)) ** 2
    mel = lambda f: 2595 * np.log10(1 + f / 700)
    pts = 700 * (10 ** (np.linspace(mel(80), mel(7600), nmel + 2) / 2595) - 1)
    bins = np.floor(pts / (SR / 2) * 256).astype(int)
    fb = np.zeros((nmel, p.shape[1]))
    for m in range(1, nmel + 1):
        a, b, c = bins[m - 1], bins[m], bins[m + 1]
        fb[m - 1, a:b] = (np.arange(a, b) - a) / max(1, b - a)
        fb[m - 1, b:c] = (c - np.arange(b, c)) / max(1, c - b)
    e = np.log(p @ fb.T + 1e-8)
    dct = np.cos(np.pi / nmel * (np.arange(nmel) + 0.5)[None] * np.arange(1, ncep + 1)[:, None])
    c = e @ dct.T
    d = np.gradient(c, axis=0)
    f = np.hstack([c, d])
    return (f - f.mean(0)) / (f.std(0) + 1e-6)


def dtw_path(A, B):
    D = np.sqrt(((A[:, None] - B[None]) ** 2).sum(-1))
    n, m = D.shape
    C = np.full((n + 1, m + 1), np.inf)
    C[0, 0] = 0
    for i in range(1, n + 1):
        c, p, d = C[i], C[i - 1], D[i - 1]
        for j in range(1, m + 1):
            c[j] = d[j - 1] + min(p[j], c[j - 1], p[j - 1])
    i, j, path = n, m, []
    while i > 0 and j > 0:
        path.append((i - 1, j - 1))
        k = np.argmin([C[i - 1, j - 1], C[i - 1, j], C[i, j - 1]])
        i, j = (i - 1, j - 1) if k == 0 else (i - 1, j) if k == 1 else (i, j - 1)
    return path[::-1]


def pauses(path, a, b):
    err = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-ss', str(a), '-to', str(b), '-i', path, '-af', 'silencedetect=noise=-38dB:d=0.07',
                          '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', err)]
    e = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', err)]
    return [(a + x, a + y) for x, y in zip(s, e)]


def main():
    path, a, b, texts = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4:]
    real = pcm(['-ss', str(a), '-to', str(b), '-i', path])
    synth, starts = [], []
    with tempfile.TemporaryDirectory() as td:
        for k, t in enumerate(texts):
            subprocess.run(['espeak-ng', '-v', 'ar', '-s', '190', '-w', f'{td}/{k}.wav', t], check=True)
            y = pcm(['-i', f'{td}/{k}.wav'])
            y = y[np.argmax(np.abs(y) > 0.01):len(y) - np.argmax(np.abs(y[::-1]) > 0.01)]
            starts.append(sum(len(z) for z in synth) / SR)
            synth.append(np.concatenate([y, np.zeros(int(0.12 * SR), np.float32)]))
    A, B = mfcc(np.concatenate(synth)), mfcc(real)
    sm = {}
    for i, j in dtw_path(A, B):
        sm.setdefault(i, []).append(j)
    gaps = [(x + y) / 2 for x, y in pauses(path, a, b)]
    out = []
    for s in starts[1:]:
        i = min(int(s * 100), len(A) - 1)
        t = a + min(sm[i]) / 100
        near = [g for g in gaps if abs(g - t) < 0.35]
        out.append(min(near, key=lambda g: abs(g - t)) if near else t)
    print(' '.join(f'{x:.2f}' for x in [a] + out))


if __name__ == '__main__':
    main()
