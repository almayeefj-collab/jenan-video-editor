import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {zoomBlur} from '../reel/zoomBlur';
import {FPS, INK, type News, newsCount, type Scene, timeline, totalFrames, TRANSITION} from './config';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const latin = '"Helvetica Neue", Arial, sans-serif';

const useReveal = (delay: number, dur = 14) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 12}px)`, transform: `translateY(${(1 - p) * 36}px)`};
};

const useExit = (frames: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [frames - TRANSITION - 8, frames - TRANSITION + 4], [1, 0], clamp);
};

// خلفية تقنية: شبكة تتحرك + بقع ضوء ملونة + جزيئات
const TechBg: React.FC<{accent: string; glow: string}> = ({accent, glow}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute', width: 1300, height: 1300, borderRadius: '50%', filter: 'blur(140px)',
          background: glow, opacity: 0.85, left: -300 + Math.sin(t * 0.6) * 120, top: -250 + Math.cos(t * 0.5) * 100,
        }}
      />
      <div
        style={{
          position: 'absolute', width: 900, height: 900, borderRadius: '50%', filter: 'blur(160px)',
          background: accent, opacity: 0.22, right: -300 + Math.cos(t * 0.7) * 120, bottom: -200 + Math.sin(t * 0.4) * 140,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${accent}1c 2px, transparent 2px), linear-gradient(90deg, ${accent}1c 2px, transparent 2px)`,
          backgroundSize: '90px 90px',
          backgroundPosition: `0 ${(frame * 1.2) % 90}px`,
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />
      {Array.from({length: 22}).map((_, i) => {
        const x = (i * 97) % 1080;
        const speed = 0.8 + (i % 5) * 0.35;
        const y = 1920 - ((frame * speed * 3 + i * 211) % 2100);
        const size = 4 + (i % 4) * 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size,
              background: accent, opacity: 0.35 + (i % 3) * 0.15, boxShadow: `0 0 12px ${accent}`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)'}} />
    </AbsoluteFill>
  );
};

// شريط تقدّم الأخبار أعلى الشاشة
const Progress: React.FC<{idx: number; accent: string}> = ({idx, accent}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [4, 30], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', top: 110, left: 80, right: 80, display: 'flex', gap: 12, direction: 'rtl'}}>
      {Array.from({length: newsCount}).map((_, i) => (
        <div key={i} style={{flex: 1, height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.15)', overflow: 'hidden'}}>
          <div
            style={{
              height: '100%', borderRadius: 8, background: accent, boxShadow: `0 0 14px ${accent}`,
              width: i < idx ? '100%' : i === idx ? `${fill * 100}%` : '0%', marginRight: 0,
            }}
          />
        </div>
      ))}
    </div>
  );
};

// اسم البراند: حرف حرف مع spring
const BrandName: React.FC<{text: string; accent: string; delay: number}> = ({text, accent, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const size = text.length > 10 ? 118 : 150;
  return (
    <div style={{direction: 'ltr', display: 'flex', justifyContent: 'center', fontFamily: latin, fontWeight: 900, fontSize: size, letterSpacing: -3, lineHeight: 1}}>
      {text.split('').map((ch, i) => {
        const s = spring({frame: frame - delay - i * 2, fps, config: {damping: 13, mass: 0.7}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', whiteSpace: 'pre', color: '#fff', opacity: s,
              transform: `translateY(${(1 - s) * 80}px) scale(${interpolate(s, [0, 1], [0.6, 1])})`,
              textShadow: `0 0 40px ${accent}aa, 0 8px 30px rgba(0,0,0,0.5)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

const NewsScene: React.FC<{n: News; idx: number; frames: number}> = ({n, idx, frames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = useExit(frames);
  const ring = spring({frame: frame - 2, fps, config: {damping: 20}});
  const line = interpolate(frame, [22, 44], [0, 1], {...clamp, easing: ease});
  const pulse = 1 + Math.sin(frame / 8) * 0.03;
  return (
    <AbsoluteFill>
      <TechBg accent={n.accent} glow={n.glow} />
      <Progress idx={idx} accent={n.accent} />
      <AbsoluteFill style={{direction: 'rtl', opacity: exit, alignItems: 'center'}}>
        {/* رقم الخبر داخل حلقة */}
        <div style={{position: 'absolute', top: 230, width: 200, height: 200, transform: `scale(${ring * pulse})`}}>
          <svg width={200} height={200} style={{position: 'absolute', transform: `rotate(${frame * 1.5}deg)`}}>
            <circle cx={100} cy={100} r={90} fill="none" stroke={n.accent} strokeWidth={4} strokeDasharray="40 18" opacity={0.8} />
          </svg>
          <div
            style={{
              position: 'absolute', inset: 22, borderRadius: '50%', background: `${n.accent}22`, border: `2px solid ${n.accent}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: latin, fontWeight: 900, fontSize: 64, color: n.accent,
            }}
          >
            {String(idx + 1).padStart(2, '0')}
          </div>
        </div>

        <div style={{position: 'absolute', top: 500, left: 60, right: 60, textAlign: 'center'}}>
          <BrandName text={n.brand} accent={n.accent} delay={8} />
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 34, ...useReveal(20)}}>
            <span style={{fontFamily, fontSize: 40, fontWeight: 800, color: INK, background: n.accent, borderRadius: 999, padding: '6px 34px'}}>
              {n.tag}
            </span>
          </div>
          <div style={{height: 5, width: 360 * line, background: n.accent, borderRadius: 5, margin: '40px auto 30px', boxShadow: `0 0 18px ${n.accent}`}} />
          <div style={{fontFamily, fontSize: 84, fontWeight: 900, color: '#fff', lineHeight: 1.25, textShadow: '0 6px 30px rgba(0,0,0,0.6)', ...useReveal(28, 18)}}>
            {n.title}
          </div>
        </div>

        <div style={{position: 'absolute', top: 1150, left: 70, right: 70}}>
          {n.points.map((p, i) => {
            const d = 52 + i * 22;
            const s = spring({frame: frame - d, fps, config: {damping: 15}});
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26, padding: '26px 34px', borderRadius: 28,
                  background: 'rgba(255,255,255,0.07)', border: `2px solid ${n.accent}55`, backdropFilter: 'blur(8px)',
                  opacity: s, transform: `translateX(${(1 - s) * -140}px)`,
                }}
              >
                <div
                  style={{
                    width: 18, height: 18, borderRadius: 5, transform: 'rotate(45deg)', background: n.accent,
                    boxShadow: `0 0 14px ${n.accent}`, flexShrink: 0,
                  }}
                />
                <span style={{fontFamily, fontSize: 44, fontWeight: 700, color: 'rgba(255,255,255,0.96)', lineHeight: 1.35}}>{p}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Sequence from={6} durationInFrames={FPS * 2}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.3} />
      </Sequence>
      {n.points.map((_, i) => (
        <Sequence key={i} from={52 + i * 22} durationInFrames={20}>
          <Audio src={staticFile('sfx/pop.wav')} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Intro: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = useExit(frames);
  const pop = spring({frame: frame - 18, fps, config: {damping: 11}});
  const accent = '#5FD4F4';
  return (
    <AbsoluteFill>
      <TechBg accent={accent} glow="#16306B" />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl', opacity: exit, textAlign: 'center'}}>
        <div style={{fontFamily, fontSize: 56, fontWeight: 700, color: accent, ...useReveal(4)}}>أكتوبر 2026</div>
        <div style={{fontFamily, fontSize: 128, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginTop: 10, ...useReveal(10, 18)}}>وش الجديد في</div>
        <div
          style={{
            fontFamily, fontSize: 104, fontWeight: 900, lineHeight: 1.35, color: INK, background: accent, borderRadius: 30, whiteSpace: 'nowrap',
            padding: '0 44px', marginTop: 16, opacity: pop, transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])}) rotate(${(1 - pop) * -6}deg)`,
            boxShadow: `0 0 60px ${accent}88`,
          }}
        >
          الذكاء الاصطناعي؟
        </div>
        <div style={{fontFamily, fontSize: 50, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 44, ...useReveal(40)}}>
          {newsCount} أخبار في أقل من دقيقة
        </div>
      </AbsoluteFill>
      <Sequence from={0} durationInFrames={FPS * 2}>
        <Audio src={staticFile('sfx/cinematic-riser.wav')} volume={0.35} />
      </Sequence>
      <Sequence from={18} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/cinematic-boom.wav')} volume={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 8, fps, config: {damping: 12}});
  const fadeOut = interpolate(frame, [frames - 20, frames], [0, 1], clamp);
  const accent = '#3EE8B5';
  return (
    <AbsoluteFill>
      <TechBg accent={accent} glow="#0E4B5B" />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl', textAlign: 'center'}}>
        <div style={{fontFamily, fontSize: 60, fontWeight: 700, color: 'rgba(255,255,255,0.85)', ...useReveal(2)}}>أي خبر أكثر شي يهمك؟</div>
        <div style={{fontFamily, fontSize: 52, fontWeight: 600, color: accent, marginTop: 10, ...useReveal(14)}}>قولي بالتعليقات</div>
        <div
          style={{
            fontFamily, fontSize: 120, fontWeight: 900, color: '#fff', marginTop: 60, lineHeight: 1.25,
            opacity: pop, transform: `scale(${interpolate(pop, [0, 1], [1.4, 1])})`, textShadow: `0 0 50px ${accent}88`,
          }}
        >
          تابعني
        </div>
        <div style={{fontFamily, fontSize: 56, fontWeight: 700, color: '#fff', ...useReveal(30)}}>لكل جديد في الذكاء الاصطناعي</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: fadeOut}} />
      <Sequence from={6} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const AINews: React.FC = () => {
  const tl = timeline();
  const total = totalFrames();
  let idx = -1;
  return (
    <AbsoluteFill style={{background: INK}}>
      <TransitionSeries>
        {tl.map(({scene, frames}, i) => {
          if (scene.kind === 'news') idx++;
          const s = scene as Scene;
          return (
            <Fragment key={i}>
              {i > 0 ? <TransitionSeries.Transition presentation={zoomBlur()} timing={linearTiming({durationInFrames: TRANSITION})} /> : null}
              <TransitionSeries.Sequence durationInFrames={frames}>
                {s.kind === 'intro' ? <Intro frames={frames} /> : s.kind === 'outro' ? <Outro frames={frames} /> : <NewsScene n={s} idx={idx} frames={frames} />}
              </TransitionSeries.Sequence>
            </Fragment>
          );
        })}
      </TransitionSeries>
      {tl.slice(1).map(({start}, i) => (
        <Sequence key={i} from={Math.max(0, start - 4)} durationInFrames={30}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.45} />
        </Sequence>
      ))}
      <Audio
        src={staticFile('music/background.wav')}
        volume={(f) => 0.5 * interpolate(f, [0, 20], [0, 1], clamp) * interpolate(f, [total - 2 * FPS, total], [1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
