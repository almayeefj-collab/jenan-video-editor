import {AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily, numberFamily} from '../reel/font';
import {C, FPS, INTRO, LOGO, ORD, OUTRO, OVERLAP, outroStart, REC, recStart, RECS, type Rec, SLOGAN, TITLE, totalFrames} from './config';
import {ICONS} from './icons';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const out = Easing.out(Easing.cubic);

// دخول عنصر: يطلع من تحت مع blur
const reveal = (frame: number, delay: number, dur = 16, dist = 36) => {
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 12}px)`, transform: `translateY(${(1 - p) * dist}px)`};
};

// أيقونة Lucide ترسم خطوطها تدريجياً (p من 0 إلى 1)
const Icon: React.FC<{name: string; size: number; color: string; width?: number; p?: number}> = ({name, size, color, width = 1.8, p = 1}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{strokeDasharray: '1 1', strokeDashoffset: 1 - p, overflow: 'visible'}}
    dangerouslySetInnerHTML={{__html: ICONS[name]}}
  />
);

// نص يظهر كلمة كلمة
const Words: React.FC<{text: string; frame: number; delay: number; step?: number}> = ({text, frame, delay, step = 1.3}) => (
  <>
    {text.split(' ').map((w, i) => {
      const p = interpolate(frame - delay - i * step, [0, 12], [0, 1], {...clamp, easing: out});
      return (
        <span key={i} style={{display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 18}px)`}}>
          {w}
          {' '}
        </span>
      );
    })}
  </>
);

// ===== الخلفية: سماء كحلية بنجوم تلمع وكوكب مضيء تحت (نفس فيديو المؤتمر) =====
const STARS = new Array(140).fill(0).map((_, i) => ({
  x: random(`x${i}`) * 1080,
  y: random(`y${i}`) * 1920,
  r: 0.8 + random(`r${i}`) * 1.8,
  o: 0.25 + random(`o${i}`) * 0.6,
  ph: random(`p${i}`) * Math.PI * 2,
}));
const SPARKLES = new Array(7).fill(0).map((_, i) => ({x: 80 + random(`sx${i}`) * 920, y: 60 + random(`sy${i}`) * 1640, ph: random(`sp${i}`) * 6}));

const Sky: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.06;
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 70% at 50% 22%, #174c9a 0%, ${C.navy} 38%, #071c45 70%, ${C.deep} 100%)`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={(s.y - drift * (0.4 + s.r * 0.3) + 1920) % 1920} r={s.r} fill="#fff" opacity={s.o * (0.6 + 0.4 * Math.sin(frame / 14 + s.ph))} />
        ))}
        {SPARKLES.map((s, i) => {
          const k = 0.5 + 0.5 * Math.sin(frame / 18 + s.ph);
          return (
            <g key={i} transform={`translate(${s.x} ${s.y}) scale(${0.6 + k * 0.7}) rotate(${frame * 0.5})`} opacity={0.35 + k * 0.5}>
              <path d="M0 -12 L2.6 -2.6 L12 0 L2.6 2.6 L0 12 L-2.6 2.6 L-12 0 L-2.6 -2.6Z" fill="#c8f3ff" />
            </g>
          );
        })}
      </svg>
      {/* الكوكب */}
      <div
        style={{
          position: 'absolute', left: -420, right: -420, top: 1745, height: 1200, borderRadius: '50%',
          background: 'radial-gradient(60% 40% at 50% 0%, #1d52a6 0%, #0a2350 60%, #05132d 100%)',
          borderTop: '2px solid rgba(200,240,255,.9)',
          boxShadow: `0 -8px 34px rgba(140,210,255,${0.5 + Math.sin(frame / 25) * 0.12}), 0 -50px 140px rgba(60,140,255,.35)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ===== الشعار: كبير في النص بالانترو ثم ينتقل للأعلى، ويرجع للنص في الأوترو =====
const LOGO_RATIO = 824 / 1232;
const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const o = outroStart();
  const pop = spring({frame: frame - 8, fps, config: {damping: 13, mass: 0.9}});
  const up = interpolate(frame, [INTRO - 34, INTRO - 6], [0, 1], {...clamp, easing: ease});
  const back = interpolate(frame, [o, o + 30], [0, 1], {...clamp, easing: ease});
  const big = {h: 440, cy: 560};
  const small = {h: 190, cy: 160};
  const end = {h: 420, cy: 640};
  let h = big.h + (small.h - big.h) * up;
  let cy = big.cy + (small.cy - big.cy) * up;
  if (frame >= o) {
    h = small.h + (end.h - small.h) * back;
    cy = small.cy + (end.cy - small.cy) * back;
  }
  const s = frame < INTRO ? pop : 1;
  const rays = frame < INTRO ? 1 - up : back;
  const glow = 0.5 + 0.2 * Math.sin(frame / 12);
  return (
    <>
      {/* أشعة خلف الشعار */}
      <div
        style={{
          position: 'absolute', left: 540 - 520, top: cy - 520, width: 1040, height: 1040, borderRadius: '50%',
          background: `repeating-conic-gradient(from ${frame * 0.3}deg, rgba(246,182,91,.16) 0deg 5deg, transparent 5deg 15deg)`,
          WebkitMaskImage: 'radial-gradient(circle, black 18%, transparent 62%)',
          opacity: rays * pop,
        }}
      />
      <Img
        src={staticFile(LOGO)}
        style={{
          position: 'absolute', height: h, width: h * LOGO_RATIO, left: 540 - (h * LOGO_RATIO) / 2, top: cy - h / 2,
          transform: `scale(${s})`, opacity: Math.min(1, pop * 1.5),
          filter: `drop-shadow(0 12px 30px rgba(0,0,0,.45)) drop-shadow(0 0 ${30 * glow}px rgba(246,182,91,.35))`,
        }}
      />
    </>
  );
};

// ===== رأس ثابت تحت الشعار طوال التوصيات =====
const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const o = outroStart();
  const vis = interpolate(frame, [INTRO - 14, INTRO + 6], [0, 1], clamp) * interpolate(frame, [o - 4, o + 12], [1, 0], clamp);
  const line = interpolate(frame, [INTRO, INTRO + 24], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', top: 268, left: 40, right: 40, textAlign: 'center', direction: 'rtl', fontFamily, opacity: vis, transform: `translateY(${(1 - vis) * 20}px)`}}>
      <div style={{fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.3}}>أبرز توصيات</div>
      <div style={{fontSize: 56, fontWeight: 900, color: C.gold, lineHeight: 1.3}}>{TITLE}</div>
      <div style={{fontSize: 34, fontWeight: 700, color: C.cyan, marginTop: 4}}>{SLOGAN}</div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 18}}>
        <div style={{width: 250 * line, height: 2, background: `linear-gradient(270deg, ${C.cyan}, transparent)`}} />
        <div style={{width: 14, height: 14, transform: 'rotate(45deg)', background: C.gold, boxShadow: `0 0 16px ${C.gold}`}} />
        <div style={{width: 250 * line, height: 2, background: `linear-gradient(90deg, ${C.cyan}, transparent)`}} />
      </div>
    </div>
  );
};

// ===== تذييل: مؤشر التوصيات والمعلومات =====
const Footer: React.FC = () => {
  const frame = useCurrentFrame();
  const o = outroStart();
  const vis = interpolate(frame, [INTRO - 10, INTRO + 10], [0, 1], clamp);
  const cur = Math.max(0, Math.min(RECS.length - 1, Math.floor((frame - INTRO + 4) / (REC - OVERLAP))));
  const dotsVis = interpolate(frame, [o - 4, o + 10], [1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 44, textAlign: 'center', direction: 'rtl', fontFamily, opacity: vis}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 18, opacity: dotsVis}}>
        {RECS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === cur ? 40 : 11, height: 11, borderRadius: 6,
              background: i < cur ? 'rgba(127,230,242,.75)' : i === cur ? C.gold : 'rgba(255,255,255,.28)',
              boxShadow: i === cur ? `0 0 12px ${C.gold}` : undefined,
            }}
          />
        ))}
      </div>
      <div style={{fontSize: 26, fontWeight: 700, color: '#e9f4ff'}}>
        جمعية المعلمين الكويتية<span style={{color: C.cyan, margin: '0 12px'}}>|</span>4 – 6 أكتوبر 2026<span style={{color: C.cyan, margin: '0 12px'}}>|</span>
        مركز الشيخ جابر الأحمد الثقافي
      </div>
    </div>
  );
};

// ===== انترو =====
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit = interpolate(frame, [INTRO - 40, INTRO - 20], [1, 0], clamp);
  const fadeIn = interpolate(frame, [0, 18], [1, 0], clamp);
  const count = Math.round(interpolate(frame, [96, 136], [1, 15], {...clamp, easing: out}));
  const num = spring({frame: frame - 92, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, textAlign: 'center'}}>
      <div style={{position: 'absolute', top: 820, left: 50, right: 50, opacity: exit}}>
        <div style={{fontSize: 46, fontWeight: 700, color: C.cyan, ...reveal(frame, 26)}}>أبرز توصيات</div>
        <div style={{fontSize: 80, fontWeight: 900, color: '#fff', lineHeight: 1.3, textShadow: '0 0 40px rgba(127,230,242,.35)', ...reveal(frame, 34, 20)}}>
          المؤتمر التربوي
          <br />
          <span style={{color: C.gold}}>السادس والأربعين</span>
        </div>
        <div style={{fontSize: 40, fontWeight: 700, color: C.ink, marginTop: 14, ...reveal(frame, 52)}}>{SLOGAN}</div>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, marginTop: 60}}>
          <div
            style={{
              width: 190, height: 190, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `radial-gradient(circle at 35% 30%, #ffd796, ${C.gold} 45%, ${C.gold2})`,
              boxShadow: `0 0 0 10px rgba(246,182,91,.18), 0 14px 40px rgba(232,138,44,.5)`,
              transform: `scale(${num})`,
            }}
          >
            <span style={{fontFamily: numberFamily, fontSize: 110, fontWeight: 900, color: '#3b1d02', fontVariantNumeric: 'lining-nums'}}>{count}</span>
          </div>
          <div style={{textAlign: 'right', ...reveal(frame, 104)}}>
            <div style={{fontSize: 52, fontWeight: 900, color: '#fff'}}>توصية استراتيجية</div>
            <div style={{fontSize: 34, fontWeight: 600, color: C.cyan}}>الأكثر أثرًا وقابلية للتنفيذ</div>
          </div>
        </div>
      </div>
      <AbsoluteFill style={{background: C.deep, opacity: fadeIn}} />
      <Sequence from={6} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/cinematic-boom.wav')} volume={0.4} />
      </Sequence>
      <Sequence from={28} durationInFrames={FPS * 2}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.35} />
      </Sequence>
      <Sequence from={92} durationInFrames={FPS}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.3} />
      </Sequence>
      <Sequence from={INTRO - 40} durationInFrames={FPS}>
        <Audio src={staticFile('sfx/swoosh-up.wav')} volume={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ===== مشهد التوصية =====
const RecScene: React.FC<{r: Rec; i: number}> = ({r, i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = interpolate(frame, [0, 18], [0, 1], {...clamp, easing: ease});
  const leave = interpolate(frame, [REC - 18, REC], [0, 1], {...clamp, easing: ease});
  const badge = spring({frame: frame - 4, fps, config: {damping: 11, mass: 0.8}});
  const tile = spring({frame: frame - 12, fps, config: {damping: 13}});
  const draw = interpolate(frame, [16, 62], [0, 1], {...clamp, easing: ease});
  const descLine = interpolate(frame, [30, 50], [0, 1], {...clamp, easing: ease});
  const PILLAR = 78;
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
      <div
        style={{
          position: 'absolute', top: 560, left: 54, right: 54, height: 1110, borderRadius: 44, padding: '44px 48px',
          display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(160deg, rgba(255,255,255,.13), rgba(255,255,255,.04))',
          border: '1.5px solid rgba(127,230,242,.38)',
          boxShadow: '0 30px 80px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18)',
          opacity: enter * (1 - leave),
          filter: `blur(${(1 - enter) * 10 + leave * 10}px)`,
          transform: `translateY(${(1 - enter) * 80 - leave * 80}px) scale(${0.96 + 0.04 * enter})`,
        }}
      >
        {/* الرقم والعنوان والأيقونة */}
        <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
          <div style={{position: 'relative', flex: 'none', width: 160, height: 160, transform: `scale(${badge})`}}>
            <div style={{position: 'absolute', inset: -14, borderRadius: '50%', border: `2px dashed ${C.gold}`, opacity: 0.55, transform: `rotate(${frame * 0.8}deg)`}} />
            <div
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: `radial-gradient(circle at 35% 30%, #ffd796, ${C.gold} 45%, ${C.gold2})`, color: '#3b1d02',
                boxShadow: '0 12px 34px rgba(232,138,44,.5)',
              }}
            >
              <span style={{fontSize: 22, fontWeight: 800, lineHeight: 1}}>توصية</span>
              <span style={{fontFamily: numberFamily, fontSize: 74, fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'lining-nums'}}>{String(i + 1).padStart(2, '0')}</span>
            </div>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 30, fontWeight: 700, color: C.cyan, ...reveal(frame, 10)}}>التوصية {ORD[i]}</div>
          </div>
          <div
            style={{
              flex: 'none', width: 150, height: 150, borderRadius: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(145deg, rgba(127,230,242,.25), rgba(60,198,230,.06))', border: '1.5px solid rgba(127,230,242,.55)',
              boxShadow: `0 0 ${36 + Math.sin(frame / 10) * 12}px rgba(127,230,242,.3)`,
              transform: `scale(${tile}) rotate(${(1 - tile) * -20}deg)`,
            }}
          >
            <Icon name={r.icon} size={84} color={C.cyan} width={1.6} p={draw} />
          </div>
        </div>

        <div style={{fontSize: 54, fontWeight: 900, color: '#fff', lineHeight: 1.4, marginTop: 30}}>
          <Words text={r.title} frame={frame} delay={14} step={2} />
        </div>

        {/* الوصف */}
        <div style={{position: 'relative', marginTop: 28, padding: '24px 30px', borderRadius: 26, background: 'rgba(4,18,48,.5)', overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: 7, background: C.gold, transform: `scaleY(${descLine})`, transformOrigin: 'top'}} />
          <div style={{fontSize: 33, fontWeight: 500, color: C.ink, lineHeight: 1.8}}>
            <Words text={r.desc} frame={frame} delay={34} step={1.1} />
          </div>
        </div>

        {/* المحاور */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 'auto'}}>
          {r.pillars.map(([ic, t], k) => {
            const d = PILLAR + k * 18;
            const p = interpolate(frame - d, [0, 18], [0, 1], {...clamp, easing: out});
            const ip = interpolate(frame - d - 6, [0, 26], [0, 1], {...clamp, easing: ease});
            return (
              <div
                key={k}
                style={{
                  display: 'flex', alignItems: 'center', gap: 24, padding: '18px 24px', borderRadius: 26,
                  background: 'linear-gradient(270deg, rgba(127,230,242,.16), rgba(127,230,242,.03))', border: '1px solid rgba(127,230,242,.3)',
                  opacity: p, transform: `translateX(${(1 - p) * 120}px)`, filter: `blur(${(1 - p) * 6}px)`,
                }}
              >
                <div
                  style={{
                    flex: 'none', width: 86, height: 86, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#0b2a62', border: `2px solid ${C.cyan2}`, boxShadow: '0 0 22px rgba(60,198,230,.4)',
                  }}
                >
                  <Icon name={ic} size={44} color="#fff" p={ip} />
                </div>
                <div style={{flex: 1, fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1.35}}>{t}</div>
                <div style={{fontFamily: numberFamily, fontSize: 34, fontWeight: 800, color: C.gold, opacity: 0.9, fontVariantNumeric: 'lining-nums'}}>0{k + 1}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Sequence from={0} durationInFrames={FPS}>
        <Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} />
      </Sequence>
      <Sequence from={4} durationInFrames={FPS}>
        <Audio src={staticFile('sfx/impact.wav')} volume={0.16} />
      </Sequence>
      {r.pillars.map((_, k) => (
        <Sequence key={k} from={PILLAR + k * 18} durationInFrames={15}>
          <Audio src={staticFile('sfx/pop.wav')} volume={0.16} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ===== أوترو =====
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [OUTRO - 30, OUTRO], [0, 1], clamp);
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, textAlign: 'center'}}>
      <div style={{position: 'absolute', top: 900, left: 50, right: 50}}>
        <div style={{fontSize: 70, fontWeight: 900, color: '#fff', ...reveal(frame, 30, 20)}}>جمعية المعلمين الكويتية</div>
        <div style={{fontSize: 44, fontWeight: 700, color: C.gold, marginTop: 10, ...reveal(frame, 44)}}>{`المؤتمر التربوي السادس والأربعون`}</div>
        <div style={{fontSize: 38, fontWeight: 700, color: C.cyan, marginTop: 12, ...reveal(frame, 56)}}>{SLOGAN}</div>
        <div
          style={{
            display: 'inline-block', marginTop: 44, padding: '14px 40px', borderRadius: 999, fontSize: 32, fontWeight: 700, color: '#fff',
            border: `1.5px solid ${C.cyan}`, background: 'rgba(127,230,242,.1)', ...reveal(frame, 70),
          }}
        >
          4 – 6 أكتوبر 2026 · مركز الشيخ جابر الأحمد الثقافي
        </div>
      </div>
      <AbsoluteFill style={{background: C.deep, opacity: fadeOut}} />
      <Sequence from={4} durationInFrames={FPS * 3}>
        <Audio src={staticFile('sfx/cinematic-boom.wav')} volume={0.4} />
      </Sequence>
      <Sequence from={30} durationInFrames={FPS * 2}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.3} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Recommendations46: React.FC = () => {
  const total = totalFrames();
  return (
    <AbsoluteFill style={{background: C.deep}}>
      <Sky />
      <Sequence durationInFrames={INTRO}>
        <Intro />
      </Sequence>
      {RECS.map((r, i) => (
        <Sequence key={i} from={recStart(i)} durationInFrames={REC}>
          <RecScene r={r} i={i} />
        </Sequence>
      ))}
      <Sequence from={outroStart()} durationInFrames={OUTRO}>
        <Outro />
      </Sequence>
      <Header />
      <Footer />
      <Logo />
      <Audio
        src={staticFile('music/background.wav')}
        volume={(f) => 0.5 * interpolate(f, [0, 20], [0, 1], clamp) * interpolate(f, [total - 2 * FPS, total], [1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
