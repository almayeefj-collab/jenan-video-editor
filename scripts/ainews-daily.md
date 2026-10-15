# ريلز «أخبار AI اليومية» — طريقة إنتاج الحلقة

حلقة يومية (٣٥–٥٠ ثانية، 9:16) عن آخر أخبار أدوات الذكاء الاصطناعي: إصدارات جديدة
(ChatGPT، Gemini، Claude، Midjourney، Higgsfield...) وخاصيات تقدر تستفيد منها.
آخر الحلقة دايماً: «تابعوني على الانستغرام @t.jenanalmayeef4».

## الهيكل

| المشهد | المحتوى | الطول |
|---|---|---|
| hook | «خبر نازل!» + boom | ~٥ ث |
| news × ٣–٤ | tag الأداة + عنوان + سطر شرح | طول الفويس + ٠.٥ ث |
| outro | تابعوني على الانستغرام | ٧ ث |

## الخطوات

1. **الأخبار**: ابحث عن أخبار آخر ٢٤–٤٨ ساعة (WebSearch). اعتمد المصادر الرسمية
   (release notes: OpenAI، Google، Anthropic...) وموقع تقني معروف. ٣–٤ أخبار، وخبر واحد
   على الأقل «خاصية تفيدك». لا تكرر خبر من حلقة سابقة (شوف `remotion/src/ainews/episodes/`).
2. **السكربت**: لهجة خليجية، جمل قصيرة، اكتب أسماء المنتجات بالعربي في نص الفويس
   (مثلاً «جي بي تي ستة») عشان تنطق صح، وبالإنجليزي على الشاشة.
3. **الصور (Higgsfield)**: `generate_image_batch` بموديل `gpt_image_2_5`، `aspect_ratio: 9:16`،
   صورة لكل مشهد. بدون نص ولا شعارات داخل الصورة. (~٠.٢٥ كريدت للصورة)
4. **الفويس أوفر (Higgsfield)**: `generate_audio_batch` بموديل `text2speech_v2`،
   `variant: elevenlabs`، `voice_type: preset`، `voice_id: 6b3e3642-f7b7-4cb8-9688-51e233c4b92f`
   (Emily). ملف لكل مشهد + الأوترو. (~٠.٤٥ كريدت للمقطع)
5. **التحميل**: نزّل الصور والصوت لـ `remotion/public/ainews/epNN/` (s0..s4.jpg، v0..v5.mp3).
   حوّل PNG لـ JPG. قِس طول كل فويس بـ ffprobe → `dur = طول الفويس + 0.5`.
6. **الموسيقى الحماسية**:
   ```bash
   python3 tools/compose_hype.py --seconds <الطول الكلي> --hits 0.2 <بداية كل مشهد...> -o /tmp/m.wav
   ffmpeg -i /tmp/m.wav -b:a 192k remotion/public/ainews/epNN/music.mp3
   ```
7. **الحلقة**: انسخ `episodes/ep01.ts` لـ `epNN.ts`، عدّل البيانات، وأضفها في `episodes/index.ts`.
8. **الرندر**:
   ```bash
   cd remotion
   npx remotion render src/index.ts AiNewsNN out/ainews-epNN.mp4          # بالفويس أوفر
   npx remotion render src/index.ts AiNewsNNMusic out/ainews-epNN-music.mp4  # موسيقى بس
   ```

## كابشن مقترح للبوست

```
🔴 خبر نازل | أخبار AI اليومية — الحلقة NN
<سطر لكل خبر>
تابعوني @t.jenanalmayeef4 عشان توصلك الأخبار أول بأول 🚀
#ذكاء_اصطناعي #ChatGPT #AI #تقنية #أدوات_الذكاء_الاصطناعي
```
