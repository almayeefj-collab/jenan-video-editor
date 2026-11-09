// علنية جلسات المحاكم — دولة الكويت
// قصر العدل ← قاعة الجلسة العلنية ← المحامي ← المتهم ← القاضي ينطق بالبراءة ← فرحة الأهالي ← الخاتمة
// اللقطات في public/footage/court/ (ما ترفع للمستودع)، التعليق الصوتي في public/court/vo/
import {AbsoluteFill, Audio, Easing, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {fontFamily} from '../reel/font';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const DIR = 'footage/court/';
const VO = 'court/vo/';
const FADE = 0.5; // ثواني التداخل بين اللقطات

const GOLD = '#D9B77A';
const IVORY = '#F7F1E6';
const INK = '#0B0C10';
const GREEN = '#1F7A4A';

const s = (sec: number) => Math.round(sec * FPS);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);
const shadow = '0 4px 26px rgba(0,0,0,0.75)';

// اللقطات: بداية ومدة بالثواني، وطول المقطع الأصلي عشان نبطّئه إذا احتجنا
type Shot = {src: string; start: number; dur: number; clipLen: number; zoom?: [number, number]};
const SHOTS: Shot[] = [
  {src: 'c0.mp4', start: 0, dur: 6.4, clipLen: 5.04, zoom: [1.0, 1.05]}, // قصر العدل
  {src: 'c1.mp4', start: 6.4, dur: 5.0, clipLen: 5.04}, // القاعة والجمهور
  {src: 'c2.mp4', start: 11.4, dur: 4.6, clipLen: 5.04}, // المحامي يترافع
  {src: 'c3.mp4', start: 16.0, dur: 7.6, clipLen: 5.04}, // المتهم حاضر
  {src: 'c4L.mp4', start: 23.6, dur: 11.4, clipLen: 10.04, zoom: [1.0, 1.08]}, // القاضي ينطق بالحكم
  {src: 'c5.mp4', start: 35.0, dur: 5.6, clipLen: 5.04}, // فرحة الأهالي
  {src: 'c6.mp4', start: 40.6, dur: 7.6, clipLen: 5.04}, // العناق
  {src: 'c7.mp4', start: 48.2, dur: 14.0, clipLen: 5.04, zoom: [1.0, 1.1]}, // الميزان + الخاتمة
];

// التعليق الصوتي مع نص الترجمة
type Line = {file: string; at: number; len: number; text: string; judge?: boolean};
const LINES: Line[] = [
  {file: 'n1.mp3', at: 0.5, len: 5.9, text: 'في قصر العدل بدولة الكويت… تُفتح أبواب المحاكم للجميع'},
  {file: 'n2.mp3', at: 6.8, len: 7.4, text: 'الجلسة علنية… القاضي على منصّته، والمحامون يترافعون أمام الحاضرين'},
  {file: 'n3.mp3', at: 16.3, len: 7.3, text: 'والمتهم حاضر… يسمع ما يُقال عنه، ويُدافَع عنه على مرأى من الناس'},
  {file: 'judgeA.mp3', at: 24.2, len: 10.5, text: '', judge: true},
  {file: 'n5.mp3', at: 35.3, len: 5.15, text: 'هكذا تُحقّق علنية الجلسات العدالة على أكمل وجه…'},
  {file: 'n6.mp3', at: 40.9, len: 8.05, text: 'وتُشيع الطمأنينة في نفوس الأفراد… بما يجعلهم يلجؤون إلى القضاء وهم واثقون'},
  {file: 'n7.mp3', at: 49.0, len: 6.55, text: 'علنية الجلسات… عدالةٌ تُرى، وطمأنينةٌ تُعاش'},
];
const JUDGE = LINES.find((l) => l.judge)!;
const END_CARD = 55.2;

export const totalFrames = () => {
  const last = SHOTS[SHOTS.length - 1];
  return s(last.start + last.dur);
};

const useReveal = (delay: number, dur = 22) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {...clamp, easing: ease});
  return {opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 24}px)`};
};

const Rule: React.FC<{width: number; delay: number}> = ({width, delay}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 26], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '26px auto'}}>
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to left, ${GOLD}, transparent)`}} />
      <div style={{width: 12, height: 12, transform: `rotate(45deg) scale(${p})`, background: GOLD}} />
      <div style={{height: 2, width: (width / 2) * p, background: `linear-gradient(to right, ${GOLD}, transparent)`}} />
    </div>
  );
};

const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const frames = s(shot.dur + FADE);
  const rate = Math.min(1, shot.clipLen / (shot.dur + FADE + 0.05));
  const [z0, z1] = shot.zoom ?? [1.0, 1.06];
  const scale = interpolate(frame, [0, frames], [z0, z1]);
  const opacity = shot.start === 0 ? interpolate(frame, [0, 18], [0, 1], clamp) : interpolate(frame, [0, s(FADE)], [0, 1], clamp);
  return (
    <AbsoluteFill style={{opacity}}>
      <OffthreadVideo
        src={staticFile(DIR + shot.src)}
        playbackRate={rate}
        muted
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, filter: 'contrast(1.05) saturate(1.04)'}}
      />
    </AbsoluteFill>
  );
};

const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(11,12,16,0.45) 0%, transparent 20%, transparent 62%, rgba(11,12,16,0.78) 100%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.42) 100%)'}} />
  </>
);

// شارة المكان أعلى اليمين
const PlaceTag: React.FC<{title: string; sub: string; frames: number}> = ({title, sub, frames}) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, 24], [0, 1], {...clamp, easing: ease});
  const out = interpolate(frame, [frames - 16, frames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, padding: '70px 90px', opacity: out}}>
      <div style={{display: 'flex', alignItems: 'stretch', gap: 22, opacity: inP, transform: `translateX(${(1 - inP) * 40}px)`}}>
        <div style={{width: 6, background: GOLD, borderRadius: 3, transform: `scaleY(${inP})`}} />
        <div>
          <div style={{fontSize: 58, fontWeight: 800, color: IVORY, textShadow: shadow, lineHeight: 1.25}}>{title}</div>
          <div style={{fontSize: 34, fontWeight: 600, color: GOLD, textShadow: shadow}}>{sub}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// علامة "جلسة علنية" ثابتة أثناء الجلسة
const PublicBadge: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 20, frames - 20, frames], [0, 1, 1, 0], clamp);
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin(frame / 18));
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, alignItems: 'flex-end', padding: '64px 70px', opacity: o}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(11,12,16,0.55)', border: `1.5px solid ${GOLD}`, borderRadius: 40, padding: '8px 26px', backdropFilter: 'blur(6px)'}}>
        <div style={{width: 14, height: 14, borderRadius: 7, background: GREEN, boxShadow: `0 0 12px ${GREEN}`, opacity: pulse}} />
        <div style={{fontSize: 30, fontWeight: 700, color: IVORY}}>جلسة علنية · أبواب القاعة مفتوحة للجمهور</div>
      </div>
    </AbsoluteFill>
  );
};

// ترجمة التعليق أسفل الشاشة
const Subtitle: React.FC<{text: string; frames: number}> = ({text, frames}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 10, frames - 10, frames], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, justifyContent: 'flex-end', alignItems: 'center', padding: '0 160px 78px', opacity: o}}>
      <div style={{fontSize: 46, fontWeight: 700, color: IVORY, textAlign: 'center', lineHeight: 1.5, textWrap: 'balance', maxWidth: 1400, textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.7)', transform: `translateY(${(1 - o) * 10}px)`}}>
        {text}
      </div>
    </AbsoluteFill>
  );
};

// منطوق الحكم — يظهر مع صوت القاضي ويتبع وقفاته
const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const frames = s(JUDGE.len + 0.4);
  const o = interpolate(frame, [0, 14, frames - 14, frames], [0, 1, 1, 0], clamp);
  const part = (t: number) => interpolate(frame, [s(t), s(t) + 14], [0, 1], {...clamp, easing: ease});
  // أوقات العبارات من وقفات ملف judgeA.mp3
  const p1 = part(0);
  const p2 = part(4.15);
  const p3 = part(6.45);
  const glow = interpolate(frame, [s(6.6), s(7.4)], [0, 1], clamp);
  return (
    <AbsoluteFill style={{direction: 'rtl', fontFamily, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 64, opacity: o}}>
      <div style={{background: 'linear-gradient(180deg, rgba(11,12,16,0.72), rgba(11,12,16,0.86))', border: `1.5px solid rgba(217,183,122,0.7)`, borderRadius: 18, padding: '22px 64px 26px', textAlign: 'center', minWidth: 1180, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}>
        <div style={{fontSize: 28, fontWeight: 700, color: GOLD, letterSpacing: 1, marginBottom: 6}}>منطوق الحكم</div>
        <div style={{fontSize: 36, fontWeight: 600, color: 'rgba(247,241,230,0.85)', opacity: p1}}>باسم صاحب السمو أمير دولة الكويت</div>
        <div style={{fontSize: 50, fontWeight: 800, color: IVORY, lineHeight: 1.45, opacity: p2}}>حكمت المحكمة حضورياً</div>
        <div style={{fontSize: 58, fontWeight: 900, color: IVORY, lineHeight: 1.4, opacity: p3, transform: `scale(${0.96 + 0.04 * p3})`}}>
          ببراءة المتهم{' '}
          <span style={{color: GOLD, textShadow: `0 0 ${28 * glow}px rgba(217,183,122,${0.7 * glow})`}}>سالم محمد</span>
          {' '}ممّا نُسب إليه
        </div>
      </div>
    </AbsoluteFill>
  );
};

// الخاتمة
const EndCard: React.FC<{frames: number}> = ({frames}) => {
  const frame = useCurrentFrame();
  const dim = interpolate(frame, [0, 30], [0, 0.62], clamp);
  const black = interpolate(frame, [frames - 24, frames], [0, 1], clamp);
  const pillar = (delay: number) => useReveal(delay);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: INK, opacity: dim}} />
      <AbsoluteFill style={{direction: 'rtl', fontFamily, justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{...useReveal(8), fontSize: 40, fontWeight: 600, color: GOLD, textShadow: shadow}}>محاكم دولة الكويت</div>
        <div style={{...useReveal(14), fontSize: 124, fontWeight: 900, color: IVORY, lineHeight: 1.25, textShadow: shadow}}>علنية الجلسات</div>
        <Rule width={620} delay={30} />
        <div style={{display: 'flex', gap: 60, justifyContent: 'center'}}>
          {[
            {t: 'تحقيق العدالة', d: 'على أكمل وجه', delay: 42},
            {t: 'إشاعة الطمأنينة', d: 'في نفوس الأفراد', delay: 54},
            {t: 'الثقة بالقضاء', d: 'واللجوء إليه', delay: 66},
          ].map((x) => (
            <div key={x.t} style={{...pillar(x.delay), border: `1.5px solid rgba(217,183,122,0.6)`, borderRadius: 16, padding: '16px 40px', background: 'rgba(11,12,16,0.45)'}}>
              <div style={{fontSize: 46, fontWeight: 800, color: IVORY}}>{x.t}</div>
              <div style={{fontSize: 30, fontWeight: 600, color: GOLD}}>{x.d}</div>
            </div>
          ))}
        </div>
        <div style={{...useReveal(96), fontSize: 44, fontWeight: 700, color: GOLD, marginTop: 44, textShadow: shadow}}>عدالةٌ تُرى… وطمأنينةٌ تُعاش</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

export const PublicHearing: React.FC = () => {
  const total = totalFrames();
  const judgeFrom = s(JUDGE.at);
  const judgeTo = s(JUDGE.at + JUDGE.len);
  const musicVol = (f: number) =>
    interpolate(f, [0, 30, judgeFrom - 20, judgeFrom, judgeTo, judgeTo + 30, total - 40, total], [0, 0.2, 0.2, 0.07, 0.07, 0.24, 0.24, 0], {...clamp, easing: Easing.inOut(Easing.sin)});
  const sessionStart = s(6.4);
  const sessionEnd = s(JUDGE.at - 0.3);
  return (
    <AbsoluteFill style={{background: INK}}>
      {SHOTS.map((shot) => (
        <Sequence key={shot.src} from={s(shot.start)} durationInFrames={s(shot.dur + FADE)}>
          <ShotView shot={shot} />
        </Sequence>
      ))}
      <Grade />

      <Sequence from={s(0.8)} durationInFrames={s(5.3)}>
        <PlaceTag title="قصر العدل" sub="دولة الكويت" frames={s(5.3)} />
      </Sequence>
      <Sequence from={s(7.0)} durationInFrames={s(4.2)}>
        <PlaceTag title="محكمة الجنايات" sub="الدائرة الجزائية · جلسة علنية" frames={s(4.2)} />
      </Sequence>
      <Sequence from={sessionStart} durationInFrames={sessionEnd - sessionStart}>
        <PublicBadge frames={sessionEnd - sessionStart} />
      </Sequence>

      {LINES.map((l) =>
        l.text ? (
          <Sequence key={l.file + 'sub'} from={s(l.at)} durationInFrames={s(Math.min(l.len, l.at < END_CARD && l.at + l.len > END_CARD ? END_CARD - l.at : l.len))}>
            <Subtitle text={l.text} frames={s(l.len)} />
          </Sequence>
        ) : null,
      )}
      <Sequence from={judgeFrom} durationInFrames={s(JUDGE.len + 0.4)}>
        <Verdict />
      </Sequence>
      <Sequence from={s(END_CARD)} durationInFrames={total - s(END_CARD)}>
        <EndCard frames={total - s(END_CARD)} />
      </Sequence>

      {LINES.map((l) => (
        <Sequence key={l.file} from={s(l.at)} durationInFrames={s(l.len + 0.3)}>
          <Audio src={staticFile(VO + l.file)} volume={l.judge ? 1.0 : 0.95} />
        </Sequence>
      ))}
      <Sequence from={judgeFrom + s(6.45)} durationInFrames={s(4)}>
        <Audio src={staticFile('sfx/shimmer.wav')} volume={0.35} />
      </Sequence>
      <Sequence from={s(END_CARD)} durationInFrames={s(4)}>
        <Audio src={staticFile('sfx/cinematic-boom.wav')} volume={0.3} />
      </Sequence>
      <Audio src={staticFile('c46/formal.mp3')} volume={musicVol} />
    </AbsoluteFill>
  );
};
