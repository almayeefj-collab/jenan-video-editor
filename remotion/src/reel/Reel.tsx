import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment, useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {zoomBlur} from './zoomBlur';
import {brand, FPS, LOGO, type Overlay, type ReelSpec, type Shot, shotFrames, timeline, TRANSITION} from './config';
import {musicVolume} from './music';
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
      return <Sequence><Outro logo={o.logo} /></Sequence>;
  }
};

const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const frames = shotFrames(shot);
  const frame = useCurrentFrame();
  // التضبيب يكبّر اللقطة شوي عشان ما تطلع أطراف سودا
  const push = (shot.grade ? interpolate(frame, [0, frames], [1, 1.12]) : 1) * (shot.blur ? 1.1 : 1);
  return (
    <AbsoluteFill style={{background: 'black'}}>
      <OffthreadVideo
        src={staticFile(shot.src)}
        trimBefore={Math.round(shot.from * FPS)}
        volume={shot.volume}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${push})`,
          filter:
            [shot.grade ? 'contrast(1.12) saturate(1.15) brightness(0.95) sepia(0.12)' : '', shot.blur ? `blur(${shot.blur}px) brightness(0.7)` : '']
              .join(' ')
              .trim() || undefined,
        }}
      />
      {shot.overlays?.map((o, i) => <OverlayView key={i} o={o} frames={frames} />)}
    </AbsoluteFill>
  );
};

export const Reel: React.FC<{spec: ReelSpec}> = ({spec}) => {
  const tl = timeline(spec.shots);
  const music = useMemo(() => musicVolume(spec.shots), [spec.shots]);
  const outroStart = tl[tl.length - 1].start;
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
      <Sequence durationInFrames={Math.round(spec.introSeconds * FPS)}>
        <IntroLockup title={spec.introTitle} to={spec.introTo} />
      </Sequence>
      {/* موسيقى خلفية: عالية في الانترو والأوترو، وتنخفض تحت كلام المقابلات */}
      <Audio src={staticFile('music/background.wav')} volume={music} />
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
