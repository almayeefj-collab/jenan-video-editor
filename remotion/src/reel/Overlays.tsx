import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, FPS} from './config';
import {fontFamily} from './font';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const shadow = '0 4px 24px rgba(0,0,0,0.45)';

// كبسولة نص شبه شفافة غامقة — نفس أسلوب الفيديو المرجعي
const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      background: 'rgba(15,25,40,0.55)',
      backdropFilter: 'blur(14px)',
      border: '1.5px solid rgba(255,255,255,0.18)',
      borderRadius: 28,
      padding: '18px 36px',
      color: brand.text,
      boxShadow: shadow,
      ...style,
    }}
  >
    {children}
  </div>
);

// الكلمات تطلع وحدة وحدة مع blur
const BlurWords: React.FC<{text: string; delay?: number; stagger?: number}> = ({text, delay = 0, stagger = 3}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {text.split(' ').map((w, i) => {
        const p = interpolate(frame - delay - i * stagger, [0, 12], [0, 1], {...clamp, easing: ease});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              filter: `blur(${(1 - p) * 12}px)`,
              transform: `translateY(${(1 - p) * 24}px)`,
              marginLeft: '0.28em',
            }}
          >
            {w}
          </span>
        );
      })}
    </>
  );
};

const IconBox: React.FC<{children: React.ReactNode; scale: number}> = ({children, scale}) => (
  <div
    style={{
      width: 96,
      height: 96,
      borderRadius: 24,
      background: brand.primary,
      border: `3px solid ${brand.accent}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: `scale(${scale})`,
      boxShadow: shadow,
      margin: '0 auto 22px',
    }}
  >
    {children}
  </div>
);

const ChatIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M9 9h6M9 13h4" />
  </svg>
);

const sfx = (name: string, volume = 0.6) => <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />;

export const Counter: React.FC<{to: number; caption: string}> = ({to, caption}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const countEnd = Math.round(1.4 * fps);
  const n = Math.round(interpolate(frame, [4, countEnd], [1, to], {...clamp, easing: Easing.out(Easing.cubic)}));
  const pop = spring({frame: frame - countEnd, fps, config: {damping: 10, stiffness: 180}});
  const out = interpolate(frame, [3.1 * fps, 3.5 * fps], [1, 0], clamp);
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <div
        style={{
          fontSize: 300,
          fontWeight: 900,
          color: brand.text,
          lineHeight: 1,
          textShadow: shadow,
          transform: `scale(${1 + pop * 0.08 - (frame > countEnd ? 0.08 : 0)})`,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {n}
      </div>
      <div style={{marginTop: 20, opacity: interpolate(frame, [countEnd - 6, countEnd + 6], [0, 1], clamp)}}>
        <Pill style={{fontSize: 56, fontWeight: 800}}>{caption}</Pill>
      </div>
      <Sequence from={0} durationInFrames={45}>{sfx('riser', 0.35)}</Sequence>
      <Sequence from={countEnd}>{sfx('impact', 0.8)}</Sequence>
    </AbsoluteFill>
  );
};

export const Title: React.FC<{text: string; sub?: string}> = ({text, sub}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);
  const bar = interpolate(frame, [10, 30], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle, rgba(10,20,35,0.55) 0%, rgba(10,20,35,0.15) 70%)'}} />
      {sub ? (
        <div style={{fontSize: 48, fontWeight: 700, color: brand.light, marginBottom: 10, textShadow: shadow}}>
          <BlurWords text={sub} />
        </div>
      ) : null}
      <div style={{fontSize: 104, fontWeight: 900, color: brand.text, textAlign: 'center', padding: '0 60px', textShadow: shadow, lineHeight: 1.25}}>
        <BlurWords text={text} delay={10} stagger={4} />
      </div>
      <div style={{height: 8, width: 360 * bar, background: brand.accent, borderRadius: 4, marginTop: 24}} />
      <Sequence from={10}>{sfx('whoosh', 0.45)}</Sequence>
    </AbsoluteFill>
  );
};

// السؤال يطلع كبير وسط الشاشة، بعدين يستقر فوق طول مدة الإجابة
export const Question: React.FC<{text: string; label: string; docked?: boolean}> = ({text, label, docked}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hold = Math.round(3.6 * fps);
  const icon = spring({frame, fps, config: {damping: 12, stiffness: 160}});
  // docked: السؤال يبقى صغير فوق من أول الشوت (للإجابات اللي بعد أول إجابة)
  const dock = docked ? 1 : interpolate(frame, [hold, hold + 20], [0, 1], {...clamp, easing: ease});
  const dim = interpolate(frame, [0, 10], [0, 1], clamp) * (1 - dock);
  const y = interpolate(dock, [0, 1], [0, -560]);
  const scale = interpolate(dock, [0, 1], [1, 0.62]);

  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${brand.primaryDark}aa, ${brand.primaryDark}66)`, opacity: dim}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `translateY(${y}px) scale(${scale})`, width: 960, textAlign: 'center'}}>
          <div style={{opacity: 1 - dock, height: (1 - dock) * 118, overflow: 'visible'}}>
            <IconBox scale={icon}>
              <ChatIcon />
            </IconBox>
          </div>
          <Pill style={{padding: '26px 44px', borderRight: `8px solid ${brand.accent}`}}>
            <div style={{fontSize: 34, fontWeight: 700, color: brand.accent, marginBottom: 4, opacity: 1 - dock * 0.2}}>{label}</div>
            <div style={{fontSize: 66, fontWeight: 800, lineHeight: 1.4}}>
              {docked ? text : <BlurWords text={text} delay={8} />}
            </div>
          </Pill>
        </div>
      </AbsoluteFill>
      {docked ? null : (
        <>
          {sfx('pop', 0.5)}
          <Sequence from={hold}>{sfx('whoosh', 0.25)}</Sequence>
        </>
      )}
    </AbsoluteFill>
  );
};

export const LowerThird: React.FC<{name: string; role?: string}> = ({name, role}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 200}, durationInFrames: 18});
  const outP = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], clamp);
  const p = inP * (1 - outP);
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      <div style={{position: 'absolute', right: 60, bottom: 520, display: 'flex', alignItems: 'stretch', opacity: p}}>
        <div style={{width: 10, background: brand.accent, borderRadius: 5, transform: `scaleY(${p})`, marginLeft: 14}} />
        <Pill style={{clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`, padding: '16px 32px'}}>
          <div style={{fontSize: 46, fontWeight: 800}}>{name}</div>
          {role ? <div style={{fontSize: 32, fontWeight: 600, color: brand.light}}>{role}</div> : null}
        </Pill>
      </div>
    </AbsoluteFill>
  );
};

// الأوترو: الصورة تغمق، الشعار فوق يمين، والنص في النص
export const Outro: React.FC<{text: string; logo: string}> = ({text, logo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dim = interpolate(frame, [0, 20], [0, 1], clamp);
  const logoP = spring({frame: frame - 8, fps, config: {damping: 14}});
  const fadeOut = interpolate(frame, [4.8 * FPS, 5.5 * FPS], [1, 0], clamp);
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', opacity: fadeOut}}>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${brand.primaryDark}cc, ${brand.primaryDark}ee)`, opacity: dim}} />
      <Img
        src={staticFile(logo)}
        style={{position: 'absolute', top: 120, right: 60, width: 200, height: 200, objectFit: 'contain',
          opacity: logoP, transform: `scale(${0.8 + 0.2 * logoP})`}}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 70px'}}>
        <div style={{fontSize: 80, fontWeight: 900, color: brand.text, lineHeight: 1.35}}>
          <BlurWords text={text} delay={14} stagger={4} />
        </div>
        <div style={{height: 8, width: 300 * dim, background: brand.accent, borderRadius: 4, marginTop: 28}} />
        <div style={{marginTop: 28, fontSize: 44, fontWeight: 700, color: brand.light, opacity: interpolate(frame, [40, 55], [0, 1], clamp)}}>
          جمعية المعلمين الكويتية
        </div>
      </AbsoluteFill>
      <Sequence from={8}>{sfx('impact', 0.5)}</Sequence>
    </AbsoluteFill>
  );
};
