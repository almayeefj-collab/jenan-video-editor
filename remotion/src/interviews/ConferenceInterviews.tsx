// أبرز لقاءات مؤتمر الكويت الدولي الأول للتدريب والتطوير — من تغطية تلفزيون الكويت
// الترتيب: عنوان ← لقطات القاعة ← خمس لقاءات (كل واحد بصوته واسمه) ← ختام
// اللقطات في public/footage/interviews/ (ما ترفع للمستودع):
//   hall.mp4  = لقطات الحضور، clipA.mp4 = د. وليد / د. هبه / كوثر، clipB.mp4 = كلمة المنصة / الشيخة عبير / أ. سلوى
// الصوت مطبّع بـ loudnorm من ملفات الـ mov الأصلية.
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
const XFADE = 14;
const DIR = 'footage/interviews/';

const NAVY = '#0D1A3A';
const GOLD = '#D4AF6A';
const CREAM = '#F5EBD7';
const INK = '#070B18';

// المصدر 848×478 وفيه شريط القناة والمترجم بلغة الإشارة تحت؛ نقص فوق y=340 ونأخذ نافذة 16:9
const SRC_W = 848;
const CROP_H = 340;
const K = HEIGHT / CROP_H;

type Clip = {src: string; from: number; to: number; x: number};
type Shot =
  | {kind: 'title'; dur: number; bg: Clip}
  | {kind: 'broll'; clip: Clip; line?: 0 | 1}
  | {kind: 'interview'; clip: Clip; name: string; role: string; n: number}
  | {kind: 'final'; dur: number; bg: Clip};

const SHOTS: Shot[] = [
  {kind: 'title', dur: 5.5, bg: {src: 'clipA.mp4', from: 6.4, to: 10.6, x: 120}},
  {kind: 'broll', clip: {src: 'clipA.mp4', from: 6.4, to: 10.2, x: 120}, line: 0},
  {kind: 'broll', clip: {src: 'clipB.mp4', from: 14.6, to: 18.4, x: 130}, line: 1},
  {kind: 'broll', clip: {src: 'clipA.mp4', from: 11.2, to: 14.4, x: 120}},
  {kind: 'interview', clip: {src: 'clipB.mp4', from: 37.86, to: 54.75, x: 115}, name: 'أ. سلوى الطراروة', role: 'رئيس مؤتمر الكويت الدولي الأول للتدريب والتطوير', n: 1},
  {kind: 'interview', clip: {src: 'clipB.mp4', from: 21.75, to: 37.25, x: 140}, name: 'الشيخة د. عبير فاضل الصباح', role: 'رئيس تكنو واي للتدريب', n: 2},
  {kind: 'interview', clip: {src: 'clipA.mp4', from: 20.2, to: 35.1, x: 150}, name: 'د. وليد الطراروة', role: 'متخصص في إدارة وتنمية الموارد البشرية', n: 3},
  {kind: 'interview', clip: {src: 'clipA.mp4', from: 35.6, to: 41.95, x: 150}, name: 'د. هبه المتروك', role: 'ممثلة منصة تشافي', n: 4},
  {kind: 'interview', clip: {src: 'clipA.mp4', from: 42.7, to: 48.6, x: 115}, name: 'كوثر معرفي', role: 'مدرب دولي معتمد', n: 5},
  {kind: 'final', dur: 7, bg: {src: 'hall.mp4', from: 3.2, to: 10.2, x: 120}},
];
const COUNT = SHOTS.filter((s) => s.kind === 'interview').length;

const shotFrames = (s: Shot) => Math.round((s.kind === 'title' || s.kind === 'final' ? s.dur : s.clip.to - s.clip.from) * FPS);

export const timeline = () => {
  let t = 0;
  return SHOTS.map((shot, i) => {
    if (i > 0) t -= XFADE;
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
const shadow = '0 4px 30px rgba(0,0,0,0.8)';

const useReveal = (delay: number, dur = 22) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 28}px)`};
};

const GRADE = 'contrast(1.05) saturate(1.08) brightness(1.02)';

// نافذة 16:9 من الجزء النظيف من اللقطة، مع زوم بطيء
const Footage: React.FC<{clip: Clip; frames: number; volume?: (f: number) => number; muted?: boolean; filter?: string; zoom?: [number, number]}> = ({
  clip, frames, volume, muted, filter = GRADE, zoom = [1.0, 1.06],
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, frames], zoom);
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${scale})`}}>
        <OffthreadVideo
          src={staticFile(DIR + clip.src)}
          trimBefore={Math.round(clip.from * FPS)}
          muted={muted}
          volume={volume}
          style={{position: 'absolute', top: 0, left: -clip.x * K, width: SRC_W * K, height: 'auto', maxWidth: 'none', filter}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{strength?: number}> = ({strength = 0.5}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${strength}) 100%)`}} />
);

// ذرات ذهبية تطفو
const Dust: React.FC<{seed: string; count?: number}> = ({seed, count = 22}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const x = random(`${seed}x${i}`) * WIDTH;
        const y0 = random(`${seed}y${i}`) * HEIGHT;
        const r = 3 + random(`${seed}r${i}`) * 12;
        const y = ((y0 - frame * (0.3 + random(`${seed}s${i}`) * 0.7)) % HEIGHT + HEIGHT) % HEIGHT;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%',
              background: `radial-gradient(circle, ${GOLD}bb 0%, transparent 70%)`,
              opacity: 0.3 + 0.3 * Math.sin(frame / (12 + i) + i),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Rule: React.FC<{width: number; delay: number}> = ({width, delay}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 26], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '30px auto'}}>
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to left, ${GOLD}, transparent)`}} />
      <div style={{width: 12, height: 12, transform: `rotate(45deg) scale(${p})`, border: `2px solid ${GOLD}`}} />
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to right, ${GOLD}, transparent)`}} />
    </div>
  );
};

const Backdrop: React.FC<{clip: Clip; frames: number}> = ({clip, frames}) => (
  <>
    <Footage clip={clip} frames={frames} muted filter="blur(18px) brightness(0.38) saturate(1.15)" zoom={[1.12, 1.22]} />
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${NAVY}cc 0%, ${NAVY}55 50%, ${INK}dd 100%)`}} />
    <Dust seed={clip.src + clip.from} />
  </>
);

const TitleCard: React.FC<{bg: Clip; frames: number}> = ({bg, frames}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [frames - 24, frames - 2], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <Backdrop clip={bg} frames={frames} />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily, opacity: out}}>
        <div style={{...useReveal(6), fontSize: 120, fontWeight: 800, color: GOLD, textShadow: shadow, lineHeight: 1.15}}>أبرز اللقاءات</div>
        <Rule width={560} delay={22} />
        <div style={{...useReveal(30), fontSize: 64, fontWeight: 700, color: '#fff', textShadow: shadow}}>مؤتمر الكويت الدولي الأول</div>
        <div style={{...useReveal(40), fontSize: 50, fontWeight: 500, color: CREAM, marginTop: 6, textShadow: shadow}}>للتدريب والتطوير</div>
        <div style={{...useReveal(54), fontFamily: numberFamily, fontSize: 40, color: GOLD, marginTop: 26, letterSpacing: 8, textShadow: shadow}}>2026</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const THEME = ['رأس المال البشري والإبداعي', 'قيمة مضافة لدعم الاقتصاد الوطني وتحقيق التنمية المستدامة'];

const BRoll: React.FC<{clip: Clip; frames: number; line?: 0 | 1}> = ({clip, frames, line}) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [10, 30, frames - 22, frames - 6], [0, 1, 1, 0], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <Footage clip={clip} frames={frames} muted zoom={[1.02, 1.1]} />
      <Vignette />
      {line === undefined ? null : (
        <AbsoluteFill style={{background: `linear-gradient(to top, ${INK}dd 0%, transparent 40%)`, opacity: show}}>
          <AbsoluteFill style={{direction: 'rtl', justifyContent: 'flex-end', alignItems: 'center', textAlign: 'center', fontFamily, paddingBottom: 110}}>
            <div style={{fontSize: line === 0 ? 72 : 52, fontWeight: line === 0 ? 800 : 600, color: line === 0 ? GOLD : '#fff', textShadow: shadow, transform: `translateY(${(1 - show) * 24}px)`}}>
              {THEME[line]}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const LowerThird: React.FC<{name: string; role: string; n: number; frames: number}> = ({name, role, n, frames}) => {
  const frame = useCurrentFrame();
  const end = Math.min(frames - 12, 6.5 * FPS);
  const show = interpolate(frame, [14, 34, end - 18, end], [0, 1, 1, 0], {...clamp, easing: ease});
  const bar = interpolate(frame, [14, 40], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', bottom: 90, right: 90, direction: 'rtl', fontFamily, display: 'flex', alignItems: 'stretch', opacity: show, transform: `translateX(${(1 - show) * -50}px)`}}>
      <div style={{width: 8, background: GOLD, transform: `scaleY(${bar})`, borderRadius: 4}} />
      <div style={{padding: '20px 36px 22px', background: `linear-gradient(to left, ${NAVY}f0, ${NAVY}c0)`, borderRadius: '0 0 0 18px'}}>
        <div style={{fontSize: 56, fontWeight: 800, color: '#fff', lineHeight: 1.2}}>{name}</div>
        <div style={{fontSize: 32, fontWeight: 500, color: GOLD, marginTop: 4}}>{role}</div>
      </div>
      <div style={{alignSelf: 'flex-end', marginRight: 18, fontFamily: numberFamily, fontSize: 30, color: CREAM, opacity: 0.85, textShadow: shadow}}>
        {String(n).padStart(2, '0')}/{String(COUNT).padStart(2, '0')}
      </div>
    </div>
  );
};

// شارة صغيرة باسم المؤتمر في الزاوية طول اللقاء
const Badge: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [10, 30], [0, 0.9], clamp);
  return (
    <div style={{position: 'absolute', top: 56, left: 70, direction: 'rtl', fontFamily, opacity: o, padding: '10px 24px', borderRadius: 40, background: `${NAVY}b0`, border: `1.5px solid ${GOLD}88`, fontSize: 26, fontWeight: 600, color: CREAM}}>
      مؤتمر الكويت الدولي الأول للتدريب والتطوير
    </div>
  );
};

const Interview: React.FC<{clip: Clip; frames: number; name: string; role: string; n: number}> = ({clip, frames, name, role, n}) => {
  // الصوت يدخل ويطلع مع الكروس فيد عشان القص ما يبين
  const vol = (f: number) => interpolate(f, [0, 8, frames - 10, frames], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <Footage clip={clip} frames={frames} volume={vol} zoom={[1.0, 1.05]} />
      <Vignette strength={0.35} />
      <Badge />
      <LowerThird name={name} role={role} n={n} frames={frames} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{bg: Clip; frames: number}> = ({bg, frames}) => {
  const frame = useCurrentFrame();
  const black = interpolate(frame, [frames - 30, frames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <Backdrop clip={bg} frames={frames} />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily}}>
        <div style={{...useReveal(10), fontSize: 84, fontWeight: 800, color: GOLD, textShadow: shadow}}>مؤتمر الكويت الدولي الأول</div>
        <div style={{...useReveal(20), fontSize: 56, fontWeight: 600, color: '#fff', marginTop: 4, textShadow: shadow}}>للتدريب والتطوير</div>
        <Rule width={480} delay={34} />
        <div style={{...useReveal(44), fontSize: 40, fontWeight: 500, color: CREAM, textShadow: shadow}}>برعاية كريمة من معالي وزير العدل</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{shot: Shot; frames: number}> = ({shot, frames}) => {
  switch (shot.kind) {
    case 'title':
      return <TitleCard bg={shot.bg} frames={frames} />;
    case 'broll':
      return <BRoll clip={shot.clip} frames={frames} line={shot.line} />;
    case 'interview':
      return <Interview clip={shot.clip} frames={frames} name={shot.name} role={shot.role} n={shot.n} />;
    case 'final':
      return <Final bg={shot.bg} frames={frames} />;
  }
};

// الموسيقى عالية على العنوان واللقطات، هادية جداً تحت اللقاءات، وتعلى مع الختام
const musicVolume = (f: number) => {
  const tl = timeline();
  const talks = tl.filter((t) => t.shot.kind === 'interview');
  const a = talks[0].start;
  const last = talks[talks.length - 1];
  const b = last.start + last.frames;
  const end = totalFrames();
  return interpolate(
    f,
    [0, 20, a - 12, a + 10, b - 12, b + 10, end - 30, end],
    [0, 0.7, 0.7, 0.07, 0.07, 0.7, 0.6, 0],
    {...clamp, easing: Easing.inOut(Easing.sin)},
  );
};

export const ConferenceInterviews: React.FC = () => {
  const tl = timeline();
  return (
    <AbsoluteFill style={{background: INK}}>
      <TransitionSeries>
        {tl.map(({shot, frames}, i) => (
          <Fragment key={i}>
            {i > 0 ? <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: XFADE})} /> : null}
            <TransitionSeries.Sequence durationInFrames={frames}>
              <ShotView shot={shot} frames={frames} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <Audio src={staticFile('c46/soft.mp3')} volume={musicVolume} />
    </AbsoluteFill>
  );
};
