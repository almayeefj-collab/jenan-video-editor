"""يغبّش اسم الأب والعائلة لكل طالبة في فيديو جنان ويخلي الاسم الأول واضح.

الطريقة: OCR عربي (tesseract) على فريم كل نص ثانية (ملفات JSON من kfocr)، نحدد كلمات الاسم اللي مو أول اسم
(من قائمة الطالبات)، وبين الفريمات نحرّك المربعات مع حركة الشاشة (OpenCV: ORB + affine) من الفريم اللي قبل
واللي بعد، ونغبّش اتحادهم.

الاستخدام:
    python3 tools/blur_names.py <الفيديو> <مجلد JSON> <الناتج.mp4> <roster.txt>
roster.txt: سطر لكل طالبة بالاسم الكامل.
"""
import glob
import json
import os
import re
import subprocess
import sys

import cv2
import numpy as np

AMBIG = {'علي', 'محمد', 'احمد', 'عبد', 'الله', 'عبدالله', 'صباح', 'سالم', 'حمد', 'سعد', 'بدر', 'عيد'}  # تنغبّش بس إذا جنبها اسم ثاني


def norm(w):
    w = re.sub(r'[ً-ْـ«»().,:؛،\-_/]', '', w)
    w = re.sub('[أإآ]', 'ا', w).replace('ة', 'ه').replace('ى', 'ي')
    return w.strip()


def lev(a, b):
    if abs(len(a) - len(b)) > 1:
        return 9
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def match(w, vocab):
    if len(w) < 2:
        return None
    if w in vocab:
        return w
    if len(w) >= 4:
        for v in vocab:
            if len(v) >= 4 and lev(w, v) <= 1:
                return v
    return None


def boxes_for(words, first, rest):
    """مربعات الكلمات اللي لازم تنغبّش في فريم واحد."""
    lines = {}
    for w in words:
        lines.setdefault((w['b'], w['ln']), []).append(w)
    out = []
    keys = sorted(lines)
    for idx, k in enumerate(keys):
        ws = lines[k]
        tags = [(w, match(norm(w['w']), first), match(norm(w['w']), rest)) for w in ws]
        nameish = sum(1 for _, f, r in tags if f or r)
        # السطر اللي قبله في نفس البلوك (اسم ملفوف على سطرين في البطاقة)
        prev = lines.get((k[0], k[1] - 1), [])
        prev_name = any(match(norm(w['w']), first) or match(norm(w['w']), rest) for w in prev)
        for w, f, r in tags:
            if not r or (f and not r):
                continue
            if f and r and norm(w['w']) in first:  # اسم أول (مثل «مريم») يبقى
                continue
            if r in AMBIG and nameish < 2 and not prev_name:
                continue
            out.append((w['x'], w['y'], w['wd'], w['h']))
    return out


def main():
    video, kfdir, outp, roster = sys.argv[1:5]
    first, rest = set(), set()
    for line in open(roster, encoding='utf-8'):
        parts = [norm(p) for p in line.split()]
        if parts:
            first.add(parts[0])
            rest.update(parts[1:])
    rest -= first
    kf = {}
    for p in sorted(glob.glob(os.path.join(kfdir, '*.json'))):
        k = int(os.path.basename(p)[:-5])
        kf[k] = boxes_for(json.load(open(p, encoding='utf-8')), first, rest)
    keys = sorted(kf)

    cap = cv2.VideoCapture(video)
    fps = cap.get(cv2.CAP_PROP_FPS)
    W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    # الحركة تنقاس على نسخة صغيرة (ربع الحجم) عشان الذاكرة
    SM = 4
    grays = []
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        grays.append(cv2.cvtColor(cv2.resize(fr, (W // SM, H // SM), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY))
    cap.release()
    n = len(grays)
    orb = cv2.ORB_create(1200)
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    feats = {}

    def feat(i):
        if i not in feats:
            feats[i] = orb.detectAndCompute(grays[i], None)
        return feats[i]

    def transform(a, b):
        """مصفوفة affine من فريم a لفريم b (أو None لو الشاشة تغيرت)."""
        if a == b:
            return np.array([[1, 0, 0], [0, 1, 0]], float)
        ka, da = feat(a)
        kb, db = feat(b)
        if da is None or db is None or len(ka) < 20 or len(kb) < 20:
            return None
        m = bf.match(da, db)
        if len(m) < 25:
            return None
        pa = np.float32([ka[x.queryIdx].pt for x in m]) * SM
        pb = np.float32([kb[x.trainIdx].pt for x in m]) * SM
        M, inl = cv2.estimateAffinePartial2D(pa, pb, ransacReprojThreshold=4)
        if M is None or inl.sum() < max(20, 0.35 * len(m)):
            return None
        return M

    proc = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(fps), '-i', '-',
                             '-i', video, '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', outp],
                            stdin=subprocess.PIPE)
    lo, hi = keys[0], keys[-1]
    cap = cv2.VideoCapture(video)
    for i in range(n):
        ok, fr = cap.read()
        if not ok:
            break
        if lo - 8 <= i <= hi + 8:
            src = [k for k in keys if k <= i][-1:] + [k for k in keys if k > i][:1]
            src += [k for k in keys if k < i][-2:-1] + [k for k in keys if k > i][1:2]  # احتياط لو OCR فوّت كلمة
            mask = np.zeros((H, W), np.uint8)
            for k in src:
                if abs(k - i) > 30 or not kf[k]:
                    continue
                M = transform(k, i)
                if M is None:
                    continue
                for x, y, w, h in kf[k]:
                    pts = np.float32([[x - 4, y - 5], [x + w + 4, y - 5], [x + w + 4, y + h + 5], [x - 4, y + h + 5]])
                    q = cv2.transform(pts[None], M)[0].astype(np.int32)
                    cv2.fillConvexPoly(mask, q, 255)
            if mask.any():
                mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))
                blur = cv2.GaussianBlur(fr, (0, 0), 9)
                m3 = cv2.GaussianBlur(mask, (0, 0), 2)[..., None] / 255.0
                fr = (fr * (1 - m3) + blur * m3).astype(np.uint8)
        proc.stdin.write(fr.tobytes())
        if i % 300 == 0:
            print(f'{i}/{n}', flush=True)
    proc.stdin.close()
    proc.wait()


if __name__ == '__main__':
    main()
