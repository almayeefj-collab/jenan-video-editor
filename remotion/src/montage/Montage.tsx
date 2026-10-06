import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {brand} from '../reel/config';
import {fontFamily} from '../reel/font';
import {LowerThird, Outro} from '../reel/Overlays';
import {zoomBlur} from '../reel/zoomBlur';
import {beatStart, FPS, honorStart, LOGO, outroStart, type Overlay, type Shot, timeline, totalFrames, TRANSITION} from './config';
import {flash, whip} from './transitions';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const shadow = '0 6px 30px rgba(0,0,0,0.55)';

// سطر يتكتب حرف حرف من اليمين (مثل الكتابة على الكيبورد) مع مؤشر يرمش.
// النص الكامل مخفي تحت عشان المكان ثابت وما يتحرك السطر وهو ينكتب.
const TypeLine: React.FC<{text: string; start: number; fpc: number; cursor: 'typing' | 'blink' | 'off'; style: React.CSSProperties}> = ({
  text,
  start,
  fpc,
  cursor,
  style,
}) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  const n = Math.max(0, Math.min(chars.length, Math.floor((frame - start) / fpc) + 1));
  const typing = frame >= start && n < chars.length;
  const showCursor = cursor !== 'off' && frame >= start - 6 && (typing || Math.floor(frame / 12) % 2 === 0);
  return (
    <div style={{position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', ...style}}>
      <span style={{visibility: 'hidden'}}>{text}</span>
      <span style={{position: 'absolute', right: 0, top: 0}}>
        {frame >= start ? chars.slice(0, n).join('') : ''}
        <span
          style={{
            display: 'inline-block',
            width: '0.07em',
            height: '0.95em',
            marginRight: '0.06em',
            verticalAlign: '-0.12em',
            background: brand.gold,
            borderRadius: 3,
            opacity: showCursor ? 1 : 0,
          }}
        />
      </span>
    </div>
  );
};

// صوت كيبورد: ضغطة مع كل حرف، والمسافة ضغطة أقوى شوي
const KeySounds: React.FC<{text: string; start: number; fpc: number}> = ({text, start, fpc}) => (
  <>
    {Array.from(text).map((c, i) => (
      <Sequence key={i} from={start + Math.round(i * fpc)} durationInFrames={5}>
        <Audio src={staticFile(`sfx/key${c === ' ' ? 0 : (i * 5 + 3) % 4}.wav`)} volume={c === ' ' ? 0.6 : 0.4 + ((i * 3) % 4) * 0.05} />
      </Sequence>
    ))}
  </>
);

// العنوان: ينكتب كأن أحد قاعد يكتبه — العنوان الكبير أول، بعدين السطر الذهبي تحته
const MAIN_FPC = 2;
const SUB_FPC = 1.3;
const TitleCard: React.FC<{text: string; sub?: string; dur: number}> = ({text, sub, dur}) => {
  const frame = useCurrentFrame();
  const mainStart = 6;
  const mainEnd = mainStart + Math.round(Array.from(text).length * MAIN_FPC);
  const subStart = mainEnd + 6;
  const subEnd = sub ? subStart + Math.round(Array.from(sub).length * SUB_FPC) : mainEnd;
  const out = interpolate(frame, [dur - 12, dur], [0, 1], clamp);
  const bar = interpolate(frame, [mainEnd, mainEnd + 18], [0, 1], {...clamp, easing: ease});
  const bgIn = interpolate(frame, [0, 10], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        fontFamily,
        direction: 'rtl',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - out,
        filter: `blur(${out * 14}px)`,
        transform: `scale(${1 + 0.06 * out})`,
      }}
    >
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(9,28,58,0.6) 0%, rgba(9,28,58,0) 70%)', opacity: bgIn}} />
      <TypeLine
        text={text}
        start={mainStart}
        fpc={MAIN_FPC}
        cursor={frame < subStart || !sub ? (frame < mainEnd ? 'typing' : 'blink') : 'off'}
        style={{fontSize: 104, fontWeight: 900, color: brand.text, textShadow: shadow, lineHeight: 1.35}}
      />
      <div style={{height: 8, width: 420 * bar, background: brand.bar, borderRadius: 4, margin: '14px 0 18px'}} />
      {sub ? (
        <TypeLine
          text={sub}
          start={subStart}
          fpc={SUB_FPC}
          cursor={frame >= subStart ? (frame < subEnd ? 'typing' : 'blink') : 'off'}
          style={{fontSize: 46, fontWeight: 800, color: brand.gold, textShadow: shadow, lineHeight: 1.4}}
        />
      ) : null}
      <KeySounds text={text} start={mainStart} fpc={MAIN_FPC} />
      {sub ? <KeySounds text={sub} start={subStart} fpc={SUB_FPC} /> : null}
    </AbsoluteFill>
  );
};

const OverlayView: React.FC<{o: Overlay}> = ({o}) => {
  switch (o.kind) {
    case 'title':
      return (
        <Sequence from={Math.round(o.at * FPS)} durationInFrames={Math.round(o.dur * FPS)}>
          <TitleCard text={o.text} sub={o.sub} dur={Math.round(o.dur * FPS)} />
        </Sequence>
      );
    case 'lowerThird':
      return (
        <Sequence from={Math.round(o.at * FPS)} durationInFrames={Math.round(o.dur * FPS)}>
          <LowerThird name={o.name} role={o.role} bottom={300} />
        </Sequence>
      );
    case 'outro':
      return <Sequence><Outro logo={LOGO} /></Sequence>;
  }
};

const ShotView: React.FC<{shot: Shot; frames: number}> = ({shot, frames}) => {
  const frame = useCurrentFrame();
  // زوم بطيء مستمر على كل لقطة عشان الصورة ما تكون جامدة
  const push = interpolate(frame, [0, frames], [1.02, shot.grade ? 1.12 : 1.07]);
  return (
    <AbsoluteFill style={{background: 'black'}}>
      <OffthreadVideo
        src={staticFile(shot.src)}
        trimBefore={Math.round(shot.from * FPS)}
        playbackRate={shot.rate ?? 1}
        volume={shot.volume ?? 0}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${push})`,
          // تدرج لوني رسمي دافي وموحد لكل اللقطات (لقطات جوال بإضاءات مختلفة)
          filter: shot.grade ? 'contrast(1.1) saturate(1.12) brightness(0.97) sepia(0.1)' : 'contrast(1.06) saturate(1.08)',
        }}
      />
      {/* تعتيم أطراف خفيف — طابع سينمائي */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)'}} />
      {shot.overlays?.map((o, i) => <OverlayView key={i} o={o} />)}
    </AbsoluteFill>
  );
};

const presentation = (enter: Shot['enter']) => (enter === 'whip' ? whip() : enter === 'flash' ? flash() : zoomBlur());

// مستوى الموسيقى: واطي تحت كلام المذيعة، عالي في المقتطفات والأوترو، أوطى شوي في التكريم
const musicVolume = (f: number) => {
  const drop = beatStart();
  const honor = honorStart();
  const total = totalFrames();
  const speech = 0.1;
  const v =
    f < drop - 12
      ? speech
      : f < honor
        ? interpolate(f, [drop - 12, drop], [speech, 0.9], clamp)
        : interpolate(f, [honor, honor + 20], [0.9, 0.7], clamp);
  const fadeIn = interpolate(f, [0, 8], [0, 1], clamp);
  const fadeOut = interpolate(f, [total - 1.5 * FPS, total], [1, 0], clamp);
  return v * fadeIn * fadeOut;
};

const sfx = (name: string, volume: number) => <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />;

export const Montage: React.FC = () => {
  const tl = timeline();
  const frame = useCurrentFrame();
  const outro = outroStart();
  const drop = beatStart();
  return (
    <AbsoluteFill style={{background: brand.navyDark}}>
      <TransitionSeries>
        {tl.map(({shot, frames}, i) => (
          <Fragment key={i}>
            {i > 0 && shot.enter && shot.enter !== 'cut' ? (
              <TransitionSeries.Transition presentation={presentation(shot.enter)} timing={linearTiming({durationInFrames: TRANSITION[shot.enter]})} />
            ) : null}
            <TransitionSeries.Sequence durationInFrames={frames}>
              <ShotView shot={shot} frames={frames} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>

      <Audio src={staticFile('music/committee.wav')} volume={(f) => musicVolume(f)} />

      {/* مؤثرات رسمية مع الانتقالات: whoosh للزوم والسحب، فلاش كاميرا + ضربة للفلاش */}
      {tl.map(({shot, start, enter}, i) => {
        if (!shot.enter || shot.enter === 'cut' || i === 0) return null;
        const mid = start + Math.round(enter / 2);
        if (shot.enter === 'flash') {
          return (
            <Fragment key={i}>
              <Sequence from={mid - 2} durationInFrames={20}>{sfx('shutter', 0.7)}</Sequence>
              <Sequence from={mid} durationInFrames={40}>{sfx('impact', 0.4)}</Sequence>
            </Fragment>
          );
        }
        return (
          <Sequence key={i} from={Math.max(0, mid - 12)} durationInFrames={30}>
            {sfx(shot.enter === 'whip' ? 'swoosh-up' : 'whoosh', shot.enter === 'whip' ? 0.5 : 0.55)}
          </Sequence>
        );
      })}
      {/* ضربة سينمائية مع دخول العنوان (بداية الإيقاع) */}
      <Sequence from={drop - 2}>{sfx('cinematic-boom', 0.75)}</Sequence>
      <Sequence from={drop + 8} durationInFrames={70}>{sfx('shimmer', 0.3)}</Sequence>

      {/* الشعار فوق يمين طول الفيديو، ويختفي قبل الأوترو (الشعار الكبير) */}
      <Img
        src={staticFile(LOGO)}
        style={{
          position: 'absolute',
          top: 100,
          right: 44,
          width: 150,
          opacity:
            interpolate(frame, [4, 16], [0, 1], clamp) * interpolate(frame, [outro + 40, outro + 60], [1, 0], clamp),
          transform: `translateX(${interpolate(frame, [4, 18], [60, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
