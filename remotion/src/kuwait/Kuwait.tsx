import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {zoomBlur} from '../reel/zoomBlur';
import {BLUE, cue, FPS, GOLD, GREEN, INK, NAVY, RED, type SceneDef, timeline, totalFrames, TRANSITION, VO_LEAD} from './config';
import {Icon, type IconName} from './icons';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const textShadow = '0 6px 30px rgba(0,0,0,0.6)';
const WHITE_SOFT = 'rgba(255,255,255,0.86)';
const GLASS = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
  border: '1px solid rgba(255,255,255,0.16)',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
} as const;

type SceneProps = {s: SceneDef; frames: number};

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

const Sfx: React.FC<{at: number; vol?: number; src?: string}> = ({at, vol = 0.14, src = 'sfx/pop.wav'}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={FPS * 2}>
    <Audio src={staticFile(src)} volume={vol} />
  </Sequence>
);

const Voice: React.FC<{s: SceneDef}> = ({s}) => (
  <Sequence from={VO_LEAD}>
    <Audio src={staticFile(`kuwait/vo/${s.vo}.mp3`)} volume={1} />
  </Sequence>
);

// حبيبات فيلم خفيفة فوق كل شيء
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 6} />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};

// ── الخلفية الجرافيكية: تدرج كحلي + نقش هندسي + جزيئات ضوء ───────────────
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
        style={{background: `radial-gradient(circle at ${50 + Math.sin(frame / 90) * 25}% ${30 + Math.cos(frame / 110) * 15}%, ${tint}22 0%, transparent 45%)`}}
      />
      <Particles />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
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
              background: i % 3 === 0 ? GOLD : '#fff', opacity: 0.12 + random(`o${i}`) * 0.25,
            }}
          />
        );
      })}
    </>
  );
};

// ── خلفية صورة: Ken Burns + تدرج لوني + تعتيم ───────────────────────────
const PhotoBg: React.FC<{src: string; frames: number; pan?: 'left' | 'right'; dim?: number; side?: 'right' | 'none' | 'full'; blur?: number}> = ({
  src,
  frames,
  pan = 'left',
  dim = 0.35,
  side = 'right',
  blur = 0,
}) => {
  const frame = useCurrentFrame();
  const p = frame / frames;
  const scale = interpolate(p, [0, 1], [1.08, 1.22]);
  const x = interpolate(p, [0, 1], [0, pan === 'left' ? -2.4 : 2.4]);
  const sweep = interpolate(frame, [10, 70], [-40, 140], clamp);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: INK}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translateX(${x}%)`,
          filter: `contrast(1.06) saturate(1.08) blur(${blur}px)`,
        }}
      />
      <AbsoluteFill style={{background: `rgba(4,8,18,${dim})`}} />
      {side === 'right' ? (
        <AbsoluteFill style={{background: 'linear-gradient(to left, rgba(4,8,18,0.94) 0%, rgba(4,8,18,0.72) 32%, rgba(4,8,18,0.1) 62%, transparent 75%)'}} />
      ) : null}
      {side === 'full' ? <AbsoluteFill style={{background: 'rgba(4,8,18,0.55)'}} /> : null}
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(4,8,18,0.85) 0%, transparent 28%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)'}} />
      {/* لمعة ضوء تمر على الصورة عند الدخول */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent ${sweep - 12}%, rgba(255,230,180,0.14) ${sweep}%, transparent ${sweep + 12}%)`,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

// زوايا إطار تتحرك للداخل
const CornerFrame: React.FC<{color?: string; delay?: number}> = ({color = GOLD, delay = 4}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {...clamp, easing: ease});
  const L = 70 * p;
  const m = 40 + (1 - p) * 30;
  const c = (style: React.CSSProperties) => <div style={{position: 'absolute', width: L, height: L, borderColor: color, borderStyle: 'solid', opacity: 0.8 * p, ...style}} />;
  return (
    <>
      {c({top: m, left: m, borderWidth: '3px 0 0 3px'})}
      {c({top: m, right: m, borderWidth: '3px 3px 0 0'})}
      {c({bottom: m, left: m, borderWidth: '0 0 3px 3px'})}
      {c({bottom: m, right: m, borderWidth: '0 3px 3px 0'})}
    </>
  );
};

// شارة موقع الصورة (أسفل يسار)
const LocationTag: React.FC<{text: string; delay?: number}> = ({text, delay = 20}) => (
  <div
    style={{
      position: 'absolute', bottom: 70, left: 90, display: 'flex', alignItems: 'center', gap: 12, direction: 'rtl', padding: '10px 22px',
      borderRadius: 999, ...GLASS, ...useReveal(delay),
    }}
  >
    <Icon name="pin" size={28} color={GOLD} />
    <span style={{fontFamily, fontSize: 26, fontWeight: 700, color: '#fff'}}>{text}</span>
  </div>
);

// ── علم الكويت يتشكل بالتدريج ─────────────────────────────────────────────
const Flag: React.FC<{width: number; delay?: number}> = ({width, delay = 0}) => {
  const frame = useCurrentFrame();
  const s = (i: number) => interpolate(frame - delay - i * 5, [0, 16], [0, 1], {...clamp, easing: ease});
  const wave = (i: number) => Math.sin((frame - i * 6) / 14) * 2;
  return (
    <svg width={width} height={width / 2} viewBox="0 0 200 100" style={{overflow: 'visible', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'}}>
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

const FlagBar: React.FC<{width: number; delay: number}> = ({width, delay}) => {
  const frame = useCurrentFrame();
  const line = interpolate(frame - delay, [0, 30], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', direction: 'rtl'}}>
      {['#007A3D', '#FFFFFF', '#CE1126'].map((c) => (
        <div key={c} style={{height: 6, width: (width / 3) * line, background: c}} />
      ))}
    </div>
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

// خط يرسم نفسه
const DrawLine: React.FC<{d: string; delay: number; dur?: number; color?: string; width?: number; id: string}> = ({d, delay, dur = 18, color = 'rgba(255,255,255,0.4)', width = 3, id}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} id={id} />
    </svg>
  );
};

// ── ١) المقدمة ────────────────────────────────────────────────────────────
const Intro: React.FC<SceneProps> = ({s, frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const fadeIn = interpolate(frame, [0, 20], [1, 0], clamp);
  const qs = [
    {t: 'كيف تتوزّع السلطات العامة؟', at: cue(s, 'كيف')},
    {t: 'ومن يتولّى السلطة التنفيذية؟', at: cue(s, 'ومن يتولى')},
  ];
  const constAt = cue(s, 'دستور');
  return (
    <AbsoluteFill>
      <PhotoBg src="kuwait/skyline.jpg" frames={frames} pan="right" dim={0.25} side="none" />
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(4,8,18,0.95) 0%, rgba(4,8,18,0.5) 50%, rgba(4,8,18,0.2) 100%)'}} />
      <CornerFrame />
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 110, direction: 'rtl', opacity: exit}}>
        <div style={{...useReveal(6, 20)}}>
          <Flag width={170} delay={8} />
        </div>
        <div style={{fontFamily, fontSize: 132, fontWeight: 900, color: '#fff', lineHeight: 1.3, marginTop: 20, textShadow, ...useReveal(VO_LEAD, 22)}}>
          نظام الحكم في دولة الكويت
        </div>
        <div style={{margin: '18px 0 30px'}}>
          <FlagBar width={480} delay={VO_LEAD + 16} />
        </div>
        <div style={{display: 'flex', gap: 30}}>
          {qs.map((q) => (
            <div key={q.t} style={{fontFamily, fontSize: 40, fontWeight: 700, color: '#fff', padding: '12px 34px', borderRadius: 999, ...GLASS, ...useReveal(q.at)}}>
              {q.t}
            </div>
          ))}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 34, ...useReveal(constAt)}}>
          <Icon name="book" size={40} color={GOLD} />
          <span style={{fontFamily, fontSize: 38, fontWeight: 700, color: GOLD}}>دستور دولة الكويت ١٩٦٢</span>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: fadeIn}} />
      <Sfx at={4} src="sfx/cinematic-boom.wav" vol={0.3} />
      <Sfx at={constAt} src="sfx/shimmer.wav" vol={0.2} />
    </AbsoluteFill>
  );
};

// ── اقتباس مادة من الدستور، الكلمات تظهر مع الصوت ────────────────────────
type Seg = {t: string; hl?: boolean};
const QuoteScene: React.FC<SceneProps & {kicker: string; article: string; segs: Seg[]; note: string; icon: IconName; bg: string; from: string; to: string}> = ({
  s,
  frames,
  kicker,
  article,
  segs,
  note,
  icon,
  bg,
  from,
  to,
}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const words = segs.flatMap((x) => x.t.split(' ').filter(Boolean).map((w) => ({w, hl: x.hl})));
  const start = cue(s, from) - 4;
  const end = cue(s, to);
  const per = (end - start) / words.length;
  const iconP = usePop(4);
  return (
    <AbsoluteFill>
      <PhotoBg src={bg} frames={frames} dim={0.45} side="full" blur={3} />
      <CornerFrame />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl', opacity: exit, padding: '0 170px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 34}}>
          <div
            style={{
              width: 96, height: 96, borderRadius: 96, border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${GOLD}1c`, transform: `scale(${iconP})`, boxShadow: `0 0 40px ${GOLD}44`,
            }}
          >
            <Icon name={icon} size={52} color={GOLD} draw={interpolate(frame, [8, 40], [0, 1], clamp)} />
          </div>
          <div style={{...useReveal(10)}}>
            <div style={{fontFamily, fontSize: 34, fontWeight: 600, color: WHITE_SOFT}}>{kicker}</div>
            <ArticleBadge n={article} size={30} />
          </div>
        </div>
        <div style={{position: 'relative', textAlign: 'center', padding: '40px 70px', borderRadius: 30, ...GLASS}}>
          <div style={{fontFamily, fontSize: 62, fontWeight: 700, lineHeight: 1.7, color: '#fff', textShadow}}>
            «{' '}
            {words.map(({w, hl}, i) => {
              const at = start + i * per;
              const p = interpolate(frame - at, [0, 10], [0, 1], {...clamp, easing: ease});
              const glow = hl ? interpolate(frame - at, [8, 26], [0, 1], clamp) : 0;
              return (
                <Fragment key={i}>
                  <span
                    style={{
                      display: 'inline-block', opacity: 0.15 + p * 0.85, filter: `blur(${(1 - p) * 6}px)`,
                      color: hl ? GOLD : '#fff', textShadow: hl ? `0 0 ${30 * glow}px ${GOLD}aa` : textShadow,
                    }}
                  >
                    {w}
                  </span>{' '}
                </Fragment>
              );
            })}
            »
          </div>
        </div>
        <div style={{fontFamily, fontSize: 38, fontWeight: 700, color: GREEN, marginTop: 36, ...useReveal(end + 10)}}>{note}</div>
      </AbsoluteFill>
      <Sfx at={4} src="sfx/impact.wav" vol={0.22} />
    </AbsoluteFill>
  );
};

// ── السلطات الثلاث كأعمدة بناء واحد ──────────────────────────────────────
const powers3: {icon: IconName; title: string; who: string; article: string; color: string; img: string}[] = [
  {icon: 'parliament', title: 'السلطة التشريعية', who: 'الأمير ومجلس الأمة', article: 'المادة 51', color: GOLD, img: 'kuwait/assembly.jpg'},
  {icon: 'gear', title: 'السلطة التنفيذية', who: 'الأمير ومجلس الوزراء والوزراء', article: 'المادة 52', color: GREEN, img: 'kuwait/seif.jpg'},
  {icon: 'scales', title: 'السلطة القضائية', who: 'المحاكم باسم الأمير', article: 'المادة 53', color: BLUE, img: 'kuwait/justice.jpg'},
];

const Pillars: React.FC<SceneProps> = ({s, frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const pillarsAt = cue(s, 'ثلاث');
  const baseAt = cue(s, 'أساسه');
  const roofAt = cue(s, 'وسقفه');
  const roof = usePop(roofAt);
  const base = interpolate(frame - baseAt, [0, 20], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{direction: 'rtl', opacity: exit}}>
        {/* السقف */}
        <div style={{position: 'absolute', top: 90, left: 260, right: 260, height: 170, transform: `translateY(${(1 - roof) * -80}px)`, opacity: Math.min(1, roof)}}>
          <div style={{position: 'absolute', inset: 0, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', background: `linear-gradient(to bottom, ${GOLD}66, ${GOLD}18)`}} />
          <div style={{position: 'absolute', bottom: 18, width: '100%', textAlign: 'center', fontFamily, fontSize: 40, fontWeight: 800, color: '#fff', textShadow}}>
            الأمة مصدر السلطات جميعاً
          </div>
        </div>
        <div style={{position: 'absolute', top: 268, left: 240, right: 240, height: 10, background: GOLD, borderRadius: 6, opacity: Math.min(1, roof), boxShadow: `0 0 20px ${GOLD}88`}} />

        {/* الأعمدة بصور المباني */}
        <div style={{position: 'absolute', top: 300, left: 280, right: 280, display: 'flex', justifyContent: 'space-between'}}>
          {powers3.map((p, i) => {
            const d = pillarsAt + i * 14;
            const rise = interpolate(frame - d, [0, 22], [0, 1], {...clamp, easing: ease});
            return (
              <div
                key={i}
                style={{
                  width: 380, height: 480, borderRadius: 26, position: 'relative', overflow: 'hidden', border: `2px solid ${p.color}aa`,
                  opacity: rise, transform: `translateY(${(1 - rise) * 140}px)`, boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${p.color}33`,
                }}
              >
                <Img src={staticFile(p.img)} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.15 + frame * 0.0006})`}} />
                <div style={{position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(4,8,18,0.97) 38%, rgba(4,8,18,0.35) 75%, ${p.color}22)`}} />
                <div style={{position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', padding: '0 24px'}}>
                  <div
                    style={{
                      width: 84, height: 84, borderRadius: 84, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${p.color}26`, border: `2px solid ${p.color}`, backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Icon name={p.icon} size={46} color={p.color} draw={interpolate(frame - d - 8, [0, 30], [0, 1], clamp)} />
                  </div>
                  <div style={{fontFamily, fontSize: 40, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap'}}>{p.title}</div>
                  <div style={{fontFamily, fontSize: 27, fontWeight: 600, color: WHITE_SOFT, marginTop: 6, lineHeight: 1.45}}>{p.who}</div>
                  <div style={{marginTop: 12}}>
                    <ArticleBadge n={p.article} color={p.color} size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* القاعدة */}
        <div
          style={{
            position: 'absolute', top: 816, left: 240, right: 240, height: 90, borderRadius: 14, ...GLASS, border: `1px solid ${GOLD}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, transform: `scaleX(${base})`, opacity: base,
          }}
        >
          <Icon name="book" size={40} color={GOLD} />
          <span style={{fontFamily, fontSize: 38, fontWeight: 800, color: GOLD}}>الدستور</span>
          <span style={{fontFamily, fontSize: 34, fontWeight: 600, color: '#fff'}}>فصلٌ بين السلطات مع تعاونها</span>
          <ArticleBadge n="المادة 50" />
        </div>
      </AbsoluteFill>
      {powers3.map((_, i) => (
        <Sfx key={i} at={pillarsAt + i * 14} src="sfx/swoosh-up.wav" vol={0.22} />
      ))}
      <Sfx at={baseAt} src="sfx/impact.wav" vol={0.2} />
      <Sfx at={roofAt} src="sfx/impact.wav" vol={0.22} />
    </AbsoluteFill>
  );
};

// ── مشهد سلطة بصورة مبناها ───────────────────────────────────────────────
const AuthorityScene: React.FC<
  SceneProps & {img: string; place: string; num: string; title: string; who: string[]; article: string; color: string; icon: IconName; notes: {t: string; at: string}[]; whoAt: string}
> = ({s, frames, img, place, num, title, who, article, color, icon, notes, whoAt}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const numP = usePop(VO_LEAD - 4);
  const whoFrame = cue(s, whoAt);
  return (
    <AbsoluteFill>
      <PhotoBg src={img} frames={frames} pan="left" dim={0.18} />
      <CornerFrame color={color} />
      <AbsoluteFill style={{direction: 'rtl', opacity: exit}}>
        <div style={{position: 'absolute', top: 140, right: 130, width: 1000}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <div
              style={{
                width: 110, height: 110, borderRadius: 28, background: `${color}26`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', transform: `scale(${numP}) rotate(${(1 - numP) * -20}deg)`, boxShadow: `0 0 40px ${color}55`,
              }}
            >
              <Icon name={icon} size={62} color={color} draw={interpolate(frame, [VO_LEAD, VO_LEAD + 30], [0, 1], clamp)} />
            </div>
            <div style={{...useReveal(VO_LEAD)}}>
              <div style={{fontFamily, fontSize: 32, fontWeight: 700, color}}>{num}</div>
              <ArticleBadge n={article} color={color} size={24} />
            </div>
          </div>
          <div style={{fontFamily, fontSize: 100, fontWeight: 900, color: '#fff', lineHeight: 1.3, marginTop: 20, whiteSpace: 'nowrap', textShadow, ...useReveal(VO_LEAD + 6, 20)}}>
            {title}
          </div>
          <div style={{height: 5, width: interpolate(frame, [VO_LEAD + 14, VO_LEAD + 40], [0, 260], {...clamp, easing: ease}), background: color, borderRadius: 4, boxShadow: `0 0 16px ${color}`}} />
          <div style={{fontFamily, fontSize: 30, fontWeight: 600, color: WHITE_SOFT, marginTop: 26, ...useReveal(whoFrame - 6)}}>يتولّاها</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10}}>
            {who.map((w, i) => (
              <span
                key={w}
                style={{fontFamily, fontSize: 40, fontWeight: 800, color: '#fff', padding: '8px 30px', borderRadius: 999, background: `${color}30`, border: `2px solid ${color}`, ...useReveal(whoFrame + i * 10)}}
              >
                {w}
              </span>
            ))}
          </div>
          <div style={{marginTop: 34}}>
            {notes.map((n) => (
              <div key={n.t} style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14, ...useReveal(cue(s, n.at))}}>
                <div style={{width: 12, height: 12, borderRadius: 3, transform: 'rotate(45deg)', background: color, boxShadow: `0 0 10px ${color}`, flexShrink: 0}} />
                <span style={{fontFamily, fontSize: 36, fontWeight: 600, color: 'rgba(255,255,255,0.94)', textShadow}}>{n.t}</span>
              </div>
            ))}
          </div>
        </div>
        <LocationTag text={place} />
      </AbsoluteFill>
      <Sfx at={VO_LEAD - 4} src="sfx/cinematic-boom.wav" vol={0.22} />
      {who.map((_, i) => (
        <Sfx key={i} at={whoFrame + i * 10} vol={0.12} />
      ))}
    </AbsoluteFill>
  );
};

// ── شاشة فصل ──────────────────────────────────────────────────────────────
const Chapter: React.FC<SceneProps> = ({s, frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const ring = interpolate(frame, [0, frames], [0.6, 1.35]);
  const line = interpolate(frame, [20, 45], [0, 1], {...clamp, easing: ease});
  const qs = [
    {t: 'من يتولّاها؟', at: cue(s, 'من يتولاها')},
    {t: 'ما صلاحياتها؟', at: cue(s, 'وما')},
    {t: 'من يراقبها؟', at: cue(s, 'ومن يراقبها')},
  ];
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', direction: 'rtl'}}>
      <PhotoBg src="kuwait/seif.jpg" frames={frames} dim={0.7} side="none" blur={6} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute', width: 700 + i * 260, height: 700 + i * 260, borderRadius: '50%', border: `2px solid ${GREEN}`,
            opacity: 0.16 - i * 0.04, transform: `scale(${ring}) rotate(${frame * (i % 2 ? -0.2 : 0.2)}deg)`, borderStyle: i === 1 ? 'dashed' : 'solid',
          }}
        />
      ))}
      <div style={{textAlign: 'center', opacity: exit, position: 'relative'}}>
        <div style={{display: 'flex', justifyContent: 'center', ...useReveal(2)}}>
          <Icon name="gear" size={90} color={GREEN} stroke={1.4} draw={interpolate(frame, [0, 30], [0, 1], clamp)} />
        </div>
        <div style={{fontFamily, fontSize: 44, fontWeight: 600, color: GREEN, marginTop: 12, ...useReveal(6)}}>محور حديثنا</div>
        <div style={{fontFamily, fontSize: 150, fontWeight: 900, color: '#fff', lineHeight: 1.25, textShadow: `0 0 50px ${GREEN}55`, ...useReveal(14, 20)}}>السلطة التنفيذية</div>
        <div style={{height: 4, width: 420 * line, background: GREEN, margin: '10px auto 30px', borderRadius: 4, boxShadow: `0 0 18px ${GREEN}`}} />
        <div style={{display: 'flex', justifyContent: 'center', gap: 26}}>
          {qs.map((q) => (
            <span key={q.t} style={{fontFamily, fontSize: 42, fontWeight: 700, color: '#fff', padding: '10px 34px', borderRadius: 999, ...GLASS, ...useReveal(q.at)}}>
              {q.t}
            </span>
          ))}
        </div>
      </div>
      <Sfx at={0} src="sfx/cinematic-riser.wav" vol={0.3} />
      <Sfx at={14} src="sfx/impact.wav" vol={0.3} />
      {qs.map((q) => (
        <Sfx key={q.t} at={q.at} vol={0.12} />
      ))}
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
        background: `linear-gradient(135deg, ${color}36, rgba(10,18,32,0.88))`, border: `2px solid ${color}`, backdropFilter: 'blur(10px)',
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

const orgMinistries = ['الداخلية', 'الخارجية', 'المالية', 'التربية', 'الصحة', 'العدل'];

const Structure: React.FC<SceneProps> = ({s, frames}) => {
  const exit = useExit(frames);
  const mx = (i: number) => 1580 - i * 248;
  const emirAt = cue(s, 'الأمير');
  const councilAt = cue(s, 'ومجلس الوزراء');
  const minAt = cue(s, 'والوزراء الذين');
  return (
    <AbsoluteFill>
      <PhotoBg src="kuwait/cabinet.jpg" frames={frames} dim={0.55} side="full" blur={4} />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="من يتولّى السلطة التنفيذية؟" title="ثلاثة مكوّنات" article="المادة 52" accent={GREEN} />
        <DrawLine id="l1" d="M 960 395 L 960 470" delay={councilAt - 10} color={`${GOLD}cc`} />
        <DrawLine id="l2" d="M 960 590 L 960 640 M 1580 640 L 340 640" delay={minAt - 14} color={`${GREEN}cc`} />
        {orgMinistries.map((_, i) => (
          <DrawLine key={i} id={`m${i}`} d={`M ${mx(i)} 640 L ${mx(i)} 690`} delay={minAt + i * 4} color={`${GREEN}cc`} />
        ))}
        <Node x={960} y={340} w={520} h={110} delay={emirAt} color={GOLD} icon="crown" title="الأمير" sub="رئيس الدولة" />
        <Node x={960} y={530} w={660} h={120} delay={councilAt} color={GREEN} icon="users" title="مجلس الوزراء" sub="برئاسة رئيس مجلس الوزراء" />
        {orgMinistries.map((m, i) => (
          <Node key={m} x={mx(i)} y={745} w={220} h={110} delay={minAt + 8 + i * 6} color={BLUE} icon="briefcase" title="وزير" sub={m} size={34} />
        ))}
        <div
          style={{
            position: 'absolute', bottom: 70, left: 200, right: 200, textAlign: 'center', direction: 'rtl', fontFamily, fontSize: 36,
            fontWeight: 600, color: WHITE_SOFT, lineHeight: 1.6, ...useReveal(minAt + 60, 20),
          }}
        >
          «السلطة التنفيذية يتولاها <span style={{color: GOLD}}>الأمير</span> و<span style={{color: GREEN}}>مجلس الوزراء</span> و
          <span style={{color: BLUE}}>الوزراء</span> على النحو المبيّن بالدستور»
        </div>
      </AbsoluteFill>
      <Sfx at={emirAt} />
      <Sfx at={councilAt} />
      {orgMinistries.map((_, i) => (
        <Sfx key={i} at={minAt + 8 + i * 6} vol={0.08} src="sfx/tick.wav" />
      ))}
    </AbsoluteFill>
  );
};

// ── الوزارات ──────────────────────────────────────────────────────────────
const ministries: {name: string; desc: string; icon: IconName; at: string}[] = [
  {name: 'الداخلية', desc: 'الأمن والنظام العام', icon: 'shield', at: 'الداخلية'},
  {name: 'الخارجية', desc: 'العلاقات الدولية', icon: 'globe', at: 'الخارجية'},
  {name: 'المالية', desc: 'الميزانية والموارد', icon: 'coins', at: 'المالية'},
  {name: 'التربية', desc: 'التعليم العام', icon: 'school', at: 'التربية'},
  {name: 'الصحة', desc: 'الرعاية الصحية', icon: 'heart', at: 'الصحة'},
  {name: 'العدل', desc: 'مرفق العدالة', icon: 'scales', at: 'والعدل'},
  {name: 'الدفاع', desc: 'حماية الوطن', icon: 'star', at: 'الدفاع'},
  {name: 'النفط', desc: 'الثروة النفطية', icon: 'drop', at: 'النفط'},
];

const Ministries: React.FC<SceneProps> = ({s, frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  return (
    <AbsoluteFill>
      <PhotoBg src="kuwait/ministries.jpg" frames={frames} dim={0.45} side="full" />
      <CornerFrame color={GREEN} />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="أذرع الحكومة التنفيذية" title="الوزارات" accent={GREEN} />
        <div style={{position: 'absolute', top: 330, left: 140, right: 140, display: 'flex', flexWrap: 'wrap', gap: 28, direction: 'rtl'}}>
          {ministries.map((m) => {
            const at = cue(s, m.at, -4);
            const p = usePop(at);
            return (
              <div
                key={m.name}
                style={{
                  width: (1640 - 3 * 28) / 4, height: 250, borderRadius: 24, padding: 28, ...GLASS, border: `1px solid ${GREEN}66`,
                  transform: `scale(${0.6 + 0.4 * p}) translateY(${(1 - p) * 30}px)`, opacity: Math.min(1, p * 1.5), position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{position: 'absolute', top: 0, right: 0, left: 0, height: 5, background: `linear-gradient(to left, #007A3D, #fff, #CE1126)`, opacity: 0.85}} />
                <div style={{width: 80, height: 80, borderRadius: 20, background: `${GREEN}26`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Icon name={m.icon} size={48} color={GREEN} draw={interpolate(frame - at - 4, [0, 24], [0, 1], clamp)} />
                </div>
                <div style={{fontFamily, fontSize: 24, fontWeight: 600, color: WHITE_SOFT, marginTop: 18}}>وزارة</div>
                <div style={{fontFamily, fontSize: 46, fontWeight: 900, color: '#fff', lineHeight: 1.15}}>{m.name}</div>
                <div style={{fontFamily, fontSize: 26, fontWeight: 600, color: GOLD, marginTop: 6}}>{m.desc}</div>
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', fontFamily, fontSize: 34, fontWeight: 700, color: WHITE_SOFT, ...useReveal(cue(s, 'وغيرها'))}}>
          … وغيرها من وزارات الدولة
        </div>
        <LocationTag text="مجمع الوزارات — مدينة الكويت" delay={30} />
      </AbsoluteFill>
      {ministries.map((m) => (
        <Sfx key={m.name} at={cue(s, m.at, -4)} vol={0.12} />
      ))}
    </AbsoluteFill>
  );
};

// ── الأمير ────────────────────────────────────────────────────────────────
const Seal: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(6);
  return (
    <div style={{position: 'absolute', left: 170, top: 250, width: 560, height: 560, transform: `scale(${p})`}}>
      <svg width={560} height={560} viewBox="0 0 560 560" style={{position: 'absolute', overflow: 'visible'}}>
        <circle cx={280} cy={280} r={270} fill="none" stroke={`${GOLD}55`} strokeWidth={2} />
        <circle cx={280} cy={280} r={196} fill="rgba(5,8,15,0.55)" stroke={GOLD} strokeWidth={3} />
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

const PointCard: React.FC<{icon: IconName; text: string; article: string; delay: number; color: string; width?: number}> = ({icon, text, article, delay, color, width = 900}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 18], [0, 1], {...clamp, easing: ease});
  return (
    <div
      style={{
        width, display: 'flex', alignItems: 'center', gap: 26, padding: '22px 30px', borderRadius: 20, marginBottom: 22, ...GLASS,
        borderRight: `6px solid ${color}`, opacity: p, transform: `translateX(${(1 - p) * 80}px)`, direction: 'rtl',
      }}
    >
      <Icon name={icon} size={52} color={color} draw={interpolate(frame - delay - 6, [0, 24], [0, 1], clamp)} />
      <span style={{flex: 1, fontFamily, fontSize: 40, fontWeight: 700, color: '#fff'}}>{text}</span>
      <ArticleBadge n={article} color={color} size={24} />
    </div>
  );
};

const Emir: React.FC<SceneProps> = ({s, frames}) => {
  const exit = useExit(frames);
  const pts = [
    {icon: 'shield' as IconName, text: 'ذاته مصونة لا تُمس', article: 'المادة 54', at: cue(s, 'مصونة', -6)},
    {icon: 'users' as IconName, text: 'يتولى سلطاته بواسطة وزرائه', article: 'المادة 55', at: cue(s, 'يتولى', -4)},
    {icon: 'star' as IconName, text: 'القائد الأعلى للقوة المسلحة', article: 'المادة 67', at: cue(s, 'القائد', -4)},
  ];
  return (
    <AbsoluteFill>
      <PhotoBg src="kuwait/bayan.jpg" frames={frames} pan="right" dim={0.3} />
      <AbsoluteFill style={{background: 'linear-gradient(to right, rgba(4,8,18,0.55), transparent 45%)'}} />
      <CornerFrame />
      <AbsoluteFill style={{opacity: exit}}>
        <Seal />
        <div style={{position: 'absolute', right: 120, top: 150, direction: 'rtl'}}>
          <div style={{fontFamily, fontSize: 36, fontWeight: 600, color: GOLD, ...useReveal(VO_LEAD)}}>المكوّن الأول</div>
          <div style={{fontFamily, fontSize: 92, fontWeight: 900, color: '#fff', lineHeight: 1.3, textShadow, ...useReveal(VO_LEAD + 6, 20)}}>الأمير رئيس الدولة</div>
          <div style={{fontFamily, fontSize: 34, fontWeight: 500, color: WHITE_SOFT, marginBottom: 40, ...useReveal(VO_LEAD + 20)}}>
            على رأس السلطات الثلاث، ويمارس سلطته التنفيذية عبر الحكومة
          </div>
          {pts.map((p) => (
            <PointCard key={p.text} icon={p.icon} text={p.text} article={p.article} delay={p.at} color={GOLD} />
          ))}
        </div>
        <LocationTag text="قصر بيان — الكويت" delay={40} />
      </AbsoluteFill>
      <Sfx at={6} src="sfx/cinematic-boom.wav" vol={0.22} />
      {pts.map((p) => (
        <Sfx key={p.text} at={p.at} src="sfx/swoosh-down.wav" vol={0.18} />
      ))}
    </AbsoluteFill>
  );
};

// ── صلاحيات الأمير التنفيذية ─────────────────────────────────────────────
const emirPowers: {icon: IconName; title: string; sub: string; article: string; at: string}[] = [
  {icon: 'idcard', title: 'تعيين رئيس مجلس الوزراء والوزراء', sub: 'وإعفاؤهم من مناصبهم', article: 'المادة 56', at: 'تعيين رئيس'},
  {icon: 'doc', title: 'وضع اللوائح لتنفيذ القوانين', sub: 'دون تعديلها أو تعطيلها', article: 'المادة 72', at: 'ووضع'},
  {icon: 'pen', title: 'إبرام المعاهدات بمرسوم', sub: 'ويبلّغها مجلس الأمة فوراً', article: 'المادة 70', at: 'وإبرام'},
  {icon: 'shield', title: 'إعلان الحرب الدفاعية بمرسوم', sub: 'أما الحرب الهجومية فمحرّمة', article: 'المادة 68', at: 'وإعلان'},
  {icon: 'briefcase', title: 'تعيين الموظفين والممثلين السياسيين', sub: 'المدنيين والعسكريين وفقاً للقانون', article: 'المادة 74', at: 'وتعيين الموظفين'},
  {icon: 'bolt', title: 'مراسيم الضرورة', sub: 'لها قوة القانون عند غياب مجلس الأمة', article: 'المادة 71', at: 'وإصدار'},
];

const Powers: React.FC<SceneProps> = ({s, frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  return (
    <AbsoluteFill>
      <PhotoBg src="kuwait/seif.jpg" frames={frames} dim={0.62} side="full" blur={5} />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="بنصوص الدستور" title="صلاحيات الأمير التنفيذية" />
        <div style={{position: 'absolute', top: 320, left: 120, right: 120, display: 'flex', flexWrap: 'wrap', gap: 30, direction: 'rtl'}}>
          {emirPowers.map((p) => {
            const d = cue(s, p.at, -6);
            const sc = usePop(d);
            const active = interpolate(frame - d, [0, 10, 80, 100], [0, 1, 1, 0.35], clamp);
            return (
              <div
                key={p.title}
                style={{
                  width: (1680 - 60) / 3, height: 310, borderRadius: 24, padding: '34px 34px 0', position: 'relative', ...GLASS,
                  border: `1px solid ${GOLD}${active > 0.5 ? 'cc' : '55'}`, boxShadow: `0 0 ${40 * active}px ${GOLD}44`,
                  transform: `scale(${sc}) translateY(${(1 - sc) * 40}px)`, opacity: Math.min(1, sc * 1.4),
                }}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{width: 84, height: 84, borderRadius: 20, background: `${GOLD}26`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
      {emirPowers.map((p) => (
        <Sfx key={p.title} at={cue(s, p.at, -6)} />
      ))}
    </AbsoluteFill>
  );
};

// ── تشكيل الحكومة ─────────────────────────────────────────────────────────
const steps: {icon: IconName; title: string; sub: string; at: string}[] = [
  {icon: 'chat', title: 'المشاورات التقليدية', sub: 'يجريها الأمير قبل التعيين', at: 'بمشاورات'},
  {icon: 'crown', title: 'تعيين رئيس مجلس الوزراء', sub: 'يعيّنه الأمير ويعفيه', at: 'ثم يعين رئيس'},
  {icon: 'users', title: 'تعيين الوزراء', sub: 'بترشيح من رئيس مجلس الوزراء', at: 'ويعين الوزراء'},
  {icon: 'book', title: 'أداء اليمين أمام الأمير', sub: 'قبل تولّي الصلاحيات (م 126)', at: 'اليمين'},
];

const Formation: React.FC<SceneProps> = ({s, frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const xs = [1530, 1150, 770, 390];
  const ats = steps.map((st) => cue(s, st.at, -6));
  const prog = interpolate(frame, ats, [0, 1 / 3, 2 / 3, 1], {...clamp, easing: ease});
  const conds = [
    {icon: 'parliament' as IconName, t: 'يُعيَّن الوزراء من أعضاء مجلس الأمة ومن غيرهم', at: cue(s, 'من أعضاء', -10)},
    {icon: 'chart' as IconName, t: 'لا يزيد عددهم على ثلث أعضاء مجلس الأمة', at: cue(s, 'على ألا', -6)},
  ];
  return (
    <AbsoluteFill>
      <PhotoBg src="kuwait/seif.jpg" frames={frames} pan="right" dim={0.6} side="full" blur={4} />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="خطوة بخطوة" title="كيف تتشكّل الحكومة؟" article="المادة 56" accent={GREEN} />
        <div style={{position: 'absolute', top: 452, left: xs[3], width: xs[0] - xs[3], height: 4, background: 'rgba(255,255,255,0.18)'}} />
        <div style={{position: 'absolute', top: 452, right: 1920 - xs[0], width: (xs[0] - xs[3]) * prog, height: 4, background: GREEN, boxShadow: `0 0 16px ${GREEN}`}} />
        {steps.map((st, i) => {
          const d = ats[i];
          const p = usePop(d);
          return (
            <div key={i} style={{position: 'absolute', left: xs[i] - 170, top: 360, width: 340, textAlign: 'center', direction: 'rtl'}}>
              <div
                style={{
                  width: 188, height: 188, margin: '0 auto', borderRadius: 188, background: 'rgba(5,8,15,0.85)', border: `3px solid ${GREEN}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, boxShadow: `0 0 40px ${GREEN}55`, position: 'relative',
                }}
              >
                <Icon name={st.icon} size={84} color={GREEN} draw={interpolate(frame - d - 4, [0, 26], [0, 1], clamp)} />
                <div
                  style={{
                    position: 'absolute', top: -6, right: -6, width: 56, height: 56, borderRadius: 56, background: GREEN, color: INK,
                    fontFamily, fontSize: 32, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {['١', '٢', '٣', '٤'][i]}
                </div>
              </div>
              <div style={{fontFamily, fontSize: 36, fontWeight: 800, color: '#fff', marginTop: 26, lineHeight: 1.35, textShadow, ...useReveal(d + 6)}}>{st.title}</div>
              <div style={{fontFamily, fontSize: 27, fontWeight: 500, color: WHITE_SOFT, marginTop: 8, ...useReveal(d + 12)}}>{st.sub}</div>
            </div>
          );
        })}
        <div style={{position: 'absolute', bottom: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40, direction: 'rtl'}}>
          {conds.map((c) => (
            <div key={c.t} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '18px 32px', borderRadius: 18, ...GLASS, border: `1px solid ${GOLD}66`, ...useReveal(c.at)}}>
              <Icon name={c.icon} size={42} color={GOLD} />
              <span style={{fontFamily, fontSize: 32, fontWeight: 700, color: '#fff'}}>{c.t}</span>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      {ats.map((a, i) => (
        <Sfx key={i} at={a} />
      ))}
      {conds.map((c) => (
        <Sfx key={c.t} at={c.at} src="sfx/shimmer.wav" vol={0.14} />
      ))}
    </AbsoluteFill>
  );
};

// ── المهام: مجلس الوزراء / رئيسه / الوزير ────────────────────────────────
const roles: {icon: IconName; title: string; article: string; color: string; items: string[]; at: string}[] = [
  {
    icon: 'users', title: 'مجلس الوزراء', article: 'المادة 123', color: GREEN, at: 'ويهيمن',
    items: ['يهيمن على مصالح الدولة', 'يرسم السياسة العامة للحكومة ويتابع تنفيذها', 'يشرف على سير العمل في الإدارات الحكومية'],
  },
  {
    icon: 'crown', title: 'رئيس مجلس الوزراء', article: 'المادة 127', color: GOLD, at: 'ويرأس',
    items: ['يرأس جلسات مجلس الوزراء', 'ينسّق الأعمال بين الوزارات المختلفة', 'لا يتولى أي وزارة (م 102)'],
  },
  {
    icon: 'briefcase', title: 'الوزير', article: 'المادة 130', color: BLUE, at: 'بينما',
    items: ['يشرف على شؤون وزارته', 'ينفّذ فيها السياسة العامة للحكومة', 'يرسم اتجاهات الوزارة ويتابع تنفيذها'],
  },
];

const Council: React.FC<SceneProps> = ({s, frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  return (
    <AbsoluteFill>
      <PhotoBg src="kuwait/cabinet.jpg" frames={frames} dim={0.55} side="full" blur={3} />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="توزيع الأدوار" title="المهام والاختصاصات" accent={GREEN} />
        <div style={{position: 'absolute', top: 320, left: 120, right: 120, display: 'flex', gap: 36, direction: 'rtl'}}>
          {roles.map((r) => {
            const d = cue(s, r.at, -8);
            const p = interpolate(frame - d, [0, 20], [0, 1], {...clamp, easing: ease});
            return (
              <div
                key={r.title}
                style={{
                  flex: 1, height: 560, borderRadius: 26, padding: 36, ...GLASS, border: `1px solid ${r.color}66`, borderTop: `6px solid ${r.color}`,
                  opacity: p, transform: `translateY(${(1 - p) * 70}px)`,
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
                    <div key={k} style={{display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24, ...useReveal(d + 18 + k * 14)}}>
                      <div style={{marginTop: 18, width: 12, height: 12, borderRadius: 3, transform: 'rotate(45deg)', background: r.color, flexShrink: 0}} />
                      <span style={{fontFamily, fontSize: 34, fontWeight: 600, color: WHITE_SOFT, lineHeight: 1.5}}>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{position: 'absolute', bottom: 56, width: '100%', textAlign: 'center', fontFamily, fontSize: 32, fontWeight: 600, color: WHITE_SOFT, direction: 'rtl', ...useReveal(cue(s, 'بينما', 70))}}>
          <span style={{color: GOLD}}>✦</span> استقالة رئيس مجلس الوزراء تتضمّن استقالة سائر الوزراء <ArticleBadge n="المادة 129" size={22} />
        </div>
      </AbsoluteFill>
      {roles.map((r) => (
        <Sfx key={r.title} at={cue(s, r.at, -8)} src="sfx/swoosh-up.wav" vol={0.2} />
      ))}
    </AbsoluteFill>
  );
};

// ── الرقابة والمسؤولية ────────────────────────────────────────────────────
const parliamentTools: {icon: IconName; t: string; a: string; at: string}[] = [
  {icon: 'question', t: 'السؤال البرلماني', a: 'م 99', at: 'السؤال'},
  {icon: 'mic', t: 'الاستجواب', a: 'م 100', at: 'والاستجواب'},
  {icon: 'vote', t: 'طرح الثقة بالوزير', a: 'م 101', at: 'وطرح'},
  {icon: 'unlink', t: 'عدم التعاون مع رئيس مجلس الوزراء', a: 'م 102', at: 'وتقرير'},
];

const Accountability: React.FC<SceneProps> = ({s, frames}) => {
  const frame = useCurrentFrame();
  const exit = useExit(frames);
  const panel = (d: number) => interpolate(frame - d, [0, 22], [0, 1], {...clamp, easing: ease});
  const tilt = Math.sin(frame / 22) * 3;
  const emirAt = cue(s, 'بالتضامن', -20);
  const parlAt = cue(s, 'وأمام مجلس', -6);
  return (
    <AbsoluteFill>
      <PhotoBg src="kuwait/chamber.jpg" frames={frames} dim={0.55} side="full" blur={2} />
      <AbsoluteFill style={{opacity: exit}}>
        <SceneTitle kicker="لا سلطة بلا رقابة" title="المسؤولية والرقابة" accent={RED} />
        <div style={{position: 'absolute', top: 300, left: 120, right: 120, height: 600, display: 'flex', gap: 40, direction: 'rtl', alignItems: 'stretch'}}>
          <div style={{width: 640, borderRadius: 26, padding: 40, ...GLASS, border: `1px solid ${GOLD}66`, opacity: panel(emirAt), transform: `translateX(${(1 - panel(emirAt)) * 80}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <Icon name="crown" size={60} color={GOLD} />
              <span style={{fontFamily, fontSize: 46, fontWeight: 900, color: '#fff'}}>أمام الأمير</span>
              <ArticleBadge n="المادة 58" size={22} />
            </div>
            <div style={{fontFamily, fontSize: 36, fontWeight: 700, color: GOLD, marginTop: 34, lineHeight: 1.5, ...useReveal(emirAt + 14)}}>مسؤولية تضامنية</div>
            <div style={{fontFamily, fontSize: 32, fontWeight: 600, color: WHITE_SOFT, lineHeight: 1.6, ...useReveal(emirAt + 24)}}>
              رئيس مجلس الوزراء والوزراء مسؤولون بالتضامن عن السياسة العامة للدولة
            </div>
            <div style={{height: 1, background: `${GOLD}44`, margin: '26px 0'}} />
            <div style={{fontFamily, fontSize: 32, fontWeight: 600, color: WHITE_SOFT, lineHeight: 1.6, ...useReveal(emirAt + 50)}}>ويُسأل كل وزير عن أعمال وزارته</div>
          </div>

          <div style={{width: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: panel(10)}}>
            <div style={{transform: `rotate(${tilt}deg)`}}>
              <Icon name="scales" size={100} color="rgba(255,255,255,0.7)" stroke={1.2} />
            </div>
          </div>

          <div style={{flex: 1, borderRadius: 26, padding: 40, ...GLASS, border: `1px solid ${GREEN}66`, opacity: panel(parlAt), transform: `translateX(${(1 - panel(parlAt)) * -80}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <Icon name="parliament" size={60} color={GREEN} />
              <span style={{fontFamily, fontSize: 46, fontWeight: 900, color: '#fff'}}>أمام مجلس الأمة</span>
            </div>
            <div style={{marginTop: 28}}>
              {parliamentTools.map((t) => {
                const at = cue(s, t.at, -6);
                const on = interpolate(frame - at, [0, 8, 50, 70], [0, 1, 1, 0], clamp);
                return (
                  <div
                    key={t.t}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 18, padding: '14px 20px', borderRadius: 14, marginBottom: 14,
                      background: `rgba(34,181,115,${0.06 + on * 0.22})`, ...useReveal(at),
                    }}
                  >
                    <Icon name={t.icon} size={40} color={GREEN} />
                    <span style={{flex: 1, fontFamily, fontSize: 30, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap'}}>{t.t}</span>
                    <ArticleBadge n={t.a} color={GREEN} size={22} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', bottom: 64, width: '100%', textAlign: 'center', fontFamily, fontSize: 31, fontWeight: 600, color: WHITE_SOFT, direction: 'rtl', ...useReveal(cue(s, 'وتقرير', 70))}}>
          وعند تقرير عدم التعاون يُرفع الأمر للأمير: <span style={{color: GOLD}}>إعفاء رئيس مجلس الوزراء وتعيين وزارة جديدة</span> أو <span style={{color: GOLD}}>حلّ مجلس الأمة</span>
        </div>
      </AbsoluteFill>
      <Sfx at={emirAt} src="sfx/swoosh-down.wav" vol={0.2} />
      <Sfx at={parlAt} src="sfx/swoosh-down.wav" vol={0.2} />
      {parliamentTools.map((t) => (
        <Sfx key={t.t} at={cue(s, t.at, -6)} vol={0.12} />
      ))}
    </AbsoluteFill>
  );
};

// ── الخاتمة ───────────────────────────────────────────────────────────────
const Outro: React.FC<SceneProps> = ({s, frames}) => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [frames - 30, frames], [0, 1], clamp);
  const chips = [
    {t: 'تنفّذ القوانين', at: cue(s, 'تنفذ'), c: GREEN, icon: 'doc' as IconName},
    {t: 'ترسم السياسة العامة', at: cue(s, 'وترسم'), c: GOLD, icon: 'compass' as IconName},
    {t: 'تخضع لرقابة الأمة', at: cue(s, 'وتخضع'), c: BLUE, icon: 'eye' as IconName},
  ];
  const finalAt = cue(s, 'فصل');
  return (
    <AbsoluteFill>
      <PhotoBg src="kuwait/towers.jpg" frames={frames} pan="right" dim={0.3} side="none" />
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(4,8,18,0.95) 0%, rgba(4,8,18,0.55) 55%, rgba(4,8,18,0.25) 100%)'}} />
      <CornerFrame />
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', direction: 'rtl', paddingBottom: 110}}>
        <div style={{fontFamily, fontSize: 40, fontWeight: 600, color: GOLD, ...useReveal(4)}}>الخلاصة</div>
        <div style={{fontFamily, fontSize: 110, fontWeight: 900, color: '#fff', textShadow, lineHeight: 1.3, ...useReveal(10, 20)}}>السلطة التنفيذية</div>
        <div style={{display: 'flex', gap: 26, margin: '24px 0 40px'}}>
          {chips.map((c) => (
            <div key={c.t} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '12px 32px', borderRadius: 999, ...GLASS, border: `2px solid ${c.c}`, ...useReveal(c.at)}}>
              <Icon name={c.icon} size={36} color={c.c} />
              <span style={{fontFamily, fontSize: 38, fontWeight: 800, color: '#fff'}}>{c.t}</span>
            </div>
          ))}
        </div>
        <div style={{...useReveal(finalAt - 10, 20)}}>
          <Flag width={130} delay={finalAt - 10} />
        </div>
        <div style={{fontFamily, fontSize: 58, fontWeight: 800, color: GOLD, marginTop: 20, textShadow: `0 0 30px ${GOLD}55`, ...useReveal(finalAt, 20)}}>
          فصلٌ بين السلطات… وتعاونٌ من أجل الكويت
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: fadeOut}} />
      {chips.map((c) => (
        <Sfx key={c.t} at={c.at} vol={0.12} />
      ))}
      <Sfx at={finalAt} src="sfx/cinematic-boom.wav" vol={0.3} />
    </AbsoluteFill>
  );
};

// شريط صغير ثابت أعلى الشاشة بعنوان السلسلة
const Hud: React.FC<{dur: number}> = ({dur}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 20, dur - 20, dur], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 36, left: 50, display: 'flex', alignItems: 'center', gap: 14, opacity: o * 0.85}}>
      <span style={{fontFamily, fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textShadow}}>السلطات العامة في دولة الكويت</span>
      <svg width={42} height={21} viewBox="0 0 200 100">
        <rect width="200" height="34" fill="#007A3D" />
        <rect y="33" width="200" height="34" fill="#fff" />
        <rect y="66" width="200" height="34" fill="#CE1126" />
        <polygon points="0,0 50,25 50,75 0,100" fill="#000" />
      </svg>
    </div>
  );
};

const SceneView: React.FC<SceneProps> = (p) => {
  const {s} = p;
  switch (s.kind) {
    case 'intro':
      return <Intro {...p} />;
    case 'article6':
      return (
        <QuoteScene
          {...p}
          icon="flag"
          kicker="الأساس"
          article="المادة 6"
          bg="kuwait/constitution.jpg"
          from="نظام"
          to="جميعا"
          segs={[{t: 'نظام الحكم في الكويت'}, {t: 'ديمقراطي،', hl: true}, {t: 'السيادة فيه'}, {t: 'للأمة مصدر السلطات جميعاً', hl: true}]}
          note="الأمة صاحبة السيادة… ومنها تنبثق كل السلطات"
        />
      );
    case 'article50':
      return (
        <QuoteScene
          {...p}
          icon="link"
          kicker="المبدأ الحاكم"
          article="المادة 50"
          bg="kuwait/constitution.jpg"
          from="ويقوم"
          to="الدستور."
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
      return <Pillars {...p} />;
    case 'legislative':
      return (
        <AuthorityScene
          {...p}
          img="kuwait/assembly.jpg"
          place="مبنى مجلس الأمة — مدينة الكويت"
          num="السلطة الأولى"
          title="السلطة التشريعية"
          who={['الأمير', 'مجلس الأمة']}
          whoAt="يتولاها"
          article="المادة 51"
          color={GOLD}
          icon="parliament"
          notes={[
            {t: 'مناقشة القوانين وإقرارها', at: 'وفي هذا'},
            {t: 'الرقابة على أعمال الحكومة', at: 'ويراقب'},
          ]}
        />
      );
    case 'executive':
      return (
        <AuthorityScene
          {...p}
          img="kuwait/seif.jpg"
          place="قصر السيف — مدينة الكويت"
          num="السلطة الثانية"
          title="السلطة التنفيذية"
          who={['الأمير', 'مجلس الوزراء', 'الوزراء']}
          whoAt="يتولاها"
          article="المادة 52"
          color={GREEN}
          icon="gear"
          notes={[{t: 'على النحو المبيّن في الدستور', at: 'على النحو'}]}
        />
      );
    case 'judicial':
      return (
        <AuthorityScene
          {...p}
          img="kuwait/justice.jpg"
          place="قصر العدل — مدينة الكويت"
          num="السلطة الثالثة"
          title="السلطة القضائية"
          who={['المحاكم باسم الأمير']}
          whoAt="فتتولاها"
          article="المادة 53"
          color={BLUE}
          icon="scales"
          notes={[{t: 'لا سلطان لأي جهة على القاضي في قضائه (م 163)', at: 'ولا سلطان'}]}
        />
      );
    case 'chapter':
      return <Chapter {...p} />;
    case 'structure':
      return <Structure {...p} />;
    case 'ministries':
      return <Ministries {...p} />;
    case 'emir':
      return <Emir {...p} />;
    case 'powers':
      return <Powers {...p} />;
    case 'formation':
      return <Formation {...p} />;
    case 'council':
      return <Council {...p} />;
    case 'accountability':
      return <Accountability {...p} />;
    case 'outro':
      return <Outro {...p} />;
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
              <SceneView s={scene} frames={frames} />
              <Voice s={scene} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <Grain />
      <Sequence from={hudFrom} durationInFrames={hudTo - hudFrom}>
        <Hud dur={hudTo - hudFrom} />
      </Sequence>
      {tl.slice(1).map(({start}, i) => (
        <Sequence key={i} from={Math.max(0, start - 4)} durationInFrames={30}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.3} />
        </Sequence>
      ))}
      {/* موسيقى خلفية منخفضة تحت التعليق، تتكرر لتغطي طول الفيديو */}
      <Audio
        src={staticFile('music/background.wav')}
        loop
        volume={(f) => 0.13 * interpolate(f, [0, 20], [0, 1], clamp) * interpolate(f, [total - 2 * FPS, total], [1, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
