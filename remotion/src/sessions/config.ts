// ريل جلسات وورش المؤتمر التربوي السادس والأربعين
// كل الأوقات بالثواني، والمسارات نسبة لمجلد public/

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const LOGO = 'brand/kts-logo.png';
export const MUSIC = 'music/calm.wav';

// العنوان الرئيسي — يتغير من props الكومبوزيشن
export const DEFAULT_TITLE = 'جلسات وورش المؤتمر';

// انتقالات هادية: dissolve ناعم، أو zoom خفيف مع blur
export const TRANSITION = {fade: 14, soft: 18} as const;

export type Overlay =
  // كبسولة عنوان الجلسة: النوع (دراسة/ورشة/محاضرة) + العنوان يُكتب كلمة كلمة مع صوت كيبورد
  | {kind: 'session'; label: string; title: string; sub?: string; at?: number; dur?: number}
  // شريط صغير ثابت باسم الجلسة أثناء كلام المحاضر
  | {kind: 'caption'; text: string; at?: number}
  // انفوجرافيك: كروت أرقام بعداد
  | {kind: 'stats'; items: {value: number; prefix?: string; unit: string; label: string}[]; at?: number}
  | {kind: 'mainTitle'; at?: number}
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

export const shots: Shot[] = [
  // ── ١) الانترو: السلم الكهربائي سلو موشن + «المؤتمر التربوي» وعداد لين 46 ──
  {src: 'footage/sessions/intro-escalator.mp4', from: 0, to: 2.1, rate: 0.7, zoom: [1.0, 1.08]},
  {src: 'footage/sessions/hall-wide.mp4', from: 4, to: 7, zoom: [1.05, 1.15], origin: '50% 45%', enter: 'fade'},
  {src: 'footage/sessions/room-crowd.mp4', from: 1, to: 3.6, zoom: [1.1, 1.0], enter: 'fade'},

  // ── ٢) العنوان الرئيسي يُكتب + انفوجرافيك ──
  {src: 'footage/sessions/study-hall.jpg', photo: true, dur: 3.4, zoom: [1.12, 1.0], origin: '60% 55%', enter: 'soft',
    overlays: [{kind: 'mainTitle', at: 0.2}]},
  {src: 'footage/sessions/workshop-room.mp4', from: 0, to: 4.6, zoom: [1.0, 1.12], enter: 'fade',
    overlays: [{kind: 'stats', at: 0.3, items: [
      {value: 3, unit: 'أيام', label: '٤ – ٦ أكتوبر 2026'},
      {value: 46, unit: '', label: 'النسخة السادسة والأربعون'},
    ]}]},

  // ── ٣) دراسة: حماية المعلم تبدأ بفهم اختلافه ──
  {src: 'footage/sessions/study-slide.jpg', photo: true, dur: 3.0, zoom: [1.0, 1.12], origin: '55% 30%', enter: 'soft',
    overlays: [{kind: 'session', label: 'دراسة', title: 'حماية المعلم تبدأ بفهم اختلافه', sub: 'د. ناصر نجف حسن · د. يوسف طلق العارضي'}]},
  {src: 'footage/sessions/study.mp4', from: 72.0, to: 81.4, volume: SPEECH, zoom: [1.35, 1.6], origin: '48% 50%', enter: 'cut',
    overlays: [{kind: 'caption', text: 'حماية المعلم تبدأ بفهم اختلافه', at: 0.4}]},

  // ── ٤) ورشة: التحفيز القيادي وأثره على جودة الأداء ──
  {src: 'footage/sessions/workshop-wide.jpg', photo: true, dur: 2.4, zoom: [1.0, 1.1], origin: '45% 60%', enter: 'soft',
    overlays: [{kind: 'session', label: 'ورشة', title: 'التحفيز القيادي وأثره على جودة الأداء', sub: 'إعداد وتقديم أ. صالح العجيل', dur: 6.6}]},
  {src: 'footage/sessions/workshop-close-a.jpg', photo: true, dur: 2.2, zoom: [1.0, 1.1], origin: '50% 70%', enter: 'cut'},
  {src: 'footage/sessions/workshop-close-b.jpg', photo: true, dur: 2.2, zoom: [1.1, 1.0], origin: '50% 75%', enter: 'cut'},

  // ── ٥) محاضرة: مفهوم القيادة وصفات القائد ──
  {src: 'footage/sessions/leadership-hall.jpg', photo: true, dur: 2.6, zoom: [1.0, 1.1], origin: '65% 55%', enter: 'soft',
    overlays: [{kind: 'session', label: 'محاضرة', title: 'مفهوم القيادة وصفات القائد'}]},
  {src: 'footage/sessions/leadership.mp4', from: 5.3, to: 11.8, volume: SPEECH, zoom: [1.35, 1.55], origin: '78% 58%', enter: 'cut',
    overlays: [{kind: 'caption', text: 'مفهوم القيادة وصفات القائد', at: 0.4}]},

  // ── ٦) البحث الإجرائي ──
  {src: 'footage/sessions/research-stage.jpg', photo: true, dur: 2.6, zoom: [1.12, 1.0], origin: '40% 45%', enter: 'soft',
    overlays: [{kind: 'session', label: 'محاضرة', title: 'البحث الإجرائي'}]},
  {src: 'footage/sessions/research.mp4', from: 13.4, to: 21.1, volume: SPEECH, zoom: [1.3, 1.5], origin: '45% 48%', enter: 'cut',
    overlays: [{kind: 'caption', text: 'البحث الإجرائي', at: 0.4}]},

  // ── ٧) مونتاج ختامي سريع بقطعات وزوم ──
  {src: 'footage/sessions/podiums.mp4', from: 0.6, to: 2.6, volume: 0, zoom: [1.2, 1.35], origin: '40% 40%', enter: 'soft'},
  {src: 'footage/sessions/room-crowd.mp4', from: 4.0, to: 6.0, zoom: [1.0, 1.15], enter: 'cut'},
  {src: 'footage/sessions/hall-wide.mp4', from: 12, to: 14.2, zoom: [1.15, 1.3], origin: '50% 45%', enter: 'cut'},

  // ── ٨) الأوترو: اللوبي سلو موشن والشعار في النص ──
  {src: 'footage/sessions/outro-lobby.mp4', from: 0, to: 4.6, rate: 0.6, zoom: [1.0, 1.12], enter: 'fade',
    overlays: [{kind: 'outro'}]},
];

// «المؤتمر التربوي» + عداد 46 فوق أول ثلاث لقطات
export const INTRO_LOCKUP_FRAMES = Math.round(7.2 * FPS);

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
