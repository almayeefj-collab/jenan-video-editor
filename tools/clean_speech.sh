#!/usr/bin/env bash
# يعزل ضجة الخلفية (هواء/مكيف/همهمة القاعة) من صوت مقابلة بدون ما يأثر على الكلام:
# highpass للهمهمة المنخفضة + afftdn قوي يتتبع الضجة + gate يسكّت الفراغات بين الكلمات
# + loudnorm لمستوى صوت موحد. الفيديو ينسخ بدون إعادة ترميز.
# الاستخدام: tools/clean_speech.sh input.mp4 output.mp4
set -euo pipefail
ffmpeg -v error -y -i "$1" -map 0:v:0 -map 0:a:0 -c:v copy \
  -af "highpass=f=120,afftdn=nr=36:nf=-55:tn=1,agate=threshold=0.05:ratio=8:attack=5:release=200:range=0.05:knee=4,lowpass=f=10000,loudnorm=I=-16:TP=-1.5:LRA=11" \
  -c:a aac -b:a 192k -ar 48000 "$2"
