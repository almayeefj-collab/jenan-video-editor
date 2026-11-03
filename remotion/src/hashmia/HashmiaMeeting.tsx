// اجتماع مديري ومديرات المدارس الثانوية — ثانوية فاطمة الهاشمية (بنات)
// انترو بالشعار (مفرّغ من الخلفية، SVG) ← كرت بيانات الاجتماع والحضور ← لقطات اليوم ← أوترو بالشعار
// اللقطات في public/footage/hashmia (محوّلة مسبقاً لـ 1080x1920 / 30fps، ومحجوبة من git)
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

const C = {
  bg: '#FBF8F3',
  orange: '#E78627',
  dark: '#454441',
  muted: '#7A7672',
};

// [اسم الملف، عدد الفريمات] بترتيب التصوير
const CLIPS: [string, number][] = [
  ['IMG_1279', 144], ['IMG_1280', 64], ['IMG_1281', 85], ['IMG_1283', 109], ['IMG_1284', 78],
  ['IMG_1285', 167], ['IMG_1287', 113], ['IMG_1289', 127], ['IMG_1290', 136], ['IMG_1291', 102],
  ['IMG_1292', 44], ['IMG_1293', 89], ['IMG_1294', 46], ['IMG_1296', 246], ['IMG_1297', 142],
  ['IMG_1300', 248], ['IMG_1301', 89], ['IMG_1303', 136], ['IMG_1305', 127], ['IMG_1307', 285],
  ['IMG_1309', 105], ['IMG_1310', 246], ['IMG_1330', 94], ['IMG_1331', 201], ['IMG_1332', 255],
  ['IMG_1334', 140], ['IMG_1335', 121], ['IMG_1336', 101],
];

const INTRO = 300; // 10 ثواني: الشعار ثم بيانات الاجتماع
const OUTRO = 105;
const XF = 10; // تلاشي بين اللقطات
const XF_BIG = 18; // تلاشي الانترو/الأوترو

const clipLen = (n: number) => n - 2;
export const totalFrames = () =>
  INTRO + OUTRO + CLIPS.reduce((s, [, n]) => s + clipLen(n), 0) - XF * (CLIPS.length - 1) - 2 * XF_BIG;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #FFFFFF 0%, ${C.bg} 60%, #F3ECE1 100%)`}}>
      {/* معيّنات خفيفة تكبر ببطء خلف الشعار */}
      {[0, 1, 2].map((i) => {
        const s = interpolate(frame, [0, 300], [0.7 + i * 0.35, 1.0 + i * 0.35]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 540 - 300,
              top: 700 - 300,
              width: 600,
              height: 600,
              border: `3px solid ${C.orange}`,
              opacity: interpolate(frame, [0, 30], [0, 0.1 - i * 0.025], clamp),
              transform: `scale(${s}) rotate(45deg)`,
            }}
          />
        );
      })}
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, background: C.orange}} />
    </AbsoluteFill>
  );
};

// الشعار: الشيفرون البرتقالي يدور ويكبر، المعيّن الصغير ينزل، ثم الكتابة تنكشف من اليمين
const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chev = spring({frame: frame - 6, fps, config: {damping: 14, mass: 0.9}});
  const dia = spring({frame: frame - 22, fps, config: {damping: 9}});
  const word = interpolate(frame, [32, 58], [0, 1], {...clamp, easing: ease});
  // بعد 3.5 ثانية الشعار يصغر ويطلع فوق عشان يفسح لبيانات الاجتماع
  const move = interpolate(frame, [100, 128], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const scale = interpolate(move, [0, 1], [1, 0.56]);
  const y = interpolate(move, [0, 1], [0, -470]);
  const emblemW = 420;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `translateY(${y - 80}px) scale(${scale})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{position: 'relative', width: emblemW, height: emblemW}}>
          <Img
            src={staticFile('brand/hashmia/chevron.svg')}
            style={{position: 'absolute', inset: 0, width: '100%', opacity: chev, transform: `scale(${0.35 + 0.65 * chev}) rotate(${(1 - chev) * -90}deg)`}}
          />
          <Img
            src={staticFile('brand/hashmia/diamond.svg')}
            style={{position: 'absolute', inset: 0, width: '100%', opacity: Math.min(1, dia * 2), transform: `translateY(${(1 - dia) * -160}px)`}}
          />
        </div>
        <Img
          src={staticFile('brand/hashmia/wordmark.svg')}
          style={{
            width: 900,
            marginTop: 50,
            clipPath: `inset(0 0 0 ${(1 - word) * 100}%)`,
            transform: `translateY(${(1 - word) * 30}px)`,
            opacity: word,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const Line: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 16], [0, 1], {...clamp, easing: ease});
  return <div style={{opacity: t, transform: `translateY(${(1 - t) * 40}px)`, ...style}}>{children}</div>;
};

const Divider: React.FC<{at: number}> = ({at}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 20], [0, 1], {...clamp, easing: ease});
  const bar = {height: 4, width: 170 * t, background: C.orange, borderRadius: 2};
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 18, margin: '34px 0', opacity: t}}>
      <div style={bar} />
      <div style={{width: 18, height: 18, background: C.dark, transform: 'rotate(45deg)'}} />
      <div style={bar} />
    </div>
  );
};

const Guest: React.FC<{at: number; role: string; name: string}> = ({at, role, name}) => (
  <Line at={at} style={{textAlign: 'center', marginTop: 26}}>
    <div style={{fontSize: 40, fontWeight: 600, color: C.muted}}>{role}</div>
    <div style={{fontSize: 70, fontWeight: 800, color: C.orange, lineHeight: 1.35}}>{name}</div>
  </Line>
);

const Details: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: 700, direction: 'rtl', fontFamily}}>
    <Line at={118} style={{fontSize: 44, fontWeight: 600, color: C.muted}}>أقامت ثانوية فاطمة الهاشمية - بنات</Line>
    <Line at={128} style={{fontSize: 86, fontWeight: 900, color: C.dark, textAlign: 'center', lineHeight: 1.3, marginTop: 14}}>
      اجتماع مديري ومديرات
      <br />
      المدارس الثانوية
    </Line>
    <Divider at={144} />
    <Line at={152} style={{fontSize: 46, fontWeight: 700, color: C.dark}}>بحضور</Line>
    <Guest at={162} role="مراقب التعليم الثانوي بالتكليف" name="د. مبارك الخشاب" />
    <Guest at={180} role="مدير الشؤون التعليمية" name="د. محمد الحربي" />
  </AbsoluteFill>
);

const Intro: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Logo />
    <Details />
  </AbsoluteFill>
);

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [XF_BIG, XF_BIG + 24], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #FFFFFF 0%, ${C.bg} 60%, #F3ECE1 100%)`}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, background: C.orange}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile('brand/hashmia/logo.svg')} style={{width: 760, opacity: t, transform: `scale(${0.9 + 0.1 * t})`}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Clip: React.FC<{name: string; frames: number}> = ({name, frames}) => {
  const frame = useCurrentFrame();
  // زوم بطيء خفيف يعطي حركة للقطات الثابتة
  const s = interpolate(frame, [0, frames], [1, 1.05]);
  return (
    <AbsoluteFill style={{background: 'black'}}>
      <OffthreadVideo
        src={staticFile(`footage/hashmia/${name}.mp4`)}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`}}
      />
    </AbsoluteFill>
  );
};

// شارة الشعار فوق يمين أثناء اللقطات
const Badge: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 15], [0, 1], clamp) * interpolate(frame, [dur - 15, dur], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        top: 90,
        right: 44,
        width: 132,
        height: 132,
        borderRadius: 30,
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: t,
        transform: `translateX(${(1 - t) * 40}px)`,
      }}
    >
      <Img src={staticFile('brand/hashmia/emblem.svg')} style={{width: 96}} />
    </div>
  );
};

export const HashmiaMeeting: React.FC = () => {
  const total = totalFrames();
  const footStart = INTRO - XF_BIG;
  const footEnd = total - OUTRO + XF_BIG;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}>
          <Intro />
        </TransitionSeries.Sequence>
        {CLIPS.map(([name, n], i) => (
          <Fragment key={name}>
            <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: i === 0 ? XF_BIG : XF})} />
            <TransitionSeries.Sequence durationInFrames={clipLen(n)}>
              <Clip name={name} frames={clipLen(n)} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: XF_BIG})} />
        <TransitionSeries.Sequence durationInFrames={OUTRO}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Sequence from={footStart + XF_BIG} durationInFrames={footEnd - footStart - 2 * XF_BIG}>
        <Badge dur={footEnd - footStart - 2 * XF_BIG} />
      </Sequence>
      <Sequence from={4} durationInFrames={60}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={96} durationInFrames={40}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
