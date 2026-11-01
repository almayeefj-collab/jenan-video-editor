"""يغبّش شريط أسماء الفريقين أسفل شاشة اللعبة في فيديو مصوّر بالجوال (الشاشة حمراء/برتقالية).
لكل فريم: نلقى آخر سطر أحمر (حد الشاشة السفلي) ونغبّش شريط فوقه بارتفاع band.

الاستخدام: python3 tools/blur_screen_band.py <in.mp4> <out.mp4> [band=120]
"""
import subprocess
import sys

import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
band = int(sys.argv[3]) if len(sys.argv) > 3 else 120
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
p = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                      '-i', src, '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', out], stdin=subprocess.PIPE)
prev = None
while True:
    ok, f = cap.read()
    if not ok:
        break
    b, g, r = [f[..., i].astype(np.int16) for i in range(3)]
    red = ((r - (g + b) // 2) > 70).mean(1)  # نسبة البكسلات الحمراء في كل سطر
    rows = np.where(red > 0.45)[0]
    bottom = int(rows.max()) if len(rows) else prev
    if bottom is not None:
        bottom = bottom if prev is None else int(0.6 * bottom + 0.4 * prev)  # تنعيم الرجفة
        prev = bottom
        y0, y1 = max(0, bottom - band), min(H, bottom + 12)
        f[y0:y1] = cv2.GaussianBlur(f[y0:y1], (0, 0), 12)
    p.stdin.write(f.tobytes())
p.stdin.close()
p.wait()
