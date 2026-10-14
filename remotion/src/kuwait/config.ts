// فيديو «السلطات العامة في نظام الحكم بدولة الكويت» مع تركيز على السلطة التنفيذية
// المحتوى مأخوذ من نصوص دستور دولة الكويت 1962 (أرقام المواد مذكورة في كل مشهد)
// موشن جرافيك بالكامل: بدون صور، كل العناصر مرسومة بالكود

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TRANSITION = 18;

// ألوان علم الكويت معدّلة لتبرز على خلفية داكنة
export const GREEN = '#22B573';
export const RED = '#E5484D';
export const GOLD = '#E3B964';
export const INK = '#05080F';
export const NAVY = '#0E1A2E';

export type SceneKind =
  | 'intro'
  | 'article6'
  | 'article50'
  | 'pillars'
  | 'chapter'
  | 'structure'
  | 'emir'
  | 'powers'
  | 'formation'
  | 'council'
  | 'accountability'
  | 'outro';

export const scenes: {kind: SceneKind; sec: number}[] = [
  {kind: 'intro', sec: 7.5},
  {kind: 'article6', sec: 9},
  {kind: 'article50', sec: 10},
  {kind: 'pillars', sec: 15},
  {kind: 'chapter', sec: 5},
  {kind: 'structure', sec: 12},
  {kind: 'emir', sec: 12},
  {kind: 'powers', sec: 15},
  {kind: 'formation', sec: 13},
  {kind: 'council', sec: 14},
  {kind: 'accountability', sec: 15},
  {kind: 'outro', sec: 10},
];

export const sceneFrames = (s: {sec: number}) => Math.round(s.sec * FPS);

// بداية كل مشهد بعد احتساب تداخل الانتقالات
export const timeline = () => {
  let t = 0;
  return scenes.map((s, i) => {
    if (i > 0) t -= TRANSITION;
    const start = t;
    t += sceneFrames(s);
    return {scene: s, start, frames: sceneFrames(s)};
  });
};

export const totalFrames = () => {
  const tl = timeline();
  const last = tl[tl.length - 1];
  return last.start + last.frames;
};
