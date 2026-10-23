// تذكير بصمة التواجد — الجزء الأول: إنشاء الاختصار بالطريقة اليدوية وربطه بتطبيق وزارة التربية
// تسجيلات الشاشة في public/footage/bassma/ (ما ترفع للمستودع)، والشعارات في public/bassma/
import {slide} from '@remotion/transitions/slide';
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const TRANS = 14;
const DIR = 'footage/bassma/';

const INK = '#0A0820';
const PURPLE = '#7B4DE0';
const PINK = '#F27CB4';
const GOLD = '#E8B54C';
const SOFT = '#C9C2F2';

const SHORTCUTS_ICON = 'bassma/shortcuts-icon.svg';
const MOE_ICON = 'bassma/moe-icon.png';

type Step = {
  title: string;
  hint: string;
  src: string;
  from: number; // ثانية في التسجيل
  to: number;
  rate?: number; // تسريع اللقطات الطويلة (قائمة التطبيقات، عجلة الوقت)
  taps?: {t: number; x: number; y: number}[]; // أماكن الضغط: t ثانية في التسجيل، x و y نسبة من الشاشة
};

const STEPS: Step[] = [
  {title: 'اضغط علامة (+)', hint: 'من تطبيق الاختصارات عشان تفتح اختصار جديد', src: 'rec1.mp4', from: 0.9, to: 3.0, taps: [{t: 1.6, x: 0.9, y: 0.095}]},
  {title: 'اضغط Search وابحث عن File', hint: 'عشان ترفع التسجيل الصوتي', src: 'rec1.mp4', from: 3.0, to: 12.5, taps: [{t: 3.95, x: 0.3, y: 0.53}]},
  {title: 'اختر التسجيل الصوتي', hint: 'حدد ملف صوت التذكير واضغط Open', src: 'rec2.mp4', from: 0.2, to: 13.6, rate: 1.25},
  {title: 'ابحث عن Play Sound وأضفه', hint: 'عشان يشغّل ملف التسجيل الصوتي', src: 'rec2.mp4', from: 13.6, to: 23.4, taps: [{t: 20.5, x: 0.3, y: 0.335}]},
  {title: 'اضغط على Open App', hint: 'وابحث عن تطبيق وزارة التربية', src: 'rec3.mp4', from: 0, to: 17.2, rate: 1.5, taps: [{t: 2.3, x: 0.3, y: 0.33}, {t: 4.0, x: 0.33, y: 0.38}, {t: 14.1, x: 0.22, y: 0.75}]},
  {title: 'اضغط رجوع ثم Automation', hint: 'واضغط (+) واختر Time of Day', src: 'rec4.mp4', from: 0, to: 7.0, taps: [{t: 0.5, x: 0.09, y: 0.094}, {t: 2.6, x: 0.5, y: 0.93}, {t: 4.5, x: 0.92, y: 0.094}, {t: 6.4, x: 0.3, y: 0.27}]},
  {title: 'برمج وقت تذكير البصمة', hint: 'حدد الساعة و Daily ثم Next', src: 'rec4.mp4', from: 7.0, to: 18, rate: 1.4},
  {title: 'اختر الاختصار اللي سويته', hint: 'من My Shortcuts', src: 'rec4.mp4', from: 18, to: 21.15},
  {title: 'تم! التذكير جاهز', hint: 'كل يوم بالوقت اللي حددته', src: 'rec5.mp4', from: 0.6, to: 5.8},
];

const INTRO = 4.5 * FPS;
const OUTRO = 5 * FPS;
const stepFrames = (s: Step) => Math.round(((s.to - s.from) / (s.rate ?? 1)) * FPS);

export const totalFrames = () => INTRO + OUTRO + STEPS.reduce((a, s) => a + stepFrames(s), 0) - TRANS * (STEPS.length + 1);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const arabicDigits = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

const useReveal = (delay: number, dur = 18) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 24}px)`};
};

// خلفية متدرجة بنفسجية (لون الاختصارات) مع توهج ذهبي خفيف (لون الوزارة)
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 60;
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', width: 1300, height: 1300, left: -500 + drift, top: -450, borderRadius: '50%', background: `radial-gradient(circle, ${PURPLE}66 0%, transparent 65%)`}} />
      <div style={{position: 'absolute', width: 1100, height: 1100, right: -520 - drift, bottom: -380, borderRadius: '50%', background: `radial-gradient(circle, ${PINK}40 0%, transparent 65%)`}} />
      <div style={{position: 'absolute', width: 900, height: 900, right: -300, top: 500 + drift, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}1f 0%, transparent 65%)`}} />
    </AbsoluteFill>
  );
};

const AppIcon: React.FC<{src: string; size: number; delay?: number}> = ({src, size, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 12, stiffness: 140}});
  return (
    <Img
      src={staticFile(src)}
      style={{width: size, height: size, borderRadius: size * 0.225, transform: `scale(${s})`, boxShadow: '0 18px 50px rgba(0,0,0,0.55)'}}
    />
  );
};

const LogoPair: React.FC<{size: number; delay: number}> = ({size, delay}) => {
  const frame = useCurrentFrame();
  const link = interpolate(frame - delay - 10, [0, 14], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48}}>
      <AppIcon src={SHORTCUTS_ICON} size={size} delay={delay} />
      <div style={{fontSize: size * 0.45, fontWeight: 800, color: GOLD, opacity: link, transform: `scale(${link})`}}>+</div>
      <AppIcon src={MOE_ICON} size={size} delay={delay + 8} />
    </div>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [INTRO - 16, INTRO], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{direction: 'rtl', fontFamily, justifyContent: 'center', alignItems: 'center', textAlign: 'center', opacity: out, padding: '0 70px'}}>
        <LogoPair size={230} delay={6} />
        <div style={{...useReveal(30), marginTop: 90, fontSize: 46, fontWeight: 600, color: SOFT}}>خطوة بخطوة</div>
        <div style={{...useReveal(38), fontSize: 112, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginTop: 8}}>
          تذكير بصمة
          <br />
          <span style={{color: GOLD}}>التواجد</span>
        </div>
        <div style={{...useReveal(52), marginTop: 40, padding: '16px 40px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: `2px solid ${PINK}88`, fontSize: 42, fontWeight: 700, color: '#fff'}}>
          إنشاء الاختصار بالطريقة اليدوية
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// إطار آيفون بسيط فوق تسجيل الشاشة، والجزيرة السوداء تغطي مؤشر التسجيل الأحمر
const SCREEN_H = 1380;
const SCREEN_W = Math.round((SCREEN_H * 1180) / 2556);
const BEZEL = 14;

// دائرة تنبض مكان الضغطة
const Tap: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const frame = useCurrentFrame();
  const f = frame - at + 12;
  if (f < 0 || f > 40) return null;
  const inP = interpolate(f, [0, 10], [0, 1], {...clamp, easing: ease});
  const out = interpolate(f, [26, 40], [1, 0], clamp);
  const ring = interpolate(f, [12, 34], [1, 2.4], clamp);
  const ringOp = interpolate(f, [12, 34], [0.9, 0], clamp);
  const press = f >= 12 && f < 18 ? 0.82 : 1;
  const r = 46;
  return (
    <>
      <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `5px solid ${GOLD}`, opacity: ringOp, transform: `scale(${ring})`}} />
      <div
        style={{
          position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%',
          background: `${GOLD}66`, border: '4px solid #fff', boxShadow: `0 0 30px ${GOLD}`,
          opacity: inP * out, transform: `scale(${(0.6 + 0.4 * inP) * press})`,
        }}
      />
    </>
  );
};

const Phone: React.FC<{step: Step; frames: number}> = ({step, frames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lift = spring({frame, fps, config: {damping: 16}});
  const drift = interpolate(frame, [0, frames], [1, 1.015]);
  const radius = 74;
  return (
    <div
      style={{
        position: 'absolute', left: (WIDTH - SCREEN_W) / 2 - BEZEL, top: 440,
        width: SCREEN_W + BEZEL * 2, height: SCREEN_H + BEZEL * 2, borderRadius: radius + BEZEL,
        background: 'linear-gradient(145deg, #3a3550, #121019)', padding: BEZEL,
        boxShadow: `0 40px 90px rgba(0,0,0,0.6), 0 0 0 2px #4c4566, 0 0 80px ${PURPLE}44`,
        transform: `translateY(${(1 - lift) * 60}px) scale(${drift})`,
      }}
    >
      <div style={{width: SCREEN_W, height: SCREEN_H, borderRadius: radius, overflow: 'hidden', background: '#000', position: 'relative'}}>
        <OffthreadVideo
          src={staticFile(DIR + step.src)}
          trimBefore={Math.round(step.from * FPS)}
          playbackRate={step.rate ?? 1}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
        {(step.taps ?? []).map((tp, i) => (
          <Tap key={i} at={Math.round(((tp.t - step.from) / (step.rate ?? 1)) * FPS)} x={tp.x * SCREEN_W} y={tp.y * SCREEN_H} />
        ))}
        <div style={{position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 300, height: 80, borderRadius: 40, background: '#000'}} />
      </div>
    </div>
  );
};

const StepHeader: React.FC<{index: number; step: Step}> = ({index, step}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 4, fps, config: {damping: 11, stiffness: 160}});
  const last = index === STEPS.length - 1;
  return (
    <div style={{position: 'absolute', top: 110, left: 60, right: 60, direction: 'rtl', fontFamily, display: 'flex', alignItems: 'center', gap: 30}}>
      <div
        style={{
          flex: 'none', width: 140, height: 140, borderRadius: 40, transform: `scale(${pop}) rotate(${(1 - pop) * -20}deg)`,
          background: last ? `linear-gradient(135deg, ${GOLD}, #c98a1e)` : `linear-gradient(135deg, ${PINK}, ${PURPLE})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
          fontSize: last ? 84 : 92, fontWeight: 900, color: '#fff',
        }}
      >
        {last ? '✓' : arabicDigits(index + 1)}
      </div>
      <div>
        <div style={{...useReveal(8), fontSize: 64, fontWeight: 900, color: '#fff', lineHeight: 1.2}}>{step.title}</div>
        <div style={{...useReveal(16), fontSize: 38, fontWeight: 600, color: SOFT, marginTop: 6}}>{step.hint}</div>
      </div>
    </div>
  );
};

const Progress: React.FC<{index: number}> = ({index}) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [6, 24], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', bottom: 46, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14, direction: 'rtl'}}>
      {STEPS.map((_, i) => {
        const active = i === index;
        const w = active ? 26 + 34 * grow : 26;
        return <div key={i} style={{width: w, height: 14, borderRadius: 7, background: i <= index ? (active ? GOLD : PINK) : 'rgba(255,255,255,0.22)'}} />;
      })}
    </div>
  );
};

const StepScene: React.FC<{index: number; frames: number}> = ({index, frames}) => {
  const step = STEPS[index];
  return (
    <AbsoluteFill>
      <Backdrop />
      <StepHeader index={index} step={step} />
      <Phone step={step} frames={frames} />
      <Progress index={index} />
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const black = interpolate(frame, [OUTRO - 20, OUTRO], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{direction: 'rtl', fontFamily, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 80px'}}>
        <div style={{...useReveal(4), fontSize: 150}}>🔔</div>
        <div style={{...useReveal(12), fontSize: 80, fontWeight: 900, color: '#fff', lineHeight: 1.25, marginTop: 20}}>
          كل يوم بيوصلك
          <br />
          <span style={{color: GOLD}}>تذكير البصمة</span>
        </div>
        <div style={{...useReveal(24), fontSize: 44, fontWeight: 600, color: SOFT, marginTop: 30, lineHeight: 1.5}}>
          يشغّل صوت التذكير ويفتح لك
          <br />
          تطبيق وزارة التربية مباشرة
        </div>
        <div style={{marginTop: 80}}>
          <LogoPair size={150} delay={34} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

export const AttendanceReminder: React.FC = () => {
  // بداية كل خطوة في الخط الزمني عشان مؤثر الانتقال يجي معها
  const starts: number[] = [];
  let t = INTRO;
  STEPS.forEach((s) => {
    t -= TRANS;
    starts.push(t);
    t += stepFrames(s);
  });
  return (
    <AbsoluteFill style={{background: INK}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}>
          <Intro />
        </TransitionSeries.Sequence>
        {STEPS.map((s, i) => (
          <Fragment key={i}>
            <TransitionSeries.Transition presentation={i === 0 ? fade() : slide({direction: 'from-left'})} timing={linearTiming({durationInFrames: TRANS})} />
            <TransitionSeries.Sequence durationInFrames={stepFrames(s)}>
              <StepScene index={i} frames={stepFrames(s)} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANS})} />
        <TransitionSeries.Sequence durationInFrames={OUTRO}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio src={staticFile('c46/soft.mp3')} volume={(f) => interpolate(f, [0, 20, totalFrames() - 40, totalFrames()], [0, 0.45, 0.45, 0], clamp)} />
      <Sequence from={6} durationInFrames={30}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.6} />
      </Sequence>
      <Sequence from={14} durationInFrames={30}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.6} />
      </Sequence>
      {starts.map((s, i) => (
        <Sequence key={i} from={s} durationInFrames={30}>
          <Audio src={staticFile(i === STEPS.length - 1 ? 'sfx/shimmer.wav' : 'sfx/swoosh-up.wav')} volume={0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
