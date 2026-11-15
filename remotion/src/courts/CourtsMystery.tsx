// لغز الحصة: فيديو تمهيدي للطالبات يستنتجن منه عنوان الدرس «أنواع المحاكم في الكويت»
// المصدر: كتاب السلطة القضائية ص ٦٦–٦٩. ستة أدلة، ثم لغز الحروف، ثم عدّ تنازلي للتفكير، ثم كشف العنوان.
// التوقيت مبني على bars الموسيقى (tools/compose_formal.py --bpm 96 --intro 3 --recs 9 --rec-bars 5 --outro 3)
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
const BAR = 75; // 2.5 ثانية على 96 BPM
export const INTRO = 3 * BAR;
export const SLOT = 5 * BAR;
const SLOTS = 9;
export const OUTRO = 3 * BAR;
export const totalFrames = () => INTRO + SLOTS * SLOT + OUTRO;
const slotStart = (i: number) => INTRO + i * SLOT;

const C = {
  navy: '#0c1a33',
  deep: '#060e1f',
  gold: '#e0b45a',
  goldLight: '#f6dc9c',
  cream: '#fbf4e2',
  maroon: '#9b2335',
  ink: '#1c2540',
  green: '#1f8a4c',
  red: '#c8102e',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const back = Easing.out(Easing.back(1.7));
const pr = (f: number, a: number, d = 16, e = ease) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: e});
const reveal = (f: number, delay: number, dur = 18, dist = 40): React.CSSProperties => {
  const k = pr(f, delay, dur);
  return {opacity: k, filter: `blur(${(1 - k) * 10}px)`, transform: `translateY(${(1 - k) * dist}px)`};
};
const popIn = (f: number, delay: number, dur = 16): React.CSSProperties => {
  const k = pr(f, delay, dur, back);
  return {opacity: pr(f, delay, 8), transform: `scale(${0.4 + 0.6 * k})`};
};
const AR = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

const Sfx: React.FC<{at: number; src: string; v: number; dur?: number}> = ({at, src, v, dur = FPS * 2}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}>
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={v} />
  </Sequence>
);

// ===================== الخلفية =====================
const DUST = new Array(70).fill(0).map((_, i) => ({
  x: random(`dx${i}`) * WIDTH, y: random(`dy${i}`) * HEIGHT, r: 1 + random(`dr${i}`) * 2.6, s: 0.2 + random(`ds${i}`) * 0.6, ph: random(`dp${i}`) * 6.3,
}));

const star8 = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const rr = i % 2 === 0 ? r : r * 0.62;
    const a = (Math.PI / 8) * i;
    pts.push(`${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`);
  }
  return pts.join(' ');
};

const Background: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 80% at 50% 40%, #183363 0%, ${C.navy} 50%, ${C.deep} 100%)`}}>
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, opacity: 0.07}}>
        <defs>
          <pattern id="stars" width="160" height="160" patternUnits="userSpaceOnUse" patternTransform={`translate(${(f * 0.25) % 160} 0)`}>
            <polygon points={star8(80, 80, 56)} fill="none" stroke={C.gold} strokeWidth={2} />
            <polygon points={star8(0, 0, 26)} fill="none" stroke={C.gold} strokeWidth={1.5} />
            <polygon points={star8(160, 160, 26)} fill="none" stroke={C.gold} strokeWidth={1.5} />
            <polygon points={star8(0, 160, 26)} fill="none" stroke={C.gold} strokeWidth={1.5} />
            <polygon points={star8(160, 0, 26)} fill="none" stroke={C.gold} strokeWidth={1.5} />
          </pattern>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#stars)" />
      </svg>
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
        {DUST.map((d, i) => (
          <circle key={i} cx={(d.x + Math.sin(f / 50 + d.ph) * 30) % WIDTH} cy={(d.y - f * d.s + HEIGHT * 4) % HEIGHT} r={d.r} fill={C.goldLight} opacity={0.15 + 0.25 * (0.5 + 0.5 * Math.sin(f / 18 + d.ph))} />
        ))}
      </svg>
      {/* إطار ذهبي رفيع */}
      <div style={{position: 'absolute', inset: 26, border: `2px solid ${C.gold}55`, borderRadius: 26}} />
      <div style={{position: 'absolute', inset: 36, border: `1px solid ${C.gold}22`, borderRadius: 20}} />
    </AbsoluteFill>
  );
};

// ===================== عناصر مشتركة =====================
const Magnifier: React.FC<{size: number; color?: string}> = ({size, color = C.gold}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="42" cy="42" r="28" stroke={color} strokeWidth="9" fill={`${color}22`} />
    <line x1="63" y1="63" x2="90" y2="90" stroke={color} strokeWidth="13" strokeLinecap="round" />
    <path d="M28 34 A16 16 0 0 1 42 24" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const ORD = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const ClueBadge: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 70, right: 90, display: 'flex', alignItems: 'center', gap: 18, ...popIn(f, 4)}}>
      <div style={{transform: `rotate(${Math.sin(f / 12) * 8}deg)`}}>
        <Magnifier size={74} />
      </div>
      <div style={{background: `linear-gradient(135deg, ${C.gold}, #b8862e)`, color: C.deep, fontWeight: 900, fontSize: 40, padding: '6px 34px 12px', borderRadius: 999, boxShadow: '0 8px 30px rgba(224,180,90,.35)'}}>
        الدليل {ORD[i]}
      </div>
    </div>
  );
};

// شريط تقدم الأدلة الستة أسفل الشاشة
const Progress: React.FC<{found: number}> = ({found}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', bottom: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22, ...reveal(f, 10)}}>
      {new Array(6).fill(0).map((_, i) => {
        const on = i < found;
        const now = i === found - 1;
        const k = now ? pr(f, 30, 16, back) : 1;
        return (
          <div
            key={i}
            style={{
              width: 54, height: 54, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `3px solid ${on ? C.gold : C.gold + '55'}`, background: on ? `${C.gold}${now ? '' : 'cc'}` : 'transparent',
              transform: `scale(${on ? 0.6 + 0.4 * k : 0.8})`, color: on ? C.deep : C.gold + '88', fontWeight: 900, fontSize: 28,
              boxShadow: now ? `0 0 ${20 + 10 * Math.sin(f / 6)}px ${C.gold}` : 'none',
            }}
          >
            {on ? '✓' : AR(i + 1)}
          </div>
        );
      })}
    </div>
  );
};

const Question: React.FC<{at: number; children: React.ReactNode; bottom?: number}> = ({at, children, bottom = 150}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', bottom, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...reveal(f, at)}}>
      <div style={{background: `${C.maroon}`, color: C.cream, fontSize: 46, fontWeight: 800, padding: '10px 44px 18px', borderRadius: 22, border: `3px solid ${C.gold}`, boxShadow: '0 14px 40px rgba(0,0,0,.4)'}}>
        {children}
      </div>
    </div>
  );
};

// غلاف المشهد: دخول وخروج ناعم
const Scene: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const inK = pr(f, 0, 14);
  const outK = pr(f, dur - 14, 14);
  return (
    <AbsoluteFill style={{opacity: inK * (1 - outK), transform: `scale(${1.04 - 0.04 * inK + 0.03 * outK})`, filter: `blur(${(1 - inK) * 8 + outK * 8}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

const H1: React.FC<{at: number; children: React.ReactNode; size?: number; color?: string}> = ({at, children, size = 74, color = C.goldLight}) => {
  const f = useCurrentFrame();
  return <div style={{fontSize: size, fontWeight: 900, color, lineHeight: 1.3, ...reveal(f, at)}}>{children}</div>;
};
const P: React.FC<{at: number; children: React.ReactNode; size?: number}> = ({at, children, size = 44}) => {
  const f = useCurrentFrame();
  return <div style={{fontSize: size, fontWeight: 600, color: C.cream, lineHeight: 1.6, ...reveal(f, at)}}>{children}</div>;
};

// ===================== الرسومات =====================
const Scales: React.FC<{size: number}> = ({size}) => {
  const f = useCurrentFrame();
  const a = ((14 * Math.PI) / 180) * Math.sin(f / 9) * Math.exp(-f / 70) + (f < 12 ? 0.25 * (1 - f / 12) : 0);
  const L = 140;
  const ends = [-1, 1].map((s) => ({x: 200 + s * L * Math.cos(a), y: 100 + s * L * Math.sin(a)}));
  const glow = 0.5 + 0.5 * Math.sin(f / 15);
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      <defs>
        <linearGradient id="gold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={C.goldLight} />
          <stop offset="1" stopColor="#b07d27" />
        </linearGradient>
        <radialGradient id="halo">
          <stop offset="0" stopColor={C.gold} stopOpacity={0.35} />
          <stop offset="1" stopColor={C.gold} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r={170 + glow * 14} fill="url(#halo)" />
      <rect x="192" y="96" width="16" height="250" rx="6" fill="url(#gold)" />
      <path d="M130 360 Q200 320 270 360 Z" fill="url(#gold)" />
      <rect x="120" y="356" width="160" height="16" rx="8" fill="url(#gold)" />
      <line x1={ends[0].x} y1={ends[0].y} x2={ends[1].x} y2={ends[1].y} stroke="url(#gold)" strokeWidth="12" strokeLinecap="round" />
      <circle cx="200" cy="88" r="18" fill="url(#gold)" />
      {ends.map((e, i) => (
        <g key={i}>
          <circle cx={e.x} cy={e.y} r="7" fill={C.goldLight} />
          <line x1={e.x} y1={e.y} x2={e.x - 42} y2={e.y + 110} stroke={C.goldLight} strokeWidth="3" />
          <line x1={e.x} y1={e.y} x2={e.x + 42} y2={e.y + 110} stroke={C.goldLight} strokeWidth="3" />
          <path d={`M${e.x - 58} ${e.y + 110} Q${e.x} ${e.y + 160} ${e.x + 58} ${e.y + 110} Z`} fill="url(#gold)" />
        </g>
      ))}
    </svg>
  );
};

const Gavel: React.FC<{size: number; strikes: number[]}> = ({size, strikes}) => {
  const f = useCurrentFrame();
  // كل ضربة: يرتفع ثم ينزل بسرعة
  let ang = -38;
  let ring = -1;
  for (const s of strikes) {
    if (f >= s - 14 && f < s) ang = interpolate(f, [s - 14, s - 4, s], [-38, -55, 0], {...clamp, easing: Easing.in(Easing.quad)});
    if (f >= s && f < s + 22) {
      ang = interpolate(f, [s, s + 22], [0, -38], {...clamp, easing: Easing.out(Easing.cubic)});
      ring = (f - s) / 22;
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 400 400">
      {ring >= 0 && (
        <>
          <ellipse cx="250" cy="318" rx={40 + ring * 140} ry={10 + ring * 34} fill="none" stroke={C.gold} strokeWidth={6 * (1 - ring)} opacity={1 - ring} />
          <ellipse cx="250" cy="318" rx={20 + ring * 90} ry={6 + ring * 20} fill="none" stroke={C.goldLight} strokeWidth={4 * (1 - ring)} opacity={1 - ring} />
        </>
      )}
      {/* القاعدة */}
      <rect x="170" y="315" width="160" height="34" rx="10" fill="#6b3a1e" />
      <rect x="185" y="300" width="130" height="22" rx="8" fill="#8a4d27" />
      <g transform={`rotate(${ang} 90 330)`}>
        <rect x="80" y="314" width="200" height="22" rx="10" fill="#8a4d27" transform="rotate(-0 90 330)" />
        <g transform="translate(250 268)">
          <rect x="-28" y="-6" width="56" height="112" rx="10" fill="#7a4220" />
          <rect x="-36" y="-2" width="72" height="18" rx="6" fill={C.gold} />
          <rect x="-36" y="74" width="72" height="18" rx="6" fill={C.gold} />
        </g>
      </g>
    </svg>
  );
};

const Judge: React.FC<{size: number; color?: string}> = ({size, color = C.cream}) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 50 70">
    <circle cx="25" cy="14" r="10" fill={color} />
    <path d="M8 66 L12 32 Q25 24 38 32 L42 66 Z" fill={C.ink} stroke={color} strokeWidth="2.5" />
    <path d="M21 30 L25 42 L29 30" fill={color} />
  </svg>
);

// علم الكويت يرفرف
const Flag: React.FC<{w: number}> = ({w}) => {
  const f = useCurrentFrame();
  const h = w / 2;
  const N = 48;
  const sw = w / N;
  const body = (
    <g>
      <rect x={0} y={0} width={w} height={h / 3} fill={C.green} />
      <rect x={0} y={h / 3} width={w} height={h / 3} fill="#fff" />
      <rect x={0} y={(2 * h) / 3} width={w} height={h / 3} fill={C.red} />
      <polygon points={`0,0 ${w / 4},${h / 3} ${w / 4},${(2 * h) / 3} 0,${h}`} fill="#000" />
    </g>
  );
  return (
    <svg width={w + 40} height={h + 80} viewBox={`-20 -40 ${w + 40} ${h + 80}`}>
      {new Array(N).fill(0).map((_, i) => {
        const x = i * sw;
        const amp = (x / w) * 22;
        const dy = Math.sin(f / 6 - i / 5) * amp;
        const shade = 0.12 * Math.cos(f / 6 - i / 5) * (x / w);
        return (
          <g key={i} transform={`translate(0 ${dy})`}>
            <clipPath id={`fl${i}`}>
              <rect x={x - 0.5} y={-10} width={sw + 1} height={h + 20} />
            </clipPath>
            <g clipPath={`url(#fl${i})`}>
              {body}
              <rect x={x - 1} y={0} width={sw + 2} height={h} fill={shade > 0 ? '#fff' : '#000'} opacity={Math.abs(shade)} />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

// ===================== المشاهد =====================
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const mx = Math.sin(f / 22) * 260;
  const my = Math.cos(f / 17) * 60;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
      <div style={{position: 'relative', width: 700, height: 360, ...popIn(f, 6, 22)}}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 300, fontWeight: 900, color: C.gold, textShadow: `0 0 60px ${C.gold}88`}}>؟</div>
        <div style={{position: 'absolute', left: 260 + mx, top: 70 + my}}>
          <Magnifier size={220} color={C.cream} />
        </div>
      </div>
      <H1 at={30} size={110}>لغز الحصّة</H1>
      <P at={55} size={50}>تابعي الأدلّة الستّة بانتباه… ثم استنتجي <span style={{color: C.gold, fontWeight: 900}}>عنوان درسنا اليوم</span></P>
    </AbsoluteFill>
  );
};

const Clue1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ClueBadge i={0} />
      <div style={{position: 'absolute', left: 120, top: 200, ...popIn(f, 10, 24)}}>
        <Scales size={560} />
      </div>
      <div style={{position: 'absolute', right: 120, top: 230, width: 1050, display: 'flex', flexDirection: 'column', gap: 26}}>
        <H1 at={20} size={96}>«العدلُ أساسُ المُلك»</H1>
        <P at={45}>والظلمُ فسادٌ للحكم والرعيّة…</P>
        <P at={75}>لذلك تحرص الدول على وجود جهة <b style={{color: C.gold}}>مستقلّة</b> تفصل بين الناس بكل <b style={{color: C.gold}}>عدلٍ ونزاهة</b>.</P>
      </div>
      <Question at={150}>🤔 مَن يفصل بين الناس إذا اختلفوا؟</Question>
      <Progress found={1} />
    </AbsoluteFill>
  );
};

const Clue2: React.FC = () => {
  const f = useCurrentFrame();
  const pillars = [
    {t: 'التشريعية', sub: 'تَسُنّ القوانين', at: 20},
    {t: 'التنفيذية', sub: 'تُنفّذ القوانين', at: 34},
    {t: 'القضائية', sub: 'تَفصِل في النزاعات', at: 70},
  ];
  return (
    <AbsoluteFill>
      <ClueBadge i={1} />
      <div style={{position: 'absolute', top: 175, left: 0, right: 0, textAlign: 'center'}}>
        <H1 at={10} size={68}>سُلطات الدولة الثلاث</H1>
      </div>
      <div style={{position: 'absolute', right: 130, top: 300, display: 'flex', gap: 34, alignItems: 'flex-end'}}>
        {pillars.map((p, i) => {
          const third = i === 2;
          const mystery = third && f < 95;
          const k = pr(f, p.at, 22, back);
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: pr(f, p.at, 8), transform: `translateY(${(1 - k) * 120}px)`}}>
              <div style={{width: 290, height: 34, background: C.gold, borderRadius: '8px 8px 0 0'}} />
              <div
                style={{
                  width: 230, height: 300, background: third ? `linear-gradient(90deg, #f3d792, ${C.gold}, #a87726)` : `linear-gradient(90deg, #cdd4e4, #8d99b6)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: third ? `0 0 ${40 + 20 * Math.sin(f / 8)}px ${C.gold}aa` : 'none',
                }}
              >
                <div style={{fontSize: 30, fontWeight: 700, color: C.ink}}>السلطة</div>
                <div style={{fontSize: mystery ? 120 : 44, fontWeight: 900, color: third ? C.maroon : C.ink, lineHeight: 1.1}}>{mystery ? '؟' : p.t}</div>
                {!mystery && <div style={{fontSize: 26, fontWeight: 700, color: C.ink, opacity: 0.8}}>{p.sub}</div>}
              </div>
              <div style={{width: 290, height: 34, background: C.gold, borderRadius: '0 0 8px 8px'}} />
              <div style={{fontSize: 34, fontWeight: 900, color: C.goldLight, marginTop: 10}}>{AR(i + 1)}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 100, top: 300, width: 680, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
        <div style={{...popIn(f, 100, 20)}}>
          <Gavel size={300} strikes={[128, 190]} />
        </div>
        <div style={{...reveal(f, 140), background: `${C.cream}`, color: C.ink, borderRadius: 22, padding: '18px 30px 24px', fontSize: 34, fontWeight: 700, lineHeight: 1.6, textAlign: 'center', borderRight: `10px solid ${C.maroon}`}}>
          «لا سلطانَ لأيّ جهة على <b style={{color: C.maroon}}>القاضي</b> في قضائه»
          <div style={{fontSize: 26, color: C.maroon, marginTop: 4}}>الدستور الكويتي — المادة ١٦٣</div>
        </div>
      </div>
      <Question at={215}>⚖️ السلطة الثالثة… ويُديرها المجلس الأعلى للقضاء</Question>
      <Progress found={2} />
    </AbsoluteFill>
  );
};

const CASES = [
  {e: '🏪', t: 'تجارية', s: 'خلاف بين تاجرَين'},
  {e: '🏠', t: 'مدنية', s: 'نزاع على عقد إيجار'},
  {e: '🚨', t: 'جزائية', s: 'سرقة أو اعتداء'},
  {e: '👨‍👩‍👧', t: 'أحوال شخصية', s: 'زواج وطلاق وميراث'},
  {e: '🏢', t: 'إدارية', s: 'موظف ضد جهة حكومية'},
];

const Clue3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ClueBadge i={2} />
      <div style={{position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center'}}>
        <H1 at={10} size={68}>قضايا من حياتنا اليومية 📂</H1>
      </div>
      <div style={{position: 'absolute', top: 330, left: 90, right: 90, display: 'flex', justifyContent: 'center', gap: 30}}>
        {CASES.map((c, i) => {
          const at = 34 + i * 26;
          const bob = Math.sin(f / 14 + i) * 6;
          return (
            <div key={i} style={{...popIn(f, at, 18)}}>
              <div
                style={{
                  width: 310, height: 430, background: C.cream, borderRadius: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: '0 20px 50px rgba(0,0,0,.4)', borderTop: `12px solid ${C.gold}`, transform: `translateY(${bob}px)`,
                }}
              >
                <div style={{fontSize: 104}}>{c.e}</div>
                <div style={{fontSize: c.t.length > 8 ? 40 : 48, fontWeight: 900, color: C.maroon}}>{c.t}</div>
                <div style={{fontSize: 30, fontWeight: 700, color: C.ink, textAlign: 'center', padding: '0 16px'}}>{c.s}</div>
              </div>
            </div>
          );
        })}
      </div>
      <Question at={190}>🤔 إلى أين تذهب كل هذه القضايا… لِيُحكَم فيها بالعدل؟</Question>
      <Progress found={3} />
    </AbsoluteFill>
  );
};

const STEPS = [
  {lvl: 'الدرجة الأولى', name: 'الجزئية والكلية', who: 'قاضٍ واحد أو ثلاثة', n: 1, h: 240},
  {lvl: 'الدرجة الثانية', name: 'الاستئناف العليا', who: 'ثلاثة مستشارين', n: 3, h: 370},
  {lvl: 'الدرجة الثالثة', name: 'التمييز', who: 'خمسة مستشارين', n: 5, h: 500},
];

const Clue4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ClueBadge i={3} />
      <div style={{position: 'absolute', top: 70, left: 110, width: 1000}}>
        <H1 at={10} size={64}>ثلاث درجات… مثل السُّلَّم 🪜</H1>
        <P at={30} size={36}>إذا لم يقتنع أحد الطرفين بالحكم، يطعن فيه ويصعد للدرجة الأعلى.</P>
      </div>
      <div style={{position: 'absolute', bottom: 150, right: 140, display: 'flex', alignItems: 'flex-end', gap: 0}}>
        {STEPS.map((s, i) => {
          const at = 50 + i * 40;
          const k = pr(f, at, 22, back);
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: pr(f, at, 8)}}>
              <div style={{display: 'flex', gap: 2, marginBottom: 6, ...popIn(f, at + 18)}}>
                {new Array(s.n).fill(0).map((_, j) => (
                  <Judge key={j} size={48} color={i === 2 ? C.goldLight : C.cream} />
                ))}
              </div>
              <div
                style={{
                  width: 440, height: s.h * k, overflow: 'hidden', background: i === 2 ? `linear-gradient(180deg, ${C.gold}, #a87726)` : `linear-gradient(180deg, ${C.cream}, #d8cdb1)`,
                  borderRadius: '18px 18px 0 0', borderLeft: `2px solid ${C.navy}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 22, gap: 4,
                }}
              >
                <div style={{fontSize: 30, fontWeight: 800, color: C.maroon}}>{s.lvl}</div>
                <div style={{fontSize: 44, fontWeight: 900, color: C.ink}}>{s.name}</div>
                <div style={{fontSize: 28, fontWeight: 700, color: C.ink, opacity: 0.8}}>{s.who}</div>
                {i === 2 && <div style={{fontSize: 28, fontWeight: 900, color: C.maroon, marginTop: 8}}>🛡️ حارس القانون</div>}
              </div>
            </div>
          );
        })}
      </div>
      <Progress found={4} />
    </AbsoluteFill>
  );
};

const SPECIAL = [
  {e: '💼', t: 'الوزراء'},
  {e: '📜', t: 'الدستورية'},
  {e: '🎖️', t: 'العسكرية'},
  {e: '⚠️', t: 'العُرفية'},
];

const Clue5: React.FC = () => {
  const f = useCurrentFrame();
  const Card: React.FC<{at: number; title: string; sub: string; children: React.ReactNode; hl?: boolean}> = ({at, title, sub, children, hl}) => (
    <div
      style={{
        width: 760, height: 500, background: `${C.cream}`, borderRadius: 36, padding: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: hl ? `0 0 50px ${C.gold}99` : '0 20px 50px rgba(0,0,0,.4)', border: `5px solid ${C.gold}`, ...popIn(f, at, 22),
      }}
    >
      <div style={{fontSize: 64, fontWeight: 900, color: C.maroon}}>{title}</div>
      <div style={{fontSize: 30, fontWeight: 700, color: C.ink, textAlign: 'center'}}>{sub}</div>
      {children}
    </div>
  );
  return (
    <AbsoluteFill>
      <ClueBadge i={4} />
      <div style={{position: 'absolute', top: 175, left: 0, right: 0, textAlign: 'center'}}>
        <H1 at={10} size={64}>ليست كلّها من نوعٍ واحد!</H1>
      </div>
      <div style={{position: 'absolute', top: 290, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 70}}>
        <Card at={30} title="العاديّة" sub="تنظر في قضايا الحياة اليومية">
          <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 20}}>
            {CASES.map((c, i) => (
              <div key={i} style={{fontSize: 30, fontWeight: 800, color: C.ink, background: '#efe3c2', borderRadius: 999, padding: '6px 22px 10px', ...popIn(f, 60 + i * 8)}}>
                {c.e} {c.t}
              </div>
            ))}
          </div>
        </Card>
        <Card at={110} title="الخاصّة" sub="لموضوعات خاصة تصدر بها قوانين خاصة" hl>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 14}}>
            {SPECIAL.map((s, i) => (
              <div key={i} style={{fontSize: 38, fontWeight: 900, color: C.cream, background: C.maroon, borderRadius: 20, padding: '10px 26px 14px', textAlign: 'center', ...popIn(f, 140 + i * 12)}}>
                {s.e} {s.t}
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Question at={220} bottom={125}>
        إذاً هي ليست نوعاً واحداً… بل <span style={{color: C.gold, fontSize: 56}}>«أنـواع»</span> 💡
      </Question>
      <Progress found={5} />
    </AbsoluteFill>
  );
};

const Clue6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ClueBadge i={5} />
      <div style={{position: 'absolute', left: 140, top: 250, ...popIn(f, 14, 26)}}>
        <div style={{position: 'absolute', left: -14, top: 20, width: 16, height: 620, background: `linear-gradient(90deg, #ddd, #888)`, borderRadius: 8}} />
        <div style={{position: 'absolute', left: -24, top: 8, width: 36, height: 36, borderRadius: 99, background: C.gold}} />
        <Flag w={640} />
      </div>
      <div style={{position: 'absolute', right: 130, top: 250, width: 900, display: 'flex', flexDirection: 'column', gap: 24}}>
        <H1 at={30} size={80}>وكلُّ هذا… في وطننا 🤍</H1>
        <P at={60}>نظامٌ قضائيٌّ مبدؤه الأعلى <b style={{color: C.gold}}>استقلال القضاء</b>.</P>
        <P at={90}>
          نصّ عليه <b style={{color: C.gold}}>دستور دولة الكويت</b>
        </P>
      </div>
      <Question at={160}>🇰🇼 في أيّ دولة نتعلّم عن هذا النظام اليوم؟</Question>
      <Progress found={6} />
    </AbsoluteFill>
  );
};

// ===== لغز الحروف =====
const WORDS: {pre?: string; letters: string[]; given?: boolean}[] = [
  {letters: ['أ', 'ن', 'و', 'ا', 'ع']},
  {pre: 'ال', letters: ['م', 'ح', 'ا', 'ك', 'م']},
  {letters: ['ف', 'ي'], given: true},
  {pre: 'ال', letters: ['ك', 'و', 'ي', 'ت']},
];
const LETTER_ORDER: [number, number][] = [];
WORDS.forEach((w, wi) => !w.given && w.letters.forEach((_, li) => LETTER_ORDER.push([wi, li])));
const HINTS = new Set(['0-0', '1-0', '3-0']); // أول حرف من كل كلمة مخفية

const Box: React.FC<{ch: string; show: boolean; kind: 'blank' | 'given' | 'hint' | 'filled'; popAt?: number; size?: number}> = ({ch, show, kind, popAt = -99, size = 74}) => {
  const f = useCurrentFrame();
  const k = kind === 'filled' || kind === 'hint' ? pr(f, popAt, 14, back) : 1;
  const bg = kind === 'given' ? '#2a3a5e' : kind === 'blank' ? 'rgba(255,255,255,.06)' : kind === 'hint' ? C.cream : C.gold;
  return (
    <div
      style={{
        width: size, height: size * 1.12, borderRadius: 18, background: bg, border: `3px solid ${kind === 'given' ? '#4d5f8a' : C.gold}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.62, fontWeight: 900,
        color: kind === 'given' ? C.cream : C.ink, transform: `scale(${0.7 + 0.3 * k})`,
      }}
    >
      {show ? ch : ''}
    </div>
  );
};

const LetterBoard: React.FC<{filled: number; hints: boolean; fillStart?: number; hintAt?: number; size?: number}> = ({filled, hints, fillStart = 0, hintAt = 0, size}) => (
  <div style={{display: 'flex', gap: 44, justifyContent: 'center', flexWrap: 'nowrap'}}>
    {WORDS.map((w, wi) => (
      <div key={wi} style={{display: 'flex', gap: 8}}>
        {w.pre && w.pre.split('').map((ch, i) => <Box key={`p${i}`} ch={ch} show kind="given" size={size} />)}
        {w.letters.map((ch, li) => {
          if (w.given) return <Box key={li} ch={ch} show kind="given" size={size} />;
          const idx = LETTER_ORDER.findIndex(([a, b]) => a === wi && b === li);
          const isFilled = idx < filled;
          const isHint = hints && HINTS.has(`${wi}-${li}`);
          return (
            <Box key={li} ch={ch} show={isFilled || isHint} kind={isFilled ? 'filled' : isHint ? 'hint' : 'blank'} popAt={isFilled ? fillStart + idx * 7 : hintAt} size={size} />
          );
        })}
      </div>
    ))}
  </div>
);

const CHIPS = ['⚖️ العدل', '🔨 القاضي', '📂 القضايا', '🪜 الدرجات', '🗂️ الأنواع', '🇰🇼 الكويت'];

const Puzzle: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center'}}>
        <H1 at={6} size={76}>جمعتِ الأدلّة كلّها! 🔍</H1>
      </div>
      <div style={{position: 'absolute', top: 240, left: 120, right: 120, display: 'flex', justifyContent: 'center', gap: 22}}>
        {CHIPS.map((c, i) => (
          <div key={i} style={{fontSize: 40, fontWeight: 900, color: C.deep, background: C.goldLight, padding: '10px 28px 16px', borderRadius: 999, boxShadow: `0 0 26px ${C.gold}66`, ...popIn(f, 24 + i * 12)}}>
            {c}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', top: 430, left: 0, right: 0, textAlign: 'center'}}>
        <P at={110} size={48}>رتّبيها في ذهنك… العنوان يتكوّن من <b style={{color: C.gold}}>أربع كلمات</b></P>
      </div>
      <div style={{position: 'absolute', top: 580, left: 0, right: 0, ...reveal(f, 150)}}>
        <LetterBoard filled={0} hints={false} />
      </div>
      <Question at={210} bottom={110}>✏️ اكتبي توقّعكِ في دفترك قبل أن ينتهي الوقت!</Question>
    </AbsoluteFill>
  );
};

const Think: React.FC = () => {
  const f = useCurrentFrame();
  const T0 = 20;
  const SECS = 10;
  const elapsed = Math.max(0, f - T0) / FPS;
  const left = Math.max(0, Math.ceil(SECS - elapsed));
  const p = Math.min(1, elapsed / SECS);
  const R = 120;
  const circ = 2 * Math.PI * R;
  const pulse = 1 + 0.06 * Math.max(0, 1 - ((f - T0) % FPS) / 8);
  const hintAt = T0 + 5 * FPS;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center'}}>
        <H1 at={4} size={80}>فكّري… ما عنوان درسنا اليوم؟ 🤔</H1>
      </div>
      <div style={{position: 'absolute', top: 240, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...popIn(f, 8)}}>
        <div style={{position: 'relative', width: 300, height: 300, transform: `scale(${pulse})`}}>
          <svg width={300} height={300} style={{transform: 'rotate(-90deg)'}}>
            <circle cx={150} cy={150} r={R} stroke={`${C.gold}33`} strokeWidth={22} fill="none" />
            <circle cx={150} cy={150} r={R} stroke={left <= 3 ? '#ff6b6b' : C.gold} strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * p} />
          </svg>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 140, fontWeight: 900, color: left <= 3 ? '#ff8f8f' : C.cream}}>
            {AR(left)}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', top: 600, left: 0, right: 0}}>
        <LetterBoard filled={0} hints={f >= hintAt} hintAt={hintAt} />
      </div>
      <div style={{position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center', ...reveal(f, hintAt)}}>
        <div style={{display: 'inline-block', fontSize: 42, fontWeight: 800, color: C.cream, background: `${C.maroon}`, border: `3px solid ${C.gold}`, borderRadius: 22, padding: '10px 40px 16px'}}>
          💡 تلميح: المكان الذي يجلس فيه القاضي ليحكم بين الناس… جمعُه؟
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CONFETTI = new Array(140).fill(0).map((_, i) => ({
  x: random(`cx${i}`) * WIDTH, d: random(`cd${i}`) * 50, v: 5 + random(`cv${i}`) * 8, w: 10 + random(`cw${i}`) * 14,
  c: [C.gold, C.goldLight, C.cream, C.maroon, C.green, '#ffffff'][i % 6], rot: random(`cr${i}`) * 360, sp: (random(`cs${i}`) - 0.5) * 20,
}));
const Confetti: React.FC<{at: number}> = ({at}) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {CONFETTI.map((c, i) => {
        const t = f - c.d;
        if (t < 0) return null;
        const y = -40 + t * c.v;
        const x = c.x + Math.sin(t / 10 + i) * 40;
        return <rect key={i} x={x} y={y} width={c.w} height={c.w * 0.5} fill={c.c} transform={`rotate(${c.rot + t * c.sp} ${x + c.w / 2} ${y})`} />;
      })}
    </svg>
  );
};

const Reveal: React.FC = () => {
  const f = useCurrentFrame();
  const FILL = 20;
  const filled = Math.max(0, Math.min(LETTER_ORDER.length, Math.floor((f - FILL) / 7) + 1));
  const MORPH = FILL + LETTER_ORDER.length * 7 + 30; // الحروف تتحول لعنوان متصل
  const m = pr(f, MORPH, 24);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center'}}>
        <H1 at={4} size={66}>لنكشف الإجابة… ✨</H1>
      </div>
      <div style={{position: 'absolute', top: 420, left: 0, right: 0, opacity: 1 - m, transform: `scale(${1 - 0.2 * m})`, filter: `blur(${m * 10}px)`}}>
        <LetterBoard filled={filled} hints fillStart={FILL} hintAt={-30} />
      </div>
      <div style={{position: 'absolute', top: 330, left: 0, right: 0, textAlign: 'center', opacity: m, transform: `scale(${0.7 + 0.3 * pr(f, MORPH, 30, back)})`}}>
        <div style={{fontSize: 150, fontWeight: 900, color: C.goldLight, textShadow: `0 0 50px ${C.gold}aa, 0 8px 0 #6b4a12`}}>أنواع المحاكم في الكويت</div>
      </div>
      <div style={{position: 'absolute', top: 640, left: 0, right: 0, textAlign: 'center'}}>
        <div style={{display: 'inline-block', fontSize: 64, fontWeight: 900, color: C.cream, background: C.maroon, borderRadius: 30, padding: '10px 60px 20px', border: `4px solid ${C.gold}`, ...popIn(f, MORPH + 30, 20)}}>
          أحسنتِ يا مُبدعة! 👏🌟
        </div>
      </div>
      <Confetti at={MORPH} />
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10}}>
      <div style={{...popIn(f, 0, 18)}}>
        <Gavel size={260} strikes={[14]} />
      </div>
      <P at={6} size={44}>الوحدة: السلطة القضائية</P>
      <H1 at={14} size={120}>أنواع المحاكم في الكويت</H1>
      <P at={40} size={48}>📖 هيّا نبدأ درسنا!</P>
    </AbsoluteFill>
  );
};

// ===================== التجميع =====================
const SCENES: React.FC[] = [Clue1, Clue2, Clue3, Clue4, Clue5, Clue6, Puzzle, Think, Reveal];

export const CourtsMystery: React.FC = () => {
  const thinkAt = slotStart(7) + 20;
  const revealAt = slotStart(8);
  const morphAt = revealAt + 20 + LETTER_ORDER.length * 7 + 30;
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
      <Background />
      <Audio src={staticFile('courts/music.mp3')} volume={(f) => interpolate(f, [0, 20, slotStart(7), slotStart(7) + 20, slotStart(8) - 10, slotStart(8), totalFrames() - 40, totalFrames()], [0, 0.55, 0.55, 0.22, 0.22, 0.55, 0.55, 0], clamp)} />
      <Sequence durationInFrames={INTRO}>
        <Scene dur={INTRO}>
          <Intro />
        </Scene>
      </Sequence>
      {SCENES.map((S, i) => (
        <Sequence key={i} from={slotStart(i)} durationInFrames={SLOT}>
          <Scene dur={SLOT}>
            <S />
          </Scene>
        </Sequence>
      ))}
      <Sequence from={slotStart(SLOTS)} durationInFrames={OUTRO}>
        <Scene dur={OUTRO + 20}>
          <Outro />
        </Scene>
      </Sequence>

      {/* مؤثرات */}
      <Sfx at={6} src="shimmer" v={0.5} />
      {new Array(SLOTS).fill(0).map((_, i) => (
        <Sfx key={`w${i}`} at={slotStart(i) - 6} src="whoosh" v={0.35} />
      ))}
      {new Array(6).fill(0).map((_, i) => (
        <Sfx key={`p${i}`} at={slotStart(i) + 30} src="pop" v={0.5} />
      ))}
      <Sfx at={slotStart(1) + 95} src="shimmer" v={0.45} />
      <Sfx at={slotStart(1) + 128} src="impact" v={0.6} />
      <Sfx at={slotStart(1) + 190} src="impact" v={0.6} />
      {CASES.map((_, i) => (
        <Sfx key={`c${i}`} at={slotStart(2) + 34 + i * 26} src="pop" v={0.45} />
      ))}
      {SPECIAL.map((_, i) => (
        <Sfx key={`s${i}`} at={slotStart(4) + 140 + i * 12} src="pop" v={0.4} />
      ))}
      <Sfx at={slotStart(4) + 220} src="shimmer" v={0.45} />
      {CHIPS.map((_, i) => (
        <Sfx key={`ch${i}`} at={slotStart(6) + 24 + i * 12} src="pop" v={0.4} />
      ))}
      {new Array(10).fill(0).map((_, i) => (
        <Sfx key={`t${i}`} at={thinkAt + i * FPS} src="tick" v={0.9} dur={6} />
      ))}
      <Sfx at={thinkAt + 5 * FPS} src="shimmer" v={0.4} />
      <Sfx at={revealAt - 45} src="riser" v={0.5} />
      {LETTER_ORDER.map((_, i) => (
        <Sfx key={`l${i}`} at={revealAt + 20 + i * 7} src="pop" v={0.3} dur={10} />
      ))}
      <Sfx at={morphAt} src="shimmer" v={0.6} />
      <Sfx at={morphAt} src="impact" v={0.5} />
      <Sfx at={slotStart(SLOTS) + 14} src="impact" v={0.6} />
    </AbsoluteFill>
  );
};
