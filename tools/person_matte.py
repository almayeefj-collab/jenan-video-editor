# يطلع فيديو شفاف (webm) للشخص بس، عشان نحط عناصر وراه. يحتاج mediapipe==0.10.14 (بايثون 3.12) لأن فيه نموذج selfie_segmentation مدمج.
# الاستخدام: python tools/person_matte.py in.mp4 out_person.webm
import sys, subprocess, cv2, numpy as np
import mediapipe as mp
src, dst = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
w, h = int(cap.get(3)), int(cap.get(4))
ff = subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','bgra','-s',f'{w}x{h}','-r','30','-i','-',
    '-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','3M','-auto-alt-ref','0','-row-mt','1','-deadline','good','-cpu-used','4',dst], stdin=subprocess.PIPE)
seg = mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=0)
prev=None; n=0
while True:
    ok, fr = cap.read()
    if not ok: break
    m = seg.process(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)).segmentation_mask.astype(np.float32)
    m = cv2.GaussianBlur(m, (0,0), 3)
    prev = m if prev is None else 0.6*m + 0.4*prev
    a = np.clip((prev-0.35)/0.3, 0, 1)
    a = cv2.GaussianBlur(a, (0,0), 2)
    out = np.dstack([fr, (a*255).astype(np.uint8)])
    ff.stdin.write(out.tobytes()); n+=1
ff.stdin.close(); ff.wait(); print(dst, n, 'frames')
