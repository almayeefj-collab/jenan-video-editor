// إعدادات ريل «مستقبل التعليم بكلمة» — المؤتمر التربوي السادس والأربعون
// كل الأوقات بالثواني، والمسارات نسبة لمجلد public/

export type Brand = {
  primary: string;
  primaryDark: string;
  light: string;
  accent: string;
  text: string;
};

// ⚠️ ألوان مأخوذة مؤقتاً من ملف خطة المحتوى — تتبدل بالهوية البصرية المعتمدة
export const brand: Brand = {
  primary: '#2E5E8E',
  primaryDark: '#1B3A5C',
  light: '#E7EFF8',
  accent: '#C08A4A',
  text: '#FFFFFF',
};

export type Overlay =
  | {kind: 'counter'; to: number; caption: string}
  | {kind: 'title'; text: string; sub?: string}
  | {kind: 'question'; text: string; label: string; docked?: boolean}
  | {kind: 'lowerThird'; name: string; role?: string; at: number; dur: number}
  | {kind: 'outro'; text: string; logo: string};

export type Shot = {
  src: string;
  from: number;
  to: number;
  volume: number;
  overlays?: Overlay[];
  // الانتقال قبل هالشوت (من الشوت اللي قبله)
  enter?: 'cut' | 'fade' | 'wipe';
};

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const TRANSITION = {fade: 12, wipe: 26} as const;
export const LOGO = 'brand/logo-placeholder.svg';

const B = 0.25; // صوت لقطات الأجواء
const V = 1; // صوت المقابلات

const Q1 = 'لو قلت لك مستقبل التعليم في الكويت، عطنا كلمة وحدة بس';
const Q2 = 'شنو المختلف هالسنة عن النسخ السابقة؟';
const Q3 = 'إذا عندك رسالة مباشرة للمعلمين والمعلمات بالكويت، شتقول لهم؟';

export const shots: Shot[] = [
  // ── الانترو: المبنى ← اللوبي ──
  {src: 'footage/exterior.mp4', from: 0, to: 3.6, volume: B,
    overlays: [{kind: 'counter', to: 46, caption: 'المؤتمر التربوي'}]},
  {src: 'footage/lobby-entrance.mp4', from: 0, to: 2.2, volume: B, enter: 'fade'},
  {src: 'footage/lobby-walkway.mp4', from: 0.5, to: 2.6, volume: B, enter: 'cut'},
  {src: 'footage/lobby-crowd.mp4', from: 2, to: 6, volume: B, enter: 'cut',
    overlays: [{kind: 'title', text: 'مستقبل التعليم بكلمة', sub: 'سألنا المعلمين…'}]},

  // ── رئيس الجمعية ──
  {src: 'footage/q2-glasses.mp4', from: 0, to: 49, volume: V, enter: 'wipe',
    overlays: [
      {kind: 'question', label: 'السؤال', text: Q2},
      {kind: 'lowerThird', name: 'رئيس جمعية المعلمين الكويتية', at: 9.5, dur: 5},
    ]},

  // ── مستقبل التعليم بكلمة ──
  {src: 'footage/lobby-hospitality.mp4', from: 0, to: 4.4, volume: B, enter: 'wipe',
    overlays: [{kind: 'question', label: 'السؤال', text: Q1}]},
  {src: 'footage/q1-pink.mp4', from: 0, to: 3.4, volume: V, enter: 'cut',
    overlays: [{kind: 'question', label: 'السؤال', text: Q1, docked: true}]},
  {src: 'footage/q1-ghutra.mp4', from: 0.8, to: 8.4, volume: V, enter: 'cut',
    overlays: [{kind: 'question', label: 'السؤال', text: Q1, docked: true}]},

  // ── رسالة للمعلمين ──
  {src: 'footage/presenter.mp4', from: 0, to: 6.5, volume: V, enter: 'wipe',
    overlays: [{kind: 'question', label: 'السؤال', text: Q3}]},
  {src: 'footage/q3-brown-a.mp4', from: 0.5, to: 15.5, volume: V, enter: 'cut',
    overlays: [{kind: 'question', label: 'السؤال', text: Q3, docked: true}]},
  {src: 'footage/q3-brown-b.mp4', from: 0, to: 12.4, volume: V, enter: 'cut',
    overlays: [{kind: 'question', label: 'السؤال', text: Q3, docked: true}]},

  // ── الأوترو ──
  {src: 'footage/hall.mp4', from: 2, to: 7.5, volume: B, enter: 'wipe',
    overlays: [{kind: 'outro', text: 'المؤتمر التربوي السادس والأربعون', logo: LOGO}]},
];

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
