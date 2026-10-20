# يفرّغ شاشة جوال مصوّر بالكاميرا من خلفيته: يتتبعها في كل فريم ويطلعها مسطّحة (600x1300)
# الاستخدام: .venv/bin/python tools/track_phone_screen.py in.mp4 out.mp4 FRAME:x1,y1,x2,y2,x3,y3,x4,y4 [...]
#   كل مرجع = رقم فريم + زوايا الشاشة فيه (فوق يسار، فوق يمين، تحت يمين، تحت يسار).
#   حط مرجع لكل شاشة مختلفة (مثلاً الشاشة الرئيسية وشاشة التطبيق)، والفريمات اللي ما تنطابق تنحسب بالاستيفاء
import cv2, numpy as np, sys, subprocess
src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
frames = []
while True:
    ok, f = cap.read()
    if not ok: break
    frames.append(f)
# التتبع من محتوى الشاشة نفسها (SIFT + homography) مقابل كل مرجع
refs = [(int(a.split(':')[0]), np.float32(a.split(':')[1].split(',')).reshape(4, 2)) for a in sys.argv[3:]]
sift = cv2.SIFT_create(4000)
h, w = frames[0].shape[:2]
R = []
for idx, pts in refs:
    m = np.zeros((h, w), np.uint8)
    cv2.fillPoly(m, [pts.astype(np.int32)], 255)
    m = cv2.erode(m, np.ones((15, 15), np.uint8))
    k, d = sift.detectAndCompute(cv2.cvtColor(frames[idx], cv2.COLOR_BGR2GRAY), m)
    R.append((k, d, pts))
bf = cv2.BFMatcher()
corners, good = [], []
for i, f in enumerate(frames):
    k, d = sift.detectAndCompute(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), None)
    best = (0, None)
    for rk, rd, pts in R:
        if d is None or len(k) < 10: continue
        m = [a for a, b in bf.knnMatch(rd, d, k=2) if a.distance < 0.7 * b.distance]
        if len(m) < 15: continue
        A = np.float32([rk[x.queryIdx].pt for x in m]); B = np.float32([k[x.trainIdx].pt for x in m])
        H, inl = cv2.findHomography(A, B, cv2.RANSAC, 2.5)
        n = int(inl.sum()) if inl is not None else 0
        if H is not None and n > best[0]: best = (n, cv2.perspectiveTransform(pts[None], H)[0])
    corners.append(best[1] if best[0] >= 40 else None)
    good.append(best[0])
ok = [i for i, c in enumerate(corners) if c is not None]
print('tracked', len(ok), 'of', len(frames), 'missing ranges:', [i for i in range(len(frames)) if corners[i] is None][:3], '...')
arr = np.array([corners[i] for i in ok])
corners = np.stack([np.stack([np.interp(range(len(frames)), ok, arr[:, c, d]) for d in range(2)], -1) for c in range(4)], 1)
# تنعيم زمني خفيف
k = np.ones(5) / 5
sm = corners.copy()
for c in range(4):
    for d in range(2):
        sm[:, c, d] = np.convolve(np.pad(corners[:, c, d], 2, mode='edge'), k, mode='valid')
OW, OH = 600, 1300
dst = np.float32([[0, 0], [OW, 0], [OW, OH], [0, OH]])
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', '60', '-i', '-',
                      '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
for f, c in zip(frames, sm):
    M = cv2.getPerspectiveTransform(np.float32(c), dst)
    p.stdin.write(cv2.warpPerspective(f, M, (OW, OH), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE).tobytes())
p.stdin.close(); p.wait()
miss=[i for i,g in enumerate(good) if g<40]
print('missing', miss[:1], miss[-1:] , len(miss))
