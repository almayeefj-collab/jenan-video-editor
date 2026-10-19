import {PROMPT, TASK, type TutorialEp} from '../Tutorial';

// الحلقة ٥ — ١٩ أكتوبر ٢٠٢٦ — حلقة شرح بشكل تسجيل شاشة (لابتوب + ماوس)
// الخطوات والنصوص من إنفوجرافيك جنان (public/ainews/ep05/ref/): ١ ربط Canva، ٢ ملف Canva، ٣ رفع PDF، ٥ الجدولة
// (الخطوة ٤ ما كانت في الصور، فالجدولة صارت الخطوة ٤ بالحلقة). السكربت: public/ainews/ep05/script.txt
// تقطيع الصوت من تفريغ التسجيل (Whisper): كل شاشة تبدأ مع جملتها، و clickAt = ثانية ما تقول جنان الكلمة

export const ep05: TutorialEp = {
  number: 5,
  date: '١٩ أكتوبر ٢٠٢٦',
  music: 'ainews/ep05/music-voice.mp3',
  intro: {voice: 'ainews/ep05/v0.mp3', voiceDur: 8.66, beats: [
    {type: 'brand', look: 'dark', dur: 2.8, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'chips', look: 'coral', dur: 3.2, head: 'Claude يحضّر *دروسك*', chips: ['كل أسبوع', 'تلقائي', 'PDF جاهز'], foot: 'الحلقة *٥*'},
  ]},
  steps: [
    {head: 'ربط *Canva* مع Claude', voice: 'ainews/ep05/v1.mp3', voiceDur: 15.1, shots: [
      {screen: 'welcome', dur: 4.47, clickAt: 4.0, open: true, caption: 'افتحي حسابك في Claude AI', to: [800, 700], click: true},
      {screen: 'app', dur: 0.62, clickAt: 0.4, caption: 'انتقلي إلى الإعدادات', to: [150, 935], click: true, zoom: [420, 780, 1.8]},
      {screen: 'userMenu', dur: 0.71, clickAt: 0.45, caption: 'انتقلي إلى الإعدادات', to: [200, 700], click: true, zoom: [420, 720, 1.8]},
      {screen: 'settings', dur: 1.79, clickAt: 1.2, caption: 'اختاري Connectors (التطبيقات المتصلة)', to: [560, 500], click: true, zoom: [620, 440, 1.7]},
      {screen: 'connectors', dur: 2.28, clickAt: 1.8, caption: 'ابحثي عن Canva واضغطي Connect', type: 'Canva', to: [1140, 400], click: true, zoom: [820, 340, 1.6]},
      {screen: 'canvaLogin', dur: 2.17, clickAt: 1.8, caption: 'سجّلي الدخول بحساب Canva', to: [800, 482], click: true, zoom: [800, 470, 1.6]},
      {screen: 'connected', dur: 3.26, caption: 'تأكدي من ظهور Canva ضمن التطبيقات المتصلة', to: [900, 440], zoom: [820, 340, 1.6]},
    ]},
    {head: 'الوصول إلى ملف *Canva* المحفوظ', voice: 'ainews/ep05/v2.mp3', voiceDur: 11.4, shots: [
      {screen: 'canvaHome', dur: 6.59, clickAt: 6.15, caption: 'افتحي حسابك في Canva واختاري Projects', to: [140, 260], click: true, zoom: [420, 300, 1.8]},
      {screen: 'canvaProjects', dur: 1.44, clickAt: 1.1, caption: 'اختاري الملف المحفوظ', to: [620, 520], click: true, zoom: [640, 500, 1.5]},
      {screen: 'canvaFile', dur: 1.93, clickAt: 1.6, caption: 'تأكدي من محتوى الملف', to: [1470, 50], click: true, zoom: [960, 400, 1.35]},
      {screen: 'canvaShare', dur: 1.64, clickAt: 1.15, caption: 'انسخي رابط الملف (اختياري)', to: [1360, 240], click: true, zoom: [1250, 220, 1.7]},
    ]},
    {head: 'رفع خطة المنهج والكتاب *PDF*', voice: 'ainews/ep05/v3.mp3', voiceDur: 10.75, shots: [
      {screen: 'chat', dur: 5.92, clickAt: 5.6, caption: 'اضغطي على زر إرفاق الملفات', to: [445, 900], click: true, zoom: [700, 800, 1.6]},
      {screen: 'attach', dur: 0.65, clickAt: 0.35, caption: 'اختاري Upload files', to: [600, 490], click: true, zoom: [700, 600, 1.6]},
      {screen: 'uploaded', dur: 2.29, caption: 'تأكدي من ظهور الملفات في المحادثة', to: [900, 700], zoom: [960, 700, 1.5]},
      {screen: 'prompt', dur: 2.09, caption: 'اكتبي التعليمات لـ Claude', type: PROMPT, to: [1460, 880], click: true, zoom: [960, 760, 1.5]},
    ]},
    {head: 'جدولة التحضير *الأسبوعي*', voice: 'ainews/ep05/v4.mp3', voiceDur: 13.37, shots: [
      {screen: 'app', dur: 6.03, clickAt: 5.66, caption: 'من القائمة الجانبية اختاري Scheduled', to: [160, 420], click: true, zoom: [420, 450, 1.8]},
      {screen: 'scheduled', dur: 1.58, clickAt: 1.23, caption: 'اضغطي New task', to: [965, 510], click: true, zoom: [965, 450, 1.6]},
      {screen: 'repeat', dur: 2.82, clickAt: 0.85, caption: 'اختاري Weekly وحددي يوم الأحد والساعة', to: [530, 485], click: true, zoom: [820, 500, 1.4]},
      {screen: 'details', dur: 1.1, caption: 'اكتبي التعليمات لـ Claude', type: TASK, to: [880, 600], zoom: [880, 520, 1.4]},
      {screen: 'review', dur: 2.04, clickAt: 1.43, caption: 'راجعي التفاصيل واضغطي Save task', to: [880, 795], click: true, zoom: [880, 560, 1.4]},
    ]},
  ],
  final: {image: 'ainews/ep05/notification.jpg', head: 'وكل أحد *يوصلك* الإشعار', dur: 9.7, voice: 'ainews/ep05/v5.mp3', voiceDur: 9.26, dropAt: 1.0},
  outro: {voice: 'ainews/ep05/v6.mp3', dur: 8.5, word: 'تحضير'},
};
