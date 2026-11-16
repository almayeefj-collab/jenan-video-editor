#!/usr/bin/env bash
# mux.sh <silent_dir> <out_dir> <music.wav> — adds background music to every <key>_silent.mp4
set -euo pipefail
in="$1"; out="$2"; music="$3"
mkdir -p "$out"
for f in "$in"/*_silent.mp4; do
  key=$(basename "$f" _silent.mp4)
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  st=$(python3 -c "print(max(0,float('$d')-2.5))")
  ffmpeg -loglevel error -y -i "$f" -i "$music" \
    -filter_complex "[1:a]volume=0.45,afade=t=in:d=1,afade=t=out:st=$st:d=2.5[a]" \
    -map 0:v -map "[a]" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart \
    -c:a aac -b:a 80k -shortest "$out/$key.mp4"
  echo "$key $(du -h "$out/$key.mp4" | cut -f1)"
done
