import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment, useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {zoomBlur} from './zoomBlur';
import {brand, FPS, INTRO_LOCKUP_FRAMES, LOGO, type Overlay, type Shot, shotFrames, shots as teachersShots, timeline, TRANSITION} from './config';
import {makeMusicVolume} from './music';
import {IntroLockup, LowerThird, Outro, Question, Title} from './Overlays';

const OverlayView: React.FC<{o: Overlay; frames: number}> = ({o, frames}) => {
  switch (o.kind) {
    case 'title':
      return <Sequence from={6}><Title text={o.text} sub={o.sub} /></Sequence>;
    case 'question':
      return (
        <Sequence from={Math.round((o.at ?? 0) * FPS)}>
          <Question text={o.text} label={o.label} mode={o.mode} y={o.y} hide={o.hide} exitAt={o.exitAt} />
        </Sequence>
      );
    case 'lowerThird':
      return (
        <Sequence from={Math.round(o.at * FPS)} durationInFrames={Math.round(o.dur * FPS)}>
          <LowerThird name={o.name} role={o.role} bottom={o.bottom} />
        </Sequence>
      );
    case 'outro':
      return <Sequence><Outro logo={o.logo} at={o.at} /></Sequence>;
  }
};

// خلفية بألوان الهوية: تدرج كحلي مع إضاءات ذهبية وزرقاء تتحرك ببطء
const BrandBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const a = frame / 90;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${brand.navy} 0%, ${brand.navyDark} 100%)`}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + 22 * Math.sin(a)}% ${38 + 10 * Math.cos(a * 0.8)}%, ${brand.goldDeep}40 0%, transparent 45%),
            radial-gradient(circle at ${40 - 25 * Math.cos(a * 0.7)}% ${70 + 8 * Math.sin(a)}%, #2C8AD055 0%, transparent 50%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const LOOK: Record<NonNullable<Shot['fx']>, string> = {
  slate: 'blur(22px) brightness(0.45) saturate(0.8)',
  dim: 'blur(2px) brightness(0.5) saturate(0.9)',
  shade: 'brightness(0.72) contrast(1.05)',
};

// تلاشي قصير للصوت في بداية ونهاية كل لقطة عشان القص ما يطلع فيه طقة
const AUDIO_FADE = 4;

const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const frames = shotFrames(shot);
  const frame = useCurrentFrame();
  const push = shot.grade || shot.fx ? interpolate(frame, [0, frames], [1, shot.fx === 'slate' ? 1.06 : 1.12]) : 1;
  const filters = [shot.grade ? 'contrast(1.12) saturate(1.15) brightness(0.95) sepia(0.12)' : '', shot.fx ? LOOK[shot.fx] : ''].join(' ').trim();
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {shot.src ? (
        <OffthreadVideo
          src={staticFile(shot.src)}
          trimBefore={Math.round(shot.from * FPS)}
          volume={(f) =>
            shot.volume *
            interpolate(f, [0, AUDIO_FADE, frames - AUDIO_FADE, frames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
          }
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: shot.focusX !== undefined ? `${shot.focusX}% 50%` : undefined,
            transform: `scale(${push * (shot.zoom ?? 1)})`,
            filter: filters || undefined,
          }}
        />
      ) : (
        <BrandBackground />
      )}
      {/* طبقة كحلية فوق اللقطات الفاتحة (رخام أبيض) عشان النص الأبيض يبين */}
      {shot.fx ? <AbsoluteFill style={{background: `linear-gradient(180deg, ${brand.navy}, ${brand.navyDark})`, opacity: shot.fx === 'slate' ? 0.4 : 0.5}} /> : null}
      {shot.overlays?.map((o, i) => <OverlayView key={i} o={o} frames={frames} />)}
    </AbsoluteFill>
  );
};

export type ReelProps = {
  shots: Shot[];
  lockup: {title: string; to: number; sub?: string; frames: number};
  music: string;
};

export const Reel: React.FC<Partial<ReelProps>> = ({
  shots = teachersShots,
  lockup = {title: 'المؤتمر التربوي', to: 46, frames: INTRO_LOCKUP_FRAMES},
  music = 'music/background.wav',
}) => {
  const tl = timeline(shots);
  const outroStart = tl[tl.length - 1].start;
  const musicVolume = useMemo(() => makeMusicVolume(shots), [shots]);
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: brand.navyDark}}>
      <TransitionSeries>
        {tl.map(({shot, frames}, i) => (
          <Fragment key={i}>
            {i > 0 && shot.enter === 'fade' ? (
              <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION.fade})} />
            ) : null}
            {i > 0 && shot.enter === 'wipe' ? (
              <TransitionSeries.Transition presentation={zoomBlur()} timing={linearTiming({durationInFrames: TRANSITION.wipe})} />
            ) : null}
            <TransitionSeries.Sequence durationInFrames={frames}>
              <ShotView shot={shot} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <Sequence durationInFrames={lockup.frames}>
        <IntroLockup title={lockup.title} to={lockup.to} sub={lockup.sub} />
      </Sequence>
      {/* موسيقى خلفية: عالية في الانترو والأوترو، وتنخفض تحت كلام المقابلات */}
      <Audio src={staticFile(music)} volume={(f) => musicVolume(f)} />
      {/* الشعار فوق يمين طول الفيديو، بدون كتابة */}
      <Img
        src={staticFile(LOGO)}
        style={{
          position: 'absolute',
          top: 100,
          right: 44,
          width: 150,
          opacity:
            interpolate(frame, [4, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
            interpolate(frame, [outroStart - 10, outroStart], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          transform: `translateX(${interpolate(frame, [4, 18], [60, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)})}px)`,
        }}
      />
      <Sequence from={2} durationInFrames={30}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} />
      </Sequence>
      {/* مؤثر whoosh مع كل انتقال رسمي */}
      {tl.map(({shot, start}, i) =>
        shot.enter === 'wipe' ? (
          <Sequence key={i} from={Math.max(0, start - 4)} durationInFrames={30}>
            <Audio src={staticFile('sfx/whoosh.wav')} volume={0.55} />
          </Sequence>
        ) : null,
      )}
    </AbsoluteFill>
  );
};
