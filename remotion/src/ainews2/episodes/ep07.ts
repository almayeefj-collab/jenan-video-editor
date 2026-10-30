import type {Episode2} from '../types';

// الحلقة ٧ — ٣٠ أكتوبر ٢٠٢٦ — حلقة للمعلمين (جنان طلبت أخبار تفيد المعلم)
// المصادر: Google Workspace Updates + Classroom Help — ملخصات Gemini Notebook للمعلم في Classroom (حوالي ١٩–٢٠ أكتوبر،
//   Education Fundamentals/Standard/Plus)؛ Google Workspace Updates + Android Authority — تصدير تطبيقات Gemini لـ Google Sites (١٩ أكتوبر)؛
//   Microsoft EDU «What's New – October 2026» — Teach: Unit Plans (عامة أواخر أكتوبر) وزر Copilot Teaching Tools في OneNote Class Notebook؛
//   Microsoft + Cyberlite — تحديث AI Classroom Toolkit (أعمار ١٣–١٥، ٢٧ أكتوبر)
// السكربت: public/ainews/ep07/script.txt

export const ep07v2: Episode2 = {
  number: 7,
  date: '٣٠ أكتوبر ٢٠٢٦',
  music: 'ainews/ep07/music.mp3',
  intro: {tag: 'intro', beats: [
    {type: 'brand', look: 'dark', dur: 2.6, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'calendar', look: 'light', dur: 2.6, head: 'أخبار تفيد *المعلم*', day: '30', month: 'أكتوبر 2026', foot: 'الحلقة *٧*'},
  ]},
  stories: [
    {tag: 'Classroom', beats: [
      {type: 'brand', look: 'dark', dur: 4.0, name: 'Google Classroom', chip: 'Gemini Notebook'},
      {type: 'doc', look: 'light', dur: 4.6, head: 'ملخص *لطلابك*', title: 'Insights', rows: ['أكثر الأسئلة', 'نقاط تحتاج دعم', 'المحادثات كاملة']},
      {type: 'chips', look: 'coral', dur: 3.4, head: 'حتى *المجانية*', chips: ['Fundamentals', 'Standard', 'Plus']},
    ]},
    {tag: 'Gemini', beats: [
      {type: 'doc', look: 'light', dur: 4.6, head: 'من *Gemini* لموقع', title: 'Export', rows: ['تطبيقك أو لعبتك', 'Google Sites', 'شاركها مع طلابك']},
      {type: 'chips', look: 'dark', dur: 3.4, head: 'بضغطة *وحدة*', chips: ['الويب', 'Android', 'iOS']},
    ]},
    {tag: 'Copilot', beats: [
      {type: 'brand', look: 'dark', dur: 3.8, name: 'Copilot', accent: 'Teach', chip: 'من Microsoft'},
      {type: 'doc', look: 'light', dur: 4.4, head: 'خطة *وحدة* كاملة', title: 'Unit Plans', rows: ['تخطيط المنهج', 'أنشطة تعليمية', 'تعديل المحتوى']},
      {type: 'chips', look: 'coral', dur: 3.2, head: 'زر جديد في', chips: ['OneNote', 'Class Notebook']},
    ]},
    {tag: 'Toolkit', beats: [
      {type: 'chips', look: 'light', dur: 4.2, head: 'دروس *AI* للطلاب', chips: ['تأكد من الأخبار', 'إجابات الشات بوت']},
      {type: 'stat', look: 'dark', dur: 3.6, head: 'للأعمار', value: '13–15', unit: 'سنة', foot: 'من *Microsoft*'},
    ]},
  ],
  outro: {dur: 7, word: 'خطة'},
};
