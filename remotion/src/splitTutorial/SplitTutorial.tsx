// قالب ريل "شرح أداة": نفس تركيب الريل المرجعي (عرض NotebookLM)
//
//  0.0 – 4.8   شاشة مقسومة: فوق شعار الأداة على خلفية بيضاء، تحت أنت تتكلم + جملة الافتتاح كلمة كلمة
//  4.8 – 23.6  أنت بكامل الشاشة تشرح الفكرة
// 23.6 – 25.5  يرجع الشعار فوق (تمهيد للعرض)
// 25.5 – النهاية فوق تسجيل شاشة للأداة، تحت أنت تكمل الكلام
//
// مقطع الكلام واحد متصل (صوته هو صوت الريل). الملفات في public/footage/split/ (ما ترفع للمستودع).
// إذا ما حطيت ملف يطلع مكانه مربع يوضح وش المفروض ينحط.
import {z} from 'zod';
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from '../reel/font';
import {SlidesDemo} from './SlidesDemo';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
const TOP_H = Math.round(HEIGHT * 0.375); // نسبة الجزء العلوي في الريل المرجعي

const segmentSchema = z.object({
  start: z.number(), // بالثواني
  layout: z.enum(['split', 'full']),
  top: z.enum(['logo', 'screen']).optional(),
});

export const splitTutorialSchema = z.object({
  talk: z.string().nullable(), // مقطعك وأنت تتكلم (عمودي)
  screen: z.string().nullable(), // تسجيل شاشة الأداة
  screenFrom: z.number(), // من أي ثانية يبدأ تسجيل الشاشة
  logoImage: z.string().nullable(), // شعار الأداة (اختياري)
  toolName: z.string(),
  hook: z.string(), // جملة الافتتاح
  hookEnd: z.number(),
  duration: z.number(),
  segments: z.array(segmentSchema),
});
export type SplitTutorialProps = z.infer<typeof splitTutorialSchema>;

export const splitTutorialDefaults: SplitTutorialProps = {
  talk: null,
  screen: null,
  screenFrom: 0,
  logoImage: null,
  toolName: 'NotebookLM',
  hook: 'حوّل أي ملف إلى عرض تقديمي كامل بضغطة زر',
  hookEnd: 4.8,
  duration: 59.3,
  segments: [
    {start: 0, layout: 'split', top: 'logo'},
    {start: 4.8, layout: 'full'},
    {start: 23.6, layout: 'split', top: 'logo'},
    {start: 25.5, layout: 'split', top: 'screen'},
  ],
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const src = (f: string) => (f.startsWith('http') ? f : staticFile(f));

const Placeholder: React.FC<{label: string; dark?: boolean}> = ({label, dark}) => (
  <AbsoluteFill
    style={{
      background: dark ? '#2a2622' : '#e9e9ee',
      color: dark ? '#cfc6b8' : '#666',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily,
      fontSize: 52,
      fontWeight: 700,
      direction: 'rtl',
      textAlign: 'center',
      border: `6px dashed ${dark ? '#5a5248' : '#bbb'}`,
    }}
  >
    {label}
  </AbsoluteFill>
);

// مقطع الكلام: يشتغل من أول الريل لآخره، ويتغير بس مكانه (كامل/نصف سفلي)
const Talk: React.FC<{file: string | null}> = ({file}) =>
  file ? (
    <OffthreadVideo src={src(file)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  ) : (
    <Placeholder dark label="مقطعك وأنت تتكلم" />
  );

const Logo: React.FC<{name: string; image: string | null; startFrame: number}> = ({name, image, startFrame}) => {
  const frame = useCurrentFrame() - startFrame;
  const p = interpolate(frame, [0, 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: '#f1f1f4', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 34, opacity: p, transform: `scale(${0.94 + 0.06 * p})`}}>
        {image ? (
          <Img src={src(image)} style={{maxHeight: 150, maxWidth: 820, objectFit: 'contain'}} />
        ) : (
          <>
            <svg width="110" height="80" viewBox="0 0 110 80">
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M ${10 + i * 14} 76 A ${45 - i * 14} ${45 - i * 14} 0 0 1 ${100 - i * 14} 76`} stroke="#1f1f1f" strokeWidth="10" fill="none" />
              ))}
            </svg>
            <span style={{fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 104, color: '#1f1f1f', fontWeight: 500, letterSpacing: -2}}>{name}</span>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

const Screen: React.FC<{file: string | null; from: number}> = ({file, from}) =>
  file ? (
    <OffthreadVideo src={src(file)} startFrom={Math.round(from * FPS)} muted style={{width: '100%', height: '100%', objectFit: 'contain', background: '#fff'}} />
  ) : (
    <SlidesDemo /> // بدون تسجيل شاشة: عرض متحرك لخطوات عمل عرض تقديمي في NotebookLM
  );

// جملة الافتتاح: تطلع كلمة كلمة بخط أبيض عريض فوق المتكلم
const Hook: React.FC<{text: string; endFrame: number}> = ({text, endFrame}) => {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/);
  const per = Math.max(3, Math.floor((endFrame * 0.7) / words.length));
  const out = interpolate(frame, [endFrame - 6, endFrame], [1, 0], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 90px', opacity: out}}>
      <div
        style={{
          direction: 'rtl',
          textAlign: 'center',
          fontFamily,
          fontWeight: 900,
          fontSize: 84,
          lineHeight: 1.3,
          color: '#fff',
          textShadow: '0 4px 18px rgba(0,0,0,0.75)',
        }}
      >
        {words.map((w, i) => {
          const p = interpolate(frame - i * per, [0, 6], [0, 1], {...clamp, easing: Easing.out(Easing.back(2))});
          return (
            <span key={i} style={{display: 'inline-block', margin: '0 12px', opacity: p, transform: `translateY(${(1 - p) * 30}px) scale(${0.8 + 0.2 * p})`}}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const splitTutorialFrames = (p: SplitTutorialProps) => Math.round(p.duration * FPS);

export const SplitTutorial: React.FC<SplitTutorialProps> = (props) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const segs = props.segments.map((s, i) => ({
    ...s,
    from: Math.round(s.start * FPS),
    to: i + 1 < props.segments.length ? Math.round(props.segments[i + 1].start * FPS) : durationInFrames,
  }));
  const cur = segs.find((s) => frame >= s.from && frame < s.to) ?? segs[segs.length - 1];
  const split = cur.layout === 'split';
  const hookEnd = Math.round(props.hookEnd * FPS);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* مقطع الكلام: مكانه ثابت في شجرة React عشان ما يعيد التشغيل مع تغير التخطيط */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, top: split ? TOP_H : 0, overflow: 'hidden'}}>
        <Talk file={props.talk} />
        {frame < hookEnd && <Hook text={props.hook} endFrame={hookEnd} />}
      </div>

      {split && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: TOP_H, overflow: 'hidden'}}>
          {cur.top === 'screen' ? (
            <Sequence from={cur.from} layout="none">
              <Screen file={props.screen} from={props.screenFrom} />
            </Sequence>
          ) : (
            <Logo name={props.toolName} image={props.logoImage} startFrame={cur.from} />
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};
