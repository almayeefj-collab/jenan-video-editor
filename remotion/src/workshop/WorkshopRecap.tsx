// ريل ملخص ورشة «معلم 4.0» — المعلمة جنان المعيبف، ثانوية فاطمة الهاشمية بنات، الأحد 25 أكتوبر 2026
// الترتيب: البوستر ← التجهيزات ← الحضور (بطاقة الضيوف) ← الورشة مع محاورها ← التطبيق العملي ← التكريم ← الشهادات ← الختام
// اللقطات في public/footage/workshop/ (ما ترفع للمستودع)
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const XFADE = 12;
const DIR = 'footage/workshop/';

const NAVY = '#040E2B';
const BLUE = '#2F7BFF';
const ICE = '#BFD7FF';
const ORANGE = '#F07A1F';

type Caption = {num?: string; text: string};
type Shot =
  | {kind: 'poster'; dur: number}
  | {kind: 'video'; src: string; from: number; dur: number; caption?: Caption; presenter?: boolean}
  | {kind: 'final'; dur: number};

// المحاور تنضاف لاحقاً (caption مع num) على لقطات الشرح
const SHOTS: Shot[] = [
  {kind: 'poster', dur: 4.2},
  {kind: 'video', src: '2322.mp4', from: 0, dur: 2.4},
  {kind: 'video', src: '2327.mp4', from: 0.5, dur: 2.8},
  {kind: 'video', src: '2324.mp4', from: 0, dur: 2.3},
  {kind: 'video', src: '2330.mp4', from: 3.2, dur: 6.6},
  {kind: 'video', src: '2339.mp4', from: 0, dur: 2.9},
  {kind: 'video', src: '2342.mp4', from: 0, dur: 2.9},
  {kind: 'video', src: '2361.mp4', from: 1, dur: 4, presenter: true},
  {kind: 'video', src: '2336.mp4', from: 2, dur: 4.2},
  {kind: 'video', src: '2343.mp4', from: 0, dur: 3.2},
  {kind: 'video', src: '2359.mp4', from: 0.5, dur: 3.8},
  {kind: 'video', src: '2337.mp4', from: 7, dur: 4},
  {kind: 'video', src: 'jenan_wa.mp4', from: 0.5, dur: 4},
  {kind: 'video', src: '2356.mp4', from: 0, dur: 2.4, caption: {text: 'تطبيق عملي'}},
  {kind: 'video', src: '2347.mp4', from: 0.3, dur: 3.6},
  {kind: 'video', src: '2360.mp4', from: 0, dur: 3.1},
  {kind: 'video', src: '2340.mp4', from: 2, dur: 3.6},
  {kind: 'video', src: '2364.mp4', from: 0.4, dur: 3.6},
  {kind: 'video', src: '2379.mp4', from: 0.3, dur: 6.2, caption: {text: 'تكريم المعلمة جنان المعيبف'}},
  // الشهادات آخر شي
  {kind: 'video', src: '0956.mp4', from: 0, dur: 3.95, caption: {text: 'شكراً لكل من حضر وشارك'}},
  {kind: 'final', dur: 6.5},
];

const shotFrames = (s: Shot) => Math.round(s.dur * FPS);
const enterFrames = (i: number) => (i === 0 ? 0 : i === 1 ? 20 : XFADE);

export const timeline = () => {
  let t = 0;
  return SHOTS.map((shot, i) => {
    t -= enterFrames(i);
    const start = t;
    t += shotFrames(shot);
    return {shot, start, frames: shotFrames(shot)};
  });
};
export const totalFrames = () => {
  const tl = timeline();
  const last = tl[tl.length - 1];
  return last.start + last.frames;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const softShadow = '0 4px 28px rgba(0,0,0,0.8)';
const GRADE = 'contrast(1.07) saturate(1.08) brightness(1.04)';

const useReveal = (delay: number, dur = 20) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 24}px)`};
};

// نجوم البوستر الزرقاء ✦ تلمع بهدوء
const Sparkles: React.FC<{seed: string; count?: number}> = ({seed, count = 10}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const x = random(`${seed}x${i}`) * WIDTH;
        const y = random(`${seed}y${i}`) * HEIGHT;
        const s = 14 + random(`${seed}s${i}`) * 26;
        const tw = Math.max(0, Math.sin(frame / (10 + (i % 5) * 3) + i * 1.7));
        return (
          <svg key={i} width={s} height={s} viewBox="0 0 20 20" style={{position: 'absolute', left: x, top: y, opacity: tw * 0.85, filter: `drop-shadow(0 0 8px ${BLUE})`}}>
            <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0Z" fill={ICE} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{strength?: number}> = ({strength = 0.5}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 52%, rgba(2,8,28,${strength}) 100%)`}} />
);

const PosterIntro: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, frames], [1.0, 1.07], {easing: Easing.inOut(Easing.sin)});
  const fadeIn = interpolate(frame, [0, 14], [0, 1], clamp);
  // ضوء يمر على العنوان
  const sweep = interpolate(frame, [18, 58], [-400, WIDTH + 400], clamp);
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden', opacity: fadeIn}}>
      <Img src={staticFile('teacher4vc/poster_jenan.png')} style={{width: '100%', height: '100%', transform: `scale(${scale})`, transformOrigin: '50% 20%'}} />
      <div style={{position: 'absolute', top: 180, left: sweep, width: 220, height: 300, transform: 'skewX(-20deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)', mixBlendMode: 'screen'}} />
      <Sparkles seed="intro" count={8} />
    </AbsoluteFill>
  );
};

const CaptionChip: React.FC<{caption: Caption; frames: number}> = ({caption, frames}) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [8, 24, frames - 16, frames - 4], [0, 1, 1, 0], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', bottom: 250, left: 60, right: 60, display: 'flex', justifyContent: 'center', opacity: show, transform: `translateY(${(1 - show) * 30}px)`}}>
      <div
        style={{
          direction: 'rtl', fontFamily, display: 'flex', alignItems: 'center', gap: 22, padding: '20px 34px', borderRadius: 22,
          background: 'rgba(4,14,43,0.72)', backdropFilter: 'blur(10px)', border: `2px solid ${BLUE}`,
          boxShadow: `0 0 34px rgba(47,123,255,0.45)`, maxWidth: 940,
        }}
      >
        {caption.num ? <div style={{fontSize: 58, fontWeight: 900, color: BLUE, lineHeight: 1, textShadow: `0 0 18px ${BLUE}`}}>{caption.num}</div> : null}
        <div style={{fontSize: 42, fontWeight: 700, color: '#fff', lineHeight: 1.4}}>{caption.text}</div>
      </div>
    </div>
  );
};

const PresenterTag: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [10, 28, frames - 14, frames], [0, 1, 1, 0], {...clamp, easing: ease});
  return (
    <div
      style={{
        position: 'absolute', bottom: 270, right: 70, direction: 'rtl', fontFamily, opacity: show, transform: `translateX(${(1 - show) * -40}px)`,
        padding: '18px 34px', borderRadius: 18, background: 'rgba(4,14,43,0.7)', backdropFilter: 'blur(10px)', borderRight: `6px solid ${ORANGE}`,
      }}
    >
      <div style={{fontSize: 30, fontWeight: 500, color: ICE}}>تقديم المعلمة</div>
      <div style={{fontSize: 56, fontWeight: 800, color: '#fff', marginTop: -4}}>جنان المعيبف</div>
    </div>
  );
};

const VideoShot: React.FC<{shot: Extract<Shot, {kind: 'video'}>; frames: number}> = ({shot, frames}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, frames], [1.03, 1.1]);
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile(DIR + shot.src)} trimBefore={Math.round(shot.from * FPS)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: GRADE}} />
      <Vignette />
      {shot.caption ? <CaptionChip caption={shot.caption} frames={frames} /> : null}
      {shot.presenter ? <PresenterTag frames={frames} /> : null}
    </AbsoluteFill>
  );
};

// بطاقة الضيوف: تمتد على لقطات وصول الضيوف
const GUESTS = [
  {role: 'مراقب المرحلة الثانوية في منطقة مبارك الكبير التعليمية', name: 'د. مبارك الخشاب'},
  {role: 'الموجه الأول للمواد الاجتماعية', name: 'أ. علي ماتقي'},
  {role: '', name: 'وبحضور موجهين المواد الاجتماعية'},
];

const GuestsCard: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [frames - 18, frames - 2], [1, 0], clamp);
  const bg = interpolate(frame, [0, 18], [0, 1], clamp) * out;
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 230}}>
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(4,14,43,0.95) 0%, rgba(4,14,43,0.75) 38%, transparent 62%)', opacity: bg}} />
      <div style={{opacity: out, textAlign: 'center', padding: '0 70px', position: 'relative'}}>
        <div style={{...useReveal(6), display: 'inline-block', fontSize: 40, fontWeight: 800, color: ORANGE, padding: '6px 34px', border: `2px solid ${BLUE}`, borderRadius: 16, marginBottom: 30}}>بحضور</div>
        {GUESTS.map((g, i) => (
          <div key={i} style={{...useReveal(22 + i * 26), marginTop: i ? 30 : 0}}>
            {g.role ? <div style={{fontSize: 34, fontWeight: 500, color: ICE, lineHeight: 1.45, textShadow: softShadow}}>{g.role}</div> : null}
            <div style={{fontSize: g.role ? 60 : 46, fontWeight: 800, color: '#fff', lineHeight: 1.3, textShadow: softShadow}}>{g.name}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Final: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, frames], [1.15, 1.25]);
  const black = interpolate(frame, [frames - 24, frames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile(DIR + '2342.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'blur(20px) brightness(0.4) saturate(1.2)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(47,123,255,0.35) 0%, rgba(4,14,43,0.85) 70%)'}} />
      <Sparkles seed="final" count={12} />
      <AbsoluteFill style={{direction: 'rtl', fontFamily, justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 80px'}}>
        <div style={{...useReveal(6), fontSize: 44, fontWeight: 700, color: ICE, padding: '4px 36px', border: `2px solid ${BLUE}`, borderRadius: 16}}>ورشة</div>
        <div style={{...useReveal(16), fontSize: 170, fontWeight: 900, color: '#fff', lineHeight: 1.2, textShadow: `0 0 40px ${BLUE}`}}>معلم 4.0</div>
        <div style={{...useReveal(30), fontSize: 34, color: ICE, marginTop: 10}}>تقديم المعلمة</div>
        <div style={{...useReveal(36), fontSize: 66, fontWeight: 800, color: '#fff'}}>جنان المعيبف</div>
        <div style={{...useReveal(48), fontSize: 36, fontWeight: 600, color: ICE, marginTop: 34, lineHeight: 1.5}}>
          ثانوية فاطمة الهاشمية بنات
          <br />
          الأحد 25 أكتوبر 2026
        </div>
        <div style={{...useReveal(64), marginTop: 56, display: 'flex', gap: 60, fontSize: 32, color: '#fff', lineHeight: 1.5}}>
          <div>رئيسة القسم<br /><b>أ. ابرار دكسن</b></div>
          <div style={{width: 2, background: BLUE}} />
          <div>الموجهة الفنية<br /><b>أ. فجر النزال</b></div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{shot: Shot; frames: number}> = ({shot, frames}) => {
  switch (shot.kind) {
    case 'poster':
      return <PosterIntro frames={frames} />;
    case 'video':
      return <VideoShot shot={shot} frames={frames} />;
    case 'final':
      return <Final frames={frames} />;
  }
};

const musicVolume = (f: number) => {
  const end = totalFrames();
  return interpolate(f, [0, 20, end - 45, end], [0, 0.85, 0.85, 0], clamp);
};

export const WorkshopRecap: React.FC = () => {
  const tl = timeline();
  // بطاقة الضيوف من لقطة الوصول (2330) لين نهاية لقطة الحضور (2342)
  const g0 = tl[4];
  const g1 = tl[6];
  return (
    <AbsoluteFill style={{background: NAVY}}>
      <TransitionSeries>
        {tl.map(({shot, frames}, i) => (
          <Fragment key={i}>
            {i > 0 ? <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: enterFrames(i)})} /> : null}
            <TransitionSeries.Sequence durationInFrames={frames}>
              <ShotView shot={shot} frames={frames} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <Sequence from={g0.start + 10} durationInFrames={g1.start + g1.frames - g0.start - 10}>
        <GuestsCard frames={g1.start + g1.frames - g0.start - 10} />
      </Sequence>
      <Audio src={staticFile('music/upbeat.mp3')} volume={musicVolume} />
    </AbsoluteFill>
  );
};
