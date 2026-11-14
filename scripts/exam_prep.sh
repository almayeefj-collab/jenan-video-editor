#!/usr/bin/env bash
# يجهّز مقاطع فيديو إرشادات الاختبارات: 1080×1920، تفتيح ووضوح للصورة،
# وتنظيف الصوت (إزالة الوشوشة + وضوح الكلام + ضغط + توحيد المستوى)
# الاستخدام: scripts/exam_prep.sh input.mp4 remotion/public/footage/exam/cNN.mp4
set -euo pipefail
VF="scale=1080:1920:flags=lanczos,fps=30,hqdn3d=1.5:1.5:3:3,eq=gamma=1.15:contrast=1.06:saturation=1.06:brightness=0.015,unsharp=5:5:0.45:5:5:0"
AF="highpass=f=85,lowpass=f=13000,afftdn=nr=14:nf=-32:tn=1,equalizer=f=250:t=q:w=1:g=-2.5,equalizer=f=3200:t=q:w=1.2:g=3,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=7,aresample=48000"
ffmpeg -v error -y -i "$1" -vf "$VF" -c:v libx264 -crf 16 -preset fast -pix_fmt yuv420p -af "$AF" -c:a aac -b:a 192k "$2"
