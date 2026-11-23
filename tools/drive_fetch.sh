#!/bin/bash
# ينزّل مقطع من جوجل درايف (مجلد مشارك "أي أحد عنده الرابط") ويحوله نسخة خفيفة 1920x1080 / 30fps بدون صوت، ثم يحذف الأصلي
# الاستخدام: tools/drive_fetch.sh <قسم> <file_id> <اسم> <مجلد_النسخ>
# مثال جماعي: xargs -P 3 -L 1 tools/drive_fetch.sh < list.txt   (كل سطر: قسم id اسم مجلد)
# يحتاج الشبكة تسمح بـ drive.usercontent.google.com
sec=$1; id=$2; name=$3; dir=${4:-proxies}
mkdir -p "$dir" "$dir/.raw"
out="$dir/${sec}_${name}.mp4"
[ -s "$out" ] && exit 0
raw="$dir/.raw/${sec}_${name}"
for i in 1 2 3; do curl -sSL -o "$raw" "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t" && break; sleep 3; done
ffmpeg -v error -y -i "$raw" -map 0:v:0 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p" \
  -c:v libx264 -preset veryfast -crf 19 -an "$out.tmp.mp4" && mv "$out.tmp.mp4" "$out"
rm -f "$raw"
echo "done $sec $name $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")"
