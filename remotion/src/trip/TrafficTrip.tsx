// رحلة ثانوية فاطمة الهاشمية إلى وزارة الداخلية — إدارة المرور، قسم العمليات
// عنوان ← لقطات الرحلة ← إشراف المعلمات ← خاتمة
// اللقطات في public/footage/trip/ (ما ترفع للمستودع)
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const XFADE = 12;
const DIR = 'footage/trip/';
const LOGO = staticFile('brand/fh-logo-light.png');

const ORANGE = '#EE8A23';
const WHITE = '#FFFFFF';
const INK = '#0D1420';

type Shot =
  | {kind: 'title'; dur: number}
  | {kind: 'video'; src: string; from: number; dur: number}
  | {kind: 'credits'; dur: number}
  | {kind: 'final'; dur: number};

const SHOTS: Shot[] = [
  {kind: 'title', dur: 5.2},
  {kind: 'video', src: 'c1478.mp4', from: 0, dur: 2.1},
  {kind: 'video', src: 'c1479.mp4', from: 0, dur: 3.7},
  {kind: 'video', src: 'c1480.mp4', from: 1.5, dur: 5.5},
  {kind: 'video', src: 'c1481.mp4', from: 0, dur: 5.1},
  {kind: 'video', src: 'c1484.mp4', from: 0, dur: 3.3},
  {kind: 'video', src: 'c1487.mp4', from: 0, dur: 4.3},
  {kind: 'video', src: 'c1490.mp4', from: 0, dur: 4.0},
  {kind: 'video', src: 'c1491.mp4', from: 0, dur: 4.5},
  {kind: 'video', src: 'c1496.mp4', from: 0, dur: 6.5},
  {kind: 'credits', dur: 5.5},
  {kind: 'final', dur: 4.0},
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
const shadow = '0 4px 24px rgba(0,0,0,0.75)';

const useReveal = (delay: number, dur = 20) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 26}px)`};
};

const Rule: React.FC<{width: number; delay: number}> = ({width, delay}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '28px auto'}}>
      <div style={{height: 3, width: (width / 2) * p, background: `linear-gradient(to left, ${ORANGE}, transparent)`}} />
      <div style={{width: 13, height: 13, transform: `rotate(45deg) scale(${p})`, background: ORANGE}} />
      <div style={{height: 3, width: (width / 2) * p, background: `linear-gradient(to right, ${ORANGE}, transparent)`}} />
    </div>
  );
};

const Logo: React.FC<{width: number; delay: number}> = ({width, delay}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {...clamp, easing: ease});
  return <Img src={LOGO} style={{width, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.6))'}} />;
};

const BlurBg: React.FC<{src: string; from?: number; frames: number}> = ({src, from = 0, frames}) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, frames], [1.15, 1.25]);
  return (
    <>
      <OffthreadVideo src={staticFile(DIR + src)} trimBefore={Math.round(from * FPS)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'blur(22px) brightness(0.38) saturate(0.9)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(13,20,32,0.55) 0%, rgba(13,20,32,0.2) 50%, rgba(13,20,32,0.75) 100%)'}} />
    </>
  );
};

const VideoShot: React.FC<{src: string; from: number; frames: number}> = ({src, from, frames}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, frames], [1.0, 1.06]);
  return (
    <AbsoluteFill style={{background: INK}}>
      <OffthreadVideo
        src={staticFile(DIR + src)}
        trimBefore={Math.round(from * FPS)}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: 'contrast(1.05) saturate(1.06)'}}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(13,20,32,0.5) 0%, transparent 16%, transparent 78%, rgba(13,20,32,0.5) 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.4) 100%)'}} />
    </AbsoluteFill>
  );
};

// شعار ثابت فوق اللقطات
const Watermark: React.FC<{from: number; to: number}> = ({from, to}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 15, to - 15, to], [0, 0.95, 0.95, 0], clamp);
  return <Img src={LOGO} style={{position: 'absolute', top: 70, right: 56, width: 190, opacity: o, filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.7))'}} />;
};

const centered = {direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily} as const;

const TitleCard: React.FC<{frames: number}> = ({frames}) => (
  <AbsoluteFill style={{background: INK}}>
    <BlurBg src="c1480.mp4" from={1} frames={frames} />
    <AbsoluteFill style={{...centered, padding: '0 60px'}}>
      <Logo width={420} delay={0} />
      <div style={{height: 50}} />
      <div style={{...useReveal(16), fontSize: 66, fontWeight: 700, color: ORANGE, textShadow: shadow}}>رحلة إلى</div>
      <div style={{...useReveal(24), fontSize: 112, fontWeight: 900, color: WHITE, lineHeight: 1.25, textShadow: shadow}}>وزارة الداخلية</div>
      <div style={{...useReveal(34), fontSize: 60, fontWeight: 700, color: WHITE, lineHeight: 1.5, textShadow: shadow, marginTop: 10}}>
        إدارة المرور
        <br />
        قسم العمليات
      </div>
      <Rule width={460} delay={46} />
      <div style={{...useReveal(56), fontSize: 50, fontWeight: 700, color: WHITE, textShadow: shadow}}>
        فصل <span style={{color: ORANGE, unicodeBidi: 'isolate', direction: 'ltr'}}>10-5</span> &nbsp;و&nbsp; فصل{' '}
        <span style={{color: ORANGE, unicodeBidi: 'isolate', direction: 'ltr'}}>10-7</span>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

const TEACHERS = ['أ. جنان المعييف', 'أ. غصون الفضلي', 'أ. سارة السلوم'];

const Credits: React.FC<{frames: number}> = ({frames}) => (
  <AbsoluteFill style={{background: INK}}>
    <BlurBg src="c1496.mp4" from={6} frames={frames} />
    <AbsoluteFill style={{...centered, padding: '0 60px'}}>
      <div style={{...useReveal(4), fontSize: 84, fontWeight: 900, color: ORANGE, textShadow: shadow}}>إشراف المعلمات</div>
      <Rule width={420} delay={14} />
      {TEACHERS.map((t, i) => (
        <div key={t} style={{...useReveal(22 + i * 10), fontSize: 76, fontWeight: 700, color: WHITE, lineHeight: 1.7, textShadow: shadow}}>
          {t}
        </div>
      ))}
    </AbsoluteFill>
  </AbsoluteFill>
);

const Final: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const black = interpolate(frame, [frames - 22, frames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <BlurBg src="c1479.mp4" frames={frames} />
      <AbsoluteFill style={{...centered, padding: '0 60px'}}>
        <Logo width={600} delay={2} />
        <Rule width={420} delay={22} />
        <div style={{...useReveal(30), fontSize: 54, fontWeight: 700, color: WHITE, textShadow: shadow}}>
          فصل <span style={{color: ORANGE, unicodeBidi: 'isolate', direction: 'ltr'}}>10-5</span> &nbsp;و&nbsp; فصل{' '}
          <span style={{color: ORANGE, unicodeBidi: 'isolate', direction: 'ltr'}}>10-7</span>
        </div>
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
      return <VideoShot src={shot.src} from={shot.from} frames={frames} />;
    case 'credits':
      return <Credits frames={frames} />;
    case 'final':
      return <Final frames={frames} />;
  }
};

export const TrafficTrip: React.FC = () => {
  const tl = timeline();
  const total = totalFrames();
  const vids = tl.filter((s) => s.shot.kind === 'video');
  const wmFrom = vids[0].start + XFADE;
  const wmTo = vids[vids.length - 1].start + vids[vids.length - 1].frames;
  const musicVol = (f: number) => interpolate(f, [0, 12, total - 30, total], [0, 0.85, 0.85, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
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
      <Watermark from={wmFrom} to={wmTo} />
      <Audio src={staticFile('c46/formal.mp3')} volume={musicVol} />
    </AbsoluteFill>
  );
};
