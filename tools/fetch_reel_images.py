"""ينزّل صور Higgsfield (من ملف JSON فيه الروابط) لمجلد public/ainews ويربطها بكروت ريل الأخبار.

الاستخدام:
    python3 tools/fetch_reel_images.py remotion/public/ainews/higgsfield-2026-10-13.json

المفاتيح بالـ JSON: "intro" لصورة الافتتاحية، و "1".."N" لكروت الأخبار بالترتيب.
يحتاج إن البيئة تسمح بدومين الصور (d8j0ntlcm91z4.cloudfront.net).
"""
import json
import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent / 'remotion'


def main():
    src = pathlib.Path(sys.argv[1])
    urls = json.loads(src.read_text())
    stem = src.stem.replace('higgsfield-', '')
    saved = {}
    for key, url in urls.items():
        rel = f'ainews/{stem}-{key}.png'
        urllib.request.urlretrieve(url, ROOT / 'public' / rel)
        saved[key] = rel
        print('saved', rel)

    # كروت الأخبار: نضيف img: '...' للكرت رقم n (بالترتيب)
    cfg = ROOT / 'src/ainews/config.ts'
    text = cfg.read_text()
    text = re.sub(r"\n\s*img: '[^']*',", '', text)
    parts = re.split(r"(kind: 'news',)", text)
    n = 0
    out = parts[0]
    for i in range(1, len(parts), 2):
        n += 1
        out += parts[i]
        if str(n) in saved:
            out += f" img: '{saved[str(n)]}',"
        out += parts[i + 1]
    cfg.write_text(out)

    # صورة الافتتاحية
    if 'intro' in saved:
        ai = ROOT / 'src/ainews/AINews.tsx'
        t = ai.read_text()
        t = re.sub(r"export const INTRO_IMG: string \| null = .*?;", f"export const INTRO_IMG: string | null = '{saved['intro']}';", t)
        ai.write_text(t)


if __name__ == '__main__':
    main()
