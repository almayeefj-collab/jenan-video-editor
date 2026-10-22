// النسخة الثانية: موشن جرافيك بتعليق صوتي (Marcus) وموسيقى رسمية ورسمة متحركة خاصة لكل توصية
// التوقيت مبني على الـ bars عشان ضربات الموسيقى تجي على بداية كل توصية بالضبط
import {AbsoluteFill, Audio, Easing, getInputProps, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily, numberFamily} from '../../reel/font';
import {C, LOGO, ORD, RECS, SLOGAN, TITLE} from '../config';
import {ICONS} from '../icons';
import {ILLUSTRATIONS} from './Illustrations';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const BAR = 69; // 2.3 ثانية = بار واحد على 104.35 BPM (نفس tools/compose_formal.py)
export const INTRO = 5 * BAR;
export const SLOT = 4 * BAR;
export const OUTRO = 4 * BAR;
const VO_DELAY = 14;
// مدة كل مقطع صوتي بالفريمات (vo00 انترو، vo01..vo15 التوصيات، vo16 الختام)
const VO_SEC = [8.91, 6.4, 6.84, 6.35, 5.64, 6.37, 6.11, 5.56, 6.3, 6.53, 6.27, 6.01, 6.37, 6.92, 6.53, 7.97, 5.72];
const INTRO_VO_AT = 50;
// مجلد ملفات التعليق الصوتي داخل public — يتغير بـ --props='{"voice":"c46/vo2"}'، وفاضي = بدون تعليق
const VOICE: string = (getInputProps() as {voice?: string}).voice ?? 'c46/vo';
const Vo: React.FC<{n: number}> = ({n}) => (VOICE ? <Audio src={staticFile(`${VOICE}/vo${String(n).padStart(2, '0')}.mp3`)} volume={1} /> : null);
const OUTRO_VO_AT = 24;

export const slotStart = (i: number) => INTRO + i * SLOT;
const outroStart = () => slotStart(RECS.length);
export const totalFrames = () => outroStart() + OUTRO;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const out = Easing.out(Easing.cubic);
const pr = (f: number, a: number, d = 16, e = ease) => interpolate(f, [a, a + d], [0, 1], {...clamp, easing: e});

const reveal = (f: number, delay: number, dur = 16, dist = 40) => {
  const k = pr(f, delay, dur);
  return {opacity: k, filter: `blur(${(1 - k) * 12}px)`, transform: `translateY(${(1 - k) * dist}px)`};
};

const Icon: React.FC<{name: string; size: number; color: string; p?: number}> = ({name, size, color, p = 1}) => (
  <svg
    viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
    style={{strokeDasharray: '1 1', strokeDashoffset: 1 - p, overflow: 'visible'}}
    dangerouslySetInnerHTML={{__html: ICONS[name]}}
  />
);

const Sfx: React.FC<{at: number; src: string; v: number; dur?: number}> = ({at, src, v, dur = FPS * 2}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={dur}>
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={v} />
  </Sequence>
);

// ===== الخلفية =====
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
      <div
        style={{
          position: 'absolute', left: -420, right: -420, top: 1770, height: 1200, borderRadius: '50%',
          background: 'radial-gradient(60% 40% at 50% 0%, #1d52a6 0%, #0a2350 60%, #05132d 100%)', borderTop: '2px solid rgba(200,240,255,.9)',
          boxShadow: `0 -8px 34px rgba(140,210,255,${0.5 + Math.sin(f / 25) * 0.12}), 0 -50px 140px rgba(60,140,255,.35)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ===== الشعارين: شعار الجمعية فوق وشعار المؤتمر في النص بالانترو، ثم ينتقلون جنب بعض للأعلى، ويرجعون كبار بالأوترو =====
const KTS_RATIO = 824 / 1232;
const CONF_RATIO = 1176 / 1554;
type Pose = {cx: number; cy: number; h: number};
const lerpPose = (a: Pose, b: Pose, k: number): Pose => ({cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, h: a.h + (b.h - a.h) * k});
const TOP_H = 175;
const KTS = {intro: {cx: 540, cy: 270, h: 320}, top: {cx: 628, cy: 122, h: TOP_H}, outro: {cx: 720, cy: 590, h: 400}};
const CONF = {intro: {cx: 540, cy: 790, h: 520}, top: {cx: 444, cy: 122, h: TOP_H}, outro: {cx: 360, cy: 590, h: 400}};
const pose = (set: typeof KTS, f: number) => {
  const o = outroStart();
  if (f < o) return lerpPose(set.intro, set.top, pr(f, INTRO - 40, 28));
  return lerpPose(set.top, set.outro, pr(f, o + 4, 26));
};

const Logos: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = outroStart();
  const pop = spring({frame: f - 6, fps, config: {damping: 12, mass: 0.9}});
  const k = pose(KTS, f);
  const c = pose(CONF, f);
  const reveal = pr(f, 26, 34);
  const confScale = f < INTRO ? 0.88 + 0.12 * pr(f, 26, 40, out) : 1;
  const rays = f < INTRO ? 1 - pr(f, INTRO - 40, 28) : pr(f, o + 4, 26);
  const divider = pr(f, INTRO - 16, 16) * (1 - pr(f, o, 10));
  return (
    <>
      <div
        style={{
          position: 'absolute', left: c.cx - 520, top: c.cy - 520, width: 1040, height: 1040, borderRadius: '50%',
          background: `repeating-conic-gradient(from ${f * 0.3}deg, rgba(246,182,91,.14) 0deg 5deg, transparent 5deg 15deg)`,
          WebkitMaskImage: 'radial-gradient(circle, black 16%, transparent 60%)', opacity: rays * reveal,
        }}
      />
      <Img
        src={staticFile(LOGO)}
        style={{
          position: 'absolute', height: k.h, width: k.h * KTS_RATIO, left: k.cx - (k.h * KTS_RATIO) / 2, top: k.cy - k.h / 2,
          transform: `scale(${f < INTRO ? pop : 1})`, filter: 'drop-shadow(0 12px 30px rgba(0,0,0,.45)) drop-shadow(0 0 24px rgba(246,182,91,.3))',
        }}
      />
      <Img
        src={staticFile('brand/conf46-logo-light.png')}
        style={{
          position: 'absolute', height: c.h, width: c.h * CONF_RATIO, left: c.cx - (c.h * CONF_RATIO) / 2, top: c.cy - c.h / 2,
          clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)`, transform: `scale(${confScale})`,
          filter: `drop-shadow(0 0 ${18 + 10 * Math.sin(f / 12)}px rgba(127,230,242,.35))`,
        }}
      />
      <div style={{position: 'absolute', left: 539, top: 122 - 70, width: 2, height: 140, background: `linear-gradient(${C.cyan}, ${C.gold})`, opacity: divider, transform: `scaleY(${divider})`}} />
    </>
  );
};

const Header: React.FC = () => {
  const f = useCurrentFrame();
  const o = outroStart();
  const vis = pr(f, INTRO - 10, 20) * (1 - pr(f, o, 14));
  return (
    <div style={{position: 'absolute', top: 222, left: 30, right: 30, textAlign: 'center', direction: 'rtl', fontFamily, opacity: vis}}>
      <div style={{fontSize: 32, fontWeight: 800, color: C.cyan}}>أبرز توصيات <span style={{color: C.gold}}>{TITLE}</span></div>
    </div>
  );
};

const Footer: React.FC = () => {
  const f = useCurrentFrame();
  const o = outroStart();
  const vis = pr(f, INTRO - 10, 20);
  const cur = Math.max(0, Math.min(RECS.length - 1, Math.floor((f - INTRO) / SLOT)));
  const dots = 1 - pr(f, o, 12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', direction: 'rtl', fontFamily, opacity: vis}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 16, opacity: dots}}>
        {RECS.map((_, i) => (
          <div key={i} style={{width: i === cur ? 40 : 11, height: 11, borderRadius: 6, background: i < cur ? 'rgba(127,230,242,.75)' : i === cur ? C.gold : 'rgba(255,255,255,.28)', boxShadow: i === cur ? `0 0 12px ${C.gold}` : undefined}} />
        ))}
      </div>
      <div style={{fontSize: 26, fontWeight: 700, color: '#e9f4ff'}}>
        جمعية المعلمين الكويتية<span style={{color: C.cyan, margin: '0 12px'}}>|</span>4 – 6 أكتوبر 2026<span style={{color: C.cyan, margin: '0 12px'}}>|</span>مركز الشيخ جابر الأحمد الثقافي
      </div>
    </div>
  );
};

// ===== انتقالات الدخول: كل توصية لها حركة دخول مختلفة =====
type Enter = (k: number) => React.CSSProperties;
const stripes = (k: number, n: number, vertical: boolean) => {
  let d = '';
  const size = (vertical ? 1080 : 1920) / n;
  for (let i = 0; i < n; i++) {
    const kk = Math.max(0, Math.min(1, k * 1.6 - (i / n) * 0.6));
    const a = i * size + (size * (1 - kk)) / 2;
    const w = size * kk + 1;
    d += vertical ? `M${a} 0 H${a + w} V1920 H${a}Z ` : `M0 ${a} H1080 V${a + w} H0Z `;
  }
  return `path('${d}')`;
};
const tiles = (k: number) => {
  let d = '';
  const s = 1080 / 6;
  for (let r = 0; r < 11; r++)
    for (let c = 0; c < 6; c++) {
      const kk = Math.max(0, Math.min(1, k * 2 - ((r + c) / 16) * 1));
      const w = s * kk + 0.5;
      const x = c * s + (s - w) / 2;
      const y = r * s + (s - w) / 2;
      d += `M${x} ${y} h${w} v${w} h${-w}Z `;
    }
  return `path('${d}')`;
};
const ENTERS: Enter[] = [
  (k) => ({clipPath: `circle(${k * 120}% at 50% 45%)`}), // دائرة تتفتح
  (k) => ({transform: `translateX(${(1 - k) * 1080}px)`, filter: `blur(${(1 - k) * 14}px)`}), // سحب من اليمين
  (k) => ({transform: `scale(${2.4 - 1.4 * k})`, opacity: k, filter: `blur(${(1 - k) * 18}px)`}), // زوم من الكاميرا
  (k) => ({clipPath: stripes(k, 9, true)}), // ستائر عمودية
  (k) => ({clipPath: `polygon(0 0, ${k * 220}% 0, ${k * 220 - 100}% 100%, 0 100%)`}), // مسح مائل
  (k) => ({transform: `perspective(1400px) rotateY(${(1 - k) * 90}deg)`, opacity: Math.min(1, k * 2)}), // قلب الكرت
  (k) => ({clipPath: `inset(0 ${(1 - k) * 50}% 0 ${(1 - k) * 50}%)`}), // باب ينفتح من النص
  (k) => ({transform: `translateX(${k < 1 ? Math.sin(k * 60) * 40 * (1 - k) : 0}px)`, opacity: k > 0.05 ? 1 : 0, filter: k < 1 ? `hue-rotate(${(1 - k) * 90}deg) contrast(${1 + (1 - k)})` : undefined}), // جلتش رقمي
  (k) => ({transform: `translateY(${(1 - k) * 900}px) scale(${0.7 + 0.3 * k})`}), // يطلع من تحت
  (k) => ({clipPath: `circle(${k * 140}% at 50% 100%)`}), // موجة من تحت
  (k) => ({clipPath: tiles(k)}), // مربعات
  (k) => ({transform: `scale(${1.15 - 0.15 * k})`, opacity: Math.min(1, k * 3)}), // فلاش
  (k) => ({transform: `rotate(${(1 - k) * -25}deg) scale(${0.4 + 0.6 * k})`, opacity: k}), // لفة
  (k) => ({transform: `translateX(${(k - 1) * 1080}px) rotate(${(1 - k) * 8}deg)`}), // من اليسار
  (k) => ({clipPath: `inset(${(1 - k) * 100}% 0 0 0)`}), // ستارة ترتفع
];
const ENTER_DUR = 22;
const EXIT_DUR = 16;

// ستارة انتقال ذهبية/سماوية تمسح الشاشة بين التوصيات
const Wipe: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 24], [0, 1], clamp);
  const style = i % 3;
  const colors = [C.gold, C.cyan, '#ffffff'];
  if (style === 0) {
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        {[0, 1, 2].map((b) => {
          const x = interpolate(k, [b * 0.08, 0.7 + b * 0.08], [-1600, 1600], clamp);
          return <div key={b} style={{position: 'absolute', top: -400, left: x, width: 220 - b * 50, height: 2800, background: colors[b], opacity: 0.9 - b * 0.2, transform: 'rotate(18deg)'}} />;
        })}
      </AbsoluteFill>
    );
  }
  if (style === 1) {
    const r = interpolate(k, [0, 1], [0, 1500]);
    return (
      <AbsoluteFill>
        <div style={{position: 'absolute', left: 540 - r, top: 900 - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `${40 * (1 - k)}px solid ${C.gold}`, opacity: 1 - k}} />
        <div style={{position: 'absolute', left: 540 - r * 0.7, top: 900 - r * 0.7, width: r * 1.4, height: r * 1.4, borderRadius: '50%', border: `${24 * (1 - k)}px solid ${C.cyan}`, opacity: 1 - k}} />
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

// ===== مشهد التوصية =====
const RecScene: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = RECS[i];
  const Art = ILLUSTRATIONS[i];
  const enter = ENTERS[i](pr(f, 0, ENTER_DUR, out));
  const ex = pr(f, SLOT - EXIT_DUR, EXIT_DUR);
  const exitStyle: React.CSSProperties = [
    {transform: `translateY(${-ex * 300}px)`, opacity: 1 - ex, filter: `blur(${ex * 14}px)`},
    {transform: `scale(${1 - ex * 0.35})`, opacity: 1 - ex, filter: `blur(${ex * 12}px)`},
    {transform: `translateX(${-ex * 700}px)`, opacity: 1 - ex},
  ][i % 3];
  const badge = spring({frame: f - 16, fps, config: {damping: 10, mass: 0.7}});
  const titleWords = r.title.split(' ');
  const flash = i === 11 ? 1 - pr(f, 0, 14) : 0;
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
      <AbsoluteFill style={exitStyle}>
        <AbsoluteFill style={enter}>
          {/* الرسمة المتحركة */}
          <svg viewBox="0 0 800 640" width={980} height={784} style={{position: 'absolute', left: 50, top: 300}}>
            <Art f={f} />
          </svg>
          {/* الرقم + اسم التوصية */}
          <div style={{position: 'absolute', top: 1090, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22}}>
            <div
              style={{
                width: 118, height: 118, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `radial-gradient(circle at 35% 30%, #ffd796, ${C.gold} 45%, ${C.gold2})`, boxShadow: `0 0 0 8px rgba(246,182,91,.2), 0 10px 30px rgba(232,138,44,.5)`,
                transform: `scale(${badge}) rotate(${(1 - badge) * -120}deg)`,
              }}
            >
              <span style={{fontFamily: numberFamily, fontSize: 64, fontWeight: 900, color: '#3b1d02', fontVariantNumeric: 'lining-nums'}}>{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div style={{fontSize: 40, fontWeight: 800, color: C.cyan, ...reveal(f, 22)}}>التوصية {ORD[i]}</div>
          </div>
          {/* العنوان كلمة كلمة */}
          <div style={{position: 'absolute', top: 1240, left: 60, right: 60, textAlign: 'center', fontSize: 62, fontWeight: 900, color: '#fff', lineHeight: 1.4, textShadow: '0 6px 30px rgba(0,0,0,.5)'}}>
            {titleWords.map((w, k) => {
              const q = pr(f, VO_DELAY + 18 + k * 4, 12, out);
              return (
                <span key={k} style={{display: 'inline-block', opacity: q, transform: `translateY(${(1 - q) * 30}px) scale(${0.8 + 0.2 * q})`, filter: `blur(${(1 - q) * 8}px)`}}>
                  {w}
                  {' '}
                </span>
              );
            })}
          </div>
          {/* المحاور الثلاث كشرائح */}
          <div style={{position: 'absolute', top: 1545, left: 50, right: 50, display: 'flex', gap: 14, justifyContent: 'center'}}>
            {r.pillars.map(([ic, t], k) => {
              const d = 110 + k * 16;
              const q = pr(f, d, 14, Easing.out(Easing.back(1.6)));
              return (
                <div
                  key={k}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '18px 12px', borderRadius: 24,
                    background: 'linear-gradient(180deg, rgba(127,230,242,.18), rgba(127,230,242,.04))', border: '1.5px solid rgba(127,230,242,.4)',
                    opacity: Math.min(1, q * 1.5), transform: `translateY(${(1 - q) * 80}px) scale(${0.6 + 0.4 * q})`,
                  }}
                >
                  <div style={{width: 70, height: 70, borderRadius: '50%', background: '#0b2a62', border: `2px solid ${C.cyan2}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon name={ic} size={38} color="#fff" p={pr(f, d + 6, 20)} />
                  </div>
                  <div style={{fontSize: 25, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.35}}>{t}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{background: '#fff', opacity: flash * 0.9}} /> : null}
      {/* الصوت */}
      <Sequence from={VO_DELAY}>
        <Vo n={i + 1} />
      </Sequence>
      <Sfx at={0} src="whoosh" v={0.45} />
      <Sfx at={16} src="pop" v={0.3} dur={15} />
      {r.pillars.map((_, k) => (
        <Sfx key={k} at={110 + k * 16} src="pop" v={0.22} dur={15} />
      ))}
      <Sfx at={70} src="shimmer" v={0.18} />
      {i === 3 ? [0, 1, 2, 3].map((k) => <Sfx key={k} at={44 + k * 12} src="tick" v={0.5} dur={6} />) : null}
      {i === 2 ? <Sfx at={54} src="impact" v={0.35} /> : null}
      {i === 8 ? <Sfx at={50} src="riser" v={0.3} /> : null}
      {i === 11 ? <Sfx at={34} src="impact" v={0.3} /> : null}
      <Sfx at={SLOT - EXIT_DUR} src="swoosh-up" v={0.3} dur={20} />
    </AbsoluteFill>
  );
};

// ===== انترو =====
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = 1 - pr(f, INTRO - 44, 20);
  const num = spring({frame: f - 150, fps, config: {damping: 11}});
  const count = Math.round(interpolate(f, [150, 200], [1, 15], {...clamp, easing: out}));
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, textAlign: 'center'}}>
      <div style={{position: 'absolute', top: 1150, left: 40, right: 40, opacity: exit}}>
        <div style={{fontSize: 64, fontWeight: 900, color: '#fff', textShadow: '0 0 40px rgba(127,230,242,.35)', ...reveal(f, 80, 20)}}>أبرز توصيات المؤتمر</div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 40}}>
          <div style={{width: 150, height: 150, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle at 35% 30%, #ffd796, ${C.gold} 45%, ${C.gold2})`, boxShadow: '0 0 0 10px rgba(246,182,91,.18), 0 14px 40px rgba(232,138,44,.5)', transform: `scale(${num})`}}>
            <span style={{fontFamily: numberFamily, fontSize: 88, fontWeight: 900, color: '#3b1d02', fontVariantNumeric: 'lining-nums'}}>{count}</span>
          </div>
          <div style={{textAlign: 'right', ...reveal(f, 158)}}>
            <div style={{fontSize: 54, fontWeight: 900, color: '#fff'}}>توصية استراتيجية</div>
            <div style={{fontSize: 32, fontWeight: 700, color: C.cyan}}>الأكثر أثرًا وقابلية للتنفيذ</div>
          </div>
        </div>
      </div>
      <AbsoluteFill style={{background: C.deep, opacity: 1 - pr(f, 0, 16)}} />
      <Sequence from={INTRO_VO_AT}>
        <Vo n={0} />
      </Sequence>
      <Sfx at={4} src="cinematic-boom" v={0.4} dur={FPS * 3} />
      <Sfx at={40} src="shimmer" v={0.3} />
      <Sfx at={150} src="impact" v={0.3} />
      <Sfx at={INTRO - 44} src="swoosh-up" v={0.4} dur={20} />
    </AbsoluteFill>
  );
};

// ===== أوترو =====
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, textAlign: 'center'}}>
      <div style={{position: 'absolute', top: 870, left: 40, right: 40}}>
        <div style={{fontSize: 72, fontWeight: 900, color: '#fff', ...reveal(f, 26, 20)}}>جمعية المعلمين الكويتية</div>
        <div style={{fontSize: 46, fontWeight: 800, color: C.gold, marginTop: 8, ...reveal(f, 40)}}>المؤتمر التربوي السادس والأربعون</div>
        <div style={{fontSize: 36, fontWeight: 700, color: C.cyan, marginTop: 12, ...reveal(f, 52)}}>{SLOGAN}</div>
        <div style={{display: 'inline-block', marginTop: 40, padding: '14px 40px', borderRadius: 999, fontSize: 32, fontWeight: 700, color: '#fff', border: `1.5px solid ${C.cyan}`, background: 'rgba(127,230,242,.1)', ...reveal(f, 66)}}>
          4 – 6 أكتوبر 2026 · مركز الشيخ جابر الأحمد الثقافي
        </div>
      </div>
      <AbsoluteFill style={{background: C.deep, opacity: pr(f, OUTRO - 36, 36)}} />
      <Sequence from={OUTRO_VO_AT}>
        <Vo n={16} />
      </Sequence>
      <Sfx at={30} src="shimmer" v={0.3} />
    </AbsoluteFill>
  );
};

// الموسيقى تنخفض تحت التعليق الصوتي
const voWindows = () => {
  const w: [number, number][] = [[INTRO_VO_AT, INTRO_VO_AT + VO_SEC[0] * FPS]];
  RECS.forEach((_, i) => w.push([slotStart(i) + VO_DELAY, slotStart(i) + VO_DELAY + VO_SEC[i + 1] * FPS]));
  w.push([outroStart() + OUTRO_VO_AT, outroStart() + OUTRO_VO_AT + VO_SEC[16] * FPS]);
  return w;
};
const WINDOWS = voWindows();
const musicVolume = (f: number) => {
  const total = totalFrames();
  let duck = 0;
  for (const [a, b] of WINDOWS) duck = Math.max(duck, interpolate(f, [a - 8, a, b, b + 12], [0, 1, 1, 0], clamp));
  const base = 0.55 - 0.3 * duck;
  return base * interpolate(f, [0, 10], [0, 1], clamp) * interpolate(f, [total - 40, total], [1, 0], clamp);
};

export const Recommendations46V2: React.FC = () => (
  <AbsoluteFill style={{background: C.deep}}>
    <Sky />
    <Sequence durationInFrames={INTRO}>
      <Intro />
    </Sequence>
    {RECS.map((_, i) => (
      <Sequence key={i} from={slotStart(i)} durationInFrames={SLOT}>
        <RecScene i={i} />
      </Sequence>
    ))}
    <Sequence from={outroStart()} durationInFrames={OUTRO}>
      <Outro />
    </Sequence>
    {RECS.map((_, i) => (
      <Sequence key={i} from={slotStart(i) - 10} durationInFrames={26}>
        <Wipe i={i} />
      </Sequence>
    ))}
    <Header />
    <Footer />
    <Logos />
    <Audio src={staticFile('c46/formal.mp3')} volume={musicVolume} />
  </AbsoluteFill>
);
