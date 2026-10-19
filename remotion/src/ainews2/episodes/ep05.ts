import {PROMPT, TASK, type TutorialEp} from '../Tutorial';

// الحلقة ٥ — ١٩ أكتوبر ٢٠٢٦ — حلقة شرح بشكل تسجيل شاشة (لابتوب + ماوس)
// الخطوات والنصوص من إنفوجرافيك جنان (public/ainews/ep05/ref/): ١ ربط Canva، ٢ ملف Canva، ٣ رفع PDF، ٥ الجدولة
// (الخطوة ٤ ما كانت في الصور، فالجدولة صارت الخطوة ٤ بالحلقة). السكربت: public/ainews/ep05/script.txt

export const ep05: TutorialEp = {
  number: 5,
  date: '١٩ أكتوبر ٢٠٢٦',
  music: 'ainews/ep05/music.mp3',
  intro: {beats: [
    {type: 'brand', look: 'dark', dur: 2.8, name: 'آخر أخبار أدوات الـ AI', chip: 'مع جنان المعييف'},
    {type: 'chips', look: 'coral', dur: 3.2, head: 'Claude يحضّر *دروسك*', chips: ['كل أسبوع', 'تلقائي', 'PDF جاهز'], foot: 'الحلقة *٥*'},
  ]},
  steps: [
    {head: 'ربط *Canva* مع Claude', shots: [
      {screen: 'welcome', dur: 3.2, open: true, caption: 'افتحي حسابك في Claude AI', to: [800, 700], click: true},
      {screen: 'app', dur: 2.4, caption: 'انتقلي إلى الإعدادات', to: [150, 935], click: true, zoom: [420, 780, 1.8]},
      {screen: 'userMenu', dur: 2.4, caption: 'انتقلي إلى الإعدادات', to: [200, 700], click: true, zoom: [420, 720, 1.8]},
      {screen: 'settings', dur: 2.8, caption: 'اختاري Connectors (التطبيقات المتصلة)', to: [560, 500], click: true, zoom: [620, 440, 1.7]},
      {screen: 'connectors', dur: 3.4, caption: 'ابحثي عن Canva واضغطي Connect', type: 'Canva', to: [1140, 400], click: true, zoom: [820, 340, 1.6]},
      {screen: 'canvaLogin', dur: 2.6, caption: 'سجّلي الدخول بحساب Canva', to: [800, 482], click: true, zoom: [800, 470, 1.6]},
      {screen: 'connected', dur: 2.6, caption: 'تأكدي من ظهور Canva ضمن التطبيقات المتصلة', to: [900, 440], zoom: [820, 340, 1.6]},
    ]},
    {head: 'الوصول إلى ملف *Canva* المحفوظ', shots: [
      {screen: 'canvaHome', dur: 2.8, caption: 'افتحي حسابك في Canva واختاري Projects', to: [140, 260], click: true, zoom: [420, 300, 1.8]},
      {screen: 'canvaProjects', dur: 2.8, caption: 'اختاري الملف المحفوظ', to: [620, 520], click: true, zoom: [640, 500, 1.5]},
      {screen: 'canvaFile', dur: 3, caption: 'تأكدي من محتوى الملف', to: [1470, 50], click: true, zoom: [960, 400, 1.35]},
      {screen: 'canvaShare', dur: 2.8, caption: 'انسخي رابط الملف (اختياري)', to: [1360, 240], click: true, zoom: [1250, 220, 1.7]},
    ]},
    {head: 'رفع خطة المنهج والكتاب *PDF*', shots: [
      {screen: 'chat', dur: 2.6, caption: 'اضغطي على زر إرفاق الملفات', to: [445, 900], click: true, zoom: [700, 800, 1.6]},
      {screen: 'attach', dur: 2.4, caption: 'اختاري Upload files', to: [600, 490], click: true, zoom: [700, 600, 1.6]},
      {screen: 'uploaded', dur: 2.6, caption: 'تأكدي من ظهور الملفات في المحادثة', to: [900, 700], zoom: [960, 700, 1.5]},
      {screen: 'prompt', dur: 5, caption: 'اكتبي التعليمات لـ Claude', type: PROMPT, to: [1460, 880], click: true, zoom: [960, 760, 1.5]},
    ]},
    {head: 'جدولة التحضير *الأسبوعي*', shots: [
      {screen: 'app', dur: 2.4, caption: 'من القائمة الجانبية اختاري Scheduled', to: [160, 420], click: true, zoom: [420, 450, 1.8]},
      {screen: 'scheduled', dur: 2.6, caption: 'اضغطي New task', to: [965, 510], click: true, zoom: [965, 450, 1.6]},
      {screen: 'newTask', dur: 2.6, caption: 'اختاري طريقة الإعداد', to: [850, 355], click: true, zoom: [880, 450, 1.4]},
      {screen: 'repeat', dur: 3.2, caption: 'اختاري Weekly وحددي يوم الأحد والساعة', to: [530, 485], click: true, zoom: [820, 500, 1.4]},
      {screen: 'details', dur: 4.4, caption: 'اكتبي التعليمات لـ Claude', type: TASK, to: [880, 600], zoom: [880, 520, 1.4]},
      {screen: 'review', dur: 3, caption: 'راجعي التفاصيل واضغطي Save task', to: [880, 795], click: true, zoom: [880, 560, 1.4]},
    ]},
  ],
  final: {image: 'ainews/ep05/notification.jpg', head: 'وكل أحد *يوصلك* الإشعار', dur: 4.5},
  outro: {dur: 10, word: 'تحضير'},
};
