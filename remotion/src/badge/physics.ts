import {BADGE, DURATION, FPS, T} from './config';

// مسار المؤشر: نقاط [فريم، x، y] بإحداثيات من -1 إلى 1 حول مركز الشارة
const CURSOR_KEYS: [number, number, number][] = [
  [T.cursorIn - 6, 1.35, 1.05],
  [T.cursorIn + 14, 0.62, 0.42],
  [T.cursorIn + 40, -0.58, -0.34],
  [T.cursorIn + 64, -0.66, 0.5],
  [T.cursorIn + 90, 0.5, -0.52],
  [T.cursorIn + 116, 0.18, 0.14],
  [T.cursorIn + 140, 0.02, 0.02],
  [DURATION + 10, 0, 0],
];

// Catmull-Rom: حركة يد طبيعية بدون زوايا حادة
const catmull = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
};

export const cursorAt = (frame: number): {x: number; y: number} => {
  const k = CURSOR_KEYS;
  if (frame <= k[0][0]) return {x: k[0][1], y: k[0][2]};
  for (let i = 0; i < k.length - 1; i++) {
    if (frame <= k[i + 1][0]) {
      const a = k[Math.max(0, i - 1)];
      const b = k[i];
      const c = k[i + 1];
      const d = k[Math.min(k.length - 1, i + 2)];
      const raw = (frame - b[0]) / (c[0] - b[0]);
      const t = raw * raw * (3 - 2 * raw); // تسارع وتباطؤ ناعم
      return {x: catmull(a[1], b[1], c[1], d[1], t), y: catmull(a[2], b[2], c[2], d[2], t)};
    }
  }
  const last = k[k.length - 1];
  return {x: last[1], y: last[2]};
};

// تأثير المؤشر يدخل تدريجياً عشان الشارة ما تنتفض أول ما يظهر
const influence = (frame: number) => {
  const t = Math.min(1, Math.max(0, (frame - T.cursorIn + 4) / 22));
  return t * t * (3 - 2 * t);
};

export type TiltState = {rx: number; ry: number; vx: number; vy: number};

// جسم صلب يدور حول مركزه بنابض مخمّد حرجياً (critically damped):
// يوصل للزاوية المطلوبة بأسرع وقت بدون ما يتعداها، يعني بدون نطّ.
// عزم = k·(الهدف − الزاوية) − c·السرعة الزاوية، و c = 2·√(k·I)
const OMEGA = 2 * Math.PI * 1.9; // سرعة الاستجابة (هرتز)
const DAMPING_RATIO = 1.0;
const SUBSTEPS = 8;

const simulate = (): TiltState[] => {
  const out: TiltState[] = [];
  let rx = 0;
  let ry = 0;
  let vx = 0;
  let vy = 0;
  const dt = 1 / FPS / SUBSTEPS;
  for (let f = 0; f <= DURATION; f++) {
    for (let s = 0; s < SUBSTEPS; s++) {
      const ft = f + s / SUBSTEPS;
      const c = cursorAt(ft);
      const inf = influence(ft);
      // الوجه يلتفت للمؤشر: يمين ← rotateY موجب، تحت ← rotateX سالب
      const ty = c.x * BADGE.maxTilt * inf;
      const tx = -c.y * BADGE.maxTilt * inf;
      const ax = OMEGA * OMEGA * (tx - rx) - 2 * DAMPING_RATIO * OMEGA * vx;
      const ay = OMEGA * OMEGA * (ty - ry) - 2 * DAMPING_RATIO * OMEGA * vy;
      // تكامل semi-implicit Euler: ثابت ودقيق كفاية بهالخطوة الصغيرة
      vx += ax * dt;
      vy += ay * dt;
      rx += vx * dt;
      ry += vy * dt;
    }
    out.push({rx, ry, vx, vy});
  }
  return out;
};

const TRACK = simulate();

export const tiltAt = (frame: number): TiltState => TRACK[Math.max(0, Math.min(TRACK.length - 1, Math.round(frame)))];
