"""يقص شاشة اللعبة من فيديو مصوّر بالجوال ويعدّلها (perspective) لفيديو شاشة مستقيم وثابت —
عشان تنحط داخل لابتوب في الريل بدل التصوير. الشاشة = أكبر منطقة حمراء/برتقالية.

الاستخدام: python3 tools/rectify_screen.py <in.mp4> <out.mp4> [W=1280] [H=800]
"""
import subprocess
import sys

import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
OW = int(sys.argv[3]) if len(sys.argv) > 3 else 1280
OH = int(sys.argv[4]) if len(sys.argv) > 4 else 800
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
dst = np.float32([[0, 0], [OW, 0], [OW, OH], [0, OH]])


def order(pts):
    s, d = pts.sum(1), np.diff(pts, axis=1).ravel()
    return np.float32([pts[s.argmin()], pts[d.argmin()], pts[s.argmax()], pts[d.argmax()]])  # tl, tr, br, bl


def quad(f):
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    h, s_, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    red = (((h <= 18) | (h >= 168)) & (s_ > 70) & (v > 110))
    card = (f.min(2) > 200)  # بطاقة السؤال البيضاء داخل الشاشة
    m = (red | card).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cs:
        return None
    c = max(cs, key=cv2.contourArea)
    if cv2.contourArea(c) < 0.08 * f.shape[0] * f.shape[1]:
        return None
    hull = cv2.convexHull(c)
    for eps in (0.02, 0.03, 0.04, 0.06):
        a = cv2.approxPolyDP(hull, eps * cv2.arcLength(hull, True), True)
        if len(a) == 4:
            return order(a.reshape(4, 2).astype(np.float32))
    return order(cv2.boxPoints(cv2.minAreaRect(c)).astype(np.float32))


p = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', str(fps), '-i', '-',
                      '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
sm = None
while True:
    ok, f = cap.read()
    if not ok:
        break
    q = quad(f)
    if q is not None:
        wq = (np.linalg.norm(q[1] - q[0]) + np.linalg.norm(q[2] - q[3])) / 2
        hq = (np.linalg.norm(q[3] - q[0]) + np.linalg.norm(q[2] - q[1])) / 2
        if not (1.25 < wq / max(hq, 1) < 2.1) or (sm is not None and np.abs(q - sm).max() > 140):
            q = None  # شكل غلط أو قفزة: نخلي آخر شاشة سليمة
    if q is not None:
        sm = q if sm is None else 0.65 * sm + 0.35 * q  # تنعيم رجفة اليد
    if sm is None:
        continue
    w = cv2.warpPerspective(f, cv2.getPerspectiveTransform(sm, dst), (OW, OH), flags=cv2.INTER_CUBIC)
    p.stdin.write(w.tobytes())
p.stdin.close()
p.wait()
