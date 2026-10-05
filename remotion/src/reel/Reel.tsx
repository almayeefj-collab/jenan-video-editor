import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {zoomBlur} from './zoomBlur';
import {brand, FPS, LOGO, type Overlay, type Shot, shotFrames, timeline, TRANSITION} from './config';
import {Counter, LowerThird, Outro, Question, Title} from './Overlays';

const OverlayView: React.FC<{o: Overlay; frames: number}> = ({o, frames}) => {
  switch (o.kind) {
    case 'counter':
      return <Sequence durationInFrames={Math.min(frames, Math.round(3.6 * FPS))}><Counter to={o.to} caption={o.caption} /></Sequence>;
    case 'title':
      return <Sequence from={6}><Title text={o.text} sub={o.sub} /></Sequence>;
    case 'question':
      return <Sequence><Question text={o.text} label={o.label} docked={o.docked} /></Sequence>;
    case 'lowerThird':
      return (
        <Sequence from={Math.round(o.at * FPS)} durationInFrames={Math.round(o.dur * FPS)}>
          <LowerThird name={o.name} role={o.role} />
        </Sequence>
      );
    case 'outro':
      return <Sequence><Outro /></Sequence>;
  }
};

const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const frames = shotFrames(shot);
  return (
    <AbsoluteFill style={{background: 'black'}}>
      <OffthreadVideo
        src={staticFile(shot.src)}
        trimBefore={Math.round(shot.from * FPS)}
        volume={shot.volume}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
      {shot.overlays?.map((o, i) => <OverlayView key={i} o={o} frames={frames} />)}
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const tl = timeline();
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
      {/* الشعار فوق يمين طول الفيديو، بدون كتابة */}
      <Img src={staticFile(LOGO)} style={{position: 'absolute', top: 110, right: 50, width: 96}} />
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
