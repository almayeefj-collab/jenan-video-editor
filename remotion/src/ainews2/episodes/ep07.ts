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
  music: 'ainews/ep07/music-voice.mp3',
  intro: {tag: 'intro', voice: 'ainews/ep07/v0.mp3', voiceDur: 7.13, beats: [
    {type: 'brand', look: 'dark', dur: 2.6, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'calendar', look: 'light', dur: 2.6, head: 'أخبار تفيد *المعلم*', day: '30', month: 'أكتوبر 2026', foot: 'الحلقة *٧*'},
  ]},
  // مدد اللقطات مقصوصة على جمل جنان (تفريغ التسجيل): كل واجهة تطلع لما تقول جملتها
  stories: [
    {tag: 'Classroom', voice: 'ainews/ep07/v1.mp3', voiceDur: 16.46, beats: [
      {type: 'brand', look: 'dark', dur: 1.55, name: 'Google Classroom', chip: 'Gemini Notebook'},
      {type: 'ui', look: 'light', dur: 2.45, head: 'تعطي طلابك *نوت بوك*', screen: 'classroomAssign'},
      {type: 'ui', look: 'light', dur: 8.9, head: 'ويطلع لك *ملخص*', screen: 'classroomInsights'},
      {type: 'chips', look: 'coral', dur: 3.76, head: 'حتى *المجانية*', chips: ['Fundamentals', 'Standard', 'Plus']},
    ]},
    {tag: 'Gemini', voice: 'ainews/ep07/v2.mp3', voiceDur: 11.26, beats: [
      {type: 'brand', look: 'dark', dur: 3.67, name: 'Gemini', chip: 'تطبيق أو لعبة ← موقع'},
      {type: 'ui', look: 'light', dur: 3.42, head: 'Export ثم *Google Sites*', screen: 'geminiExport'},
      {type: 'ui', look: 'light', dur: 4.37, head: 'وشاركه مع *طلابك*', screen: 'sitesShare'},
    ]},
    {tag: 'Copilot', voice: 'ainews/ep07/v3.mp3', voiceDur: 12.05, beats: [
      {type: 'brand', look: 'dark', dur: 2.41, name: 'Copilot', accent: 'Teach', chip: 'من Microsoft'},
      {type: 'ui', look: 'light', dur: 3.85, head: 'خطة *وحدة* كاملة', screen: 'teachUnitPlan'},
      {type: 'ui', look: 'light', dur: 5.99, head: 'زر جديد في *OneNote*', screen: 'oneNoteTeach'},
    ]},
    {tag: 'Toolkit', voice: 'ainews/ep07/v4.mp3', voiceDur: 12.12, beats: [
      {type: 'stat', look: 'dark', dur: 7.2, head: 'دروس *AI* للأعمار', value: '13–15', unit: 'سنة', foot: 'من *Microsoft*'},
      {type: 'ui', look: 'light', dur: 5.12, head: 'يتأكدون من *الخبر*', screen: 'factCheckLesson'},
    ]},
  ],
  outro: {voice: 'ainews/ep07/v5.mp3', dur: 12.6, word: 'خطة'},
};
