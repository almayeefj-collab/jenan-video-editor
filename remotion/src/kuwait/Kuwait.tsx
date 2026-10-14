import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {zoomBlur} from '../reel/zoomBlur';
import {FPS, GOLD, GREEN, INK, NAVY, RED, type SceneKind, timeline, totalFrames, TRANSITION} from './config';
import {Icon, type IconName} from './icons';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const textShadow = '0 6px 30px rgba(0,0,0,0.6)';
const WHITE_SOFT = 'rgba(255,255,255,0.86)';

// دخول عنصر: يطلع من تحت مع blur
const useReveal = (delay: number, dur = 16) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 12}px)`, transform: `translateY(${(1 - p) * 36}px)`};
};

// خروج ناعم لكل النصوص قبل الانتقال
const useExit = (frames: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [frames - TRANSITION - 10, frames - TRANSITION + 4], [1, 0], clamp);
};

const usePop = (delay: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 14, mass: 0.8}});
};

const Pop: React.FC<{at: number; vol?: number; src?: string}> = ({at, vol = 0.18, src = 'sfx/pop.wav'}) => (
  <Sequence from={at} durationInFrames={FPS * 2}>
    <Audio src={staticFile(src)} volume={vol} />
  </Sequence>
);

// ── الخلفية: تدرج كحلي + نقش هندسي يدور ببطء + جزيئات ضوء ──────────────
const Backdrop: React.FC<{tint?: string}> = ({tint = GREEN}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${NAVY} 0%, ${INK} 75%)`, overflow: 'hidden'}}>
      <svg width="100%" height="100%" style={{position: 'absolute', opacity: 0.07}}>
        <defs>
          <pattern id="star8" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform={`rotate(${frame * 0.03}) translate(${frame * 0.2} 0)`}>
            <g fill="none" stroke="#fff" strokeWidth="1.2">
              <rect x="35" y="35" width="50" height="50" />
              <rect x="35" y="35" width="50" height="50" transform="rotate(45 60 60)" />
              <circle cx="60" cy="60" r="12" />
              <path d="M0 60h25 M95 60h25 M60 0v25 M60 95v25" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#star8)" />
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(frame / 90) * 25}% ${30 + Math.cos(frame / 110) * 15}%, ${tint}22 0%, transparent 45%)`,
        }}
      />
      {new Array(26).fill(0).map((_, i) => {
        const x = random(`x${i}`) * 1920;
        const speed = 0.3 + random(`s${i}`) * 0.6;
        const y = 1100 - ((random(`y${i}`) * 1200 + frame * speed) % 1200);
        const size = 2 + random(`r${i}`) * 4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x + Math.sin(frame / 40 + i) * 12, top: y, width: size, height: size, borderRadius: size,
              background: i % 3 === 0 ? GOLD : '#fff', opacity: 0.12 + random(`o${i}`) * 0.25, filter: 'blur(0.5px)',
            }}
          />
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

// ── علم الكويت يتشكل بالتدريج ─────────────────────────────────────────────
const Flag: React.FC<{width: number; delay?: number}> = ({width, delay = 0}) => {
  const frame = useCurrentFrame();
  const h = width / 2;
  const s = (i: number) => interpolate(frame - delay - i * 5, [0, 16], [0, 1], {...clamp, easing: ease});
  const wave = (i: number) => Math.sin((frame - i * 6) / 14) * 2;
  return (
    <svg width={width} height={h} viewBox="0 0 200 100" style={{overflow: 'visible', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'}}>
      <defs>
        <clipPath id="flagclip">
          <rect width="200" height="100" rx="4" />
        </clipPath>
      </defs>
      <g clipPath="url(#flagclip)">
        <rect x={200 - 200 * s(1)} y={wave(1)} width="200" height="34" fill="#007A3D" />
        <rect x={200 - 200 * s(2)} y={33 + wave(2)} width="200" height="34" fill="#FFFFFF" />
        <rect x={200 - 200 * s(3)} y={66 + wave(3)} width="200" height="34" fill="#CE1126" />
        <polygon points="0,0 50,25 50,75 0,100" fill="#000" transform={`translate(${-50 * (1 - s(0))} 0)`} />
      </g>
    </svg>
  );
};

const ArticleBadge: React.FC<{n: string; color?: string; size?: number}> = ({n, color = GOLD, size = 26}) => (
  <span
    style={{
      fontFamily, fontSize: size, fontWeight: 700, color, border: `2px solid ${color}88`, background: `${color}18`,
      borderRadius: 999, padding: `${size * 0.08}px ${size * 0.7}px`, whiteSpace: 'nowrap', display: 'inline-block', lineHeight: 1.5,
    }}
  >
    {n}
  </span>
);

// عنوان المشهد العلوي
const SceneTitle: React.FC<{kicker: string; title: string; article?: string; accent?: string}> = ({kicker, title, article, accent = GOLD}) => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [12, 36], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', top: 70, right: 120, left: 120, direction: 'rtl'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, ...useReveal(2)}}>
        <span style={{fontFamily, fontSize: 34, fontWeight: 600, color: accent}}>{kicker}</span>
        {article ? <ArticleBadge n={article} color={accent} /> : null}
      </div>
      <div style={{fontFamily, fontSize: 76, fontWeight: 900, color: '#fff', lineHeight: 1.3, textShadow, ...useReveal(8, 20)}}>{title}</div>
      <div style={{height: 4, width: 220 * line, background: accent, borderRadius: 4, marginTop: 8, boxShadow: `0 0 16px ${accent}`}} />
    </div>
  );
};

// خط يرسم نفسه بين نقطتين
const DrawLine: React.FC<{d: string; delay: number; dur?: number; color?: string; width?: number; dashed?: boolean}> = ({
  d,
  delay,
  dur = 18,
  color = 'rgba(255,255,255,0.4)',
  width = 3,
  dashed,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs>
        <mask id={`m${delay}${d.length}`}>
          <path d={d} stroke="#fff" strokeWidth={width + 4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        </mask>
      </defs>
      <path
        d={d}
        stroke={color}
        strokeWidth={width}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={dashed ? '10 12' : undefined}
        strokeDashoffset={dashed ? -frame * 1.2 : undefined}
        mask={`url(#m${delay}${d.length})`}
      />
    </svg>
  );
};

// ── ١) المقدمة ────────────────────────────────────────────────────────────
const Intro: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const fadeIn = interpolate(frame, [0, 20], [1, 0], clamp);
  const line = interpolate(frame, [40, 70], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl', opacity: exit}}>
        <div style={{...useReveal(4, 20)}}>
          <Flag width={230} delay={6} />
        </div>
        <div style={{fontFamily, fontSize: 40, fontWeight: 600, color: GOLD, marginTop: 34, ...useReveal(26)}}>دستور دولة الكويت ١٩٦٢</div>
        <div style={{fontFamily, fontSize: 132, fontWeight: 900, color: '#fff', lineHeight: 1.25, textShadow, ...useReveal(34, 22)}}>
          نظام الحكم في دولة الكويت
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 0, margin: '56px 0 26px'}}>
          {['#007A3D', '#FFFFFF', '#CE1126'].map((c) => (
            <div key={c} style={{height: 6, width: 160 * line, background: c}} />
          ))}
        </div>
        <div style={{fontFamily, fontSize: 52, fontWeight: 600, color: WHITE_SOFT, ...useReveal(58)}}>
          السلطات العامة… ووقفة مع <span style={{color: GREEN, fontWeight: 800}}>السلطة التنفيذية</span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: fadeIn}} />
      <Pop at={26} src="sfx/shimmer.wav" vol={0.4} />
      <Pop at={34} src="sfx/cinematic-boom.wav" vol={0.35} />
    </AbsoluteFill>
  );
};

// ── اقتباس مادة من الدستور، الكلمات تظهر وحدة وحدة ──────────────────────
type Seg = {t: string; hl?: boolean};
const QuoteScene: React.FC<{frames: number; kicker: string; article: string; segs: Seg[]; note: string; icon: IconName}> = ({
  frames,
  kicker,
  article,
  segs,
  note,
  icon,
}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const words: {w: string; hl?: boolean}[] = segs.flatMap((s) => s.t.split(' ').filter(Boolean).map((w) => ({w, hl: s.hl})));
  const start = 30;
  const per = 4;
  const iconP = usePop(4);
  return (
    <AbsoluteFill>
      <Backdrop tint={GOLD} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl', opacity: exit, padding: '0 180px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 30}}>
          <div
            style={{
              width: 92, height: 92, borderRadius: 92, border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${GOLD}14`, transform: `scale(${iconP})`, boxShadow: `0 0 40px ${GOLD}33`,
            }}
          >
            <Icon name={icon} size={50} color={GOLD} draw={interpolate(frame, [8, 40], [0, 1], clamp)} />
          </div>
          <div style={{...useReveal(10)}}>
            <div style={{fontFamily, fontSize: 34, fontWeight: 600, color: WHITE_SOFT}}>{kicker}</div>
            <ArticleBadge n={article} size={30} />
          </div>
        </div>
        <div style={{position: 'relative', textAlign: 'center'}}>
          <span style={{position: 'absolute', right: -90, top: -60, fontFamily, fontSize: 200, color: `${GOLD}44`, lineHeight: 1}}>«</span>
          <div style={{fontFamily, fontSize: 64, fontWeight: 700, lineHeight: 1.7, color: '#fff', textShadow}}>
            {words.map(({w, hl}, i) => {
              const p = interpolate(frame - start - i * per, [0, 12], [0, 1], {...clamp, easing: ease});
              const glow = hl ? interpolate(frame - start - i * per, [10, 30], [0, 1], clamp) : 0;
              return (
                <Fragment key={i}>
                  <span
                    style={{
                      display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 20}px)`,
                      color: hl ? GOLD : '#fff', textShadow: hl ? `0 0 ${30 * glow}px ${GOLD}aa` : textShadow,
                    }}
                  >
                    {w}
                  </span>{' '}
                </Fragment>
              );
            })}
          </div>
          <span style={{position: 'absolute', left: -90, bottom: -120, fontFamily, fontSize: 200, color: `${GOLD}44`, lineHeight: 1}}>»</span>
        </div>
        <div style={{fontFamily, fontSize: 38, fontWeight: 600, color: GREEN, marginTop: 40, ...useReveal(start + words.length * per + 14)}}>{note}</div>
      </AbsoluteFill>
      <Pop at={4} src="sfx/impact.wav" vol={0.3} />
      <Pop at={start + words.length * per + 14} src="sfx/shimmer.wav" vol={0.25} />
    </AbsoluteFill>
  );
};

// ── السلطات الثلاث كأعمدة بناء واحد ──────────────────────────────────────
const powers: {icon: IconName; title: string; who: string; article: string; color: string}[] = [
  {icon: 'parliament', title: 'السلطة التشريعية', who: 'يتولاها الأمير ومجلس الأمة', article: 'المادة 51', color: GOLD},
  {icon: 'gear', title: 'السلطة التنفيذية', who: 'يتولاها الأمير ومجلس الوزراء والوزراء', article: 'المادة 52', color: GREEN},
  {icon: 'scales', title: 'السلطة القضائية', who: 'تتولاها المحاكم باسم الأمير', article: 'المادة 53', color: '#7FB2FF'},
];

const Pillars: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const roof = usePop(6);
  const focusAt = 300;
  const focus = interpolate(frame, [focusAt, focusAt + 20], [0, 1], {...clamp, easing: ease});
  const base = interpolate(frame, [20, 44], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{direction: 'rtl', opacity: exit}}>
        {/* السقف */}
        <div style={{position: 'absolute', top: 90, left: 260, right: 260, height: 170, transform: `translateY(${(1 - roof) * -80}px)`, opacity: roof}}>
          <div
            style={{
              position: 'absolute', inset: 0, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
              background: `linear-gradient(to bottom, ${GOLD}55, ${GOLD}18)`,
            }}
          />
          <div style={{position: 'absolute', bottom: 18, width: '100%', textAlign: 'center', fontFamily, fontSize: 40, fontWeight: 800, color: '#fff', textShadow}}>
            الأمة مصدر السلطات جميعاً
          </div>
        </div>
        <div style={{position: 'absolute', top: 268, left: 240, right: 240, height: 10, background: GOLD, borderRadius: 6, opacity: roof, boxShadow: `0 0 20px ${GOLD}88`}} />

        {/* الأعمدة */}
        <div style={{position: 'absolute', top: 300, left: 280, right: 280, display: 'flex', justifyContent: 'space-between'}}>
          {powers.map((p, i) => {
            const d = 40 + i * 26;
            const rise = interpolate(frame - d, [0, 22], [0, 1], {...clamp, easing: ease});
            const isExec = i === 1;
            const dim = isExec ? 1 : 1 - focus * 0.6;
            const scale = isExec ? 1 + focus * 0.08 : 1 - focus * 0.04;
            return (
              <div
                key={i}
                style={{
                  width: 380, height: 470, borderRadius: 26, position: 'relative', overflow: 'hidden',
                  background: `linear-gradient(to bottom, ${p.color}26, rgba(10,18,32,0.85))`,
                  border: `2px solid ${p.color}${isExec && focus > 0 ? 'ff' : '66'}`,
                  boxShadow: isExec ? `0 0 ${60 * focus}px ${p.color}88` : undefined,
                  opacity: rise * dim, filter: `grayscale(${isExec ? 0 : focus * 0.7})`,
                  transform: `translateY(${(1 - rise) * 120}px) scale(${scale})`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 44, textAlign: 'center',
                }}
              >
                {/* خطوط العمود */}
                {[0, 1, 2, 3].map((k) => (
                  <div key={k} style={{position: 'absolute', top: 0, bottom: 0, left: 60 + k * 86, width: 2, background: `${p.color}14`}} />
                ))}
                <div
                  style={{
                    width: 120, height: 120, borderRadius: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${p.color}22`, border: `2px solid ${p.color}`,
                  }}
                >
                  <Icon name={p.icon} size={64} color={p.color} draw={interpolate(frame - d - 8, [0, 30], [0, 1], clamp)} />
                </div>
                <div style={{fontFamily, fontSize: 42, fontWeight: 900, color: '#fff', marginTop: 28, whiteSpace: 'nowrap'}}>{p.title}</div>
                <div style={{fontFamily, fontSize: 29, fontWeight: 600, color: WHITE_SOFT, marginTop: 14, padding: '0 34px', lineHeight: 1.5}}>{p.who}</div>
                <div style={{position: 'absolute', bottom: 28}}>
                  <ArticleBadge n={p.article} color={p.color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* خطوط التعاون بين الأعمدة */}
        <div style={{opacity: 1 - focus}}>
          <DrawLine d="M 1260 540 L 1150 540" delay={130} color={`${GOLD}cc`} dashed />
          <DrawLine d="M 770 540 L 660 540" delay={140} color={`${GOLD}cc`} dashed />
        </div>

        {/* القاعدة */}
        <div
          style={{
            position: 'absolute', top: 806, left: 240, right: 240, height: 84, borderRadius: 14,
            background: 'rgba(255,255,255,0.06)', border: `1px solid ${GOLD}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22,
            transform: `scaleX(${base})`, opacity: base,
          }}
        >
          <span style={{fontFamily, fontSize: 36, fontWeight: 800, color: GOLD}}>الدستور</span>
          <span style={{fontFamily, fontSize: 34, fontWeight: 600, color: '#fff', ...useReveal(140)}}>فصلٌ بين السلطات مع تعاونها</span>
          <ArticleBadge n="المادة 50" />
        </div>

        {/* الإشارة إلى محور الحديث */}
        <div
          style={{
            position: 'absolute', top: 930, width: '100%', textAlign: 'center', fontFamily, fontSize: 40, fontWeight: 800, color: GREEN,
            opacity: focus, transform: `translateY(${(1 - focus) * 20}px)`,
          }}
        >
          ▲ وحديثنا اليوم عن السلطة التنفيذية
        </div>
      </AbsoluteFill>
      <Pop at={6} src="sfx/impact.wav" vol={0.3} />
      {powers.map((_, i) => (
        <Pop key={i} at={40 + i * 26} src="sfx/swoosh-up.wav" vol={0.3} />
      ))}
      <Pop at={focusAt} src="sfx/cinematic-boom.wav" vol={0.35} />
    </AbsoluteFill>
  );
};

// ── شاشة فصل ──────────────────────────────────────────────────────────────
const Chapter: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const ring = interpolate(frame, [0, frames], [0.6, 1.35]);
  const line = interpolate(frame, [20, 45], [0, 1], {...clamp, easing: ease});
  const accent = GREEN;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl'}}>
      <Backdrop tint={GREEN} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute', width: 700 + i * 260, height: 700 + i * 260, borderRadius: '50%',
            border: `2px solid ${accent}`, opacity: 0.14 - i * 0.03, transform: `scale(${ring}) rotate(${frame * (i % 2 ? -0.2 : 0.2)}deg)`,
            borderStyle: i === 1 ? 'dashed' : 'solid',
          }}
        />
      ))}
      <div style={{textAlign: 'center', opacity: exit, position: 'relative'}}>
        <div style={{display: 'flex', justifyContent: 'center', ...useReveal(2)}}>
          <Icon name="gear" size={90} color={accent} stroke={1.4} draw={interpolate(frame, [0, 30], [0, 1], clamp)} />
        </div>
        <div style={{fontFamily, fontSize: 44, fontWeight: 600, color: accent, marginTop: 12, ...useReveal(6)}}>محور حديثنا</div>
        <div style={{fontFamily, fontSize: 150, fontWeight: 900, color: '#fff', lineHeight: 1.25, textShadow: `0 0 50px ${accent}55`, ...useReveal(14, 20)}}>
          السلطة التنفيذية
        </div>
        <div style={{height: 4, width: 420 * line, background: accent, margin: '10px auto 26px', borderRadius: 4, boxShadow: `0 0 18px ${accent}`}} />
        <div style={{fontFamily, fontSize: 44, fontWeight: 500, color: WHITE_SOFT, ...useReveal(30)}}>
          من يتولاها؟ وما صلاحياتها؟ ومن يراقبها؟
        </div>
      </div>
      <Pop at={0} src="sfx/cinematic-riser.wav" vol={0.35} />
      <Pop at={14} src="sfx/impact.wav" vol={0.35} />
    </AbsoluteFill>
  );
};

// ── الهيكل: الأمير ← مجلس الوزراء ← الوزراء ──────────────────────────────
const Node: React.FC<{x: number; y: number; w: number; h: number; delay: number; color: string; icon?: IconName; title: string; sub?: string; size?: number}> = ({
  x,
  y,
  w,
  h,
  delay,
  color,
  icon,
  title,
  sub,
  size = 44,
}) => {
  const p = usePop(delay);
  return (
    <div
      style={{
        position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 22,
        background: `linear-gradient(135deg, ${color}30, rgba(10,18,32,0.92))`, border: `2px solid ${color}`,
        boxShadow: `0 0 34px ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
        transform: `scale(${p})`, opacity: Math.min(1, p * 1.5), direction: 'rtl',
      }}
    >
      {icon ? <Icon name={icon} size={size * 1.15} color={color} /> : null}
      <div style={{textAlign: 'center'}}>
        <div style={{fontFamily, fontSize: size, fontWeight: 900, color: '#fff', lineHeight: 1.3}}>{title}</div>
        {sub ? <div style={{fontFamily, fontSize: size * 0.6, fontWeight: 600, color: WHITE_SOFT}}>{sub}</div> : null}
      </div>
    </div>
  );
};

const ministries = ['الداخلية', 'الخارجية', 'المالية', 'التربية', 'الصحة', 'العدل'];

const Structure: React.FC<{frames: number}> = ({frames}) => {
  const exit = useExit(frames);
  const mx = (i: number) => 1580 - i * 248; // من اليمين لليسار
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="من يتولّى السلطة التنفيذية؟" title="ثلاثة مكوّنات" article="المادة 52" accent={GREEN} />
        <DrawLine d="M 960 395 L 960 470" delay={30} color={`${GOLD}aa`} />
        <DrawLine d="M 960 590 L 960 640 M 1580 640 L 340 640" delay={62} color={`${GREEN}aa`} />
        {ministries.map((_, i) => (
          <DrawLine key={i} d={`M ${mx(i)} 640 L ${mx(i)} 690`} delay={78 + i * 4} color={`${GREEN}aa`} />
        ))}
        <Node x={960} y={340} w={520} h={110} delay={14} color={GOLD} icon="crown" title="الأمير" sub="رئيس الدولة" />
        <Node x={960} y={530} w={660} h={120} delay={44} color={GREEN} icon="users" title="مجلس الوزراء" sub="برئاسة رئيس مجلس الوزراء" />
        {ministries.map((m, i) => (
          <Node key={m} x={mx(i)} y={745} w={220} h={110} delay={86 + i * 6} color="#7FB2FF" icon="briefcase" title="وزير" sub={m} size={34} />
        ))}
        <div
          style={{
            position: 'absolute', bottom: 70, left: 200, right: 200, textAlign: 'center', direction: 'rtl', fontFamily, fontSize: 36,
            fontWeight: 600, color: WHITE_SOFT, lineHeight: 1.6, ...useReveal(150, 20),
          }}
        >
          «السلطة التنفيذية يتولاها <span style={{color: GOLD}}>الأمير</span> و<span style={{color: GREEN}}>مجلس الوزراء</span> و
          <span style={{color: '#7FB2FF'}}>الوزراء</span> على النحو المبيّن بالدستور»
        </div>
      </AbsoluteFill>
      <Pop at={14} />
      <Pop at={44} />
      {ministries.map((_, i) => (
        <Pop key={i} at={86 + i * 6} vol={0.1} src="sfx/tick.wav" />
      ))}
    </AbsoluteFill>
  );
};

// ── الأمير ────────────────────────────────────────────────────────────────
const Seal: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(6);
  return (
    <div style={{position: 'absolute', left: 190, top: 250, width: 560, height: 560, transform: `scale(${p})`}}>
      <svg width={560} height={560} viewBox="0 0 560 560" style={{position: 'absolute', overflow: 'visible'}}>
        <circle cx={280} cy={280} r={270} fill="none" stroke={`${GOLD}55`} strokeWidth={2} />
        <circle cx={280} cy={280} r={196} fill={`${GOLD}12`} stroke={GOLD} strokeWidth={3} />
        <g transform={`rotate(${frame * 0.25} 280 280)`}>
          <circle cx={280} cy={280} r={262} fill="none" stroke={`${GOLD}88`} strokeWidth={2} strokeDasharray="4 14" />
          <circle cx={280} cy={280} r={228} fill="none" stroke={GOLD} strokeWidth={14} strokeDasharray="2 22" opacity={0.6} />
        </g>
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <Icon name="crown" size={150} color={GOLD} stroke={1.2} draw={interpolate(frame, [10, 50], [0, 1], clamp)} />
        <div style={{fontFamily, fontSize: 64, fontWeight: 900, color: '#fff', marginTop: 6, textShadow}}>الأمير</div>
      </div>
    </div>
  );
};

const PointCard: React.FC<{icon: IconName; text: string; article: string; delay: number; color: string; width?: number}> = ({
  icon,
  text,
  article,
  delay,
  color,
  width = 900,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 18], [0, 1], {...clamp, easing: ease});
  return (
    <div
      style={{
        width, display: 'flex', alignItems: 'center', gap: 26, padding: '22px 30px', borderRadius: 20, marginBottom: 22,
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRight: `6px solid ${color}`,
        opacity: p, transform: `translateX(${(1 - p) * 80}px)`, direction: 'rtl',
      }}
    >
      <Icon name={icon} size={52} color={color} draw={interpolate(frame - delay - 6, [0, 24], [0, 1], clamp)} />
      <span style={{flex: 1, fontFamily, fontSize: 40, fontWeight: 700, color: '#fff'}}>{text}</span>
      <ArticleBadge n={article} color={color} size={24} />
    </div>
  );
};

const Emir: React.FC<{frames: number}> = ({frames}) => {
  const exit = useExit(frames);
  return (
    <AbsoluteFill>
      <Backdrop tint={GOLD} />
      <AbsoluteFill style={{opacity: exit}}>
        <Seal />
        <div style={{position: 'absolute', right: 120, top: 150, direction: 'rtl'}}>
          <div style={{fontFamily, fontSize: 36, fontWeight: 600, color: GOLD, ...useReveal(10)}}>المكوّن الأول</div>
          <div style={{fontFamily, fontSize: 92, fontWeight: 900, color: '#fff', lineHeight: 1.3, textShadow, ...useReveal(18, 20)}}>الأمير رئيس الدولة</div>
          <div style={{fontFamily, fontSize: 36, fontWeight: 500, color: WHITE_SOFT, marginBottom: 40, ...useReveal(30)}}>
            يقف على رأس السلطات الثلاث، ويمارس سلطته التنفيذية عبر الحكومة
          </div>
          <PointCard icon="shield" text="ذاته مصونة لا تُمس" article="المادة 54" delay={60} color={GOLD} />
          <PointCard icon="users" text="يتولى سلطاته بواسطة وزرائه" article="المادة 55" delay={90} color={GOLD} />
          <PointCard icon="star" text="القائد الأعلى للقوة المسلحة" article="المادة 67" delay={120} color={GOLD} />
        </div>
      </AbsoluteFill>
      <Pop at={6} src="sfx/cinematic-boom.wav" vol={0.3} />
      {[60, 90, 120].map((t) => (
        <Pop key={t} at={t} src="sfx/swoosh-down.wav" vol={0.25} />
      ))}
    </AbsoluteFill>
  );
};

// ── صلاحيات الأمير التنفيذية ─────────────────────────────────────────────
const emirPowers: {icon: IconName; title: string; sub: string; article: string}[] = [
  {icon: 'idcard', title: 'تعيين رئيس مجلس الوزراء والوزراء', sub: 'وإعفاؤهم من مناصبهم', article: 'المادة 56'},
  {icon: 'doc', title: 'وضع اللوائح لتنفيذ القوانين', sub: 'دون تعديلها أو تعطيلها', article: 'المادة 72'},
  {icon: 'pen', title: 'إبرام المعاهدات بمرسوم', sub: 'ويبلّغها مجلس الأمة فوراً', article: 'المادة 70'},
  {icon: 'shield', title: 'إعلان الحرب الدفاعية بمرسوم', sub: 'أما الحرب الهجومية فمحرّمة', article: 'المادة 68'},
  {icon: 'briefcase', title: 'تعيين الموظفين والممثلين السياسيين', sub: 'المدنيين والعسكريين وفقاً للقانون', article: 'المادة 74'},
  {icon: 'bolt', title: 'مراسيم الضرورة', sub: 'لها قوة القانون عند غياب مجلس الأمة', article: 'المادة 71'},
];

const Powers: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  return (
    <AbsoluteFill>
      <Backdrop tint={GOLD} />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="بنصوص الدستور" title="صلاحيات الأمير التنفيذية" />
        <div style={{position: 'absolute', top: 320, left: 120, right: 120, display: 'flex', flexWrap: 'wrap', gap: 30, direction: 'rtl'}}>
          {emirPowers.map((p, i) => {
            const d = 40 + i * 22;
            const s = usePop(d);
            return (
              <div
                key={i}
                style={{
                  width: (1680 - 60) / 3, height: 310, borderRadius: 24, padding: '34px 34px 0', position: 'relative',
                  background: 'linear-gradient(160deg, rgba(227,185,100,0.16), rgba(10,18,32,0.9) 60%)',
                  border: `1px solid ${GOLD}55`, transform: `scale(${s}) translateY(${(1 - s) * 40}px)`, opacity: Math.min(1, s * 1.4),
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{width: 84, height: 84, borderRadius: 20, background: `${GOLD}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon name={p.icon} size={50} color={GOLD} draw={interpolate(frame - d - 6, [0, 26], [0, 1], clamp)} />
                  </div>
                  <ArticleBadge n={p.article} size={24} />
                </div>
                <div style={{fontFamily, fontSize: 34, fontWeight: 800, color: '#fff', marginTop: 22, lineHeight: 1.35}}>{p.title}</div>
                <div style={{fontFamily, fontSize: 28, fontWeight: 500, color: WHITE_SOFT, marginTop: 8}}>{p.sub}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {emirPowers.map((_, i) => (
        <Pop key={i} at={40 + i * 22} />
      ))}
    </AbsoluteFill>
  );
};

// ── تشكيل الحكومة ─────────────────────────────────────────────────────────
const steps: {icon: IconName; title: string; sub: string}[] = [
  {icon: 'chat', title: 'المشاورات التقليدية', sub: 'يجريها الأمير قبل التعيين'},
  {icon: 'crown', title: 'تعيين رئيس مجلس الوزراء', sub: 'يعيّنه الأمير ويعفيه'},
  {icon: 'users', title: 'تعيين الوزراء', sub: 'بترشيح من رئيس مجلس الوزراء'},
  {icon: 'book', title: 'أداء اليمين أمام الأمير', sub: 'قبل تولّي الصلاحيات (م 126)'},
];

const Formation: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const xs = [1530, 1150, 770, 390];
  const prog = interpolate(frame, [40, 40 + 3 * 34], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="خطوة بخطوة" title="كيف تتشكّل الحكومة؟" article="المادة 56" accent={GREEN} />
        <div style={{position: 'absolute', top: 452, left: xs[3], width: xs[0] - xs[3], height: 4, background: 'rgba(255,255,255,0.15)'}} />
        <div
          style={{
            position: 'absolute', top: 452, right: 1920 - xs[0], width: (xs[0] - xs[3]) * prog, height: 4, background: GREEN,
            boxShadow: `0 0 16px ${GREEN}`,
          }}
        />
        {steps.map((s, i) => {
          const d = 40 + i * 34;
          const p = usePop(d);
          return (
            <div key={i} style={{position: 'absolute', left: xs[i] - 170, top: 360, width: 340, textAlign: 'center', direction: 'rtl'}}>
              <div
                style={{
                  width: 188, height: 188, margin: '0 auto', borderRadius: 188, background: INK, border: `3px solid ${GREEN}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, boxShadow: `0 0 40px ${GREEN}44`,
                  position: 'relative',
                }}
              >
                <Icon name={s.icon} size={84} color={GREEN} draw={interpolate(frame - d - 4, [0, 26], [0, 1], clamp)} />
                <div
                  style={{
                    position: 'absolute', top: -6, right: -6, width: 56, height: 56, borderRadius: 56, background: GREEN, color: INK,
                    fontFamily, fontSize: 32, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {['١', '٢', '٣', '٤'][i]}
                </div>
              </div>
              <div style={{fontFamily, fontSize: 36, fontWeight: 800, color: '#fff', marginTop: 26, lineHeight: 1.35, ...useReveal(d + 6)}}>{s.title}</div>
              <div style={{fontFamily, fontSize: 27, fontWeight: 500, color: WHITE_SOFT, marginTop: 8, ...useReveal(d + 12)}}>{s.sub}</div>
            </div>
          );
        })}
        <div style={{position: 'absolute', bottom: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40, direction: 'rtl'}}>
          {[
            {icon: 'parliament' as IconName, t: 'يُعيَّن الوزراء من أعضاء مجلس الأمة ومن غيرهم'},
            {icon: 'chart' as IconName, t: 'لا يزيد عددهم على ثلث أعضاء مجلس الأمة'},
          ].map((c, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 18, padding: '18px 32px', borderRadius: 18, background: `${GOLD}14`,
                border: `1px solid ${GOLD}66`, ...useReveal(200 + i * 20),
              }}
            >
              <Icon name={c.icon} size={42} color={GOLD} />
              <span style={{fontFamily, fontSize: 32, fontWeight: 700, color: '#fff'}}>{c.t}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      {steps.map((_, i) => (
        <Pop key={i} at={40 + i * 34} />
      ))}
      <Pop at={200} src="sfx/shimmer.wav" vol={0.25} />
    </AbsoluteFill>
  );
};

// ── المهام: مجلس الوزراء / رئيسه / الوزير ────────────────────────────────
const roles: {icon: IconName; title: string; article: string; color: string; items: string[]}[] = [
  {
    icon: 'users', title: 'مجلس الوزراء', article: 'المادة 123', color: GREEN,
    items: ['يهيمن على مصالح الدولة', 'يرسم السياسة العامة للحكومة ويتابع تنفيذها', 'يشرف على سير العمل في الإدارات الحكومية'],
  },
  {
    icon: 'crown', title: 'رئيس مجلس الوزراء', article: 'المادة 127', color: GOLD,
    items: ['يرأس جلسات مجلس الوزراء', 'ينسّق الأعمال بين الوزارات المختلفة', 'لا يتولى أي وزارة (م 102)'],
  },
  {
    icon: 'briefcase', title: 'الوزير', article: 'المادة 130', color: '#7FB2FF',
    items: ['يشرف على شؤون وزارته', 'ينفّذ فيها السياسة العامة للحكومة', 'يرسم اتجاهات الوزارة ويتابع تنفيذها'],
  },
];

const Council: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="توزيع الأدوار" title="المهام والاختصاصات" accent={GREEN} />
        <div style={{position: 'absolute', top: 320, left: 120, right: 120, display: 'flex', gap: 36, direction: 'rtl'}}>
          {roles.map((r, i) => {
            const d = 30 + i * 70;
            const p = interpolate(frame - d, [0, 20], [0, 1], {...clamp, easing: ease});
            return (
              <div
                key={i}
                style={{
                  flex: 1, height: 560, borderRadius: 26, padding: 36, background: `linear-gradient(to bottom, ${r.color}22, rgba(10,18,32,0.9) 45%)`,
                  border: `1px solid ${r.color}66`, borderTop: `6px solid ${r.color}`, opacity: p, transform: `translateY(${(1 - p) * 70}px)`,
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                  <Icon name={r.icon} size={58} color={r.color} draw={interpolate(frame - d, [0, 26], [0, 1], clamp)} />
                  <div>
                    <div style={{fontFamily, fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.3}}>{r.title}</div>
                    <ArticleBadge n={r.article} color={r.color} size={22} />
                  </div>
                </div>
                <div style={{marginTop: 30}}>
                  {r.items.map((it, k) => (
                    <div key={k} style={{display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24, ...useReveal(d + 18 + k * 12)}}>
                      <div style={{marginTop: 18, width: 12, height: 12, borderRadius: 3, transform: 'rotate(45deg)', background: r.color, flexShrink: 0}} />
                      <span style={{fontFamily, fontSize: 34, fontWeight: 600, color: WHITE_SOFT, lineHeight: 1.5}}>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: 'absolute', bottom: 56, width: '100%', textAlign: 'center', fontFamily, fontSize: 32, fontWeight: 600, color: WHITE_SOFT,
            direction: 'rtl', ...useReveal(270),
          }}
        >
          <span style={{color: GOLD}}>✦</span> استقالة رئيس مجلس الوزراء تتضمّن استقالة سائر الوزراء <ArticleBadge n="المادة 129" size={22} />
        </div>
      </AbsoluteFill>
      {roles.map((_, i) => (
        <Pop key={i} at={30 + i * 70} src="sfx/swoosh-up.wav" vol={0.28} />
      ))}
    </AbsoluteFill>
  );
};

// ── الرقابة والمسؤولية ────────────────────────────────────────────────────
const parliamentTools: {icon: IconName; t: string; a: string}[] = [
  {icon: 'question', t: 'السؤال البرلماني', a: 'م 99'},
  {icon: 'mic', t: 'الاستجواب', a: 'م 100'},
  {icon: 'vote', t: 'طرح الثقة بالوزير', a: 'م 101'},
  {icon: 'unlink', t: 'عدم التعاون مع رئيس مجلس الوزراء', a: 'م 102'},
];

const Accountability: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const panel = (d: number) => interpolate(frame - d, [0, 22], [0, 1], {...clamp, easing: ease});
  const tilt = Math.sin(frame / 22) * 3;
  return (
    <AbsoluteFill>
      <Backdrop tint={RED} />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="السلطة لا تعمل بلا محاسبة" title="المسؤولية والرقابة" accent={RED} />
        <div style={{position: 'absolute', top: 300, left: 120, right: 120, height: 600, display: 'flex', gap: 40, direction: 'rtl', alignItems: 'stretch'}}>
          {/* أمام الأمير */}
          <div
            style={{
              width: 640, borderRadius: 26, padding: 40, background: `linear-gradient(160deg, ${GOLD}24, rgba(10,18,32,0.9) 55%)`,
              border: `1px solid ${GOLD}66`, opacity: panel(24), transform: `translateX(${(1 - panel(24)) * 80}px)`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <Icon name="crown" size={60} color={GOLD} />
              <span style={{fontFamily, fontSize: 46, fontWeight: 900, color: '#fff'}}>أمام الأمير</span>
              <ArticleBadge n="المادة 58" size={22} />
            </div>
            <div style={{fontFamily, fontSize: 36, fontWeight: 700, color: GOLD, marginTop: 34, lineHeight: 1.5, ...useReveal(46)}}>
              مسؤولية تضامنية
            </div>
            <div style={{fontFamily, fontSize: 32, fontWeight: 600, color: WHITE_SOFT, lineHeight: 1.6, ...useReveal(56)}}>
              رئيس مجلس الوزراء والوزراء مسؤولون بالتضامن عن السياسة العامة للدولة
            </div>
            <div style={{height: 1, background: `${GOLD}44`, margin: '26px 0'}} />
            <div style={{fontFamily, fontSize: 32, fontWeight: 600, color: WHITE_SOFT, lineHeight: 1.6, ...useReveal(76)}}>
              ويُسأل كل وزير عن أعمال وزارته
            </div>
          </div>

          {/* الميزان في الوسط */}
          <div style={{width: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: panel(10)}}>
            <div style={{transform: `rotate(${tilt}deg)`}}>
              <Icon name="scales" size={100} color="rgba(255,255,255,0.55)" stroke={1.2} />
            </div>
          </div>

          {/* أمام مجلس الأمة */}
          <div
            style={{
              flex: 1, borderRadius: 26, padding: 40, background: `linear-gradient(160deg, ${GREEN}24, rgba(10,18,32,0.9) 55%)`,
              border: `1px solid ${GREEN}66`, opacity: panel(110), transform: `translateX(${(1 - panel(110)) * -80}px)`,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <Icon name="parliament" size={60} color={GREEN} />
              <span style={{fontFamily, fontSize: 46, fontWeight: 900, color: '#fff'}}>أمام مجلس الأمة</span>
            </div>
            <div style={{marginTop: 28}}>
              {parliamentTools.map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 18, padding: '14px 20px', borderRadius: 14, marginBottom: 14,
                    background: 'rgba(255,255,255,0.05)', ...useReveal(140 + i * 22),
                  }}
                >
                  <Icon name={t.icon} size={40} color={GREEN} />
                  <span style={{flex: 1, fontFamily, fontSize: 30, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap'}}>{t.t}</span>
                  <ArticleBadge n={t.a} color={GREEN} size={22} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute', bottom: 64, width: '100%', textAlign: 'center', fontFamily, fontSize: 31, fontWeight: 600, color: WHITE_SOFT,
            direction: 'rtl', ...useReveal(260),
          }}
        >
          وعند تقرير عدم التعاون يُرفع الأمر للأمير: <span style={{color: GOLD}}>إعفاء رئيس مجلس الوزراء وتعيين وزارة جديدة</span> أو{' '}
          <span style={{color: GOLD}}>حلّ مجلس الأمة</span>
        </div>
      </AbsoluteFill>
      <Pop at={24} src="sfx/swoosh-down.wav" vol={0.28} />
      <Pop at={110} src="sfx/swoosh-down.wav" vol={0.28} />
      {parliamentTools.map((_, i) => (
        <Pop key={i} at={140 + i * 22} />
      ))}
      <Pop at={260} src="sfx/impact.wav" vol={0.25} />
    </AbsoluteFill>
  );
};

// ── الخاتمة ───────────────────────────────────────────────────────────────
const Outro: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [frames - 30, frames], [0, 1], clamp);
  const chips = [
    {t: 'الأمير', c: GOLD},
    {t: 'مجلس الوزراء', c: GREEN},
    {t: 'الوزراء', c: '#7FB2FF'},
  ];
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl'}}>
        <div style={{fontFamily, fontSize: 40, fontWeight: 600, color: GOLD, ...useReveal(4)}}>الخلاصة</div>
        <div style={{fontFamily, fontSize: 110, fontWeight: 900, color: '#fff', textShadow, lineHeight: 1.3, ...useReveal(10, 20)}}>السلطة التنفيذية</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, margin: '20px 0 36px'}}>
          {chips.map((c, i) => (
            <Fragment key={c.t}>
              {i > 0 ? <span style={{fontFamily, fontSize: 56, color: 'rgba(255,255,255,0.5)', ...useReveal(30 + i * 12)}}>+</span> : null}
              <span
                style={{
                  fontFamily, fontSize: 48, fontWeight: 800, color: c.c, border: `2px solid ${c.c}`, background: `${c.c}1a`, borderRadius: 999,
                  padding: '6px 40px', ...useReveal(30 + i * 12),
                }}
              >
                {c.t}
              </span>
            </Fragment>
          ))}
        </div>
        <div style={{fontFamily, fontSize: 46, fontWeight: 600, color: WHITE_SOFT, ...useReveal(80, 20)}}>
          تنفّذ القوانين، وترسم السياسة العامة، وتخضع لرقابة الأمة
        </div>
        <div style={{marginTop: 60, ...useReveal(130, 20)}}>
          <Flag width={150} delay={130} />
        </div>
        <div style={{fontFamily, fontSize: 54, fontWeight: 800, color: GOLD, marginTop: 24, textShadow: `0 0 30px ${GOLD}55`, ...useReveal(150, 20)}}>
          فصلٌ بين السلطات… وتعاونٌ من أجل الكويت
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: fadeOut}} />
      <Pop at={8} src="sfx/cinematic-boom.wav" vol={0.4} />
      <Pop at={150} src="sfx/shimmer.wav" vol={0.35} />
    </AbsoluteFill>
  );
};

// شريط صغير ثابت أعلى الشاشة بعنوان السلسلة
const Hud: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 20, dur - 20, dur], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 36, left: 50, display: 'flex', alignItems: 'center', gap: 14, opacity: o * 0.8}}>
      <span style={{fontFamily, fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.75)'}}>السلطات العامة في دولة الكويت</span>
      <svg width={42} height={21} viewBox="0 0 200 100">
        <rect width="200" height="34" fill="#007A3D" />
        <rect y="33" width="200" height="34" fill="#fff" />
        <rect y="66" width="200" height="34" fill="#CE1126" />
        <polygon points="0,0 50,25 50,75 0,100" fill="#000" />
      </svg>
    </div>
  );
};

const SceneView: React.FC<{kind: SceneKind; frames: number}> = ({kind, frames}) => {
  switch (kind) {
    case 'intro':
      return <Intro frames={frames} />;
    case 'article6':
      return (
        <QuoteScene
          frames={frames}
          icon="flag"
          kicker="الأساس"
          article="المادة 6"
          segs={[{t: 'نظام الحكم في الكويت'}, {t: 'ديمقراطي،', hl: true}, {t: 'السيادة فيه'}, {t: 'للأمة مصدر السلطات جميعاً', hl: true}]}
          note="فالأمة هي صاحبة السيادة… ومنها تنبثق كل السلطات"
        />
      );
    case 'article50':
      return (
        <QuoteScene
          frames={frames}
          icon="link"
          kicker="المبدأ الحاكم"
          article="المادة 50"
          segs={[
            {t: 'يقوم نظام الحكم على أساس'},
            {t: 'فصل السلطات مع تعاونها', hl: true},
            {t: 'وفقاً لأحكام الدستور، ولا يجوز لأي سلطة منها'},
            {t: 'النزول عن كل أو بعض اختصاصها', hl: true},
          ]}
          note="ثلاث سلطات مستقلة… لكنها تتعاون"
        />
      );
    case 'pillars':
      return <Pillars frames={frames} />;
    case 'chapter':
      return <Chapter frames={frames} />;
    case 'structure':
      return <Structure frames={frames} />;
    case 'emir':
      return <Emir frames={frames} />;
    case 'powers':
      return <Powers frames={frames} />;
    case 'formation':
      return <Formation frames={frames} />;
    case 'council':
      return <Council frames={frames} />;
    case 'accountability':
      return <Accountability frames={frames} />;
    case 'outro':
      return <Outro frames={frames} />;
  }
};

export const Kuwait: React.FC = () => {
  const tl = timeline();
  const total = totalFrames();
  const hudFrom = tl[1].start;
  const hudTo = tl[tl.length - 1].start + TRANSITION;
  return (
    <AbsoluteFill style={{background: INK}}>
      <TransitionSeries>
        {tl.map(({scene, frames}, i) => (
          <Fragment key={i}>
            {i > 0 ? <TransitionSeries.Transition presentation={zoomBlur()} timing={linearTiming({durationInFrames: TRANSITION})} /> : null}
            <TransitionSeries.Sequence durationInFrames={frames}>
              <SceneView kind={scene.kind} frames={frames} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <Sequence from={hudFrom} durationInFrames={hudTo - hudFrom}>
        <Hud dur={hudTo - hudFrom} />
      </Sequence>
      {tl.slice(1).map(({start}, i) => (
        <Sequence key={i} from={Math.max(0, start - 4)} durationInFrames={30}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.45} />
        </Sequence>
      ))}
      <Audio
        src={staticFile('music/background.wav')}
        volume={(f) => 0.5 * interpolate(f, [0, 20], [0, 1], clamp) * interpolate(f, [total - 2 * FPS, total], [1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
