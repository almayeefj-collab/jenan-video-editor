// فيديو تشويقي لورشة «معلم 4.0» (16:9، ~72 ثانية)
// الفكرة: كل ثورة صناعية يقابلها إصدار من المعلم، والجواب في النهاية: لهذا سمّيناها «معلم 4.0»
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import React, {Fragment} from 'react';
import {
  AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig,
} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';
import {zoomBlur} from '../reel/zoomBlur';
import {CYAN, GOLD, INK} from './config';

export const PROMO_FPS = 30;
const T = 15; // طول الانتقال
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const shadow = '0 6px 30px rgba(0,0,0,0.7)';

type Pair = {
  step: 1 | 2 | 3 | 4; year: number | null; from: number;
  ind: {img: string; label: string; title: string; line: string};
  tch: {img: string; title: string; line: string};
  accent: string;
};

const PAIRS: Pair[] = [
  {step: 1, year: 1784, from: 1700, accent: GOLD,
    ind: {img: 'teacher4/clips/c1.mp4', label: 'الثورة الصناعية الأولى', title: 'البخار', line: 'الآلة تعمل بدل اليد'},
    tch: {img: 'teacher4/clips/c5.mp4', title: 'ناقل المعرفة', line: 'سبورة وطباشير… والطالب يحفظ'}},
  {step: 2, year: 1870, from: 1784, accent: '#F2C94C',
    ind: {img: 'teacher4/clips/c2.mp4', label: 'الثورة الصناعية الثانية', title: 'الكهرباء', line: 'خطوط إنتاج ضخمة'},
    tch: {img: 'teacher4/clips/c6.mp4', title: 'مستخدم الوسائل', line: 'جهاز العرض والصوت والصورة'}},
  {step: 3, year: 1969, from: 1870, accent: '#6B9BFF',
    ind: {img: 'teacher4/clips/c3.mp4', label: 'الثورة الصناعية الثالثة', title: 'الحاسوب', line: 'الأتمتة والمعلومات'},
    tch: {img: 'teacher4/clips/c7.mp4', title: 'المعلم الرقمي', line: 'سبورة تفاعلية ومنصات وإنترنت'}},
  {step: 4, year: null, from: 1969, accent: CYAN,
    ind: {img: 'teacher4/clips/c4.mp4', label: 'الثورة الصناعية الرابعة', title: 'الذكاء الاصطناعي', line: 'آلات تتعلّم وتقرّر'},
    tch: {img: 'teacher4/clips/c8.mp4', title: 'المصمّم والقائد', line: 'يقود التقنية… ولا تقوده'}},
];

type Scene = {kind: 'hook' | 'intro' | 'answer' | 'qualities' | 'outro'; sec: number} | {kind: 'pair'; pair: Pair; sec: number};
const SCENES: Scene[] = [
  {kind: 'hook', sec: 6},
  {kind: 'intro', sec: 5},
  ...PAIRS.map((pair) => ({kind: 'pair' as const, pair, sec: 10})),
  {kind: 'answer', sec: 9},
  {kind: 'qualities', sec: 8},
  {kind: 'outro', sec: 8},
];
const frames = (s: Scene) => Math.round(s.sec * PROMO_FPS);
export const promoFrames = () => SCENES.reduce((n, s) => n + frames(s), 0) - T * (SCENES.length - 1);

/* ---------- shared pieces ---------- */
const useReveal = (delay: number, dur = 16, dy = 40) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 12}px)`, transform: `translateY(${(1 - p) * dy}px)`};
};
const useExit = (total: number) => interpolate(useCurrentFrame(), [total - T - 10, total - T + 2], [1, 0], clamp);

// مقطع فيديو متحرك (مولّد بـ Kling، 5 ثواني) يُبطّأ ليغطي المشهد، مع اقتراب بطيء
const CLIP_SEC = 5;
const Ken: React.FC<{src: string; total: number; dir?: 1 | -1; grade?: string; blur?: number}> = ({src, total, dir = 1, grade, blur = 0}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, total], [1.02, 1.1]);
  const x = interpolate(f, [0, total], [0, 1 * dir]);
  const rate = Math.min(1, (CLIP_SEC * PROMO_FPS - 2) / total);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: INK}}>
      <OffthreadVideo src={staticFile(src)} muted playbackRate={rate} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s}) translateX(${x}%)`, filter: `${grade ?? ''} blur(${blur}px)`}} />
    </AbsoluteFill>
  );
};

// جزيئات ضوء تطفو للأعلى
const Particles: React.FC<{color?: string; n?: number}> = ({color = CYAN, n = 46}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}, (_, i) => {
        const x = random(`x${i}`) * 1920;
        const speed = 0.6 + random(`s${i}`) * 1.6;
        const y = (1080 + 40 - ((f * speed + random(`y${i}`) * 1200) % 1200));
        const r = 1.5 + random(`r${i}`) * 3.5;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f / (12 + i) + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: color, opacity: 0.55 * tw, boxShadow: `0 0 ${r * 4}px ${color}`}} />;
      })}
    </AbsoluteFill>
  );
};

// حبيبات فيلم خفيفة
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.09, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="1920" height="1080">
        <filter id={`g${f % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 6} /></filter>
        <rect width="1920" height="1080" filter={`url(#g${f % 6})`} />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />;

// نص بتأثير glitch (طبقات أحمر وسماوي)
const Glitch: React.FC<{children: string; size: number; color: string; font: string; on: boolean}> = ({children, size, color, font, on}) => {
  const f = useCurrentFrame();
  const j = on ? (random(`gl${f}`) - 0.5) * 18 : 0;
  const base: React.CSSProperties = {fontFamily: font, fontSize: size, fontWeight: 900, lineHeight: 1, position: 'absolute', inset: 0, direction: 'ltr'};
  return (
    <div style={{position: 'relative', display: 'inline-block'}}>
      <div style={{...base, position: 'relative', color, textShadow: `0 0 40px ${color}aa`}}>{children}</div>
      {on ? (
        <>
          <div style={{...base, color: '#FF2E63', opacity: 0.7, transform: `translate(${j}px, ${-j / 3}px)`, mixBlendMode: 'screen'}}>{children}</div>
          <div style={{...base, color: '#22D3EE', opacity: 0.7, transform: `translate(${-j}px, ${j / 3}px)`, mixBlendMode: 'screen'}}>{children}</div>
        </>
      ) : null}
    </div>
  );
};

const sfx = (file: string, from: number, vol: number, dur = 90) => (
  <Sequence from={from} durationInFrames={dur}><Audio src={staticFile(`sfx/${file}`)} volume={vol} /></Sequence>
);

/* ---------- scenes ---------- */
const Hook: React.FC<{total: number}> = ({total}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const q = 'ليش سمّيناها…';
  const typed = Math.floor(interpolate(f, [8, 44], [0, q.length], clamp));
  const slam = spring({frame: f - 72, fps, config: {damping: 11, mass: 0.8}});
  const flash = interpolate(f, [72, 76, 90], [0, 0.8, 0], clamp);
  const shake = f >= 72 && f < 84 ? (random(`sh${f}`) - 0.5) * 22 : 0;
  const exit = useExit(total);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at center, #121c3c 0%, ${INK} 70%)`}}>
      <Particles n={30} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl', opacity: exit, transform: `translate(${shake}px, ${shake / 2}px)`}}>
        <div style={{fontFamily, fontSize: 64, fontWeight: 600, color: 'rgba(255,255,255,0.85)', height: 100}}>
          {q.slice(0, typed)}
          <span style={{opacity: f < 60 && Math.floor(f / 8) % 2 ? 1 : 0, color: CYAN}}>|</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 36, marginTop: 10}}>
          <span style={{fontFamily, fontSize: 170, fontWeight: 900, color: '#fff', ...useReveal(54, 14)}}>معلم</span>
          <div style={{opacity: slam, transform: `scale(${interpolate(slam, [0, 1], [3, 1])})`}}>
            <Glitch size={210} color={CYAN} font={numberFamily} on={f > 72 && f < 100}>4.0</Glitch>
          </div>
          <span style={{fontFamily, fontSize: 170, fontWeight: 900, color: GOLD, ...useReveal(104, 10)}}>؟</span>
        </div>
        <div style={{fontFamily, fontSize: 38, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginTop: 40, ...useReveal(120)}}>الجواب يبدأ… قبل 250 سنة</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      {Array.from({length: q.length}, (_, i) => sfx(`key${i % 4}.wav`, 8 + Math.round((i * 36) / q.length), 0.5, 6))}
      {sfx('cinematic-riser.wav', 46, 0.45)}
      {sfx('cinematic-boom.wav', 72, 0.7)}
      {sfx('impact.wav', 104, 0.4)}
    </AbsoluteFill>
  );
};

const Intro: React.FC<{total: number}> = ({total}) => {
  const exit = useExit(total);
  const words = ['من', 'البخار…', 'إلى', 'الذكاء', 'الاصطناعي'];
  return (
    <AbsoluteFill>
      <Ken src="teacher4/clips/c0.mp4" total={total} grade="contrast(1.08) saturate(1.1)" />
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(4,8,18,0.9), rgba(4,8,18,0.2) 60%)'}} />
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 130, direction: 'rtl', opacity: exit}}>
        <div style={{display: 'flex', gap: 26}}>
          {words.map((w, i) => (
            <span key={i} style={{fontFamily, fontSize: 108, fontWeight: 900, color: i >= 3 ? CYAN : '#fff', textShadow: shadow, ...useReveal(6 + i * 7, 14, 60)}}>{w}</span>
          ))}
        </div>
        <div style={{fontFamily, fontSize: 44, fontWeight: 600, color: GOLD, marginTop: 18, textShadow: shadow, ...useReveal(50)}}>
          أربع ثورات غيّرت العالم… وغيّرت المعلم معها
        </div>
      </AbsoluteFill>
      {sfx('shimmer.wav', 6, 0.35)}
    </AbsoluteFill>
  );
};

const Steps: React.FC<{step: number; accent: string}> = ({step, accent}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', bottom: 46, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center', direction: 'ltr', ...useReveal(10)}}>
      {[1, 2, 3, 4].map((n) => (
        <Fragment key={n}>
          {n > 1 ? <div style={{width: 90, height: 3, background: n <= step ? accent : 'rgba(255,255,255,0.25)', boxShadow: n <= step ? `0 0 10px ${accent}` : undefined}} /> : null}
          <div style={{
            fontFamily: numberFamily, fontWeight: 700, fontSize: 26, padding: '4px 16px', borderRadius: 99,
            color: n <= step ? INK : 'rgba(255,255,255,0.6)', background: n <= step ? accent : 'rgba(10,15,40,0.6)',
            border: `2px solid ${n <= step ? accent : 'rgba(255,255,255,0.3)'}`,
            boxShadow: n === step ? `0 0 ${18 + Math.sin(f / 5) * 8}px ${accent}` : undefined,
          }}>{n}.0</div>
        </Fragment>
      ))}
    </div>
  );
};

const Hud: React.FC<{color: string}> = ({color}) => {
  const f = useCurrentFrame();
  const c = (pos: React.CSSProperties, rot: number) => (
    <div style={{position: 'absolute', width: 70, height: 70, borderTop: `3px solid ${color}`, borderLeft: `3px solid ${color}`, transform: `rotate(${rot}deg)`, opacity: 0.8, ...pos}} />
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `repeating-linear-gradient(0deg, rgba(34,211,238,0.06) 0 2px, transparent 2px 5px)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, height: 160, top: ((f * 9) % 1300) - 160, background: `linear-gradient(to bottom, transparent, ${color}22, transparent)`}} />
      {c({top: 30, left: 30}, 0)}{c({top: 30, right: 30}, 90)}{c({bottom: 30, right: 30}, 180)}{c({bottom: 30, left: 30}, 270)}
    </AbsoluteFill>
  );
};

const PairScene: React.FC<{p: Pair; total: number}> = ({p, total}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = useExit(total);
  const SPLIT = 110;
  const sp = interpolate(f, [SPLIT, SPLIT + 26], [0, 1], {...clamp, easing: ease});
  const indW = interpolate(sp, [0, 1], [1920, 960]);
  const year = p.year ? Math.round(interpolate(f, [8, 48], [p.from, p.year], {...clamp, easing: Easing.out(Easing.cubic)})) : null;
  const badge = spring({frame: f - SPLIT - 18, fps, config: {damping: 12}});
  const ai = p.step === 4;
  return (
    <AbsoluteFill style={{background: INK, direction: 'rtl'}}>
      {/* الصناعة: تملأ الشاشة ثم تنكمش لليمين */}
      <div style={{position: 'absolute', top: 0, right: 0, height: 1080, width: indW, overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 0, right: 0, width: 1920, height: 1080, transform: `translateX(${interpolate(sp, [0, 1], [0, 480])}px)`}}>
          <Ken src={p.ind.img} total={total} dir={-1} grade={p.step === 1 ? 'sepia(0.3) contrast(1.1)' : 'contrast(1.1) saturate(1.1)'} />
        </div>
        <AbsoluteFill style={{background: 'linear-gradient(to left, rgba(4,8,18,0.88), rgba(4,8,18,0.25) 55%, transparent)'}} />
        <div style={{position: 'absolute', top: 110, right: 90, opacity: exit}}>
          <div style={{fontFamily, fontSize: 38, fontWeight: 700, color: p.accent, textShadow: shadow, ...useReveal(4)}}>{p.ind.label}</div>
          <div style={{fontFamily: year ? numberFamily : fontFamily, fontSize: 150, fontWeight: 900, color: '#fff', lineHeight: 1.05, direction: 'ltr', textAlign: 'right', textShadow: `0 0 40px ${p.accent}66`, ...useReveal(8, 12)}}>
            {year ?? 'اليوم'}
          </div>
          <div style={{fontFamily, fontSize: 92, fontWeight: 900, color: '#fff', textShadow: shadow, ...useReveal(26)}}>{p.ind.title}</div>
          <div style={{fontFamily, fontSize: 40, fontWeight: 600, color: 'rgba(255,255,255,0.85)', textShadow: shadow, ...useReveal(40)}}>{p.ind.line}</div>
        </div>
      </div>
      {/* المعلم: يدخل من اليسار */}
      <div style={{position: 'absolute', top: 0, left: 0, width: 960, height: 1080, overflow: 'hidden', transform: `translateX(${interpolate(sp, [0, 1], [-960, 0])}px)`}}>
        <div style={{position: 'absolute', top: 0, left: -480, width: 1920, height: 1080}}>
          <Ken src={p.tch.img} total={total} grade={p.step === 1 ? 'sepia(0.25) contrast(1.08)' : 'contrast(1.08) saturate(1.12)'} />
        </div>
        <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(4,8,18,0.92), rgba(4,8,18,0.1) 55%)'}} />
        <div style={{position: 'absolute', bottom: 140, right: 70, left: 60, opacity: exit}}>
          <div style={{display: 'flex', gap: 18, alignItems: 'baseline', ...useReveal(SPLIT + 30)}}>
            <span style={{fontFamily, fontSize: 64, fontWeight: 900, color: '#fff', textShadow: shadow}}>المعلم</span>
            <span style={{fontFamily: numberFamily, fontSize: 80, fontWeight: 900, color: p.accent, textShadow: `0 0 30px ${p.accent}`}}>{p.step}.0</span>
          </div>
          <div style={{fontFamily, fontSize: 56, fontWeight: 800, color: '#fff', textShadow: shadow, ...useReveal(SPLIT + 44)}}>{p.tch.title}</div>
          <div style={{fontFamily, fontSize: 36, fontWeight: 600, color: 'rgba(255,255,255,0.88)', textShadow: shadow, ...useReveal(SPLIT + 58)}}>{p.tch.line}</div>
        </div>
      </div>
      {/* خط الفصل والشارة */}
      <div style={{position: 'absolute', left: 1920 - indW - 2, top: 0, width: 4, height: 1080, background: p.accent, boxShadow: `0 0 30px ${p.accent}`, opacity: sp}} />
      <div style={{
        position: 'absolute', left: 1920 - indW - 85, top: 455, width: 170, height: 170, borderRadius: '50%', display: 'grid', placeItems: 'center',
        background: INK, border: `4px solid ${p.accent}`, boxShadow: `0 0 ${40 + Math.sin(f / 6) * 14}px ${p.accent}`,
        opacity: badge * exit, transform: `scale(${interpolate(badge, [0, 1], [0.3, 1])}) rotate(${interpolate(badge, [0, 1], [-90, 0])}deg)`,
      }}>
        <Glitch size={70} color={p.accent} font={numberFamily} on={ai && f % 40 < 6}>{`${p.step}.0`}</Glitch>
      </div>
      {ai ? <Hud color={CYAN} /> : null}
      {ai ? <Particles color={CYAN} n={36} /> : null}
      <div style={{opacity: exit}}><Steps step={p.step} accent={p.accent} /></div>
      {sfx('cinematic-boom.wav', 2, 0.4)}
      {Array.from({length: 8}, (_, i) => sfx('tick.wav', 8 + i * 5, 0.25, 4))}
      {sfx('swoosh-up.wav', SPLIT, 0.5)}
      {sfx('impact.wav', SPLIT + 18, 0.45)}
      {ai ? sfx('shimmer.wav', SPLIT + 30, 0.35) : null}
    </AbsoluteFill>
  );
};

const Answer: React.FC<{total: number}> = ({total}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = useExit(total);
  const pop = (d: number) => {
    const s = spring({frame: f - d, fps, config: {damping: 12}});
    return {opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`};
  };
  const card = (txt: string, color: string, d: number, big = false) => (
    <div style={{
      ...pop(d), fontFamily, fontWeight: 900, fontSize: big ? 84 : 52, color: big ? INK : '#fff', padding: big ? '18px 46px' : '20px 36px', borderRadius: 26,
      background: big ? `linear-gradient(135deg, ${CYAN}, #8B7BFF)` : 'rgba(255,255,255,0.08)', border: big ? 'none' : `2px solid ${color}`,
      boxShadow: big ? `0 0 ${50 + Math.sin(f / 5) * 15}px ${CYAN}aa` : `0 0 24px ${color}55`, whiteSpace: 'nowrap',
    }}>{txt}</div>
  );
  const op = (t: string, d: number) => <span style={{fontFamily: numberFamily, fontSize: 90, fontWeight: 900, color: GOLD, ...pop(d)}}>{t}</span>;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at center, #16224a 0%, ${INK} 75%)`, direction: 'rtl', alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(95,212,244,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(95,212,244,0.07) 1px, transparent 1px)', backgroundSize: '80px 80px', transform: `perspective(900px) rotateX(55deg) translateY(${(f * 2) % 80}px) scale(2)`, transformOrigin: 'center bottom', opacity: 0.8}} />
      <Particles n={30} />
      <div style={{opacity: exit, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 46}}>
        <div style={{fontFamily, fontSize: 80, fontWeight: 900, color: '#fff', ...useReveal(4)}}>
          إذن… لماذا <span style={{color: CYAN}}>«معلم 4.0»</span>؟
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 30}}>
          {card('الثورة الصناعية الرابعة', CYAN, 40)}
          {op('+', 62)}
          {card('التعليم', GOLD, 74)}
          {op('=', 98)}
          {card('معلم 4.0', CYAN, 110, true)}
        </div>
        <div style={{fontFamily, fontSize: 46, fontWeight: 600, color: 'rgba(255,255,255,0.9)', maxWidth: 1500, lineHeight: 1.6, ...useReveal(160, 20)}}>
          كل ثورة صناعية غيّرت دور المعلم… <span style={{color: GOLD, fontWeight: 800}}>ونحن اليوم نعيش الرابعة</span>
        </div>
      </div>
      {sfx('riser.wav', 0, 0.4)}
      {sfx('pop.wav', 40, 0.35)}{sfx('pop.wav', 74, 0.35)}
      {sfx('cinematic-boom.wav', 110, 0.6)}
      {sfx('shimmer.wav', 160, 0.3)}
    </AbsoluteFill>
  );
};

const ICONS: Record<string, React.ReactNode> = {
  design: <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />,
  person: <><circle cx="12" cy="7" r="4" /><path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>,
  ai: <><rect x="5" y="5" width="14" height="14" rx="2" /><path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" /></>,
  bulb: <><path d="M9 18h6M10 22h4" /><path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" /></>,
};
const Qualities: React.FC<{total: number}> = ({total}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = useExit(total);
  const items: [string, string, string][] = [
    ['design', 'يصمّم تجربة التعلّم', 'لا يكتفي بالشرح'],
    ['person', 'يخصّص لكل طالب', 'بالبيانات والملاحظة'],
    ['ai', 'يوظّف الذكاء الاصطناعي', 'بوعي وأخلاق'],
    ['bulb', 'يبني الإنسان', 'تفكير وإبداع وتعاون'],
  ];
  return (
    <AbsoluteFill style={{direction: 'rtl'}}>
      <Ken src="teacher4/clips/c8.mp4" total={total} blur={8} grade="brightness(0.45) saturate(1.2)" />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(6,11,22,0.6), rgba(6,11,22,0.85))'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 60, opacity: exit}}>
        <div style={{fontFamily, fontSize: 84, fontWeight: 900, color: '#fff', ...useReveal(2)}}>
          <span style={{color: CYAN}}>معلم 4.0</span> هو معلم…
        </div>
        <div style={{display: 'flex', gap: 30}}>
          {items.map(([ic, t, s], i) => {
            const sp = spring({frame: f - 20 - i * 12, fps, config: {damping: 13}});
            return (
              <div key={i} style={{
                width: 380, padding: '40px 26px', borderRadius: 30, textAlign: 'center', background: 'rgba(255,255,255,0.08)',
                border: `2px solid ${i % 2 ? GOLD : CYAN}66`, boxShadow: `0 20px 50px -20px ${i % 2 ? GOLD : CYAN}`,
                opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [120, 0])}px) rotate(${interpolate(sp, [0, 1], [i % 2 ? 6 : -6, 0])}deg)`,
              }}>
                <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke={i % 2 ? GOLD : CYAN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 10px ${i % 2 ? GOLD : CYAN})`}}>{ICONS[ic]}</svg>
                <div style={{fontFamily, fontSize: 44, fontWeight: 900, color: '#fff', marginTop: 18, lineHeight: 1.3}}>{t}</div>
                <div style={{fontFamily, fontSize: 30, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginTop: 8}}>{s}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {items.map((_, i) => sfx('swoosh-down.wav', 20 + i * 12, 0.35))}
    </AbsoluteFill>
  );
};

const Outro: React.FC<{total: number}> = ({total}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 8, fps, config: {damping: 14}});
  const fadeOut = interpolate(f, [total - 30, total], [0, 1], clamp);
  return (
    <AbsoluteFill style={{direction: 'rtl'}}>
      <Ken src="teacher4/clips/c9.mp4" total={total} dir={-1} grade="contrast(1.06) saturate(1.12)" />
      <AbsoluteFill style={{background: 'linear-gradient(to left, rgba(4,8,18,0.92), rgba(4,8,18,0.55) 45%, transparent 75%)'}} />
      <Particles color={GOLD} n={26} />
      <AbsoluteFill style={{justifyContent: 'center', paddingRight: 130}}>
        <div style={{fontFamily, fontSize: 48, fontWeight: 700, color: GOLD, textShadow: shadow, ...useReveal(2)}}>أهلًا بكم في ورشة</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 30, opacity: s, transform: `scale(${interpolate(s, [0, 1], [1.3, 1])})`, transformOrigin: 'right center'}}>
          <span style={{fontFamily, fontSize: 160, fontWeight: 900, color: '#fff', textShadow: shadow}}>معلم</span>
          <Glitch size={180} color={CYAN} font={numberFamily} on={f > 8 && f < 22}>4.0</Glitch>
        </div>
        <div style={{fontFamily, fontSize: 50, fontWeight: 700, color: '#fff', textShadow: shadow, marginTop: 20, ...useReveal(46, 20)}}>الآلة تغيّرت أربع مرات…</div>
        <div style={{fontFamily, fontSize: 50, fontWeight: 800, color: GOLD, textShadow: shadow, ...useReveal(76, 20)}}>وكل ثورة بدأت من عقل… وكل عقل بدأ من معلم</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: fadeOut}} />
      {sfx('cinematic-boom.wav', 8, 0.55)}
      {sfx('shimmer.wav', 46, 0.3)}
    </AbsoluteFill>
  );
};

const View: React.FC<{s: Scene; total: number}> = ({s, total}) => {
  switch (s.kind) {
    case 'hook': return <Hook total={total} />;
    case 'intro': return <Intro total={total} />;
    case 'pair': return <PairScene p={s.pair} total={total} />;
    case 'answer': return <Answer total={total} />;
    case 'qualities': return <Qualities total={total} />;
    case 'outro': return <Outro total={total} />;
  }
};

export const Teacher4Promo: React.FC = () => {
  const total = promoFrames();
  let t = 0;
  const starts = SCENES.map((s, i) => {
    if (i > 0) t -= T;
    const st = t;
    t += frames(s);
    return st;
  });
  return (
    <AbsoluteFill style={{background: INK}}>
      <TransitionSeries>
        {SCENES.map((s, i) => (
          <Fragment key={i}>
            {i > 0 ? <TransitionSeries.Transition presentation={zoomBlur()} timing={linearTiming({durationInFrames: T})} /> : null}
            <TransitionSeries.Sequence durationInFrames={frames(s)}><View s={s} total={frames(s)} /></TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <Vignette />
      <Grain />
      {starts.slice(1).map((st, i) => (
        <Sequence key={i} from={Math.max(0, st - 4)} durationInFrames={30}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.45} /></Sequence>
      ))}
      <Audio src={staticFile('music/teacher4-promo.wav')} volume={(fr) => 0.6 * interpolate(fr, [0, 15], [0, 1], clamp) * interpolate(fr, [total - 60, total], [1, 0], clamp)} />
    </AbsoluteFill>
  );
};
