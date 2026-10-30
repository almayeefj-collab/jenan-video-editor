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
      {type: 'brand', look: 'dark', dur: 2.8, name: 'Google Classroom', chip: 'Gemini Notebook'},
      {type: 'ui', look: 'light', dur: 4.2, head: 'تعطي طلابك *نوت بوك*', screen: 'classroomAssign'},
      {type: 'ui', look: 'light', dur: 6.0, head: 'ويطلع لك *ملخص*', screen: 'classroomInsights'},
      {type: 'chips', look: 'coral', dur: 2.8, head: 'حتى *المجانية*', chips: ['Fundamentals', 'Standard', 'Plus']},
    ]},
    {tag: 'Gemini', beats: [
      {type: 'ui', look: 'light', dur: 5.4, head: 'من *Gemini*: Export', screen: 'geminiExport'},
      {type: 'ui', look: 'light', dur: 5.4, head: 'وشاركه *بموقع*', screen: 'sitesShare'},
    ]},
    {tag: 'Copilot', beats: [
      {type: 'brand', look: 'dark', dur: 2.8, name: 'Copilot', accent: 'Teach', chip: 'من Microsoft'},
      {type: 'ui', look: 'light', dur: 5.4, head: 'زر جديد في *OneNote*', screen: 'oneNoteTeach'},
      {type: 'ui', look: 'light', dur: 5.6, head: 'خطة *وحدة* كاملة', screen: 'teachUnitPlan'},
    ]},
    {tag: 'Toolkit', beats: [
      {type: 'ui', look: 'light', dur: 6.4, head: 'يتأكدون من *الخبر*', screen: 'factCheckLesson'},
      {type: 'stat', look: 'dark', dur: 2.8, head: 'دروس للأعمار', value: '13–15', unit: 'سنة', foot: 'من *Microsoft*'},
    ]},
  ],
  outro: {dur: 7, word: 'خطة'},
};
