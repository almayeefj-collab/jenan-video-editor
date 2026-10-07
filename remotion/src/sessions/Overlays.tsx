import {AbsoluteFill, Easing, interpolate, interpolateColors, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
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

// عمود أرقام يلف مثل عداد السيارة (odometer): pos = رقم عشري، يتحرك عمودياً بنعومة
const RollDigit: React.FC<{pos: number; h: number}> = ({pos, h}) => (
  <div style={{height: h, overflow: 'hidden', display: 'inline-block'}}>
    <div style={{transform: `translateY(${-pos * h}px)`}}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
        <div key={i} style={{height: h, lineHeight: `${h}px`, textAlign: 'center'}}>
          {d}
        </div>
      ))}
    </div>
  </div>
);

// الانترو: «الورش التدريبية في المؤتمر التربوي» يُكتب، بعدين يرتفع ويطلع «قرص النسخ»:
// 46 شرطة حول دائرة تنور وحدة وحدة (كل شرطة = نسخة من المؤتمر) والرقم في النص يلف مثل العداد.
// أول ما يوصل 46 يتحول كل شي للذهبي مع موجة ضوء تنتشر ولمعة
export const Intro: React.FC<{title: string; to: number}> = ({title, to}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const words = title.split(' ');
  const line1 = words.slice(0, 2).join(' ');
  const line2 = words.slice(2).join(' ');
  const liftAt = Math.round(2.5 * fps);
  const dialIn = Math.round(2.8 * fps);
  const countFrom = Math.round(3.1 * fps);
  const countEnd = Math.round(5.6 * fps);
  const lift = interpolate(frame, [liftAt, dialIn + 8], [0, 1], {...clamp, easing: ease});
  const dial = spring({frame: frame - dialIn, fps, config: {damping: 16, stiffness: 120}});
  const v = interpolate(frame, [countFrom, countEnd], [0, to], {...clamp, easing: Easing.bezier(0.3, 0, 0.25, 1)});
  const done = interpolate(frame, [countEnd, countEnd + 10], [0, 1], clamp);
  const gold = (c: string) => interpolateColors(done, [0, 1], [c, brand.goldDeep]);
  const pop = spring({frame: frame - countEnd, fps, config: {damping: 8, stiffness: 180}});
  const hit = frame >= countEnd ? 1 + 0.08 * Math.sin(Math.min(1, pop) * Math.PI) : 1;
  const wave = interpolate(frame, [countEnd, countEnd + 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const labelP = interpolate(frame, [countEnd + 8, countEnd + 22], [0, 1], {...clamp, easing: ease});
  const out = interpolate(frame, [durationInFrames - 16, durationInFrames], [0, 1], clamp);
  const typeFrames = words.length * 4 + 12;

  const R = 250;
  const SIZE = 2 * R + 80;
  const ones = v % 10;
  const tens = Math.floor(v / 10) + Math.max(0, ones - 9);
  const DIGIT_H = 230;

  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', justifyContent: 'center', opacity: 1 - out, filter: `blur(${out * 16}px)`}}>
      <div style={{position: 'absolute', top: 760, textAlign: 'center', transform: `translateY(${-470 * lift}px) scale(${1 - 0.25 * lift})`, textShadow: shadow}}>
        <div style={{fontSize: 120, fontWeight: 900, color: brand.text, lineHeight: 1.2}}>
          <BlurWords text={line1} delay={6} stagger={4} />
        </div>
        <div style={{fontSize: 84, fontWeight: 800, color: brand.gold, lineHeight: 1.3}}>
          <BlurWords text={line2} delay={6 + 2 * 4} stagger={4} />
        </div>
      </div>

      {/* قرص النسخ */}
      <div style={{position: 'absolute', top: 620, width: SIZE, height: SIZE, opacity: Math.min(1, dial), transform: `scale(${(0.6 + 0.4 * Math.min(1, dial)) * hit})`}}>
        {/* قرص غامق ورا الأرقام عشان تنقرا فوق أي لقطة */}
        <div style={{position: 'absolute', inset: 30, borderRadius: '50%', background: 'radial-gradient(circle, rgba(9,28,58,0.82) 0%, rgba(9,28,58,0.6) 68%, rgba(9,28,58,0) 72%)'}} />
        {/* موجة الضوء عند الوصول لـ 46 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `6px solid ${brand.goldDeep}`,
            transform: `scale(${1 + wave * 0.9})`,
            opacity: frame >= countEnd ? 1 - wave : 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: -80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${brand.goldDeep}66 0%, ${brand.goldDeep}00 62%)`,
            opacity: done,
          }}
        />
        <svg width={SIZE} height={SIZE} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: to}, (_, i) => {
            const a = (i / to) * 2 * Math.PI - Math.PI / 2;
            const lit = interpolate(v, [i, i + 1], [0, 1], clamp);
            const r1 = R - 26;
            const r2 = R + 6 + lit * 14;
            const cx = SIZE / 2;
            return (
              <line
                key={i}
                x1={cx + r1 * Math.cos(a)}
                y1={cx + r1 * Math.sin(a)}
                x2={cx + r2 * Math.cos(a)}
                y2={cx + r2 * Math.sin(a)}
                stroke={lit > 0 ? gold('#FFFFFF') : 'rgba(255,255,255,0.18)'}
                strokeOpacity={0.25 + 0.75 * lit}
                strokeWidth={9}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        {/* الرقم يلف مثل العداد */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            direction: 'ltr',
            fontFamily: numberFamily,
            fontSize: 220,
            fontWeight: 900,
            color: gold('#FFFFFF'),
            textShadow: done > 0 ? `0 0 ${40 * done}px ${brand.goldDeep}aa, ${shadow}` : shadow,
            fontVariantNumeric: 'lining-nums tabular-nums',
          }}
        >
          <div style={{opacity: interpolate(v, [9, 10], [0, 1], clamp), width: interpolate(v, [9, 10], [0, 140], clamp), overflow: 'hidden', display: 'flex', justifyContent: 'flex-end'}}>
            <RollDigit pos={tens} h={DIGIT_H} />
          </div>
          <RollDigit pos={ones} h={DIGIT_H} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 620 + SIZE + 40,
          fontSize: 58,
          fontWeight: 800,
          color: brand.gold,
          opacity: labelP,
          transform: `translateY(${(1 - labelP) * 30}px)`,
          textShadow: shadow,
        }}
      >
        النسخة السادسة والأربعون
      </div>

      <Typing from={6} frames={typeFrames} />
      <Sequence from={liftAt - 4}>{sfx('swoosh-up', 0.35)}</Sequence>
      <Sequence from={countFrom} durationInFrames={countEnd - countFrom + 4}>{sfx('cinematic-riser', 0.22)}</Sequence>
      {tickFrames(countFrom, countEnd, to).map((f) => (
        <Sequence key={f} from={f} durationInFrames={4}>
          {sfx('tick', 0.45)}
        </Sequence>
      ))}
      <Sequence from={countEnd}>{sfx('cinematic-boom', 0.55)}</Sequence>
      <Sequence from={countEnd + 4}>{sfx('shimmer', 0.4)}</Sequence>
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

// مربع اليوم: «اليوم الأول» + اسم اليوم + التاريخ بعداد داخل حلقة تمتلي + نقاط الأيام الثلاثة
export const DayCard: React.FC<{index: number; label: string; weekday: string; date: number; month: string; total: number}> = ({
  index,
  label,
  weekday,
  date,
  month,
  total,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 14, stiffness: 140}});
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {...clamp, easing: ease});
  const COUNT_FROM = 10;
  const COUNT = 22;
  const n = Math.round(interpolate(frame, [COUNT_FROM, COUNT_FROM + COUNT], [1, date], {...clamp, easing: Easing.out(Easing.cubic)}));
  const ring = interpolate(frame, [COUNT_FROM, COUNT_FROM + COUNT + 8], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const R = 130;
  return (
    <AbsoluteFill style={{fontFamily, direction: 'rtl', alignItems: 'center', justifyContent: 'center'}}>
      <Scrim opacity={interpolate(frame, [0, 10], [0, 1], clamp) * (1 - out)} from="center" />
      <div
        style={{
          width: 680,
          padding: '40px 30px 36px',
          borderRadius: 44,
          background: 'linear-gradient(180deg, rgba(19,62,117,0.82), rgba(9,28,58,0.9))',
          border: `2px solid ${brand.goldDeep}aa`,
          boxShadow: shadow,
          textAlign: 'center',
          opacity: Math.min(1, p) * (1 - out),
          transform: `translateY(${(1 - p) * 140 + out * 60}px) scale(${0.85 + 0.15 * Math.min(1, p)})`,
        }}
      >
        <Pill style={{display: 'inline-block', padding: '6px 34px', fontSize: 38, fontWeight: 800, color: brand.navyDark, background: brand.gold, border: 'none'}}>
          {label}
        </Pill>
        <div style={{fontSize: 104, fontWeight: 900, color: brand.text, lineHeight: 1.25, marginTop: 10}}>
          <BlurWords text={weekday} delay={6} />
        </div>
        <div style={{position: 'relative', width: 2 * R + 30, height: 2 * R + 30, margin: '10px auto 8px'}}>
          <svg width={2 * R + 30} height={2 * R + 30} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
            <circle cx={R + 15} cy={R + 15} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
            <circle
              cx={R + 15}
              cy={R + 15}
              r={R}
              fill="none"
              stroke={brand.goldDeep}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * R}
              strokeDashoffset={(1 - ring) * 2 * Math.PI * R}
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
              fontSize: 170,
              fontWeight: 900,
              color: brand.text,
              direction: 'ltr',
              fontVariantNumeric: 'lining-nums tabular-nums',
            }}
          >
            {n}
          </div>
        </div>
        <div style={{fontSize: 56, fontWeight: 800, color: brand.gold}}>{month}</div>
        {/* نقاط الأيام: اليوم الحالي ذهبي وأعرض */}
        <div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 22}}>
          {Array.from({length: total}, (_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 54 : 16,
                height: 16,
                borderRadius: 8,
                background: i === index ? brand.goldDeep : 'rgba(255,255,255,0.35)',
              }}
            />
          ))}
        </div>
      </div>
      {sfx('whoosh', 0.3)}
      <Sequence from={4}>{sfx('pop', 0.4)}</Sequence>
      {tickFrames(COUNT_FROM, COUNT_FROM + COUNT, date).map((f) => (
        <Sequence key={f} from={f} durationInFrames={4}>
          {sfx('tick', 0.45)}
        </Sequence>
      ))}
      <Sequence from={COUNT_FROM + COUNT + 2}>{sfx('shimmer', 0.3)}</Sequence>
      <Sequence from={durationInFrames - 14}>{sfx('swoosh-down', 0.3)}</Sequence>
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
