"""توليد صور/فيديو عبر Higgsfield API.

الاستخدام:
    export HF_KEY="api-key:api-secret"   # من https://cloud.higgsfield.ai
    .venv/bin/python tools/higgsfield_generate.py "وصف المشهد" \
        --model bytedance/seedream/v4/text-to-image --aspect 9:16
    # ينزّل النتيجة مباشرة (صورة الخبر في ريل الأخبار مثلاً):
    .venv/bin/python tools/higgsfield_generate.py "وصف" --aspect 4:3 -o remotion/public/ainews/chatgpt.jpg

اسم الموديل (--model) يحدد نوع التوليد؛ شوف قائمة الموديلات في لوحة Higgsfield Cloud.
"""
import argparse
import json
import os
import sys
import urllib.request

import higgsfield_client


def main() -> None:
    parser = argparse.ArgumentParser(description='Generate media with Higgsfield')
    parser.add_argument('prompt')
    parser.add_argument('--model', default='bytedance/seedream/v4/text-to-image')
    parser.add_argument('--aspect', default='16:9')
    parser.add_argument('--resolution', default='2K')
    parser.add_argument('--extra', default='{}', help='JSON لإعدادات إضافية خاصة بالموديل')
    parser.add_argument('-o', '--out', help='ينزّل أول ملف ناتج لهالمسار')
    args = parser.parse_args()

    if not (os.environ.get('HF_KEY') or (os.environ.get('HF_API_KEY') and os.environ.get('HF_API_SECRET'))):
        sys.exit('حط HF_KEY أو HF_API_KEY و HF_API_SECRET أول (من cloud.higgsfield.ai)')

    arguments = {
        'prompt': args.prompt,
        'aspect_ratio': args.aspect,
        'resolution': args.resolution,
        **json.loads(args.extra),
    }
    result = higgsfield_client.subscribe(args.model, arguments=arguments)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if args.out:
        url = first_url(result)
        if not url:
            sys.exit('ما لقيت رابط ملف بالنتيجة')
        os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
        urllib.request.urlretrieve(url, args.out)
        print('saved', args.out)


def first_url(x):
    # أول رابط http في النتيجة (images[0].url أو video.url حسب الموديل)
    if isinstance(x, str):
        return x if x.startswith('http') else None
    items = x.values() if isinstance(x, dict) else x if isinstance(x, list) else []
    for v in items:
        u = first_url(v)
        if u:
            return u
    return None


if __name__ == '__main__':
    main()
