import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {type Episode, episodeFrames, FPS, INSTAGRAM, type NewsScene, sceneStarts, theme} from './types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const glow = (c: string) => `0 0 24px ${c}aa, 0 6px 30px rgba(0,0,0,0.6)`;

const BPM = 124; // نفس سرعة الموسيقى (tools/compose_hype.py)
const BEAT = (60 / BPM) * FPS;
// نبضة خفيفة مع كل ضربة kick
const beatPulse = (f: number) => Math.exp(-((f % BEAT) / BEAT) * 6);

// جزيئات مضيئة تطلع لفوق — ثابتة (deterministic) عشان الرندر يطلع نفسه كل مرة
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const Particles: React.FC<{count?: number; color?: string}> = ({count = 34, color = theme.cyan}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}, (_, i) => {
        const speed = 1.2 + rand(i) * 2.8;
        const size = 4 + rand(i + 50) * 10;
        const x = rand(i + 100) * 1080 + Math.sin((f + i * 20) / 40) * 30;
        const y = 1920 - ((f * speed + rand(i + 200) * 1920) % 2100);
        const tw = 0.35 + 0.65 * Math.abs(Math.sin((f + i * 13) / 18));
        const c = i % 3 === 0 ? theme.violet : color;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: c, opacity: 0.55 * tw, boxShadow: `0 0 ${size * 2.5}px ${c}`}} />;
      })}
    </AbsoluteFill>
  );
};

// خلفية full-bleed متحركة (للانترو والأوترو): drift + zoom + نبضة الإيقاع
const FullBackground: React.FC<{src: string; frames: number; dim?: number}> = ({src, frames, dim = 0}) => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, 12], [0, 1], {...clamp, easing: ease});
  const scale = interpolate(f, [0, frames], [1.1, 1.28]) * (1.3 - 0.3 * enter) * (1 + 0.012 * beatPulse(f));
  const x = Math.sin(f / 45) * 18;
  const rot = Math.sin(f / 70) * 1.2;
  const flash = interpolate(f, [0, 2, 10], [0.85, 0.5, 0], clamp);
  return (
    <AbsoluteFill style={{background: theme.bg, overflow: 'hidden'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover',
        transform: `translateX(${x}px) scale(${scale}) rotate(${rot}deg)`, filter: `blur(${(1 - enter) * 26}px) brightness(${1 - dim}) saturate(1.15)`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.85) 80%)'}} />
      <Particles />
      <AbsoluteFill style={{background: 'white', opacity: flash, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

// مشهد الخبر: الصورة كرت ثلاثي الأبعاد يطير ويدخل بلفة، يتمايل، وعليه لمعة وglitch
// وورا الكرت نفس الصورة مضببة تتحرك (parallax)
const CardBackground: React.FC<{src: string; frames: number; idx: number}> = ({src, frames, idx}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dir = idx % 2 === 0 ? 1 : -1; // كل خبر يدخل من جهة
  const enter = spring({frame: f, fps, config: {damping: 14, stiffness: 90, mass: 0.9}});
  const exit = interpolate(f, [frames - 8, frames], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const beat = beatPulse(f);
  const rotY = (1 - enter) * 70 * dir + Math.sin(f / 38) * 7 + exit * -40 * dir;
  const rotX = (1 - enter) * -18 + Math.cos(f / 47) * 4;
  const tx = (1 - enter) * 700 * dir + exit * -900 * dir;
  const ty = Math.sin(f / 30) * 10;
  const cardScale = (0.82 + 0.18 * enter) * (1 + 0.018 * beat);
  const inner = interpolate(f, [0, frames], [1.05, 1.22]);
  const panX = interpolate(f, [0, frames], [-30, 30]) * dir;
  // glitch: ظلال حمرا وزرقا تتباعد أول الدخول وعلى كل ضربة قوية
  const g = Math.max(interpolate(f, [0, 10], [22, 0], clamp), f % (BEAT * 4) < 3 ? 10 : 0);
  // لمعة تمشي على الكرت
  const sweep = interpolate(f, [8, 34], [-120, 220], clamp);
  return (
    <AbsoluteFill style={{background: theme.bg, overflow: 'hidden'}}>
      <Img src={staticFile(src)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${1.35 + 0.05 * beat}) translateX(${-panX * 1.5}px)`, filter: 'blur(38px) brightness(0.45) saturate(1.4)'}} />
      <Particles count={26} />
      <div style={{position: 'absolute', top: 240, left: 80, width: 920, height: 1120, perspective: 1600}}>
        <div style={{width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden', position: 'relative',
          transform: `translate(${tx}px, ${ty}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${cardScale})`,
          boxShadow: `0 40px 90px rgba(0,0,0,0.7), 0 0 ${40 + 40 * beat}px ${theme.violet}88`,
          border: '3px solid rgba(255,255,255,0.22)',
          filter: g > 0.5 ? `drop-shadow(${g}px 0 0 rgba(255,40,90,0.75)) drop-shadow(${-g}px 0 0 rgba(0,220,255,0.75))` : undefined}}>
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${inner}) translateX(${panX}px)`}} />
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep}%`, width: '35%',
            background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent)', transform: 'skewX(-18deg)'}} />
        </div>
      </div>
      {/* تدرج تحت عشان العنوان يقرا فوق طرف الكرت */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.92) 78%)'}} />
    </AbsoluteFill>
  );
};

// الكلمات الإنجليزية المتتالية (Try on، Google AI Pro) تطلع قطعة وحدة عشان ما ينقلب ترتيبها
const isArabic = (w: string) => /[\u0600-\u06FF]/.test(w);
const chunks = (text: string) =>
  text.split(' ').reduce<string[]>((out, w) => {
    const prev = out[out.length - 1];
    if (prev !== undefined && !isArabic(w) && !isArabic(prev)) out[out.length - 1] = `${prev} ${w}`;
    else out.push(w);
    return out;
  }, []);

const Words: React.FC<{text: string; delay?: number; stagger?: number}> = ({text, delay = 0, stagger = 3}) => {
  const f = useCurrentFrame();
  // عنوان إنجليزي كامل (مثل Gemini 4 Argon) لازم ينعرض LTR وإلا تنقلب الكلمات
  const latin = !isArabic(text);
  return (
    <span style={{direction: latin ? 'ltr' : 'rtl', display: 'inline-block'}}>
      {chunks(text).map((w, i) => {
        const p = interpolate(f - delay - i * stagger, [0, 10], [0, 1], {...clamp, easing: ease});
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 30}px)`, marginLeft: '0.25em'}}>
            {w}
          </span>
        );
      })}
    </span>
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

// المشهد الأول: «آخر أخبار أدوات الذكاء الاصطناعي» + «مع جنان المعييف»
const Hook: React.FC<{s: NewsScene}> = ({s}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - 4, fps, config: {damping: 8, stiffness: 180}});
  const shake = f < 18 ? Math.sin(f * 2.3) * (18 - f) * 0.8 : 0;
  const stripe = interpolate(f, [0, 14], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 1010, left: 0, right: 0, height: 330, background: `linear-gradient(90deg, ${theme.violet}, ${theme.cyan})`,
        transform: `scaleX(${stripe}) skewY(-4deg)`, boxShadow: glow(theme.violet)}} />
      <div style={{position: 'absolute', top: 1030, width: '100%', padding: '0 60px', textAlign: 'center', fontSize: 104, fontWeight: 1000, lineHeight: 1.2, color: 'white',
        transform: `translateX(${shake}px) scale(${pop}) rotate(-4deg)`, textShadow: '0 8px 30px rgba(0,0,0,0.5)'}}>
        {s.title}
      </div>
      <div style={{position: 'absolute', top: 1420, width: '100%', textAlign: 'center', fontSize: 76, fontWeight: 900, color: 'white', textShadow: glow(theme.violet)}}>
        <Words text={s.sub ?? ''} delay={16} stagger={5} />
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
        <div style={{fontSize: 108, fontWeight: 1000, lineHeight: 1.15, textShadow: glow(theme.violet),
          transform: `scale(${1 + 0.5 * (1 - spring({frame: f - 10, fps, config: {damping: 10, stiffness: 140}}))})`, transformOrigin: 'right bottom'}}>
          <Words text={s.title} delay={10} stagger={4} />
        </div>
        <div style={{marginTop: 26, fontSize: 52, fontWeight: 700, lineHeight: 1.45, color: theme.dim, opacity: card, transform: `translateY(${(1 - card) * 30}px)`,
          borderRight: `8px solid ${theme.cyan}`, paddingRight: 26}}>
          {s.sub}
        </div>
      </div>
      {/* رقم الخبر كبير وشفاف فوق يسار الكرت */}
      <div style={{position: 'absolute', top: 280, left: 110, fontSize: 220, fontWeight: 1000, color: 'transparent', WebkitTextStroke: '3px rgba(255,255,255,0.55)',
        fontFamily: 'Cairo', direction: 'ltr', opacity: tagIn, transform: `translateY(${(1 - tagIn) * -60}px)`, textShadow: `0 0 30px ${theme.cyan}66`}}>
        {String(idx).padStart(2, '0')}
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
            {s.kind === 'hook' ? <FullBackground src={s.image} frames={frames} /> : <CardBackground src={s.image} frames={frames} idx={idx} />}
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
        <FullBackground src={ep.outro.image} frames={Math.round(ep.outro.dur * FPS)} dim={0.2} />
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
