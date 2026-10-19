"""صوت إشعار (تن تن): نغمتين جرس صافية — remotion/public/sfx/notify.wav"""
import sys, wave
import numpy as np
SR = 44100
def bell(freq, dur=0.9):
    t = np.arange(int(dur * SR)) / SR
    s = sum(a * np.sin(2 * np.pi * freq * m * t) * np.exp(-t * d) for m, a, d in [(1, 1, 5), (2, 0.35, 8), (3, 0.12, 12), (4.2, 0.06, 18)])
    return s * np.minimum(1, t / 0.003)
out = np.zeros(int(1.4 * SR))
for at, f in [(0.0, 1318.5), (0.16, 1760.0)]:  # E6 ثم A6
    b = bell(f); i = int(at * SR); out[i:i + len(b)] += b[: len(out) - i]
out /= np.max(np.abs(out)) / 0.85
pcm = (np.stack([out, out], 1) * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
