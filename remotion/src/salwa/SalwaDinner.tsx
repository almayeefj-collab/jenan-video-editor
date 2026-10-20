// حفل عشاء بمناسبة نجاح مؤتمر الكويت الدولي الأول للتدريب والتطوير — الأستاذة سلوى الطراروة
// الترتيب: عنوان ← كلمة أ. سلوى (مقصوصة قبل «لا تصوروني») ← مقتطفات على الموسيقى ← الصورة الجماعية
// اللقطات في public/footage/salwa/ (ما ترفع للمستودع)
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, random, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const XFADE = 18; // كروس فيد ناعم بين المقتطفات
const DIR = 'footage/salwa/';

const CHAMPAGNE = '#EED8AE';
const BLUSH = '#F4D9D2';
const INK = '#0B0A10';

type Shot =
  | {kind: 'title'; dur: number}
  | {kind: 'speech'; from: number; to: number}
  | {kind: 'video'; src: string; from: number; dur: number}
  | {kind: 'photo'; src: string; dur: number; pan?: 'in' | 'out'}
  | {kind: 'final'; dur: number};

const SHOTS: Shot[] = [
  {kind: 'title', dur: 5},
  // الكلمة تنقص عند «اليوم نحتفل بهذا النجاح» (14.0s) — بعدها «لا تصوروني»
  {kind: 'speech', from: 0.4, to: 14.2},
  {kind: 'video', src: 'bags.mp4', from: 0, dur: 4.2},
  {kind: 'video', src: 'cake.mp4', from: 4.8, dur: 4.2},
  {kind: 'photo', src: 'jenan.jpg', dur: 3.6, pan: 'in'},
  {kind: 'photo', src: 'noura.jpg', dur: 3.6, pan: 'out'},
  {kind: 'video', src: 'note.mp4', from: 0, dur: 3.4},
  {kind: 'video', src: 'laugh.mp4', from: 1.5, dur: 4.7},
  {kind: 'video', src: 'cake.mp4', from: 10.5, dur: 4.5},
  {kind: 'final', dur: 7},
];

const shotFrames = (s: Shot) => Math.round((s.kind === 'speech' ? s.to - s.from : s.dur) * FPS);
// العنوان يدخل على الكلمة بفيد أسرع، والباقي كروس فيد
const enterFrames = (i: number) => (i === 0 ? 0 : i === 1 ? 15 : XFADE);

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
const softShadow = '0 4px 28px rgba(0,0,0,0.75)';

const useReveal = (delay: number, dur = 22) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 26}px)`};
};

// نقاط ضوء bokeh تطفو ببطء
const Bokeh: React.FC<{count?: number; seed: string}> = ({count = 18, seed}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const x = random(`${seed}x${i}`) * WIDTH;
        const y0 = random(`${seed}y${i}`) * HEIGHT;
        const r = 6 + random(`${seed}r${i}`) * 22;
        const speed = 0.4 + random(`${seed}s${i}`) * 0.9;
        const y = ((y0 - frame * speed) % HEIGHT + HEIGHT) % HEIGHT;
        const tw = 0.35 + 0.3 * Math.sin(frame / (14 + i) + i);
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%',
              background: `radial-gradient(circle, ${i % 3 === 0 ? BLUSH : CHAMPAGNE}cc 0%, transparent 70%)`,
              opacity: tw,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${strength}) 100%)`}} />
);

const Ornament: React.FC<{width: number; delay: number}> = ({width, delay}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 26], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, margin: '34px auto'}}>
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to left, ${CHAMPAGNE}, transparent)`}} />
      <div style={{width: 12, height: 12, transform: `rotate(45deg) scale(${p})`, border: `2px solid ${CHAMPAGNE}`}} />
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to right, ${CHAMPAGNE}, transparent)`}} />
    </div>
  );
};

const TitleCard: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [frames - 26, frames - 4], [1, 0], clamp);
  const zoom = interpolate(frame, [0, frames], [1.15, 1.25]);
  return (
    <AbsoluteFill style={{background: INK}}>
      <OffthreadVideo
        src={staticFile(DIR + 'laugh.mp4')}
        trimBefore={Math.round(1.5 * FPS)}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, filter: 'blur(22px) brightness(0.42) saturate(1.2)'}}
      />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,10,16,0.55) 0%, rgba(40,20,30,0.25) 50%, rgba(11,10,16,0.7) 100%)'}} />
      <Bokeh seed="title" />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily, opacity: out, padding: '0 80px'}}>
        <div style={{...useReveal(8), fontSize: 132, fontWeight: 800, color: CHAMPAGNE, lineHeight: 1.1, textShadow: softShadow}}>حفل عشاء</div>
        <div style={{...useReveal(22), fontSize: 50, fontWeight: 500, color: '#fff', marginTop: 26, lineHeight: 1.5, textShadow: softShadow}}>
          بمناسبة نجاح
          <br />
          <span style={{fontWeight: 700}}>مؤتمر الكويت الدولي الأول</span>
          <br />
          للتدريب والتطوير
        </div>
        <Ornament width={520} delay={44} />
        <div style={{...useReveal(56), fontSize: 64, fontWeight: 700, color: BLUSH, textShadow: softShadow}}>الأستاذة سلوى الطراروة</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [20, 40, 170, 190], [0, 1, 1, 0], {...clamp, easing: ease});
  return (
    <div
      style={{
        position: 'absolute', bottom: 260, right: 70, direction: 'rtl', fontFamily,
        opacity: show, transform: `translateX(${(1 - show) * -40}px)`,
        padding: '18px 34px', borderRadius: 18, background: 'rgba(14,10,16,0.55)', backdropFilter: 'blur(10px)',
        borderRight: `5px solid ${CHAMPAGNE}`,
      }}
    >
      <div style={{fontSize: 48, fontWeight: 800, color: '#fff'}}>أ. سلوى الطراروة</div>
      <div style={{fontSize: 30, fontWeight: 500, color: CHAMPAGNE, marginTop: 2}}>رئيس المؤتمر</div>
    </div>
  );
};

const Speech: React.FC<{from: number; frames: number}> = ({from, frames}) => {
  // صوتها يختفي بنعومة آخر ثلث ثانية عشان القص ما يبين
  const vol = (f: number) => interpolate(f, [frames - 9, frames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <OffthreadVideo src={staticFile(DIR + 'speech.mp4')} trimBefore={Math.round(from * FPS)} volume={vol} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <Vignette strength={0.35} />
      <LowerThird />
    </AbsoluteFill>
  );
};

const GRADE = 'contrast(1.06) saturate(1.1) brightness(1.03) sepia(0.1)';

const VideoShot: React.FC<{src: string; from: number; frames: number}> = ({src, from, frames}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, frames], [1.02, 1.1]);
  return (
    <AbsoluteFill style={{background: INK}}>
      <OffthreadVideo src={staticFile(DIR + src)} trimBefore={Math.round(from * FPS)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: GRADE}} />
      <Vignette />
    </AbsoluteFill>
  );
};

const Photo: React.FC<{src: string; frames: number; pan?: 'in' | 'out'}> = ({src, frames, pan = 'in'}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, frames], [0, 1], {easing: Easing.inOut(Easing.sin)});
  const scale = pan === 'in' ? interpolate(p, [0, 1], [1.02, 1.14]) : interpolate(p, [0, 1], [1.14, 1.02]);
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Img src={staticFile(DIR + src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: GRADE}} />
      <Vignette />
    </AbsoluteFill>
  );
};

const Final: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, frames], [1.16, 1.0], {easing: Easing.out(Easing.quad)});
  const black = interpolate(frame, [frames - 30, frames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <Img src={staticFile(DIR + 'group.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: GRADE}} />
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(11,10,16,0.9) 0%, rgba(11,10,16,0.55) 25%, transparent 45%)'}} />
      <Bokeh seed="final" count={12} />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'flex-end', alignItems: 'center', textAlign: 'center', fontFamily, paddingBottom: 190}}>
        <div style={{...useReveal(40, 28), fontSize: 82, fontWeight: 800, color: CHAMPAGNE, textShadow: softShadow}}>نساء صنعوا النجاح</div>
        <Ornament width={420} delay={62} />
        <div style={{...useReveal(70, 28), fontFamily: numberFamily, fontStyle: 'italic', fontSize: 44, color: BLUSH, direction: 'ltr', textShadow: softShadow}}>We did it</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{shot: Shot; frames: number}> = ({shot, frames}) => {
  switch (shot.kind) {
    case 'title':
      return <TitleCard frames={frames} />;
    case 'speech':
      return <Speech from={shot.from} frames={frames} />;
    case 'video':
      return <VideoShot src={shot.src} from={shot.from} frames={frames} />;
    case 'photo':
      return <Photo src={shot.src} frames={frames} pan={shot.pan} />;
    case 'final':
      return <Final frames={frames} />;
  }
};

// الموسيقى: متوسطة على العنوان، هادية تحت الكلام، وتعلى مع المقتطفات
const musicVolume = (f: number) => {
  const tl = timeline();
  const speech = tl[1];
  const end = speech.start + speech.frames;
  return interpolate(
    f,
    [0, speech.start - 10, speech.start + 15, end - 20, end + 25],
    [0.9, 0.9, 0.12, 0.12, 0.9],
    {...clamp, easing: Easing.inOut(Easing.sin)},
  );
};

export const SalwaDinner: React.FC = () => {
  const tl = timeline();
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
      <Audio src={staticFile('music/romantic.wav')} volume={musicVolume} />
    </AbsoluteFill>
  );
};
