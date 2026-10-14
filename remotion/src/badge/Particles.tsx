import {random} from 'remotion';
import {BADGE, FPS} from './config';

// جزيئات الذهب: انفجار لحظة الفتح بفيزياء حقيقية (سرعة ابتدائية + مقاومة هواء + جاذبية)،
// ورقائق تلمع وهي تتقلب، وغبار ذهبي يطلع ببطء طول المقطع.

const PALETTE = ['#FFF6D8', '#FBE3A0', '#F2C766', '#E2B451', '#C8902E', '#FFD983'];

type Burst = {
  angle: number;
  speed: number;
  drag: number;
  life: number;
  size: number;
  kind: 'flake' | 'dot' | 'star';
  color: string;
  spin: number;
  flip: number;
  phase: number;
  delay: number;
};

const make = (seed: string, n: number, speedMin: number, speedMax: number): Burst[] =>
  Array.from({length: n}, (_, i) => {
    const r = (k: string) => random(`${seed}-${i}-${k}`);
    const kindRoll = r('kind');
    return {
      // ميلان بسيط لفوق عشان الانفجار يحس احتفالي
      angle: r('a') * Math.PI * 2,
      speed: speedMin + Math.pow(r('s'), 0.7) * (speedMax - speedMin),
      drag: 1.6 + r('d') * 1.6,
      life: 1.4 + r('l') * 1.6,
      size: kindRoll < 0.55 ? 7 + r('z') * 9 : kindRoll < 0.85 ? 3 + r('z') * 5 : 12 + r('z') * 12,
      kind: kindRoll < 0.55 ? 'flake' : kindRoll < 0.85 ? 'dot' : 'star',
      color: PALETTE[Math.floor(r('c') * PALETTE.length)],
      spin: (r('sp') - 0.5) * 900,
      flip: 4 + r('f') * 10,
      phase: r('p') * Math.PI * 2,
      delay: r('del') * 0.08,
    };
  });

const MAIN = make('burst', 170, 500, 1900);
const SECOND = make('burst2', 70, 300, 1100);
const GRAVITY = 820; // بكسل/ث²

const BurstLayer: React.FC<{frame: number; at: number; parts: Burst[]; origin: {x: number; y: number}}> = ({frame, at, parts, origin}) => {
  const t0 = (frame - at) / FPS;
  if (t0 < 0) return null;
  return (
    <>
      {parts.map((p, i) => {
        const t = t0 - p.delay;
        if (t < 0 || t > p.life) return null;
        // حل تحليلي لحركة مع مقاومة خطية: x = v(1−e^(−kt))/k
        const k = p.drag;
        const travel = (p.speed * (1 - Math.exp(-k * t))) / k;
        const vx = Math.cos(p.angle);
        const vy = Math.sin(p.angle) - 0.35;
        const startR = BADGE.size * 0.42;
        const x = origin.x + vx * (startR + travel);
        const y = origin.y + Math.sin(p.angle) * startR + vy * travel + 0.5 * GRAVITY * t * t * 0.55;
        const lifeT = t / p.life;
        const fadeIn = Math.min(1, t / 0.05);
        const fadeOut = 1 - Math.pow(lifeT, 2.2);
        // وميض: الرقاقة تلمع لما وجهها يقابل الضوء
        const flipCos = Math.cos(t * p.flip + p.phase);
        const glint = Math.pow(Math.abs(flipCos), 6);
        const opacity = fadeIn * fadeOut;
        if (p.kind === 'flake') {
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: p.size,
                height: p.size * 0.55,
                marginLeft: -p.size / 2,
                background: `linear-gradient(135deg, ${p.color}, #A8731F)`,
                transform: `rotate(${p.spin * t}deg) scaleY(${0.15 + 0.85 * Math.abs(flipCos)})`,
                opacity,
                filter: `brightness(${1 + glint * 1.4})`,
                boxShadow: glint > 0.4 ? `0 0 ${10 * glint}px rgba(255,236,170,${glint})` : 'none',
              }}
            />
          );
        }
        if (p.kind === 'star') {
          const s = p.size * (0.6 + 0.4 * glint);
          return (
            <svg key={i} width={s * 2} height={s * 2} viewBox="-1 -1 2 2" style={{position: 'absolute', left: x - s, top: y - s, opacity: opacity * (0.35 + 0.65 * glint), overflow: 'visible'}}>
              <path d="M0,-1 C0.1,-0.1 0.1,-0.1 1,0 C0.1,0.1 0.1,0.1 0,1 C-0.1,0.1 -0.1,0.1 -1,0 C-0.1,-0.1 -0.1,-0.1 0,-1Z" fill="#FFF6DA" />
            </svg>
          );
        }
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - p.size / 2,
              top: y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.color,
              opacity,
              boxShadow: `0 0 ${p.size * 2.5}px ${p.size * 0.6}px rgba(255,200,90,0.55)`,
            }}
          />
        );
      })}
    </>
  );
};

export const GoldBurst: React.FC<{frame: number; at: number; origin: {x: number; y: number}}> = ({frame, at, origin}) => (
  <>
    <BurstLayer frame={frame} at={at} parts={MAIN} origin={origin} />
    <BurstLayer frame={frame} at={at + 7} parts={SECOND} origin={origin} />
  </>
);

// غبار ذهبي يطلع ببطء ويتمايل — يعطي عمق للمشهد
const DUST = Array.from({length: 46}, (_, i) => {
  const r = (k: string) => random(`dust-${i}-${k}`);
  return {x: r('x'), y: r('y'), speed: 25 + r('s') * 60, size: 1.5 + r('z') * 4, sway: 10 + r('w') * 30, phase: r('p') * 6.28, blur: r('b') < 0.3};
});

export const GoldDust: React.FC<{frame: number; width: number; height: number; intensity: number}> = ({frame, width, height, intensity}) => {
  const t = frame / FPS;
  return (
    <>
      {DUST.map((d, i) => {
        const y = ((d.y * height - d.speed * t) % height + height) % height;
        const x = d.x * width + Math.sin(t * 0.8 + d.phase) * d.sway;
        const twinkle = 0.45 + 0.55 * Math.pow(Math.sin(t * 2.2 + d.phase * 3) * 0.5 + 0.5, 2);
        const size = d.blur ? d.size * 2.4 : d.size;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: '#FCE3A2',
              opacity: intensity * twinkle * (d.blur ? 0.25 : 0.7),
              filter: d.blur ? 'blur(3px)' : undefined,
              boxShadow: d.blur ? undefined : `0 0 ${size * 3}px rgba(255,205,110,0.6)`,
            }}
          />
        );
      })}
    </>
  );
};
