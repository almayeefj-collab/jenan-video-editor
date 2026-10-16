import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {Backdrop, BeatView, Kinetic, Spark} from './Beats';
import {C, type Episode2, episodeLayout, FPS, INSTAGRAM} from './types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// الختام: «علّق بكلمة ...» + خانة كومنت + تابعوني على الانستغرام
const Outro: React.FC<{word?: string}> = ({word}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const q = (d: number) => spring({frame: f - d, fps, config: {damping: 12, stiffness: 130}});
  const typed = word ? word.slice(0, Math.max(0, Math.floor((f - 30) / 3))) : '';
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', color: C.ink}}>
      <Backdrop look="light" />
      {word ? (
        <>
          <div style={{position: 'absolute', top: 230, left: 40, right: 40}}><Kinetic text="علّق بكلمة" look="light" size={96} /></div>
          <div style={{position: 'absolute', top: 360, width: '100%', textAlign: 'center', fontSize: Math.min(230, Math.round(1500 / Math.max(1, word.length))), fontWeight: 1000, color: C.coral,
            transform: `scale(${q(10)})`}}>{word}</div>
          <div style={{position: 'absolute', top: 700, left: 90, right: 90, height: 120, borderRadius: 60, background: C.paper, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '0 26px', boxShadow: '0 20px 50px rgba(40,25,20,0.18)', opacity: q(20)}}>
            <Spark size={70} />
            <span style={{flex: 1, fontSize: 50, fontWeight: 800, padding: '0 24px'}}>{typed}<span style={{opacity: f % 20 < 10 ? 1 : 0}}>|</span></span>
            <div style={{width: 80, height: 80, borderRadius: 40, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width="38" height="38" viewBox="0 0 24 24"><path d="M5 12h12M12 6l6 6-6 6" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
            </div>
          </div>
        </>
      ) : null}
      <div style={{position: 'absolute', top: word ? 860 : 500, width: '100%', textAlign: 'center', fontSize: 64, fontWeight: 900, opacity: q(24)}}>
        تابعوني على الانستغرام
      </div>
      {/* صورة جنان: دائرة مرجانية وراها، وتطلع من تحت */}
      <div style={{position: 'absolute', top: word ? 1000 : 640, left: 0, right: 0, height: 760, display: 'flex', justifyContent: 'center'}}>
        <div style={{position: 'absolute', top: 30, width: 560, height: 560, borderRadius: '50%', background: C.coral, transform: `scale(${q(26)})`,
          boxShadow: '0 30px 70px rgba(232,115,90,0.4)'}} />
        <Img src={staticFile('ainews/brand/jenan.png')} style={{position: 'absolute', top: 0, height: 760,
          transform: `translateY(${(1 - q(30)) * 300}px)`, opacity: Math.min(1, q(30) * 1.5),
          WebkitMaskImage: 'linear-gradient(180deg, black 82%, transparent 100%)'}} />
        <div style={{position: 'absolute', bottom: 40, background: C.ink, color: 'white', fontSize: 56, fontWeight: 900, padding: '16px 50px', borderRadius: 999,
          direction: 'ltr', transform: `scale(${q(40)})`, boxShadow: '0 16px 40px rgba(0,0,0,0.35)'}}>{INSTAGRAM}</div>
      </div>
    </AbsoluteFill>
  );
};

export const AiNews2: React.FC<{ep: Episode2; voice: boolean}> = ({ep, voice}) => {
  const {stories, outroStart, total} = episodeLayout(ep, voice);
  const bed = voice ? 0.2 : 0.7;
  return (
    <AbsoluteFill style={{background: C.cream}}>
      {stories.map(({story, start, beats}, si) => {
        let t = start;
        return (
          <Sequence key={si} from={start} durationInFrames={beats.reduce((a, b) => a + b, 0)} layout="none">
            {story.beats.map((b, bi) => {
              const from = t - start;
              t += beats[bi];
              return (
                <Sequence key={bi} from={from} durationInFrames={beats[bi]}>
                  <BeatView b={b} frames={beats[bi]} />
                  <Audio src={staticFile(bi === 0 && si === 0 ? 'sfx/impact.wav' : 'sfx/whoosh.wav')} volume={bi === 0 ? 0.55 : 0.3} />
                </Sequence>
              );
            })}
            {voice && story.voice ? (
              <Sequence from={4}><Audio src={staticFile(story.voice)} /></Sequence>
            ) : null}
          </Sequence>
        );
      })}
      <Sequence from={outroStart} durationInFrames={total - outroStart}>
        <Outro word={ep.outro.word} />
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.5} />
        <Sequence from={24}><Audio src={staticFile('sfx/pop.wav')} volume={0.7} /></Sequence>
        {voice && ep.outro.voice ? <Sequence from={4}><Audio src={staticFile(ep.outro.voice)} /></Sequence> : null}
      </Sequence>
      <Audio src={staticFile(ep.music)} volume={(f) => bed * interpolate(f, [total - 30, total], [1, 0], clamp)} />
      {/* حساب جنان صغير تحت طول الفيديو */}
      <Sequence durationInFrames={outroStart} layout="none">
        <div style={{position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', fontFamily, fontSize: 30, fontWeight: 800, color: 'rgba(120,110,105,0.55)',
          direction: 'ltr'}}>{INSTAGRAM}</div>
      </Sequence>
    </AbsoluteFill>
  );
};

export const episode2Frames = (ep: Episode2, voice: boolean) => episodeLayout(ep, voice).total;
export {FPS};
