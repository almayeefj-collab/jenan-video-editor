// أكاديميات جمعية المعلمين الكويتية: أفقي 16:9 بنفس هوية فيديو «أبرز توصيات المؤتمر 46»
// (سماء كحلية بنجوم، كوكب مضيء تحت، شعار الجمعية الذهبي، لمسات سماوية وذهبية)
// الترتيب: شعار الجمعية ← «الأكاديميات التابعة» ← لكل أكاديمية: عنوانها ثم مقتطفات فيديو ← ختام
// التوقيت مبني على الـ bars (2.3 ثانية) عشان القصات تجي على إيقاع الموسيقى
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';
import {C, LOGO} from '../conference46/config';
import {ACADEMIES, CLIP_DIR} from './config';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
const W = WIDTH;
const H = HEIGHT;
const BAR = 69;
export const INTRO = 3 * BAR;
const CARD = 2 * BAR; // بطاقة عنوان الأكاديمية
// مدة مقتطفات كل أكاديمية = مجموع لقطاتها (مضاعف للبار)
const montageLen = (i: number) => ACADEMIES[i].shots.reduce((a, s) => a + s[2], 0);
export const OUTRO = 3 * BAR;
const XF = 8; // تداخل ناعم بين اللقطات

const secStart = (i: number) => INTRO + ACADEMIES.slice(0, i).reduce((a, _, k) => a + CARD + montageLen(k), 0);
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
const STARS = new Array(170).fill(0).map((_, i) => ({
  x: random(`x${i}`) * W, y: random(`y${i}`) * H, r: 0.8 + random(`r${i}`) * 1.8, o: 0.25 + random(`o${i}`) * 0.6, ph: random(`p${i}`) * 6.3,
}));
const Sky: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(80% 90% at 50% 30%, #174c9a 0%, ${C.navy} 38%, #071c45 70%, ${C.deep} 100%)`}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={(s.y - f * (0.03 + s.r * 0.03) + H) % H} r={s.r} fill="#fff" opacity={s.o * (0.6 + 0.4 * Math.sin(f / 14 + s.ph))} />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute', left: -500, right: -500, top: 960, height: 1400, borderRadius: '50%',
          background: 'radial-gradient(60% 40% at 50% 0%, #1d52a6 0%, #0a2350 60%, #05132d 100%)', borderTop: '2px solid rgba(200,240,255,.9)',
          boxShadow: `0 -8px 34px rgba(140,210,255,${0.5 + Math.sin(f / 25) * 0.12}), 0 -50px 140px rgba(60,140,255,.35)`,
        }}
      />
    </AbsoluteFill>
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

// ===== شعار الجمعية: كبير يسار بالانترو ← صغير بالزاوية طول الفيديو ← كبير بالختام =====
const KTS_RATIO = 824 / 1232;
type Pose = {cx: number; cy: number; h: number};
const lerp = (a: Pose, b: Pose, k: number): Pose => ({cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, h: a.h + (b.h - a.h) * k});
const P_INTRO = {cx: 560, cy: 500, h: 600};
const P_TOP = {cx: 1830, cy: 104, h: 150};
const P_OUTRO = {cx: 960, cy: 330, h: 400};
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
  let cur = 0;
  ACADEMIES.forEach((_, i) => {
    if (f >= secStart(i)) cur = i;
  });
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', direction: 'rtl', fontFamily, opacity: vis}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 10}}>
        {ACADEMIES.map((_, i) => (
          <div key={i} style={{width: i === cur ? 46 : 12, height: 12, borderRadius: 6, background: i < cur ? 'rgba(127,230,242,.75)' : i === cur ? C.gold : 'rgba(255,255,255,.3)', boxShadow: i === cur ? `0 0 12px ${C.gold}` : undefined}} />
        ))}
      </div>
      <div style={{fontSize: 26, fontWeight: 700, color: '#e9f4ff', textShadow: '0 2px 12px rgba(0,0,0,.6)'}}>جمعية المعلمين الكويتية</div>
    </div>
  );
};

// ===== الانترو: الشعار يسار والنصوص يمين =====
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = 1 - pr(f, INTRO - 30, 18);
  const num = spring({frame: f - 62, fps, config: {damping: 11}});
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
      <div style={{position: 'absolute', top: 190, right: 130, width: 1060, opacity: exit, transform: `translateX(${(1 - exit) * 80}px)`}}>
        <div style={{fontSize: 44, fontWeight: 800, color: C.cyan, ...reveal(f, 30)}}>الأكاديميات التابعة لـ</div>
        <div style={{fontSize: 84, fontWeight: 900, color: '#fff', marginTop: -6, whiteSpace: 'nowrap', lineHeight: 1.35, textShadow: '0 0 40px rgba(127,230,242,.35)', ...reveal(f, 38, 20)}}>جمعية المعلمين الكويتية</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 26}}>
          <Badge n={String(ACADEMIES.length)} size={110} k={num} />
          <div style={reveal(f, 68)}>
            <div style={{fontSize: 50, fontWeight: 900, color: '#fff', lineHeight: 1.2}}>أكاديميات</div>
            <div style={{fontSize: 30, fontWeight: 700, color: C.gold}}>للتدريب والتطوير المهني</div>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, marginTop: 34}}>
          {ACADEMIES.map((a, i) => {
            const q = pr(f, 92 + i * 12, 16, Easing.out(Easing.back(1.5)));
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 18, padding: '12px 36px', borderRadius: 40, minWidth: 640,
                  background: 'linear-gradient(270deg, rgba(127,230,242,.22), rgba(127,230,242,.03))', border: '1.5px solid rgba(127,230,242,.45)',
                  opacity: Math.min(1, q * 1.5), transform: `translateX(${(1 - q) * 300}px)`,
                }}
              >
                <span style={{fontFamily: numberFamily, fontSize: 34, fontWeight: 900, color: C.gold, fontVariantNumeric: 'lining-nums'}}>{ORD[i]}</span>
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
      <Rays cx={960} cy={300} size={900} o={pr(f, 0, 20)} />
      <div style={{position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <Badge n={ORD[i]} size={180} k={badge} />
      </div>
      <div style={{position: 'absolute', top: 440, left: 100, right: 100}}>
        <div style={{fontSize: 44, fontWeight: 800, color: C.cyan, ...reveal(f, 10)}}>{a.kicker}</div>
        <div style={{fontSize: a.titleSize ?? 110, fontWeight: 900, color: '#fff', lineHeight: 1.25, marginTop: 4, textShadow: '0 6px 30px rgba(0,0,0,.5)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 26}}>
          {words.map((w, k) => {
            const q = pr(f, 16 + k * 5, 12, out);
            return (
              <span key={k} style={{display: 'inline-block', opacity: q, transform: `translateY(${(1 - q) * 30}px) scale(${0.8 + 0.2 * q})`, filter: `blur(${(1 - q) * 8}px)`}}>
                {w}
              </span>
            );
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '28px auto 0'}}>
          <div style={{height: 3, width: 280 * line, background: `linear-gradient(to left, ${C.gold}, transparent)`}} />
          <div style={{width: 14, height: 14, transform: `rotate(45deg) scale(${line})`, background: C.gold}} />
          <div style={{height: 3, width: 280 * line, background: `linear-gradient(to right, ${C.gold}, transparent)`}} />
        </div>
        <div style={{fontSize: 40, fontWeight: 700, color: C.gold, marginTop: 22, ...reveal(f, 40)}}>مقتطفات من برامج الأكاديمية</div>
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
  const scale = interpolate(f, [0, dur + XF], [1.02, 1.08]);
  const tx = interpolate(f, [0, dur + XF], [0, dir * 16]);
  const enter = pr(f, 0, XF, out);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: k === 0 ? 1 : enter}}>
        <OffthreadVideo
          src={staticFile(CLIP_DIR + src)}
          trimBefore={Math.round(from * FPS)}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translateX(${tx}px)`, filter: 'contrast(1.05) saturate(1.06)'}}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ===== مقتطفات الأكاديمية =====
const Montage: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const a = ACADEMIES[i];
  const MONTAGE = montageLen(i);
  let t = 0;
  const shots = a.shots.map((c, k) => {
    const s = {from: t, dur: c[2], c, k};
    t += c[2];
    return s;
  });
  const enter = pr(f, 0, 18, out);
  const pill = pr(f, 10, 18, Easing.out(Easing.back(1.4)));
  const exit = pr(f, MONTAGE - 12, 12);
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
      <AbsoluteFill style={{clipPath: `circle(${enter * 120}% at 50% 50%)`, opacity: 1 - exit}}>
        {shots.map((s) => (
          <Sequence key={s.k} from={s.k === 0 ? 0 : s.from - XF} durationInFrames={s.dur + (s.k === 0 ? 0 : XF)}>
            <Shot src={s.c[0]} from={Math.max(0, s.c[1] - (s.k === 0 ? 0 : XF / FPS))} dur={s.dur} k={s.k} />
          </Sequence>
        ))}
        {/* تظليل فوق وتحت عشان الشعار والعناوين تنقرا */}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,18,48,.85) 0%, rgba(4,18,48,.35) 16%, transparent 28%, transparent 76%, rgba(4,18,48,.55) 88%, rgba(4,18,48,.9) 100%)'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 60%, rgba(4,18,48,.45) 100%)'}} />
      </AbsoluteFill>
      {/* اسم الأكاديمية جنب الشعار */}
      <div style={{position: 'absolute', top: 70, right: 175, left: 0, display: 'flex', justifyContent: 'flex-start', opacity: Math.min(1, pill * 1.4) * (1 - exit)}}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '8px 30px 10px', borderRadius: 40, transform: `translateX(${(1 - pill) * 60}px)`, transformOrigin: 'right center',
            background: 'rgba(4,18,48,.6)', border: `1.5px solid ${C.gold}`, boxShadow: '0 8px 30px rgba(0,0,0,.35)',
          }}
        >
          <span style={{fontFamily: numberFamily, fontSize: 34, fontWeight: 900, color: C.gold, fontVariantNumeric: 'lining-nums'}}>{ORD[i]}</span>
          <span style={{width: 2, height: 30, background: 'rgba(127,230,242,.6)'}} />
          <span style={{fontSize: 36, fontWeight: 800, color: '#fff'}}>{a.name}</span>
        </div>
      </div>
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
          const x = interpolate(k, [b * 0.08, 0.7 + b * 0.08], [-1200, 2600], clamp);
          return <div key={b} style={{position: 'absolute', top: -600, left: x, width: 260 - b * 60, height: 2400, background: colors[b], opacity: 0.9 - b * 0.2, transform: 'rotate(18deg)'}} />;
        })}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {new Array(8).fill(0).map((_, b) => {
        const y = interpolate(k, [b * 0.05, 0.6 + b * 0.05], [H, -400], clamp);
        return <div key={b} style={{position: 'absolute', left: b * 240, top: y, width: 240, height: 300, background: b % 2 ? C.cyan : C.gold, opacity: 0.85}} />;
      })}
    </AbsoluteFill>
  );
};

// ===== الختام =====
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, textAlign: 'center'}}>
      <div style={{position: 'absolute', top: 560, left: 40, right: 40}}>
        <div style={{fontSize: 80, fontWeight: 900, color: '#fff', ...reveal(f, 26, 20)}}>جمعية المعلمين الكويتية</div>
        <div style={{fontSize: 44, fontWeight: 800, color: C.gold, marginTop: 0, ...reveal(f, 40)}}>أكاديميات تصنع الفرق</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 28}}>
          {ACADEMIES.map((a, i) => (
            <div key={i} style={{fontSize: 30, fontWeight: 700, color: C.cyan, padding: '6px 24px', borderRadius: 30, border: '1.5px solid rgba(127,230,242,.45)', ...reveal(f, 54 + i * 8)}}>
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
  return 0.75 * interpolate(f, [0, 10], [0, 1], clamp) * interpolate(f, [total - 50, total], [1, 0], clamp);
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
      <Sequence key={`m${i}`} from={secStart(i) + CARD} durationInFrames={montageLen(i)}>
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
    <Audio src={staticFile('academies/music.mp3')} volume={musicVolume} />
  </AbsoluteFill>
);
