import type {Episode2} from '../types';

// الحلقة ٧ — ٢٧ أكتوبر ٢٠٢٦ (ستايل الموشن جرافيك)
// المصادر: MacRumors + SiliconANGLE — Claude Duet (٢١ أكتوبر، قائمة انتظار Pro/Max أمريكا)؛
// 1Password press release + The Next Web + Engadget — 1Password for Agents (٢٢ أكتوبر)؛
// Google Workspace Updates + Android Authority — تصدير تطبيقات Gemini لـ Google Sites (١٩ أكتوبر)؛
// The Next Web + DataCamp — Kimi K3.1 Pro (٢٣–٢٤ أكتوبر، الأوزان موعودة ٤ نوفمبر)
// السكربت: public/ainews/ep07/script.txt

export const ep07v2: Episode2 = {
  number: 7,
  date: '٢٧ أكتوبر ٢٠٢٦',
  music: 'ainews/ep07/music.mp3',
  intro: {tag: 'intro', beats: [
    {type: 'brand', look: 'dark', dur: 2.6, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'calendar', look: 'light', dur: 2.4, head: '*٤* أخبار اليوم', day: '27', month: 'أكتوبر 2026', foot: 'الحلقة *٧*'},
  ]},
  stories: [
    {tag: 'Claude', beats: [
      {type: 'brand', look: 'dark', dur: 4.2, name: 'Claude Duet', chip: 'وكيل يشتغل من نفسه'},
      {type: 'doc', look: 'light', dur: 4.4, head: 'كل *صباح*', title: 'Claude Duet', rows: ['ملخص أهم الأشياء', 'يتابع تطبيقاتك', 'يستأذنك قبل أي خطوة']},
      {type: 'chips', look: 'coral', dur: 3.6, head: 'قائمة انتظار', chips: ['Pro', 'Max', 'أمريكا']},
    ]},
    {tag: '1Password', beats: [
      {type: 'brand', look: 'dark', dur: 4.0, name: '1Password', accent: 'for Agents', chip: 'خاصية للوكلاء'},
      {type: 'phone', look: 'light', dur: 4.4, head: 'بدون ما *يشوف* الباسوورد', bubbles: ['الوكيل يبي يسجّل دخول', 'توافق؟', 'موافق ✓']},
    ]},
    {tag: 'Gemini', beats: [
      {type: 'doc', look: 'light', dur: 4.6, head: 'من *Gemini* لموقع', title: 'Export', rows: ['تطبيقك في Gemini', 'Google Sites', 'انشره وشاركه']},
      {type: 'chips', look: 'dark', dur: 3.6, head: 'بضغطة *وحدة*', chips: ['الويب', 'Android', 'iOS']},
    ]},
    {tag: 'Kimi', beats: [
      {type: 'brand', look: 'dark', dur: 3.8, name: 'Kimi', accent: 'K3.1 Pro', chip: 'من Moonshot'},
      {type: 'stat', look: 'light', dur: 3.8, head: 'يقبل *مليون*', value: '1M', unit: 'توكن', foot: 'والأوزان مفتوحة *قريب*'},
    ]},
  ],
  outro: {dur: 7, word: 'موقع'},
};
