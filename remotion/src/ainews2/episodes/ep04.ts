import type {Episode2} from '../types';

// الحلقة ٤ — ١٨ أكتوبر ٢٠٢٦ (جهّزها الروتين اليومي، وانبنت هنا لأن الـ push من جلسة الروتين انرفض)
// المصادر: GlobeNewswire + fal.ai — Kling 4.0 (١٦ أكتوبر)؛ ChatGPT release notes — Slides؛
// Slator + TechRepublic — Grok Voice 3.0؛ AI Weekly — DeepSeek V4.1-Flash-1017 (مصادر ثانوية، تحتاج تأكيد)
// السكربت: public/ainews/ep04/script.txt

export const ep04v2: Episode2 = {
  number: 4,
  date: '١٨ أكتوبر ٢٠٢٦',
  music: 'ainews/ep04/music.mp3',
  intro: {tag: 'intro', beats: [
    {type: 'brand', look: 'dark', dur: 2.6, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'calendar', look: 'light', dur: 2.4, head: '*٤* أخبار اليوم', day: '18', month: 'أكتوبر 2026', foot: 'الحلقة *٤*'},
  ]},
  stories: [
    {tag: 'Kling', beats: [
      {type: 'brand', look: 'dark', dur: 4.2, name: 'Kling', accent: '4.0', chip: 'موديل فيديو جديد'},
      {type: 'stat', look: 'light', dur: 4.2, head: 'لقطات *لين*', value: '30', unit: 'ثانية', foot: 'ويقبل *15* مرجع'},
    ]},
    {tag: 'ChatGPT', beats: [
      {type: 'doc', look: 'light', dur: 5.2, head: 'ChatGPT يسوي *Slides*', title: 'Slides', rows: ['من محادثة أو ملف', 'تعديل مع فريقك', 'تصدير PowerPoint']},
      {type: 'chips', look: 'coral', dur: 4.8, head: 'متوفر لمشتركي', chips: ['Pro', 'Business', 'Enterprise']},
    ]},
    {tag: 'Grok', beats: [
      {type: 'phone', look: 'light', dur: 3.2, head: '*Grok Voice* 3.0', wave: true},
      {type: 'stat', look: 'dark', dur: 3.2, head: 'يرد بأقل من', value: '1', unit: 'ثانية'},
    ]},
    {tag: 'DeepSeek', beats: [
      {type: 'brand', look: 'dark', dur: 3.8, name: 'DeepSeek', accent: 'V4.1 Flash', chip: 'مفتوح المصدر · MIT'},
      {type: 'chips', look: 'light', dur: 3.6, head: 'يقبل *مليون* توكن', chips: ['بحث مباشر', 'مفتوح', 'MIT']},
    ]},
  ],
  outro: {dur: 10, word: 'Slides'},
};
