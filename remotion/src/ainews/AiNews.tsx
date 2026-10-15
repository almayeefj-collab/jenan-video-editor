import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {type Episode, episodeFrames, FPS, INSTAGRAM, type NewsScene, sceneStarts, theme} from './types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const glow = (c: string) => `0 0 24px ${c}aa, 0 6px 30px rgba(0,0,0,0.6)`;

// صورة بخلفية Ken Burns + دخول zoom/blur/flash عند بداية كل مشهد
const Background: React.FC<{src: string; frames: number; dim?: number}> = ({src, frames, dim = 0}) => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 10], [0, 1], {...clamp, easing: ease});
  const scale = interpolate(f, [0, frames], [1.08, 1.2]) * (1.25 - 0.25 * enter);
  const flash = interpolate(f, [0, 2, 9], [0.8, 0.5, 0], clamp);
  return (
    <AbsoluteFill style={{background: theme.bg}}>
      <Img
        src={staticFile(src)}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: `blur(${(1 - enter) * 24}px) brightness(${1 - dim})`}}
      />
      {/* تدرج غامق فوق وتحت عشان النص يقرا */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.88) 80%)'}} />
      <AbsoluteFill style={{background: 'white', opacity: flash, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

const Words: React.FC<{text: string; delay?: number; stagger?: number}> = ({text, delay = 0, stagger = 3}) => {
  const f = useCurrentFrame();
  return (
    <>
      {text.split(' ').map((w, i) => {
        const p = interpolate(f - delay - i * stagger, [0, 10], [0, 1], {...clamp, easing: ease});
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 30}px)`, marginLeft: '0.25em'}}>
            {w}
          </span>
        );
      })}
    </>
  );
};

// الشريط اللي فوق طول الحلقة: «أخبار AI» + رقم الحلقة + التاريخ
const TopBar: React.FC<{ep: Episode}> = ({ep}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [6, 22], [0, 1], {...clamp, easing: ease});
  const live = 0.55 + 0.45 * Math.sin((f / FPS) * Math.PI * 2);
  return (
    <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -40}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, direction: 'rtl', fontFamily, color: theme.text, fontSize: 34, fontWeight: 800,
        background: 'rgba(10,10,20,0.7)', border: '2px solid rgba(255,255,255,0.18)', borderRadius: 999, padding: '12px 30px', backdropFilter: 'blur(10px)'}}>
        <span style={{width: 18, height: 18, borderRadius: 9, background: theme.red, opacity: live, boxShadow: `0 0 14px ${theme.red}`}} />
        <span>أخبار AI اليومية</span>
        <span style={{opacity: 0.5}}>|</span>
        <span style={{color: theme.cyan}}>الحلقة {ep.number}</span>
        <span style={{opacity: 0.5}}>|</span>
        <span style={{fontWeight: 600, opacity: 0.85}}>{ep.date}</span>
      </div>
    </div>
  );
};

// المشهد الأول: «خبر نازل!» كبير مع اهتزاز
const Hook: React.FC<{s: NewsScene}> = ({s}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - 4, fps, config: {damping: 8, stiffness: 180}});
  const shake = f < 18 ? Math.sin(f * 2.3) * (18 - f) * 0.8 : 0;
  const stripe = interpolate(f, [0, 14], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 1060, left: 0, right: 0, height: 210, background: `linear-gradient(90deg, ${theme.red}, #B5003A)`,
        transform: `scaleX(${stripe}) skewY(-4deg)`, boxShadow: glow(theme.red)}} />
      <div style={{position: 'absolute', top: 1050, width: '100%', textAlign: 'center', fontSize: 170, fontWeight: 1000, color: 'white',
        transform: `translateX(${shake}px) scale(${pop}) rotate(-4deg)`, textShadow: '0 8px 30px rgba(0,0,0,0.5)'}}>
        {s.title}
      </div>
      <div style={{position: 'absolute', top: 1340, width: '100%', textAlign: 'center', fontSize: 62, fontWeight: 800, color: 'white', textShadow: glow(theme.cyan)}}>
        <Words text={s.sub ?? ''} delay={16} />
      </div>
    </AbsoluteFill>
  );
};

// مشهد خبر: tag الأداة + رقم الخبر + العنوان + الشرح
const News: React.FC<{s: NewsScene; idx: number; total: number}> = ({s, idx, total}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tagIn = spring({frame: f - 6, fps, config: {damping: 12}});
  const card = interpolate(f, [24, 40], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', color: theme.text}}>
      <div style={{position: 'absolute', bottom: 520, right: 70, left: 70}}>
        <div style={{display: 'flex', gap: 16, alignItems: 'center', marginBottom: 22, transform: `scale(${tagIn})`, transformOrigin: 'right center'}}>
          <span style={{background: `linear-gradient(90deg, ${theme.violet}, ${theme.cyan})`, padding: '8px 28px', borderRadius: 14, fontSize: 44, fontWeight: 900, direction: 'ltr'}}>
            {s.tag}
          </span>
          <span style={{background: 'rgba(255,255,255,0.14)', padding: '8px 22px', borderRadius: 14, fontSize: 38, fontWeight: 800}}>
            خبر {idx} من {total}
          </span>
        </div>
        <div style={{fontSize: 108, fontWeight: 1000, lineHeight: 1.15, textShadow: glow(theme.violet)}}>
          <Words text={s.title} delay={10} stagger={4} />
        </div>
        <div style={{marginTop: 26, fontSize: 52, fontWeight: 700, lineHeight: 1.45, color: theme.dim, opacity: card, transform: `translateY(${(1 - card) * 30}px)`,
          borderRight: `8px solid ${theme.cyan}`, paddingRight: 26}}>
          {s.sub}
        </div>
      </div>
      {/* شريط تقدم الخبر */}
      <div style={{position: 'absolute', bottom: 470, right: 70, left: 70, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.15)'}}>
        <div style={{height: '100%', borderRadius: 4, width: `${interpolate(f, [0, s.dur * FPS], [0, 100], clamp)}%`, marginRight: 0, marginLeft: 'auto',
          background: `linear-gradient(270deg, ${theme.cyan}, ${theme.violet})`}} />
      </div>
    </AbsoluteFill>
  );
};

// الختام: تابعوني على الانستغرام
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - 6, fps, config: {damping: 11}});
  const btn = spring({frame: f - 22, fps, config: {damping: 9, stiffness: 160}});
  const pulse = 1 + 0.04 * Math.sin(Math.max(0, f - 40) / 6);
  const tap = interpolate(f, [70, 78, 86], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
      <div style={{fontSize: 70, fontWeight: 900, transform: `scale(${p})`, textAlign: 'center', lineHeight: 1.3, textShadow: glow(theme.violet)}}>
        تبي الأخبار أول بأول؟
      </div>
      <div style={{fontSize: 56, fontWeight: 700, marginTop: 20, opacity: p}}>تابعوني على الانستغرام</div>
      <div style={{marginTop: 60, transform: `scale(${btn * pulse * (1 - 0.06 * tap)})`, display: 'flex', alignItems: 'center', gap: 22, direction: 'ltr',
        background: 'linear-gradient(45deg, #F58529, #DD2A7B 45%, #8134AF 75%, #515BD4)', borderRadius: 999, padding: '26px 54px', boxShadow: '0 12px 50px rgba(221,42,123,0.55)'}}>
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.6" cy="6.4" r="0.6" fill="white" />
        </svg>
        <span style={{fontSize: 64, fontWeight: 900, fontFamily: 'Cairo'}}>{INSTAGRAM}</span>
      </div>
      <div style={{marginTop: 46, fontSize: 48, fontWeight: 800, opacity: interpolate(f, [40, 56], [0, 1], clamp), background: 'white', color: '#111', padding: '10px 44px', borderRadius: 16}}>
        + متابعة
      </div>
    </AbsoluteFill>
  );
};

export const AiNews: React.FC<{ep: Episode; voice: boolean}> = ({ep, voice}) => {
  const {starts, outroStart} = sceneStarts(ep);
  const total = episodeFrames(ep);
  const news = ep.scenes.filter((s) => s.kind === 'news').length;
  let n = 0;
  // الموسيقى تنخفض تحت الفويس أوفر، وعالية بدونه
  const bed = voice ? 0.22 : 0.75;
  return (
    <AbsoluteFill style={{background: theme.bg}}>
      {ep.scenes.map((s, i) => {
        const frames = Math.round(s.dur * FPS);
        const idx = s.kind === 'news' ? ++n : 0;
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={frames}>
            <Background src={s.image} frames={frames} />
            {s.kind === 'hook' ? <Hook s={s} /> : <News s={s} idx={idx} total={news} />}
            {voice && s.voice ? (
              <Sequence from={s.kind === 'hook' ? 8 : 6}>
                <Audio src={staticFile(s.voice)} />
              </Sequence>
            ) : null}
            <Audio src={staticFile(i === 0 ? 'sfx/impact.wav' : 'sfx/whoosh.wav')} volume={0.6} />
          </Sequence>
        );
      })}
      <Sequence from={outroStart} durationInFrames={Math.round(ep.outro.dur * FPS)}>
        <Background src={ep.outro.image} frames={Math.round(ep.outro.dur * FPS)} dim={0.55} />
        <Outro />
        {voice && ep.outro.voice ? (
          <Sequence from={6}>
            <Audio src={staticFile(ep.outro.voice)} />
          </Sequence>
        ) : null}
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} />
        <Sequence from={22}><Audio src={staticFile('sfx/pop.wav')} volume={0.7} /></Sequence>
      </Sequence>
      <TopBar ep={ep} />
      <Audio
        src={staticFile(ep.music)}
        volume={(f) => bed * interpolate(f, [total - 30, total], [1, 0], clamp) * (f > outroStart + 150 && voice ? 2.4 : 1)}
      />
    </AbsoluteFill>
  );
};
