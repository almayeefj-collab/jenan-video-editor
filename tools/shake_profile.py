"""يقيس اهتزاز/حركة الكاميرا لكل فريم (إزاحة عامة بين الفريمات بـ phase correlation على نسخة 160x90).
الاستخدام: python tools/shake_profile.py <مجلد_النسخ> motion.json
الناتج: {اسم_المقطع: [إزاحة لكل فريم بالبكسل]}، يستخدمه academies_shots.py عشان يختار أثبت جزء.
"""
import glob, json, os, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
import numpy as np


def prof(f):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', f, '-vf', 'scale=160:90,format=gray', '-f', 'rawvideo', '-'])
    a = np.frombuffer(raw, np.uint8).reshape(-1, 90, 160).astype(float)
    win = np.outer(np.hanning(90), np.hanning(160))
    Fs = [np.fft.fft2(x * win) for x in a]
    out = []
    for p, q in zip(Fs, Fs[1:]):
        F = p * np.conj(q)
        r = np.fft.ifft2(F / (abs(F) + 1e-6)).real
        y, x = np.unravel_index(r.argmax(), r.shape)
        y = y - 90 if y > 45 else y
        x = x - 160 if x > 80 else x
        out.append(float(abs(x) + abs(y)))
    return os.path.basename(f)[:-4], out


if __name__ == '__main__':
    fs = sorted(f for f in glob.glob(sys.argv[1] + '/*.mp4') if not f.endswith('.tmp.mp4'))
    with ProcessPoolExecutor(4) as ex:
        res = dict(ex.map(prof, fs))
    json.dump(res, open(sys.argv[2], 'w'))
    print(len(res), 'clips')
