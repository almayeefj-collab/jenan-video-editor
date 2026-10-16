import type {Episode} from '../types';

// الحلقة ٢ — ١٦ أكتوبر ٢٠٢٦
// المصادر: ChatGPT release notes (help.openai.com) — صوت GPT-Live-1.1 (١٥ أكتوبر)؛
// Google blog + SiliconANGLE — وضع المهام في Gemini (١٣ أكتوبر)؛
// CNBC و Engadget و CBS — أجهزة Bee Frontier و Bee Eclipse من أمازون (١٥ أكتوبر)؛
// Bloomberg — Meta تطلق Muse Spark Open (١٥ أكتوبر)
// بدون voice لين جنان ترسل تسجيلها (المرحلة ٢ في scripts/ainews-daily.md)
const D = 'ainews/ep02';

export const ep02: Episode = {
  number: 2,
  date: '١٦ أكتوبر ٢٠٢٦',
  music: `${D}/music.mp3`,
  scenes: [
    {kind: 'hook', image: 'ainews/brand/intro.jpg', dur: 5,
      title: 'آخر أخبار أدوات الـ AI', sub: 'مع جنان المعييف'},
    {kind: 'news', image: `${D}/s1.jpg`, dur: 7.7, tag: 'ChatGPT',
      title: 'صوت أطبع في ChatGPT', sub: 'موديل صوت جديد GPT-Live، ونطقه أحسن بلغات كثيرة'},
    {kind: 'news', image: `${D}/s2.jpg`, dur: 8.1, tag: 'Gemini',
      title: 'وضع المهام', sub: 'تعطيه الشغلة وتطلع، ويكملها عنك لين يخلص'},
    {kind: 'news', image: `${D}/s3.jpg`, dur: 7.3, tag: 'Amazon',
      title: 'أجهزة Bee', sub: 'سوار أو قطعة للجوال تكتب لك ملاحظات اجتماعاتك'},
    {kind: 'news', image: `${D}/s4.jpg`, dur: 5.7, tag: 'Meta',
      title: 'Muse Spark Open', sub: 'موديل مفتوح للمطورين: برمجة ووكلاء ذكيين'},
  ],
  outro: {image: 'ainews/brand/outro.jpg', dur: 7},
};
