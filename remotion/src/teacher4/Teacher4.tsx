import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';
import {zoomBlur} from '../reel/zoomBlur';
import {CYAN, type Era, FPS, GOLD, INK, type Scene, timeline, totalFrames, TRANSITION} from './config';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const textShadow = '0 6px 30px rgba(0,0,0,0.65)';

// دخول عنصر: يطلع من تحت مع blur
const useReveal = (delay: number, dur = 16) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 14}px)`, transform: `translateY(${(1 - p) * 40}px)`};
};

// خروج ناعم لكل النصوص قبل الانتقال
const useExit = (frames: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [frames - TRANSITION - 10, frames - TRANSITION + 4], [1, 0], clamp);
};

// صورة بحركة Ken Burns بطيئة
const KenBurns: React.FC<{src: string; frames: number; pan?: 'left' | 'right'; grade?: string}> = ({src, frames, pan = 'left', grade}) => {
  const frame = useCurrentFrame();
  const p = frame / frames;
  const scale = interpolate(p, [0, 1], [1.06, 1.2]);
  const x = interpolate(p, [0, 1], [0, pan === 'left' ? -2.2 : 2.2]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: INK}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translateX(${x}%)`,
          filter: grade,
        }}
      />
    </AbsoluteFill>
  );
};

const Vignette: React.FC<{side?: boolean}> = ({side}) => (
  <>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)'}} />
    {side ? (
      <AbsoluteFill
        style={{background: 'linear-gradient(to left, rgba(4,8,18,0.92) 0%, rgba(4,8,18,0.7) 30%, rgba(4,8,18,0.15) 58%, transparent 70%)'}}
      />
    ) : null}
    <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(4,8,18,0.85) 0%, transparent 22%)'}} />
  </>
);

// شريط المراحل الأربع أسفل الشاشة
const Progress: React.FC<{step: number; accent: string; track: Era['track']}> = ({step, accent, track}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [8, 40], [step - 1, step], {...clamp, easing: ease});
  const W = 820;
  return (
    <div style={{position: 'absolute', bottom: 70, right: 120, width: W, height: 60, direction: 'ltr', ...useReveal(4)}}>
      <div style={{position: 'absolute', top: 14, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.18)', borderRadius: 4}} />
      <div
        style={{
          position: 'absolute', top: 14, right: 0, height: 4, borderRadius: 4,
          width: `${((fill - 1) / 3) * 100}%`,
          background: accent, boxShadow: `0 0 18px ${accent}`,
        }}
      />
      {[4, 3, 2, 1].map((n, i) => {
        const on = n <= step;
        const cur = n === step;
        return (
          <div key={n} style={{position: 'absolute', left: `${(i / 3) * 100}%`, top: 0, transform: 'translateX(-50%)', textAlign: 'center'}}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 32, margin: '0 auto',
                background: on ? accent : 'rgba(20,28,44,0.9)',
                border: `3px solid ${on ? accent : 'rgba(255,255,255,0.35)'}`,
                boxShadow: cur ? `0 0 0 ${8 + Math.sin(frame / 6) * 3}px ${accent}33, 0 0 24px ${accent}` : undefined,
              }}
            />
            <div style={{fontFamily: numberFamily, fontSize: 26, fontWeight: 700, marginTop: 6, color: on ? '#fff' : 'rgba(255,255,255,0.45)'}}>
              {n}.0
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', right: W + 60, top: 0, fontFamily, fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', direction: 'rtl'}}>
        {track === 'industry' ? 'الصناعة' : 'المعلم'}
      </div>
    </div>
  );
};

const EraScene: React.FC<{e: Era; frames: number}> = ({e, frames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = useExit(frames);
  const num = spring({frame: frame - 6, fps, config: {damping: 14, mass: 0.9}});
  const glow = 0.55 + Math.sin(frame / 10) * 0.15;
  const line = interpolate(frame, [18, 42], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <KenBurns src={e.img} frames={frames} pan={e.pan} grade={e.grade} />
      <Vignette side />
      <AbsoluteFill style={{direction: 'rtl', opacity: exit}}>
        <div style={{position: 'absolute', top: 120, right: 120, width: 860}}>
          {/* الرقم الكبير */}
          <div
            style={{
              fontFamily: numberFamily, fontVariantNumeric: 'lining-nums', fontWeight: 900, fontSize: 250, lineHeight: 0.9, direction: 'ltr', textAlign: 'right',
              color: 'transparent', WebkitTextStroke: `3px ${e.accent}`,
              textShadow: `0 0 ${40 * glow}px ${e.accent}88`,
              opacity: num, transform: `scale(${interpolate(num, [0, 1], [1.4, 1])})`, transformOrigin: 'right center',
            }}
          >
            {e.step}.0
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 26, ...useReveal(14)}}>
            <span style={{fontFamily, fontSize: 40, fontWeight: 700, color: e.accent, textShadow}}>{e.label}</span>
            <span
              style={{
                fontFamily: /\d/.test(e.tag) ? numberFamily : fontFamily, fontVariantNumeric: 'lining-nums', fontSize: 28, fontWeight: 700, color: INK,
                background: e.accent, borderRadius: 999, padding: '4px 22px',
              }}
            >
              {e.tag}
            </span>
          </div>
          <div style={{height: 4, width: 240 * line, background: e.accent, borderRadius: 4, margin: '22px 0 18px', boxShadow: `0 0 16px ${e.accent}`}} />
          <div style={{fontFamily, fontSize: 76, fontWeight: 900, color: '#fff', lineHeight: 1.2, textShadow, ...useReveal(24)}}>{e.title}</div>
          <div style={{marginTop: 30}}>
            {e.points.map((p, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16, ...useReveal(46 + i * 14)}}>
                <div style={{width: 14, height: 14, borderRadius: 4, transform: 'rotate(45deg)', background: e.accent, boxShadow: `0 0 12px ${e.accent}`, flexShrink: 0}} />
                <span style={{fontFamily, fontSize: 38, fontWeight: 600, color: 'rgba(255,255,255,0.94)', textShadow}}>{p}</span>
              </div>
            ))}
          </div>
        </div>
        <Progress step={e.step} accent={e.accent} track={e.track} />
      </AbsoluteFill>
      <Sequence from={4} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/cinematic-boom.wav')} volume={0.32} />
      </Sequence>
      {e.points.map((_, i) => (
        <Sequence key={i} from={46 + i * 14} durationInFrames={20}>
          <Audio src={staticFile('sfx/pop.wav')} volume={0.18} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// شاشة فصل: نص في النص على خلفية داكنة متحركة
const Chapter: React.FC<{kicker: string; title: string; sub?: string; accent: string; frames: number}> = ({kicker, title, sub, accent, frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const ring = interpolate(frame, [0, frames], [0.6, 1.4]);
  const line = interpolate(frame, [20, 45], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at center, #13213d 0%, ${INK} 70%)`, justifyContent: 'center', alignItems: 'center', direction: 'rtl'}}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute', width: 700 + i * 260, height: 700 + i * 260, borderRadius: '50%',
            border: `2px solid ${accent}`, opacity: 0.12 - i * 0.03, transform: `scale(${ring}) rotate(${frame * (i % 2 ? -0.2 : 0.2)}deg)`,
            borderStyle: i === 1 ? 'dashed' : 'solid',
          }}
        />
      ))}
      <div style={{textAlign: 'center', opacity: exit}}>
        <div style={{fontFamily, fontSize: 44, fontWeight: 600, color: accent, ...useReveal(4)}}>{kicker}</div>
        <div style={{fontFamily, fontSize: 140, fontWeight: 900, color: '#fff', lineHeight: 1.25, textShadow: `0 0 50px ${accent}55`, ...useReveal(14, 20)}}>{title}</div>
        <div style={{height: 4, width: 420 * line, background: accent, margin: '10px auto 26px', borderRadius: 4, boxShadow: `0 0 18px ${accent}`}} />
        {sub ? <div style={{fontFamily, fontSize: 44, fontWeight: 500, color: 'rgba(255,255,255,0.85)', ...useReveal(30)}}>{sub}</div> : null}
      </div>
      <Sequence from={0} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/cinematic-riser.wav')} volume={0.35} />
      </Sequence>
      <Sequence from={14} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Intro: React.FC<{img: string; frames: number}> = ({img, frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const fadeIn = interpolate(frame, [0, 24], [1, 0], clamp);
  return (
    <AbsoluteFill>
      <KenBurns src={img} frames={frames} pan="right" grade="contrast(1.08) saturate(1.1)" />
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(4,8,18,0.92) 0%, rgba(4,8,18,0.35) 45%, rgba(4,8,18,0.25) 100%)'}} />
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120, direction: 'rtl', opacity: exit}}>
        <div style={{fontFamily, fontSize: 40, fontWeight: 600, color: GOLD, letterSpacing: 1, ...useReveal(20)}}>رحلة التطوّر</div>
        <div style={{fontFamily, fontSize: 124, fontWeight: 900, color: '#fff', textShadow, lineHeight: 1.25, ...useReveal(32, 22)}}>
          من الآلة… إلى الذكاء
        </div>
        <div style={{display: 'flex', gap: 28, alignItems: 'center', marginTop: 14, direction: 'ltr', ...useReveal(56)}}>
          {['1.0', '2.0', '3.0', '4.0'].map((n, i) => (
            <Fragment key={n}>
              {i > 0 ? <div style={{width: 60, height: 2, background: `linear-gradient(90deg, ${GOLD}, ${CYAN})`}} /> : null}
              <span style={{fontFamily: numberFamily, fontSize: 44, fontWeight: 700, color: i < 2 ? GOLD : CYAN}}>{n}</span>
            </Fragment>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: fadeIn}} />
      <Sequence from={30} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{img: string; frames: number}> = ({img, frames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const num = spring({frame: frame - 10, fps, config: {damping: 16}});
  const fadeOut = interpolate(frame, [frames - 30, frames], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <KenBurns src={img} frames={frames} pan="left" grade="contrast(1.06) saturate(1.12)" />
      <Vignette side />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', paddingRight: 130}}>
        <div style={{fontFamily, fontSize: 46, fontWeight: 600, color: GOLD, textShadow, ...useReveal(4)}}>ورشة</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 30, opacity: num, transform: `scale(${interpolate(num, [0, 1], [1.25, 1])})`, transformOrigin: 'right center'}}>
          <span style={{fontFamily, fontSize: 150, fontWeight: 900, color: '#fff', textShadow}}>المعلم</span>
          <span style={{fontFamily: numberFamily, fontSize: 170, fontWeight: 900, color: CYAN, textShadow: `0 0 40px ${CYAN}99`}}>4.0</span>
        </div>
        <div style={{fontFamily, fontSize: 52, fontWeight: 700, color: '#fff', textShadow, maxWidth: 1100, lineHeight: 1.5, marginTop: 10, ...useReveal(40, 20)}}>
          التقنية لا تستبدل المعلم…
        </div>
        <div style={{fontFamily, fontSize: 52, fontWeight: 700, color: GOLD, textShadow, maxWidth: 1100, lineHeight: 1.5, ...useReveal(66, 20)}}>
          بل المعلم هو من يقودها نحو المستقبل
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: fadeOut}} />
      <Sequence from={8} durationInFrames={FPS * 4}>
        <Audio src={staticFile('sfx/cinematic-boom.wav')} volume={0.45} />
      </Sequence>
      <Sequence from={40} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{s: Scene; frames: number}> = ({s, frames}) => {
  switch (s.kind) {
    case 'intro':
      return <Intro img={s.img} frames={frames} />;
    case 'chapter':
      return <Chapter kicker={s.kicker} title={s.title} sub={s.sub} accent={s.accent} frames={frames} />;
    case 'era':
      return <EraScene e={s} frames={frames} />;
    case 'outro':
      return <Outro img={s.img} frames={frames} />;
  }
};

export const Teacher4: React.FC = () => {
  const tl = timeline();
  const total = totalFrames();
  return (
    <AbsoluteFill style={{background: INK}}>
      <TransitionSeries>
        {tl.map(({scene, frames}, i) => (
          <Fragment key={i}>
            {i > 0 ? <TransitionSeries.Transition presentation={zoomBlur()} timing={linearTiming({durationInFrames: TRANSITION})} /> : null}
            <TransitionSeries.Sequence durationInFrames={frames}>
              <SceneView s={scene} frames={frames} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      {tl.slice(1).map(({start}, i) => (
        <Sequence key={i} from={Math.max(0, start - 4)} durationInFrames={30}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.5} />
        </Sequence>
      ))}
      <Audio
        src={staticFile('music/background.wav')}
        volume={(f) =>
          0.55 *
          interpolate(f, [0, 20], [0, 1], clamp) *
          interpolate(f, [total - 2 * FPS, total], [1, 0], clamp)
        }
      />
    </AbsoluteFill>
  );
};
