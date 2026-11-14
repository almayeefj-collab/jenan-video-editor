// إرشادات الاختبارات — وزارة التربية (ريل عمودي ~80 ثانية)
// المقاطع مرتبة حسب السيناريو، وكل إرشاد له رقم مفرّغ + أيقونة بتوهج ذهبي + ترجمة
// اللقطات في public/footage/exam/ (ما ترفع للمستودع)
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import React, {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const XF = 10; // طول الانتقال بالفريمات

const NAVY = '#0B1530';
const SKY = '#5CC8F2';
const GOLD = '#E8C36A';
const RED = '#FF4D5A';
const BG = '#07060E';

const s = (sec: number) => Math.round(sec * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);

// ترجمة: [بداية، نهاية، نص، كلمة تتلون بالذهبي]
type Sub = [number, number, string, string?];

type Seg =
  | {kind: 'clip'; id: string; src: string; dur: number; n?: number; title?: string; subs: Sub[]; framing: 'close' | 'side' | 'push'}
  | {kind: 'quote'; id: string; src: string; dur: number}
  | {kind: 'check'; id: string; dur: number}
  | {kind: 'final'; id: string; dur: number};

const SEGS: Seg[] = [
  {kind: 'clip', id: 'intro', src: 'c21.mp4', dur: 8.38, framing: 'side', subs: [
    [0.0, 1.64, 'عزيزي الطالب'],
    [1.64, 3.8, 'هل أنت مستعد للاختبار؟', 'مستعد'],
    [3.8, 5.6, 'قبل أن تخرج من المنزل'],
    [5.6, 8.38, 'تأكّد من هذه الإرشادات', 'الإرشادات'],
  ]},
  {kind: 'quote', id: 'quote', src: 'c20.mp4', dur: 5.96},
  {kind: 'clip', id: 'time', src: 'c19.mp4', dur: 8.0, n: 1, title: 'الوقت', framing: 'side', subs: [
    [0.0, 2.6, 'يبدأ الاختبار في تمام'],
    [2.6, 5.4, 'الساعة الثامنة صباحاً', 'الثامنة'],
    [5.6, 8.0, 'كن حاضراً مبكراً', 'مبكراً'],
  ]},
  {kind: 'clip', id: 'id', src: 'c23.mp4', dur: 10.13, n: 2, title: 'البطاقة المدنية', framing: 'side', subs: [
    [0.0, 3.88, 'تأكّد من إحضار بطاقتك المدنية', 'المدنية'],
    [3.88, 6.1, 'فهي تأكيد لهويتك'],
    [6.1, 10.13, 'ولضمان سير الاختبار بأمان ونزاهة', 'ونزاهة'],
  ]},
  {kind: 'clip', id: 'tools', src: 'c22.mp4', dur: 7.7, n: 3, title: 'المستلزمات', framing: 'side', subs: [
    [0.0, 4.0, 'احرص على إحضار جميع مستلزماتك', 'مستلزماتك'],
    [4.0, 7.7, 'الأقلام والأدوات المكتبية', 'الأقلام'],
  ]},
  {kind: 'clip', id: 'ban', src: 'c17.mp4', dur: 13.8, n: 4, title: 'الممنوعات', framing: 'side', subs: [
    [0.0, 1.86, 'انتبه!', 'انتبه!'],
    [1.86, 4.84, 'يُمنع إحضار أجهزة الاتصال', 'يُمنع'],
    [4.84, 6.7, 'والساعات الذكية'],
    [6.7, 9.34, 'كذلك الأوراق'],
    [9.34, 13.8, 'احرص أن تكون خارج قاعة الاختبار', 'خارج'],
  ]},
  {kind: 'clip', id: 'cover', src: 'c24.mp4', dur: 8.37, n: 5, title: 'ورقة الغلاف', framing: 'side', subs: [
    [0.0, 2.0, 'عبّئ بياناتك', 'بياناتك'],
    [2.0, 4.3, 'في الجزء المخصص للطالب فقط', 'للطالب'],
    [4.3, 8.37, 'ولا تكتب شيئاً آخر في ورقة الغلاف', 'الغلاف'],
  ]},
  {kind: 'clip', id: 'self', src: 'c16.mp4', dur: 8.0, n: 6, title: 'الاعتماد على النفس', framing: 'push', subs: [
    [0.0, 1.6, 'وأخيراً…'],
    [1.6, 3.38, 'اعتمد على جهدك', 'جهدك'],
    [3.38, 8.0, 'فالنجاح الحقيقي يُبنى بصدقٍ وإخلاص', 'بصدقٍ'],
  ]},
  {kind: 'check', id: 'check', dur: 2.8},
  {kind: 'clip', id: 'close', src: 'c18.mp4', dur: 13.28, framing: 'close', subs: [
    [0.0, 2.82, 'آمن بقدراتك… واعمل بجد', 'بقدراتك'],
    [2.82, 5.2, 'فالنجاح الحقيقي ينتظرك', 'النجاح'],
    [5.2, 7.92, 'كل التوفيق لأبنائنا وبناتنا'],
    [9.1, 13.28, 'فالقادم بكم دائماً أفضل', 'أفضل'],
  ]},
  {kind: 'final', id: 'final', dur: 3.4},
];

export const timeline = () => {
  let t = 0;
  return SEGS.map((seg, i) => {
    if (i > 0) t -= XF;
    const start = t;
    t += s(seg.dur);
    return {seg, start, frames: s(seg.dur)};
  });
};
export const totalFrames = () => {
  const tl = timeline();
  const last = tl[tl.length - 1];
  return last.start + last.frames;
};

// انتقال ناعم بدون زوم: تلاشي مع تضبيب خفيف
const BlurDissolve: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({children, presentationDirection, presentationProgress}) => {
  const p = Easing.bezier(0.65, 0, 0.35, 1)(presentationProgress);
  const exiting = presentationDirection === 'exiting';
  const blur = exiting ? p * 16 : (1 - p) * 16;
  const opacity = exiting ? 1 : p;
  return <AbsoluteFill style={{opacity, filter: `blur(${blur}px)`}}>{children}</AbsoluteFill>;
};
const blurDissolve = (): TransitionPresentation<Record<string, never>> => ({component: BlurDissolve, props: {}});

// ───────── أدوات حركة ─────────
const usePop = (at: number, damping = 13) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - s(at), fps, config: {damping, mass: 0.7}});
};

const Sfx: React.FC<{src: string; at: number; vol?: number}> = ({src, at, vol = 0.4}) => (
  <Sequence from={s(at)} layout="none">
    <Audio src={staticFile(`sfx/${src}`)} volume={vol} />
  </Sequence>
);

const glow = (c = GOLD, r = 18) => `drop-shadow(0 0 ${r}px ${c}aa) drop-shadow(0 0 ${r / 3}px ${c})`;

// ───────── الفيديو ─────────
// المذيعة بحجمها الطبيعي بدون أي زوم: إما بالنص، أو مزاحة يمين عشان عمود الجرافيك
const Footage: React.FC<{src: string; framing: 'close' | 'side' | 'push'}> = ({src, framing}) => {
  const scale = 1;
  const x = framing === 'close' ? 0 : 165;
  const y = 0;
  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: '50% 18%'}}>
        <OffthreadVideo src={staticFile(`footage/exam/${src}`)} style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>
      {framing !== 'close' ? (
        <AbsoluteFill style={{background: `linear-gradient(90deg, ${BG} 0px, ${BG} ${Math.max(0, x - 40)}px, transparent ${x + 220}px)`}} />
      ) : null}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(7,6,14,0.55) 0%, transparent 22%, transparent 66%, rgba(7,6,14,0.85) 100%)'}} />
    </AbsoluteFill>
  );
};

// ───────── ترجمة ─────────
const Subtitles: React.FC<{subs: Sub[]}> = ({subs}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cur = subs.find(([a, b]) => t >= a && t < b);
  if (!cur) return null;
  const [a, , text, hl] = cur;
  const p = interpolate(frame - s(a), [0, 7], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 250}}>
      <div
        style={{
          direction: 'rtl',
          fontFamily,
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.35,
          color: 'white',
          textAlign: 'center',
          maxWidth: 960,
          opacity: p,
          transform: `translateY(${(1 - p) * 18}px)`,
          textShadow: '0 3px 18px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)',
        }}
      >
        {text.split(' ').map((w, i) => (
          <Fragment key={i}>
            <span style={w === hl ? {color: GOLD, textShadow: `0 0 22px ${GOLD}88, 0 3px 14px rgba(0,0,0,0.9)`} : undefined}>{w}</span>{' '}
          </Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ───────── رأس الإرشاد: رقم مفرّغ + عنوان ─────────
export type HeaderStyle = 'A' | 'B' | 'C';
const HeaderCtx = React.createContext<HeaderStyle>('A');

// رأس الإرشاد: رقم + عنوان، في نص العمود اليسار (ثلاث خيارات للشكل)
const Header: React.FC<{n: number; title: string}> = ({n, title}) => {
  const style = React.useContext(HeaderCtx);
  const frame = useCurrentFrame();
  const p = spring({frame: frame - 5, fps: FPS, config: {damping: 13}});
  const q = interpolate(frame, [14, 30], [0, 1], {...clamp, easing: ease});
  const titleEl = (
    <div style={{fontFamily, fontWeight: 900, fontSize: 50, lineHeight: 1.2, direction: 'rtl', color: 'white', textAlign: 'center', marginTop: 18, opacity: q, transform: `translateY(${(1 - q) * 16}px)`, textShadow: '0 3px 16px rgba(0,0,0,0.85)'}}>
      {style === 'C' ? (
        <span style={{display: 'inline-block', padding: '6px 26px', borderRadius: 999, border: `3px solid ${GOLD}`, background: 'rgba(11,21,48,0.75)', boxShadow: `0 0 16px ${GOLD}55`}}>{title}</span>
      ) : (
        title
      )}
    </div>
  );
  let num: React.ReactNode;
  if (style === 'A') {
    num = (
      <div style={{width: 170, height: 170, borderRadius: 999, background: `radial-gradient(circle at 40% 30%, #1E3468 0%, ${NAVY} 70%)`, border: `6px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 22px ${GOLD}77, 0 8px 22px rgba(0,0,0,0.6)`}}>
        <span style={{fontFamily, fontWeight: 900, fontSize: 108, lineHeight: 1, color: GOLD, marginTop: 8}}>{n}</span>
      </div>
    );
  } else if (style === 'B') {
    num = (
      <div style={{width: 200, height: 200, borderRadius: 36, background: 'linear-gradient(160deg, rgba(30,50,100,0.85), rgba(8,14,34,0.85))', border: `3px solid ${SKY}`, boxShadow: `0 0 26px ${SKY}66, inset 0 0 30px ${SKY}22`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', direction: 'rtl'}}>
        <span style={{fontFamily, fontWeight: 700, fontSize: 34, color: SKY, lineHeight: 1}}>الإرشاد</span>
        <span style={{fontFamily, fontWeight: 900, fontSize: 118, lineHeight: 1.05, color: GOLD, textShadow: `0 0 22px ${GOLD}88`}}>{n}</span>
      </div>
    );
  } else {
    num = (
      <div style={{position: 'relative', width: 210, height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg viewBox="0 0 100 100" width="210" height="210" style={{position: 'absolute', inset: 0, transform: `rotate(${-90 + frame * 0.6}deg)`}}>
          <circle cx="50" cy="50" r="46" fill="rgba(11,21,48,0.55)" stroke={`${SKY}44`} strokeWidth="2" />
          <circle cx="50" cy="50" r="46" fill="none" stroke={SKY} strokeWidth="3" strokeLinecap="round" strokeDasharray="289" strokeDashoffset={289 * (1 - 0.7 * p)} />
        </svg>
        <span style={{fontFamily, fontWeight: 900, fontSize: 150, lineHeight: 1, marginTop: 14, background: `linear-gradient(180deg, #FFFFFF 0%, ${GOLD} 75%)`, WebkitBackgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 14px ${GOLD}88)`}}>{n}</span>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', top: 130, left: 34, width: 310, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{transform: `scale(${p})`}}>{num}</div>
      {titleEl}
    </div>
  );
};

// ───────── أيقونات ─────────
const Clock: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const pop = usePop(at);
  // العقارب تلف وتوقف على الثامنة
  const turn = interpolate(frame, [s(at), s(at) + 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const hour = -150 + turn * 390; // 240° = الساعة 8
  const minute = turn * 720;
  return (
    <div style={{position: 'absolute', left: 40, top: 600, width: 260, height: 260, transform: `scale(${pop}) rotate(${(1 - pop) * -20}deg)`, filter: glow()}}>
      <svg viewBox="0 0 200 200" width="260" height="260">
        <circle cx="100" cy="100" r="88" fill="rgba(11,21,48,0.85)" stroke={GOLD} strokeWidth="7" />
        {Array.from({length: 12}).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const r1 = i % 3 === 0 ? 66 : 72;
          return <line key={i} x1={100 + Math.sin(a) * r1} y1={100 - Math.cos(a) * r1} x2={100 + Math.sin(a) * 80} y2={100 - Math.cos(a) * 80} stroke={i === 8 ? GOLD : '#ffffffcc'} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" />;
        })}
        <line x1="100" y1="100" x2="100" y2="52" stroke="white" strokeWidth="9" strokeLinecap="round" transform={`rotate(${hour} 100 100)`} />
        <line x1="100" y1="100" x2="100" y2="34" stroke={SKY} strokeWidth="5" strokeLinecap="round" transform={`rotate(${minute} 100 100)`} />
        <circle cx="100" cy="100" r="8" fill={GOLD} />
      </svg>
      <div style={{position: 'absolute', top: 270, width: 260, textAlign: 'center', fontFamily, fontWeight: 900, fontSize: 54, color: GOLD, direction: 'rtl', opacity: turn, textShadow: '0 2px 12px rgba(0,0,0,0.9)'}}>
        8:00 <span style={{fontSize: 38}}>صباحاً</span>
      </div>
    </div>
  );
};

const CivilId: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const pop = usePop(at, 15);
  const float = Math.sin(frame / 14) * 6;
  return (
    <div style={{position: 'absolute', left: 28, top: 640, width: 300, transform: `perspective(1200px) translateY(${float}px) rotateY(${(1 - pop) * 70 + 14}deg) rotateZ(-5deg) scale(${0.6 + pop * 0.4})`, opacity: Math.min(1, pop * 1.5), filter: `drop-shadow(0 18px 30px rgba(0,0,0,0.7)) ${glow(GOLD, 16)}`}}>
      <Img src={staticFile('exam/civil-id.png')} style={{width: '100%'}} />
    </div>
  );
};

const Pencil: React.FC = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%">
    <g transform="rotate(-40 60 60)" fill="none" stroke={GOLD} strokeWidth="6" strokeLinejoin="round">
      <rect x="45" y="8" width="30" height="78" rx="4" fill="rgba(11,21,48,0.8)" />
      <path d="M45 86 L60 112 L75 86 Z" fill="rgba(11,21,48,0.8)" />
      <line x1="45" y1="22" x2="75" y2="22" stroke={SKY} />
    </g>
  </svg>
);
const Ruler: React.FC = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%">
    <g transform="rotate(35 60 60)">
      <rect x="44" y="4" width="32" height="112" rx="5" fill="rgba(11,21,48,0.8)" stroke={GOLD} strokeWidth="6" />
      {Array.from({length: 9}).map((_, i) => (
        <line key={i} x1="44" y1={16 + i * 11} x2={i % 2 ? 56 : 62} y2={16 + i * 11} stroke={SKY} strokeWidth="4" />
      ))}
    </g>
  </svg>
);
const Pen: React.FC = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%">
    <g transform="rotate(15 60 60)" fill="rgba(11,21,48,0.8)" stroke={GOLD} strokeWidth="6" strokeLinejoin="round">
      <rect x="48" y="6" width="24" height="70" rx="10" />
      <path d="M48 76 L60 112 L72 76 Z" />
      <line x1="72" y1="16" x2="80" y2="16" stroke={SKY} />
      <line x1="80" y1="16" x2="80" y2="50" stroke={SKY} />
    </g>
  </svg>
);

const Calculator: React.FC = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%">
    <rect x="24" y="6" width="72" height="108" rx="10" fill="rgba(11,21,48,0.85)" stroke={GOLD} strokeWidth="6" />
    <rect x="34" y="16" width="52" height="22" rx="4" fill="none" stroke={SKY} strokeWidth="4" />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={35 + c * 18} y={48 + r * 19} width="12" height="12" rx="3" fill={r === 2 && c === 2 ? GOLD : SKY} />))}
  </svg>
);

const IconPop: React.FC<{at: number; x: number; y: number; size: number; children: React.ReactNode; color?: string}> = ({at, x, y, size, children, color = GOLD}) => {
  const pop = usePop(at);
  const frame = useCurrentFrame();
  const bob = Math.sin((frame + x) / 16) * 5;
  return (
    <div style={{position: 'absolute', left: x, top: y + bob, width: size, height: size, transform: `scale(${pop})`, filter: glow(color, 14)}}>{children}</div>
  );
};

const Phone: React.FC = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%">
    <rect x="34" y="6" width="52" height="108" rx="10" fill="rgba(11,21,48,0.85)" stroke={GOLD} strokeWidth="6" />
    <line x1="52" y1="18" x2="68" y2="18" stroke={SKY} strokeWidth="5" strokeLinecap="round" />
    <circle cx="60" cy="100" r="5" fill={SKY} />
  </svg>
);
const Watch: React.FC = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%">
    <rect x="42" y="2" width="36" height="22" rx="5" fill="none" stroke={GOLD} strokeWidth="6" />
    <rect x="42" y="96" width="36" height="22" rx="5" fill="none" stroke={GOLD} strokeWidth="6" />
    <rect x="28" y="24" width="64" height="72" rx="14" fill="rgba(11,21,48,0.85)" stroke={GOLD} strokeWidth="6" />
    <path d="M44 62 L54 62 L58 50 L64 74 L68 62 L76 62" fill="none" stroke={SKY} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);
const Papers: React.FC = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%">
    <rect x="30" y="16" width="62" height="86" rx="6" fill="rgba(11,21,48,0.85)" stroke={GOLD} strokeWidth="6" transform="rotate(-10 60 60)" />
    <rect x="30" y="16" width="62" height="86" rx="6" fill="rgba(11,21,48,0.95)" stroke={GOLD} strokeWidth="6" transform="rotate(6 60 60)" />
    {[38, 52, 66, 80].map((yy) => (
      <line key={yy} x1="42" y1={yy} x2={yy === 80 ? 64 : 80} y2={yy} stroke={SKY} strokeWidth="5" strokeLinecap="round" transform="rotate(6 60 60)" />
    ))}
  </svg>
);
const Cross: React.FC<{at: number; x: number; y: number; size: number}> = ({at, x, y, size}) => {
  const frame = useCurrentFrame();
  const d = interpolate(frame, [s(at), s(at) + 8], [0, 1], {...clamp, easing: ease});
  const L = 120;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{position: 'absolute', left: x, top: y, opacity: d > 0 ? 1 : 0, filter: `drop-shadow(0 0 10px ${RED})`}}>
      <line x1="16" y1="16" x2="104" y2="104" stroke={RED} strokeWidth="14" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - Math.min(1, d * 2))} />
      <line x1="104" y1="16" x2="16" y2="104" stroke={RED} strokeWidth="14" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - Math.max(0, d * 2 - 1))} />
    </svg>
  );
};
const Warning: React.FC<{from: number; to: number}> = ({from, to}) => {
  const frame = useCurrentFrame();
  const pop = usePop(from, 10);
  const out = interpolate(frame, [s(to) - 6, s(to)], [1, 0], clamp);
  const pulse = 1 + Math.sin(frame / 3) * 0.04;
  return (
    <div style={{position: 'absolute', left: 60, top: 610, opacity: out}}>
      <svg viewBox="0 0 120 110" width="210" style={{transform: `scale(${pop * pulse})`, filter: `drop-shadow(0 0 20px ${RED})`}}>
        <path d="M60 8 L114 102 L6 102 Z" fill="rgba(40,6,12,0.85)" stroke={RED} strokeWidth="8" strokeLinejoin="round" />
        <line x1="60" y1="40" x2="60" y2="72" stroke="white" strokeWidth="10" strokeLinecap="round" />
        <circle cx="60" cy="88" r="6" fill="white" />
      </svg>
    </div>
  );
};
const Books: React.FC = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%">
    <rect x="14" y="80" width="92" height="22" rx="4" fill="rgba(11,21,48,0.85)" stroke={GOLD} strokeWidth="6" />
    <rect x="22" y="56" width="80" height="22" rx="4" fill="rgba(11,21,48,0.85)" stroke={SKY} strokeWidth="6" />
    <rect x="18" y="32" width="86" height="22" rx="4" fill="rgba(11,21,48,0.85)" stroke={GOLD} strokeWidth="6" />
    <path d="M78 8 L78 30 M70 16 L78 8 L86 16" stroke={GOLD} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ───────── شعار الوزارة ─────────
// ورقة الغلاف في العمود اليسار، والجزء المخصص للطالب يضيء
const PaperIcon: React.FC<{at: number; litAt: number}> = ({at, litAt}) => {
  const frame = useCurrentFrame();
  const pop = usePop(at, 15);
  const lit = interpolate(frame, [s(litAt), s(litAt) + 10], [0, 1], clamp);
  const pulse = 0.75 + Math.sin(frame / 5) * 0.25;
  const W = 280;
  const k = W / 992;
  return (
    <div style={{position: 'absolute', left: 40, top: 600, width: W, transform: `rotate(${-4 + (1 - pop) * -12}deg) scale(${0.6 + pop * 0.4})`, opacity: Math.min(1, pop * 1.5), boxShadow: '0 18px 40px rgba(0,0,0,0.6)'}}>
      <Img src={staticFile('exam/exam-paper.jpg')} style={{width: '100%', display: 'block', filter: `brightness(${1 - lit * 0.3})`}} />
      <div style={{position: 'absolute', left: 40 * k, top: 85 * k, width: 400 * k, height: 355 * k, borderRadius: 8, border: `4px solid ${GOLD}`, boxShadow: `0 0 ${30 * pulse}px ${GOLD}, inset 0 0 24px ${GOLD}66`, background: `${GOLD}22`, opacity: lit}} />
    </div>
  );
};

// شعار الوزارة: ثابت في الزاوية العلوية اليمنى، بعيد عن المذيعة
const LOGO = 'exam/logo.png'; // شعار منطقة مبارك الكبير التعليمية
const CornerLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const tl = timeline();
  const fin = tl[tl.length - 1].start;
  const o = interpolate(frame, [6, 22, fin - 4, fin + 6], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 46, right: 34, width: 200, opacity: o, filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.95)) drop-shadow(0 0 10px rgba(0,0,0,0.9)) drop-shadow(0 6px 18px rgba(0,0,0,0.85))'}}>
      <Img src={staticFile(LOGO)} style={{width: '100%', display: 'block'}} />
    </div>
  );
};

// خلفية الجرافيك الكامل: كحلي مع وهج ونقاط ذهبية خفيفة
const GraphicBg: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, #16295A 0%, ${NAVY} 45%, #050A18 100%)`}}>
      {Array.from({length: 26}).map((_, i) => {
        const x = (i * 397) % 1080;
        const y = ((i * 613) % 1920) - ((frame * (0.6 + (i % 5) * 0.25)) % 1920);
        const yy = y < -20 ? y + 1940 : y;
        return <div key={i} style={{position: 'absolute', left: x, top: yy, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, borderRadius: 99, background: i % 4 ? GOLD : SKY, opacity: 0.25 + (i % 4) * 0.1}} />;
      })}
    </AbsoluteFill>
  );
};

// ───────── المشاهد ─────────
const ClipScene: React.FC<{seg: Extract<Seg, {kind: 'clip'}>}> = ({seg}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Footage src={seg.src} framing={seg.framing} />
      {seg.n ? <Header n={seg.n} title={seg.title ?? ''} /> : null}

      {seg.id === 'intro' ? (
        <>
          {/* ست نقاط = ست إرشادات */}
          <div style={{position: 'absolute', top: 470, left: 110, display: 'flex', flexDirection: 'column', gap: 22}}>
            {[1, 2, 3, 4, 5, 6].map((k) => {
              const p = spring({frame: frame - s(6.1) - k * 3, fps: FPS, config: {damping: 12}});
              return (
                <div key={k} style={{width: 72, height: 72, borderRadius: 99, border: `4px solid ${k % 2 ? GOLD : SKY}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily, fontWeight: 800, fontSize: 36, color: 'white', background: 'rgba(11,21,48,0.75)', transform: `scale(${p})`, boxShadow: `0 0 18px ${GOLD}66`}}>
                  {k}
                </div>
              );
            })}
          </div>
          {[1, 2, 3, 4, 5, 6].map((k) => <Sfx key={k} src="tick.wav" at={6.1 + k * 0.1} vol={0.35} />)}
        </>
      ) : null}

      {seg.id === 'time' ? (
        <>
          <Clock at={2.7} />
          <Sfx src="pop.wav" at={2.7} vol={0.45} />
          <Sfx src="tick.wav" at={2.9} vol={0.4} />
          <Sfx src="tick.wav" at={3.2} vol={0.4} />
        </>
      ) : null}

      {seg.id === 'id' ? (
        <>
          <CivilId at={2.1} />
          <Sfx src="swoosh-up.wav" at={2.0} vol={0.4} />
          <Sfx src="shimmer.wav" at={2.4} vol={0.18} />
        </>
      ) : null}

      {seg.id === 'tools' ? (
        <>
          <IconPop at={2.6} x={70} y={600} size={190}><Pen /></IconPop>
          <IconPop at={4.0} x={70} y={830} size={190}><Pencil /></IconPop>
          <IconPop at={4.8} x={70} y={1060} size={190}><Ruler /></IconPop>
          <IconPop at={5.6} x={70} y={1290} size={190}><Calculator /></IconPop>
          <Sfx src="pop.wav" at={5.6} vol={0.4} />
          <Sfx src="pop.wav" at={2.6} vol={0.4} />
          <Sfx src="pop.wav" at={4.0} vol={0.4} />
          <Sfx src="pop.wav" at={4.8} vol={0.4} />
        </>
      ) : null}

      {seg.id === 'ban' ? (
        <>
          <Warning from={0.2} to={2.0} />
          <Sfx src="impact.wav" at={0.15} vol={0.28} />
          <IconPop at={3.4} x={70} y={600} size={190}><Phone /></IconPop>
          <Cross at={4.2} x={75} y={605} size={180} />
          <IconPop at={4.9} x={70} y={830} size={190}><Watch /></IconPop>
          <Cross at={5.7} x={75} y={835} size={180} />
          <IconPop at={7.8} x={70} y={1060} size={190}><Papers /></IconPop>
          <Cross at={8.8} x={75} y={1065} size={180} />
          {[3.4, 4.9, 7.8].map((t) => <Sfx key={t} src="pop.wav" at={t} vol={0.4} />)}
          {[4.2, 5.7, 8.8].map((t) => <Sfx key={t} src="swoosh-down.wav" at={t} vol={0.3} />)}
        </>
      ) : null}

      {seg.id === 'self' ? (
        <>
          <IconPop at={1.7} x={60} y={620} size={220}><Books /></IconPop>
          <Sfx src="pop.wav" at={1.7} vol={0.4} />
        </>
      ) : null}

      {seg.id === 'cover' ? (
        <>
          <PaperIcon at={0.5} litAt={1.6} />
          <Sfx src="swoosh-up.wav" at={0.45} vol={0.35} />
          <Sfx src="shimmer.wav" at={1.6} vol={0.2} />
        </>
      ) : null}


      <Subtitles subs={seg.subs} />
    </AbsoluteFill>
  );
};


// العبارة الأولى: جرافيك كامل وصوت المعلمة فقط
const QuoteScene: React.FC<{seg: Extract<Seg, {kind: 'quote'}>}> = ({seg}) => {
  const frame = useCurrentFrame();
  const words: [string, number, boolean][] = [
    ['بالسعي', 0.05, false],
    ['والإرادة', 1.48, false],
    ['يتحقق', 2.56, false],
    ['النجاح', 3.94, true],
  ];
  const titleP = spring({frame: frame - s(4.75), fps: FPS, config: {damping: 14}});
  const lift = interpolate(frame, [s(4.6), s(5.1)], [0, -170], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <GraphicBg />
      <Audio src={staticFile(`footage/exam/${seg.src}`)} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl', transform: `translateY(${lift}px)`}}>
        <div style={{fontSize: 70, marginBottom: 20, filter: glow()}}>
          <svg viewBox="0 0 100 100" width="120"><path d="M50 6 L62 38 L96 38 L68 58 L79 92 L50 71 L21 92 L32 58 L4 38 L38 38 Z" fill={GOLD} /></svg>
        </div>
        {[0, 1].map((line) => (
          <div key={line} style={{display: 'flex', gap: 28, justifyContent: 'center', fontFamily, fontWeight: 900, lineHeight: 1.3}}>
            {words.slice(line * 2, line * 2 + 2).map(([w, at, gold]) => {
              const p = spring({frame: frame - s(at), fps: FPS, config: {damping: 13}});
              return (
                <span key={w} style={{fontSize: gold ? 150 : 112, color: gold ? GOLD : 'white', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 40}px) scale(${0.8 + p * 0.2})`, display: 'inline-block', textShadow: gold ? `0 0 36px ${GOLD}aa` : '0 4px 20px rgba(0,0,0,0.6)'}}>
                  {w}
                </span>
              );
            })}
          </div>
        ))}
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 1180, left: 0, right: 0, textAlign: 'center', direction: 'rtl', fontFamily, opacity: titleP, transform: `scale(${0.85 + titleP * 0.15})`}}>
        <div style={{display: 'inline-block', padding: '14px 56px', borderRadius: 999, border: `4px solid ${SKY}`, fontWeight: 900, fontSize: 76, color: 'white', boxShadow: `0 0 26px ${SKY}88`, background: 'rgba(11,21,48,0.6)'}}>إرشادات هامة</div>
      </div>
      <Sfx src="shimmer.wav" at={3.9} vol={0.25} />
      <Sfx src="pop.wav" at={4.75} vol={0.35} />
    </AbsoluteFill>
  );
};

// الربط: الأرقام من 1 إلى 6 وكل رقم عليه ✔
const CheckScene: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [s(1.5), s(1.9)], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <GraphicBg />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 220px)', gap: 40, direction: 'rtl'}}>
          {[1, 2, 3, 4, 5, 6].map((n) => {
            const at = 0.25 + (n - 1) * 0.17;
            const p = spring({frame: frame - s(at), fps: FPS, config: {damping: 12}});
            const c = spring({frame: frame - s(at) - 4, fps: FPS, config: {damping: 10}});
            return (
              <div key={n} style={{position: 'relative', width: 220, height: 220, borderRadius: 999, border: `5px solid ${SKY}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, background: 'rgba(11,21,48,0.7)'}}>
                <span style={{fontFamily, fontWeight: 300, fontSize: 140, color: 'transparent', WebkitTextStroke: `3px white`}}>{n}</span>
                <svg viewBox="0 0 100 100" width="110" style={{position: 'absolute', right: -14, bottom: -14, transform: `scale(${c})`, filter: glow()}}>
                  <circle cx="50" cy="50" r="44" fill={GOLD} />
                  <path d="M28 52 L44 67 L73 36" stroke={NAVY} strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 70, direction: 'rtl', fontFamily, fontWeight: 900, fontSize: 64, color: 'white', opacity: t, textAlign: 'center'}}>
          بتنظيمك والتزامك… <span style={{color: GOLD}}>يصبح النجاح أقرب</span>
        </div>
      </AbsoluteFill>
      {[1, 2, 3, 4, 5, 6].map((n) => <Sfx key={n} src="tick.wav" at={0.25 + (n - 1) * 0.17 + 0.13} vol={0.45} />)}
    </AbsoluteFill>
  );
};

const FinalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const a = spring({frame: frame - 6, fps: FPS, config: {damping: 14}});
  const b = interpolate(frame, [20, 36], [0, 1], {...clamp, easing: ease});
  const c = interpolate(frame, [34, 50], [0, 1], {...clamp, easing: ease});
  const fadeOut = interpolate(frame, [s(3.4) - 12, s(3.4)], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: fadeOut}}>
      <GraphicBg />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl', fontFamily, textAlign: 'center'}}>
        <div style={{width: 460, transform: `scale(${a})`, filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.95)) drop-shadow(0 0 16px rgba(0,0,0,0.9)) drop-shadow(0 10px 26px rgba(0,0,0,0.85))'}}><Img src={staticFile(LOGO)} style={{width: '100%', display: 'block'}} /></div>
        <div style={{fontWeight: 900, fontSize: 84, color: 'white', marginTop: 40, opacity: b}}>وزارة التربية</div>
        <div style={{fontWeight: 700, fontSize: 46, color: '#cfe9ff', marginTop: 50, opacity: c}}>بالتوفيق لجميع أبنائنا الطلبة</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ───────── الموسيقى ─────────
const SPEECH_VOL = 0.05; // خفيفة جداً تحت صوت المعلمة
const OPEN_VOL = 0.16; // في مشاهد الجرافيك بدون كلام
const musicVolume = (f: number) => {
  const tl = timeline();
  const total = totalFrames();
  const open = tl.filter((t) => t.seg.kind === 'check' || t.seg.kind === 'final');
  let v = SPEECH_VOL;
  for (const o of open) {
    const ramp = interpolate(f, [o.start - 6, o.start + 10, o.start + o.frames - 10, o.start + o.frames + 6], [0, 1, 1, 0], clamp);
    v = Math.max(v, SPEECH_VOL + (OPEN_VOL - SPEECH_VOL) * ramp);
  }
  const fadeIn = interpolate(f, [0, 20], [0, 1], clamp);
  const fadeOut = interpolate(f, [total - 30, total], [1, 0], clamp);
  return v * fadeIn * fadeOut;
};

export const ExamGuide: React.FC<{header?: HeaderStyle}> = ({header = 'A'}) => {
  return (
    <HeaderCtx.Provider value={header}>
    <AbsoluteFill style={{backgroundColor: BG}}>
      <Audio src={staticFile('c46/soft.mp3')} volume={musicVolume} />
      <TransitionSeries>
        {SEGS.map((seg, i) => (
          <Fragment key={seg.id}>
            {i > 0 ? <TransitionSeries.Transition presentation={blurDissolve()} timing={linearTiming({durationInFrames: XF})} /> : null}
            <TransitionSeries.Sequence durationInFrames={s(seg.dur)}>
              {seg.kind === 'clip' ? <ClipScene seg={seg} /> : null}
              {seg.kind === 'quote' ? <QuoteScene seg={seg} /> : null}
              {seg.kind === 'check' ? <CheckScene /> : null}
              {seg.kind === 'final' ? <FinalScene /> : null}
              {i > 0 ? <Sfx src="whoosh.wav" at={0} vol={0.32} /> : null}
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <CornerLogo />
    </AbsoluteFill>
    </HeaderCtx.Provider>
  );
};
