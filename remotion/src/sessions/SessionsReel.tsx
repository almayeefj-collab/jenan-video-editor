import {fade} from '@remotion/transitions/fade';
import {linearTiming, type TransitionPresentation, type TransitionPresentationComponentProps, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {brand} from '../reel/config';
import {LowerThird, Outro} from '../reel/Overlays';
import {days, FPS, INTRO_LOCKUP_FRAMES, LOGO, MUSIC, type Overlay, type Shot, shotFrames, timeline, totalFrames, TRANSITION} from './config';
import {Caption, DayCard, Intro, PanelCard, SessionTag} from './Overlays';

export const sessionsReelSchema = z.object({title: z.string()});

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// انتقال هادي: المشهد الأول يكبر شوي ويضبب، والثاني يدخل بتلاشي من zoom خفيف
const Soft: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({children, presentationDirection, presentationProgress}) => {
  const p = Easing.bezier(0.45, 0, 0.55, 1)(presentationProgress);
  const exiting = presentationDirection === 'exiting';
  const scale = exiting ? 1 + 0.08 * p : 1.06 - 0.06 * p;
  const blur = exiting ? 10 * p : 10 * (1 - p);
  return (
    <AbsoluteFill style={{opacity: exiting ? 1 : p, transform: `scale(${scale})`, filter: `blur(${blur}px)`}}>{children}</AbsoluteFill>
  );
};
const soft = (): TransitionPresentation<Record<string, never>> => ({component: Soft, props: {}});

const OverlayView: React.FC<{o: Overlay; frames: number; title: string}> = ({o, frames, title}) => {
  const from = Math.round((('at' in o && o.at) || 0) * FPS);
  switch (o.kind) {
    case 'day':
      return (
        <Sequence from={from} durationInFrames={o.dur ? Math.round(o.dur * FPS) : frames - from}>
          <DayCard index={o.index} label={o.label} weekday={o.weekday} date={o.date} month={o.month} total={days.length} />
        </Sequence>
      );
    case 'session':
      return (
        <Sequence from={from} durationInFrames={o.dur ? Math.round(o.dur * FPS) : frames - from + 4}>
          <SessionTag label={o.label} title={o.title} sub={o.sub} />
        </Sequence>
      );
    case 'caption':
      return <Sequence from={from} durationInFrames={frames - from}><Caption text={o.text} /></Sequence>;
    case 'presenter':
      return (
        <Sequence from={from} durationInFrames={o.dur ? Math.round(o.dur * FPS) : frames - from}>
          <LowerThird name={o.name} role={o.role} bottom={300} />
        </Sequence>
      );
    case 'panel':
      return (
        <Sequence from={from} durationInFrames={o.dur ? Math.round(o.dur * FPS) : frames - from}>
          <PanelCard heading={o.heading} members={o.members} />
        </Sequence>
      );
    case 'outro':
      return <Sequence durationInFrames={frames}><Outro logo={LOGO} /></Sequence>;
  }
};

// صوت المحاضر يدخل ويطلع بتلاشي قصير عشان ما يطلع قطع حاد
const speechVolume = (f: number, frames: number) =>
  interpolate(f, [0, 5, frames - 8, frames], [0, 1, 1, 0], clamp);

const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const frames = shotFrames(shot);
  const frame = useCurrentFrame();
  const [z0, z1] = shot.zoom ?? [1, 1];
  const scale = interpolate(frame, [0, frames], [z0, z1], {easing: Easing.inOut(Easing.sin)});
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${scale})`,
    transformOrigin: shot.origin ?? '50% 50%',
    filter: 'contrast(1.06) saturate(1.08)',
  };
  return (
    <AbsoluteFill style={{background: 'black', overflow: 'hidden'}}>
      {shot.photo ? (
        <Img src={staticFile(shot.src)} style={style} />
      ) : (
        <OffthreadVideo
          src={staticFile(shot.src)}
          trimBefore={Math.round((shot.from ?? 0) * FPS)}
          playbackRate={shot.rate ?? 1}
          volume={(f) => ((shot.volume ?? 0) > 0 ? speechVolume(f, frames) : 0)}
          style={style}
        />
      )}
      {/* تعتيم أطراف خفيف سينمائي */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};

// الموسيقى: أعلى في الانترو والأوترو، متوسطة على اللقطات، وتنزل كثير تحت كلام المحاضرين
const LOUD = 0.75;
const BROLL = 0.65;
const UNDER_SPEECH = 0.07;
const RAMP = 14;

const musicLevels = () =>
  timeline().map((t, i, tl) => {
    const speech = (t.shot.volume ?? 0) > 0;
    const loud = t.start < INTRO_LOCKUP_FRAMES || i === tl.length - 1;
    // تبدأ تنزل قبل الكلام بشوي، وترجع بعده
    return {start: speech ? t.start - 6 : t.start + 4, level: speech ? UNDER_SPEECH : loud ? LOUD : BROLL};
  });

const musicVolume = (f: number, levels: {start: number; level: number}[], total: number) => {
  let idx = 0;
  for (let i = 0; i < levels.length; i++) if (levels[i].start <= f) idx = i;
  const cur = levels[idx];
  const prev = idx > 0 ? levels[idx - 1].level : cur.level;
  const v = interpolate(f, [cur.start, cur.start + RAMP], [prev, cur.level], clamp);
  const fadeIn = interpolate(f, [0, 10], [0, 1], clamp);
  const fadeOut = interpolate(f, [total - 2 * FPS, total], [1, 0], clamp);
  return v * fadeIn * fadeOut;
};

export const SessionsReel: React.FC<z.infer<typeof sessionsReelSchema>> = ({title}) => {
  const tl = timeline();
  const total = totalFrames();
  const levels = musicLevels();
  const outroStart = tl[tl.length - 1].start;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: brand.navyDark}}>
      <TransitionSeries>
        {tl.map(({shot, frames}, i) => (
          <Fragment key={i}>
            {i > 0 && shot.enter === 'fade' ? (
              <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION.fade})} />
            ) : null}
            {i > 0 && shot.enter === 'soft' ? (
              <TransitionSeries.Transition presentation={soft()} timing={linearTiming({durationInFrames: TRANSITION.soft})} />
            ) : null}
            <TransitionSeries.Sequence durationInFrames={frames}>
              <ShotView shot={shot} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>

      {/* النصوص فوق الخط الزمني كله (عشان كبسولة الجلسة تقدر تمتد على أكثر من لقطة) */}
      {tl.map(({shot, start, frames}, i) =>
        shot.overlays?.map((o, j) => (
          <Sequence key={`${i}-${j}`} from={start}>
            <OverlayView o={o} frames={frames} title={title} />
          </Sequence>
        )),
      )}

      {/* الانترو: تعتيم + العنوان يُكتب ثم عداد لين 46 */}
      <Sequence durationInFrames={INTRO_LOCKUP_FRAMES}>
        <AbsoluteFill
          style={{
            background: 'rgba(5,12,25,0.45)',
            opacity: interpolate(frame, [0, 8, INTRO_LOCKUP_FRAMES - 16, INTRO_LOCKUP_FRAMES], [0, 1, 1, 0], clamp),
          }}
        />
        <Intro title={title} to={46} />
      </Sequence>

      <Audio src={staticFile(MUSIC)} volume={(f) => musicVolume(f, levels, total)} />

      {/* الشعار فوق يمين طول الفيديو */}
      <Img
        src={staticFile(LOGO)}
        style={{
          position: 'absolute',
          top: 100,
          right: 44,
          width: 150,
          opacity:
            interpolate(frame, [4, 16], [0, 1], clamp) * interpolate(frame, [outroStart - 10, outroStart], [1, 0], clamp),
          transform: `translateX(${interpolate(frame, [4, 18], [60, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px)`,
        }}
      />

      {/* whoosh ناعم مع الانتقالات الهادية، وتك خفيف مع القطعات */}
      {tl.map(({shot, start}, i) =>
        i === 0 ? null : (
          <Sequence key={i} from={Math.max(0, start - (shot.enter === 'cut' ? 1 : 6))} durationInFrames={fps}>
            <Audio
              src={staticFile(`sfx/${shot.enter === 'cut' ? 'swoosh-up' : 'whoosh'}.wav`)}
              volume={shot.enter === 'cut' ? 0.18 : shot.enter === 'soft' ? 0.32 : 0.22}
            />
          </Sequence>
        ),
      )}
    </AbsoluteFill>
  );
};
