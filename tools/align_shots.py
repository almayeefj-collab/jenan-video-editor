"""يطابق لقطات الخطوة مع كلام جنان: كل لقطة لها جملة، والحدود تنسحب لأقرب سكتة صغيرة (فاصلة/نفَس)
داخل مقطع صوت الخطوة. يطبع أطوال اللقطات بالثواني (مجموعها = طول المقطع + 0.2).

الاستخدام:
    python3 tools/align_shots.py v1.mp3 "جملة اللقطة ١" "جملة اللقطة ٢" ...
(جملة فاضية "" = لقطة ما ينقال فيها شي، تاخذ وقت قصير)
"""
import re
import subprocess
import sys


def pauses(path):
    err = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-i', path, '-af', 'silencedetect=noise=-38dB:d=0.1', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    s = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', err)]
    e = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', err)]
    return [((a + b) / 2) for a, b in zip(s, e)]


def main():
    path, texts = sys.argv[1], sys.argv[2:]
    total = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                                 capture_output=True, text=True).stdout)
    w = [max(4, len(t.replace(' ', ''))) for t in texts]
    gaps = [g for g in pauses(path) if 0.4 < g < total - 0.3]
    bounds, acc, last = [], 0, 0.0
    for x in w[:-1]:
        acc += x
        e = total * acc / sum(w)
        near = [g for g in gaps if last + 0.5 < g and abs(g - e) < 1.0]
        b = min(near, key=lambda g: abs(g - e)) if near else max(e, last + 0.5)
        bounds.append(b)
        last = b
    cuts = [0.0] + bounds + [total + 0.2]
    print(' '.join(f'{cuts[i + 1] - cuts[i]:.2f}' for i in range(len(texts))))


if __name__ == '__main__':
    main()
