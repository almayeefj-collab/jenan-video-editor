"""ورقة معاينة: لكل مقطع سطر فيه 4 لقطات (عند 1/8 و3/8 و5/8 و7/8 من مدته) مع الاسم والمدة.
تنقسم صفحات كل 15 مقطع عشان تنقرا بسهولة.
الاستخدام: python tools/contact_sheet.py <مجلد_النسخ> <بادئة_القسم> <مجلد_الإخراج>
"""
import glob, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw

src, pref, outdir = sys.argv[1:4]
os.makedirs(outdir, exist_ok=True)
fs = sorted(f for f in glob.glob(f'{src}/{pref}_*.mp4') if not f.endswith('.tmp.mp4'))
W, H, PER = 240, 135, 15
tmp = os.path.join(tempfile.gettempdir(), '_cs.jpg')
rows = []
for f in fs:
    d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
    row = Image.new('RGB', (W * 4 + 150, H), 'black')
    for j in range(4):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(d * (2 * j + 1) / 8), '-i', f, '-frames:v', '1', '-vf', f'scale={W}:{H}', tmp])
        if os.path.exists(tmp):
            row.paste(Image.open(tmp), (150 + j * W, 0))
    ImageDraw.Draw(row).text((5, 50), os.path.basename(f)[:-4] + f'\n{d:.1f}s', fill='white')
    rows.append(row)
for p in range(0, len(rows), PER):
    chunk = rows[p:p + PER]
    sh = Image.new('RGB', (W * 4 + 150, H * len(chunk)))
    for i, r in enumerate(chunk):
        sh.paste(r, (0, i * H))
    sh.save(f'{outdir}/{pref}_p{p // PER}.jpg', quality=80)
print(len(rows), 'clips')
