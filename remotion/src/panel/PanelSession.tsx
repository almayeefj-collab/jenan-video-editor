// الجلسة الحوارية «الصحة النفسية بين الانهيار والتكيف» — مؤتمر الكويت الدولي للتدريب والتطوير
// الفيديو الأصلي ~49 دقيقة مقسوم لأجزاء كل ~3 دقائق (القطع على سكتة بين الجمل).
// Remotion يرندر بس: بطاقة بداية كل جزء + بطاقة الختام + صور PNG شفافة (سؤال المحاورة، اسم المتحدث، شارة الجلسة)
// وبعدين ffmpeg يركّبها فوق الفيديو الأصلي (tools/panel_parts.py) — أسرع بكثير من رندر 49 دقيقة كاملة هنا.
// صورة الخلفية لكل جزء في public/footage/panel/ (ما ترفع للمستودع).
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';

export const FPS = 25;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const INTRO_FRAMES = Math.round(3.5 * FPS);
export const OUTRO_FRAMES = Math.round(6 * FPS);

const NAVY = '#0D1A3A';
const GOLD = '#D4AF6A';
const CREAM = '#F5EBD7';
const INK = '#070B18';
const shadow = '0 4px 30px rgba(0,0,0,0.8)';

export const SESSION = {
  kicker: 'الجلسة الحوارية',
  title: 'الصحة النفسية بين الانهيار والتكيف',
  event: 'مؤتمر الكويت الدولي للتدريب والتطوير',
};

export const PEOPLE = {
  host: {name: 'أ. إلهام دكسن', role: 'محاورة الجلسة'},
  jaza: {name: 'د. أحمد جزا المطيري', role: 'رئيس جمعية علم النفس الكويتية'},
  hakami: {name: 'د. إبراهيم الحكمي', role: 'رئيس جمعية علم النفس — الشرق الأوسط'},
} as const;
export type Who = keyof typeof PEOPLE;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const arabicDigits = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

const useReveal = (delay: number, dur = 20) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 10}px)`, transform: `translateY(${(1 - p) * 26}px)`};
};

const Dust: React.FC<{seed: string}> = ({seed}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({length: 22}).map((_, i) => {
        const x = random(`${seed}x${i}`) * WIDTH;
        const y0 = random(`${seed}y${i}`) * HEIGHT;
        const r = 3 + random(`${seed}r${i}`) * 12;
        const y = ((y0 - frame * (0.3 + random(`${seed}s${i}`) * 0.7)) % HEIGHT + HEIGHT) % HEIGHT;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${GOLD}bb 0%, transparent 70%)`, opacity: 0.3 + 0.3 * Math.sin(frame / (12 + i) + i)}} />
        );
      })}
    </AbsoluteFill>
  );
};

const Rule: React.FC<{width: number; delay: number}> = ({width, delay}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '26px auto'}}>
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to left, ${GOLD}, transparent)`}} />
      <div style={{width: 12, height: 12, transform: `rotate(45deg) scale(${p})`, border: `2px solid ${GOLD}`}} />
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to right, ${GOLD}, transparent)`}} />
    </div>
  );
};

const Backdrop: React.FC<{bg: string; frames: number}> = ({bg, frames}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, frames], [1.12, 1.2]);
  return (
    <>
      <AbsoluteFill style={{transform: `scale(${scale})`}}>
        <Img src={staticFile(bg)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(18px) brightness(0.38) saturate(1.15)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${NAVY}cc 0%, ${NAVY}55 50%, ${INK}dd 100%)`}} />
      <Dust seed={bg} />
    </>
  );
};

// أسماء المتحدثين الثلاثة تحت العنوان
const Names: React.FC<{delay: number}> = ({delay}) => (
  <div style={{display: 'flex', gap: 70, justifyContent: 'center', marginTop: 10}}>
    {(['host', 'jaza', 'hakami'] as const).map((k, i) => (
      <div key={k} style={{...useReveal(delay + i * 6), textAlign: 'center'}}>
        <div style={{fontSize: 38, fontWeight: 700, color: '#fff', textShadow: shadow}}>{PEOPLE[k].name}</div>
        <div style={{fontSize: 24, fontWeight: 500, color: GOLD, marginTop: 2, textShadow: shadow}}>{PEOPLE[k].role}</div>
      </div>
    ))}
  </div>
);

export const PanelIntro: React.FC<{part: number; parts: number; bg: string}> = ({part, parts, bg}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [INTRO_FRAMES - 16, INTRO_FRAMES - 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <Backdrop bg={bg} frames={INTRO_FRAMES} />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily, opacity: out}}>
        <div style={{...useReveal(2), fontSize: 40, fontWeight: 600, color: CREAM, textShadow: shadow}}>{SESSION.kicker}</div>
        <div style={{...useReveal(8), fontSize: 92, fontWeight: 800, color: GOLD, textShadow: shadow, lineHeight: 1.2}}>{SESSION.title}</div>
        <Rule width={560} delay={16} />
        <div style={{...useReveal(20), display: 'flex', alignItems: 'baseline', gap: 18, fontSize: 52, fontWeight: 700, color: '#fff', textShadow: shadow}}>
          <span>الجزء {arabicDigits(part)}</span>
          <span style={{fontSize: 34, color: CREAM, fontWeight: 500}}>من {arabicDigits(parts)}</span>
        </div>
        <div style={{height: 40}} />
        <Names delay={30} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PanelOutro: React.FC<{bg: string}> = ({bg}) => {
  const frame = useCurrentFrame();
  const black = interpolate(frame, [OUTRO_FRAMES - 25, OUTRO_FRAMES], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <Backdrop bg={bg} frames={OUTRO_FRAMES} />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily}}>
        <div style={{...useReveal(6), fontSize: 46, fontWeight: 600, color: CREAM, textShadow: shadow}}>شكراً لمتابعتكم</div>
        <div style={{...useReveal(14), fontSize: 80, fontWeight: 800, color: GOLD, textShadow: shadow, marginTop: 6}}>{SESSION.title}</div>
        <Rule width={480} delay={24} />
        <Names delay={30} />
        <div style={{...useReveal(48), fontSize: 34, fontWeight: 500, color: CREAM, marginTop: 40, textShadow: shadow}}>{SESSION.event}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

// ———— صور شفافة تركّب فوق الفيديو ————

// بطاقة السؤال (من المحاورة أو من الحضور): تحت بعرض الشاشة (فوق الورد) عشان ما تغطي وجوه الضيوف، ومعها لمن موجّه السؤال
export const QuestionCard: React.FC<{text: string; to?: Who | 'both'; from?: 'host' | 'audience'}> = ({text, to, from = 'host'}) => {
  const toLine = to === 'both' ? `${PEOPLE.jaza.name} و ${PEOPLE.hakami.name}` : to ? PEOPLE[to].name : '';
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
      <div style={{position: 'absolute', bottom: 60, left: 160, right: 160, display: 'flex', alignItems: 'stretch', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.55))'}}>
        <div style={{width: 10, background: GOLD, borderRadius: 5}} />
        <div style={{flex: 1, padding: '26px 40px 30px', background: `linear-gradient(to left, ${NAVY}f2, ${NAVY}d8)`, borderRadius: '0 0 0 24px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{width: 46, height: 46, borderRadius: 23, background: GOLD, color: NAVY, fontSize: 32, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>؟</div>
            <div style={{fontSize: 30, fontWeight: 700, color: GOLD}}>{from === 'audience' ? 'سؤال من الحضور' : `سؤال ${PEOPLE.host.name}`}</div>
            {toLine ? <div style={{fontSize: 26, fontWeight: 500, color: CREAM, opacity: 0.85}}>← إلى {toLine}</div> : null}
          </div>
          <div style={{fontSize: 44, fontWeight: 700, color: '#fff', lineHeight: 1.45, marginTop: 10}}>{text}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// اسم المتحدث تحت، بجهة مكانه على المسرح: د. أحمد جزا يسار، د. إبراهيم والمحاورة يمين
const SIDE: Record<Who, 'left' | 'right'> = {host: 'right', jaza: 'left', hakami: 'right'};
export const LowerThird: React.FC<{who: Who}> = ({who}) => (
  <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
    <div style={{position: 'absolute', bottom: 80, [SIDE[who]]: 90, display: 'flex', alignItems: 'stretch', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))'}}>
      <div style={{width: 8, background: GOLD, borderRadius: 4}} />
      <div style={{padding: '18px 34px 20px', background: `linear-gradient(to left, ${NAVY}f0, ${NAVY}c0)`, borderRadius: '0 0 0 18px'}}>
        <div style={{fontSize: 52, fontWeight: 800, color: '#fff', lineHeight: 1.2}}>{PEOPLE[who].name}</div>
        <div style={{fontSize: 30, fontWeight: 500, color: GOLD, marginTop: 4}}>{PEOPLE[who].role}</div>
      </div>
    </div>
  </AbsoluteFill>
);

// شارة صغيرة باسم الجلسة ورقم الجزء، فوق يسار طول الجزء
export const Badge: React.FC<{part: number; parts: number}> = ({part, parts}) => (
  <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
    <div style={{position: 'absolute', top: 56, left: 70, display: 'flex', alignItems: 'center', gap: 16, padding: '10px 26px', borderRadius: 40, background: `${NAVY}b0`, border: `1.5px solid ${GOLD}88`}}>
      <div style={{fontSize: 26, fontWeight: 600, color: CREAM}}>{SESSION.title}</div>
      <div style={{width: 1.5, height: 26, background: `${GOLD}aa`}} />
      <div style={{fontFamily: numberFamily, fontSize: 26, color: GOLD}}>{part}/{parts}</div>
    </div>
  </AbsoluteFill>
);
