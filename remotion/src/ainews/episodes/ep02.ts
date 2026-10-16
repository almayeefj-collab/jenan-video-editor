import type {Episode} from '../types';

// الحلقة ٢ — ١٦ أكتوبر ٢٠٢٦
// المصادر: ChatGPT release notes (help.openai.com) — صوت GPT-Live-1.1 (١٥ أكتوبر)؛
// Claude release notes + Releasebot — Docs و Slides و Design لكل الخطط حتى المجانية (أوائل أكتوبر)؛
// Gizchina — وضع الوكيل من Manus في جوالات OPPO Find X10 (أُعلن ١٣ أكتوبر، الإطلاق ٢١ أكتوبر)؛
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
    {kind: 'news', image: `${D}/s1.jpg`, dur: 8.1, tag: 'ChatGPT',
      title: 'صوت جديد في ChatGPT', sub: 'اسمه GPT-Live: يتكلم بشكل طبيعي أكثر ونطقه أوضح'},
    {kind: 'news', image: `${D}/s2.jpg`, dur: 8.1, tag: 'Claude',
      title: 'أدوات Claude ببلاش', sub: 'المستندات والعروض والتصاميم صارت لكل الخطط حتى المجانية'},
    {kind: 'news', image: `${D}/s3.jpg`, dur: 8.1, tag: 'Manus',
      title: 'Manus في جوالك', sub: 'وضع وكيل في جوالات أوبو الجديدة يسوي المهام عنك'},
    {kind: 'news', image: `${D}/s4.jpg`, dur: 7.3, tag: 'Amazon',
      title: 'أجهزة Bee', sub: 'سوار أو قطعة للجوال تكتب لك ملاحظات اجتماعاتك'},
    {kind: 'news', image: `${D}/s5.jpg`, dur: 5.7, tag: 'Meta',
      title: 'Muse Spark Open', sub: 'موديل مفتوح للمطورين: برمجة ووكلاء ذكيين'},
  ],
  outro: {image: 'ainews/brand/outro.jpg', dur: 7},
};
