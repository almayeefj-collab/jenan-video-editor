import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {type Beat, C, type Look} from './types';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const isArabic = (w: string) => /[؀-ۿ]/.test(w);
const ink = (look: Look) => (look === 'light' ? C.ink : '#FFFFFF');
const hi = (look: Look) => (look === 'coral' ? C.ink : C.coral);

// ثابت عشوائي (deterministic)
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ───────── الخلفيات ─────────
export const Backdrop: React.FC<{look: Look}> = ({look}) => {
  const f = useCurrentFrame();
  if (look === 'dark') {
    return (
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #4A3B36 0%, #2A211E 55%, #171110 100%)`}}>
        {Array.from({length: 46}, (_, i) => {
          const tw = 0.25 + 0.75 * Math.abs(Math.sin((f + i * 17) / (14 + rand(i) * 20)));
          const s = 2 + rand(i + 9) * 5;
          return <div key={i} style={{position: 'absolute', left: rand(i) * 1080, top: rand(i + 40) * 1920 - f * 0.3 * rand(i + 3), width: s, height: s,
            borderRadius: '50%', background: 'white', opacity: tw * 0.8, boxShadow: `0 0 ${s * 3}px white`}} />;
        })}
      </AbsoluteFill>
    );
  }
  if (look === 'coral') {
    return <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #EE8670 0%, ${C.coral} 50%, ${C.coralDeep} 100%)`}} />;
  }
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 42%, #F6F4EF 0%, ${C.cream} 55%, ${C.creamEdge} 100%)`}}>
      {/* نقاط شبكة خفيفة */}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(0,0,0,0.07) 1.5px, transparent 1.5px)', backgroundSize: '44px 44px', opacity: 0.6}} />
    </AbsoluteFill>
  );
};

// ───────── العنوان المتحرك فوق ─────────
// الكلمات تطلع وحدة وحدة؛ *كلمة* = مرجاني. الإنجليزي المتتالي قطعة وحدة عشان ما ينقلب.
const tokens = (text: string) => {
  const out: {w: string; hl: boolean}[] = [];
  for (const raw of text.split(' ')) {
    const hl = raw.startsWith('*') || raw.endsWith('*');
    const w = raw.replace(/\*/g, '');
    const prev = out[out.length - 1];
    if (prev && !isArabic(w) && !isArabic(prev.w) && prev.hl === hl) prev.w += ` ${w}`;
    else out.push({w, hl});
  }
  return out;
};

export const Kinetic: React.FC<{text: string; look: Look; size?: number; delay?: number; stagger?: number; color?: string}> = ({
  text, look, size = 104, delay = 2, stagger = 4, color,
}) => {
  const f = useCurrentFrame();
  const latin = !isArabic(text);
  return (
    <div style={{direction: latin ? 'ltr' : 'rtl', fontFamily, fontWeight: 900, fontSize: size, lineHeight: 1.15, textAlign: 'center', color: color ?? ink(look)}}>
      {tokens(text).map((t, i) => {
        const p = interpolate(f - delay - i * stagger, [0, 9], [0, 1], {...clamp, easing: ease});
        return (
          <span key={i} style={{display: 'inline-block', margin: '0 0.14em', opacity: p, color: t.hl ? hi(look) : undefined,
            transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`, filter: `blur(${(1 - p) * 8}px)`}}>
            {t.w}
          </span>
        );
      })}
    </div>
  );
};

// ───────── الأشكال ─────────
const shadow = '0 50px 80px rgba(40,25,20,0.28), 0 12px 24px rgba(40,25,20,0.18)';

const drop = (f: number, fps: number, delay = 4) => spring({frame: f - delay, fps, config: {damping: 13, stiffness: 120}});

const Calendar: React.FC<{day: string; month: string}> = ({day, month}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = drop(f, fps);
  return (
    <div style={{perspective: 1400}}>
      <div style={{width: 520, height: 580, borderRadius: 40, background: C.paper, boxShadow: shadow, overflow: 'hidden', fontFamily,
        transform: `rotateX(${(1 - p) * -85}deg) rotateY(${Math.sin(f / 40) * 6}deg) translateY(${(1 - p) * -200}px)`, transformOrigin: 'top center'}}>
        <div style={{height: 140, background: C.coral, color: 'white', fontSize: 58, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl'}}>
          {month}
        </div>
        <div style={{position: 'absolute', top: 140, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0 110px'}}>
          {[0, 1].map((i) => <div key={i} style={{width: 26, height: 26, borderRadius: 13, background: C.ink, marginTop: -13}} />)}
        </div>
        <div style={{fontSize: Math.min(330, Math.round(820 / Math.max(1, day.length))), fontWeight: 1000, color: C.ink, textAlign: 'center', lineHeight: 1.25, fontFamily: 'Cairo', direction: 'ltr', height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{day}</div>
      </div>
    </div>
  );
};

const Cube: React.FC<{color: 'coral' | 'dark' | 'white'; label?: string}> = ({color, label}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = drop(f, fps);
  const s = 380;
  const pal = {coral: ['#F08A72', C.coral, C.coralDeep], dark: ['#4B403C', '#2E2624', '#1C1615'], white: ['#FFFFFF', '#F2EFE9', '#D9D4CB']}[color];
  const face = (bg: string, t: string): React.CSSProperties => ({position: 'absolute', width: s, height: s, background: bg, transform: t, borderRadius: 18,
    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.12)'});
  const rotY = -32 + Math.sin(f / 35) * 10 + (1 - p) * 90;
  return (
    <div style={{position: 'relative', perspective: 1600}}>
      <div style={{width: s, height: s, position: 'relative', transformStyle: 'preserve-3d',
        transform: `translateY(${(1 - p) * -700}px) rotateX(-18deg) rotateY(${rotY}deg)`}}>
        <div style={face(pal[1], `translateZ(${s / 2}px)`)} />
        <div style={face(pal[2], `rotateY(90deg) translateZ(${s / 2}px)`)} />
        <div style={face(pal[2], `rotateY(-90deg) translateZ(${s / 2}px)`)} />
        <div style={face(pal[1], `rotateY(180deg) translateZ(${s / 2}px)`)} />
        <div style={face(pal[0], `rotateX(90deg) translateZ(${s / 2}px)`)} />
      </div>
      <div style={{position: 'absolute', left: -60, right: -60, bottom: -90, height: 60, borderRadius: '50%', background: 'rgba(40,25,20,0.25)', filter: 'blur(18px)',
        opacity: p}} />
      {label ? (
        <div style={{position: 'absolute', top: -40, right: -90, background: C.ink, color: 'white', fontFamily, fontWeight: 800, fontSize: 40, padding: '8px 26px',
          borderRadius: 999, opacity: interpolate(f, [14, 22], [0, 1], clamp), direction: 'ltr'}}>
          {label}
        </div>
      ) : null}
    </div>
  );
};

const Bars: React.FC<{items: {label: string; value: number; display: string}[]; look: Look}> = ({items, look}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const max = Math.max(...items.map((i) => i.value));
  const fills = [C.coralSoft, C.coral, C.ink, C.coralDeep];
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 70, height: 760, direction: 'ltr', fontFamily}}>
      {items.map((it, i) => {
        const p = spring({frame: f - 6 - i * 6, fps, config: {damping: 14, stiffness: 110}});
        const h = 80 + (it.value / max) * 560 * p;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
            <div style={{fontSize: 56, fontWeight: 900, color: ink(look), opacity: p}}>{it.display}</div>
            <div style={{width: 190, height: h, borderRadius: 24, background: `linear-gradient(90deg, ${fills[i % 4]}, ${fills[i % 4]}cc)`, boxShadow: shadow,
              position: 'relative'}}>
              <div style={{position: 'absolute', top: 0, right: -26, width: 26, height: '100%', borderRadius: '0 18px 18px 0', background: 'rgba(0,0,0,0.18)',
                transform: 'skewY(-30deg)', transformOrigin: 'left top'}} />
            </div>
            <div style={{fontSize: 40, fontWeight: 800, color: look === 'light' ? C.inkSoft : '#FFFFFFcc', direction: 'rtl', textAlign: 'center', maxWidth: 260}}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const Stat: React.FC<{value: string; unit?: string; look: Look}> = ({value, unit, look}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = drop(f, fps, 3);
  // عدّاد: إذا القيمة فيها رقم، يعد من صفر
  const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const shown = m ? `${m[1]}${(Number(m[2]) * Math.min(1, interpolate(f, [4, 26], [0, 1], {...clamp, easing: ease}))).toFixed(m[2].includes('.') ? 1 : 0)}${m[3]}` : value;
  return (
    <div style={{textAlign: 'center', fontFamily, transform: `scale(${0.6 + 0.4 * p})`, opacity: p}}>
      <div style={{fontSize: 300, fontWeight: 1000, color: hi(look), lineHeight: 1, direction: 'ltr', fontFamily: 'Cairo'}}>{shown}</div>
      {unit ? <div style={{fontSize: 70, fontWeight: 800, color: ink(look), marginTop: 20}}>{unit}</div> : null}
    </div>
  );
};

const Doc: React.FC<{title: string; rows: string[]}> = ({title, rows}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = drop(f, fps);
  const paper = (r: number, x: number, o: number): React.CSSProperties => ({position: 'absolute', inset: 0, borderRadius: 26, background: C.paper, boxShadow: shadow,
    transform: `translateX(${x}px) rotate(${r}deg)`, opacity: o});
  return (
    <div style={{width: 680, height: 860, position: 'relative', transform: `translateY(${(1 - p) * 500}px) rotate(${-4 + Math.sin(f / 50) * 1.5}deg)`, fontFamily}}>
      <div style={paper(6, 40, 0.7)} />
      <div style={paper(2, 18, 0.85)} />
      <div style={{...paper(0, 0, 1), overflow: 'hidden', direction: 'rtl'}}>
        <div style={{height: 110, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px'}}>
          <Spark size={56} />
          <span style={{color: C.coral, fontSize: 46, fontWeight: 900, direction: 'ltr'}}>{title}</span>
        </div>
        <div style={{padding: '50px 50px'}}>
          {rows.map((r, i) => {
            const at = 14 + i * 9;
            const q = spring({frame: f - at, fps, config: {damping: 12}});
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, marginBottom: 46}}>
                <div style={{width: 64, height: 64, borderRadius: 14, border: `5px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: q > 0.5 ? C.coral : 'transparent', borderColor: q > 0.5 ? C.coral : C.ink}}>
                  <svg width="44" height="44" viewBox="0 0 24 24" style={{transform: `scale(${q})`}}><path d="M4 12.5l5 5L20 6.5" stroke="white" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div style={{fontSize: 52, fontWeight: 800, color: C.ink, opacity: 0.35 + 0.65 * Math.min(1, q)}}>{r}</div>
              </div>
            );
          })}
          {Array.from({length: 3}, (_, i) => (
            <div key={i} style={{height: 18, borderRadius: 9, background: '#E4E0D8', width: `${90 - i * 18}%`, marginBottom: 22}} />
          ))}
        </div>
      </div>
    </div>
  );
};

const Phone: React.FC<{bubbles?: string[]; wave?: boolean}> = ({bubbles = [], wave}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = drop(f, fps);
  return (
    <div style={{width: 560, height: 1060, borderRadius: 80, background: C.ink, padding: 22, boxShadow: shadow, fontFamily,
      transform: `translateY(${(1 - p) * 900}px) rotate(${(1 - p) * 12 + Math.sin(f / 45) * 2}deg)`}}>
      <div style={{width: '100%', height: '100%', borderRadius: 60, background: C.paper, position: 'relative', overflow: 'hidden', direction: 'rtl', padding: '90px 34px'}}>
        <div style={{position: 'absolute', top: 22, left: '50%', width: 150, height: 40, marginLeft: -75, borderRadius: 20, background: C.ink}} />
        {wave ? (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, direction: 'ltr'}}>
            {Array.from({length: 11}, (_, i) => {
              const h = 40 + Math.abs(Math.sin(f / 4 + i * 0.8)) * 220 * Math.sin(((i + 1) / 12) * Math.PI);
              return <div key={i} style={{width: 24, height: h, borderRadius: 12, background: i % 2 ? C.coral : C.ink}} />;
            })}
          </div>
        ) : null}
        {bubbles.map((b, i) => {
          const q = spring({frame: f - 12 - i * 10, fps, config: {damping: 12}});
          const mine = i % 2 === 0;
          return (
            <div key={i} style={{display: 'flex', justifyContent: mine ? 'flex-start' : 'flex-end', marginBottom: 30, opacity: Math.min(1, q),
              transform: `translateY(${(1 - q) * 40}px) scale(${0.8 + 0.2 * q})`, transformOrigin: mine ? 'right' : 'left'}}>
              <div style={{maxWidth: 420, padding: '24px 32px', borderRadius: 36, fontSize: 42, fontWeight: 800, lineHeight: 1.35,
                background: mine ? C.coral : C.ink, color: 'white'}}>
                {b}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Chips: React.FC<{chips: string[]; look: Look}> = ({chips, look}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 34, justifyContent: 'center', maxWidth: 940, direction: 'rtl', fontFamily}}>
      {chips.map((c, i) => {
        const q = spring({frame: f - 6 - i * 5, fps, config: {damping: 10, stiffness: 160}});
        const dark = i % 2 === 1;
        return (
          <div key={i} style={{padding: '30px 54px', borderRadius: 999, fontSize: 62, fontWeight: 900, transform: `scale(${q}) rotate(${(1 - q) * (dark ? 8 : -8)}deg)`,
            background: look === 'coral' ? (dark ? C.ink : C.paper) : dark ? C.ink : C.coral, color: look === 'coral' && !dark ? C.ink : 'white', boxShadow: shadow}}>
            {c}
          </div>
        );
      })}
    </div>
  );
};

// النجمة (Spark) — شعار صغير يلف
export const Spark: React.FC<{size?: number; color?: string}> = ({size = 120, color = C.coral}) => {
  const f = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" style={{transform: `rotate(${f * 1.2}deg)`}}>
      {Array.from({length: 12}, (_, i) => (
        <line key={i} x1="0" y1="0" x2="0" y2="-46" stroke={color} strokeWidth="7" strokeLinecap="round" transform={`rotate(${i * 30})`} />
      ))}
    </svg>
  );
};

const Brand: React.FC<{name: string; accent?: string; chip?: string; look: Look}> = ({name, accent, chip, look}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - 2, fps, config: {damping: 12, stiffness: 120}});
  // ظل مرجاني متزحزح (chromatic) يرجع لمكانه
  const off = interpolate(f, [0, 16], [26, 8], {...clamp, easing: ease});
  const latin = !isArabic(name);
  const size = name.length > 14 ? 120 : name.length > 9 ? 150 : 200;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, fontFamily}}>
      <div style={{transform: `scale(${p})`}}><Spark size={130} /></div>
      <div style={{position: 'relative', fontSize: size, fontWeight: 1000, lineHeight: 1.05, direction: latin ? 'ltr' : 'rtl', textAlign: 'center', maxWidth: 1000,
        transform: `scale(${1.25 - 0.25 * p})`, opacity: Math.min(1, p * 1.4)}}>
        <div style={{position: 'absolute', inset: 0, color: C.coral, transform: `translate(${-off}px, ${off * 0.4}px)`, opacity: 0.85}}>{name}</div>
        <div style={{position: 'relative', color: look === 'light' ? C.ink : 'white'}}>{name}</div>
      </div>
      {accent ? <div style={{fontSize: size * 0.95, fontWeight: 1000, color: C.coral, lineHeight: 1, direction: 'ltr', opacity: interpolate(f, [8, 16], [0, 1], clamp),
        transform: `translateY(${interpolate(f, [8, 18], [40, 0], {...clamp, easing: ease})}px)`}}>{accent}</div> : null}
      {chip ? <div style={{background: C.paper, color: C.ink, fontSize: 44, fontWeight: 800, padding: '12px 40px', borderRadius: 999, direction: 'rtl',
        opacity: interpolate(f, [14, 22], [0, 1], clamp)}}>{chip}</div> : null}
    </div>
  );
};

// ───────── اللقطة كاملة ─────────
export const BeatView: React.FC<{b: Beat; frames: number}> = ({b, frames}) => {
  const f = useCurrentFrame();
  const look: Look = b.look ?? 'light';
  // whip: دخول من اليمين مع blur، وخروج لليسار
  const inP = interpolate(f, [0, 7], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const outP = interpolate(f, [frames - 5, frames], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const x = inP * 420 - outP * 420;
  const blur = (inP + outP) * 22;
  const zoom = 1 + (f / Math.max(frames, 1)) * 0.04; // كاميرا تقرب شوي
  let center: React.ReactNode = null;
  switch (b.type) {
    case 'brand': center = <Brand name={b.name} accent={b.accent} chip={b.chip} look={look} />; break;
    case 'calendar': center = <Calendar day={b.day} month={b.month} />; break;
    case 'cube': center = <Cube color={b.color ?? 'coral'} label={b.label} />; break;
    case 'bars': center = <Bars items={b.items} look={look} />; break;
    case 'stat': center = <Stat value={b.value} unit={b.unit} look={look} />; break;
    case 'doc': center = <Doc title={b.title} rows={b.rows} />; break;
    case 'phone': center = <div style={{transform: `scale(${b.foot ? 0.78 : 0.88})`}}><Phone bubbles={b.bubbles} wave={b.wave} /></div>; break;
    case 'chips': center = <Chips chips={b.chips} look={look} />; break;
  }
  return (
    <AbsoluteFill>
      <Backdrop look={look} />
      <AbsoluteFill style={{transform: `translateX(${x}px) scale(${zoom})`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined}}>
        {b.head ? <div style={{position: 'absolute', top: 210, left: 50, right: 50}}><Kinetic text={b.head} look={look} /></div> : null}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: b.head ? 120 : 0}}>{center}</AbsoluteFill>
        {b.foot ? <div style={{position: 'absolute', bottom: 330, left: 60, right: 60}}><Kinetic text={b.foot} look={look} size={70} delay={12} /></div> : null}
      </AbsoluteFill>
      {/* وميض ضوئي أفقي مع كل دخول */}
      <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: 10, marginTop: -5,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)', boxShadow: '0 0 60px 20px rgba(255,200,180,0.6)',
        opacity: interpolate(f, [0, 3, 9], [0, 0.9, 0], clamp)}} />
    </AbsoluteFill>
  );
};
