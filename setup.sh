#!/usr/bin/env bash
# يثبّت كل أدوات المونتاج: Remotion (Node) + أدوات بايثون
set -euo pipefail
cd "$(dirname "$0")"

command -v ffmpeg >/dev/null || { echo "ثبّت ffmpeg أول"; exit 1; }

(cd remotion && npm install)

python3 -m venv .venv
.venv/bin/pip install -q -U pip
.venv/bin/pip install -q -r requirements.txt

echo "تم التثبيت ✔"
