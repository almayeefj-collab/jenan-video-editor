"""يغبّش مربع يدوي ويخليه يمشي مع حركة الكاميرا (ECC affine فريم بفريم) — لفيديو مصوّر بالجوال.

الاستخدام: python3 tools/track_blur.py <in.mp4> <out.mp4> '<json>'
json: [{"t": ثانية المرجع, "box": [x, y, w, h], "from": ثانية, "to": ثانية}]
"""
import json
import subprocess
import sys

import cv2
import numpy as np

src, out, spec = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
frames = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    frames.append(f)
n = len(frames)
SM = 3
g = [cv2.cvtColor(cv2.resize(f, (W // SM, H // SM), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY) for f in frames]
crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 50, 1e-5)
S = np.diag([SM, SM, 1.0])
step = [np.eye(3)] * n  # step[j]: من j-1 إلى j
for j in range(1, n):
    M = np.eye(2, 3, dtype=np.float32)
    try:
        _, M = cv2.findTransformECC(g[j - 1], g[j], M, cv2.MOTION_AFFINE, crit, None, 5)
    except cv2.error:
        pass
    step[j] = S @ np.vstack([M, [0, 0, 1]]) @ np.linalg.inv(S)


def T(a, b):
    m = np.eye(3)
    if b >= a:
        for j in range(a + 1, b + 1):
            m = step[j] @ m
    else:
        for j in range(a, b, -1):
            m = np.linalg.inv(step[j]) @ m
    return m[:2]


p = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                      '-i', src, '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-crf', '17', '-pix_fmt', 'yuv420p', '-c:a', 'aac', out], stdin=subprocess.PIPE)
for i, f in enumerate(frames):
    mask = np.zeros((H, W), np.uint8)
    for e in spec:
        if not (e['from'] * fps <= i <= e['to'] * fps):
            continue
        k = round(e['t'] * fps)
        x, y, w, h = e['box']
        pts = np.float32([[x, y], [x + w, y], [x + w, y + h], [x, y + h]])
        cv2.fillConvexPoly(mask, cv2.transform(pts[None], T(k, i))[0].astype(np.int32), 255)
    if mask.any():
        mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))
        bl = cv2.GaussianBlur(f, (0, 0), 8)
        m3 = cv2.GaussianBlur(mask, (0, 0), 2)[..., None] / 255.0
        f = (f * (1 - m3) + bl * m3).astype(np.uint8)
    p.stdin.write(f.tobytes())
p.stdin.close()
p.wait()
