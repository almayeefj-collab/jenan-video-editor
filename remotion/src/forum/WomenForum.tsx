// الملتقى النسائي — جمعية المعلمين الكويتية (عمودي 9:16)
// الترتيب: عنوان ← مقتطفات سريعة من الضيافة والسلام والحضور ← المذيعة ← سؤال وجواب هيبات
// ← سؤال وجواب د. مريم العويش ← مقتطفات من محاضرتها وصوتها خلفية مع موسيقى ناعمة ← باقي المقابلات ← ختام
// الكلام كامل بدون قص. الأسماء تحت كل وحدة من NAMES (اللي ما لها اسم ما يطلع لها شي).
// اللقطات في public/footage/forum/<رقم IMG>.mp4 (ما ترفع للمستودع): 1080×1920 / 30fps والصوت مطبّع بـ loudnorm
// الموسيقى music/forum_user.m4a (من المستخدم، مطبّعة) أطول من الفيديو، فما تحتاج loop؛ خافتة جداً وتحت الكلام شبه ما تنسمع
import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {loadFont} from '@remotion/fonts';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const XFADE = 12;
const DIR = 'footage/forum/';

const TITLE_FONT = 'El Messiri';
const BODY_FONT = 'Almarai';
loadFont({family: TITLE_FONT, url: staticFile('fonts/ElMessiri-700.woff2'), weight: '700'});
loadFont({family: TITLE_FONT, url: staticFile('fonts/ElMessiri-400.woff2'), weight: '400'});
loadFont({family: 'Cairo', url: staticFile('fonts/Cairo.ttf'), weight: '200 1000'});
loadFont({family: BODY_FONT, url: staticFile('fonts/almarai-arabic-400-normal.woff2'), weight: '400'});
loadFont({family: BODY_FONT, url: staticFile('fonts/almarai-arabic-700-normal.woff2'), weight: '700'});
loadFont({family: BODY_FONT, url: staticFile('fonts/almarai-arabic-800-normal.woff2'), weight: '800'});

// ثيم أزرق رسمي مع زخارف إسلامية بسيطة (نجمة ثمانية وقوس)
// ثيم الجمعية المعتمد: كحلي، ذهبي للعناوين، أبيض للنص، وشريط سفلي من الذهبي للأزرق
const NAVY = '#13264D';
const DEEP = '#0B1834';
const BLUE = '#2F7FD6';
const GOLD = '#E3C28A';
const GOLD_GRAD = 'linear-gradient(180deg, #F3DDB0 0%, #D9AE6A 100%)';
const STEEL = '#AFC2DD';
const SKY = '#9CC9EE';
const MIST = '#DCEBF8';
const INK = '#06162E';
const BAR = `linear-gradient(90deg, ${GOLD} 0%, #C9B48E 35%, ${BLUE} 100%)`;
const COVER_SKIP = 60;
const VERSE = 'فَزَادَهُمْ إِيمَانًا';

// أسماء الضيفات حسب رقم المقطع؛ اللي فاضي ما يطلع له اسم
const NAMES: Record<string, {name: string; role?: string}> = {
  '1652': {name: 'أ. هبات البالول', role: 'عضو مجلس إدارة جمعية المعلمين الكويتية\nرئيس فريق إشراك المعلمين وإدماجهم'},
  '1697': {name: 'أ. هبات البالول', role: 'تقديم المحاضرة'},
  '1696': {name: 'د. مريم العويش', role: 'ضيفة الملتقى النسائي'},
  '1660': {name: 'أ. طيبة', role: 'حضور الملتقى النسائي'},
  '1664': {name: 'أ. جواهر العنزي', role: 'حضور الملتقى النسائي'},
};
// عنوان مقتطفات المحاضرة
const LECTURE_TITLE = 'موعظةٌ من القلب';
const LECTURE_SUB = 'مع د. مريم العويش';

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
  {kind: 'title', dur: 3.5},
  // مقتطفات سريعة: الضيافة، السلام، الحضور
  b('1634', 1.2, 2.5),
  b('1635', 1.0, 2.3),
  b('1668', 1.0, 2.3),
  b('1656', 0.3, 1.6),
  b('1690', 0.3, 1.6),
  b('1683', 1.5, 2.8),
  // المذيعة
  t('1674', 0.0, 26.3),
  // السؤال (مقطعين) ← أ. هبات (مقطعين) — كاملة
  t('1649', 0.0, 3.0),
  t('1654', 0.0, 8.84),
  t('1652', 0.0, 21.75),
  t('1655', 0.0, 25.3),
  // السؤال ← د. مريم العويش — كاملة
  t('1695', 0.95, 14.85),
  t('1696', 0.0, 36.4),
  // استفتاحية المحاضرة: ترحيب أ. هبات مختصر (أول جملة لين أول وقفة)
  t('1697', 0.0, 5.27),
  // مقتطفات من محاضرتها بدون صوتها الأصلي؛ صوتها خلفية مع موسيقى خافتة
  e('1709', 1.0, 4.0, true),
  e('1704', 0.3, 2.6),
  e('1702', 2.0, 4.6),
  e('1703', 1.2, 3.8),
  // باقي المقابلات — كاملة
  t('1659', 0.0, 4.97),
  t('1660', 0.0, 11.5),
  t('1667', 0.45, 10.95),
  t('1664', 0.5, 23.75),
  {kind: 'final', dur: 3.5},
];

// صوت المحاضِرة تحت المقتطفات: كلامها عن السكينة كامل
const VOICE_BED: Clip[] = [{src: '1700', from: 0.0, to: 23.35}];
const VOICE = 0.95;
const MUSIC = 0.22;
const UNDER_TALK = 0.05;
const BED_MUSIC = 0.08;

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

// نقشة نجمة ثمانية متكررة (SVG)
const star8 = (c: string, o: number) =>
  `<g fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width="1.6"><rect x="40" y="40" width="40" height="40"/><rect x="40" y="40" width="40" height="40" transform="rotate(45 60 60)"/><circle cx="60" cy="60" r="8"/><path d="M0 0 L20 20 M120 0 L100 20 M0 120 L20 100 M120 120 L100 100"/></g>`;
const PATTERN = `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>${star8('#9CCBF0', 0.35)}</svg>`)}")`;

const Pattern: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: PATTERN, backgroundSize: '120px 120px', backgroundPosition: `0 ${frame * 0.4}px`,
        maskImage: 'radial-gradient(ellipse at center, transparent 25%, black 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 25%, black 75%)',
      }}
    />
  );
};



const Logo: React.FC<{delay: number; height: number}> = ({delay, height}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
  return (
    <div style={{display: 'flex', justifyContent: 'center', marginBottom: 44, opacity: Math.min(1, p * 1.5), transform: `scale(${0.7 + 0.3 * p})`}}>
      <Img src={staticFile('brand/kts-logo-clear.png')} style={{height, display: 'block', filter: 'drop-shadow(0 14px 34px rgba(0,0,0,0.45))'}} />
    </div>
  );
};

const Divider: React.FC<{delay: number}> = ({delay}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, margin: '34px 0 18px'}}>
      <div style={{width: 260 * p, height: 1.5, background: `linear-gradient(to left, ${GOLD}cc, transparent)`}} />
      <div style={{width: 8, height: 8, borderRadius: 4, background: GOLD, opacity: p}} />
      <div style={{width: 260 * p, height: 1.5, background: `linear-gradient(to right, ${GOLD}cc, transparent)`}} />
    </div>
  );
};

// غلاف/ختام بنفس تصميم منشورات الجمعية: صورة من الملتقى تذوب في الكحلي فوق وتحت
const Card: React.FC<{frames: number; src: string; from?: number; fadeOut?: boolean; toBlack?: boolean}> = ({frames, src, from = 1, fadeOut, toBlack}) => {
  const frame = useCurrentFrame();
  const out = fadeOut ? interpolate(frame, [frames - 16, frames - 2], [1, 0], clamp) : 1;
  const black = toBlack ? interpolate(frame, [frames - 22, frames], [0, 1], clamp) : 0;
  const goldText = {background: GOLD_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} as const;
  return (
    <AbsoluteFill style={{background: DEEP}}>
      <Footage clip={{src, from, to: from + 6}} frames={frames} muted filter="brightness(0.95) saturate(0.85)" zoom={[1.05, 1.12]} />
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${DEEP} 0%, ${NAVY} 22%, ${NAVY}cc 33%, ${NAVY}33 48%, ${NAVY}22 58%, ${NAVY}cc 72%, ${DEEP} 86%)`}} />
      {/* زخرفة إسلامية (من المستخدم) بخطوط ذهبية خفيفة فوق وتحت، وتختفي عند الصورة */}
      <AbsoluteFill style={{opacity: 0.16}}>
        <Img src={staticFile('brand/ornament.png')} style={{position: 'absolute', top: -60, left: 0, width: WIDTH, maskImage: 'linear-gradient(180deg, black 30%, transparent 95%)', WebkitMaskImage: 'linear-gradient(180deg, black 30%, transparent 95%)'}} />
        <Img src={staticFile('brand/ornament.png')} style={{position: 'absolute', bottom: -60, left: 0, width: WIDTH, transform: 'scaleY(-1)', maskImage: 'linear-gradient(180deg, black 30%, transparent 95%)', WebkitMaskImage: 'linear-gradient(180deg, black 30%, transparent 95%)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{direction: 'rtl', alignItems: 'center', textAlign: 'center', opacity: out}}>
        {/* الترويسة: الشعار واسم الجمعية */}
        <div style={{...useReveal(0), marginTop: 150, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Img src={staticFile('brand/kts-logo-clear.png')} style={{height: 230, filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.45))'}} />
          <div style={{fontFamily: BODY_FONT, fontSize: 54, fontWeight: 800, color: '#fff', marginTop: 26}}>جمعية المعلمين الكويتية</div>
          <div style={{fontFamily: 'Cairo', fontSize: 22, fontWeight: 700, color: STEEL, letterSpacing: 7, marginTop: 8, direction: 'ltr'}}>KUWAIT TEACHERS SOCIETY</div>
        </div>
        <Divider delay={10} />
        <div style={{...useReveal(16), fontFamily: TITLE_FONT, fontSize: 64, fontWeight: 700, ...goldText, lineHeight: 1.4}}>{VERSE}</div>
        {/* العنوان تحت */}
        <div style={{position: 'absolute', bottom: 190, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{...useReveal(22), fontFamily: TITLE_FONT, fontSize: 132, fontWeight: 700, ...goldText, lineHeight: 1.3, whiteSpace: 'nowrap', filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.5))'}}>الملتقى النسائي</div>
          <div style={{...useReveal(32), fontFamily: TITLE_FONT, fontSize: 70, fontWeight: 700, color: '#fff', lineHeight: 1.35, marginTop: 8, textShadow: '0 4px 18px rgba(0,0,0,0.5)'}}>{LECTURE_TITLE}</div>
          <div style={{...useReveal(40), fontFamily: BODY_FONT, fontSize: 44, fontWeight: 800, color: MIST, marginTop: 6, textShadow: '0 3px 14px rgba(0,0,0,0.5)'}}>{LECTURE_SUB}</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'flex-end'}}>
        <div style={{height: 14, background: BAR}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

// الاسم تحت: بطاقة بيضاء بخط برتقالي وأزرق
// الاسم تحت: لوحة كحلية، الاسم ذهبي، المسمى أبيض، وشريط ذهبي-أزرق
const NameTag: React.FC<{name: string; role?: string; frames: number}> = ({name, role, frames}) => {
  const frame = useCurrentFrame();
  const end = Math.min(frames - 10, 8 * FPS);
  const show = interpolate(frame, [12, 30, end - 16, end], [0, 1, 1, 0], {...clamp, easing: ease});
  const bar = interpolate(frame, [14, 40], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', bottom: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: show, transform: `translateY(${(1 - show) * 40}px)`}}>
      <div style={{direction: 'rtl', borderRadius: 18, overflow: 'hidden', textAlign: 'center', maxWidth: 980}}>
        <div style={{padding: '22px 52px 22px'}}>
          <div style={{fontFamily: BODY_FONT, fontSize: 64, fontWeight: 800, color: GOLD, lineHeight: 1.25, textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 4px 22px rgba(0,0,0,0.55)'}}>{name}</div>
          {role
            ? role.split('\n').map((line, i) => (
                <div key={i} style={{fontFamily: BODY_FONT, fontSize: 34, fontWeight: 800, color: '#fff', marginTop: i ? 2 : 8, lineHeight: 1.35, textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 4px 22px rgba(0,0,0,0.55)'}}>{line}</div>
              ))
            : null}
        </div>
        <div style={{height: 5, width: 260, margin: '0 auto', borderRadius: 3, background: BAR, transform: `scaleX(${bar})`}} />
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
    <div style={{position: 'absolute', bottom: 250, left: 60, right: 60, direction: 'rtl', textAlign: 'center', opacity: show, transform: `translateY(${(1 - show) * 30}px)`}}>
      <div style={{display: 'inline-block', }}>
        <div style={{padding: '18px 56px 20px'}}>
          <div style={{fontFamily: TITLE_FONT, fontSize: 80, fontWeight: 700, color: GOLD, lineHeight: 1.35, textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 4px 22px rgba(0,0,0,0.55)'}}>{LECTURE_TITLE}</div>
          <div style={{fontFamily: BODY_FONT, fontSize: 44, fontWeight: 800, color: '#fff', marginTop: 4, textShadow: '0 2px 4px rgba(0,0,0,0.6), 0 4px 22px rgba(0,0,0,0.55)'}}>{LECTURE_SUB}</div>
        </div>
        <div style={{height: 5, width: 300, margin: '0 auto', borderRadius: 3, background: BAR}} />
      </div>
    </div>
  );
};

const ShotView: React.FC<{shot: Shot; frames: number} & Edge> = ({shot, frames, fadeIn, fadeOut}) => {
  switch (shot.kind) {
    case 'title':
      // الغلاف: يبدأ مكتمل من أول فريم عشان يطلع صورة الغلاف واضحة
      return (
        <Sequence from={-COVER_SKIP}>
          <Card frames={frames + COVER_SKIP} src="1702" from={7.0} fadeOut />
        </Sequence>
      );
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
      return <Card frames={frames} src="1709" from={10} toBlack />;
  }
};

const excerptSpan = () => {
  const ex = timeline().filter((s) => s.shot.kind === 'excerpt');
  const last = ex[ex.length - 1];
  return {a: ex[0].start, z: last.start + last.frames};
};

// الموسيقى: خفيفة على العنوان واللقطات، أخف تحت صوت المحاضرة، وشبه ما تنسمع تحت الكلام
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
      v = Math.min(v, UNDER_TALK + (MUSIC - UNDER_TALK) * k);
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
      <Audio src={staticFile('music/forum_user.m4a')} volume={musicVolume} />
      <VoiceBed />
    </AbsoluteFill>
  );
};
