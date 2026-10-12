"""توليد فيديو وصور عبر Kling AI API.

الاستخدام:
    export KLING_ACCESS_KEY=...  KLING_SECRET_KEY=...   # من لوحة Kling API
    python3 tools/kling_generate.py text2video "prompt" -o out/01a.mp4
    python3 tools/kling_generate.py image2video "prompt" --image still.jpg -o out/01a.mp4
    python3 tools/kling_generate.py image "prompt" -o out/01a.png

الأمر ينتظر لين تخلص المهمة وينزّل النتيجة. بدون مكتبات خارجية.
"""
import argparse
import base64
import hashlib
import hmac
import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE = os.environ.get('KLING_API_BASE', 'https://api-singapore.klingai.com')
NEGATIVE = 'text, watermark, logo, subtitles, blurry, distorted faces, extra fingers, low quality'


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()


def token() -> str:
    ak, sk = os.environ.get('KLING_ACCESS_KEY'), os.environ.get('KLING_SECRET_KEY')
    if not (ak and sk):
        sys.exit('حط KLING_ACCESS_KEY و KLING_SECRET_KEY أول (من لوحة Kling API)')
    now = int(time.time())
    header = _b64url(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode())
    payload = _b64url(json.dumps({'iss': ak, 'exp': now + 1800, 'nbf': now - 5}).encode())
    sig = hmac.new(sk.encode(), f'{header}.{payload}'.encode(), hashlib.sha256).digest()
    return f'{header}.{payload}.{_b64url(sig)}'


def call(method: str, path: str, body: dict | None = None) -> dict:
    req = urllib.request.Request(
        BASE + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization': f'Bearer {token()}', 'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            res = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f'Kling {e.code}: {e.read().decode(errors="replace")}')
    if res.get('code') != 0:
        sys.exit(f'Kling error: {json.dumps(res, ensure_ascii=False)}')
    return res['data']


def wait(path: str, task_id: str, every: int = 10, limit: int = 1800) -> dict:
    start = time.time()
    while time.time() - start < limit:
        data = call('GET', f'{path}/{task_id}')
        status = data.get('task_status')
        print(f'  {task_id}: {status}', file=sys.stderr)
        if status == 'succeed':
            return data['task_result']
        if status == 'failed':
            sys.exit(f'فشلت المهمة: {data.get("task_status_msg")}')
        time.sleep(every)
    sys.exit('انتهى وقت الانتظار')


def download(url: str, out: str) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with urllib.request.urlopen(url, timeout=300) as r, open(out, 'wb') as f:
        f.write(r.read())
    print(out)


def main() -> None:
    p = argparse.ArgumentParser(description='Generate media with Kling AI')
    p.add_argument('kind', choices=['text2video', 'image2video', 'image'])
    p.add_argument('prompt')
    p.add_argument('-o', '--out', required=True)
    p.add_argument('--image', help='صورة البداية لـ image2video (مسار ملف أو رابط)')
    p.add_argument('--model', help='مثلاً kling-v2-1-master أو kling-v2-5-turbo')
    p.add_argument('--mode', default='pro', choices=['std', 'pro'])
    p.add_argument('--duration', default='5', choices=['5', '10'])
    p.add_argument('--aspect', default='16:9')
    p.add_argument('--negative', default=NEGATIVE)
    args = p.parse_args()

    if args.kind == 'image':
        path = '/v1/images/generations'
        body = {'model_name': args.model or 'kling-v2', 'prompt': args.prompt, 'negative_prompt': args.negative,
                'aspect_ratio': args.aspect, 'n': 1}
    else:
        path = f'/v1/videos/{args.kind}'
        body = {'model_name': args.model or 'kling-v2-1-master', 'prompt': args.prompt, 'negative_prompt': args.negative,
                'mode': args.mode, 'duration': args.duration, 'cfg_scale': 0.5}
        if args.kind == 'text2video':
            body['aspect_ratio'] = args.aspect
        else:
            if not args.image:
                sys.exit('image2video يحتاج --image')
            if os.path.exists(args.image):
                with open(args.image, 'rb') as f:
                    body['image'] = base64.b64encode(f.read()).decode()
            else:
                body['image'] = args.image

    task = call('POST', path, body)
    result = wait(path, task['task_id'])
    media = result.get('videos') or result.get('images')
    download(media[0]['url'], args.out)


if __name__ == '__main__':
    main()
