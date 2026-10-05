"""توليد صور/فيديو عبر Higgsfield API.

الاستخدام:
    export HF_KEY="api-key:api-secret"   # من https://cloud.higgsfield.ai
    .venv/bin/python tools/higgsfield_generate.py "وصف المشهد" \
        --model bytedance/seedream/v4/text-to-image --aspect 9:16

اسم الموديل (--model) يحدد نوع التوليد؛ شوف قائمة الموديلات في لوحة Higgsfield Cloud.
"""
import argparse
import json
import os
import sys

import higgsfield_client


def main() -> None:
    parser = argparse.ArgumentParser(description='Generate media with Higgsfield')
    parser.add_argument('prompt')
    parser.add_argument('--model', default='bytedance/seedream/v4/text-to-image')
    parser.add_argument('--aspect', default='16:9')
    parser.add_argument('--resolution', default='2K')
    parser.add_argument('--extra', default='{}', help='JSON لإعدادات إضافية خاصة بالموديل')
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


if __name__ == '__main__':
    main()
