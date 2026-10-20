import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {zoomBlur} from '../reel/zoomBlur';
import {
  APP_OPEN, CLIP, CLIP_START, FOOTAGE, FOOTAGE_FROM, FPS, GOLD, GOLD_DEEP, GREEN, INK, INTRO, NAVY, OUTRO, OUTRO_START,
  SIRI, SKY, SPEECH, totalFrames, TRANSITION,
} from './config';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const textShadow = '0 6px 30px rgba(0,0,0,0.55)';
const VOICE = 'footage/attendance-voice.wav';

// دخول عنصر: يطلع من تحت مع blur
const reveal = (frame: number, delay: number, dur = 14) => {
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 12}px)`, transform: `translateY(${(1 - p) * 36}px)`};
};

// خلفية كحلية متحركة: توهج ناعم + شبكة نقاط خفيفة
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 40) * 12;
  const y = 35 + Math.cos(frame / 55) * 8;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at ${x}% ${y}%, #1B4F94 0%, ${NAVY} 38%, ${INK} 85%)`}}>
      <AbsoluteFill
        style={{
          opacity: 0.18,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.55) 1.4px, transparent 1.6px)',
          backgroundSize: '44px 44px',
          backgroundPosition: `0 ${-frame * 0.6}px`,
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />
    </AbsoluteFill>
  );
};

// بصمة إصبع مرسومة بخطوط: تنرسم تدريجياً، وخط مسح ذهبي يمر عليها
const ridges = Array.from({length: 9}, (_, i) => {
  const r = 22 + i * 15;
  const gap = 0.55 - i * 0.035; // فتحة الأسفل تضيق كل ما كبرت الدائرة
  const a0 = Math.PI / 2 + gap;
  const a1 = Math.PI / 2 - gap + Math.PI * 2;
  const cx = 160;
  const cy = 170 + i * 2.2;
  const ry = r * 1.18;
  const p = (a: number) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + ry * Math.sin(a)).toFixed(1)}`;
  return {d: `M ${p(a0)} A ${r} ${ry} 0 1 1 ${p(a1)}`, len: 2 * Math.PI * r * 1.1};
});

const Fingerprint: React.FC<{size: number; draw: number; scan: number; color?: string; done?: number}> = ({size, draw, scan, color = GOLD, done = 0}) => {
  const stroke = done > 0 ? GREEN : color;
  return (
    <div style={{position: 'relative', width: size, height: size * 1.06}}>
      <svg viewBox="0 0 320 340" width={size} height={size * 1.06} style={{overflow: 'visible', filter: `drop-shadow(0 0 ${18 + done * 20}px ${stroke}88)`}}>
        {ridges.map((r, i) => {
          const p = interpolate(draw, [i * 0.06, i * 0.06 + 0.5], [0, 1], {...clamp, easing: ease});
          return (
            <path key={i} d={r.d} fill="none" stroke={stroke} strokeWidth={7} strokeLinecap="round"
              strokeDasharray={r.len} strokeDashoffset={r.len * (1 - p)} opacity={0.35 + 0.65 * p} />
          );
        })}
      </svg>
      {scan > 0 && scan < 1 ? (
        <div
          style={{
            position: 'absolute', left: -size * 0.12, right: -size * 0.12, height: 6, borderRadius: 6,
            top: `${scan * 100}%`, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            boxShadow: `0 0 30px 8px ${GOLD_DEEP}AA`,
          }}
        />
      ) : null}
    </div>
  );
};

// ─────────── ١) الانترو ───────────
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 2, fps, config: {damping: 14, mass: 0.7}});
  const draw = interpolate(frame, [4, 46], [0, 1], clamp);
  const scan = interpolate(frame, [26, 66], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34, fontFamily, direction: 'rtl'}}>
        <div style={{transform: `scale(${0.6 + pop * 0.4})`, opacity: pop}}>
          <Fingerprint size={300} draw={draw} scan={scan} />
        </div>
        <div style={{...reveal(frame, 14), padding: '10px 34px', borderRadius: 60, background: `${GOLD}22`, border: `2px solid ${GOLD}88`, color: GOLD, fontSize: 40, fontWeight: 700}}>
          تذكير
        </div>
        <div style={{...reveal(frame, 20), color: 'white', fontSize: 118, fontWeight: 900, lineHeight: 1.1, textShadow}}>
          بصمة التواجد
        </div>
        <div style={{...reveal(frame, 30), color: SKY, fontSize: 50, fontWeight: 600, textShadow}}>
          لا تنسين تبصمين كل يوم
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// موجة صوت حية تتحرك مع صوت الأمر الصوتي
const VoiceWave: React.FC<{offset: number}> = ({offset}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const audio = useAudioData(staticFile(VOICE));
  const bars = 24;
  const values = audio
    ? visualizeAudio({fps, frame: frame + offset, audioData: audio, numberOfSamples: 32, optimizeFor: 'speed'}).slice(0, bars)
    : new Array(bars).fill(0);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 7, height: 70, direction: 'ltr'}}>
      {[...values].reverse().concat(values).map((v, i) => (
        <div key={i} style={{width: 8, borderRadius: 8, height: 8 + Math.min(1, Math.sqrt(v) * 2.2) * 62, background: `linear-gradient(${GOLD}, ${GOLD_DEEP})`}} />
      ))}
    </div>
  );
};

const MicIcon: React.FC<{size: number}> = ({size}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={INK} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="11" rx="3" fill={INK} />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);

// كرت الخطوة أسفل الشاشة
const StepCard: React.FC<{n: string; title: string; sub: string; from: number; to: number; children?: React.ReactNode}> = ({n, title, sub, from, to, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inP = spring({frame: frame - from, fps, config: {damping: 16, mass: 0.8}});
  const out = interpolate(frame, [to - 8, to], [1, 0], clamp);
  if (frame < from - 1 || frame > to) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 60, right: 60, bottom: 110, direction: 'rtl', fontFamily,
        opacity: inP * out, transform: `translateY(${(1 - inP) * 120 + (1 - out) * 40}px)`,
        padding: '28px 36px', borderRadius: 38, background: 'rgba(6,20,44,0.82)', backdropFilter: 'blur(14px)',
        border: `2px solid ${GOLD}55`, boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', gap: 28,
      }}
    >
      <div style={{flex: 'none', width: 96, height: 96, borderRadius: 30, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, color: INK, fontSize: 58, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {n}
      </div>
      <div style={{flex: 1}}>
        <div style={{color: 'white', fontSize: 52, fontWeight: 800, lineHeight: 1.25}}>{title}</div>
        <div style={{color: SKY, fontSize: 36, fontWeight: 600, marginTop: 4}}>{sub}</div>
        {children}
      </div>
    </div>
  );
};

// ─────────── ٢) المقطع المصوّر داخل كرت ───────────
const Clip: React.FC = () => {
  const frame = useCurrentFrame(); // فريم داخل المشهد
  const g = frame + CLIP_START; // فريم على الخط الزمني الكلي
  // zoom بطيء، ويقرّب أكثر لما يفتح التطبيق
  const zoom = interpolate(g, [CLIP_START, APP_OPEN - 10, APP_OPEN + 20, OUTRO_START + TRANSITION], [1.3, 1.34, 1.42, 1.46], {...clamp, easing: ease});
  // توهج سيري حول الكرت
  const siri = interpolate(g, [SIRI - 8, SIRI + 4, APP_OPEN, APP_OPEN + 10], [0, 1, 1, 0], clamp);
  const hue = (frame * 6) % 360;
  const W = 900;
  const H = Math.round((W * 760) / 538);
  const voiceOn = interpolate(g, [SPEECH[0] - 4, SPEECH[0] + 4, SPEECH[1], SPEECH[1] + 10], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <Backdrop />
      {/* شريط علوي */}
      <div style={{position: 'absolute', top: 84, left: 0, right: 0, display: 'flex', justifyContent: 'center', fontFamily, direction: 'rtl', ...reveal(frame, TRANSITION)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '12px 34px', borderRadius: 60, background: 'rgba(255,255,255,0.08)', border: `2px solid ${GOLD}66`}}>
          <div style={{width: 16, height: 16, borderRadius: 16, background: GREEN, boxShadow: `0 0 14px ${GREEN}`, opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame / 8))}} />
          <span style={{color: 'white', fontSize: 40, fontWeight: 800}}>بصمة التواجد</span>
          <span style={{color: GOLD, fontSize: 40, fontWeight: 500}}>|</span>
          <span style={{color: GOLD, fontSize: 40, fontWeight: 700}}>وزارة التربية</span>
        </div>
      </div>
      {/* الكرت */}
      <div style={{position: 'absolute', top: 210, left: (1080 - W) / 2, width: W, height: H}}>
        <div
          style={{
            position: 'absolute', inset: -14, borderRadius: 60, opacity: siri,
            background: `conic-gradient(from ${hue}deg, #FF6FD8, #7A5CFF, #3EC5FF, #FFB86B, #FF6FD8)`, filter: 'blur(22px)',
          }}
        />
        <div style={{position: 'absolute', inset: 0, borderRadius: 48, overflow: 'hidden', border: `3px solid ${GOLD}AA`, boxShadow: '0 30px 80px rgba(0,0,0,0.55)', background: '#ddd'}}>
          <OffthreadVideo
            src={staticFile(FOOTAGE)}
            trimBefore={Math.round(FOOTAGE_FROM * FPS)}
            volume={1}
            style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: '50% 38%'}}
          />
        </div>
        {/* شارة «أمر صوتي» فوق الكرت أثناء الكلام */}
        <div
          style={{
            position: 'absolute', top: 36, right: 36, opacity: voiceOn, transform: `scale(${0.8 + voiceOn * 0.2})`,
            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 26px', borderRadius: 50, direction: 'rtl', fontFamily,
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, boxShadow: `0 0 ${20 + 16 * Math.abs(Math.sin(frame / 6))}px ${GOLD_DEEP}`,
          }}
        >
          <MicIcon size={40} />
          <span style={{color: INK, fontSize: 36, fontWeight: 900}}>أمر صوتي</span>
        </div>
      </div>
      <StepCard n="١" title="افتحي التطبيق بصوتج" sub="قولي الأمر لسيري… بدون ما تدورين عليه" from={SPEECH[0] - CLIP_START - 6} to={SIRI - CLIP_START + 8}>
        <div style={{marginTop: 10}}>
          <VoiceWave offset={Math.round(FOOTAGE_FROM * FPS)} />
        </div>
      </StepCard>
      <StepCard n="٢" title="يفتح تطبيق وزارة التربية" sub="وبصمة التواجد مربوطة مباشرة بالوزارة" from={APP_OPEN - CLIP_START - 4} to={CLIP} />
    </AbsoluteFill>
  );
};

// ─────────── ٣) الأوترو ───────────
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const done = spring({frame: frame - 34, fps, config: {damping: 12}});
  const check = interpolate(frame, [36, 54], [0, 1], {...clamp, easing: ease});
  const fadeOut = interpolate(frame, [OUTRO - 10, OUTRO], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: fadeOut}}>
      <Backdrop />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30, fontFamily, direction: 'rtl'}}>
        <div style={{position: 'relative', transform: `scale(${1 + done * 0.06})`}}>
          <Fingerprint size={250} draw={interpolate(frame, [TRANSITION - 6, TRANSITION + 24], [0.3, 1], clamp)} scan={interpolate(frame, [12, 40], [0, 1], clamp)} done={done} />
          <div
            style={{
              position: 'absolute', bottom: -18, left: -18, width: 104, height: 104, borderRadius: 104, background: GREEN,
              transform: `scale(${done})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${GREEN}`,
            }}
          >
            <svg viewBox="0 0 24 24" width={64} height={64} fill="none" stroke={INK} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray={22} strokeDashoffset={22 * (1 - check)} />
            </svg>
          </div>
        </div>
        <div style={{...reveal(frame, TRANSITION), color: 'white', fontSize: 92, fontWeight: 900, textShadow, marginTop: 20}}>
          بصمتج = حضورج
        </div>
        <div style={{...reveal(frame, TRANSITION + 8), color: GOLD, fontSize: 50, fontWeight: 700, textShadow}}>
          بصمة التواجد يومياً عبر تطبيق وزارة التربية
        </div>
        <div style={{...reveal(frame, TRANSITION + 16), marginTop: 18, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 36px', borderRadius: 60, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`}}>
          <MicIcon size={44} />
          <span style={{color: INK, fontSize: 42, fontWeight: 900}}>بصوتج… وبثواني</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Attendance: React.FC = () => {
  const total = totalFrames();
  // الموسيقى: عالية في الانترو والأوترو، وتنخفض تحت الأمر الصوتي
  const music = (f: number) =>
    interpolate(f, [0, 6, SPEECH[0] - 12, SPEECH[0], SPEECH[1] + 4, SPEECH[1] + 18, total - 30, total], [0, 0.75, 0.75, 0.12, 0.12, 0.6, 0.6, 0], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={INTRO}>
          <Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomBlur()} timing={linearTiming({durationInFrames: TRANSITION})} />
        <TransitionSeries.Sequence durationInFrames={CLIP}>
          <Clip />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomBlur()} timing={linearTiming({durationInFrames: TRANSITION})} />
        <TransitionSeries.Sequence durationInFrames={OUTRO}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Audio src={staticFile('music/background.wav')} volume={music} />
      <Sequence from={0} durationInFrames={20}><Audio src={staticFile('sfx/swoosh-up.wav')} volume={0.5} /></Sequence>
      <Sequence from={26} durationInFrames={45}><Audio src={staticFile('sfx/riser.wav')} volume={0.35} /></Sequence>
      <Sequence from={CLIP_START - 4} durationInFrames={30}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.55} /></Sequence>
      <Sequence from={SPEECH[0] - 6} durationInFrames={12}><Audio src={staticFile('sfx/pop.wav')} volume={0.4} /></Sequence>
      <Sequence from={SIRI - 4} durationInFrames={60}><Audio src={staticFile('sfx/shimmer.wav')} volume={0.35} /></Sequence>
      <Sequence from={APP_OPEN - 4} durationInFrames={12}><Audio src={staticFile('sfx/pop.wav')} volume={0.45} /></Sequence>
      <Sequence from={OUTRO_START - 4} durationInFrames={30}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.55} /></Sequence>
      <Sequence from={OUTRO_START + 34} durationInFrames={36}><Audio src={staticFile('sfx/impact.wav')} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
