import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {zoomBlur} from '../reel/zoomBlur';
import {FPS, INK, MUSIC, type News, newsCount, type Scene, timeline, totalFrames, TRANSITION} from './config';
import {Illustration} from './Illustrations';
import {clamp, ease, HandleTag, InstaOutro, latin, LightBg, useExit, useReveal} from './kit';

// تاريخ الافتتاحية — يتحدث كل يوم
export const DATE_LABEL = '13 أكتوبر 2026';

// شريط تقدّم الأخبار أعلى الشاشة
const Progress: React.FC<{idx: number; accent: string}> = ({idx, accent}) => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [4, 30], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', top: 90, left: 80, right: 80, display: 'flex', gap: 12, direction: 'rtl'}}>
      {Array.from({length: newsCount}).map((_, i) => (
        <div key={i} style={{flex: 1, height: 8, borderRadius: 8, background: 'rgba(20,26,46,0.1)', overflow: 'hidden'}}>
          <div style={{height: '100%', borderRadius: 8, background: accent, width: i < idx ? '100%' : i === idx ? `${fill * 100}%` : '0%'}} />
        </div>
      ))}
    </div>
  );
};

// اسم البراند: حرف حرف مع spring
const BrandName: React.FC<{text: string; accent: string; delay: number}> = ({text, accent, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const size = text.length > 10 ? 104 : 124;
  return (
    <div style={{direction: 'ltr', display: 'flex', justifyContent: 'center', fontFamily: latin, fontWeight: 900, fontSize: size, letterSpacing: -3, lineHeight: 1}}>
      {text.split('').map((ch, i) => {
        const s = spring({frame: frame - delay - i * 1.5, fps, config: {damping: 13, mass: 0.7}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', whiteSpace: 'pre', color: INK, opacity: s,
              transform: `translateY(${(1 - s) * 70}px) scale(${interpolate(s, [0, 1], [0.6, 1])})`,
              textShadow: `0 6px 0 ${accent}33`,
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
  const card = spring({frame: frame - 2, fps, config: {damping: 16}});
  const badge = spring({frame: frame - 12, fps, config: {damping: 10}});
  const line = interpolate(frame, [22, 44], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <LightBg accent={n.accent} glow={n.glow} />
      <Progress idx={idx} accent={n.accent} />
      <AbsoluteFill style={{direction: 'rtl', opacity: exit}}>
        {/* الرسمة */}
        <div
          style={{
            position: 'absolute', top: 150, left: 70, width: 940, borderRadius: 48, overflow: 'hidden',
            boxShadow: `0 30px 60px ${n.accent}30, 0 4px 0 ${n.accent}40`,
            opacity: card, transform: `translateY(${(1 - card) * 80}px) scale(${interpolate(card, [0, 1], [0.9, 1])})`,
          }}
        >
          {n.img ? (
            <div style={{width: 940, height: 620, overflow: 'hidden'}}>
              <Img
                src={staticFile(n.img)}
                style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(frame, [0, frames], [1.05, 1.18])})`}}
              />
            </div>
          ) : (
            <Illustration art={n.art} accent={n.accent} />
          )}
        </div>
        {/* رقم الخبر */}
        <div
          style={{
            position: 'absolute', top: 120, right: 50, width: 120, height: 120, borderRadius: 40, background: n.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: latin, fontWeight: 900, fontSize: 56, color: '#fff',
            transform: `scale(${badge}) rotate(${(1 - badge) * 30 - 6}deg)`, boxShadow: `0 14px 30px ${n.accent}66`,
          }}
        >
          {String(idx + 1).padStart(2, '0')}
        </div>

        <div style={{position: 'absolute', top: 830, left: 60, right: 60, textAlign: 'center'}}>
          <BrandName text={n.brand} accent={n.accent} delay={10} />
          <div style={{display: 'flex', justifyContent: 'center', marginTop: 26, ...useReveal(20)}}>
            <span style={{fontFamily, fontSize: 38, fontWeight: 800, color: '#fff', background: n.accent, borderRadius: 999, padding: '4px 32px'}}>{n.tag}</span>
          </div>
          <div style={{height: 5, width: 300 * line, background: n.accent, borderRadius: 5, margin: '28px auto 18px'}} />
          <div style={{fontFamily, fontSize: 76, fontWeight: 900, color: INK, lineHeight: 1.25, ...useReveal(28, 18)}}>{n.title}</div>
        </div>

        <div style={{position: 'absolute', top: 1270, left: 70, right: 70}}>
          {n.points.map((p, i) => {
            const d = 52 + i * 22;
            const s = spring({frame: frame - d, fps, config: {damping: 15}});
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 22, marginBottom: 20, padding: '22px 30px', borderRadius: 26,
                  background: '#fff', boxShadow: '0 10px 30px rgba(20,26,46,0.08)', borderRight: `10px solid ${n.accent}`,
                  opacity: s, transform: `translateX(${(1 - s) * -140}px)`,
                }}
              >
                <div
                  style={{
                    width: 46, height: 46, borderRadius: 14, background: `${n.accent}1f`, color: n.accent, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: latin, fontWeight: 900, fontSize: 28,
                  }}
                >
                  {i + 1}
                </div>
                <span style={{fontFamily, fontSize: 40, fontWeight: 700, color: INK, lineHeight: 1.35}}>{p}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <HandleTag />
      <Sequence from={6} durationInFrames={FPS * 2}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.25} />
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
  const art = spring({frame: frame - 2, fps, config: {damping: 14}});
  const accent = '#3B6CF6';
  return (
    <AbsoluteFill>
      <LightBg accent={accent} glow="#D6E2FF" />
      <AbsoluteFill style={{alignItems: 'center', direction: 'rtl', opacity: exit, textAlign: 'center'}}>
        <div style={{marginTop: 210, width: 820, borderRadius: 48, overflow: 'hidden', boxShadow: `0 30px 60px ${accent}30`, opacity: art, transform: `scale(${interpolate(art, [0, 1], [0.85, 1])})`}}>
          <Illustration art="robot" accent={accent} width={820} />
        </div>
        <div style={{fontFamily, fontSize: 52, fontWeight: 700, color: accent, marginTop: 70, ...useReveal(6)}}>{DATE_LABEL}</div>
        <div style={{fontFamily, fontSize: 112, fontWeight: 900, color: INK, lineHeight: 1.2, marginTop: 6, ...useReveal(10, 18)}}>وش الجديد في</div>
        <div
          style={{
            fontFamily, fontSize: 100, fontWeight: 900, lineHeight: 1.4, color: '#fff', background: accent, borderRadius: 30, whiteSpace: 'nowrap',
            padding: '0 40px', marginTop: 16, opacity: pop, transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])}) rotate(${(1 - pop) * -6 - 2}deg)`,
            boxShadow: `0 20px 50px ${accent}55`,
          }}
        >
          الذكاء الاصطناعي؟
        </div>
        <div style={{fontFamily, fontSize: 46, fontWeight: 600, color: 'rgba(20,26,46,0.7)', marginTop: 40, ...useReveal(40)}}>{newsCount} أخبار في أقل من دقيقة</div>
      </AbsoluteFill>
      <HandleTag />
      <Sequence from={0} durationInFrames={FPS * 2}>
        <Audio src={staticFile('sfx/cinematic-riser.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={18} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const AINews: React.FC = () => {
  const tl = timeline();
  const total = totalFrames();
  let idx = -1;
  return (
    <AbsoluteFill style={{background: '#fff'}}>
      <TransitionSeries>
        {tl.map(({scene, frames}, i) => {
          if (scene.kind === 'news') idx++;
          const s = scene as Scene;
          return (
            <Fragment key={i}>
              {i > 0 ? <TransitionSeries.Transition presentation={zoomBlur()} timing={linearTiming({durationInFrames: TRANSITION})} /> : null}
              <TransitionSeries.Sequence durationInFrames={frames}>
                {s.kind === 'intro' ? (
                  <Intro frames={frames} />
                ) : s.kind === 'outro' ? (
                  <InstaOutro frames={frames} line1="أي خبر أكثر شي يهمك؟" line2="قولي بالتعليقات" accent="#E1306C" glow="#FFD6E5" />
                ) : (
                  <NewsScene n={s} idx={idx} frames={frames} />
                )}
              </TransitionSeries.Sequence>
            </Fragment>
          );
        })}
      </TransitionSeries>
      {tl.slice(1).map(({start}, i) => (
        <Sequence key={i} from={Math.max(0, start - 4)} durationInFrames={30}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} />
        </Sequence>
      ))}
      <Audio src={staticFile(MUSIC)} volume={(f) => 0.45 * interpolate(f, [0, 15], [0, 1], clamp) * interpolate(f, [total - 2 * FPS, total], [1, 0], clamp)} />
    </AbsoluteFill>
  );
};
