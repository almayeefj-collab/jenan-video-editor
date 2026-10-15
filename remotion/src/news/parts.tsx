import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// خلفية ثابتة تحت كل المشاهد: داكن، شبكة بمنظور، وبقع ضوء ملونة تتحرك ببطء
export const Background: React.FC<{accent: string; accent2: string}> = ({accent, accent2}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #070A14 0%, #05060C 60%, #030407 100%)', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          left: -380 + Math.sin(t * 0.35) * 90,
          top: -260 + Math.cos(t * 0.3) * 70,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent2}55 0%, ${accent2}00 65%)`,
          filter: 'blur(40px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1000,
          height: 1000,
          right: -420 + Math.cos(t * 0.28) * 80,
          top: 820 + Math.sin(t * 0.33) * 90,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}40 0%, ${accent}00 65%)`,
          filter: 'blur(40px)',
        }}
      />
      {/* أرضية شبكية بمنظور تتحرك لقدام */}
      <div style={{position: 'absolute', left: -600, right: -600, bottom: -200, height: 900, perspective: 700, overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateX(68deg)',
            transformOrigin: '50% 100%',
            backgroundImage: `linear-gradient(${accent}33 2px, transparent 2px), linear-gradient(90deg, ${accent}33 2px, transparent 2px)`,
            backgroundSize: '90px 90px',
            backgroundPosition: `0 ${(f * 1.6) % 90}px`,
            WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 60%)',
            maskImage: 'linear-gradient(180deg, transparent 0%, black 60%)',
          }}
        />
      </div>
      {/* نقاط بيانات صغيرة تطلع */}
      {Array.from({length: 30}, (_, i) => {
        const x = random(`px${i}`) * 1080;
        const sp = 20 + random(`ps${i}`) * 50;
        const y = (((random(`py${i}`) * 1920 - sp * t) % 1920) + 1920) % 1920;
        const s = 2 + random(`pz${i}`) * 3;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: '50%',
              background: i % 3 ? accent : accent2,
              opacity: 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2 + i)),
              boxShadow: `0 0 ${s * 4}px ${i % 3 ? accent : accent2}`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65) 100%)'}} />
    </AbsoluteFill>
  );
};

// نص يطلع كلمة كلمة (تقسيم على المسافات عشان الحروف العربية تبقى متصلة)
export const Words: React.FC<{text: string; start: number; stagger?: number; style: React.CSSProperties}> = ({text, start, stagger = 2.2, style}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{...style, direction: 'rtl'}}>
      {words.map((w, i) => {
        const p = interpolate(f, [start + i * stagger, start + i * stagger + 14], [0, 1], {...clamp, easing: easeOut});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * 36}px)`,
              filter: `blur(${(1 - p) * 10}px)`,
              marginLeft: '0.26em',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// كبسولة التصنيف
export const Tag: React.FC<{text: string; accent: string; accent2: string; p: number}> = ({text, accent, accent2, p}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '12px 30px 14px',
      borderRadius: 999,
      background: `linear-gradient(90deg, ${accent2}, ${accent})`,
      color: '#04060C',
      fontFamily,
      fontWeight: 800,
      fontSize: 36,
      direction: 'rtl',
      opacity: p,
      transform: `scale(${0.8 + 0.2 * p})`,
      boxShadow: `0 10px 40px ${accent}55`,
    }}
  >
    <span style={{width: 14, height: 14, borderRadius: '50%', background: '#04060C'}} />
    {text}
  </div>
);

// رسم متحرك بدل الصورة: شبكة عصبية حول نواة متوهجة
export const AIVisual: React.FC<{accent: string; accent2: string; seed: number}> = ({accent, accent2, seed}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const W = 960;
  const H = 720;
  const nodes = Array.from({length: 26}, (_, i) => {
    const ring = i < 8 ? 150 : 290;
    const n = i < 8 ? 8 : 18;
    const k = i < 8 ? i : i - 8;
    const a = (k / n) * Math.PI * 2 + (i < 8 ? t * 0.25 : -t * 0.15) + seed;
    const wob = 12 * Math.sin(t * 1.3 + i);
    return {x: W / 2 + Math.cos(a) * (ring + wob), y: H / 2 + Math.sin(a) * (ring + wob) * 0.72};
  });
  const edges: [number, number][] = [];
  for (let i = 0; i < 8; i++) {
    edges.push([i, (i + 1) % 8]);
    edges.push([i, 8 + Math.floor((i / 8) * 18)]);
    edges.push([i, 8 + ((Math.floor((i / 8) * 18) + 1) % 18)]);
  }
  for (let i = 8; i < 26; i++) edges.push([i, i + 1 < 26 ? i + 1 : 8]);
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="core">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.3" stopColor={accent} />
          <stop offset="1" stopColor={accent2} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="edge" x1="0" x2="1">
          <stop offset="0" stopColor={accent2} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
      </defs>
      <circle cx={W / 2} cy={H / 2} r={110 + pulse * 20} fill="url(#core)" opacity={0.85} />
      {edges.map(([a, b], i) => {
        const A = nodes[a];
        const B = nodes[b];
        // نبضة بيانات تمشي على الخط
        const s = (t * 0.7 + random(`e${i}${seed}`)) % 1;
        return (
          <g key={i}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="url(#edge)" strokeWidth={2} opacity={0.45} />
            <circle cx={A.x + (B.x - A.x) * s} cy={A.y + (B.y - A.y) * s} r={4} fill="#FFFFFF" opacity={0.9} />
          </g>
        );
      })}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i < 8 ? 11 : 7} fill={i % 2 ? accent : accent2} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={2} />
      ))}
    </svg>
  );
};
