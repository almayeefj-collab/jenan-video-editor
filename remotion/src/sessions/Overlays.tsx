import {AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../reel/config';
import {fontFamily, numberFamily} from '../reel/font';
import {BlurWords, Pill, sfx, tickFrames, Typing} from '../reel/Overlays';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const shadow = '0 4px 24px rgba(0,0,0,0.45)';
const typingFrames = (text: string) => text.split(' ').length * 3 + 10;

// تعتيم ناعم تحت النصوص عشان تنقرا فوق أي لقطة
const Scrim: React.FC<{opacity: number; from?: 'bottom' | 'center'}> = ({opacity, from = 'bottom'}) => (
  <AbsoluteFill
    style={{
      opacity,
      background:
        from === 'bottom'
          ? 'linear-gradient(180deg, rgba(5,12,25,0) 45%, rgba(5,12,25,0.78) 100%)'
          : 'radial-gradient(ellipse at center, rgba(5,12,25,0.62) 0%, rgba(5,12,25,0.25) 70%)',
    }}
  />
);

// العنوان الرئيسي: يُكتب كلمة كلمة بالنص مع صوت كيبورد وخط ذهبي يمتد تحته
export const MainTitle: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const inP = interpolate(frame, [0, 14], [0, 1], clamp);
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], clamp);
  const bar = interpolate(frame, [typingFrames(text), typingFrames(text) + 18], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', justifyContent: 'center'}}>
      <Scrim opacity={inP * (1 - out)} from="center" />
      <div style={{opacity: 1 - out, filter: `blur(${out * 12}px)`, transform: `scale(${1 + out * 0.06})`, textAlign: 'center'}}>
        <div style={{fontSize: 108, fontWeight: 900, color: brand.text, lineHeight: 1.25, padding: '0 70px', textShadow: shadow}}>
          <BlurWords text={text} delay={6} stagger={4} />
        </div>
        <div style={{height: 8, width: 420 * bar, background: brand.bar, borderRadius: 4, margin: '28px auto 0'}} />
      </div>
      <Typing from={6} frames={typingFrames(text)} />
      {sfx('shimmer', 0.25)}
    </AbsoluteFill>
  );
};

// كبسولة الجلسة: النوع فوق بكبسولة ذهبية صغيرة، والعنوان يُكتب، والاسم تحته
export const SessionTag: React.FC<{label: string; title: string; sub?: string}> = ({label, title, sub}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 200}, durationInFrames: 20});
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {...clamp, easing: ease});
  const subAt = typingFrames(title) + 4;
  const subP = interpolate(frame, [subAt, subAt + 14], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      <Scrim opacity={inP * (1 - out)} />
      <div
        style={{
          position: 'absolute',
          left: 50,
          right: 50,
          bottom: 330,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 16,
          opacity: inP * (1 - out),
          transform: `translateY(${(1 - inP) * 80 + out * 60}px)`,
        }}
      >
        <Pill style={{padding: '6px 30px', fontSize: 34, fontWeight: 800, color: brand.navyDark, background: brand.gold, border: 'none'}}>
          {label}
        </Pill>
        <div style={{fontSize: 78, fontWeight: 900, color: brand.text, lineHeight: 1.3, textShadow: shadow}}>
          <BlurWords text={title} delay={8} stagger={3} />
        </div>
        {sub ? (
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: brand.gold,
              opacity: subP,
              transform: `translateX(${(1 - subP) * -30}px)`,
              borderRight: `6px solid ${brand.goldDeep}`,
              paddingRight: 18,
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
      {sfx('swoosh-up', 0.35)}
      <Typing from={8} frames={typingFrames(title)} />
      <Sequence from={durationInFrames - 14}>{sfx('swoosh-down', 0.3)}</Sequence>
    </AbsoluteFill>
  );
};

// شريط صغير باسم الجلسة أثناء كلام المحاضر
export const Caption: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 200}, durationInFrames: 16});
  const out = interpolate(frame, [durationInFrames - 20, durationInFrames - 8], [0, 1], clamp);
  const p = inP * (1 - out);
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      <div style={{position: 'absolute', right: 50, bottom: 300, display: 'flex', alignItems: 'stretch', opacity: p}}>
        <div style={{width: 8, background: brand.goldDeep, borderRadius: 4, transform: `scaleY(${p})`, marginLeft: 12}} />
        <Pill style={{clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`, padding: '12px 32px', borderRadius: 18, fontSize: 38, fontWeight: 800}}>
          {text}
        </Pill>
      </div>
    </AbsoluteFill>
  );
};

// انفوجرافيك: كروت أرقام تطلع وحدة ورا الثانية، والعداد يعد مع صوت تك
export const Stats: React.FC<{items: {value: number; prefix?: string; unit: string; label: string}[]}> = ({items}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {...clamp, easing: ease});
  const STAGGER = 14;
  const COUNT = 30;
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', justifyContent: 'center'}}>
      <Scrim opacity={interpolate(frame, [0, 12], [0, 1], clamp) * (1 - out)} from="center" />
      <div style={{display: 'flex', gap: 36, opacity: 1 - out, transform: `translateY(${out * 50}px)`}}>
        {items.map((it, i) => {
          const at = i * STAGGER;
          const p = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 140}});
          const n = Math.round(interpolate(frame, [at + 6, at + 6 + COUNT], [0, it.value], {...clamp, easing: Easing.out(Easing.cubic)}));
          const ring = interpolate(frame, [at + 6, at + 6 + COUNT], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <div
              key={i}
              style={{
                width: 430,
                padding: '34px 20px 30px',
                borderRadius: 36,
                background: 'linear-gradient(180deg, rgba(19,62,117,0.78), rgba(9,28,58,0.88))',
                border: `2px solid ${brand.goldDeep}aa`,
                boxShadow: shadow,
                textAlign: 'center',
                opacity: Math.min(1, p),
                transform: `translateY(${(1 - p) * 120}px) scale(${0.85 + 0.15 * Math.min(1, p)})`,
              }}
            >
              {/* حلقة تقدم تمتلي مع العداد */}
              <div style={{position: 'relative', width: 230, height: 230, margin: '0 auto 18px'}}>
                <svg width="230" height="230" viewBox="0 0 230 230" style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
                  <circle cx="115" cy="115" r="100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
                  <circle
                    cx="115"
                    cy="115"
                    r="100"
                    fill="none"
                    stroke={brand.goldDeep}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 100}
                    strokeDashoffset={(1 - ring) * 2 * Math.PI * 100}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: numberFamily,
                    fontSize: 120,
                    fontWeight: 900,
                    color: brand.text,
                    direction: 'ltr',
                    fontVariantNumeric: 'lining-nums tabular-nums',
                  }}
                >
                  {it.prefix ?? ''}
                  {n}
                </div>
              </div>
              {it.unit ? <div style={{fontSize: 48, fontWeight: 900, color: brand.gold, lineHeight: 1.2}}>{it.unit}</div> : null}
              <div style={{fontSize: 30, fontWeight: 700, color: brand.text, opacity: 0.9, marginTop: 6}}>{it.label}</div>
            </div>
          );
        })}
      </div>
      {items.map((it, i) => (
        <Sequence key={`pop${i}`} from={i * STAGGER}>
          {sfx('pop', 0.35)}
        </Sequence>
      ))}
      {items.map((it, i) =>
        tickFrames(i * STAGGER + 6, i * STAGGER + 6 + COUNT, it.value).map((f) => (
          <Sequence key={`t${i}-${f}`} from={f} durationInFrames={4}>
            {sfx('tick', 0.35)}
          </Sequence>
        )),
      )}
      <Sequence from={durationInFrames - 14}>{sfx('swoosh-down', 0.3)}</Sequence>
    </AbsoluteFill>
  );
};
