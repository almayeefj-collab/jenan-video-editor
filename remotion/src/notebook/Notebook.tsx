// فيديو تعريفي بدفتر المتابعة — المعلمة جنان المعييف، الصف ١٢ علمي ٨، مادة الدستور وحقوق الإنسان
// المادة الأساسية: تسجيل شاشة للدفتر (مصمم بـ Claude Code) مقصوص ومكبّر داخل إطار متصفح
// اللقطة في public/footage/notebook/app.mp4 (ما ترفع للمستودع):
//   ffmpeg -i demo.mp4 -vf "crop=854:436:0:44,scale=1920:-2:flags=lanczos,unsharp=5:5:0.6" -r 30 -an app.mp4
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
const TRANSITION = 16;
const SRC = 'footage/notebook/app.mp4';

// ألوان الدفتر نفسه
const PURPLE = '#5B3FE0';
const LAVENDER = '#F1EEFC';
const INK = '#1C1838';
const MUTED = '#6E6A8A';
const LOGO = 'conic-gradient(from 200deg, #F7A21B, #F2426E, #7B5CFF, #2F8CFF, #22C08A, #F7A21B)';

// منطقة من اللقطة (بكسلات app.mp4 = 1920×980) تتحرك من A إلى B
type Box = [x: number, y: number, w: number];
type Clip = {from: number; to: number; rate: number; a: Box; b?: Box};
type Chapter = {
  kind: 'chapter';
  num: string;
  title: string;
  desc: string;
  points: string[];
  color: string;
  clips: Clip[];
};
type Scene = {kind: 'intro'; sec: number} | Chapter | {kind: 'outro'; sec: number};

const APP: Box = [320, 60, 1300]; // عمود الدفتر بدون الهوامش الفاضية
const APP_TOP: Box = [330, 50, 1260];

const scenes: Scene[] = [
  {kind: 'intro', sec: 6.5},
  {
    kind: 'chapter', num: '١', title: 'الطالبات', color: PURPLE,
    desc: 'بطاقة لكل طالبة تختصر مستواها',
    points: ['نقاط ومستوى لكل طالبة', 'مواطنة · مستشارة · وزيرة · دستور', 'بحث سريع بالاسم'],
    clips: [{from: 0.3, to: 8, rate: 1, a: APP_TOP, b: [360, 120, 1180]}],
  },
  {
    kind: 'chapter', num: '٢', title: 'الحضور والمتابعة', color: '#14A37F',
    desc: 'تسجيل الحصة بضغطة واحدة',
    points: ['حاضرة · غائبة · متأخرة', 'المشاركة والواجبات والاختبارات', 'كشف أسبوعي لكل الحصص'],
    clips: [
      {from: 8.5, to: 17.5, rate: 1.3, a: APP_TOP, b: APP},
      {from: 43.5, to: 49.5, rate: 1.2, a: APP, b: [340, 140, 1240]},
    ],
  },
  {
    kind: 'chapter', num: '٣', title: 'النشاط الختامي', color: '#F2426E',
    desc: 'ألعاب تفاعلية تختم الحصة',
    points: ['تحدي الفرق: الشمس والبحر', 'اختيار عشوائي للطالبة', 'قرعة التحدي و«سين جيم»'],
    clips: [{from: 19.5, to: 40, rate: 1.6, a: APP_TOP, b: APP}],
  },
  {
    kind: 'chapter', num: '٤', title: 'ملف الطالبة', color: '#2F8CFF',
    desc: 'صفحة متابعة خاصة لكل طالبة',
    points: ['توزيع الدرجات والمجموع', 'سجل ملاحظات المعلمة', 'رابط شريحة NFC للطالبة'],
    clips: [{from: 113.5, to: 126, rate: 1.3, a: APP_TOP, b: APP}],
  },
  {
    kind: 'chapter', num: '٥', title: 'الإعدادات', color: '#F7A21B',
    desc: 'كل شيء يُعدَّل من مكان واحد',
    points: ['جدول الحصص وأسماء الطالبات', 'بنك أسئلة الأنشطة لكل درس', 'روابط NFC جاهزة للنسخ'],
    clips: [{from: 56, to: 70, rate: 1.7, a: APP_TOP, b: APP}],
  },
  {
    kind: 'chapter', num: '٦', title: 'التقارير والتصدير', color: '#7B5CFF',
    desc: 'تقارير جاهزة للطباعة والمشاركة',
    points: ['تقرير PDF لكل طالبة', 'كشف الحضور والنقاط CSV', 'يفتح مباشرة في برامج الجداول'],
    clips: [
      {from: 69.5, to: 71.7, rate: 1, a: [320, 30, 1300], b: [330, 120, 1200]},
      {from: 75, to: 86, rate: 1.6, a: [560, 0, 1240], b: [600, 40, 1160]},
      {from: 100.2, to: 106, rate: 1, a: [160, 0, 1500], b: [200, 20, 1320]},
    ],
  },
  {kind: 'outro', sec: 7.5},
];

const clipFrames = (c: Clip) => Math.round(((c.to - c.from) * FPS) / c.rate);
const sceneFrames = (s: Scene) =>
  s.kind === 'chapter' ? s.clips.reduce((n, c) => n + clipFrames(c), 0) + 20 : Math.round(s.sec * FPS);

export const totalFrames = () => scenes.reduce((n, s) => n + sceneFrames(s), 0) - TRANSITION * (scenes.length - 1);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);

const useReveal = (delay: number, dur = 20, dist = 30) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * dist}px)`};
};

// خلفية الدفتر: بنفسجي فاتح بنقاط + بقع ألوان الشعار تطفو
const Backdrop: React.FC<{tint?: string}> = ({tint = PURPLE}) => {
  const frame = useCurrentFrame();
  const blobs = ['#F7A21B', '#F2426E', tint, '#2F8CFF', '#22C08A'];
  return (
    <AbsoluteFill style={{background: LAVENDER, overflow: 'hidden'}}>
      {blobs.map((c, i) => {
        const x = random(`bx${i}`) * WIDTH + Math.sin(frame / 70 + i) * 60;
        const y = random(`by${i}`) * HEIGHT + Math.cos(frame / 80 + i * 2) * 50;
        return (
          <div key={i} style={{
            position: 'absolute', left: x - 300, top: y - 300, width: 600, height: 600, borderRadius: '50%',
            background: c, opacity: 0.16, filter: 'blur(110px)',
          }} />
        );
      })}
      <AbsoluteFill style={{
        backgroundImage: 'radial-gradient(rgba(91,63,224,0.18) 1.6px, transparent 1.6px)',
        backgroundSize: '28px 28px', backgroundPosition: `${(frame * 0.3) % 28}px 0`,
      }} />
    </AbsoluteFill>
  );
};

const LogoTile: React.FC<{size: number}> = ({size}) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.28, background: LOGO,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 ${size * 0.12}px ${size * 0.4}px rgba(91,63,224,0.35)`,
  }}>
    <span style={{fontFamily, fontWeight: 900, color: '#fff', fontSize: size * 0.56, lineHeight: 1, marginTop: -size * 0.06}}>ج</span>
  </div>
);

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 4, fps, config: {damping: 12, stiffness: 120}});
  const spin = interpolate(pop, [0, 1], [-25, 0]);
  const line = interpolate(frame, [40, 70], [0, 1], {...clamp, easing: ease});
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, alignItems: 'center', justifyContent: 'center'}}>
      <Backdrop />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
        <div style={{transform: `scale(${pop}) rotate(${spin}deg)`, marginBottom: 18}}><LogoTile size={150} /></div>
        <div style={{...useReveal(14), fontSize: 46, fontWeight: 700, color: PURPLE}}>المعلمة جنان المعييف</div>
        <div style={{...useReveal(24, 24, 40), fontSize: 150, fontWeight: 900, color: INK, lineHeight: 1.1}}>دفتر المتابعة</div>
        <div style={{height: 6, width: 520 * line, borderRadius: 3, background: LOGO}} />
        <div style={{...useReveal(48), display: 'flex', gap: 22, alignItems: 'center', marginTop: 10}}>
          <span style={{background: PURPLE, color: '#fff', borderRadius: 999, padding: '8px 34px', fontSize: 50, fontWeight: 800}}>الصف ١٢ علمي ٨</span>
        </div>
        <div style={{...useReveal(62), fontSize: 36, fontWeight: 600, color: MUTED}}>
          مادة الدستور وحقوق الإنسان · ثانوية فاطمة الهاشمية للبنات
        </div>
      </div>
    </AbsoluteFill>
  );
};

// إطار متصفح فيه اللقطة؛ التكبير والتحريك على منطقة Box
const Screen: React.FC<{clips: Clip[]; w: number; h: number}> = ({clips, w, h}) => {
  let at = 0;
  return (
    <div style={{width: w, height: h + 48, borderRadius: 26, overflow: 'hidden', background: '#fff',
      boxShadow: '0 40px 90px rgba(40,24,120,0.28), 0 0 0 1px rgba(91,63,224,0.12)'}}>
      <div style={{height: 48, background: '#F7F6FD', display: 'flex', alignItems: 'center', gap: 10, padding: '0 22px', direction: 'ltr',
        borderBottom: '1px solid #E7E3FA'}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
        <div style={{marginLeft: 24, flex: 1, height: 28, borderRadius: 14, background: '#fff', border: '1px solid #E7E3FA',
          fontFamily, fontSize: 17, color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl'}}>
          دفتر متابعة ١٢ ع ٨ · المعلمة جنان المعييف
        </div>
      </div>
      <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: LAVENDER}}>
        {clips.map((c, i) => {
          const start = at;
          at += clipFrames(c);
          return (
            <Sequence key={i} from={start} durationInFrames={clipFrames(c)} layout="none">
              <ClipView clip={c} w={w} h={h} />
            </Sequence>
          );
        })}
      </div>
    </div>
  );
};

const ClipView: React.FC<{clip: Clip; w: number; h: number}> = ({clip, w, h}) => {
  const frame = useCurrentFrame();
  const n = clipFrames(clip);
  const p = interpolate(frame, [0, n], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const b = clip.b ?? clip.a;
  const x = interpolate(p, [0, 1], [clip.a[0], b[0]]);
  const y = interpolate(p, [0, 1], [clip.a[1], b[1]]);
  const bw = interpolate(p, [0, 1], [clip.a[2], b[2]]);
  const s = w / bw;
  const fadeIn = interpolate(frame, [0, 8], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity: fadeIn}}>
      <OffthreadVideo
        src={staticFile(SRC)}
        trimBefore={Math.round(clip.from * FPS)}
        playbackRate={clip.rate}
        muted
        style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 980, transformOrigin: '0 0',
          transform: `scale(${s}) translate(${-x}px, ${-y}px)`}}
      />
      {/* ظل خفيف أسفل الإطار لو المنطقة طلعت برا اللقطة */}
      <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 40px rgba(28,24,56,0.08)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.max(0, h - (980 - y) * s), background: LAVENDER}} />
    </AbsoluteFill>
  );
};

const ChapterScene: React.FC<{c: Chapter}> = ({c}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = spring({frame: frame - 2, fps, config: {damping: 16, stiffness: 90}});
  const W = 1180;
  const H = Math.round(W / 1.6);
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily}}>
      <Backdrop tint={c.color} />
      {/* اللوحة النصية يمين */}
      <div style={{position: 'absolute', right: 90, top: 0, bottom: 0, width: 520, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{...useReveal(4), display: 'flex', alignItems: 'center', gap: 18}}>
          <LogoTile size={64} />
          <span style={{fontSize: 28, fontWeight: 700, color: MUTED}}>دفتر متابعة ١٢ علمي ٨</span>
        </div>
        <div style={{...useReveal(10), marginTop: 46, display: 'flex', alignItems: 'baseline', gap: 20}}>
          <span style={{fontSize: 120, fontWeight: 900, color: c.color, lineHeight: 1}}>{c.num}</span>
          <span style={{fontSize: 82, fontWeight: 900, color: INK, lineHeight: 1.15}}>{c.title}</span>
        </div>
        <div style={{height: 6, borderRadius: 3, background: c.color, marginTop: 18,
          width: interpolate(frame, [18, 42], [0, 160], {...clamp, easing: ease})}} />
        <div style={{...useReveal(22), fontSize: 38, fontWeight: 600, color: INK, marginTop: 26, lineHeight: 1.5}}>{c.desc}</div>
        <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 18}}>
          {c.points.map((pt, i) => (
            <Point key={pt} text={pt} color={c.color} delay={40 + i * 22} />
          ))}
        </div>
      </div>
      {/* الشاشة يسار */}
      <div style={{position: 'absolute', left: 90, top: (HEIGHT - H - 48) / 2,
        opacity: card, transform: `translateX(${(1 - card) * -120}px) perspective(1800px) rotateY(${(1 - card) * 10}deg)`}}>
        <Sequence from={10} layout="none"><Screen clips={c.clips} w={W} h={H} /></Sequence>
      </div>
    </AbsoluteFill>
  );
};

const Point: React.FC<{text: string; color: string; delay: number}> = ({text, color, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 14}});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, opacity: s, transform: `translateX(${(1 - s) * 40}px)`}}>
      <div style={{width: 40, height: 40, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${s})`, flexShrink: 0}}>
        <svg width="22" height="22" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <span style={{fontSize: 33, fontWeight: 700, color: INK}}>{text}</span>
    </div>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const word = 'Claude Code';
  const typed = Math.floor(interpolate(frame, [34, 34 + word.length * 3], [0, word.length], clamp));
  const caret = Math.floor(frame / 15) % 2 === 0;
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, alignItems: 'center', justifyContent: 'center'}}>
      <Backdrop />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
        <div style={{...useReveal(4), fontSize: 54, fontWeight: 700, color: INK}}>تم إنشاء هذا الدفتر بالكامل باستخدام</div>
        <div style={{...useReveal(16, 22, 40), background: '#16131F', borderRadius: 28, padding: '34px 64px', direction: 'ltr',
          display: 'flex', alignItems: 'center', gap: 26, boxShadow: '0 40px 90px rgba(40,24,120,0.35)'}}>
          <span style={{fontFamily: 'monospace', fontSize: 70, color: '#D97757', fontWeight: 700}}>&gt;</span>
          <span style={{fontFamily: 'monospace', fontSize: 92, color: '#fff', fontWeight: 700, letterSpacing: 1}}>
            {word.slice(0, typed)}
            <span style={{opacity: caret ? 1 : 0, color: '#D97757'}}>▍</span>
          </span>
        </div>
        <div style={{...useReveal(80), display: 'flex', alignItems: 'center', gap: 22, marginTop: 30}}>
          <LogoTile size={84} />
          <div>
            <div style={{fontSize: 46, fontWeight: 900, color: PURPLE}}>المعلمة جنان المعييف</div>
            <div style={{fontSize: 32, fontWeight: 600, color: MUTED}}>دفتر متابعة الصف ١٢ علمي ٨</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const NotebookPromo: React.FC = () => {
  const total = totalFrames();
  let t = 0;
  const starts = scenes.map((s, i) => {
    const st = t;
    t += sceneFrames(s) - (i < scenes.length - 1 ? TRANSITION : 0);
    return st;
  });
  return (
    <AbsoluteFill style={{background: LAVENDER}}>
      <TransitionSeries>
        {scenes.map((s, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <TransitionSeries.Transition
                presentation={i % 2 ? slide({direction: 'from-left'}) : fade()}
                timing={linearTiming({durationInFrames: TRANSITION, easing: ease})}
              />
            )}
            <TransitionSeries.Sequence durationInFrames={sceneFrames(s)}>
              {s.kind === 'intro' ? <Intro /> : s.kind === 'outro' ? <Outro /> : <ChapterScene c={s} />}
            </TransitionSeries.Sequence>
          </Fragment>
        ))}
      </TransitionSeries>
      <Audio
        src={staticFile('music/background.wav')}
        volume={(f) => 0.55 * interpolate(f, [0, 20, total - 60, total], [0, 1, 1, 0], clamp)}
      />
      {starts.slice(1).map((st, i) => (
        <Sequence key={i} from={Math.max(0, st - 6)} durationInFrames={40}>
          <Audio src={staticFile('sfx/whoosh.wav')} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
