// حلقة «عرض مشروع»: فيديو جنان (أفقي 16:9) يتحول لريل طولي بستايل السلسلة.
// كل قسم = عنوان متحرك فوق + لقطة نافذة التطبيق من فيديوها (مقصوصة ومسرّعة لتغطي القسم) + ٣ نقاط تحت.
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {Outro} from './AiNews2';
import {Backdrop, BeatView, Kinetic} from './Beats';
import {C, type Beat, FPS, INSTAGRAM} from './types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export type ShowSection = {
  head: string; // «*الطالبات*» — الرقم يطلع فوقه (١ / ٦)
  sub: string; // سطر تحت اللقطة
  points: string[]; // ٣ نقاط (من فيديو جنان)
  from: number; // بداية القسم في الفيديو الأصلي (ثانية)
  to: number;
  dur: number; // طوله في الريل (الفيديو يتسرّع/يتبطّأ ليغطيه)
  voice?: string;
  voiceDur?: number;
};

export type ShowcaseEp = {
  number: number;
  date: string;
  music: string;
  source: string; // الفيديو الأصلي
  crop: [number, number, number, number]; // [x, y, w, h] نافذة التطبيق داخل الفيديو الأصلي
  intro: {beats: Beat[]; voice?: string; voiceDur?: number};
  sections: ShowSection[];
  reveal: {head: string; code: string; dur: number; voice?: string; voiceDur?: number}; // «سويته بـ Claude Code»
  outro: {voice?: string; dur: number; word?: string};
};

const secFrames = (s: ShowSection, voice: boolean) =>
  Math.round((voice && s.voiceDur ? Math.max(s.dur, s.voiceDur + 0.3) : s.dur) * FPS);

export const layoutShowcase = (ep: ShowcaseEp, voice: boolean) => {
  const base = ep.intro.beats.reduce((a, b) => a + b.dur, 0);
  const k = voice && ep.intro.voiceDur ? (ep.intro.voiceDur + 0.2) / base : 1;
  const introBeats = ep.intro.beats.map((b) => Math.round(b.dur * k * FPS));
  let t = introBeats.reduce((a, b) => a + b, 0);
  const secs = ep.sections.map((s) => {
    const frames = secFrames(s, voice);
    const out = {s, start: t, frames};
    t += frames;
    return out;
  });
  const revealStart = t;
  t += Math.round((voice && ep.reveal.voiceDur ? Math.max(ep.reveal.dur, ep.reveal.voiceDur + 0.3) : ep.reveal.dur) * FPS);
  const outroStart = t;
  return {introBeats, secs, revealStart, outroStart, total: t + Math.round(ep.outro.dur * FPS)};
};

export const showcaseFrames = (ep: ShowcaseEp, voice: boolean) => layoutShowcase(ep, voice).total;

// نافذة التطبيق: اللقطة المقصوصة من فيديو جنان (مع شريط النافذة حقها)
const AppWindow: React.FC<{ep: ShowcaseEp; s: ShowSection; frames: number}> = ({ep, s, frames}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [cx, cy, cw, ch] = ep.crop;
  // مكبّرة عشان تنقرا على الجوال: نشوف ٧٠٠ بكسل من عرض النافذة، والكاميرا تمشي من يمين النافذة (بداية الواجهة العربية) لليسار وتنزل شوي
  const W = 1000;
  const H = 780;
  const viewW = 700;
  const sc = W / viewW;
  const viewH = H / sc;
  const p = interpolate(f, [8, frames - 4], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const vx = cx + (cw - viewW) * (1 - p);
  const vy = cy + Math.max(0, ch - viewH) * p;
  const rate = (s.to - s.from) / (frames / fps);
  const pop = spring({frame: f - 4, fps, config: {damping: 14, stiffness: 110}});
  return (
    <div style={{position: 'absolute', top: 500, left: 40, width: W, height: H, borderRadius: 30, overflow: 'hidden', background: 'white',
      boxShadow: '0 40px 90px rgba(40,25,20,0.28)', border: '3px solid white', transform: `translateY(${(1 - pop) * 260}px) scale(${0.9 + 0.1 * pop})`, opacity: Math.min(1, pop * 1.6)}}>
      <OffthreadVideo src={staticFile(ep.source)} startFrom={Math.round(s.from * fps)} playbackRate={rate} muted
        style={{position: 'absolute', left: -vx * sc, top: -vy * sc, width: 1920 * sc, height: 1080 * sc, maxWidth: 'none'}} />
    </div>
  );
};

const SectionScene: React.FC<{ep: ShowcaseEp; s: ShowSection; i: number; frames: number}> = ({ep, s, i, frames}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = interpolate(f, [frames - 6, frames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', color: C.ink, opacity: 1 - out * 0.4}}>
      <Backdrop look="light" />
      <div style={{position: 'absolute', top: 190, width: '100%', textAlign: 'center', fontSize: 36, fontWeight: 800, color: C.coral, letterSpacing: 1}}>
        دفتر المتابعة · {['١', '٢', '٣', '٤', '٥', '٦'][i]} / ٦
      </div>
      <div style={{position: 'absolute', top: 245, left: 40, right: 40}}><Kinetic text={s.head} look="light" size={104} /></div>
      <AppWindow ep={ep} s={s} frames={frames} />
      <div style={{position: 'absolute', top: 1305, width: '100%', textAlign: 'center', fontSize: 46, fontWeight: 900,
        opacity: interpolate(f, [10, 20], [0, 1], clamp)}}>{s.sub}</div>
      <div style={{position: 'absolute', top: 1385, left: 110, right: 110, display: 'flex', flexDirection: 'column', gap: 14}}>
        {s.points.map((p, k) => {
          const q = spring({frame: f - 18 - k * 8, fps, config: {damping: 14, stiffness: 140}});
          return (
            <div key={p} style={{display: 'flex', alignItems: 'center', gap: 20, fontSize: 40, fontWeight: 800, background: C.paper, borderRadius: 22,
              padding: '12px 26px', boxShadow: '0 10px 26px rgba(40,25,20,0.08)', transform: `translateX(${(1 - q) * -120}px)`, opacity: q}}>
              <div style={{width: 44, height: 44, borderRadius: 12, background: C.coral, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="white" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span>{p}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 120, width: '100%', textAlign: 'center', fontSize: 30, fontWeight: 800, color: 'rgba(120,110,105,0.55)', direction: 'ltr'}}>{INSTAGRAM}</div>
    </AbsoluteFill>
  );
};

// «سويته بالكامل بـ Claude Code»: تيرمنال ينكتب فيه
const RevealScene: React.FC<{head: string; code: string}> = ({head, code}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const typed = code.slice(0, Math.max(0, Math.floor((f - 18) / 2.5)));
  const pop = spring({frame: f - 8, fps, config: {damping: 13, stiffness: 120}});
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', color: 'white'}}>
      <Backdrop look="dark" />
      <div style={{position: 'absolute', top: 470, left: 40, right: 40}}><Kinetic text={head} look="dark" size={92} /></div>
      <div style={{position: 'absolute', top: 860, left: 90, right: 90, height: 230, borderRadius: 36, background: '#120E0D', border: '2px solid rgba(255,255,255,0.12)',
        display: 'flex', alignItems: 'center', padding: '0 54px', direction: 'ltr', gap: 30, transform: `scale(${pop})`, boxShadow: '0 40px 90px rgba(0,0,0,0.5)'}}>
        <span style={{color: C.coral, fontSize: 96, fontFamily: 'monospace', fontWeight: 700}}>{'>'}</span>
        <span style={{fontSize: 100, fontFamily: 'monospace', fontWeight: 700}}>{typed}</span>
        <span style={{width: 34, height: 110, background: C.coral, opacity: f % 20 < 12 ? 1 : 0}} />
      </div>
      <div style={{position: 'absolute', top: 1170, width: '100%', textAlign: 'center', fontSize: 46, fontWeight: 800, color: 'rgba(255,255,255,0.75)',
        opacity: interpolate(f, [40, 55], [0, 1], clamp)}}>المعلمة جنان المعييف</div>
    </AbsoluteFill>
  );
};

export const Showcase: React.FC<{ep: ShowcaseEp; voice: boolean}> = ({ep, voice}) => {
  const {introBeats, secs, revealStart, outroStart, total} = layoutShowcase(ep, voice);
  const bed = voice ? 0.12 : 0.5;
  let t = 0;
  return (
    <AbsoluteFill style={{background: C.cream}}>
      {ep.intro.beats.map((b, bi) => {
        const from = t;
        t += introBeats[bi];
        return (
          <Sequence key={`i${bi}`} from={from} durationInFrames={introBeats[bi]}>
            <BeatView b={b} frames={introBeats[bi]} />
            <Audio src={staticFile(bi === 0 ? 'sfx/impact.wav' : 'sfx/whoosh.wav')} volume={0.5} />
          </Sequence>
        );
      })}
      {voice && ep.intro.voice ? <Sequence from={4}><Audio src={staticFile(ep.intro.voice)} /></Sequence> : null}
      {secs.map(({s, start, frames}, i) => (
        <Sequence key={`s${i}`} from={start} durationInFrames={frames}>
          <SectionScene ep={ep} s={s} i={i} frames={frames} />
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} />
          {voice && s.voice ? <Sequence from={4}><Audio src={staticFile(s.voice)} /></Sequence> : null}
        </Sequence>
      ))}
      <Sequence from={revealStart} durationInFrames={outroStart - revealStart}>
        <RevealScene head={ep.reveal.head} code={ep.reveal.code} />
        <Audio src={staticFile('sfx/impact.wav')} volume={0.5} />
        {voice && ep.reveal.voice ? <Sequence from={4}><Audio src={staticFile(ep.reveal.voice)} /></Sequence> : null}
      </Sequence>
      <Sequence from={outroStart} durationInFrames={total - outroStart}>
        <Outro word={ep.outro.word} />
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.5} />
        <Sequence from={24}><Audio src={staticFile('sfx/pop.wav')} volume={0.7} /></Sequence>
        {voice && ep.outro.voice ? <Sequence from={4}><Audio src={staticFile(ep.outro.voice)} /></Sequence> : null}
      </Sequence>
      <Audio src={staticFile(ep.music)} volume={(f) => bed * interpolate(f, [total - 30, total], [1, 0], clamp)} />
    </AbsoluteFill>
  );
};
