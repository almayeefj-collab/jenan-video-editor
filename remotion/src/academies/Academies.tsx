// أكاديميات جمعية المعلمين الكويتية: عمودي 9:16 بنفس هوية فيديو «أبرز توصيات المؤتمر 46»
// (سماء كحلية بنجوم، كوكب مضيء تحت، شعار الجمعية الذهبي، لمسات سماوية وذهبية)
// الترتيب: شعار الجمعية ← «الأكاديميات التابعة» ← لكل أكاديمية: عنوانها ثم مقتطفات فيديو ← ختام
// التوقيت مبني على الـ bars (2.3 ثانية) عشان القصات تجي على إيقاع الموسيقى
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';
import {C, LOGO} from '../conference46/config';
import {ACADEMIES, CLIP_DIR, PATTERN} from './config';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const BAR = 69;
export const INTRO = 3 * BAR;
const CARD = 2 * BAR; // بطاقة عنوان الأكاديمية
const MONTAGE = PATTERN.reduce((a, b) => a + b, 0); // مقتطفات الفيديو
const SECTION = CARD + MONTAGE;
export const OUTRO = 3 * BAR;

const secStart = (i: number) => INTRO + i * SECTION;
const outroStart = () => secStart(ACADEMIES.length);
export const totalFrames = () => outroStart() + OUTRO;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const out = Easing.out(Easing.cubic);
const pr = (f: number, a: number, d = 16, e = ease) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: e});
const reveal = (f: number, delay: number, dur = 16, dist = 40) => {
  const k = pr(f, delay, dur);
  return {opacity: k, filter: `blur(${(1 - k) * 12}px)`, transform: `translateY(${(1 - k) * dist}px)`};
};
const ORD = ['01', '02', '03', '04', '05'];

const Sfx: React.FC<{at: number; src: string; v: number; dur?: number}> = ({at, src, v, dur = FPS * 2}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}>
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={v} />
  </Sequence>
);

// ===== الخلفية: نفس سماء فيديو التوصيات =====
const STARS = new Array(150).fill(0).map((_, i) => ({
  x: random(`x${i}`) * 1080, y: random(`y${i}`) * 1920, r: 0.8 + random(`r${i}`) * 1.8, o: 0.25 + random(`o${i}`) * 0.6, ph: random(`p${i}`) * 6.3,
}));
const Sky: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 70% at 50% 30%, #174c9a 0%, ${C.navy} 38%, #071c45 70%, ${C.deep} 100%)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={(s.y - f * (0.03 + s.r * 0.03) + 1920) % 1920} r={s.r} fill="#fff" opacity={s.o * (0.6 + 0.4 * Math.sin(f / 14 + s.ph))} />
        ))}
      </svg>
      <Planet />
    </AbsoluteFill>
  );
};
const Planet: React.FC<{top?: number}> = ({top = 1770}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute', left: -420, right: -420, top, height: 1200, borderRadius: '50%',
        background: 'radial-gradient(60% 40% at 50% 0%, #1d52a6 0%, #0a2350 60%, #05132d 100%)', borderTop: '2px solid rgba(200,240,255,.9)',
        boxShadow: `0 -8px 34px rgba(140,210,255,${0.5 + Math.sin(f / 25) * 0.12}), 0 -50px 140px rgba(60,140,255,.35)`,
      }}
    />
  );
};

const Rays: React.FC<{cx: number; cy: number; size: number; o: number}> = ({cx, cy, size, o}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, borderRadius: '50%',
        background: `repeating-conic-gradient(from ${f * 0.3}deg, rgba(246,182,91,.15) 0deg 5deg, transparent 5deg 15deg)`,
        WebkitMaskImage: 'radial-gradient(circle, black 16%, transparent 60%)', opacity: o,
      }}
    />
  );
};

const Badge: React.FC<{n: string; size: number; k: number}> = ({n, size, k}) => (
  <div
    style={{
      width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: `radial-gradient(circle at 35% 30%, #ffd796, ${C.gold} 45%, ${C.gold2})`, boxShadow: `0 0 0 ${size * 0.07}px rgba(246,182,91,.2), 0 10px 30px rgba(232,138,44,.5)`,
      transform: `scale(${k}) rotate(${(1 - k) * -120}deg)`,
    }}
  >
    <span style={{fontFamily: numberFamily, fontSize: size * 0.54, fontWeight: 900, color: '#3b1d02', fontVariantNumeric: 'lining-nums'}}>{n}</span>
  </div>
);

// ===== شعار الجمعية: كبير بالانترو ← صغير فوق طول الفيديو ← كبير بالختام =====
const KTS_RATIO = 824 / 1232;
type Pose = {cx: number; cy: number; h: number};
const lerp = (a: Pose, b: Pose, k: number): Pose => ({cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, h: a.h + (b.h - a.h) * k});
const P_INTRO = {cx: 540, cy: 520, h: 520};
const P_TOP = {cx: 540, cy: 132, h: 170};
const P_OUTRO = {cx: 540, cy: 600, h: 460};
const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = outroStart();
  const pop = spring({frame: f - 6, fps, config: {damping: 12, mass: 0.9}});
  const p = f < o ? lerp(P_INTRO, P_TOP, pr(f, INTRO - 34, 26)) : lerp(P_TOP, P_OUTRO, pr(f, o + 4, 26));
  const rays = f < o ? 1 - pr(f, INTRO - 34, 20) : pr(f, o + 10, 30);
  return (
    <>
      <Rays cx={p.cx} cy={p.cy} size={p.h * 2.3} o={rays * pr(f, 10, 30)} />
      <Img
        src={staticFile(LOGO)}
        style={{
          position: 'absolute', height: p.h, width: p.h * KTS_RATIO, left: p.cx - (p.h * KTS_RATIO) / 2, top: p.cy - p.h / 2,
          transform: `scale(${f < INTRO ? pop : 1})`, filter: 'drop-shadow(0 12px 30px rgba(0,0,0,.5)) drop-shadow(0 0 24px rgba(246,182,91,.35))',
        }}
      />
    </>
  );
};

// ===== شريط سفلي: نقاط الأكاديميات + اسم الجمعية =====
const Footer: React.FC = () => {
  const f = useCurrentFrame();
  const vis = pr(f, INTRO - 10, 20) * (1 - pr(f, outroStart(), 14));
  const cur = Math.max(0, Math.min(ACADEMIES.length - 1, Math.floor((f - INTRO) / SECTION)));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', direction: 'rtl', fontFamily, opacity: vis}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 14}}>
        {ACADEMIES.map((_, i) => (
          <div key={i} style={{width: i === cur ? 46 : 12, height: 12, borderRadius: 6, background: i < cur ? 'rgba(127,230,242,.75)' : i === cur ? C.gold : 'rgba(255,255,255,.3)', boxShadow: i === cur ? `0 0 12px ${C.gold}` : undefined}} />
        ))}
      </div>
      <div style={{fontSize: 28, fontWeight: 700, color: '#e9f4ff', textShadow: '0 2px 12px rgba(0,0,0,.6)'}}>جمعية المعلمين الكويتية</div>
    </div>
  );
};

// ===== الانترو =====
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = 1 - pr(f, INTRO - 30, 18);
  const num = spring({frame: f - 62, fps, config: {damping: 11}});
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, textAlign: 'center'}}>
      <div style={{position: 'absolute', top: 880, left: 40, right: 40, opacity: exit, transform: `translateY(${(1 - exit) * -60}px)`}}>
        <div style={{fontSize: 40, fontWeight: 800, color: C.cyan, ...reveal(f, 30)}}>الأكاديميات التابعة لـ</div>
        <div style={{fontSize: 76, fontWeight: 900, color: '#fff', marginTop: 4, textShadow: '0 0 40px rgba(127,230,242,.35)', ...reveal(f, 38, 20)}}>جمعية المعلمين الكويتية</div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, marginTop: 44}}>
          <Badge n={String(ACADEMIES.length)} size={120} k={num} />
          <div style={{textAlign: 'right', ...reveal(f, 68)}}>
            <div style={{fontSize: 50, fontWeight: 900, color: '#fff'}}>أكاديميات</div>
            <div style={{fontSize: 30, fontWeight: 700, color: C.gold}}>للتدريب والتطوير المهني</div>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 50}}>
          {ACADEMIES.map((a, i) => {
            const q = pr(f, 92 + i * 12, 16, Easing.out(Easing.back(1.5)));
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 34px', borderRadius: 40, minWidth: 620, justifyContent: 'center',
                  background: 'linear-gradient(90deg, rgba(127,230,242,.06), rgba(127,230,242,.2), rgba(127,230,242,.06))', border: '1.5px solid rgba(127,230,242,.45)',
                  opacity: Math.min(1, q * 1.5), transform: `translateX(${(1 - q) * (i % 2 ? -300 : 300)}px)`,
                }}
              >
                <div style={{width: 14, height: 14, transform: 'rotate(45deg)', background: C.gold}} />
                <div style={{fontSize: 40, fontWeight: 800, color: '#fff'}}>{a.name}</div>
              </div>
            );
          })}
        </div>
      </div>
      <AbsoluteFill style={{background: C.deep, opacity: 1 - pr(f, 0, 16)}} />
      <Sfx at={4} src="cinematic-boom" v={0.4} dur={FPS * 3} />
      <Sfx at={32} src="shimmer" v={0.3} />
      {ACADEMIES.map((_, i) => (
        <Sfx key={i} at={92 + i * 12} src="pop" v={0.25} dur={15} />
      ))}
      <Sfx at={INTRO - 34} src="swoosh-up" v={0.35} dur={20} />
    </AbsoluteFill>
  );
};

// ===== بطاقة عنوان الأكاديمية =====
const TitleCard: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = ACADEMIES[i];
  const badge = spring({frame: f - 4, fps, config: {damping: 10, mass: 0.7}});
  const ex = pr(f, CARD - 14, 14);
  const words = a.name.split(' ');
  const line = pr(f, 30, 24);
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, textAlign: 'center', opacity: 1 - ex, transform: `scale(${1 + ex * 0.15})`, filter: `blur(${ex * 10}px)`}}>
      <Rays cx={540} cy={760} size={1000} o={pr(f, 0, 20)} />
      <div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Badge n={ORD[i]} size={200} k={badge} />
      </div>
      <div style={{position: 'absolute', top: 920, left: 50, right: 50}}>
        <div style={{fontSize: 44, fontWeight: 800, color: C.cyan, ...reveal(f, 10)}}>{a.kicker}</div>
        <div style={{fontSize: a.titleSize ?? 96, fontWeight: 900, color: '#fff', lineHeight: 1.25, marginTop: 6, textShadow: '0 6px 30px rgba(0,0,0,.5)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 22}}>
          {words.map((w, k) => {
            const q = pr(f, 16 + k * 5, 12, out);
            return (
              <span key={k} style={{display: 'inline-block', opacity: q, transform: `translateY(${(1 - q) * 30}px) scale(${0.8 + 0.2 * q})`, filter: `blur(${(1 - q) * 8}px)`}}>
                {w}
              </span>
            );
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '34px auto 0'}}>
          <div style={{height: 3, width: 220 * line, background: `linear-gradient(to left, ${C.gold}, transparent)`}} />
          <div style={{width: 14, height: 14, transform: `rotate(45deg) scale(${line})`, background: C.gold}} />
          <div style={{height: 3, width: 220 * line, background: `linear-gradient(to right, ${C.gold}, transparent)`}} />
        </div>
        <div style={{fontSize: 38, fontWeight: 700, color: C.gold, marginTop: 26, ...reveal(f, 40)}}>مقتطفات من برامج الأكاديمية</div>
      </div>
      <Sfx at={0} src="whoosh" v={0.3} />
      <Sfx at={6} src="impact" v={0.25} />
      <Sfx at={40} src="shimmer" v={0.2} />
    </AbsoluteFill>
  );
};

// ===== لقطة فيديو واحدة: ملء الشاشة مع زوم بطيء، ودخول قصير =====
const Shot: React.FC<{src: string; from: number; dur: number; k: number}> = ({src, from, dur, k}) => {
  const f = useCurrentFrame();
  const dir = k % 2 ? 1 : -1;
  const scale = interpolate(f, [0, dur + 8], [1.04, 1.12]);
  const tx = interpolate(f, [0, dur + 8], [0, dir * 20]);
  const enter = pr(f, 0, 8, out);
  const flash = interpolate(f, [0, 2, 8], [0.0, 0.28, 0], clamp);
  return (
    <AbsoluteFill style={{background: C.deep}}>
      <AbsoluteFill style={{opacity: k === 0 ? 1 : enter, transform: `scale(${1 + (1 - enter) * 0.06})`}}>
        <OffthreadVideo
          src={staticFile(CLIP_DIR + src)}
          trimBefore={Math.round(from * FPS)}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%', transform: `scale(${scale}) translateX(${tx}px)`, filter: 'contrast(1.05) saturate(1.06)'}}
        />
      </AbsoluteFill>
      {k > 0 ? <AbsoluteFill style={{background: '#fff', opacity: flash}} /> : null}
    </AbsoluteFill>
  );
};

// ===== مقتطفات الأكاديمية =====
const Montage: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const a = ACADEMIES[i];
  let t = 0;
  const shots = PATTERN.map((dur, k) => {
    const c = a.clips[k % a.clips.length];
    const s = {from: t, dur, c, k};
    t += dur;
    return s;
  });
  const enter = pr(f, 0, 18, out);
  const pill = pr(f, 10, 18, Easing.out(Easing.back(1.4)));
  const exit = pr(f, MONTAGE - 12, 12);
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
      <AbsoluteFill style={{clipPath: `circle(${enter * 120}% at 50% 50%)`, opacity: 1 - exit}}>
        {shots.map((s) => (
          <Sequence key={s.k} from={s.from} durationInFrames={s.dur}>
            <Shot src={s.c[0]} from={s.c[1]} dur={s.dur} k={s.k} />
          </Sequence>
        ))}
        {/* تظليل فوق وتحت عشان الشعار والعناوين تنقرا */}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,18,48,.92) 0%, rgba(4,18,48,.55) 16%, transparent 30%, transparent 70%, rgba(4,18,48,.6) 84%, rgba(4,18,48,.95) 100%)'}} />
        <AbsoluteFill style={{boxShadow: 'inset 0 0 0 10px rgba(246,182,91,.0), inset 0 0 160px rgba(4,18,48,.5)'}} />
      </AbsoluteFill>
      {/* اسم الأكاديمية تحت الشعار */}
      <div style={{position: 'absolute', top: 240, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: Math.min(1, pill * 1.4) * (1 - exit)}}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '10px 30px 12px', borderRadius: 40, transform: `scale(${0.6 + 0.4 * pill})`,
            background: 'rgba(4,18,48,.55)', border: `1.5px solid ${C.gold}`, boxShadow: '0 8px 30px rgba(0,0,0,.35)', backdropFilter: 'blur(6px)',
          }}
        >
          <span style={{fontFamily: numberFamily, fontSize: 34, fontWeight: 900, color: C.gold, fontVariantNumeric: 'lining-nums'}}>{ORD[i]}</span>
          <span style={{width: 2, height: 30, background: 'rgba(127,230,242,.6)'}} />
          <span style={{fontSize: 36, fontWeight: 800, color: '#fff'}}>{a.name}</span>
        </div>
      </div>
      {shots.slice(1).map((s) => (
        <Sfx key={s.k} at={s.from} src="tick" v={0.12} dur={6} />
      ))}
    </AbsoluteFill>
  );
};

// ستارة ذهبية/سماوية بين البطاقة والمقتطفات
const Wipe: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 24], [0, 1], clamp);
  const colors = [C.gold, C.cyan, '#ffffff'];
  if (i % 2 === 0) {
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        {[0, 1, 2].map((b) => {
          const x = interpolate(k, [b * 0.08, 0.7 + b * 0.08], [-1600, 1600], clamp);
          return <div key={b} style={{position: 'absolute', top: -400, left: x, width: 220 - b * 50, height: 2800, background: colors[b], opacity: 0.9 - b * 0.2, transform: 'rotate(18deg)'}} />;
        })}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {new Array(6).fill(0).map((_, b) => {
        const y = interpolate(k, [b * 0.05, 0.6 + b * 0.05], [1920, -400], clamp);
        return <div key={b} style={{position: 'absolute', left: b * 180, top: y, width: 180, height: 300, background: b % 2 ? C.cyan : C.gold, opacity: 0.85}} />;
      })}
    </AbsoluteFill>
  );
};

// ===== الختام =====
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, textAlign: 'center'}}>
      <div style={{position: 'absolute', top: 920, left: 40, right: 40}}>
        <div style={{fontSize: 76, fontWeight: 900, color: '#fff', ...reveal(f, 26, 20)}}>جمعية المعلمين الكويتية</div>
        <div style={{fontSize: 44, fontWeight: 800, color: C.gold, marginTop: 10, ...reveal(f, 40)}}>أكاديميات تصنع الفرق</div>
        <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14, marginTop: 34}}>
          {ACADEMIES.map((a, i) => (
            <div key={i} style={{fontSize: 30, fontWeight: 700, color: C.cyan, padding: '6px 22px', borderRadius: 30, border: '1.5px solid rgba(127,230,242,.45)', ...reveal(f, 54 + i * 8)}}>
              {a.name}
            </div>
          ))}
        </div>
      </div>
      <AbsoluteFill style={{background: C.deep, opacity: pr(f, OUTRO - 36, 36)}} />
      <Sfx at={4} src="whoosh" v={0.3} />
      <Sfx at={30} src="shimmer" v={0.3} />
    </AbsoluteFill>
  );
};

const musicVolume = (f: number) => {
  const total = totalFrames();
  return 0.6 * interpolate(f, [0, 10], [0, 1], clamp) * interpolate(f, [total - 50, total], [1, 0], clamp);
};

export const Academies: React.FC = () => (
  <AbsoluteFill style={{background: C.deep}}>
    <Sky />
    <Sequence durationInFrames={INTRO}>
      <Intro />
    </Sequence>
    {ACADEMIES.map((_, i) => (
      <Sequence key={`c${i}`} from={secStart(i)} durationInFrames={CARD}>
        <TitleCard i={i} />
      </Sequence>
    ))}
    {ACADEMIES.map((_, i) => (
      <Sequence key={`m${i}`} from={secStart(i) + CARD} durationInFrames={MONTAGE}>
        <Montage i={i} />
      </Sequence>
    ))}
    {ACADEMIES.map((_, i) => (
      <Sequence key={`w${i}`} from={secStart(i) + CARD - 12} durationInFrames={26}>
        <Wipe i={i} />
      </Sequence>
    ))}
    <Sequence from={outroStart()} durationInFrames={OUTRO}>
      <Outro />
    </Sequence>
    <Footer />
    <Logo />
    <Audio src={staticFile('c46/soft.mp3')} volume={musicVolume} />
  </AbsoluteFill>
);
