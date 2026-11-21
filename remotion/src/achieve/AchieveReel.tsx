import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {fontFamily} from '../reel/font';

// ريل «ملف الإنجاز بالذكاء الاصطناعي» — بصورة حقيقية (مو كرتون)
// نفس فكرة الفيديو المرجعي: واجهة لعبة + صندوق حوار + كتابة متحركة،
// بس الشخصية صورة جنان الحقيقية، والختام يدعو تكتبين «ملف» عشان تتعلمين الطريقة.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type ThemeName = 'pink' | 'navy' | 'clean';
export type AchieveProps = {theme: ThemeName};

type Theme = {
  bg1: string;
  bg2: string;
  grid: string;
  glow: string;
  accent: string;
  text: string;
  second: string;
  box: string;
  border: string;
  wipe: string;
  chip: string;
};

const THEMES: Record<ThemeName, Theme> = {
  // وردي ناعم بطابع اللعبة (أقرب للفيديو الأصلي)
  pink: {
    bg1: '#fdeef0', bg2: '#f6d3d9', grid: '#e7a0ab', glow: 'rgba(255,214,150,0.75)',
    accent: '#e8697a', text: '#3a2a4c', second: '#7b5ca8', box: '#fffafa', border: '#8a6cb0',
    wipe: '#2b2140', chip: '#ffe9ec',
  },
  // كحلي وذهبي (نفس ألوان صورتج)
  navy: {
    bg1: '#0a1736', bg2: '#13306e', grid: '#2c55b0', glow: 'rgba(90,150,255,0.55)',
    accent: '#f2c14e', text: '#ffffff', second: '#9cc0ff', box: 'rgba(12,28,70,0.92)', border: '#5b86ea',
    wipe: '#f2c14e', chip: 'rgba(255,255,255,0.1)',
  },
  // أبيض وأسود راقي (ستايل مجلة)
  clean: {
    bg1: '#faf7f2', bg2: '#efe8dd', grid: '#ddd3c4', glow: 'rgba(214,180,140,0.55)',
    accent: '#c4513f', text: '#1c1c1e', second: '#8a7358', box: '#ffffff', border: '#1c1c1e',
    wipe: '#1c1c1e', chip: '#f3ece2',
  },
};

type Visual = 'person' | 'scatter' | 'ai' | 'sort' | 'website' | 'cta' | 'end';
type Scene = {
  from: number; // ثواني
  to: number;
  kicker: string;
  headline: string;
  caption: string; // الكلمات بين [] تتلوّن
  visual: Visual;
  person?: {scale: number; x: number};
};

const SCENES: Scene[] = [
  {from: 0, to: 3.5, kicker: 'لين الحين', headline: 'ترتبين ملف الإنجاز بإيدج؟',
    caption: 'لين الحين ترتبين [ملف] [الإنجاز] بإيدج؟', visual: 'person', person: {scale: 1, x: 0}},
  {from: 3.5, to: 8.5, kicker: 'وبعدين', headline: 'تدورين الشواهد',
    caption: 'وبعدين راح تدورين [الصور] [والشواهد] بكل مكان، وما تدرين من وين تبدين', visual: 'scatter'},
  {from: 8.5, to: 12.5, kicker: 'بس الحين', headline: 'الذكاء الاصطناعي',
    caption: 'بس الحين ممكن تعطين [الذكاء] [الاصطناعي] الشواهد والصور', visual: 'ai'},
  {from: 12.5, to: 16, kicker: 'يقراها ويوزعها', headline: 'على المعايير',
    caption: 'ويقراها ويوزعها على [المعايير] المطلوبة', visual: 'sort'},
  {from: 16, to: 21, kicker: 'ويكتب لج', headline: 'وصف دقيق',
    caption: 'ويكتب لج [وصف] [دقيق] لكل شاهد وصورة، ويكون [بأسلوبج] إنتي', visual: 'person', person: {scale: 0.98, x: 0}},
  {from: 21, to: 26, kicker: 'وبدل ما يكون', headline: 'ورقي',
    caption: 'وبدل ما يكون ورقي، ممكن يكون [موقع] بشخصيتج وألوانج الخاصة', visual: 'website'},
  {from: 26, to: 30.5, kicker: 'وهذا كله', headline: 'بمساعدة الذكاء الاصطناعي',
    caption: 'وهذا كله بمساعدة الذكاء الاصطناعي، بدون [كود] وبدون [برمجة]', visual: 'person', person: {scale: 1.05, x: 150}},
  {from: 30.5, to: 35, kicker: 'وأنا', headline: 'سويت ملف إنجازي كذا',
    caption: 'وأنا سويت [ملف] [إنجازي] بهالطريقة، وحابة أعلمج شلون', visual: 'person', person: {scale: 1.15, x: 0}},
  {from: 35, to: 44, kicker: '', headline: 'دورج!',
    caption: 'اكتبي كلمة [«ملف»] بالتعليقات، وأعلمج خطوة بخطوة شلون تسوين ملف إنجاز مثل ملفي', visual: 'cta', person: {scale: 1, x: 0}},
  {from: 44, to: 47.5, kicker: '', headline: '', caption: '', visual: 'end'},
];

const NAME = 'أ. جنان المعيبف';
const sec = (s: number) => Math.round(s * FPS);
export const totalFrames = () => sec(SCENES[SCENES.length - 1].to);

// انتقالات بالمربعات (مثل الأصلي) عند بداية هالمشاهد
const WIPES = [2, 5, 8];

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ───────────── الخلفية ───────────── */

const Background: React.FC<{t: Theme}> = ({t}) => {
  const f = useCurrentFrame();
  const shift = (f * 2) % 80;
  const lines: React.ReactNode[] = [];
  // أرضية بمنظور (خطوط أفقية تتحرك للأمام + خطوط شعاعية)
  for (let i = 0; i < 14; i++) {
    const p = ((i * 80 + shift) / (14 * 80));
    const y = 1500 + Math.pow(p, 1.9) * 420;
    lines.push(<line key={'h' + i} x1={0} x2={1080} y1={y} y2={y} stroke={t.grid} strokeWidth={2} opacity={0.25 + p * 0.6} />);
  }
  for (let i = -12; i <= 12; i++) {
    lines.push(<line key={'v' + i} x1={540 + i * 22} y1={1500} x2={540 + i * 190} y2={1920} stroke={t.grid} strokeWidth={2} opacity={0.55} />);
  }
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${t.bg1} 0%, ${t.bg2} 100%)`}}>
      {/* نقاط صغيرة تلمع */}
      {new Array(40).fill(0).map((_, i) => {
        const x = random('sx' + i) * 1080;
        const y = random('sy' + i) * 1450;
        const tw = 0.25 + 0.75 * Math.abs(Math.sin(f / 18 + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 5, height: 5, borderRadius: 1, background: t.second, opacity: 0.25 * tw}} />;
      })}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <line x1={0} x2={1080} y1={1500} y2={1500} stroke={t.grid} strokeWidth={3} />
        {lines}
      </svg>
    </AbsoluteFill>
  );
};

const TopHud: React.FC<{t: Theme}> = ({t}) => {
  const f = useCurrentFrame();
  const p = f / totalFrames();
  return (
    <div style={{position: 'absolute', top: 70, left: 50, right: 50, display: 'flex', alignItems: 'center', gap: 18, direction: 'ltr'}}>
      <div style={{border: `3px solid ${t.border}`, borderRadius: 8, padding: '2px 12px', fontWeight: 900, fontSize: 26, color: t.text, background: t.box}}>LV 9</div>
      <div style={{width: 330, height: 22, border: `3px solid ${t.border}`, borderRadius: 6, background: t.box, overflow: 'hidden'}}>
        <div style={{width: `${p * 100}%`, height: '100%', background: `repeating-linear-gradient(90deg, ${t.accent} 0 14px, transparent 14px 18px)`}} />
      </div>
      <div style={{fontWeight: 800, fontSize: 22, color: t.accent}}>XP</div>
      <div style={{flex: 1}} />
      <div style={{fontWeight: 800, fontSize: 26, color: t.second, direction: 'rtl'}}>{NAME}</div>
    </div>
  );
};

const Equalizer: React.FC<{t: Theme; active: boolean}> = ({t, active}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 1590, left: 60, right: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      {new Array(44).fill(0).map((_, i) => {
        const n = active ? 0.25 + 0.75 * Math.abs(Math.sin(f / 3.1 + i * 1.7) * Math.cos(f / 5.3 + i * 0.6)) : 0.15;
        return <div key={i} style={{width: 10, height: 8 + n * 50, background: t.accent, opacity: 0.85, borderRadius: 2}} />;
      })}
    </div>
  );
};

/* ───────────── النصوص ───────────── */

const parseWords = (s: string) =>
  s.split(' ').filter(Boolean).map((w) => (w.startsWith('[') ? {w: w.slice(1, -1), hi: true} : {w, hi: false}));

const Headline: React.FC<{t: Theme; scene: Scene; local: number; dur: number}> = ({t, scene, local}) => {
  const {fps} = useVideoConfig();
  const k = spring({frame: local, fps, config: {damping: 14}});
  const h = spring({frame: local - 6, fps, config: {damping: 12, stiffness: 120}});
  if (!scene.headline) return null;
  const isCta = scene.visual === 'cta';
  return (
    <div style={{position: 'absolute', top: isCta ? 230 : 250, left: 60, right: 60, textAlign: 'center', direction: 'rtl'}}>
      {/* هالة خلف العنوان */}
      <div style={{position: 'absolute', left: 140, right: 140, top: 10, height: 230, borderRadius: '50%', background: t.glow, filter: 'blur(60px)', opacity: 0.8}} />
      {scene.kicker ? (
        <div style={{position: 'relative', fontSize: 46, fontWeight: 700, color: t.accent, opacity: k, transform: `translateY(${(1 - k) * 20}px)`}}>{scene.kicker}</div>
      ) : null}
      <div style={{position: 'relative', fontSize: isCta ? 150 : scene.headline.length > 16 ? 74 : 96, fontWeight: 900, color: scene.visual === 'website' ? t.text : t.second, lineHeight: 1.25,
        opacity: h, transform: `scale(${0.8 + 0.2 * h})`}}>
        {scene.visual === 'website' ? <Strike t={t} local={local} text={scene.headline} /> : scene.headline}
      </div>
    </div>
  );
};

const Strike: React.FC<{t: Theme; local: number; text: string}> = ({t, local, text}) => {
  const p = interpolate(local, [40, 52], [0, 1], clamp);
  const {fps} = useVideoConfig();
  const s = spring({frame: local - 54, fps, config: {damping: 10}});
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      <span style={{opacity: 1 - p * 0.45}}>{text}</span>
      <span style={{position: 'absolute', right: 0, top: '52%', height: 10, width: `${p * 100}%`, background: t.accent, borderRadius: 5}} />
      <div style={{position: 'absolute', left: '50%', top: '118%', transform: `translateX(-50%) scale(${s})`, whiteSpace: 'nowrap', fontSize: 88, color: t.accent}}>موقع بشخصيتج!</div>
    </span>
  );
};

const Avatar: React.FC<{t: Theme; size: number}> = ({t, size}) => (
  <div style={{width: size, height: size, borderRadius: 14, border: `4px solid ${t.border}`, background: `${t.chip} url(${staticFile('achieve/jenan_cut.png')})`,
    backgroundSize: '230%', backgroundPosition: '50% 8%', flexShrink: 0}} />
);

const DialogBox: React.FC<{t: Theme; scene: Scene; local: number; dur: number}> = ({t, scene, local, dur}) => {
  const words = parseWords(scene.caption);
  const shown = interpolate(local, [3, Math.max(6, dur * 0.72)], [0, words.length], clamp);
  const blink = Math.floor(local / 8) % 2 === 0;
  if (!scene.caption) return null;
  return (
    <div style={{position: 'absolute', top: 1290, left: 50, right: 50, height: 200, background: t.box, border: `5px solid ${t.border}`, borderRadius: 18,
      boxShadow: `8px 8px 0 ${t.grid}`, display: 'flex', alignItems: 'center', gap: 26, padding: '0 34px', direction: 'rtl'}}>
      <div style={{position: 'absolute', top: -26, right: 34, background: t.accent, color: '#fff', fontWeight: 900, fontSize: 24, padding: '2px 18px', borderRadius: 8}}>جنان</div>
      <div style={{flex: 1, fontSize: 44, fontWeight: 700, color: t.text, lineHeight: 1.45}}>
        {words.map((w, i) => {
          const o = Math.max(0, Math.min(1, shown - i));
          if (o <= 0) return null;
          return (
            <span key={i} style={{opacity: o, color: w.hi ? t.accent : t.text, textDecoration: w.hi ? `underline dotted ${t.accent}` : undefined, textUnderlineOffset: 10}}>
              {w.w}{' '}
            </span>
          );
        })}
        <span style={{display: 'inline-block', width: 12, height: 40, background: t.accent, opacity: blink ? 1 : 0, verticalAlign: 'middle'}} />
      </div>
      <Avatar t={t} size={140} />
    </div>
  );
};

/* ───────────── الأيقونات (رسومات مسطحة مو كرتون) ───────────── */

const PhotoCard: React.FC<{t: Theme; size?: number; hue?: number}> = ({t, size = 170, hue = 0}) => (
  <svg width={size} height={size * 1.12} viewBox="0 0 100 112">
    <rect x={3} y={3} width={94} height={106} rx={6} fill="#fff" stroke={t.border} strokeWidth={3} />
    <rect x={11} y={11} width={78} height={66} rx={3} fill={`hsl(${200 + hue},70%,80%)`} />
    <circle cx={70} cy={28} r={8} fill="#ffd36b" />
    <path d="M11 77 L38 46 L56 66 L66 56 L89 77 Z" fill={`hsl(${150 + hue},40%,55%)`} />
    <rect x={18} y={88} width={64} height={6} rx={3} fill={t.grid} />
  </svg>
);

const Certificate: React.FC<{t: Theme; size?: number}> = ({t, size = 190}) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 120 96">
    <rect x={3} y={3} width={114} height={80} rx={6} fill="#fffdf6" stroke={t.border} strokeWidth={3} />
    <rect x={10} y={10} width={100} height={66} rx={3} fill="none" stroke="#e3c27a" strokeWidth={2} />
    <rect x={30} y={22} width={60} height={6} rx={3} fill={t.second} />
    <rect x={22} y={36} width={76} height={4} rx={2} fill={t.grid} />
    <rect x={22} y={46} width={60} height={4} rx={2} fill={t.grid} />
    <circle cx={92} cy={70} r={14} fill="#e9b949" stroke="#c48f1d" strokeWidth={3} />
    <path d="M84 80 L80 94 L88 90 L92 96 L94 82 Z" fill={t.accent} />
  </svg>
);

const AIChip: React.FC<{t: Theme; size?: number; glow?: number}> = ({t, size = 260, glow = 1}) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{filter: `drop-shadow(0 0 ${20 * glow}px ${t.accent})`}}>
    {[30, 50, 70, 90].map((p) => (
      <g key={p}>
        <rect x={p - 3} y={4} width={6} height={14} rx={2} fill={t.border} />
        <rect x={p - 3} y={102} width={6} height={14} rx={2} fill={t.border} />
        <rect x={4} y={p - 3} width={14} height={6} rx={2} fill={t.border} />
        <rect x={102} y={p - 3} width={14} height={6} rx={2} fill={t.border} />
      </g>
    ))}
    <rect x={16} y={16} width={88} height={88} rx={16} fill={t.second} stroke={t.border} strokeWidth={4} />
    <text x={60} y={74} textAnchor="middle" fontSize={40} fontWeight={900} fill="#fff" fontFamily="Cairo">AI</text>
    <path d="M88 28 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" fill="#ffd36b" />
  </svg>
);

const Folder: React.FC<{color: string; label: string; t: Theme; count: number}> = ({color, label, t, count}) => (
  <div style={{position: 'relative', width: 250, height: 230}}>
    <svg width={250} height={200} viewBox="0 0 125 100" style={{position: 'absolute', bottom: 0}}>
      <path d="M4 18 Q4 10 12 10 L44 10 L54 20 L113 20 Q121 20 121 28 L121 90 Q121 96 115 96 L10 96 Q4 96 4 90 Z" fill={color} stroke={t.border} strokeWidth={3} />
      <rect x={4} y={32} width={117} height={64} rx={6} fill={color} stroke={t.border} strokeWidth={3} style={{filter: 'brightness(1.12)'}} />
    </svg>
    <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontSize: 34, fontWeight: 900, color: '#fff', direction: 'rtl'}}>{label}</div>
    <div style={{position: 'absolute', top: 16, left: 14, background: '#fff', border: `3px solid ${t.border}`, borderRadius: 20, minWidth: 44, textAlign: 'center', fontWeight: 900, fontSize: 26, color: t.text}}>{count}</div>
  </div>
);

const Laptop: React.FC<{t: Theme; local: number}> = ({t, local}) => {
  const {fps} = useVideoConfig();
  const build = (d: number) => spring({frame: local - 58 - d, fps, config: {damping: 13}});
  const sw = ['#e8697a', '#7b5ca8', '#f2c14e', '#5fb7a3'];
  return (
    <div style={{position: 'relative', width: 640, height: 450}}>
      <div style={{position: 'absolute', left: 40, right: 40, top: 0, height: 380, background: '#2b2140', borderRadius: 22, padding: 18}}>
        <div style={{width: '100%', height: '100%', background: '#fff', borderRadius: 10, overflow: 'hidden', direction: 'rtl', padding: 18, boxSizing: 'border-box'}}>
          <div style={{display: 'flex', gap: 8, transform: `scaleX(${build(0)})`, transformOrigin: 'right'}}>
            <div style={{width: 60, height: 60, borderRadius: 30, background: `url(${staticFile('achieve/jenan_cut.png')}) 50% 8% / 230% ${t.chip}`}} />
            <div style={{flex: 1}}>
              <div style={{fontSize: 24, fontWeight: 900, color: t.text}}>ملف إنجاز {NAME}</div>
              <div style={{height: 8, width: '60%', background: t.grid, borderRadius: 4, marginTop: 6}} />
            </div>
          </div>
          <div style={{display: 'flex', gap: 12, marginTop: 18}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{flex: 1, height: 150, borderRadius: 10, background: sw[i], opacity: 0.9 * build(6 + i * 5), transform: `translateY(${(1 - build(6 + i * 5)) * 40}px)`}} />
            ))}
          </div>
          <div style={{display: 'flex', gap: 10, marginTop: 16, transform: `scale(${build(24)})`, transformOrigin: 'right'}}>
            {sw.map((c) => <div key={c} style={{width: 36, height: 36, borderRadius: 18, background: c, border: '3px solid #fff', boxShadow: '0 0 0 2px #ccc'}} />)}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, height: 40, background: t.border, borderRadius: '0 0 30px 30px'}} />
    </div>
  );
};

/* ───────────── المشاهد ───────────── */

const Person: React.FC<{t: Theme; scene: Scene; local: number; dur: number}> = ({t, scene, local, dur}) => {
  const {fps} = useVideoConfig();
  const inn = spring({frame: local, fps, config: {damping: 15}});
  const out = interpolate(local, [dur - 6, dur], [1, 1], clamp);
  const pp = scene.person ?? {scale: 1, x: 0};
  const zoom = interpolate(local, [0, dur], [pp.scale, pp.scale + 0.05]);
  const bob = Math.sin(local / 14) * 6;
  const h = scene.visual === 'cta' ? 600 : 700;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 1920 - 1300, display: 'flex', justifyContent: 'center', opacity: inn * out}}>
      <div style={{position: 'absolute', bottom: 60, width: 620, height: 520, borderRadius: '50%', background: t.glow, filter: 'blur(70px)'}} />
      <Img src={staticFile('achieve/jenan_cut.png')} style={{height: h, transform: `translate(${pp.x}px, ${bob + (1 - inn) * 80}px) scale(${zoom})`, transformOrigin: 'bottom center',
        filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.25))', WebkitMaskImage: 'linear-gradient(180deg, #000 82%, transparent 100%)'}} />
    </div>
  );
};

const Pop: React.FC<{delay: number; local: number; x: number; y: number; rot?: number; children: React.ReactNode}> = ({delay, local, x, y, rot = 0, children}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: local - delay, fps, config: {damping: 9, stiffness: 140}});
  const bob = Math.sin((local + delay * 3) / 12) * 8;
  return <div style={{position: 'absolute', left: x, top: y + bob, transform: `translate(-50%,-50%) scale(${s}) rotate(${rot * s}deg)`}}>{children}</div>;
};

const SceneVisual: React.FC<{t: Theme; scene: Scene; local: number; dur: number}> = ({t, scene, local, dur}) => {
  const {fps} = useVideoConfig();
  switch (scene.visual) {
    case 'person':
      return (
        <>
          <Person t={t} scene={scene} local={local} dur={dur} />
          {scene.headline.startsWith('ترتبين') ? (
            <Pop delay={14} local={local} x={880} y={760} rot={10}><Folder color={t.accent} label="" t={t} count={0} /></Pop>
          ) : null}
          {scene.headline === 'وصف دقيق' ? <Chips t={t} local={local} items={['لكل شاهد', 'وصورة', 'بأسلوبج إنتي']} /> : null}
          {scene.headline.startsWith('بمساعدة') ? <ZeroCard t={t} local={local} /> : null}
          {scene.headline.startsWith('سويت') ? (
            <Pop delay={20} local={local} x={870} y={800} rot={-8}><Certificate t={t} size={220} /></Pop>
          ) : null}
        </>
      );
    case 'scatter': {
      const items = [
        {x: 260, y: 640, r: -12, d: 6, el: <PhotoCard t={t} hue={0} />},
        {x: 790, y: 690, r: 10, d: 14, el: <Certificate t={t} />},
        {x: 540, y: 900, r: -4, d: 24, el: <PhotoCard t={t} hue={60} size={200} />},
        {x: 230, y: 1080, r: 8, d: 34, el: <Certificate t={t} size={170} />},
        {x: 850, y: 1060, r: -10, d: 44, el: <PhotoCard t={t} hue={120} />},
        {x: 560, y: 1180, r: 14, d: 56, el: <PhotoCard t={t} hue={250} size={140} />},
      ];
      return <>{items.map((it, i) => <Pop key={i} delay={it.d} local={local} x={it.x} y={it.y} rot={it.r}>{it.el}</Pop>)}</>;
    }
    case 'ai': {
      const pulse = 0.6 + 0.4 * Math.abs(Math.sin(local / 8));
      return (
        <>
          <Pop delay={4} local={local} x={540} y={900}><AIChip t={t} size={320} glow={pulse} /></Pop>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const start = 18 + i * 12;
            const p = interpolate(local, [start, start + 22], [0, 1], clamp);
            const ang = (i / 6) * Math.PI * 2 + 0.4;
            const x = 540 + Math.cos(ang) * 470 * (1 - p);
            const y = 900 + Math.sin(ang) * 420 * (1 - p);
            return (
              <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${1 - p * 0.75}) rotate(${(1 - p) * 30}deg)`, opacity: local < start ? 0 : 1 - p * 0.9}}>
                {i % 2 ? <Certificate t={t} size={150} /> : <PhotoCard t={t} size={130} hue={i * 40} />}
              </div>
            );
          })}
        </>
      );
    }
    case 'sort': {
      const cols = [
        {x: 220, c: t.accent, l: 'معيار ١'},
        {x: 540, c: t.second, l: 'معيار ٢'},
        {x: 860, c: '#e3a93c', l: 'معيار ٣'},
      ];
      return (
        <>
          <Pop delay={0} local={local} x={540} y={640}><AIChip t={t} size={170} glow={0.6} /></Pop>
          {cols.map((c, i) => (
            <Pop key={i} delay={6 + i * 5} local={local} x={c.x} y={1080}>
              <Folder color={c.c} label={c.l} t={t} count={Math.min(3, Math.max(0, Math.floor((local - 20 - i * 6) / 14)))} />
            </Pop>
          ))}
          {new Array(9).fill(0).map((_, k) => {
            const col = k % 3;
            const start = 20 + col * 6 + Math.floor(k / 3) * 14;
            const p = interpolate(local, [start, start + 14], [0, 1], clamp);
            if (p <= 0 || p >= 1) return null;
            const x = interpolate(p, [0, 1], [540, cols[col].x]);
            const y = interpolate(p, [0, 1], [700, 1030]) - Math.sin(p * Math.PI) * 120;
            return <div key={k} style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%) scale(0.55)'}}><PhotoCard t={t} size={140} hue={k * 30} /></div>;
          })}
        </>
      );
    }
    case 'website':
      return (
        <div style={{position: 'absolute', left: 220, top: 760, transform: `scale(${spring({frame: local - 50, fps, config: {damping: 12}})})`}}>
          <Laptop t={t} local={local} />
        </div>
      );
    case 'cta':
      return (
        <>
          <Person t={t} scene={scene} local={local} dur={dur} />
          <CtaPill t={t} local={local} />
        </>
      );
    default:
      return null;
  }
};

const Chips: React.FC<{t: Theme; local: number; items: string[]}> = ({t, local, items}) => {
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20, direction: 'rtl'}}>
      {items.map((it, i) => {
        const s = spring({frame: local - 30 - i * 22, fps, config: {damping: 10}});
        return (
          <div key={it} style={{transform: `scale(${s})`, background: t.box, border: `4px solid ${t.border}`, borderRadius: 12, padding: '4px 24px', fontSize: 40, fontWeight: 800,
            color: i === 2 ? t.accent : t.text, boxShadow: `5px 5px 0 ${t.grid}`}}>{it}</div>
        );
      })}
    </div>
  );
};

const ZeroCard: React.FC<{t: Theme; local: number}> = ({t, local}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: local - 40, fps, config: {damping: 11}});
  const bars = Math.floor(interpolate(local, [50, 90], [5, 0], clamp));
  return (
    <div style={{position: 'absolute', top: 640, left: 30, width: 470, transform: `scale(${s}) rotate(-4deg)`, background: t.box, border: `4px solid ${t.accent}`, borderRadius: 14,
      padding: '14px 28px', direction: 'rtl', boxShadow: `6px 6px 0 ${t.grid}`}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{fontSize: 40, fontWeight: 900, color: t.text}}>الكود والبرمجة</div>
        <div style={{display: 'flex', gap: 6, direction: 'ltr'}}>
          {new Array(5).fill(0).map((_, i) => <div key={i} style={{width: 26, height: 22, background: i < bars ? t.grid : 'transparent', border: `2px solid ${t.grid}`}} />)}
        </div>
      </div>
      <div style={{fontSize: 52, fontWeight: 900, color: t.accent}}>صفر</div>
    </div>
  );
};

const CtaPill: React.FC<{t: Theme; local: number}> = ({t, local}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: local - 20, fps, config: {damping: 10}});
  const sub = spring({frame: local - 45, fps, config: {damping: 14}});
  const nudge = Math.sin(local / 5) * 8;
  return (
    <>
      <div style={{position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', direction: 'rtl'}}>
        <div style={{transform: `scale(${s})`, background: t.chip, border: `5px solid ${t.accent}`, borderRadius: 16, padding: '8px 34px', fontSize: 52, fontWeight: 900, color: t.text,
          display: 'flex', gap: 18, alignItems: 'center', boxShadow: `6px 6px 0 ${t.grid}`}}>
          <span style={{color: t.accent, transform: `translateX(${nudge}px)`, display: 'inline-block'}}>◀</span> اكتبي «ملف» بالتعليقات
        </div>
      </div>
      <div style={{position: 'absolute', top: 610, left: 80, right: 80, textAlign: 'center', fontSize: 40, fontWeight: 700, color: t.text, opacity: sub, direction: 'rtl', lineHeight: 1.4}}>
        وأعلمج شلون تسوين ملف إنجاز <span style={{color: t.accent}}>مثل ملفي</span>
      </div>
    </>
  );
};

const EndCard: React.FC<{t: Theme; local: number}> = ({t, local}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: local, fps, config: {damping: 13}});
  const fade = interpolate(local, [70, 100], [1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', direction: 'rtl', opacity: fade}}>
      <div style={{transform: `scale(${s})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        <div style={{width: 300, height: 300, borderRadius: 150, border: `8px solid ${t.accent}`, background: `url(${staticFile('achieve/jenan_cut.png')}) 50% 10% / 200% ${t.chip}`, boxShadow: `0 0 60px ${t.glow}`}} />
        <div style={{fontSize: 80, fontWeight: 900, color: t.text}}>{NAME}</div>
        <div style={{fontSize: 44, fontWeight: 700, color: t.second}}>ملف الإنجاز بالذكاء الاصطناعي</div>
        <div style={{marginTop: 20, background: t.accent, color: '#fff', fontSize: 48, fontWeight: 900, padding: '10px 40px', borderRadius: 14}}>اكتبي «ملف» بالتعليقات</div>
      </div>
    </AbsoluteFill>
  );
};

/* ───────────── الانتقال بالمربعات ───────────── */

const PixelWipe: React.FC<{t: Theme; at: number}> = ({t, at}) => {
  const f = useCurrentFrame();
  const local = f - at;
  if (local < -12 || local > 14) return null;
  const cols = 12;
  const rows = 22;
  const size = 1080 / cols;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const d = (c + r) / (cols + rows); // قطري
      const p = local < 0 ? interpolate(local, [-12, 0], [0, 1]) : interpolate(local, [0, 14], [1, 0]);
      const k = Math.max(0, Math.min(1, (p - d * 0.5) * 2.2 + (local < 0 ? 0 : 0)));
      if (k <= 0) continue;
      cells.push(<div key={r * cols + c} style={{position: 'absolute', left: c * size, top: r * size, width: size, height: size, transform: `scale(${k * 1.02})`, background: t.wipe}} />);
    }
  }
  return <AbsoluteFill>{cells}</AbsoluteFill>;
};

/* ───────────── الصوت ───────────── */

const Sfx: React.FC = () => {
  const out: React.ReactNode[] = [];
  SCENES.forEach((s, i) => {
    const st = sec(s.from);
    if (i > 0) out.push(<Sequence key={'w' + i} from={Math.max(0, st - 8)} durationInFrames={30}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /></Sequence>);
    // نقرات كيبورد خفيفة مع الكتابة
    const words = s.caption ? parseWords(s.caption).length : 0;
    const dur = sec(s.to - s.from);
    for (let w = 0; w < words; w++) {
      const fr = st + 3 + Math.round((w / Math.max(1, words)) * (dur * 0.72 - 3));
      out.push(<Sequence key={`k${i}-${w}`} from={fr} durationInFrames={8}><Audio src={staticFile(`sfx/key${w % 4}.wav`)} volume={0.22} /></Sequence>);
    }
  });
  out.push(<Sequence key="pop-cta" from={sec(35) + 20} durationInFrames={30}><Audio src={staticFile('sfx/pop.wav')} volume={0.6} /></Sequence>);
  out.push(<Sequence key="sh" from={sec(44)} durationInFrames={60}><Audio src={staticFile('sfx/shimmer.wav')} volume={0.5} /></Sequence>);
  return <>{out}</>;
};

/* ───────────── التجميع ───────────── */

export const AchieveReel: React.FC<AchieveProps> = ({theme}) => {
  const t = THEMES[theme] ?? THEMES.pink;
  const f = useCurrentFrame();
  const total = totalFrames();
  const musicVol = (fr: number) => 0.32 * interpolate(fr, [0, 10, total - 45, total], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{fontFamily, overflow: 'hidden'}}>
      <Background t={t} />
      {SCENES.map((s, i) => {
        const from = sec(s.from);
        const dur = sec(s.to) - from;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneLayer t={t} scene={s} dur={dur} />
          </Sequence>
        );
      })}
      <TopHud t={t} />
      <Equalizer t={t} active={f < sec(44)} />
      {WIPES.map((i) => <PixelWipe key={i} t={t} at={sec(SCENES[i].from)} />)}
      <Audio src={staticFile('music/background.wav')} volume={musicVol} />
      <Sfx />
    </AbsoluteFill>
  );
};

const SceneLayer: React.FC<{t: Theme; scene: Scene; dur: number}> = ({t, scene, dur}) => {
  const local = useCurrentFrame();
  if (scene.visual === 'end') return <EndCard t={t} local={local} />;
  return (
    <AbsoluteFill>
      <SceneVisual t={t} scene={scene} local={local} dur={dur} />
      <Headline t={t} scene={scene} local={local} dur={dur} />
      <DialogBox t={t} scene={scene} local={local} dur={dur} />
    </AbsoluteFill>
  );
};
