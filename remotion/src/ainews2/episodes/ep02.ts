import type {Episode2} from '../types';

// الحلقة ٢ — ١٦ أكتوبر ٢٠٢٦ (ستايل الموشن جرافيك)
// المصادر: ChatGPT release notes — صوت GPT-Live-1.1 (١٥ أكتوبر)؛ Claude release notes + Releasebot —
// Docs/Slides/Design لكل الخطط (أوائل أكتوبر)؛ Gizchina — وضع الوكيل من Manus في OPPO Find X10 (١٣ أكتوبر، الإطلاق ٢١)؛
// CNBC/Engadget/CBS — Amazon Bee Frontier ($75) و Bee Eclipse ($100) (١٥ أكتوبر)؛ Bloomberg — Meta Muse Spark Open (١٥ أكتوبر)
// السكربت: public/ainews/ep02/script.txt (فقرة لكل قصة: intro، ٥ أخبار، outro)

export const ep02v2: Episode2 = {
  number: 2,
  date: '١٦ أكتوبر ٢٠٢٦',
  music: 'ainews/ep02/music.mp3',
  intro: {tag: 'intro', beats: [
    {type: 'brand', look: 'dark', dur: 2.6, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'calendar', look: 'light', dur: 2.4, head: '*٥* أخبار اليوم', day: '16', month: 'أكتوبر 2026', foot: 'الحلقة *٢*'},
  ]},
  stories: [
    {tag: 'ChatGPT', beats: [
      {type: 'phone', look: 'light', dur: 4.1, head: 'ChatGPT نزّل *صوت جديد*', wave: true},
      {type: 'chips', look: 'dark', dur: 4.0, head: 'يتكلم *طبيعي* أكثر', chips: ['GPT-Live', 'نطق أوضح', 'لغات كثيرة']},
    ]},
    {tag: 'Claude', beats: [
      {type: 'doc', look: 'light', dur: 4.3, head: 'أدوات *Claude*', title: 'Claude', rows: ['مستندات', 'عروض', 'تصاميم']},
      {type: 'stat', look: 'coral', dur: 3.8, head: 'لكل الخطط', value: '$0', unit: 'حتى المجانية'},
    ]},
    {tag: 'Manus', beats: [
      {type: 'phone', look: 'light', dur: 4.4, head: '*Manus* في جوالك', bubbles: ['احجز لي رحلة', 'تم الحجز ✓', 'رتّب مواعيدي', 'تم ✓']},
      {type: 'calendar', look: 'light', dur: 3.7, head: 'ينزل في جوالات *OPPO*', day: '21', month: 'أكتوبر', foot: 'Find X10'},
    ]},
    {tag: 'Amazon', beats: [
      {type: 'cube', look: 'dark', dur: 3.4, head: 'أجهزة *Bee* من أمازون', color: 'coral', label: 'Bee', foot: 'تكتب ملاحظات *اجتماعاتك*'},
      {type: 'bars', look: 'light', dur: 3.9, head: 'بكم؟', items: [
        {label: 'سوار Frontier', value: 75, display: '$75'},
        {label: 'Eclipse للجوال', value: 100, display: '$100'},
      ]},
    ]},
    {tag: 'Meta', beats: [
      {type: 'brand', look: 'dark', dur: 2.8, name: 'Muse Spark', accent: 'Open', chip: 'من Meta · مفتوح للمطورين'},
      {type: 'chips', look: 'coral', dur: 2.9, head: 'مخصص لـ', chips: ['البرمجة', 'وكلاء AI', 'مفتوح']},
    ]},
  ],
  outro: {dur: 7, word: 'Claude'},
};
