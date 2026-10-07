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

// الانترو الرسمي: خط بيج يمتد من النص، والعنوان يطلع من ورا الخط (قناع)،
// تحته «المؤتمر التربوي السادس والأربعون» ينزل من الخط، بعدين التاريخ، ولمعة ضوء تمر على العنوان
export const Intro: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const words = title.split(' ');
  const line1 = words.length > 2 ? words.slice(0, 2).join(' ') : '';
  const line2 = words.length > 2 ? words.slice(2).join(' ') : title;
  const e = (from: number, len: number) => interpolate(frame, [from, from + len], [0, 1], {...clamp, easing: ease});
  const lineP = e(4, 22);
  const kickerP = e(14, 18);
  const titleP = e(22, 22);
  const subP = e(40, 20);
  const dateP = e(62, 18);
  const sweep = interpolate(frame, [78, 118], [-30, 130], clamp);
  const push = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  const out = interpolate(frame, [durationInFrames - 16, durationInFrames], [0, 1], clamp);
  const LINE_W = 720;
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', justifyContent: 'center', opacity: 1 - out, filter: `blur(${out * 14}px)`}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${push})`, textShadow: shadow}}>
        {line1 ? (
          <div style={{fontSize: 72, fontWeight: 700, color: brand.gold, letterSpacing: 2, opacity: kickerP, transform: `translateY(${(1 - kickerP) * 20}px)`, marginBottom: 4}}>
            {line1}
          </div>
        ) : null}
        {/* العنوان يطلع من ورا الخط */}
        <div style={{overflow: 'hidden', padding: '0 20px'}}>
          <div style={{transform: `translateY(${(1 - titleP) * 110}%)`, position: 'relative'}}>
            <div style={{fontSize: 132, fontWeight: 900, color: brand.text, lineHeight: 1.3, whiteSpace: 'nowrap'}}>{line2}</div>
            {/* لمعة الضوء */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                fontSize: 132,
                fontWeight: 900,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                color: 'transparent',
                backgroundImage: `linear-gradient(100deg, transparent ${sweep - 14}%, rgba(255,240,210,0.95) ${sweep}%, transparent ${sweep + 14}%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                textShadow: 'none',
              }}
            >
              {line2}
            </div>
          </div>
        </div>
        {/* الخط البيج مع نقطتين بالأطراف */}
        <div style={{position: 'relative', width: LINE_W, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '6px 0'}}>
          <div style={{width: LINE_W * lineP, height: 5, borderRadius: 3, boxShadow: `0 0 18px ${brand.gold}88`, background: `linear-gradient(90deg, ${brand.gold}00, ${brand.gold} 18%, ${brand.gold} 82%, ${brand.gold}00)`}} />
          {[-1, 1].map((d) => (
            <div
              key={d}
              style={{
                position: 'absolute',
                left: '50%',
                width: 16,
                height: 16,
                background: brand.gold,
                transform: `translateX(${d * (LINE_W / 2) * lineP - 8}px) rotate(45deg)`,
                boxShadow: `0 0 12px ${brand.gold}`,
                opacity: lineP,
              }}
            />
          ))}
        </div>
        {/* «المؤتمر التربوي السادس والأربعون» ينزل من الخط */}
        <div style={{overflow: 'hidden'}}>
          <div style={{fontSize: 54, fontWeight: 800, color: brand.text, transform: `translateY(${-(1 - subP) * 110}%)`, lineHeight: 1.4}}>
            المؤتمر التربوي السادس والأربعون
          </div>
        </div>
        <div style={{fontSize: 38, fontWeight: 700, color: brand.gold, letterSpacing: 6 * dateP, opacity: dateP, marginTop: 8}}>
          ٤ – ٦ أكتوبر 2026
        </div>
      </div>
      <Sequence from={2}>{sfx('whoosh', 0.3)}</Sequence>
      <Sequence from={20}>{sfx('swoosh-up', 0.35)}</Sequence>
      <Sequence from={40}>{sfx('swoosh-down', 0.25)}</Sequence>
      <Sequence from={80}>{sfx('shimmer', 0.4)}</Sequence>
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
        <div style={{fontSize: title.length > 40 ? 62 : 78, fontWeight: 900, color: brand.text, lineHeight: 1.3, textShadow: shadow}}>
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


// كرت المشاركين في الحلقة النقاشية: كل اسم يدخل ورا الثاني مع منصبه تحته
export const PanelCard: React.FC<{heading: string; members: {name: string; role: string}[]}> = ({heading, members}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 200}, durationInFrames: 18});
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames - 2], [0, 1], {...clamp, easing: ease});
  const STAGGER = 12;
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl'}}>
      <Scrim opacity={inP * (1 - out)} />
      <div
        style={{
          position: 'absolute',
          left: 50,
          right: 50,
          bottom: 250,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 18,
          opacity: 1 - out,
          transform: `translateY(${out * 60}px)`,
        }}
      >
        <Pill style={{padding: '6px 30px', fontSize: 32, fontWeight: 800, color: brand.navyDark, background: brand.gold, border: 'none', opacity: inP}}>
          {heading}
        </Pill>
        {members.map((m, i) => {
          const p = spring({frame: frame - 6 - i * STAGGER, fps, config: {damping: 200}, durationInFrames: 18});
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                opacity: p,
                transform: `translateX(${(1 - p) * 70}px)`,
              }}
            >
              <div style={{width: 8, background: brand.goldDeep, borderRadius: 4, marginLeft: 16, transform: `scaleY(${p})`}} />
              <div>
                <div style={{fontSize: 44, fontWeight: 900, color: brand.text, lineHeight: 1.25, textShadow: shadow}}>{m.name}</div>
                <div style={{fontSize: 28, fontWeight: 700, color: brand.gold, lineHeight: 1.35, textShadow: shadow, maxWidth: 940}}>{m.role}</div>
              </div>
            </div>
          );
        })}
      </div>
      {sfx('swoosh-up', 0.3)}
      {members.map((_, i) => (
        <Sequence key={i} from={6 + i * STAGGER}>
          {sfx('pop', 0.25)}
        </Sequence>
      ))}
      <Sequence from={durationInFrames - 16}>{sfx('swoosh-down', 0.25)}</Sequence>
    </AbsoluteFill>
  );
};
