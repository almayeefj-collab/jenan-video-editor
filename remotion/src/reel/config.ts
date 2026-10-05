// إعدادات ريل «مستقبل التعليم بكلمة» — المؤتمر التربوي السادس والأربعون
// كل الأوقات بالثواني، والمسارات نسبة لمجلد public/

export type Brand = {
  navy: string; // أعلى التدرج الكحلي
  navyDark: string; // أسفل التدرج الكحلي
  gold: string; // النصوص الذهبية
  goldDeep: string; // الذهبي الغامق (حدود وتفاصيل)
  skyText: string; // النص الإنجليزي الأزرق الفاتح
  text: string;
  bar: string; // الشريط المتدرج أسفل التصاميم
};

// الهوية البصرية لحساب جمعية المعلمين الكويتية (مأخوذة من بوستات الحساب)
export const brand: Brand = {
  navy: '#133E75',
  navyDark: '#091C3A',
  gold: '#E9C893',
  goldDeep: '#E0A851',
  skyText: '#9FBDE3',
  text: '#FFFFFF',
  bar: 'linear-gradient(90deg, #E0A851 0%, #2C8AD0 55%, #205E97 100%)',
};

export type Overlay =
  | {kind: 'title'; text: string; sub?: string}
  // full: يطلع كبير في النص ثم يستقر عند (y, scale) — docked: ثابت عند (y, scale)
  // inline: يطلع بموشن عند (y, scale) ويبقى مكانه. y = مركز الكرت بالبكسل
  // hide: [من، إلى] بالثواني — الكرت ينزل ويختفي (عشان يطلع اسم المتحدث بنفس المكان) ثم يرجع
  // exitAt: ثانية خروج الكرت (ينزل ويختفي) في آخر لقطة من مجموعة السؤال
  | {kind: 'question'; text: string; label: string; mode: 'full' | 'docked' | 'inline'; y: number; scale: number; at?: number; hide?: [number, number]; exitAt?: number}
  | {kind: 'lowerThird'; name: string; role?: string; at: number; dur: number; bottom: number}
  | {kind: 'outro'; logo?: string};

export type Shot = {
  src: string;
  from: number;
  to: number;
  volume: number;
  overlays?: Overlay[];
  // الانتقال قبل هالشوت (من الشوت اللي قبله)
  enter?: 'cut' | 'fade' | 'wipe';
  // تدرج لوني سينمائي + zoom بطيء
  grade?: boolean;
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TRANSITION = {fade: 12, wipe: 16} as const;
export const LOGO = 'brand/kts-logo.png';

const B = 0.25; // صوت لقطات الأجواء
const V = 1; // صوت المقابلات

const Q1 = 'لو قلت لك مستقبل التعليم في الكويت، عطنا كلمة وحدة بس';
const Q2 = 'شنو المختلف هالسنة عن النسخ السابقة؟';
const Q1_TITLE = 'مستقبل التعليم بكلمة';
const Q3_TITLE = 'رسالة للمعلمين';
const Q3 = 'إذا عندك رسالة مباشرة للمعلمين والمعلمات بالكويت، شتقول لهم؟';

// أماكن الكروت مختارة عشان ما تغطي وجه ولا يد ولا صورة سمو الأمير.
// المقابلات تنعرض بطولها الكامل بدون قص.
// منطقة الكروت: تحت الأيادي وفوق منطقة كابشن إنستغرام — ما تغطي وجه ولا يد
const LOW = {y: 1590, scale: 0.52};
const LT_BOTTOM = 255; // اسم المتحدث بنفس المنطقة، والسؤال ينزل يفسح له المكان

export const shots: Shot[] = [
  // ── ١) الانترو: مقتطفات الناس يمشون (ghosting) ثم اللقطة من فوق + سؤال الرئيس ──
  {src: 'footage/exterior-ghost.mp4', from: 0.2, to: 2.6, volume: 0},
  {src: 'footage/lobby-entrance-ghost.mp4', from: 0, to: 2.2, volume: 0, enter: 'cut'},
  {src: 'footage/lobby-walkway-ghost.mp4', from: 0.5, to: 2.3, volume: 0, enter: 'cut'},
  {src: 'footage/lobby-overhead.mp4', from: 0, to: 8, volume: 0, enter: 'cut',
    overlays: [{kind: 'question', label: 'السؤال', text: Q2, mode: 'full', ...LOW, at: 2.3}]},

  // ── ٢) رئيس الجمعية ──
  {src: 'footage/q2-glasses.mp4', from: 0, to: 49.2, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'question', label: 'السؤال', text: Q2, mode: 'docked', ...LOW, hide: [9.2, 15.8], exitAt: 48.5},
      {kind: 'lowerThird', name: 'أ. حمد الهولي', role: 'رئيس جمعية المعلمين الكويتية', at: 9.5, dur: 6, bottom: LT_BOTTOM},
    ]},

  // ── ٣) اللوبي + مستقبل التعليم بكلمة ──
  {src: 'footage/lobby-hospitality.mp4', from: 0.6, to: 5, volume: B, enter: 'wipe',
    overlays: [{kind: 'question', label: Q1_TITLE, text: Q1, mode: 'full', ...LOW}]},
  {src: 'footage/q1-pink.mp4', from: 0, to: 3.4, volume: V, enter: 'cut',
    overlays: [{kind: 'question', label: Q1_TITLE, text: Q1, mode: 'docked', ...LOW}]},
  {src: 'footage/q1-ghutra.mp4', from: 0, to: 9, volume: V, enter: 'cut',
    overlays: [{kind: 'question', label: Q1_TITLE, text: Q1, mode: 'docked', ...LOW, exitAt: 8.4}]},

  // ── ٤) رسالة للمعلمين: المذيعة تسأل (صورة سمو الأمير فوق، فالكرت تحت وجهها) ثم المعلمة ──
  {src: 'footage/presenter.mp4', from: 0, to: 6.5, volume: V, enter: 'wipe',
    overlays: [{kind: 'question', label: Q3_TITLE, text: Q3, mode: 'inline', y: 1580, scale: 0.6}]},
  {src: 'footage/q3-brown-b.mp4', from: 0, to: 13.5, volume: V, enter: 'cut',
    overlays: [
      {kind: 'question', label: Q3_TITLE, text: Q3, mode: 'docked', y: 1580, scale: 0.6, hide: [0.6, 7.4], exitAt: 12.8},
      {kind: 'lowerThird', name: 'أ. غدير الناشي', role: 'عضو مجلس إدارة جمعية المعلمين الكويتية', at: 1, dur: 6, bottom: LT_BOTTOM},
    ]},

  // ── ٥) الأوترو: المبنى بالدرون (بدون صوته) والشعار في النص ──
  {src: 'footage/building-drone.mp4', from: 0, to: 9, volume: 0, enter: 'wipe', grade: true,
    overlays: [{kind: 'outro', logo: LOGO}]},
];

// الانترو: عنوان «المؤتمر التربوي» ثم عداد لين 46 فوق مقتطفات الناس
export const INTRO_LOCKUP_FRAMES = Math.round(8.6 * 30);

export const shotFrames = (s: Shot) => Math.round((s.to - s.from) * FPS);
export const enterFrames = (s: Shot, i: number) =>
  i === 0 || !s.enter || s.enter === 'cut' ? 0 : TRANSITION[s.enter];

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
