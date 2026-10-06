// مونتاج «جهود اللجنة المنظمة» — المؤتمر التربوي السادس والأربعون
// الترتيب: المذيعة برا المبنى ← المذيعة نازلة بالسلم المتحرك ← مقتطفات من شغل اللجنة
// (قطعات على إيقاع الموسيقى) ← فيديو التكريم ← الشعار.
// كل الأوقات بالثواني، والمسارات نسبة لمجلد public/

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// الموسيقى 90 BPM = ضربة كل 20 فريم بالضبط، فالقطعات تطيح على الإيقاع
export const BPM = 90;
export const BEAT = (60 / BPM) * FPS;

export type Enter = 'cut' | 'zoom' | 'whip' | 'flash';
export const TRANSITION: Record<Exclude<Enter, 'cut'>, number> = {zoom: 14, whip: 10, flash: 10};

export type Overlay =
  | {kind: 'title'; text: string; sub?: string; at: number; dur: number}
  | {kind: 'lowerThird'; name: string; role?: string; at: number; dur: number}
  | {kind: 'outro'};

export type Shot = {
  src: string;
  from: number;
  // to: نهاية اللقطة بالثواني (لقطات الكلام)، أو beats: طولها بعدد الضربات (المقتطفات)
  to?: number;
  beats?: number;
  rate?: number;
  volume?: number;
  enter?: Enter;
  grade?: boolean;
  overlays?: Overlay[];
};

const F = 'footage/montage/';

export const shots: Shot[] = [
  // ── ١) المذيعة تتكلم للكاميرا برا المبنى، ثم وهي نازلة بالسلم المتحرك (صوتها منظف من الهوا) ──
  {src: F + 'm0102-clean.mp4', from: 0.35, to: 4.9, volume: 1},
  {src: F + 'm0105-clean.mp4', from: 0.25, to: 3.9, volume: 1, enter: 'zoom'},

  // ── ٢) العنوان فوق لقطة البهو من السلم ثم مقتطفات الشغل على الإيقاع ──
  {src: F + 'm0107.mp4', from: 0.2, beats: 6, enter: 'flash', grade: true,
    overlays: [{kind: 'title', text: 'جهود اللجنة المنظمة', sub: 'المؤتمر التربوي السادس والأربعون', at: 0.3, dur: 3.5}]},
  {src: F + 'm0092.mp4', from: 0, beats: 2, enter: 'whip'},
  {src: F + 'm0078.mp4', from: 0.2, beats: 2},
  {src: F + 'm0044.mp4', from: 0, beats: 2, enter: 'flash'},
  {src: F + 'm0047.mp4', from: 0.2, beats: 2},
  {src: F + 'm0085.mp4', from: 6.6, beats: 2, enter: 'whip'},
  {src: F + 'm0048.mp4', from: 0.7, beats: 2},
  {src: F + 'm0058.mp4', from: 0, beats: 2, enter: 'zoom'},
  {src: F + 'm0063.mp4', from: 0.2, beats: 2},
  {src: F + 'm0054.mp4', from: 1.0, beats: 2, enter: 'whip'},
  {src: F + 'm0086.mp4', from: 0, beats: 2},
  {src: F + 'm0046.mp4', from: 3.4, beats: 2, enter: 'flash'},
  {src: F + 'm0090.mp4', from: 0.3, beats: 2},
  {src: F + 'm0087.mp4', from: 3.2, beats: 2, enter: 'whip'},
  {src: F + 'm0045.mp4', from: 0.5, beats: 2},
  {src: F + 'm0063.mp4', from: 5.0, beats: 2, enter: 'zoom'},
  {src: F + 'm0051.mp4', from: 0.4, beats: 3},

  // ── ٣) التكريم: الكل واقفين، ثم نفس اللقطة تبطى والشعار يدخل ──
  {src: F + 'm0075.mp4', from: 0.2, to: 9, enter: 'flash', grade: true,
    overlays: [{kind: 'lowerThird', name: 'تكريم اللجنة المنظمة', role: 'المؤتمر التربوي السادس والأربعون', at: 0.8, dur: 5}]},
  {src: F + 'm0075.mp4', from: 9, to: 13.3, rate: 0.75, grade: true, overlays: [{kind: 'outro'}]},
];

export const LOGO = 'brand/kts-logo.png';

export const enterFrames = (s: Shot, i: number) => (i === 0 || !s.enter || s.enter === 'cut' ? 0 : TRANSITION[s.enter]);

// لقطات الإيقاع: الانتقال يخلص على الضربة بالضبط، فطولها = الضربات + طول انتقالها
export const shotFrames = (s: Shot, i: number) =>
  s.beats !== undefined ? s.beats * BEAT + enterFrames(s, i) : Math.round(((s.to ?? s.from) - s.from) / (s.rate ?? 1) * FPS);

export const timeline = () => {
  let t = 0;
  return shots.map((shot, i) => {
    const enter = enterFrames(shot, i);
    t -= enter;
    const start = t;
    const frames = shotFrames(shot, i);
    t += frames;
    return {shot, start, frames, enter};
  });
};

export const totalFrames = () => {
  const tl = timeline();
  const last = tl[tl.length - 1];
  return last.start + last.frames;
};

// بداية الإيقاع = أول لقطة بالضربات (لحظة الـ drop بعد كلام المذيعة)
export const beatStart = () => {
  const tl = timeline();
  const first = tl.find((t) => t.shot.beats !== undefined)!;
  return first.start + first.enter;
};
// بداية التكريم والأوترو
export const honorStart = () => timeline()[shots.length - 2].start;
export const outroStart = () => timeline()[shots.length - 1].start;
