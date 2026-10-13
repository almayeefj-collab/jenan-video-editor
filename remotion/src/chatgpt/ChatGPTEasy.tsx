import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {INK, TRANSITION} from '../ainews/config';
import {Illustration} from '../ainews/Illustrations';
import {clamp, ease, HandleTag, InstaOutro, latin, LightBg, useExit, useReveal} from '../ainews/kit';
import {fontFamily} from '../reel/font';
import {zoomBlur} from '../reel/zoomBlur';
import {type Episode, episodeFrames, FPS, GREEN, GREEN_SOFT, INTRO_SEC, OUTRO_SEC, RECAP_SEC, type Step, STEP_SEC} from './episodes';

// كل حلقة لها موسيقى مختلفة: tools/reel_music.py --seed chatgpt-ep<رقم>
const musicFor = (n: number) => `music/chatgpt-ep${n}.wav`;
const SERIES = 'ChatGPT بسهولة';

// شارة السلسلة أعلى كل مشهد
const SeriesTag: React.FC<{n: number}> = ({n}) => (
  <div style={{position: 'absolute', top: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center', ...useReveal(0, 10)}}>
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '10px 30px', borderRadius: 999, background: '#fff',
        boxShadow: '0 8px 30px rgba(20,26,46,0.1)', direction: 'rtl',
      }}
    >
      <span style={{fontFamily, fontSize: 34, fontWeight: 800, color: INK}}>{SERIES}</span>
      <span style={{width: 2, height: 30, background: '#DDE3EE'}} />
      <span style={{fontFamily, fontSize: 34, fontWeight: 800, color: GREEN}}>الحلقة {n}</span>
    </div>
  </div>
);

// شعار ChatGPT مبسّط (زهرة دائرية) — رسمة عامة مو الشعار الرسمي
const BotAvatar: React.FC<{size: number}> = ({size}) => (
  <div style={{width: size, height: size, borderRadius: size, background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="-50 -50 100 100">
      {Array.from({length: 6}).map((_, i) => (
        <rect key={i} x={-9} y={-42} width={18} height={44} rx={9} fill="none" stroke="#fff" strokeWidth={7} transform={`rotate(${i * 60})`} />
      ))}
    </svg>
  </div>
);

// يفصل المرفق عن النص: [صورة …] أو (تتكلم)
const parsePrompt = (p: string) => {
  const img = p.match(/^\[(.+?)\]\s*/);
  if (img) return {chip: {kind: 'image' as const, label: img[1]}, text: p.slice(img[0].length)};
  const voice = p.match(/^\((.+?)\)\s*/);
  if (voice) return {chip: {kind: 'voice' as const, label: voice[1]}, text: p.slice(voice[0].length)};
  return {chip: null, text: p};
};

const TYPE_START = 34;
const CPS = 1.3; // حروف لكل فريم

// نافذة المحادثة: كتابة الطلب حرف حرف ← نقاط "يكتب" ← الرد
const ChatWindow: React.FC<{s: Step}> = ({s}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {chip, text} = parsePrompt(s.prompt);
  const typed = Math.max(0, Math.floor((frame - TYPE_START) * CPS));
  const typingEnd = TYPE_START + Math.ceil(text.length / CPS);
  const sent = spring({frame: frame - typingEnd - 6, fps, config: {damping: 14}});
  const replyAt = typingEnd + 34;
  const reply = spring({frame: frame - replyAt, fps, config: {damping: 14}});
  const thinking = frame > typingEnd + 8 && frame < replyAt;
  const win = spring({frame: frame - 14, fps, config: {damping: 16}});
  return (
    <div
      style={{
        position: 'absolute', top: 640, left: 70, right: 70, height: 760, borderRadius: 48, background: '#fff', overflow: 'hidden',
        boxShadow: '0 30px 70px rgba(20,26,46,0.14)', opacity: win, transform: `translateY(${(1 - win) * 80}px)`, direction: 'rtl',
      }}
    >
      {/* شريط علوي */}
      <div style={{height: 110, display: 'flex', alignItems: 'center', gap: 20, padding: '0 36px', borderBottom: '2px solid #EEF1F6'}}>
        <BotAvatar size={62} />
        <span style={{fontFamily: latin, fontSize: 40, fontWeight: 800, color: INK, direction: 'ltr'}}>ChatGPT</span>
      </div>
      {/* رسالتك */}
      <div style={{padding: '36px 36px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14}}>
        {chip && sent > 0.01 ? (
          <div style={{opacity: sent, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px', borderRadius: 22, background: '#F1F4F9'}}>
            {chip.kind === 'image' ? (
              <div style={{width: 70, height: 70, borderRadius: 14, background: 'linear-gradient(135deg, #B9F3D0, #9AD8FF)'}} />
            ) : (
              <svg width={60} height={60} viewBox="0 0 60 60">
                {[0, 1, 2, 3, 4].map((i) => {
                  const h = 12 + Math.abs(Math.sin(frame / 5 + i)) * 34;
                  return <rect key={i} x={6 + i * 11} y={30 - h / 2} width={7} height={h} rx={3.5} fill={GREEN} />;
                })}
              </svg>
            )}
            <span style={{fontFamily, fontSize: 32, fontWeight: 700, color: '#5B6478'}}>{chip.label}</span>
          </div>
        ) : null}
        {sent > 0.01 ? (
          <div
            style={{
              maxWidth: 760, padding: '22px 30px', borderRadius: 34, borderTopRightRadius: 10, background: GREEN, color: '#fff',
              fontFamily, fontSize: 40, fontWeight: 700, lineHeight: 1.45, opacity: sent, transform: `scale(${interpolate(sent, [0, 1], [0.7, 1])})`,
              transformOrigin: 'right top',
            }}
          >
            {text}
          </div>
        ) : null}
      </div>
      {/* رد ChatGPT */}
      <div style={{padding: '30px 36px', display: 'flex', gap: 18, alignItems: 'flex-start', direction: 'rtl', justifyContent: 'flex-start', flexDirection: 'row-reverse'}}>
        {thinking || reply > 0.01 ? <BotAvatar size={56} /> : null}
        {thinking ? (
          <div style={{display: 'flex', gap: 10, padding: '24px 28px', borderRadius: 30, background: '#F1F4F9'}}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{width: 16, height: 16, borderRadius: 16, background: '#9AA3B5', transform: `translateY(${-8 * Math.max(0, Math.sin(frame / 4 - i))}px)`}} />
            ))}
          </div>
        ) : null}
        {reply > 0.01 ? (
          <div
            style={{
              maxWidth: 720, padding: '22px 30px', borderRadius: 34, borderTopLeftRadius: 10, background: '#F1F4F9', color: INK,
              fontFamily, fontSize: 38, fontWeight: 600, lineHeight: 1.45, opacity: reply, transform: `translateY(${(1 - reply) * 30}px)`,
            }}
          >
            {s.reply}
          </div>
        ) : null}
      </div>
      {/* خانة الكتابة */}
      <div
        style={{
          position: 'absolute', bottom: 30, left: 30, right: 30, height: 100, borderRadius: 50, background: '#F1F4F9',
          display: 'flex', alignItems: 'center', padding: '0 34px', gap: 18,
        }}
      >
        <span style={{fontFamily, fontSize: 38, fontWeight: 600, color: sent > 0.01 || typed === 0 ? '#9AA3B5' : INK, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>
          {sent > 0.01 || typed === 0 ? 'اسأل أي شي…' : text.slice(0, typed)}
          {sent <= 0.01 && typed > 0 && frame % 16 < 8 ? <span style={{color: GREEN}}>|</span> : null}
        </span>
        <div style={{width: 64, height: 64, borderRadius: 64, background: typed > 0 && sent <= 0.01 ? INK : '#C9D0DC', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={30} height={30} viewBox="0 0 30 30">
            <path d="M15 25 V6 M7 13 L15 5 L23 13" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {/* أصوات الكيبورد والإرسال */}
      {Array.from({length: Math.ceil(text.length / 3)}).map((_, i) => (
        <Sequence key={i} from={TYPE_START + Math.round((i * 3) / CPS)} durationInFrames={8}>
          <Audio src={staticFile(`sfx/key${i % 4}.wav`)} volume={0.25} />
        </Sequence>
      ))}
      <Sequence from={typingEnd + 6} durationInFrames={20}>
        <Audio src={staticFile('sfx/swoosh-up.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={replyAt} durationInFrames={20}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.3} />
      </Sequence>
    </div>
  );
};

const StepScene: React.FC<{e: Episode; s: Step; i: number; frames: number}> = ({e, s, i, frames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = useExit(frames);
  const num = spring({frame: frame - 2, fps, config: {damping: 10}});
  const {text} = parsePrompt(s.prompt);
  const tipAt = TYPE_START + Math.ceil(text.length / CPS) + 50;
  return (
    <AbsoluteFill>
      <LightBg accent={GREEN} glow={GREEN_SOFT} />
      <SeriesTag n={e.n} />
      <AbsoluteFill style={{direction: 'rtl', opacity: exit}}>
        <div style={{position: 'absolute', top: 250, left: 70, right: 70, display: 'flex', alignItems: 'center', gap: 34}}>
          <div
            style={{
              width: 170, height: 170, borderRadius: 50, background: GREEN, color: '#fff', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: latin, fontWeight: 900, fontSize: 104,
              transform: `scale(${num}) rotate(${(1 - num) * 40 - 5}deg)`, boxShadow: `0 20px 40px ${GREEN}55`,
            }}
          >
            {i + 1}
          </div>
          <div>
            <div style={{fontFamily, fontSize: 38, fontWeight: 700, color: GREEN, ...useReveal(8)}}>الخطوة {i + 1} من {e.steps.length}</div>
            <div style={{fontFamily, fontSize: 80, fontWeight: 900, color: INK, lineHeight: 1.2, ...useReveal(14, 16)}}>{s.title}</div>
          </div>
        </div>
        <ChatWindow s={s} />
        <div style={{position: 'absolute', top: 1450, left: 70, right: 70, display: 'flex', justifyContent: 'center', ...useReveal(tipAt)}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '20px 34px', borderRadius: 30, background: '#FFF6D6', border: '3px solid #FFD95A'}}>
            <svg width={46} height={46} viewBox="0 0 46 46">
              <circle cx={23} cy={19} r={14} fill="#FFC94D" />
              <rect x={16} y={31} width={14} height={9} rx={3} fill="#C9A23A" />
            </svg>
            <span style={{fontFamily, fontSize: 42, fontWeight: 800, color: INK}}>{s.tip}</span>
          </div>
        </div>
      </AbsoluteFill>
      <HandleTag />
      <Sequence from={2} durationInFrames={FPS * 2}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.25} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Intro: React.FC<{e: Episode; frames: number}> = ({e, frames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = useExit(frames);
  const art = spring({frame: frame - 2, fps, config: {damping: 14}});
  const pop = spring({frame: frame - 22, fps, config: {damping: 11}});
  return (
    <AbsoluteFill>
      <LightBg accent={GREEN} glow={GREEN_SOFT} />
      <SeriesTag n={e.n} />
      <AbsoluteFill style={{alignItems: 'center', direction: 'rtl', textAlign: 'center', opacity: exit}}>
        <div style={{marginTop: 230, width: 860, borderRadius: 48, overflow: 'hidden', boxShadow: `0 30px 60px ${GREEN}30`, opacity: art, transform: `scale(${interpolate(art, [0, 1], [0.85, 1])})`}}>
          <Illustration art={e.art} accent={GREEN} width={860} />
        </div>
        <div style={{fontFamily, fontSize: 60, fontWeight: 700, color: 'rgba(20,26,46,0.75)', marginTop: 80, padding: '0 60px', ...useReveal(8)}}>{e.hook}</div>
        <div
          style={{
            fontFamily, fontSize: Math.min(110, Math.round(1350 / e.title.length)), fontWeight: 900, color: '#fff', background: GREEN, borderRadius: 34, padding: '0 46px', marginTop: 30, lineHeight: 1.4,
            whiteSpace: 'nowrap', opacity: pop, transform: `scale(${interpolate(pop, [0, 1], [0.5, 1])}) rotate(${(1 - pop) * -6 - 2}deg)`, boxShadow: `0 20px 50px ${GREEN}55`,
          }}
        >
          {e.title}
        </div>
        <div style={{fontFamily, fontSize: 46, fontWeight: 600, color: GREEN, marginTop: 40, ...useReveal(44)}}>{e.steps.length} خطوات بسيطة</div>
      </AbsoluteFill>
      <HandleTag />
      <Sequence from={0} durationInFrames={FPS * 2}>
        <Audio src={staticFile('sfx/cinematic-riser.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={22} durationInFrames={FPS * 2}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Recap: React.FC<{e: Episode; frames: number}> = ({e, frames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = useExit(frames);
  const pop = spring({frame: frame - 16, fps, config: {damping: 11}});
  const shine = interpolate(frame, [30, 70], [-100, 200], clamp);
  return (
    <AbsoluteFill>
      <LightBg accent={GREEN} glow={GREEN_SOFT} />
      <SeriesTag n={e.n} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl', textAlign: 'center', opacity: exit}}>
        <div style={{fontFamily, fontSize: 64, fontWeight: 800, color: GREEN, ...useReveal(2)}}>الخلاصة</div>
        <div
          style={{
            margin: '40px 60px 0', padding: '50px 50px', borderRadius: 50, background: '#fff', position: 'relative', overflow: 'hidden',
            boxShadow: '0 30px 70px rgba(20,26,46,0.14)', border: `5px solid ${GREEN}`,
            opacity: pop, transform: `scale(${interpolate(pop, [0, 1], [0.6, 1])})`,
          }}
        >
          <div style={{fontFamily, fontSize: 84, fontWeight: 900, color: INK, lineHeight: 1.35}}>{e.recap}</div>
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: 120, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', transform: 'skewX(-20deg)'}} />
        </div>
        <div style={{fontFamily, fontSize: 50, fontWeight: 700, color: 'rgba(20,26,46,0.75)', marginTop: 70, ...useReveal(40)}}>احفظ الفيديو وجربها الحين</div>
      </AbsoluteFill>
      <HandleTag />
      <Sequence from={16} durationInFrames={FPS * 2}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const makeChatGPTEasy = (e: Episode): React.FC => {
  const Comp: React.FC = () => {
    const total = episodeFrames(e, TRANSITION);
    const scenes: {frames: number; el: (frames: number) => React.ReactNode}[] = [
      {frames: INTRO_SEC * FPS, el: (f) => <Intro e={e} frames={f} />},
      ...e.steps.map((s, i) => ({frames: Math.round(STEP_SEC * FPS), el: (f: number) => <StepScene e={e} s={s} i={i} frames={f} />})),
      {frames: RECAP_SEC * FPS, el: (f) => <Recap e={e} frames={f} />},
      {
        frames: Math.round(OUTRO_SEC * FPS),
        el: (f) => <InstaOutro frames={f} line1={`الحلقة الجاية: ${e.next}`} line2="لا تفوتك" accent={GREEN} glow={GREEN_SOFT} />,
      },
    ];
    let t = 0;
    const starts = scenes.map((s, i) => {
      if (i > 0) t -= TRANSITION;
      const st = t;
      t += s.frames;
      return st;
    });
    return (
      <AbsoluteFill style={{background: '#fff'}}>
        <TransitionSeries>
          {scenes.map((s, i) => (
            <Fragment key={i}>
              {i > 0 ? <TransitionSeries.Transition presentation={zoomBlur()} timing={linearTiming({durationInFrames: TRANSITION})} /> : null}
              <TransitionSeries.Sequence durationInFrames={s.frames}>{s.el(s.frames)}</TransitionSeries.Sequence>
            </Fragment>
          ))}
        </TransitionSeries>
        {starts.slice(1).map((st, i) => (
          <Sequence key={i} from={Math.max(0, st - 4)} durationInFrames={30}>
            <Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} />
          </Sequence>
        ))}
        <Audio src={staticFile(musicFor(e.n))} volume={(f) => 0.4 * interpolate(f, [0, 15], [0, 1], clamp) * interpolate(f, [total - 2 * FPS, total], [1, 0], {...clamp, easing: ease})} />
      </AbsoluteFill>
    );
  };
  return Comp;
};
