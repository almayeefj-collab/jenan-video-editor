# Jenan Video Editor

أدوات مونتاج وتوليد فيديو بالكود.

## التثبيت

```bash
./setup.sh
```

يحتاج: Node 18+، Python 3.9+، ffmpeg.

## الأدوات

| الأداة | وش تسوي |
|---|---|
| **Remotion** (`remotion/`) | فيديوهات وموشن جرافيك بـ React: نصوص عربية متحركة، انتقالات، قوالب |
| **Higgsfield** (`tools/higgsfield_generate.py`) | توليد صور وفيديو بالذكاء الاصطناعي (يحتاج مفتاح API) |
| **Kling** (`tools/kling_generate.py`) | توليد فيديو من نص أو من صورة، وتوليد صور (يحتاج `KLING_ACCESS_KEY` و `KLING_SECRET_KEY`) |
| **ffmpeg** | قص، دمج، صوت، ضغط، تحويل مقاسات |
| **MoviePy** | مونتاج بايثون: دمج مقاطع، نصوص، موسيقى |
| **auto-editor** | يشيل الصمت والأجزاء الميتة تلقائياً |
| **PySceneDetect** | يكتشف تغيّر المشاهد ويقطّع الفيديو |
| **faster-whisper** | يفرّغ الكلام (عربي وغيره) لترجمة SRT |

## Remotion

```bash
cd remotion
npm run studio                                                    # محرر بصري في المتصفح
npx remotion render src/index.ts HelloJenan out/hello.mp4        # 16:9
npx remotion render src/index.ts HelloJenanVertical out/reel.mp4 # 9:16
npx remotion render src/index.ts HelloJenan out/x.mp4 --props='{"title":"عنوانك","subtitle":"نصك"}'
```

الخط العربي (Cairo، رخصة OFL) محفوظ محلياً في `remotion/public/fonts`.
إذا ما قدر Remotion يحمّل Chrome، الإعداد في `remotion.config.ts` يستخدم متصفح مثبت
(`/opt/pw-browsers/...`) أو المسار اللي تحطه في `REMOTION_BROWSER`.

## Higgsfield

```bash
export HF_KEY="api-key:api-secret"   # من https://cloud.higgsfield.ai
.venv/bin/python tools/higgsfield_generate.py "غروب على الصحراء" --aspect 9:16
```

## أمثلة سريعة

```bash
.venv/bin/auto-editor input.mp4 -o trimmed.mp4                   # شيل الصمت
.venv/bin/scenedetect -i input.mp4 split-video                   # قطّع حسب المشاهد
ffmpeg -i in.mp4 -vf "crop=ih*9/16:ih,scale=1080:1920" reel.mp4  # حوّل لعمودي
```

## ريلز جنان (ستايل فاتح + انستغرام @t.jenanalmayeef4)

```bash
cd remotion
npm run music                                                    # يولّد موسيقى جديدة (ريل الأخبار تتغير كل يوم)
npx remotion render src/index.ts AINews out/ai-news.mp4          # أخبار الذكاء الاصطناعي — النصوص في src/ainews/config.ts
npx remotion render src/index.ts ChatGPTEp1 out/ep1.mp4          # سلسلة «ChatGPT بسهولة» — الحلقات في src/chatgpt/episodes.ts
```

- الرسومات متحركة ومرسومة بالكود (`src/ainews/Illustrations.tsx`): chat, assistant, image, video, motion, design, robot, voice, code.
- `tools/reel_music.py --seed <أي نص>`: كل seed يعطي مقطوعة مختلفة (سرعة، مقام، تتابع، صوت سنث).
