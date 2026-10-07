// ريل جلسات وورش المؤتمر التربوي السادس والأربعين
// كل الأوقات بالثواني، والمسارات نسبة لمجلد public/

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const LOGO = 'brand/kts-logo.png';
export const MUSIC = 'music/calm.wav';

// عنوان الانترو — يتغير من props الكومبوزيشن
export const DEFAULT_TITLE = 'الورش التدريبية في المؤتمر التربوي';

// انتقالات هادية: dissolve ناعم، أو zoom خفيف مع blur
export const TRANSITION = {fade: 14, soft: 18} as const;

export type Overlay =
  // كبسولة عنوان الجلسة: النوع (دراسة/ورشة/محاضرة) + العنوان يُكتب كلمة كلمة مع صوت كيبورد
  | {kind: 'session'; label: string; title: string; sub?: string; at?: number; dur?: number}
  // شريط صغير ثابت باسم الجلسة أثناء كلام المحاضر
  | {kind: 'caption'; text: string; at?: number}
  // مربع اليوم في بداية كل يوم
  | {kind: 'day'; index: number; label: string; weekday: string; date: number; month: string; dur?: number}
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

// الورش مرتبة حسب الأيام: كل يوم يبدأ بمربع اليوم فوق لقطة من نفس اليوم، بعدين ورشه
// backdrop: اللقطة اللي عليها مربع اليوم (dayDur = مدة المربع، والباقي للنصوص اللي بعده)
type Day = {label: string; weekday: string; date: number; backdrop: Shot; dayDur?: number; sessions: Shot[]};

// ورش محاضرة/دراسة: صورة أو لقطة عليها كبسولة العنوان، بعدها كلام المحاضر بزوم بطيء
// (الأمثلة تحت جاهزة تنحط في يومها لما توصل فيديوهات كل يوم)
export const sessionBank = {
  study: [
    {src: F + 'study-slide.jpg', photo: true, dur: 3.0, zoom: [1.0, 1.12], origin: '55% 30%', enter: 'soft',
      overlays: [{kind: 'session', label: 'دراسة', title: 'حماية المعلم تبدأ بفهم اختلافه', sub: 'د. ناصر نجف حسن · د. يوسف طلق العارضي'}]},
    {src: F + 'study.mp4', from: 72.0, to: 81.4, volume: SPEECH, zoom: [1.35, 1.6], origin: '48% 50%', enter: 'cut',
      overlays: [{kind: 'caption', text: 'حماية المعلم تبدأ بفهم اختلافه', at: 0.4}]},
  ],
  motivation: [
    {src: F + 'workshop-wide.jpg', photo: true, dur: 2.4, zoom: [1.0, 1.1], origin: '45% 60%', enter: 'soft',
      overlays: [{kind: 'session', label: 'ورشة', title: 'التحفيز القيادي وأثره على جودة الأداء', sub: 'إعداد وتقديم أ. صالح العجيل', dur: 6.6}]},
    {src: F + 'workshop-close-a.jpg', photo: true, dur: 2.2, zoom: [1.0, 1.1], origin: '50% 70%', enter: 'cut'},
    {src: F + 'workshop-close-b.jpg', photo: true, dur: 2.2, zoom: [1.1, 1.0], origin: '50% 75%', enter: 'cut'},
  ],
  leadership: [
    {src: F + 'leadership-hall.jpg', photo: true, dur: 2.6, zoom: [1.0, 1.1], origin: '65% 55%', enter: 'soft',
      overlays: [{kind: 'session', label: 'محاضرة', title: 'مفهوم القيادة وصفات القائد'}]},
    {src: F + 'leadership.mp4', from: 5.3, to: 11.8, volume: SPEECH, zoom: [1.35, 1.55], origin: '78% 58%', enter: 'cut',
      overlays: [{kind: 'caption', text: 'مفهوم القيادة وصفات القائد', at: 0.4}]},
  ],
  research: [
    {src: F + 'research-stage.jpg', photo: true, dur: 2.6, zoom: [1.12, 1.0], origin: '40% 45%', enter: 'soft',
      overlays: [{kind: 'session', label: 'محاضرة', title: 'البحث الإجرائي'}]},
    {src: F + 'research.mp4', from: 13.4, to: 21.1, volume: SPEECH, zoom: [1.3, 1.5], origin: '45% 48%', enter: 'cut',
      overlays: [{kind: 'caption', text: 'البحث الإجرائي', at: 0.4}]},
  ],
} satisfies Record<string, Shot[]>;

export const MONTH = 'أكتوبر 2026';

export const days: Day[] = [
  // ── اليوم الأول: حلقة نقاشية «رؤى ابتكارية لمستقبل تعليمي مستدام» ──
  {label: 'اليوم الأول', weekday: 'الأحد', date: 4, dayDur: 3.2,
    // اللقطة العامة للمنصة سلو موشن: مربع اليوم ثم عنوان الحلقة
    backdrop: {src: F + 'day1-wide.mp4', from: 0, to: 2.8, rate: 0.45, zoom: [1.0, 1.1], origin: '50% 45%',
      overlays: [{kind: 'session', label: 'حلقة نقاشية', title: 'رؤى ابتكارية لمستقبل تعليمي مستدام', sub: 'رئيس الجلسة: أ. ضاري البليهيس', at: 3.0}]},
    sessions: [
      {src: F + 'day1-speaker.mp4', from: 0, to: 6.6, volume: SPEECH, zoom: [1.0, 1.1], origin: '50% 30%', enter: 'cut',
        overlays: [{kind: 'panel', heading: 'المشاركون', at: 0.5, dur: 5.4, members: [
          {name: 'م. حمد الحمد', role: 'الوكيل المساعد للتعليم العام'},
          {name: 'أ.د. آدم الملا', role: 'المندوب الدائم السابق لدولة الكويت لدى منظمة الأمم المتحدة للتربية والعلم والثقافة (اليونسكو)'},
          {name: 'أ.د. فايز الظفيري', role: 'مدير وأمين عام جامعة الكويت سابقاً'},
        ]}]},
    ]},
  {label: 'اليوم الثاني', weekday: 'الاثنين', date: 5,
    backdrop: {src: F + 'room-crowd.mp4', from: 3.6, to: 7.0, zoom: [1.0, 1.12]},
    sessions: []},
  {label: 'اليوم الثالث', weekday: 'الثلاثاء', date: 6,
    backdrop: {src: F + 'podiums.mp4', from: 0.6, to: 4.0, volume: 0, zoom: [1.15, 1.3], origin: '40% 40%'},
    sessions: []},
];

const dayShots = (d: Day, i: number): Shot[] => [
  {...d.backdrop, enter: 'soft',
    overlays: [{kind: 'day', index: i, label: d.label, weekday: d.weekday, date: d.date, month: MONTH, dur: d.dayDur}, ...(d.backdrop.overlays ?? [])]},
  ...d.sessions,
];

export const shots: Shot[] = [
  // ── الانترو: «الورش التدريبية في المؤتمر التربوي» ثم عداد لين 46 ──
  {src: F + 'intro-escalator.mp4', from: 0, to: 2.1, rate: 0.7, zoom: [1.0, 1.08]},
  {src: F + 'hall-wide.mp4', from: 4, to: 7, zoom: [1.05, 1.15], origin: '50% 45%', enter: 'fade'},
  {src: F + 'room-crowd.mp4', from: 1, to: 4.2, zoom: [1.1, 1.0], enter: 'fade'},

  // ── الأيام بالترتيب ──
  ...days.flatMap(dayShots),

  // ── الأوترو: اللوبي سلو موشن والشعار في النص ──
  {src: F + 'outro-lobby.mp4', from: 0, to: 4.6, rate: 0.6, zoom: [1.0, 1.12], enter: 'fade',
    overlays: [{kind: 'outro'}]},
];

// العنوان + عداد 46 فوق أول ثلاث لقطات
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
