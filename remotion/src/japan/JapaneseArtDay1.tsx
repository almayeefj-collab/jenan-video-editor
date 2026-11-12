// دورة الفن الياباني — ثانوية فاطمة الهاشمية (اليوم الأول + الختام)
// عنوان ← لقطات الورشة بدون كتابة ← الإعداد والإشراف ← شعار المدرسة
// اللقطات في public/footage/day1/ و public/footage/closing/ (ما ترفع للمستودع)
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {createContext, Fragment, useContext} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const XFADE = 12;
const LOGO = 'brand/fatma-alhashmia-logo.png';

// ألوان ورق الواشي الياباني + الأحمر القرمزي + برتقالي شعار المدرسة
const WASHI = '#F5EFE4';
const CRIMSON = '#B3262E';
const INK = '#1C1B20';
const ORANGE = '#E5892A';

type Shot =
  | {kind: 'title'; dur: number}
  | {kind: 'video'; src: string; from: number; dur: number; wide?: boolean; zoom?: number; origin?: string}
  | {kind: 'photo'; src: string; dur: number; wide?: boolean; aspect?: number}
  | {kind: 'credits'; dur: number}
  | {kind: 'end'; dur: number};

const DAY1_SHOTS: Shot[] = [
  {kind: 'title', dur: 4.4},
  // القاعة: تكبير لجهة اليمين عشان المقدّمة (الحجاب والعباية البنفسجية) ما تطلع
  {kind: 'video', src: 'f3f9374a.mp4', from: 0.3, dur: 5.6, zoom: 1.6, origin: '100% 50%'},
  {kind: 'video', src: '8835b874.mp4', from: 2.0, dur: 6.0},
  {kind: 'video', src: 'efe0ce2c.mp4', from: 0.0, dur: 4.6},
  {kind: 'video', src: '5f125241.mp4', from: 0.4, dur: 5.0},
  {kind: 'video', src: 'b25c35e4.mp4', from: 0.0, dur: 4.4},
  {kind: 'video', src: 'b2156b50.mp4', from: 3.0, dur: 5.0},
  {kind: 'video', src: '270baead.mp4', from: 3.0, dur: 6.0},
  {kind: 'video', src: 'b2156b50.mp4', from: 26.0, dur: 4.6},
  {kind: 'video', src: '651e8866.mp4', from: 1.5, dur: 7.0},
  {kind: 'photo', src: 'photo2.jpg', dur: 4.4},
  {kind: 'credits', dur: 7.6},
  {kind: 'end', dur: 4.4},
];

const CLOSING_SHOTS: Shot[] = [
  {kind: 'title', dur: 4.4},
  {kind: 'video', src: '6826cbb1.mp4', from: 0.0, dur: 2.7},
  {kind: 'video', src: '58b92aad.mp4', from: 0.0, dur: 2.8},
  {kind: 'video', src: '1c97e7e5.mp4', from: 0.0, dur: 3.8},
  {kind: 'video', src: '0305f0bc.mp4', from: 0.0, dur: 3.9},
  {kind: 'video', src: 'be4002c4.mp4', from: 0.0, dur: 2.6},
  {kind: 'video', src: 'a902e71f.mp4', from: 0.0, dur: 2.6},
  {kind: 'video', src: 'c679d4f0.mp4', from: 0.0, dur: 3.3},
  {kind: 'video', src: 'c679d4f0.mp4', from: 4.0, dur: 4.5},
  {kind: 'video', src: '6f394c12.mp4', from: 3.0, dur: 4.5},
  {kind: 'video', src: '68400728.mp4', from: 0.0, dur: 5.0},
  {kind: 'video', src: '34c64b24.mp4', from: 0.0, dur: 2.5},
  {kind: 'video', src: '746ceaa3.mp4', from: 0.0, dur: 5.0},
  {kind: 'photo', src: 'group.jpg', dur: 5.6, wide: true, aspect: 3 / 4},
  {kind: 'credits', dur: 7.6},
  {kind: 'end', dur: 4.4},
];

type Cfg = {dir: string; shots: Shot[]; subtitle: string};
const DAY1: Cfg = {dir: 'footage/day1/', shots: DAY1_SHOTS, subtitle: 'اليوم الأول'};
const CLOSING: Cfg = {dir: 'footage/closing/', shots: CLOSING_SHOTS, subtitle: 'الختام'};
const CfgCtx = createContext<Cfg>(DAY1);

const shotFrames = (s: Shot) => Math.round(s.dur * FPS);
const enterFrames = (i: number) => (i === 0 ? 0 : XFADE);

const timeline = (shots: Shot[]) => {
  let t = 0;
  return shots.map((shot, i) => {
    t -= enterFrames(i);
    const start = t;
    t += shotFrames(shot);
    return {shot, start, frames: shotFrames(shot)};
  });
};
const framesOf = (shots: Shot[]) => {
  const tl = timeline(shots);
  const last = tl[tl.length - 1];
  return last.start + last.frames;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);

const useReveal = (delay: number, dur = 22) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 24}px)`};
};

// نقشة الأمواج اليابانية (سيقايها) خفيفة على ورق الواشي
const Seigaiha: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const r = 60;
  const arcs = [1, 0.75, 0.5, 0.25].map((k) => `<circle cx="${r}" cy="${r}" r="${r * k}" fill="none" stroke="${INK}" stroke-width="3"/>`).join('');
  const cell = (x: number, y: number) => `<g transform="translate(${x},${y})"><circle cx="${r}" cy="${r}" r="${r}" fill="${WASHI}"/>${arcs}</g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${2 * r}" height="${r}">${cell(-r, -r / 2)}${cell(r, -r / 2)}${cell(0, 0)}${cell(-r, r / 2)}${cell(r, r / 2)}</svg>`;
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundSize: `${2 * r}px ${r}px`,
      }}
    />
  );
};

const Washi: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: WASHI}}>
    <Seigaiha />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(245,239,228,0.92) 30%, rgba(245,239,228,0.4) 100%)'}} />
    {children}
  </AbsoluteFill>
);

const Rule: React.FC<{width: number; delay: number; color?: string}> = ({width, delay, color = CRIMSON}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 26], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '28px auto'}}>
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to left, ${color}, transparent)`}} />
      <div style={{width: 11, height: 11, transform: `rotate(45deg) scale(${p})`, background: ORANGE}} />
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to right, ${color}, transparent)`}} />
    </div>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.4) 100%)'}} />
);

const Media: React.FC<{src: string; from?: number; style: React.CSSProperties}> = ({src, from, style}) => {
  const {dir} = useContext(CfgCtx);
  return src.endsWith('.jpg') ? (
    <Img src={staticFile(dir + src)} style={style} />
  ) : (
    <OffthreadVideo src={staticFile(dir + src)} trimBefore={Math.round((from ?? 0) * FPS)} muted style={style} />
  );
};

const look = 'contrast(1.05) saturate(1.06) brightness(1.02)';

const MediaShot: React.FC<{src: string; from?: number; frames: number; wide?: boolean; aspect?: number; zoom?: number; origin?: string}> = ({src, from, frames, wide, aspect = 16 / 9, zoom = 1, origin = '50% 50%'}) => {
  const frame = useCurrentFrame();
  const scale = zoom * interpolate(frame, [0, frames], [1.0, 1.06]);
  if (!wide) {
    return (
      <AbsoluteFill style={{background: INK}}>
        <Media src={src} from={from} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: look}} />
        <Vignette />
      </AbsoluteFill>
    );
  }
  // لقطة أعرض من الإطار العمودي: خلفية مموّهة من نفس اللقطة + اللقطة كاملة في الوسط
  const fgW = 1080;
  const fgH = Math.round(fgW / aspect);
  return (
    <AbsoluteFill style={{background: INK}}>
      <Media src={src} from={from} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.2 + (scale - 1)})`, transformOrigin: origin, filter: 'blur(26px) brightness(0.55) saturate(1.1)'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{width: fgW, height: fgH, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
          <Media src={src} from={from} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, transformOrigin: origin, filter: look}} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, frames], [0, -16]);
  const {subtitle} = useContext(CfgCtx);
  return (
    <Washi>
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', fontFamily, textAlign: 'center', transform: `translateY(${drift}px)`}}>
        <Img src={staticFile(LOGO)} style={{...useReveal(4, 26), width: 440, mixBlendMode: 'multiply', marginBottom: 110}} />
        <div style={{...useReveal(22), fontSize: 120, fontWeight: 900, color: INK, lineHeight: 1.2}}>
          دورة
          <br />
          الفن الياباني
        </div>
        <Rule width={460} delay={36} />
        <div style={{...useReveal(44), fontSize: 64, fontWeight: 700, color: CRIMSON}}>{subtitle}</div>
      </AbsoluteFill>
    </Washi>
  );
};

const CREDITS = [
  {role: 'إعداد المعلمة', name: 'شوق العتيبي'},
  {role: 'رئيسة الشعبة', name: 'أ/ نوف العريني'},
  {role: 'الموجهة الفنية', name: 'أ/ أمل الشيخ'},
  {role: 'مراقب التوجيه الفني', name: 'أ/ ناصر الدمخي'},
];

const Credits: React.FC = () => (
  <Washi>
    <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily}}>
      {CREDITS.map((c, i) => (
        <Fragment key={c.role}>
          {i > 0 ? <Rule width={260} delay={10 + i * 18} /> : null}
          <div style={useReveal(6 + i * 18)}>
            <div style={{fontSize: 46, fontWeight: 600, color: CRIMSON}}>{c.role}</div>
            <div style={{fontSize: 80, fontWeight: 800, color: INK, lineHeight: 1.35}}>{c.name}</div>
          </div>
        </Fragment>
      ))}
    </AbsoluteFill>
  </Washi>
);

const End: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [frames - 22, frames], [0, 1], clamp);
  const {subtitle} = useContext(CfgCtx);
  return (
    <Washi>
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily}}>
        <Img src={staticFile(LOGO)} style={{...useReveal(4, 26), width: 560, mixBlendMode: 'multiply'}} />
        <Rule width={420} delay={26} />
        <div style={{...useReveal(34), fontSize: 54, fontWeight: 700, color: CRIMSON}}>دورة الفن الياباني · {subtitle}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: WASHI, opacity: fadeOut}} />
    </Washi>
  );
};

const ShotView: React.FC<{shot: Shot; frames: number}> = ({shot, frames}) => {
  switch (shot.kind) {
    case 'title':
      return <TitleCard frames={frames} />;
    case 'video':
      return <MediaShot src={shot.src} from={shot.from} frames={frames} wide={shot.wide} zoom={shot.zoom} origin={shot.origin} />;
    case 'photo':
      return <MediaShot src={shot.src} frames={frames} wide={shot.wide} aspect={shot.aspect} />;
    case 'credits':
      return <Credits />;
    case 'end':
      return <End frames={frames} />;
  }
};

const JapaneseArt: React.FC<{cfg: Cfg}> = ({cfg}) => {
  const tl = timeline(cfg.shots);
  const total = framesOf(cfg.shots);
  const musicVol = (f: number) => interpolate(f, [0, 15, total - 30, total], [0, 0.85, 0.85, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
  return (
    <CfgCtx.Provider value={cfg}>
    <AbsoluteFill style={{background: WASHI}}>
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
      <Audio src={staticFile('c46/soft.mp3')} volume={musicVol} />
    </AbsoluteFill>
    </CfgCtx.Provider>
  );
};

export const JapaneseArtDay1: React.FC = () => <JapaneseArt cfg={DAY1} />;
export const JapaneseArtClosing: React.FC = () => <JapaneseArt cfg={CLOSING} />;
export const totalFrames = () => framesOf(DAY1_SHOTS);
export const closingFrames = () => framesOf(CLOSING_SHOTS);
