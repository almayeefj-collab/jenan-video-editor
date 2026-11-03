// فريق العلاقات العامة — فاطمة الهاشمية (نسخة رسمية)
// عنوان ← أربع لقطات بعناوين سفلية أنيقة ← خاتمة
// اللقطات في public/footage/pr/ (ما ترفع للمستودع)
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const XFADE = 14;
const DIR = 'footage/pr/';

const GOLD = '#D9B77A';
const IVORY = '#F7F1E6';
const INK = '#0E0F14';

type Shot =
  | {kind: 'title'; dur: number}
  | {kind: 'video'; src: string; from: number; dur: number; caption: string}
  | {kind: 'final'; dur: number};

const SHOTS: Shot[] = [
  {kind: 'title', dur: 3.6},
  {kind: 'video', src: 'c1311.mp4', from: 0, dur: 3.3, caption: 'فريق واحد'},
  {kind: 'video', src: 'c1312.mp4', from: 0, dur: 1.85, caption: 'روح الفريق'},
  {kind: 'video', src: 'c1313.mp4', from: 0, dur: 5.0, caption: 'تواصل وتنسيق'},
  {kind: 'video', src: 'c1314.mp4', from: 0, dur: 5.45, caption: 'حضور يليق بالمدرسة'},
  {kind: 'final', dur: 4.2},
];

const shotFrames = (s: Shot) => Math.round(s.dur * FPS);
const enterFrames = (i: number) => (i === 0 ? 0 : XFADE);

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
const shadow = '0 4px 26px rgba(0,0,0,0.7)';

const useReveal = (delay: number, dur = 22) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 24}px)`};
};

const Rule: React.FC<{width: number; delay: number}> = ({width, delay}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 26], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '30px auto'}}>
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to left, ${GOLD}, transparent)`}} />
      <div style={{width: 11, height: 11, transform: `rotate(45deg) scale(${p})`, background: GOLD}} />
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to right, ${GOLD}, transparent)`}} />
    </div>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
);

const BlurBg: React.FC<{src: string; frames: number}> = ({src, frames}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, frames], [1.15, 1.25]);
  return (
    <>
      <OffthreadVideo src={staticFile(DIR + src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'blur(24px) brightness(0.4) saturate(0.9)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,15,20,0.6) 0%, rgba(14,15,20,0.25) 50%, rgba(14,15,20,0.75) 100%)'}} />
    </>
  );
};

const Brand: React.FC = () => (
  <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', direction: 'rtl', fontFamily, fontSize: 34, fontWeight: 700, color: IVORY, letterSpacing: 1, textShadow: shadow, opacity: 0.92}}>
    فريق العلاقات العامة <span style={{color: GOLD}}>|</span> فاطمة الهاشمية
  </div>
);

const LowerThird: React.FC<{text: string; frames: number}> = ({text, frames}) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [8, 26, frames - 16, frames - 4], [0, 1, 1, 0], {...clamp, easing: ease});
  return (
    <div
      style={{
        position: 'absolute', bottom: 280, right: 70, direction: 'rtl', fontFamily, whiteSpace: 'nowrap',
        opacity: show, transform: `translateX(${(1 - show) * -40}px)`,
        padding: '16px 38px 22px', borderRadius: 16, background: 'rgba(14,15,20,0.6)', borderRight: `6px solid ${GOLD}`,
      }}
    >
      <div style={{fontSize: 64, fontWeight: 800, color: '#fff'}}>{text}</div>
    </div>
  );
};

const VideoShot: React.FC<{src: string; from: number; frames: number; caption: string}> = ({src, from, frames, caption}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, frames], [1.0, 1.06]);
  return (
    <AbsoluteFill style={{background: INK}}>
      <OffthreadVideo
        src={staticFile(DIR + src)}
        trimBefore={Math.round(from * FPS)}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: 'contrast(1.05) saturate(1.05) brightness(1.02)'}}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,15,20,0.45) 0%, transparent 18%, transparent 70%, rgba(14,15,20,0.55) 100%)'}} />
      <Vignette />
      <Brand />
      <LowerThird text={caption} frames={frames} />
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [frames - 18, frames - 2], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <BlurBg src="c1311.mp4" frames={frames} />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily, padding: '0 70px', opacity: out}}>
        <div style={{...useReveal(6), fontSize: 120, fontWeight: 900, color: IVORY, lineHeight: 1.2, textShadow: shadow}}>
          فريق
          <br />
          العلاقات العامة
        </div>
        <Rule width={480} delay={26} />
        <div style={{...useReveal(36), fontSize: 62, fontWeight: 700, color: GOLD, textShadow: shadow}}>فاطمة الهاشمية</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Final: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const black = interpolate(frame, [frames - 20, frames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <BlurBg src="c1314.mp4" frames={frames} />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily, padding: '0 60px'}}>
        <div style={{...useReveal(6), fontSize: 92, fontWeight: 800, color: IVORY, lineHeight: 1.3, textShadow: shadow}}>تواصلٌ يصنع الأثر</div>
        <Rule width={420} delay={24} />
        <div style={{...useReveal(32), fontSize: 50, fontWeight: 700, color: GOLD, textShadow: shadow}}>فريق العلاقات العامة</div>
        <div style={{...useReveal(42), fontSize: 42, fontWeight: 500, color: IVORY, marginTop: 10, textShadow: shadow}}>فاطمة الهاشمية</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{shot: Shot; frames: number}> = ({shot, frames}) => {
  switch (shot.kind) {
    case 'title':
      return <TitleCard frames={frames} />;
    case 'video':
      return <VideoShot src={shot.src} from={shot.from} frames={frames} caption={shot.caption} />;
    case 'final':
      return <Final frames={frames} />;
  }
};

export const PRTeam: React.FC = () => {
  const tl = timeline();
  const total = totalFrames();
  const musicVol = (f: number) => interpolate(f, [0, 12, total - 24, total], [0, 0.9, 0.9, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
  return (
    <AbsoluteFill style={{background: INK}}>
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
      <Audio src={staticFile('c46/formal.mp3')} volume={musicVol} />
    </AbsoluteFill>
  );
};
