"""يشيل الصدى (صدى الغرفة) من تسجيل جنان بطريقة WPE، قبل التنظيف العادي في split_voice.py.

الاستخدام:
    python3 tools/dereverb.py <التسجيل> <الناتج.wav>
(يحتاج: pip install nara_wpe)
"""
import subprocess
import sys

import numpy as np
from nara_wpe.utils import istft, stft
from nara_wpe.wpe import wpe

SR = 48000


def main():
    src, out = sys.argv[1], sys.argv[2]
    pcm = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    y = np.frombuffer(pcm, np.float32).astype(np.float64)
    Y = stft(y[None], size=1024, shift=256).transpose(2, 0, 1)  # (freq, ch, frames)
    Z = wpe(Y, taps=30, delay=2, iterations=3, statistics_mode='full').transpose(1, 2, 0)
    z = istft(Z, size=1024, shift=256)[0][:len(y)]
    z *= 0.9 / max(1e-6, np.abs(z).max())
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', out],
                   input=z.astype(np.float32).tobytes(), check=True)


if __name__ == '__main__':
    main()
