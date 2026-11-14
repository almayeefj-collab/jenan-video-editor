// الملتقى النسائي — جمعية المعلمين الكويتية (عمودي 9:16)
// الترتيب: عنوان ← مقتطفات سريعة من الضيافة والسلام والحضور ← المذيعة ← سؤال وجواب هيبات
// ← سؤال وجواب د. مريم العويش ← مقتطفات من محاضرتها وصوتها خلفية مع موسيقى ناعمة ← باقي المقابلات ← ختام
// الكلام كامل بدون قص. الأسماء تحت كل وحدة من NAMES (اللي ما لها اسم ما يطلع لها شي).
// اللقطات في public/footage/forum/<رقم IMG>.mp4 (ما ترفع للمستودع): 1080×1920 / 30fps والصوت مطبّع بـ loudnorm
// الموسيقى music/forum_soft.wav (بيانو هادي، مولّدة بـ tools/compose_romantic.py) أطول من الفيديو، فما تحتاج loop
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {loadFont} from '@remotion/fonts';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from 'remotion';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const XFADE = 12;
const DIR = 'footage/forum/';

const TITLE_FONT = 'El Messiri';
const BODY_FONT = 'Almarai';
loadFont({family: TITLE_FONT, url: staticFile('fonts/ElMessiri-700.woff2'), weight: '700'});
loadFont({family: TITLE_FONT, url: staticFile('fonts/ElMessiri-400.woff2'), weight: '400'});
loadFont({family: BODY_FONT, url: staticFile('fonts/almarai-arabic-400-normal.woff2'), weight: '400'});
loadFont({family: BODY_FONT, url: staticFile('fonts/almarai-arabic-700-normal.woff2'), weight: '700'});
loadFont({family: BODY_FONT, url: staticFile('fonts/almarai-arabic-800-normal.woff2'), weight: '800'});

// ألوان مأخوذة من شعار الجمعية: برتقالي الشمس، أزرق الشريط، بني السفينة، على خلفية عاجية فاتحة
const IVORY = '#FFF8EE';
const PEACH = '#FBD9A8';
const ORANGE = '#EE8A2A';
const BLUE = '#1A8BD0';
const BROWN = '#5A3A22';
const INK = '#1B140E';

// أسماء الضيفات حسب رقم المقطع؛ اللي فاضي ما يطلع له اسم
const NAMES: Record<string, {name: string; role?: string}> = {
  '1652': {name: 'هيبات'},
  '1696': {name: 'د. مريم العويش'},
};
// عنوان مقتطفات المحاضرة
const LECTURE_TITLE = 'محاضرة د. مريم العويش';

type Clip = {src: string; from: number; to: number};
type Shot =
  | {kind: 'title'; dur: number}
  | {kind: 'broll'; clip: Clip}
  | {kind: 'talk'; clip: Clip; name?: string; role?: string}
  | {kind: 'excerpt'; clip: Clip; first?: boolean}
  | {kind: 'final'; dur: number};

const b = (src: string, from: number, to: number): Shot => ({kind: 'broll', clip: {src, from, to}});
const e = (src: string, from: number, to: number, first?: boolean): Shot => ({kind: 'excerpt', clip: {src, from, to}, first});
const t = (src: string, from: number, to: number): Shot => ({kind: 'talk', clip: {src, from, to}, ...NAMES[src]});

const SHOTS: Shot[] = [
  {kind: 'title', dur: 3.6},
  // مقتطفات سريعة: الضيافة، السلام، الحضور
  b('1634', 1.2, 2.8),
  b('1635', 1.0, 2.5),
  b('1642', 1.0, 2.5),
  b('1668', 1.0, 2.5),
  b('1656', 0.3, 1.9),
  b('1657', 0.2, 1.8),
  b('1690', 0.3, 1.9),
  b('1692', 0.6, 2.2),
  b('1683', 1.5, 3.1),
  b('1687', 2.5, 4.2),
  // المذيعة
  t('1674', 0.0, 26.3),
  // السؤال (مقطعين) ← هيبات (مقطعين)
  t('1649', 0.0, 3.0),
  t('1654', 0.0, 8.84),
  t('1652', 0.0, 21.75),
  t('1655', 0.0, 25.3),
  b('1645', 0.4, 2.8),
  // السؤال ← د. مريم العويش
  t('1695', 0.95, 14.85),
  t('1696', 0.0, 36.4),
  // مقتطفات من محاضرتها بدون صوتها الأصلي؛ صوتها (كلام السكينة) خلفية مع موسيقى ناعمة
  e('1709', 1.0, 4.0, true),
  e('1704', 0.3, 2.8),
  e('1702', 2.0, 5.0),
  e('1705', 1.0, 3.5),
  e('1701', 2.0, 4.8),
  e('1688', 0.5, 3.0),
  e('1703', 1.2, 4.2),
  e('1699', 4.0, 6.8),
  e('1681', 0.8, 3.3),
  e('1709', 13.0, 15.8),
  // باقي المقابلات
  b('1689', 0.5, 2.9),
  t('1659', 0.0, 4.97),
  t('1660', 0.0, 11.5),
  b('1680', 0.5, 2.9),
  t('1667', 0.45, 10.95),
  t('1664', 0.5, 23.75),
  b('1693', 0.6, 3.4),
  {kind: 'final', dur: 4.5},
];

// صوت المحاضِرة تحت المقتطفات: كلامها عن السكينة كامل
const VOICE_BED: Clip[] = [{src: '1700', from: 0.0, to: 23.35}];
const VOICE = 0.95;
const MUSIC = 0.5;
const BED_MUSIC = 0.16;

const shotFrames = (s: Shot) => Math.round((s.kind === 'title' || s.kind === 'final' ? s.dur : s.clip.to - s.clip.from) * FPS);
// كلام ورا كلام = قطع مباشر؛ اللقطات السريعة والمقتطفات كروس فيد قصير؛ غير كذا كروس فيد عادي
const xfadeBefore = (i: number) => {
  if (i === 0) return 0;
  const p = SHOTS[i - 1].kind;
  const c = SHOTS[i].kind;
  if (p === 'talk' && c === 'talk') return 0;
  if ((p === 'broll' && c === 'broll') || (p === 'excerpt' && c === 'excerpt')) return 6;
  return XFADE;
};

export const timeline = () => {
  let at = 0;
  return SHOTS.map((shot, i) => {
    at -= xfadeBefore(i);
    const start = at;
    at += shotFrames(shot);
    return {shot, start, frames: shotFrames(shot), fadeIn: xfadeBefore(i), fadeOut: i + 1 < SHOTS.length ? xfadeBefore(i + 1) : 0};
  });
};
export const totalFrames = () => {
  const tl = timeline();
  const last = tl[tl.length - 1];
  return last.start + last.frames;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const GRADE = 'contrast(1.04) saturate(1.06) brightness(1.03)';

const useReveal = (delay: number, dur = 20) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.96 + 0.04 * p})`};
};

const Footage: React.FC<{clip: Clip; frames: number; volume?: (f: number) => number; muted?: boolean; filter?: string; zoom?: [number, number]}> = ({
  clip, frames, volume, muted, filter = GRADE, zoom = [1.0, 1.05],
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, frames], zoom);
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile(`${DIR}${clip.src}.mp4`)}
        trimBefore={Math.round(clip.from * FPS)}
        muted={muted}
        volume={volume}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter}}
      />
    </AbsoluteFill>
  );
};

// أشعة شمس تدور ببطء (من روح الشعار)
const Rays: React.FC<{opacity?: number}> = ({opacity = 0.22}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity}}>
      <div
        style={{
          width: 2600, height: 2600, borderRadius: '50%',
          background: `repeating-conic-gradient(from ${frame * 0.15}deg, ${ORANGE}55 0deg 4deg, transparent 4deg 15deg)`,
          maskImage: 'radial-gradient(circle, black 0%, transparent 62%)',
          WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 62%)',
        }}
      />
    </AbsoluteFill>
  );
};

const Petals: React.FC<{seed: string; count?: number}> = ({seed, count = 16}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const x = random(`${seed}x${i}`) * WIDTH;
        const y0 = random(`${seed}y${i}`) * HEIGHT;
        const r = 4 + random(`${seed}r${i}`) * 9;
        const y = ((y0 - frame * (0.4 + random(`${seed}s${i}`) * 0.8)) % HEIGHT + HEIGHT) % HEIGHT;
        const c = i % 3 === 0 ? BLUE : ORANGE;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${c}88 0%, transparent 70%)`, opacity: 0.5 + 0.3 * Math.sin(frame / (10 + i) + i)}} />;
      })}
    </AbsoluteFill>
  );
};

// خلفية فاتحة: لقطة مضببة بلون عاجي + أشعة
const LightBackdrop: React.FC<{src: string; frames: number}> = ({src, frames}) => (
  <>
    <Footage clip={{src, from: 0.5, to: 5}} frames={frames} muted filter="blur(26px) brightness(1.15) saturate(0.8)" zoom={[1.15, 1.25]} />
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${IVORY}f2 0%, ${IVORY}d9 45%, ${PEACH}e6 100%)`}} />
    <Rays />
    <Petals seed={src} />
  </>
);

const Logo: React.FC<{delay: number; height: number}> = ({delay, height}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  return (
    <div style={{display: 'flex', justifyContent: 'center', marginBottom: 44, opacity: Math.min(1, p * 1.5), transform: `scale(${0.7 + 0.3 * p})`}}>
      <Img src={staticFile('brand/kts-logo-clear.png')} style={{height, display: 'block', filter: 'drop-shadow(0 14px 30px rgba(90,58,34,0.35))'}} />
    </div>
  );
};

const Divider: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', justifyContent: 'center', gap: 10, margin: '30px 0'}}>
      <div style={{width: 160 * p, height: 6, borderRadius: 3, background: ORANGE}} />
      <div style={{width: 60 * p, height: 6, borderRadius: 3, background: BLUE}} />
    </div>
  );
};

const Card: React.FC<{frames: number; src: string; title: string; sub: string; fadeOut?: boolean; toBlack?: boolean}> = ({frames, src, title, sub, fadeOut, toBlack}) => {
  const frame = useCurrentFrame();
  const out = fadeOut ? interpolate(frame, [frames - 16, frames - 2], [1, 0], clamp) : 1;
  const black = toBlack ? interpolate(frame, [frames - 22, frames], [0, 1], clamp) : 0;
  return (
    <AbsoluteFill style={{background: IVORY}}>
      <LightBackdrop src={src} frames={frames} />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 70px', opacity: out}}>
        <Logo delay={0} height={460} />
        <div style={{...useReveal(10), fontFamily: TITLE_FONT, fontSize: 150, fontWeight: 700, color: BROWN, lineHeight: 1.1}}>{title}</div>
        <Divider delay={22} />
        <div style={{...useReveal(28), fontFamily: BODY_FONT, fontSize: 52, fontWeight: 800, color: BLUE}}>{sub}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

// الاسم تحت: بطاقة بيضاء بخط برتقالي وأزرق
const NameTag: React.FC<{name: string; role?: string; frames: number}> = ({name, role, frames}) => {
  const frame = useCurrentFrame();
  const end = Math.min(frames - 10, 7 * FPS);
  const show = interpolate(frame, [12, 30, end - 16, end], [0, 1, 1, 0], {...clamp, easing: ease});
  const bar = interpolate(frame, [12, 36], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', bottom: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: show, transform: `translateY(${(1 - show) * 40}px)`}}>
      <div style={{direction: 'rtl', background: `${IVORY}f2`, borderRadius: 26, padding: '22px 52px 24px', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', textAlign: 'center', minWidth: 420}}>
        <div style={{fontFamily: BODY_FONT, fontSize: 60, fontWeight: 800, color: BROWN, lineHeight: 1.25}}>{name}</div>
        {role ? <div style={{fontFamily: BODY_FONT, fontSize: 34, fontWeight: 700, color: BLUE, marginTop: 6}}>{role}</div> : null}
        <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14}}>
          <div style={{width: 120 * bar, height: 5, borderRadius: 3, background: ORANGE}} />
          <div style={{width: 40 * bar, height: 5, borderRadius: 3, background: BLUE}} />
        </div>
      </div>
    </div>
  );
};

const Badge: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [8, 26], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top: 80, right: 60, display: 'flex', alignItems: 'center', gap: 14, opacity: o, direction: 'rtl'}}>
      <Img src={staticFile('brand/kts-logo-clear.png')} style={{height: 96, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))'}} />
      <div style={{fontFamily: TITLE_FONT, fontSize: 36, fontWeight: 700, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>الملتقى النسائي</div>
    </div>
  );
};

type Edge = {fadeIn: number; fadeOut: number};
const Talk: React.FC<{clip: Clip; frames: number; name?: string; role?: string} & Edge> = ({clip, frames, name, role, fadeIn, fadeOut}) => {
  const inF = fadeIn || 3;
  const outF = fadeOut || 3;
  const vol = (f: number) => Math.min(interpolate(f, [0, inF], [0, 1], clamp), interpolate(f, [frames - outF, frames], [1, 0], clamp));
  return (
    <AbsoluteFill>
      <Footage clip={clip} frames={frames} volume={vol} zoom={[1.0, 1.04]} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 15%, transparent 75%, rgba(0,0,0,0.35) 100%)'}} />
      <Badge />
      {name ? <NameTag name={name} role={role} frames={frames} /> : null}
    </AbsoluteFill>
  );
};

const BRoll: React.FC<{clip: Clip; frames: number}> = ({clip, frames}) => (
  <AbsoluteFill>
    <Footage clip={clip} frames={frames} muted zoom={[1.03, 1.12]} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.35) 100%)'}} />
  </AbsoluteFill>
);

// عنوان المحاضرة يطلع على أول مقتطف
const LectureTitle: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const show = interpolate(frame, [6, 24, frames + 60, frames + 80], [0, 1, 1, 0], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', bottom: 260, left: 60, right: 60, direction: 'rtl', textAlign: 'center', opacity: show, transform: `translateY(${(1 - show) * 30}px)`}}>
      <div style={{display: 'inline-block', background: `linear-gradient(90deg, ${ORANGE}, #F4A54C)`, borderRadius: 24, padding: '18px 46px', boxShadow: '0 12px 36px rgba(0,0,0,0.3)'}}>
        <div style={{fontFamily: TITLE_FONT, fontSize: 64, fontWeight: 700, color: '#fff'}}>{LECTURE_TITLE}</div>
      </div>
    </div>
  );
};

const ShotView: React.FC<{shot: Shot; frames: number} & Edge> = ({shot, frames, fadeIn, fadeOut}) => {
  switch (shot.kind) {
    case 'title':
      return <Card frames={frames} src="1683" title="الملتقى النسائي" sub="جمعية المعلمين الكويتية" fadeOut />;
    case 'broll':
      return <BRoll clip={shot.clip} frames={frames} />;
    case 'excerpt':
      return (
        <AbsoluteFill>
          <BRoll clip={shot.clip} frames={frames} />
          {shot.first ? <LectureTitle frames={frames} /> : null}
        </AbsoluteFill>
      );
    case 'talk':
      return <Talk clip={shot.clip} frames={frames} name={shot.name} role={shot.role} fadeIn={fadeIn} fadeOut={fadeOut} />;
    case 'final':
      return <Card frames={frames} src="1687" title="الملتقى النسائي" sub="جمعية المعلمين الكويتية" toBlack />;
  }
};

const excerptSpan = () => {
  const ex = timeline().filter((s) => s.shot.kind === 'excerpt');
  const last = ex[ex.length - 1];
  return {a: ex[0].start, z: last.start + last.frames};
};

// الموسيقى: عادية على العنوان واللقطات، خفيفة جداً تحت صوت المحاضرة، ساكتة تحت الكلام
const musicVolume = (f: number) => {
  const tl = timeline();
  const end = totalFrames();
  const ex = excerptSpan();
  let v = MUSIC;
  if (f >= ex.a - 15 && f <= ex.z + 15) v = Math.min(interpolate(f, [ex.a - 15, ex.a], [MUSIC, BED_MUSIC], clamp), interpolate(f, [ex.z, ex.z + 15], [BED_MUSIC, MUSIC], clamp));
  if (f >= ex.a && f <= ex.z) v = BED_MUSIC;
  for (const s of tl) {
    if (s.shot.kind !== 'talk') continue;
    const a = s.start;
    const z = s.start + s.frames;
    if (f >= a - 15 && f <= z + 15) {
      const k = Math.min(interpolate(f, [a - 15, a], [1, 0], clamp), interpolate(f, [z, z + 15], [0, 1], clamp));
      v = Math.min(v, MUSIC * k);
    }
  }
  return v * interpolate(f, [0, 15, end - 30, end], [0, 1, 1, 0], clamp);
};

const VoiceBed: React.FC = () => {
  const {a, z} = excerptSpan();
  let at = a;
  return (
    <>
      {VOICE_BED.map((c, i) => {
        const len = Math.round((c.to - c.from) * FPS);
        const start = at;
        at += len;
        if (start >= z) return null;
        const dur = Math.min(len, z - start);
        const vol = (f: number) => VOICE * Math.min(interpolate(f, [0, 8], [0, 1], clamp), interpolate(f, [dur - 12, dur], [1, 0], clamp));
        return (
          <Sequence key={i} from={start} durationInFrames={dur}>
            <Audio src={staticFile(`${DIR}${c.src}.mp4`)} trimBefore={Math.round(c.from * FPS)} volume={vol} />
          </Sequence>
        );
      })}
    </>
  );
};

export const WomenForum: React.FC = () => {
  const tl = timeline();
  return (
    <AbsoluteFill style={{background: INK}}>
      <TransitionSeries>
        {tl.map(({shot, frames, fadeIn, fadeOut}, i) => (
          <Fragment key={i}>
            {fadeIn ? <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: fadeIn})} /> : null}
            <TransitionSeries.Sequence durationInFrames={frames}>
              <ShotView shot={shot} frames={frames} fadeIn={fadeIn} fadeOut={fadeOut} />
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <Audio src={staticFile('music/forum_soft.wav')} volume={musicVolume} />
      <VoiceBed />
    </AbsoluteFill>
  );
};
