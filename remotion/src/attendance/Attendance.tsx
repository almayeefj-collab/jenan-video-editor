import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {
  APP_OPEN, CLIP, FOOTAGE_FROM, FPS, GOLD, GOLD_DEEP, GREEN, INK, OUTRO_START, PHONE_IN, SCREEN, SIRI, SKY, SPEECH, totalFrames, VOICE,
} from './config';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const textShadow = '0 8px 40px rgba(0,10,40,0.6)';

// دخول عنصر: يطلع من تحت مع blur — وخروج اختياري لفوق
const reveal = (frame: number, delay: number, exitAt = Infinity, dur = 14) => {
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  const q = interpolate(frame - exitAt, [0, 12], [0, 1], {...clamp, easing: ease});
  return {opacity: p * (1 - q), filter: `blur(${(1 - p + q) * 12}px)`, transform: `translateY(${(1 - p) * 36 - q * 40}px)`};
};

// خلفية تدرج أزرق مع بقع ضوء تتحرك ببطء
const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const a = Math.sin(frame / 50);
  const b = Math.cos(frame / 65);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(170deg, #1E6FD9 0%, #0F4AA8 35%, #082A6B 70%, #041230 100%)'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${30 + a * 10}% ${18 + b * 6}%, rgba(110,190,255,0.45) 0%, transparent 45%)`}} />
      <AbsoluteFill style={{background: `radial-gradient(circle at ${75 - a * 8}% ${80 + b * 5}%, rgba(40,120,255,0.35) 0%, transparent 50%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(2,8,30,0.55) 100%)'}} />
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

const Fingerprint: React.FC<{size: number; draw: number; scan: number; done?: number}> = ({size, draw, scan, done = 0}) => {
  const stroke = done > 0 ? GREEN : GOLD;
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

const MicIcon: React.FC<{size: number; color?: string}> = ({size, color = INK}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="11" rx="3" fill={color} />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);

// موجة صوت حية تتحرك مع صوت الأمر الصوتي
const VoiceWave: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const audio = useAudioData(staticFile(VOICE));
  const bars = 20;
  const t = frame - PHONE_IN + Math.round(FOOTAGE_FROM * FPS);
  const values = audio && t >= 0
    ? visualizeAudio({fps, frame: t, audioData: audio, numberOfSamples: 32, optimizeFor: 'speed'}).slice(0, bars)
    : new Array(bars).fill(0);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 6, height: 56, direction: 'ltr'}}>
      {[...values].reverse().concat(values).map((v, i) => (
        <div key={i} style={{width: 7, borderRadius: 7, height: 6 + Math.min(1, Math.sqrt(v) * 2.2) * 50, background: `linear-gradient(${GOLD}, ${GOLD_DEEP})`}} />
      ))}
    </div>
  );
};

// ─────────── الجوال ───────────
const SCREEN_W = 540;
const SCREEN_H = 1170;
const BEZEL = 16;
const PHONE_TOP = 330;

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame: frame - PHONE_IN, fps, config: {damping: 18, mass: 1.1, stiffness: 90}});
  const drop = interpolate(frame, [OUTRO_START - 2, OUTRO_START + 20], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  if (frame < PHONE_IN - 1 || drop >= 1) return null;
  const y = (1 - rise) * 1500 + drop * 1500;
  const tilt = (1 - rise) * 28 - drop * 18;
  // zoom خفيف وقت ما يفتح التطبيق
  const push = interpolate(frame, [APP_OPEN - 6, APP_OPEN + 40], [1, 1.025], {...clamp, easing: ease});
  const siri = interpolate(frame, [SIRI - 8, SIRI + 4, APP_OPEN, APP_OPEN + 12], [0, 1, 1, 0], clamp);
  const hue = (frame * 6) % 360;
  // لمعة على الزجاج لحظة ما يستقر الجوال
  const sweep = interpolate(frame, [PHONE_IN + 16, PHONE_IN + 40], [-60, 160], clamp);
  const W = SCREEN_W + BEZEL * 2;
  const H = SCREEN_H + BEZEL * 2;
  return (
    <div style={{position: 'absolute', top: PHONE_TOP, left: (1080 - W) / 2, width: W, height: H, perspective: 2000}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${y}px) rotateX(${tilt}deg) scale(${push})`, transformOrigin: '50% 75%'}}>
        {/* توهج سيري */}
        <div
          style={{
            position: 'absolute', inset: -26, borderRadius: 110, opacity: siri,
            background: `conic-gradient(from ${hue}deg, #FF6FD8, #7A5CFF, #3EC5FF, #FFB86B, #FF6FD8)`, filter: 'blur(30px)',
          }}
        />
        {/* إطار التيتانيوم */}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: 92,
            background: 'linear-gradient(135deg, #E9EEF5 0%, #9AA6B8 22%, #5D6879 50%, #A9B4C4 78%, #EEF2F8 100%)',
            boxShadow: '0 60px 120px rgba(0,8,30,0.6), 0 0 0 1px rgba(255,255,255,0.25) inset',
          }}
        />
        {/* أزرار جانبية */}
        {[{side: 'left', top: 230, h: 60}, {side: 'left', top: 330, h: 110}, {side: 'left', top: 460, h: 110}, {side: 'right', top: 360, h: 170}].map((b, i) => (
          <div key={i} style={{position: 'absolute', [b.side]: -6, top: b.top, width: 8, height: b.h, borderRadius: 4, background: 'linear-gradient(90deg, #6C7788, #C9D1DD, #6C7788)'}} />
        ))}
        {/* الشاشة */}
        <div style={{position: 'absolute', inset: 5, borderRadius: 88, background: '#000'}} />
        <div style={{position: 'absolute', left: BEZEL, top: BEZEL, width: SCREEN_W, height: SCREEN_H, borderRadius: 74, overflow: 'hidden', background: '#000'}}>
          <Sequence from={PHONE_IN} layout="none">
            <OffthreadVideo
              src={staticFile(SCREEN)}
              trimBefore={Math.round(FOOTAGE_FROM * FPS)}
              volume={1}
              style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.045)'}}
            />
          </Sequence>
          {/* Dynamic Island نظيف فوق اللي في التصوير */}
          <div style={{position: 'absolute', top: 22, left: '50%', width: 170, height: 50, marginLeft: -85, borderRadius: 30, background: '#000'}} />
          {/* انعكاس الزجاج */}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(155deg, rgba(255,255,255,0.10) 0%, transparent 35%)'}} />
          <div style={{position: 'absolute', top: 0, bottom: 0, width: 160, left: `${sweep}%`, transform: 'skewX(-18deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)'}} />
        </div>
      </div>
    </div>
  );
};

// إضاءة خفيفة خلف الجوال
const BackLight: React.FC = () => {
  const frame = useCurrentFrame();
  const on = interpolate(frame, [PHONE_IN + 4, PHONE_IN + 34], [0, 1], {...clamp, easing: ease})
    * interpolate(frame, [OUTRO_START, OUTRO_START + 18], [1, 0], clamp);
  const breathe = 1 + Math.sin(frame / 22) * 0.04;
  return (
    <>
      <div
        style={{
          position: 'absolute', left: 540 - 420, top: 330, width: 840, height: 1150, borderRadius: '50%', opacity: on,
          transform: `scale(${breathe})`, filter: 'blur(70px)',
          background: 'radial-gradient(ellipse at center, rgba(210,235,255,1) 0%, rgba(110,185,255,0.7) 42%, transparent 70%)',
        }}
      />
      <div style={{position: 'absolute', left: 540 - 220, top: 1450, width: 440, height: 90, borderRadius: '50%', opacity: on * 0.5, filter: 'blur(40px)', background: 'rgba(0,10,40,0.9)'}} />
    </>
  );
};

// كرت الخطوة أسفل الشاشة (زجاجي)
const StepCard: React.FC<{n: string; title: string; sub: string; from: number; to: number; children?: React.ReactNode}> = ({n, title, sub, from, to, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inP = spring({frame: frame - from, fps, config: {damping: 16, mass: 0.8}});
  const out = interpolate(frame, [to - 8, to], [1, 0], clamp);
  if (frame < from - 1 || frame > to) return null;
  return (
    <div
      style={{
        position: 'absolute', left: 70, right: 70, bottom: 120, direction: 'rtl', fontFamily,
        opacity: inP * out, transform: `translateY(${(1 - inP) * 80 + (1 - out) * 30}px)`,
        padding: '24px 32px', borderRadius: 36, background: 'rgba(4,18,48,0.55)', backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.22)', boxShadow: '0 24px 60px rgba(0,8,30,0.45)',
        display: 'flex', alignItems: 'center', gap: 26,
      }}
    >
      <div style={{flex: 'none', width: 84, height: 84, borderRadius: 26, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, color: INK, fontSize: 50, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        {n}
      </div>
      <div style={{flex: 1}}>
        <div style={{color: 'white', fontSize: 48, fontWeight: 800, lineHeight: 1.25}}>{title}</div>
        <div style={{color: SKY, fontSize: 33, fontWeight: 600, marginTop: 2}}>{sub}</div>
        {children}
      </div>
    </div>
  );
};

// العنوان: كبير في النص بالانترو، ثم يطلع فوق كهيدر وقت ما يطلع الجوال
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const move = interpolate(frame, [PHONE_IN - 14, PHONE_IN + 16], [0, 1], {...clamp, easing: ease});
  const inP = reveal(frame, 18);
  const out = interpolate(frame, [OUTRO_START, OUTRO_START + 12], [1, 0], clamp);
  const top = interpolate(move, [0, 1], [1020, 95]);
  const scale = interpolate(move, [0, 1], [1, 0.62]);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily, direction: 'rtl', opacity: out}}>
      <div style={{...inP, transform: `${inP.transform} scale(${scale})`, transformOrigin: '50% 0%', color: 'white', fontSize: 120, fontWeight: 900, lineHeight: 1.1, textShadow}}>
        بصمة التواجد
      </div>
      <div style={{...reveal(frame, PHONE_IN), marginTop: -40, display: 'flex', alignItems: 'center', gap: 12, color: GOLD, fontSize: 36, fontWeight: 700}}>
        <div style={{width: 40, height: 2, background: GOLD}} />
        وزارة التربية
        <div style={{width: 40, height: 2, background: GOLD}} />
      </div>
    </div>
  );
};

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 2, fps, config: {damping: 14, mass: 0.7}});
  const gone = interpolate(frame, [PHONE_IN - 16, PHONE_IN], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{alignItems: 'center', fontFamily, direction: 'rtl'}}>
      <div style={{position: 'absolute', top: 560, transform: `scale(${(0.6 + pop * 0.4) * (1 - gone * 0.3)}) translateY(${-gone * 120}px)`, opacity: pop * (1 - gone)}}>
        <Fingerprint size={300} draw={interpolate(frame, [4, 46], [0, 1], clamp)} scan={interpolate(frame, [24, 60], [0, 1], {...clamp, easing: ease})} />
      </div>
      <div style={{position: 'absolute', top: 920, ...reveal(frame, 12, PHONE_IN - 16), padding: '8px 32px', borderRadius: 60, background: 'rgba(255,255,255,0.12)', border: `2px solid ${GOLD}99`, color: GOLD, fontSize: 38, fontWeight: 700}}>
        تذكير
      </div>
      <div style={{position: 'absolute', top: 1170, ...reveal(frame, 28, PHONE_IN - 18), color: SKY, fontSize: 50, fontWeight: 600, textShadow}}>
        لا تنسين تبصمين كل يوم
      </div>
    </AbsoluteFill>
  );
};

// شارة «أمر صوتي» وقت الكلام
const VoiceChip: React.FC = () => {
  const frame = useCurrentFrame();
  const on = interpolate(frame, [SPEECH[0] - 4, SPEECH[0] + 6, SPEECH[1], SPEECH[1] + 10], [0, 1, 1, 0], clamp);
  if (on <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute', top: PHONE_TOP + 120, right: 70, opacity: on, transform: `scale(${0.7 + on * 0.3})`, transformOrigin: '100% 50%',
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 26px', borderRadius: 50, direction: 'rtl', fontFamily,
        background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`, boxShadow: `0 0 ${18 + 16 * Math.abs(Math.sin(frame / 6))}px ${GOLD_DEEP}, 0 14px 30px rgba(0,0,0,0.35)`,
      }}
    >
      <MicIcon size={38} />
      <span style={{color: INK, fontSize: 34, fontWeight: 900}}>أمر صوتي</span>
    </div>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame - OUTRO_START;
  if (f < 0) return null;
  const done = spring({frame: f - 34, fps, config: {damping: 12}});
  const check = interpolate(f, [36, 54], [0, 1], {...clamp, easing: ease});
  const fadeOut = interpolate(frame, [totalFrames() - 10, totalFrames()], [1, 0], clamp);
  return (
    <AbsoluteFill style={{opacity: fadeOut, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30, fontFamily, direction: 'rtl'}}>
      <div style={{position: 'relative', ...reveal(f, 8), transform: `${reveal(f, 8).transform} scale(${1 + done * 0.06})`}}>
        <Fingerprint size={250} draw={interpolate(f, [8, 36], [0, 1], clamp)} scan={interpolate(f, [14, 40], [0, 1], clamp)} done={done} />
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
      <div style={{...reveal(f, 16), color: 'white', fontSize: 92, fontWeight: 900, textShadow, marginTop: 20}}>بصمتج = حضورج</div>
      <div style={{...reveal(f, 24), color: GOLD, fontSize: 48, fontWeight: 700, textShadow}}>بصمة التواجد يومياً عبر تطبيق وزارة التربية</div>
      <div style={{...reveal(f, 32), marginTop: 18, display: 'flex', alignItems: 'center', gap: 16, padding: '14px 36px', borderRadius: 60, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})`}}>
        <MicIcon size={44} />
        <span style={{color: INK, fontSize: 42, fontWeight: 900}}>بصوتج… وبثواني</span>
      </div>
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
      <Backdrop />
      <BackLight />
      <Intro />
      <Title />
      <Phone />
      <VoiceChip />
      <StepCard n="١" title="افتحي التطبيق بصوتج" sub="قولي الأمر لسيري… بدون ما تدورين عليه" from={SPEECH[0] - 6} to={SIRI + 8}>
        <div style={{marginTop: 8}}>
          <VoiceWave />
        </div>
      </StepCard>
      <StepCard n="٢" title="يفتح تطبيق وزارة التربية" sub="وبصمة التواجد مربوطة مباشرة بالوزارة" from={APP_OPEN - 4} to={PHONE_IN + CLIP - 4} />
      <Outro />

      <Audio src={staticFile('music/background.wav')} volume={music} />
      <Sequence from={0} durationInFrames={20}><Audio src={staticFile('sfx/swoosh-up.wav')} volume={0.5} /></Sequence>
      <Sequence from={22} durationInFrames={45}><Audio src={staticFile('sfx/riser.wav')} volume={0.3} /></Sequence>
      <Sequence from={PHONE_IN - 4} durationInFrames={30}><Audio src={staticFile('sfx/swoosh-up.wav')} volume={0.6} /></Sequence>
      <Sequence from={SPEECH[0] - 6} durationInFrames={12}><Audio src={staticFile('sfx/pop.wav')} volume={0.4} /></Sequence>
      <Sequence from={SIRI - 4} durationInFrames={60}><Audio src={staticFile('sfx/shimmer.wav')} volume={0.35} /></Sequence>
      <Sequence from={APP_OPEN - 4} durationInFrames={12}><Audio src={staticFile('sfx/pop.wav')} volume={0.45} /></Sequence>
      <Sequence from={OUTRO_START} durationInFrames={30}><Audio src={staticFile('sfx/swoosh-down.wav')} volume={0.55} /></Sequence>
      <Sequence from={OUTRO_START + 34} durationInFrames={36}><Audio src={staticFile('sfx/impact.wav')} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
