import {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand, FPS} from './config';
import {fontFamily, numberFamily} from './font';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const shadow = '0 4px 24px rgba(0,0,0,0.45)';

// كبسولة نص شبه شفافة غامقة — نفس أسلوب الفيديو المرجعي
const Pill: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      background: 'linear-gradient(180deg, rgba(19,62,117,0.72), rgba(9,28,58,0.82))',
      backdropFilter: 'blur(14px)',
      border: `2px solid ${brand.goldDeep}aa`,
      borderRadius: 999,
      padding: '18px 48px',
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

// صوت كتابة كيبورد: ضغطات بإيقاع غير منتظم شوي عشان تطلع طبيعية
const Typing: React.FC<{from: number; frames: number}> = ({from, frames}) => {
  const hits: number[] = [];
  for (let f = 0, i = 0; f < frames; i++) {
    hits.push(from + f);
    f += 2 + ((i * 7) % 3 === 0 ? 1 : 0);
  }
  return (
    <>
      {hits.map((f, i) => (
        <Sequence key={f} from={f} durationInFrames={4}>
          <Audio src={staticFile(`sfx/key${(i * 5 + 3) % 4}.wav`)} volume={0.32 + ((i * 3) % 4) * 0.05} />
        </Sequence>
      ))}
    </>
  );
};

const IconBox: React.FC<{children: React.ReactNode; scale: number}> = ({children, scale}) => (
  <div
    style={{
      width: 96,
      height: 96,
      borderRadius: 24,
      background: brand.navy,
      border: `3px solid ${brand.goldDeep}`,
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

// الفريمات اللي يتغير فيها رقم العداد — صوت تك مع كل رقم
const tickFrames = (from: number, end: number, to: number) => {
  const out: number[] = [];
  let last = 1;
  for (let f = from; f <= end; f++) {
    const n = Math.round(interpolate(f, [from, end], [1, to], {...clamp, easing: Easing.out(Easing.cubic)}));
    if (n !== last) out.push(f);
    last = n;
  }
  return out;
};

// الانترو: «المؤتمر التربوي» يطلع أول، بعدين يرتفع ويطلع تحته عداد بالأرقام الإنجليزية لين 46
export const IntroLockup: React.FC<{to: number; title: string}> = ({to, title}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const countFrom = Math.round(2.9 * fps);
  const countEnd = Math.round(6 * fps);
  const lift = interpolate(frame, [Math.round(2.6 * fps), countFrom + 6], [0, 1], {...clamp, easing: ease});
  const numIn = interpolate(frame, [countFrom, countFrom + 10], [0, 1], clamp);
  const n = Math.round(interpolate(frame, [countFrom, countEnd], [1, to], {...clamp, easing: Easing.out(Easing.cubic)}));
  const pop = spring({frame: frame - countEnd, fps, config: {damping: 9, stiffness: 200}});
  const hit = frame >= countEnd ? 1 + 0.07 * Math.sin(Math.min(1, pop) * Math.PI) : 1;
  const out = interpolate(frame, [durationInFrames - 16, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        fontFamily,
        direction: 'rtl',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - out,
        filter: `blur(${out * 16}px)`,
      }}
    >
      <div style={{transform: `translateY(${-200 * lift}px) scale(${1 - 0.25 * lift})`, fontSize: 118, fontWeight: 900, color: brand.text, textShadow: shadow}}>
        <BlurWords text={title} delay={8} stagger={6} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          marginTop: -10,
          fontFamily: numberFamily,
          fontSize: 340,
          fontWeight: 900,
          color: brand.text,
          lineHeight: 1,
          textShadow: shadow,
          opacity: numIn,
          filter: `blur(${(1 - numIn) * 14}px)`,
          transform: `scale(${hit})`,
          fontVariantNumeric: 'lining-nums tabular-nums',
          direction: 'ltr',
        }}
      >
        {n}
      </div>
      <Sequence from={8}>{sfx('whoosh', 0.4)}</Sequence>
      <Sequence from={countFrom} durationInFrames={countEnd - countFrom + 4}>{sfx('cinematic-riser', 0.25)}</Sequence>
      {tickFrames(countFrom, countEnd, to).map((f) => (
        <Sequence key={f} from={f} durationInFrames={4}>
          {sfx('tick', 0.55)}
        </Sequence>
      ))}
      <Sequence from={countEnd}>{sfx('cinematic-boom', 0.7)}</Sequence>
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
      {sub ? (
        <div style={{fontSize: 48, fontWeight: 700, color: brand.gold, marginBottom: 10, textShadow: shadow}}>
          <BlurWords text={sub} />
        </div>
      ) : null}
      <div style={{fontSize: 104, fontWeight: 900, color: brand.text, textAlign: 'center', padding: '0 60px', textShadow: shadow, lineHeight: 1.25}}>
        <BlurWords text={text} delay={10} stagger={4} />
      </div>
      <div style={{height: 8, width: 360 * bar, background: brand.bar, borderRadius: 4, marginTop: 24}} />
      <Sequence from={10}>{sfx('whoosh', 0.45)}</Sequence>
    </AbsoluteFill>
  );
};

// نص بسطر واحد يصغر تلقائياً لين يدخل في العرض المتاح (يقيس بعد ما يتحمل الخط)
const FitLine: React.FC<{children: React.ReactNode; maxWidth: number; fontSize: number}> = ({children, maxWidth, fontSize}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [handle] = useState(() => delayRender('fit-line'));
  useLayoutEffect(() => {
    document.fonts.ready.then(() => {
      const w = ref.current?.scrollWidth ?? maxWidth;
      setScale(Math.min(1, maxWidth / w));
      continueRender(handle);
    });
  }, [handle, maxWidth]);
  return (
    <div style={{width: maxWidth, display: 'flex', justifyContent: 'center'}}>
      <div ref={ref} style={{whiteSpace: 'nowrap', fontSize, transform: `scale(${scale})`, transformOrigin: 'center'}}>
        {children}
      </div>
    </div>
  );
};

const BAR_WIDTH = 1010;

// شريط السؤال: مستطيل عريض والسؤال بسطر واحد، وعنوانه في تبويب ذهبي فوقه
const QuestionBar: React.FC<{text: string; label: string; typing: boolean}> = ({text, label, typing}) => (
  <div style={{width: BAR_WIDTH, position: 'relative'}}>
    <div
      style={{
        position: 'absolute',
        top: -44,
        right: 26,
        padding: '4px 22px 6px',
        borderRadius: '14px 14px 0 0',
        background: brand.navy,
        border: `2px solid ${brand.goldDeep}aa`,
        borderBottom: 'none',
        color: brand.gold,
        fontSize: 26,
        fontWeight: 800,
      }}
    >
      {label}
    </div>
    <Pill style={{borderRadius: 22, padding: '20px 30px', display: 'flex', justifyContent: 'center'}}>
      <div style={{fontWeight: 800, lineHeight: 1.3}}>
        <FitLine maxWidth={BAR_WIDTH - 64} fontSize={50}>
          {typing ? <BlurWords text={text} delay={8} /> : text}
        </FitLine>
      </div>
    </Pill>
  </div>
);

// السؤال: full يطلع كبير في النص ثم ينزل ويتحول لشريط سطر واحد،
// docked شريط ثابت، inline الشريط يطلع من تحت. كل حركة لفوق لها صوت صاعد، ولتحت صوت نازل.
export const Question: React.FC<{
  text: string;
  label: string;
  mode: 'full' | 'docked' | 'inline';
  y: number;
  hide?: [number, number];
  exitAt?: number;
}> = ({text, label, mode, y: barY, hide, exitAt}) => {
  const frame = useCurrentFrame();
  const {fps, height} = useVideoConfig();
  const hold = Math.round(3.6 * fps);
  const icon = spring({frame, fps, config: {damping: 12, stiffness: 160}});
  const move = (from: number) => interpolate(frame, [from, from + 16], [0, 1], {...clamp, easing: ease});

  // full: الكرت الكبير ينزل ويختفي والشريط يطلع مكانه
  const toBar = mode === 'full' ? move(hold) : 1;
  const rise = mode === 'inline' ? 1 - interpolate(frame, [0, 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}) : 0;
  const hideF = hide ? hide.map((t) => Math.round(t * fps)) : null;
  const exitF = exitAt !== undefined ? Math.round(exitAt * fps) : null;
  const down = Math.max(
    hideF ? move(hideF[0]) * (1 - move(hideF[1])) : 0,
    exitF !== null ? move(exitF) : 0,
    rise,
  );
  const barOffset = (1 - toBar) * 120 + down * 260;

  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      {mode === 'full' && toBar < 1 ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - toBar}}>
          <div
            style={{
              transform: `translateY(${toBar * (barY - height / 2)}px) scale(${1 - 0.35 * toBar})`,
              width: 960,
              textAlign: 'center',
            }}
          >
            <IconBox scale={icon}>
              <ChatIcon />
            </IconBox>
            <Pill style={{padding: '28px 48px', borderRadius: 40}}>
              <div style={{fontSize: 40, fontWeight: 800, color: brand.gold, marginBottom: 6}}>{label}</div>
              <div style={{fontSize: 66, fontWeight: 800, lineHeight: 1.4}}>
                <BlurWords text={text} delay={8} />
              </div>
            </Pill>
          </div>
        </AbsoluteFill>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: (1080 - BAR_WIDTH) / 2,
          top: barY - 50,
          transform: `translateY(${barOffset}px)`,
          opacity: toBar * (1 - down),
        }}
      >
        <QuestionBar text={text} label={label} typing={mode === 'inline'} />
      </div>
      {mode !== 'docked' ? <Typing from={8} frames={text.split(' ').length * 3 + 10} /> : null}
      {mode === 'full' ? sfx('pop', 0.5) : null}
      {mode === 'full' ? <Sequence from={hold - 2}>{sfx('swoosh-down', 0.55)}</Sequence> : null}
      {mode === 'inline' ? sfx('swoosh-up', 0.55) : null}
      {hideF ? <Sequence from={hideF[0] - 2}>{sfx('swoosh-down', 0.5)}</Sequence> : null}
      {hideF ? <Sequence from={hideF[1] - 2}>{sfx('swoosh-up', 0.5)}</Sequence> : null}
      {exitF !== null ? <Sequence from={exitF - 2}>{sfx('swoosh-down', 0.5)}</Sequence> : null}
    </AbsoluteFill>
  );
};

export const LowerThird: React.FC<{name: string; role?: string; bottom: number}> = ({name, role, bottom}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 200}, durationInFrames: 18});
  const outP = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], clamp);
  const p = inP * (1 - outP);
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      <div style={{position: 'absolute', right: 60, bottom, display: 'flex', alignItems: 'stretch', opacity: p}}>
        <div style={{width: 10, background: brand.goldDeep, borderRadius: 5, transform: `scaleY(${p})`, marginLeft: 14}} />
        <Pill style={{clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`, padding: '16px 40px', borderRadius: 24}}>
          <div style={{fontSize: 46, fontWeight: 800}}>{name}</div>
          {role ? <div style={{fontSize: 32, fontWeight: 600, color: brand.gold}}>{role}</div> : null}
        </Pill>
      </div>
    </AbsoluteFill>
  );
};

// الأوترو السينمائي: الدرون يقرب ببطء مع تدرج لوني وتعتيم أطراف،
// بعدين الخلفية تضبب وتغمق والشعار يدخل في نص الشاشة بتلاشي ولمعة
export const Outro: React.FC<{logo?: string}> = ({logo}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const logoAt = Math.round(3 * fps);
  const t = frame - logoAt;
  const logoIn = interpolate(t, [0, 36], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const depth = interpolate(t, [-10, 30], [0, 1], {...clamp, easing: ease});
  const shine = interpolate(t, [34, 64], [-60, 160], clamp);
  const glow = interpolate(t, [10, 50], [0, 1], clamp);
  const black = interpolate(frame, [durationInFrames - 1.2 * FPS, durationInFrames], [0, 1], clamp);
  return (
    <AbsoluteFill>
      {/* تعتيم الأطراف + تغميق الخلفية لما يدخل الشعار */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.65) 100%)'}} />
      <AbsoluteFill style={{background: 'rgba(5,12,25,1)', opacity: depth * 0.45}} />
      {logo ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              position: 'absolute',
              width: 700,
              height: 700,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${brand.goldDeep}55 0%, ${brand.goldDeep}00 65%)`,
              opacity: glow,
            }}
          />
          <div
            style={{
              position: 'relative',
              width: 360,
              opacity: logoIn,
              filter: `blur(${(1 - logoIn) * 18}px) drop-shadow(0 10px 40px rgba(0,0,0,0.6))`,
              transform: `scale(${1.18 - 0.18 * logoIn})`,
              WebkitMaskImage: 'linear-gradient(#000, #000)',
            }}
          >
            <Img src={staticFile(logo)} style={{width: '100%', display: 'block'}} />
            {/* لمعة تمر على الشعار */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(105deg, transparent ${shine - 20}%, rgba(255,255,255,0.55) ${shine}%, transparent ${shine + 20}%)`,
                mixBlendMode: 'overlay',
                WebkitMaskImage: `url(${staticFile(logo)})`,
                WebkitMaskSize: '100% 100%',
              }}
            />
          </div>
        </AbsoluteFill>
      ) : null}
      {logo ? (
        <>
          <Sequence from={logoAt - 66} durationInFrames={70}>{sfx('cinematic-riser', 0.45)}</Sequence>
          <Sequence from={logoAt - 8}>{sfx('whoosh', 0.7)}</Sequence>
          <Sequence from={logoAt}>{sfx('cinematic-boom', 0.9)}</Sequence>
          <Sequence from={logoAt + 34}>{sfx('shimmer', 0.35)}</Sequence>
        </>
      ) : null}
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};
