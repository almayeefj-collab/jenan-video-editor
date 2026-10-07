// ريل جلسات وورش المؤتمر التربوي السادس والأربعين
// كل الأوقات بالثواني، والمسارات نسبة لمجلد public/

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const LOGO = 'brand/kts-logo.png';
export const MUSIC = 'music/orchestral.wav';

// عنوان الانترو — يتغير من props الكومبوزيشن
export const DEFAULT_TITLE = 'مقتطفات من الورش التدريبية';

// انتقالات هادية: dissolve ناعم، أو zoom خفيف مع blur
export const TRANSITION = {fade: 14, soft: 18} as const;

export type Overlay =
  // كبسولة عنوان الجلسة: النوع (دراسة/ورشة/محاضرة) + العنوان يُكتب كلمة كلمة مع صوت كيبورد
  | {kind: 'session'; label: string; title: string; sub?: string; at?: number; dur?: number}
  // شريط صغير ثابت باسم الجلسة أثناء كلام المحاضر
  | {kind: 'caption'; text: string; at?: number}
  // اسم المحاضر ومنصبه
  | {kind: 'presenter'; name: string; role?: string; at?: number; dur?: number}
  // قائمة المشاركين في حلقة نقاشية
  | {kind: 'panel'; heading: string; members: {name: string; role: string}[]; at?: number; dur?: number}
  | {kind: 'outro'};

export type Shot = {
  src: string;
  photo?: boolean;
  from?: number;
  to?: number; // للفيديو
  dur?: number; // للصور
  rate?: number; // سلو موشن
  volume?: number; // 1 = صوت المحاضر
  // zoom-in بطيء (Ken Burns / push-in) — origin = مكان المحاضر في الكادر
  zoom?: [number, number];
  origin?: string;
  pan?: [number, number]; // إزاحة أفقية بالبكسل للصور
  enter?: 'cut' | 'fade' | 'soft';
  overlays?: Overlay[];
};

const SPEECH = 1;
const F = 'footage/sessions/';

// مقتطفات الورش بالترتيب (بدون فواصل الأيام): كل ورشة تبدأ بعنوانها ثم كلام المحاضر
const sessions: Shot[] = [
  // ── حلقة نقاشية «رؤى ابتكارية لمستقبل تعليمي مستدام» ──
  // اللقطة العامة للمنصة سلو موشن مع عنوان الحلقة
  {src: F + 'day1-wide.mp4', from: 0, to: 2.8, rate: 0.6, zoom: [1.0, 1.1], origin: '50% 45%', enter: 'soft',
    overlays: [{kind: 'session', label: 'حلقة نقاشية', title: 'رؤى ابتكارية لمستقبل تعليمي مستدام', sub: 'رئيس الجلسة: أ. ضاري البليهيس', at: 0.2}]},
  // المشاركين واحد واحد: لقطة قريبة سلو موشن لكل واحد من اللقطة العامة، وقائمة الأسماء فوقهم
  {src: F + 'day1-right.mp4', from: 0, to: 2.0, zoom: [1.0, 1.06], origin: '50% 40%', enter: 'cut',
    overlays: [{kind: 'panel', heading: 'المشاركون', at: 0.3, dur: 5.6, members: [
      {name: 'م. حمد الحمد', role: 'الوكيل المساعد للتعليم العام'},
      {name: 'أ.د. آدم الملا', role: 'المندوب الدائم السابق لدولة الكويت لدى منظمة الأمم المتحدة للتربية والعلم والثقافة (اليونسكو)'},
      {name: 'أ.د. فايز الظفيري', role: 'مدير وأمين عام جامعة الكويت سابقاً'},
    ]}]},
  {src: F + 'day1-mid.mp4', from: 0, to: 2.0, zoom: [1.06, 1.0], origin: '50% 40%', enter: 'cut'},
  {src: F + 'day1-left.mp4', from: 0, to: 2.0, zoom: [1.0, 1.06], origin: '50% 40%', enter: 'cut'},
  {src: F + 'day1-speaker.mp4', from: 0, to: 6.6, volume: SPEECH, zoom: [1.0, 1.1], origin: '50% 30%', enter: 'soft',
    overlays: [{kind: 'caption', text: 'رؤى ابتكارية لمستقبل تعليمي مستدام', at: 0.5}]},
  // ── ورشة «تطور التعليم من التقليدي إلى الرقمي…» — أ. محمد الأيوب ──
  {src: F + 'day2-ai.mp4', from: 1.3, to: 9.0, volume: SPEECH, zoom: [1.05, 1.3], origin: '45% 52%', enter: 'soft',
    overlays: [
      {kind: 'session', label: 'ورشة', title: 'تطور التعليم من التقليدي إلى الرقمي وتطبيقات الذكاء الاصطناعي في تحسين التعليم والتعلم', dur: 4.6},
      {kind: 'presenter', name: 'أ. محمد الأيوب', role: 'باحث بالمركز العربي للبحوث التربوية لدول الخليج', at: 4.5, dur: 3.2},
    ]},
  // ورشة «البحث الإجرائي مدخل تطوير العملية التعليمية» — د. موسى جعفر يوسف
  {src: F + 'research-stage.jpg', photo: true, dur: 3.4, zoom: [1.12, 1.0], origin: '40% 45%', enter: 'soft',
    overlays: [{kind: 'session', label: 'ورشة', title: 'البحث الإجرائي مدخل تطوير العملية التعليمية'}]},
  {src: F + 'research.mp4', from: 13.4, to: 21.1, volume: SPEECH, zoom: [1.3, 1.5], origin: '45% 48%', enter: 'cut',
    overlays: [{kind: 'presenter', name: 'د. موسى جعفر يوسف', role: 'أستاذ الدراسات التربوية المساعد – مملكة البحرين', at: 0.5, dur: 4.5}]},
  // محاضرة «تصور إداري مقترح لتطوير أداء القادة التربويين…» — أ.د. محمد الحراحشة
  {src: F + 'day2-leadership.mp4', from: 4.1, to: 13.35, volume: SPEECH, zoom: [1.05, 1.3], origin: '58% 42%', enter: 'soft',
    overlays: [
      {kind: 'session', label: 'محاضرة', title: 'تصور إداري مقترح لتطوير أداء القادة التربويين في ضوء أنموذج القيادة الاحتوائية', dur: 4.8},
      {kind: 'presenter', name: 'أ.د. محمد الحراحشة', role: 'أستاذ – كلية العلوم التربوية – جامعة آل البيت – المملكة الأردنية الهاشمية', at: 4.8, dur: 4.0},
    ]},
  // ورشة «مستوى جودة البرامج التدريبية…» — د. عبدالله العازمي، وبعدها لحظة التكريم
  {src: F + 'day2-quality.mp4', from: 2.34, to: 11.42, volume: SPEECH, zoom: [1.05, 1.25], origin: '60% 38%', enter: 'soft',
    overlays: [
      {kind: 'session', label: 'ورشة', title: 'مستوى جودة البرامج التدريبية المقدمة من جمعية المعلمين الكويتية للمعلمين في ضوء بعض المعايير العالمية', dur: 4.8},
      {kind: 'presenter', name: 'د. عبدالله العازمي', role: 'معلم في وزارة التربية', at: 4.8, dur: 4.0},
    ]},
  {src: F + 'day2-quality-honor.mp4', from: 3.6, to: 7.8, volume: 0, zoom: [1.0, 1.1], origin: '50% 40%', enter: 'cut'},
  // ── ورشة «التحفيز القيادي وأثره على جودة الأداء» — أ. صالح العجيل ──
  {src: F + 'workshop-wide.jpg', photo: true, dur: 2.6, zoom: [1.0, 1.1], origin: '45% 60%', enter: 'soft',
    overlays: [{kind: 'session', label: 'ورشة', title: 'التحفيز القيادي وأثره على جودة الأداء', sub: 'أ. صالح العجيل · معلم ومدرب في مجال التعليم', dur: 6.9}]},
  {src: F + 'workshop-close-a.jpg', photo: true, dur: 2.2, zoom: [1.0, 1.1], origin: '50% 70%', enter: 'cut'},
  {src: F + 'workshop-close-b.jpg', photo: true, dur: 2.2, zoom: [1.1, 1.0], origin: '50% 75%', enter: 'cut'},
  {src: F + 'day3-motivation.mp4', from: 27.6, to: 34.8, volume: SPEECH, zoom: [1.0, 1.12], origin: '35% 45%', enter: 'soft',
    overlays: [{kind: 'presenter', name: 'أ. صالح العجيل', role: 'معلم ومدرب في مجال التعليم', at: 0.5, dur: 5}]},
  // محاضرة «حماية المعلم تبدأ بفهم اختلافه» — د. ناصر نجف حسن
  {src: F + 'study-slide.jpg', photo: true, dur: 3.0, zoom: [1.0, 1.12], origin: '55% 30%', enter: 'soft',
    overlays: [{kind: 'session', label: 'محاضرة', title: 'حماية المعلم تبدأ بفهم اختلافه', dur: 5.2}]},
  {src: F + 'day3-study-wide.mp4', from: 0, to: 2.4, volume: 0, zoom: [1.2, 1.35], origin: '45% 40%', enter: 'cut'},
  {src: F + 'study.mp4', from: 72.0, to: 81.4, volume: SPEECH, zoom: [1.35, 1.6], origin: '48% 50%', enter: 'cut',
    overlays: [{kind: 'presenter', name: 'د. ناصر نجف حسن', role: 'عضو هيئة تدريس – كلية التربية – جامعة الكويت', at: 0.5, dur: 5}]},
  // الحلقة النقاشية «مشاريع تعليمية ترسم ملامح المستقبل» (بدون صوت — موسيقى بس)
  {src: F + 'day3-panel.mp4', from: 0, to: 7.3, rate: 0.75, volume: 0, zoom: [1.0, 1.15], origin: '50% 40%', enter: 'soft',
    overlays: [
      {kind: 'session', label: 'حلقة نقاشية', title: 'مشاريع تعليمية ترسم ملامح المستقبل', dur: 3.8},
      {kind: 'panel', heading: 'المشاركون', at: 3.7, dur: 5.8, members: [
        {name: 'أ. خالد عبدالعزيز', role: 'مدير إدارة الشؤون التعليمية – منطقة حولي التعليمية – وزارة التربية'},
        {name: 'د. عائشة العازمي', role: 'أستاذ مشارك – كلية التربية – جامعة الكويت'},
        {name: 'أ. سهام الخالدي', role: 'مسؤول بروتوكول التعاون بين وزارة التربية وجمعية المعلمين الكويتية'},
        {name: 'د. بدور الصقعبي', role: 'كلية التربية الأساسية – الهيئة العامة للتعليم التطبيقي والتدريب'},
      ]},
    ]},
];


export const shots: Shot[] = [
  // ── الانترو: «مقتطفات من الورش التدريبية» ──
  {src: F + 'intro-escalator.mp4', from: 0, to: 2.1, rate: 0.7, zoom: [1.0, 1.08]},
  {src: F + 'hall-wide.mp4', from: 4, to: 7, zoom: [1.05, 1.15], origin: '50% 45%', enter: 'fade'},
  {src: F + 'room-crowd.mp4', from: 1, to: 4.2, zoom: [1.1, 1.0], enter: 'fade'},

  // ── مقتطفات الورش ──
  ...sessions,

  // ── الأوترو: اللوبي سلو موشن والشعار في النص ──
  {src: F + 'outro-lobby.mp4', from: 0, to: 4.6, rate: 0.6, zoom: [1.0, 1.12], enter: 'fade',
    overlays: [{kind: 'outro'}]},
];

// عنوان الانترو فوق أول ثلاث لقطات
export const INTRO_LOCKUP_FRAMES = Math.round(7.6 * FPS);

export const shotFrames = (s: Shot) =>
  Math.round((s.photo ? (s.dur as number) : ((s.to as number) - (s.from ?? 0)) / (s.rate ?? 1)) * FPS);
export const enterFrames = (s: Shot, i: number) => (i === 0 || !s.enter || s.enter === 'cut' ? 0 : TRANSITION[s.enter]);

// بداية كل شوت على الخط الزمني بعد احتساب تداخل الانتقالات
export const timeline = () => {
  let t = 0;
  return shots.map((s, i) => {
    t -= enterFrames(s, i);
    const start = t;
    t += shotFrames(s);
    return {shot: s, start, frames: shotFrames(s), enter: enterFrames(s, i)};
  });
};

export const totalFrames = () => {
  const tl = timeline();
  const last = tl[tl.length - 1];
  return last.start + last.frames;
};
