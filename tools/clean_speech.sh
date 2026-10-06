#!/usr/bin/env bash
# يوضّح صوت المحاضر/المتحدث ويشيل ضجة القاعة والمكيف بدون ما يقطّع الكلام:
# highpass للهمهمة + arnndn (شبكة RNNoise مدربة على الكلام) + afftdn خفيف للضجة الباقية
# + EQ (يشيل الكتمة حول 250Hz ويرفع الوضوح حول 3kHz) + compressor + dynaudnorm يساوي الكلمات الواطية بالعالية
# + loudnorm لمستوى عالي وموحد. الفيديو ينسخ بدون إعادة ترميز.
# الاستخدام: tools/clean_speech.sh input.mp4 output.mp4
# موديل RNNoise من https://github.com/GregorR/rnnoise-models (somnolent-hogwash)
set -euo pipefail
MODEL="$(cd "$(dirname "$0")" && pwd)/models/sh.rnnn"
ffmpeg -v error -y -i "$1" -map 0:v:0 -map 0:a:0 -c:v copy \
  -af "highpass=f=90,arnndn=m='$MODEL':mix=0.95,afftdn=nr=12:nf=-50:tn=1,equalizer=f=250:t=q:w=1.2:g=-4,equalizer=f=3200:t=q:w=1.5:g=5,equalizer=f=6500:t=q:w=2:g=2,lowpass=f=11000,acompressor=threshold=-24dB:ratio=3.5:attack=8:release=180:makeup=4,dynaudnorm=f=150:g=9:p=0.9:m=12,loudnorm=I=-14:TP=-1.5:LRA=7" \
  -c:a aac -b:a 192k -ar 48000 "$2"
