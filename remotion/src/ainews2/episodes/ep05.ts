import type {Episode2} from '../types';

// الحلقة ٥ — ١٩ أكتوبر ٢٠٢٦ — حلقة شرح (مو أخبار): كيف Claude يحضّر دروس المعلمة كل أسبوع تلقائي
// المصدر: إنفوجرافيك جنان (public/ainews/ep05/ref/) — الخطوات ١، ٢، ٣، ٥ (الخطوة ٤ ما كانت في الصور)
// السكربت: public/ainews/ep05/script.txt

export const ep05v2: Episode2 = {
  number: 5,
  date: '١٩ أكتوبر ٢٠٢٦',
  music: 'ainews/ep05/music.mp3',
  intro: {tag: 'intro', beats: [
    {type: 'brand', look: 'dark', dur: 2.8, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'chips', look: 'coral', dur: 3.2, head: 'Claude يحضّر *دروسك*', chips: ['كل أسبوع', 'تلقائي', 'PDF جاهز'], foot: 'الحلقة *٥*'},
  ]},
  stories: [
    {tag: 'Canva', beats: [
      {type: 'phone', look: 'light', dur: 3.8, head: 'الخطوة *١*', bubbles: ['⚙️ الإعدادات', '🔗 Connectors', 'دوري على Canva', 'اضغطي Connect ✓']},
      {type: 'chips', look: 'dark', dur: 3.4, head: 'اربطي *Claude* مع *Canva*', chips: ['Claude', 'Canva', '✓ متصل']},
    ]},
    {tag: 'Canva', beats: [
      {type: 'doc', look: 'light', dur: 5.6, head: 'الخطوة *٢*', title: 'Canva', rows: ['ملف تحضير المادة', 'عروض كل الدروس', 'مرتبة حسب الخطة']},
    ]},
    {tag: 'PDF', beats: [
      {type: 'phone', look: 'dark', dur: 3.6, head: 'الخطوة *٣*', bubbles: ['📄 خطة توزيع المنهج', '📘 كتاب المادة', 'اعتمد عليهم ✓']},
      {type: 'stat', look: 'light', dur: 3.2, head: 'ارفعيهم بصيغة', value: 'PDF', unit: 'ويمشي على تسلسل الدروس'},
    ]},
    {tag: 'Scheduled', beats: [
      {type: 'calendar', look: 'light', dur: 4, head: 'الخطوة *٤*: مهمة أسبوعية', day: '7:00', month: 'كل أحد'},
      {type: 'phone', look: 'coral', dur: 4.2, bubbles: ['جهّز لي تحضير حصة الأربعاء', 'وأرسله لي PDF 📄', 'تم ✓ التحضير جاهز']},
    ]},
    {tag: 'result', beats: [
      {type: 'cube', look: 'dark', dur: 4.6, head: 'وبس!', color: 'coral', label: 'PDF', foot: 'كل أحد يوصلك *جاهز*'},
    ]},
  ],
  outro: {dur: 10, word: 'تحضير'},
};
