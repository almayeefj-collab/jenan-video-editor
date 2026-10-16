"""يقطّع تسجيل جنان (ملف واحد) لمقاطع حسب السكتات بين الفقرات، وينظف الصوت.

السكربت (ملف نصي، فقرة لكل سطر = مقطع لكل مشهد) يعطي مكان كل فاصل المتوقع حسب طول الكلام،
وبعدها يختار أقرب سكتة حقيقية لكل فاصل ويقطع في نصها. يطلع v0.mp3 .. v{N-1}.mp3 بالترتيب
ويطبع طول كل مقطع (عشان dur في ملف الحلقة = طول المقطع + 0.2).

الاستخدام:
    python3 tools/split_voice.py recording.m4a script.txt remotion/public/ainews/ep02
"""
import re
import subprocess
import sys
from pathlib import Path

CLEAN = 'highpass=f=90,afftdn=nr=18:nf=-50:tn=1,acompressor=threshold=-20dB:ratio=3:attack=10:release=150:makeup=2,loudnorm=I=-15:TP=-1.5:LRA=9'


def run(*args):
    return subprocess.run(args, capture_output=True, text=True, check=True)


def silences(path):
    err = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-i', path, '-af', 'silencedetect=noise=-35dB:d=0.2', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', err)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', err)]
    return list(zip(starts, ends))


def main():
    src, script, out = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
    paras = [l.strip() for l in script.read_text(encoding='utf-8').splitlines() if l.strip()]
    n = len(paras)
    out.mkdir(parents=True, exist_ok=True)
    clean = out / '_clean.wav'
    run('ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, '-ac', '1', '-af', CLEAN, '-ar', '48000', str(clean))
    total = float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(clean)).stdout)
    # السكتات تنكشف من التسجيل الأصلي (بعد التنظيف الضجة ترتفع)، واللي في أول وآخر التسجيل ما تنحسب
    gaps = [((a + b) / 2, b - a) for a, b in silences(src) if a > 0.5 and b < total - 0.3]
    weights = [len(p.replace(' ', '')) for p in paras]
    expected, acc = [], 0
    for w in weights[:-1]:
        acc += w
        expected.append(total * acc / sum(weights))
    picked, last = [], 0.0
    for e in expected:
        options = [g for g in gaps if g[0] > last + 0.8]
        if not options:
            sys.exit(f'ما لقيت سكتة كافية بعد {last:.1f}s — قطّع يدوي')
        # السكتة الطويلة (نفَس بين فقرتين) أولى من سكتة قصيرة داخل الجملة حتى لو أبعد شوي
        g = min(options, key=lambda g: abs(g[0] - e) - 10 * g[1])[0]
        picked.append(g)
        last = g
    cuts = [0.0] + picked + [total]
    for i in range(n):
        f = out / f'v{i}.mp3'
        run('ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f'{cuts[i]:.3f}', '-to', f'{cuts[i + 1]:.3f}', '-i', str(clean),
            '-af', 'afade=t=in:d=0.03,areverse,afade=t=in:d=0.08,areverse', '-b:a', '192k', str(f))
        print(f'v{i}.mp3  {cuts[i]:6.2f} → {cuts[i + 1]:6.2f}  ({cuts[i + 1] - cuts[i]:.2f}s)')
    clean.unlink()


if __name__ == '__main__':
    main()
