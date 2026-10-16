import type {Episode2} from '../types';

// الحلقة ١ — ١٥ أكتوبر ٢٠٢٦ (ستايل الموشن جرافيك، بصوت جنان)
// المصادر: ChatGPT release notes (help.openai.com)، TechCrunch و MacRumors (٧ أكتوبر)،
// Gemini release notes (gemini.google) و HPCwire (١٤ أكتوبر)
const D = 'ainews/ep01';

export const ep01v2: Episode2 = {
  number: 1,
  date: '١٥ أكتوبر ٢٠٢٦',
  music: `${D}/music2.mp3`,
  intro: {tag: 'intro', voice: `${D}/v0.mp3`, voiceDur: 5.74, beats: [
    {type: 'brand', look: 'dark', dur: 3, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'calendar', look: 'light', dur: 2.7, head: '*٤* أخبار اليوم', day: '15', month: 'أكتوبر 2026', foot: 'الحلقة *١*'},
  ]},
  stories: [
    {tag: 'ChatGPT', voice: `${D}/v1.mp3`, voiceDur: 9.62, beats: [
      {type: 'brand', look: 'dark', dur: 4.5, name: 'GPT-6', chip: 'نزل في ChatGPT'},
      {type: 'phone', look: 'light', dur: 5.3, head: 'إجابات *مرئية* وتفاعلية', bubbles: ['قارن لي بين جوالين', 'جدول + صور + رسم 📊'], foot: 'ويجاوبك وهو *يفكر*'},
    ]},
    {tag: 'ChatGPT', voice: `${D}/v2.mp3`, voiceDur: 8.93, beats: [
      {type: 'phone', look: 'light', dur: 4.3, head: 'ارفع *تسجيل صوتي*', wave: true},
      {type: 'doc', look: 'coral', dur: 4.8, head: 'ويعطيك', title: 'ChatGPT', rows: ['التفريغ', 'الملخص', 'جواب أسئلتك']},
    ]},
    {tag: 'ChatGPT', voice: `${D}/v3.mp3`, voiceDur: 7.34, beats: [
      {type: 'phone', look: 'light', dur: 3.8, head: 'زر *Try on*', bubbles: ['📸 هذي سيلفي', '👗 وهذا اللبس عليك']},
      {type: 'chips', look: 'dark', dur: 3.7, head: 'قبل لا *تشتري*', chips: ['ملابس', 'إكسسوارات', 'شنط']},
    ]},
    {tag: 'Gemini', voice: `${D}/v4.mp3`, voiceDur: 5.54, beats: [
      {type: 'brand', look: 'dark', dur: 2.9, name: 'Gemini 4', accent: 'Argon', chip: 'من Google'},
      {type: 'chips', look: 'coral', dur: 2.8, head: 'لمشتركي', chips: ['Pro', 'Ultra']},
    ]},
  ],
  outro: {voice: `${D}/v5.mp3`, dur: 7},
};
