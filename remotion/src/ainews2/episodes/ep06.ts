import type {ShowcaseEp} from '../Showcase';

// الحلقة ٦ — ٢٢ أكتوبر ٢٠٢٦ — «دفتر المتابعة»: تطبيق سوته جنان لصف ١٢ علمي ٨ بالكامل بـ Claude Code
// المادة: فيديو جنان (public/ainews/ep06/raw/source.mp4، 16:9). الأقسام والنقاط مكتوبة من الفيديو نفسه.
// السكربت: public/ainews/ep06/script.txt

export const ep06: ShowcaseEp = {
  number: 6,
  date: '٢٢ أكتوبر ٢٠٢٦',
  music: 'ainews/ep06/music-voice.mp3',
  source: 'ainews/ep06/raw/source.mp4',
  crop: [90, 145, 1180, 790],
  intro: {voice: 'ainews/ep06/v0.mp3', voiceDur: 8.78, beats: [
    {type: 'brand', look: 'dark', dur: 2.6, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'chips', look: 'coral', dur: 3.0, head: 'سويت *دفتر متابعة* لصفي', chips: ['Claude Code', '١٢ علمي ٨'], foot: 'الحلقة *٦*'},
  ]},
  sections: [
    {head: '*الطالبات*', voice: 'ainews/ep06/v1.mp3', voiceDur: 5.83, sub: 'بطاقة لكل طالبة تختصر مستواها', from: 6, to: 14, dur: 5.4,
      points: ['نقاط ومستوى لكل طالبة', 'مواطنة · مستشارة · وزيرة · دستور', 'بحث سريع بالاسم']},
    {head: 'الحضور *والمتابعة*', voice: 'ainews/ep06/v2.mp3', voiceDur: 8.47, sub: 'تسجيل الحصة بضغطة واحدة', from: 14, to: 26, dur: 7,
      points: ['حاضرة · غائبة · متأخرة', 'المشاركة والواجبات والاختبارات', 'كشف أسبوعي لكل الحصص']},
    {head: 'النشاط *الختامي*', voice: 'ainews/ep06/v3.mp3', voiceDur: 6.38, sub: 'ألعاب تفاعلية تختم الحصة', from: 26, to: 39, dur: 7,
      points: ['تحدي الفرق: الشمس والبحر', 'اختيار عشوائي للطالبة', 'قرعة التحدي و«سين جيم»']},
    {head: 'ملف *الطالبة*', voice: 'ainews/ep06/v4.mp3', voiceDur: 6.82, sub: 'صفحة متابعة خاصة لكل طالبة', from: 39, to: 48.5, dur: 5.6,
      points: ['توزيع الدرجات والمجموع', 'سجل ملاحظات المعلمة', 'رابط شريحة NFC للطالبة']},
    {head: '*الإعدادات*', voice: 'ainews/ep06/v5.mp3', voiceDur: 5.88, sub: 'كل شي يتعدّل من مكان واحد', from: 48.5, to: 57, dur: 5.2,
      points: ['جدول الحصص وأسماء الطالبات', 'بنك أسئلة الأنشطة لكل درس', 'روابط NFC جاهزة للنسخ']},
    {head: 'التقارير *والتصدير*', voice: 'ainews/ep06/v6.mp3', voiceDur: 6.26, sub: 'تقارير جاهزة للطباعة والمشاركة', from: 57, to: 72, dur: 7,
      points: ['تقرير PDF لكل طالبة', 'كشف الحضور والنقاط CSV', 'يفتح مباشرة في برامج الجداول']},
  ],
  reveal: {head: 'سويته *بالكامل* باستخدام', code: 'Claude Code', dur: 4, voice: 'ainews/ep06/v7.mp3', voiceDur: 2.47},
  outro: {voice: 'ainews/ep06/v8.mp3', dur: 10.0, word: 'دفتر'},
};
