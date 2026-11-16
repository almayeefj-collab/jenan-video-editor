#!/usr/bin/env python3
"""يقسم فيديو الجلسة الحوارية لأجزاء ويركّب عليها بطاقة البداية وأسئلة المحاورة وأسماء المتحدثين.

الاستخدام:
    python3 tools/panel_parts.py SOURCE.mp4 scripts/panel-session.json OUT_DIR [--only 3]

ملف الـ JSON فيه:
  cuts:      أوقات القطع بالثواني (بداية كل جزء بعد الأول) — على سكتة بين الجمل
  questions: [{at, dur, to, text}]  سؤال المحاورة، يظهر من at لمدة dur ثانية
  names:     [{at, who}]            اسم المتحدث تحت (يظهر 6 ثواني)
  trims:     [[from, to]]           مقاطع تنشال (مجاملات وكلام تنظيمي) عشان كل جزء ما يتعدى 3 دقائق
السكتات الطويلة تنضغط تلقائياً، وأوقات الأسئلة والأسماء تتحول لتوقيت الجزء بعد الاختصار.
كل جزء = بطاقة بداية (Remotion) + المقطع الأصلي بصوته مع الصور الشفافة فوقه، والجزء الأخير ينتهي ببطاقة ختام.
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOTION = os.path.join(ROOT, 'remotion')
PUB = os.path.join(REMOTION, 'public', 'footage', 'panel')
FADE = 0.4      # ظهور واختفاء الصور
NAME_DUR = 6.0  # مدة اسم المتحدث
MUSIC = os.path.join(REMOTION, 'public', 'c46', 'soft.mp3')
SIL_MIN = 0.5   # السكتة اللي طولها كذا أو أكثر تنضغط
SIL_KEEP = 0.3  # ...لهالطول
MAX_LEN = 180.0 # حد الريلز


def run(cmd, **kw):
    print('  $', ' '.join(str(c) for c in cmd)[:200], flush=True)
    subprocess.run([str(c) for c in cmd], check=True, **kw)


def remotion(kind, comp, out, props):
    args = ['npx', 'remotion', kind, 'src/index.ts', comp, out, '--props=' + json.dumps(props, ensure_ascii=False), '--log=error']
    if kind == 'still':
        args.append('--image-format=png')
    else:
        args += ['--codec=h264', '--crf=18']
    run(args, cwd=REMOTION)


def duration(path):
    out = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path])
    return float(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source')
    ap.add_argument('config')
    ap.add_argument('out')
    ap.add_argument('--only', type=int, nargs='*')
    a = ap.parse_args()

    cfg = json.load(open(a.config))
    total = duration(a.source)
    bounds = [cfg.get('start', 0.0)] + cfg['cuts'] + [cfg.get('end', total)]
    parts = len(bounds) - 1
    work = os.path.join(a.out, 'work')
    os.makedirs(work, exist_ok=True)
    os.makedirs(PUB, exist_ok=True)

    for i in range(parts):
        n = i + 1
        if a.only and n not in a.only:
            continue
        start, end = bounds[i], bounds[i + 1]
        print(f'== الجزء {n}/{parts}: {start:.1f} → {end:.1f}', flush=True)
        tag = f'{n:02d}'

        # المقاطع اللي تنحفظ (بتوقيت داخل الجزء): الجزء كامل ناقص الاختصارات وناقص السكتات الطويلة
        keep = keep_segments(a.source, start, end, cfg.get('trims', []))
        body_dur = sum(b - a_ for a_, b in keep)
        tmap = lambda t: sum(max(0.0, min(t - start, b) - a_) for a_, b in keep)

        # خلفية بطاقة البداية: لقطة من وسط الجزء
        bg = f'bg{tag}.jpg'
        run(['ffmpeg', '-v', 'error', '-y', '-ss', start + min(60, (end - start) / 2), '-i', a.source, '-frames:v', 1, '-q:v', 3, os.path.join(PUB, bg)])
        intro = os.path.join(work, f'intro{tag}.mp4')
        remotion('render', 'PanelIntro', intro, {'part': n, 'parts': parts, 'bg': 'footage/panel/' + bg})
        outro = None
        if n == parts:
            outro = os.path.join(work, 'outro.mp4')
            remotion('render', 'PanelOutro', outro, {'bg': 'footage/panel/' + bg})

        # الصور الشفافة اللي تركب فوق المقطع: [(png, from, to)] بتوقيت المقطع بعد الاختصار
        layers = []
        badge = os.path.join(work, f'badge{tag}.png')
        remotion('still', 'PanelBadge', badge, {'part': n, 'parts': parts})
        layers.append((badge, 1.0, body_dur))
        for k, q in enumerate(cfg['questions']):
            if start <= q['at'] < end:
                png = os.path.join(work, f'q{tag}_{k}.png')
                props = {'text': q['text']}
                for key in ('to', 'from'):
                    if q.get(key):
                        props[key] = q[key]
                remotion('still', 'PanelQuestion', png, props)
                t0 = tmap(q['at'])
                layers.append((png, t0, min(t0 + q['dur'], body_dur)))
        for k, nm in enumerate(cfg['names']):
            if start <= nm['at'] < end:
                png = os.path.join(work, f'name_{nm["who"]}.png')
                if not os.path.exists(png):
                    remotion('still', 'PanelLowerThird', png, {'who': nm['who']})
                t0 = tmap(nm['at'])
                layers.append((png, t0, min(t0 + NAME_DUR, body_dur)))

        cmd = ['ffmpeg', '-v', 'error', '-stats', '-y', '-i', intro, '-ss', start, '-t', end - start, '-i', a.source]
        for png, _, _ in layers:
            cmd += ['-loop', 1, '-t', body_dur, '-i', png]
        nxt = 2 + len(layers)
        cmd += ['-i', MUSIC]
        if outro:
            cmd += ['-i', outro, '-i', MUSIC]

        intro_d = duration(intro)
        sel = '+'.join(f'gte(t,{a_:.3f})*lt(t,{b:.3f})' for a_, b in keep)
        f = [f"[1:v]fps=25,select='{sel}',setpts=N/(25*TB),format=yuv420p,fade=in:st=0:d=0.5,fade=out:st={body_dur - 0.6:.2f}:d=0.6[b0]"]
        cur = 'b0'
        for j, (_, t0, t1) in enumerate(layers):
            src = 2 + j
            f.append(f'[{src}:v]format=rgba,fade=in:st={t0:.2f}:d={FADE}:alpha=1,fade=out:st={t1 - FADE:.2f}:d={FADE}:alpha=1[l{j}]')
            f.append(f"[{cur}][l{j}]overlay=0:0:enable='between(t,{t0:.2f},{t1:.2f})'[b{j + 1}]")
            cur = f'b{j + 1}'
        # صوت البطاقة: موسيقى هادئة تختفي قبل الكلام
        f.append(f'[{nxt}:a]atrim=0:{intro_d:.2f},asetpts=PTS-STARTPTS,volume=0.35,afade=in:st=0:d=0.5,afade=out:st={intro_d - 1.0:.2f}:d=1.0,aformat=sample_rates=48000:channel_layouts=stereo[ia]')
        # الصوت يتقطع بدقة 1ms على نفس المقاطع عشان يبقى متزامن مع الصورة
        f.append(f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,asetnsamples=n=48:p=0,aselect='{sel}',asetpts=N/SR/TB,afade=in:st=0:d=0.4,afade=out:st={body_dur - 0.6:.2f}:d=0.6[ba]")
        f.append('[0:v]fps=25,format=yuv420p,setsar=1[iv]')
        f.append(f'[{cur}]setsar=1[bv]')
        if outro:
            od = duration(outro)
            f.append(f'[{nxt + 2}:a]atrim=start={intro_d:.2f}:duration={od:.2f},asetpts=PTS-STARTPTS,volume=0.35,afade=in:st=0:d=1,afade=out:st={od - 1.5:.2f}:d=1.5,aformat=sample_rates=48000:channel_layouts=stereo[oa]')
            f.append(f'[{nxt + 1}:v]fps=25,format=yuv420p,setsar=1[ov]')
            f.append('[iv][ia][bv][ba][ov][oa]concat=n=3:v=1:a=1[v][a]')
        else:
            f.append('[iv][ia][bv][ba]concat=n=2:v=1:a=1[v][a]')

        out = os.path.join(a.out, f'الجلسة-الحوارية-الجزء-{tag}.mp4')
        cmd += ['-filter_complex', ';'.join(f), '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-preset', 'fast', '-crf', 21, '-pix_fmt', 'yuv420p', '-r', 25,
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]
        run(cmd)
        d = duration(out)
        print(f'   ✓ {out}  ({d:.2f}s){"  ⚠ أطول من 3 دقائق" if d > MAX_LEN else ""}', flush=True)


def keep_segments(source, start, end, trims):
    """الجزء [start,end] ناقص الاختصارات اليدوية، وكل سكتة 0.5s أو أكثر تنضغط لـ 0.3s.
    الحدود على شبكة الفريمات (0.04s) عشان الصوت والصورة ينقصون بنفس المقدار."""
    log = subprocess.run(['ffmpeg', '-v', 'info', '-ss', str(start), '-t', str(end - start), '-i', source, '-vn',
                          '-af', f'silencedetect=n=-32dB:d={SIL_MIN}', '-f', 'null', '-'], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    cut = [(s0 + SIL_KEEP / 2, s1 - SIL_KEEP / 2) for s0, s1 in zip(starts, ends)]
    cut += [(max(0.0, t0 - start), min(end - start, t1 - start)) for t0, t1 in trims if t1 > start and t0 < end]
    grid = lambda t: round(t * 25) / 25
    cut = sorted((grid(a), grid(b)) for a, b in cut if grid(b) > grid(a))
    keep, t = [], 0.0
    for a, b in cut:
        if a > t:
            keep.append((t, a))
        t = max(t, b)
    L = grid(end - start)
    if L > t:
        keep.append((t, L))
    return [(a, b) for a, b in keep if b - a >= 0.04]


if __name__ == '__main__':
    sys.exit(main())
