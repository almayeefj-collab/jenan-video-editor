// الملتقى النسائي — جمعية المعلمين الكويتية (عمودي 9:16)
// عنوان ← لقطات الاستقبال ← مقدمة المذيعة ← أسئلة وأجوبة بينها لقطات من الملتقى
// ← ترحيب المقدّمة (بني) ← كلمة المحاضِرة (أسود) عن السكينة كاملة ← مقتطفات صامتة وصوتها خلفية ← ختام
// اللقطات في public/footage/forum/<رقم IMG>.mp4 (ما ترفع للمستودع):
// محوّلة لـ 1080×1920 / 30fps، والصوت مطبّع بـ loudnorm
// الموسيقى بس على العنوان واللقطات الصامتة؛ تحت الكلام تسكت
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const XFADE = 12;
const DIR = 'footage/forum/';

const NAVY = '#13234B';
const GOLD = '#D9B77A';
const CREAM = '#F7F1E6';
const INK = '#0B1020';

type Clip = {src: string; from: number; to: number};
type Shot =
  | {kind: 'title'; dur: number}
  | {kind: 'broll'; clip: Clip}
  | {kind: 'talk'; clip: Clip}
  | {kind: 'excerpt'; clip: Clip}
  | {kind: 'final'; dur: number};

const b = (src: string, from: number, to: number): Shot => ({kind: 'broll', clip: {src, from, to}});
const e = (src: string, from: number, to: number): Shot => ({kind: 'excerpt', clip: {src, from, to}});
const t = (src: string, from: number, to: number): Shot => ({kind: 'talk', clip: {src, from, to}});

const SHOTS: Shot[] = [
  {kind: 'title', dur: 4.5},
  b('1645', 0.4, 3.2),
  b('1634', 1.0, 3.8),
  b('1635', 0.8, 3.4),
  b('1656', 0.0, 2.4),
  // مقدمة المذيعة
  t('1674', 0.0, 26.3),
  b('1642', 0.5, 3.1),
  b('1668', 0.6, 3.2),
  b('1657', 0.0, 2.2),
  // السؤال الأول (مقطعين) ← الإجابة (مقطعين)
  t('1649', 0.0, 3.0),
  t('1654', 0.0, 8.84),
  t('1652', 0.0, 21.75),
  t('1655', 0.0, 25.3),
  b('1683', 1.0, 3.8),
  b('1687', 2.0, 4.8),
  // السؤال الثاني ← الإجابة
  t('1659', 0.0, 4.97),
  t('1660', 0.0, 11.5),
  b('1689', 0.5, 3.0),
  b('1680', 0.5, 3.3),
  // السؤال الثالث ← الإجابة
  t('1667', 0.45, 10.95),
  t('1664', 0.5, 23.75),
  b('1700', 5.0, 7.8),
  b('1690', 0.0, 2.4),
  // السؤال الرابع ← الإجابة
  t('1695', 0.95, 14.85),
  t('1696', 0.0, 36.4),
  b('1692', 0.0, 2.9),
  b('1693', 0.6, 3.6),
  // ترحيب المقدّمة على المنصة (لابسة بني)
  b('1681', 0.8, 3.8),
  t('1697', 0.0, 62.3),
  // المحاضِرة (لابسة أسود) — كلامها عن السكينة كامل بصوته
  t('1700', 0.0, 23.35),
  // مقتطفات بدون صوتها الأصلي؛ صوت المحاضِرة يمشي تحتها خلفية (VOICE_BED)
  e('1701', 2.0, 5.2),
  e('1704', 0.3, 3.3),
  e('1709', 1.0, 4.4),
  e('1705', 1.0, 4.2),
  e('1702', 2.0, 5.4),
  e('1688', 0.5, 3.6),
  e('1703', 1.2, 4.6),
  e('1699', 4.0, 7.4),
  e('1709', 13.0, 16.6),
  {kind: 'final', dur: 5},
];

// صوت المحاضِرة الخلفي تحت المقتطفات: مقاطع من كلامها ورا بعض
const VOICE_BED: Clip[] = [
  {src: '1709', from: 0.89, to: 18.3},
  {src: '1702', from: 1.47, to: 15.1},
];
const VOICE = 0.8;
const BED_MUSIC = 0.18;

const shotFrames = (s: Shot) => Math.round((s.kind === 'title' || s.kind === 'final' ? s.dur : s.clip.to - s.clip.from) * FPS);
// كلام ورا كلام = قطع مباشر عشان السؤال والجواب يتواصلون؛ غير كذا كروس فيد
const xfadeBefore = (i: number) =>
  i === 0 ? 0 : SHOTS[i - 1].kind === 'talk' && SHOTS[i].kind === 'talk' ? 0 : SHOTS[i - 1].kind === 'excerpt' && SHOTS[i].kind === 'excerpt' ? 8 : XFADE;

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
const shadow = '0 4px 26px rgba(0,0,0,0.7)';
const GRADE = 'contrast(1.04) saturate(1.06) brightness(1.02)';

const useReveal = (delay: number, dur = 22) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 24}px)`};
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

const Vignette: React.FC<{strength?: number}> = ({strength = 0.45}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${strength}) 100%)`}} />
);

const Dust: React.FC<{seed: string; count?: number}> = ({seed, count = 20}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const x = random(`${seed}x${i}`) * WIDTH;
        const y0 = random(`${seed}y${i}`) * HEIGHT;
        const r = 3 + random(`${seed}r${i}`) * 11;
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
  const p = interpolate(frame - delay, [0, 26], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '34px auto'}}>
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to left, ${GOLD}, transparent)`}} />
      <div style={{width: 12, height: 12, transform: `rotate(45deg) scale(${p})`, background: GOLD}} />
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to right, ${GOLD}, transparent)`}} />
    </div>
  );
};

const Backdrop: React.FC<{src: string; frames: number}> = ({src, frames}) => (
  <>
    <Footage clip={{src, from: 0.5, to: 5}} frames={frames} muted filter="blur(22px) brightness(0.4) saturate(1.1)" zoom={[1.15, 1.25]} />
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${NAVY}cc 0%, ${NAVY}55 50%, ${INK}dd 100%)`}} />
    <Dust seed={src} />
  </>
);

const Logo: React.FC<{delay: number; size: number}> = ({delay, size}) => (
  <div style={{...useReveal(delay), display: 'flex', justifyContent: 'center', marginBottom: 40}}>
    <div style={{background: 'rgba(255,255,255,0.92)', borderRadius: 28, padding: 18, boxShadow: '0 10px 40px rgba(0,0,0,0.35)'}}>
      <Img src={staticFile('brand/kts-logo.png')} style={{height: size, display: 'block'}} />
    </div>
  </div>
);

const TitleCard: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [frames - 18, frames - 2], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <Backdrop src="1683" frames={frames} />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily, padding: '0 70px', opacity: out}}>
        <Logo delay={0} size={210} />
        <div style={{...useReveal(10), fontSize: 150, fontWeight: 900, color: CREAM, lineHeight: 1.2, textShadow: shadow}}>
          الملتقى
          <br />
          النسائي
        </div>
        <Rule width={480} delay={28} />
        <div style={{...useReveal(36), fontSize: 58, fontWeight: 700, color: GOLD, textShadow: shadow}}>جمعية المعلمين الكويتية</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// شارة صغيرة باسم الملتقى فوق طول الكلام
const Badge: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [8, 26], [0, 0.92], clamp);
  return (
    <div style={{position: 'absolute', top: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{direction: 'rtl', fontFamily, padding: '12px 34px', borderRadius: 40, background: `${NAVY}b8`, border: `1.5px solid ${GOLD}99`, fontSize: 34, fontWeight: 700, color: CREAM}}>
        الملتقى النسائي
      </div>
    </div>
  );
};

type Edge = {fadeIn: number; fadeOut: number};
const Talk: React.FC<{clip: Clip; frames: number} & Edge> = ({clip, frames, fadeIn, fadeOut}) => {
  // دخول وطلوع ناعم للصوت؛ قطع مباشر بين سؤال وجواب ياخذ 3 فريمات بس عشان ما يطقطق
  const inF = fadeIn || 3;
  const outF = fadeOut || 3;
  const vol = (f: number) => Math.min(interpolate(f, [0, inF], [0, 1], clamp), interpolate(f, [frames - outF, frames], [1, 0], clamp));
  return (
    <AbsoluteFill>
      <Footage clip={clip} frames={frames} volume={vol} zoom={[1.0, 1.04]} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,16,32,0.45) 0%, transparent 16%, transparent 80%, rgba(11,16,32,0.4) 100%)'}} />
      <Vignette strength={0.3} />
      <Badge />
    </AbsoluteFill>
  );
};

const BRoll: React.FC<{clip: Clip; frames: number}> = ({clip, frames}) => (
  <AbsoluteFill>
    <Footage clip={clip} frames={frames} muted zoom={[1.02, 1.1]} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,16,32,0.4) 0%, transparent 18%, transparent 72%, rgba(11,16,32,0.5) 100%)'}} />
    <Vignette />
  </AbsoluteFill>
);

const Final: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const black = interpolate(frame, [frames - 24, frames], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: INK}}>
      <Backdrop src="1687" frames={frames} />
      <AbsoluteFill style={{direction: 'rtl', justifyContent: 'center', alignItems: 'center', textAlign: 'center', fontFamily, padding: '0 60px'}}>
        <Logo delay={4} size={190} />
        <div style={{...useReveal(12), fontSize: 120, fontWeight: 900, color: CREAM, lineHeight: 1.2, textShadow: shadow}}>الملتقى النسائي</div>
        <Rule width={420} delay={26} />
        <div style={{...useReveal(34), fontSize: 56, fontWeight: 700, color: GOLD, textShadow: shadow}}>جمعية المعلمين الكويتية</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{shot: Shot; frames: number} & Edge> = ({shot, frames, fadeIn, fadeOut}) => {
  switch (shot.kind) {
    case 'title':
      return <TitleCard frames={frames} />;
    case 'broll':
    case 'excerpt':
      return <BRoll clip={shot.clip} frames={frames} />;
    case 'talk':
      return <Talk clip={shot.clip} frames={frames} fadeIn={fadeIn} fadeOut={fadeOut} />;
    case 'final':
      return <Final frames={frames} />;
  }
};

// الموسيقى تطلع على العنوان واللقطات الصامتة وتسكت تحت الكلام
const MUSIC = 0.55;
const musicVolume = (f: number) => {
  const tl = timeline();
  const end = totalFrames();
  let v = MUSIC;
  const ex = excerptSpan();
  if (f >= ex.a - 15 && f <= ex.z) v = Math.min(v, interpolate(f, [ex.a - 15, ex.a], [MUSIC, BED_MUSIC], clamp));
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

const excerptSpan = () => {
  const ex = timeline().filter((s) => s.shot.kind === 'excerpt');
  const last = ex[ex.length - 1];
  return {a: ex[0].start, z: last.start + last.frames};
};

// الصوت الخلفي يبدأ مع أول مقتطف، ويخفت آخرها
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
        const vol = (f: number) => {
          const g = start + f;
          return VOICE * Math.min(interpolate(f, [0, 6], [0, 1], clamp), interpolate(f, [len - 6, len], [1, 0], clamp), interpolate(g, [a, a + 12, z - 40, z], [0, 1, 1, 0], clamp));
        };
        return (
          <Sequence key={i} from={start} durationInFrames={Math.min(len, z - start)}>
            <Audio src={staticFile(`${DIR}${c.src}.mp4`)} trimBefore={Math.round(c.from * FPS)} volume={vol} />
          </Sequence>
        );
      })}
    </>
  );
};

// الموسيقى أقصر من الفيديو. ما نستخدم loop لأن Remotion يصفّر الفريم مع كل تكرار
// فتتلخبط دالة الصوت؛ بدالها نحط نسخ ورا بعض، وكل نسخة جديدة تبدأ داخل مقطع كلام
// (الموسيقى ساكتة فيه) عشان ما ينسمع مكان الوصلة
const MUSIC_FRAMES = Math.floor(160.9 * FPS);
const musicStarts = () => {
  const talks = timeline().filter((s) => s.shot.kind === 'talk');
  const end = totalFrames();
  const starts = [0];
  while (starts[starts.length - 1] + MUSIC_FRAMES < end) {
    const prev = starts[starts.length - 1];
    const cut = talks.filter((s) => s.start + 20 > prev && s.start + 20 < prev + MUSIC_FRAMES).pop();
    starts.push(cut ? cut.start + 20 : prev + MUSIC_FRAMES);
  }
  return starts;
};

const Music: React.FC = () => {
  const starts = musicStarts();
  const end = totalFrames();
  return (
    <>
      {starts.map((st, i) => (
        <Sequence key={i} from={st} durationInFrames={(i + 1 < starts.length ? starts[i + 1] : end) - st}>
          <Audio src={staticFile('c46/soft.mp3')} volume={(f) => musicVolume(st + f)} />
        </Sequence>
      ))}
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
      <Music />
      <VoiceBed />
    </AbsoluteFill>
  );
};
